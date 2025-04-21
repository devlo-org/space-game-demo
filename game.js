// Game constants and configuration
const GAME_CONFIG = {
    FPS: 60,
    PLAYER_SPEED: 5,
    OBSTACLE_MIN_SPEED: 2,
    OBSTACLE_MAX_SPEED: 8,
    OBSTACLE_FREQUENCY: 0.02, // Chance per frame
    POWERUP_FREQUENCY: 0.002, // Chance per frame
    DIFFICULTY_INCREASE_RATE: 0.0001, // Per frame
};

// Game state
let gameState = {
    isRunning: false,
    score: 0,
    highScore: localStorage.getItem('spaceRaceHighScore') || 0,
    player: null,
    obstacles: [],
    powerUps: [],
    particles: [],
    keys: {},
    difficultyMultiplier: 1,
    powerUpActive: null,
    powerUpTimeLeft: 0,
};

// Game elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const gameOverModal = document.getElementById('gameOverModal');
const finalScoreDisplay = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const startModal = document.getElementById('startModal');
const startBtn = document.getElementById('startBtn');

// Mobile controls
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');

// Set canvas size
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = canvas.width * 9/16; // 16:9 aspect ratio
    
    // For mobile, adjust to more vertical layout
    if (window.innerWidth < 768) {
        canvas.height = canvas.width * 4/3; // 3:4 aspect ratio for mobile
    }
}

// Initialize the game
function initGame() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Set high score display
    highScoreDisplay.textContent = gameState.highScore;
    
    // Player object
    const playerWidth = canvas.width * 0.05;
    const playerHeight = canvas.width * 0.05;
    
    gameState.player = {
        x: canvas.width / 2 - playerWidth / 2,
        y: canvas.height - playerHeight * 2,
        width: playerWidth,
        height: playerHeight,
        color: '#3B82F6', // Tailwind blue-500
        invulnerable: false
    };
    
    // Event listeners
    window.addEventListener('keydown', (e) => {
        gameState.keys[e.key] = true;
    });
    
    window.addEventListener('keyup', (e) => {
        gameState.keys[e.key] = false;
    });
    
    // Mobile controls
    leftBtn.addEventListener('touchstart', () => { gameState.keys['ArrowLeft'] = true; });
    leftBtn.addEventListener('touchend', () => { gameState.keys['ArrowLeft'] = false; });
    rightBtn.addEventListener('touchstart', () => { gameState.keys['ArrowRight'] = true; });
    rightBtn.addEventListener('touchend', () => { gameState.keys['ArrowRight'] = false; });
    upBtn.addEventListener('touchstart', () => { gameState.keys['ArrowUp'] = true; });
    upBtn.addEventListener('touchend', () => { gameState.keys['ArrowUp'] = false; });
    downBtn.addEventListener('touchstart', () => { gameState.keys['ArrowDown'] = true; });
    downBtn.addEventListener('touchend', () => { gameState.keys['ArrowDown'] = false; });
    
    // Button click events for mobile
    leftBtn.addEventListener('mousedown', () => { gameState.keys['ArrowLeft'] = true; });
    leftBtn.addEventListener('mouseup', () => { gameState.keys['ArrowLeft'] = false; });
    rightBtn.addEventListener('mousedown', () => { gameState.keys['ArrowRight'] = true; });
    rightBtn.addEventListener('mouseup', () => { gameState.keys['ArrowRight'] = false; });
    upBtn.addEventListener('mousedown', () => { gameState.keys['ArrowUp'] = true; });
    upBtn.addEventListener('mouseup', () => { gameState.keys['ArrowUp'] = false; });
    downBtn.addEventListener('mousedown', () => { gameState.keys['ArrowDown'] = true; });
    downBtn.addEventListener('mouseup', () => { gameState.keys['ArrowDown'] = false; });
    
    // Game buttons
    restartBtn.addEventListener('click', startGame);
    startBtn.addEventListener('click', startGame);
}

