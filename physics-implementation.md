# Dung Beetle Game - Physics Implementation Guide

This document provides guidance on implementing the physics system for the dung beetle game using Ammo.js (or alternatively, Cannon.js).

## Physics Engine Integration

### Setting Up Ammo.js

```javascript
// Initialize Ammo.js
Ammo().then(function(Ammo) {
  // Configure physics world
  const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
  const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  const broadphase = new Ammo.btDbvtBroadphase();
  const solver = new Ammo.btSequentialImpulseConstraintSolver();
  
  // Create physics world
  const physicsWorld = new Ammo.btDiscreteDynamicsWorld(
    dispatcher, broadphase, solver, collisionConfiguration
  );
  
  // Set gravity
  physicsWorld.setGravity(new Ammo.btVector3(0, -9.81, 0));
  
  // Initialize game with physics world
  initGame(physicsWorld, Ammo);
});
```

## Ball Physics

The ball is the central physics object and requires special attention.

### Creating the Ball

```javascript
createBallPhysics(position, size, mass) {
  // Create ball shape
  const radius = size / 2;
  const shape = new Ammo.btSphereShape(radius);
  
  // Set up transform
  const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
  
  // Set mass and inertia
  const localInertia = new Ammo.btVector3(0, 0, 0);
  shape.calculateLocalInertia(mass, localInertia);
  
  // Create motion state
  const motionState = new Ammo.btDefaultMotionState(transform);
  
  // Create rigid body info
  const rbInfo = new Ammo.btRigidBodyConstructionInfo(
    mass, motionState, shape, localInertia
  );
  
  // Set restitution (bounciness) and friction
  rbInfo.set_m_restitution(0.4);
  rbInfo.set_m_friction(0.8);
  
  // Create rigid body
  const body = new Ammo.btRigidBody(rbInfo);
  
  // Add to physics world
  this.physicsWorld.addRigidBody(body);
  
  return body;
}
```

### Updating Ball Size

When the ball grows or shrinks, update both visual and physics representations:

```javascript
updateBallSize(newSize) {
  // Update visual mesh
  this.mesh.scale.set(newSize, newSize, newSize);
  
  // Remove old physics body from world
  this.physicsWorld.removeRigidBody(this.body);
  
  // Create new physics body with updated size
  const newMass = this.calculateMass(newSize);
  this.body = this.createBallPhysics(this.position, newSize, newMass);
  
  // Save current velocity and apply to new body
  // ...
}
```

### Rolling Physics

Ensure the ball rolls realistically:

```javascript
// Set angular damping to prevent excessive rotation
body.setAngularDamping(0.1);

// Set friction based on terrain type
updateFriction(terrainType) {
  let friction = 0.8; // Default
  
  switch(terrainType) {
    case 'mud':
      friction = 1.5; // High friction
      break;
    case 'ice':
      friction = 0.2; // Low friction
      break;
    case 'sand':
      friction = 1.2; // Medium-high friction
      break;
    // Other terrain types...
  }
  
  this.body.setFriction(friction);
}
```

## Beetle Physics

The beetle needs to stay grounded and push the ball effectively.

### Beetle Body

```javascript
createBeetlePhysics(position) {
  // Create beetle shape (simplified as box)
  const shape = new Ammo.btBoxShape(
    new Ammo.btVector3(0.25, 0.1, 0.4) // Half-extents
  );
  
  const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
  
  const mass = 0.5; // Beetle mass
  const localInertia = new Ammo.btVector3(0, 0, 0);
  shape.calculateLocalInertia(mass, localInertia);
  
  const motionState = new Ammo.btDefaultMotionState(transform);
  const rbInfo = new Ammo.btRigidBodyConstructionInfo(
    mass, motionState, shape, localInertia
  );
  
  const body = new Ammo.btRigidBody(rbInfo);
  
  // Keep beetle upright
  body.setAngularFactor(new Ammo.btVector3(0, 1, 0));
  
  // Add to physics world
  this.physicsWorld.addRigidBody(body);
  
  return body;
}
```

### Ball-Beetle Connection

Create a constraint to attach the beetle to the ball:

