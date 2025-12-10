// ============================================
// THE IMPOSSIBLE LOGIN - Physics Engine
// ============================================

// ============================================
// Audio Engine - Procedural Sound Generation
// ============================================

class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.3; // Master volume
            this.masterGain.connect(this.audioContext.destination);
            this.initialized = true;
            console.log('🔊 Audio Engine Initialized');
        } catch (e) {
            console.warn('Audio API not supported:', e);
        }
    }

    playWhoosh(velocity) {
        if (!this.initialized) this.init();
        if (!this.initialized) return;

        const now = this.audioContext.currentTime;
        
        // Oscillator for the whoosh sound
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        // Map velocity to frequency (faster = higher pitch)
        const baseFrequency = 150;
        const frequency = baseFrequency + (velocity * 30);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, now);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, now + 0.1);
        
        // Filter for more organic sound
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.Q.setValueAtTime(1, now);
        
        // Quick fade in/out envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        // Connect the nodes
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        // Play
        oscillator.start(now);
        oscillator.stop(now + 0.15);
    }

    playError() {
        if (!this.initialized) this.init();
        if (!this.initialized) return;

        const now = this.audioContext.currentTime;
        
        // Create harsh error buzz
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(100, now);
        oscillator.frequency.linearRampToValueAtTime(80, now + 0.2);
        
        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.start(now);
        oscillator.stop(now + 0.2);
    }

    playCollision(intensity) {
        if (!this.initialized) this.init();
        if (!this.initialized) return;

        const now = this.audioContext.currentTime;
        
        // Impact sound
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        
        const volume = Math.min(intensity * 0.1, 0.5);
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }
}

// ============================================
// Taunt System - Psychological Warfare
// ============================================

class TauntSystem {
    constructor(element) {
        this.element = element;
        this.lastTaunt = 0;
        this.tauntCooldown = 2000; // 2 seconds between taunts
        
        this.taunts = {
            slow: [
                "Too slow! 🐌",
                "My grandma moves faster!",
                "Is that all you got?",
                "Yawn... 😴"
            ],
            medium: [
                "Nice try! 😏",
                "Almost had it!",
                "So close, yet so far...",
                "Getting warmer! 🔥"
            ],
            fast: [
                "Whoa, calm down! 😅",
                "Someone's getting angry!",
                "Feel the rage! 😈",
                "You mad bro?"
            ],
            miss: [
                "MISS! 🎯",
                "Not even close!",
                "Butterfingers! 👆",
                "Better luck next time!"
            ]
        };
    }

    show(category, mouseSpeed) {
        const now = Date.now();
        if (now - this.lastTaunt < this.tauntCooldown) return;
        
        const messages = this.taunts[category];
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        this.element.textContent = message;
        this.element.classList.add('show');
        
        this.lastTaunt = now;
        
        setTimeout(() => {
            this.element.classList.remove('show');
        }, 2000);
    }

    categorizeSpeed(speed) {
        if (speed < 5) return 'slow';
        if (speed < 12) return 'medium';
        return 'fast';
    }
}

// ============================================
// Cursed Password Field
// ============================================

class CursedPasswordField {
    constructor(inputElement) {
        this.input = inputElement;
        this.neonColors = [
            'rgba(0, 255, 255, 0.2)',
            'rgba(255, 0, 255, 0.2)',
            'rgba(255, 255, 0, 0.2)',
            'rgba(0, 255, 127, 0.2)',
            'rgba(255, 105, 180, 0.2)',
            'rgba(138, 43, 226, 0.2)',
            'rgba(0, 191, 255, 0.2)',
            'rgba(255, 20, 147, 0.2)'
        ];
        this.init();
    }

    init() {
        this.input.addEventListener('input', () => {
            this.randomizeColor();
        });
        
        this.input.addEventListener('focus', () => {
            console.log('😈 Password field activated - Cursed mode engaged!');
        });
    }

    randomizeColor() {
        const randomColor = this.neonColors[Math.floor(Math.random() * this.neonColors.length)];
        this.input.style.backgroundColor = randomColor;
        this.input.classList.add('cursed');
        
        setTimeout(() => {
            this.input.classList.remove('cursed');
        }, 300);
    }
}

