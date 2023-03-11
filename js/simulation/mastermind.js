function Mastermind(prefix,game) {

    const
        DAYMSEC=1000*60*60*24;
        
    let
        todaySeed,
        initialized,
        finalized,
        iterated,
        currentIteration,
        currentSeed,
        availableIterations=[],
        simulation,
        world,
        telemetry,
        article,
        persons,
        places,
        biasesModels,
        finalizedData;

    let QUESTIONNAIRE={
        newQuestion:function() {
            let div=document.createElement("div");
            div.className="question";
            this.root.appendChild(div);
            return div;
        },
        addNote:function(note) {
            let div=document.createElement("div");
            div.className="note";
            this.root.appendChild(div);
            div.innerHTML=note;
            return div;
        },
        addTitle:function(text) {
            let h=document.createElement("h2");
            h.innerHTML=text;
            this.root.appendChild(h);
            return h;
        },
        addText:function(node,text) {
            let span=document.createElement("span");
            span.innerHTML=text;
            node.appendChild(span);
            return span;
        },
        addInput:function(node) {
            let input=document.createElement("input");
            input.placeholder="Type...";
            node.appendChild(input);
            return input;
        },
        addSelect:function(node) {
            let select=document.createElement("select");
            node.appendChild(select);
            return select;
        },
        addOptionSeparator:function(node,label) {
            let option=document.createElement("option");
            option.innerHTML=label;
            option.setAttribute("disabled","disabled");
            node.appendChild(option);
            return option;
        },
        addOption:function(node,label,value,selected) {
            let option=document.createElement("option");
            option.innerHTML=label;
            option.value=value;
            if (selected) option.setAttribute("selected","selected");
            node.appendChild(option);
            return option;
        },
        addButton:function(node,label,onclick) {
            let input=document.createElement("input");
            input.value=label;
            input.type="button";
            input.className="actionbutton";
            input.onclick=onclick;
            node.appendChild(input);
            return input;
        }
    };

    let addCampaignListItems=(id,list)=>{
        if (game) {
            let result=game.campaign.triggerEvent("onGetCombo",id);
            if (result.items)
                result.items.forEach(item=>{
                    list.push(item);
                });
        }
        return list;
    }

    let getSelectedValue=(list,row,id)=>{
        let selectedValue=0;

        list.forEach(element=>{
            if (element.id == row[id])
                selectedValue=element.id;
        });

        if (!selectedValue) {
            selectedValue=list[0].id;
            row[id]=selectedValue;
        }

        return selectedValue;
    }
    
    let getComboItems=(element)=>{
        let list=[];
        element.options.forEach(option=>{
            switch (option.ids) {
                case "facts":{
                    for (let k in FACTS_DATABASE) {
                        let fact=FACTS_DATABASE[k];
                        if (fact.question)
                            list.push({id:k,label:fact.question.label});
                    }
                    addCampaignListItems(option.ids,list);
                    list.sort((a,b)=>{
                        if (a.label<b.label) return -1;
                        else if (a.label>b.label) return 1;
                        else return 0;
                    })      
                    break;
                }
                case "biasesModels":{
                    biasesModels.forEach(bias=>{
                        list.push({id:bias.id,label:bias.uniqueIdentifier});
                    });
                    addCampaignListItems(option.ids,list);
                    list.sort((a,b)=>{
                        if (a.label<b.label) return -1;
                        else if (a.label>b.label) return 1;
                        else return 0;
                    })
                    break;
                }
                case "reasons":{
                    for (let k in REASONS_DATABASE)
                        if (REASONS_DATABASE[k].label) {
                            let reason=REASONS_DATABASE[k];
                            list.push({id:k,label:reason.label,category:reason.category,priority:reason.priority});
                        }
                    addCampaignListItems(option.ids,list);
                    list.sort((a,b)=>{
                        if (a.category<b.category) return -1;
                        else if (a.category>b.category) return 1;
                        if (a.priority<b.priority) return -1;
                        else if (a.priority>b.priority) return 1;
                        else if (a.label<b.label) return -1;
                        else if (a.label>b.label) return 1;
                        else return 0;
                    })
                    break;
                }
                default:{
                    list.push(option);
                    addCampaignListItems(option.ids,list);
                }
            }
        });
        return list;
    }

    let addPlaceSelector=(answers,question,buildingid,placeid,row,updatefn,rowid)=>{
        let
            selectedValue=0,
            list=[],
            buildingselect=QUESTIONNAIRE.addSelect(question),
            placeselect=QUESTIONNAIRE.addSelect(question);

        // Building

        places.forEach(place=>{
            if (!place.tags.typeHome && !place.tags.isSecluded)
                list.push({id:place.id,label:place.getIdentifier(true)});
        });
        persons.forEach(person=>{
            list.push({id:"homeOf:"+person.id,label:LANGUAGE.addOwn(person.id)+" house"});
        });
        addCampaignListItems("places",list);

        selectedValue=getSelectedValue(list,row,buildingid);

        list.forEach(element=>{
            QUESTIONNAIRE.addOption(buildingselect,element.label,element.id,element.id==selectedValue);
        });
        buildingselect.onchange=()=>{
            row[buildingid]=buildingselect.value;
            row[placeid]=0;
            updatefn(answers,rowid);
        }

        // Place
        let place;
        if (row[buildingid].startsWith("fake:")) {

            // Keep the fake place
            row[placeid]=row[buildingid];
            QUESTIONNAIRE.addOption(placeselect,"...?",row[buildingid],true);

        } else {

            if (row[buildingid].startsWith("homeOf:")) {
                let person=world.persons[row[buildingid].substr(7)];
                if (person && person.tags.home)
                    place=person.tags.home;
            } else
                place=world.places[row[buildingid]];
            
            row[placeid]=row[placeid]||place.id;

            list=[
                {id:place.id, label:"building"}
            ];
            place.mapDestinations.forEach(destination=>{
                if (destination.tags.isSecluded)
                    list.push({id:destination.id,label:destination.tags.secludedIdentifier});
            });

            selectedValue=getSelectedValue(list,row,placeid);

            list.forEach(element=>{
                QUESTIONNAIRE.addOption(placeselect,element.label,element.id,element.id==selectedValue);
            });

        }

        placeselect.onchange=()=>{
            row[placeid]=placeselect.value;
            updatefn(answers,rowid);
        }
       
    }

    let addEntitySelector=(answers,question,entityid,row,updatefn,rowid,exclude)=>{
        let
            list=[],
            selectedValue=0,
            entityselect=QUESTIONNAIRE.addSelect(question);

        persons.forEach(person=>{
            let value=person.id;
            if (value!=exclude) {
                list.push({id:value,label:value});
                return true;
            }
        });
        addCampaignListItems("entities",list);

        selectedValue=getSelectedValue(list,row,entityid);
        
        list.forEach(element=>{
            QUESTIONNAIRE.addOption(entityselect,element.label,element.id,element.id==selectedValue);
        });

        entityselect.onchange=()=>{
            row[entityid]=entityselect.value;
            updatefn(answers,rowid);
        }
    }

    let addTimeSelector=(answers,question,dayid,timeid,row,updatefn,rowid)=>{
        let
            dayselect=QUESTIONNAIRE.addSelect(question),
            timeselect=QUESTIONNAIRE.addSelect(question);

        for (let i=0;i<SIMULATION_LENGTH_DAYS;i++)
            QUESTIONNAIRE.addOption(dayselect,"@"+i,i,i==row[dayid]);
        Clock.DAY.forEach((time,id)=>{
            QUESTIONNAIRE.addOption(timeselect,time,id,id==row[timeid]);
        })
        dayselect.onchange=()=>{
            row[dayid]=dayselect.value;
            updatefn(answers,rowid);
        }
        timeselect.onchange=()=>{
            row[timeid]=timeselect.value;
            updatefn(answers,rowid);
        }
    }

    let addElement=(answers,question,element,row,newrow,updatefn,rowid)=>{
        let show=true;
        if (element.if) {
            for (let k in element.if)
                if (element.if[k].indexOf(newrow[k])==-1)
                    show=false;
        }
        if (show)
            switch (element.type) {
                case "person":{
                    newrow[element.id]=row[element.id];
                    addEntitySelector(answers,question,element.id,newrow,updatefn,rowid,element.excludeEntity?newrow.entity:0);
                    break;
                }
                case "place":{
                    let buildingId=element.id+"Building";
                    newrow[buildingId]=row[buildingId]||"homeOf:anne";
                    newrow[element.id]=row[element.id];
                    addPlaceSelector(answers,question,buildingId,element.id,newrow,updatefn,rowid);
                    break;
                }
                case "select":{
                    newrow[element.id]=row[element.id];
                    let
                        firstValue=0,
                        selectedValue,
                        select=QUESTIONNAIRE.addSelect(question),
                        items=getComboItems(element),
                        hasCategory=items[0].category,
                        lastCategory=0;
                    items.forEach(item=>{
                        if (!firstValue && item.id)
                            firstValue=item.id;
                        if (item.id==newrow[element.id])
                            selectedValue=item.id;
                    })
                    if (selectedValue === undefined) {
                        selectedValue=firstValue;
                        newrow[element.id]=selectedValue;
                    }
                    items.forEach(item=>{
                        if (hasCategory && (lastCategory!=item.category)) {
                            QUESTIONNAIRE.addOptionSeparator(select,"-- "+item.category);
                            lastCategory=item.category;
                        }
                        QUESTIONNAIRE.addOption(select,item.label,item.id,selectedValue==item.id);
                    })
                    select.onchange=()=>{
                        newrow[element.id]=select.value;
                        updatefn(answers,rowid);
                    }
                    break;
                }
                case "input":{
                    newrow[element.id]=row[element.id]||"";
                    let input=QUESTIONNAIRE.addInput(question);
                    input.value=newrow[element.id];
                    input.onchange=()=>{
                        newrow[element.id]=input.value;
                    }
                    break;
                }
                case "text":{
                    QUESTIONNAIRE.addText(question,element.text);
                    break;
                }
            }
    }

    let updateAboutSimRow=(answers,rowid)=>{
        let
            row=answers.aboutsim[rowid],
            question=row.question,
            newrow={
                question:row.question,
                atDay:row.atDay,
                atTime:row.atTime,
                entity:row.entity,
                fact:row.fact
            };
        question.innerHTML="";
        
        // Time, place, and entity is always asked
        QUESTIONNAIRE.addText(question,"At ");
        addTimeSelector(answers,question,"atDay","atTime",newrow,updateAboutSimRow,rowid);
        QUESTIONNAIRE.addText(question," entity ");
        addEntitySelector(answers,question,"entity",newrow,updateAboutSimRow,rowid);

        // Prepare the fact selector
        let
            factselect=QUESTIONNAIRE.addSelect(question),
            factlist=getComboItems({options:[{ids:"facts"}]});
        QUESTIONNAIRE.addOption(factselect,"(What happened?)","",!newrow.fact);
        factlist.forEach(fact=>{
            QUESTIONNAIRE.addOption(factselect,fact.label,fact.id,fact.id==newrow.fact);
        })
        factselect.onchange=()=>{
            answers.aboutsim[rowid].fact=factselect.value;
            updateAboutSimRow(answers,rowid);
        }

        // Show the fact UI
        let selectedFact=FACTS_DATABASE[newrow.fact];
        if (selectedFact && selectedFact.question) {
            selectedFact.question.structure.forEach(element=>{
                addElement(answers,question,element,row,newrow,updateAboutSimRow,rowid)
            })
        }
        answers.aboutsim[rowid]=newrow;
    }

    let updateAboutEntityRow=(answers,rowid)=>{
        let
            row=answers.aboutentities[rowid],
            question=row.question,
            done=row.done||[],
            newrow={
                entity:row.entity,
                question:row.question,
                done:done
            };
        question.innerHTML="";

        QUESTIONNAIRE.addText(question,"<b>"+rowid+"</b> ");

        done.forEach((answer,id)=>{
            let selectedFact=QUESTIONS_DATABASE[answer];
            if (selectedFact) {
                let factselect=QUESTIONNAIRE.addSelect(question);
                QUESTIONNAIRE.addOption(factselect,selectedFact.label);
                QUESTIONNAIRE.addOption(factselect,"(I don't know!)",1);
                factselect.onchange=()=>{
                    if (factselect.value)
                        answers.aboutentities[rowid].done.splice(id,1);
                    updateAboutEntityRow(answers,rowid);
                }
                selectedFact.question.structure.forEach(element=>{
                    addElement(answers,question,element,row,newrow,updateAboutEntityRow,rowid)
                })
            }
            if (id!=QUESTIONS_DATABASE.length-1)
                QUESTIONNAIRE.addText(question," , ");
        })
        
        if (done.length<QUESTIONS_DATABASE.length) {
            // Prepare the answer selector
            let
                factselect=QUESTIONNAIRE.addSelect(question);
            QUESTIONNAIRE.addOption(factselect,"(Who is it?)",-1);
            QUESTIONS_DATABASE.forEach((question,id)=>{
                if (done.indexOf(id)==-1)
                    QUESTIONNAIRE.addOption(factselect,question.label,id);
            })
            factselect.onchange=()=>{
                answers.aboutentities[rowid].done.push(factselect.value*1);
                updateAboutEntityRow(answers,rowid);
            }
        }

        answers.aboutentities[rowid]=newrow;
    }

    let describePerson=(person)=>{
        let
            sentence="Entity "+person.id+" ",
            score=0;
        QUESTIONS_DATABASE.forEach((question,id)=>{
            sentence+=question.label+" ";
            question.question.structure.forEach(element=>{
                switch (element.type) {
                    case "text":{
                        sentence+=element.text;
                        break;
                    }
                    case "place":{
                        if (person.tags[element.id]) {
                            sentence+=person.tags[element.id].getIdentifier(true)+" ";
                            score+=QUESTIONNAIRE_SCORE_RIGHT;
                        }
                        break;
                    }
                    case "person":{
                        if (person.tags[element.id]) {
                            sentence+=person.tags[element.id].id+" ";
                            score+=QUESTIONNAIRE_SCORE_RIGHT;
                        }
                        break;
                    }
                    case "input":{
                        sentence+=person.tags[element.id]+" ";
                        score+=QUESTIONNAIRE_SCORE_RIGHT;
                        break;
                    }
                    case "select":{
                        let
                            addscore=true,
                            options=getComboItems(element),
                            value=person.tags[element.id];
                        if (element.asTagInId)
                            if (value.length==0)
                                sentence+="none ";
                            else
                                sentence+="["+value.map(element=>element.uniqueIdentifier).join(", ")+"] ";
                        else {
                            let skipcheck,added;
                            if (element.asTagId)
                                value=value.id;
                            options.forEach(option=>{
                                let found=false;
                                if (option.skipCheck)
                                    skipcheck=option;
                                if (option.asId) {
                                    let subvalue=person.tags[option.asId];
                                    if (option.isFalse)
                                        found=!subvalue;
                                    else
                                        found=subvalue.id==value;
                                } else found=option.id==value;
                                if (found) {
                                    added=true;
                                    sentence+=option.label+" ";
                                }
                            });
                            if (!added&&skipcheck) {
                                addscore=false;
                                sentence+=skipcheck.label+" ";
                            }
                        }
                        if (addscore)
                            score+=QUESTIONNAIRE_SCORE_RIGHT;
                        break;
                    }
                }
            })
            sentence+=", ";
        });
        sentence=sentence.replace(/ , /g,", ").replace(/, $/,"");
        return {
            sentence:sentence,
            score:score
        }
    }

    let describeFact=(person,entry)=>{
        let
            factmodel=FACTS_DATABASE[entry.fact.action],
            sentence,
            score=0,
            priority=-1,
            malus=0;

        if (entry.at)
            sentence="At @"+entry.at.day+" "+Clock.DAY[entry.at.time]+" ";
        else
            sentence="At simulation start";

        if (factmodel.question) {
            score+=QUESTIONNAIRE_FACT_SCORE_BASE;
            sentence+="entity "+person.id+" "+factmodel.question.label+" ";
            malus=entry.evidences?entry.evidences*2:0;
            factmodel.question.structure.forEach(element=>{
                switch (element.type) {
                    case "text":{
                        sentence+=element.text;
                        break;
                    }
                    case "place":{
                        if (entry.fact[element.id])
                            sentence+=entry.fact[element.id].getIdentifier(true);
                        else
                            sentence+="none";
                        score+=QUESTIONNAIRE_SCORE_RIGHT;
                        break;
                    }
                    case "person":{
                        if (entry.fact[element.id])
                            sentence+=entry.fact[element.id].id;
                        else
                            sentence+="none";
                        score+=QUESTIONNAIRE_SCORE_RIGHT;
                        break;
                    }
                    case "select":{
                        let options=getComboItems(element);
                        if (element.findInto) {
                            sentence+="["+entry.fact[element.id].map(element=>{
                                let found="";
                                options.forEach(option=>{
                                    if (option.id==element)
                                        found=option.label;
                                });
                                if (!found) debugger;
                                return found;
                            }).join(", ")+"]";
                        } else
                            sentence+=entry.fact[element.id];
                        score+=QUESTIONNAIRE_SCORE_RIGHT;
                        break;
                    }
                }
            });
            sentence=sentence.replace(/  /g," ").replace(/ : /g,": ");
        } else {
            let fact=logFact(entry.fact);
            priority=fact.priority;
            sentence+=fact.sentence;
        }

        return {
            priority:priority,
            sentence:sentence,
            malus:malus,
            score:score
        }
    }

    let logEntity=(entity)=>{
        if (entity !== undefined) {
            let constructor=entity.constructor.name;
            switch (constructor) {
                case "Array":{
                    return "List("+entity.join(",")+")";
                }
                case "String":
                case "Number":{
                    return entity;
                }
                default:{
                    return constructor+"("+(entity.id||"?")+(entity.tags&&entity.tags.identifiers?":"+entity.tags.identifiers[0]:"")+")"
                }
            }
        } else
            return "?";
    }

    let logTime=(time)=>{
        return time?"@"+time.day+":"+time.time:"@?";
    }

    let logDestination=(destination)=>{
        let out="at "+logEntity(destination.place)+" ";
        if (destination.whenThereIsPerson)
            out+="when there is "+logEntity(destination.whenThereIsPerson)+" ";
        return out.trim();
    }

    let logTestimony=(fulltestimony,person)=>{
        
        let
            testimony=fulltestimony.testimony;
            out="at "+logTime(testimony.at)+" "+(person?logEntity(person):"I")+" ",
            instruction=TESTIMONIES_DATABASE[testimony.action];

        if (instruction && (instruction.log !== undefined)) {
            let context={
                testimony:testimony
            };
            out+=instruction.log.replace(/\{([^}]+)\}/g,(m,m1)=>{
                let placeholders=m1.split(":");
                switch (placeholders[0]) {
                    case "if":{
                        if (VAR.getPlaceholderData(placeholders[1],context))
                            return placeholders[2];
                        else
                            return "";
                        break;
                    }
                    default:{
                        return logEntity(VAR.getPlaceholderData(placeholders[0],context));
                    }
                }
            })
            
        } else debugger;

        return out;
    }

    let logFact=(fact)=>{
        let
            out="",
            priority=0,
            factmodel=FACTS_DATABASE[fact.action];
        if (factmodel) {
            let context={
                fact:fact
            };
            priority=factmodel.priority||0;
            out+=factmodel.log.replace(/\{([^}]+)\}/g,(m,m1)=>{
                let placeholders=m1.split(":");
                switch (placeholders[0]) {
                    case "if":{
                        if (VAR.getPlaceholderData(placeholders[1],context))
                            return placeholders[2];
                        else
                            return "";
                        break;
                    }
                    case "testimony":{
                        return logTestimony(
                            VAR.getPlaceholderData(placeholders[1],context),
                            placeholders[2]?VAR.getPlaceholderData(placeholders[2],context):0
                        );
                        break;
                    }
                    case "time":{
                        return logTime(
                            VAR.getPlaceholderData(placeholders[1],context)
                        );
                        break;
                    }
                    case "fact":{
                        let subfact=VAR.getPlaceholderData(placeholders[1],context);
                        return logFact(subfact).sentence;
                        break;
                    }
                    case "destination":{
                        return logDestination(
                            VAR.getPlaceholderData(placeholders[1],context)
                        );
                        break;
                    }
                    case "conjugate":{
                        let
                            qty=1,
                            data=VAR.getPlaceholderData(placeholders[2],context);
                        if ((typeof data == "object") && data.length) {
                            qty=data.length;
                            data=data[0];
                        }
                        return LANGUAGE.solveConjugate(placeholders[1],qty,data);
                        break;
                    }
                    default:{
                        if (placeholders.length>1) debugger;
                        return logEntity(VAR.getPlaceholderData(placeholders[0],context));
                    }
                }

            })
        } else debugger;
        return {
            sentence:out,
            priority:priority
        };
    }

    let initialize=()=>{

        if (!initialized) {

            initialized=true;

            console.log("Running iteration "+currentIteration);

            let
                simulationRandomizer=new Randomizer(currentSeed),
                journalistRandomizer=new Randomizer(currentSeed);

            // Reset database bags
            SIMULATION_DATABASE.personBiases.forEach(bias=>{
                resetRandomizer(bias,"identifiers",journalistRandomizer);
            });

            for (let k in TESTIMONIES_DATABASE) {
                let testimony=TESTIMONIES_DATABASE[k];
                if (testimony.article) {
                    resetRandomizer(testimony.article,"titles",journalistRandomizer);
                    testimony.article.sentences.forEach(sentence=>{
                        sentence.versions.forEach(version=>{
                            version.forEach(line=>{
                                resetRandomizer(line,"text",journalistRandomizer);
                            })
                        })
                    })
                }
                if (testimony.topicSummary)
                    for (let k in testimony.topicSummary)
                        if (k == "onContext") {
                            for (let j in testimony.topicSummary[k])
                                resetRandomizer(testimony.topicSummary[k],j,journalistRandomizer);
                        } else resetRandomizer(testimony.topicSummary,k,journalistRandomizer);
            }

            for (let k in TITLES_DATABASE)
                resetRandomizer(TITLES_DATABASE[k],"titles",journalistRandomizer);

            resetRandomizer(COLUMN_DATABASE,"titles",journalistRandomizer);
            COLUMN_DATABASE.columns.forEach(column=>{
                resetRandomizer(column,"titles",journalistRandomizer);
            });

            // Create world  
            
            world=new World(simulationRandomizer,journalistRandomizer);

            // Select global places

            let placesModels=[];
            SIMULATION_DATABASE.places.forEach(set=>{
                let place=VAR.clone(simulationRandomizer.element(set.places));
                if (set.defaultTags)
                    for (let k in set.defaultTags)
                        if (place.tags[k]===undefined)
                            place.tags[k]=set.defaultTags[k];
                placesModels.push(place);
            })
            simulationRandomizer.shuffle(placesModels);

            // Select global persons

            let personModels=VAR.cloneList(SIMULATION_DATABASE.persons);
            simulationRandomizer.shuffle(personModels);

            // Select hiring places. Less than the persons so there is at least one colleague.

            let
                hiringPlaces=[],
                hiringPlacesBag=new Bag(placesModels,simulationRandomizer);
            for (let i=0;i<personModels.length-1;i++)
                hiringPlaces.push(hiringPlacesBag.pick());

            // Select global biases

            let allBiasesBag=new Bag(SIMULATION_DATABASE.personBiases,simulationRandomizer);
            biasesModels=[];
                
            for (let i=0;i<SIMULATION_BIASES;i++)
                if (!allBiasesBag.isEmpty())
                    biasesModels.push(allBiasesBag.pick());

            // Generate places

            placesModels.forEach((placeData)=>{
                let place=new Place(VAR.clone(placeData));
                world.addPlace(place);
                if (hiringPlaces.indexOf(placeData)!=-1)
                    place.setIsHiring(true);
            });

            // Generate persons

            let
                featuresBag=new Bag(SIMULATION_DATABASE.personFeatures,simulationRandomizer),
                namesBag={
                    "A":new Bag(NAMES_DATABASE.name.male,simulationRandomizer),
                    "B":new Bag(NAMES_DATABASE.name.female,simulationRandomizer)
                },
                surnamesBag=new Bag(NAMES_DATABASE.surname,simulationRandomizer);

            personModels.forEach((personData,id)=>{
                
                let
                    person=new Person(VAR.clone(personData)),
                    home=0;
                
                // Initialize
                if (!person.tags.gender)
                    person.setTag("gender",simulationRandomizer.element(SIMULATION_DATABASE.personGenders));
                person.setTag("stressThresholdFaint",THRESHOLD_STRESS_FAINT);
                person.setTag("lives",THRESHOLD_LIVES);
                person.setTag("conscious",true);
                person.setTag("alive",true);
                person.setTag("attractedBy",simulationRandomizer.elementProbabilityMap(SIMULATION_DATABASE.personAttractions).forGender[person.tags.gender] );
                person.setTag("feature",featuresBag.pick());
                person.setTag("knownBiases",biasesModels);
                person.setTag("canRecover",SIMULATION_DATABASE.personStats);
                person.setTag("flirtStats",SIMULATION_DATABASE.personFlirtStats);
                person.setTag("isGenderNeutral",simulationRandomizer.boolean(0.3));
                person.setName(namesBag[person.tags.gender].pick());
                person.setSurname(surnamesBag.pick());

                // Add to the world
                world.addPerson(person);

                // Add person stats
                for (let i=0;i<SIMULATION_DATABASE.personStatPoints;i++)
                    person.raiseTag(simulationRandomizer.element(SIMULATION_DATABASE.personStats),1);

                // Give person some money
                person.earnMoney(MONEY_START);

                // Is there anyone it may marry?
                let marriables=world.getMarriablePersons(person);
                if (marriables.length) {

                    let partner=simulationRandomizer.element(marriables);

                    // Marry them!
                    person.marry(partner);
                    partner.marry(person);

                    // They live together
                    home = partner.tags.home;

                }

                // Set home
                if (!home)
                    home=new Place({ id:person.id+"Home", tags:{ typeHome:true, homeOf:person,interactionMoney:{
                        sleep:{who:"owner", amount:-1}, // As simulated rent
                        lunch:{who:"owner", amount:-1},
                        breakfast:{who:"owner", amount:-1},
                        dinner:{who:"owner", amount:-1},
                        rest:{who:"owner",amount:-1}
                    }, secludedPlaces:VAR.cloneList(SIMULATION_DATABASE.placeHomeSecludedPlaces) } });
                world.addPlace(home);
                home.addOwner(person);
                person.setHomePlace(home);
                person.hurryTo(home);

                // Set basic commitments
                person.addCommitment(0,COMMITMENT.create(person,"basic",SIMULATION_DATABASE.personDefaultCommitments,{
                    me:person
                }))

                // Some people may like to have breakfast somewhere around...
                if (simulationRandomizer.boolean(0.4))
                    person.addDestinationPlace("breakfastAt",simulationRandomizer.element(world.getPlacesByTag("placeToBreakfast",true)));
                // or at home.
                else
                    person.addDestinationPlace("breakfastAt",home);

                // Likes to have lunch at home or around...
                person.addDestinationPlace("lunchAt",home);
                person.addDestinationPlace("lunchAt",simulationRandomizer.element(world.getPlacesByTag("placeToLunch",true)));

                // Likes to have dinner home or around...
                person.addDestinationPlace("dinnerAt",home);
                person.addDestinationPlace("dinnerAt",simulationRandomizer.element(world.getPlacesByTag("placeToDinner",true)));

                // Likes to sleep at home
                person.addDestinationPlace("sleepAt",home);
                // Some people may like to sleep somewhere too...
                if (simulationRandomizer.boolean(0.4))
                    person.addDestinationPlace("sleepAt",simulationRandomizer.element(world.getPlacesByTag("placeToSleep",true)));

                // Set workplace. Prefer places with less hired people.
                let
                    workplaces=world.getPlacesByTag("workplace",true),
                    hiringPlace=0;
                simulationRandomizer.shuffle(workplaces);
                workplaces.forEach(workplace=>{
                    if (workplace.isHiring() && (!hiringPlace || (workplace.workers.length<hiringPlace.workers.length)))
                        hiringPlace=workplace;
                });
                hiringPlace.hirePerson(person);

            });

            // Apply biases

            let
                biasesBag=new Bag(biasesModels,simulationRandomizer),
                biasesCount=SIMULATION_MINBIAS+simulationRandomizer.integer(SIMULATION_MAXBIAS-SIMULATION_MINBIAS+1);
            if (biasesCount) {
                let persons=world.getPersonList();
                simulationRandomizer.shuffle(persons);
                for (let i=0;i<biasesCount;i++) {
                    let bias=biasesBag.pick();
                    persons[i].addBias(bias);
                }
            }

            // Link places

            let placed=[];
            for (let k in world.places) {
                // Don't join secluded places
                let place=world.places[k];
                if (!place.tags.isSecluded) {
                    if (placed.length) {
                        let destination=simulationRandomizer.element(placed);
                        world.linkPlaces(place,destination);
                    }
                    placed.push(place);
                }
            }

            // Prepare the simulation

            telemetry=new Telemetry();
            simulation=new Simulation(world,telemetry,simulationRandomizer);

            // Initialize all persons

            persons=world.getSortedPersonList();
            persons.forEach(person=>{
                person.initializeEntity();
            });

            // Initialize all places

            places=world.getSortedPlaces();
            let
                normalPlaces=world.getPlacesByTag("isSecluded");
            normalPlaces.forEach(place=>{
                place.initializeEntity();
            });

            // Create the simulation initialization report

            let sentences=[];
            article=[
                {model:"dashedTitle",text:"Welcome Iteration "+currentIteration+" Entities!"}
            ];
            persons.forEach(person=>{
                let line="Hi {bold}"+person.id+",{endbold} you're ";
                line+=journalistRandomizer.element(person.tags.feature.identifiers);
                if (person.tags.workplace)
                    line+=" with a job at "+person.tags.workplace.getIdentifier();
                sentences.push(line+".");
            });
            sentences.push("You've {bold}"+SIMULATION_LENGTH_DAYS+" days left{endbold} to live... Try not to die!");
            article.push({
                model:"body",
                text:"\""+sentences.join(" ")+"\" - "+SIMULATION_JOURNAL_SIGN
            });

            // Locks the randomizer so is not used by the simulation
            journalistRandomizer.lock();

            // Let's tell a little lie...
            world.journalist.lie(DAYS_DELAYFIRSTMURDER);

        }

    }

    let resetRandomizer=(node,key,randomizer)=>{
        if (node[key])
            if (node[key].isBag)
                node[key].setRandomizer(randomizer);
            else
                node[key]=new Bag(node[key],randomizer);
    }

    let generateIterationId=(seed)=>{
        return "#"+GAME_VERSION+"-"+seed;
    }

    // Initialization

    if (!prefix) prefix="";

    let tmpdate = new Date(); 
    todaySeed=Math.floor(tmpdate.getTime()/DAYMSEC);

    for (let i=0;i<MASTERMIND_PAST_LIMIT;i++)
        availableIterations.push(generateIterationId(todaySeed-i));

    // Public

    this.resetSimulation=()=>{
        initialized=false;
        finalized=false;
        iterated=false;
        simulation=0;
        world=0;
        telemetry=0;
        article=0;
        persons=0;
        places=0;
        biasesModels=0;
        finalizedData=0;
    }

    this.getTodayIterationId=()=>{
        return generateIterationId(todaySeed);
    }

    this.getAvailableIterationsIds=()=>{
        return availableIterations;
    }

    this.getIterationId=()=>{
        return currentIteration;
    }

    this.getIterationFileId=()=>{
        return currentIteration.substr(1,currentIteration.length);
    }

    this.setIterationId=(iteration,force)=>{
        if (force || availableIterations.indexOf(iteration)!=-1) {
            let
                pcs=iteration.split("-"),
                seed=pcs[1]*1;
            if (seed!=currentSeed) {
                this.resetSimulation();
                currentSeed=seed;
                currentIteration=iteration;
            }
            return true;
        } else return false;
    }

    this.setTodayIterationId=()=>{
        return this.setIterationId(this.getTodayIterationId());
    }

    // Get status

    this.isFinalized=()=>{
        return !!finalizedData;
    }

    this.isIterated=()=>{
        return iterated;
    }

    // Execution

    this.iterate=()=>{

        if (iterated) {
            return true;
        } else {

            initialize();

            if (simulation.getTime().day < SIMULATION_LENGTH_DAYS) {
                simulation.pass();
                iterated=false;
            } else iterated=true;

            return iterated;
        
        }
            
    }

    this.finalize=(cb)=>{
        if (finalized) {
            cb(finalizedData);
        } else {

            const template=new SVGTemplate(prefix+"svg/model.svg",true);
            template.load(()=>{

                // Prepares the journal

                let
                    svg=new SVG(template),
                    paperPrinter=new PaperPrinter(svg),
                    charts=[];

                persons.forEach((person)=>{
                    let data=telemetry.createPlotForDataset(person,["stress"],{},true);
                    charts.push({
                        labels:data.labels,
                        dataset:data.datasets[0]
                    });
                })

                // console.log("charts",charts);
                
                world.journalist.close();
                let print=world.journalist.getPrint();

                print.forEach(line=>article.push(line));
                paperPrinter.print({
                    article:article,
                    charts:charts
                });

                svg.finalize();

                // Log scoring questions

                let factLogs="";
                persons.forEach(person=>{

                    let description=describePerson(person);
                    factLogs+="<div class='head'><span class='points'>"+description.score+"pts.</span> "+description.sentence+"</div>";

                    person.blackbox.entries.forEach(entry=>{
                        if (FACTS_DATABASE[entry.fact.action] && FACTS_DATABASE[entry.fact.action].question) {
                            let description=describeFact(person,entry);
                            factLogs+="<div class='line'><span class='points'>"+description.score+"pts.</span> "+(description.malus?"<span class='points malus'>-"+description.malus+"pts</span> ":"")+description.sentence+"</div>";
                        }
                    })
                });

                // End
                finalized=true;
                finalizedData={
                    journalSvg:svg,
                    factLogs:factLogs,
                    print:print
                };

                cb(finalizedData);
            });
        }
    }

    // Assets generation

    this.log=()=>{
        console.log("Simulation",simulation);
        console.log("World",world);
    }

    this.downloadJournalPdf=()=>{
        finalizedData.journalSvg.downloadPDF("iteration-"+this.getIterationFileId()+".pdf");
    }

    this.downloadJournalSvg=()=>{
        finalizedData.journalSvg.downloadSVG("iteration-"+this.getIterationFileId()+".svg");
    }

    this.getStats=()=>{
        let stats={
            reasons:{},
            lovers:0,
            guessableEvents:0,
            firstEvent:{},
            personNames:{},
            personSurnames:{},
            places:{},
            events:{},
            dead:{
                persons:0,
                dueTo:{}
            },
            postDeadEvents:{}
        };
        places.forEach(place=>{
            if (!place.tags.typeHome && !place.tags.isSecluded) {
                if (!stats.places[place.id]) stats.places[place.id]=0;
                stats.places[place.id]++;
            }
        });
        persons.forEach(person=>{
            if (!stats.personNames[person.tags.gender]) stats.personNames[person.tags.gender]={};
            if (!stats.personNames[person.tags.gender][person.tags.name]) stats.personNames[person.tags.gender][person.tags.name]=0;
            stats.personNames[person.tags.gender][person.tags.name]++;
            if (!stats.personSurnames[person.tags.surname]) stats.personSurnames[person.tags.surname]=0;
            stats.personSurnames[person.tags.surname]++;
            if (!person.tags.alive) {
                stats.dead.persons++;
                person.tags.deadDueTo.forEach(reason=>{
                    if (!stats.dead.dueTo[reason]) stats.dead.dueTo[reason]=0;
                    stats.dead.dueTo[reason]++;
                })
            }
            let dead=false;
            person.blackbox.entries.forEach(entry=>{
                let action = entry.fact.action;
                // Lovers tracking
                if (action == "newLover")
                    stats.lovers+=0.5; // Happens 2 times for a single event.
                // Dead tracking
                if (action == "dead")
                    dead=true;
                if (dead) {
                    if (!stats.postDeadEvents[action]) stats.postDeadEvents[action]=0;
                    stats.postDeadEvents[action]++;
                    if ([
                        "dead",
                        "raiseObscurity",
                        "removed"
                    ].indexOf(action)==-1) {
                        // No other action is allowed post-mortem
                        debbugger;
                    }
                }
                // Event tracking
                if (!stats.events[action]) stats.events[action]=0;
                stats.events[action]++;
                // Time tracking
                if (entry.at) {
                    if (!stats.firstEvent[action] || (stats.firstEvent[action]>entry.at.day))
                        stats.firstEvent[action]=entry.at.day;
                }
                // Only the facts that the player can tell
                if (FACTS_DATABASE[action].question) {
                    stats.guessableEvents++;
                    if (entry.fact.reason)
                        if (entry.fact.reason.constructor.name == "Array")
                            entry.fact.reason.forEach(reason=>{
                                // Only reasons that the player can tell
                                if (REASONS_DATABASE[reason] && REASONS_DATABASE[reason].label) {
                                    if (!stats.reasons[reason]) stats.reasons[reason]={value:0,for:{}};
                                    if (!stats.reasons[reason].for[action]) stats.reasons[reason].for[action]=0;
                                    stats.reasons[reason].value++;
                                    stats.reasons[reason].for[action]++;
                                }
                            })
                }
            })
        });
        return stats;
    }

    this.getSimulationLogs=()=>{
        let
            data="";
            
        data="### "+SIMULATION_SOFTWARE+" - Iteration "+this.getIterationId()+" - Simulation Logs\n\n";
        data+="The content of this file is confidential and intended only for the recipient specified in this report.\n";
        data+="It is strictly forbidden to share any part of this report with any third party, without the written consent of a manager of the "+SIMULATION_SOFTWARE+" project.\n";
        data+="If you received this report by mistake, please follow with its permanent deletion.\n";

        persons.forEach(person=>{

            let description=describePerson(person);
            data+="\n### "+description.sentence+" ["+description.score+"pts.]\n";
            person.blackbox.entries.forEach(entry=>{
                let description=describeFact(person,entry);
                switch (description.priority) {
                    case -1:{
                        data+="[!]";
                        break;
                    }
                    case 0:{
                        data+="[ ]";
                        break;
                    }
                    case 1:{
                        data+="[-]";
                        break;
                    }
                    case 2:{
                        data+="[>]";
                        break;
                    }
                    default:{
                        debugger;
                    }
                }
                data+=" "+description.sentence+(description.score?" ["+description.score+"pts.]":"")+(description.malus?" [-"+description.malus+"pts.]":"")+"\n";
            })
        });

        return data;
    }

    this.downloadSimulationLogs=()=>{
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        const blob = new Blob([this.getSimulationLogs()], {
            type: "text/plain"
        });
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = "iteration-"+this.getIterationFileId()+".txt";
        a.click();
        document.body.removeChild(a);
    }

    this.getJournalSvg=()=>{
        return finalizedData.journalSvg.getSVG();
    }

    this.getPrint=()=>{
        return finalizedData.print;
    }

    this.renderQuestionnaire=(root,answers)=>{

        if (!answers)
            answers={
                aboutentities:{},
                aboutsim:[]
            };

        QUESTIONNAIRE.root=root;
        root.innerHTML="";

        QUESTIONNAIRE.addTitle("Do you know the "+this.getIterationId()+" entities?");
        persons.forEach(person=>{
            if (!answers.aboutentities[person.id])
                answers.aboutentities[person.id]={entity:person.id};
            answers.aboutentities[person.id].question=QUESTIONNAIRE.newQuestion();
            updateAboutEntityRow(answers,person.id);
        });

        QUESTIONNAIRE.addTitle("What happened in "+this.getIterationId()+"?");
        QUESTIONNAIRE.addNote("Referencing events that occurred within 24 hours of each other implies a penalty in points.")
        for (let i=0;i<QUESTIONNAIRE_DETAILS;i++) {
            if (!answers.aboutsim[i]) 
                answers.aboutsim[i]={
                    atDay:0,
                    atTime:0
                };
            answers.aboutsim[i].question=QUESTIONNAIRE.newQuestion();
            updateAboutSimRow(answers,i);
        }

        let dateToInteger=(a)=>{
            return a.day*Clock.getDayLength()+a.time;
        }

        this.evaluateQuestionnaire=()=>{

            // Evaluate questions about the entities
            let
                totalscore=0,
                maxscore=0,
                totalcompleted=0,
                maxcompleted=0;
            persons.forEach(person=>{
                let answer=answers.aboutentities[person.id];
                maxcompleted+=QUESTIONS_DATABASE.length;
                answer.done.forEach(id=>{
                    let factmodel=QUESTIONS_DATABASE[id];
                    factmodel.question.structure.forEach(element=>{
                        let evaluate=true;
                        if (element.if) {
                            for (let k in element.if)
                                if (element.if[k].indexOf(answer[k])==-1)
                                    evaluate=false;
                        }
                        if (evaluate)
                            switch (element.type) {
                                case "place":
                                case "person":{
                                    maxscore+=QUESTIONNAIRE_SCORE_RIGHT;
                                    totalcompleted++;
                                    if (person.tags[element.id] && (person.tags[element.id].id == answer[element.id]))
                                        totalscore+=QUESTIONNAIRE_SCORE_RIGHT;
                                    else
                                        totalscore+=QUESTIONNAIRE_SCORE_WRONG;
                                    break;
                                }
                                case "input":{
                                    let
                                        textAnswer=answer[element.id].trim().toUpperCase();
                                    if (textAnswer) {
                                        maxscore+=QUESTIONNAIRE_SCORE_RIGHT;
                                        totalcompleted++;
                                        if (person.tags[element.id].trim().toUpperCase() == textAnswer)
                                            totalscore+=QUESTIONNAIRE_SCORE_RIGHT;
                                        else
                                            totalscore+=QUESTIONNAIRE_SCORE_WRONG;
                                    }
                                    break;
                                }
                                case "select":{
                                    let
                                        selectedoption,
                                        evaluate=true;
                                    element.options.forEach(option=>{
                                        if (option.id == answer[element.id])
                                            selectedoption=option;
                                    });
                                    if (selectedoption) {
                                        if (selectedoption.skipCheck)
                                            evaluate=false;
                                        if (selectedoption.asId) {
                                            evaluate=false;
                                            maxscore+=QUESTIONNAIRE_SCORE_RIGHT;
                                            totalcompleted++;
                                            if (
                                                (selectedoption.isFalse&&!person.tags[selectedoption.asId])||
                                                (selectedoption.isEmpty&&!person.tags[selectedoption.asId].length)
                                            )
                                                totalscore+=QUESTIONNAIRE_SCORE_RIGHT;
                                            else
                                                totalscore+=QUESTIONNAIRE_SCORE_WRONG;
                                        }
                                    }
                                    if (evaluate) {
                                        let ok=false;
                                        let value=person.tags[element.id];
                                        if (element.asTagInId) {
                                            value.forEach(subelement=>{
                                                if (subelement.id == answer[element.id])
                                                    ok=true;
                                            })
                                        } else {
                                            if (element.asTagId) value=value.id;
                                            ok=person.tags[element.id] && (value == answer[element.id]);
                                        }
                                        maxscore+=QUESTIONNAIRE_SCORE_RIGHT;
                                        totalcompleted++;
                                        if (ok)
                                            totalscore+=QUESTIONNAIRE_SCORE_RIGHT;
                                        else
                                            totalscore+=QUESTIONNAIRE_SCORE_WRONG;
                                    }
                                    break;
                                }
                            }
                    });
                });
            });
            
            // Evaluate questions about the simulation
            let
                scores=[],
                evaluatedFacts=[];
            maxcompleted+=QUESTIONNAIRE_DETAILS;
            answers.aboutsim.forEach(answer=>{
                if (answer.fact) {
                    totalcompleted++;
                    let
                        factmodel=FACTS_DATABASE[answer.fact],
                        person=world.persons[answer.entity],
                        answertime={day:answer.atDay*1,time:answer.atTime*1},
                        answertimeinteger=dateToInteger(answertime),
                        nearest,
                        nearestScore,
                        nearestMaxScore;
                    if (factmodel && factmodel.question && person) {
                        let nearestDistance;
                        nearest=0;
                        nearestScore=0;
                        nearestMaxScore=0;
                        person.blackbox.entries.forEach(entry=>{
                            if ((entry.fact.action == answer.fact) && (evaluatedFacts.indexOf(entry)==-1)) {
                                nearestScore+=QUESTIONNAIRE_FACT_SCORE_BASE; // person and action found!
                                nearestMaxScore+=QUESTIONNAIRE_FACT_SCORE_BASE;
                                let
                                    entrytimeinteger=dateToInteger(entry.at),
                                    distance=Math.abs(entrytimeinteger-answertimeinteger);
                                if ((nearestDistance===undefined)||(nearestDistance>distance)) {
                                    nearestDistance=distance;
                                    nearest=entry;
                                    nearestScore-=Math.min(QUESTIONNAIRE_SCORE_RIGHT,nearestDistance);
                                    factmodel.question.structure.forEach(element=>{
                                        let evaluate=true;
                                        if (element.if) {
                                            for (let k in element.if)
                                                if (element.if[k].indexOf(answer[k])==-1)
                                                    evaluate=false;
                                        }
                                        if (evaluate)
                                            switch (element.type) {
                                                case "place":
                                                case "person":{
                                                    nearestMaxScore+=QUESTIONNAIRE_SCORE_RIGHT;
                                                    if (entry.fact[element.id] && (entry.fact[element.id].id == answer[element.id]))
                                                        nearestScore+=QUESTIONNAIRE_SCORE_RIGHT;
                                                    else
                                                        nearestScore+=QUESTIONNAIRE_SCORE_WRONG;
                                                    break;
                                                }
                                                case "select":{
                                                    let ok=false;
                                                    if (element.findInto)
                                                        ok=entry.fact[element.id].indexOf(answer[element.id])!=-1;
                                                    else
                                                        ok=entry.fact[element.id] == answer[element.id];
                                                        nearestMaxScore+=QUESTIONNAIRE_SCORE_RIGHT;
                                                    if (ok)
                                                        nearestScore+=QUESTIONNAIRE_SCORE_RIGHT;
                                                    else
                                                        nearestScore+=QUESTIONNAIRE_SCORE_WRONG;
                                                    break;
                                                }
                                            }
                                    });
                                    // Apply the evidences count malus
                                    if (entry.evidences) {
                                        let malus=entry.evidences*2;
                                        nearestScore-=malus;
                                        nearestMaxScore-=malus;
                                    }
                                }
                            }
                        });
                        if (nearest)
                            evaluatedFacts.push(nearest);
                        else {
                            nearestScore=QUESTIONNAIRE_SCORE_FAIL;
                            nearestMaxScore=QUESTIONNAIRE_FACT_SCORE_BASE;
                        }
                    } else {
                        nearest=0;
                        nearestScore=QUESTIONNAIRE_SCORE_FAIL;
                        nearestMaxScore=QUESTIONNAIRE_FACT_SCORE_BASE;
                    }
                    scores.push({
                        found:!!nearest,
                        at:answertimeinteger,
                        entity:answer.entity,
                        fact:answer.fact,
                        score:nearestScore,
                        maxScore:nearestMaxScore
                    });
                }
            });
            // Calculate time distance malus
            scores.forEach(score=>{
                if (score.found) {
                    let nearestDistance;
                    scores.forEach(nearscore=>{
                        if (nearscore.found) {
                            let distance=Math.abs(score.at-nearscore.at);
                            if ((nearscore!==score)&&((nearestDistance===undefined)||(nearestDistance>distance)))
                                nearestDistance=distance;
                        }
                    });
                    if (nearestDistance<Clock.getDayLength()) {
                        score.score+=QUESTIONNAIRE_FACT_TOO_NEAR_MALUS;
                        // MaxScore is kept as-is
                    }
                }
            });
            // Calculate total
            scores.forEach(score=>{
                totalscore+=score.score;
                maxscore+=score.maxScore;
            });
            // Pick a grade
            let
                perccompleted=totalcompleted/maxcompleted,
                percscore=maxscore?Math.max(0,totalscore)/maxscore:0,
                grades=QUESTIONNAIRE_GRADES.filter(grade=>{
                    return (perccompleted>=grade.completion)
                }),
                grade=grades[maxscore?Math.round(Math.max(0,totalscore/maxscore*(grades.length-1))):0];

            return {
                answers:answers,
                iterationId:currentIteration,
                grade:grade,
                totalScore:totalscore,
                maxScore:maxscore,
                percScore:+Math.floor(percscore*100),
                totalCompleted:totalcompleted,
                maxCompleted:maxcompleted,
                percCompleted:Math.floor(perccompleted*100)                
            };

        }

        return answers;
    }

    this.renderGraphs=(root)=>{
            
        let statslist=[];
        statslist=statslist.concat(SIMULATION_DATABASE.personStats);
        persons.forEach(person=>{
            statslist.push("suspectof_"+person.id);
        });
        persons.forEach(person=>{
            statslist.push("reputationof_"+person.id);
        });
            
        persons.forEach(person=>{
            telemetry.plotFor(root,person,statslist,{
                _murderer:"black",
                _failedmurdering:"gray",
                _murdered:"red",
                _faint:"yellow",
                _deaddueto:"pink",
            });
        });
            
        telemetry.plot(root,"person","stress",{
            _murderer:"black",
            _failedmurdering:"gray",
            _murdered:"red",
            _faint:"yellow",
            _deaddueto:"green",
        });
        telemetry.plot(root,"person","obscurity",{
            _murderer:"black",
        });
        telemetry.plot(root,"person","money",{
            _murderer:"black",
        });
        telemetry.plot(root,"person","loverDuration",{
            _makeslover:"black",
        });

        telemetry.plot(root,"place","persons",{
            _murder:"black",
        });
    }

    this.renderFactLogs=(root)=>{
        root.innerHTML=finalizedData.factLogs;
    }

    // Initialization

    this.setTodayIterationId();

}
