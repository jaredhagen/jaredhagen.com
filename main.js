import * as THREE from "three";
import * as Animations from "./animations";
import * as Colors from "./colors";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

let ISLAND_COUNT = 0;
let SPEED_MODIFIER = 0.25;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();

scene.add(new THREE.AmbientLight(Colors.AMBIENT_LIGHT_COLOR));

const light = new THREE.DirectionalLight(Colors.DIRECITONAL_LIGHT_COLOR, 2.5);
light.position.set(0, 0, 1);
light.castShadow = true;
light.shadow.camera.zoom = 4; // tighter shadow map
scene.add(light);

const geometryBackground = new THREE.PlaneGeometry(1000, 1000);
const materialBackground = new THREE.MeshPhongMaterial({
  color: Colors.BACKGROUND_COLOR,
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
      color: Colors.BACKGROUND_COLOR,
      emissive: Colors.BACKGROUND_COLOR,
      emissiveIntensity: 0.5,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(x, y, 0);
    this.mixer = new THREE.AnimationMixer(this.mesh);

    this.mixer.addEventListener("finished", (event) => {
      const name = event.action._clip.name;
      if (name.startsWith("toColor:")) {
        const hexString = name.split(":")[1];
        this.setColor(new THREE.Color(hexString));
      }
    });
  }

  initialize() {
    this.sunk = Math.round(Math.random()) === 0;
    this.charted = false;

    setTimeout(() => {
      if (this.sunk) {
        this.changeColor(
          Colors.BACKGROUND_COLOR,
          Colors.WATER_COLOR,
          1 * SPEED_MODIFIER
        );
      } else {
        this.changeColor(
          Colors.BACKGROUND_COLOR,
          Colors.ISLAND_COLOR,
          1 * SPEED_MODIFIER
        );
        this.changeScale(
          new THREE.Vector3(1, 1, 1),
          new THREE.Vector3(1, 1, 2),
          1 * SPEED_MODIFIER
        );
      }
    }, Math.random() * 1000 * SPEED_MODIFIER);
  }

  setColor(color) {
    this.material.color = color;
  }

  activateCursor() {
    this.setColor(Colors.CURSOR_COLOR);
  }

  deactivateCursor() {
    this.setColor(Colors.WATER_COLOR);
  }

  changeColor(fromColor, toColor, duration) {
    const action = this.mixer.clipAction(
      new Animations.ColorTransition(
        `toColor:#${toColor.getHexString()}`,
        fromColor,
        toColor,
        duration
      ).animationClip
    );
    action.clampWhenFinished = true;
    action.setLoop(THREE.LoopOnce);
    action.play();
  }

  changePosition(fromVector, toVector, duration) {
    const action = this.mixer.clipAction(
      new Animations.PositionTransition(
        "position",
        fromVector,
        toVector,
        duration
      ).animationClip
    );
    action.clampWhenFinished = true;
    action.setLoop(THREE.LoopOnce);
    action.play();
  }

  changeScale(fromVector, toVector, duration) {
    const action = this.mixer.clipAction(
      new Animations.ScaleTransition("sinking", fromVector, toVector, duration)
        .animationClip
    );
    action.clampWhenFinished = true;
    action.setLoop(THREE.LoopOnce);
    action.play();
  }

  chart() {
    this.charted = true;
    this.setColor(Colors.CHARTED_COLOR);
  }

  sink() {
    if (!this.sunk) {
      this.sunk = true;
      this.setColor(Colors.WATER_COLOR, 1);
      this.changeScale(
        new THREE.Vector3(1, 1, 2),
        new THREE.Vector3(1, 1, 0),
        2 * SPEED_MODIFIER
      );
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
    await delay(100 * SPEED_MODIFIER);
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
      await delay(100 * SPEED_MODIFIER);
      // grid.cellData[row][column].cursor;
      if (!grid.cellData[row][column].sunk) {
        await depthFirstSearch(column, row);
        await delay(250 * SPEED_MODIFIER);
        grid.sinkChartedIslands();
        ISLAND_COUNT += 1;
        document.getElementById("island-count").innerHTML = ISLAND_COUNT;
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
  await delay(2500 * SPEED_MODIFIER);
  await numberOfIslands(grid);
}

while (true) {
  await restart();
}

function animate() {
  const delta = clock.getDelta(); // never call this more than once during an animation loop
  const cellIterator = grid.cells();
  let cell = cellIterator.next();
  while (!cell.done) {
    cell.value.mixer.update(delta);
    cell = cellIterator.next();
  }
  renderer.render(scene, camera);
}
