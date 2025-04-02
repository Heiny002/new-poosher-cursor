import * as THREE from 'three';

/**
 * Beetle - Represents the player-controlled beetle character
 * Uses direct position updates for movement
 */
export class Beetle {
    constructor(scene, physicsWorld) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.model = null;
        
        // Position and rotation
        this.position = new THREE.Vector3(0, 0.1, 0); // Slightly above ground
        this.rotation = new THREE.Euler(0, 0, 0);
        
        // Movement properties
        this.stats = {
            speed: 5,
            rotationSpeed: 5,
            height: 0.1 // Height above ground
        };
        
        // Movement state
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.movementDirection = new THREE.Vector3(0, 0, 0);
    }

    async init() {
        try {
            console.log('Initializing beetle...');
            
            // Create visual beetle model
            const geometry = new THREE.BoxGeometry(0.5, 0.2, 0.8);
            const material = new THREE.MeshStandardMaterial({ 
                color: 0x2c1810,
                roughness: 0.8,
                metalness: 0.2
            });
            
            this.model = new THREE.Mesh(geometry, material);
            this.model.position.copy(this.position);
            this.model.castShadow = true;
            this.model.receiveShadow = true;
            
            // Add to scene
            this.scene.add(this.model);
            
            console.log('Beetle initialized successfully');
        } catch (error) {
            console.error('Error initializing beetle:', error);
            throw error;
        }
    }

    update(deltaTime) {
        // Update position based on velocity
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // Keep beetle at constant height
        this.position.y = this.stats.height;
        
        // Update model position
        this.model.position.copy(this.position);
        
        // Update rotation
        this.model.rotation.copy(this.rotation);
    }

    setMovement(direction, speed) {
        // Update movement direction
        this.movementDirection.copy(direction).normalize();
        
        // Calculate velocity
        this.velocity.copy(this.movementDirection).multiplyScalar(speed);
        
        // Update rotation to face movement direction
        if (this.movementDirection.length() > 0.01) {
            this.rotation.y = Math.atan2(
                this.movementDirection.x,
                this.movementDirection.z
            );
        }
    }

    dispose() {
        console.log('Disposing beetle...');
        
        // Remove model from scene
        if (this.model) {
            this.scene.remove(this.model);
        }
        
        console.log('Beetle disposed successfully');
    }
} 