function Telemetry() {

    let _data={};

    function timeToId(time) {
        return time.day+":"+time.time;
    };

    this.record=function(entity,time,key,value) {
        let
            type=entity.type,
            id=entity.id,
            at=timeToId(time);
        if (!_data[type])
            _data[type]={};
        if (!_data[type][id])
            _data[type][id]={};
        if (!_data[type][id][key])
            _data[type][id][key]={};
        if (!_data[type][id][key][at])
            _data[type][id][key][at]={o:value};
        if (
            (_data[type][id][key][at].l === undefined)||
            (_data[type][id][key][at].l>value)
        )
            _data[type][id][key][at].l=value;
        if (
            (_data[type][id][key][at].h === undefined)||
            (_data[type][id][key][at].h<value)
        )
            _data[type][id][key][at].h=value;
        _data[type][id][key][at].c=value||0;
    };

    this.createPlotForDataset=function(fo,keys,dots,candle) {
        let
            labels=[],
            datasetsById={},
            pointColorsById={},
            pointRadiusById={},
            simulation=new Clock(),
            dataid=0;

        do {
            let
                at=timeToId(simulation.get());
            labels.push(at);

            if (_data[fo.type] && _data[fo.type][fo.id]) {
                let entity=_data[fo.type][fo.id];
                keys.forEach(key=>{
                    if (!datasetsById[key]) {
                        datasetsById[key]=[];
                        pointColorsById[key]=[];
                        pointRadiusById[key]=[];
                    }
                    if (entity[key]&&(entity[key][at]!==undefined))
                        datasetsById[key][dataid]=candle ? entity[key][at] : entity[key][at].c;
                    pointColorsById[key][dataid]="transparent";
                    pointRadiusById[key][dataid]=0;
                    let cid=1;
                    for(let c in dots) {
                        cid++;
                        if (entity[c]&&entity[c][at]) {
                            pointColorsById[key][dataid]=dots[c];
                            pointRadiusById[key][dataid]=cid*2;
                            if (!datasetsById[key][dataid]) datasetsById[key][dataid]=0;
                            }
                        }
                })

            }
            dataid++;
            simulation.pass();
        } while (simulation.get().day < SIMULATION_LENGTH_DAYS);

        let chart={
            labels: labels,
            datasets: []
        };
        let id=0;

        for (let k in datasetsById) {
            chart.datasets.push({
                label: k,
                data: datasetsById[k],
                borderColor: Telemetry.CHART_COLORS[id%Telemetry.CHART_COLORS.length],
                backgroundColor: Telemetry.CHART_COLORS[id%Telemetry.CHART_COLORS.length],
                pointBackgroundColor: pointColorsById[k],
                pointRadius:pointRadiusById[k],
                hidden:true
            })
            id++;
        }

        return chart;
      
    };

    this.plot=function(root,type,key,dots) {
        let
            labels=[],
            datasetsById={},
            pointColorsById={},
            pointRadiusById={},
            simulation=new Clock(),
            dataid=0;

        do {
            let
                at=timeToId(simulation.get());
            labels.push(at);

            let entity=_data[type];
            for (let id in entity) {
                if (!datasetsById[id]) {
                    datasetsById[id]=[];
                    pointColorsById[id]=[];
                    pointRadiusById[id]=[];
                }
                if (entity[id][key]&&(entity[id][key][at]!==undefined))
                    datasetsById[id][dataid]=entity[id][key][at].c;
                pointColorsById[id][dataid]="transparent";
                pointRadiusById[id][dataid]=0;
                let cid=1;
                for(let c in dots) {
                    cid++;
                    if (entity[id][c]&&entity[id][c][at]) {
                        pointColorsById[id][dataid]=dots[c];
                        pointRadiusById[id][dataid]=cid*2;
                        if (!datasetsById[id][dataid]) datasetsById[id][dataid]=0;
                    }
                }
            }
            dataid++;
            simulation.pass();
        } while (simulation.get().day < SIMULATION_LENGTH_DAYS);

        let chart={
            labels: labels,
            datasets: []
        };
        let id=0;

        for (let k in datasetsById) {
            chart.datasets.push({
                label: k,
                data: datasetsById[k],
                borderColor: Telemetry.CHART_COLORS[id%Telemetry.CHART_COLORS.length],
                backgroundColor: Telemetry.CHART_COLORS[id%Telemetry.CHART_COLORS.length],
                pointBackgroundColor: pointColorsById[k],
                pointRadius:pointRadiusById[k],
                hidden:true
            })
            id++;
        }

        let h=document.createElement("h1");
        h.innerHTML=type+": "+key;
        root.appendChild(h);

        let canvas=document.createElement("canvas");
        root.appendChild(canvas);

        new Chart(
            canvas,
            {
                type: 'line',
                data:chart,
                options: {}
            }
        );
        
    };
    
    this.plotFor=function(root,fo,keys,dots) {
        let h=document.createElement("h1");
        h.innerHTML=fo.id;
        root.appendChild(h);

        let canvas=document.createElement("canvas");
        root.appendChild(canvas);

        new Chart(
            canvas,
            {
                type: 'line',
                data:this.createPlotForDataset(fo,keys,dots),
                options: {}
            }
        );
    }
}

Telemetry.CHART_COLORS=[
    'rgb(255, 99, 132)',
    'rgb(255, 159, 64)',
    'rgb(255, 205, 86)',
    'rgb(75, 192, 192)',
    'rgb(54, 162, 235)',
    'rgb(153, 102, 255)',
    'rgb(201, 203, 207)',
    'rgb(255, 0, 0)',
    'rgb(0, 255, 0)',
    'rgb(0, 0, 255)',
];