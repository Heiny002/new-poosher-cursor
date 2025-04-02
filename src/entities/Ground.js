import * as THREE from 'three';

/**
 * Ground - Represents the ground plane in the game
 * Handles both visual representation and physics properties
 */
export class Ground {
    constructor(scene, physicsWorld) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.model = null;
        this.physicsBody = null;
    }

    async init() {
        try {
            console.log('Initializing ground...');
            
            // Create visual ground plane
            const geometry = new THREE.PlaneGeometry(100, 100);
            const material = new THREE.MeshStandardMaterial({ 
                color: 0x3a7e3a,  // Green color
                side: THREE.DoubleSide,
                roughness: 0.8,
                metalness: 0.2
            });
            
            this.model = new THREE.Mesh(geometry, material);
            this.model.rotation.x = -Math.PI / 2; // Rotate to be horizontal
            this.model.position.y = 0;
            this.model.receiveShadow = true;
            
            // Add the model to the scene
            this.scene.add(this.model);
            
            // Create physics ground plane
            await this.createPhysicsBody();
            
            console.log('Ground initialized successfully');
        } catch (error) {
            console.error('Error initializing ground:', error);
            throw error;
        }
    }

    async createPhysicsBody() {
        try {
            const Ammo = this.physicsWorld.Ammo;
            if (!Ammo) {
                console.error('Ammo.js not initialized');
                return;
            }

            // Create a static plane shape
            const normal = new Ammo.btVector3(0, 1, 0);
            const constant = 0;
            const shape = new Ammo.btStaticPlaneShape(normal, constant);
            
            // Create the rigid body
            const mass = 0; // Static object
            const localInertia = new Ammo.btVector3(0, 0, 0);
            
            const transform = new Ammo.btTransform();
            transform.setIdentity();
            transform.setOrigin(new Ammo.btVector3(0, 0, 0));
            
            const motionState = new Ammo.btDefaultMotionState(transform);
            const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
            
            this.physicsBody = new Ammo.btRigidBody(rbInfo);
            
            // Set friction and restitution
            this.physicsBody.setFriction(0.8);
            this.physicsBody.setRestitution(0.1);
            
            // Add to physics world
            this.physicsWorld.addRigidBody(this.physicsBody);
            
            // Clean up
            Ammo.destroy(rbInfo);
            console.log('Ground physics body created successfully');
        } catch (error) {
            console.error('Error creating ground physics body:', error);
            throw error;
        }
    }

    dispose() {
        console.log('Disposing ground...');
        
        // Remove physics body
        if (this.physicsBody) {
            this.physicsWorld.removeRigidBody(this.physicsBody);
            this.physicsWorld.Ammo.destroy(this.physicsBody);
        }
        
        // Remove model from scene
        if (this.model) {
            this.scene.remove(this.model);
        }
        
        console.log('Ground disposed successfully');
    }
} 