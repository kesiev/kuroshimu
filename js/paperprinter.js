const
    DEBUG=false;
    
let
    SIZERATIO = 1,
    ITALICSPACING = 0,
    ITALICTILT = 0.2;

function PaperPrinter(svg) {

    let
        side=0,
        root = svg.node.getElementsByTagName("svg")[0];
        bboxWidth = root.getBBox().width;

    // Firefox gets different sizes

    if (bboxWidth>10000) {
        SIZERATIO = 0.01;
        ITALICSPACING = -0.2;
    }

    let getPlaceholder=function(id,parent) {
        let
            node=svg.getById(id,parent||side);
            box={
                x:svg.getNum(node,"x"),
                y:svg.getNum(node,"y"),
                width:svg.getNum(node,"width"),
                height:svg.getNum(node,"height")
            };
        node.parentNode.removeChild(node);
        return box;
    }
    

    function cloneNodeBy(into,id,newid,dx,dy,rotate,before) {
        let org,edgex=0,edgey=0,edgewidth=0,edge,ex,ey;
        if (typeof id == "string") org=svg.getById(id);
        else org=id;
        const copy=svg.copyNode(org);
        if (newid) svg.setId(copy,newid);

        for (let i=0;i<copy.childNodes.length;i++)
            if (copy.childNodes[i].setAttribute) {
                let node=copy.childNodes[i];
                node.removeAttribute("transform");
                if (!edge && (node.tagName=="rect")) {
                    edge=node;
                    edgex=svg.getNum(node,"x");
                    edgey=svg.getNum(node,"y");
                    edgewidth=svg.getNum(node,"width");
                    edgeheight=svg.getNum(node,"height");
                }
            }

        ex=dx-edgex;
        ey=dy-edgey;
        svg.moveNodeAt(copy,0,0);

        if (rotate)
            copy.setAttribute("transform","translate("+ex+","+ey+") rotate("+rotate+","+(edgex+edgewidth/2)+","+(edgey+edgeheight/2)+")");
        else
            copy.setAttribute("transform","translate("+ex+","+ey+")");

        if (edge) copy.removeChild(edge);

        if (before)
            svg.insertBefore(before,copy);
        else if (into)
            into.appendChild(copy);
        else
            svg.insertBefore(org,copy);

        return copy;
    }

    function addRect(box,color,opacity,before) {
        if (opacity === undefined) opacity=1;
        if (color === undefined) color="#ff0000";
        let rect=svg.createNode("rect");
        rect.setAttribute("style","fill:"+color+";fill-opacity:"+opacity);
        rect.setAttribute("width",box.width);
        rect.setAttribute("height",box.height);
        rect.setAttribute("x",box.x);
        rect.setAttribute("y",box.y);
        if (before) {
            let prevnode=svg.getById(before,side);
            side.insertBefore(rect,prevnode);
        } else
            side.appendChild(rect);
    }

    function measureNode(node) {
        let box=node.getBBox();
        return {
            width:box.width*SIZERATIO,
            height:box.height*SIZERATIO
        };
    }

    this.setBackgroundColor=(id,color,parent)=>{
        let node=svg.getById(id,parent||side);
        node.setAttribute("style",node.getAttribute("style").replace(/fill:[^;]*/,"fill:"+color));
    }

    this.delete=list=>{
        list.forEach(id=>{
            let node=svg.getById(id,side);
            svg.delete(node);
        })
    }

    function TypeWriter(config) {
        let
            columns=[],
            cursor={
                first:true,
                column:0,
                x:0,
                y:0
            };

        config.columns.forEach(column=>{
            columns.push(getPlaceholder(column));
        });

        this.print=(modelid,text)=>{
            text=text+"";
            
            let
                column=columns[cursor.column],
                settings=config.models[modelid],
                orgTextNode=svg.getById(settings.modelId),
                normalTextNode,
                boldTextNode,
                word="",
                lines=[],
                lineId=-1,
                lineHeight=0,
                contentWidth=0,
                tag=false,
                bold=false,
                i=0;

            let disableKerning=(node)=>{
                node.setAttribute("style",node.getAttribute("style")+";font-kerning: none;");
            }
            
            let prepare=(node)=>{
                disableKerning(node);
                svg.setText(node,"Ag");
            }
            
            let measureSymbol=(node)=>{
                let rect=node.querySelector("rect");
                if (rect) return measureNode(rect);
            }
    
            let setBold=(node)=>{
                let span=node.querySelector("tspan");
                span.setAttribute("style",span.getAttribute("style").replace(/font-family:[^;]+/,"font-family:Times"));
                span.setAttribute("style",span.getAttribute("style").replace("font-weight:normal","font-weight:bold"));
            }
    
            let printWord=()=>{
                if (word) {
                    let node=0;
                    if (tag) {
                        let parts=word.split(" ");
                        switch (parts[0]) {
                            case "symbol":{
                                node={
                                    symbol:parts[1],
                                    size:measureSymbol(svg.getById(parts[1]))
                                }
                                break;
                            }
                            case "bold":{
                                bold=true;
                                break;
                            }
                            case "endbold":{
                                bold=false;
                                break;
                            }
                        }
                    } else {
                        let size;
                        if (bold) {
                            svg.setText(boldTextNode,word);
                            size=measureNode(boldTextNode);
                        } else {
                            svg.setText(normalTextNode,word);
                            size=measureNode(normalTextNode);
                        }
                        node={
                            text:word,
                            bold:bold,
                            size:size
                        };
                    }
                    if (node&&column) {
                        if (cursor.x) cursor.x+=settings.wordSpacing;
                        if (cursor.x+node.size.width>column.width)
                            newLine();
                        if (column) {
                            node.x=cursor.x;
                            lines[lineId].boxes.push(node);
                            cursor.x+=node.size.width;
                        }
                    }
                    word="";
                }
            }
    
            let closeLine=()=>{
                lines[lineId].width=cursor.x;
                lines[lineId].height=lineHeight;
                contentWidth=Math.max(contentWidth,cursor.x);
            }

            let checkColumn=()=>{
                if (column&&(cursor.y+lineHeight>column.height)) {
                    cursor.column++;
                    cursor.first=true;
                    cursor.y=0;
                    cursor.x=0;
                    column=columns[cursor.column];
                }
            }
    
            let newLine=()=>{
                if (lineId!=-1) closeLine();
                if (lineId>-1) {
                    cursor.y+=(lines[lineId].boxes.length?lineHeight:settings.emptyLineSize)+settings.lineSpacing;
                    checkColumn();
                }
                lineId++;
                cursor.x=0;
                lines.push({
                    column:column,
                    y:cursor.y,
                    width:0,
                    height:0,
                    boxes:[]
                });
                
            }

            let fillRect=(color,opacity,x,y,w,h)=>{
                let rect=svg.createNode("rect");
                rect.setAttribute("style","fill:"+color+";fill-opacity:"+opacity);
                rect.setAttribute("width",w);
                rect.setAttribute("height",h);
                rect.setAttribute("x",x);
                rect.setAttribute("y",y);
                svg.insertBefore(orgTextNode,rect);
            }

            
            if (column) {

                normalTextNode=cloneNodeBy(0,orgTextNode,0,0,0),
                boldTextNode=cloneNodeBy(0,orgTextNode,0,0,0);

                prepare(normalTextNode);
                prepare(boldTextNode);
        
                setBold(boldTextNode);

                let measure=measureNode(normalTextNode);
                lineHeight=measure.height;

                if (cursor.first)
                    cursor.first=false;
                else
                    cursor.y+=settings.blockSpacing;
                    
                newLine();
        
                while (i<text.length)
                    if (column) {
                        let ch=text[i];
                        switch (ch) {
                            case " ":{
                                if (tag) word+=ch;
                                else printWord();
                                break;
                            }
                            case "\n":{
                                if (!tag) {
                                    printWord();
                                    newLine();
                                }
                                break;
                            }
                            case "{":{
                                printWord();
                                tag=true;
                                break;
                            }
                            case "}":{
                                if (tag) {
                                    printWord();
                                    tag=false;
                                } else word+=ch;
                                break;
                            }
                            default:{
                                word+=ch;
                            }
                        }
                        i++;
                    } else break;
        
                if (column) {
                        
                    if (word) printWord();
                    closeLine();

                    lines.forEach(line=>{
                        if (line.column) {
                            let
                                bdx=0,
                                ox=0,
                                oy=line.column.y;
                            switch (settings.horizontalAlignment) {
                                case "justify":{
                                    ox=0;
                                    if (line.boxes.length>1)
                                        bdx=(line.column.width-line.width)/(line.boxes.length-1);
                                    if (bdx>settings.wordWrapSize)
                                        bdx=0;
                                    break;
                                }
                                case "center":{
                                    ox=(line.column.width-line.width)/2;
                                    break;
                                }
                                case "right":{
                                    ox=line.column.width-line.width;
                                    break;
                                }
                                default:{
                                    ox=0;
                                }
                            }
                            line.boxes.forEach((box,id)=>{
                                let
                                    dx=line.column.x+box.x+ox+(id*bdx),
                                    dy=oy+line.y+(line.height-box.size.height)/2;
                                if (box.text) {
                                    let node=cloneNodeBy(side,orgTextNode,0,dx,dy+box.size.height-settings.textGap);
                                    disableKerning(node);
                                    svg.setText(node,box.text);
                                    if (box.bold) setBold(node);
                                }
                                if (box.symbol)
                                    cloneNodeBy(side,box.symbol,0,dx,dy);
                            });
                            if (settings.dashed) {
                                let
                                    ly=line.column.y+line.y+(line.height-settings.dashHeight)/2,
                                    dx=ox+line.width+(settings.dashSpacing*2);
                                fillRect("#000000",1,line.column.x,ly,ox-settings.dashSpacing,settings.dashHeight);
                                fillRect("#000000",1,line.column.x+dx,ly,line.column.width-dx,settings.dashHeight);
                            }
                        }
                        
                    });

                    newLine();

                    if (settings.blockSpacing)
                        cursor.y+=settings.blockSpacing;
                    
                    checkColumn();

                }
                
                svg.delete(normalTextNode);
                svg.delete(boldTextNode);

            }

        }

    }

    function MiniChart(config) {
        let
            weekSize=7*Clock.getDayLength(),
            into=svg.getById(config.into),
            charts=[],
            chartId=0;

        config.charts.forEach(chart=>{
            charts.push(getPlaceholder(chart));
        });

        let fillRect=(x,y,w,h)=>{
            let rect=svg.createNode("rect");
            rect.setAttribute("style","fill:"+config.color+";fill-opacity:"+config.opacity);
            rect.setAttribute("width",w);
            rect.setAttribute("height",h);
            rect.setAttribute("x",x);
            rect.setAttribute("y",y);
            svg.insertBefore(into,rect);
        }

        this.plot=(labels,dataset)=>{
            let
                chart=charts[chartId],
                min,max,
                count=labels.length,
                colgap=config.colSpacing?0:0.1,
                colwidth=(chart.width-((count-1)*config.colSpacing))/count;

            dataset.data.forEach(value=>{
                if ((min==undefined)||(value.l<min))
                    min=value.l;
                if ((max==undefined)||(value.h>max))
                    max=value.h;
                    
            });
            
            max-=min;

            for (let id=0;id<count;id++) {
                let
                    y,
                    x=chart.x+((colwidth+config.colSpacing)*id),
                    value=dataset.data[id];

                if (value === undefined) {

                    y=chart.y+chart.height;

                } else {
                    let
                        yh=max?((value.h-min)/max)*chart.height:0,
                        yl=max?((value.l-min)/max)*chart.height:0,
                        colheight=yh-yl,
                        width=colwidth+colgap;
                    if (colheight<config.minHeight) colheight=config.minHeight;
                    y=chart.y+chart.height-yh;
                    if (value!==undefined)
                        fillRect(
                            x,y,
                            width,colheight
                        );

                }
                if (id%weekSize==0) {
                    let
                        bary=chart.y,
                        dy=y||(chart.y+chart.height);
                    while (bary<dy) {
                        fillRect(
                            x,bary,
                            config.dashedWidth,config.dashedDistance
                        );
                        bary+=config.dashedDistance*2;
                    }
                }

            }
            
            chartId++;
            
        }
    }

    this.print=(model)=>{


        const
            SMALL_DISTANCE=0.1,
            MID_DISTANCE=SMALL_DISTANCE*4;

        let tw=new TypeWriter({
            columns:["articleColumn1","articleColumn2"],
            models:{
                body:{
                    horizontalAlignment:"justify",
                    modelId:"articleText",
                    wordSpacing:1,
                    lineSpacing:SMALL_DISTANCE,
                    textGap:1,
                    emptyLineSize:MID_DISTANCE,
                    wordWrapSize:3,
                    blockSpacing:MID_DISTANCE
                },
                smallTitle:{
                    horizontalAlignment:"center",
                    modelId:"articleText",
                    wordSpacing:1,
                    lineSpacing:SMALL_DISTANCE,
                    textGap:1,
                    emptyLineSize:MID_DISTANCE,
                    wordWrapSize:3,
                    blockSpacing:MID_DISTANCE,
                    dashed:true,
                    dashHeight:0.5,
                    dashSpacing:1
                },
                title:{
                    horizontalAlignment:"center",
                    modelId:"articleTitle",
                    wordSpacing:1,
                    lineSpacing:1,
                    textGap:1,
                    emptyLineSize:MID_DISTANCE,
                    wordWrapSize:3,
                    blockSpacing:MID_DISTANCE
                },
                largeTitle:{
                    horizontalAlignment:"center",
                    modelId:"articleLargeTitle",
                    wordSpacing:1,
                    lineSpacing:1,
                    textGap:1,
                    emptyLineSize:MID_DISTANCE,
                    wordWrapSize:3,
                    blockSpacing:MID_DISTANCE
                },
                dashedTitle:{
                    horizontalAlignment:"center",
                    modelId:"articleTitle",
                    wordSpacing:1,
                    lineSpacing:1,
                    textGap:1,
                    emptyLineSize:MID_DISTANCE,
                    wordWrapSize:3,
                    blockSpacing:MID_DISTANCE,
                    dashed:true,
                    dashHeight:0.5,
                    dashSpacing:1
                }
            }
        });

        let mc=new MiniChart({
            charts:["miniChart1","miniChart2","miniChart3","miniChart4","miniChart5","miniChart6"],
            into:"chartArea",
            colSpacing:0,
            minHeight:0.5,
            opacity:1,
            dashedWidth:0.15,
            dashedDistance:0.5
        });

        model.article.forEach(block=>{
            tw.print(block.model,block.text);
        });

        model.charts.forEach(series=>{
            mc.plot(series.labels,series.dataset);
        });

    }

}
