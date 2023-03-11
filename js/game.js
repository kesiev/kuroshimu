let SCRIPTS={
    main:[
        { avatar:{id:"standing", animation:"aside" }, label:"intro", who:"{simulationMaster}", text:"Welcome back! Which iteration do you want to play?", question:[
            { label:"Today's", setTodayIterationId:true, gotoLabel:"generate" },
            { label:"Previous" },
            { label:"Go back", gotoTitleScreen:true },
        ] },
        { who:"{simulationMaster}", text:"Select the iteration you want to play. You can select the <span class='accent'>{mastermindPastLimitString}</span>!", selectIteration:{
            selectLabel:"Play iteration",
            goBackLabel:"Go back",
            goBackGotoLabel:"intro"
        } },
        { label:"generate", avatar:{id:"standing", animation:"asideleave" }, who:"{simulationMaster}", text:"Very well! Let the simulation <span class='accent'>begin</span>!", startIteration:true },
        { avatar:{id:"standing", animation:"aside" }, who:"{simulationMaster}", text:"Iteration <span class='accent'>{currentIteration}</span> is just over and my <span class='accent'>newspaper</span> is ready!", question:[
            { label:"Download it", downloadJournal:true },
            { label:"I already have it" }
        ] },
        { avatar:{id:"standing", animation:"asidenormal" }, who:SIMULATION_MASTER, text:"It's time to get to work!" },
    ],
    endInvestigation:[
        { who:"{simulationMaster}", text:"Do you want to end your investigation? <span class='accent'>Your notebook will be lost!</span>", question:[
            { label:"Continue" },
            { label:"End", endInvestigation:true },
        ]}
    ],
    tutorial:[
        { who:"{simulationSoftware}", text:"System loaded successfully. Hit the screen to start.", setTodayIterationId:true },
        { avatar:{id:"standing", animation:"appear" }, who:"{simulationSoftware}", text:"Hello visitor! Do you want to play a little game?" },
        { avatar:{id:"shocked", animation:"jump2" }, who:"{simulationSoftware}", text:"Very well... Let me introduce myself!" },
        { avatar:{id:"happy", animation:"serious" }, who:"{simulationMaster}", text:"I'm <span class='accent'>{simulationMaster}</span>, the master AI of a simulated world set in the year 201X!" },
        { avatar:{id:"standing", animation:"jump2" }, who:"{simulationMaster}", text:"Every day I run a new iteration: I create <span class='accent'>{simulationDatabase.persons.length} entities</span> and let them live their life for <span class='accent'>{simulationLengthDays} days</span>. Don't worry. It just takes a few seconds in your world!" },
        { who:"{simulationMaster}", text:"Every simulation's Sunday night I interview the most interesting entities to make a <span class='accent'>newspaper</span>! No entity can read it: It's just for you!" },
        { avatar:{id:"standing", animation:"jump" },who:"{simulationMaster}", text:"Your job is to uncover facts from entities' opinions! A love affair? A bad day? I can't wait to hear what you'll discover!" },
        { avatar:{id:"shocked", animation:"serious" }, who:"{simulationMaster}", text:"But beware. You're going to investigate a <span class='accent'>simulation</span>, not a story. And simulations have <span class='accent'>no specific purposes</span>, as in life..." },
        { avatar:{id:"standing", animation:"jump" }, who:"{simulationMaster}", text:"And, as in life, there are no facts ready to happen in a way that you can find out about them. My newspaper is a legacy of an iteration." },
        { who:"{simulationMaster}", text:"Long story short, you won't find any clue made for you to discover a specific thing. It's up to your <span class='accent'>intuition</span> and <span class='accent'>interpretation</span> if there is something to uncover." },
        { avatar:{id:"standing", animation:"sad" }, who:"{simulationMaster}", text:"Sadly it's not the same for me since I run all the facts. It's so boring I decided to <span class='accent'>meet the entities</span> at each iteration beginning to spice things up!" },
        { avatar:{id:"happy", animation:"jump" }, who:"{simulationMaster}", text:"First, I gift them a special watch. It also measures the entity <span class='accent'>stress level</span>. I'll use their data and draw charts in the newspaper." },
        { avatar:{id:"evil", animation:"serious" }, who:"{simulationMaster}", text:"Then I tell one of them a little lie: I promise to release it from the simulation if it <span class='accent'>murders</span> another entity before the simulation ends." },
        { avatar:{id:"standing", animation:"leave" }, who:"{simulationMaster}", text:"No more talking! Let the simulation <span class='accent'>begin</span>!", startIteration:true },
        { avatar:{id:"standing", animation:"aside" }, who:"{simulationMaster}", text:"Well, iteration {todayIteration} is just over! Here you are a copy of my <span class='accent'>newspaper</span>!", question:[
            { label:"Download it", downloadJournal:true },
            { label:"I already have it" }
        ] },
        { avatar:{id:"standing", animation:"asidenormal" }, who:SIMULATION_MASTER, text:"Enjoy the reading!" },
    
    ],
    tutorialNotebook:[
        { avatar:{id:"standing", animation:"appear" }, who:SIMULATION_MASTER, text:"I've another gift for you. It's a special notebook to note down your discoveries!" },
        { avatar:{id:"standing", animation:"leave" }, who:SIMULATION_MASTER, text:"You can track <span class='accent'>details about the entities</span> and <span class='accent'>up to {questionnaireDetails} juicy facts</span> that may be happened during the iteration." },
        { who:SIMULATION_MASTER, text:"When you feel confident of your discoveries you may ask me to review your notes. I'll give you a <span class='accent'>score</span> and a <span class='accent'>ranking</span>!" },
        { who:SIMULATION_MASTER, text:"I won't help you with anything but don't be afraid to ask me multiple times or even blind guess. You'll get better the more you play." },
        { avatar:{id:"standing", animation:"appear" },who:SIMULATION_MASTER, text:"I also have two prizes for you! If you get a good rank in <span class='accent'>{questionnaireAttempts} reviews</span> I'll tell you all the facts that happened in the iteration!" },
        { avatar:{id:"happy", animation:"jump2" }, who:SIMULATION_MASTER, text:"And if you get a VERY good rank... I'll tell you <span class='accent'>everything I know</span> about the iteration!" },
        { avatar:{id:"standing", animation:"leave" }, who:SIMULATION_MASTER, text:"Enough chatter! Let's get to work!" }
    ]
};

