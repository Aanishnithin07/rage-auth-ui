// ===== VECTOR MATH =====
class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    add(v) { return new Vec2(this.x + v.x, this.y + v.y); }
    sub(v) { return new Vec2(this.x - v.x, this.y - v.y); }
    mul(s) { return new Vec2(this.x * s, this.y * s); }
    div(s) { return new Vec2(this.x / s, this.y / s); }
    len() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    norm() {
        const l = this.len();
        return l > 0 ? this.div(l) : new Vec2(0, 0);
    }
    limit(max) {
        return this.len() > max ? this.norm().mul(max) : this;
    }
}

// ===== AUDIO ENGINE =====
class Audio {
    constructor() {
        this.ctx = null;
        this.gain = null;
    }
    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.gain = this.ctx.createGain();
            this.gain.gain.value = 0.25;
            this.gain.connect(this.ctx.destination);
        } catch (e) { }
    }
    whoosh(vel) {
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120 + vel * 25, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.2, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(g);
        g.connect(this.gain);
        osc.start(now);
        osc.stop(now + 0.12);
    }
    buzz() {
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.linearRampToValueAtTime(70, now + 0.15);
        g.gain.setValueAtTime(0.3, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(g);
        g.connect(this.gain);
        osc.start(now);
        osc.stop(now + 0.15);
    }
    hit(intensity) {
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
        const vol = Math.min(intensity * 0.08, 0.4);
        g.gain.setValueAtTime(vol, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(g);
        g.connect(this.gain);
        osc.start(now);
        osc.stop(now + 0.08);
    }
}

// ===== TAUNT SYSTEM =====
class Taunt {
    constructor(el) {
        this.el = el;
        this.last = 0;
        this.cooldown = 1800;
        this.msgs = {
            slow: ["TOO SLOW", "WEAK ATTEMPT", "TRY HARDER", "YAWN"],
            med: ["CLOSE!", "ALMOST", "NOT QUITE", "GETTING WARMER"],
            fast: ["WHOA!", "CALM DOWN", "ANGRY?", "RAGE MODE"],
            miss: ["MISS!", "NOWHERE CLOSE", "PATHETIC", "L + RATIO"]
        };
    }
    show(cat) {
        if (Date.now() - this.last < this.cooldown) return;
        const arr = this.msgs[cat];
        this.el.textContent = arr[Math.floor(Math.random() * arr.length)];
        this.el.classList.add('show');
        this.last = Date.now();
        setTimeout(() => this.el.classList.remove('show'), 1600);
    }
    getCat(speed) {
        if (speed < 4) return 'slow';
        if (speed < 11) return 'med';
        return 'fast';
    }
}

// ===== CURSED PASSWORD =====
class Cursed {
    constructor(input) {
        this.input = input;
        this.colors = [
            'rgba(255, 0, 0, 0.15)',
            'rgba(0, 255, 255, 0.15)',
            'rgba(255, 0, 255, 0.15)',
            'rgba(255, 255, 0, 0.15)',
            'rgba(0, 255, 127, 0.15)',
            'rgba(255, 105, 180, 0.15)'
        ];
        this.input.addEventListener('input', () => this.change());
    }
    change() {
        const c = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.input.style.background = c;
        this.input.classList.add('cursed');
        setTimeout(() => this.input.classList.remove('cursed'), 300);
    }
}

// ===== PARTICLE SYSTEM =====
class Particle {
    constructor(x, y, c) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 12;
        this.vy = (Math.random() - 0.5) * 12 - 6;
        this.g = 0.35;
        this.f = 0.97;
        this.life = 1.0;
        this.decay = Math.random() * 0.012 + 0.006;
        this.size = Math.random() * 5 + 2;
        this.color = c;
    }
    update() {
        this.vy += this.g;
        this.vx *= this.f;
        this.vy *= this.f;
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
    dead() { return this.life <= 0; }
}

class Explosion {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.parts = [];
        this.aid = null;
    }
    explode(el) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particleCanvas';
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        const r = el.getBoundingClientRect();
        const colors = ['#E5E7EB', '#C0C0C0', '#6B7280', '#FFFFFF', '#D4D4D4'];
        
        for (let i = 0; i < 400; i++) {
            const x = r.left + Math.random() * r.width;
            const y = r.top + Math.random() * r.height;
            const c = colors[Math.floor(Math.random() * colors.length)];
            this.parts.push(new Particle(x, y, c));
        }
        
        el.style.opacity = '0';
        this.animate();
    }
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = this.parts.length - 1; i >= 0; i--) {
            const p = this.parts[i];
            p.update();
            p.draw(this.ctx);
            if (p.dead()) this.parts.splice(i, 1);
        }
        if (this.parts.length > 0) {
            this.aid = requestAnimationFrame(() => this.animate());
        } else {
            this.cleanup();
        }
    }
    cleanup() {
        if (this.aid) cancelAnimationFrame(this.aid);
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// ===== IMPOSSIBLE BUTTON =====
class ImpossibleBtn {
    constructor(btn, audio, taunt) {
        this.btn = btn;
        this.audio = audio;
        this.taunt = taunt;
        
        this.pos = new Vec2();
        this.vel = new Vec2();
        this.acc = new Vec2();
        
        this.radius = 450;
        this.force = 22;
        this.friction = 0.86;
        this.bounce = 0.95;
        this.maxVel = 75;
        
        this.w = 0;
        this.h = 0;
        this.mouse = new Vec2();
        this.prevMouse = new Vec2();
        this.mouseSpeed = 0;
        this.active = false;
        
        this.lastWhoosh = 0;
        this.whooshCD = 50;
        
        this.anticipation = 0.25;
        this.predictSteps = 8;
        
        this.init();
    }
    
    init() {
        const r = this.btn.getBoundingClientRect();
        this.w = r.width;
        this.h = r.height;
        
        this.pos = new Vec2(
            (window.innerWidth - this.w) / 2,
            (window.innerHeight - this.h) / 2
        );
        
        this.update();
        
        document.addEventListener('mousemove', (e) => {
            this.prevMouse = new Vec2(this.mouse.x, this.mouse.y);
            this.mouse = new Vec2(e.clientX, e.clientY);
            if (this.active) {
                const delta = this.mouse.sub(this.prevMouse);
                this.mouseSpeed = delta.len();
            }
            this.active = true;
        });
        
        window.addEventListener('resize', () => {
            this.pos.x = Math.min(this.pos.x, window.innerWidth - this.w);
            this.pos.y = Math.min(this.pos.y, window.innerHeight - this.h);
        });
        
        this.btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // TELEPORT TRICK: if they somehow get close, jump away
            const center = this.getCenter();
            const dist = center.sub(this.mouse).len();
            if (dist < 80) {
                const angle = Math.random() * Math.PI * 2;
                const jumpDist = 300;
                this.pos.x = this.mouse.x + Math.cos(angle) * jumpDist;
                this.pos.y = this.mouse.y + Math.sin(angle) * jumpDist;
                
                // Keep in bounds
                this.pos.x = Math.max(0, Math.min(this.pos.x, window.innerWidth - this.w));
                this.pos.y = Math.max(0, Math.min(this.pos.y, window.innerHeight - this.h));
                
                this.vel = new Vec2(
                    (Math.random() - 0.5) * 40,
                    (Math.random() - 0.5) * 40
                );
                this.audio.buzz();
                this.taunt.show('fast');
            }
        });
        
        this.loop();
        console.log('🚀 FULL-SCREEN IMPOSSIBLE BUTTON ACTIVE');
    }
    
    getCenter() {
        return new Vec2(this.pos.x + this.w / 2, this.pos.y + this.h / 2);
    }
    
    repel() {
        if (!this.active) return;
        const center = this.getCenter();
        
        // PREDICTION: anticipate where mouse is going
        const mouseDelta = this.mouse.sub(this.prevMouse);
        const predicted = this.mouse.add(mouseDelta.mul(this.predictSteps));
        
        // Repel from BOTH current AND predicted position
        const dist1 = center.sub(this.mouse);
        const mag1 = dist1.len();
        
        const dist2 = center.sub(predicted);
        const mag2 = dist2.len();
        
        // Primary repulsion from current mouse
        if (mag1 < this.radius && mag1 > 0) {
            const str = this.force * (1 - mag1 / this.radius) * (this.radius / mag1);
            const dir = dist1.norm();
            const f = dir.mul(str);
            this.acc = this.acc.add(f);
        }
        
        // Anticipatory repulsion from predicted position
        if (mag2 < this.radius * 0.7 && mag2 > 0) {
            const str = this.force * this.anticipation * (1 - mag2 / (this.radius * 0.7));
            const dir = dist2.norm();
            const f = dir.mul(str);
            this.acc = this.acc.add(f);
        }
        
        // BONUS PANIC MODE: if mouse is VERY close, add random juke
        if (mag1 < 150) {
            const panicAngle = Math.random() * Math.PI * 2;
            const juke = new Vec2(Math.cos(panicAngle), Math.sin(panicAngle));
            this.acc = this.acc.add(juke.mul(8));
        }
        
        // CORNER AWARENESS: detect if approaching corner and flee to center
        const center = this.getCenter();
        const toEdgeX = Math.min(center.x, window.innerWidth - center.x);
        const toEdgeY = Math.min(center.y, window.innerHeight - center.y);
        const nearEdge = toEdgeX < 200 || toEdgeY < 200;
        
        if (nearEdge && mag1 < 300) {
            const screenCenter = new Vec2(window.innerWidth / 2, window.innerHeight / 2);
            const toCenter = screenCenter.sub(center).norm();
            this.acc = this.acc.add(toCenter.mul(5));
        }
    }
    
    boundaries() {
        let hit = false;
        let intensity = 0;
        const margin = 60;
        const center = this.getCenter();
        const mouseDist = center.sub(this.mouse).len();
        
        // CORNER TRAP DETECTION
        const nearLeft = this.pos.x < margin;
        const nearRight = this.pos.x + this.w > window.innerWidth - margin;
        const nearTop = this.pos.y < margin;
        const nearBottom = this.pos.y + this.h > window.innerHeight - margin;
        
        const inCorner = (nearLeft || nearRight) && (nearTop || nearBottom);
        const trapped = inCorner && mouseDist < 350;
        
        // EMERGENCY ESCAPE: teleport if trapped in corner with mouse nearby
        if (trapped) {
            const safeZones = [];
            const padding = 150;
            
            // Calculate safe zones far from mouse
            const zones = [
                { x: padding, y: padding }, // top-left
                { x: window.innerWidth - this.w - padding, y: padding }, // top-right
                { x: padding, y: window.innerHeight - this.h - padding }, // bottom-left
                { x: window.innerWidth - this.w - padding, y: window.innerHeight - this.h - padding }, // bottom-right
                { x: window.innerWidth / 2 - this.w / 2, y: padding }, // top-center
                { x: window.innerWidth / 2 - this.w / 2, y: window.innerHeight - this.h - padding }, // bottom-center
                { x: padding, y: window.innerHeight / 2 - this.h / 2 }, // left-center
                { x: window.innerWidth - this.w - padding, y: window.innerHeight / 2 - this.h / 2 } // right-center
            ];
            
            zones.forEach(zone => {
                const zoneDist = Math.sqrt(
                    Math.pow(zone.x + this.w/2 - this.mouse.x, 2) + 
                    Math.pow(zone.y + this.h/2 - this.mouse.y, 2)
                );
                if (zoneDist > 400) {
                    safeZones.push({ ...zone, dist: zoneDist });
                }
            });
            
            if (safeZones.length > 0) {
                safeZones.sort((a, b) => b.dist - a.dist);
                const escape = safeZones[0];
                this.pos.x = escape.x;
                this.pos.y = escape.y;
                this.vel = new Vec2(
                    (Math.random() - 0.5) * 50,
                    (Math.random() - 0.5) * 50
                );
                this.audio.hit(15);
                this.taunt.show('fast');
                return;
            }
        }
        
        // SMART BOUNDARY: bounce with escape velocity away from danger
        if (this.pos.x < 0) {
            this.pos.x = 0;
            intensity = Math.abs(this.vel.x);
            this.vel.x = Math.abs(this.vel.x) * this.bounce + 20;
            if (this.mouse.x < window.innerWidth / 2) {
                this.vel.x += 25;
            }
            hit = true;
        }
        if (this.pos.x + this.w > window.innerWidth) {
            this.pos.x = window.innerWidth - this.w;
            intensity = Math.abs(this.vel.x);
            this.vel.x = -Math.abs(this.vel.x) * this.bounce - 20;
            if (this.mouse.x > window.innerWidth / 2) {
                this.vel.x -= 25;
            }
            hit = true;
        }
        if (this.pos.y < 0) {
            this.pos.y = 0;
            intensity = Math.max(intensity, Math.abs(this.vel.y));
            this.vel.y = Math.abs(this.vel.y) * this.bounce + 20;
            if (this.mouse.y < window.innerHeight / 2) {
                this.vel.y += 25;
            }
            hit = true;
        }
        if (this.pos.y + this.h > window.innerHeight) {
            this.pos.y = window.innerHeight - this.h;
            intensity = Math.max(intensity, Math.abs(this.vel.y));
            this.vel.y = -Math.abs(this.vel.y) * this.bounce - 20;
            if (this.mouse.y > window.innerHeight / 2) {
                this.vel.y -= 25;
            }
            hit = true;
        }
        
        if (hit) {
            this.audio.hit(intensity);
            this.btn.classList.add('collision');
            setTimeout(() => this.btn.classList.remove('collision'), 300);
            
            if (intensity > 10) {
                const w = document.querySelector('.main-wrapper');
                if (w) {
                    w.classList.add('shake');
                    setTimeout(() => w.classList.remove('shake'), 500);
                }
            }
        }
    }
    
    update() {
        this.btn.style.left = this.pos.x + 'px';
        this.btn.style.top = this.pos.y + 'px';
        this.btn.style.transform = 'none';
    }
    
    loop() {
        this.repel();
        
        // NEVER STOP MOVING: add constant drift to avoid stalling
        const center = this.getCenter();
        const mouseDist = center.sub(this.mouse).len();
        if (this.vel.len() < 8 && mouseDist < 500) {
            const driftAngle = Math.random() * Math.PI * 2;
            const drift = new Vec2(Math.cos(driftAngle), Math.sin(driftAngle));
            this.acc = this.acc.add(drift.mul(3));
        }
        
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.mul(this.friction);
        this.vel = this.vel.limit(this.maxVel);
        
        const speed = this.vel.len();
        const now = Date.now();
        if (speed > 4 && now - this.lastWhoosh > this.whooshCD) {
            this.audio.whoosh(speed);
            this.lastWhoosh = now;
            const cat = this.taunt.getCat(this.mouseSpeed);
            this.taunt.show(cat);
        }
        
        this.pos = this.pos.add(this.vel);
        this.boundaries();
        this.acc = new Vec2(0, 0);
        
        this.update();
        requestAnimationFrame(() => this.loop());
    }
}