// Start the game
function startGame() {
    // Reset game state
    gameState.isRunning = true;
    gameState.score = 0;
    gameState.obstacles = [];
    gameState.powerUps = [];
    gameState.particles = [];
    gameState.difficultyMultiplier = 1;
    gameState.powerUpActive = null;
    gameState.powerUpTimeLeft = 0;
    
    // Reset player position
    gameState.player.x = canvas.width / 2 - gameState.player.width / 2;
    gameState.player.y = canvas.height - gameState.player.height * 2;
    gameState.player.invulnerable = false;
    
    // Update score display
    scoreDisplay.textContent = '0';
    
    // Hide modals
    startModal.classList.add('hidden');
    gameOverModal.classList.add('hidden');
    
    // Start game loop if not already running
    if (!gameState.animationFrameId) {
        gameLoop();
    }
}

// Game over
function gameOver() {
    gameState.isRunning = false;
    
    // Update high score if needed
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('spaceRaceHighScore', gameState.highScore);
        highScoreDisplay.textContent = gameState.highScore;
    }
    
    // Show game over modal
    finalScoreDisplay.textContent = gameState.score;
    gameOverModal.classList.remove('hidden');
}

// Update player position based on input
function updatePlayer() {
    const speed = GAME_CONFIG.PLAYER_SPEED;
    
    // Horizontal movement
    if ((gameState.keys['ArrowLeft'] || gameState.keys['a'] || gameState.keys['A']) && 
        gameState.player.x > 0) {
        gameState.player.x -= speed;
    }
    
    if ((gameState.keys['ArrowRight'] || gameState.keys['d'] || gameState.keys['D']) && 
        gameState.player.x < canvas.width - gameState.player.width) {
        gameState.player.x += speed;
    }
    
    // Vertical movement
    if ((gameState.keys['ArrowUp'] || gameState.keys['w'] || gameState.keys['W']) && 
        gameState.player.y > 0) {
        gameState.player.y -= speed;
    }
    
    if ((gameState.keys['ArrowDown'] || gameState.keys['s'] || gameState.keys['S']) && 
        gameState.player.y < canvas.height - gameState.player.height) {
        gameState.player.y += speed;
    }
}