function Game(settings,prefix) {

    if (!prefix) prefix="";

    const
        AVATAR_LIST=[
            "standing",
            "shocked",
            "happy",
            "evil",
            "veryhappy",
            "cube",
            "cubedone"
        ],
        ITERATION_CHUNKS=30,
        ITERATION_DELAY=100,
        DIALOGUE_SPEED=500,
        ANIMATION_DELAY=100,
        FADE_SPEED=1000

    let
        loadingAvatar=0,
        avatars={},
        avatar,
        mastermind=new Mastermind(prefix,this),
        storage,
        placeholders,
        questionnaireResult,
        questionnaireFinalResult,
        questionnaireFooter,
        questionnaireButtonBar,
        questionnaireAttempts,
        questionnaireAnswers,
        questionnaireLastUpdate,
        factLogs,
        lastLine,
        askingQuestion,
        overlay,
        questionnaire,
        nextarrow,
        nextEnabled=false,
        lineId=0,
        script;

    let newNode=(type,classname,into)=>{
        let node=document.createElement(type);
        node.className=classname;
        if (into) into.appendChild(node);
        return node;
    }

    let resetNode=(node)=>{
        if (node) {
            if (node.parentNode)
                node.parentNode.removeChild(node);
            node.innerHTML="";
        }
    }

    let gotoLabel=(label)=>{
        for (let i=0;i<script.length;i++) {
            if (script[i].label == label) {
                lineId=i-1;
            }
        }
    }

    let canGoNext=()=>{
        if (nextEnabled) {
            nextEnabled=false;
            return true;
        } else return false;
    }

    let enableNext=()=>{
        nextEnabled=true;
    }

    let replacePlaceholders=(sentence,placeholders)=>{
        return sentence.replace(/{([^}]+)}/g,(m,m1)=>{
            let
                root=placeholders,
                parts=m1.split(".");
            parts.forEach(part=>{
                root=root[part];
            })
            return root;
        });
    }

    let executeLineLogic=(line)=>{
        let keepGoing=true;
        if (line) {
            if (line.gotoLabel)
                gotoLabel(line.gotoLabel);
            if (line.setTodayIterationId) {
                mastermind.setTodayIterationId();
                placeholders.currentIteration=mastermind.getIterationId();
            }
            if (line.gotoTitleScreen) {
                keepGoing=false;
                endScript();
                fadeOut(cutscene,"cutscene",true,()=>{
                    this.titleScreen();
                });
            }
            if (line.endInvestigation) {
                keepGoing=false;
                endOverlay(()=>{
                    fadeOut(questionnaire,"questionnaire",true,()=>{
                        this.titleScreen();
                    })
                })
            }
            if (line.downloadJournal)
                if (mastermind.isFinalized())
                    mastermind.downloadJournalPdf();
                else
                    debugger;
        }
        return keepGoing;
    }

    let newActionButton=(label,onclick,into)=>{
        let actionbutton=newNode("div","actionbutton",into);
        actionbutton.innerHTML=label;
        actionbutton.onclick=onclick;
        return actionbutton;
    }

    let nextLine=(isfirst,cb)=>{
        if (lastLine && lastLine.startIteration) {
            lastLine=0;
            startIteration(cb);
        } else {
            if (executeLineLogic(lastLine)) {
                lineId++;
                lastLine=script[lineId];
                if (lastLine) {

                    dialogueBox.parentNode.onclick=()=>{
                        if (!askingQuestion && canGoNext())
                            nextLine(false,cb);
                    };
                    dialogueBox.parentNode.style.cursor="";
                    dialogueTitle.innerHTML=replacePlaceholders(lastLine.who,placeholders);
                    dialogueContent.innerHTML=replacePlaceholders(lastLine.text,placeholders);
                    if (lastLine.avatar)
                        showAvatar(avatars[lastLine.avatar.id],lastLine.avatar.animation,dialogueBox.parentNode);
                    if (lastLine.question) {

                        let question=lastLine.question;
                        resetNode(dialogueQuestions);
                        question.forEach(answer=>{
                            newActionButton(answer.label,()=>{
                                if (canGoNext()) {
                                    dialogueQuestions.parentNode.removeChild(dialogueQuestions);
                                    if (executeLineLogic(answer))
                                        nextLine(0,cb);
                                }
                            },dialogueQuestions);
                        })
                        askingQuestion=true;

                    } else if (lastLine.selectIteration) {

                        resetNode(dialogueQuestions);                    
                        let
                            iterations=mastermind.getAvailableIterationsIds(),
                            iterationSelector=newNode("select","iterationselector",dialogueQuestions);

                        iterations.forEach(iteration=>{
                            let option=newNode("option",0,iterationSelector);
                            option.innerHTML="Iteration "+iteration;
                            option.value=iteration;
                        });

                        newActionButton(lastLine.selectIteration.selectLabel,()=>{
                            if (canGoNext()) {
                                dialogueQuestions.parentNode.removeChild(dialogueQuestions);
                                mastermind.setIterationId(iterationSelector.value);
                                placeholders.currentIteration=mastermind.getIterationId();
                                nextLine(0,cb);
                            }
                        },dialogueQuestions);

                        newActionButton(lastLine.selectIteration.goBackLabel,()=>{
                            if (canGoNext()) {
                                dialogueQuestions.parentNode.removeChild(dialogueQuestions);
                                gotoLabel(lastLine.selectIteration.goBackGotoLabel);
                                nextLine(0,cb);
                            }
                        },dialogueQuestions);
                        askingQuestion=true;

                    } else {

                        askingQuestion=false;

                    }

                    setTimeout(()=>{

                        if (askingQuestion) {

                            dialogueBox.parentNode.appendChild(dialogueQuestions);

                        } else {

                            dialogueBox.parentNode.style.cursor="pointer";
                            nextarrow=newNode("div","arrow-down",dialogueContent);
                            askingQuestion=false;

                        }

                        enableNext();

                    },DIALOGUE_SPEED+(isfirst?FADE_SPEED:0));
                } else {
                    dialogueBox.parentNode.onclick=0;
                    dialogueBox.parentNode.style.cursor="";
                    if (cb) cb();
                }
            }
        }
    }

    let endOverlay=(cb)=>{
        fadeOut(overlay,"overlay",false,cb);
    }

    let fadeIn=(node,classname,cb)=>{
        node.className=classname;
        setTimeout(()=>{
            node.className=classname+" appear";
            if (cb)
                setTimeout(cb,FADE_SPEED);
        },ANIMATION_DELAY);
    }

    let fadeOut=(node,classname,resetscroll,cb)=>{
        node.className=classname;
        node.style.cursor="";
        setTimeout(()=>{
            hideAvatar();
            if (resetscroll) screen.scrollTo(0, 0);
            setTimeout(()=>{
                node.parentNode.removeChild(node);
                if (cb) cb();
            },ANIMATION_DELAY)
        },FADE_SPEED);
    }

    let startIteration=(cb)=>{
        this.campaign.triggerEvent("onIterationStart");
        dialogueTitle.innerHTML=SIMULATION_SOFTWARE;
        dialogueContent.innerHTML="Running iteration <span class='accent'>"+mastermind.getIterationId()+"</span>. Please wait...";
        iterate(cb);
    }

    let iterate=(cb)=>{
        
        if (mastermind.isIterated()) {

            if (mastermind.isFinalized()) {

                nextLine(0,cb);

            } else {

                mastermind.finalize(()=>{

                    nextLine(0,cb);

                })

            }

        } else {

            for (let i=0;i<ITERATION_CHUNKS;i++) {
                if (mastermind.iterate())
                    break;
            }

            setTimeout(()=>{
                iterate(cb)
            },ITERATION_DELAY);

        }
    }

    let runScript=(runscript,cb)=>{
        lastLine=0;
        script=runscript;
        lineId=-1;
        nextEnabled=false;
        nextLine(true,cb);
    }

    let endScript=()=>{
        if (nextarrow && nextarrow.parentNode)
            nextarrow.parentNode.removeChild(nextarrow);
        nextarrow=0;
    }

    let moveDialogueBoxInto=(into)=>{
        if (dialogueBox.parentNode)
            dialogueBox.parentNode.removeChild(dialogueBox);
        into.appendChild(dialogueBox);
    }

    let randomElement=(list)=>{
        return list[Math.floor(Math.random()*list.length)]
    }

    let summarizeResult=(result,icon)=>{
        return "<span class='rating grade "+result.grade.style+"'>"+result.grade.letter+"</span> "+icon+result.totalScore+"/"+result.maxScore+" points ("+result.percScore+"%)";
    }

    let updateRibbon=(node)=>{
        if (questionnaireFinalResult) {
            let ribbon=newNode("div","ribbon final grade "+questionnaireFinalResult.grade.style,node);
            ribbon.innerHTML=questionnaireFinalResult.grade.letter;
        } else {
            let ribbon=newNode("div","ribbon partial",node);
            ribbon.innerHTML="<b>"+questionnaireAttempts+"</b><br>"+LANGUAGE.solvePlural("rating","ratings",questionnaireAttempts)+"<br>to the<br>final<br>grade";
        }
    }

    let updateFooter=(node)=>{
        node.innerHTML=questionnaireLastUpdate;
    }

    let addFactLogsButton=(cb)=>{
        let factlogsbutton=newNode("div","actionbutton",questionnaireButtonBar);
        factlogsbutton.innerHTML="Show the Fact Logs";
        factlogsbutton.onclick=()=>{
            if (canGoNext()) {
                fadeOut(questionnaire,"questionnaire",true,()=>{
                    resetNode(factLogs);
                    factLogs=newNode("div","factlogs");
                    let
                        factLogsTitle=newNode("div","factlogstitle",factLogs),
                        factLogsData=newNode("div","factlogsdata",factLogs),
                        factLogsButtonBar=newNode("div","buttonbar",factLogs),
                        backNotebook=newNode("div","actionbutton",factLogsButtonBar);
                    backNotebook.innerHTML="Go to the notebook";
                    factLogsTitle.innerHTML=mastermind.getIterationId()+" Fact Logs";
                    mastermind.renderFactLogs(factLogsData);
                    screen.appendChild(factLogs);
                    backNotebook.onclick=()=>{
                        if (canGoNext())
                            fadeOut(factLogs,"factlogs",true,()=>{
                                this.showQuestionnaire(mastermind,cb,true);
                            })
                    }
                    fadeIn(factLogs,"factlogs",()=>{
                        let dialogue=getCallbackDialogue(cb.onShowFactLogsScript);
                        if (dialogue)
                            this.runOverlay(dialogue,enableNext);
                        else
                            enableNext();
                    });
                });
            }
        }
    }

    let addSimulationLogsButton=(cb)=>{
        let simulationlogsbutton=newNode("div","actionbutton",questionnaireButtonBar);
        simulationlogsbutton.innerHTML="Download Logs";
        simulationlogsbutton.onclick=()=>{
            let dialogue=getCallbackDialogue(cb.onDownloadSimulationLogsScript);
            if (dialogue)
                this.runOverlay(dialogue,()=>{
                    enableNext();
                    mastermind.downloadSimulationLogs();
                });
            else {
                mastermind.downloadSimulationLogs();
                enableNext();
            }
        }
    }

    let getCallbackDialogue=(cb)=>{
        if (cb) return cb();
        else return 0;
    }

    let unlockPrizes=(cb)=>{
        if (questionnaireFinalResult) {
            let prize=questionnaireFinalResult.prize;
            if (prize) {
                if (prize.unlockFactLogs)
                    addFactLogsButton(cb);
                if (prize.unlockSimulationLogs)
                    addSimulationLogsButton(cb);
            }
        }
    }

    let hideAvatar=()=>{
        if (avatar) {
            avatar.parentNode.removeChild(avatar);
            avatar.className="avatar";
            avatar=0;
        }
    }

    let showAvatar=(newavatar,classname,into)=>{
        if ((avatar !== newavatar) || (newavatar.parentNode !== into)) {
            hideAvatar();
            avatar=newavatar;
            into.appendChild(newavatar);
        }
        avatar.className="avatar "+classname;
    }

    // Public

    this.getStorage=(key)=>{
        return storage[key];
    }

    this.setStorage=(key,value)=>{
        storage[key]=value;
        if (window.localStorage !== undefined)
            window.localStorage[GAME_STORAGE]=JSON.stringify(storage);
    }

    this.titleScreen=(buttons)=>{
        if (!titleScreen.parentNode) {
            titleScreenButtons.innerHTML="";
            screen.appendChild(titleScreen);
            fadeIn(titleScreen,"titlescreen");
        }
        settings.mainMenu.forEach(button=>{
            if (button.setFullScreen) {
                newActionButton(button.label,()=>{
                    if (screen.requestFullscreen)
                        screen.requestFullscreen();
                    else if (screen.webkitRequestFullscreen)
                        screen.webkitRequestFullscreen();
                    else if (screen.msRequestFullscreen)
                        screen.msRequestFullscreen();
                },titleScreenButtons);
            } else
                newActionButton(button.label,()=>{
                    if (canGoNext()) {
                        fadeOut(titleScreen,"titlescreen",true,()=>{
                            button.onClick();
                        })
                    }
                },titleScreenButtons);
        });
        enableNext();
        settings.onTitleScreen(this);
    }

    this.runCutscene=(cb)=>{
        if (!cutscene.parentNode) {
            screen.appendChild(cutscene);
            fadeIn(cutscene,"cutscene");
        }
        moveDialogueBoxInto(cutscene);
        runScript(getCallbackDialogue(cb.onEnterScript),()=>{
            endScript();
            fadeOut(cutscene,"cutscene",true,cb.onExit);
        });
    }

    this.runOverlay=(runscript,cb)=>{
        resetNode(overlay);
        overlay=newNode("div","overlay",screen);
        moveDialogueBoxInto(overlay);
        runScript(runscript,()=>{
            endScript();
            fadeOut(overlay,"overlay",false,cb);
        });
        fadeIn(overlay,"overlay");
    }

    this.showQuestionnaire=(cb,keep)=>{
        if (!keep) {
            questionnaireFinalResult=0;
            questionnaireResult=0;
            questionnaireAttempts=QUESTIONNAIRE_ATTEMPTS;
            questionnaireAnswers=0;
            questionnaireLastUpdate="<p>"+QUESTIONNAIRE_TUTORIAL+"</p>";
        }

        resetNode(questionnaire);
        questionnaire=newNode("div","questionnaire");

        let notebook=newNode("div","notebook",questionnaire);
        questionnaireAnswers=mastermind.renderQuestionnaire(notebook,questionnaireAnswers);
        
        questionnaireFooter=newNode("div","footer",notebook);
        updateFooter(questionnaireFooter);
        updateRibbon(questionnaireFooter);

        questionnaireButtonBar=newNode("div","buttonbar",questionnaire);        
        let
            ratebutton=newNode("div","actionbutton",questionnaireButtonBar),
            endinvestigationbutton=newNode("div","actionbutton",questionnaireButtonBar);
        ratebutton.innerHTML="Rate my notebook!";
        endinvestigationbutton.innerHTML="End investigation";

        unlockPrizes(cb);

        endinvestigationbutton.onclick=()=>{
            if (canGoNext()) {
                this.runOverlay(settings.onEndInvestigation(this),()=>{
                    enableNext();
                });
            }
        }

        ratebutton.onclick=()=>{
            if (canGoNext()) {

                let
                    isFinalAttempt=false;

                if (questionnaireAttempts) {
                    questionnaireAttempts--;
                    if (!questionnaireAttempts)
                        isFinalAttempt=true;
                }

                let
                    placeholders,
                    dialogue,
                    trend,
                    result=mastermind.evaluateQuestionnaire(),
                    campaignEvents=this.campaign.triggerEvent(questionnaireFinalResult?"onExtraEvaluate":isFinalAttempt?"onFinalEvaluate":"onEvaluate",result),
                    sentence=(questionnaireFinalResult?"":randomElement(result.grade.sentences)+" ")+randomElement(QUESTIONNAIRE_BASIC_SENTENCES.summary);

                // Prepare evaluation result
                questionnaireLastUpdate="";
                if (questionnaireResult) {
                    if (result.totalScore>questionnaireResult.totalScore) {
                        sentence+=" "+randomElement(QUESTIONNAIRE_BASIC_SENTENCES.increase);
                        trend="increase";
                    } else if (result.totalScore<questionnaireResult.totalScore) {
                        sentence+=" "+randomElement(QUESTIONNAIRE_BASIC_SENTENCES.decrease);
                        trend="decrease";
                    } else {
                        sentence+=" "+randomElement(QUESTIONNAIRE_BASIC_SENTENCES.same);
                        trend="same";
                    }
                    questionnaireLastUpdate+="<p><b>Previous rating:</b> "+summarizeResult(questionnaireResult,"")+"</p>";
                }
                placeholders={
                    result:result
                };
                sentence=replacePlaceholders(sentence,placeholders);

                questionnaireResult=result;
                questionnaireLastUpdate+="<p><b>Latest rating:</b> "+summarizeResult(result,trend?"<span class='trend "+trend+"'></span> ":"")+"</p>";
                dialogue=[
                    { avatar:{id:"standing", animation:"appear" }, who:SIMULATION_MASTER, text:QUESTIONNAIRE_SENTENCE },
                    { avatar:result.grade.avatar, who:SIMULATION_MASTER, text:sentence },
                ];

                // Add final attempt events
                if (isFinalAttempt) {
                    questionnaireFinalResult=result;
                    questionnaireFinalResult.prize=QUESTIONNAIRE_PRIZES[result.grade.prize];
                    dialogue.push({ avatar:questionnaireFinalResult.prize.avatar, who:SIMULATION_MASTER, text:replacePlaceholders(randomElement(questionnaireFinalResult.prize.sentences),placeholders) });
                }

                // Add campaign dialogue
                if (campaignEvents.postDialogue)
                campaignEvents.postDialogue.forEach(line=>{
                    dialogue.push(line);
                })

                if (cb.onRated) cb.onRated(result);
                this.runOverlay(dialogue,()=>{
                    enableNext();
                    updateFooter(questionnaireFooter);
                    updateRibbon(questionnaireFooter);
                    if (isFinalAttempt)
                        unlockPrizes(cb);
                });
            }
        }
    
        screen.appendChild(questionnaire);

        fadeIn(questionnaire,"questionnaire",()=>{
            let script=getCallbackDialogue(cb.onEnterScript);
            if (script)
                this.runOverlay(script,()=>{
                    enableNext();
                    if (cb.onEnter) cb.onEnter();
                });
            else {
                enableNext();
                if (cb.onEnter) cb.onEnter();
            }
        });
        
    }

    let loadAvatar=()=>{
        if (avatar) {
            avatar.parentNode.removeChild(avatar);
            avatar=0;
        }
        if (!AVATAR_LIST[loadingAvatar]) {
            settings.onStart(this);
        } else {
            let
                id=AVATAR_LIST[loadingAvatar],
                url=prefix+"img/"+id+".svg",
                img=newNode("img","");
            avatar=newNode("div","loading avatar");
            avatar.style.backgroundImage="url("+url+")";
            img.src=url;
            img.style.visibility="hidden";
            img.style.position="absolute";
            img.style.left="-10000px";
            img.onload=loadAvatar
            document.body.appendChild(img);
            document.body.appendChild(avatar);
            avatars[id]=avatar;
            loadingAvatar++;
        }

    }

    this.start=()=>{
        loadAvatar();
    }

    // Initialize UI
    
    let
        screen=newNode("div","screen",document.body),
        cutscene=newNode("div","cutscene");
        background=newNode("div","background",cutscene);
    for (let i=0;i<20;i++)
        newNode("span","",background);

    let
        dialogueQuestions=newNode("div","dialoguequestions"),
        dialogueBox=newNode("div","dialoguebox"),
        dialogueTitle=newNode("div","dialoguetitle",dialogueBox),
        dialogueContent=newNode("div","dialoguecontent",dialogueBox),
        titleScreen=newNode("div","titlescreen");

    newNode("div","logo",titleScreen);
    newNode("div","shade",titleScreen);
    let titleScreenButtons=newNode("div","buttons",titleScreen);
    let footer=newNode("div","footer",titleScreen);
    footer.innerHTML=settings.mainMenuFooter;
    newNode("div","avatar avatar1",titleScreen);
    newNode("div","avatar avatar2",titleScreen);

    // Initialize variables

    placeholders={
        todayIteration:mastermind.getTodayIterationId(),
        mastermindPastLimitString:MASTERMIND_PAST_LIMIT_STRING,
        simulationSoftware:SIMULATION_SOFTWARE,
        simulationMaster:SIMULATION_MASTER,
        simulationDatabase:SIMULATION_DATABASE,
        simulationLengthDays:SIMULATION_LENGTH_DAYS,
        questionnaireDetails:QUESTIONNAIRE_DETAILS,
        questionnaireAttempts:QUESTIONNAIRE_ATTEMPTS
    };

    if (window.localStorage && window.localStorage[GAME_STORAGE])
        storage=JSON.parse(window.localStorage[GAME_STORAGE]);
    else
        storage={};

    // Initialize campaign
    
    this.campaign=new Campaign(this);
    this.campaign.initialize();

}

