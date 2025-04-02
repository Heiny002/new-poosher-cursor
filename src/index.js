import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Game } from './core/Game';
import { PhysicsWorld } from './physics/PhysicsWorld';

// Get UI elements
const loadingScreen = document.getElementById('loading-screen');
const loadingProgress = document.querySelector('.loading-progress');
const ballSizeDisplay = document.getElementById('ball-size');

// Create debug panel
const debugPanel = document.createElement('div');
debugPanel.style.position = 'fixed';
debugPanel.style.top = '10px';
debugPanel.style.left = '10px';
debugPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
debugPanel.style.color = 'white';
debugPanel.style.padding = '10px';
debugPanel.style.fontFamily = 'monospace';
debugPanel.style.maxHeight = '200px';
debugPanel.style.overflow = 'auto';
debugPanel.style.zIndex = '1000';
document.body.appendChild(debugPanel);

// Function to log messages with timestamp
function debugLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    
    const logElement = document.createElement('div');
    logElement.textContent = logMessage;
    debugPanel.appendChild(logElement);
    debugPanel.scrollTop = debugPanel.scrollHeight;
}

// Function to update loading progress
function updateLoadingProgress(progress) {
    loadingProgress.style.width = `${progress}%`;
    debugLog(`Loading progress: ${progress}%`);
}

// Initialize the game
async function initGame() {
    try {
        debugLog('Creating game instance...');
        updateLoadingProgress(20);

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x87CEEB); // Sky blue background
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(renderer.domElement);

        updateLoadingProgress(40);

        // Create camera
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 10, 20);
        camera.lookAt(0, 0, 0);

        // Create controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 5;
        controls.maxDistance = 50;

        updateLoadingProgress(60);

        // Create game instance
        const game = new Game(renderer, camera, controls);
        
        // Initialize game
        debugLog('Initializing game...');
        await game.init();
        
        updateLoadingProgress(100);
        debugLog('Game initialized successfully!');

        // Store game instance globally for resize handler
        window.game = game;

        // Remove loading screen with fade out
        if (loadingScreen) {
            loadingScreen.style.transition = 'opacity 0.5s ease';
            loadingScreen.style.opacity = '0';
            
            // Wait for fade out animation to complete before removing
            await new Promise(resolve => setTimeout(resolve, 500));
            loadingScreen.style.display = 'none';
        }

        // Update UI with ball size
        game.onBallSizeChange = (size) => {
            if (ballSizeDisplay) {
                ballSizeDisplay.textContent = size.toFixed(1);
            }
            debugLog(`Ball size updated: ${size.toFixed(1)}`);
        };
    } catch (error) {
        console.error('Failed to initialize game:', error);
        debugLog(`Error: ${error.message}`);
        
        // Create retry button
        const retryButton = document.createElement('button');
        retryButton.textContent = 'Retry';
        retryButton.style.position = 'fixed';
        retryButton.style.top = '50%';
        retryButton.style.left = '50%';
        retryButton.style.transform = 'translate(-50%, -50%)';
        retryButton.style.padding = '10px 20px';
        retryButton.style.fontSize = '16px';
        retryButton.style.cursor = 'pointer';
        retryButton.onclick = () => {
            document.body.removeChild(retryButton);
            initGame();
        };
        document.body.appendChild(retryButton);
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    if (window.game) {
        window.game.onWindowResize();
    }
});

// Start the game
initGame(); 