// ===== PARTICLE BACKGROUND =====
function initBackground() {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
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
            
            ctx.fillStyle = 'rgba(192, 192, 192, 0.4)';
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

// ===== MISS EFFECT =====
function missEffect(x, y) {
    const ring = document.createElement('div');
    ring.style.position = 'fixed';
    ring.style.left = x + 'px';
    ring.style.top = y + 'px';
    ring.style.width = '50px';
    ring.style.height = '50px';
    ring.style.marginLeft = '-25px';
    ring.style.marginTop = '-25px';
    ring.style.border = '3px solid rgba(192, 192, 192, 0.8)';
    ring.style.borderRadius = '50%';
    ring.style.pointerEvents = 'none';
    ring.style.animation = 'missExpand 0.5s ease-out';
    ring.style.opacity = '0';
    ring.style.zIndex = '9998';
    document.body.appendChild(ring);
    setTimeout(() => document.body.removeChild(ring), 500);
}

const missAnim = document.createElement('style');
missAnim.textContent = `
    @keyframes missExpand {
        0% { transform: scale(0.5); opacity: 1; }
        100% { transform: scale(2.5); opacity: 0; }
    }
`;
document.head.appendChild(missAnim);

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    initBackground();
    
    const btn = document.getElementById('signInBtn');
    const tauntEl = document.getElementById('taunt');
    
    const audio = new Audio();
    const taunt = new Taunt(tauntEl);
    const impossible = new ImpossibleBtn(btn, audio, taunt);
    
    const pwd = document.getElementById('password');
    const cursed = new Cursed(pwd);
    
    document.addEventListener('click', (e) => {
        const r = btn.getBoundingClientRect();
        const hit = e.target === btn || btn.contains(e.target);
        
        if (!hit) {
            audio.buzz();
            taunt.show('miss');
            missEffect(e.clientX, e.clientY);
        }
    });
    
    const form = document.getElementById('authForm');
    let won = false;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (won) return;
        won = true;
        
        console.log('🎉 IMPOSSIBLE ACHIEVED!');
        
        audio.init();
        const now = audio.ctx.currentTime;
        const osc = audio.ctx.createOscillator();
        const g = audio.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.15);
        osc.frequency.setValueAtTime(783.99, now + 0.3);
        g.gain.setValueAtTime(0.25, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.connect(g);
        g.connect(audio.gain);
        osc.start(now);
        osc.stop(now + 0.6);
        
        tauntEl.classList.remove('show');
        
        setTimeout(() => {
            const exp = new Explosion();
            const panel = document.querySelector('.content-grid');
            exp.explode(panel);
            
            const vic = document.createElement('div');
            vic.className = 'victory';
            vic.innerHTML = '<h1>TASK FAILED SUCCESSFULLY</h1><p>You beat the impossible</p>';
            document.body.appendChild(vic);
            
            setTimeout(() => {
                console.log('%c🏆 VICTORY', 'font-size:24px;color:#C0C0C0;font-weight:bold');
                console.log('%cYou defeated the impossible button!', 'font-size:14px;color:#6B7280');
            }, 800);
        }, 80);
    });
    
    console.log('⚡ BLACK & SILVER IMPOSSIBLE LOGIN READY');
    console.log('🎯 Button roams ENTIRE SCREEN - Good luck!');
});
