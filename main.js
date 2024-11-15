import * as THREE from "three";
import JEASINGS from "jeasings";

// Constants
const AMBIENT_LIGHT_COLOR = "#F8F9FA";
const BACKGROUND_COLOR = "#212529";
const CHARTED_COLOR = "#FFFFFF";
const CURSOR_COLOR = "#FFFFFF";
const DIRECITONAL_LIGHT_COLOR = "#F8F9FA";
const ISLAND_COLOR = "#ADB5BD";
const WATER_COLOR = "#212529";

// Smaller modifier leads to lower delays which makes the animations faster
const DELAY_MODIFIERS = [0, 0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

// Utilities
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Global State
let ISLAND_COUNT = 0;
let DELAY_MODIFIER_INDEX = 5; // Starting modifier of 1
let DELAY_MODIFIER = DELAY_MODIFIERS[DELAY_MODIFIER_INDEX];

document.getElementById("slower").addEventListener("click", () => {
  if (DELAY_MODIFIER_INDEX < DELAY_MODIFIERS.length - 1) {
    DELAY_MODIFIER_INDEX++;
    DELAY_MODIFIER = DELAY_MODIFIERS[DELAY_MODIFIER_INDEX];
  }
});
document.getElementById("faster").addEventListener("click", () => {
  if (DELAY_MODIFIER_INDEX > 0) {
    DELAY_MODIFIER_INDEX--;
    DELAY_MODIFIER = DELAY_MODIFIERS[DELAY_MODIFIER_INDEX];
  }
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  80,
  window.innerWidth / window.innerHeight
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();

scene.add(new THREE.AmbientLight(new THREE.Color(AMBIENT_LIGHT_COLOR)));

const light = new THREE.DirectionalLight(
  new THREE.Color(DIRECITONAL_LIGHT_COLOR),
  2.5
);
light.position.set(0, 0, 1);
light.castShadow = true;
light.shadow.camera.zoom = 4; // tighter shadow map
scene.add(light);

const geometryBackground = new THREE.PlaneGeometry(1000, 1000);
const materialBackground = new THREE.MeshPhongMaterial({
  color: new THREE.Color(BACKGROUND_COLOR),
});
const background = new THREE.Mesh(geometryBackground, materialBackground);
background.receiveShadow = true;
background.position.set(0, 0, -100);
scene.add(background);

const target = new THREE.Vector2();
const cameraViewSize = camera.getViewSize(25, target);
const numberOfColumns = Math.floor(cameraViewSize.x * 0.8);
const numberOfRows = Math.floor(cameraViewSize.y * 0.8);

class Grid {
  constructor(numberOfColumns, numberOfRows) {
    this.numberOfColumns = numberOfColumns;
    this.numberOfRows = numberOfRows;

    this.group = new THREE.Group();
    this.cellData = [];

    for (let y = numberOfRows / 2; y > -numberOfRows / 2; y--) {
      const row = [];
      for (let x = -numberOfColumns / 2; x < numberOfColumns / 2; x++) {
        const cell = new Cell(x, y);
        this.group.add(cell.mesh);
        row.push(cell);
      }
      this.cellData.push(row);
    }
  }

  *cells() {
    for (let row = 0; row < numberOfRows; row++) {
      for (let column = 0; column < numberOfColumns; column++) {
        yield this.cellData[row][column];
      }
    }
  }

  reset() {
    const cellIterator = this.cells();
    let cell = cellIterator.next();
    while (!cell.done) {
      cell.value.initialize();
      cell = cellIterator.next();
    }
  }

  sinkChartedIslands() {
    const cellIterator = this.cells();
    let cell = cellIterator.next();
    while (!cell.done) {
      if (cell.value.charted) {
        cell.value.sink();
      }
      cell = cellIterator.next();
    }
  }
}

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.material = new THREE.MeshLambertMaterial({
      color: new THREE.Color(BACKGROUND_COLOR),
      emissive: new THREE.Color(BACKGROUND_COLOR),
      emissiveIntensity: 0.5,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(x, y, 0);
    this.positionMixer = new THREE.AnimationMixer(this.mesh);
    this.colorMixer = new THREE.AnimationMixer(this.mesh);
  }

  async initialize() {
    this.sunk = Math.round(Math.random()) === 0;
    this.charted = false;

    await delay(Math.random() * 1000 * DELAY_MODIFIER);
    if (this.sunk) {
      this.changeColor(new THREE.Color(WATER_COLOR), 1000 * DELAY_MODIFIER);
    } else {
      this.changeColor(new THREE.Color(ISLAND_COLOR), 1000 * DELAY_MODIFIER);
      this.changeZPosition(0.5, 1000 * DELAY_MODIFIER);
    }
  }

  setColor(color) {
    this.material.color.r = color.r;
    this.material.color.g = color.g;
    this.material.color.b = color.b;
  }

  activateCursor() {
    this.setColor(new THREE.Color(CURSOR_COLOR));
  }

  deactivateCursor() {
    this.setColor(new THREE.Color(WATER_COLOR));
  }

  changeColor(toColor, duration, onCompleteCallback = () => {}) {
    new JEASINGS.JEasing(this.material.color)
      .to(
        {
          r: toColor.r,
          g: toColor.g,
          b: toColor.b,
        },
        duration
      )
      .easing(JEASINGS.Cubic.Out)
      .start()
      .onComplete(onCompleteCallback);
  }

  changeZPosition(changeInZ, duration) {
    new JEASINGS.JEasing(this.mesh.position)
      .to(
        {
          x: this.mesh.position.x,
          y: this.mesh.position.y,
          z: this.mesh.position.z + changeInZ,
        },
        duration
      )
      .easing(JEASINGS.Cubic.Out)
      .start();
  }

  chart() {
    this.charted = true;
    this.setColor(new THREE.Color(CHARTED_COLOR));
  }

  sink() {
    if (!this.sunk) {
      this.sunk = true;
      this.changeColor(new THREE.Color(WATER_COLOR), 1000 * DELAY_MODIFIER);
      this.changeZPosition(-0.5, 2000 * DELAY_MODIFIER);
    }
  }
}

async function numberOfIslands(grid) {
  async function depthFirstSearch(column, row) {
    if (
      row < 0 ||
      column < 0 ||
      row >= grid.numberOfRows ||
      column >= grid.numberOfColumns
    ) {
      // Cell is out of bounds already so return.
      return;
    }
    const cell = grid.cellData[row][column];
    if (cell.sunk || cell.charted) {
      // Cell is already sunk or charted so return.
      return;
    }

    cell.chart();
    await delay(100 * DELAY_MODIFIER);
    await Promise.all([
      depthFirstSearch(column - 1, row),
      depthFirstSearch(column, row - 1),
      depthFirstSearch(column + 1, row),
      depthFirstSearch(column, row + 1),
    ]);
  }

  for (let row = 0; row < grid.numberOfRows; row++) {
    for (let column = 0; column < grid.numberOfColumns; column++) {
      grid.cellData[row][column].activateCursor();
      await delay(100 * DELAY_MODIFIER);
      // grid.cellData[row][column].cursor;
      if (!grid.cellData[row][column].sunk) {
        await depthFirstSearch(column, row);
        await delay(250 * DELAY_MODIFIER);
        grid.sinkChartedIslands();
        ISLAND_COUNT += 1;
        document.getElementById("count").innerHTML = ISLAND_COUNT;
      }
      grid.cellData[row][column].deactivateCursor();
    }
  }

  return ISLAND_COUNT;
}

const grid = new Grid(numberOfColumns, numberOfRows);
scene.add(grid.group);
camera.position.z = 25;

async function restart() {
  grid.reset();
  await delay(2500 * DELAY_MODIFIER);
  await numberOfIslands(grid);
}

while (true) {
  await restart();
}

function animate() {
  JEASINGS.update();
  const delta = clock.getDelta(); // never call this more than once during an animation loop
  const cellIterator = grid.cells();
  let cell = cellIterator.next();
  while (!cell.done) {
    cell.value.colorMixer.update(delta);
    cell.value.positionMixer.update(delta);
    cell = cellIterator.next();
  }
  renderer.render(scene, camera);
}
