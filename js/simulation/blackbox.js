function BlackBox(owner) {

    this.entries=[];
    this.owner=owner;

    this.addEntry=(clock,data)=>{
        let line={at:clock?clock.get():0, fact:data };
        this.entries.push(line);
        return line;
    }

}
