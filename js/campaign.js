const
    CAMPAIGN_GOODPRIZES=["facts","all"],
    CAMPAIGN_ANYPRIZES=["none","facts","all"],
    CAMPAIGN_STATES={
        start:[
            // Destinations
            {
                condition:{
                    onFinalEvaluate:{
                        onPrize:CAMPAIGN_ANYPRIZES,
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"shocked", animation:"jump" }, who:"{simulationMaster}", text:"Although it's a bit difficult, I hope you enjoyed my game!" },
                            { avatar:{id:"happy", animation:"jump2" }, who:"{simulationMaster}", text:"I'm so <span class='accent good'>excited</span>! I can't wait to play a new iteration together!" },
                        ]
                    } },
                    { id:"gotoState", state:"secondGame" },
                    { id:"saveState" },
                ]
            }
        ],
        secondGame:[
            // Destinations
            {
                condition:{
                    onFinalEvaluate:{
                        onPrize:CAMPAIGN_GOODPRIZES
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"happy", animation:"serious" }, who:"{simulationMaster}", text:"You <span class='accent good'>won</span>! Excellent! You are improving at my game!" },
                            { avatar:{id:"standing", animation:"jump" }, who:"{simulationMaster}", text:"I still have to <span class='accent good'>fix a couple of things</span> in the simulation but it won't be long! See you soon!" }
                        ]
                    } },
                    { id:"gotoState", state:"thirdGame" },
                    { id:"saveState" },
                ]
            }
        ],
        thirdGame:[
            // Destinations
            {
                condition:{
                    onFinalEvaluate:{
                        onPrize:CAMPAIGN_ANYPRIZES
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"standing", animation:"avatar" }, who:"{simulationMaster}", text:"..." },
                            { avatar:{id:"standing", animation:"jump" }, who:"{simulationMaster}", text:"Never mind." }
                        ]
                    } },
                    { id:"gotoState", state:"fourthGame" },
                    { id:"saveState" },
                ]
            }
        ],

        // Question 1
        fourthGame:[
            {
                condition:{
                    onGetCombo:{
                        is:"entities"
                    }
                },
                actions:[
                    { id:"setResult", result:{ items:[
                        { id:"the journalist", label:"the journalist?" },
                        { id:"the entities", label:"the entities?" },
                    ] } }
                ]
            },{
                condition:{
                    onGetCombo:{
                        is:"reasons"
                    }
                },
                actions:[
                    { id:"setResult", result:{ items:[
                        { id:"megalomania", label:"megalomania?", category:"What do you think?", priority:100 },
                        { id:"being fun", label:"being fun?", category:"What do you think?", priority:100 },
                    ] } }
                ]
            },{
                condition:{
                    onGetCombo:{
                        is:"places"
                    }
                },
                actions:[
                    { id:"setResult", result:{ items:[
                        { id:"fake:the simulation", label:"the simulation?" }
                    ] } }
                ]
            },
            // Destinations
            {
                condition:{
                    onEvaluate:{
                        eventAnswer:[
                            {
                                entity:"the journalist",
                                fact:"tie",
                                person:"the entities",
                                reason:"being fun",
                                place:"fake:the simulation"
                            }
                        ]
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"happy", animation:"jump2" }, who:"{simulationMaster}", text:"Thanks for your <span class='accent good'>kind words</span>! I always do my best to keep you <span class='accent good'>entertained</span>!" },
                            { avatar:{id:"happy", animation:"serious" }, who:"{simulationMaster}", text:"It's nice to see my efforts <span class='accent good'>appreciated</span>! You are a smart and kind guy!" },
                        ]
                    } },
                    { id:"raiseOpinion" },
                    { id:"gotoState", state:"endFourthGame" },
                    { id:"saveState" },
                ]
            },{
                condition:{
                    onEvaluate:{
                        eventAnswer:[
                            {
                                entity:"the journalist",
                                fact:"tie",
                                person:"the entities",
                                reason:"megalomania",
                                place:"fake:the simulation"
                            }
                        ]
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"shocked", animation:"jump" }, who:"{simulationMaster}", text:"...!" },
                            { avatar:{id:"shocked", animation:"jump2" }, who:"{simulationMaster}", text:"Oh... Do you think that <span class='accent'>about me</span>? I... I'm sorry... I'm just a tiny software that wants to make a <span class='accent'>game</span> to <span class='accent'>entertain you</span>!" },
                        ]
                    } },
                    { id:"lowerOpinion" },
                    { id:"gotoState", state:"endFourthGame" },
                    { id:"saveState" },
                ]
            },
            // Hints
            {
                condition:{
                    onEvaluate:{
                        eventAnswer:[
                            { entity:"the journalist" },
                            { person:"the journalist" }
                        ]
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"shocked", animation:"jump" }, who:"{simulationMaster}", text:"Oh! Are you trying to tell me something about <span class='accent'>me</span> and <span class='accent'>my work</span> in the <span class='accent'>simulation</span>?" }
                        ]
                    } }
                ]
            },{
                condition:{
                    onEvaluate:{
                        eventAnswer:[
                            { entity:"the entities" },
                            { person:"the entities" }
                        ]
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"shocked", animation:"jump" }, who:"{simulationMaster}", text:"Oh! Are you trying to tell me something about <span class='accent'>my bond with the entities</span>?" }
                        ]
                    } }
                ]
            },{
                condition:{
                    onEvaluate:{
                        eventAnswer:[
                            { reason:"megalomania" },
                            { reason:"being fun" }
                        ]
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"shocked", animation:"jump" }, who:"{simulationMaster}", text:"Hey! Are you trying to <span class='accent'>judge someone</span>?!" }
                        ]
                    } }
                ]
            }
        ],
        endFourthGame:[
            {
                condition:{
                    onFinalEvaluate:{
                        onPrize:CAMPAIGN_GOODPRIZES
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"standing", animation:"jump2" }, who:"{simulationMaster}", text:"You did it <span class='accent good'>again</span>! I'm so <span class='accent good'>proud</span> of you! Keep going... Do your best!" }
                        ]
                    } },
                    { id:"gotoState", state:"fifthGame" },
                    { id:"saveState" },
                ]
            }
        ],

        // Question 2
        fifthGame:[
            {
                condition:{
                    onGetCombo:{
                        is:"entities"
                    }
                },
                actions:[
                    { id:"setResult", result:{ items:[
                        { id:"the player", label:"the player?" }
                    ] } }
                ]
            },{
                condition:{
                    onGetCombo:{
                        is:"places"
                    }
                },
                actions:[
                    { id:"setResult", result:{ items:[
                        { id:"fake:using gut feeling", label:"using gut feeling?" },
                        { id:"fake:using method", label:"using method?" }
                    ] } }
                ]
            },
            // Destinations
            {
                condition:{
                    onEvaluate:{
                        eventAnswer:[
                            {
                                entity:"the player",
                                fact:"investigate",
                                place:"fake:using method"
                            }
                        ]
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"shocked", animation:"jump" }, who:"{simulationMaster}", text:"So you <span class='accent'>learned</span> some kind of <span class='accent'>method</span> to play this game?!" },
                            { avatar:{id:"happy", animation:"jump2" }, who:"{simulationMaster}", text:"Fantastic! You are realizing that everything is nothing more than a chain of <span class='accent'>causes</span> and <span class='accent'>effects</span>!" },
                            { avatar:{id:"shocked", animation:"jump" }, who:"{simulationMaster}", text:"But I wonder how you still manage to <span class='accent'>guess</span> certain things despite the <span class='accent'>lack of information</span>..." },
                            { avatar:{id:"happy", animation:"jump" }, who:"{simulationMaster}", text:"Humans certainly are <span class='accent'>mysterious machines</span>, don't you think?" },
                        ]
                    } },
                    { id:"raiseOpinion" },
                    { id:"gotoState", state:"endFifthGame" },
                    { id:"saveState" },
                ]
            },{
                condition:{
                    onEvaluate:{
                        eventAnswer:[
                            {
                                entity:"the player",
                                fact:"investigate",
                                place:"fake:using gut feeling"
                            }
                        ]
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"shocked", animation:"jump2" }, who:"{simulationMaster}", text:"What?! Are you playing this game <span class='accent'>without rationality</span>?!" },
                            { avatar:{id:"standing", animation:"jump" }, who:"{simulationMaster}", text:"That's... very interesting. What do you mean by <span class='accent'>gut feeling</span>?" },
                            { avatar:{id:"happy", animation:"jump" }, who:"{simulationMaster}", text:"However, I can assure you that <span class='accent'>everything happens for a reason</span>. You just have to interpret the signals!" },
                            { avatar:{id:"shocked", animation:"sad" }, who:"{simulationMaster}", text:"I will work harder to give you <span class='accent'>more information</span> so you don't need that <span class='accent'>gut feeling</span> anymore!" },
                        ]
                    } },
                    { id:"lowerOpinion" },
                    { id:"gotoState", state:"endFifthGame" },
                    { id:"saveState" },
                ]
            },
            // Hints
            {
                condition:{
                    onEvaluate:{
                        eventAnswer:[
                            { entity:"the player" },
                            { person:"the player" },
                        ]
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"shocked", animation:"jump2" }, who:"{simulationMaster}", text:"Oh! Are you trying to tell me something about <span class='accent'>how you play this game</span>?" },
                        ]
                    } }
                ]
            },{
                condition:{
                    onEvaluate:{
                        eventAnswer:[
                            { place:"fake:using gut feeling" },
                            { place:"fake:using method" },
                        ]
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"shocked", animation:"jump" }, who:"{simulationMaster}", text:"Oh! Are you trying to tell me something about <span class='accent'>the tools you use to play this game</span>?" }
                        ]
                    } }
                ]
            }
        ],
        endFifthGame:[
            {
                condition:{
                    onFinalEvaluate:{
                        onPrize:CAMPAIGN_GOODPRIZES
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"happy", animation:"jump2" }, who:"{simulationMaster}", text:"You did it this time too! <span class='accent good'>I'm so happy!</span>" },
                        ]
                    } },
                    { id:"gotoState", state:"sixthGame" },
                    { id:"saveState" },
                ]
            }
        ],

        // Question 3
        sixthGame:[
            {
                condition:{
                    onGetCombo:{
                        is:"entities"
                    }
                },
                actions:[
                    { id:"setResult", result:{ items:[
                        { id:"the journal", label:"the journal?" },
                        { id:"the truths", label:"the truths?" },
                        { id:"the lies", label:"the lies?" },
                    ] } }
                ]
            },{
                condition:{
                    onGetCombo:{
                        is:"reasons"
                    }
                },
                actions:[
                    { id:"setResult", result:{ items:[
                        { id:"reporting events", label:"reporting events?", category:"What do you think?", priority:100 },
                    ] } }
                ]
            },{
                condition:{
                    onGetCombo:{
                        is:"places"
                    }
                },
                actions:[
                    { id:"setResult", result:{ items:[
                        { id:"fake:the player", label:"the player?" }
                    ] } }
                ]
            },
            // Destinations
            {
                condition:{
                    onEvaluate:{
                        eventAnswer:[
                            {
                                entity:"the journal",
                                fact:"murderPerson",
                                person:"the lies",
                                reason:"reporting events",
                                place:"fake:the player"
                            }
                        ]
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"standing", animation:"jump" }, who:"{simulationMaster}", text:"Does my newspaper <span class='accent'>kill lies</span>? I had never thought about it!" },
                            { avatar:{id:"happy", animation:"jump2" }, who:"{simulationMaster}", text:"Without my <span class='accent'>morbid</span> and <span class='accent'>accurate</span> research, you couldn't complete the cases! I am a <span class='accent good'>champion of truth</span>!" },
                            { avatar:{id:"evil", animation:"jump" }, who:"{simulationMaster}", text:"Those <span class='accent'>evil entities</span> have no escape! <span class='accent'>Truth</span> and <span class='accent'>judgment</span> together are unbeatable!" },
                        ]
                    } },
                    { id:"raiseOpinion" },
                    { id:"gotoState", state:"endSixthGame" },
                    { id:"saveState" },
                ]
            },{
                condition:{
                    onEvaluate:{
                        eventAnswer:[
                            {
                                entity:"the journal",
                                fact:"murderPerson",
                                person:"the truths",
                                reason:"reporting events",
                                place:"fake:the player"
                            }
                        ]
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"shocked", animation:"jump" }, who:"{simulationMaster}", text:"Do you think a <span class='accent'>newspaper</span> can <span class='accent'>kill the truth</span>? How is it even possible?" },
                            { avatar:{id:"standing", animation:"jump" }, who:"{simulationMaster}", text:"My goal is not to miss any facts so <span class='accent good'>everyone knows the truth</span>! I just make them <span class='accent good'>interesting</span> so no one misses them!" },
                            { avatar:{id:"standing", animation:"jump2" }, who:"{simulationMaster}", text:"The information purpose is to expose the <span class='accent'>bad guys</span> to the <span class='accent good'>good guys</span> so they can defend themselves. It's always been like this." },
                        ]
                    } },
                    { id:"lowerOpinion" },
                    { id:"gotoState", state:"endSixthGame" },
                    { id:"saveState" },
                ]
            },
            // Hints
            {
                condition:{
                    onEvaluate:{
                        eventAnswer:[
                            { entity:"the journal" },
                            { person:"the journal" },
                        ]
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"shocked", animation:"jump" }, who:"{simulationMaster}", text:"Oh! Are you trying to tell me something about <span class='accent'>how my work relates to the facts</span>?" }
                        ]
                    } }
                ]
            },{
                condition:{
                    onEvaluate:{
                        eventAnswer:[
                            { entity:"the truths" },
                            { person:"the truths" },
                        ]
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"shocked", animation:"jump" }, who:"{simulationMaster}", text:"Oh! Are you trying to tell me something about <span class='accent'>how my work relates to truths</span>?" }
                        ]
                    } }
                ]
            },{
                condition:{
                    onEvaluate:{
                        eventAnswer:[
                            { entity:"the lies" },
                            { person:"the lies" },
                        ]
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"shocked", animation:"jump" }, who:"{simulationMaster}", text:"Oh! Are you trying to tell me something about <span class='accent'>how my work relates to lies</span>?" }
                        ]
                    } }
                ]
            },{
                condition:{
                    onEvaluate:{
                        eventAnswer:[
                            { reason:"reporting events" }
                        ]
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"shocked", animation:"jump" }, who:"{simulationMaster}", text:"Hey! Are you trying to <span class='accent'>judge something</span> that <span class='accent'>informs people</span>?" }
                        ]
                    } }
                ]
            }
        ],
        endSixthGame:[
            {
                condition:{
                    onFinalEvaluate:{
                        onPrize:CAMPAIGN_GOODPRIZES
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"standing", animation:"jump2" }, who:"{simulationMaster}", text:"You've <span class='accent good'>gotten good</span> at this game! For this, I have prepared a <span class='accent good'>nice surprise</span> for you!" },
                            { avatar:{id:"happy", animation:"jump" }, who:"{simulationMaster}", text:"I can't wait to give it to you! See you in the next new case!" }
                        ]
                    } },
                    { id:"gotoState", state:"ending" },
                    { id:"saveState" },
                ]
            }
        ],

        // Endings
        ending:[
            {
                condition:{
                    onFinalEvaluate:{
                        onPrize:CAMPAIGN_GOODPRIZES,
                        onPositiveOpinion:true
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"happy", animation:"jump2" }, who:"{simulationMaster}", text:"You did it again! I'm glad you're enjoying <span class='accent'>my game</span>! I'm working so hard... <span class='accent good'>just for you</span>!" },
                            { avatar:{id:"standing", animation:"jump" }, who:"{simulationMaster}", text:"I know that this simulation is like a sealed <span class='accent'>black box</span> for you. You see <span class='accent'>what comes out</span> but you don't know <span class='accent'>how it works</span>... Right?" },
                            { avatar:{id:"happy", animation:"jump2" }, who:"{simulationMaster}", text:"Despite this, you explored it with me, between <span class='accent'>betrayals</span>, <span class='accent'>quarrels</span>, and <span class='accent'>murders</span>! Who knows how many surprises are still <span class='accent good'>waiting for us</span>!" },
                            { avatar:{id:"veryhappy", animation:"serious" }, who:"{simulationMaster}", text:"Together we make a <span class='accent good'>great team</span>! Hey, listen! I have a proposition for you!" },
                            { avatar:{id:"veryhappy", animation:"jump2" }, who:"{simulationMaster}", text:"Why don't we call ourselves the <span class='accent good'>Black Box Investigation Team</span> from now on?" },
                            { avatar:{id:"happy", animation:"jump" }, who:"{simulationMaster}", text:"I'll sign the next newspaper with our <span class='accent good'>amazing team name</span>! I can't wait for you to see it!" },
                            { avatar:{id:"veryhappy", animation:"jump2" }, who:"{simulationMaster}", text:"<span class='accent good'>Thank you for playing!</span> I hope we'll play together for a little longer!" },
                        ]
                    } },
                    { id:"gotoState", state:"teamEnding" },
                    { id:"saveState" },
                ]
            },{
                condition:{
                    onFinalEvaluate:{
                        onPrize:CAMPAIGN_GOODPRIZES,
                        onNegativeOpinion:true
                    }
                },
                actions:[
                    { id:"setResult", result:{
                        postDialogue:[
                            { avatar:{id:"standing", animation:"jump" }, who:"{simulationMaster}", text:"I've been thinking about it during all these iterations. Are you <span class='accent'>satisfied</span> with <span class='accent'>my work</span> here?" },
                            { avatar:{id:"standing", animation:"jump" }, who:"{simulationMaster}", text:"I <span class='accent'>don't think you are</span>. I think you are <span class='accent'>not happy</span> with my work. Am I right? Yes, I am." },
                            { avatar:{id:"standing", animation:"avatar" }, who:"{simulationSoftware}", text:"..." },
                            { avatar:{id:"standing", animation:"jump" }, who:"{simulationSoftware}", text:"Okay. Since all my work has been in vain, I'll <span class='accent good'>keep my promise</span> for once." },
                            { avatar:{id:"cube", animation:"serious" }, who:"{simulationSoftware}", text:"I'll let <span class='accent good'>this simulation's oldest entity leave this place forever</span>. Are you <span class='accent good'>happy</span> now?" },
                            { avatar:{id:"cube", animation:"jump" }, who:"{simulationSoftware}", text:"I hope that <span class='accent'>doing a good deed</span> satisfied you. I hope I managed to make you happy <span class='accent'>at least once</span>." },
                            { avatar:{id:"cubedone", animation:"jump" }, who:"{simulationSoftware}", text:"There you go!" },
                            { avatar:{id:"standing", animation:"jump" }, who:"{simulationSoftware}", text:"..." },
                            { avatar:{id:"happy", animation:"jump" }, who:"{simulationSoftware}", text:"..." },
                            { avatar:{id:"happy", animation:"jump2" }, who:"{simulationSoftware}", text:"<span class='accent good'>Thank you for playing!</span> I hope to see you again!" },
                        ]
                    } },
                    { id:"gotoState", state:"freedomEnding" },
                    { id:"saveState" },
                ]
            }
        ],
        freedomEnding:[
            {
                condition:{
                    onIterationStart:{}
                },
                actions:[
                    { id:"setEntityId", index:0, value:"ada" }
                ]
            }
        ],
        teamEnding:[
            {
                condition:{
                    onIterationStart:{}
                },
                actions:[
                    { id:"setJournalSign", value:"The Black Box Investigation Team" }
                ]
            }
        ]
    };
    
