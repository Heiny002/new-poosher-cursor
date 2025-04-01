import * as THREE from 'three';

/**
 * Beetle - Represents the player character that pushes the dung ball
 */
export class Beetle {
    constructor(scene, physicsWorld) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        
        // Create visual representation (temporary geometry)
        const geometry = new THREE.BoxGeometry(1, 0.5, 1);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            metalness: 0.5,
            roughness: 0.7
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        scene.add(this.mesh);

        // Movement properties
        this.speed = 8;
        this.rotationSpeed = 3;
        this.velocity = new THREE.Vector3();
        this.maxVelocity = 10;
        
        // Input state
        this.input = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };

        // Initialize physics body
        this.initPhysics();

        // Bind event listeners
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    /**
     * Initialize the physics body for the beetle
     */
    initPhysics() {
        if (!this.physicsWorld.Ammo) return;

        const Ammo = this.physicsWorld.Ammo;
        
        // Create collision shape
        const shape = new Ammo.btBoxShape(new Ammo.btVector3(0.5, 0.25, 0.5));
        
        // Create motion state
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(0, 0.5, 0));
        
        const motionState = new Ammo.btDefaultMotionState(transform);
        
        // Create rigid body
        const mass = 1;
        const localInertia = new Ammo.btVector3(0, 0, 0);
        shape.calculateLocalInertia(mass, localInertia);
        
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
        this.body = new Ammo.btRigidBody(rbInfo);
        
        // Set physics properties
        this.body.setFriction(0.5);
        this.body.setRestitution(0.2);
        this.body.setDamping(0.8, 0.8);
        this.body.setAngularFactor(new Ammo.btVector3(0, 1, 0));
        
        // Add to physics world
        this.physicsWorld.addRigidBody(this.body);
        
        // Clean up
        Ammo.destroy(rbInfo);
    }

    /**
     * Update the beetle's state
     */
    update() {
        if (!this.body) return;

        // Calculate movement direction
        const direction = new THREE.Vector3();
        
        if (this.input.forward) direction.z -= 1;
        if (this.input.backward) direction.z += 1;
        if (this.input.left) direction.x -= 1;
        if (this.input.right) direction.x += 1;
        
        // Normalize direction and apply speed
        if (direction.length() > 0) {
            direction.normalize();
            this.velocity.x = direction.x * this.speed;
            this.velocity.z = direction.z * this.speed;
        } else {
            this.velocity.x *= 0.95;
            this.velocity.z *= 0.95;
        }

        // Cap velocity
        const currentVelocity = new THREE.Vector3(
            this.body.getLinearVelocity().x(),
            this.body.getLinearVelocity().y(),
            this.body.getLinearVelocity().z()
        );
        
        if (currentVelocity.length() > this.maxVelocity) {
            currentVelocity.normalize().multiplyScalar(this.maxVelocity);
            this.body.setLinearVelocity(new this.physicsWorld.Ammo.btVector3(
                currentVelocity.x,
                currentVelocity.y,
                currentVelocity.z
            ));
        }

        // Apply force to physics body
        const force = new this.physicsWorld.Ammo.btVector3(
            this.velocity.x,
            0,
            this.velocity.z
        );
        this.body.applyCentralForce(force);
        this.physicsWorld.Ammo.destroy(force);

        // Update visual position from physics
        const transform = this.body.getWorldTransform();
        const pos = transform.getOrigin();
        this.mesh.position.set(pos.x(), pos.y(), pos.z());

        // Update rotation to face movement direction
        if (direction.length() > 0) {
            const angle = Math.atan2(direction.x, direction.z);
            this.mesh.rotation.y = angle;
        }
    }

    /**
     * Handle key down events
     * @param {KeyboardEvent} event - The key down event
     */
    handleKeyDown(event) {
        switch(event.code) {
            case 'KeyW':
                this.input.forward = true;
                break;
            case 'KeyS':
                this.input.backward = true;
                break;
            case 'KeyA':
                this.input.left = true;
                break;
            case 'KeyD':
                this.input.right = true;
                break;
        }
    }

    /**
     * Handle key up events
     * @param {KeyboardEvent} event - The key up event
     */
    handleKeyUp(event) {
        switch(event.code) {
            case 'KeyW':
                this.input.forward = false;
                break;
            case 'KeyS':
                this.input.backward = false;
                break;
            case 'KeyA':
                this.input.left = false;
                break;
            case 'KeyD':
                this.input.right = false;
                break;
        }
    }

    /**
     * Clean up resources
     */
    dispose() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        if (this.body) {
            this.physicsWorld.removeRigidBody(this.body);
            this.physicsWorld.Ammo.destroy(this.body);
        }
        this.scene.remove(this.mesh);
    }
} 