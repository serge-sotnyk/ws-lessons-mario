// Get the canvas and context
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const coinCountElement = document.getElementById('coin-count');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');

// Game state
let gameRunning = false;
let coinCount = 0;

// Constants
const GRAVITY = 0.5;
const FRICTION = 0.8;
const JUMP_FORCE = -13;

// Define game objects
class GameObject {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speedX = 0;
        this.speedY = 0;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
    }
    
    getBounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }
    
    intersects(other) {
        const bounds = this.getBounds();
        const otherBounds = other.getBounds();
        
        return bounds.left < otherBounds.right &&
               bounds.right > otherBounds.left &&
               bounds.top < otherBounds.bottom &&
               bounds.bottom > otherBounds.top;
    }
}

class Player extends GameObject {
    constructor(x, y) {
        super(x, y, 40, 60);
        this.jumping = false;
        this.grounded = false;
        this.direction = 1; // 1 for right, -1 for left
        this.frameX = 0;
        this.frameCount = 0;
        this.frameDelay = 5;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.emoji = '👨‍🔧'; // Mario emoji
    }
    
    update() {
        // Apply gravity
        if (!this.grounded) {
            this.speedY += GRAVITY;
        } else {
            this.speedY = 0;
        }
        
        // Apply friction
        this.speedX *= FRICTION;
        
        // Animation
        if (Math.abs(this.speedX) > 0.5) {
            this.frameCount++;
            if (this.frameCount >= this.frameDelay) {
                this.frameCount = 0;
                this.frameX = (this.frameX + 1) % 3; // 3 frames for running animation
            }
        } else {
            this.frameX = 0; // Standing frame
        }
        
        // Invulnerability timer
        if (this.invulnerable) {
            this.invulnerableTimer--;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
            }
        }
        
        // Set the sprite direction based on movement
        if (this.speedX > 0) this.direction = 1;
        if (this.speedX < 0) this.direction = -1;
        
        // Move the player
        super.update();
        
        // Reset grounded for next frame
        this.grounded = false;
    }
    
    draw() {
        // Flicker when invulnerable
        if (this.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
            return;
        }
        
        ctx.save();
        ctx.font = '40px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw with proper direction
        if (this.direction === -1) {
            ctx.scale(-1, 1);
            ctx.fillText(this.emoji, -this.x - this.width/2, this.y + this.height/2);
        } else {
            ctx.fillText(this.emoji, this.x + this.width/2, this.y + this.height/2);
        }
        
        ctx.restore();
    }
    
    jump() {
        if (this.grounded) {
            this.speedY = JUMP_FORCE;
            this.jumping = true;
            this.grounded = false;
        }
    }
    
    hit() {
        if (!this.invulnerable) {
            this.invulnerable = true;
            this.invulnerableTimer = 60; // Invulnerable for 60 frames
            
            // Bounce slightly
            this.speedY = -5;
            
            // Could implement lives system here
        }
    }
}

class Platform extends GameObject {
    constructor(x, y, width, height, type = 'normal') {
        super(x, y, width, height);
        this.type = type; // 'normal', 'moving', etc.
        this.originalX = x;
        this.originalY = y;
        this.moveDistance = 0;
        this.moveSpeed = 0;
        this.moveDirection = 1;
        
        if (type === 'moving-horizontal') {
            this.moveDistance = 100;
            this.moveSpeed = 1;
        } else if (type === 'moving-vertical') {
            this.moveDistance = 50;
            this.moveSpeed = 1;
        }
    }
    
    update() {
        if (this.type === 'moving-horizontal') {
            this.x += this.moveSpeed * this.moveDirection;
            if (Math.abs(this.x - this.originalX) >= this.moveDistance) {
                this.moveDirection *= -1;
            }
        } else if (this.type === 'moving-vertical') {
            this.y += this.moveSpeed * this.moveDirection;
            if (Math.abs(this.y - this.originalY) >= this.moveDistance) {
                this.moveDirection *= -1;
            }
        }
    }
    
    draw() {
        // Draw platform as a series of brick emojis
        ctx.save();
        ctx.font = '20px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
        
        const brickEmoji = '🧱';
        const grassEmoji = '🌱';
        const brickWidth = 20;
        
        // Draw grass on top
        for (let x = this.x; x < this.x + this.width; x += brickWidth) {
            ctx.fillText(grassEmoji, x + brickWidth/2, this.y + 10);
        }
        
        // Draw bricks
        for (let x = this.x; x < this.x + this.width; x += brickWidth) {
            for (let y = this.y + 15; y < this.y + this.height; y += brickWidth) {
                ctx.fillText(brickEmoji, x + brickWidth/2, y + brickWidth/2);
            }
        }
        
        ctx.restore();
    }
}

class Enemy extends GameObject {
    constructor(x, y, type = 'goomba') {
        super(x, y, 40, 40);
        this.type = type;
        this.speedX = -1; // Move left by default
        this.direction = -1;
        this.frameX = 0;
        this.frameCount = 0;
        this.frameDelay = 10;
        
        // Set emoji based on enemy type
        this.emoji = this.type === 'goomba' ? '👹' : '🐢';
    }
    