Game.run=function() {
    let game=new Game({
        onStart:(game)=>{
            if (game.getStorage("first"))
                game.titleScreen();
            else
                game.runCutscene({
                    onEnterScript:()=>{
                        return SCRIPTS.tutorial;
                    },
                    onExit:()=>{
                        game.showQuestionnaire({
                            onEnterScript:()=>{
                                return SCRIPTS.tutorialNotebook;
                            }
                        });
                    }
                });
        },
        onEndInvestigation:(game)=>{
            return SCRIPTS.endInvestigation;
        },
        onTitleScreen:(game)=>{
            game.setStorage("first",true);
        },
        mainMenuFooter:GAME_FOOTER,
        mainMenu:[
            {
                label:"Start investigating",
                onClick:()=>{
                    game.runCutscene({
                        onEnterScript:()=>{
                            return SCRIPTS.main;
                        },
                        onExit:()=>{
                            game.showQuestionnaire({
                                onEnterScript:()=>{
                                    // Hello!
                                }
                            });
                        }
                    });
                }
            },{
                label:"Play tutorial",
                onClick:()=>{
                    game.runCutscene({
                        onEnterScript:()=>{
                            return SCRIPTS.tutorial;
                        },
                        onExit:()=>{
                            game.showQuestionnaire({
                                onEnterScript:()=>{
                                    return SCRIPTS.tutorialNotebook;
                                }
                            });
                        }
                    });
                }
            },{
                label:"Go full screen",
                setFullScreen:true
            }
        ]
    });

    // Starts the game

    game.start();
}