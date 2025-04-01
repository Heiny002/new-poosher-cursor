# Dung Beetle Simulator - Development Plan

## Game Overview
A 3D web game built with ThreeJS where players control a dung beetle pushing a ball of dung across various terrains. As the player progresses north, the map expands east and west, revealing new ecosystems and challenges.

## Core Game Mechanics
- Beetle pushes a ball of dung that grows when rolling over collectible bits
- Obstacles can damage or destroy the ball
- Beetle is 90% attached to the ball but can be detached if the ball rolls too fast
- The terrain expands as the player moves north, with the map widening east-west
- Different ecosystems appear as player progresses (grassland, forest, desert, snow)
- Terrain features include hills, cliffs, water bodies, stones, animals, plants
- Objects and animals increase in size as player progresses north
- Beetle can be upgraded by sacrificing ball size

## Implementation Plan

### Phase 1: Basic Prototype
1. **Physics Engine Integration**
   - Integrate Ammo.js or Cannon.js for reliable physics
   - Create custom physics for ball rolling, growth, and destruction
   - Implement terrain collision detection

2. **Basic Movement & Controls**
   - WASD/Arrow keys for movement
   - Forward/Backward controls for acceleration/deceleration
   - Left/Right for orbiting beetle around the ball
   - Camera follows beetle with elastic delay
   - Zoom based on ball size

3. **Core Elements**
   - Simple terrain generation with hills
   - Basic beetle model and ball
   - Implement attachment mechanics between beetle and ball
   - Create camera system with follow behavior

### Phase 2: Core Gameplay
1. **Ball Mechanics**
   - Realistic rolling physics with momentum and inertia
   - Growth mechanism when collecting resources
   - Breaking/damage system when hitting obstacles
   - "Too fast" detection for beetle detachment
   - Generate plant growth from decomposing dung pieces

2. **Terrain System**
   - Procedural terrain generation
   - Triangular shape expanding north
   - Chunk loading/unloading system
   - Height map generation with Perlin noise
   - Basic obstacles and collectibles placement

3. **Game State & UI**
   - Stats display (timer, ball diameter, weight, distances)
   - Beetle cam implementation
   - Achievement notifications
   - Save/load functionality

### Phase 3: World Building
1. **Ecosystem Development**
   - Create different terrain types (grassland, forest, desert, snow)
   - Custom physics for each terrain type (mud, water, sand, snow)
   - Transition zones between ecosystems
   - Unique obstacles and collectibles per ecosystem
   - Place signposts indicating ecosystem changes

2. **Object Generation**
   - Place trees, rocks, bushes based on ecosystem
   - Generate animals with appropriate behaviors
   - Create water bodies (small and large)
   - Add ambient elements (birds, clouds, insects)
   - Scale object sizes based on northern distance

3. **Difficulty Progression**
   - Increase challenge as player moves north
   - Gradually introduce more dangerous obstacles
   - Adjust terrain to be more difficult (more cliffs, ravines)
   - Scale obstacle frequency with distance traveled
   - Add special challenges (weather effects, swarms of flies)

### Phase 4: Polish & Features
1. **Visual Enhancements**
   - Particle effects for impacts, water, etc.
   - Dynamic lighting system
   - More detailed models for beetle and terrain elements
   - Visual feedback for ball damage/growth
   - Weather effects (optional)

2. **Audio System**
   - Background music per ecosystem
   - Sound effects for:
     - Ball rolling on different surfaces
     - Beetle movement
     - Collisions and impacts
     - Growth and achievements
     - Ambient sounds (birds, wind, insects)
   - Sound toggles for music and effects

3. **Beetle Upgrade System**
   - Different beetle types/colors based on upgrades
   - Stats upgrade menu
   - Visual changes when upgrading
   - Trade-off system for sacrificing ball size

4. **Mobile Support**
   - Touch controls
   - Floating, movable joystick
   - Performance optimizations for mobile
   - Responsive UI design

## Technical Considerations

### Performance Optimization
- Use instanced meshes for repeated objects (trees, rocks, etc.)
- Implement LOD (Level of Detail) system for distant objects
- Use occlusion culling to avoid rendering objects not in view
- Implement terrain chunking and progressive loading
- Optimize physics calculations for large worlds

### Physics Challenges
- Custom rolling physics for different terrain types
- Ball deformation on impact (or keep it simple with size changes)
- Beetle-to-ball connection needs to be stable yet breakable
- Handling large size differences between ball and beetle
- Preventing physics glitches at high speeds

### Browser Compatibility
- ThreeJS works on most modern browsers
- Consider polyfills for older browsers
- Test on different devices and browsers
- Handle different screen sizes and aspect ratios

## Next Steps

1. **Create a simple prototype with:**
   - Basic terrain
   - Controllable beetle
   - Rolling ball with physics
   - Camera controls

2. **Test core gameplay mechanics:**
   - Ball growth/shrinkage
   - Beetle-ball interaction
   - Physics of different surfaces

3. **Set up a development environment:**
   - Version control
   - Asset pipeline
   - Testing framework

4. **Prioritize features for incremental development:**
   - Focus on making the core gameplay loop fun first
   - Add features incrementally
   - Test frequently with users for feedback