// ============================================
// Particle Explosion System
// ============================================

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10 - 5; // Bias upward
        this.gravity = 0.3;
        this.friction = 0.98;
        this.life = 1.0;
        this.decay = Math.random() * 0.01 + 0.005;
        this.size = Math.random() * 4 + 2;
        this.color = color;
    }

    update() {
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

class ParticleExplosion {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particleCanvas';
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }

    explode(element) {
        if (!this.canvas) this.createCanvas();

        const rect = element.getBoundingClientRect();
        const particleCount = 300;

        // Sample colors from the element
        const colors = [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(0, 212, 255, 0.8)',
            'rgba(179, 102, 255, 0.8)',
            'rgba(255, 255, 255, 0.8)'
        ];

        // Create particles from the element's position
        for (let i = 0; i < particleCount; i++) {
            const x = rect.left + Math.random() * rect.width;
            const y = rect.top + Math.random() * rect.height;
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.particles.push(new Particle(x, y, color));
        }

        // Hide the original element
        element.style.opacity = '0';
        element.style.pointerEvents = 'none';

        // Start animation
        this.animate();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            particle.draw(this.ctx);

            if (particle.isDead()) {
                this.particles.splice(i, 1);
            }
        }

        // Continue animation if particles remain
        if (this.particles.length > 0) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            this.cleanup();
        }
    }

    cleanup() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
    }
}

// ============================================
// Vector Math
// ============================================

class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        return new Vector2D(this.x + vector.x, this.y + vector.y);
    }

    subtract(vector) {
        return new Vector2D(this.x - vector.x, this.y - vector.y);
    }

    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    divide(scalar) {
        return new Vector2D(this.x / scalar, this.y / scalar);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const mag = this.magnitude();
        return mag > 0 ? this.divide(mag) : new Vector2D(0, 0);
    }

    limit(max) {
        if (this.magnitude() > max) {
            return this.normalize().multiply(max);
        }
        return this;
    }
}

// ============================================
// Anti-Gravity Button Physics
// ============================================

class AntiGravityButton {
    constructor(buttonElement, audioEngine, tauntSystem) {
        this.button = buttonElement;
        this.audioEngine = audioEngine;
        this.tauntSystem = tauntSystem;
        
        // Physics properties
        this.position = new Vector2D(0, 0);
        this.velocity = new Vector2D(0, 0);
        this.acceleration = new Vector2D(0, 0);
        
        // Physics constants - MUCH MORE AGGRESSIVE
        this.mass = 1;
        this.repulsionRadius = 250; // LARGER detection radius
        this.repulsionForce = 4.5; // STRONGER force
        this.friction = 0.95; // Less friction = more slippery
        this.bounceRestitution = 0.75; // More bouncy
        this.maxVelocity = 25; // FASTER maximum speed
        
        // Dimensions
        this.width = 0;
        this.height = 0;
        this.screenBounds = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        // Mouse tracking
        this.mousePos = new Vector2D(0, 0);
        this.prevMousePos = new Vector2D(0, 0);
        this.mouseSpeed = 0;
        this.isInitialized = false;
        
        // Audio tracking
        this.lastWhooshTime = 0;
        this.whooshCooldown = 80; // More frequent sounds
        
        this.init();
    }

