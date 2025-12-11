// ===== PARTICLE BACKGROUND =====
function initParticles() {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    for (let i = 0; i < 80; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            size: Math.random() * 2 + 0.5
        });
    }
    
    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            
            ctx.fillStyle = 'rgba(192, 192, 192, 0.3)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ===== AUDIO ENGINE =====
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.gain = null;
    }
    
    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.gain = this.ctx.createGain();
            this.gain.gain.value = 0.2;
            this.gain.connect(this.ctx.destination);
        } catch (e) {}
    }
    
    whoosh(velocity) {
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140 + velocity * 20, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.1);
        
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.15, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.connect(g);
        g.connect(this.gain);
        osc.start(now);
        osc.stop(now + 0.1);
    }
    
    buzz() {
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        g.gain.setValueAtTime(0.2, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        
        osc.connect(g);
        g.connect(this.gain);
        osc.start(now);
        osc.stop(now + 0.12);
    }
    
    collision(intensity) {
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);
        
        const vol = Math.min(intensity * 0.05, 0.3);
        g.gain.setValueAtTime(vol, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        osc.connect(g);
        g.connect(this.gain);
        osc.start(now);
        osc.stop(now + 0.08);
    }
}

// ===== TAUNT SYSTEM =====
class TauntSystem {
    constructor(el) {
        this.el = el;
        this.last = 0;
        this.cooldown = 1500;
        this.messages = {
            slow: ["TOO SLOW", "WEAK", "TRY HARDER", "YAWN"],
            fast: ["WHOA!", "ANGRY?", "CALM DOWN", "RAGE MODE"],
            miss: ["MISS!", "PATHETIC", "NOT EVEN CLOSE", "L"]
        };
    }
    
    show(type) {
        if (Date.now() - this.last < this.cooldown) return;
        const arr = this.messages[type];
        this.el.textContent = arr[Math.floor(Math.random() * arr.length)];
        this.el.classList.add('show');
        this.last = Date.now();
        setTimeout(() => this.el.classList.remove('show'), 1400);
    }
}

// ===== PARTICLE EXPLOSION =====
class Explosion {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
    }
    
    explode(x, y) {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '150000';
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        const colors = ['#E5E7EB', '#C0C0C0', '#9CA3AF', '#FFFFFF'];
        
        for (let i = 0; i < 300; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15 - 5,
                life: 1.0,
                decay: Math.random() * 0.015 + 0.008,
                size: Math.random() * 4 + 2,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
        
        this.animate();
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.vy += 0.3;
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            
            if (p.life > 0) {
                this.ctx.save();
                this.ctx.globalAlpha = p.life;
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(p.x, p.y, p.size, p.size);
                this.ctx.restore();
            } else {
                this.particles.splice(i, 1);
            }
        }
        
        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.animate());
        } else {
            document.body.removeChild(this.canvas);
        }
    }
}

// ===== IMPOSSIBLE BUTTON =====
class ImpossibleButton {
    constructor(btn, audio, taunt) {
        this.btn = btn;
        this.audio = audio;
        this.taunt = taunt;
        
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.w = 0;
        this.h = 0;
        
        this.mx = 0;
        this.my = 0;
        this.prevMx = 0;
        this.prevMy = 0;
        
        this.radius = 350;
        this.force = 18;
        this.friction = 0.86;
        this.maxSpeed = 60;
        
        this.lastWhoosh = 0;
        this.whooshCooldown = 80;
        
        this.init();
    }
    
    init() {
        // Get button size
        const rect = this.btn.getBoundingClientRect();
        this.w = rect.width;
        this.h = rect.height;
        
        // Start at right side of form area
        this.x = window.innerWidth / 2 + 150;
        this.y = window.innerHeight * 0.6;
        
        this.update();
        
        // Mouse tracking
        document.addEventListener('mousemove', (e) => {
            this.prevMx = this.mx;
            this.prevMy = this.my;
            this.mx = e.clientX;
            this.my = e.clientY;
        });
        
        // Start loop
        this.loop();
        
        console.log('✅ IMPOSSIBLE BUTTON ACTIVE - Try to catch it!');
    }
    
