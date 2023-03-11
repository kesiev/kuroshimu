function Commitment(relatedby,relatedas,events) {

    this.relatedBy=relatedby;
    this.relatedAs=relatedas;
    this.events=events;

    this.plan=(time,person,fromnow)=>{
        let localClock=new Clock();
        this.events.forEach(event=>{
            if (!event.done && !event.commitment.scheduledBy) {
                localClock.setAt(time);
                let match=false;
                for (let i=0;i<10;i++) {
                    match=true;
                    if (!fromnow || (i>0)) localClock.pass();
                    let clockdata=localClock.get();
                    for (let k in event.at)
                        if (clockdata[k]!=event.at[k])
                            match=false;
                    for (let k in event.after)
                        if (clockdata[k]<=event.after[k])
                            match=false;
                    if (match)
                        break;
                }
                if (match) {
                    event.commitment.scheduledBy=event;
                    person.addToCalendar(localClock.get(),event.commitment);
                }
            }
        })
    }

}
