const
    GAME_STORAGE="_KUROSHIMU",
    GAME_VERSION=1,
    GAME_NAME="Kuroshimu",
    GAME_FOOTER="Better with Firefox/Chrome ‐ "+GAME_NAME+" 0."+GAME_VERSION+"b ‐ &copy; 2023 by KesieV ‐ Sources at <a target='_blank' href='https://github.com/kesiev/kuroshimu'>github.com/kesiev/kuroshimu</a> - <a href='hintbox/'>Stuck?</a>";

const
    DAYS_DELAY_VERYSHORT=2,
    DAYS_DELAY_SHORT=3,
    DAYS_DELAY_MID=4,
    DAYS_DELAYFIRSTMURDER=21,
    DAYS_DELAYNEXTMURDER=1,
    THRESHOLD_STATS_MAX=10,
    THRESHOLD_STRESS_ENDREST = 2,
    THRESHOLD_STRESS_GOODMOOD = 4,
    THRESHOLD_STRESS_STRESSED = 9,
    THRESHOLD_STRESS_FAINT = 10,
    INCREASE_THRESHOLD_STRESS_FAINT = 1,
    THRESHOLD_BIAS_DECLARE = 3,
    THRESHOLD_LIVES = 2,
    THRESHOLD_GOOD_PERSON = 10,
    THRESHOLD_BAD_PERSON = -THRESHOLD_GOOD_PERSON,
    LOVE_COOLDOWN_RATIO = 3,
    STRESS_VERYLOW = 1,
    STRESS_LOW = 2,
    STRESS_MID = 3,
    STRESS_HIGH = 4,
    SUSPECT_VERYLOW = 1,
    SUSPECT_LOW = 2,
    SUSPECT_MID = 4,
    SUSPECT_HIGH = 6,
    LOVE_MARRIAGE_RATIO = 7,
    LOVE_LOVER_RATIO = 3,
    MONEY_START = 40;

const
    MASTERMIND_PAST_LIMIT=7,
    MASTERMIND_PAST_LIMIT_STRING="past 6 iterations";

const
    SIMULATION_SOFTWARE="DATAMAPS-I",
    SIMULATION_MASTER="The Journalist",
    SIMULATION_LENGTH_DAYS = 7*8,
    SIMULATION_BIASES=5,
    SIMULATION_MINBIAS=1,
    SIMULATION_MAXBIAS=3;

let
    SIMULATION_JOURNAL_SIGN=SIMULATION_MASTER;

const
    SIMULATION_DATABASE={

    // --- Persons

    persons:[
        { id:"anne", tags:{ gender:"B", biases:[] } },
        { id:"billy", tags:{ gender:"A", biases:[] } },
        { id:"carol", tags:{ gender:"B", biases:[] } },
        { id:"david", tags:{ gender:"A", biases:[] } },
        // Erian and Finn have random gender
        { id:"erian", tags:{ biases:[] } },
        { id:"finn", tags:{ biases:[] } }
    ],
    personStatPoints:40,
    personStats:[
        "stamina",
        "constitution",
        "dexterity", "intelligence",
        "wisdom", "charisma"
    ],
    personFlirtStats:[
        "constitution",
        "dexterity", "intelligence",
        "wisdom", "charisma"
    ],
    personDefaultCommitments:[
        { at:{ time:0 }, commitment:{ entity:":me", action:"wakeUp" } },
        { at:{ time:0 }, commitment:{ entity:":me", action:"breakfast", place:{ taggedAs: "breakfastAt" } } },
        { at:{ time:2 }, commitment:{ entity:":me", action:"lunch", place:{ taggedAs: "lunchAt" } } },
        { at:{ time:4 }, commitment:{ entity:":me", action:"dinner", place:{ taggedAs: "dinnerAt" } } },
        { at:{ time:5 }, commitment:{ entity:":me", action:"sleep", place:{ taggedAs: "sleepAt" } } }
    ],
    personFeatures:[
        { id:"goodlooking", identifiers:["a good-looking type","an attractive type","a lovely type"], uses:[ "constitution", "charisma" ] },
        { id:"fit", identifiers:["a very fit type","an healthy type","an in-shape type"], uses:[ "constitution", "wisdom" ] },
        { id:"handy", identifiers:["a practical type","a handyman type"], uses:[ "constitution", "dexterity" ] },
        { id:"jacktrades", identifiers:["a jack-of-all-trades","a factotum type","an all-rounder type"], uses:[ "constitution", "intelligence" ] },
        { id:"agile", identifiers:["an agile type","an athletic type","an energetic type"], uses:[ "dexterity", "charisma" ] },
        { id:"sage", identifiers:["a wise type","a zen type","a spiritual type"], uses:[ "dexterity", "wisdom" ] },
        { id:"shady", identifiers:["a shady type","a cloudy type","a cool type"], uses:[ "dexterity", "intelligence" ] },
        { id:"smart", identifiers:["a smart type","a rational type","a brainy type"], uses:[ "intelligence", "wisdom" ] },
        { id:"professor", identifiers:["a good teacher","a good trainer","a leader"], uses:[ "intelligence", "charisma" ] },
        { id:"professional", identifiers:["a professional","an experienced type","a competent one"], uses:[ "wisdom", "charisma" ] },
    ],
    personGenders:["A","B"],
    personAttractions:[
        {
            // Same gender attraction
            probability:0.2,
            forGender:{
                A:["A"],
                B:["B"]
            }
        },{
            // Multiple gender attraction
            probability:0.3,
            forGender:{
                A:["A","B"],
                B:["A","B"]
            }            
        },{
            // Other gender attraction
            forGender:{
                A:["B"],
                B:["A"]
            } 
        }
    ],
    // Bias names are still too vague or too specific in dictionaries so I've to use "against something" instead
    // of a single word.
    personBiases:[
        {
            id:"againstluxury", 
            uniqueIdentifier:"luxury",
            identifiers:[
                "luxury",
                "richness",
                "luxurious places"
            ],
            evaluations:[
                { score:-1, type:"place", withTag:"typeEconomy" },
                { score:-1, type:"person", withJobInTag:"typeEconomy" },
                { score:1, type:"person", withJobInTag:"typeSmallActivity" },
            ]
        },{
            id:"againstothergender",
            uniqueIdentifier:"the other gender",
            identifiers:[
                "the other gender",
                "the opposite sex"
            ],
            evaluations:[
                { score:1, type:"person", withSameGender:true },
                { score:-1, type:"person", withOtherGender:true }
            ]
        }
    ],

    // --- Places

    places:[
        // --- Places to heal NO CHARISMA
        {
            defaultTags:{
                resting:true,
                workplace:true,
                workloop: "default",
                interactionMoney:{
                    work:{who:"performer",amount:3},
                    rest:{who:"performer",amount:-1}
                },
                secludedPlaces:[
                    { id:"operationRoom", tags:{ identifierSuffix:"operation room", isInside:true, isSecluded:true} },
                    { id:"storageRoom", tags:{ identifierSuffix:"storage room", isInside:true, isSecluded:true} },
                    { id:"garage", tags:{ identifierSuffix:"garage", isInside:true, isSecluded:true} }
                ]
            },
            places:[
                { id:"hospital", tags:{ identifiers:["the hospital"], workRequires:[ "dexterity", "intelligence" ] } },
                { id:"clinic", tags:{ identifiers:["the clinic"], workRequires:[ "wisdom", "constitution" ] } }
            ]
        },
        // --- Cheap places to eat ALL ALLOWED
        {
            defaultTags:{
                placeToBreakfast:true,
                placeToHangOut:true,
                placeToLunch:true,
                workplace:true,
                workloop:"default",
                interactionMoney:{
                    work:{who:"performer",amount:3},
                    breakfast:{who:"performer",amount:-1},
                    lunch:{who:"performer",amount:-1},
                    rest:{who:"performer",amount:-2}
                },
                secludedPlaces:[
                    { id:"backyard", tags:{ identifierSuffix:"backyard", isInside:true,isSecluded:true} },
                    { id:"storageRoom", tags:{ identifierSuffix:"storage room", isInside:true, isSecluded:true} },
                    { id:"garage", tags:{identifierSuffix:"garage", isInside:true, isSecluded:true} }
                ]
            },
            places:[
                { id:"diner", tags:{ identifiers:["the diner"], workRequires:[ "constitution", "charisma" ] } },
                { id:"fastfood", tags:{ identifiers:["the fast food"], workRequires:[ "dexterity", "intelligence" ] } },
                { id:"cafe", tags:{ identifiers:["the cafe"], workRequires:[ "charisma", "intelligence" ] } },
                { id:"pizzeria", tags:{ identifiers:["the pizzeria"], workRequires:[ "charisma", "dexterity" ] } },
                { id:"bar", tags:{ identifiers:["the bar"], workRequires:[ "charisma", "wisdom" ] } },
                { id:"tearoom", tags:{ identifiers:["the tearoom"], workRequires:[ "intelligence", "wisdom" ] } },
                { id:"foodtruck", tags:{ identifiers:["the food truck"], workRequires:[ "dexterity", "constitution" ] } },
                { id:"sushi", tags:{ identifiers:["the sushi"], workRequires:[ "wisdom", "dexterity" ] } },
                { id:"steakhouse", tags:{ identifiers:["the steakhouse"], workRequires:[ "constitution", "intelligence" ] } },
                { id:"bistro", tags:{ identifiers:["the bistro"], workRequires:[ "constitution", "charisma" ] } }
            ]
        },
        // --- Luxury places to eat NO INTELLIGENCE
        {
            defaultTags:{
                typeEconomy:true,
                placeToHangOut:true,
                placeToLunch:true,
                placeToDinner:true,
                workplace:true,
                workloop:"default",
                interactionMoney:{
                    work:{who:"performer",amount:3},
                    lunch:{who:"performer",amount:-3},
                    dinner:{who:"performer",amount:-3},
                    rest:{who:"performer",amount:-2}
                },
                secludedPlaces:[
                    { id:"backyard", tags:{ identifierSuffix:"backyard", isInside:true, isSecluded:true} },
                    { id:"storageRoom", tags:{ identifierSuffix:"storage room", isInside:true, isSecluded:true} },
                    { id:"garage", tags:{identifierSuffix:"garage", isInside:true, isSecluded:true} }
                ]
            },
            places:[
                { id:"restaurant", tags:{ identifiers:["the restaurant"], workRequires:[ "constitution", "wisdom" ] } },
                { id:"teppanyaki", tags:{ identifiers:["the teppanyaki"], workRequires:[ "dexterity", "charisma" ] } },
            ]
        },
        // --- Luxury places to eat/sleep NO WISDOM
        {
            defaultTags:{
                placeToSleep:true,
                placeToBreakfast:true,
                placeToLunch:true,
                placeToDinner:true,
                workplace:true,
                workloop:"default",
                interactionMoney:{
                    work:{who:"performer",amount:3},
                    rest:{who:"performer",amount:-2},
                    sleep:{who:"owner", amount:-2},
                    breakfast:{who:"performer",amount:-2},
                    lunch:{who:"performer",amount:-2},
                    dinner:{who:"performer",amount:-2}
                },
                secludedPlaces:[
                    { id:"backyard", tags:{ identifierSuffix:"backyard", isInside:true, isSecluded:true} },
                    { id:"storageRoom", tags:{ identifierSuffix:"storage room", isInside:true, isSecluded:true} },
                    { id:"garage", tags:{ identifierSuffix:"garage", isInside:true, isSecluded:true} }
                ]
            },
            places:[
                { id:"hotel", tags:{ identifiers:["the hotel"], workRequires:[ "intelligence", "charisma" ] } },
                { id:"hotel", tags:{ identifiers:["the hotel"], workRequires:[ "constitution", "dexterity" ] } }
            ]
        },
        // --- Cheap places to stay NO DEXTERITY
        {
            defaultTags:{
                typeSmallActivity:true,
                placeToHangOut:true,
                workplace:true,
                workloop:"default",
                interactionMoney:{
                    work:{who:"performer",amount:2},
                    rest:{who:"performer",amount:-2}
                },
                secludedPlaces:[
                    { id:"backyard", tags:{ identifierSuffix:"backyard", isInside:true, isSecluded:true} },
                    { id:"storageRoom", tags:{ identifierSuffix:"storage room", isInside:true, isSecluded:true} },
                    { id:"garage", tags:{ identifierSuffix:"garage", isInside:true, isSecluded:true} }
                ]
            },
            places:[
                { id:"shop", tags:{ identifiers:["the shop"], workRequires:[ "constitution", "intelligence" ] } },
                { id:"mall", tags:{ identifiers:["the mall"], workRequires:[ "wisdom", "charisma" ] } },
            ]
        },
        // --- Luxury places to stay NO INTELLIGENCE
        {
            defaultTags:{
                typeEconomy:true,
                placeToHangOut:true,
                workplace:true,
                workloop:"default",
                interactionMoney:{
                    work:{who:"performer",amount:4},
                    rest:{who:"performer",amount:-2}
                },
                secludedPlaces:[
                    { id:"backyard", tags:{ identifierSuffix:"backyard", isInside:true, isSecluded:true} },
                    { id:"storageRoom", tags:{ identifierSuffix:"storage room", isInside:true, isSecluded:true} },
                    { id:"garage", tags:{ identifierSuffix:"garage", isInside:true, isSecluded:true} }
                ]
            },
            places:[
                { id:"bank", tags:{ identifiers:["the bank"], workRequires:[ "wisdom", "charisma" ] } },
                { id:"gym", tags:{ identifiers:["the gym"], workRequires:[ "dexterity", "constitution" ] } },
            ]
        },
    ],
    placeHomeSecludedPlaces:[
        { id:"backyard", tags:{ typeHome:true, identifierSuffix:"backyard", isInside:true, isSecluded:true } },
        { id:"storageRoom", tags:{ typeHome:true, identifierSuffix:"storage room", isInside:true, isSecluded:true } },
        { id:"garage", tags:{ typeHome:true ,identifierSuffix:"garage", isInside:true, isSecluded:true } }
    ],
    placeWorkLoops:{
        default:[
            { at:{ dayOfWeek:0, time:1 }, commitment:{ entity:":worker", action:"work", place:":workplace" } },
            { at:{ dayOfWeek:0, time:3 }, commitment:{ entity:":worker", action:"work", place:":workplace" } },
            { at:{ dayOfWeek:1, time:1 }, commitment:{ entity:":worker", action:"work", place:":workplace" } },
            { at:{ dayOfWeek:1, time:3 }, commitment:{ entity:":worker", action:"work", place:":workplace" } },
            { at:{ dayOfWeek:2, time:1 }, commitment:{ entity:":worker", action:"work", place:":workplace" } },
            { at:{ dayOfWeek:2, time:3 }, commitment:{ entity:":worker", action:"work", place:":workplace" } },
            { at:{ dayOfWeek:3, time:1 }, commitment:{ entity:":worker", action:"work", place:":workplace" } },
            { at:{ dayOfWeek:3, time:3 }, commitment:{ entity:":worker", action:"work", place:":workplace" } },
            { at:{ dayOfWeek:4, time:1 }, commitment:{ entity:":worker", action:"work", place:":workplace" } },
            { at:{ dayOfWeek:4, time:3 }, commitment:{ entity:":worker", action:"work", place:":workplace" } },
            { at:{ dayOfWeek:5, time:1 }, commitment:{ entity:":worker", action:"work", place:":workplace" } },
            { at:{ dayOfWeek:5, time:3 }, commitment:{ entity:":worker", action:"work", place:":workplace" } },
        ]
    }

};

