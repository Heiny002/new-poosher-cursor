import * as THREE from 'three';

/**
 * DungBall - Represents the ball of dung that the beetle pushes
 */
export class DungBall {
    constructor(scene, physicsWorld) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        
        // Ball properties
        this.radius = 0.5;
        this.growthRate = 0.005; // Slower growth rate
        this.maxRadius = 3;
        this.currentRadius = this.radius;
        this.massScale = 2; // Mass increases with size
        
        // Create visual representation
        const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x4A2F1C,
            metalness: 0.1,
            roughness: 0.9,
            flatShading: true
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        scene.add(this.mesh);

        // Initialize physics body
        this.initPhysics();
    }

    /**
     * Initialize the physics body for the dung ball
     */
    initPhysics() {
        if (!this.physicsWorld.Ammo) return;

        const Ammo = this.physicsWorld.Ammo;
        
        // Create collision shape
        const shape = new Ammo.btSphereShape(this.radius);
        
        // Create motion state
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(0, this.radius, 0));
        
        const motionState = new Ammo.btDefaultMotionState(transform);
        
        // Create rigid body
        const mass = this.massScale;
        const localInertia = new Ammo.btVector3(0, 0, 0);
        shape.calculateLocalInertia(mass, localInertia);
        
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
        this.body = new Ammo.btRigidBody(rbInfo);
        
        // Set physics properties
        this.body.setFriction(0.7); // Higher friction for better rolling
        this.body.setRestitution(0.3);
        this.body.setDamping(0.5, 0.5); // Less damping for better rolling
        this.body.setAngularFactor(new Ammo.btVector3(1, 1, 1)); // Allow all rotations
        
        // Add to physics world
        this.physicsWorld.addRigidBody(this.body);
        
        // Clean up
        Ammo.destroy(rbInfo);
    }

    /**
     * Update the ball's state
     */
    update() {
        if (!this.body) return;

        // Gradually grow the ball
        if (this.currentRadius < this.maxRadius) {
            this.currentRadius += this.growthRate;
            this.mesh.scale.set(
                this.currentRadius / this.radius,
                this.currentRadius / this.radius,
                this.currentRadius / this.radius
            );
            
            // Update physics shape size and mass
            const shape = this.body.getCollisionShape();
            shape.setRadius(this.currentRadius);
            
            // Update mass based on volume (r³)
            const mass = this.massScale * Math.pow(this.currentRadius / this.radius, 3);
            this.body.setMassProps(mass, new this.physicsWorld.Ammo.btVector3(0, 0, 0));
        }

        // Update visual position from physics
        const transform = this.body.getWorldTransform();
        const pos = transform.getOrigin();
        this.mesh.position.set(pos.x(), pos.y(), pos.z());
    }

    /**
     * Apply damage to the ball (reduces its size)
     * @param {number} amount - Amount of damage to apply
     */
    damage(amount) {
        this.currentRadius = Math.max(
            this.radius,
            this.currentRadius - amount
        );
        this.mesh.scale.set(
            this.currentRadius / this.radius,
            this.currentRadius / this.radius,
            this.currentRadius / this.radius
        );
        
        // Update physics shape size and mass
        if (this.body) {
            const shape = this.body.getCollisionShape();
            shape.setRadius(this.currentRadius);
            
            // Update mass based on volume (r³)
            const mass = this.massScale * Math.pow(this.currentRadius / this.radius, 3);
            this.body.setMassProps(mass, new this.physicsWorld.Ammo.btVector3(0, 0, 0));
        }
    }

    /**
     * Get the current size of the ball
     * @returns {number} The current radius of the ball
     */
    getSize() {
        return this.currentRadius;
    }

    /**
     * Clean up resources
     */
    dispose() {
        if (this.body) {
            this.physicsWorld.removeRigidBody(this.body);
            this.physicsWorld.Ammo.destroy(this.body);
        }
        this.scene.remove(this.mesh);
    }
} 