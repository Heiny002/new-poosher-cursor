# Dung Beetle Game - Core Architecture

## System Design Overview

This document outlines the core architecture for the dung beetle game, focusing on the main classes and their relationships.

## Main Classes

### Game
The central class that manages the game loop and coordinates all subsystems.

```javascript
class Game {
  constructor() {
    this.scene = null;         // Three.js scene
    this.camera = null;        // Main camera
    this.renderer = null;      // Three.js renderer
    this.physicsWorld = null;  // Physics world
    this.clock = new THREE.Clock();
    this.stats = { /* game stats */ };
    this.paused = false;
  }
  
  init() { /* Initialize game systems */ }
  gameLoop() { /* Main game loop */ }
  update(deltaTime) { /* Update all systems */ }
  render() { /* Render the scene */ }
  pause() { /* Pause game */ }
  resume() { /* Resume game */ }
  save() { /* Save game state */ }
  load() { /* Load game state */ }
}
```

### DungBeetle
Represents the player character.

```javascript
class DungBeetle {
  constructor(scene, physicsWorld) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.position = new THREE.Vector3();
    this.rotation = new THREE.Euler();
    this.body = null;  // Physics body
    this.mesh = null;  // Visual representation
    this.stats = {
      topSpeed: 5,
      acceleration: 2,
      deceleration: 3,
      reverseSpeed: 2,
      strength: 1
    };
    this.attachedBall = null;
  }
  
  update(deltaTime) { /* Update beetle physics and position */ }
  attachToBall(ball) { /* Attach to dung ball */ }
  detachFromBall() { /* Detach from dung ball */ }
  push(direction) { /* Push the ball */ }
  upgrade(stat, amount) { /* Upgrade beetle stats */ }
}
```

### DungBall
Represents the ball of dung that the beetle pushes.

```javascript
class DungBall {
  constructor(scene, physicsWorld) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.position = new THREE.Vector3();
    this.rotation = new THREE.Quaternion();
    this.size = 1.0;  // Diameter in meters
    this.mass = 1.0;  // Mass in kg
    this.body = null; // Physics body
    this.mesh = null; // Visual representation
  }
  
  update(deltaTime) { /* Update ball physics and position */ }
  grow(amount) { /* Increase ball size */ }
  damage(amount) { /* Decrease ball size, spawn fragments */ }
  applyForce(force) { /* Apply force to the ball */ }
  isTooFast() { /* Check if the ball is rolling too fast */ }
}
```

### TerrainGenerator
Handles procedural terrain generation.

```javascript
class TerrainGenerator {
  constructor(scene, physicsWorld) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.sections = new Map();  // Terrain sections
    this.currentEcosystem = "grassland";
    this.params = {
      sectionSize: 100,
      maxHeight: 10,
      /* other generation parameters */
    };
  }
  
  generateSection(x, z) { /* Generate a terrain section */ }
  update(playerPosition) { /* Update terrain based on player position */ }
  setEcosystem(ecosystem) { /* Change current ecosystem */ }
  addObjects(section) { /* Add trees, rocks, animals to section */ }
}
```

### Controls
Handles player input.

```javascript
class Controls {
  constructor(beetle) {
    this.beetle = beetle;
    this.keys = { forward: false, backward: false, left: false, right: false };
    this.isMobile = false;
    this.joystick = null;
  }
  
  init() { /* Set up event listeners */ }
  update() { /* Process inputs and control beetle */ }
  initMobileControls() { /* Set up mobile touch controls */ }
}
```

### UIManager
Manages game UI elements.

```javascript
class UIManager {
  constructor(stats, beetle) {
    this.stats = stats;
    this.beetle = beetle;
    this.elements = {};
  }
  
  init() { /* Create UI elements */ }
  update() { /* Update UI with current game state */ }
  showAchievement(title, description) { /* Display achievement notification */ }
  showEcosystemTransition(ecosystem) { /* Show ecosystem change notification */ }
}
```

### AudioManager
Handles game audio.

```javascript
class AudioManager {
  constructor() {
    this.context = null;
    this.backgroundMusic = null;
    this.soundEffects = {};
    this.musicEnabled = true;
    this.soundEffectsEnabled = true;
  }
  
  init() { /* Initialize audio context and load sounds */ }
  playBackgroundMusic() { /* Play background music */ }
  playSoundEffect(effect) { /* Play a sound effect */ }
  setEcosystemMusic(ecosystem) { /* Change music based on ecosystem */ }
}
```

### PhysicsManager
Bridges between Three.js and the physics engine.

```javascript
class PhysicsManager {
  constructor(scene) {
    this.scene = scene;
    this.physicsWorld = null;
  }
  
  init() { /* Initialize physics engine */ }
  update(deltaTime) { /* Step physics simulation */ }
  createRigidBody(params) { /* Create a physics body */ }
  applyForce(body, force) { /* Apply force to a physics body */ }
  detectCollisions() { /* Handle collision detection and events */ }
}
```

## System Relationships

```
Game
 ├─ DungBeetle
 │   └─ Controls
 ├─ DungBall
 ├─ TerrainGenerator
 ├─ PhysicsManager
 ├─ UIManager
 └─ AudioManager
```

## Game Loop

```javascript
function gameLoop() {
  // Calculate delta time
  const deltaTime = clock.getDelta();
  
  // Process input
  controls.update();
  
  // Update physics
  physicsManager.update(deltaTime);
  
  // Update game objects
  beetle.update(deltaTime);
  dungBall.update(deltaTime);
  
  // Check collisions and interactions
  checkCollisions();
  
  // Update terrain generation
  terrainGenerator.update(beetle.position);
  
  // Update camera
  updateCamera();
  
  // Update UI
  uiManager.update();
  
  // Render scene
  renderer.render(scene, camera);
  
  // Request next frame
  requestAnimationFrame(gameLoop);
}
```

## Event System

Implement a simple event system to handle communication between objects:

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }
  
  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(...args));
    }
  }
}

// Example usage:
const eventSystem = new EventEmitter();
eventSystem.on('ballGrowth', (amount) => {
  uiManager.updateBallSize();
  audioManager.playSoundEffect('growth');
});
```

## Save/Load System

Implement a save/load system using localStorage:

```javascript
function saveGame() {
  const saveData = {
    stats: game.stats,
    beetlePosition: beetle.position,
    beetleStats: beetle.stats,
    ballSize: dungBall.size,
    ballMass: dungBall.mass,
    ecosystem: terrainGenerator.currentEcosystem
  };
  
  localStorage.setItem('dungBeetleGameSave', JSON.stringify(saveData));
}

function loadGame() {
  const saveData = JSON.parse(localStorage.getItem('dungBeetleGameSave'));
  if (saveData) {
    // Restore game state from saveData
    // ...
    return true;
  }
  return false;
}
```

## Implementation Strategy

1. Start with the core Game class and basic Three.js setup
2. Implement basic terrain and physics
3. Add beetle and ball with simple controls
4. Build terrain generation system
5. Implement ball growth and damage mechanics
6. Add UI elements and beetle camera
7. Incorporate sound effects and music
8. Implement ecosystem transitions and object generation
9. Add beetle upgrade system
10. Polish with visual effects and optimizations
