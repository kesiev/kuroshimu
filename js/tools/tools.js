let LANGUAGE={
    addOwn:function(word) {
        if (word.endsWith('s'))
            return word+"'";
        else
            return word+"'s";
    },
    capitalize:function(text) {
        return text.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    },
    capitalizeFirst:function(text) {
        return text.substr(0,1).toUpperCase()+text.substr(1,text.length);
    },
    logTime:function(time) {
        return time?"@"+time.day+" "+this.capitalize(Clock.DAY[time.time]):"@?";
    },
    writeList:function(elements) {
        if (elements.length==1)
            return elements[0];
        else {
            let out="";
            elements.forEach((element,id)=>{
                if (id)
                    if (id==elements.length-1) out+=(elements.length>2?",":"")+" and ";
                    else out+=", ";
                out+=element;
            });
            return out;
        }
    },
    writeIdList:function(elements) {
        let solvedElements=elements.map((element,id)=>{
            return this.getName(element);
        });
        return this.writeList(solvedElements);
    },
    solveConjugate:function(type,amount,data) {
        switch (type) {
            case "be-present":{
                if (amount==1)
                    return "is";
                else
                    return "are";
                break;
            }
            case "bea-present":{
                if (amount==1)
                    return "is a";
                else
                    return "are";
                break;
            }
            case "be-past":{
                if (amount==1)
                    return "was";
                else
                    return "were";
                break;
            }
            case "be-present":{
                if (amount==1)
                    return "is";
                else
                    return "are";
                break;
            }
            case "have-past":{
                return "had";
                break;
            }
            case "havebeen-past":{
                if (amount==1)
                    return "has been";
                else
                    return "have been";
                break;
            }
            case "its":{
                if (amount==1) {
                    if (data.tags.gender == "A")
                        return "his";
                    else
                        return "her";
                }
                else
                    return "their";
                break;
            }
            case "itown":{
                if (amount==1) {
                    if (data.tags.gender == "A")
                        return "him";
                    else
                        return "her";
                }
                else
                    return "them";
                break;
            }
            case "it":{
                if (amount==1) {
                    if (data.tags.gender == "A")
                        return "he";
                    else
                        return "she";
                }
                else
                    return "they";
                break;
            }
            case "atin":{
                if (data && data.tags && data.tags.isInside)
                    return "in";
                else
                    return "at";
                break;
            }
        }
    },
    solvePlural:function(singular,plural,qty) {
        if (qty==1)
            return singular;
        else
            return plural;
    },
    getName:function(obj) {
        if (typeof obj == "object") {
            if (obj.getIdentifier)
                return obj.getIdentifier();
            else if (obj.identifiers) {
                if (obj.identifiers.isBag)
                    return obj.identifiers.pick();
                else debugger;
            } else if (obj.id)
                return obj.id;
            else if (obj.length)
                return this.writeIdList(obj);
            else
                return "";
        } else if (typeof obj == "string")
            return obj;
        else
            debugger;
    },
    solvePlaceholder:function(placeholder,placeholders) {
        return this.getName(VAR.getPlaceholderData(placeholder,placeholders));
    },
    cleanLine:(line)=>{
        return line
            .replace(/ ,/g,",")
            .replace(/  /g," ");
    },
    joinSentence:function(pieces) {
        let
            out=this.cleanLine(pieces.join(" ")).trim();
            last=out.substr(out.length-1,1);
        switch (last) {
            case "?":
            case ".":
            case "!":{
                // No joint
                break;
            }
            default:{
                out+=".";
            }
        }
        return this.capitalizeFirst(out);
    }

};

let VAR={
    clone:function(e) {
        return JSON.parse(JSON.stringify(e));
    },
    cloneList:function(list) {
        let out=[];
        list.forEach(e=>{
            out.push(e);
        })
        return out;
    },
    removeElement:function(list,element) {
        let pos=list.indexOf(element);
        if (pos!=-1)
            list.splice(pos,1);
    },
    removeElements:function(list,elements) {
        if (elements)
            elements.forEach(element=>{
                this.removeElement(list,element)
            })
    },
    intersectElements:function(list,elements) {
        if (elements && list)
            return elements.filter(element=>{
                return list.indexOf(element)!=-1;
            });
        else
            return [];
    },
    pushNotRepeat:function(list,element) {
        if (list.indexOf(element) == -1)
            list.push(element);
    },
    countSameElements:function(list1,list2,subvalue) {
        let out=0;
        if (list1 && list2)
            list1.forEach(item=>{
                if (subvalue !== undefined) item=item[subvalue];
                list2.forEach(item2=>{
                    if (subvalue !== undefined) item2=item2[subvalue];
                    if (item === item2) out++;
                })
            })
        return out;
    },
    getPlaceholderData:function(placeholder,context) {
        let
            parts=placeholder.split("."),
            found=context;
        parts.forEach(segment=>{
            if ((found!==undefined)&&(found[segment] !== undefined)) {
                found=found[segment];
            } else found=undefined;
        })
        return found;
    }
}

