# Dung Beetle Game - Ecosystem Design Guide

This document outlines the design and implementation of different ecosystems in the dung beetle game, including their visual characteristics, physics properties, and object placement.

## Ecosystem Overview

As the player progresses northward, they will encounter different ecosystems, each with unique characteristics:

1. **Grassland** (Starting area, 0-1000m north)
2. **Forest** (1000-2000m north)
3. **Desert** (2000-3000m north)
4. **Snow** (3000m+ north)

## Ecosystem Characteristics

### 1. Grassland

**Visual Characteristics:**
- Primarily green, rolling terrain
- Gentle hills with occasional small cliffs
- Small ponds and streams

**Physics Properties:**
- Standard friction and traction
- Moderate wind effects
- Occasional light rain (reduces visibility briefly)

**Objects:**
- Grasses and wildflowers (common)
- Small bushes and occasional trees
- Small rocks and pebbles
- Small animals (rabbits, mice)
- Small/medium dung piles from grazing animals

**Challenge Level:** Low (beginner friendly)

### 2. Forest

**Visual Characteristics:**
- Darker green terrain with patches of brown
- More varied height with hills and valleys
- Streams and small lakes

**Physics Properties:**
- Slightly higher friction on forest floor (leaves, etc.)
- Denser obstacle placement
- Occasional heavier rain (affects ball control)

**Objects:**
- Trees (common, varying sizes)
- Fallen logs and branches (obstacles)
- Mushrooms and underbrush
- Forest animals (deer, foxes)
- Medium dung piles from forest animals

**Challenge Level:** Medium

### 3. Desert

**Visual Characteristics:**
- Sandy, tan colored terrain
- Dunes and wind-swept features
- Oases with small water areas
- Rock formations and plateaus

**Physics Properties:**
- Lower friction on sand (more sliding)
- Sandstorms that affect visibility
- Heat mirages (visual distortion)

**Objects:**
- Cacti and desert plants (sparse)
- Large rock formations and boulders
- Lizards and scorpions
- Less frequent but larger dung piles from desert animals

**Challenge Level:** High

### 4. Snow

**Visual Characteristics:**
- White, snow-covered terrain
- Icy patches that glisten
- Frozen lakes and rivers
- Snow-covered trees and rocks

**Physics Properties:**
- Very low friction on ice patches
- Snow build-up that slows movement
- Occasional blizzards (severe visibility reduction)

**Objects:**
- Snow-covered trees
- Ice formations and icicles
- Polar animals (bears, wolves)
- Rarer but valuable dung piles from large animals

**Challenge Level:** Very High

## Ecosystem Transition Design

Transitions between ecosystems should be gradual to create a natural progression:

### Transition Zones

Each transition zone spans approximately 100m:

1. **Grassland to Forest Transition (900-1100m north)**
   - Increasing tree density
   - Gradual darkening of ground texture
   - "Entering Forest" signpost

2. **Forest to Desert Transition (1900-2100m north)**
   - Trees becoming sparser
   - Ground gradually changing from soil to sand
   - "Entering Desert" signpost

3. **Desert to Snow Transition (2900-3100m north)**
   - Sand dunes with patches of snow
   - Decreasing temperature (visual effects)
   - "Entering Arctic" signpost

### Implementation Approach

```javascript
// Determine ecosystem based on north distance
function getEcosystemAtDistance(northDistance) {
  if (northDistance < 900) {
    return "grassland";
  } else if (northDistance < 1000) {
    // Grassland-Forest transition
    return {
      primary: "grassland",
      secondary: "forest",
      blend: (northDistance - 900) / 100
    };
  } else if (northDistance < 1900) {
    return "forest";
  } else if (northDistance < 2000) {
    // Forest-Desert transition
    return {
      primary: "forest",
      secondary: "desert",
      blend: (northDistance - 1900) / 100
    };
  } else if (northDistance < 2900) {
    return "desert";
  } else if (northDistance < 3000) {
    // Desert-Snow transition
    return {
      primary: "desert",
      secondary: "snow",
      blend: (northDistance - 2900) / 100
    };
  } else {
    return "snow";
  }
}

// Blend terrain properties during transition
function getTerrainProperties(ecosystem) {
  if (typeof ecosystem === "string") {
    // Single ecosystem
    return ecosystemProperties[ecosystem];
  } else {
    // Transition zone - blend properties
    const primaryProps = ecosystemProperties[ecosystem.primary];
    const secondaryProps = ecosystemProperties[ecosystem.secondary];
    const blend = ecosystem.blend;
    
    return {
      color: blendColors(primaryProps.color, secondaryProps.color, blend),
      friction: lerp(primaryProps.friction, secondaryProps.friction, blend),
      roughness: lerp(primaryProps.roughness, secondaryProps.roughness, blend),
      treeFrequency: lerp(primaryProps.treeFrequency, secondaryProps.treeFrequency, blend),
      // Blend other properties...
    };
  }
}
```