const
    QUESTIONNAIRE_DETAILS=5,
    QUESTIONNAIRE_SCORE_RIGHT=10,
    QUESTIONNAIRE_FACT_SCORE_BASE=20,
    QUESTIONNAIRE_FACT_TOO_NEAR_MALUS=-20,
    QUESTIONNAIRE_SCORE_WRONG=-20,
    QUESTIONNAIRE_SCORE_FAIL=-QUESTIONNAIRE_FACT_SCORE_BASE-20,
    QUESTIONNAIRE_ATTEMPTS=10,
    QUESTIONNAIRE_TUTORIAL="Fill up your notes and ask me for a rating when you're ready! Good luck! - <b>"+SIMULATION_MASTER+"</b>",
    QUESTIONNAIRE_SENTENCE="Let me see...",
    QUESTIONNAIRE_BASIC_SENTENCES={
        summary:[
            "Your score is <span class='accent'>{result.totalScore}/{result.maxScore} points</span> and I'm giving you the <span class='accent'>{result.grade.letter} grade</span> this time."
        ],
        increase:[
            "Your score <span class='accent good'>increased</span>!"
        ],
        same:[
            "Your score hasn't changed."
        ],
        decrease:[
            "Your score <span class='accent bad'>decreased</span>..."
        ]
    },
    QUESTIONNAIRE_PRIZES={
        none:{
            avatar:{id:"standing", animation:"sad" },
            sentences:[
                "You did your best... but the <span class='accent'>{result.grade.letter} final grade</span> is not enough for a prize! It will be better next time!",
                "So the <span class='accent'>{result.grade.letter} final grade</span>, huh? Better luck next time!",
                "I can't give you anything with the <span class='accent'>{result.grade.letter} final grade</span>. Try again!",
            ]
        },
        facts:{
            avatar:{id:"happy", animation:"jump2" },
            sentences:[
                "You got the <span class='accent'>{result.grade.letter} final grade</span>! You won this iteration's <span class='accent'>Fact Logs</span>! You can find it just under your notebook. See you in the next iteration!",
                "This <span class='accent'>{result.grade.letter} final grade</span> deserves this iteration's <span class='accent'>Fact Logs</span>! It's below your notebook. Good job!",
                "Wow! The <span class='accent'>{result.grade.letter} final grade</span>! The <span class='accent'>Fact Logs</span> are below your notebook, as promised. Nicely done!",
            ],
            unlockFactLogs:true
        },
        all:{
            avatar:{id:"happy", animation:"serious" },
            sentences:[
                "The <span class='accent good'>{result.grade.letter} final grade</span>! You won this iteration's <span class='accent'>Fact Logs</span> and its <span class='accent'>Simulation Logs</span> file! It explains <span class='accent'>how the simulation works</span>, don't tell anyone!",
                "It's... the <span class='accent good'>{result.grade.letter} final grade</span>! You unlocked <span class='accent'>everything I know</span>! Keep the secret!",
                "Your <span class='accent good'>{result.grade.letter} final grade</span> hits the <span class='accent'>jackpot</span>! I'll tell you everything I know... but it's a secret!",
            ],
            unlockFactLogs:true,
            unlockSimulationLogs:true
        }
    },
    QUESTIONNAIRE_GRADES=[
        {
            letter:"D-",
            completion:0,
            style:"bad",
            avatar:{id:"standing", animation:"avatar" },
            sentences:[
                "You're working on the basics, right? There may be something wrong somewhere but don't give up!",
                "Don't give up! Things will work out!",
                "Try again! You'll make it!"
            ],
            prize:"none"
        },{
            letter:"D",
            completion:0,
            style:"bad",
            avatar:{id:"happy", animation:"avatar" },
            sentences:[
                "Seems that you're on the right track. Keep up the good work!",
                "It is a good start. Keep it up!",
                "So it begins. Go on like this!"
            ],
            prize:"none"
        },{
            letter:"D+",
            completion:0,
            style:"bad",
            avatar:{id:"standing", animation:"jump" },
            sentences:[
                "Things are shaping up! I can't wait!",
                "The pieces begin to fall into place! I can't wait!",
                "Everything falls into place! I can't wait!"
            ],
            prize:"none"
        },
        {
            letter:"C-",
            completion:0.4,
            style:"bad",
            avatar:{id:"standing", animation:"jump" },
            sentences:[
                "You're filling up your notes! Very good!",
                "Your notes begin to be more complete! Very good!",
                "Now we have quite a lot of notes, huh? Very good!"
            ],
            prize:"none"
        },
        {
            letter:"C",
            completion:0.4,
            style:"bad",
            avatar:{id:"happy", animation:"jump2" },
            sentences:[
                "Nice job. You're on the right track!",
                "Nice! You're doing well!",
                "Very nice! Keep up the good work!"
            ],
            prize:"none"
        },
        {
            letter:"C+",
            completion:0.4,
            style:"bad",
            avatar:{id:"standing", animation:"serious" },
            sentences:[
                "You're ready for the real challenge! Let's go!",
                "Show me what you've got! Let's go!",
                "Let's see what you got! Come on!"
            ],
            prize:"none"
        },
        {
            letter:"B-",
            completion:0.8,
            style:"okay",
            avatar:{id:"standing", animation:"sad" },
            sentences:[
                "Keep it up! Don't stop right now!",
                "Go! Go! You definitely could do it!",
                "Don't give up! Hold tight!"
            ],
            prize:"none"
        },
        {
            letter:"B",
            completion:0.8,
            style:"okay",
            avatar:{id:"happy", animation:"jump" },
            sentences:[
                "Really good job!",
                "Great job!",
                "Well done!"
            ],
            prize:"facts"
        },
        {
            letter:"B+",
            completion:0.8,
            style:"okay",
            avatar:{id:"standing", animation:"jump2" },
            sentences:[
                "Wow! Well... Now begins the real challenge!",
                "Good! Now it's time to get serious!",
                "Nice! This is where it gets interesting!"
            ],
            prize:"facts"
        },
        {
            letter:"A-",
            completion:0.9,
            style:"good",
            avatar:{id:"shocked", animation:"sad" },
            sentences:[
                "You're almost there! You're almost there! Don't give up!",
                "Just a little more! You can do it!",
                "We're almost there! Come on!"
            ],
            prize:"facts"
        },
        {
            letter:"A",
            completion:0.9,
            style:"verygood",
            avatar:{id:"happy", animation:"serious" },
            sentences:[
                "This is the work of a good detective! Well done!",
                "That's how detectives do it! Well done!",
                "Way to go! Well done!"
            ],
            prize:"facts"
        },
        {
            letter:"A+",
            completion:0.94,
            style:"verygood",
            avatar:{id:"standing", animation:"jump2" },
            sentences:[
                "You know your stuff, right? Very good!",
                "You are never giving up, huh? Very good!",
                "You have no boundaries, isn't it? Very good!"
            ],
            prize:"facts"
        },
        {
            letter:"A++",
            completion:0.96,
            style:"verygood",
            avatar:{id:"standing", animation:"serious" },
            sentences:[
                "That's amazing! You know this iteration like the back of your hand!",
                "Awesome! You've beaten this iteration!",
                "Incredible! You crushed this iteration!",
            ],
            prize:"facts"
        },
        {
            letter:"S",
            completion:0.97,
            style:"excellent",
            avatar:{id:"shocked", animation:"serious" },
            sentences:[
                "<span class='accent'>Excellent job!</span> You deserve my <span class='accent'>special ranking</span>!",
                "<span class='accent'>Great job!</span> Here is my <span class='accent'>special ranking</span>!",
                "<span class='accent'>Outstanding job!</span> This time you earned my <span class='accent'>special ranking</span>!",
            ],
            prize:"all"
        },
        {
            letter:"SS",
            completion:1,
            style:"excellent",
            avatar:{id:"shocked", animation:"jump2" },
            sentences:[
                "<span class='accent good'>Incredible job!</span> How did you manage to <span class='accent'>do that</span>?!",
                "<span class='accent good'>Unbelievable job!</span> How did you guess <span class='accent'>all these things</span>?!",
                "<span class='accent good'>That's impossible!</span> How did you manage to be <span class='accent'>so precise</span>?!"
            ],
            prize:"all"
        },
        {
            letter:"SSS",
            completion:1,
            style:"perfect",
            avatar:{id:"happy", animation:"serious" },
            sentences:[
                "<span class='accent good'>That's a perfect job!</span> You surely <span class='accent good'>mastered</span> this iteration!",
                "<span class='accent good'>Superb!</span> This iteration holds <span class='accent good'>no secrets</span> for you!",
                "Wow! <span class='accent good'>What an astounding score!</span> You are a <span class='accent good'>true champion</span>!",
            ],
            prize:"all"
        }
    ];

