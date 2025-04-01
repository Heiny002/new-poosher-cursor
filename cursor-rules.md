# Dung Beetle Game - AI Cursor Rules

## Core Development Principles

1. **Start Simple, Refine Later**
   - Begin with basic geometric shapes and simple physics
   - Focus on core gameplay mechanics first
   - Add visual polish after the main systems are working
   - Follow an iterative development approach

2. **Maintainable Code Structure**
   - Use ES6+ class-based architecture
   - Separate concerns into distinct classes
   - Implement proper inheritance and composition
   - Maintain a clear separation between game logic and rendering

## Coding Standards

### File Organization
- Organize code into logical directories:
  ```
  /src
    /core        # Core game engine classes
    /entities    # Game entities (beetle, ball, objects)
    /terrain     # Terrain generation and management
    /physics     # Physics systems and helpers
    /ui          # UI components
    /utils       # Utility functions
    /audio       # Audio management
    /shaders     # Custom shaders (if needed)
  /assets
    /models      # 3D models
    /textures    # Textures
    /audio       # Sound files
  ```

### Naming Conventions
- Use camelCase for variables and functions
- Use PascalCase for classes
- Use UPPER_SNAKE_CASE for constants
- Prefix private methods and properties with underscore (_)
- Use descriptive, intention-revealing names

### Documentation

- Every class must have a docstring explaining its purpose
  ```javascript
  /**
   * DungBall - Represents the ball of dung the beetle pushes
   * Handles growth, damage, and physics interactions
   */
  class DungBall {
    // ...
  }
  ```

- Document all methods with parameters and return values
  ```javascript
  /**
   * Applies damage to the ball and spawns fragments
   * 
   * @param {number} amount - Amount of damage to apply (reduction in size)
   * @param {Vector3} position - World position where damage occurred
   * @return {number} - New size of the ball after damage
   */
  damage(amount, position) {
    // ...
  }
  ```

- Add inline comments for complex logic

### Error Handling

- Implement robust error handling:
  ```javascript
  try {
    // Potentially risky operation
  } catch (error) {
    console.error(`Failed to load texture: ${error.message}`);
    // Use fallback texture
  }
  ```

- Validate inputs to critical functions:
  ```javascript
  function applyForce(force) {
    if (!force || !(force instanceof THREE.Vector3)) {
      console.warn('Invalid force applied to ball');
      return;
    }
    // Apply the force
  }
  ```

- Use defensive programming to handle edge cases:
  ```javascript
  updatePhysics(deltaTime) {
    // Ensure deltaTime is reasonable
    deltaTime = Math.min(deltaTime, 0.1); // Cap to 100ms
    
    // Update physics...
  }
  ```

## ThreeJS Best Practices

1. **Resource Management**
   - Reuse geometries and materials when possible
   - Dispose of unused resources to prevent memory leaks
   - Use asset managers to track and manage resources

2. **Performance Optimizations**
   - Use object pooling for frequently created/destroyed objects
   - Implement LOD (Level of Detail) for complex objects
   - Use instanced meshes for repeated objects (trees, rocks)
   - Only update objects within view distance

3. **Rendering Pipeline**
   - Use appropriate material types based on needs
   - Batch similar materials to reduce draw calls
   - Implement frustum culling for off-screen objects

## Physics Implementation

1. **Physics Body Management**
   - Create a wrapper class for physics bodies to manage Three.js/Ammo.js integration
   - Implement proper disposal of physics objects
   - Use appropriate collision shapes (sphere for ball, convex hull for complex objects)

2. **Collision Detection**
   - Use collision groups and masks to optimize collision detection
   - Implement a callback system for collision events
   - Create a collision matrix to define which objects interact

## Testing Methodology

1. **Component Testing**
   - Test each game system in isolation before integration
   - Create test environments for physics, terrain generation, etc.
   - Validate edge cases for each component

2. **Performance Testing**
   - Monitor frame rate and memory usage
   - Test with varying numbers of objects
   - Identify and optimize bottlenecks

## Development Workflow

1. **Incremental Implementation**
   - Follow this development sequence:
     1. Basic environment setup
     2. Ball and beetle physics
     3. Controls and camera
     4. Simple terrain
     5. Ball growth and damage mechanics
     6. Object placement
     7. UI and feedback
     8. Audio
     9. Polish and optimization

2. **Milestone Requirements**
   - Each milestone must meet these criteria before proceeding:
     - Core functionality works without errors
     - Performance is acceptable
     - Code is well-documented
     - No known bugs

## Debug Tools

1. **Implement Debug Visualization**
   ```javascript
   // Debug mode toggle
   this.debugMode = false;
   
   // Debug visualization
   renderDebug() {
     if (!this.debugMode) return;
     
     // Draw physics bodies
     this.physicsWorld.debugDrawWorld();
     
     // Draw additional debug info
     this.drawTerrainGrid();
     this.drawPerformanceStats();
   }
   ```

2. **Console Logging Standards**
   - Use consistent logging levels:
     - `console.error()` for critical failures
     - `console.warn()` for non-critical issues
     - `console.info()` for important events
     - `console.debug()` for development info
   - Include context in logs:
     ```javascript
     console.debug(`[TerrainGenerator] Created section at (${x}, ${z})`);
     ```

## Game State Management

1. **Use a State Machine for Game Flow**
   ```javascript
   const GameStates = {
     LOADING: 'loading',
     MENU: 'menu',
     PLAYING: 'playing',
     PAUSED: 'paused',
     GAME_OVER: 'gameOver'
   };
   
   class GameStateManager {
     constructor() {
       this.currentState = GameStates.LOADING;
     }
     
     changeState(newState) {
       // Handle state transitions
     }
   }
   ```

2. **Save/Load System**
   - Implement a consistent save data format
   - Include version information for backward compatibility
   - Validate loaded data before using it

## Code Reviews

For each major system, review:
- Correctness: Does it work as intended?
- Performance: Is it efficient?
- Readability: Is it easy to understand?
- Maintainability: Is it well-structured?
- Error handling: Does it handle edge cases?

## Mental Approach Guidelines

1. **Think Like a Dung Beetle**
   - Consider the physical characteristics of a dung beetle
   - Observe how a real beetle would interact with a ball of dung
   - Model the controls to be intuitive but physically plausible

2. **Focus on "Game Feel"**
   - Prioritize responsive controls over absolute physical accuracy
   - Add subtle effects to enhance the experience (camera shake, particle effects)
   - Use proper easing functions for smooth transitions

3. **Balance Challenge and Fun**
   - Start easy and gradually increase difficulty
   - Make obstacles avoidable with skill
   - Ensure the core mechanic of rolling a growing ball remains satisfying

4. **The World is a Character**
   - Treat the environment as an important character in the game
   - Add personality to different ecosystems
   - Create memorable landmarks within the procedural generation

## Implementation Checklist

Before implementing any feature:
- [ ] Is this feature essential for the core gameplay?
- [ ] How does it affect performance?
- [ ] Is it consistent with the game's aesthetic?
- [ ] Can it be implemented efficiently?
- [ ] Does it add meaningful player choice or challenge?

---

Remember: The core of this game is the satisfaction of rolling a ball of dung and watching it grow. Every system should serve this central experience.
