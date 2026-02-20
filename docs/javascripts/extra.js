/**
 * Animated particles background for Zensical docs
 * Improved: respects prefers-reduced-motion, throttles mousemove, debounces resize,
 * pauses when page hidden and adds aria-hidden for accessibility.
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
    this.reducedMotion = false;
    this.resizeTimer = null;
    this.mouseThrottle = null;
    this.running = false;
  }

  init() {
    // Respect user's reduced motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.reducedMotion = true;
      return; // don't initialise heavy visuals
    }

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'particles-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.canvas.style.pointerEvents = 'none';
    document.body.prepend(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Set size
    this.resize();

    // Check theme
    this.checkTheme();

    // Scale particle count to viewport size to reduce CPU on small devices
    const area = this.canvas.width * this.canvas.height;
    this.particleCount = Math.max(16, Math.min(120, Math.floor(area / 120000)));

    // Create particles
    this.createParticles();

    // Event listeners (debounced/throttled)
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => this.handleResize(), 150);
    });

    window.addEventListener('mousemove', (e) => {
      // Throttle mouse updates to reduce load
      if (this.mouseThrottle) return;
      this.mouseThrottle = setTimeout(() => { this.mouseThrottle = null; }, 50);
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    // Pause animation when tab not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });

    // Watch for theme changes
    const observer = new MutationObserver(() => this.checkTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-md-color-scheme'] });

    // Start animation
    this.start();
  }

  start() {
    if (this.reducedMotion || this.running) return;
    this.running = true;
    this.animate();
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animationId = null;
  }

  handleResize() {
    this.resize();
    // re-scale particles for new size
    const area = this.canvas.width * this.canvas.height;
    this.particleCount = Math.max(16, Math.min(120, Math.floor(area / 120000)));
    this.createParticles();
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
        opacity: Math.random() * 0.5 + 0.15,
        hue: Math.random() * 60 + 240 // Purple to pink range
      });
    }
  }

  drawParticle(p) {
    const color = this.isDark 
      ? `hsla(${p.hue}, 70%, 60%, ${p.opacity * 0.6})`
      : `hsla(${p.hue}, 60%, 50%, ${p.opacity * 0.45})`;

    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();

    // Glow effect
    this.ctx.shadowBlur = 12;
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
          const opacity = (1 - distance / maxDistance) * 0.12;
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
          p.x += dx * force * 0.015;
          p.y += dy * force * 0.015;
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
    if (!this.running) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.updateParticles();
    this.connectParticles();

    for (let p of this.particles) {
      this.drawParticle(p);
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

// Initialize when DOM is ready (support for instant navigation)
function initParticles() {
  // If user prefers reduced motion, don't init
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Only init if not already present
  if (!document.getElementById('particles-canvas')) {
    const particles = new ParticleSystem();
    particles.init();
  }
}

if (typeof document$ !== 'undefined') {
  document$.subscribe(function() {
    initParticles();
  });
} else {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParticles);
  } else {
    initParticles();
  }
}

/* ── Scroll reveal — IntersectionObserver ────────────────── */
(function () {
  var SELECTOR = [
    '.md-typeset h2',
    '.md-typeset h3',
    '.md-typeset .admonition',
    '.md-typeset details',
    '.md-typeset table',
    '.md-typeset blockquote',
    '.md-typeset .highlight'
  ].join(', ');

  function attachReveal() {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll(SELECTOR).forEach(function (el, i) {
      el.classList.add('reveal-up');
      if (i % 3 === 1) el.classList.add('reveal-delay-1');
      else if (i % 3 === 2) el.classList.add('reveal-delay-2');
      observer.observe(el);
    });
  }

  /* MkDocs instant-navigation — re-attach after each page swap */
  document.addEventListener('DOMContentLoaded', attachReveal);
  document.addEventListener('DOMContentSwitch', attachReveal); // Zensical/Material
})();