```javascript
attachToBall(ball) {
  this.attachedBall = ball;
  
  // Create a point-to-point constraint (like a ball joint)
  const pivotInBeetle = new Ammo.btVector3(0, 0, 0.4); // Front of beetle
  const pivotInBall = new Ammo.btVector3(0, 0, 0); // Transformed to ball space
  
  // Transform pivot point from beetle local space to world space
  const beetleTransform = this.body.getWorldTransform();
  const worldPivotBeetle = new Ammo.btVector3();
  beetleTransform.getOrigin().op_add(pivotInBeetle, worldPivotBeetle);
  
  // Transform world pivot to ball local space
  const ballTransform = ball.body.getWorldTransform();
  const invBallTrans = new Ammo.btTransform();
  invBallTrans.setIdentity();
  invBallTrans.setOrigin(ballTransform.getOrigin());
  invBallTrans.setRotation(ballTransform.getRotation());
  invBallTrans.invert();
  invBallTrans.op_mul(worldPivotBeetle, pivotInBall);
  
  // Create constraint
  this.constraint = new Ammo.btPoint2PointConstraint(
    this.body, ball.body, pivotInBeetle, pivotInBall
  );
  
  // Add constraint to world
  this.physicsWorld.addConstraint(this.constraint, true);
}
```

### Detaching from Ball

When the ball rolls too fast, detach the beetle:

```javascript
detachFromBall() {
  if (this.constraint) {
    this.physicsWorld.removeConstraint(this.constraint);
    this.constraint = null;
    this.attachedBall = null;
    
    // Apply force to beetle to simulate being thrown
    const throwForce = new Ammo.btVector3(
      Math.random() * 2 - 1, 
      Math.random() * 2 + 1, 
      Math.random() * 2 - 1
    );
    this.body.applyCentralImpulse(throwForce);
  }
}
```

## Terrain Physics

Use a heightfield shape for terrain with proper collision:

```javascript
createTerrainPhysics(heightmap, minX, maxX, minZ, maxZ, resolution) {
  const width = maxX - minX;
  const length = maxZ - minZ;
  const heightScale = this.params.maxHeight;
  
  // Create heightfield shape
  const shape = new Ammo.btHeightfieldTerrainShape(
    resolution, resolution,
    heightmap.buffer,
    heightScale,
    0, heightScale,
    1, false
  );
  
  // Set local scaling
  shape.setLocalScaling(new Ammo.btVector3(width / resolution, 1, length / resolution));
  
  // Create transform
  const transform = new Ammo.btTransform();
  transform.setIdentity();
  
  // Position at center of terrain section
  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;
  transform.setOrigin(new Ammo.btVector3(centerX, 0, centerZ));
  
  // Create rigid body (static)
  const mass = 0;
  const localInertia = new Ammo.btVector3(0, 0, 0);
  const motionState = new Ammo.btDefaultMotionState(transform);
  const rbInfo = new Ammo.btRigidBodyConstructionInfo(
    mass, motionState, shape, localInertia
  );
  
  const body = new Ammo.btRigidBody(rbInfo);
  
  // Add to physics world
  this.physicsWorld.addRigidBody(body);
  
  return body;
}
```

## Collision Detection

Implement a collision detection system to handle interactions:

```javascript
setupCollisionDetection() {
  // Set up collision callback
  const dispatcher = this.physicsWorld.getDispatcher();
  
  this.updateCallback = () => {
    const numManifolds = dispatcher.getNumManifolds();
    
    for (let i = 0; i < numManifolds; i++) {
      const manifold = dispatcher.getManifoldByIndexInternal(i);
      const numContacts = manifold.getNumContacts();
      
      if (numContacts > 0) {
        const body0 = Ammo.castObject(manifold.getBody0(), Ammo.btRigidBody);
        const body1 = Ammo.castObject(manifold.getBody1(), Ammo.btRigidBody);
        
        // Get the objects these bodies belong to
        const obj0 = body0.userData;
        const obj1 = body1.userData;
        
        // Handle different collision types
        if (obj0 instanceof DungBall && obj1.type === 'resource') {
          this.handleResourceCollection(obj0, obj1);
        } 
        else if (obj0 instanceof DungBall && obj1.type === 'obstacle') {
          this.handleObstacleCollision(obj0, obj1);
        }
        // Add other collision checks as needed
      }
    }
  };
}

// In the game loop
physicsUpdate(deltaTime) {
  // Step simulation
  this.physicsWorld.stepSimulation(deltaTime, 10);
  
  // Check collisions
  this.updateCallback();
}
```

## Special Terrain Interactions

Handle interactions with special terrain types:

