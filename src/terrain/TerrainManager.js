import * as THREE from 'three';

/**
 * TerrainManager - Handles terrain generation and management
 */
export class TerrainManager {
    constructor(scene, physicsWorld) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        
        // Terrain properties
        this.size = 100;
        this.segments = 100;
        this.heightScale = 5;
        
        // Create terrain
        this.createTerrain();
        
        // Add lighting
        this.setupLighting();
    }

    /**
     * Create the terrain mesh
     */
    createTerrain() {
        // Create geometry
        const geometry = new THREE.PlaneGeometry(
            this.size,
            this.size,
            this.segments,
            this.segments
        );

        // Generate height data
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            
            // Simple height function using multiple sine waves
            const height = this.generateHeight(x, z);
            vertices[i + 1] = height;
        }

        // Update normals
        geometry.computeVertexNormals();

        // Create material
        const material = new THREE.MeshStandardMaterial({
            color: 0x3A7D44, // Green color for grass
            metalness: 0.1,
            roughness: 0.8,
            flatShading: true
        });

        // Create mesh
        this.terrain = new THREE.Mesh(geometry, material);
        this.terrain.rotation.x = -Math.PI / 2; // Rotate to horizontal
        this.terrain.receiveShadow = true;
        this.scene.add(this.terrain);

        // Create physics terrain
        this.createPhysicsTerrain();
    }

    /**
     * Create the physics terrain
     */
    createPhysicsTerrain() {
        if (!this.physicsWorld.Ammo) return;

        const Ammo = this.physicsWorld.Ammo;
        
        // Create a static plane for the ground
        const shape = new Ammo.btStaticPlaneShape(
            new Ammo.btVector3(0, 1, 0),
            0
        );
        
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(0, 0, 0));
        
        const motionState = new Ammo.btDefaultMotionState(transform);
        
        // Create rigid body (mass = 0 for static objects)
        const mass = 0;
        const localInertia = new Ammo.btVector3(0, 0, 0);
        shape.calculateLocalInertia(mass, localInertia);
        
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
        this.terrainBody = new Ammo.btRigidBody(rbInfo);
        
        // Set friction and restitution
        this.terrainBody.setFriction(0.8);
        this.terrainBody.setRestitution(0.1);
        
        // Add to physics world
        this.physicsWorld.addRigidBody(this.terrainBody);
        
        // Clean up
        Ammo.destroy(rbInfo);
    }

    /**
     * Generate height for a given x,z coordinate
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @returns {number} Height value
     */
    generateHeight(x, z) {
        // Combine multiple sine waves for more interesting terrain
        const height = 
            Math.sin(x * 0.1) * 2 +
            Math.sin(z * 0.1) * 2 +
            Math.sin((x + z) * 0.05) * 1.5;
        
        return height * this.heightScale;
    }

    /**
     * Set up scene lighting
     */
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Directional light (sunlight)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }

    /**
     * Get height at a given x,z coordinate
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @returns {number} Height value
     */
    getHeightAt(x, z) {
        return this.generateHeight(x, z);
    }

    /**
     * Clean up resources
     */
    dispose() {
        if (this.terrainBody) {
            this.physicsWorld.removeRigidBody(this.terrainBody);
            this.physicsWorld.Ammo.destroy(this.terrainBody);
        }
        this.scene.remove(this.terrain);
    }
} 