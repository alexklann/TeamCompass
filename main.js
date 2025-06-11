import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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

// const controls = new OrbitControls( camera, renderer.domElement );
const clock = new THREE.Clock();
const loader = new GLTFLoader();

var model = null;
loader.load(
    'lvl1.glb',
    function (gltf) {
        model = gltf.scene;
        scene.add(model);
    },
    undefined,
    function (error) {
        console.error('An error happened while loading the model:', error);
    }
);

const skyColor = 0xB1E1FF;  // light blue
const groundColor = 0xB97A20;  // brownish orange
const intensity = 1;
const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

camera.position.x = 0;
camera.position.y = 3;
camera.position.z = 2;

camera.rotation.x = -0.4;
camera.rotation.y = 0.01;
camera.rotation.z = 0.01;

function showQuestion(questionText, answerA, answerB, correctAnswer) {
    return;
}

function update() {
    const delta = clock.getDelta();
    requestAnimationFrame(update);
    if (model) {
        model.rotation.y += 0.05 * delta; // Rotate the model for some animation
    }
    // controls.update();

    renderer.render(scene, camera);
}
update();