const NAMES_DATABASE={
    name:{
        male:[
            "Aaron",
            "Adam",
            "Alan",
            "Albert",
            "Alexander",
            "Andrew",
            "Anthony",
            "Arthur",
            "Austin",
            "Benjamin",
            "Billy",
            "Bobby",
            "Brandon",
            "Brian",
            "Bruce",
            "Bryan",
            "Carl",
            "Charles",
            "Christian",
            "Christopher",
            "Daniel",
            "David",
            "Dennis",
            "Donald",
            "Douglas",
            "Dylan",
            "Edward",
            "Elijah",
            "Eric",
            "Ethan",
            "Eugene",
            "Frank",
            "Gabriel",
            "Gary",
            "George",
            "Gerald",
            "Gregory",
            "Harold",
            "Henry",
            "Jack",
            "Jacob",
            "James",
            "Jason",
            "Jeffrey",
            "Jeremy",
            "Jerry",
            "Jesse",
            "Joe",
            "John",
            "Jonathan",
            "Jordan",
            "Jose",
            "Joseph",
            "Joshua",
            "Juan",
            "Justin",
            "Keith",
            "Kenneth",
            "Kevin",
            "Kyle",
            "Larry",
            "Lawrence",
            "Logan",
            "Louis",
            "Mark",
            "Mason",
            "Matthew",
            "Michael",
            "Nathan",
            "Nicholas",
            "Noah",
            "Patrick",
            "Paul",
            "Peter",
            "Philip",
            "Ralph",
            "Randy",
            "Raymond",
            "Richard",
            "Robert",
            "Roger",
            "Ronald",
            "Roy",
            "Russell",
            "Ryan",
            "Samuel",
            "Scott",
            "Sean",
            "Stephen",
            "Steven",
            "Terry",
            "Thomas",
            "Timothy",
            "Tyler",
            "Vincent",
            "Walter",
            "Wayne",
            "William",
            "Willie",
            "Zachary"
        ],
        female:[
            "Abigail",
            "Alexis",
            "Alice",
            "Amanda",
            "Amber",
            "Amy",
            "Andrea",
            "Angela",
            "Ann",
            "Anna",
            "Ashley",
            "Barbara",
            "Betty",
            "Beverly",
            "Brenda",
            "Brittany",
            "Carol",
            "Carolyn",
            "Catherine",
            "Charlotte",
            "Cheryl",
            "Christina",
            "Christine",
            "Cynthia",
            "Danielle",
            "Deborah",
            "Debra",
            "Denise",
            "Diana",
            "Diane",
            "Donna",
            "Doris",
            "Dorothy",
            "Elizabeth",
            "Emily",
            "Emma",
            "Evelyn",
            "Frances",
            "Gloria",
            "Grace",
            "Hannah",
            "Heather",
            "Helen",
            "Isabella",
            "Jacqueline",
            "Janet",
            "Janice",
            "Jean",
            "Jennifer",
            "Jessica",
            "Joan",
            "Joyce",
            "Judith",
            "Judy",
            "Julia",
            "Julie",
            "Karen",
            "Katherine",
            "Kathleen",
            "Kathryn",
            "Kayla",
            "Kelly",
            "Kimberly",
            "Laura",
            "Lauren",
            "Linda",
            "Lisa",
            "Lori",
            "Madison",
            "Margaret",
            "Maria",
            "Marie",
            "Marilyn",
            "Martha",
            "Mary",
            "Megan",
            "Melissa",
            "Michelle",
            "Nancy",
            "Natalie",
            "Nicole",
            "Olivia",
            "Pamela",
            "Patricia",
            "Rachel",
            "Rebecca",
            "Ruth",
            "Samantha",
            "Sandra",
            "Sara",
            "Sarah",
            "Sharon",
            "Shirley",
            "Sophia",
            "Stephanie",
            "Susan",
            "Teresa",
            "Theresa",
            "Victoria",
            "Virginia"
        ]
    },
    surname:[
        "Adams",
        "Ahmed",
        "Akhtar",
        "Ali",
        "Allen",
        "Anderson",
        "Andrews",
        "Armstrong",
        "Arnold",
        "Atkinson",
        "Austin",
        "Bailey",
        "Baker",
        "Ball",
        "Barber",
        "Barker",
        "Barnes",
        "Barrett",
        "Barton",
        "Bates",
        "Begum",
        "Bell",
        "Bennett",
        "Berry",
        "Bird",
        "Bishop",
        "Blake",
        "Booth",
        "Bradley",
        "Brooks",
        "Brown",
        "Buckley",
        "Burgess",
        "Burke",
        "Burns",
        "Burton",
        "Butler",
        "Byrne",
        "Campbell",
        "Carr",
        "Carter",
        "Chambers",
        "Chapman",
        "Clark",
        "Clarke",
        "Cole",
        "Coleman",
        "Collins",
        "Cook",
        "Cooke",
        "Cooper",
        "Cox",
        "Cross",
        "Curtis",
        "Davies",
        "Davis",
        "Dawson",
        "Day",
        "Dean",
        "Dixon",
        "Doyle",
        "Dunn",
        "Edwards",
        "Elliott",
        "Ellis",
        "Evans",
        "Fisher",
        "Fletcher",
        "Ford",
        "Foster",
        "Fox",
        "Francis",
        "Freeman",
        "Frost",
        "Gardner",
        "George",
        "Gibson",
        "Gilbert",
        "Gill",
        "Goodwin",
        "Gordon",
        "Graham",
        "Grant",
        "Gray",
        "Green",
        "Gregory",
        "Griffin",
        "Griffiths",
        "Hall",
        "Hamilton",
        "Hammond",
        "Harding",
        "Hardy",
        "Harper",
        "Harris",
        "Harrison",
        "Hart",
        "Harvey",
        "Hawkins",
        "Hayes",
        "Henderson",
        "Hewitt",
        "Higgins",
        "Hill",
        "Hodgson",
        "Holland",
        "Holmes",
        "Hopkins",
        "Howard",
        "Hudson",
        "Hughes",
        "Hunt",
        "Hunter",
        "Hussain",
        "Hutchinson",
        "Jackson",
        "James",
        "Jenkins",
        "Johnson",
        "Johnston",
        "Jones",
        "Jordan",
        "Kaur",
        "Kelly",
        "Kennedy",
        "Khan",
        "King",
        "Knight",
        "Lambert",
        "Lane",
        "Lawrence",
        "Lee",
        "Lewis",
        "Lloyd",
        "Long",
        "Lowe",
        "Mann",
        "Marsh",
        "Marshall",
        "Martin",
        "Mason",
        "Matthews",
        "May",
        "McCarthy",
        "McDonald",
        "Miles",
        "Miller",
        "Mills",
        "Mitchell",
        "Moore",
        "Morgan",
        "Morris",
        "Moss",
        "Murphy",
        "Murray",
        "Nelson",
        "Newman",
        "Newton",
        "Nicholls",
        "Nicholson",
        "O'Brien",
        "O'Connor",
        "O'Neill",
        "Oliver",
        "Osborne",
        "Owen",
        "Page",
        "Palmer",
        "Parker",
        "Parry",
        "Parsons",
        "Patel",
        "Payne",
        "Pearce",
        "Pearson",
        "Perry",
        "Phillips",
        "Porter",
        "Potter",
        "Powell",
        "Price",
        "Pritchard",
        "Read",
        "Reed",
        "Rees",
        "Reid",
        "Reynolds",
        "Richards",
        "Richardson",
        "Riley",
        "Roberts",
        "Robertson",
        "Robinson",
        "Robson",
        "Rogers",
        "Rose",
        "Ross",
        "Rowe",
        "Russell",
        "Ryan",
        "Saunders",
        "Scott",
        "Shah",
        "Sharp",
        "Shaw",
        "Shepherd",
        "Simpson",
        "Singh",
        "Slater",
        "Smith",
        "Spencer",
        "Stephens",
        "Stephenson",
        "Stevens",
        "Stevenson",
        "Stewart",
        "Stone",
        "Sutton",
        "Taylor",
        "Thomas",
        "Thompson",
        "Turner",
        "Walker",
        "Wallace",
        "Walsh",
        "Walters",
        "Walton",
        "Ward",
        "Warren",
        "Watkins",
        "Watson",
        "Watts",
        "Webb",
        "Webster",
        "Wells",
        "West",
        "Wheeler",
        "White",
        "Whitehead",
        "Wilkinson",
        "Williams",
        "Williamson",
        "Willis",
        "Wilson",
        "Wood",
        "Woods",
        "Woodward",
        "Wright",
        "Yates",
        "Young"
    ]
};

const PERSONTITLES_DATABASE={
    married:{
        A:[
            "Mr."
        ],
        B:[
            "Mrs."
        ],
        neutral:[
            "Mx."
        ]
    }
};