// Generate obstacles
function generateObstacles() {
    // Increase difficulty over time
    gameState.difficultyMultiplier += GAME_CONFIG.DIFFICULTY_INCREASE_RATE;
    
    // Random chance to generate an obstacle
    if (Math.random() < GAME_CONFIG.OBSTACLE_FREQUENCY * gameState.difficultyMultiplier) {
        const size = Math.random() * (canvas.width * 0.08) + (canvas.width * 0.03);
        const speed = Math.random() * 
            (GAME_CONFIG.OBSTACLE_MAX_SPEED - GAME_CONFIG.OBSTACLE_MIN_SPEED) + 
            GAME_CONFIG.OBSTACLE_MIN_SPEED;
        
        // Determine direction (top, right, bottom, left)
        const direction = Math.floor(Math.random() * 4);
        let x, y, velocityX, velocityY;
        
        switch(direction) {
            case 0: // Top
                x = Math.random() * (canvas.width - size);
                y = -size;
                velocityX = (Math.random() - 0.5) * 2; // Random horizontal movement
                velocityY = speed;
                break;
            case 1: // Right
                x = canvas.width;
                y = Math.random() * (canvas.height - size);
                velocityX = -speed;
                velocityY = (Math.random() - 0.5) * 2; // Random vertical movement
                break;
            case 2: // Bottom
                x = Math.random() * (canvas.width - size);
                y = canvas.height;
                velocityX = (Math.random() - 0.5) * 2; // Random horizontal movement
                velocityY = -speed;
                break;
            case 3: // Left
                x = -size;
                y = Math.random() * (canvas.height - size);
                velocityX = speed;
                velocityY = (Math.random() - 0.5) * 2; // Random vertical movement
                break;
        }
        
        // Random obstacle type
        const types = ['asteroid', 'satellite', 'ufo'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Random color based on type
        let color;
        switch(type) {
            case 'asteroid':
                color = '#9CA3AF'; // gray-400
                break;
            case 'satellite':
                color = '#60A5FA'; // blue-400
                break;
            case 'ufo':
                color = '#34D399'; // emerald-400
                break;
        }
        
        gameState.obstacles.push({
            x, y, size, velocityX, velocityY, color, type
        });
    }
}

// Generate power-ups
function generatePowerUps() {
    if (Math.random() < GAME_CONFIG.POWERUP_FREQUENCY) {
        const size = canvas.width * 0.04;
        const x = Math.random() * (canvas.width - size);
        const y = -size;
        
        // Random power-up type
        const types = ['shield', 'slowTime', 'extraPoints'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Color based on type
        let color;
        switch(type) {
            case 'shield':
                color = '#FBBF24'; // yellow-400
                break;
            case 'slowTime':
                color = '#A78BFA'; // purple-400
                break;
            case 'extraPoints':
                color = '#F87171'; // red-400
                break;
        }
        
        gameState.powerUps.push({
            x, y, size, 
            velocityY: GAME_CONFIG.OBSTACLE_MIN_SPEED * 0.7, // Slower than obstacles
            type, color
        });
    }
}

// Update obstacles position
function updateObstacles() {
    for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
        const obstacle = gameState.obstacles[i];
        
        // Apply velocity
        obstacle.x += obstacle.velocityX * (gameState.powerUpActive === 'slowTime' ? 0.5 : 1);
        obstacle.y += obstacle.velocityY * (gameState.powerUpActive === 'slowTime' ? 0.5 : 1);
        
        // Remove if out of bounds
        if (obstacle.x < -obstacle.size * 2 || 
            obstacle.x > canvas.width + obstacle.size * 2 || 
            obstacle.y < -obstacle.size * 2 || 
            obstacle.y > canvas.height + obstacle.size * 2) {
            gameState.obstacles.splice(i, 1);
            continue;
        }
        
        // Check collision with player
        if (!gameState.player.invulnerable && checkCollision(gameState.player, obstacle)) {
            if (gameState.powerUpActive === 'shield') {
                // Remove the obstacle but don't end game
                createExplosion(obstacle.x + obstacle.size/2, obstacle.y + obstacle.size/2, obstacle.color);
                gameState.obstacles.splice(i, 1);
                gameState.powerUpActive = null;
                gameState.powerUpTimeLeft = 0;
            } else {
                // Game over
                createExplosion(gameState.player.x + gameState.player.width/2, 
                               gameState.player.y + gameState.player.height/2, 
                               gameState.player.color);
                gameOver();
                return;
            }
        }
    }
}

// Update power-ups
function updatePowerUps() {
    // Update active power-up timer
    if (gameState.powerUpActive && gameState.powerUpTimeLeft > 0) {
        gameState.powerUpTimeLeft--;
        if (gameState.powerUpTimeLeft <= 0) {
            gameState.powerUpActive = null;
        }
    }
    
    // Update power-up positions
    for (let i = gameState.powerUps.length - 1; i >= 0; i--) {
        const powerUp = gameState.powerUps[i];
        
        // Apply velocity
        powerUp.y += powerUp.velocityY;
        
        // Remove if out of bounds
        if (powerUp.y > canvas.height + powerUp.size) {
            gameState.powerUps.splice(i, 1);
            continue;
        }
        
        // Check collision with player
        if (checkCollision(gameState.player, powerUp)) {
            // Apply power-up effect
            activatePowerUp(powerUp.type);
            
            // Create particles
            createExplosion(powerUp.x + powerUp.size/2, powerUp.y + powerUp.size/2, powerUp.color);
            
            // Remove power-up
            gameState.powerUps.splice(i, 1);
        }
    }
}

// Activate power-up effect
function activatePowerUp(type) {
    gameState.powerUpActive = type;
    gameState.powerUpTimeLeft = 300; // 5 seconds at 60 FPS
    
    switch(type) {
        case 'shield':
            gameState.player.invulnerable = true;
            break;
        case 'slowTime':
            // Effect applied in updateObstacles
            break;
        case 'extraPoints':
            gameState.score += 100;
            scoreDisplay.textContent = gameState.score;
            break;
    }
}

// Update particles
function updateParticles() {
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        const particle = gameState.particles[i];
        
        // Apply velocity
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
        
        // Reduce size/opacity
        particle.size *= 0.95;
        particle.opacity -= 0.02;
        
        // Remove if too small or transparent
        if (particle.size <= 1 || particle.opacity <= 0) {
            gameState.particles.splice(i, 1);
        }
    }
}

