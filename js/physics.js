/**
 * ANTI-GRAVITY NEON PHYSICS ENGINE
 * Developed for ANIKETBHAI PANARA - Turing Enigma Batch
 * 
 * Features:
 * - Real-time zero-gravity particle upward buoyancy simulation
 * - Fluid-dynamics repulsion and curl bending around cursor
 * - Spatial grid proximity connections (neural constellation)
 * - Click-induced acoustic gravitational shockwaves
 * - Dynamic color palettes and interactive gravity-field modes
 */

class AntiGravityEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error(`Canvas with id ${canvasId} not found.`);
      return;
    }
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    
    // Performance & configuration
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.particles = [];
    this.shockwaves = [];
    
    // Default system parameters
    this.params = {
      particleCount: 1200,
      baseUpwardSpeed: 0.85,
      friction: 0.94,
      repulsionRadius: 180,
      repulsionStrength: 18,
      dragMultiplier: 2.2,
      curlStrength: 7.5,
      maxSpeed: 24,
      connectionDistance: 65,
      maxConnectionsPerParticle: 3,
      gravityMode: 'zero-g', // 'zero-g', 'black-hole', 'supernova', 'repulsion-field'
      theme: 'cyber-neon' // 'cyber-neon', 'quantum-cyan', 'electric-violet', 'emerald-matrix'
    };

    // Color themes
    this.themes = {
      'cyber-neon': {
        background: '#04050d',
        particleColors: [
          '#00f0ff', // Cyber Cyan
          '#b026ff', // Neon Purple
          '#ff007f', // Electric Pink
          '#3b82f6', // Cobalt
          '#ffffff'  // Photon White
        ],
        lineColor: 'rgba(0, 240, 255, ',
        accentGlow: '#00f0ff'
      },
      'quantum-cyan': {
        background: '#020b14',
        particleColors: ['#00ffff', '#38bdf8', '#0284c7', '#67e8f9', '#ffffff'],
        lineColor: 'rgba(56, 189, 248, ',
        accentGlow: '#38bdf8'
      },
      'electric-violet': {
        background: '#090414',
        particleColors: ['#c084fc', '#a855f7', '#7c3aed', '#e879f9', '#ffffff'],
        lineColor: 'rgba(192, 132, 252, ',
        accentGlow: '#c084fc'
      },
      'emerald-matrix': {
        background: '#020d07',
        particleColors: ['#10b981', '#34d399', '#059669', '#6ee7b7', '#ffffff'],
        lineColor: 'rgba(52, 211, 153, ',
        accentGlow: '#34d399'
      }
    };

    // Mouse & Pointer tracking
    this.mouse = {
      x: -9999,
      y: -9999,
      prevX: -9999,
      prevY: -9999,
      vx: 0,
      vy: 0,
      speed: 0,
      isHovering: false,
      isDragging: false,
      lastActive: Date.now()
    };

    // Performance monitoring
    this.fps = 60;
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();
    this.lastTime = performance.now();
    this.isRunning = false;

    // Sprite caches for zero-draw-call particle rendering
    this.spriteCaches = new Map();

    this.init();
  }

  init() {
    this.resize();
    this.prebuildSprites();
    this.spawnParticles();
    this.bindEvents();
    this.start();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(this.dpr, this.dpr);

    // Responsive particle count adjustments
    if (this.width < 768) {
      this.params.particleCount = 650;
    } else if (this.width < 1440) {
      this.params.particleCount = 1100;
    } else {
      this.params.particleCount = 1500;
    }
  }

  prebuildSprites() {
    // Generate off-screen cached glowing discs for ultra-high FPS rendering
    const currentTheme = this.themes[this.params.theme];
    this.spriteCaches.clear();

    currentTheme.particleColors.forEach(color => {
      const sizes = [2, 3, 4, 6];
      sizes.forEach(size => {
        const sprite = document.createElement('canvas');
        const diameter = size * 8;
        sprite.width = diameter;
        sprite.height = diameter;
        const sCtx = sprite.getContext('2d');
        const center = diameter / 2;

        const gradient = sCtx.createRadialGradient(center, center, 0, center, center, center);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.35, color);
        gradient.addColorStop(0.7, this.hexToRgba(color, 0.4));
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        sCtx.fillStyle = gradient;
        sCtx.beginPath();
        sCtx.arc(center, center, center, 0, Math.PI * 2);
        sCtx.fill();

        this.spriteCaches.set(`${color}_${size}`, {
          canvas: sprite,
          offset: center
        });
      });
    });
  }

  hexToRgba(hex, alpha) {
    if (hex === '#ffffff') return `rgba(255, 255, 255, ${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 240;
    const b = parseInt(hex.slice(5, 7), 16) || 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  spawnParticles() {
    this.particles = [];
    const count = this.params.particleCount;
    const theme = this.themes[this.params.theme];
    const colors = theme.particleColors;

    for (let i = 0; i < count; i++) {
      const depth = 0.2 + Math.random() * 0.8; // 3D depth layer: 0.2 to 1.0
      const radius = (0.9 + Math.random() * 2.2) * depth;
      const discreteSize = radius < 1.4 ? 2 : (radius < 2.2 ? 3 : (radius < 3.0 ? 4 : 6));
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height + 100),
        z: depth,
        radius: radius,
        discreteSize: discreteSize,
        color: color,
        alpha: 0.25 + depth * 0.65,
        baseAlpha: 0.25 + depth * 0.65,
        
        // Anti-gravity velocities
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(this.params.baseUpwardSpeed * (0.5 + depth * 0.8) + Math.random() * 0.4),
        baseVy: -(this.params.baseUpwardSpeed * (0.5 + depth * 0.8) + Math.random() * 0.4),
        
        // Zero-G buoyant sinusoidal drift
        oscillationSpeed: 0.008 + Math.random() * 0.018,
        oscillationAmplitude: 0.35 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
        
        // Dynamics
        originalX: 0,
        energy: 0
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.prebuildSprites();
      this.spawnParticles();
    });

    // Pointer move
    const updatePointer = (clientX, clientY) => {
      const now = Date.now();
      const dt = Math.max((now - this.mouse.lastActive) / 1000, 0.001);
      
      const newX = clientX;
      const newY = clientY;

      if (this.mouse.prevX !== -9999) {
        this.mouse.vx = (newX - this.mouse.prevX) / (dt * 60);
        this.mouse.vy = (newY - this.mouse.prevY) / (dt * 60);
        this.mouse.speed = Math.sqrt(this.mouse.vx * this.mouse.vx + this.mouse.vy * this.mouse.vy);
      }

      this.mouse.prevX = newX;
      this.mouse.prevY = newY;
      this.mouse.x = newX;
      this.mouse.y = newY;
      this.mouse.isHovering = true;
      this.mouse.lastActive = now;
    };

    window.addEventListener('mousemove', (e) => {
      updatePointer(e.clientX, e.clientY);
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.mouse.isDragging = true;
        this.triggerShockwave(e.clientX, e.clientY, 1.6);
      }
    });

    window.addEventListener('mouseup', () => {
      this.mouse.isDragging = false;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.isHovering = false;
      this.mouse.isDragging = false;
      this.mouse.x = -9999;
      this.mouse.y = -9999;
      this.mouse.vx = 0;
      this.mouse.vy = 0;
    });

    // Touch support for mobile / tablets
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updatePointer(touch.clientX, touch.clientY);
        this.mouse.isDragging = true;
        this.triggerShockwave(touch.clientX, touch.clientY, 1.2);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updatePointer(touch.clientX, touch.clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.mouse.isDragging = false;
      this.mouse.isHovering = false;
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    });
  }

  triggerShockwave(x, y, power = 1.0) {
    this.shockwaves.push({
      x: x,
      y: y,
      radius: 5,
      maxRadius: Math.max(this.width, this.height) * 0.38,
      speed: 14 * power,
      strength: 32 * power,
      alpha: 0.9,
      decay: 0.024
    });

    // Audio effect hook if available
    if (window.soundFX && window.soundFX.playShockwave) {
      window.soundFX.playShockwave();
    }
  }

  setTheme(themeName) {
    if (this.themes[themeName]) {
      this.params.theme = themeName;
      this.prebuildSprites();
      this.spawnParticles();
    }
  }

  setGravityMode(mode) {
    this.params.gravityMode = mode;
  }

  setParticleCount(count) {
    this.params.particleCount = count;
    this.spawnParticles();
  }

  updatePhysics(time) {
    const mouse = this.mouse;
    const isInteracting = mouse.isHovering && mouse.x > 0;
    const effectiveRadius = this.params.repulsionRadius * (mouse.isDragging ? 1.45 : 1.0);
    const effectiveStrength = this.params.repulsionStrength * (mouse.isDragging ? this.params.dragMultiplier : 1.0);
    const curlStrength = this.params.curlStrength * (mouse.isDragging ? 1.5 : 1.0);
    const friction = this.params.friction;

    // Decay mouse velocity gradually if stationary
    mouse.vx *= 0.88;
    mouse.vy *= 0.88;

    // Update Shockwaves
    for (let s = this.shockwaves.length - 1; s >= 0; s--) {
      const sw = this.shockwaves[s];
      sw.radius += sw.speed;
      sw.alpha -= sw.decay;
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(s, 1);
      }
    }

    // Process all particles
    const particleCount = this.particles.length;
    for (let i = 0; i < particleCount; i++) {
      const p = this.particles[i];

      // Anti-gravity sinusoidal gentle wave drift
      p.phase += p.oscillationSpeed;
      const waveOffset = Math.sin(p.phase) * p.oscillationAmplitude;

      // Mouse interactive physics
      if (isInteracting) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distSq = dx * dx + dy * dy;
        const r = Math.sqrt(distSq);

        if (r < effectiveRadius && r > 0.001) {
          // Normalized vector
          const nx = dx / r;
          const ny = dy / r;

          // Smooth cubic falloff curve for repulsion
          const t = 1 - (r / effectiveRadius);
          const falloff = t * t * (3 - 2 * t); // Smoothstep curve

          if (this.params.gravityMode === 'zero-g' || this.params.gravityMode === 'repulsion-field') {
            // Push outwards away from cursor
            const force = falloff * effectiveStrength * p.z;
            p.vx += nx * force;
            p.vy += ny * force;

            // Bending & Fluid Curl force:
            // Tangential vector creates fluid-like vortices and aerodynamic bending around mouse
            const tx = -ny;
            const ty = nx;
            const mouseDotTangent = mouse.vx * tx + mouse.vy * ty;
            const curlImpulse = (mouseDotTangent * 0.15 + curlStrength * 0.25) * falloff * p.z;
            
            p.vx += tx * curlImpulse;
            p.vy += ty * curlImpulse;

            p.energy = Math.min(p.energy + falloff * 0.8, 1.0);
          } else if (this.params.gravityMode === 'black-hole') {
            // Inverted gravity: pull inward into singularity with rotational spin
            const pullForce = falloff * (effectiveStrength * 0.85);
            p.vx -= nx * pullForce;
            p.vy -= ny * pullForce;

            // Gravitational vortex swirl
            const tx = -ny;
            const ty = nx;
            p.vx += tx * (pullForce * 0.6);
            p.vy += ty * (pullForce * 0.6);
          }
        }
      }

      // Gravitational Shockwaves impact
      for (let s = 0; s < this.shockwaves.length; s++) {
        const sw = this.shockwaves[s];
        const dx = p.x - sw.x;
        const dy = p.y - sw.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const waveDist = Math.abs(dist - sw.radius);

        if (waveDist < 45 && dist > 1) {
          const waveForce = (1 - waveDist / 45) * sw.alpha * (sw.strength * 0.6) * p.z;
          p.vx += (dx / dist) * waveForce;
          p.vy += (dy / dist) * waveForce;
          p.energy = 1.0;
        }
      }

      // Damping / Friction application
      p.vx = (p.vx + waveOffset * 0.1) * friction;
      
      // Upward Anti-Gravity buoyancy restoration
      let targetVy = p.baseVy;
      if (this.params.gravityMode === 'supernova') {
        targetVy = p.baseVy * 2.5; // Accelerate upward into hyperdrive
      }
      p.vy = p.vy * friction + targetVy * (1 - friction);

      // Clamp max velocity for physics stability
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > this.params.maxSpeed) {
        p.vx = (p.vx / speed) * this.params.maxSpeed;
        p.vy = (p.vy / speed) * this.params.maxSpeed;
      }

      // Update positions
      p.x += p.vx;
      p.y += p.vy;

      // Energy dissipation
      p.energy *= 0.96;

      // Anti-gravity screen bounds wrap (floating upwards)
      if (p.y < -30) {
        p.y = this.height + 25 + Math.random() * 20;
        p.x = Math.random() * this.width;
        p.vx = (Math.random() - 0.5) * 0.5;
        p.vy = p.baseVy;
      } else if (p.y > this.height + 50) {
        p.y = -20;
      }

      if (p.x < -30) {
        p.x = this.width + 20;
      } else if (p.x > this.width + 30) {
        p.x = -20;
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    const theme = this.themes[this.params.theme];
    
    // Clear with dark neon backdrop & subtle motion trail
    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw active shockwave ripples
    for (let s = 0; s < this.shockwaves.length; s++) {
      const sw = this.shockwaves[s];
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = this.hexToRgba(theme.accentGlow, sw.alpha * 0.6);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sw.x, sw.y, Math.max(0, sw.radius - 8), 0, Math.PI * 2);
      ctx.lineWidth = 1;
      ctx.strokeStyle = this.hexToRgba('#ffffff', sw.alpha * 0.3);
      ctx.stroke();
    }

    // Draw Neural Constellation connections (optimized sample of foreground particles)
    const connDist = this.params.connectionDistance;
    const connDistSq = connDist * connDist;
    const particleCount = this.particles.length;
    const sampleStep = this.width < 768 ? 4 : 2; // Performance throttle on smaller devices

    ctx.lineWidth = 0.8;
    for (let i = 0; i < particleCount; i += sampleStep) {
      const p1 = this.particles[i];
      if (p1.z < 0.6) continue; // Only connect higher 3D depth particles to retain clean aesthetics

      let connections = 0;
      for (let j = i + 1; j < particleCount && connections < this.params.maxConnectionsPerParticle; j += sampleStep) {
        const p2 = this.particles[j];
        if (p2.z < 0.6) continue;

        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < connDistSq) {
          const dist = Math.sqrt(distSq);
          const alpha = (1 - dist / connDist) * 0.22 * p1.z;
          ctx.strokeStyle = `${theme.lineColor}${alpha})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          connections++;
        }
      }
    }

    // Render Particles using pre-rendered glowing cached sprites
    for (let i = 0; i < particleCount; i++) {
      const p = this.particles[i];
      const cacheKey = `${p.color}_${p.discreteSize}`;
      const spriteInfo = this.spriteCaches.get(cacheKey);

      if (spriteInfo) {
        ctx.globalAlpha = Math.min(1.0, p.alpha + p.energy * 0.4);
        ctx.drawImage(
          spriteInfo.canvas,
          p.x - spriteInfo.offset,
          p.y - spriteInfo.offset
        );
      } else {
        // Fallback standard arc
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Render interactive cursor aura
    if (this.mouse.isHovering && this.mouse.x > 0) {
      const radius = this.params.repulsionRadius * (this.mouse.isDragging ? 1.4 : 1.0);
      const gradient = ctx.createRadialGradient(
        this.mouse.x, this.mouse.y, 0,
        this.mouse.x, this.mouse.y, radius
      );
      
      const auraColor = this.mouse.isDragging ? 'rgba(255, 0, 127, ' : 'rgba(0, 240, 255, ';
      gradient.addColorStop(0, `${auraColor}0.18)`);
      gradient.addColorStop(0.5, `${auraColor}0.06)`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.globalAlpha = 1.0;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.mouse.x, this.mouse.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Core cursor neon ring
      ctx.strokeStyle = this.mouse.isDragging ? '#ff007f' : theme.accentGlow;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(this.mouse.x, this.mouse.y, this.mouse.isDragging ? 14 : 9, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalAlpha = 1.0;
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    // Delta time & FPS computation
    const delta = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
      
      const fpsDisplay = document.getElementById('fps-counter');
      if (fpsDisplay) {
        fpsDisplay.textContent = `${this.fps} FPS`;
      }
    }

    this.updatePhysics(currentTime);
    this.draw();

    requestAnimationFrame((t) => this.loop(t));
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  stop() {
    this.isRunning = false;
  }
}

window.AntiGravityEngine = AntiGravityEngine;

