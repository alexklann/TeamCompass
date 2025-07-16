import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Current count: 21 questions
// https://en.wikipedia.org/wiki/Environmental_impact_of_artificial_intelligence
// https://news.climate.columbia.edu/2023/06/09/ais-growing-carbon-footprint/
// https://www.technologyreview.com/2025/05/20/1116327/ai-energy-usage-climate-footprint-big-tech/
// https://www.polytechnique-insights.com/en/columns/energy/generative-ai-energy-consumption-soars/
// https://www.unep.org/news-and-stories/story/ai-has-environmental-problem-heres-what-world-can-do-about?__cf_chl_tk=yCmOlUqLrgYAe8HeI3fr_ZMJN1YJ7i1fBDnXXz2lq04-1751050880-1.0.1.1-eSX1XT.5hTWqd9ZHK4D_UjyisZXfRGmsheAJ0.JR4ik
// https://news.mit.edu/2025/explained-generative-ai-environmental-impact-0117
// https://oecd.ai/en/wonk/how-much-water-does-ai-consume?utm_source=chatgpt.com
const questions = [
    {
        question: "How much water does GPT use for a 100 word email?",
        answers: ["350ml", "500ml"],
        correctAnswer: "500ml"
    },
    {
        question: "How much did water usage spike, since the spread of LLMs?",
        answers: ["25%", "20%"],
        correctAnswer: "20%"
    },
    {
        question: "How much energy did the training of GPT-3 use?",
        answers: ["1351MWh", "1287MWh"],
        correctAnswer: "1287MWh"
    },
    {
        question: "How much more energy does an AI search use compared to a Google search?",
        answers: ["100x more", "75x more"],
        correctAnswer: "100x more"
    },
    {
        question: "How many households can be powered by the energy consumed in training GPT-4 for a day?",
        answers: ["1.53M households", "1.086M households"],
        correctAnswer: "1.086M households"
    },
    {
        question: "How much raw materials does it take to manufacture an AI-ready server?",
        answers: ["750kg", "800kg"],
        correctAnswer: "800kg"
    },
    {
        question: "What percent of the world's electricity will be used by AI by 2026?",
        answers: ["45%", "35%"],
        correctAnswer: "35%"
    },
    {
        question: "How much electricity would be used, if we replaced Google with AI?",
        answers: ["10TWh per year", "8TWh per year"],
        correctAnswer: "10TWh per year"
    },
    {
        question: "How many tons of CO2 did the training of GPT-3 release?",
        answers: ["522 Tons", "612 Tons"],
        correctAnswer: "522 Tons"
    },
    {
        question: "What percentage of global e-waste is caused by AI?",
        answers: ["8%", "12%"],
        correctAnswer: "8%"
    },
    {
        question: "On what place is AI in the list of the biggest energy consumers?",
        answers: ["11th", "15th"],
        correctAnswer: "11th"
    },
    {
        question: "How many liters of water did the training of GPT-3 use?",
        answers: ["700,000 liters", "500,000 liters"],
        correctAnswer: "700,000 liters"
    },
    {
        question: "How many electric vehicles could be produced with the water that GPT-3 used in training?",
        answers: ["320", "280"],
        correctAnswer: "320"
    },
    {
        question: "What percentage of freshwater in a small Iowa town is used by Microsoft's AI?",
        answers: ["5%", "8%"],
        correctAnswer: "8%"
    },
    {
        question: "How many European residents could be supplied with the energy used by AI in training?",
        answers: ["1.5M", "1.3M"],
        correctAnswer: "1.5M"
    },
    {
        question: "How much ultra-pure water does it take to produce a microchip?",
        answers: ["1,853", "2,200"],
        correctAnswer: "2,200"
    },
    {
        question: "How water can GPT-4 use to generate a 100 word email?",
        answers: ["Up to 750ml", "Up to 1,400ml"],
        correctAnswer: "Up to 1,400ml"
    },
    {
        question: "How much more water does GPT-4 use compared to GPT-3?",
        answers: ["8x more", "14x more"],
        correctAnswer: "14x more"
    },
    {
        question: "Why does AI training use up water?",
        answers: ["The AI models get thirsty", "Water is used for cooling the servers"],
        correctAnswer: "Water is used for cooling the servers"
    },
    {
        question: "How much has power usage gone up in data centers in 2023?",
        answers: ["1.78x", "1.50x"],
        correctAnswer: "1.50x"
    },
    {
        question: "How much electricity usage will data centers approach by 2026?",
        answers: ["876MWh", "1,050TWh"],
        correctAnswer: "1,050TWh"
    },
    {
        question: "How many U.S. homes could be powered from the power usage of GPT-3's training for a year?",
        answers: ["154", "120"],
        correctAnswer: "120"
    },
]

var answeredQuestions = [];

