// Core game classes for Dung Beetle Simulator

class Game {
  constructor() {
    // ThreeJS essentials
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    
    // Physics world
    this.physicsWorld = null;
    
    // Game elements
    this.terrain = null;
    this.beetle = null;
    this.dungBall = null;
    
    // Game state
    this.stats = {
      timer: 0,
      ballDiameter: 1,
      ballWeight: 1,
      distanceNorth: 0,
      totalDistance: 0
    };
    
    // Current ecosystem
    this.currentEcosystem = "grassland"; // Starting ecosystem
    
    // Controls
    this.controls = null;
    
    // Audio
    this.audioManager = null;
    
    // UI
    this.uiManager = null;
  }
  
  init() {
    // Initialize ThreeJS
    this.initThreeJS();
    
    // Initialize physics
    this.initPhysics();
    
    // Create terrain
    this.terrain = new TerrainGenerator(this.scene, this.physicsWorld);
    this.terrain.generateInitialTerrain();
    
    // Create beetle and ball
    this.beetle = new DungBeetle(this.scene, this.physicsWorld);
    this.dungBall = new DungBall(this.scene, this.physicsWorld);
    
    // Connect beetle to ball
    this.beetle.attachToBall(this.dungBall);
    
    // Setup controls
    this.controls = new Controls(this.beetle);
    
    // Setup audio
    this.audioManager = new AudioManager();
    
    // Setup UI
    this.uiManager = new UIManager(this.stats, this.beetle);
    
    // Start game loop
    this.gameLoop();
  }
  
  gameLoop() {
    // Update physics
    this.updatePhysics();
    
    // Update game elements
    this.updateGameElements();
    
    // Check for collisions
    this.checkCollisions();
    
    // Update stats
    this.updateStats();
    
    // Update UI
    this.uiManager.update();
    
    // Check for ecosystem transitions
    this.checkEcosystemTransitions();
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
    
    // Request next frame
    requestAnimationFrame(() => this.gameLoop());
  }
  
  updateGameElements() {
    // Update beetle
    this.beetle.update();
    
    // Update ball
    this.dungBall.update();
    
    // Update terrain (generate new sections as needed)
    this.terrain.update(this.beetle.position, this.stats.distanceNorth);
    
    // Update camera
    this.updateCamera();
  }
  
  updateCamera() {
    // Third-person camera following the beetle
    // Dynamic zoom based on ball size
    const ballSize = this.dungBall.size;
    const cameraDistance = 5 + (ballSize * 2);
    const cameraHeight = 3 + (ballSize * 0.5);
    
    // Calculate camera position with smooth follow
    // ...
  }
  
  checkEcosystemTransitions() {
    // Based on distanceNorth, determine if we need to transition ecosystems
    const northDistance = this.stats.distanceNorth;
    
    if (northDistance > 1000 && this.currentEcosystem === "grassland") {
      this.transitionEcosystem("forest");
    } else if (northDistance > 2000 && this.currentEcosystem === "forest") {
      this.transitionEcosystem("desert");
    }
    // Add more transitions as needed
  }
  
  transitionEcosystem(newEcosystem) {
    this.currentEcosystem = newEcosystem;
    this.terrain.setEcosystem(newEcosystem);
    this.audioManager.playTransitionSound();
    this.uiManager.showEcosystemTransition(newEcosystem);
  }
}

class DungBeetle {
  constructor(scene, physicsWorld) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    
    // Beetle properties
    this.position = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Euler(0, 0, 0);
    this.scale = 1;
    
    // Beetle stats (upgradable)
    this.stats = {
      topSpeed: 5,
      acceleration: 2,
      deceleration: 3,
      reverseSpeed: 2,
      strength: 1 // Affects ability to push larger balls
    };
    
    // Physics body
    this.body = null;
    
    // Attached ball reference
    this.attachedBall = null;
    
    // Create 3D model
    this.createModel();
    