let COMMITMENT={
    create:(relatedby,relatedas,model,template)=>{
        let data=VAR.clone(model);
        data.forEach(c=>{
            for (let k in c.commitment)
                if ((typeof c.commitment[k]=="string")&&(c.commitment[k][0]==":"))
                    c.commitment[k]=template[c.commitment[k].substr(1)];
        });
        return new Commitment(relatedby,relatedas,data);
    }
}

let TRAIT={
    addToShareableList:function(list,type,items,exclude) {
        if (items)
            items.forEach(item=>{
                if (!exclude || (exclude.indexOf(item) == -1))
                    this.addToShareableItem(list,type,item);
            });
    },
    addToShareableItem:function(list,type,item) {
        list.push({
            type:type,
            item:item        
        });
    }
}

let PLACE={
    newDestinationPlace:(place,conditions)=>{
        let reachablePlace={
            place:place
        };
        if (conditions)
            for (let k in conditions)
                reachablePlace[k]=conditions[k];
        return reachablePlace;
    },
    filterValidDestinations:(destinations)=>{
        let out=[];
        destinations.filter(destination=>{
            let
                ok=true,
                place=destination.place;

            if (destination.whenThereIsPerson && !place.isTherePerson(destination.whenThereIsPerson))
                ok=false;

            if (ok)
                out.push(place);
        });
        return out;
    }
}

let MONEY={
    getWhoPays:(list)=>{
        let richest,money=0;
        list.forEach(person=>{
            let isRichest=false;
            if (!richest)
                // If there isn't a richest...
                isRichest=true;
            else {
                let moneyDiff = Math.abs(money-person.tags.money);
                if (moneyDiff<40) {
                    // The difference is not too high... convince the other to pay.
                    if (richest.debateQuietlyWithPerson(person))
                        isRichest=true;
                } else
                    // Get the actual richest
                    isRichest=person.tags.money>money;
            }
            if (isRichest) {
                richest=person;
                money=person.tags.money;
            }
        })
        return richest;
    }
}

let BIAS={
    isJobTaggedForPerson:function(person,forperson,tag) {
        if (
            (
                person.isBondedWithPerson(forperson) || // If is bonded it knows the job or...
                (forperson.place == person.place) // They are at the same place...
            ) && // And...
                forperson.tags.workplace // ...the person has an actual job
        )
            return !!forperson.tags.workplace.tags[tag];
        else
            return false;
    },
    getBiasScore:function(bias,person,entity,knowledgebase) {
        let score=0;
        // Who is used to "know" stuff - like people's job etc.?
        if (!knowledgebase) knowledgebase=person;
        bias.evaluations.forEach(evaluation=>{
            let applyScore=true;
            switch (evaluation.type) {
                case "person":{
                    if (
                        (entity.type != "person") ||
                        (evaluation.withSameGender && (person.tags.gender != entity.tags.gender)) ||
                        (evaluation.withOtherGender && (person.tags.gender == entity.tags.gender)) ||
                        (evaluation.withJobInTag && !this.isJobTaggedForPerson(knowledgebase,entity,evaluation.withJobInTag))
                    ) applyScore=false;
                    break;
                }
                case "place":{
                    if (
                        (entity.type != "place") ||
                        (evaluation.withTag && !entity.tags[evaluation.withTag])
                    ) applyScore=false;
                    break;
                }
                default:{
                    debugger;
                }
            }
            if (applyScore)
                score+=evaluation.score;
        });
        return score;
    },
    getBiasesScore:function(biases,person,entity) {
        let score=0;
        if (biases)
            biases.forEach(bias=>{
                score+=this.getBiasScore(bias,person,entity);
            });
        return score;
    },
    // Try to guess the bias of a person.
    guessBiases:function(knownbiases,forperson,person,positivebias,entity) {
        return knownbiases.filter(bias=>{
            // Calculate the bias score of the person to the entity according to the forperson knowledge
            let score=this.getBiasScore(bias,person,entity,forperson);
            return positivebias?score>0:score<0;
        });
    }

}