const FACTS_DATABASE={

    // --- Planned facts
    becomeParanoid:{
        log:"{fact.entity} will be paranoid"
    },
    menacePerson:{
        log:"{fact.entity} will menace person {fact.person} because of {fact.reason}"
    },
    continueMenacePerson:{
        log:"{fact.entity} will continue to menace person {fact.person} {conjugate:atin:fact.place} {fact.place} because of {fact.reason}"
    },
    
    // --- Place related facts

    enterPerson:{
        log:"{fact.entity} has been reached by {fact.byPerson)}"
    },
    leavePerson:{
        log:"{fact.entity} has been left by {fact.byPerson)}"
    },
    personPerformInteraction:{
        log:"{fact.entity} has been performed {fact.interaction} interaction {conjugate:atin:fact.place} {fact.place}"
    },
    placePerformInteraction:{
        log:"{fact.entity} has been performed {fact.interaction} interaction by {fact.person}"
    },

    // --- Internal/complex facts

    gainedDestination:{
        log:"{fact.entity} gained a destination {fact.type} from {fact.fromPerson}: \"{destination:fact.destination}\""
    },
    gainedTestimony:{
        priority:1,
        log:"{fact.entity} gained a testimony from {fact.fromPerson}: \"{testimony:fact.testimony:fact.testimony.person}\""
    },
    addCommitment:{
        priority:2,
        log:"{fact.entity} has new commitment about {fact.type}"
    },
    raiseStress:{
        log:"{fact.entity} is more stressed because of {fact.reason}: {fact.stress}"
    },
    lowerStress:{
        log:"{fact.entity} is less stressed because of {fact.reason}: {fact.stress}"
    },
    raiseStat:{
        log:"{fact.entity} raised {fact.stat} stat: {fact.value}"
    },
    lowerStat:{
        log:"{fact.entity} lowered {fact.stat} stat: {fact.value}"
    },
    lowerAttention:{
        log:"{fact.entity} is -{fact.by} attention to {fact.attention}"
    },
    raiseAttention:{
        log:"{fact.entity} is +{fact.by} attention to {fact.attention}"
    },
    raiseObscurity:{
        log:"{fact.entity} is +{fact.by} more obscure: {fact.obscurity}"
    },
    addTestimony:{
        priority:1,
        log:"{fact.entity} testimonied: \"{testimony:fact.testimony}\""
    },
    removed:{
        priority:1,
        log:"{fact.entity} has been removed from place {fact.fromPlace}"
    },
    moveTo:{
        log:"{fact.entity} moved from {fact.fromPlace} to {fact.toPlace}"
    },
    plannedTo:{
        priority:2,
        log:"{fact.entity} planned to \"{fact:fact.entry}\" {conjugate:atin:time:fact.at} {time:fact.at}"
    },
    removeBond:{
        priority:1,
        log:"{fact.entity} has no longer {fact.bondType}: {fact.withPerson}"
    },

    // --- Obvious facts usually not said by persons

    earnMoney:{
        log:"{fact.entity} earned {fact.amount}$ from {fact.from}"
    },
    payMoney:{
        log:"{fact.entity} paid {fact.amount}$ to {fact.to}"
    },
    work:{
        log:"{fact.entity} worked {conjugate:atin:fact.place} {fact.place}"
    },
    lunch:{
        log:"{fact.entity} is eating {fact.action} {conjugate:atin:fact.place} {fact.place}"
    },
    dinner:{
        log:"{fact.entity} is eating {fact.action} {conjugate:atin:fact.place} {fact.place}"
    },
    breakfast:{
        log:"{fact.entity} is eating {fact.action} {conjugate:atin:fact.place} {fact.place}"
    },
    sleep:{
        log:"{fact.entity} is sleeping {conjugate:atin:fact.place} {fact.place}"
    },
    wakeUp:{
        log:"{fact.entity} woke up {conjugate:atin:fact.place} {fact.place}"
    },

    // --- Obvious facts often said by persons

    cantPayMoney:{
        priority:1,
        log:"{fact.entity} can't pay {fact.amount}$ to {fact.to}"
    },
    eavesdrop:{
        priority:1,
        log:"{fact.entity} eavesdropped something {fact.person} said {conjugate:atin:fact.place} {fact.place}"
    },
    chitChat:{
        log:"{fact.entity} is chitchatting with {fact.person}"
    },
    

    // --- Intimate hidden facts
    
    shocked:{
        log:"{fact.entity} is more shocked: {fact.shock}"
    },
    unshocked:{
        log:"{fact.entity} is less shocked: {fact.shock}"
    },
    zeroesSuspect:{
        priority:2,
        log:"{fact.entity} is no longer suspicious of {fact.of}"
    },
    applyPositiveBias:{
        priority:1,
        log:"{fact.entity} applied positive bias to {fact.subject}"
    },
    applyNegativeBias:{
        priority:1,
        log:"{fact.entity} applied negative bias to {fact.subject}"
    },
    applyNeutralBias:{
        log:"{fact.entity} applied neutral bias to {fact.subject}"
    },
    raiseSuspect:{
        log:"{fact.entity} is +{fact.by} suspicious of {fact.of}: {fact.suspect}"
    },
    lowerSuspect:{
        log:"{fact.entity} is -{fact.by} suspicious of {fact.of}: {fact.suspect}"
    },
    investigate:{
        priority:1,
        log:"{fact.entity} is investigating {conjugate:atin:fact.place} {fact.place}",
        question:{
            label:"investigated",
            structure:[
                { id:"place", type:"place" }
            ]
        }
    },
    hangOut:{
        log:"{fact.entity} hanged out {conjugate:atin:fact.place} {fact.place}",
    },
    

    // --- Less interesting facts that may be said by persons

    addBond:{
        priority:2,
        log:"{fact.entity} has now {if:fact.exclusive:the only} {fact.bondType}: {fact.withPerson}"
    },

    // --- Interesting facts persons can't wait to say

    untie:{
        priority:2,
        log:"{fact.entity} untied {fact.person} {conjugate:atin:fact.place} {fact.place}"
    },
    haveBeenUntied:{
        priority:2,
        log:"{fact.entity} have been untied by {fact.person} {conjugate:atin:fact.place} {fact.place}",
        question:{
            label:"have been untied",
            structure:[
                { type:"text", text:" by " },
                { id:"person", type:"person", excludeEntity:true },
                { type:"text", text:" at " },
                { id:"place", type:"place" }
            ]
        }
    },
    haveBeenTied:{
        priority:2,
        log:"{fact.entity} have been tied by {fact.person} {conjugate:atin:fact.place} {fact.place}",
        question:{
            label:"have been tied",
            structure:[
                { type:"text", text:" by " },
                { id:"person", type:"person", excludeEntity:true },
                { type:"text", text:" due to " },
                { id:"reason", findInto:true, type:"select", options:[
                    { ids:"reasons" }
                ]},
                { type:"text", text:" at " },
                { id:"place", type:"place" }
            ]
        }
    },

    // --- Interesting facts that may be said by persons

    newLover:{
        priority:1,
        log:"{fact.entity} has a new lover {fact.person} {conjugate:atin:fact.place} {fact.place}",
        question:{
            label:"found a new lover",
            structure:[
                { id:"person", type:"person", excludeEntity:true },
                { type:"text", text:" at " },
                { id:"place", type:"place" }
            ]
        }
    },
    beLoudWithPerson:{
        priority:1,
        log:"{fact.entity} was loudly debating with {fact.person} {conjugate:atin:fact.place} {fact.place}",
        question:{
            label:"was loudly debating",
            structure:[
                { type:"text", text:" with " },
                { id:"person", type:"person", excludeEntity:true },
                { type:"text", text:" at " },
                { id:"place", type:"place" }
            ]
        }
    },

    // --- Interesting facts hidden by persons
    
    tie:{
        priority:2,
        log:"{fact.entity} tied {fact.person} because of {fact.reason} {conjugate:atin:fact.place} {fact.place}",
        question:{
            label:"tied",
            structure:[
                { id:"person", type:"person", excludeEntity:true },
                { type:"text", text:" due to " },
                { id:"reason", findInto:true, type:"select", options:[
                    { ids:"reasons" }
                ]},
                { type:"text", text:" at " },
                { id:"place", type:"place" }
            ]
        }
    },
    startMenacing:{
        priority:2,
        log:"{fact.entity} started menacing {fact.person} because of {fact.reason} {conjugate:atin:fact.place} {fact.place}",
        question:{
            label:"started menacing",
            structure:[
                { id:"person", type:"person", excludeEntity:true },
                { type:"text", text:" due to " },
                { id:"reason", findInto:true, type:"select", options:[
                    { ids:"reasons" }
                ]},
                { type:"text", text:" at " },
                { id:"place", type:"place" }
            ]
        }
    },
    endMenacing:{
        priority:2,
        log:"{fact.entity} ended menacing {fact.person} {conjugate:atin:fact.place} {fact.place}",
        question:{
            label:"ended menacing",
            structure:[
                { id:"person", type:"person", excludeEntity:true },
                { type:"text", text:" at " },
                { id:"place", type:"place" }
            ]
        }
    },
    
    // --- Very interesting facts hidden by guilty persons

    murderPerson:{
        priority:2,
        log:"{fact.entity} murdered {fact.person} because of {fact.reason} {conjugate:atin:fact.place} {fact.place}!",
        question:{
            label:"murdered",
            structure:[
                { id:"person", type:"person", excludeEntity:true },
                { type:"text", text:" due to " },
                { id:"reason", findInto:true, type:"select", options:[
                    { ids:"reasons" }
                ]},
                { type:"text", text:" at " },
                { id:"place", type:"place" }
            ]
        }
    },
    dead:{
        priority:2,
        log:"{fact.entity} died because of {fact.reason} by {fact.person} {conjugate:atin:fact.place} {fact.place}...",
        question:{
            label:"died",
            structure:[
                { type:"text", text:" due to " },
                { id:"reason", findInto:true, type:"select", options:[
                    { ids:"reasons" }
                ]},
                { if:{reason:["murder"]}, type:"text", text:" by " },
                { if:{reason:["murder"]}, id:"person", type:"person", excludeEntity:true },
                { type:"text", text:" at " },
                { id:"place", type:"place" },
            ]
        }
    },

    // --- Very interesting facts hidden by facts

    forcedToMoveByPerson:{
        priority:2,
        log:"{fact.entity} has been forced by {fact.person} to move from {fact.fromPlace} to {fact.toPlace}"
    },
    forgotTestimony:{
        priority:1,
        log:"{fact.entity} has been forced to keep a secret because of {fact.person} {conjugate:atin:fact.place} {fact.place}: \"{testimony:fact.testimony:fact.testimony.person}\"",
        question:{
            label:"has been forced to keep a secret",
            structure:[
                { type:"text", text:" at " },
                { id:"place", type:"place" },
                { type:"text", text:" because of " },
                { id:"person", type:"person", excludeEntity:true }
            ]
        }
    },
    decideVictim:{
        priority:2,
        log:"{fact.entity} decided its next victim {fact.person} because of {fact.reason}",
        question:{
            label:"decided its victim",
            structure:[
                { type:"text", text:" : it will be " },
                { id:"person", type:"person", excludeEntity:true },
                { type:"text", text:" due to " },
                { id:"reason", findInto:true, type:"select", options:[
                    { ids:"reasons" }
                ]}
            ]
        }
    },
    collapseDueTo:{
        priority:2,
        log:"{fact.entity} collapsed because of {fact.reason} {conjugate:atin:fact.place} {fact.place}.",
        question:{
            label:"collapsed",
            structure:[
                { type:"text", text:" due to " },
                { id:"reason", findInto:true, type:"select", options:[
                    { ids:"reasons" }
                ]}
            ]
        }
    },
    startedResting:{
        priority:2,
        log:"{fact.entity} started resting {conjugate:atin:fact.place} {fact.place}.",
        question:{
            label:"started resting",
            structure:[
                { type:"text", text:" at " },
                { id:"place", type:"place" },
            ]
        }
    },
    escaped:{
        priority:2,
        log:"{fact.entity} escaped the {fact.person} because of {fact.reason} it {conjugate:atin:fact.place} {fact.place}!",
        question:{
            label:"escaped",
            structure:[
                { type:"text", text:" the " },
                { id:"person", type:"person", excludeEntity:true },
                { type:"text", text:" " },
                { id:"reason", type:"select", findInto:true, options:[
                    { id:"attemptedTie", label:"attempt to tie"},
                    { id:"attemptedMurder", label:"attempt to murder"}
                ]},
                { type:"text", text:" at " },
                { id:"place", type:"place" }
            ]
        }
    },
    failedMurderPerson:{
        priority:2,
        log:"{fact.entity} failed to murder {fact.person} because of {fact.reason} {conjugate:atin:fact.place} {fact.place}",
        question:{
            label:"failed to murder",
            structure:[
                { id:"person", type:"person", excludeEntity:true },
                { type:"text", text:" due to " },
                { id:"reason", findInto:true, type:"select", options:[
                    { ids:"reasons" }
                ]},
                { type:"text", text:" at " },
                { id:"place", type:"place" }
            ]
        }
    },
    failedTie:{
        priority:2,
        log:"{fact.entity} failed to tie {fact.person} because of {fact.reason} {conjugate:atin:fact.place} {fact.place}",
        question:{
            label:"failed to tie",
            structure:[
                { id:"person", type:"person", excludeEntity:true },
                { type:"text", text:" due to " },
                { id:"reason", findInto:true, type:"select", options:[
                    { ids:"reasons" }
                ]},
                { type:"text", text:" at " },
                { id:"place", type:"place" }
            ]
        }
    },
    decidedToGoSafePlace:{
        priority:2,
        log:"{fact.entity} ran from {fact.fromPlace} to a safe place {fact.toPlace}",
        question:{
            label:"ran to a safe place",
            structure:[
                { type:"text", text:" from " },
                { id:"fromPlace", type:"place" },
                { type:"text", text:" to " },
                { id:"toPlace", type:"place" }
            ]
        }
    },
    forcePersonToMove:{
        log:"{fact.entity} forced {fact.person} to move from {fact.fromPlace} to {fact.toPlace}",
        question:{
            label:"forced to move",
            structure:[
                { id:"person", type:"person", excludeEntity:true },
                { type:"text", text:" from " },
                { id:"fromPlace", type:"place" },
                { type:"text", text:" to " },
                { id:"toPlace", type:"place" }
            ]
        }
    },
};