    update() {
        super.update();
        
        // Simple AI: change direction when hitting a wall
        if (this.x <= 0 || this.x + this.width >= canvas.width) {
            this.speedX *= -1;
            this.direction *= -1;
        }
        
        // Animation
        this.frameCount++;
        if (this.frameCount >= this.frameDelay) {
            this.frameCount = 0;
            this.frameX = (this.frameX + 1) % 2; // 2 frames for enemy animation
        }
    }
    
    draw() {
        ctx.save();
        ctx.font = '40px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw with proper direction
        if (this.direction === 1) {
            ctx.scale(-1, 1);
            ctx.fillText(this.emoji, -this.x - this.width/2, this.y + this.height/2);
        } else {
            ctx.fillText(this.emoji, this.x + this.width/2, this.y + this.height/2);
        }
        
        ctx.restore();
    }
}

class Coin extends GameObject {
    constructor(x, y) {
        super(x, y, 20, 20);
        this.frameX = 0;
        this.frameCount = 0;
        this.frameDelay = 8;
        this.collected = false;
        this.rotation = 0;
        this.emoji = '⭐';
    }
    
    update() {
        // Animation - rotate the coin
        this.frameCount++;
        if (this.frameCount >= this.frameDelay) {
            this.frameCount = 0;
            this.rotation += Math.PI / 8;
            if (this.rotation >= Math.PI * 2) {
                this.rotation = 0;
            }
        }
    }
    
    draw() {
        if (!this.collected) {
            ctx.save();
            ctx.translate(this.x + this.width/2, this.y + this.height/2);
            ctx.rotate(this.rotation);
            
            ctx.font = '20px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.emoji, 0, 0);
            
            ctx.restore();
        }
    }
}

// Game level
let levels = [
    {
        platforms: [
            // Ground platforms
            { x: 0, y: 450, width: 300, height: 50 },
            { x: 350, y: 450, width: 450, height: 50 },
            
            // Elevated platforms
            { x: 150, y: 350, width: 100, height: 20 },
            { x: 320, y: 300, width: 100, height: 20 },
            { x: 470, y: 250, width: 100, height: 20, type: 'moving-vertical' },
            { x: 600, y: 350, width: 100, height: 20 },
        ],
        enemies: [
            { x: 400, y: 410, type: 'goomba' },
            { x: 600, y: 410, type: 'goomba' },
            { x: 200, y: 310, type: 'koopa' }
        ],
        coins: [
            { x: 180, y: 320 },
            { x: 350, y: 270 },
            { x: 500, y: 220 },
            { x: 630, y: 320 },
            { x: 450, y: 420 },
            { x: 250, y: 420 },
            { x: 700, y: 420 }
        ]
    },
    {
        platforms: [
            // Ground platforms
            { x: 0, y: 450, width: 200, height: 50 },
            { x: 250, y: 450, width: 200, height: 50 },
            { x: 500, y: 450, width: 300, height: 50 },
            
            // Elevated platforms
            { x: 100, y: 350, width: 100, height: 20, type: 'moving-horizontal' },
            { x: 300, y: 300, width: 100, height: 20 },
            { x: 450, y: 250, width: 100, height: 20 },
            { x: 600, y: 200, width: 100, height: 20 },
        ],
        enemies: [
            { x: 300, y: 410, type: 'goomba' },
            { x: 550, y: 410, type: 'koopa' },
            { x: 700, y: 410, type: 'goomba' },
            { x: 350, y: 260, type: 'koopa' }
        ],
        coins: [
            { x: 150, y: 320 },
            { x: 350, y: 270 },
            { x: 500, y: 220 },
            { x: 650, y: 170 },
            { x: 300, y: 420 },
            { x: 550, y: 420 },
            { x: 700, y: 420 }
        ]
    }
];

// Create game objects
let currentLevel = 0;
let player = new Player(50, 385);
let platforms = [];
let enemies = [];
let coins = [];
let totalCoins = 0;
let levelComplete = false;
let levelCompleteTimer = 0;

// Controls
const keys = {
    ArrowRight: false,
    ArrowLeft: false,
    ArrowUp: false
};

// Initialize the level
function initLevel(levelIndex) {
    const level = levels[levelIndex];
    
    // Create platforms
    platforms = level.platforms.map(p => new Platform(p.x, p.y, p.width, p.height, p.type || 'normal'));
    
    // Create enemies
    enemies = level.enemies.map(e => new Enemy(e.x, e.y, e.type));
    
    // Create coins
    coins = level.coins.map(c => new Coin(c.x, c.y));
    
    // Reset player
    player.x = 50;
    player.y = 385;
    player.speedX = 0;
    player.speedY = 0;
    
    // Reset coin count and set total coins for this level
    coinCount = 0;
    totalCoins = level.coins.length;
    coinCountElement.textContent = coinCount + "/" + totalCoins;
    
    // Reset level complete flag
    levelComplete = false;
    levelCompleteTimer = 0;
}