    // Create physics body
    this.createPhysicsBody();
  }
  
  createModel() {
    // Initially use simple geometry
    const geometry = new THREE.BoxGeometry(0.5, 0.2, 0.8);
    const material = new THREE.MeshStandardMaterial({ color: 0x000000 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
    
    // Later replace with proper beetle model
    // this.loadModel();
  }
  
  attachToBall(ball) {
    this.attachedBall = ball;
  }
  
  detachFromBall() {
    this.attachedBall = null;
    // Handle detachment animation and physics
  }
  
  upgrade(statToUpgrade, amount) {
    // Upgrade beetle stats based on ball sacrifice or collected resources
    if (this.stats.hasOwnProperty(statToUpgrade)) {
      this.stats[statToUpgrade] += amount;
      
      // Update beetle appearance based on upgrades
      this.updateAppearance();
      
      return true;
    }
    return false;
  }
  
  updateAppearance() {
    // Change beetle color/size based on upgrades
    // Sum of all stats determines overall level
    const totalStats = Object.values(this.stats).reduce((sum, stat) => sum + stat, 0);
    
    // Change color based on level
    if (totalStats > 20) {
      this.mesh.material.color.set(0xFFD700); // Gold
    } else if (totalStats > 15) {
      this.mesh.material.color.set(0xC0C0C0); // Silver
    } else if (totalStats > 10) {
      this.mesh.material.color.set(0x8B4513); // Brown
    }
  }
  
  push(direction) {
    // Apply force to attached ball based on beetle strength and direction
    if (this.attachedBall) {
      // Calculate force based on beetle stats
      const force = direction.multiplyScalar(this.stats.strength);
      this.attachedBall.applyForce(force);
    }
  }
  
  update() {
    // Update position based on physics
    if (this.body) {
      const transform = this.body.getWorldTransform();
      const pos = transform.getOrigin();
      
      this.position.set(pos.x(), pos.y(), pos.z());
      this.mesh.position.copy(this.position);
      
      // Update rotation
      const quat = transform.getRotation();
      this.mesh.quaternion.set(quat.x(), quat.y(), quat.z(), quat.w());
    }
    
    // Update position relative to ball if attached
    if (this.attachedBall) {
      // Position beetle relative to ball based on movement direction
      // ...
    }
  }
}

class DungBall {
  constructor(scene, physicsWorld) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    
    // Ball properties
    this.position = new THREE.Vector3(0, 0.5, 0);
    this.size = 1; // Diameter in meters
    this.mass = 1; // Mass in kg
    
    // Physics body
    this.body = null;
    
    // Visual mesh
    this.mesh = null;
    
    // Create initial ball
    this.createBall();
  }
  
  createBall() {
    // Create visual representation
    const geometry = new THREE.SphereGeometry(this.size / 2, 32, 32);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x5D4037,
      roughness: 0.9,
      metalness: 0.1
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
    
    // Create physics body
    this.createPhysicsBody();
  }
  
  createPhysicsBody() {
    // Create a dynamic rigid body for the ball
    // using Ammo.js or Cannon.js
    // ...
  }
  
  grow(amount) {
    // Increase ball size and mass
    this.size += amount;
    this.mass += amount * 1.5; // Mass increases faster than size
    
    // Update visual size
    this.mesh.scale.set(this.size, this.size, this.size);
    
    // Update physics body
    this.updatePhysicsBody();
    
    // Return new size for game stats
    return this.size;
  }
  
  damage(amount) {
    // Reduce ball size and mass
    this.size -= amount;
    this.mass -= amount * 1.5;
    
    // Ensure ball doesn't go below minimum size
    if (this.size < 0.5) {
      this.size = 0.5;
      this.mass = 0.5;
    }
    
    // Update visual size
    this.mesh.scale.set(this.size, this.size, this.size);
    
    // Update physics body
    this.updatePhysicsBody();
    
    // Create broken pieces
    this.createBrokenPieces(amount);
    
    // Return new size for game stats
    return this.size;
  }
  
  createBrokenPieces(amount) {
    // Create smaller dung pieces that break off
    // These will eventually decompose and spawn plants
    // ...
  }
  
  applyForce(force) {
    // Apply force to the ball's physics body
    // ...
  }
  
  update() {
    // Update position based on physics
    if (this.body) {
      const transform = this.body.getWorldTransform();
      const pos = transform.getOrigin();
      
      this.position.set(pos.x(), pos.y(), pos.z());
      this.mesh.position.copy(this.position);
      
      // Update rotation based on movement
      const quat = transform.getRotation();
      this.mesh.quaternion.set(quat.x(), quat.y(), quat.z(), quat.w());
    }
    
    // Check for ball speed
    // If too fast, detach beetle
    // ...
  }
}