const 
    THATTOPIC_VARIATIONS=[
        "that",
        "the topic",
        "the question",
        "the matter"
    ],
    HEARDSAID_VARIATIONS=[
        "heard that",
        "said that"
    ],
    PERSONLIST_VARIATIONS=[
        "{sentence.person}",
        "{sentence.person}",
        "{plural:entity:entities:sentence.person} {sentence.person}",
        "{plural:entity:entities:sentence.person} {sentence.person}",
        // Less common
        "our {sentence.person}",
    ],
    PERSONLIST_OWN_VARIATIONS=[
        "{own:sentence.person}",
        "{own:sentence.person}",
        "{plural:entity:entities:sentence.person} {own:sentence.person}",
        "{plural:entity:entities:sentence.person} {own:sentence.person}",
        // Less common
        "our {own:sentence.person}",
    ],
    PERSONLIST_SIMPLE_VARIATIONS=[
        "{sentence.person}"
    ],
    SOMEONE_VARIATIONS=[
        "I wonder why someone",
        "I wonder why somebody",
        "as you expect, someone",
        "as you expect, somebody",
        "it seems obvious that someone",
        "it seems obvious that somebody",
        "someone",
        "somebody",
        "word on the street is that someone",
        "word on the street is that somebody",
        "I wonder why someone",
        "I wonder why somebody",
        "there is a reason why someone",
        "there is a reason why somebody",
    ],
    SOMEONE_SIMPLE_VARIATIONS=[
        "someone",
        "somebody"
    ],
    TESTIMONIES_DATABASE={
    // --- Never admit that something about the bad things I've planned to do

    // ------ Less juicy (Personal weakness, Love affairs, conflicts)
    cantPerformSchedule:{
        log:"couldn't perform the scheduled {testimony.schedule.action} {conjugate:atin:testimony.place} {testimony.place}",
        topicSummary:{
            onChainPrefix:[
                // Remember the trailing space here
                "someone that ",
                "someone who "
            ],
            onContext:{
                // --- Intimate actions, never declare them to the journalist. It still may be eavesdropped by others.
                murderPerson:[
                    "had a mishap about a murder",
                    "had some trouble with a murder",
                    "postponed a murder",
                ],
                menacePerson:[
                    "had a problem menacing someone",
                    "postponed his chat",
                    "thought over his speech"
                ],
                decideVictim:[
                    "missed a plan",
                    "postponed a decision"
                ],
                investigate:[
                    "skipped an investigation",
                    "could not focus",
                    "looked nervous"
                ],
                continueMenacePerson:[
                    "missed a discussion",
                    "missed a meeting",
                    "avoided a nasty chat"
                ],
                // --- Normal actions
                sleep:[
                    "slept badly",
                    "had a rude awakening",
                    "woke up badly"
                ],
                lunch:[
                    "had a bad lunch",
                    "choked on lunch",
                    "almost skipped lunch"
                ],
                dinner:[
                    "had a bad dinner",
                    "didn't have a good dinner",
                    "skipped dinner"
                ],
                breakfast:[
                    "had a bad breakfast",
                    "didn't have a good breakfast",
                    "skipped breakfast"
                ],
                wakeUp:[
                    "had a bad wake-up",
                    "slept very badly",
                    "didn't sleep a wink"
                ],
                work:[
                    "missed a duty",
                    "skipped work"
                ],
                becomeParanoid:[
                    "avoided more frustration",
                    "thought about something",
                    "could think of nothing"
                ],
                eavesdrop:[
                    "did not listen to anyone",
                    "got careless",
                    "listened to no one"
                ],
                chitChatWith:[
                    "couldn't say anything",
                    "didn't say a word",
                    "didn't say anything"
                ]
            }
        },
        onInterviewDeclare:{
            notAboutMeScheduleAction:[
                "murderPerson",
                "menacePerson",
                "decideVictim",
                "investigate",
                "continueMenacePerson"
            ]
        },
        juiciness:2,
        onProcess:false, // TODO: Person is bad if he was scheduling stuff in notAboutMeScheduleAction?
        notRelatedFacts:true, // Personal
        article:{
            titles:[
                "Try again later!",
                "Busy people",
                "Please wait!"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:be-past:sentence.person}"]},
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] },
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["and {conjugate:it:sentence.person}"]},
                            { text:["{summarizeTestimony:sentence}"] },
                        ],[
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:["{summarizeTestimony:sentence}"] },
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] },
                        ],[
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place},"] },
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:["{summarizeTestimony:sentence}"] },
                        ]
                    ]
                }
            ]
        }
    },
    
    // --- Never admit bad things if it's about me.

    // ------ Very juicy (Murder)
    seeTheMurderer:{
        log:"have seen {testimony.person}, the {testimony.victim} murderer, {conjugate:atin:testimony.place} {testimony.place}! {if:testimony.murdererKnown:It knew the murderer!}",
        topicSummary:{
            default:[
                "a murder witness",
                "a person in the wrong place",
                "someone in the wrong place"
            ]
        },
        onInterviewDeclare: { notAboutMe: true },
        juiciness:4,
        onProcess:{
            personBadVictimDanger:true
        },
        article:{
            titles:[
                "Murderer spotting!",
                "Security warning!",
                "Warning!"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { text:["the suspected {plural:murderer:murderers:sentence.person}"]},
                            { if:"sentence.victim", text:["of {own:sentence.victim} case"] },
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_SIMPLE_VARIATIONS },
                            { text:["{conjugate:be-past:sentence.person}"] },
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] },
                            { includeOnArticlesAbout:["place"], if:"sentence.place", text:["there"] }
                        ],[
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place},"] },
                            { text:["there"] },
                            { text:["{conjugate:be-past:sentence.person}"] },
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_SIMPLE_VARIATIONS },
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:[", "] },
                            { text:["the suspected {plural:murderer:murderers:sentence.person}"]},
                            { if:"sentence.victim", text:["of {own:sentence.victim} case"] },
                        ]
                    ]
                }
            ]
        }
    },
    
    // --- Never admit bad things I've made.
    
    // ------ Juicy (Supicious behaviour, violence, escapes)
    seeTheTestimony:{
        log:"have seen {testimony.person}, the witness of the {testimony.victim} murder {conjugate:atin:testimony.place} {testimony.place}",
        topicSummary:{
            default:[
                "a witness in danger",
                "someone that has seen too much",
                "someone in danger"
            ]
        },
        onInterviewDeclare:{ notByMe: true }, // It's a murderer's sentence. Never admit if it's by me.
        juiciness:3,
        onProcess:{
            personInDanger:true
        },
        article:{
            titles:[
                "I spy with my eyes...",
                "Dark secrets!",
                "Uncomfortable truth!"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { text:["the {plural:witness:witnesses:sentence.person}"] },
                            { if:"sentence.victim", text:["of {own:sentence.victim} case"] },
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_SIMPLE_VARIATIONS },
                            { text:["{conjugate:be-past:sentence.person}"] },
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] },
                            { includeOnArticlesAbout:["place"], if:"sentence.place", text:["there"] },
                        ],[
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] },
                            { includeOnArticlesAbout:["place"], if:"sentence.place", text:["there"] },
                            { text:["{conjugate:be-past:sentence.person}"] },
                            { text:["the {plural:witness:witnesses:sentence.person}"] },
                            { if:"sentence.victim", text:["of {own:sentence.victim} case"] },
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_SIMPLE_VARIATIONS },
                        ]
                    ]
                }
            ]
        }
    }, 
    forcedPersonToMove:{
        log:"forced {testimony.person} to move from {testimony.place}",
        topicSummary:{
            default:[
                "a kidnapping",
                "a nasty tug",
                "someone being dragged"
            ]
        },
        onInterviewDeclare:{ notByMe: true }, // It's a bad testimony, never admit if it's by me.
        juiciness:3,
        onProcess:{
            personIsNasty:true
        },
        article:{
            titles:[
                "Lock and load!",
                "Time to move!",
                "Together forever!"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:[
                                "{conjugate:havebeen-past:sentence.person} roughly moved",
                                "{conjugate:havebeen-past:sentence.person} dragged",
                                "{conjugate:havebeen-past:sentence.person} pushed",
                            ]},
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["from {sentence.place}"] }
                        ],[
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place},"] },
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:[
                                "{conjugate:havebeen-past:sentence.person} roughly moved away",
                                "{conjugate:havebeen-past:sentence.person} dragged",
                                "{conjugate:havebeen-past:sentence.person} pushed",
                            ]}
                            
                        ]
                    ]
                }
            ]
        }
    },
    menaced:{
        log:"was menacing {testimony.person} {conjugate:atin:testimony.place} {testimony.place}",
        topicSummary:{
            default:[
                "a menace",
                "a violent act",
                "something bad"
            ]
        },
        onInterviewDeclare:{ notByMe: true }, // It's a bad testimony, never admit if it's by me.
        juiciness:3,
        onProcess:{
            personInDanger:true
        },
        article:{
            titles:[
                "Hard words",
                "Today's debate",
                "Punishment time!"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:[
                                "{conjugate:be-past:sentence.person} menacing someone",
                                "{conjugate:be-past:sentence.person} very rude",
                                "{conjugate:be-past:sentence.person} pretty angry",
                            ]},
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] }
                        ],[
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place},"] },
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:[
                                "{conjugate:be-past:sentence.person} menacing someone",
                                "{conjugate:be-past:sentence.person} very rude",
                                "{conjugate:be-past:sentence.person} pretty angry",
                            ]}
                        ]
                    ]
                }
            ]
        }
    },
    investigating:{
        log:"was investigating {testimony.place}",
        topicSummary:{
            default:[
                "an investigation",
                "an inquiry",
                "a mysterious fact"
            ]
        },
        onInterviewDeclare:{ notByMe: true }, // Investigating is always suspicious. Never admit.
        juiciness:3,
        onProcess:false,
        article:{
            titles:[
                "Secret agency!",
                "Undercover operation",
                "Secret mission"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { excludeOnArticlesAbout:["place"], text:[
                                "{conjugate:be-past:sentence.person} investigating {sentence.place}",
                                "{conjugate:be-past:sentence.person} looking around {conjugate:atin:sentence.place} {sentence.place}",
                                "{conjugate:be-past:sentence.person} looking for something {conjugate:atin:sentence.place} {sentence.place}",
                            ]},
                            { includeOnArticlesAbout:["place"], text:[
                                "{conjugate:be-past:sentence.person} investigating",
                                "{conjugate:be-past:sentence.person} looking around",
                                "{conjugate:be-past:sentence.person} looking for something",
                            ]}
                        ],[
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place},"] },
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:[
                                "{conjugate:be-past:sentence.person} investigating",
                                "{conjugate:be-past:sentence.person} looking around",
                                "{conjugate:be-past:sentence.person} looking for something",
                            ]}
                        ]
                    ]
                }
            ]
        }
    },

    // ------ Less juicy (Personal weakness, Love affairs, conflicts)
    startResting:{
        log:"have seen {testimony.person} resting {conjugate:atin:testimony.place} {testimony.place}",
        topicSummary:{
            default:[
                "someone resting",
                "a sleeper",
                "someone who dozed off"
            ]
        },
        onInterviewDeclare:{ notByMe: true }, // Never admit breakdowns
        juiciness:2,
        onProcess:{
            personInDanger:true
        },
        article:{
            titles:[
                "Sleepy sleep!",
                "Good night!",
                "Electric sheeps"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:[
                                "{conjugate:be-past:sentence.person} resting",
                                "{conjugate:be-past:sentence.person} taking some rest",
                                "{conjugate:be-past:sentence.person} sleepy"
                            ]},
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] }
                        ],[
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place},"] },
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:[
                                "{conjugate:be-past:sentence.person} resting",
                                "{conjugate:be-past:sentence.person} taking some rest",
                                "{conjugate:be-past:sentence.person} sleepy"
                            ]}
                        ]
                    ]
                }
            ]
        }
    },

    // --- The rest is OK to admit anytime
    
    // ------ Very juicy (Murder)
    seeDeadBody:{
        log:"have seen the lying body of {testimony.person} {conjugate:atin:testimony.place} {testimony.place} {if:testimony.victimKnown:It knew the victim!}",
        topicSummary:{
            default:[
                "a person lying on the ground",
                "someone who didn't move",
                "someone who appeared to be dead"
            ]
        },
        onInterviewDeclare:true,
        juiciness:4,
        onProcess:{
            personIsDead:true
        },
        notRelatedFacts:true, // Passive, not related with the cause
        article:{
            titles:[
                "Dead or alive?",
                "Does it still move?",
                "Freeze!"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:its:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_OWN_VARIATIONS},
                            { text:["{plural:body:bodies:sentence.person} {conjugate:be-past:sentence.person} lying"]},
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["in {sentence.place}"] },
                            { includeOnArticlesAbout:["place"], if:"sentence.place", text:["there"] },
                        ],[
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place},"] },
                            { text:["there"] },
                            { text:["{conjugate:be-past:sentence.person}"]},
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:its:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_OWN_VARIATIONS},
                            { text:[
                                "still {plural:body:bodies:sentence.person}",
                                "{plural:body:bodies:sentence.person} lying"
                            ]},
                        ]
                    ]
                }
            ]
        }
    },
    
    // ------ Juicy (Supicious behaviour, violence, escapes)
    seeSomeoneSuspect:{
        log:"have seen the suspect {testimony.person} {conjugate:atin:testimony.place} {testimony.place}",
        topicSummary:{
            default:[
                "someone suspected",
                "a watchful person",
                "a suspicious person"
            ]
        },
        onInterviewDeclare:true,
        juiciness:3,
        onProcess:false,
        notRelatedFacts:true, // Spontaneous
        article:{
            titles:[
                "Something fishy here!",
                "Amateur investigators!",
                "Mysterious mysteries!"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["the"] },
                            { text:["{plural:suspect:suspects:sentence.person}"] },
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_SIMPLE_VARIATIONS},
                            { text:["{conjugate:be-past:sentence.person}"] },
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}" ] },
                            { includeOnArticlesAbout:["place"], if:"sentence.place", text:["there"] },
                        ],[
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}," ] },
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_SIMPLE_VARIATIONS},
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { text:[
                                "{conjugate:be-past:sentence.person} looking around",
                                "{conjugate:be-past:sentence.person} looking for something",
                                "{conjugate:be-past:sentence.person} watching",
                                "{conjugate:be-past:sentence.person} quite suspect"
                            ] },
                        ]
                    ]
                }
            ]
        }
    },
    menacedMe:{
        log:"have been menaced by {testimony.person} {conjugate:atin:testimony.place} {testimony.place}",
        topicSummary:{
            default:[
                "someone being threatened",
                "someone being oppressed",
                "someone being treated badly"
            ]
        },
        onInterviewDeclare:true,
        juiciness:3,
        onProcess:{
            personIsNasty:true
        },
        notRelatedFacts:true, // Personal
        article:{
            titles:[
                "Punching ball!",
                "Punished!",
                "Hold on!"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { text:SOMEONE_VARIATIONS },
                            { text:[
                                "has been menaced by",
                                "has been treated badly by"
                            ]},
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:itown:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] }
                        ],[
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place},"] },
                            { text:SOMEONE_SIMPLE_VARIATIONS },
                            { text:[
                                "has been menaced by",
                                "has been treated badly by"
                            ]},
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:itown:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS}
                        ]
                    ]
                }
            ]
        }
    },
    tiedMe:{
        log:"have been tied by {testimony.person} {conjugate:atin:testimony.place} {testimony.place}",
        topicSummary:{
            default:[
                "someone being immobilized",
                "someone being tied",
                "someone who used ropes"
            ]
        },
        onInterviewDeclare:true,
        juiciness:3,
        onProcess:{
            personIsNasty:true
        },
        article:{
            titles:[
                "Let's make a bond!",
                "Hard knots!",
                "Learning the ropes!"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"] },
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS },
                            { text:[
                                "tied a person",
                                "tied someone",
                                "immobilized a person",
                                "immobilized someone",
                            ] },
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"]  }
                        ],[
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place},"]  },
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:[
                                "tied a person",
                                "tied someone",
                                "immobilized a person",
                                "immobilized someone",
                            ] },
                        ]
                    ]
                }
            ]
        }
    },
    untied:{
        log:"untied {testimony.person} {conjugate:atin:testimony.place} {testimony.place}!",
        topicSummary:{
            default:[
                "someone who freed a guy",
                "a liberator",
                "a kind guy"
            ]
        },
        onInterviewDeclare:true,
        juiciness:3,
        onProcess:{
            personInDanger:true
        },
        article:{
            titles:[
                "Knot breaker!",
                "Et voila!",
                "Breaking free!"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"] },
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS },
                            { text:[
                                "{conjugate:havebeen-past:sentence.person} untied",
                                "{conjugate:havebeen-past:sentence.person} freed",
                                "{conjugate:havebeen-past:sentence.person} released",
                            ] },
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] }
                        ],[
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place},"] },
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"] },
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS },
                            { text:[
                                "{conjugate:havebeen-past:sentence.person} untied",
                                "{conjugate:havebeen-past:sentence.person} freed",
                                "{conjugate:havebeen-past:sentence.person} released",
                            ] },
                        ]
                    ]
                }
            ]
        }
    },
    untiedMe:{
        log:"have been untied by {testimony.person} {conjugate:atin:testimony.place} {testimony.place}",
        topicSummary:{
            default:[
                "someone being untied",
                "someone who has been freed",
                "someone who is now free"
            ]
        },
        onInterviewDeclare:true,
        juiciness:3,
        onProcess:false, // TODO: It should be treated like a hero?
        article:{
            titles:[
                "Set me free!",
                "You're welcome!",
                "Knot fighters!"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:[
                                "untied someone",
                                "freed someone",
                                "cut some ropes"
                            ]},
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] }
                        ],[
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place},"] },
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:[
                                "untied someone",
                                "freed someone",
                                "cut some ropes"
                            ]}
                        ]
                    ]
                }
            ]
        }
    },
    escaped:{
        log:"escaped the {testimony.person} attempt to {testimony.reason} {conjugate:atin:testimony.place} {testimony.place}!",
        topicSummary:{
            default:[
                "an escape",
                "a getaway",
                "someone who ran away"
            ]
        },
        onInterviewDeclare:true,
        juiciness:4,
        onProcess:{
            personBadVictimDanger:true
        },
        article:{
            titles:[
                "Run!",
                "Jogging today",
                "The fitness corner"
            ],
            sentences:[
                {
                    versions:[
                        [
                            // Victim have influence on others but it's omitted
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:[
                                "missed {conjugate:its:sentence.person} prey",
                                "lost {conjugate:its:sentence.person} prey"
                            ] },
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] }
                        ],[
                            // Victim have influence on others but it's omitted
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place},"] },
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:[
                                "missed {conjugate:its:sentence.person} prey",
                                "lost {conjugate:its:sentence.person} prey"
                            ] }
                        ],[
                            // Victim have influence on others but it's omitted
                            { text:SOMEONE_VARIATIONS },
                            { text:[
                                "was running away from",
                                "was escaping from"
                            ] },
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:itown:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] },
                        ]
                    ]
                }
            ]
        }
    },
    movedToSafePlace:{
        log:"moved to a safe place from {testimony.place}",
        topicSummary:{
            default:[
                "someone running away",
                "someone in a hurry",
                "a late person"
            ]
        },
        onInterviewDeclare:true,
        juiciness:3,
        onProcess:{
            personInDanger:true
        },
        article:{
            titles:[
                "Gotta go fast!",
                "You're safe now!",
                "Back to the base"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:[
                                "{conjugate:be-past:sentence.person} running",
                                "{conjugate:be-past:sentence.person} in a hurry"
                            ]},
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["from {sentence.place}"] },
                            { includeOnArticlesAbout:["place"], if:"sentence.place", text:["from there"] }
                        ],[
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:["left"]},
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{sentence.place}"] },
                            { text:[
                                "running",
                                "in a hurry"
                            ]},
                        ]
                    ]
                }
            ]
        }
    },
    
    // ------ Less juicy (Personal weakness, Love affairs, conflicts, prejudice)
    seeNewLover:{
        log:"have a seen {testimony.person} with a new lover {conjugate:atin:testimony.place} {testimony.place}",
        topicSummary:{
            default:[
                "lovers",
                "guilty people",
                "cheaters"
            ]
        },
        onInterviewDeclare:true,
        juiciness:{
            subjectNotMe:2
        },
        onProcess:{
            personLoveAffair:true
        },
        article:{
            titles:[
                "I can see the love!",
                "Heart watchers",
                "I saw you, sweety!"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:[
                                "{conjugate:be-past:sentence.person} with",
                                "met"
                            ]},
                            { text:[
                                "{conjugate:its:sentence.person}"
                            ]},
                            { text:[
                                "{plural:lover:lovers:sentence.person}",
                                "{plural:sweetheart:sweethearts:sentence.person}"
                            ]},
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] },
                        ],[
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place},"] },
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:[
                                "{conjugate:be-past:sentence.person} with",
                                "met"
                            ]},
                            { text:[
                                "{conjugate:its:sentence.person}"
                            ]},
                            { text:[
                                "{plural:lover:lovers:sentence.person}",
                                "{plural:sweetheart:sweethearts:sentence.person}"
                            ]}
                        ]
                    ]
                }
            ]
        }
    },
    seeDebating:{
        log:"have seen {testimony.person} debating {conjugate:atin:testimony.place} {testimony.place}",
        topicSummary:{
            default:[
                "a debate",
                "bad debates",
                "a nasty argument"
            ]
        },
        onInterviewDeclare:true,
        juiciness:2,
        onProcess:{
            personInDanger:true
        },
        article:{
            titles:[
                "Objection!",
                "Constructive debates",
                "Sharp words!"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"] },
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS },
                            { text:[
                                "{conjugate:be-past:sentence.person} debating with someone",
                                "{conjugate:have-past:sentence.person} a debate",
                                "{conjugate:have-past:sentence.person} a bad argument"
                            ] },
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"]  }
                        ],[
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place},"]  },
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"] },
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS },
                            { text:[
                                "{conjugate:be-past:sentence.person} debating with someone",
                                "{conjugate:have-past:sentence.person} a debate",
                                "{conjugate:have-past:sentence.person} a bad argument"
                            ] }
                        ]
                    ]
                }
            ]
        }
    },
    maybeHasBias:{
        log:"have guessed that {testimony.person} had bias {testimony.bias} {conjugate:atin:testimony.place} {testimony.place}",
        topicSummary:{
            default:[
                "people's biases",
                "prejudices",
                "biased people"
            ]
        },
        isBuzz:true,
        onInterviewDeclare:true,
        juiciness:3,
        onProcess:{
            compareBias:true
        },
        notRelatedFacts:true, // Spontaneous
        article:{
            titles:[
                "That's you!",
                "That's not good!",
                "Dis-criminals!"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { text:SOMEONE_VARIATIONS },
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] },
                            { text:[
                                "thought",
                                "has gotten the impression"
                            ] },
                            { text:[
                                "that"
                            ] },
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_SIMPLE_VARIATIONS},
                            { if:"sentence.person", text:[
                                "didn't appreciate",
                                "discriminated against",
                                "thought ill of",
                                "thought poorly of"
                            ]},
                            { if:"sentence.bias", text:["{sentence.bias}"]}
                        ]
                    ]
                }
            ]
        }
    },

    // ------ Not juicy (Small everyday facts)
    eavesdrop:{
        log:"eavesdropped {testimony.person} about {testimony.context} {conjugate:atin:testimony.place} {testimony.place}",
        topicSummary:{
            default:[
                "spying on people",
                "snitches",
                "spies"
            ]
        },
        doNotEavesdrop:true, // Avoid too much talking about talking
        onInterviewDeclare:true,
        juiciness:0,
        onProcess:false,
        // It has related facts since they're useful for investigation.
        article:{
            sentences:[
                {
                    versions:[
                        [
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:["{conjugate:be-past:sentence.person}"]},
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] },
                            { includeOnArticlesAbout:["place"], if:"sentence.place", text:["there"] },
                            {
                                text:["and {conjugate:it:sentence.person} {conjugate:be-past:sentence.person}"]
                            },
                            { text:[
                                "whispering",
                                "whispering",
                                "whispering something",
                                "saying something"
                            ]},
                            {
                                text:["about"]
                            },
                            { excludeOnArticlesAbout:["context"], text:["{summarizeTestimony:sentence}"] },
                            { includeOnArticlesAbout:["context"], text:THATTOPIC_VARIATIONS },
                        ],[
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:["{conjugate:be-past:sentence.person}"]},
                            { text:[
                                "whispering",
                                "whispering",
                                "whispering something",
                                "saying something"
                            ]},
                            {
                                text:["about"]
                            },
                            { excludeOnArticlesAbout:["context"], text:["{summarizeTestimony:sentence}"] },
                            { includeOnArticlesAbout:["context"], text:THATTOPIC_VARIATIONS },
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] },
                        ]
                    ]
                }
            ]
        }
    },
    chitChatWith:{
        log:"chitchatted with {testimony.person} about {testimony.context} {conjugate:atin:testimony.place} {testimony.place}",
        topicSummary:{
            default:[
                "people who talk too much",
                "chatterboxes",
                "gossipy people"
            ]
        },
        doNotEavesdrop:true, // Avoid too much talking about talking
        onInterviewDeclare:true,
        juiciness:0,
        onProcess:false,
        // It has related facts since they're useful for investigation.
        article:{
            titles:[
                "Buzz buzz!",
                "Gossipy people",
                "Whispers"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:["{conjugate:be-past:sentence.person}"] },
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] },
                            { includeOnArticlesAbout:["place"], if:"sentence.place", text:["there"] },
                            {
                                text:["and {conjugate:it:sentence.person} {conjugate:be-past:sentence.person}"]
                            },
                            { text:[
                                "chitchatting about",
                                "talking about",
                                "discussing"
                            ]},
                            { excludeOnArticlesAbout:["context"], text:["{summarizeTestimony:sentence}"] },
                            { includeOnArticlesAbout:["context"], text:THATTOPIC_VARIATIONS },
                        ],[
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:["{conjugate:be-past:sentence.person}"] },
                            { text:[
                                "chitchatting about",
                                "talking about",
                                "discussing"
                            ]},
                            { excludeOnArticlesAbout:["context"], text:["{summarizeTestimony:sentence}"] },
                            { includeOnArticlesAbout:["context"], text:THATTOPIC_VARIATIONS },
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] },
                        ]
                    ]
                }
            ]
        }
    },
    addFriend:{
        log:"found the new friend {testimony.person} {conjugate:atin:testimony.place} {testimony.place}",
        topicSummary:{
            default:[
                "someone with a friend",
                "friendship",
                "someone's friends"
            ]
        },
        onInterviewDeclare:true,
        juiciness:1,
        onProcess:{
            personMakesJealous:true
        },
        notRelatedFacts:true, // Personal
        article:{
            titles:[
                "Friendship!",
                "BFF!",
                "Soul mates"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:[
                                "found",
                                "met"
                            ]},
                            { text:[
                                "a new friend"
                            ]},
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] }
                        ],[
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place},"] },
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:[
                                "found",
                                "met"
                            ]},
                            { text:[
                                "a new friend"
                            ]}
                        ]
                    ]
                }
            ]
        }
    },

    // ------ Relatively avoided (Buzz, rumors, money problems)
    newLover:{
        log:"found a new lover {testimony.person} {conjugate:atin:testimony.place} {testimony.place}",
        topicSummary:{
            default:[
                "spicy rumors",
                "naughty secrets",
                "gossip columns"
            ]
        },
        onInterviewDeclare:true,
        juiciness:{
            aboutOthers:1
        },
        onProcess:{
            personLoveAffair:true
        },
        article:{
            titles:[
                "Daily voyeur!",
                "Love is in the air!",
                "Kisses, kisses, kisses!"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:[ "found" ]},
                            { text:[
                                "true love",
                                "a lover",
                                "{conjugate:its:sentence.person} lover"
                            ]},
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] },
                        ],[
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place},"] },
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:[ "found" ]},
                            { text:[
                                "true love",
                                "a lover",
                                "{conjugate:its:sentence.person} lover"
                            ]}
                        ]
                    ]
                }
            ]
        }
    },
    cantPay:{
        log:"have seen {testimony.person} can't pay {testimony.to} {conjugate:atin:testimony.place} {testimony.place}",
        topicSummary:{
            default:[
                "someone with money issues",
                "people on a budget",
                "people with no money"
            ]
        },
        isBuzz:true,
        onInterviewDeclare:true,
        juiciness:{
            forSpecialOne:-1 // Don't tell to special one to not to depress him
        },
        onProcess:{
            personInDanger:true
        },
        article:{
            titles:[
                "On a budget!",
                "Gone broke!",
                "Empty wallets!"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:[
                                "{conjugate:have-past:sentence.person} some money issues",
                                "{conjugate:have-past:sentence.person} some issues with money",
                            ] },
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] }
                        ],[
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place},"] },
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_VARIATIONS},
                            { text:[
                                "{conjugate:have-past:sentence.person} some money issues",
                                "{conjugate:have-past:sentence.person} some issues with money",
                            ] }
                        ]
                    ]
                }
            ]
        }
    },
    isBadPerson:{
        log:"said that {testimony.person} is a bad person {conjugate:atin:testimony.place} {testimony.place}",
        topicSummary:{
            default:[
                "bad people",
                "bad guys",
                "terrible people"
            ]
        },
        isBuzz:true,
        onInterviewDeclare:true,
        juiciness:{
            forSpecialOne:-1 // Don't tell to special one that someone is talking bad of it
        },
        onProcess:{
            personIsBad:true
        },
        article:{
            titles:[
                "Bad people!",
                "The bad guys!",
                "The evil"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { text:SOMEONE_VARIATIONS },
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] },
                            { text:HEARDSAID_VARIATIONS },
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_SIMPLE_VARIATIONS},
                            { if:"sentence.person", text:[
                                "{conjugate:be-present:sentence.person}"
                            ]},
                            { if:"sentence.person", text:[
                                "bad",
                                "nasty",
                                "terrible",
                            ]},
                        ],[
                            { text:SOMEONE_VARIATIONS },
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] },
                            { text:HEARDSAID_VARIATIONS },
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_SIMPLE_VARIATIONS},
                            { if:"sentence.person", text:[
                                "{conjugate:bea-present:sentence.person}"
                            ]},
                            { if:"sentence.person", text:[
                                "bad",
                                "nasty",
                                "terrible",
                            ]},
                            { if:"sentence.person", text:[
                                "{plural:person:people:sentence.person}"
                            ]}
                        ]
                    ]
                }
            ]
        }
    },
    isGoodPerson:{
        log:"said that {testimony.person} is a good person {conjugate:atin:testimony.place} {testimony.place}",
        topicSummary:{
            default:[
                "nice people",
                "interesting people",
                "cool people"
            ]
        },
        isBuzz:true,
        onInterviewDeclare:true,
        juiciness:{
            forNotSpecialOne:-1  // Don't tell to normal one that someone is talking good of it
        },
        onProcess:{
            personIsGood:true
        },
        article:{
            titles:[
                "Good people!",
                "They're good!",
                "Cool people"
            ],
            sentences:[
                {
                    versions:[
                        [
                            { text:SOMEONE_VARIATIONS },
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] },
                            { text:HEARDSAID_VARIATIONS },
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_SIMPLE_VARIATIONS},
                            { if:"sentence.person", text:[
                                "{conjugate:bea-present:sentence.person}"
                            ]},
                            { if:"sentence.person", text:[
                                "good",
                                "nice",
                                "great"
                            ]},
                            { if:"sentence.person", text:[
                                "{plural:person:people:sentence.person}"
                            ]}
                        ],[
                            { text:SOMEONE_VARIATIONS },
                            { excludeOnArticlesAbout:["place"], if:"sentence.place", text:["{conjugate:atin:sentence.place} {sentence.place}"] },
                            { text:HEARDSAID_VARIATIONS },
                            { includeOnArticlesAbout:["person"], if:"sentence.person", text:["{conjugate:it:sentence.person}"]},
                            { excludeOnArticlesAbout:["person"], if:"sentence.person", text:PERSONLIST_SIMPLE_VARIATIONS},
                            { if:"sentence.person", text:[
                                "{conjugate:be-present:sentence.person}"
                            ]},
                            { if:"sentence.person", text:[
                                "{plural:a good person:good people:sentence.person}",
                                "nice",
                                "great"
                            ]}
                        ]
                    ]
                }
            ]
        }
    }
}

