# Dung Beetle Game - Project Overview

## Game Concept
A 3D web-based game where players control a dung beetle pushing a ball of dung across procedurally generated terrain. The gameplay focuses on growing the ball while navigating obstacles and upgrading the beetle's abilities.

## Core Mechanics
- **Dung Ball Physics**: Realistic rolling with momentum and inertia
- **Growth System**: Ball grows when collecting resources
- **Obstacle Interaction**: Ball can be damaged or destroyed by obstacles
- **Beetle Control**: WASD/Arrow keys for movement, orbiting around the ball
- **Upgradable Beetle**: Trade ball size for better beetle stats
- **Expanding World**: Map widens as player progresses north
- **Ecosystem Transitions**: Environment changes from grassland to forest, desert, and snowy regions

## Technical Stack
- **Three.js**: Main 3D rendering library
- **Ammo.js/Cannon.js**: Physics engine
- **JavaScript**: Core programming language
- **HTML5/CSS3**: UI elements

## Project Structure
The project is organized into several key components:

1. **Core Game Engine**: Game loop, scene management, initialization
2. **Physics System**: Ball rolling, collision detection, terrain interaction
3. **Terrain Generator**: Procedural generation, ecosystem transitions, obstacle placement
4. **Character Controllers**: Beetle movement, ball interaction, camera system
5. **UI Manager**: Stats display, achievement notifications, beetle cam
6. **Audio System**: Background music, sound effects
7. **Resource Management**: Asset loading, optimization

## Development Approach
The game will be developed in phases, starting with core mechanics and adding features incrementally. Test each phase thoroughly before moving to the next.

## Files In This Documentation Set
- `project-overview.md`: This file
- `core-architecture.md`: Overall architecture and system design
- `physics-implementation.md`: Details on physics system implementation
- `terrain-generation.md`: Procedural terrain generation guide
- `beetle-ball-mechanics.md`: Character control and ball interaction
- `ecosystem-design.md`: Details on different environments and transitions
- `ui-and-feedback.md`: User interface and feedback systems
- `optimization-guide.md`: Performance optimization strategies

## Getting Started
Begin by setting up a basic Three.js scene with a physics engine integration. Focus on implementing the core beetle-ball interaction mechanics before expanding to more complex systems.