    getCenterX() { return this.x + this.w / 2; }
    getCenterY() { return this.y + this.h / 2; }
    
    loop() {
        // Calculate distance to mouse
        const cx = this.getCenterX();
        const cy = this.getCenterY();
        const dx = cx - this.mx;
        const dy = cy - this.my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Repulsion force
        if (dist < this.radius && dist > 0) {
            const str = this.force * (1 - dist / this.radius);
            const angle = Math.atan2(dy, dx);
            this.vx += Math.cos(angle) * str;
            this.vy += Math.sin(angle) * str;
            
            // Audio feedback
            const now = Date.now();
            if (now - this.lastWhoosh > this.whooshCooldown) {
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed > 3) {
                    this.audio.whoosh(speed);
                    this.lastWhoosh = now;
                    
                    const mouseSpeed = Math.sqrt(
                        Math.pow(this.mx - this.prevMx, 2) + 
                        Math.pow(this.my - this.prevMy, 2)
                    );
                    this.taunt.show(mouseSpeed > 10 ? 'fast' : 'slow');
                }
            }
        }
        
        // Panic mode - random juke if too close
        if (dist < 120) {
            const angle = Math.random() * Math.PI * 2;
            this.vx += Math.cos(angle) * 10;
            this.vy += Math.sin(angle) * 10;
        }
        
        // Corner escape - detect trap situation
        const nearEdge = (
            this.x < 100 || this.x > window.innerWidth - this.w - 100 ||
            this.y < 100 || this.y > window.innerHeight - this.h - 100
        );
        
        if (nearEdge && dist < 300) {
            // Pull toward center
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const toCenterX = centerX - cx;
            const toCenterY = centerY - cy;
            const toCenterDist = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);
            
