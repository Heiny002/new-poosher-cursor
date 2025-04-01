import * as THREE from 'three';

/**
 * Ground - Represents the ground plane with physics
 */
export class Ground {
    constructor(scene, physicsWorld) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        
        // Create visual and physics ground
        this.createGround();
    }

    /**
     * Create the ground plane with physics
     */
    createGround() {
        const Ammo = this.physicsWorld.Ammo;
        if (!Ammo) {
            console.error('Ammo.js not initialized');
            return;
        }

        // Create visual ground plane
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x808080,
            side: THREE.DoubleSide
        });
        this.mesh = new THREE.Mesh(groundGeometry, groundMaterial);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.y = -2;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);

        // Create physics ground plane
        const groundShape = new Ammo.btStaticPlaneShape(
            new Ammo.btVector3(0, 1, 0),
            -2
        );

        // Create transform
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(0, 0, 0));

        // Create motion state (static)
        const motionState = new Ammo.btDefaultMotionState(transform);

        // Create rigid body (mass = 0 for static objects)
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(0, motionState, groundShape);
        this.physicsBody = new Ammo.btRigidBody(rbInfo);

        // Set friction and restitution
        this.physicsBody.setFriction(0.8);
        this.physicsBody.setRestitution(0.1);

        // Add to physics world
        this.physicsWorld.addRigidBody(this.physicsBody);

        // Clean up
        Ammo.destroy(rbInfo);
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
        this.scene.remove(this.mesh);
    }
} 