// Create explosion effect
function createExplosion(x, y, color) {
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        
        gameState.particles.push({
            x: x,
            y: y,
            size: Math.random() * 5 + 3,
            velocityX: Math.cos(angle) * speed,
            velocityY: Math.sin(angle) * speed,
            color: color,
            opacity: 1
        });
    }
}

// Check collision between two objects
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.size &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.size &&
           obj1.y + obj1.height > obj2.y;
}

// Draw player spaceship
function drawPlayer() {
    ctx.save();
    
    // Draw ship body
    ctx.fillStyle = gameState.player.color;
    ctx.beginPath();
    ctx.moveTo(gameState.player.x + gameState.player.width / 2, gameState.player.y);
    ctx.lineTo(gameState.player.x, gameState.player.y + gameState.player.height);
    ctx.lineTo(gameState.player.x + gameState.player.width, gameState.player.y + gameState.player.height);
    ctx.closePath();
    ctx.fill();
    
    // Draw engine flame
    if (gameState.isRunning) {
        ctx.fillStyle = '#F59E0B'; // amber-500
        ctx.beginPath();
        ctx.moveTo(gameState.player.x + gameState.player.width * 0.3, gameState.player.y + gameState.player.height);
        ctx.lineTo(gameState.player.x + gameState.player.width * 0.5, 
                  gameState.player.y + gameState.player.height + Math.random() * 10 + 5);
        ctx.lineTo(gameState.player.x + gameState.player.width * 0.7, gameState.player.y + gameState.player.height);
        ctx.closePath();
        ctx.fill();
    }
    
    // Draw shield if active
    if (gameState.powerUpActive === 'shield') {
        ctx.strokeStyle = '#FBBF24'; // yellow-400
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(gameState.player.x + gameState.player.width / 2, 
                gameState.player.y + gameState.player.height / 2, 
                gameState.player.width * 0.8, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    ctx.restore();
}

// Draw obstacles
function drawObstacles() {
    gameState.obstacles.forEach(obstacle => {
        ctx.save();
        ctx.fillStyle = obstacle.color;
        
        // Different shapes based on obstacle type
        switch(obstacle.type) {
            case 'asteroid':
                // Irregular polygon for asteroid
                ctx.beginPath();
                const vertices = 7;
                for (let i = 0; i < vertices; i++) {
                    const angle = (i / vertices) * Math.PI * 2;
                    const radius = obstacle.size * (0.7 + Math.random() * 0.3);
                    const x = obstacle.x + obstacle.size/2 + Math.cos(angle) * radius/2;
                    const y = obstacle.y + obstacle.size/2 + Math.sin(angle) * radius/2;
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'satellite':
                // Rectangle with solar panels
                ctx.fillRect(obstacle.x + obstacle.size*0.3, obstacle.y + obstacle.size*0.3, 
                           obstacle.size*0.4, obstacle.size*0.4);
                
                // Solar panels
                ctx.fillRect(obstacle.x, obstacle.y + obstacle.size*0.4, 
                           obstacle.size*0.2, obstacle.size*0.2);
                ctx.fillRect(obstacle.x + obstacle.size*0.8, obstacle.y + obstacle.size*0.4, 
                           obstacle.size*0.2, obstacle.size*0.2);
                break;
                
            case 'ufo':
                // UFO shape
                ctx.beginPath();
                ctx.ellipse(obstacle.x + obstacle.size/2, obstacle.y + obstacle.size*0.4, 
                          obstacle.size*0.5, obstacle.size*0.2, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Top dome
                ctx.beginPath();
                ctx.ellipse(obstacle.x + obstacle.size/2, obstacle.y + obstacle.size*0.3, 
                          obstacle.size*0.3, obstacle.size*0.3, 0, Math.PI, 0);
                ctx.fill();
                break;
        }
        
        ctx.restore();
    });
}

// Draw power-ups
function drawPowerUps() {
    gameState.powerUps.forEach(powerUp => {
        ctx.save();
        ctx.fillStyle = powerUp.color;
        
        // Different shapes based on power-up type
        switch(powerUp.type) {
            case 'shield':
                // Shield icon
                ctx.beginPath();
                ctx.arc(powerUp.x + powerUp.size/2, powerUp.y + powerUp.size/2, 
                        powerUp.size/2, 0, Math.PI * 2);
                ctx.fill();
                
                // Inner details
                ctx.strokeStyle = '#FEF3C7'; // yellow-100
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(powerUp.x + powerUp.size/2, powerUp.y + powerUp.size/2, 
                        powerUp.size/3, 0, Math.PI * 2);
                ctx.stroke();
                break;
                
            case 'slowTime':
                // Clock icon
                ctx.beginPath();
                ctx.arc(powerUp.x + powerUp.size/2, powerUp.y + powerUp.size/2, 
                        powerUp.size/2, 0, Math.PI * 2);
                ctx.fill();
                
                // Clock hands
                ctx.strokeStyle = '#EDE9FE'; // purple-100
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(powerUp.x + powerUp.size/2, powerUp.y + powerUp.size/2);
                ctx.lineTo(powerUp.x + powerUp.size/2, powerUp.y + powerUp.size/4);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(powerUp.x + powerUp.size/2, powerUp.y + powerUp.size/2);
                ctx.lineTo(powerUp.x + powerUp.size*0.7, powerUp.y + powerUp.size/2);
                ctx.stroke();
                break;
                
            case 'extraPoints':
                // Star icon
                const spikes = 5;
                const outerRadius = powerUp.size/2;
                const innerRadius = powerUp.size/4;
                
                ctx.beginPath();
                for (let i = 0; i < spikes * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (i / (spikes * 2)) * Math.PI * 2;
                    const x = powerUp.x + powerUp.size/2 + Math.cos(angle) * radius;
                    const y = powerUp.y + powerUp.size/2 + Math.sin(angle) * radius;
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.fill();
                break;
        }
        
        ctx.restore();
    });
}

// Draw particles
function drawParticles() {
    gameState.particles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

// Draw stars background
function drawStars() {
    // Create a starfield effect
    const numStars = 100;
    ctx.fillStyle = '#FFFFFF';
    
    for (let i = 0; i < numStars; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2;
        
        ctx.globalAlpha = Math.random() * 0.8 + 0.2;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.globalAlpha = 1;
}

// Draw power-up indicator
function drawPowerUpIndicator() {
    if (gameState.powerUpActive) {
        const width = 100;
        const height = 10;
        const x = canvas.width - width - 10;
        const y = 10;
        
        // Background
        ctx.fillStyle = '#1F2937'; // gray-800
        ctx.fillRect(x, y, width, height);
        
        // Progress bar
        let color;
        switch(gameState.powerUpActive) {
            case 'shield':
                color = '#FBBF24'; // yellow-400
                break;
            case 'slowTime':
                color = '#A78BFA'; // purple-400
                break;
            case 'extraPoints':
                color = '#F87171'; // red-400
                break;
        }
        
        const progress = gameState.powerUpTimeLeft / 300; // 300 frames = 5 seconds
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width * progress, height);
    }
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawStars();
    
    if (gameState.isRunning) {
        // Update game elements
        updatePlayer();
        generateObstacles();
        updateObstacles();
        generatePowerUps();
        updatePowerUps();
        updateParticles();
        
        // Increment score
        gameState.score += 1;
        scoreDisplay.textContent = gameState.score;
    }
    
    // Draw game elements
    drawParticles();
    drawPowerUps();
    drawObstacles();
    drawPlayer();
    drawPowerUpIndicator();
    
    // Continue game loop
    gameState.animationFrameId = requestAnimationFrame(gameLoop);
}

// Initialize the game when the page loads
window.addEventListener('load', initGame);