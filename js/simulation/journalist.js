function Journalist(world) {

    const
        MAXLARGETITLES=2,
        DULLEDITIONSTHRESHOLD=6,
        NEWSPEREDITION=16,
        NEWSPERPERSON=4,
        JOURNALGROUPING=[
            "person","place","victim","bias","context"
        ],
        JOURNALSTRUCTURE=[
            // Compress large articles about rumors in a summary article. Loss of informations but more space for other news!
            { attribute:"action", id:"gossipSummary", filter:["isGoodPerson","isBadPerson","eavesdrop"], mixSlots:true, priority:1, isPrinted:true, minSize:15, squeezeTitle:true },
            // Journal themes
            { attribute:"context", id:"context", filter:false, priority:0, keepChronologyDay:true, keepChronologyTime:false, isPrinted:true },
            { attribute:"bias", id:"bias", filter:false, priority:0, keepChronologyDay:true, keepChronologyTime:false, isPrinted:true },
            { attribute:"action", id:"action", titledTestimoniesOnly:true, filter:false, priority:0, keepChronologyDay:true, keepChronologyTime:false, isPrinted:true },
            { attribute:"person", id:"person", filter:false, priority:0, keepChronologyDay:true, keepChronologyTime:false, isPrinted:true },
            { attribute:"victim", id:"victim", filter:false, priority:0, keepChronologyDay:true, keepChronologyTime:false, isPrinted:true },
            { attribute:"place", id:"place", filter:false, priority:0, keepChronologyDay:true, keepChronologyTime:false, isPrinted:true }
        ],
        PACKINGSENTENCES={
            // Unused.
            // person:{
            //     countIs:SIMULATION_DATABASE.persons.length,
            //     replaceWith:{id:"everybody"}
            // }
        };

    let
        print=[],
        personsToLie=[],
        dullEditions=0,
        addTitle,
        newsTime,
        newsLeft,
        newsClusters=[];

    this.testimonies=[];

    this.setRandomizer=(randomizer,journalistRandomizer)=>{
        this.randomizer=journalistRandomizer;
        this.simulationRandomizer=randomizer;
    }

    let newPaper=(time)=>{
        addTitle=true;
        newsTime=time;
        news=[];
        newsClusters={
            old:[],
            new:[]
        };
        newsLeft=NEWSPEREDITION;
    }

    let addTestimonyToArticle=(testimony,by)=>{
        let
            added=false,
            newsbox;
        // Mark the related facts as evident
        if (testimony.relatedFacts) {
            testimony.relatedFacts.forEach(fact=>{
                if (fact) {
                    // console.log("lowering score of fact",fact.fact.action,fact);
                    testimony._malus=true;
                    fact.evidences=(fact.evidences||0)+1;
                }
            })
        }
        // Decides the inbox depending of the freshness of the news.
        if (testimony.at.day<newsTime.day-6)
            newsbox=newsClusters.old;
        else
            newsbox=newsClusters.new;
        // Categorize the testimony
        JOURNALSTRUCTURE.forEach(entry=>{
            // Is the article about the requested attribute?
            let attribute=testimony[entry.attribute];
            if (attribute) {
                let
                    add=false,
                    type=entry.attribute,
                    articleId=0;
                // Is the article filtering the attribute?
                if (entry.filter) {
                    if (entry.filter.indexOf(attribute) != -1) {
                        type=entry.id;
                        attribute=entry.id;
                        articleId=entry.id;
                        add=true;
                    }
                } else if (entry.titledTestimoniesOnly) {
                    if (TESTIMONIES_DATABASE[attribute].article.titles) {
                        articleId=entry.id+"-"+attribute;
                        add=true;
                    }
                } else {
                    articleId=entry.id+"-"+(attribute.id||attribute);
                    add=true;
                }
                // If the article should be added...
                if (add) {
                    let found=false;
                    for (let i=0;i<newsbox.length;i++) {
                        if (newsbox[i].id==articleId) {
                            found=newsbox[i];
                            break;
                        }
                    }
                    // If not found create a new article
                    if (!found) {
                        found={
                            id:articleId,
                            type:type,
                            subject:attribute,
                            priority:entry.priority,
                            testimonies:[],
                            keepChronologyDay:entry.keepChronologyDay,
                            keepChronologyTime:entry.keepChronologyTime,
                            mixSlots:entry.mixSlots,
                            minSize:entry.minSize,
                            squeezeTitle:entry.squeezeTitle,
                            isPrinted:entry.isPrinted
                        };
                        newsbox.push(found);
                    }
                    // Add the testimony to the article
                    found.testimonies.push(testimony);
                    added=true;
                }
            }
        });
        if (!added) debugger;
        // Add news as processed
        this.testimonies.push(testimony);
        newsLeft--;
    }

    let prepareArticles=(newsbox)=>{

        // Sort articles by priority and testimonies count
        newsbox.sort((a,b)=>{
            if (a.priority>b.priority) return -1;
            else if (a.priority<b.priority) return 1;
            else if (a.testimonies.length>b.testimonies.length) return -1;
            else if (a.testimonies.length<b.testimonies.length) return 1;
            else return 0;
        });

        // Then cleanup the articles
        let
            testimonies=[],
            singleTestimonies=[];
        newsbox=newsbox.filter(cluster=>{

            if (!cluster.minSize || (cluster.testimonies.length>=cluster.minSize)) {

                cluster.testimonies.sort((a,b)=>{
                    // Sort testimonies by time to suggest chronology if needed by cluster.
                    if (cluster.keepChronologyDay) {
                        if (a.at.day>b.at.day) return 1;
                        else if (a.at.day<b.at.day) return -1;
                    }
                    if (cluster.keepChronologyTime) {
                        if (a.at.time>b.at.time) return 1;
                        else if (a.at.time<b.at.time) return -1;
                    }
                    // Then group same actions and places
                    if (a.action>b.action) return 1;
                    else if (a.action<b.action) return -1;
                    else if ((a.context||"")>(b.context||"")) return 1;
                    else if ((a.context||"")<(b.context||"")) return -1;
                    else if (a.person.id>b.person.id) return 1;
                    else if (a.person.id<b.person.id) return -1;
                    else if (a.place.id>b.place.id) return 1;
                    else if (a.place.id<b.place.id) return -1;
                    else return 0;
                });

                // Remove already used testimonies
                cluster.testimonies=cluster.testimonies.filter((testimony)=>{
                    if (testimonies.indexOf(testimony) == -1) {
                        testimonies.push(testimony);
                        return true;
                    } else return false;
                });

                if (cluster.testimonies.length==1)
                    singleTestimonies.push(cluster.testimonies[0]);
                
                return cluster.testimonies.length>0;

            } else {

                return false;

            }

        });

        // If there are multiple articles with single testimonies creates a misc article
        if (singleTestimonies.length>1) {
            newsbox=newsbox.filter(cluster=>{
                return cluster.testimonies.length>1;
            });
            newsbox.push({
                id:"misc",
                isPrinted:true,
                keepChronologyDay:true,
                keepChronologyTime:true,
                priority:-1,
                smallTitle:true,
                subject:0,
                testimonies:singleTestimonies,
                type:"misc"
            });
        }

        return newsbox;
    }

    let replacePlaceholders=(text,placeholders)=>{
        return text.replace(/\{([^}]+)\}/g,(m,m1)=>{
            let pcs=m1.split(":");
            switch (pcs[0]) {
                case "conjugate":{
                    let
                        qty=1,
                        data=VAR.getPlaceholderData(pcs[2],placeholders);
                    if ((typeof data == "object") && data.length) {
                        qty=data.length;
                        data=data[0];
                    }
                    return LANGUAGE.solveConjugate(pcs[1],qty,data);
                    break;
                }
                case "plural":{
                    let
                        qty=1,
                        data=VAR.getPlaceholderData(pcs[3],placeholders);
                    if ((typeof data == "object") && data.length) {
                        qty=data.length;
                        data=data[0];
                    }
                    return LANGUAGE.solvePlural(pcs[1],pcs[2],qty);
                    break;
                }
                case "summarizeTestimony":{
                    let
                        data=VAR.getPlaceholderData(pcs[1],placeholders),
                        model=TESTIMONIES_DATABASE[data.action];
                        parts=[],
                        contexts=data.context.constructor.name=="Array"?data.context:[data.context];
                    contexts.forEach(context=>{
                        if (context) {
                            if (model.topicSummary.onContext) {
                                // Use context-specific rules...
                                if (model.topicSummary.onContext[context])
                                    parts.push(model.topicSummary.onContext[context].pick());
                                else
                                    debugger;
                            } else {
                                // ... or topic-specific rules
                                let altmodel=TESTIMONIES_DATABASE[context];
                                if (altmodel.topicSummary) {
                                    if (altmodel.topicSummary.onContext && altmodel.topicSummary.onContext[data.action])
                                        parts.push((altmodel.topicSummary.onChainPrefix ? altmodel.topicSummary.onChainPrefix.pick() : "")+altmodel.topicSummary.onContext[data.action].pick());
                                    else if (altmodel.topicSummary.default)
                                        parts.push(altmodel.topicSummary.default.pick());
                                    else
                                        debugger;
                                } else debugger;
                            }
                        }
                    });
                    if (!parts.length)
                        parts.push("something");
                    return LANGUAGE.writeList(parts);
                    break;
                }
                case "own":{
                    let data=LANGUAGE.solvePlaceholder(pcs[1],placeholders);
                    return LANGUAGE.addOwn(data);
                    break;
                }
                default:{
                    return LANGUAGE.solvePlaceholder(m1,placeholders);
                }
            }
        })
    }

    let prepareNewSentence=(testimony)=>{
        let sentence={
            action:testimony.action,
            testimony:testimony,
            _malus:testimony._malus,
            groupBy:0
        }
        JOURNALGROUPING.forEach(attribute=>{
            sentence[attribute]=[];
            if (testimony[attribute]) sentence[attribute].push(testimony[attribute]);
        });
        return sentence;
    }

    let writeJournal=(newsbox,compact,subtitle)=>{
        let
            firstArticle=true,
            addSubtitle=true,
            largeTitles=0;
        
        newsbox.forEach(cluster=>{
            if (cluster.isPrinted) {

                // Select cluster title
                let title;
                if (cluster.type == "action") {
                    let titleModel;
                    if (TESTIMONIES_DATABASE[cluster.subject].article.titles)
                        titleModel = TESTIMONIES_DATABASE[cluster.subject].article.titles.pick();
                    else
                        titleModel=TITLES_DATABASE[cluster.id].titles.pick();
                    title=replacePlaceholders(titleModel,{
                        cluster:cluster
                    })
                } else {
                    let titleModel=TITLES_DATABASE[cluster.type].titles.pick();
                    title=replacePlaceholders(titleModel,{
                        cluster:cluster
                    })
                }

                // Create same-action groups to create sentences
                let
                    sentences=[],
                    lastSentence=0;
                cluster.testimonies.forEach(testimony=>{
                    if (!lastSentence || (lastSentence.action!=testimony.action)) {
                        lastSentence=prepareNewSentence(testimony);
                        sentences.push(lastSentence);
                    } else if (cluster.mixSlots) {
                        JOURNALGROUPING.forEach(attribute=>{
                            if (testimony[attribute] && (lastSentence[attribute].indexOf(testimony[attribute])==-1))
                                lastSentence[attribute].push(testimony[attribute])
                        });
                    } else {
                        let
                            merge=false,
                            mergeInto=0;
                        JOURNALGROUPING.forEach(attribute=>{
                            if (testimony[attribute] && (lastSentence[attribute].indexOf(testimony[attribute])==-1))
                                if (mergeInto)
                                    merge=false;
                                else {
                                    merge=true;
                                    mergeInto=attribute;
                                }
                        });
                        // If there is anything new...
                        if (mergeInto)
                            // Clusterize or create a new cluster
                            if (merge && (!lastSentence.groupBy || (lastSentence.groupBy==mergeInto))) {
                                lastSentence.groupBy=mergeInto;
                                lastSentence._malus|=testimony._malus;
                                lastSentence[mergeInto].push(testimony[mergeInto]);
                            } else {
                                lastSentence=prepareNewSentence(testimony);
                                sentences.push(lastSentence);
                            }

                    }
                });

                // Write sentences
                let lines=[];
                sentences.forEach(sentence=>{

                    // Shuffle sets avoid clues about entities IDs
                    JOURNALGROUPING.forEach(attribute=>{
                        // Packs structure
                        let packing=PACKINGSENTENCES[attribute];
                        if (packing && (sentence[attribute].length == packing.countIs))
                            sentence[attribute]=VAR.clone(packing.replaceWith);
                        
                        // Shuffle elements
                        this.randomizer.shuffle(sentence[attribute]);
                    });

                    // Find fitting sentence
                    let
                        fittingSentences=[],
                        pieces=[],
                        placeholders={
                            sentence:sentence
                        },
                        parts;

                    TESTIMONIES_DATABASE[sentence.action].article.sentences.forEach(sentence=>{
                        sentence.versions.forEach(version=>{
                            fittingSentences.push({
                                set:0,
                                version:version
                            });
                        })
                    });

                    if (fittingSentences.length) {

                        parts=this.randomizer.element(fittingSentences);

                        // Version variables (unused)
                        if (parts.set)
                            for (let k in parts.set)
                                placeholders[k]=this.randomizer.element(parts.set[k]);

                        parts.version.forEach(part=>{
                            if  (
                                    (!part.excludeOnArticlesAbout || (part.excludeOnArticlesAbout.indexOf(cluster.type) == -1)) &&
                                    (!part.includeOnArticlesAbout || (part.includeOnArticlesAbout.indexOf(cluster.type) != -1)) &&
                                    (!part.if || VAR.getPlaceholderData(part.if,placeholders)) &&
                                    (!part.ifNot || !VAR.getPlaceholderData(part.ifNot,placeholders))
                                )
                                pieces.push(replacePlaceholders(part.text.pick(),placeholders));
                        });

                        if (pieces.length)
                            lines.push(LANGUAGE.joinSentence(pieces));

                    } else {
                        // No sentence available?
                        debugger;
                    }

                });

                if (lines.length) {

                    if (addTitle) {
                        print.push({model:"smallTitle",text:LANGUAGE.logTime(newsTime)+" Update"});
                        addTitle=false;
                    }

                    if (addSubtitle) {
                        if (subtitle)
                            print.push({model:"smallTitle",text:subtitle});
                        addSubtitle=false;
                    }
                    
                    if (
                        // Not forced compact
                        !compact&&
                        // And...
                        (
                            // The first of the block
                            firstArticle||
                            // Or a squeezed article...
                            cluster.squeezeTitle||
                            (
                                // Longer articles...
                                (lines.length>1)&&
                                // ...not forced to be small...
                                !cluster.smallTitle&&
                                // ...and there are less than a threshold large titles
                                (largeTitles<MAXLARGETITLES)
                            )
                        )
                    ) {
                        largeTitles++;
                        if (cluster.squeezeTitle) {
                            print.push({model:"title",text:"{symbol squeezeSymbol}"+LANGUAGE.capitalize(title)+"{symbol squeezeSymbolRight}"});
                            print.push({model:"body",text:lines.join(" ")});
                        } else {
                            print.push({model:"title",text:LANGUAGE.capitalize(title)});
                            print.push({model:"body",text:lines.join(" ")});
                        }
                    } else {
                        print.push({model:"body",text:"{bold}"+LANGUAGE.capitalize(title)+"{endbold} - "+lines.join(" ")});
                    }
                    firstArticle=false;
                }

            }

        });
    }

    // Listening and communicating

    this.isKnownTestimony=(testimony)=>{
        for (let i=0;i<this.testimonies.length;i++) {
            if (this.testimonies[i].testimony === testimony.testimony)
                return true;
        }
        return false;
    }

    this.lie=(delay)=>{
        if (!personsToLie.length)
            personsToLie=world.getPersonList();
        // Get persons alive
        personsToLie=personsToLie.filter(person=>person.isAlive());
        // Sort them obscurity
        personsToLie.sort((a,b)=>{
            if (a.tags.obscurity>b.tags.obscurity) return -1;
            else if (a.tags.obscurity<b.tags.obscurity) return 1;
            else return 0;
        });
        if (personsToLie.length) {
            // Picks the top obscure
            let
                topobscure=personsToLie.filter(person=>person.tags.obscurity==personsToLie[0].tags.obscurity),
                candidate=this.simulationRandomizer.element(topobscure);
            // Remove the candidate
            personsToLie.splice(personsToLie.indexOf(candidate),1);
            candidate.willPlanMurder("murderInstinct",delay);
        }
    }

    this.pass=()=>{

        let time=world.clock.get();
        
        // It's the publishing date?
        if ((time.dayOfWeek==6)&&(time.time==Clock.getDayLastHour())) {

            // Locks the simulation randomizer to debug
            this.randomizer.unlock();
            this.simulationRandomizer.lock();

            // Time to work!
            newPaper(time);

            let
                persons=world.getPersonList(),
                victims=0;
                
            // Prepare interviews with most obscure people
            this.randomizer.shuffle(persons);
            persons.sort((a,b)=>{
                if (a.tags.obscurity>b.tags.obscurity) return -1;
                else if (a.tags.obscurity<b.tags.obscurity) return 1;
                else return 0;
            });

            for (let i=0;i<persons.length;i++) {

                let
                    person=persons[i],
                    newsperperson=NEWSPERPERSON;

                // Is someone missing? ;)
                if (!person.isAlive())
                    victims++;
                
                // Only persons that can interact can leave an interview.
                if (person.isInteractive()) {
                    
                    // Asks for juicy traits to share with the journalist with interview
                    let traits=person.listShareableTraitsWith(this,false,true);

                    // Pick latest testimonies
                    for (let j=0;j<traits.length;j++) {
                        let
                            fullTestimony=traits[j].item,
                            testimony=fullTestimony.testimony;

                        // Very good! Let's archive the testimony
                        addTestimonyToArticle(testimony,person);

                        // If the article is full, stop interviewing
                        if (!newsLeft) break;

                        // If we've enough testimonies from the testimony, stop interviewing it.       
                        newsperperson--;
                        if (!newsperperson) break;

                    }

                    // If the article is full, stop interviewing
                    if (!newsLeft) break;

                }
            }

            // Prepare old & new articles
            newsClusters.old=prepareArticles(newsClusters.old);
            newsClusters.new=prepareArticles(newsClusters.new);

            // Writes journal about fresh news first
            writeJournal(newsClusters.new,false);
            writeJournal(newsClusters.old,true,"Old News");

            // Unlocks the simulation randomizer
            this.simulationRandomizer.unlock();
            this.randomizer.lock();

            // If nobody died...
            if (!victims) {
                // Add a new dull edition...
                dullEditions++;
                // If it reaches a threshold...
                if (dullEditions>=DULLEDITIONSTHRESHOLD) {
                    // ...give more incentives to commit murder
                    this.lie(DAYS_DELAYNEXTMURDER);
                }
            }

        }

    }

    // Closes the journal with the final columns
    this.close=()=>{
        // The randomizer should be locked
        if (this.randomizer.isLocked)
            this.randomizer.unlock();
        else
            debugger;
        print.push({model:"smallTitle",text:"Iteration Aborted"});
        print.push({model:"largeTitle",text:LANGUAGE.capitalize(COLUMN_DATABASE.titles.pick())});
        COLUMN_DATABASE.columns.forEach(column=>{
            let
                title=LANGUAGE.capitalize(column.titles.pick()),
                line="",
                positions=[],
                list;
            switch (column.subject) {
                case "persons":{
                    list=world.getPersonList();
                    break;
                }
                case "places":{
                    list=world.getPlacesList();
                    break;
                }
            }
            list=list.forEach(element=>{
                if (column.includeAll || (element.tags[column.tag]!==undefined))
                    positions.push({label:element.getIdentifier(),value:element.tags[column.tag]||0})
            });
            if (positions.length) {
                positions.sort((a,b)=>{
                    if (column.orderDesc) {
                        if (a.value>b.value) return -1;
                        else if (a.value<b.value) return 1;
                        if (a.label>b.label) return 1;
                        else if (a.label<b.label) return -1;
                        else return 0;
                    } else {
                        if (a.value>b.value) return 1;
                        else if (a.value<b.value) return -1;
                        if (a.label>b.label) return 1;
                        else if (a.label<b.label) return -1;
                        else return 0;
                    }
                });
                positions.forEach((position,id)=>{
                    line+="{bold}"+(id+1)+".{endbold} "+LANGUAGE.capitalizeFirst(position.label)+" - ";
                })
                print.push({model:"title",text:title});
                print.push({model:"body",text:line.substr(0,line.length-3)});
            }
        })
    }

    this.getPrint=()=>{
        return print;
    }

}