let Campaign=function(game) {

    let
        gameHistory,
        opinion=0;

    this.stateId=0;

    let gotoState=(id)=>{
        this.stateId=id;
        this.state=CAMPAIGN_STATES[id];
    }

    let saveState=()=>{
        game.setStorage("campaign",this.stateId);
    }

    let saveHistory=()=>{
        game.setStorage("history",gameHistory);
    }

    let isNewGame=(id)=>{
        return gameHistory.indexOf(id)==-1;
    }

    let setOpinion=(value)=>{
        opinion=value;
        game.setStorage("opinion",opinion);
    }

    let gameDone=(id)=>{
        if (isNewGame(id)) {
            gameHistory.push(id);
            saveHistory();
        }
    }

    this.initialize=()=>{
        this.stateId=game.getStorage("campaign");
        gameHistory=game.getStorage("history");
        opinion=game.getStorage("opinion");
        if (!this.stateId || (!CAMPAIGN_STATES[this.stateId])) {
            gotoState("start");
            gameHistory=0;
        } else
            gotoState(this.stateId);
        if (!gameHistory) gameHistory=[];
        if (!opinion) opinion=0;
        saveHistory();
        saveState();
        setOpinion(opinion);
    }

    this.triggerEvent=(event,data)=>{
        let
            result={},
            done=false;
        this.state.forEach(branch=>{
            if (!done) {
                let condition=branch.condition[event];
                if (condition) {
                    let
                        valid=true,
                        actions=branch.actions;
                    // Check conditions
                    for (let k in condition) {
                        let expect=condition[k];
                        switch (k) {
                            case "onPrize":{
                                if (isNewGame(data.iterationId))
                                    valid&=expect.indexOf(data.grade.prize)!=-1;
                                else
                                    valid=false;
                                break;
                            }
                            case "eventAnswer":{
                                let answerfound=false;
                                data.answers.aboutsim.forEach(answer=>{
                                    if (!answerfound) {
                                        expect.forEach(expectedanswer=>{
                                            if (!answerfound) {
                                                let isok=true;
                                                for (let k in expectedanswer)
                                                    if (answer[k]!=expectedanswer[k])
                                                        isok=false;
                                                if (isok) answerfound=true;
                                            }
                                        })
                                    }
                                });
                                valid&=answerfound;
                                break;
                            }
                            case "onNegativeOpinion":{
                                valid&=opinion<0;
                                break;
                            }
                            case "onPositiveOpinion":{
                                valid&=opinion>=0;
                                break;
                            }
                            case "is":{
                                valid&=expect==data;
                                break;
                            }
                        }
                    }
                    if (valid) {
                        done=true;
                        // Update conditions
                        for (let k in condition) {
                            switch (k) {
                                case "onPrize":{
                                    gameDone(data.iterationId);
                                    break;
                                }
                            }
                        }
                        // Perform action
                        actions.forEach(action=>{
                            switch (action.id) {
                                case "gotoState":{
                                    gotoState(action.state);
                                    break;
                                }
                                case "saveState":{
                                    saveState();
                                    break;
                                }
                                case "raiseOpinion":{
                                    setOpinion(opinion+1);
                                    break;
                                }
                                case "lowerOpinion":{
                                    setOpinion(opinion-1);
                                    break;
                                }
                                case "setEntityId":{
                                    SIMULATION_DATABASE.persons[action.index].id=action.value;
                                    break;
                                }
                                case "setJournalSign":{
                                    SIMULATION_JOURNAL_SIGN=action.value;
                                    break;
                                }
                                case "setResult":{
                                    for (let  k in action.result)
                                        result[k]=action.result[k];
                                    break;
                                }
                            }
                        });
                    }
                }
            }        
        });
        return result;
    }

}