class TerrainGenerator {
  constructor(scene, physicsWorld) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    
    // Terrain sections
    this.sections = new Map(); // key: sectionId, value: TerrainSection
    
    // Current ecosystem
    this.currentEcosystem = "grassland";
    
    // Terrain generation parameters
    this.params = {
      sectionSize: 100, // Size of each terrain section
      triangleShape: true, // Overall triangular shape
      maxHeight: 10, // Maximum terrain height
      waterLevel: 0.3, // Water level (percentage of maxHeight)
      // Parameters for different features
      hills: { frequency: 0.1, amplitude: 5 },
      cliffs: { frequency: 0.01, amplitude: 8 },
      obstacles: { frequency: 0.02 },
      resources: { frequency: 0.05 }
    };
  }
  
  generateInitialTerrain() {
    // Generate starting terrain sections
    // Generate the center section first
    this.generateSection(0, 0);
    
    // Generate surrounding sections
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        if (x !== 0 || z !== 0) {
          this.generateSection(x, z);
        }
      }
    }
  }
  
  generateSection(gridX, gridZ) {
    const sectionId = `${gridX},${gridZ}`;
    
    // Check if section already exists
    if (this.sections.has(sectionId)) {
      return this.sections.get(sectionId);
    }
    
    // Calculate bounds of this section
    const minX = gridX * this.params.sectionSize;
    const maxX = (gridX + 1) * this.params.sectionSize;
    const minZ = gridZ * this.params.sectionSize;
    const maxZ = (gridZ + 1) * this.params.sectionSize;
    
    // Apply triangular shape constraint if needed
    // Narrow the width based on Z coordinate (north distance)
    let adjustedMinX = minX;
    let adjustedMaxX = maxX;
    
    if (this.params.triangleShape) {
      // For sections further south, narrow the width
      if (gridZ < 0) {
        const narrowFactor = Math.abs(gridZ) * 0.2;
        adjustedMinX = minX + (this.params.sectionSize * narrowFactor);
        adjustedMaxX = maxX - (this.params.sectionSize * narrowFactor);
      }
    }
    
    // Create heightmap for this section
    const resolution = 128; // Resolution of the heightmap
    const heightmap = this.generateHeightmap(
      adjustedMinX, adjustedMaxX, 
      minZ, maxZ, 
      resolution, 
      gridZ // Pass north distance for difficulty scaling
    );
    
    // Create terrain mesh from heightmap
    const terrainMesh = this.createTerrainMesh(heightmap, 
      adjustedMinX, adjustedMaxX, 
      minZ, maxZ, 
      resolution
    );
    
    // Add terrain to scene
    this.scene.add(terrainMesh);
    
    // Create terrain physics
    const terrainBody = this.createTerrainPhysics(heightmap, 
      adjustedMinX, adjustedMaxX, 
      minZ, maxZ, 
      resolution
    );
    
    // Add objects to terrain (trees, rocks, animals, etc.)
    const objects = this.addTerrainObjects(
      heightmap, 
      adjustedMinX, adjustedMaxX, 
      minZ, maxZ, 
      gridZ, // North distance for size scaling
      resolution
    );
    
    // Create new section and add to map
    const section = {
      id: sectionId,
      gridX,
      gridZ,
      mesh: terrainMesh,
      body: terrainBody,
      objects: objects
    };
    
    this.sections.set(sectionId, section);
    return section;
  }
  
  generateHeightmap(minX, maxX, minZ, maxZ, resolution, northDistance) {
    // Generate heightmap using Perlin/Simplex noise
    // Higher northDistance means more extreme terrain
    // ...
    
    // Return a 2D array of height values
    const heightmap = [];
    
    // Implement actual heightmap generation algorithm here
    // ...
    
    return heightmap;
  }
  
  createTerrainMesh(heightmap, minX, maxX, minZ, maxZ, resolution) {
    // Create terrain geometry from heightmap
    // ...
    
    // Apply texture based on current ecosystem
    const material = this.getEcosystemMaterial(this.currentEcosystem);
    
    // Create and return mesh
    // ...
  }
  
  getEcosystemMaterial(ecosystem) {
    // Return appropriate material based on ecosystem
    switch(ecosystem) {
      case "grassland":
        return new THREE.MeshStandardMaterial({ color: 0x8BC34A });
      case "forest":
        return new THREE.MeshStandardMaterial({ color: 0x33691E });
      case "desert":
        return new THREE.MeshStandardMaterial({ color: 0xFFF59D });
      case "snow":
        return new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
      default:
        return new THREE.MeshStandardMaterial({ color: 0x8BC34A });
    }
  }
  
  addTerrainObjects(heightmap, minX, maxX, minZ, maxZ, northDistance, resolution) {
    // Add objects to terrain based on ecosystem and heightmap
    const objects = [];
    
    // Scale object size based on northDistance
    const sizeScale = 1 + (northDistance * 0.01);
    
    // Object frequency increases with northDistance (difficulty)
    const obstacleDensity = this.params.obstacles.frequency * (1 + (northDistance * 0.01));
    
    // Add trees, rocks, animals, etc.
    // ...
    
    // Add dung resources
    // ...
    
    // Add water bodies
    // ...
    
    // Add obstacles
    // ...
    
    return objects;
  }
  
  update(playerPosition, northDistance) {
    // Check if we need to generate new sections based on player position
    const gridX = Math.floor(playerPosition.x / this.params.sectionSize);
    const gridZ = Math.floor(playerPosition.z / this.params.sectionSize);
    
    // Generate new sections if needed
    // Sections should be generated in a radius around the player
    // Further north allows for wider east-west expansion
    const viewDistance = 2 + Math.floor(northDistance / 1000);
    
    // Calculate east-west range based on north distance
    // The further north, the wider the map gets
    const eastWestRange = 1 + Math.floor(northDistance / 500);
    
    // Generate sections in view distance
    for (let x = gridX - eastWestRange; x <= gridX + eastWestRange; x++) {
      for (let z = gridZ - 1; z <= gridZ + viewDistance; z++) {
        this.generateSection(x, z);
      }
    }
    
    // Remove sections that are far away
    // ...
  }
  
  setEcosystem(ecosystem) {
    this.currentEcosystem = ecosystem;
    
    // Update parameters based on ecosystem
    switch(ecosystem) {
      case "grassland":
        this.params.hills.frequency = 0.1;
        this.params.cliffs.frequency = 0.01;
        break;
      case "forest":
        this.params.hills.frequency = 0.15;
        this.params.cliffs.frequency = 0.02;
        break;
      case "desert":
        this.params.hills.frequency = 0.05;
        this.params.cliffs.frequency = 0.03;
        break;
      case "snow":
        this.params.hills.frequency = 0.2;
        this.params.cliffs.frequency = 0.04;
        break;
    }
    
    // Update existing section materials
    // ...
  }
}

