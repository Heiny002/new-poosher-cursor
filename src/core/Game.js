import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Beetle } from '../entities/Beetle';
import { Ground } from '../entities/Ground';
import { DungBall } from '../entities/DungBall';
import { TerrainManager } from '../terrain/TerrainManager';
import { PhysicsWorld } from '../physics/PhysicsWorld';

/**
 * Game - Main game class that manages the game loop and core systems
 */
export class Game {
    constructor() {
        // Create initialization promise
        this.initPromise = this.init();
    }

    /**
     * Wait for game initialization to complete
     * @returns {Promise} Promise that resolves when initialization is complete
     */
    waitForInit() {
        return this.initPromise;
    }

    /**
     * Initialize the game asynchronously
     */
    async init() {
        try {
            console.log('Initializing Game...');
            
            // Create Three.js scene
            console.log('Creating Three.js scene...');
            this.scene = new THREE.Scene();
            
            // Add ambient light
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            this.scene.add(ambientLight);
            
            // Add directional light
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(5, 5, 5);
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 1024;
            directionalLight.shadow.mapSize.height = 1024;
            directionalLight.shadow.camera.near = 0.5;
            directionalLight.shadow.camera.far = 50;
            directionalLight.shadow.camera.left = -10;
            directionalLight.shadow.camera.right = 10;
            directionalLight.shadow.camera.top = 10;
            directionalLight.shadow.camera.bottom = -10;
            this.scene.add(directionalLight);
            
            // Set up renderer
            console.log('Setting up renderer...');
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            document.body.appendChild(this.renderer.domElement);
            
            // Initialize physics world
            console.log('Initializing physics world...');
            this.physicsWorld = new PhysicsWorld();
            
            // Wait for physics to initialize
            await new Promise((resolve, reject) => {
                let attempts = 0;
                const maxAttempts = 50; // 5 seconds maximum wait time
                
                const checkPhysics = () => {
                    if (this.physicsWorld.initialized) {
                        resolve();
                    } else if (attempts >= maxAttempts) {
                        reject(new Error('Physics initialization timeout'));
                    } else {
                        attempts++;
                        setTimeout(checkPhysics, 100);
                    }
                };
                checkPhysics();
            });
            
            // Set up camera
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.camera.position.set(0, 5, 10);
            this.camera.lookAt(0, 0, 0);
            
            // Set up controls
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            
            // Create ground
            this.ground = new Ground(this.scene, this.physicsWorld);
            
            // Create beetle
            this.beetle = new Beetle(this.scene, this.physicsWorld);
            
            // Set up event listeners
            window.addEventListener('resize', this.onWindowResize.bind(this));
            window.addEventListener('keydown', this.handleKeyDown.bind(this));
            window.addEventListener('keyup', this.handleKeyUp.bind(this));
            
            // Start game loop
            this.animate();
            
            console.log('Game initialization complete!');
        } catch (error) {
            console.error('Error during game initialization:', error);
            throw error;
        }
    }

    /**
     * Handle window resize events
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Handle key down events
     * @param {KeyboardEvent} event - The key down event
     */
    handleKeyDown(event) {
        if (!this.beetle) return;
        
        const direction = new THREE.Vector3();
        
        switch(event.code) {
            case 'KeyW':
                direction.z -= 1;
                break;
            case 'KeyS':
                direction.z += 1;
                break;
            case 'KeyA':
                direction.x -= 1;
                break;
            case 'KeyD':
                direction.x += 1;
                break;
        }
        
        if (direction.length() > 0) {
            this.beetle.move(direction);
            this.beetle.rotateTo(direction);
        }
    }

    /**
     * Handle key up events
     * @param {KeyboardEvent} event - The key up event
     */
    handleKeyUp(event) {
        if (!this.beetle) return;
        
        switch(event.code) {
            case 'KeyW':
            case 'KeyS':
            case 'KeyA':
            case 'KeyD':
                this.beetle.stop();
                break;
        }
    }

    /**
     * Game loop
     */
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Update physics
        this.physicsWorld.update();
        
        // Update beetle
        if (this.beetle) {
            this.beetle.update();
        }
        
        // Update controls
        this.controls.update();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Clean up resources
     */
    dispose() {
        window.removeEventListener('resize', this.onWindowResize);
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        
        if (this.beetle) {
            this.beetle.dispose();
        }
        
        if (this.ground) {
            this.ground.dispose();
        }
        
        if (this.physicsWorld) {
            this.physicsWorld.dispose();
        }
        
        this.renderer.dispose();
    }
} 