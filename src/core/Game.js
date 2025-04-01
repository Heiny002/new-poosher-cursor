import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Beetle } from '../entities/Beetle';
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
            this.scene.add(directionalLight);
            
            // Add a ground plane
            const groundGeometry = new THREE.PlaneGeometry(20, 20);
            const groundMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x808080,
                side: THREE.DoubleSide
            });
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.position.y = -2;
            this.scene.add(ground);
            
            // Add some test cubes
            const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
            const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
            
            // Add a few cubes at different positions
            for (let i = 0; i < 5; i++) {
                const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
                cube.position.set(
                    (Math.random() - 0.5) * 10,
                    0.5,
                    (Math.random() - 0.5) * 10
                );
                this.scene.add(cube);
            }
            
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
            
            // Set up event listeners
            window.addEventListener('resize', this.onWindowResize.bind(this));
            
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
     * Game loop
     */
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Update controls
        this.controls.update();
        
        // Update physics
        if (this.physicsWorld) {
            this.physicsWorld.update();
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Clean up game resources
     */
    dispose() {
        if (this.physicsWorld) {
            this.physicsWorld.dispose();
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.onWindowResize.bind(this));
        
        // Dispose of Three.js resources
        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.geometry.dispose();
                object.material.dispose();
            }
        });
        
        this.renderer.dispose();
    }
} 