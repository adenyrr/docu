/**
 * Animated particles background for Zensical docs
 * Creates a subtle floating particle effect
 */

class ParticleSystem {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.particleCount = 50;
    this.mouse = { x: null, y: null, radius: 150 };
    this.animationId = null;
    this.isDark = true;
  }

  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'particles-canvas';
    document.body.prepend(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Set size
    this.resize();

    // Check theme
    this.checkTheme();

    // Create particles
    this.createParticles();

    // Event listeners
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    // Watch for theme changes
    const observer = new MutationObserver(() => this.checkTheme());
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['data-md-color-scheme'] 
    });

    // Start animation
    this.animate();
  }

  checkTheme() {
    const scheme = document.documentElement.getAttribute('data-md-color-scheme');
    this.isDark = scheme === 'slate';
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        hue: Math.random() * 60 + 240 // Purple to pink range
      });
    }
  }

  drawParticle(p) {
    const color = this.isDark 
      ? `hsla(${p.hue}, 70%, 60%, ${p.opacity * 0.6})`
      : `hsla(${p.hue}, 60%, 50%, ${p.opacity * 0.4})`;
    
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();

    // Glow effect
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = color;
  }

  connectParticles() {
    const maxDistance = 120;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * 0.15;
          const color = this.isDark 
            ? `rgba(139, 92, 246, ${opacity})`
            : `rgba(99, 102, 241, ${opacity * 0.6})`;
          
          this.ctx.beginPath();
          this.ctx.strokeStyle = color;
          this.ctx.lineWidth = 1;
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }

  updateParticles() {
    for (let p of this.particles) {
      // Move
      p.x += p.speedX;
      p.y += p.speedY;

      // Mouse interaction
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.mouse.radius) {
          const force = (this.mouse.radius - distance) / this.mouse.radius;
          p.x += dx * force * 0.02;
          p.y += dy * force * 0.02;
        }
      }

      // Wrap around edges
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.updateParticles();
    this.connectParticles();
    
    for (let p of this.particles) {
      this.drawParticle(p);
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

// Initialize when DOM is ready
function initParticles() {
  // Only init if not already present
  if (!document.getElementById('particles-canvas')) {
    const particles = new ParticleSystem();
    particles.init();
  }
}

// Support for Zensical instant navigation
if (typeof document$ !== 'undefined') {
  document$.subscribe(function() {
    initParticles();
  });
} else {
  // Fallback for initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParticles);
  } else {
    initParticles();
  }
}
