// ============================================
// THE IMPOSSIBLE LOGIN - Physics Engine
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

class AntiGravityButton {
    constructor(buttonElement, containerElement) {
        this.button = buttonElement;
        this.container = containerElement;
        
        // Physics properties
        this.position = new Vector2D(0, 0);
        this.velocity = new Vector2D(0, 0);
        this.acceleration = new Vector2D(0, 0);
        
        // Physics constants
        this.mass = 1;
        this.repulsionRadius = 150; // Detection radius in pixels
        this.repulsionForce = 2.5; // Force multiplier
        this.friction = 0.92; // Velocity dampening
        this.bounceRestitution = 0.6; // Energy retained after bounce
        this.maxVelocity = 15; // Maximum speed
        
        // Dimensions
        this.width = 0;
        this.height = 0;
        this.containerBounds = null;
        
        // Mouse tracking
        this.mousePos = new Vector2D(0, 0);
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        // Get button dimensions
        const rect = this.button.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        
        // Set initial position (centered)
        this.updateContainerBounds();
        this.position = new Vector2D(
            (this.containerBounds.width - this.width) / 2,
            (this.containerBounds.height - this.height) / 2
        );
        
        this.updateButtonPosition();
        
        // Event listeners
        this.container.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.container.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
        this.container.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        
        // Prevent button from submitting when moving
        this.button.addEventListener('mousedown', (e) => {
            if (this.velocity.magnitude() > 0.5) {
                e.preventDefault();
            }
        });
        
        // Start animation loop
        this.animate();
        
        console.log('🎮 Anti-Gravity Physics Engine Initialized');
    }

    updateContainerBounds() {
        const rect = this.container.getBoundingClientRect();
        this.containerBounds = {
            width: rect.width,
            height: rect.height,
            left: rect.left,
            top: rect.top
        };
    }

    handleMouseMove(e) {
        // Calculate mouse position relative to container
        this.updateContainerBounds();
        this.mousePos = new Vector2D(
            e.clientX - this.containerBounds.left,
            e.clientY - this.containerBounds.top
        );
        this.isInitialized = true;
    }

    handleMouseEnter() {
        this.isInitialized = true;
    }

    handleMouseLeave() {
        // Gradually stop when mouse leaves
        this.velocity = this.velocity.multiply(0.8);
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

        // Left boundary
        if (this.position.x < 0) {
            this.position.x = 0;
            this.velocity.x *= -this.bounceRestitution;
            collided = true;
        }

        // Right boundary
        if (this.position.x + this.width > this.containerBounds.width) {
            this.position.x = this.containerBounds.width - this.width;
            this.velocity.x *= -this.bounceRestitution;
            collided = true;
        }

        // Top boundary
        if (this.position.y < 0) {
            this.position.y = 0;
            this.velocity.y *= -this.bounceRestitution;
            collided = true;
        }

        // Bottom boundary
        if (this.position.y + this.height > this.containerBounds.height) {
            this.position.y = this.containerBounds.height - this.height;
            this.velocity.y *= -this.bounceRestitution;
            collided = true;
        }

        return collided;
    }

    update() {
        // Apply repulsion force from mouse
        this.applyRepulsionForce();

        // Update velocity with acceleration
        this.velocity = this.velocity.add(this.acceleration);
        
        // Apply friction
        this.velocity = this.velocity.multiply(this.friction);
        
        // Limit maximum velocity
        this.velocity = this.velocity.limit(this.maxVelocity);
        
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
    
    // Initialize the anti-gravity physics
    const antiGravityButton = new AntiGravityButton(submitBtn, buttonContainer);
    
    // Form submission handler (for future phases)
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('🎯 Form submission attempted!');
        // Will add more logic in later phases
    });
    
    console.log('✨ The Impossible Login is ready!');
});