    init() {
        // Get button dimensions
        const rect = this.button.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        
        // Set initial position (center of screen)
        this.position = new Vector2D(
            (window.innerWidth - this.width) / 2,
            (window.innerHeight - this.height) / 2
        );
        
        this.updateButtonPosition();
        
        // Event listeners on ENTIRE DOCUMENT for full screen tracking
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Prevent button from submitting when moving fast
        this.button.addEventListener('mousedown', (e) => {
            if (this.velocity.magnitude() > 1) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
        
        // Start animation loop
        this.animate();
        
        console.log('🎮 Full-Screen Anti-Gravity Physics Engine Initialized');
        console.log('🌍 Button can now roam the ENTIRE screen!');
    }

    handleResize() {
        this.screenBounds = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        // Keep button within new bounds
        this.position.x = Math.min(this.position.x, this.screenBounds.width - this.width);
        this.position.y = Math.min(this.position.y, this.screenBounds.height - this.height);
    }

    handleMouseMove(e) {
        // Store previous mouse position
        this.prevMousePos = new Vector2D(this.mousePos.x, this.mousePos.y);
        
        // Calculate mouse position relative to viewport (entire screen)
        this.mousePos = new Vector2D(e.clientX, e.clientY);
        
        // Calculate mouse speed
        if (this.isInitialized) {
            const mouseDelta = this.mousePos.subtract(this.prevMousePos);
            this.mouseSpeed = mouseDelta.magnitude();
        }
        
        this.isInitialized = true;
    }

    getButtonCenter() {
        return new Vector2D(
            this.position.x + this.width / 2,
            this.position.y + this.height / 2
        );
    }

    applyRepulsionForce() {
        if (!this.isInitialized) return;

        const buttonCenter = this.getButtonCenter();
        const distance = buttonCenter.subtract(this.mousePos);
        const distanceMagnitude = distance.magnitude();

        // Only apply force if within repulsion radius
        if (distanceMagnitude < this.repulsionRadius && distanceMagnitude > 0) {
            // Calculate repulsion force (inverse square law modified for smoother feel)
            const forceMagnitude = this.repulsionForce * 
                (1 - distanceMagnitude / this.repulsionRadius) * 
                (this.repulsionRadius / distanceMagnitude);
            
            // Apply force in direction away from mouse
            const forceDirection = distance.normalize();
            const force = forceDirection.multiply(forceMagnitude);
            
            this.applyForce(force);
        }
    }

    applyForce(force) {
        // F = ma, so a = F/m
        const acceleration = force.divide(this.mass);
        this.acceleration = this.acceleration.add(acceleration);
    }

    checkBoundaryCollision() {
        let collided = false;
        let collisionIntensity = 0;

        // Left boundary
        if (this.position.x < 0) {
            this.position.x = 0;
            collisionIntensity = Math.abs(this.velocity.x);
    checkBoundaryCollision() {
        let collided = false;
        let collisionIntensity = 0;

        // Left boundary (screen edge)
        if (this.position.x < 0) {
            this.position.x = 0;
            collisionIntensity = Math.abs(this.velocity.x);
            this.velocity.x *= -this.bounceRestitution;
            collided = true;
        }

        // Right boundary (screen edge)
        if (this.position.x + this.width > this.screenBounds.width) {
            this.position.x = this.screenBounds.width - this.width;
            collisionIntensity = Math.abs(this.velocity.x);
            this.velocity.x *= -this.bounceRestitution;
            collided = true;
        }

        // Top boundary (screen edge)
        if (this.position.y < 0) {
            this.position.y = 0;
            collisionIntensity = Math.max(collisionIntensity, Math.abs(this.velocity.y));
            this.velocity.y *= -this.bounceRestitution;
            collided = true;
        }

        // Bottom boundary (screen edge)
        if (this.position.y + this.height > this.screenBounds.height) {
            this.position.y = this.screenBounds.height - this.height;
            collisionIntensity = Math.max(collisionIntensity, Math.abs(this.velocity.y));
            this.velocity.y *= -this.bounceRestitution;
            collided = true;
        }

        // Handle collision effects
        if (collided) {
            this.onCollision(collisionIntensity);
        }

        return collided;
    }

    onCollision(intensity) {
        // Play collision sound
        this.audioEngine.playCollision(intensity);
        
        // Visual feedback - flash effect
        this.button.classList.add('collision');
        setTimeout(() => {
            this.button.classList.remove('collision');
        }, 300);
        
        // Screen shake if strong collision
        if (intensity > 8) {
            const appContainer = document.querySelector('.app-container');
            if (appContainer) {
                appContainer.classList.add('shake');
                setTimeout(() => {
                    appContainer.classList.remove('shake');
                }, 500);
            }
        }
    }   
        // Apply friction
        this.velocity = this.velocity.multiply(this.friction);
        
        // Limit maximum velocity
        this.velocity = this.velocity.limit(this.maxVelocity);
        
        // Play whoosh sound based on velocity
        const speed = this.velocity.magnitude();
        const now = Date.now();
        if (speed > 3 && now - this.lastWhooshTime > this.whooshCooldown) {
            this.audioEngine.playWhoosh(speed);
            this.lastWhooshTime = now;
            
            // Show taunt based on mouse speed
            const tauntCategory = this.tauntSystem.categorizeSpeed(this.mouseSpeed);
            this.tauntSystem.show(tauntCategory, this.mouseSpeed);
        }
        
        // Update position with velocity
        this.position = this.position.add(this.velocity);
        
        // Check and handle boundary collisions
        this.checkBoundaryCollision();
        
        // Reset acceleration for next frame
        this.acceleration = new Vector2D(0, 0);
        
        // Stop very slow movement (performance optimization)
        if (this.velocity.magnitude() < 0.1 && !this.isInitialized) {
            this.velocity = new Vector2D(0, 0);
        }
    }

    updateButtonPosition() {
        // Use transform for better performance (GPU accelerated)
        this.button.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
    }

    animate() {
        this.update();
        this.updateButtonPosition();
        
        // Continue animation loop
        requestAnimationFrame(() => this.animate());
    }
}

// ============================================
// Initialize on DOM Load
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const submitBtn = document.getElementById('submitBtn');
    const buttonContainer = document.getElementById('buttonContainer');
    const tauntElement = document.getElementById('tauntMessage');
    
    // Initialize systems
document.addEventListener('DOMContentLoaded', () => {
    const submitBtn = document.getElementById('submitBtn');
    const tauntElement = document.getElementById('tauntMessage');
    
    // Initialize systems
    const audioEngine = new AudioEngine();
    const tauntSystem = new TauntSystem(tauntElement);
    
    // Initialize the anti-gravity physics - NOW FULL SCREEN!
    const antiGravityButton = new AntiGravityButton(
        submitBtn,
        audioEngine, 
        tauntSystem
    );
    
    // Initialize cursed password field
    const passwordField = document.getElementById('password');
    const cursedPassword = new CursedPasswordField(passwordField);
    
    // Handle missed clicks ANYWHERE on screen
    document.addEventListener('click', (e) => {
        // Check if click missed the button
        const buttonRect = submitBtn.getBoundingClientRect();
        const clickedButton = e.target === submitBtn || submitBtn.contains(e.target);
        
        if (!clickedButton) {
            audioEngine.playError();
    // Form submission handler - WIN CONDITION
    const form = document.getElementById('loginForm');
    const authPanel = document.querySelector('.auth-panel');
    let hasWon = false;ffect(e.clientX, e.clientY, document.body);
        }
    });
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (hasWon) return;
        hasWon = true;
        
        console.log('🎯 IMPOSSIBLE! They actually clicked it!');
        console.log('💥 Initiating destruction sequence...');
        
        // Play victory sound
        audioEngine.init();
        const now = audioEngine.audioContext.currentTime;
        
        // Victory fanfare
        const oscillator = audioEngine.audioContext.createOscillator();
        const gainNode = audioEngine.audioContext.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(523.25, now); // C
        oscillator.frequency.setValueAtTime(659.25, now + 0.2); // E
        oscillator.frequency.setValueAtTime(783.99, now + 0.4); // G
        
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioEngine.masterGain);
        
        oscillator.start(now);
        oscillator.stop(now + 0.8);
        
        // Hide taunt message
        tauntElement.classList.remove('show');
        // Explode the form
        setTimeout(() => {
            const particleExplosion = new ParticleExplosion();
            particleExplosion.explode(authPanel);eExplosion();
            particleExplosion.explode(loginCard);
            
            // Show victory message
            const victoryDiv = document.createElement('div');
            victoryDiv.className = 'victory-message';
            victoryDiv.innerHTML = `
                <div>Task Failed Successfully</div>
                <div class="subtitle-victory">You beat the impossible... or did you? 🤔</div>
            `;
            document.body.appendChild(victoryDiv);
            
            // Easter egg console message
            setTimeout(() => {
                console.log('%c🎊 CONGRATULATIONS! 🎊', 'font-size: 20px; color: #667eea; font-weight: bold;');
                console.log('%cYou have defeated The Impossible Login!', 'font-size: 14px; color: #b366ff;');
                console.log('%cBut at what cost? Your sanity? 😈', 'font-size: 12px; color: #ff3b30;');
            }, 1000);
        }, 100);
    });
    
    console.log('✨ The Impossible Login is fully armed!');
    console.log('🔊 Audio Engine loaded');
    console.log('💬 Taunt System active');
    console.log('😈 Cursed Password Field engaged');
    console.log('💥 Particle Explosion System ready');
});

// ============================================
// Visual Effects
// ============================================

function createMissEffect(x, y, container) {
    const missIndicator = document.createElement('div');
    missIndicator.style.position = 'absolute';
    missIndicator.style.left = x + 'px';
    missIndicator.style.top = y + 'px';
    missIndicator.style.width = '40px';
    missIndicator.style.height = '40px';
    missIndicator.style.marginLeft = '-20px';
    missIndicator.style.marginTop = '-20px';
    missIndicator.style.border = '3px solid rgba(255, 59, 48, 0.8)';
    missIndicator.style.borderRadius = '50%';
    missIndicator.style.pointerEvents = 'none';
    missIndicator.style.animation = 'missExpand 0.5s ease-out';
    missIndicator.style.opacity = '0';
    
    container.appendChild(missIndicator);
    
    setTimeout(() => {
        container.removeChild(missIndicator);
    }, 500);
}

// Add miss effect animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes missExpand {
        0% {
            transform: scale(0.5);
            opacity: 1;
        }
        100% {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
