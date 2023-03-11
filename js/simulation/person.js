function Person(data) {

    const TELEMETRY_ATTRIBUTES=SIMULATION_DATABASE.personStats.concat(["stress","loverDuration","obscurity","money"]);

    this.blackbox=new BlackBox(this);

    this.type="person";
    this.state={};
    this.place=0;
    this.calendar={};
    this.commitments=[];
    this.testimonies=[];
    this.secretTestimonies=[];

    for (let k in data)
        this[k]=data[k];

    let getTimeId=(time)=>{
        return time.day+"_"+time.time;
    }

    this.setClock=(clock)=>{
        this.clock=clock;
    }

    this.setRandomizer=(randomizer,journalistRandomizer)=>{
        this.randomizer=randomizer;
        this.journalistRandomizer=journalistRandomizer;
    }

    this.setTelemetry=(telemetry)=>{
        this.telemetry=telemetry;
    }

    // --- Tags management

    this.setTag=(k,v)=>{
        this.tags[k]=v;
        updateTelemetryTag(k);
    }

    this.addToTag=(k,v)=>{
        if (!this.tags[k]) this.tags[k]=[];
        VAR.pushNotRepeat(this.tags[k],v);
    }

    this.removeFromTag=(k,v)=>{
        if (this.tags[k])
            VAR.removeElement(this.tags[k],v);
    }

    this.raiseTag=(k,by)=>{
        if (!this.tags[k]) this.tags[k]=by;
        else this.tags[k]+=by;
        if (by) updateTelemetryTag(k);
        return this.tags[k];
    }

    this.lowerTag=(k,by)=>{
        if (this.tags[k]) {
            this.tags[k]-=by;
            if (this.tags[k]<0) this.tags[k]=0;
            if (by) updateTelemetryTag(k);
        }
        return this.tags[k];
    }

    this.isInTag=(tag,value)=>{
        return this.tags[tag] && (this.tags[tag].indexOf(value)!=-1);
    }

    // Telemetry

    let updateTelemetryTag=(tag)=>{
        // Telemetry is started at the start of the time...
        if (this.clock)
            if (TELEMETRY_ATTRIBUTES.indexOf(tag)!==-1)
                this.telemetry.record(this,this.clock.get(),tag,this.tags[tag]||0);
    }

    this.updateAllTelemetry=()=>{
        TELEMETRY_ATTRIBUTES.forEach(tag=>updateTelemetryTag(tag));
        for (let k in this.world.persons) {
            this.telemetry.record(this,this.clock.get(),"suspectof_"+k,this.getOpinionOf("suspect",this.world.persons[k]));
            this.telemetry.record(this,this.clock.get(),"reputationof_"+k,this.getOpinionOf("reputation",this.world.persons[k]));
        }
    }

    // Commitments

    this.addCommitment=(type,c)=>{
        if (type)
            this.blackbox.addEntry(this.clock, { entity:this, action:"addCommitment", type:type });
        this.commitments.push(c);
    }

    this.planCommitments=(fromnow)=>{
        let time=this.clock.get();

        // Plan all scheduled commitments
        this.commitments.forEach(commitment=>{
            commitment.plan(time,this,fromnow);
        })
    }

    // Identity

    if (!this.tags.identifiers)
        this.tags.identifiers=[];
    if (!this.tags.uniqueIdentifiers)
        this.tags.uniqueIdentifiers=[];
    
    let
        identifiersBag,
        uniqueIdentifiersBag;

    this.setName=(name)=>{
        this.setTag("name",name);
    }

    this.setSurname=(surname)=>{
        this.setTag("surname",surname);
    }

    this.addIdentifier=(id)=>{
        this.addToTag("identifiers",id);
    }

    this.addUniqueIdentifier=(id)=>{
        this.addIdentifier(id);
        this.addToTag("uniqueIdentifiers",id);
    }

    this.initializeEntity=()=>{
        this.addUniqueIdentifier(this.tags.name+" "+this.tags.surname);
        this.addIdentifier(this.tags.name);
        if (this.tags.partner) {
            if (this.tags.partner.tags.gender != this.tags.gender) {
                // Get male surname
                let surnameInherit = this;
                if (this.tags.partner.tags.gender == "A") surnameInherit=this.tags.partner;
                this.addIdentifier(this.randomizer.element(PERSONTITLES_DATABASE.married[this.tags.gender])+" "+surnameInherit.tags.surname);
                // Male surname home
                if (this.tags.home)
                    this.tags.home.addIdentifier(LANGUAGE.addOwn(surnameInherit.tags.surname)+" home");
            } else {
                // Same gender - use person preference.
                let titles=this.tags.isGenderNeutral?"neutral":this.tags.gender;
                this.addIdentifier(this.randomizer.element(PERSONTITLES_DATABASE.married[titles])+" "+this.tags.surname);
                this.tags.home.addIdentifier(LANGUAGE.addOwn(this.tags.surname)+" home");
            }
        }
        // Is there a home
        if (this.tags.home)
            this.tags.home.addIdentifier(LANGUAGE.addOwn(this.tags.name)+" home");
        // Start planning
        this.planCommitments(true);

        // Prepare name bags for the journalist
        identifiersBag=new Bag(this.tags.identifiers,this.journalistRandomizer);
        uniqueIdentifiersBag=new Bag(this.tags.uniqueIdentifiers,this.journalistRandomizer);
    }

    this.getIdentifier=(unique)=>{
        if (unique)
            return this.tags.uniqueIdentifiers&&this.tags.uniqueIdentifiers.length?uniqueIdentifiersBag.pick():this.getIdentifier();
        else if (this.tags.identifiers&&this.tags.identifiers.length)
            return identifiersBag.pick();
        else
            this.id;
    }
    
    this.setHomePlace=(place)=>{
        this.setTag("home",place);
        this.addToTag("safePlaces",place);
    }

    this.setWorkPlace=(place)=>{
        this.setTag("workplace", place);
        this.addToTag("safePlaces",place);
    }

    // Opinion

    this.thinkIsGoodPerson=(person)=>{
        // Is less suspect...
        this.lowerSuspectOf(person);

        // Raise reputation
        this.raiseOpinionOf("reputation",0,person,1,false,THRESHOLD_GOOD_PERSON);

    }

    this.thinkIsBadPerson=(person)=>{

        // Is more suspect...
        this.raiseSuspectOf("badReputation",person,SUSPECT_LOW);

        // And changes the opinion
        this.lowerOpinionOf("reputation",person,1,THRESHOLD_BAD_PERSON);
        
    }

    this.toldPersonIsGood=(person,by)=>{
        // Is that about me?
        if (person === this) {
            // Lower stress a little
            this.lowerStress("toldIMGood");
            // The ambassador is good!
            this.thinkIsGoodPerson(by);
        }
        // Maybe because has a positive bias on me?
        this.guessBiasFor(person,true,this);
    }

    this.toldPersonIsBad=(person,by)=>{
        // Is that about me?
        if (person === this) {
            // Raise stress a little
            this.raiseStress("badReputation",STRESS_LOW);
            // If the ambassador is not a special one
            if (!this.isSpecialOnePerson(by))
                // The ambassador is bad!
                this.thinkIsBadPerson(by);
        }
        // Maybe because has a negative bias on me?
        this.guessBiasFor(person,false,this);
    }

    // Testimony

    let processTestimony=(fulltestimony,fromperson)=>{

        let
            testimony=fulltestimony.testimony;

        // If it was an obscure testimony, inherit the obscurity
        if (testimony.isObscure)
            this.raiseObscurity();

        // Suspicious subjects of the testimony raise suspect
        if (testimony.suspects) {

            let
                isStressful=false;

            testimony.suspects.forEach(suspect=>{
                this.raiseSuspectOf(testimony.action+"Testimony",suspect,SUSPECT_MID);

                // Learning something about a bonded person makes the testimony a little stressful.
                if (this.isInTag("bonds",suspect))
                    isStressful = true;
            });

            if (isStressful)
                this.raiseStress("testimonySuspectIsBonded",STRESS_LOW);

        }

        // No suspects subjects of the testimony lowers suspicious
        if (testimony.noSuspects) {

            let
                isRelaxing=false;

            testimony.noSuspects.forEach(nosuspect=>{
                this.lowerSuspectOf(nosuspect);

                // Learning something about a bonded person makes the testimony a little stressful.
                if (this.isInTag("bonds",nosuspect))
                    isRelaxing = true;
            });

            if (isRelaxing)
                this.lowerStress("testimonyNoSuspectIsBonded");

        }

        
        let
            instruction=TESTIMONIES_DATABASE[testimony.action];

        if (instruction && (instruction.onProcess!==undefined)) {
            let onprocess=instruction.onProcess;
            if (onprocess==false) {
                // --- No reaction
            } else if (onprocess.personBadVictimDanger) {
                // --- The testimony person is bad / The victim is in danger
                if (
                    this.isSpecialOnePerson(testimony.person)
                ) {
                    // So the murderer is a special one!
                    this.shock(2);
                    this.raiseSuspectOf("isMurderer",testimony.person,SUSPECT_MID);
                }
                if (
                    this.isSpecialOnePerson(testimony.victim)
                ) {
                    // So the victim is a special one!
                    this.shock(4);
                    // If told by someone raise the suspect a little...
                    if (fromperson)
                        this.raiseSuspectOf("isMurderer",fromperson,SUSPECT_LOW);
                }
                // Why it would murder the victim? A bias?
                if (testimony.victim)
                    this.guessBiasFor(testimony.person,false,testimony.victim);
            } else if (onprocess.personIsNasty) {
                // --- The testimony person is bad
                if (
                    this.isSpecialOnePerson(testimony.person)
                ) {
                    // So the special one has been involved in something bad?
                    this.shock();
                    this.raiseSuspectOf("badReputation",testimony.person,SUSPECT_VERYLOW);
                }
            } else if (onprocess.personIsDead) {
                // --- The testimony person is dead. If not, it's a relief
                if (
                    this.isSpecialOnePerson(testimony.person)
                ) {
                    // So the victim is a special one!
                    this.shock(4);

                    // If told by someone raise the suspect a little...
                    if (fromperson)
                        this.raiseSuspectOf("isMurderer",fromperson,SUSPECT_VERYLOW);
                } else {
                    // My special ones are OK! Good!
                    this.lowerStress("specialOneMissedMurder",2);
                }
            } else if (onprocess.personLoveAffair) {
                // --- Love affair. Frustrating if the testimony is the partner
                if (
                    (this.tags.partner == testimony.person)
                ) {

                    // Uh-oh. My partner has a lover?
                    this.raiseStress("partnerHasLover",STRESS_LOW);
                    this.raiseSuspectOf("partnerHasLover",testimony.person,SUSPECT_VERYLOW);

                    // If told by someone raise the suspect a little...
                    if (fromperson)
                        this.raiseSuspectOf("knewSpecialLover",fromperson,SUSPECT_LOW);

                    // It's something against me?
                    this.guessBiasFor(testimony.person,false,this);

                } else {
                    // My relation is stable!
                    this.lowerStress("heardNotMinePartnerHasLover");
                }
            } else if (onprocess.personInDanger) {
                // --- The person is in danger
                if (
                    this.isSpecialOnePerson(testimony.person)
                ) {
                    // So the testimony is a special one! It's in danger!
                    this.raiseStress("specialOneInDanger",STRESS_LOW);
                }
            } else if (onprocess.personMakesJealous) {
                // --- I'm jealous of the testimony
                if (
                    this.isSpecialOnePerson(testimony.person) &&
                    // The one befriended shouldn't be me.
                    fulltestimony.person !== this
                ) {
                    // Who's my special one new friend that's not me? Mmmhhh...
                    this.raiseStress("jealousOfSpecialOneFriend",STRESS_LOW);
                    this.raiseSuspectOf("jealousOfSpecialOneFriend",testimony.person,SUSPECT_VERYLOW);
                }
            } else if (onprocess.compareBias) {
                // Do I have an idea about his bias?
                // Is that a testimony about my bias?
                if (testimony.person == this) {

                    // Is that true?
                    if (this.tags.biases.indexOf(testimony.bias) != -1) {
                        if (fromperson) {
                            // Is it said by a person I've bias of?
                            this.onBiasFor(
                                fromperson,
                                (score)=>{
                                    // Good! It's right.
                                    this.lowerStress("personPositiveInMyBiasGotMyBias");
                                    // He's a good person
                                    this.thinkIsGoodPerson(fromperson);
                                },
                                (score)=>{
                                    // Okay... you got  me.
                                },
                                (score)=>{
                                    // How you dare!
                                    this.raiseStress("toldWrongBiasAboutMe",STRESS_HIGH);
                                    // Are you suspect?
                                    this.raiseSuspectOf("toldWrongBiasAboutMe",fromperson,SUSPECT_HIGH);
                                    // He's a bad person!
                                    this.thinkIsBadPerson(fromperson);
                                },
                            );
                        }
                    } else {

                        // Wrong guess!
                        if (fromperson) {
                            // How you dare!
                            this.raiseStress("toldWrongBiasAboutMe",STRESS_LOW);
                            // Are you suspect?
                            this.raiseSuspectOf("toldWrongBiasAboutMe",fromperson,SUSPECT_LOW);
                            // Let's fight!
                            this.debateLoudlyWithPerson(fromperson);
                        }

                    }

                } else {
                    // Compare biases opinion
                    let knownbias=this.getTopOpinionOf("bias",testimony.person);
                    if (knownbias) {
                        if (fromperson) {
                            // Debate to decide if I've to change idea?
                            if (this.shareAgreementWith(fromperson,knownbias.id == testimony.bias))
                                this.raiseOpinionOf("bias",testimony.bias,testimony.person,2);
                        }
                    } else
                        this.raiseOpinionOf("bias",testimony.bias,testimony.person,2);
                }
            } else if (onprocess.personIsGood) {
                // --- Told person is good
                if (fromperson)
                    this.toldPersonIsGood(testimony.person,fromperson);
            } else if (onprocess.personIsBad) {
                // --- Told person is bad
                if (fromperson)
                    this.toldPersonIsBad(testimony.person,fromperson);
            } else debugger;
        } else debugger;

    }

    this.learnTestimony=(fulltestimony,fromperson)=>{

        this.testimonies.push(fulltestimony);
        this.blackbox.addEntry(this.clock, { entity:this, action:"gainedTestimony", testimony:fulltestimony, fromPerson:fromperson });

        processTestimony(fulltestimony,fromperson);

    }

    this.addTestimony=(testimony)=>{
        let model=TESTIMONIES_DATABASE[testimony.action];
        
        // Validate model
        if (model.notRelatedFacts && testimony.relatedFacts)
            debugger;
        else if (!model.notRelatedFacts && ((testimony.relatedFacts===undefined) || (testimony.relatedFacts.length==0)))
            debugger;

        let fulltestimony={ at:this.clock.get(), person:this, testimony: testimony };
        this.testimonies.push(fulltestimony);
        this.blackbox.addEntry(this.clock, { entity:this, action:"addTestimony", testimony:fulltestimony });

        processTestimony(fulltestimony);
    }

    this.addShockingTestimony=(testimony)=>{

        this.addTestimony(testimony);

        // Shocking testimonies are more obscure and stressful
        this.raiseObscurity();
        this.shock();

    }

    this.forgetTestimony=(testimony,fromperson)=>{

        // Is a testimony I know?
        let pos=this.testimonies.indexOf(testimony);
        if (pos!=-1) {
            // Is it already a secret to keep?
            if (this.secretTestimonies.indexOf(testimony) == -1) {

                // If not, keep it secret
                this.secretTestimonies.push(testimony);
                this.blackbox.addEntry(this.clock, { entity:this, action:"forgotTestimony", place:this.place, testimony:testimony, person:fromperson });

                // Forgetting a testimony makes more obscure and stressed
                this.raiseObscurity();
                this.raiseStress("forgotTestimony",STRESS_LOW);

            } else debugger;

        }

    }

    // Attributes

    // --- Mood

    this.isGoodMoodWithPerson=(person)=>{
        return (
            // Good mood under stress threshold
            (this.tags.stress<THRESHOLD_STRESS_GOODMOOD) ||
            // or the person is attractive.
            this.isAttractedByPerson(person)
        );
    }

    // --- Resting

    this.isResting=()=>{
        return this.tags.resting;
    }

    // --- Dead/Alive
    
    this.isAlive=()=>{
        return this.tags.alive;
    }

    this.isCollapsed=()=>{
        return this.tags.collapsed;
    }

    this.isRemoved=()=>{
        return this.tags.removed;
    }

    // --- Physical/Psychical

    this.isShocked=()=>{
        return !!this.tags.shocked;
    }

    this.isTied=()=>{
        return this.tags.tied;
    }

    this.isStressed=()=>{
        return this.tags.stress>THRESHOLD_STRESS_STRESSED;
    }

    // --- Interaction

    this.isConscious=()=>{
        return this.isAlive() && !this.isCollapsed() && !this.isRemoved();
    }
    
    this.isAbleToMove=()=>{
        return this.isConscious() && !this.isTied();
    }

    this.isInteractive=()=>{
        return this.isAbleToMove() && !this.isResting() && !this.isShocked();
    }

    // --- Suspect

    this.isSuspicious=()=>{
        return this.isAlive() && // Is alive, in any state
            (
                this.isCollapsed() || // A Collapsed person?!
                (this.isStressed() && this.tags.attention) || // It's stressed and nervous because of the attention raised
                this.place.isTherePerson(this.tags.lover) // or it's just nervous because it's with its lover
            )
    }

    // --- Relations with persons

    this.isBondedWithPerson=(person)=>{
        return !!this.isInTag("bonds",person);
    }

    this.isSpecialOnePerson=(person)=>{
        return this.isInTag("specialOne",person);
    }

    this.isLoverPerson=(person)=>{
        return this.tags.lover === person;
    }

    // --- Good/Bad

    this.isGoodPerson=(person)=>{
        return this.getOpinionOf("reputation",person)==THRESHOLD_GOOD_PERSON;
    }

    this.isBadPerson=(person)=>{
        return this.getOpinionOf("reputation",person)==THRESHOLD_BAD_PERSON;
    }

    // --- Places

    this.isSafePlace=(place)=>{
        return this.tags.safePlaces && (this.tags.safePlaces.indexOf(place) != -1);
    }

    // 1-to-1 Relations

    this.isRecognizingPerson=(person)=>{
        return this.isConscious() && // It can see
            this.isBondedWithPerson(person) // Has a bond
    }

    this.isFriendPerson=(person)=>{
        return this.isConscious() && // It can see
            this.isInTag("friends",person); // Is a friend
    }

    // Likeness

    this.isLikingPerson=(person)=>{
        // Gender preferences
        return this.tags.attractedBy.indexOf(person.tags.gender) != -1;
    }

    this.isAttractedByPerson=(person)=>{
        let affinity=0;

        // If person is in a relation negates attraction
        if (person.tags.loverDuration) return false;
        
        // Sum better flirting stats
        this.tags.flirtStats.forEach(stat=>{
            if (person.tags[stat]>this.tags[stat])
                affinity++;
        })

        // If there are more than 1 better stats, it's attracted. They complete each other <3
        return affinity>1;
    }

    // Commitments

    // --- Menace

    this.willExecuteMenace=(from,person,reason,indays)=>{
        if (person === this) debugger;
        // console.warn(this.id+" will menace "+person.id+" in "+indays+" days");
        this.addCommitment("willExecuteMenace",new Commitment(this,from,[
            { times:1, after:{ day:this.clock.getDay()+indays }, commitment:{ action:"menacePerson", person:person, reason:reason } }
        ]));
        this.raiseAttention();
    }

    this.willContinueMenace=(from,person,reason,place,indays,times)=>{
        if (person === this) debugger;
        // console.warn(this.id+" will continue menace of "+person.id+" in "+indays+" days");
        this.addCommitment("willContinueMenace",new Commitment(this,from,[
            { times:times, after:{ day:this.clock.getDay()+indays }, commitment:{ action:"continueMenacePerson", person:person, reason:reason, place:place } }
        ]));
        this.raiseAttention();
    }

    // --- Murder

    this.willPlanMurder=(from,indays)=>{
        // console.warn(this.id+" will plan a murder in "+indays+" days");
        this.addCommitment("willPlanMurder",new Commitment(this,from,[
            { times:1, after:{ day:this.clock.getDay()+indays }, commitment:{ action:"decideVictim" } }
        ]));
    }

    this.willExecuteMurder=(from,person,reason,indays)=>{
        if (person === this) debugger;
        // console.warn(this.id+" will murder "+person.id+" in "+indays+" days");
        this.addCommitment("willExecuteMurder",new Commitment(this,from,[
            { times:1, after:{ day:this.clock.getDay()+indays }, commitment:{ action:"murderPerson", reason:reason, person:person } }
        ]));
        this.raiseAttention();
    }

    // --- Investigation

    this.willInvestigate=(from,place,indays)=>{
        // console.warn(this.id+" will investigate "+place.id+" in "+indays+" days");
        this.addCommitment("willInvestigate",new Commitment(this,from,[
            { times:1, after:{ day:this.clock.getDay()+indays, time:this.clock.getRandomTime() }, commitment:{ action:"investigate", place:place } }
        ]));
        this.raiseAttention();
    }

    // --- Paranoia

    this.willBeParanoid=(from,indays)=>{
        //  console.warn(this.id+" will be paranoid "+indays+" days");
        this.addCommitment("willBeParanoid",new Commitment(this,from,[
            { times:1, after:{ day:this.clock.getDay()+indays, time:this.clock.getRandomTime() }, commitment:{ action:"becomeParanoid" } }
        ]));
    }

    // Obscurity

    this.raiseObscurity=(by)=>{
        if (!by) by=1;
        let obscurity=this.raiseTag("obscurity",by);
        this.blackbox.addEntry(this.clock, { entity:this, action:"raiseObscurity", obscurity:obscurity, by:by });
    }

    // Attention

    this.raiseAttention=(by)=>{
        if (!by) by=1;
        let attention=this.raiseTag("attention",by);
        this.blackbox.addEntry(this.clock, { entity:this, action:"raiseAttention", attention:attention, by:by });
    }

    this.lowerAttention=(by)=>{
        if (!by) by=1;
        if (this.tags.attention) {
            let attention=this.lowerTag("attention",by);
            this.blackbox.addEntry(this.clock, { entity:this, action:"lowerAttention", attention:attention, by:by });
        }
    }

    // Murdering

    let manageMurderTestimonyTestimony=(person,testimony,inheritrelatedfacts)=>{

        let
            time=this.clock.get();

        // The murderer have seen the testimony?
        if (this.isRecognizingPerson(testimony)) {

            // TODO: It could be shocking to a certain type of killer.
            this.addTestimony({
                at:time,
                action:"seeTheTestimony",
                place:this.place,
                person:testimony,
                victim:person,
                isObscure:true,
                relatedFacts:inheritrelatedfacts
            });

        } else {

            // Who was the testimony? The murderer will become a little paranoid in days...
            this.willBeParanoid("murderInstinct",DAYS_DELAY_SHORT);

        }
    }

    let manageMurderTestimony=(person,inheritrelatedfacts)=>{

        // Look for testimonies at this place...
        let
            time=this.clock.get(),
            persons=this.place.getPersonsThatRecognizesPerson(this,person);
        
        if (persons.length) {
            
            // Someone have seen the victim!
            let
                testimony=this.randomizer.element(persons),
                data={
                    at:time,
                    action:"seeTheMurderer",
                    place:this.place,
                    person:this,
                    victim:person,
                    isObscure:true,
                    suspects:[this.place,this],
                    murdererKnown:false,
                    relatedFacts:inheritrelatedfacts
                };

            // Does the testimony know the victim too?
            if (testimony.isRecognizingPerson(person)) {
                // If yes, add to testimony.
                data.suspects.push(person);
                data.victim=person;

                // Does the testimony know the murderer?
                if (testimony.isInTag("bonds",this)) {
                    // Raise obscurity...
                    testimony.raiseObscurity();
                    // ...and add to testimony
                    data.murdererKnown=true;
                }
 
            }

            // Adds a shocking testimony
            testimony.addShockingTestimony(data);

            // Have I seen the testimony?
            manageMurderTestimonyTestimony(person,testimony,inheritrelatedfacts);
        }
    }

    this.escapedMurderByPerson=(person)=>{
 
        // Escape!
        this.escapeFrom(person,["attemptedMurder"]);

        // Release some stress!
        this.lowerStress("escapedMurderer",3);

    }

    this.murderPerson=(person,reason)=>{
        let time=this.clock.get();

        // The victim may fight!
        if (person.isInteractive()) {

            // Am I winning the fight?
            if (this.debateLoudlyWithPerson(person)) {
                // No game, I'm stronger!
            } else {
                // Uh oh, It's harder than I thought
                person.debateLoudlyWithPerson(this);
                
                // The victim is weakened...
                person.performEffort();
            }

        }

        // The victim tries to break free again...
        person.performEffort();

        // A final confrontation...
        if (this.debateQuietlyWithPerson(person)) {

            let relatedFacts=[
                this.blackbox.addEntry(this.clock, { entity:this, action:"murderPerson", person:person, reason:reason, place:this.place })
            ];

            // Uses its features to perform the action
            this.performEffort();

            // Become more obscure
            this.raiseObscurity();

            // And relax a little
            this.lowerStress("murderSuccess",3);

            // Look for testimonies at this place...
            manageMurderTestimony(person,relatedFacts);

            // Now is the victim turn...
            person.die(["murder"],this);

            this.telemetry.record(this,time,"_murderer",1);

        } else {

            let relatedFacts=[
                this.blackbox.addEntry(this.clock, { entity:this, action:"failedMurderPerson", person:person, reason:reason, place:this.place })
            ];

            // Still perform its effort...
            this.performEffort();
            
            // Become more obscure
            this.raiseObscurity();

            // That's SO stressful!
            this.raiseStress("murderVictimEscaped",STRESS_MID);

            // Look for testimonies at this place...
            manageMurderTestimony(person,relatedFacts);

            // Become even more suspicious of the victim
            this.raiseSuspectOf("murderVictimEscaped",person,SUSPECT_LOW);

            // ...but the person escaped from being murdered!
            person.escapedMurderByPerson(this);

            // What can I do with the escaped?
            if (this.isGoodMoodWithPerson(person)) {

                // Menace him a little...
                this.willExecuteMenace("murderDefense",person,["murderVictimEscaped"],DAYS_DELAY_VERYSHORT);

            } else {

                // I'll wait a little... then I'll meet you I'll try to murder you again.
                this.willExecuteMurder("murderDefense",person,["murderVictimEscaped"],DAYS_DELAY_SHORT);

            }

            this.telemetry.record(this,time,"_failedmurder",1);

        }

    }

    // Collapsing / Fainting /Dying
    
    let manageDeath=(time,by)=>{

        // Look for testimonies at this place...
        let persons=this.place.getPersonsThatRecognizesPerson(this,by);

        if (persons.length) {
            
            // Someone have seen the dead body!
            let
                testimony=this.randomizer.element(persons);

            // It's a shocking testimony
            testimony.addShockingTestimony({
                at:time,
                action:"seeDeadBody",
                place:this.place,
                person:this,
                isObscure:true,
                victimKnown:true
            });
                
        }

    }

    this.collapseDueTo=(reason)=>{

        let time=this.clock.get();

        // Faint...
        this.setTag("conscious",false);
        this.setTag("collapsed",true);
        
        this.blackbox.addEntry(this.clock, { entity:this, action:"collapseDueTo", reason:reason, place:this.place })
        this.raiseObscurity();

        // What's not killing you will make you stronger :)
        this.raiseTag("stressThresholdFaint",INCREASE_THRESHOLD_STRESS_FAINT);

        // It looks like death for others :)
        manageDeath(time);

        // Creates a "respawn" timer. Somebody will eventually find it and do something.
        this.setDisposeTimer();

        this.telemetry.record(this,time,"_faint",1);
        
    }

    this.die=(reasons,person)=>{

        let time=this.clock.get();

        // Sorry, game over.
        this.setTag("murderedBy",person);
        this.setTag("deadDueTo",reasons);
        this.setTag("sleeping",false);
        this.setTag("conscious",false);
        this.setTag("alive",false);
        this.setTag("tied",false);
        this.setTag("tiedBy",false);
        this.blackbox.addEntry(this.clock, { entity:this, action:"dead",  person:person, reason:reasons, place:this.place })
        this.raiseObscurity();

        // Common death events
        manageDeath(time,person);

        this.telemetry.record(this,time,"_deaddueto",1);
        if (person) this.telemetry.record(this.place,time,"_murder",1);
    }

    this.breakdownDueTo=(reasons)=>{
        let time=this.clock.get();

        if (!this.isCollapsed()) {

            // Decrease lives (?)
            this.lowerTag("lives",1);

            // Any live left?
            if (this.tags.lives) this.collapseDueTo(reasons);
            else this.die(reasons);

        } else debugger;

    }

    // Resting

    this.startResting=()=>{
        this.setTag("collapsed",false);
        this.setTag("conscious",true);
        this.setTag("resting",true);

        let relatedFacts=[
            this.blackbox.addEntry(this.clock, { entity:this, action:"startedResting", place:this.place })
        ];

        // Limit stress to the maximum
        if (this.tags.stress > this.tags.stressThresholdFaint)
            this.lowerOpinionOf("stress",this,this.tags.stress - this.tags.stressThresholdFaint);

        // Testimony that I was resting...
        this.addTestimony({
            at:this.clock.get(),
            action:"startResting",
            place:this.place,
            person:this,
            isObscure:true,
            noSuspects:[this], // Poor thing...
            relatedFacts:relatedFacts
        });
    }

    this.rest=()=>{

        // Is there stress to rest?
        if (this.tags.stress>THRESHOLD_STRESS_ENDREST) {

            // Rest
            this.recover(2);

            // Recover stress a little faster
            this.lowerStress("resting");

            // Perform the local resting action
            this.place.personPerformInteraction(this,"rest");

        } else {
            // Rest completed!
            this.setTag("resting",false);
        }
    }

    this.getPlacesToRest=()=>{

        // Places where people usually rest...
        let restingPlaces=this.world.getPlacesByTag("resting",true);

        // ...and home, if any
        if (this.tags.home)
            restingPlaces.push(this.tags.home);

        return restingPlaces;

    }

    this.forceRest=()=>{

        // If the person is not resting... (Notice that the person will be kept tied)
        if (!this.tags.resting) {
            // Move to somewhere to rest
            let restingPlaces=this.getPlacesToRest();
            if (restingPlaces.length) {
                // Bring it there urgently
                let restingPlace=this.randomizer.element(restingPlaces);
                this.hurryTo(restingPlace);
                // Start resting
                this.startResting();
            } else {
                // Sorry... no places to rest
                this.remove();
            }
        }
        
    }

    // Disposement

    this.setDisposeTimer=()=>{
        this.setTag("disposeTimer",Clock.getDayLength()*2);
    }

    this.dispose=()=>{

        // A disposed person is silently untied. It's untied by a person if it's found.
        this.untie();

        if (this.isAlive()) {

            // Go somewhere to rest
            this.forceRest();

        } else {
            // TODO: Inherit money from partner?
            // "A dead body has been discovered!" - Remove it
            this.remove();
        }

    }

    // Escaping

    this.escapeFrom=(person,reason,inheritrelatedfacts)=>{

        let relatedFacts=[
            this.blackbox.addEntry(this.clock, { entity:this, action:"escaped", person:person, reason:reason, place:this.place })
        ].concat(inheritrelatedfacts);

        // Add testimony
        this.addTestimony({
            at:this.clock.get(),
            action:"escaped",
            place:this.place,
            person:person,
            reason:reason,
            isObscure:true,
            victim:this,
            suspects:[person,this.place],
            relatedFacts:relatedFacts
        });

        // Untie myself, if i'm tied
        this.untiedByPerson(this);

        // The person I'm running from is a bad person!
        this.thinkIsBadPerson(person);

        // Try to guess why it hated me
        this.guessBiasFor(person,false,this);

        // Become more obscure
        this.raiseObscurity();

        // Become suspicious of person and place
        this.raiseSuspectOf("escapedFrom",person,SUSPECT_LOW);
        this.raiseSuspectOf("escapedFrom",this.place,SUSPECT_LOW);

        // ...and stressed
        this.raiseStress("escapedFrom",STRESS_LOW);

        // Run away!
        this.moveToSafePlace();

    }

    // Tie

    this.tiedByPerson=(person,inheritrelatedfacts,reason)=>{

        if (!this.isTied()) {

            let relatedFacts=[
                this.blackbox.addEntry(this.clock, { entity:this, action:"haveBeenTied", place:this.place, person:person, reason:reason })
            ].concat(inheritrelatedfacts);

            // Set person tied
            this.setTag("tied",true);
            this.setTag("tiedBy",person);

            // The experience is shocking and stressing for the tied person...
            this.shock();

            // Rise obscurity...
            this.raiseObscurity();

            // And suspect to the tied person
            this.raiseSuspectOf("tiedBy",person,SUSPECT_HIGH);

            // It's something against me?
            this.guessBiasFor(person,false,this);

            // ...and leaves a testimony to the tied person.
            this.addTestimony({
                at:this.clock.get(),
                action:"tiedMe",
                place:this.place,
                person:person,
                isObscure:true,
                suspects:[person,this.place],
                relatedFacts:relatedFacts
            });

            // Who tied me is a bad person!
            this.thinkIsBadPerson(person);

        }

    }

    this.untie=()=>{
        // Internal untie event. It's called by main events.
        this.setTag("tied",false);
        this.setTag("tiedBy",false);
    }

    this.untiedByPerson=(person)=>{
        // If I'm tied...
        if (this.isTied()) {

            let relatedFacts=[
                this.blackbox.addEntry(this.clock, { entity:this, action:"haveBeenUntied", place:this.place, person:person })
            ];

            // Untie the person
            this.untie();

            // The experience releases the shock level.
            this.unshock();

            // And a little of stess...
            this.lowerStress("haveBeenUntied");

            // ...and leaves a testimony to the tied person.
            person.addTestimony({
                at:this.clock.get(),
                action:"untiedMe",
                place:this.place,
                person:person,
                isObscure:true,
                noSuspects:[person,this.place], // Thank you!
                relatedFacts:relatedFacts
            });

            // If it's not me...
            if (person !== this) {

                // Think good about him.
                this.thinkIsGoodPerson(person);
                
                // He's good?
                this.guessBiasFor(person,true,this);

            }

        }
    }

    this.escapedFromTie=(person,inheritrelatedfacts)=>{

        // Escape!
        this.escapeFrom(person,["attemptedTie"]);

        // Release some stress!
        this.lowerStress("failedTie",3);

    }

    this.tiePerson=(person,reason)=>{

        let time=this.clock.get();

        if (!person.isTied()) {

            // A confrontation...
            if (this.debateLoudlyWithPerson(person)) {

                let relatedFacts=[
                    this.blackbox.addEntry(this.clock, { entity:this, action:"tie", place:this.place, person:person, reason:reason })
                ];
        
                // Uses its features to perform the action
                this.performEffort();

                // Rise obscurity...
                this.raiseObscurity();

                // Tie
                person.tiedByPerson(this,relatedFacts,reason);

            } else {

                let relatedFacts=[
                    this.blackbox.addEntry(this.clock, { entity:this, action:"failedTie", person:person, place:this.place, reason:reason })
                ];

                // Still perform its effort...
                this.performEffort();
                
                // Become more obscure
                this.raiseObscurity();

                // That's SO stressful!
                this.raiseStress("failedTie",STRESS_LOW);

                // Become even more suspicious of the victim
                this.raiseSuspectOf("failedTie",person,SUSPECT_LOW);

                // What can I do with the escaped?
                if (this.isGoodMoodWithPerson(person)) {

                    // Menace it a little and let it slide.
                    this.menace(person);

                } else {

                    // I'll wait a little... then I'll meet you I'll try to tie you again.
                    this.willExecuteMenace("tieDefense",person,["failedTie"],DAYS_DELAY_SHORT);

                }

                // The person escapes from being tied!
                person.escapedFromTie(this,relatedFacts);

                this.telemetry.record(this,time,"_failedtie",1);

            }

        }

    }
    
    this.untiePerson=(person)=>{
        if (person.isTied()) {

            let relatedFacts=[
                this.blackbox.addEntry(this.clock, { entity:this, action:"untie", place:this.place, person:person })
            ];

            // Add testimony
            this.addTestimony({
                at:this.clock.get(),
                action:"untied",
                place:this.place,
                person:person,
                noSuspects:[person,this.place],
                relatedFacts:relatedFacts
            });

            // Uses its features to perform the action
            this.performEffort();

            // Untie it
            person.untiedByPerson(this);
        }
    }

    // Shock

    this.shock=(stress)=>{
        if (!stress) stress=1;
        this.raiseTag("shocked",1);
        this.raiseStress("shock",stress,STRESS_VERYLOW);
        this.blackbox.addEntry(this.clock, { entity:this, action:"shocked", shock:this.tags.shocked });
    }

    this.unshock=()=>{
        this.lowerTag("shocked",1);
        this.blackbox.addEntry(this.clock, { entity:this, action:"unshocked", shock:this.tags.shocked });

        // Makes a little less stressed
        this.lowerStress("unshocked");
    }

    // Looking and investigating

    this.lookAround=(place)=>{

        // If not specified, look in person's place
        if (!place) place=this.place;
    
        // ...applies place biases on anybody...
        this.onBiasFor(
            place,
            (score)=>{
                this.lowerSuspectOf(place)
            },
            0,
            (score)=>{
                this.raiseSuspectOf("isBiased",place,SUSPECT_LOW);
                this.raiseStress("isBiased",STRESS_LOW);
            },
        );
        
        // ...it will have a look if there is someone a little suspect first
        let suspiciousPersons=place.getSuspiciousPersons(this);
        if (suspiciousPersons.length) {
            // Found it!
            let suspiciousPerson=this.randomizer.element(suspiciousPersons);
            this.addTestimony({
                at:this.clock.get(),
                action:"seeSomeoneSuspect",
                place:place,
                person:suspiciousPerson,
                isObscure:true,
                suspects:[suspiciousPerson,place]
            });
        }

        // ...it will have a look to unconscuous bodies
        let unconsciousBodies = place.getPersonsByTag("conscious",false);
        if (unconsciousBodies.length) {

            let unconsciousBody = this.randomizer.element(unconsciousBodies);

            // Prepare a testimony - looks pretty dead to me.
            let
                testimony={
                    at:this.clock.get(),
                    action:"seeDeadBody",
                    place:place,
                    person:unconsciousBody,
                    isObscure:true,
                    victimKnown:false
                };

            // Does the character know the dead body?
            if (this.isInTag("bonds",unconsciousBody)) {
                this.raiseObscurity();
                testimony.victimKnown=true;
            }

            // Add the testimony, with more effects
            this.addShockingTestimony(testimony);

            // If it's tied, untie it
            if (unconsciousBody.isTied())
                this.untiePerson(unconsciousBody);

            // Dispose the unconscious body
            unconsciousBody.dispose();
            
        }

        // If it can do something...
        if (this.isInteractive()) {
                
            // ...it will have a look to tied persons and help them!
            let tiedPersons = place.getPersonsByTag("tied",true);
            if (tiedPersons.length) {

                tiedPersons.forEach(tiedPerson=>{
                    if (
                        (tiedPerson !== this) && // If it's not yourself...
                        (tiedPerson.tags.tiedBy !== this) // ...and if it's someone I've not tied...
                    ) {

                        // Who did this?
                        let tier=tiedPerson.tags.tiedBy;

                        // Untie him!
                        this.untiePerson(tiedPerson);

                        // Who was tied?
                        if (this.isSpecialOnePerson(tiedPerson)) {
                            // So someone did something to a special one!
                            this.raiseStress("foundTiedSpecialPerson",STRESS_MID);
                            this.raiseSuspectOf("foundTiedSpecialPerson",tier,SUSPECT_MID);
                            this.lowerSuspectOf(tiedPerson,3);
                        } else {
                            // Why it was tied?
                            this.raiseStress("foundTiedPerson",STRESS_LOW);
                            this.raiseSuspectOf("foundTiedPerson",tiedPerson,SUSPECT_LOW);
                            this.raiseSuspectOf("foundTiedPerson",tier,SUSPECT_LOW);
                        }
                    }

                });
                
            }

        }
    }

    this.investigate=()=>{

        let relatedFacts=[
            this.blackbox.addEntry(this.clock, { entity:this, action:"investigate", place:this.place })
        ];

        // Add testimony
        this.addTestimony({
            at:this.clock.get(),
            action:"investigating",
            person:this,
            place:this.place,
            suspects:[this,this.place],
            relatedFacts:relatedFacts
        });

        // Uses its features to perform the action
        this.performEffort();

        // Find someone suspicious for me
        let suspiciousPersons=this.place.getSuspectedPersonsForPerson(this);
        if (suspiciousPersons.length) {
            let suspect=this.randomizer.element(suspiciousPersons);

            // It's even more suspicious...
            this.raiseSuspectOf("foundSuspiciousInvestigating",suspect,SUSPECT_LOW);

            // It feels a little stressing...
            this.raiseStress("foundSuspiciousInvestigating",STRESS_LOW);
        }

        // Apply bias on all persons...
        let biasedPersons=this.place.getInteractivePersons(this);
        biasedPersons.forEach(person=>{
            // ...applies place biases
            this.onBiasFor(
                person,
                (score)=>{
                    this.thinkIsGoodPerson(person);
                },
                0,
                (score)=>{
                    // Finding biased people during investigation may raise stress and suspect
                    this.thinkIsBadPerson(person);
                    this.raiseStress("biasedPersonFoundInvestigating",STRESS_LOW);
                    this.raiseSuspectOf("biasedPersonFoundInvestigating",person,SUSPECT_MID);
                }
            );
        })

        // Disappear in the crowd...
        this.lowerAttention();

    }

    // Listening and communicating

    let getTestimonyJuiciness=(testimony,forperson)=>{
        if (!testimony.testimony) debugger;
        let
            value=0,
            instruction=TESTIMONIES_DATABASE[testimony.testimony.action];

        if (instruction && (instruction.juiciness!==undefined)) {
            let juiciness=instruction.juiciness;
            if (juiciness.aboutOthers) {
                if ((testimony.person!==this) && (testimony.testimony.person!==this))
                    value=juiciness.aboutOthers;
            } else if (juiciness.subjectNotMe) {
                if (testimony.testimony.person!==this)
                    value=juiciness.aboutOthers;
            } else if (juiciness.forSpecialOne) {
                if (forperson && forperson.isSpecialOnePerson(testimony.testimony.person))
                    value=juiciness.forSpecialOne;
            } else if (juiciness.forNotSpecialOne) {
                if (forperson && !forperson.isSpecialOnePerson(testimony.testimony.person))
                    value=juiciness.forNotSpecialOne;
            } else value=juiciness;
        } else debugger;

        return value;

    }

    this.isKnownTestimony=(testimony)=>{
        for (let i=0;i<this.testimonies.length;i++) {
            if (this.testimonies[i].testimony === testimony.testimony)
                return true;
        }
        return false;
    }

    this.listShareableTraitsWith=(person,iseavesdrop,isinterview)=>{
        let out=[];

        // Places to eat are not interesting both for eavesdropping and interview
        if (!iseavesdrop && !isinterview) {

            // The places I like to eat
            if (mayPersonAddTag(this,"breakfastAt"))
                TRAIT.addToShareableList(out,"breakfastAt",this.tags.breakfastAt,person.tags.breakfastAt.place);

            if (mayPersonAddTag(this,"lunchAt"))
                TRAIT.addToShareableList(out,"lunchAt",this.tags.lunchAt,person.tags.lunchAt.place);

            if (mayPersonAddTag(this,"dinnerAt"))
                TRAIT.addToShareableList(out,"dinnerAt",this.tags.dinnerAt,person.tags.dinnerAt.place);

        }

        // Testiomines are always interesting...

        // Prepare a list of juicy things to share. Interviews include secrets too!
        let testimonies=this.listJuicyTestimonies(person,0,!isinterview);

        // if (testimonies.length && iseavesdrop) debugger;

        // Testimonies that are worth sharing...
        testimonies.forEach(testimony=>{
            let model=TESTIMONIES_DATABASE[testimony.testimony.action];

            // Decide if to declare something
            let declare=(
                (!person.isKnownTestimony(testimony)) && // The testimony is not already known by the the person
                (!iseavesdrop || !model.doNotEavesdrop) && // Avoid too much eavesdropping on eavesdropping
                (
                    (iseavesdrop) || // Eavesdropping catches everything
                    (model.isBuzz) || // The buzz about biases, good, and bad persons is always OK, even if offensive ;)
                    ((testimony.person!==person)&&(testimony.testimony.person!==person)) // Or skip any testimony about the other person
                )
            );

            // If I want to declare something... but it's an interview...
            if (isinterview && declare) {
                let
                    instruction=TESTIMONIES_DATABASE[testimony.testimony.action];

                if (instruction && instruction.onInterviewDeclare) {
                    let oninterviewdeclare=instruction.onInterviewDeclare;
                    if (oninterviewdeclare !== true) {
                        if (oninterviewdeclare.notByMe && (testimony.person === this)) declare=false;
                        if (oninterviewdeclare.notAboutMe && (testimony.testimony.person === this)) declare=false;
                        if (oninterviewdeclare.notAboutMeScheduleAction && (testimony.testimony.person === this) && (oninterviewdeclare.notAboutMeScheduleAction.indexOf(testimony.testimony.schedule.action)!=-1)) declare=false;
                    }
                } else debugger;

            }

            // So, I want to declare that?
            if (declare)
                TRAIT.addToShareableItem(out,"testimony",testimony);

        });

        // Good/bad people opinions are not interesting for interview but OK for eavesdropping.
        if (!isinterview) {
            // Opinions about good/bad people
            let reputations=this.getOpinionRankOf("reputation","person",true);
            reputations.forEach(reputation=>{
                if (reputation.value == THRESHOLD_GOOD_PERSON)
                    TRAIT.addToShareableItem(out,"isGoodPerson",reputation.element);
                if (reputation.value == THRESHOLD_BAD_PERSON)
                    TRAIT.addToShareableItem(out,"isBadPerson",reputation.element);
            })

        }

        return out;

    }

    this.listJuicyTestimonies=(forperson,aboutperson,skipsecrets)=>{
        // List testimonies sorted by interest and freshness
        let ranked=this.testimonies.filter(testimony=>{
            return (
                (!aboutperson || (testimony.person===aboutperson)||(testimony.testimony.person===aboutperson))
                &&
                // Remove secret testimonies, if not asked
                (!skipsecrets || (this.secretTestimonies.indexOf(testimony)==-1))
            );
        }).map(testimony=>{
            return {testimony:testimony, value:getTestimonyJuiciness(testimony), subvalue:testimony.testimony.at.day*100+testimony.testimony.at.time};
        });
        ranked.sort((a,b)=>{
            // Rank by value...
            if (a.value>b.value) return -1;
            else if (a.value<b.value) return 1;
            // ...and then for most recent
            else if (a.subvalue>b.subvalue) return -1;
            else if (a.subvalue<b.subvalue) return 1;
            else return 0;
        });
        return ranked.map(rank=>rank.testimony);
    }
    
    this.listJuicyShareableTraitsWith=(person,eavesdrop,isinterview)=>{

        // Gets something meaningful to share with person        
        let sharableTraits=this.listShareableTraitsWith(person,eavesdrop,isinterview);

        if (sharableTraits.length) {
            // Estabilish shareable value
            sharableTraits.forEach(trait=>{
                let
                    id=trait.type,
                    value=0,
                    subvalue=0;
                switch (trait.type) {
                    case "isGoodPerson":{
                        // Direct good opinions are disincentived, except for special ones
                        if (!this.isSpecialOnePerson(person))
                            value--;
                        break;
                    }
                    case "isBadPerson":{
                        // Direct bad opinions are disincentived for special ones
                        if (this.isSpecialOnePerson(person))
                            value--;
                        break;
                    }
                    case "breakfastAt":
                    case "lunchAt":
                    case "dinnerAt":{
                        // Vague chitchat may be not interesting
                        value--;
                        break;
                    }
                    case "testimony":{
                        let testimony=trait.item;
                        // Sum the testimony juiciness
                        value+=getTestimonyJuiciness(testimony,this);
                        // Testimonies also have action in ids
                        id+="-"+testimony.testimony.action;
                        // Testimonies are also sorted by freshness
                        subvalue=testimony.testimony.at.day*100+testimony.testimony.at.time;
                        break;
                    }
                    default:{
                        debugger;
                    }
                }
                trait.id=id;
                trait.value=value;
                trait.subvalue=subvalue;
            });

            // Sort by juiciness...
            sharableTraits.sort((a,b)=>{
                // Sort by value
                if (a.value>b.value) return -1;
                else if (a.value<b.value) return 1;
                // then sort by subvalue
                else if (a.subvalue>b.subvalue) return -1;
                else if (a.subvalue<b.subvalue) return 1;
                // then sort by id
                else if (a.id>b.id) return -1;
                else if (a.id<b.id) return 1;
                else return 0;
            });

            // Try to diversify topics, coming out with something varied.
            let lastTrait;
            sharableTraits=sharableTraits.filter(trait=>{
                if (trait.id == lastTrait)
                    return false;
                else {
                    lastTrait = trait.id;
                    return true;
                }
            })

        }

        return sharableTraits;

    }

    this.chitChatWithPerson=(person)=>{
        // Gain a random trait from the friend

        let sharableTraits=person.listJuicyShareableTraitsWith(this);

        if (sharableTraits.length) {
            let sharedTrait=this.randomizer.firstElement(sharableTraits,2);
            this.gainPersonTrait(person,sharedTrait);
            let relatedFacts=[
                this.blackbox.addEntry(this.clock, { entity:this, action:"chitChat", person:person })
            ];

            // Uses its features to perform the action
            this.performEffort();

            // Chitchatting releases the stress...
            this.lowerStress("chitchatting");

            // But not suspect...

            this.addTestimony({
                at:this.clock.get(),
                action:"chitChatWith",
                context:sharedTrait.type=="testimony" ? sharedTrait.item.testimony.action : 0,
                person:person,
                place:this.place,
                relatedFacts:relatedFacts
            });
        }
    }

    this.eavesdropPerson=(person)=>{

        // Secretly gain a random testimony...
        let sharableTraits=person.listShareableTraitsWith(this,true);

        if (sharableTraits.length) {

            let relatedFacts=[
                this.blackbox.addEntry(this.clock, { entity:this, action:"eavesdrop", person:person, place:this.place })
            ];

            let sharedTrait=this.randomizer.element(sharableTraits);
            this.gainPersonTrait(person,sharedTrait);

            // Eavesdrop have no effect...
            // Add a testimony that I couldn't perform the action at my best.
            this.addTestimony({
                at:this.clock.get(),
                action:"eavesdrop",
                context:sharedTrait.type=="testimony" ? sharedTrait.item.testimony.action : sharedTrait.type,
                person:person,
                place:this.place,
                relatedFacts:relatedFacts
            });

        }
    }

    // Displacement & Moving

    this.remove=()=>{
        this.blackbox.addEntry(this.clock, { entity:this, action:"removed", fromPlace:this.place });
        this.setTag("removed",true);
        if (this.place) this.place.leavePerson(this);
        this.place=0;
        this.raiseObscurity();
    }

    this.moveTo=(place)=>{

        if (!place) debugger;

        // Is movement needed?
        if (place !== this.place) {

            // Look a little around before leaving...
            if (this.place && this.isConscious())
                this.lookAround();

            // If it's a safe place, look around the other rooms
            if (this.isSafePlace(this.place)) {
                this.place.getAllSecludedPlaces().forEach(place=>{
                    if (this.isInteractive())
                        this.lookAround(place);
                })
            }

            // Am I still able to move?
            if (this.isAbleToMove())
                this.hurryTo(place);
        
        }

    }

    this.hurryTo=(place)=>{

        // Is movement needed?
        if (place !== this.place) {

            // Perform movement
            this.blackbox.addEntry(this.clock, { entity:this, action:"moveTo", fromPlace:this.place, toPlace:place });

            if (this.place) this.place.leavePerson(this);
            place.enterPerson(this);
            this.place=place;

        }

    }

    this.moveToSafePlace=()=>{
        // Exclude from safe places the place I'm into
        if (this.tags.safePlaces) {
            let places=this.tags.safePlaces.filter(place=>place!==this.place);
            // Anywhere to go?
            if (places.length) {
                let place=this.randomizer.element(places);
                
                let relatedFacts=[
                    this.blackbox.addEntry(this.clock, { entity:this, action:"decidedToGoSafePlace", fromPlace:this.place, toPlace:place })
                ];

                // Add testimony
                this.addTestimony({
                    at:this.clock.get(),
                    action:"movedToSafePlace",
                    person:this,
                    place:this.place,
                    isObscure:true,
                    noSuspects:[this,place], // I'm not suspect... and the place I'm running to...
                    suspects:[this.place], // The starting place is suspect
                    relatedFacts:relatedFacts
                });

                // Go there urgently
                this.hurryTo(place);

                // I'm safe! Lower stress a little.
                this.lowerStress("escapedToSafePlace");
            }
        }
    }

    this.forcedToMoveByPerson=(person,place)=>{
        this.blackbox.addEntry(this.clock, { entity:this, action:"forcedToMoveByPerson", fromPlace:this.place, toPlace:place, person:person });

        // Displace in a hurry
        this.hurryTo(place);
        
        // Shocking experience
        this.shock();

        // He's bad!
        this.thinkIsBadPerson(person);

        // Guess why...
        this.guessBiasFor(person,false,this);
    }

    this.forcePersonToMove=(person,place)=>{
        if (this === person) debugger;
        if (person.place !== this.place) debugger;

        let relatedFacts=[
            this.blackbox.addEntry(this.clock, { entity:this, action:"forcePersonToMove", fromPlace:this.place, toPlace:place, person:person })
        ];

        // Add testimony...
        this.addTestimony({
            at:this.clock.get(),
            action:"forcedPersonToMove",
            place:this.place,
            person:person,
            isObscure:true,
            suspects:[this,this.place],
            relatedFacts:relatedFacts
        });

        // Move in a hurry there...
        this.hurryTo(place);

        // And force the other one.
        person.forcedToMoveByPerson(this,place);

        
    }

    // Bonding
    
    let mayPersonAddTag=(person,tag)=>{
        return !this.tags[tag] || this.tags[tag].length<2;
    }

    this.addBond=(type,person,exclusive)=>{
        this.blackbox.addEntry(this.clock, { entity:this, action:"addBond", bondType:type, exclusive:!!exclusive, withPerson:person });
        if (exclusive)
            this.setTag(type,person);
        else
            this.addToTag(type,person);
        this.addToTag("bonds",person);
    }

    this.removeBond=(type,person)=>{
        this.blackbox.addEntry(this.clock, { entity:this, action:"removeBond", bondType:type, withPerson:person });
        this.removeFromTag(type,person);
        // Anyway a person is never removed from the bonded list, since it's already known
    }

    this.gainPersonTrait=(fromperson,trait)=>{
        let time=this.clock.get();
        switch (trait.type) {
            case "dinnerAt":
            case "lunchAt":
            case "breakfastAt":{
                let destination=this.addDestinationPlace(trait.type,trait.item.place,{ whenThereIsPerson:fromperson });
                this.blackbox.addEntry(this.clock, { entity:this, action:"gainedDestination", type:trait.type, destination:destination, fromPerson:fromperson });
                break;
            }
            case "testimony":{       
                this.learnTestimony(trait.item,fromperson);
                break;
            }
            // --- Direct opinions
            case "isGoodPerson":{
                // I've heard around that's a good person
                this.learnTestimony({
                    at:time,
                    person:fromperson,
                    testimony:{
                        at:time,
                        action:"isGoodPerson",
                        place:this.place,
                        person:trait.item,
                        noSuspects:[trait.item]
                    }
                },fromperson);
                break;
            }
            case "isBadPerson":{
                // I've heard around that's a bad person
                this.learnTestimony({
                    at:time,
                    person:fromperson,
                    testimony:{
                        at:time,
                        action:"isBadPerson",
                        place:this.place,
                        person:trait.item,
                        suspects:[trait.item]
                    }
                },fromperson);
                break;
            }
            default:{
                debugger;
            }
        }
    }

    this.addFriend=(person)=>{

        // Add testimony
        this.addTestimony({
            at:this.clock.get(),
            action:"addFriend",
            place:this.place,
            person:person,
            noSuspects:[person,this.place]
        });
        
        this.addBond("friends",person);
        this.chitChatWithPerson(person);

        // Think good about him.
        this.thinkIsGoodPerson(person);
        
        // Why he likes me?
        this.guessBiasFor(person,true,this);
    }

    this.addDestinationPlace=(tag,place,conditions)=>{
        if (place) {
            let destination=PLACE.newDestinationPlace(place,conditions);
            this.addToTag("destinations",destination);
            this.addToTag(tag,destination);
            return destination;
        }
    }

    // Special ones

    this.addSpecialOne=(person)=>{
        this.addBond("specialOne",person);
    }

    this.removeSpecialOne=(person)=>{
        this.removeBond("specialOne",person);
    }

    this.replaceSpecialOne=(oldperson,newperson)=>{
        if (oldperson)
            this.removeSpecialOne(oldperson);
        this.addSpecialOne(newperson);
    }

    // Marriage and love

    this.marry=(person)=>{

        // Only one married one ATM
        this.addBond("partner",person,true);

        // It's a new special one
        this.addSpecialOne(person);

        // Calculate duration as how better the partner is felt
        let duration=0;
        this.tags.flirtStats.forEach(stat=>{
            if (this.tags[stat]<person.tags[stat])
                duration+=person.tags[stat]-this.tags[stat];
        });

        // Marriage makes the bond stronger
        duration*=LOVE_MARRIAGE_RATIO;

        // ...in relation to day length
        duration*=Clock.getDayLength();

        // Agree on gender neutral preference
        this.setTag("isGenderNeutral",person.tags.isGenderNeutral);

        this.setTag("loverDuration",duration);

        // Marying releases the stress...
        this.lowerStress("married");

        // ...and zeroes suspect.
        this.zeroesSuspectOf(person);

    }

    this.isLoveAvailable=()=>{
        // Is not in a relation and not in cooldown
        return !this.tags.loverDuration && !this.tags.loveCooldown;
    }

    this.wantFindLove=()=>{

        // If there is a cooldown needed...
        if (this.tags.loveNeedsCooldown) {
            
            // Remove it...
            this.setTag("loveNeedsCooldown",false);
            // Starts a cooldown based on the wisdom stat
            this.setTag("loveCooldown",Math.floor(this.tags.wisdom*LOVE_COOLDOWN_RATIO));
            return false;

        } else {

            // Else reduce it
            return !this.lowerTag("loveCooldown",1);
            
        }
        
    }

    this.makesLover=(person)=>{

        let time=this.clock.get();

        // The new special one replaces the older one
        this.replaceSpecialOne(this.tags.lover,person);

        // Only one married one lover
        this.addBond("lover",person,true);

        // Calculate duration as how better the partner is felt
        let duration=0;
        this.tags.flirtStats.forEach(stat=>{
            if (this.tags[stat]<person.tags[stat])
                duration+=person.tags[stat]-this.tags[stat];
        });

        // ...in relation to day length
        duration*=Clock.getDayLength();

        let relatedFacts=[
            this.blackbox.addEntry(this.clock, { entity:this, action:"newLover", person:person, place:this.place })
        ];

        this.setTag("loverDuration",duration * LOVE_LOVER_RATIO);
        // Prepare for a single status pause after this relation to think about it...
        this.setTag("loveNeedsCooldown",true);

        // Finding a new lover releases the stress...
        this.lowerStress("foundLover");

        // ...and zeroes suspect.
        this.zeroesSuspectOf(person);

        // Add a new testimony
        this.addTestimony({
            at:time,
            action:"newLover",
            place:this.place,
            person:person,
            isObscure:true, // Love affairs makes the person more interesting...
            suspects:[this,person], // They both are more intriguing...
            relatedFacts:relatedFacts
        });

        // Is there any testimony that recognized them?
        let testimonies=this.place.getPersonsThatRecognizesPerson(this,person);
        // TODO: All of them?
        if (testimonies.length)
            testimonies.forEach(testimony=>{
                // Got it! Add a new testimony!
                testimony.addTestimony({
                    at:time,
                    action:"seeNewLover",
                    place:this.place,
                    person:this,
                    isObscure:true, // Love affairs makes the person more interesting...
                    suspects:[this,this.place],
                    relatedFacts:relatedFacts
                });
            })

        this.telemetry.record(this,this.clock.get(),"_makeslover",1);

    }

    // Work

    this.workAt=(place)=>{

        this.blackbox.addEntry(this.clock, { entity:this, action:"work", place:this.place });

        // Uses its features to perform the action
        this.performEffort();

        // Triggers the place action
        place.personPerformInteraction(this,"work");

    }

    // Stats

    let getDiscussionScore=(person)=>{
        let score=0,count=0;
        if (person.tags.feature)
            person.tags.feature.uses.forEach(feature=>{
                count++;
                score+=person.tags[feature];
            });
        return count ? score/count : 0;
    }

    this.consumeStat=(stat)=>{
        if (this.tags[stat]) {
            // Consume stat if available.
            this.lowerTag(stat,1);
            this.blackbox.addEntry(this.clock, { entity:this, action:"lowerStat", stat:stat, value:this.tags[stat] });
        } else if (this.tags.stamina)
            // Exhausted stat... use stamina instead...
            this.consumeStat("stamina");
        else
            // Too tired. Increase stress.
            this.raiseStress("staminaOver",STRESS_VERYLOW);
    }

    this.performEffort=()=>{
        // Uses its features
        if (this.tags.feature)
            this.tags.feature.uses.forEach(feature=>{
                this.consumeStat(feature);
            })
    }

    // Stress

    this.getStressReasons=()=>{
        return this.getOpinionTopReasonOf("stress",this,false,"unknown");
    }

    this.lowerStress=(reason,amount)=>{
        if (!reason) debugger;
        let stress=this.lowerOpinionOf("stress",this,amount);
        this.blackbox.addEntry(this.clock, { entity:this, action:"lowerStress", stress:stress, reason:reason });
    }

    this.raiseStress=(reason,amount,skiplatest)=>{
        if (!reason) debugger;
        if (!REASONS_DATABASE[reason]) debugger;
        if (!amount) debugger;
        let stress=this.raiseOpinionOf("stress",reason,this,amount,skiplatest);
        // TODO: Should stress apply an extra negative bias on the reason?
        this.blackbox.addEntry(this.clock, { entity:this, action:"raiseStress", stress:stress, reason:reason });
    }

    // Relaxing, recovering, sleeping
    
    this.relax=()=>{
        // Release the stress
        this.zeroOpinionOf("stress",this);
    }

    this.recover=(times)=>{
        if (!times) times=1;
        for (let i=0;i<times;i++) {
            // Get one of the lowest stat
            let statsList=[];
            this.tags.canRecover.forEach(stat=>{
                if (this.tags[stat]<THRESHOLD_STATS_MAX)
                    statsList.push({stat:stat,value:this.tags[stat]});
            });
            // Any stat to recover?
            if (statsList.length) {
                statsList.sort((a,b)=>{
                    if (a.value<b.value) return -1; else
                    if (a.value>b.value) return 1; else
                    return 0;
                })
                let lowestStat=this.randomizer.firstElement(statsList,2).stat;
                this.raiseTag(lowestStat,1);
                this.blackbox.addEntry(this.clock, { entity:this, action:"raiseStat", stat:lowestStat, value:this.tags[lowestStat] });
            }
        }

        // Lowers stress a little too
        this.lowerStress("recovering");

    }

    this.sleep=()=>{
        // Recover some stats
        this.recover(4);
        this.blackbox.addEntry(this.clock, { entity:this, action:"sleep", place:this.place });

        // Performs the "sleep" action at place
        this.place.personPerformInteraction(this,"sleep");
    }

    // Debating, Agreements

    this.shareAgreementWith=(subject,agreement)=>{
        if (agreement) {
            // If we agree
            this.lowerSuspectOf(subject);
            this.lowerStress("sharingAgreement");
            // No idea change needed
            return false;
        } else {
            // If we don't agree
            this.raiseSuspectOf("dontAgree",subject,SUSPECT_VERYLOW);
            this.raiseStress("dontAgree",STRESS_VERYLOW);
            // Is the person convincing?
            if (subject.type == "person")
                // Debate and decide to change idea
                return this.debateQuietlyWithPerson(subject);
            else
                // Else no idea change needed
                return false;
        }
    }

    this.debateQuietlyWithPerson=(person)=>{
        // Compare average score of features stats between persons. 
        let
            myScore=getDiscussionScore(this),
            otherScore=getDiscussionScore(person);
        return myScore>otherScore;
    }

    this.beLoudWithPerson=(person)=>{

        let relatedFacts=[
            this.blackbox.addEntry(this.clock, { entity:this, action:"beLoudWithPerson", person:person, place:this.place })
        ];

        // Perform some effort
        this.performEffort();

        // Look for testimonies at this place...
        let persons=this.place.getPersonsThatRecognizesPerson(this,person);

        if (persons.length) {
            
            // Someone have seen the fight!
            let
                testimony=this.randomizer.element(persons);

            // It's a shocking testimony
            testimony.addShockingTestimony({
                at:this.clock.get(),
                action:"seeDebating",
                place:this.place,
                person:this,
                isObscure:true,
                suspects:[this],
                relatedFacts:relatedFacts
            });
                
        }
    }

    this.debateLoudlyWithPerson=(person)=>{
        
        // It's like a normal debate but effort and violent. There may be testimonies and consequences...
        this.beLoudWithPerson(person);
        person.beLoudWithPerson(this);

        // The debate went...
        let
            result=this.debateQuietlyWithPerson(person);

        // If lost the debate but still in good mood, let it slide
        if (this.isGoodMoodWithPerson(person))
            result=true;

        let
            winner=result?this:person,
            loser=result?person:this;

        // The winner feels better
        winner.lowerStress("debateWon");

        // The loser is stressed and more suspect of the winner...
        loser.raiseStress("failedDebate",STRESS_LOW);
        loser.raiseSuspectOf("failedDebate",winner,SUSPECT_LOW);

        return result;
    }

    // Opinion

    this.opinions={};

    let initializeOpinion=(key,of,reason)=>{
        if (!this.opinions[of.id]) this.opinions[of.id]={
            element:of,
            reasons:{},
            values:{}
        };
        if (this.opinions[of.id].values[key] == undefined) {
            this.opinions[of.id].values[key]=0;
            this.opinions[of.id].reasons[key]={
                latest:0,
                maxRank:0,
                topRank:0,
                weakReasons:{},
                rank:{}
            };
        }
        if (reason) {
            let reasonid=reason;
            if (reason.id)
                reasonid=reason.id;
            if (!this.opinions[of.id].reasons[key].rank[reasonid])
                this.opinions[of.id].reasons[key].rank[reasonid]={
                    id:reasonid,
                    reason:reason,
                    value:0
                };
            return reasonid;
        }
    }

    this.raiseOpinionOf=(key,reason,of,by,skiplatest,threshold)=>{
        if (!by) by=1;
        let reasonid=initializeOpinion(key,of,reason);
        let value=this.opinions[of.id].values[key];
        value+=by;
        if ((threshold !== undefined) && (value>threshold))
            value=threshold;
        if (reasonid) {
            let reason=this.opinions[of.id].reasons[key];
            if (!skiplatest)
                reason.latest=reasonid;
            reason.rank[reasonid].value+=by;
            if ((reason.maxRank===undefined)||(value>=reason.maxRank)) {
                reason.maxRank=value;
                reason.topRank=reasonid;
            }
            if (by<2)
                reason.weakReasons[reasonid]=true;
        }
        // Self opinions are mirrored in tags
        if (of===this) this.setTag(key,value);
        this.opinions[of.id].values[key]=value;
        return value;
    }

    this.zeroOpinionOf=(key,of)=>{
        initializeOpinion(key,of);
        this.opinions[of.id].values[key]=0;
        if (of===this) this.setTag(key,0);
        return this.opinions[of.id].values[key];
    }

    this.lowerOpinionOf=(key,of,by,threshold)=>{
        if (!by) by=1;
        initializeOpinion(key,of);
        let value=this.opinions[of.id].values[key];
        if (threshold !== undefined) {
            if (value-by<threshold)
                by=threshold-value;
        } else if (by>value)
            by=value;
        value-=by;
        // Distribute the value decrease to the highest values
        if (by) {
            let list=this.getOpinionReasonRankOf(key,of,true);
            for (let i=0;i<by;i++)
                if (list.length) {
                    list[0].value--;
                    this.opinions[of.id].reasons[key].rank[list[0].id].value--;
                    if (!list[0].value) list.splice(0,1);
                }
        }
        // Self opinions are mirrored in tags
        if (of===this) this.setTag(key,value);
        this.opinions[of.id].values[key]=value;
        return value;
    }

    this.getOpinionOf=(key,of)=>{
        if (this.opinions[of.id])
            return this.opinions[of.id].values[key]||0;
        else
            return 0;
    }

    this.getTopOpinionOf=(key,of)=>{
        if (this.opinions[of.id] && this.opinions[of.id].reasons[key] && this.opinions[of.id].reasons[key].topRank) {
            let rank=this.opinions[of.id].reasons[key].rank[this.opinions[of.id].reasons[key].topRank];
            return {
                id:rank.id,
                reason:rank.reason,
                value:rank.value
            }
        } else
            return false;
    }

    this.getOpinionRankOf=(key,type,excludeself,tag,tagvalue)=>{
        let list=[];
        for (let k in this.opinions)
            if (
                (this.opinions[k].element.type == type) && this.opinions[k].values[key] &&
                (!excludeself || (this.opinions[k].element!==this)) &&
                (!tag || (this.opinions[k].element.tags[tag] == tagvalue))
            )
                list.push({id:k,element:this.opinions[k].element, value:this.opinions[k].values[key]});
        list.sort((a,b)=>{
            if (a.value<b.value) return 1; else
            if (a.value>b.value) return -1; else
            return 0;
        })
        return list;
    }

    this.getOpinionTopOf=(key,type,excludeself,tag,tagvalue)=>{
        let list=this.getOpinionRankOf(key,type,excludeself,tag,tagvalue);
        if (list.length)
            return list[0];
        else
            return 0;
    }

    this.getOpinionReasonRankOf=(key,of,keepweak)=>{
        let list=[];
        if (this.opinions[of.id]) {
            for (let k in this.opinions[of.id].reasons[key].rank)
                // Skip weak and continuous reasons
                if (keepweak || (!this.opinions[of.id].reasons[key].weakReasons[k]))
                    list.push({id:k,value:this.opinions[of.id].reasons[key].rank[k].value});
            list.sort((a,b)=>{
                if (a.value<b.value) return 1; else
                if (a.value>b.value) return -1; else
                return 0;
            })
        }
        return list;
    }

    this.getOpinionTopReasonOf=(key,of,keepweak,onempty)=>{
        let
            list=[],
            rank=this.getOpinionReasonRankOf(key,of,keepweak);
        if (this.opinions[of.id].reasons[key].latest)
            list.push(this.opinions[of.id].reasons[key].latest);
        rank.forEach(element=>{
            if ((element.value==rank[0].value)&&(list.indexOf(element.id)==-1))
                list.push(element.id);
        });
        if (!list.length && onempty) list.push(onempty);
        return list;
    }

    // Suspect

    this.getSuspectOf=(of)=>{
         
        // Starts with base suspect
        let suspect=this.getOpinionOf("suspect",of);

        // TODO: Just after some suspect threshold?
        if (
            !this.isSpecialOnePerson(of) && // The special one are never extra suspected...
             this.isBondedWithPerson(of) // ...but a bonded person maybe...
        )
            suspect=Math.ceil(suspect*1.2); // ...gain extra suspect.

        return suspect;

    }

    this.raiseSuspectOf=(reason,of,by)=>{
        // TODO: Can't raise suspect of yourself...
        if (of !== this) {
            if (!REASONS_DATABASE[reason]) debugger;
            if (!by) debugger;
            let suspect=this.raiseOpinionOf("suspect",reason,of,by);
            this.telemetry.record(this,this.clock.get(),"suspectof_"+of.id,suspect);
            this.blackbox.addEntry(this.clock, { entity:this, action:"raiseSuspect", of:of, by:by, suspect:suspect });
        }
    }

    this.zeroesSuspectOf=(of)=>{
        // TODO: Can't raise suspect of yourself...
        if (of !== this) {
            let suspect=this.zeroOpinionOf("suspect",of);
            if (this.clock) this.telemetry.record(this,this.clock.get(),"suspectof_"+of.id,suspect);
            this.blackbox.addEntry(this.clock, { entity:this, action:"zeroesSuspect", of:of });
        }
    }

    this.lowerSuspectOf=(of,by)=>{
        // TODO: Can't raise suspect of yourself...
        if (of !== this) {
            if (!by) by=1;
            let suspect=this.lowerOpinionOf("suspect",of,by);
            this.telemetry.record(this,this.clock.get(),"suspectof_"+of.id,suspect);
            this.blackbox.addEntry(this.clock, { entity:this, action:"lowerSuspect", of:of, by:by, suspect:suspect });
        }
    }

    this.getMostSuspicious=(type,tag,tagvalue)=>{
        let suspect=this.getOpinionTopOf("suspect",type,true,tag,tagvalue);
        if (suspect) {
            // There always is a suspect reason
            let reasons=this.getOpinionTopReasonOf("suspect",suspect.element,true);
            return {
                element:suspect.element,
                suspect:suspect.value,
                reason:reasons
            }
        } else return 0;
    }

    // Planning & Time
    
    this.addToCalendar=(time,entry)=>{
        let id=getTimeId(time);
        if (!this.calendar[id]) this.calendar[id]=[];
        this.calendar[id].push(entry);
        this.blackbox.addEntry(this.clock, { entity:this, action:"plannedTo", entry:entry, at:time });
    }

    this.getCalendar=(time)=>{
        return this.calendar[getTimeId(time)];
    }

    // Money

    this.earnMoney=(amt,from)=>{
        // Testimony
        this.raiseTag("money",amt);
        this.blackbox.addEntry(this.clock, { entity:this, action:"earnMoney",amount:amt, from:from });

        // Lowers stress a little
        this.lowerStress("gainedMoney");
    }

    this.payMoney=(amt,to)=>{
        if (amt) {
            this.blackbox.addEntry(this.clock, { entity:this, action:"payMoney",amount:amt,to:to });
            // Can pay?
            if (this.tags.money && (this.tags.money>amt)) {
                // If yes, pay money.
                this.lowerTag("money",amt);
            } else {
                let relatedFacts=[
                    this.blackbox.addEntry(this.clock, { entity:this, action:"cantPayMoney",amount:amt,to:to })
                ];
                // ...else go broke...
                this.setTag("money",0);
                // ...and get frustrated.
                this.raiseStress("noMoney",STRESS_VERYLOW);
                // Is someone watching this?
                  // Look for testimonies at this place...
                let
                    persons=this.place.getPersonsThatRecognizesPerson(this);
                
                if (persons.length) {
                    let person=this.randomizer.element(persons);
                    // Add a testimony that I couldn't perform the action at my best.
                    this.addTestimony({
                        at:this.clock.get(),
                        action:"cantPay",
                        person:this,
                        to:to,
                        place:this.place,
                        suspects:[this,this.place],
                        relatedFacts:relatedFacts
                    });
                }
        
            }
        }
    }

    // Biases

    let getBiasScoreFor=(entity)=>{
        return BIAS.getBiasesScore(this.tags.biases,this,entity);
    }

    this.addBias=(bias)=>{
        this.addToTag("biases",bias);
    }

    this.onBiasFor=(subject,positive,zero,negative)=>{
        let score=getBiasScoreFor(subject);
        if (score>0) {
            if (positive) {
                this.blackbox.addEntry(this.clock,{ entity:this, action:"applyPositiveBias", subject:subject});
                positive(score);
            }
        } else if (score<0) {
            if (negative) {
                this.blackbox.addEntry(this.clock,{ entity:this, action:"applyNegativeBias", subject:subject});
                negative(score);
            }
        } else if (zero) {
            this.blackbox.addEntry(this.clock,{ entity:this, action:"applyNeutralBias", subject:subject});
            zero(score);
        }
    }

    this.guessBiasFor=(person,positivebias,entity)=>{
        // Try to guess another person's biases based on a perceived positive/negative score
        let
            lastbias=this.getTopOpinionOf("bias",person),
            biases=BIAS.guessBiases(this.tags.knownBiases,this,person,positivebias,entity);
        biases.forEach(bias=>{
            this.raiseOpinionOf("bias",bias,person,1);
        });
        let newbias=this.getTopOpinionOf("bias",person);
        if (biases.length&&(newbias.id==lastbias.id)&&(newbias.value==lastbias.value)) debugger;
        // If new idea or changed idea adds a testimony
        if (newbias && (newbias.value>=THRESHOLD_BIAS_DECLARE) && (!lastbias || (lastbias.id !== newbias.id)))
            this.addTestimony({
                at:this.clock.get(),
                action:"maybeHasBias",
                person:person,
                place:this.place,
                isObscure:true, // Talking about biases makes people obscure...
                bias:newbias.reason
            });
    }

    // Schedule

    this.cantPerformSchedule=(schedule)=>{

        this.raiseTag(schedule.action+"CantPerform",1);

        // Add a testimony that I couldn't perform the action at my best.
        this.addTestimony({
            at:this.clock.get(),
            action:"cantPerformSchedule",
            context:schedule.action,
            person:this,
            place:this.place,
            schedule:schedule
        });

        // Raise stress a little - do not keep latest since it's very frequent and pollutes reasons
        this.raiseStress("cantPerformSchedule",STRESS_VERYLOW,true);

        // Raise suspect of the place it's stuck
        this.raiseSuspectOf("cantPerformSchedule",this.place,SUSPECT_VERYLOW);

    }

    // Menace

    this.menacedBy=(person)=>{
        
        // Add a testimony
        this.addTestimony({
            at:this.clock.get(),
            action:"menacedMe",
            place:this.place,
            person:person,
            isObscure:true,
            suspects:[person,this.place]
        });

        // The experience raises shock to the scared person
        this.shock();

        // The menaced person thinks the other is good
        this.thinkIsBadPerson(person);

        // Why?
        this.guessBiasFor(person,false,this);

        // Let's remove some testimonies about me - maybe the menace too. Secrets are not interesting...
        let testimonies=this.listJuicyTestimonies(0,person,true);
        for (let i=0;i<3;i++)
            if (testimonies.length) {
                let testimony=this.randomizer.pickFirstElement(testimonies,2);
                this.forgetTestimony(testimony,person);
            }
    }

    this.menace=(person)=>{

        // No repeated testimony.

        // Uses its features to perform the action
        this.performEffort();

        // Be a litte too loud
        this.beLoudWithPerson(person);

        // Add a testimony
        person.menacedBy(this);

        // The menacing person is now more confident about the scared person
        this.thinkIsGoodPerson(person);

    }

    this.startMenacePerson=(person,reason)=>{

        // Find a secluded room...
        let secludedPlaces=this.place.getAvailableSecludedPlaces();

        // If any...
        if (secludedPlaces.length) {

            if (!reason) debugger;
            if (reason.constructor.name!="Array") debugger;
            
            let relatedFacts=[
                this.blackbox.addEntry(this.clock, { entity:this, action:"startMenacing", person:person, reason:reason, place:this.place })
            ];

            // Add a testimony
            this.addTestimony({
                at:this.clock.get(),
                action:"menaced",
                place:this.place,
                person:person,
                isObscure:true,
                suspects:[person,this.place], // The menaced person deserved this!
                relatedFacts:relatedFacts
            });

            // Choose a random one...
            let room=this.randomizer.element(secludedPlaces);

            // Bring that person in the room...
            this.forcePersonToMove(person,room);

            // Tie him
            this.tiePerson(person,reason);

            // Did it?
            if (person.isTied()) {

                // ...and menace it
                this.menace(person);

                // Lower attention
                this.lowerAttention();

                // Plan to menace or release the person later
                this.willContinueMenace("menace",person,reason,this.place,0,DAYS_DELAY_VERYSHORT);

                // Lower attention
                this.lowerAttention();

                return true;

            } else false;

        } else return false;

    }

    this.endMenacePerson=(person)=>{

        let relatedFacts=[
            this.blackbox.addEntry(this.clock, { entity:this, action:"endMenacing", person:person, place:this.place })
        ];

        // Untie the person
        this.untiePerson(person);

        // Lower attention
        this.lowerAttention();
    }
    
    // Flirt

    this.flirtWithPerson=(person)=>{

        // It likes me?
        if (person.isLikingPerson(this)) {
            
            if (
                // Is the other person available for love
                person.isLoveAvailable() &&
                // Is there attaction from both sides?
                person.isAttractedByPerson(this) &&
                this.isAttractedByPerson(person)
            ) {

                // They become lovers <3
                this.makesLover(person);
                person.makesLover(this);

            } else {
                // A little more stress for you.
                this.raiseStress("flirtFailed",STRESS_LOW);
                // And suspect...
                this.raiseSuspectOf("flirtFailed",person,SUSPECT_LOW);
            }

        } else {

            // Bad luck. No gender affinity.

        }

    }

    // Hangout

    this.hangOut=()=>{

        let places=this.world.getPlacesByTag("placeToHangOut",true);

        // Are there places that someone told me about?
        if (this.tags.destinations) {
            PLACE.filterValidDestinations(this.tags.destinations).forEach(place=>{
                if (places.indexOf(place)==-1)
                    places.push(place);
            })
        }

        // Get unique IDS
        let placeIds={};
        places=places.filter(place=>{
            if (placeIds[place.id])
                return false;
            else {
                placeIds[place.id]=true;
                return true;
            }
        })

        // Is there anywhere to go?
        if (places.length) {

            // Lower stress a little...
            this.lowerStress("hangOut");

            // Go there!
            let place=this.randomizer.element(places);
            this.blackbox.addEntry(this.clock, { entity:this, action:"hangOut", place:place });
            this.moveTo(place);

        }

    }

    // Time pass

    this.pass=()=>{

        // Is it conscious?
        if (this.isConscious()) {

            let
                time=this.clock.get();

            // Is the person resting?
            if (this.isResting()) {

                // Rest...
                this.rest();

            } else {

                // Plan commitments
                this.planCommitments();

                // Process schedule
                let schedules=this.getCalendar(time);
                 
                if (schedules) {

                    schedules.forEach(schedule=>{
                        
                        let
                            scheduleDone=false,
                            reschedule=false;

                        // If I can move
                        if (this.isAbleToMove()) {
                                
                            // Move at place, if needed
                            if (schedule.place) {
                                let destination=schedule.place;
                                if (destination.taggedAs) {
                                    let destinations=PLACE.filterValidDestinations(this.tags[destination.taggedAs]);
                                    if (destinations.length)
                                        destination=this.randomizer.element(destinations);
                                    else
                                        destination=0;
                                }
                                if (!destination) {
                                    debugger;
                                } else

                                    // Leave
                                    if (this.place !== destination)
                                        this.moveTo(destination);
                            } else
                                // If there is no movement planned just look around
                                this.lookAround();
                        
                        }

                        // Perform life action
                        if (this.isInteractive()) {

                            // Perform action
                            switch (schedule.action) {
                                // Sleeping lowers stess a little.
                                case "wakeUp":{
                                    this.blackbox.addEntry(this.clock, { entity:this, action:schedule.action, place:this.place });
                                    scheduleDone=true;
                                    break;
                                }
                                // Eating is relaxing
                                case "breakfast":
                                case "lunch":
                                case "dinner":{
                                    this.blackbox.addEntry(this.clock, { entity:this, action:schedule.action, place:this.place });

                                    // Eating recovers a little
                                    this.recover(2);

                                    // Performs the action at place
                                    this.place.personPerformInteraction(this,schedule.action);

                                    scheduleDone=true;
                                    break;
                                }
                                // Sleeping is very relaxing and lowers stress
                                case "sleep":{
                                    this.sleep();

                                    scheduleDone=true;
                                    break;
                                }
                                // Work
                                case "work":{
                                    this.workAt(this.place);
                                    scheduleDone=true;
                                    break;
                                }
                                case "investigate":{
                                    this.investigate();

                                    scheduleDone=true;
                                    break;
                                }
                                case "decideVictim":{
                                    
                                    // Think of a suspicious person...
                                    let suspiciousPerson=this.getMostSuspicious("person","alive",true);

                                    if (suspiciousPerson) {

                                        // Shortly, when I'll meet you I'll try to murder you.
                                        this.willExecuteMurder("murderInstinct",suspiciousPerson.element,suspiciousPerson.reason,DAYS_DELAY_SHORT);

                                        this.blackbox.addEntry(this.clock, { entity:this, action:schedule.action, person:suspiciousPerson.element, reason:suspiciousPerson.reason });
                                        scheduleDone=true;

                                    } else {

                                        // Wait a little more...
                                        reschedule=true;
                                    }

                                    break;
                                }
                                case "murderPerson":{

                                    // Is the victim together with the murderer?
                                    if (this.place.isTherePerson(schedule.person)) {

                                        if (schedule.person.isAlive())
                                                
                                            // Murder him.
                                            this.murderPerson(schedule.person,schedule.reason);

                                        else {

                                            // Who killed him first? Maybe me?!

                                        }

                                        scheduleDone=true;

                                        // Disappear in the crowd...
                                        this.lowerAttention();

                                    } else reschedule=true;

                                    break;
                                }
                                case "becomeParanoid":{
                                    // Is someone suspecting of me?
                                    let
                                        suspiciousPerson=this.getMostSuspicious("person","alive",true),
                                        suspiciousPlace=this.getMostSuspicious("place");
                                    if (suspiciousPerson) {
                                        if (suspiciousPerson.suspect<4) {
                                            // There is someone suspicious... let's stay paranoid
                                            reschedule=true;
                                        } else {
                                            // Okay. I've to do something about the suspicious person...
                                            if (this.isGoodMoodWithPerson(suspiciousPerson.element)) {
                                                //  like menacing it.
                                                this.willExecuteMenace("paranoia",suspiciousPerson.element,suspiciousPerson.reason,DAYS_DELAY_MID);
                                            } else {
                                                //  ...or murdering it.
                                                this.willExecuteMurder("paranoia",suspiciousPerson.element,suspiciousPerson.reason,DAYS_DELAY_MID);
                                            }
                                            scheduleDone=true;
                                        }
                                    }
                                    
                                    if (suspiciousPlace) {
                                        if (suspiciousPlace.suspect<2) {
                                            // There is somewhere suspicious... let's stay paranoid
                                            reschedule=true;
                                        } else {
                                            // Okay. I've to do something about the suspicious place... like investigating there.
                                            this.willInvestigate("paranoia",suspiciousPlace.element,DAYS_DELAY_SHORT);
                                            scheduleDone=true;
                                        }
                                    }

                                    if (!suspiciousPerson && !suspiciousPlace) {
                                        // Everything seems OK... no worries.
                                        scheduleDone=true;
                                    }
                                    break;
                                }
                                case "menacePerson":{

                                    // Is the victim together with me?
                                    if (this.place.isTherePerson(schedule.person)) {

                                        if (schedule.person.isAlive()) {

                                            if (this.startMenacePerson(schedule.person,schedule.reason)) {

                                                // And that's all.
                                                scheduleDone=true;

                                            } else {

                                                // Wait a better time
                                                reschedule=true;

                                            }

                                        } else {

                                            // Uh-oh. It died! There is nothing I can do.
                                            scheduleDone=true;

                                        }

                                    } else {

                                        // Wait a better time
                                        reschedule=true;

                                    }

                                    break;

                                }
                                case "continueMenacePerson":{
                                                        
                                    // Is the victim together with me?
                                    if (this.place.isTherePerson(schedule.person)) {

                                        // ...and menace him
                                        this.menace(schedule.person);

                                        // If it's the last menace
                                        if (schedule.scheduledBy.times == 1)

                                            // End person menace
                                            this.endMenacePerson(schedule.person);

                                        // And that's all.
                                        scheduleDone=true;

                                    } else {

                                        // TODO: Where did it go?!
                                        scheduleDone=true;

                                        // Lower attention
                                        this.lowerAttention();

                                    }

                                    break;

                                }
                                default:{
                                    debugger;
                                }
                            }
                        
                        } else {
                            
                            // It's not interactive so it can't perform the schedule
                            this.cantPerformSchedule(schedule);

                            // Must reschedule...
                            reschedule=true;

                        }
                        
                        // Mark as done
                        if (schedule.scheduledBy) {
                            if (scheduleDone) {
                                if (schedule.scheduledBy.times) {
                                    schedule.scheduledBy.times--;
                                    if (!schedule.scheduledBy.times)
                                        schedule.scheduledBy.done=true;
                                }
                                delete schedule.scheduledBy;
                            }
                            if (reschedule)
                                delete schedule.scheduledBy;
                        }

                    });
                
                } else if (this.isInteractive()) {

                    // Nothing planned to do. Let's hang out somewhere...
                    this.hangOut();
                    
                }

                // --- "Idle" actions

                // If is conscious, judge other people
                if (this.isConscious()) {

                    // Apply bias on all persons...
                    // TODO: All of them?
                    let biasedPersons=this.place.getInteractivePersons(this);
                    biasedPersons.forEach(person=>{
                        // ...applies place biases
                        this.onBiasFor(
                            person,
                            (score)=>{
                                this.thinkIsGoodPerson(person);
                            },
                            0,
                            (score)=>{
                                this.thinkIsBadPerson(person);
                            }
                        );
                    })

                }

                // If it can interact, chitchat with people
                if (this.isInteractive()) {

                    // Chitchat with a friend in this place.
                    let friends=this.place.getFriendsForPerson(this);

                    if (friends.length) {

                        let friend=this.randomizer.element(friends);
                        this.chitChatWithPerson(friend);
                        friend.chitChatWithPerson(this);

                    }

                }

                // If it can interact, befriend with people
                if (this.isInteractive()) {

                    // May meet new interactive persons persons in this place.
                    let persons=this.place.getUnknownInteractivePersonsForPerson(this);

                    if (persons.length) {

                        let
                            person=this.randomizer.element(persons),
                            affinity=0;

                        // Same tastes in where to eat?
                        if (VAR.countSameElements(person.tags.breakfastAt,this.tags.breakfastAt,"place")) affinity++;
                        if (VAR.countSameElements(person.tags.lunchAt,this.tags.lunchAt,"place")) affinity++;
                        if (VAR.countSameElements(person.tags.dinnerAt,this.tags.dinnerAt,"place")) affinity++;

                        // May have the same friends?
                        if (VAR.countSameElements(person.tags.friends,this.tags.friends)) affinity++;

                        // It may be attractive?
                        if (this.isAttractedByPerson(person)) affinity++;

                        // Is it a good person?
                        if (this.isGoodPerson(person)) affinity++;

                        // Is it a bad person?
                        if (this.isBadPerson(person)) affinity--;

                        // If affinity is good, they become friends!
                        if (affinity>3) {
                            person.addFriend(this);
                            this.addFriend(person);
                        } else {
                            // Else eavesdrop some information...
                            this.eavesdropPerson(person);
                        }

                    }

                }

                // If it can interact, flirt with people
                if (this.isInteractive()) {

                    // Lower the lover relation. If it's over...
                    if (!this.lowerTag("loverDuration",1)) {

                        // If it wants to find a new love...
                        if (this.wantFindLove()) {

                            // If it's over let's find a lover.
                        
                            let partners=this.place.getNewLikedInteractivePersonsForPerson(this);

                            if (partners.length) {

                                // Choose one...
                                let partner=this.randomizer.element(partners);

                                // And try flirting...
                                this.flirtWithPerson(partner);

                            }

                        }

                    }

                }

            }

            // Natural death/faint conditions...
            if (this.isAlive()) {

                // If I'm not tied, I can unshock. I stay shocked if I can't move
                if (this.isAbleToMove() && this.isShocked())
                    this.unshock();

                // May a person faint due to unreleased stress? (being tied for too long, etc.)
                if (!this.isCollapsed() && (this.tags.stress>this.tags.stressThresholdFaint))
                    this.breakdownDueTo(this.getStressReasons());
                // If person is stressed, it may become paranoid
                else if (this.isStressed()) {
                    this.relax();
                    this.willBeParanoid("stress",DAYS_DELAY_SHORT);
                }

            }
        
        } else if (!this.isRemoved()) {


            if (this.isAlive() && this.isResting()) {

                // Rest...
                this.rest();

            }

            // Run the dispose timer, if any.
            if (this.tags.disposeTimer) {
                this.lowerTag("disposeTimer",1);
                if (!this.tags.disposeTimer)
                    this.dispose();
            }

        }

    }

}
