
function Bag(elements,random) {
    let index=[];

    this.isBag=true;

    this.isEmpty=()=>{
        return !index.length;
    }

    this.reset=()=>{
        elements.forEach((i,id)=>index.push(id));
    }

    this.pick=()=>{
        if (!index.length) this.reset();
        return elements[random.pickElement(index)];
    }

    this.setRandomizer=(randomizer)=>{
        index=[];
        random=randomizer;
        this.reset();
    }
    
    this.reset();
}

function Randomizer(seed) {

    this.float=function(){
        if (this.isLocked) debugger;
        // return Math.random();
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };

    this.lock=function() {
        this.isLocked=true;
    }

    this.unlock=function() {
        this.isLocked=false;
    }

    this.boolean=function(prob) {
        return this.float()<prob;
    };

    this.integer=function(max) {
        return Math.floor(this.float()*max);
    };

    this.element=function(list) {
        return list[this.elementId(list)];
    };

    this.firstElement=function(list,limit) {
        return list[this.integer(Math.min(list.length,limit))];
    };

    this.pickFirstElement=function(list,limit) {
        let
            pos=this.integer(Math.min(list.length,limit)),
            element=list[pos];
        list.splice(pos,1);
        return element;
    };

    this.pickElement=function(list) {
        let
            pos=this.elementId(list),
            element=list[pos];
        list.splice(pos,1);
        return element;
    };

    this.elementId=function(list) {
        return this.integer(list.length);
    };

    this.shuffle=function(list) {
        for (let i=0;i<list.length;i++) {
            let
                swapWith=this.elementId(list),
                tmp=list[i];
            list[i]=list[swapWith];
            list[swapWith]=tmp;
        }
    };

    this.shuffleByTag=function(list,tagid) {
        let
            tiers=[],
            out=[];
        list.forEach(item=>{
            let value=item.tags[tagid]||0;
            if (!tiers[value]) tiers[value]=[];
            tiers[value].push(item);
        });
        tiers.forEach(tier=>{
            this.shuffle(tier);
            tier.forEach(element=>{
                out.push(element);
            })
        });
        return out;
    }

    this.elementProbabilityMap=(map)=>{
        let
            pick=this.float(),
            found=0;
        map.forEach(option=>{
            if (!found && (!option.probability || (option.probability>pick))) found=option;
        });
        return found;
    }

    this.unlock();

}