const TITLES_DATABASE={
    person:{
        titles:[
            "All about {cluster.subject}!",
            "Spotlight on {cluster.subject}!",
            "{cluster.subject} 101!"
        ]
    },
    place:{
        titles:[
            "{cluster.subject} gazette",
            "{cluster.subject} watcher",
            "Living {cluster.subject}"
        ]
    },
    bias:{
        titles:[
            "{cluster.subject} Discriminator!",
            "{cluster.subject}?",
            "What about {cluster.subject}?"
        ]
    },
    victim:{
        titles:[
            "Poor {cluster.subject}!",
            "Goodbye {cluster.subject}!",
            "Farewell {cluster.subject}!"
        ]
    },
    gossip:{
        titles:[
            "Rumors!",
            "Buzz buzz!",
            "Chatter!"
        ]
    },
    context:{
        titles:[
            "{summarizeTestimony:cluster.testimonies.0}!",
            "{summarizeTestimony:cluster.testimonies.0} today",
            "{summarizeTestimony:cluster.testimonies.0} 24/7"
        ]
    },
    gossipSummary:{
        titles:[
            "Shrinked buzzes!",
            "Squeezed gossips!",
            "Packed rumors!"
        ]
    },
    misc:{
        titles:[
            "One more thing!",
            "The flurry",
            "The blender"
        ]
    },
};

