import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class CameraManager {
    constructor(renderer) {
        this.renderer = renderer;
        this.camera = null;
        this.controls = null;
        this.target = new THREE.Vector3(0, 0, 0);
        
        this.init();
    }

    init() {
        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(this.target);
        
        // Create controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 20;
        this.controls.maxPolarAngle = Math.PI / 2;
    }

    update(targetPosition) {
        if (!targetPosition) return;
        
        // Update camera position to follow target
        const cameraOffset = new THREE.Vector3(0, 5, 10);
        this.camera.position.copy(targetPosition).add(cameraOffset);
        this.controls.target.copy(targetPosition);
        this.controls.update();
    }

    onWindowResize() {
        if (this.camera) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }
    }

    dispose() {
        if (this.controls) {
            this.controls.dispose();
        }
    }
} 