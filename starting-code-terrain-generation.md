# Dung Beetle Game - Terrain Generation Guide

This guide covers the implementation of procedural terrain generation for the dung beetle game, including ecosystem transitions and object placement.

## Terrain System Overview

The terrain system is built on a chunked approach:
- The world is divided into sections (chunks)
- Sections are generated procedurally as the player moves
- Each section contains terrain, objects, and resources
- Sections far from the player are unloaded to save memory

## Heightmap Generation

Use noise functions to create realistic terrain:

```javascript
class TerrainGenerator {
  constructor() {
    // Initialize noise generators with different seeds
    this.mainNoise = new SimplexNoise(Math.random());
    this.detailNoise = new SimplexNoise(Math.random());
    this.roughnessNoise = new SimplexNoise(Math.random());
    
    this.params = {
      sectionSize: 100,  // Size of each terrain section
      resolution: 128,   // Heightmap resolution
      maxHeight: 10,     // Maximum terrain height
      noiseScale: 0.01,  // Base noise scale
      detailScale: 0.05, // Detail noise scale
      roughnessScale: 0.02 // Roughness noise scale
    };
  }
  
  generateHeightmap(minX, maxX, minZ, maxZ, resolution, northDistance) {
    const heightmap = new Float32Array(resolution * resolution);
    const width = maxX - minX;
    const length = maxZ - minZ;
    
    // Scale noise based on north distance (more extreme further north)
    const noiseScaleFactor = 1 + (northDistance * 0.0005);
    
    // Roughness increases with north distance
    const roughnessAmount = Math.min(0.5, northDistance * 0.001);
    
    // Generate heightmap
    for (let z = 0; z < resolution; z++) {
      for (let x = 0; x < resolution; x++) {
        // Convert grid position to world position
        const worldX = minX + (x / resolution) * width;
        const worldZ = minZ + (z / resolution) * length;
        
        // Base terrain noise
        let height = this.mainNoise.noise2D(
          worldX * this.params.noiseScale * noiseScaleFactor,
          worldZ * this.params.noiseScale * noiseScaleFactor
        );
        
        // Add detail noise
        height += this.detailNoise.noise2D(
          worldX * this.params.detailScale,
          worldZ * this.params.detailScale
        ) * 0.3;
        
        // Add roughness based on another noise function
        const roughness = this.roughnessNoise.noise2D(
          worldX * this.params.roughnessScale,
          worldZ * this.params.roughnessScale
        );
        height += roughness * roughnessAmount;
        
        // Normalize height to 0-1 range
        height = (height + 1) / 2;
        
        // Apply height multiplier
        height *= this.params.maxHeight;
        
        // Store in heightmap
        heightmap[z * resolution + x] = height;
      }
    }
    
    // Add features like hills, cliffs, and water bodies
    this.addTerrainFeatures(heightmap, resolution, northDistance);
    
    return heightmap;
  }
  
  addTerrainFeatures(heightmap, resolution, northDistance) {
    // Add hills
    this.addHills(heightmap, resolution, northDistance);
    
    // Add cliffs (more frequent with higher north distance)
    if (Math.random() < 0.1 + (northDistance * 0.0002)) {
      this.addCliffs(heightmap, resolution, northDistance);
    }
    
    // Add water bodies
    this.addWaterBodies(heightmap, resolution, northDistance);
  }
  
  addHills(heightmap, resolution, northDistance) {
    // Number of hills increases slightly with north distance
    const numHills = 2 + Math.floor(Math.random() * 3) + Math.floor(northDistance / 500);
    
    for (let i = 0; i < numHills; i++) {
      // Random position for hill
      const centerX = Math.floor(Math.random() * resolution);
      const centerZ = Math.floor(Math.random() * resolution);
      
      // Hill size (bigger hills further north)
      const sizeScale = 1 + (northDistance * 0.001);
      const radius = (5 + Math.random() * 15) * sizeScale;
      
      // Hill height
      const height = (2 + Math.random() * 3) * sizeScale;
      
      // Apply hill
      for (let z = 0; z < resolution; z++) {
        for (let x = 0; x < resolution; x++) {
          const distance = Math.sqrt(
            Math.pow(x - centerX, 2) + 
            Math.pow(z - centerZ, 2)
          );
          
          if (distance < radius) {
            // Use cosine falloff for natural looking hills
            const factor = 0.5 * (1 + Math.cos(Math.PI * distance / radius));
            heightmap[z * resolution + x] += height * factor;
          }
        }
      }
    }
  }
  
  addCliffs(heightmap, resolution, northDistance) {
    // Random position for cliff line
    const startX = Math.floor(Math.random() * resolution);
    const startZ = Math.floor(Math.random() * resolution);
    const endX = Math.floor(Math.random() * resolution);
    const endZ = Math.floor(Math.random() * resolution);
    
    // Cliff height increases with north distance
    const height = 3 + Math.random() * 2 + (northDistance * 0.002);
    const width = 2 + Math.random() * 3;
    
    // Draw cliff line
    this.drawCliffLine(
      heightmap, resolution, 
      startX, startZ, endX, endZ, 
      height, width
    );
  }
  
  drawCliffLine(heightmap, resolution, x0, z0, x1, z1, height, width) {
    // Use Bresenham's line algorithm
    const dx = Math.abs(x1 - x0);
    const dz = Math.abs(z1 - z0);
    const sx = (x0 < x1) ? 1 : -1;
    const sz = (z0 < z1) ? 1 : -1;
    let err = dx - dz;
    
    while (x0 !== x1 || z0 !== z1) {
      // Add cliff height at this position
      this.addCliffPoint(heightmap, resolution, x0, z0, height, width);
      
      const e2 = 2 * err;
      if (e2 > -dz) {
        err -= dz;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        z0 += sz;
      }
    }
  }
  
  addCliffPoint(heightmap, resolution, x, z, height, width) {
    // Apply cliff height to nearby points
    for (let dz = -width; dz <= width; dz++) {
      for (let dx = -width; dx <= width; dx++) {
        const nx = x + dx;
        const nz = z + dz;
        
        // Check bounds
        if (nx >= 0 && nx < resolution && nz >= 0 && nz < resolution) {
          const distance = Math.sqrt(dx * dx + dz * dz);
          if (distance <= width) {
            // Apply height difference
            const factor = 1 - (distance / width);
            heightmap[nz * resolution + nx] += height * factor;
          }
        }
      }
    }
  }
  
  addWaterBodies(heightmap, resolution, northDistance) {
    // Probability of water bodies decreases in desert environments
    // and increases in forest/grassland
    const waterProbability = this.getCurrentEcosystemWaterProbability(northDistance);
    
    if (Math.random() < waterProbability) {
      // Decide between large and small water body
      const isLargeWater = Math.random() < 0.3;
      
      // Water position
      const centerX = Math.floor(Math.random() * resolution);
      const centerZ = Math.floor(Math.random() * resolution);
      
      // Water size
      const radius = isLargeWater ? 
        20 + Math.random() * 10 : 
        5 + Math.random() * 8;
      
      // Water depth
      const depth = isLargeWater ? 
        this.params.maxHeight * 0.7 : 
        this.params.maxHeight * 0.3;
      
      // Apply water depression
      for (let z = 0; z < resolution; z++) {
        for (let x = 0; x < resolution; x++) {
          const distance = Math.sqrt(
            Math.pow(x - centerX, 2) + 
            Math.pow(z - centerZ, 2)
          );
          
          if (distance < radius) {
            // Create depression with smooth edges
            const normalizedDist = distance / radius;
            const depthFactor = Math.pow(normalizedDist, 2);
            
            // Apply depth
            heightmap[z * resolution + x] = Math.min(
              heightmap[z * resolution + x],
              depth + (this.params.maxHeight - depth) * depthFactor
            );
            
            // Mark as water (can be used later for physics/rendering)
            // Need to store this information separately
            // this.waterMap[z * resolution + x] = true;
          }
        }
      }
    }
  }
  
  getCurrentEcosystemWaterProbability(northDistance) {
    // Default probability
    let probability = 0.4;
    
    // Adjust based on ecosystem (which is determined by north distance)
    if (northDistance < 1000) {
      // Grassland - normal water
      probability = 0.4;
    } else if (northDistance < 2000) {
      // Forest - more water
      probability = 0.6;
    } else if (northDistance < 3000) {
      // Desert - less water
      probability = 0.2;
    } else {
      // Snowy - medium water (frozen)
      probability = 0.5;
    }
    
    return probability;
  }
  
  createTerrainMesh(heightmap, minX, maxX, minZ, maxZ, resolution) {
    const width = maxX - minX;
    const length = maxZ - minZ;
    
    // Create geometry
    const geometry = new THREE.PlaneGeometry(
      width, length, 
      resolution - 1, resolution - 1
    );
    
    // Rotate to horizontal plane
    geometry.rotateX(-Math.PI / 2);
    
    // Apply heightmap to vertices
    const vertices = geometry.attributes.position.array;
    for (let i = 0, j = 0; i < vertices.length; i += 3, j++) {
      vertices[i + 1] = heightmap[j];
    }
    
    // Update normals for lighting
    geometry.computeVertexNormals();
    
    // Create mesh with appropriate material
    const material = this.getEcosystemMaterial(this.currentEcosystem);
    const mesh = new THREE.Mesh(geometry, material);
    
    // Position mesh
    mesh.position.set(
      (minX + maxX) / 2,
      0,
      (minZ + maxZ) / 2
    );
    
    return mesh;
  }
  
  getEcosystemMaterial(ecosystem) {
    // Basic material for each ecosystem type
    switch(ecosystem) {
      case 'grassland':
        return new THREE.MeshStandardMaterial({ 
          color: 0x8BC34A,
          roughness: 0.8,
          metalness: 0.1
        });
        
      case 'forest':
        return new THREE.MeshStandardMaterial({ 
          color: 0x33691E,
          roughness: 0.9,
          metalness: 0.05
        });
        
      case 'desert':
        return new THREE.MeshStandardMaterial({ 
          color: 0xFFF59D,
          roughness: 0.6,
          metalness: 0.1
        });
        
      case 'snow':
        return new THREE.MeshStandardMaterial({ 
          color: 0xFFFFFF,
          roughness: 0.4,
          metalness: 0.1
        });
        
      default:
        return new THREE.MeshStandardMaterial({ 
          color: 0x8BC34A,
          roughness: 0.8,
          metalness: 0.1
        });
    }
  }
  
  // For more realistic terrain, use texture mapping
  getDetailedEcosystemMaterial(ecosystem) {
    // Create texture loader
    const loader = new THREE.TextureLoader();
    
    let diffuseMap, normalMap, roughnessMap;
    
    switch(ecosystem) {
      case 'grassland':
        diffuseMap = loader.load('textures/grass_diffuse.jpg');
        normalMap = loader.load('textures/grass_normal.jpg');
        roughnessMap = loader.load('textures/grass_roughness.jpg');
        break;
        
      case 'forest':
        diffuseMap = loader.load('textures/forest_diffuse.jpg');
        normalMap = loader.load('textures/forest_normal.jpg');
        roughnessMap = loader.load('textures/forest_roughness.jpg');
        break;
        
      // Add other ecosystems...
    }
    
    // Set texture repeat based on terrain size
    diffuseMap.wrapS = diffuseMap.wrapT = THREE.RepeatWrapping;
    diffuseMap.repeat.set(10, 10);
    
    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(10, 10);
    
    roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
    roughnessMap.repeat.set(10, 10);
    
    return new THREE.MeshStandardMaterial({
      map: diffuseMap,
      normalMap: normalMap,
      roughnessMap: roughnessMap,
      roughness: 0.8,
      metalness: 0.1
    });
  }
  
  addTerrainObjects(heightmap, minX, maxX, minZ, maxZ, northDistance, resolution) {
    const objects = [];
    const width = maxX - minX;
    const length = maxZ - minZ;
    
    // Object scaling based on north distance
    const sizeScale = 1 + (northDistance * 0.001);
    
    // Calculate density based on ecosystem and north distance (difficulty)
    const ecosystem = this.getEcosystemAtDistance(northDistance);
    const densityFactors = this.getEcosystemDensityFactors(ecosystem, northDistance);
    
    // Add trees
    this.addTrees(objects, heightmap, minX, maxX, minZ, maxZ, resolution, 
                 sizeScale, densityFactors.trees, ecosystem);
    
    // Add rocks
    this.addRocks(objects, heightmap, minX, maxX, minZ, maxZ, resolution, 
                 sizeScale, densityFactors.rocks, ecosystem);
    
    // Add animals
    this.addAnimals(objects, heightmap, minX, maxX, minZ, maxZ, resolution, 
                   sizeScale, densityFactors.animals, ecosystem);
    
    // Add dung resources (more common where animals are)
    this.addDungResources(objects, heightmap, minX, maxX, minZ, maxZ, resolution, 
                         densityFactors.dungResources, ecosystem);
    
    // Add special obstacles (more common with higher north distance)
    this.addObstacles(objects, heightmap, minX, maxX, minZ, maxZ, resolution, 
                     sizeScale, densityFactors.obstacles, ecosystem);
    
    return objects;
  }
  
  getEcosystemAtDistance(northDistance) {
    if (northDistance < 1000) {
      return 'grassland';
    } else if (northDistance < 2000) {
      return 'forest';
    } else if (northDistance < 3000) {
      return 'desert';
    } else {
      return 'snow';
    }
  }
  
  getEcosystemDensityFactors(ecosystem, northDistance) {
    // Base densities
    const baseDensities = {
      grassland: { trees: 0.003, rocks: 0.002, animals: 0.001, dungResources: 0.005, obstacles: 0.001 },
      forest: { trees: 0.008, rocks: 0.003, animals: 0.002, dungResources: 0.004, obstacles: 0.002 },
      desert: { trees: 0.001, rocks: 0.005, animals: 0.0005, dungResources: 0.002, obstacles: 0.003 },
      snow: { trees: 0.002, rocks: 0.004, animals: 0.0008, dungResources: 0.003, obstacles: 0.004 }
    };
    
    // Get base density for current ecosystem
    const base = baseDensities[ecosystem] || baseDensities.grassland;
    
    // Difficulty scaling with north distance
    const difficultyFactor = 1 + (northDistance * 0.0002);
    
    // Apply scaling to obstacle density (makes game harder as you progress)
    base.obstacles *= difficultyFactor;
    
    return base;
  }
  
  addTrees(objects, heightmap, minX, maxX, minZ, maxZ, resolution, sizeScale, density, ecosystem) {
    const width = maxX - minX;
    const length = maxZ - minZ;
    
    // Calculate number of trees based on area and density
    const area = width * length;
    const numTrees = Math.floor(area * density);
    
    for (let i = 0; i < numTrees; i++) {
      // Random position
      const x = Math.random();
      const z = Math.random();
      
      // Convert to heightmap indices
      const heightmapX = Math.floor(x * resolution);
      const heightmapZ = Math.floor(z * resolution);
      
      // Get height at this position
      const height = heightmap[heightmapZ * resolution + heightmapX];
      
      // Skip if underwater
      if (height < this.params.waterLevel * this.params.maxHeight) {
        continue;
      }
      
      // Convert to world position
      const worldX = minX + x * width;
      const worldZ = minZ + z * length;
      
      // Create tree with ecosystem-appropriate appearance
      const tree = this.createTree(worldX, height, worldZ, sizeScale, ecosystem);
      objects.push(tree);
    }
  }
  
  createTree(x, y, z, sizeScale, ecosystem) {
    let trunkHeight, trunkRadius, crownRadius;
    let trunkColor, crownColor;
    
    // Set tree properties based on ecosystem
    switch(ecosystem) {
      case 'grassland':
        trunkHeight = (1 + Math.random() * 0.5) * sizeScale;
        trunkRadius = 0.1 * sizeScale;
        crownRadius = (0.6 + Math.random() * 0.3) * sizeScale;
        trunkColor = 0x8B4513; // Brown
        crownColor = 0x66BB6A; // Green
        break;
        
      case 'forest':
        trunkHeight = (2 + Math.random()) * sizeScale;
        trunkRadius = 0.15 * sizeScale;
        crownRadius = (0.8 + Math.random() * 0.4) * sizeScale;
        trunkColor = 0x5D4037; // Dark brown
        crownColor = 0x2E7D32; // Dark green
        break;
        
      case 'desert':
        // Cactus-like
        trunkHeight = (0.8 + Math.random() * 0.7) * sizeScale;
        trunkRadius = 0.15 * sizeScale;
        crownRadius = 0; // No crown for cacti
        trunkColor = 0x33691E; // Dark green
        break;
        
      case 'snow':
        trunkHeight = (1.5 + Math.random() * 0.8) * sizeScale;
        trunkRadius = 0.12 * sizeScale;
        crownRadius = (0.7 + Math.random() * 0.3) * sizeScale;
        trunkColor = 0x4E342E; // Darker brown
        crownColor = 0x26A69A; // Teal-ish green
        break;
        
      default:
        trunkHeight = (1 + Math.random() * 0.5) * sizeScale;
        trunkRadius = 0.1 * sizeScale;
        crownRadius = (0.6 + Math.random() * 0.3) * sizeScale;
        trunkColor = 0x8B4513; // Brown
        crownColor = 0x66BB6A; // Green
    }
    
    // Create tree group
    const treeGroup = new THREE.Group();
    
    // Create trunk
    const trunkGeometry = new THREE.CylinderGeometry(
      trunkRadius, trunkRadius, trunkHeight, 8
    );
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: trunkColor });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    
    // Position trunk base at ground level
    trunk.position.set(0, trunkHeight / 2, 0);
    treeGroup.add(trunk);
    
    // Create crown (except for desert cacti)
    if (crownRadius > 0) {
      let crownGeometry;
      
      if (ecosystem === 'snow') {
        // Cone shape for snowy trees
        crownGeometry = new THREE.ConeGeometry(
          crownRadius, trunkHeight * 1.2, 8
        );
      } else {
        // Sphere for other trees
        crownGeometry = new THREE.SphereGeometry(crownRadius, 8, 8);
      }
      
      const crownMaterial = new THREE.MeshStandardMaterial({ color: crownColor });
      const crown = new THREE.Mesh(crownGeometry, crownMaterial);
      
      // Position crown on top of trunk
      crown.position.set(0, trunkHeight + (ecosystem === 'snow' ? 0 : crownRadius * 0.5), 0);
      treeGroup.add(crown);
    } else if (ecosystem === 'desert') {
      // For cacti, add arms
      const numArms = Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numArms; i++) {
        const armLength = (0.4 + Math.random() * 0.3) * sizeScale;
        const armGeometry = new THREE.CylinderGeometry(
          trunkRadius * 0.7, trunkRadius * 0.7, armLength, 8
        );
        const arm = new THREE.Mesh(armGeometry, trunkMaterial);
        
        // Random position along trunk
        const height = trunkHeight * (0.5 + Math.random() * 0.3);
        const angle = Math.random() * Math.PI * 2;
        
        // Position and rotate arm
        arm.position.set(
          Math.sin(angle) * trunkRadius,
          height,
          Math.cos(angle) * trunkRadius
        );
        arm.rotation.z = Math.PI / 2 - angle;
        
        treeGroup.add(arm);
      }
    }
    
    // Set tree position
    treeGroup.position.set(x, y, z);
    
    // Add physics properties
    treeGroup.userData = {
      type: 'obstacle',
      collisionType: 'tree',
      damage: 0.2 * sizeScale // Larger trees cause more damage
    };
    
    return treeGroup;
  }
  
  // Similar functions for rocks, animals, obstacles, and dung resources...
  // These would follow the same pattern as the tree functions
  
  addRocks(objects, heightmap, minX, maxX, minZ, maxZ, resolution, sizeScale, density, ecosystem) {
    // Implementation similar to addTrees but for rocks
    // ...
  }
  
  addAnimals(objects, heightmap, minX, maxX, minZ, maxZ, resolution, sizeScale, density, ecosystem) {
    // Implementation for adding animals
    // ...
  }
  
  addDungResources(objects, heightmap, minX, maxX, minZ, maxZ, resolution, density, ecosystem) {
    // Implementation for adding collectible dung resources
    // ...
  }
  
  addObstacles(objects, heightmap, minX, maxX, minZ, maxZ, resolution, sizeScale, density, ecosystem) {
    // Implementation for adding special obstacles
    // ...
  }
  
  updateTerrain(playerPosition, northDistance) {
    // Calculate current section
    const gridX = Math.floor(playerPosition.x / this.params.sectionSize);
    const gridZ = Math.floor(playerPosition.z / this.params.sectionSize);
    
    // Generate new sections based on view distance
    const viewDistance = 2 + Math.floor(northDistance / 1000);
    
    // East-west range expands as player goes north (triangular shape)
    const eastWestRange = 1 + Math.floor(northDistance / 500);
    
    // Load new sections
    for (let x = gridX - eastWestRange; x <= gridX + eastWestRange; x++) {
      for (let z = gridZ - 1; z <= gridZ + viewDistance; z++) {
        const sectionId = `${x},${z}`;
        
        // Generate section if not already created
        if (!this.sections.has(sectionId)) {
          this.generateSection(x, z);
        }
      }
    }
    
    // Unload distant sections
    this.sections.forEach((section, id) => {
      const [secX, secZ] = id.split(',').map(Number);
      
      const distanceX = Math.abs(secX - gridX);
      const distanceZ = Math.abs(secZ - gridZ);
      
      // Check if section is too far away
      if (distanceX > eastWestRange + 1 || distanceZ > viewDistance + 1) {
        // Remove section from scene and physics world
        this.scene.remove(section.mesh);
        if (section.physics) {
          this.physicsWorld.removeRigidBody(section.physics);
        }
        
        // Remove objects
        section.objects.forEach(obj => {