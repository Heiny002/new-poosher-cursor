# Dung Beetle Game - Beetle & Ball Mechanics Guide

This document provides a conceptual overview of the core game mechanics: the beetle controller and dung ball physics, with generalized pseudocode to guide implementation.

## Core Concept

The central mechanic is a dung beetle pushing a ball of dung across terrain. The beetle must stay attached to the ball while navigating obstacles. The ball grows when collecting resources and can be damaged by obstacles. As the ball grows, it becomes harder to control, requiring beetle upgrades.

## Beetle Controller Overview

The beetle is the player-controlled character with these key characteristics:

1. **Movement Control**: WASD/arrow keys for movement
2. **Ball Attachment**: The beetle stays 90% attached to the ball 
3. **Upgradable Stats**: Speed, strength, acceleration, control
4. **Physics Behavior**: Stays grounded, exerts force on the ball

### Beetle Stats

- **Top Speed**: Maximum movement speed
- **Acceleration**: How quickly the beetle reaches top speed
- **Deceleration**: How quickly the beetle can stop
- **Reverse Speed**: Maximum backward movement speed
- **Strength**: Affects ability to push larger balls
- **Control**: Affects turning/orbiting responsiveness

### Beetle Pseudocode

```
Class DungBeetle:
    // Properties
    position, rotation, size
    stats = {topSpeed, acceleration, deceleration, reverseSpeed, strength, control}
    currentSpeed, targetSpeed, movementDirection, orbitAngle
    attachedBall, constraint, body, mesh
    
    // Initialization
    Constructor(scene, physicsWorld):
        Initialize properties
        Create visual model
        Create physics body
    
    // Ball Interaction
    Function AttachToBall(ball):
        Set attachedBall reference
        Create physics constraint between beetle and ball
    
    Function DetachFromBall():
        Remove physics constraint
        Play detachment animation
        Clear ball reference
    
    // Movement
    Function UpdateMovement(controls, deltaTime):
        If controls.forward Then targetSpeed = stats.topSpeed
        Else If controls.backward Then targetSpeed = -stats.reverseSpeed
        Else targetSpeed = 0
        
        // Accelerate/decelerate towards target speed
        Interpolate currentSpeed towards targetSpeed
        
        // Handle turning
        If controls.left Then orbitAngle += deltaTime * stats.control
        If controls.right Then orbitAngle -= deltaTime * stats.control
        
        // Update movement direction based on orbit angle
        Update movementDirection using orbitAngle
        
        // Apply force to ball if attached
        If attachedBall exists Then
            Apply force to ball based on movement direction and strength
    
    // Upgrades
    Function Upgrade(statName, amount):
        If stat exists and ball is large enough Then
            Reduce ball size
            Increase stat
            Update appearance
            Return success
        Else
            Return failure
    
    // Update
    Function Update(deltaTime):
        Update position from physics
        Update mesh position
        Check if ball is moving too fast (detach if needed)
        Keep beetle grounded
```

## Dung Ball Overview

The dung ball is the central game object with these key characteristics:

1. **Physics-Based Movement**: Realistic rolling with momentum and inertia
2. **Growth Mechanics**: Increases in size when rolling over resources
3. **Damage System**: Can be damaged by obstacles, breaking into pieces
4. **Size-Based Physics**: Physics properties change with size
5. **Visual Representation**: Appearance changes with growth

### Ball Properties

- **Size**: Diameter in meters
- **Mass**: Increases exponentially with size
- **Friction**: Different values based on terrain type
- **Restitution**: Bounciness when hitting obstacles

### Ball Pseudocode

```
Class DungBall:
    // Properties
    position, rotation, size, mass
    body, mesh
    
    // Initialization
    Constructor(scene, physicsWorld):
        Initialize properties
        Create visual model with bumpy dung appearance
        Create physics body
    
    // Size Changes
    Function Grow(amount):
        Store current properties
        Increase size by amount
        Recalculate mass based on new volume
        Update visual appearance
        Recreate physics body
        Play growth effect
        Return new size
    
    Function Shrink(amount, impactPoint):
        Store current properties
        Decrease size by amount (minimum 0.5)
        Recalculate mass
        Update visual appearance
        Recreate physics body
        If impact point exists Then create broken pieces
        Return new size
    
    // Broken Pieces
    Function CreateBrokenPieces(amount, impactPoint):
        Calculate number of pieces based on amount
        For each piece:
            Create small dung piece mesh
            Add physics body
            Apply explosion force from impact point
            Schedule decomposition and plant growth
    
    // Terrain Interaction
    Function UpdateTerrainInteraction(terrainType, deltaTime):
        Adjust friction based on terrain type:
            Mud: High friction
            Sand: Medium friction
            Snow: Low friction
            Water: Variable (damage + low friction)
    
    // Speed Check
    Function IsTooFast():
        Calculate current speed from velocity
        Return (speed > speedThreshold)
    
    // Update
    Function Update(deltaTime):
        Update position and rotation from physics
        Update mesh transform
        Check terrain at current position
        Update terrain-specific effects
```

## Beetle-Ball Interaction

The interaction between beetle and ball is a critical part of the gameplay:

```
// Force Application
Function ApplyBeetleForce(beetle, ball, direction, strength):
    Calculate force magnitude based on beetle strength and ball mass
    Apply force to ball in specified direction
    
// Detachment Check
Function CheckDetachment(beetle, ball):
    Get ball velocity
    Calculate speed
    If speed > beetle.topSpeed * 1.5 Then
        Detach beetle from ball
        Apply impulse to beetle
        Play detachment animation and sound
```

## Control Handling

The player's inputs are processed and applied to the beetle:

```
Class Controls:
    // Properties
    keys = {forward, backward, left, right}
    beetle
    
    // Initialization
    Constructor(beetle):
        Set beetle reference
        Add keyboard event listeners
    
    // Input Handling
    Function OnKeyDown(event):
        Update corresponding key state to true
    
    Function OnKeyUp(event):
        Update corresponding key state to false
    
    // Update
    Function Update(deltaTime):
        Call beetle.updateMovement with current key states
```

## Camera System

The camera follows the beetle and ball with dynamic adjustments:

```
Class BeetleCamera:
    // Properties
    camera, target, distance, height, smoothness
    
    // Initialization
    Constructor(camera, beetle, ball):
        Set camera reference
        Set target objects
        Initialize parameters
    
    // Update
    Function Update(deltaTime):
        // Calculate ideal position
        Calculate target position (behind beetle)
        Adjust distance based on ball size
        Adjust height based on ball size
        
        // Smooth movement
        Interpolate camera position towards ideal position
        
        // Look at
        Point camera at ball
```

## Implementation Strategy

1. Start with basic physics for ball rolling
2. Implement simple beetle movement and ball pushing
3. Add ball growth and shrinking mechanics
4. Implement terrain interactions
5. Add beetle-ball attachment/detachment
6. Implement beetle upgrades
7. Add polish (effects, sounds, animations)

Key challenges to focus on:
- Getting the ball physics to feel realistic yet fun
- Making the beetle-ball interaction intuitive
- Balancing difficulty as the ball grows
- Ensuring the upgrade system feels rewarding
