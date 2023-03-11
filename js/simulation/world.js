
function World(simulationRandomizer,journalistRandomizer) {

    this.blackbox=new BlackBox(this);

    let
        placeId=0,
        personId=0;

    this.places={};
    this.persons={};
    
    this.journalist=new Journalist(this);
    this.journalist.setRandomizer(simulationRandomizer,journalistRandomizer);

    this.setClock=(clock)=>{
        this.clock=clock;
        for (let k in this.places)
            this.places[k].setClock(clock);
        for (let k in this.persons)
            this.persons[k].setClock(clock);
    }

    this.setRandomizer=function() {
        for (let k in this.places)
            this.places[k].setRandomizer(simulationRandomizer,journalistRandomizer);
        for (let k in this.persons)
            this.persons[k].setRandomizer(simulationRandomizer,journalistRandomizer);
    }

    // Persons

    this.addPerson=(person)=>{
        person.mapId=personId++;
        person.world=this;
        this.persons[person.id]=person;
    }

    this.getPersonList=()=>{
        let persons=[];
        for (let k in this.persons)
            persons.push(this.persons[k]);
        return persons;
    }

    this.getSortedPersonList=()=>{
        let persons=this.getPersonList();
        persons=persons.sort((a,b)=>{
            if (a.id>b.id) return 1;
            else if (a.id<b.id) return -1;
            else return 0;
        });
        return persons;
    }

    this.getPersonsByTagLength=(tag,len)=>{
        let out=[];
        for (let k in this.persons) {
            let
                person=this.persons[k],
                taglen=person.tags[tag]?person.tags[tag].length:0;
            if (len==taglen)
                out.push(person);
        }
        return out;
    }

    this.getMarriablePersons=(person)=>{
        let out=[];
        for (let k in this.persons) {
            let marriable=this.persons[k];
            if (
                (marriable !== person) && // The marriable is not themselves...
                person.isLikingPerson(marriable) && // The person likes the partner...
                !marriable.tags.partner && // The other person have no partner...
                marriable.isLikingPerson(person) // ...and it likes the person.
            )
                out.push(marriable);
        }
        return out;
    }

    // Places

    this.addPlace=(place,prefix)=>{
        if (!prefix) prefix="";
        place.id=prefix+place.id;

        place.mapId=placeId++;
        place.mapDestinations=[];
        this.places[place.id]=place;
        place.world=this;

        // Add secluded rooms
        if (place.tags.secludedPlaces)
            place.tags.secludedPlaces.forEach(room=>{
                let newSecludedPlace=new Place(VAR.clone(room));
                this.addPlace(newSecludedPlace,place.id+"_");
                this.linkPlaces(newSecludedPlace,place);
            });

    }

    this.getPlacesByTag=(tag,value)=>{
        let out=[];
        for (let k in this.places) {
            let place=this.places[k];
            if (place.tags[tag]==value)
                out.push(place);
        }
        return out;
    }

    this.getPlacesList=()=>{
        let out=[];
        for (let k in this.places)
            out.push(this.places[k]);
        return out;
    }

    this.getSortedPlaces=(tag,value)=>{
        let out=this.getPlacesList();
        out=out.sort((a,b)=>{
            if (a.id>b.id) return 1;
            else if (a.id<b.id) return -1;
            else return 0;
        });
        return out;
    }

    this.getPlacesWithTagValue=(person,tag,value)=>{
        let out=[];
        for (let k in this.places)
            if (this.places[k].tags[tag]==value)
                out.push(this.places[k]);
        return out;
    }

    this.linkPlaces=(fromPlace,toPlace)=>{
        if (fromPlace.mapDestinations.indexOf(toPlace)==-1) fromPlace.mapDestinations.push(toPlace);
        if (toPlace.mapDestinations.indexOf(fromPlace)==-1) toPlace.mapDestinations.push(fromPlace);
    }

    // Telemetry

    this.setTelemetry=(telemetry)=>{
        this.telemetry=telemetry;
        for (let k in this.places)
            this.places[k].setTelemetry(telemetry);
        for (let k in this.persons)
            this.persons[k].setTelemetry(telemetry);
    }

    let recordPersonsTelemetry=()=>{
        // Run telemetry on all persons alive
        for (let k in this.persons)
            if (this.persons[k].isAlive())
                this.persons[k].updateAllTelemetry();
    }

    let recordPlacesTelemetry=()=>{
        for (let k in this.places) {
            let place=this.places[k];
            if (!place.tags.isSecluded)
                this.telemetry.record(place,this.clock.get(),"persons",place.persons.length);
        }
    }

    this.pass=()=>{

        // Get persons & shuffle list
        let persons=this.getPersonList();
        simulationRandomizer.shuffleByTag(persons,"attention");

        // Record telemetry at the start of the day...
        recordPersonsTelemetry();
        recordPlacesTelemetry();

        // Run persons
        persons.forEach(person=>{
            person.pass();
        });

        // Record telemetry at the end of the day...
        recordPersonsTelemetry();
        recordPlacesTelemetry();

        // Run journalist
        this.journalist.pass();

    }

}
