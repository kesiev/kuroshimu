function Place(data) {

    this.blackbox=new BlackBox(this);

    this.type="place";
    this.persons=[];
    this.workers=[];

    for (let k in data)
        this[k]=data[k];

    this.setRandomizer=(randomizer,journalistRandomizer)=>{
        this.randomizer=randomizer;
        this.journalistRandomizer=journalistRandomizer;
    }

    this.setTelemetry=(telemetry)=>{
        this.telemetry=telemetry;
    }

    // Tags management

    this.setTag=(k,v)=>{
        this.tags[k]=v;
    }

    this.raiseTag=(k,by)=>{
        if (!this.tags[k]) this.tags[k]=by;
        else this.tags[k]+=by;
        return this.tags[k];
    }

    this.addToTag=(k,v)=>{
        if (!this.tags[k]) this.tags[k]=[];
        VAR.pushNotRepeat(this.tags[k],v);
    }

    this.setClock=(clock)=>{
        this.clock=clock;
    }

    // Identifiers

    if (!this.tags.identifiers)
        this.tags.identifiers=[];

    let identifiersBag;

    this.addIdentifier=(id)=>{
        this.addToTag("identifiers",id);
    }

    this.getIdentifier=(unique)=>{
        return this.tags.identifiers&&this.tags.identifiers.length?unique?this.tags.identifiers[0]:identifiersBag.pick():this.id;
    }

    this.initializeEntity=()=>{
        // Name secluded rooms
        this.mapDestinations.forEach((place)=>{
            if (place.tags.isSecluded && place.tags.identifierSuffix) {
                this.tags.identifiers.forEach(identifier=>{
                    place.setTag("secludedIdentifier",place.tags.identifierSuffix);
                    place.addIdentifier(identifier+" "+place.tags.identifierSuffix);
                })
                place.initializeEntity();
            }
        });
        
        // Prepare name bags for the journalist
        identifiersBag=new Bag(this.tags.identifiers,this.journalistRandomizer);
    }

    // Hiring

    this.isHiring=()=>{
        return this.tags.isHiring;
    }

    this.setIsHiring=(v)=>{
        this.setTag("isHiring",v);
    }

    this.hirePerson=(person)=>{
        if (this.tags.isHiring) {
            this.blackbox.addEntry(this.clock,{ entity:this, action:"hirePerson", person:person});
            if (this.workers.indexOf(person) == -1) {
                person.setWorkPlace(this);
                this.workers.push(person);
                // Add work commitments
                person.addCommitment(
                    "workplace",
                    COMMITMENT.create(this,"workplace",SIMULATION_DATABASE.placeWorkLoops[this.tags.workloop],{
                        worker:person,
                        workplace:this
                    })
                );
            }
            return true;
        } else return false;
    }

    // Owning

    this.addOwner=(person)=>{
        this.addToTag("owners",person);
    }

    this.getAliveOwners=()=>{
        if (this.tags.owners)
            return this.tags.owners.filter(person=>{
                return person.isAlive();
            })
        else
            return [];
    }

    // Performing actions

    this.personPerformInteraction=(person,interaction)=>{

        this.raiseTag(interaction,1);
        person.blackbox.addEntry(person.clock,{ entity:this, action:"personPerformInteraction", interaction:interaction, place:this});
        this.blackbox.addEntry(this.clock,{ entity:this, action:"placePerformInteraction", interaction:interaction, person:person});

        switch (interaction) {
            case "work":{
                
                // Consumes some stats
                if (this.tags.workRequires) {
                    for (let i=0;i<3;i++) {
                        let stat=this.randomizer.element(this.tags.workRequires);
                        person.consumeStat(stat);
                    }
                }

                break;
            }
        }

        // Pay/gain money
        if (this.tags.interactionMoney) {
            let
                interactionMoney=this.tags.interactionMoney[interaction],
                cost=interactionMoney.amount,
                who;
            switch (interactionMoney.who) {
                case "performer":{
                    who=person;
                    break;
                }
                case "owner":{
                    // Pays one of the owners
                    let owners=this.getAliveOwners();
                    if (owners.length)
                        who=MONEY.getWhoPays(owners);
                    else
                        // Or the performer pays
                        who=person;
                    break;
                }
                default:{
                    debugger;
                }
            }
            if (cost>0)
                who.earnMoney(cost,this);
            else if (cost<0)
                who.payMoney(-cost,this);
        }
    }

    // Person movement

    this.enterPerson=(person)=>{
        this.blackbox.addEntry(this.clock,{ entity:this, action:"enterPerson", byPerson:person});
        this.persons.push(person);
    }

    this.leavePerson=(person)=>{
        this.blackbox.addEntry(this.clock,{ entity:this, action:"leavePerson", byPerson:person });
        
        let pos=this.persons.indexOf(person);
        if (pos!=-1) {
            this.persons.splice(pos,1);
        }
    }

    // Look for persons
    
    this.isTherePerson=(person)=>{
        return this.persons.indexOf(person) != -1;
    }

    this.getPersonsByTag=(tag,value)=>{
        return this.persons.filter(person=>{
            return person.tags[tag] == value
        });
    }

    this.getSuspiciousPersons=(forperson)=>{
        return this.persons.filter(person=>{
            return (
                (person!=forperson) && // Not the person itself...
                (!forperson.isLoverPerson(person)) && // Not its lover, since they're in hidden relation
                person.isSuspicious() // Is suspicious
            )
        });
    }

    this.getInteractivePersons=(exclude)=>{
        return this.persons.filter(person=>{
            return (
                (person!=exclude) && // Not the excluded person
                person.isInteractive() // Is interactive
            )
        });
    }

    this.getSuspectedPersonsForPerson=(person)=>{
        return this.persons.filter(inperson=>{
            return (
                person.getSuspectOf(inperson) && // Is in person's suspects list
                person.isAlive() // Is alive, in any state
            )
        });
    }

    this.getPersonsThatRecognizesPerson=(forperson,exclude)=>{
        return this.persons.filter(person=>{
            return (
                (person!=forperson) && // Not themselves
                (person!=exclude) && // Not the excluded one
                person.isRecognizingPerson(forperson)
            )
        });
    }

    this.getFriendsForPerson=(forperson,exclude)=>{
        return this.persons.filter(person=>{
            return (
                (person!=exclude) && // Not the excluded one
                (person!=forperson) && // Not themselves
                person.isInteractive() && // Is interactive
                forperson.isFriendPerson(person) // Recognize person
            )
        });
    }

    this.getUnknownInteractivePersonsForPerson=(forperson,exclude)=>{
        return this.persons.filter(person=>{
            return (
                (person!=exclude) && // Not the excluded one
                (person!=forperson) && // Not themselves
                person.isInteractive() && // Is interactive
                !forperson.isRecognizingPerson(person) // Don't recognize person
            )
        });
    }

    this.getNewLikedInteractivePersonsForPerson=(person)=>{
        return this.persons.filter(liked=>{
            return (liked !== person) && // The liked is not themselves...
                liked.isInteractive() && // Is interactive...
                !person.isSpecialOnePerson(liked) && // Is not already a special one...
                person.isLikingPerson(liked) // The person likes the other one...
        });

    }

    // Look for rooms

    this.getAvailableSecludedPlaces=()=>{
        return this.mapDestinations.filter(place=>{
            return (place.tags.isSecluded && (place.persons.length==0))
        });
    }

    this.getAllSecludedPlaces=()=>{
        return this.mapDestinations.filter(place=>{
            return place.tags.isSecluded
        });
    }

}
