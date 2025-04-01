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
debugPanel.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: #00ff00;
    padding: 10px;
    font-family: monospace;
    font-size: 12px;
    max-width: 300px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
`;
document.body.appendChild(debugPanel);

// Debug logging function
function debugLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    
    const logElement = document.createElement('div');
    logElement.textContent = logMessage;
    debugPanel.appendChild(logElement);
    debugPanel.scrollTop = debugPanel.scrollHeight;
}

// Update loading progress
function updateLoadingProgress(progress) {
    loadingProgress.style.width = `${progress}%`;
    debugLog(`Loading progress: ${progress}%`);
}

// Initialize game
async function initGame() {
    try {
        debugLog('Creating game instance...');
        updateLoadingProgress(20);
        
        const game = new Game();
        updateLoadingProgress(40);
        
        // Wait for game initialization to complete
        await game.waitForInit();
        updateLoadingProgress(100);
        
        // Remove loading screen with fade out
        loadingScreen.style.transition = 'opacity 0.5s ease';
        loadingScreen.style.opacity = '0';
        
        // Wait for fade out animation to complete before removing
        await new Promise(resolve => setTimeout(resolve, 500));
        loadingScreen.style.display = 'none';
        
        debugLog('Game initialized successfully!');

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
        debugLog(`Stack: ${error.stack}`);
        
        // Update loading screen with error
        const loadingText = loadingScreen.querySelector('.loading-text');
        loadingText.textContent = 'Error loading game';
        loadingText.style.color = '#ff0000';
        loadingProgress.style.background = '#ff0000';
        loadingProgress.style.width = '100%';
        
        // Add retry button
        const retryButton = document.createElement('button');
        retryButton.textContent = 'Retry';
        retryButton.style.cssText = `
            margin-top: 20px;
            padding: 10px 20px;
            font-size: 16px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        `;
        retryButton.onclick = () => window.location.reload();
        loadingScreen.appendChild(retryButton);
    }
}

// Start initialization
initGame(); 