var currentQuestion = null;

var buzzerAnimationState = 0; // 0 Up 1 Down
var buzzerAnimationTimer = 0;

var endScreenTimer = 0;

var currentUserScore = 0;
var todaysHighScore = 0;

var currentScreen = 'start';

var currentHealth = 3;
var lastHealth = 0;

const modelCache = {
    "3hp.glb": null,
    "2hp.glb": null,
    "1hp.glb": null,
    "0hp.glb": null
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();
const loader = new GLTFLoader();

let modelsToLoad = Object.keys(modelCache).length;
let modelsLoaded = 0;

function preloadModel(url, scale = 0.75, position = { x: 0, y: 0, z: 0 }, callback = null) {
    loader.load(
        url,
        function (gltf) {
            const loaded = gltf.scene;
            loaded.scale.set(scale, scale, scale);
            loaded.position.set(position.x, position.y, position.z);
            loaded.visible = false;
            modelCache[url] = loaded;
            scene.add(loaded);

            modelsLoaded++;
            if (modelsLoaded === modelsToLoad) {
                onAllModelsLoaded();
            }

            if (callback) callback(loaded);
        },
        undefined,
        function (error) {
            console.error(`Error preloading model "${url}":`, error);
        }
    );
}

function onAllModelsLoaded() {
    setCorrectModel();
    update();
}

preloadModel("3hp.glb");
preloadModel("2hp.glb");
preloadModel("1hp.glb");
preloadModel("0hp.glb");

let model = null;
let currentModelName = "";

function setCorrectModel() {
    const modelName = `${currentHealth}hp.glb`;
    if (modelName === currentModelName) return;

    // Hide previous model
    if (model && modelCache[currentModelName]) {
        modelCache[currentModelName].visible = false;
    }

    // Show new model
    const newModel = modelCache[modelName];
    if (newModel) {
        newModel.visible = true;

        // Transfer rotation from old model (if any)
        if (model) {
            newModel.rotation.x = model.rotation.x;
            newModel.rotation.y = model.rotation.y;
            newModel.rotation.z = model.rotation.z;
        }

        model = newModel;
        currentModelName = modelName;
    } else {
        console.warn(`Model "${modelName}" not yet loaded.`);
    }
}


const skyColor = 0xB1E1FF;  // light blue
const groundColor = 0xB97A20;  // brownish orange
const intensity = 1;
const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

camera.position.x = -2.25;
camera.position.y = 2.25;
camera.position.z = 5.25;

camera.rotation.x = -0.4;
camera.rotation.y = 0.01;
camera.rotation.z = 0.01;

function showQuestion(questionText, answerA, answerB, correctAnswer) {
    currentQuestion = [questionText, answerA, answerB, correctAnswer];
    document.getElementById('question-text').innerHTML = questionText;
    document.getElementById('answer-a').innerHTML = answerA;
    document.getElementById('answer-b').innerHTML = answerB;
}

function getRandomQuestion() {
    if (answeredQuestions.length === questions.length || currentHealth == 0) {
        currentScreen = 'end';
        return null;
    }
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * questions.length);
    } while (answeredQuestions.includes(randomIndex));
    
    answeredQuestions.push(randomIndex);
    return questions[randomIndex];
}

function changeBackground(status) {
    if (status === 'correct') {
        document.getElementById('background').style.backgroundImage = 'linear-gradient(#468041, #2b331f)';
    } else if (status === 'incorrect') {
        document.getElementById('background').style.backgroundImage = 'linear-gradient(#bf4c32, #421e16)';
    } else {
        document.getElementById('background').style.backgroundImage = 'linear-gradient(#517db8, #1d3d54)';
    }
}

function answerQuestion(guess) {
    if (guess === 0) {
        if (currentQuestion && currentQuestion[1] === currentQuestion[3]) {
            changeBackground('correct');
            currentUserScore++;
            if (currentUserScore > todaysHighScore) {
                todaysHighScore = currentUserScore;
            }
        } else {
            currentHealth -= 1;
            changeBackground('incorrect');
        }
    } else if (guess === 1) {
        if (currentQuestion && currentQuestion[2] === currentQuestion[3]) {
            changeBackground('correct');
            currentUserScore++;
            if (currentUserScore > todaysHighScore) {
                todaysHighScore = currentUserScore;
            }
        } else {
            currentHealth -= 1;
            changeBackground('incorrect');
        }
    } else {
        console.error('Invalid guess:', guess);
        return;
    }

    updateScoreText();

    const nextQuestion = getRandomQuestion();
    if (nextQuestion) {
        showQuestion(nextQuestion.question, nextQuestion.answers[0], nextQuestion.answers[1], nextQuestion.correctAnswer);
    }
}