## Ecosystem-Specific Challenges

Each ecosystem introduces unique challenges to maintain increasing difficulty:

### Grassland Challenges
- Basic obstacles (small rocks, shallow water)
- Occasional grazing animals that can be scared away
- Light wind that has minimal effect on ball control

### Forest Challenges
- Denser obstacle placement makes navigation harder
- Fallen logs require careful maneuvering
- Streams can damage the ball if crossed incorrectly
- Occasional rain making slopes more slippery

### Desert Challenges
- Sand dunes require more strength to climb
- Rolling down dunes can cause beetle to lose control
- Rare but dangerous quicksand traps
- Heat mirages creating visual confusion
- Sandstorms reducing visibility periodically

### Snow Challenges
- Ice patches causing loss of control
- Deep snow slowing movement substantially
- Crevasses that can destroy ball if fallen into
- Blizzards severely limiting visibility
- Cold effects requiring more frequent movement

## Object Scaling with Distance

As the player progresses north, objects and animals increase in size:

```javascript
// Scale object based on north distance
function getScaleFactor(northDistance, baseSize) {
  // Scale factor increases by 10% every 1000m north
  const distanceFactor = 1 + (northDistance * 0.0001);
  return baseSize * distanceFactor;
}

// Example object creation with scaling
function createAnimal(type, position, northDistance) {
  const baseSize = animalSizes[type];
  const scaleFactor = getScaleFactor(northDistance, baseSize);
  
  // Create animal with scaled size
  return new Animal(type, position, scaleFactor);
}
```

## Resource Distribution

Dung resources should be distributed differently in each ecosystem:

### Grassland
- Many small dung piles (1-2 size units)
- Fairly evenly distributed
- Easy to spot on green background

### Forest
- Medium dung piles (2-3 size units)
- Clustered near animal paths
- Sometimes hidden by underbrush

### Desert
- Large but rare dung piles (3-5 size units)
- Very unevenly distributed (oases have more)
- Stand out against sand background

### Snow
- Very large, rare dung piles (4-6 size units)
- Mostly found in sheltered areas
- Can be partially covered by snow

## Environmental Effects

Each ecosystem has unique environmental effects:

### Grassland
- Light wind rustling grass
- Occasional butterflies and birds
- Ambient cricket/insect sounds

### Forest
- Dappled light through trees
- Birds and squirrels in trees
- Leaves falling occasionally
- Ambient forest sounds (birds, wind in trees)

### Desert
- Heat haze effect distorting distant views
- Dust devils (small whirlwinds)
- Lizards scurrying across sand
- Ambient sounds (wind, occasional distant animal)

### Snow
- Falling snowflakes
- Condensation breath from beetle and animals
- Occasional aurora effects in sky
- Ambient sounds (wind, cracking ice)

## Implementation Priorities

When implementing ecosystems, prioritize these aspects:

1. **Physics differences** - These directly affect gameplay
2. **Terrain visual differences** - Essential for player orientation
3. **Object distribution** - Creates the ecosystem feel
4. **Basic environmental effects** - Enhances immersion
5. **Advanced effects** - Polish once core elements are working

## Visual Reference Table

| Ecosystem | Primary Color | Terrain Texture | Characteristic Objects | Light Quality | Weather |
|-----------|---------------|-----------------|------------------------|--------------|---------|
| Grassland | #8BC34A (Green) | Grass with flowers | Grasses, small trees | Bright, clear | Light clouds, occasional light rain |
| Forest | #33691E (Dark green) | Soil with leaves | Dense trees, undergrowth | Filtered, dappled | Occasional rain, misty mornings |
| Desert | #FFF59D (Tan) | Sand with rocky patches | Cacti, rock formations | Harsh, bright | Clear, occasional sandstorms |
| Snow | #FFFFFF (White) | Snow with ice patches | Evergreens, ice formations | Pale, cool | Snowfall, occasional blizzards |

## Sound Design Notes

Each ecosystem should have distinct audio characteristics:

- **Grassland**: Bright, cheerful ambient sounds (birds, insects)
- **Forest**: Dense, layered natural sounds (birds, water, leaves)
- **Desert**: Sparse, minimal sounds dominated by wind
- **Snow**: Muffled sounds with wind elements and occasional ice cracking

## Implementation Checklist

For each ecosystem, ensure you have:

- [ ] Unique terrain generation parameters
- [ ] Appropriate ground textures and materials
- [ ] Ecosystem-specific objects and obstacles
- [ ] Properly adjusted physics parameters
- [ ] Environmental effects (particles, lighting)
- [ ] Appropriate audio elements
- [ ] Transition zone blending
- [ ] Signposts marking transitions
