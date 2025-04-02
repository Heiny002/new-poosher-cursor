import * as Ammo from 'ammojs-typed';
import * as THREE from 'three';

/**
 * PhysicsWorld - Manages the physics simulation using Ammo.js
 */
export class PhysicsWorld {
    constructor() {
        this.Ammo = null;
        this.world = null;
        this.rigidBodies = [];
        this.initialized = false;
        this.initPromise = null;
        this.isInitializing = false;
        this.debugMode = true;
        
        // Don't initialize in constructor
    }

    /**
     * Wait for physics world initialization to complete
     * @returns {Promise} Promise that resolves when initialization is complete
     */
    waitForInit() {
        if (this.initialized) {
            return Promise.resolve();
        }
        
        if (!this.initPromise) {
            this.initPromise = new Promise((resolve, reject) => {
                const checkInit = () => {
                    if (this.initialized) {
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
     * Initialize the physics world
     */
    async init() {
        if (this.isInitializing) return;
        this.isInitializing = true;

        try {
            if (this.initialized) {
                console.warn('Physics world already initialized');
                return;
            }

            console.log('Starting Ammo.js initialization...');
            // Initialize Ammo.js using the default export
            this.Ammo = await Ammo.default();
            console.log('Ammo.js initialized successfully');
            
            // Create physics world
            this.initializePhysics();
        } catch (error) {
            console.error('Failed to initialize Ammo.js:', error);
            throw error;
        } finally {
            this.isInitializing = false;
        }
    }

    /**
     * Initialize the physics world
     */
    initializePhysics() {
        try {
            console.log('Creating physics world...');
            
            // Create collision configuration
            const collisionConfiguration = new this.Ammo.btDefaultCollisionConfiguration();
            
            // Create dispatcher
            const dispatcher = new this.Ammo.btCollisionDispatcher(collisionConfiguration);
            
            // Create broadphase
            const broadphase = new this.Ammo.btDbvtBroadphase();
            
            // Create solver
            const solver = new this.Ammo.btSequentialImpulseConstraintSolver();
            
            // Create world
            this.world = new this.Ammo.btDiscreteDynamicsWorld(
                dispatcher,
                broadphase,
                solver,
                collisionConfiguration
            );
            
            // Set up gravity
            console.log('Setting up gravity...');
            this.world.setGravity(new this.Ammo.btVector3(0, -9.81, 0));
            
            // Mark as initialized
            this.initialized = true;
            console.log('Physics world initialization complete');
        } catch (error) {
            console.error('Failed to initialize physics world:', error);
            throw error;
        }
    }

    /**
     * Update physics simulation
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        if (!this.initialized) return;
        
        try {
            // Update physics simulation
            this.world.stepSimulation(deltaTime, 10);
            
            // Update rigid bodies
            for (let i = 0; i < this.rigidBodies.length; i++) {
                const objThree = this.rigidBodies[i];
                const objAmmo = objThree.userData.physicsBody;
                
                if (objAmmo) {
                    const ms = objAmmo.getMotionState();
                    if (ms) {
                        ms.getWorldTransform(objThree.userData.tmpTrans);
                        const p = objThree.userData.tmpTrans.getOrigin();
                        const q = objThree.userData.tmpTrans.getRotation();
                        
                        // Update position and rotation
                        objThree.position.set(p.x(), p.y(), p.z());
                        objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
                    }
                }
            }
        } catch (error) {
            console.error('Error updating physics:', error);
        }
    }

    /**
     * Add a rigid body to the physics world
     * @param {THREE.Object3D} object - Three.js object to add
     * @param {Object} options - Physics options
     */
    addRigidBody(object, options = {}) {
        if (!this.initialized) {
            console.error('Physics world not initialized');
            return;
        }
        
        try {
            // Check if the object is a valid Ammo.js rigid body
            if (object && typeof object.getWorldTransform === 'function') {
                console.log('Adding Ammo.js rigid body to physics world');
                this.world.addRigidBody(object);
                
                // Create a temporary Three.js object to track the rigid body
                const tempObject = new THREE.Object3D();
                tempObject.userData.physicsBody = object;
                tempObject.userData.tmpTrans = new this.Ammo.btTransform();
                this.rigidBodies.push(tempObject);
                
                // Debug logging
                console.log('Added rigid body to physics world. Total bodies:', this.rigidBodies.length);
                return;
            }

            // If it's a Three.js object, create a physics body for it
            if (!object || !object.position) {
                console.error('Invalid object passed to addRigidBody:', object);
                return;
            }

            console.log('Adding rigid body for object:', object.uuid);
            const shape = options.shape || new this.Ammo.btBoxShape(
                new this.Ammo.btVector3(1, 1, 1)
            );
            
            const mass = options.mass || 0;
            const friction = options.friction || 0.5;
            const restitution = options.restitution || 0.3;
            
            const transform = new this.Ammo.btTransform();
            transform.setIdentity();
            
            const pos = object.position;
            transform.setOrigin(new this.Ammo.btVector3(pos.x, pos.y, pos.z));
            
            const quat = object.quaternion;
            transform.setRotation(new this.Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
            
            const motionState = new this.Ammo.btDefaultMotionState(transform);
            const localInertia = new this.Ammo.btVector3(0, 0, 0);
            
            if (mass > 0) {
                shape.calculateLocalInertia(mass, localInertia);
            }
            
            const rbInfo = new this.Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
            const body = new this.Ammo.btRigidBody(rbInfo);
            
            body.setFriction(friction);
            body.setRestitution(restitution);
            
            // Activate the body
            body.activate(true);
            
            this.world.addRigidBody(body);
            
            object.userData.physicsBody = body;
            object.userData.tmpTrans = new this.Ammo.btTransform();
            
            this.rigidBodies.push(object);
            
            this.Ammo.destroy(rbInfo);
            console.log('Successfully added rigid body for object:', object.uuid);
        } catch (error) {
            console.error('Error adding rigid body:', error);
        }
    }

    /**
     * Remove a rigid body from the physics world
     * @param {THREE.Object3D} object - Three.js object to remove
     */
    removeRigidBody(object) {
        if (!this.initialized) return;
        
        try {
            const index = this.rigidBodies.indexOf(object);
            if (index > -1) {
                const body = object.userData.physicsBody;
                if (body) {
                    this.world.removeRigidBody(body);
                    this.Ammo.destroy(body);
                }
                this.rigidBodies.splice(index, 1);
            }
        } catch (error) {
            console.error('Error removing rigid body:', error);
        }
    }

    /**
     * Clean up resources
     */
    dispose() {
        if (!this.initialized) return;
        
        try {
            console.log('Disposing physics world...');
            // Remove all rigid bodies
            for (let i = this.rigidBodies.length - 1; i >= 0; i--) {
                this.removeRigidBody(this.rigidBodies[i]);
            }
            
            // Clean up world
            if (this.world) {
                this.Ammo.destroy(this.world);
                this.world = null;
            }
            
            this.initialized = false;
            console.log('Physics world disposed successfully');
        } catch (error) {
            console.error('Error disposing physics world:', error);
        }
    }
} 