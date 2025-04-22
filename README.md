# Space Race Game

A browser-based space race game where players navigate a spaceship through space, avoiding obstacles and collecting power-ups.

## Game Features

- Responsive design using Tailwind CSS
- Keyboard (arrow keys/WASD) and touch controls for mobile devices
- Multiple obstacle types with different visual appearances
- Power-up system with various effects:
  - Shield: Protects from one collision
  - Slow Time: Reduces obstacle speed
  - Extra Points: Instantly adds points to score
- Progressive difficulty that increases over time
- Particle effects for collisions and explosions
- Local storage for high score tracking
- Theme toggle between light and dark modes

## Game Mechanics

- **Movement**: Control your spaceship vertically and horizontally to navigate through space
- **Obstacles**: Various space objects (asteroids, satellites, UFOs) approach from all directions
- **Scoring**: Points accumulate based on survival time
- **Difficulty**: Obstacle frequency and speed increase over time

## How to Play

### Getting Started
1. Open `index.html` in a web browser
2. Click the "Start Game" button on the welcome screen
3. Use the theme toggle button in the top-right corner to switch between light and dark modes

### Controls
- **Keyboard Controls:**
  - Arrow keys (←↑→↓) or WASD keys to navigate your spaceship in four directions
  - ← or A: Move left
  - → or D: Move right
  - ↑ or W: Move up
  - ↓ or S: Move down
- **Mobile Controls:**
  - Use the on-screen arrow buttons at the bottom of the game for movement

### Gameplay Objectives
- Navigate your triangular blue spaceship through space
- Avoid incoming obstacles (asteroids, satellites, and UFOs) that approach from all directions
- Collect power-ups to gain advantages
- Survive as long as possible to achieve a high score

### Obstacles
- **Asteroids** (gray irregular objects): Basic obstacles that follow predictable paths
- **Satellites** (blue rectangular objects): Move at variable speeds with occasional direction changes
- **UFOs** (green disc-shaped objects): The most unpredictable obstacle type

### Power-ups
- **Shield** (yellow circle): Provides temporary invulnerability, protecting you from one collision
- **Slow Time** (purple circle with clock hands): Temporarily reduces the speed of all obstacles
- **Extra Points** (red star): Instantly adds 100 points to your score

### Scoring
- Your score increases continuously while you survive
- The game automatically saves your high score using browser local storage
- Game difficulty increases over time, making survival progressively harder

### Game Over
- The game ends when your spaceship collides with an obstacle (unless protected by a shield)
- Your final score is displayed on the game over screen
- Click "Play Again" to start a new game

## Technologies Used

- HTML5 Canvas for game rendering
- Tailwind CSS for responsive design
- Vanilla JavaScript for game logic
- Local Storage API for saving high scores

## Mobile Support

The game includes touch controls for mobile devices and adjusts the game canvas aspect ratio for better mobile gameplay. On mobile devices, the game automatically switches to a more vertical layout with on-screen controls.

## Future Enhancements

- Sound effects and background music
- Additional power-up types
- Multiple difficulty levels
- Achievements system
- Online leaderboard