```javascript
updateTerrainInteractions(ball, terrainType) {
  switch(terrainType) {
    case 'water':
      // Small water - slow down and damage ball slightly
      if (isSmallWater) {
        ball.damage(0.05);
        ball.body.setLinearVelocity(
          ball.body.getLinearVelocity().op_mul(0.8)
        );
      } 
      // Large water - destroy ball
      else {
        ball.damage(ball.size);
      }
      break;
      
    case 'mud':
      // Slow down ball significantly
      ball.body.setLinearVelocity(
        ball.body.getLinearVelocity().op_mul(0.6)
      );
      break;
      
    case 'sand':
      // Moderate slow down
      ball.body.setLinearVelocity(
        ball.body.getLinearVelocity().op_mul(0.85)
      );
      break;
      
    case 'snow':
      // Slight slow down, leave trail
      ball.body.setLinearVelocity(
        ball.body.getLinearVelocity().op_mul(0.95)
      );
      // Create visual snow trail
      // ...
      break;
  }
}
```

## Performance Optimization

Optimize physics for better performance:

```javascript
optimizePhysics() {
  // Only perform detailed physics for objects near the player
  const playerPos = this.beetle.position;
  const activeRadius = 100; // Meters
  
  this.physicsObjects.forEach(obj => {
    const distanceSq = playerPos.distanceToSquared(obj.position);
    
    if (distanceSq > activeRadius * activeRadius) {
      // Disable detailed physics for distant objects
      if (obj.body.isActive()) {
        obj.body.setActivationState(DISABLE_SIMULATION);
      }
    } else {
      // Enable detailed physics for nearby objects
      if (!obj.body.isActive()) {
        obj.body.setActivationState(ACTIVE_TAG);
        obj.body.activate();
      }
    }
  });
}
```

## Ball Pushing Mechanics

Implement the mechanics for the beetle to push the ball:

```javascript
pushBall(direction, strength) {
  // Calculate force based on beetle strength and direction
  const force = new Ammo.btVector3(
    direction.x * strength,
    0,
    direction.z * strength
  );
  
  // Get ball's current velocity
  const velocity = this.attachedBall.body.getLinearVelocity();
  const currentSpeed = Math.sqrt(
    velocity.x() * velocity.x() + 
    velocity.z() * velocity.z()
  );
  
  // Apply force based on beetle's max speed
  if (currentSpeed < this.stats.topSpeed) {
    this.attachedBall.body.applyCentralForce(force);
  }
  
  // Check if ball is going too fast
  if (currentSpeed > this.stats.topSpeed * 1.5) {
    // Ball is going too fast, detach beetle
    this.detachFromBall();
  }
}
```

## Physics Clean-up

Properly clean up physics objects to prevent memory leaks:

```javascript
destroyPhysicsObject(object) {
  // Remove from physics world
  if (object.body) {
    this.physicsWorld.removeRigidBody(object.body);
    
    // Clean up Ammo.js objects
    Ammo.destroy(object.body);
    if (object.motionState) {
      Ammo.destroy(object.motionState);
    }
    if (object.shape) {
      Ammo.destroy(object.shape);
    }
  }
}
```

## Tips for Testing Physics

1. Start with simple physics objects and gradually increase complexity
2. Use visual debuggers to see physics shapes and collisions
3. Implement console logging for key physics values during development
4. Test physics on different terrain types separately before combining
5. Start with simplified physics before adding realistic constraints

```javascript
// Debug renderer for physics shapes
function debugPhysics() {
  const debugDrawer = new Ammo.DebugDrawer();
  // Set up debug drawer...
  physicsWorld.setDebugDrawer(debugDrawer);
  
  // In render loop
  physicsWorld.debugDrawWorld();
}
```

## Implementing Using Cannon.js (Alternative)

If you prefer using Cannon.js instead of Ammo.js, here's a brief implementation guide:

```javascript
// Initialize Cannon.js
const world = new CANNON.World();
world.gravity.set(0, -9.81, 0);

// Create ball
const ballShape = new CANNON.Sphere(radius);
const ballBody = new CANNON.Body({
  mass: mass,
  shape: ballShape,
  position: new CANNON.Vec3(position.x, position.y, position.z)
});
world.addBody(ballBody);

// Create terrain
const terrainShape = new CANNON.Heightfield(heightmap, {
  elementSize: sectionSize / resolution
});
const terrainBody = new CANNON.Body({
  mass: 0, // Static body
  shape: terrainShape,
  position: new CANNON.Vec3(centerX, 0, centerZ)
});
world.addBody(terrainBody);

// Create constraint
const ballBeetleConstraint = new CANNON.PointToPointConstraint(
  beetleBody, 
  new CANNON.Vec3(0, 0, 0.4),
  ballBody,
  new CANNON.Vec3(0, 0, 0)
);
world.addConstraint(ballBeetleConstraint);

// Physics update
function updatePhysics(deltaTime) {
  world.step(1/60, deltaTime, 10);
}
```

Both Ammo.js and Cannon.js are suitable for this project, but Ammo.js generally offers better performance for complex scenes with many physics objects.