var randomQuestion = getRandomQuestion();
showQuestion(randomQuestion.question, randomQuestion.answers[0], randomQuestion.answers[1], randomQuestion.correctAnswer);
changeBackground('default');

document.addEventListener('keydown', onKeyDown, false);

function onKeyDown(event) {
    var keycode = event.which;
    switch (keycode) {
        case 49:
            if (currentScreen === 'start') {
                restartGame();
                return;
            } else if (currentScreen === 'end') {
                currentHealth = 3;
                changeBackground('default');
                currentScreen = 'start';
                lastHealth = 0;
                return;
            }
            answerQuestion(0); // 1 key
            break;
        case 50:
            if (currentScreen === 'start') {
                restartGame();
                return;
            } else if (currentScreen === 'end') {
                currentHealth = 3;
                changeBackground('default');
                currentScreen = 'start';
                lastHealth = 0;
                return;
            }
            answerQuestion(1); // 2 key
            break;
    }
}

function switchBuzzerAnimationState() {
    if (currentScreen === 'start') {
        if (buzzerAnimationState === 0) {
            buzzerAnimationState = 1; // Switch to Down
            document.getElementById('buzzer-start-green').src = 'buzzer-green-down.webp';
            document.getElementById('buzzer-start-red').src = 'buzzer-red-down.webp';
        } else {
            buzzerAnimationState = 0; // Switch to Up
            document.getElementById('buzzer-start-green').src = 'buzzer-green-up.webp';
            document.getElementById('buzzer-start-red').src = 'buzzer-red-up.webp';
        }
    } else if (currentScreen === 'quiz') {
        if (buzzerAnimationState === 0) {
            buzzerAnimationState = 1; // Switch to Down
            document.getElementById('buzzer-green').src = 'buzzer-green-down.webp';
            document.getElementById('buzzer-red').src = 'buzzer-red-down.webp';
        } else {
            buzzerAnimationState = 0; // Switch to Up
            document.getElementById('buzzer-green').src = 'buzzer-green-up.webp';
            document.getElementById('buzzer-red').src = 'buzzer-red-up.webp';
        }
    } else {
        if (buzzerAnimationState === 0) {
            buzzerAnimationState = 1; // Switch to Down
            document.getElementById('buzzer-end-green').src = 'buzzer-green-down.webp';
            document.getElementById('buzzer-end-red').src = 'buzzer-red-down.webp';
        } else {
            buzzerAnimationState = 0; // Switch to Up
            document.getElementById('buzzer-end-green').src = 'buzzer-green-up.webp';
            document.getElementById('buzzer-end-red').src = 'buzzer-red-up.webp';
        }
    }
}

function updateScoreText() {
    document.getElementById('current-score').innerHTML = `Your Score:\n${currentUserScore}`;
    document.getElementById('high-score').innerHTML = `High Score:\n${todaysHighScore}`;
    document.getElementById('end-score-text').innerHTML = `You've scored ${currentUserScore} points!<br/>But that's okay!<br/>You're not alone!`;
    document.getElementById('start-high-score').innerHTML = `Today's High Score:<br/>${todaysHighScore}`;
}

function restartGame() {
    currentHealth = 3;
    lastHealth = 0;
    answeredQuestions = [];
    currentUserScore = 0;
    updateScoreText();
    randomQuestion = getRandomQuestion();
    showQuestion(randomQuestion.question, randomQuestion.answers[0], randomQuestion.answers[1], randomQuestion.correctAnswer);
    changeBackground('default');
    currentScreen = 'quiz'
}

function toggleLED(port, status) {
    fetch('http://127.0.0.1:8000/led', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            port: port,
            status: status
        })
    })
}

function update() {
    const delta = clock.getDelta();
    requestAnimationFrame(update);
    if (model) {
        model.rotation.y += 0.05 * delta;
        model.rotation.x += 0.08 * delta;
    }
    buzzerAnimationTimer += delta;
    if (currentScreen === 'end') {
        endScreenTimer += delta;
        if (endScreenTimer >= 30.0) {
            changeBackground('default');
            currentScreen = 'start';
            return;
        }
    }
    if (buzzerAnimationTimer >= 0.7) {
        switchBuzzerAnimationState();
        buzzerAnimationTimer = 0;
    }
    if (currentScreen === 'start') {
        document.getElementById('start-screen').style.display = 'flex';
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('end-screen').style.display = 'none';
    } else if (currentScreen === 'quiz') {
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'flex';
        document.getElementById('end-screen').style.display = 'none';
    } else {
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('end-screen').style.display = 'flex';
    }
    if (lastHealth != currentHealth) {
        toggleLED(2, currentHealth == 3);
        toggleLED(3, currentHealth >= 2);
        toggleLED(4, currentHealth >= 1);
        setCorrectModel();
        lastHealth = currentHealth;
    }
    renderer.render(scene, camera);
}