const QUESTIONS_DATABASE=[
    {
        label:"name is",
        question:{
            structure:[
                { id:"name", type:"input" }
            ]
        }
    },
    {
        label:"surname is",
        question:{
            structure:[
                { id:"surname", type:"input" }
            ]
        }
    },
    {
        label:"gender is",
        question:{
            structure:[
                { id:"gender", type:"select", options:[
                    { id:"A", label:"male" },
                    { id:"B", label:"female" }
                ]}
            ]
        }
    },
    {
        label:"maritial status is",
        question:{
            structure:[
                { id:"marriedWith", type:"select", options:[
                    { id:"", label:"not married", asId:"partner", isFalse:true },
                    { id:"1", label:"married with", skipCheck:true }
                ]},
                { if:{marriedWith:["1"]}, id:"partner", asTagId:true, type:"person", excludeEntity:true },
            ]
        }
    },
    {
        label:"discriminates against",
        question:{
            structure:[
                { id:"biases", type:"select",  asTagInId:true, options:[
                    { id:"", label:"nothing", asId:"biases", isEmpty:true },
                    { ids:"biasesModels" }
                ]}
            ]
        }
    }
];

const REASONS_DATABASE={
    // --- Death/Collapse reasons
    testimonySuspectIsBonded:{
        category:"Suspect",
        priority:0,
        label:"known person was suspected"
    },
    specialOneInDanger:{
        category:"Suspect",
        priority:0,
        label:"someone special was in danger"
    },
    toldWrongBiasAboutMe:{
        category:"Bias",
        priority:0,
        label:"accused of bias"
    },
    forgotTestimony:{
        category:"Violence",
        priority:0,
        label:"violence"
    },
    shock:{
        category:"Status",
        priority:0,
        label:"being shocked"
    },
    foundTiedSpecialPerson:{
        category:"Tie",
        priority:0,
        label:"found someone special tied"
    },
    foundTiedPerson:{
        category:"Tie",
        priority:0,
        label:"found someone suspectly tied"
    },
    biasedPersonFoundInvestigating:{
        category:"Investigation",
        priority:0,
        label:"investigating on someone biased"
    },
    noMoney:{
        category:"Money",
        priority:0,
        label:"money problems"
    },
    dontAgree:{
        category:"Debating",
        priority:0,
        label:"ideas divergence"
    },
    cantPerformSchedule:{
        // Too frequent, removed
        // category:"Status",
        // priority:0,
        // label:"being unstable"
    },
    flirtFailed:{
        category:"Love",
        priority:0,
        label:"love rejected"
    },
    staminaOver:{
        category:"Status",
        priority:0,
        label:"being exhausted"
    },
    murder:{
        category:"Murder",
        priority:0,
        label:"being murdered"
    },
    // --- Stress/Suspect reasons
    tiedBy:{
        category:"Tie",
        priority:0,
        label:"being tied"
    },
    badReputation:{
        category:"Suspect",
        priority:0,
        label:"bad reputation"
    },
    failedDebate:{
        category:"Debating",
        priority:0,
        label:"failed important debate"
    },
    partnerHasLover:{
        category:"Love",
        priority:0,
        label:"partner found a lover"
    },
    murderVictimEscaped:{
        category:"Murder",
        priority:0,
        label:"murdering attempt failed"
    },
    foundSuspiciousInvestigating:{
        category:"Investigation",
        priority:0,
        label:"found someone suspicious"
    },
    jealousOfSpecialOneFriend:{
        category:"Love",
        priority:0,
        label:"jealousy"
    },
    failedTie:{
        category:"Tie",
        priority:0,
        label:"tie attempt failed"
    },
    // --- Suspect reasons
    isBiased:{
        category:"Bias",
        priority:0,
        label:"biasing"
    },
    knewSpecialLover:{
        category:"Love",
        priority:0,
        label:"being the suspected lover of its partner"
    },
    isMurderer:{
        category:"Murder",
        priority:0,
        label:"being a suspected murderer"
    },
    escapedFrom:{
        category:"Escape",
        priority:0,
        label:"escaping from it"
    },
    // --- Suspect reasons from testimonies
    isBadPersonTestimony:{
        category:"Suspect",
        priority:1,
        label:"rumored that it was a bad person"
    },
    newLoverTestimony:{
        category:"Love",
        priority:1,
        label:"rumored that it found a lover"
    },
    seeNewLoverTestimony:{
        category:"Love",
        priority:1,
        label:"people have seen it with a lover"
    },
    cantPayTestimony:{
        category:"Money",
        priority:1,
        label:"rumored that it had suspect money problems"
    },
    escapedTestimony:{
        category:"Escape",
        priority:1,
        label:"rumored that that someone escaped from it"
    },
    seeSomeoneSuspectTestimony:{
        category:"Suspect",
        priority:1,
        label:"rumored that it was suspect"
    },
    investigatingTestimony:{
        category:"Investigation",
        priority:1,
        label:"rumored that it was investigating too much"
    },
    seeDebatingTestimony:{
        category:"Debating",
        priority:1,
        label:"rumored that it was violently debating"
    },
    menacedTestimony:{
        category:"Violence",
        priority:0,
        label:"rumored that it have seen too much"
    },
    forcedPersonToMoveTestimony:{
        category:"Violence",
        priority:1,
        label:"rumored that it dragged someone"
    },
    seeTheMurdererTestimony:{
        category:"Murder",
        priority:1,
        label:"rumored that it committed a murder"
    },
    tiedMeTestimony:{
        category:"Tie",
        priority:1,
        label:"rumored that it tied a person"
    },
    menacedMeTestimony:{
        category:"Violence",
        priority:1,
        label:"rumored that it menaced someone"
    },
    // --- Ignore
    movedToSafePlace:{}, // A place suspect reason, not asked
    movedToSafePlaceTestimony:{},
};