class Controls {
  constructor(beetle) {
    this.beetle = beetle;
    
    // Keyboard state
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false
    };
    
    // Mobile controls
    this.joystick = null;
    this.isMobile = this.detectMobile();
    
    // Initialize controls
    this.init();
  }
  
  init() {
    // Keyboard controls
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
    
    // Mobile controls if needed
    if (this.isMobile) {
      this.initMobileControls();
    }
  }
  
  detectMobile() {
    // Detect if device is mobile
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  initMobileControls() {
    // Create virtual joystick for mobile
    // ...
  }
  
  onKeyDown(event) {
    // Update key state based on keycode
    switch(event.key) {
      case 'w':
      case 'ArrowUp':
        this.keys.forward = true;
        break;
      case 's':
      case 'ArrowDown':
        this.keys.backward = true;
        break;
      case 'a':
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'd':
      case 'ArrowRight':
        this.keys.right = true;
        break;
    }
  }
  
  onKeyUp(event) {
    // Update key state based on keycode
    switch(event.key) {
      case 'w':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 's':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'a':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'd':
      case 'ArrowRight':
        this.keys.right = false;
        break;
    }
  }
  
  update() {
    // Process inputs and control beetle
    if (this.keys.forward) {
      // Move beetle forward
      this.beetle.push(new THREE.Vector3(0, 0, -1));
    }
    
    if (this.keys.backward) {
      // Move beetle backward
      this.beetle.push(new THREE.Vector3(0, 0, 1));
    }
    
    if (this.keys.left) {
      // Orbit beetle left around ball
      // ...
    }
    
    if (this.keys.right) {
      // Orbit beetle right around ball
      // ...
    }
    
    // Process mobile joystick input if enabled
    if (this.isMobile && this.joystick) {
      // ...
    }
  }
}

