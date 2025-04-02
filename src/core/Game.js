import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Ground } from '../entities/Ground';
import { Beetle } from '../entities/Beetle';
import { Controls } from '../controls/Controls';
import { TerrainManager } from '../terrain/TerrainManager';
import { PhysicsWorld } from '../physics/PhysicsWorld';

/**
 * Game - Main game class that manages the game loop and core systems
 */
export class Game {
    constructor(renderer, camera, controls) {
        this.scene = new THREE.Scene();
        this.renderer = renderer;
        this.camera = camera;
        this.controls = controls;
        this.physicsWorld = new PhysicsWorld();
        this.ground = null;
        this.beetle = null;
        this.beetleControls = null;
        this.lastTime = 0;
        this.isInitialized = false;
        this.initPromise = null;
        this.isInitializing = false;
        this.gameLoopStarted = false;  // Add flag to track if game loop has started
        
        // Don't initialize in constructor
    }

    /**
     * Wait for game initialization to complete
     * @returns {Promise} Promise that resolves when initialization is complete
     */
    waitForInit() {
        if (this.isInitialized) {
            return Promise.resolve();
        }
        
        if (!this.initPromise) {
            this.initPromise = new Promise((resolve, reject) => {
                const checkInit = () => {
                    if (this.isInitialized) {
                        resolve();
                    } else {
                        setTimeout(checkInit, 100);
                    }
                };
                checkInit();
            });
        }
        
        return this.initPromise;
    }

    /**
     * Initialize the game asynchronously
     */
    async init() {
        // Prevent multiple simultaneous initializations
        if (this.isInitializing) return;
        this.isInitializing = true;

        try {
            // Clean up existing resources first
            await this.dispose();
            
            console.log('Initializing Game...');
            
            // Initialize physics world first
            await this.physicsWorld.init();
            
            // Add lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            this.scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
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
            
            // Create ground
            try {
                this.ground = new Ground(this.scene, this.physicsWorld);
                await this.ground.init();
            } catch (error) {
                console.error('Failed to create ground:', error);
                throw new Error('Ground creation failed: ' + error.message);
            }

            // Create beetle
            try {
                this.beetle = new Beetle(this.scene, this.physicsWorld);
                await this.beetle.init();
            } catch (error) {
                console.error('Failed to create beetle:', error);
                throw new Error('Beetle creation failed: ' + error.message);
            }

            // Create beetle controls
            this.beetleControls = new Controls(this.beetle);
            
            // Mark as initialized
            this.isInitialized = true;
            console.log('Game initialized successfully');
            
            // Start game loop
            this.animate();
        } catch (error) {
            console.error('Failed to initialize game:', error);
            throw error;
        } finally {
            this.isInitializing = false;
        }
    }

    /**
     * Start the game loop
     */
    animate() {
        if (!this.isInitialized) {
            console.warn('Game not initialized, cannot start animation loop');
            return;
        }

        // Only log once when the game loop starts
        if (!this.gameLoopStarted) {
            console.log('Starting game loop');
            this.gameLoopStarted = true;
        }

        requestAnimationFrame(() => this.animate());

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Update physics
        this.physicsWorld.update(deltaTime);

        // Update beetle
        if (this.beetle) {
            this.beetle.update(deltaTime);
        }

        // Update controls
        if (this.beetleControls) {
            this.beetleControls.update();
        }

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        if (!this.camera || !this.renderer) return;

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Clean up resources
     */
    async dispose() {
        console.log('Disposing game...');
        
        // Stop the game loop
        this.isInitialized = false;
        this.gameLoopStarted = false;  // Reset the game loop flag
        
        // Clean up beetle controls
        if (this.beetleControls) {
            this.beetleControls.dispose();
        }
        
        // Clean up beetle
        if (this.beetle) {
            await this.beetle.dispose();
        }
        
        // Clean up ground
        if (this.ground) {
            await this.ground.dispose();
        }
        
        // Clean up physics world
        if (this.physicsWorld) {
            this.physicsWorld.dispose();
        }
        
        // Clean up renderer
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.onWindowResize);
        
        // Clear scene
        while(this.scene.children.length > 0) { 
            this.scene.remove(this.scene.children[0]); 
        }
        
        console.log('Game disposed successfully');
    }
} 