// Check collisions
function checkCollisions() {
    // Check platform collisions
    platforms.forEach(platform => {
        const playerBounds = player.getBounds();
        const platformBounds = platform.getBounds();
        
        // Check if player is above the platform and falling
        if (player.speedY > 0 &&
            playerBounds.bottom >= platformBounds.top &&
            playerBounds.bottom <= platformBounds.top + player.speedY + 5 &&
            playerBounds.right > platformBounds.left &&
            playerBounds.left < platformBounds.right) {
            
            player.y = platformBounds.top - player.height;
            player.grounded = true;
            player.jumping = false;
            
            // If it's a moving platform, apply its movement to the player
            if (platform.type.includes('moving')) {
                if (platform.type === 'moving-horizontal') {
                    player.x += platform.moveSpeed * platform.moveDirection;
                }
            }
        }
        
        // Side collisions
        if (player.intersects(platform) && !player.grounded) {
            // Left collision
            if (player.speedX > 0 && playerBounds.right > platformBounds.left && playerBounds.right < platformBounds.left + player.speedX + 5) {
                player.x = platformBounds.left - player.width;
                player.speedX = 0;
            }
            // Right collision
            else if (player.speedX < 0 && playerBounds.left < platformBounds.right && playerBounds.left > platformBounds.right + player.speedX - 5) {
                player.x = platformBounds.right;
                player.speedX = 0;
            }
            // Top collision (hitting head)
            else if (player.speedY < 0 && playerBounds.top < platformBounds.bottom && playerBounds.top > platformBounds.bottom + player.speedY - 5) {
                player.y = platformBounds.bottom;
                player.speedY = 0;
            }
        }
    });
    
    // Check enemy collisions
    enemies.forEach(enemy => {
        if (player.intersects(enemy)) {
            const playerBounds = player.getBounds();
            const enemyBounds = enemy.getBounds();
            
            // If player is above the enemy and falling
            if (player.speedY > 0 && playerBounds.bottom >= enemyBounds.top && playerBounds.bottom <= enemyBounds.top + player.speedY + 10) {
                // Remove the enemy
                enemies = enemies.filter(e => e !== enemy);
                
                // Bounce the player
                player.speedY = -8;
            } else {
                // Player gets hit
                player.hit();
            }
        }
    });
    
    // Check coin collisions
    coins.forEach(coin => {
        if (!coin.collected && player.intersects(coin)) {
            coin.collected = true;
            coinCount++;
            coinCountElement.textContent = coinCount + "/" + totalCoins;
            
            // Check if all coins are collected
            if (coinCount >= totalCoins) {
                levelComplete = true;
                levelCompleteTimer = 120; // 2 seconds at 60 FPS
            }
        }
    });
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;
    
    // Clear the canvas
    ctx.fillStyle = '#6B8CFF'; // Sky blue background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Handle level complete
    if (levelComplete) {
        levelCompleteTimer--;
        
        // Display level complete message
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL ' + (currentLevel + 1) + ' COMPLETE!', canvas.width / 2, canvas.height / 2 - 20);
        
        if (currentLevel < levels.length - 1) {
            ctx.fillText('Get ready for next level...', canvas.width / 2, canvas.height / 2 + 20);
        } else {
            ctx.fillText('Congratulations! You completed all levels!', canvas.width / 2, canvas.height / 2 + 20);
        }
        
        if (levelCompleteTimer <= 0) {
            if (currentLevel < levels.length - 1) {
                // Move to next level
                currentLevel++;
                initLevel(currentLevel);
            } else {
                // Game complete - could reset to first level or show end screen
                currentLevel = 0;
                initLevel(currentLevel);
            }
        }
        
        // Continue the game loop
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Handle player input
    if (keys.ArrowRight) {
        player.speedX = 5;
    }
    if (keys.ArrowLeft) {
        player.speedX = -5;
    }
    if (keys.ArrowUp) {
        player.jump();
        keys.ArrowUp = false; // Prevent holding jump
    }
    
    // Update game objects
    player.update();
    platforms.forEach(platform => platform.update());
    enemies.forEach(enemy => enemy.update());
    coins.forEach(coin => coin.update());
    
    // Check for collisions
    checkCollisions();
    
    // Check boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y > canvas.height) {
        // Player fell off the screen, reset the level
        initLevel(currentLevel);
    }
    
    // Draw everything
    // Draw background elements first
    platforms.forEach(platform => platform.draw());
    coins.forEach(coin => coin.draw());
    enemies.forEach(enemy => enemy.draw());
    player.draw();
    
    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

// Event listeners
window.addEventListener('keydown', e => {
    if (e.key in keys) {
        keys[e.key] = true;
        e.preventDefault();
    }
});

window.addEventListener('keyup', e => {
    if (e.key in keys) {
        keys[e.key] = false;
        e.preventDefault();
    }
});

// Start game button
startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    gameRunning = true;
    initLevel(currentLevel);
    gameLoop();
});

// Initialize the game
window.onload = () => {
    // Draw the start screen once page is loaded
    ctx.fillStyle = '#6B8CFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};
