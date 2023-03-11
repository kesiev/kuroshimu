function Clock() {

    let time={day:0, dayOfWeek:0, time:0 };

    this.setRandomizer=(randomizer,journalistRandomizer)=>{
        this.randomizer=randomizer;
        this.journalistRandomizer=journalistRandomizer;
    }

    this.pass=()=>{
        time.time++;
        if (time.time>Clock.getDayLastHour()) {
            time.time=0;
            time.day++;
            time.dayOfWeek=time.day%7;
        }
    }

    this.getRandomTime=()=>{
        return this.randomizer.integer(Clock.DAY.length);
    }

    this.setAt=(t)=>{
        time.time=t.time;
        time.day=t.day;
        time.dayOfWeek=t.dayOfWeek;
    }

    this.getDay=()=>{
        return time.day;
    }

    this.get=()=>{
        return VAR.clone(time);
    }

}

Clock.DAY=[
    "morning",
    "late morning",
    "midday",
    "afternoon",
    "evening",
    "night"
];

Clock.getDayLength=()=>{
    return Clock.DAY.length;
}

Clock.getDayLastHour=()=>{
    return Clock.getDayLength()-1;
}
