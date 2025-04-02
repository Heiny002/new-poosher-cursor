import * as THREE from 'three';

/**
 * Controls - Handles keyboard input for controlling the beetle
 */
export class Controls {
    constructor(beetle) {
        this.beetle = beetle;
        
        // Keyboard state
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };
        
        // Initialize controls
        this.init();
    }

    init() {
        // Add keyboard event listeners
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    onKeyDown(event) {
        // Handle both WASD and arrow keys
        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.forward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.backward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = true;
                break;
        }
    }

    onKeyUp(event) {
        // Handle both WASD and arrow keys
        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.forward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.backward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = false;
                break;
        }
    }

    update() {
        // Calculate movement direction
        const direction = new THREE.Vector3(0, 0, 0);
        
        if (this.keys.forward) {
            direction.z -= 1;
        }
        if (this.keys.backward) {
            direction.z += 1;
        }
        if (this.keys.left) {
            direction.x -= 1;
        }
        if (this.keys.right) {
            direction.x += 1;
        }
        
        // Calculate speed based on any movement input
        let speed = 0;
        if (this.keys.forward || this.keys.backward || this.keys.left || this.keys.right) {
            speed = this.beetle.stats.speed;
        }
        
        // Update beetle movement
        this.beetle.setMovement(direction, speed);
    }

    dispose() {
        // Remove event listeners
        window.removeEventListener('keydown', this.onKeyDown.bind(this));
        window.removeEventListener('keyup', this.onKeyUp.bind(this));
    }
} 