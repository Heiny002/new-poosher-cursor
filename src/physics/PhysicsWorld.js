import * as Ammo from 'ammojs-typed';

/**
 * PhysicsWorld - Manages the physics simulation using Ammo.js
 */
export class PhysicsWorld {
    constructor() {
        console.log('Initializing PhysicsWorld...');
        this.initialized = false;
        
        // Initialize Ammo.js
        this.initAmmo();
    }

    /**
     * Initialize Ammo.js
     */
    async initAmmo() {
        try {
            console.log('Starting Ammo.js initialization...');
            const AmmoInstance = await Ammo.default();
            console.log('Ammo.js initialized successfully');
            this.initializePhysics(AmmoInstance);
        } catch (error) {
            console.error('Failed to initialize Ammo.js:', error);
            throw error;
        }
    }

    /**
     * Initialize the physics world with the given Ammo instance
     * @param {Object} AmmoInstance - The initialized Ammo.js instance
     */
    initializePhysics(AmmoInstance) {
        try {
            this.Ammo = AmmoInstance;
            
            // Create physics world
            console.log('Creating physics world...');
            this.collisionConfiguration = new this.Ammo.btDefaultCollisionConfiguration();
            this.dispatcher = new this.Ammo.btCollisionDispatcher(this.collisionConfiguration);
            this.broadphase = new this.Ammo.btDbvtBroadphase();
            this.solver = new this.Ammo.btSequentialImpulseConstraintSolver();
            
            this.world = new this.Ammo.btDiscreteDynamicsWorld(
                this.dispatcher,
                this.broadphase,
                this.solver,
                this.collisionConfiguration
            );
            
            // Set gravity
            console.log('Setting up gravity...');
            this.world.setGravity(new this.Ammo.btVector3(0, -9.81, 0));
            
            this.initialized = true;
            console.log('Physics world initialization complete');
        } catch (error) {
            console.error('Error creating physics world:', error);
            throw error;
        }
    }

    /**
     * Update the physics simulation
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime = 1/60) {
        if (!this.initialized) {
            return; // Silently return if not initialized
        }
        
        // Step the physics world
        this.world.stepSimulation(deltaTime, 10);
    }

    /**
     * Add a rigid body to the physics world
     * @param {Ammo.btRigidBody} body - The rigid body to add
     */
    addRigidBody(body) {
        if (!this.initialized) {
            return; // Silently return if not initialized
        }
        this.world.addRigidBody(body);
    }

    /**
     * Remove a rigid body from the physics world
     * @param {Ammo.btRigidBody} body - The rigid body to remove
     */
    removeRigidBody(body) {
        if (!this.initialized) {
            return; // Silently return if not initialized
        }
        this.world.removeRigidBody(body);
    }

    /**
     * Clean up physics resources
     */
    dispose() {
        if (!this.initialized) {
            return; // Silently return if not initialized
        }
        
        // Clean up Ammo.js objects
        this.Ammo.destroy(this.world);
        this.Ammo.destroy(this.solver);
        this.Ammo.destroy(this.broadphase);
        this.Ammo.destroy(this.dispatcher);
        this.Ammo.destroy(this.collisionConfiguration);
    }
} 