const COLUMN_DATABASE={
    titles:[
        "{symbol pawSymbol} The pawticulars {symbol pawSymbol}"
    ],
    columns:[
        {
            titles:[
                "My best pals!",
                "My compawnions",
                "My friends!"
            ],
            subject:"persons",
            tag:"obscurity",
            orderDesc:true,
            includeAll:true
        },{
            titles:[
                "Places to kickstart your day!",
                "Best breakfasts!",
                "Wake up and eat here!"
            ],
            subject:"places",
            tag:"breakfast",
            orderDesc:true
        },{
            titles:[
                "Places for a nice lunch!",
                "Midday delicacies!",
                "Be here at lunch!"
            ],
            subject:"places",
            tag:"lunch",
            orderDesc:true
        },{
            titles:[
                "Places for great dinners!",
                "Dine in style",
                "Unforgettable dinners"
            ],
            subject:"places",
            tag:"dinner",
            orderDesc:true
        },{
            titles:[
                "Places with cozy beds!",
                "Best places to sleep",
                "Sweet dreams!"
            ],
            subject:"places",
            tag:"sleep",
            orderDesc:true
        },{
            titles:[
                "The slacking hounds!",
                "Sleepyheads!",
                "Nasty latecomers!"
            ],
            subject:"persons",
            tag:"workCantPerform",
            orderDesc:true,
            includeAll:true
        }
    ]
};