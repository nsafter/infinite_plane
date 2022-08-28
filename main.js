import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";
import { RenderPass } from "./node_modules/three/examples/jsm/postprocessing/RenderPass.js";
import { EffectComposer } from "./node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { GammaCorrectionShader } from "./node_modules/three/examples/jsm/shaders/GammaCorrectionShader.js";
import { ShaderPass } from "./node_modules/three/examples/jsm/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "./node_modules/three/examples/jsm/shaders/RGBShiftShader.js";
import { GUI } from "dat.gui";
import { vertexShader, fragmentShader } from "./shader.js";

const TEXTURE_PATH =
  "https://res.cloudinary.com/dg5nsedzw/image/upload/v1641657168/blog/vaporwave-threejs-textures/grid.png";
const DISPLACEMENT_PATH =
  "https://res.cloudinary.com/dg5nsedzw/image/upload/v1641657200/blog/vaporwave-threejs-textures/displacement.png";

// Textures
const textureLoader = new THREE.TextureLoader();
const gridTexture = textureLoader.load(TEXTURE_PATH);
const terrainTexture = textureLoader.load(DISPLACEMENT_PATH);

const canvas = document.querySelector("#bg");

// Scene
const scene = new THREE.Scene();

const fog = new THREE.Fog("#000000", 1, 2.5);
scene.fog = fog;

// Objects
const geometry = new THREE.PlaneGeometry(1, 2, 100, 100);
const material = new THREE.MeshStandardMaterial({
  map: gridTexture,
  displacementMap: terrainTexture,
  displacementScale: 0.5,
  metalness: 0.85,
  roughness: 0.95,
});

const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = 0.0;
plane.position.z = 0.15;

const plane2 = new THREE.Mesh(geometry, material);
plane2.rotation.x = -Math.PI * 0.5;
plane2.position.y = 0.0;
plane2.position.z = -1.85;

scene.add(plane);
scene.add(plane2);

const ambientLight = new THREE.AmbientLight("#ffffff", 100);
scene.add(ambientLight);

const spotlight = new THREE.SpotLight("#d53c3d", 20, 25, Math.PI * 0.1, 0.25);
spotlight.position.set(0.5, 0.75, 2.2);
spotlight.target.position.x = -0.25;
spotlight.target.position.y = 0.25;
spotlight.target.position.z = 0.25;
scene.add(spotlight);
scene.add(spotlight.target);
const spotlight2 = new THREE.SpotLight("#d53c3d", 20, 25, Math.PI * 0.1, 0.25);
spotlight2.position.set(-0.5, 0.75, 2.2);
spotlight2.target.position.x = 0.25;
spotlight2.target.position.y = 0.25;
spotlight2.target.position.z = 0.25;
scene.add(spotlight2);
scene.add(spotlight2.target);
const materialParams = {
  planeMeshColor: plane.material.color.getHex(),
};

const lightParams = {
  spotlightColor: spotlight.color.getHex(),
  spotlightColor2: spotlight.color.getHex(),
};

// audio
var analyser, dataArray, audioContext, audioElement, source, uniforms;
audioElement = document.getElementById("aud");

// var selectedValue = document.getElementById("myplay").value;
audioElement.addEventListener("play", () => {
  if (audioContext) {
    return;
  }
  audioContext = new window.AudioContext();
  audioElement = document.getElementById("aud");
  // audioElement.source =
  // console.log(selectedValue);
  source = audioContext.createMediaElementSource(audioElement);
  analyser = audioContext.createAnalyser();
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  analyser.fftSize = 1024;
  dataArray = new Uint8Array(analyser.frequencyBinCount);
  console.log(dataArray);
  uniforms = {
    u_time: {
      type: "f",
      value: 1.0,
    },
    u_amplitude: {
      type: "f",
      value: 2.0,
    },
    u_data_arr: {
      type: "float[64]",
      value: dataArray,
    },
    // u_black: { type: "vec3", value: new THREE.Color(0x000000) },
    // u_white: { type: "vec3", value: new THREE.Color(0xffffff) },
  };
  const planeGeometry = new THREE.PlaneGeometry(20, 10, 130, 130);
  const planeCustomMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader(),
    fragmentShader: fragmentShader(),
    wireframe: true,
  });
  const planeMesh = new THREE.Mesh(planeGeometry, planeCustomMaterial);
  planeMesh.rotation.x = -Math.PI / 2 + Math.PI / 4;

  planeMesh.geometry.dynamic = true;
  planeMesh.geometry.verticesNeedUpdate = true;
  scene.add(planeMesh);
  return;
});

const gui = new GUI();
const planeFolder = gui.addFolder("Scaling paramters");
planeFolder.add(plane.scale, "z", 0, 100).name("Terrain intensity");
planeFolder.add(plane.material, "wireframe");
planeFolder
  .addColor(materialParams, "planeMeshColor")
  .onChange((value) => plane.material.color.set(value));
planeFolder.open();
const planeFolder2 = gui.addFolder("Scaling paramters plane2");
planeFolder2
  .add(plane2.scale, "z", 0, 100)
  .name("Terrain intensity for plane2");
planeFolder2
  .addColor(materialParams, "planeMeshColor")
  .onChange((value) => plane2.material.color.set(value));
planeFolder2.open();

const spotlightc = gui
  .addColor(lightParams, "spotlightColor")
  .onChange((value) => spotlight.color.set(value));
const spotlightc2 = gui
  .addColor(lightParams, "spotlightColor2")
  .onChange((value) => spotlight2.color.set(value));

// Left Spotlight aiming to the right

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.01,
  20
);
camera.position.x = 0;
camera.position.y = 0.06;
camera.position.z = 1.1;

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const effectComposer = new EffectComposer(renderer);
effectComposer.setSize(sizes.width, sizes.height);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms["amount"].value = 0.0015;

effectComposer.addPass(rgbShiftPass);

const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
effectComposer.addPass(gammaCorrectionPass);
// Event listener to handle screen resize
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  effectComposer.setSize(sizes.width, sizes.height);
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const clock = new THREE.Clock();

// Animate
const tick = (time) => {
  const elapsedTime = clock.getElapsedTime();
  // Update controls
  controls.update();
  plane.position.z = (elapsedTime * 0.15) % 2;
  plane2.position.z = ((elapsedTime * 0.15) % 2) - 2;

  if (analyser) {
    uniforms.u_time.value = time;
    uniforms.u_data_arr.value = dataArray;
    analyser.getByteFrequencyData(dataArray);
  }

  renderer.render(scene, camera);
  // window.requestAnimationFrame(tick);
};

// tick();
renderer.setAnimationLoop(tick);
