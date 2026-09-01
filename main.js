import './style.css';
import './styles/layout.css';
import './components/header.js';
import './components/footer.js';

// Setup global interactions, accessibility & performance observers
document.addEventListener('DOMContentLoaded', () => {
  // Lightbox Modal Logic
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  if (lightboxModal && lightboxImg) {
    const visualCards = document.querySelectorAll('.pillar-visual, .hero-mockup-frame');
    
    const openLightbox = (box) => {
      const img = box.querySelector('img');
      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || 'Dream Built Studios Visual Card';
        lightboxModal.classList.add('active');
        lightboxModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (lightboxClose) lightboxClose.focus();
      }
    };

    visualCards.forEach(box => {
      box.setAttribute('tabindex', '0');
      box.setAttribute('role', 'button');
      box.setAttribute('aria-label', 'View full resolution preview');

      box.addEventListener('click', () => openLightbox(box));
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(box);
        }
      });
    });

    const closeLightbox = () => {
      lightboxModal.classList.remove('active');
      lightboxModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  // Portfolio Videos Lazy-Play Performance Controller
  initVideoPlaybackObserver();

  // Neural Network Canvas Animation (High Performance)
  initNeuralCanvas();

  // Cosmic Starlight Canvas Animation (High Performance)
  initStarlightCanvas();
});

// Lazy-Play Portfolio & Background Videos only when in viewport to save CPU/Battery
function initVideoPlaybackObserver() {
  const videos = document.querySelectorAll('.cosmic-glass-card video, .pricing-bg-video');
  if (!videos.length || !('IntersectionObserver' in window)) return;

  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.15 });

  videos.forEach(video => {
    videoObserver.observe(video);
  });
}

function initNeuralCanvas() {
  const canvases = document.querySelectorAll('.neural-canvas, #neural-canvas');
  if (!canvases.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  canvases.forEach(canvas => {
    const ctx = canvas.getContext('2d', { alpha: true });
    const section = canvas.parentElement;

    let width = 0;
    let height = 0;
    let animationFrameId = null;
    let isRunning = false;
    let isVisible = true;

    let mouse = { x: null, y: null, radius: 180 };

    const resize = () => {
      const rect = section.getBoundingClientRect();
      width = rect.width || section.clientWidth || window.innerWidth;
      height = rect.height || section.clientHeight || 800;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => resize());
      ro.observe(section);
    }
    window.addEventListener('resize', resize, { passive: true });

    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }, { passive: true });

    section.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    }, { passive: true });

    // Particle (Neuron) Class
    const particleCount = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 20000), 60);
    const particles = [];
    const pulses = [];

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * (width || window.innerWidth);
        this.y = Math.random() * (height || 800);
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = Math.random() * 2 + 1.2;
        this.baseSparkle = Math.random() * Math.PI * 2;
        this.sparkleSpeed = 0.02 + Math.random() * 0.03;
        this.pulseIntensity = 0.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 1.5;
            this.y -= (dy / dist) * force * 1.5;
          }
        }

        this.baseSparkle += this.sparkleSpeed;
        this.pulseIntensity = 0.4 + Math.sin(this.baseSparkle) * 0.6;
      }

      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        const glowColor = `rgba(0, 240, 255, ${0.4 + this.pulseIntensity * 0.6})`;
        ctx.fillStyle = glowColor;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10 * this.pulseIntensity;
        ctx.fill();

        if (this.pulseIntensity > 0.75) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 6;
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Traveling Electrical Pulses
    class ElectricalPulse {
      constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
        this.progress = 0;
        this.speed = 0.015 + Math.random() * 0.025;
        this.alive = true;
      }

      update() {
        this.progress += this.speed;
        if (this.progress >= 1) {
          this.alive = false;
        }
      }

      draw() {
        const cx = this.p1.x + (this.p2.x - this.p1.x) * this.progress;
        const cy = this.p1.y + (this.p2.y - this.p1.y) * this.progress;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const maxDistance = 150;

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        if (!prefersReducedMotion) particles[i].update();
        particles[i].draw();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.3;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 150, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            if (!prefersReducedMotion && Math.random() < 0.0006 && pulses.length < 10) {
              pulses.push(new ElectricalPulse(particles[i], particles[j]));
            }
          }
        }
      }

      if (!prefersReducedMotion) {
        for (let i = pulses.length - 1; i >= 0; i--) {
          pulses[i].update();
          pulses[i].draw();
          if (!pulses[i].alive) {
            pulses.splice(i, 1);
          }
        }
      }
    };

    const animate = () => {
      if (!isRunning) return;
      renderFrame();
      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    const startAnimation = () => {
      if (!isRunning && isVisible && !document.hidden) {
        isRunning = true;
        animate();
      }
    };

    const stopAnimation = () => {
      isRunning = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    // Pause when tab is minimized or hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAnimation();
      } else {
        startAnimation();
      }
    }, { passive: true });

    // Pause when scrolled out of viewport
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            startAnimation();
          } else {
            stopAnimation();
          }
        });
      }, { threshold: 0 });
      observer.observe(canvas);
    } else {
      startAnimation();
    }
  });
}

