# 3D Interactive Web Experience

An immersive web application featuring interactive 3D visualizations built with Three.js. The project showcases multiple sections with dynamic animations and user interactions.

## Features

### Section 0: Galaxy Visualization
- Dynamic particle system creating a galaxy effect
- Wave-like motion animation
- Customizable parameters through GUI controls
- Interactive camera movement

### Section 1: Interactive Light Bulb
- 3D light bulb model with click interaction
- Dynamic lighting effects
- Spotlight and point light implementation
- Responsive model animation

## Technology Stack
- Three.js for 3D rendering
- WebGL
- Vanilla JavaScript
- Vite for development and building

## Project Structure
```
project/
├── src/                    # Source files
│   ├── script.js          # Main JavaScript logic
│   ├── style.css          # Styling
│   └── index.html         # Main HTML file
├── static/                 # Static assets
│   └── models/            # 3D models
├── public/                # Public assets
├── node_modules/          # Dependencies
├── package.json           # Project configuration
├── package-lock.json      # Dependency lock file
├── vite.config.js         # Vite configuration
└── README.md             # Project documentation
```

## Setup
1. Download [Node.js](https://nodejs.org/en/download/)
2. Run these commands:

```bash
# Install dependencies (only the first time)
npm install

# Run the local server at localhost:8080
npm run dev

# Build for production in the dist/ directory
npm run build
```

## Usage
1. Scroll between sections to explore different 3D experiences
2. Section 0: Watch the animated galaxy particles
3. Section 1: Click the light bulb to toggle illumination

## Dependencies
- Three.js
- GLTFLoader for 3D model loading
- lil-gui for debug interface
- Vite for development environment

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Performance Notes
- Requires WebGL support
- Performance may vary based on hardware capabilities
- Optimized for modern browsers
