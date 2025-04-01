import * as THREE from 'three';
import { PhysicsWorld } from '../physics/PhysicsWorld';

/**
 * Beetle - Represents the player character in the game
 * Handles movement, physics interactions, and visual representation
 */
export class Beetle {
    constructor(scene, physicsWorld) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.speed = 5;
        this.turnSpeed = 0.1;
        this.acceleration = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        
        // Create visual model
        this.createModel();
        
        // Create physics body
        this.createPhysicsBody();
        
        // Movement state
        this.isMoving = false;
        this.currentDirection = new THREE.Vector3(0, 0, 1);
    }

    /**
     * Create the beetle's 3D model using basic shapes
     */
    createModel() {
        // Create body (main part)
        const bodyGeometry = new THREE.BoxGeometry(1, 0.5, 1.5);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x2c2c2c });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        
        // Create head
        const headGeometry = new THREE.BoxGeometry(0.5, 0.4, 0.5);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.z = 1;
        
        // Create legs
        this.legs = [];
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        
        // Add 6 legs (3 on each side)
        for (let i = 0; i < 6; i++) {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            const side = i < 3 ? -1 : 1;
            const position = (i % 3) - 1;
            
            leg.position.set(
                side * 0.6,
                -0.3,
                position * 0.5
            );
            leg.rotation.x = Math.PI / 2;
            
            this.legs.push(leg);
            this.body.add(leg);
        }
        
        // Add head to body
        this.body.add(this.head);
        
        // Add body to scene
        this.scene.add(this.body);
    }

    /**
     * Create the beetle's physics body
     */
    createPhysicsBody() {
        const Ammo = this.physicsWorld.Ammo;
        if (!Ammo) {
            console.error('Ammo.js not initialized');
            return;
        }

        // Create a box shape for the beetle's body
        const shape = new Ammo.btBoxShape(
            new Ammo.btVector3(0.5, 0.25, 0.75)
        );
        
        // Create transform
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(0, 0.5, 0));
        
        // Create motion state
        const motionState = new Ammo.btDefaultMotionState(transform);
        
        // Calculate local inertia
        const localInertia = new Ammo.btVector3(0, 0, 0);
        shape.calculateLocalInertia(1, localInertia);
        
        // Create rigid body
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(1, motionState, shape, localInertia);
        this.physicsBody = new Ammo.btRigidBody(rbInfo);
        
        // Set friction and restitution
        this.physicsBody.setFriction(0.5);
        this.physicsBody.setRestitution(0.1);
        
        // Add to physics world
        this.physicsWorld.addRigidBody(this.physicsBody);
        
        // Clean up
        Ammo.destroy(rbInfo);
    }

    /**
     * Update the beetle's position and rotation based on physics
     */
    update() {
        if (!this.physicsBody) return;
        
        const Ammo = this.physicsWorld.Ammo;
        if (!Ammo) return;
        
        // Get transform from physics body
        const transform = this.physicsBody.getWorldTransform();
        const pos = transform.getOrigin();
        
        // Update visual position
        this.body.position.set(pos.x(), pos.y(), pos.z());
        
        // Update visual rotation
        const quat = transform.getRotation();
        this.body.quaternion.set(quat.x(), quat.y(), quat.z(), quat.w());
    }

    /**
     * Move the beetle in a given direction
     * @param {THREE.Vector3} direction - Direction to move in
     */
    move(direction) {
        if (!this.physicsBody) return;
        
        const Ammo = this.physicsWorld.Ammo;
        if (!Ammo) return;
        
        // Normalize direction
        direction.normalize();
        
        // Apply force in direction
        const force = new Ammo.btVector3(
            direction.x * this.speed,
            0,
            direction.z * this.speed
        );
        
        this.physicsBody.applyCentralForce(force);
        Ammo.destroy(force);
        
        // Update movement state
        this.isMoving = true;
        this.currentDirection.copy(direction);
    }

    /**
     * Stop the beetle's movement
     */
    stop() {
        if (!this.physicsBody) return;
        
        const Ammo = this.physicsWorld.Ammo;
        if (!Ammo) return;
        
        // Apply opposite force to current velocity
        const velocity = this.physicsBody.getLinearVelocity();
        const force = new Ammo.btVector3(
            -velocity.x() * 2,
            0,
            -velocity.z() * 2
        );
        
        this.physicsBody.applyCentralForce(force);
        Ammo.destroy(force);
        
        this.isMoving = false;
    }

    /**
     * Rotate the beetle to face a direction
     * @param {THREE.Vector3} targetDirection - Direction to face
     */
    rotateTo(targetDirection) {
        if (!this.physicsBody) return;
        
        const Ammo = this.physicsWorld.Ammo;
        if (!Ammo) return;
        
        // Calculate rotation
        const currentDir = new THREE.Vector3(
            this.currentDirection.x,
            0,
            this.currentDirection.z
        );
        const targetDir = new THREE.Vector3(
            targetDirection.x,
            0,
            targetDirection.z
        );
        
        const angle = currentDir.angleTo(targetDir);
        if (angle > 0.01) {
            // Create rotation quaternion
            const quat = new Ammo.btQuaternion();
            quat.setRotation(
                new Ammo.btVector3(0, 1, 0),
                angle * this.turnSpeed
            );
            
            // Apply rotation to physics body
            const transform = this.physicsBody.getWorldTransform();
            const currentQuat = transform.getRotation();
            currentQuat.mul(quat);
            transform.setRotation(currentQuat);
            
            // Clean up
            Ammo.destroy(quat);
        }
    }

    /**
     * Clean up resources
     */
    dispose() {
        if (this.physicsBody) {
            this.physicsWorld.removeRigidBody(this.physicsBody);
            this.physicsWorld.Ammo.destroy(this.physicsBody);
        }
        
        // Remove from scene
        this.scene.remove(this.body);
    }
} 