class UIManager {
  constructor(stats, beetle) {
    this.stats = stats;
    this.beetle = beetle;
    
    // UI elements
    this.statsDisplay = null;
    this.beetleCam = null;
    
    // Initialize UI
    this.init();
  }
  
  init() {
    // Create stats display
    this.createStatsDisplay();
    
    // Create beetle cam
    this.createBeetleCam();
  }
  
  createStatsDisplay() {
    // Create UI elements for showing game stats
    const statsDiv = document.createElement('div');
    statsDiv.className = 'stats-display';
    document.body.appendChild(statsDiv);
    this.statsDisplay = statsDiv;
  }
  
  createBeetleCam() {
    // Create highlight camera focused on beetle
    // Create small circular view in bottom left
    // ...
  }
  
  update() {
    // Update stats display
    if (this.statsDisplay) {
      this.statsDisplay.innerHTML = `
        Time: ${Math.floor(this.stats.timer)}s<br>
        Ball Diameter: ${this.stats.ballDiameter.toFixed(2)}m<br>
        Ball Weight: ${this.stats.ballWeight.toFixed(2)}kg<br>
        Distance North: ${this.stats.distanceNorth.toFixed(2)}m<br>
        Total Distance: ${this.stats.totalDistance.toFixed(2)}m
      `;
    }
    
    // Update beetle cam
    // ...
  }
  
  showAchievement(title, description) {
    // Display achievement notification
    const achievementDiv = document.createElement('div');
    achievementDiv.className = 'achievement';
    achievementDiv.innerHTML = `
      <h3>${title}</h3>
      <p>${description}</p>
    `;
    
    document.body.appendChild(achievementDiv);
    
    // Remove after a few seconds
    setTimeout(() => {
      document.body.removeChild(achievementDiv);
    }, 5000);
  }
  
  showEcosystemTransition(ecosystem) {
    // Display ecosystem transition notification
    const transitionDiv = document.createElement('div');
    transitionDiv.className = 'ecosystem-transition';
    transitionDiv.textContent = `Entering ${ecosystem}`;
    
    document.body.appendChild(transitionDiv);
    
    // Remove after a few seconds
    setTimeout(() => {
      document.body.removeChild(transitionDiv);
    }, 5000);
  }
}

class AudioManager {
  constructor() {
    // Audio context
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    
    // Audio elements
    this.backgroundMusic = null;
    this.soundEffects = {};
    
    // State
    this.musicEnabled = true;
    this.soundEffectsEnabled = true;
    
    // Initialize audio
    this.init();
  }
  
  init() {
    // Load background music
    this.loadBackgroundMusic();
    
    // Load sound effects
    this.loadSoundEffects();
  }
  
  loadBackgroundMusic() {
    // Load music based on ecosystem
    // ...
  }
  
  loadSoundEffects() {
    // Load various sound effects
    const effectsToLoad = [
      'beetleMovement',
      'ballRolling',
      'ballGrowth',
      'ballDamage',
      'waterSplash',
      'achievement',
      'ecosystemTransition'
    ];
    
    // Load each effect
    // ...
  }
  
  playBackgroundMusic() {
    if (this.musicEnabled && this.backgroundMusic) {
      this.backgroundMusic.play();
    }
  }
  
  playSoundEffect(effect) {
    if (this.soundEffectsEnabled && this.soundEffects[effect]) {
      this.soundEffects[effect].play();
    }
  }
  
  setEcosystemMusic(ecosystem) {
    // Change background music based on ecosystem
    // ...
  }
  
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    
    if (this.musicEnabled) {
      this.playBackgroundMusic();
    } else if (this.backgroundMusic) {
      this.backgroundMusic.pause();
    }
  }
  
  toggleSoundEffects() {
    this.soundEffectsEnabled = !this.soundEffectsEnabled;
  }
  
  playGrowthMilestone() {
    // Play special sound for growth milestone
    this.playSoundEffect('achievement');
  }
  
  playTransitionSound() {
    // Play ecosystem transition sound
    this.playSoundEffect('ecosystemTransition');
  }
}