function initStarlightCanvas() {
  const canvas = document.getElementById('starlight-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  const section = canvas.parentElement;

  let width = 0;
  let height = 0;
  let animationFrameId = null;
  let isRunning = false;
  let isVisible = true;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const starColors = [
    '#ffffff',
    '#ffffff',
    '#00f0ff',
    '#e0f7ff',
    '#ffffff',
    '#a5f3fc'
  ];

  class FlashingStar {
    constructor() {
      this.reset();
    }

    reset() {
      this.relX = Math.random();
      this.relY = Math.random();
      this.size = Math.random() * 2.2 + 1.0;
      this.color = starColors[Math.floor(Math.random() * starColors.length)];
      this.alpha = Math.random();
      this.flashSpeed = (0.006 + Math.random() * 0.012) * (Math.random() < 0.5 ? 1 : -1);
      this.isBigFlare = Math.random() < 0.3;
      this.rotation = Math.random() * Math.PI;
    }

    update() {
      this.alpha += this.flashSpeed;
      if (this.alpha >= 1 || this.alpha <= 0.12) {
        this.flashSpeed *= -1;
      }
      this.rotation += 0.0015;
    }

    draw() {
      const posX = this.relX * width;
      const posY = this.relY * height;

      ctx.save();
      ctx.globalAlpha = Math.max(0.12, Math.min(1, this.alpha));

      ctx.beginPath();
      ctx.arc(posX, posY, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 12 * this.alpha;
      ctx.fill();

      if (this.isBigFlare && this.alpha > 0.35) {
        const rayLen = this.size * 5.5 * this.alpha;
        ctx.translate(posX, posY);
        ctx.rotate(this.rotation);

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.2;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 14;

        ctx.beginPath();
        ctx.moveTo(-rayLen, 0); ctx.lineTo(rayLen, 0);
        ctx.moveTo(0, -rayLen); ctx.lineTo(0, rayLen);
        const diagLen = rayLen * 0.4;
        ctx.moveTo(-diagLen, -diagLen); ctx.lineTo(diagLen, diagLen);
        ctx.moveTo(diagLen, -diagLen); ctx.lineTo(-diagLen, diagLen);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // Shooting Star Class
  class ShootingStar {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * (width || window.innerWidth);
      this.y = Math.random() * ((height || 1000) * 0.65);
      this.len = Math.random() * 90 + 50;
      this.speed = Math.random() * 2.2 + 2.0;
      this.size = Math.random() * 1.8 + 1.0;
      this.active = false;
      this.waitTime = Math.random() * 280 + 120;
    }

    update() {
      if (!this.active) {
        this.waitTime--;
        if (this.waitTime <= 0) {
          this.active = true;
        }
        return;
      }

      this.x += this.speed;
      this.y += this.speed * 0.45;
      if (this.x > width + 100 || this.y > height + 100) {
        this.reset();
      }
    }

    draw() {
      if (!this.active) return;
      ctx.save();
      const grad = ctx.createLinearGradient(this.x, this.y, this.x - this.len, this.y - this.len * 0.45);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, '#00f0ff');
      grad.addColorStop(1, 'transparent');

      ctx.strokeStyle = grad;
      ctx.lineWidth = this.size;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.len, this.y - this.len * 0.45);
      ctx.stroke();
      ctx.restore();
    }
  }

  let stars = [];
  const shootingStars = Array.from({ length: 3 }, () => new ShootingStar());

  const populateStars = () => {
    const targetCount = Math.min(Math.max(Math.floor((width * height) / 12000), 120), 220);
    while (stars.length < targetCount) {
      stars.push(new FlashingStar());
    }
    if (stars.length > targetCount) {
      stars.length = targetCount;
    }
  };

  const resize = () => {
    const rect = section.getBoundingClientRect();
    width = rect.width || section.clientWidth || window.innerWidth;
    height = rect.height || section.clientHeight || 1000;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    populateStars();
  };

  resize();
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => resize());
    ro.observe(section);
  }
  window.addEventListener('resize', resize, { passive: true });

  const renderFrame = () => {
    ctx.clearRect(0, 0, width, height);

    stars.forEach(star => {
      if (!prefersReducedMotion) star.update();
      star.draw();
    });

    if (!prefersReducedMotion) {
      shootingStars.forEach(sStar => {
        sStar.update();
        sStar.draw();
      });
    }
  };

  const animate = () => {
    if (!isRunning) return;
    renderFrame();
    if (!prefersReducedMotion) {
      animationFrameId = requestAnimationFrame(animate);
    }
  };

  const startAnimation = () => {
    if (!isRunning && isVisible && !document.hidden) {
      isRunning = true;
      animate();
    }
  };

  const stopAnimation = () => {
    isRunning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          startAnimation();
        } else {
          stopAnimation();
        }
      });
    }, { threshold: 0 });
    observer.observe(canvas);
  } else {
    startAnimation();
  }
}
