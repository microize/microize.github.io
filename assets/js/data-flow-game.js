class DataFlowGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gameRunning = false;
        this.gameOver = false;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('dataFlowHighScore') || '0');
        
        // Game state
        this.speed = 2;
        this.frameCount = 0;
        
        // Player (data packet)
        this.player = {
            x: 50,
            y: 90,
            width: 16,
            height: 16,
            velocityY: 0,
            onGround: true,
            ducking: false
        };
        
        // Ground level
        this.groundY = 120;
        
        // Obstacles (errors)
        this.obstacles = [];
        this.obstacleSpawnRate = 0.015;
        this.lastObstacleX = 0;
        this.minObstacleDistance = 200;
        
        // Data particles (background effect)
        this.particles = [];
        
        this.initializeGame();
        this.bindEvents();
        this.updateUI();
    }
    
    initializeGame() {
        // Create initial particles
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.2,
                opacity: Math.random() * 0.3 + 0.1
            });
        }
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    
    handleKeyDown(e) {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            if (!this.gameRunning && !this.gameOver) {
                this.startGame();
            } else if (this.gameRunning && !this.gameOver) {
                this.jump();
            }
        } else if (e.code === 'KeyR' && this.gameOver) {
            this.resetGame();
        }
    }
    
    handleKeyUp(e) {
        // No key up events needed for simplified game
    }
    
    startGame() {
        this.gameRunning = true;
        this.gameOver = false;
        this.score = 0;
        this.speed = 2;
        this.obstacles = [];
        this.lastObstacleX = 0;
        this.player.y = this.groundY - this.player.height;
        this.player.velocityY = 0;
        this.player.onGround = true;
        this.frameCount = 0;
        
        document.getElementById('gameStatus').textContent = 'Data flowing...';
        this.gameLoop();
    }
    
    resetGame() {
        this.gameRunning = false;
        this.gameOver = false;
        document.getElementById('gameStatus').textContent = 'Press SPACE to start data flow';
    }
    
    jump() {
        if (this.player.onGround) {
            this.player.velocityY = -12;
            this.player.onGround = false;
        }
    }
    
    updatePlayer() {
        // Apply gravity
        this.player.velocityY += 0.4;
        this.player.y += this.player.velocityY;
        
        // Ground collision
        if (this.player.y >= this.groundY - this.player.height) {
            this.player.y = this.groundY - this.player.height;
            this.player.velocityY = 0;
            this.player.onGround = true;
        }
        
        // Keep player size consistent
        this.player.height = 16;
    }
    
    spawnObstacle() {
        const canSpawn = this.canvas.width - this.lastObstacleX >= this.minObstacleDistance;
        
        if (canSpawn && Math.random() < this.obstacleSpawnRate) {
            this.obstacles.push({
                x: this.canvas.width,
                y: this.groundY - 20,
                width: 12,
                height: 20,
                type: 'error'
            });
            this.lastObstacleX = this.canvas.width;
        }
    }
    
    updateObstacles() {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.x -= this.speed;
            
            // Update lastObstacleX as obstacles move
            if (i === this.obstacles.length - 1) {
                this.lastObstacleX = obstacle.x;
            }
            
            // Remove off-screen obstacles
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
                this.score += 10;
            }
        }
    }
    
    updateParticles() {
        for (const particle of this.particles) {
            particle.x -= particle.speed;
            
            // Reset particle when it goes off screen
            if (particle.x < -5) {
                particle.x = this.canvas.width + 5;
                particle.y = Math.random() * this.canvas.height;
            }
        }
    }
    
    checkCollisions() {
        const playerRect = {
            x: this.player.x,
            y: this.player.y,
            width: this.player.width,
            height: this.player.height
        };
        
        for (const obstacle of this.obstacles) {
            if (this.isColliding(playerRect, obstacle)) {
                this.endGame();
                break;
            }
        }
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    endGame() {
        this.gameRunning = false;
        this.gameOver = true;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('dataFlowHighScore', this.highScore.toString());
        }
        
        document.getElementById('gameStatus').textContent = `Data corrupted! Score: ${this.score} - Press R to restart`;
        this.updateUI();
    }
    
    updateUI() {
        document.getElementById('gameScore').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#f3f3f3';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw data particles
        this.drawParticles();
        
        // Draw ground line
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        this.ctx.lineTo(this.canvas.width, this.groundY);
        this.ctx.stroke();
        
        // Draw player (data packet)
        this.drawPlayer();
        
        // Draw obstacles
        this.drawObstacles();
        
        // Draw score during game
        if (this.gameRunning) {
            this.ctx.fillStyle = '#666';
            this.ctx.font = '12px Inter, sans-serif';
            this.ctx.fillText(`${this.score}`, 20, 25);
        }
    }
    
    drawParticles() {
        for (const particle of this.particles) {
            this.ctx.fillStyle = `rgba(255, 74, 0, ${particle.opacity})`;
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        }
    }
    
    drawPlayer() {
        // Player shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(this.player.x + 2, this.groundY, this.player.width, 2);
        
        // Player body (geometric data packet)
        this.ctx.fillStyle = '#ff4a00';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Player inner detail
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(this.player.x + 2, this.player.y + 2, this.player.width - 4, 2);
    }
    
    drawObstacles() {
        for (const obstacle of this.obstacles) {
            // Obstacle shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(obstacle.x + 2, this.groundY, obstacle.width, 2);
            
            // Obstacle body
            this.ctx.fillStyle = '#e63946';
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Obstacle detail
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.fillRect(obstacle.x + 1, obstacle.y + 1, obstacle.width - 2, 1);
        }
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.frameCount++;
        
        // Update game state
        this.updatePlayer();
        this.spawnObstacle();
        this.updateObstacles();
        this.updateParticles();
        this.checkCollisions();
        
        // Increase difficulty gradually
        if (this.frameCount % 1000 === 0) {
            this.speed += 0.2;
            this.obstacleSpawnRate += 0.001;
        }
        
        // Update score
        this.score += 1;
        this.updateUI();
        
        // Draw everything
        this.draw();
        
        // Continue game loop
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new DataFlowGame('dataFlowGame');
});