            if (toCenterDist > 0) {
                this.vx += (toCenterX / toCenterDist) * 4;
                this.vy += (toCenterY / toCenterDist) * 4;
            }
        }
        
        // Apply physics
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }
        
        this.x += this.vx;
        this.y += this.vy;
        
        // Boundaries with bounce
        let collided = false;
        let intensity = 0;
        
        if (this.x < 0) {
            this.x = 0;
            intensity = Math.abs(this.vx);
            this.vx = Math.abs(this.vx) * 0.9 + (this.mx < window.innerWidth / 2 ? 20 : 0);
            collided = true;
        }
        if (this.x > window.innerWidth - this.w) {
            this.x = window.innerWidth - this.w;
            intensity = Math.abs(this.vx);
            this.vx = -Math.abs(this.vx) * 0.9 - (this.mx > window.innerWidth / 2 ? 20 : 0);
            collided = true;
        }
        if (this.y < 0) {
            this.y = 0;
            intensity = Math.max(intensity, Math.abs(this.vy));
            this.vy = Math.abs(this.vy) * 0.9 + (this.my < window.innerHeight / 2 ? 20 : 0);
            collided = true;
        }
        if (this.y > window.innerHeight - this.h) {
            this.y = window.innerHeight - this.h;
            intensity = Math.max(intensity, Math.abs(this.vy));
            this.vy = -Math.abs(this.vy) * 0.9 - (this.my > window.innerHeight / 2 ? 20 : 0);
            collided = true;
        }
        
        if (collided) {
            this.audio.collision(intensity);
            this.btn.classList.add('collision');
            setTimeout(() => this.btn.classList.remove('collision'), 300);
            
            if (intensity > 12) {
                const wrapper = document.querySelector('.main-wrapper');
                if (wrapper) {
                    wrapper.classList.add('shake');
                    setTimeout(() => wrapper.classList.remove('shake'), 500);
                }
            }
        }
        
        this.update();
        requestAnimationFrame(() => this.loop());
    }
    
    update() {
        this.btn.style.left = this.x + 'px';
        this.btn.style.top = this.y + 'px';
        this.btn.style.transform = 'none';
    }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    
    const btn = document.getElementById('signInBtn');
    const tauntEl = document.getElementById('taunt');
    
    const audio = new AudioEngine();
    const taunt = new TauntSystem(tauntEl);
    const impossible = new ImpossibleButton(btn, audio, taunt);
    
    // Miss effect
    document.addEventListener('click', (e) => {
        if (e.target !== btn && !btn.contains(e.target)) {
            audio.buzz();
            taunt.show('miss');
        }
    });
    
    // Cursed password
    const pwd = document.getElementById('password');
    const colors = ['rgba(255,0,0,0.1)', 'rgba(0,255,255,0.1)', 'rgba(255,0,255,0.1)', 'rgba(255,255,0,0.1)'];
    pwd.addEventListener('input', () => {
        pwd.style.background = colors[Math.floor(Math.random() * colors.length)];
    });
    
    // Victory
    const form = document.getElementById('authForm');
    let won = false;
    let enterPressCount = 0;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (won) return;
        
        // Check if button was actually clicked (not Enter key)
        const clickedButton = e.submitter === btn;
        
        if (!clickedButton) {
            // User tried to cheat with Enter key!
            enterPressCount++;
            audio.buzz();
            
            const cowardMessages = [
                "ARE YOU A COWARD? �",
                "TOO SCARED TO CLICK? 😏",
                "ENTER KEY? REALLY? 🤦",
                "PATHETIC! USE YOUR MOUSE! 🖱️",
                "CHICKEN MODE ACTIVATED 🐓",
                "GROW SOME COURAGE! 💪",
                "THAT'S NOT HOW THIS WORKS 😤",
                "CLICK THE BUTTON, COWARD! 🎯",
                "ENTER WON'T SAVE YOU 💀",
                "STOP BEING A WIMP! 😈",
                "YOU'RE BETTER THAN THIS... OR ARE YOU? 🤔",
                "99.9% QUIT. YOU'RE QUITTING TOO? 💩"
            ];
            
            const msg = enterPressCount > cowardMessages.length - 1 
                ? cowardMessages[cowardMessages.length - 1]
                : cowardMessages[enterPressCount - 1];
            
            tauntEl.textContent = msg;
            tauntEl.classList.add('show');
            setTimeout(() => tauntEl.classList.remove('show'), 2500);
            
            // Shake the wrapper to emphasize
            const wrapper = document.querySelector('.main-wrapper');
            if (wrapper) {
                wrapper.classList.add('shake');
                setTimeout(() => wrapper.classList.remove('shake'), 500);
            }
            
            console.log('🚫 NICE TRY! Click the button, coward.');
            return;
        }
        
        won = true;
        
        console.log('🎉 IMPOSSIBLE ACHIEVED!');
        
        // Victory sound
        audio.init();
        if (audio.ctx) {
            const now = audio.ctx.currentTime;
            const osc = audio.ctx.createOscillator();
            const g = audio.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.15);
            osc.frequency.setValueAtTime(783.99, now + 0.3);
            g.gain.setValueAtTime(0.2, now);
            g.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.connect(g);
            g.connect(audio.gain);
            osc.start(now);
            osc.stop(now + 0.5);
        }
        
        tauntEl.classList.remove('show');
        
        // Particle explosion at button center
        setTimeout(() => {
            const rect = btn.getBoundingClientRect();
            const exp = new Explosion();
            exp.explode(rect.left + rect.width/2, rect.top + rect.height/2);
            
            btn.style.opacity = '0';
            
            const victory = document.createElement('div');
            victory.className = 'victory';
            victory.innerHTML = '<h1>TASK FAILED SUCCESSFULLY</h1><p>You beat the impossible</p>';
            document.body.appendChild(victory);
        }, 100);
    });
    
    console.log('⚡ NEXUS IMPOSSIBLE LOGIN - READY');
});
