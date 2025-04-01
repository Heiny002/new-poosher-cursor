# Poosher - A Dung Beetle Adventure

A physics-based game where you control a dung beetle pushing and growing a ball of dung through a procedurally generated terrain.

## Features

- Procedurally generated terrain with realistic height variation
- Physics-based movement and interactions
- Growing dung ball that can be damaged
- WASD controls for beetle movement
- Dynamic lighting and shadows

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/poosher.git
cd poosher
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:5173`

## Controls

- W: Move forward
- S: Move backward
- A: Move left
- D: Move right

## Development

The project uses:
- Three.js for 3D graphics
- Ammo.js for physics simulation
- Vite for development and building

### Project Structure

```
/src
  /core        # Core game engine classes
  /entities    # Game entities (beetle, ball)
  /terrain     # Terrain generation
  /physics     # Physics systems
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 