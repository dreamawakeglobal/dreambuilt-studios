import './style.css';
import './styles/layout.css';
import './components/header.js';
import './components/footer.js';

// Setup any global interactions here
document.addEventListener('DOMContentLoaded', () => {


  // FAQ Accordion Logic
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isActive = item.classList.contains('active');

      // Close all other items
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-answer').style.maxHeight = null;
      });

      // Toggle current item
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  // Lightbox Modal Logic
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  if (lightboxModal && lightboxImg) {
    document.querySelectorAll('.pillar-visual, .hero-mockup-frame').forEach(box => {
      box.addEventListener('click', () => {
        const img = box.querySelector('img');
        if (img) {
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt || 'Dream Built Studios Visual';
          lightboxModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    const closeLightbox = () => {
      lightboxModal.classList.remove('active');
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

  // Neural Network Moving & Sparkling Background Animation
  initNeuralCanvas();
  // Flashing Cosmic Starlight Animation for Portfolio
  initStarlightCanvas();
});

function initNeuralCanvas() {
  const canvases = document.querySelectorAll('.neural-canvas, #neural-canvas');
  if (!canvases.length) return;

  canvases.forEach(canvas => {
    const ctx = canvas.getContext('2d');
    const section = canvas.parentElement;

    let width = 0;
    let height = 0;
    let animationFrameId;

    let mouse = { x: null, y: null, radius: 180 };

    const resize = () => {
      width = section.clientWidth;
      height = section.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    section.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    // Particle (Neuron) Class
    const particleCount = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 18000), 75);
    const particles = [];
    const pulses = [];

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2 + 1.5;
        this.baseSparkle = Math.random() * Math.PI * 2;
        this.sparkleSpeed = 0.02 + Math.random() * 0.03;
        this.pulseIntensity = 0.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interactivity
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
        ctx.shadowBlur = 12 * this.pulseIntensity;
        ctx.fill();

        // Sparkling flare center
        if (this.pulseIntensity > 0.7) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 8;
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
        ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const maxDistance = 160;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update & draw particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      // Connect particles with neural synapse lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.35;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);

            const gradient = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
            gradient.addColorStop(0, `rgba(0, 102, 255, ${alpha})`);
            gradient.addColorStop(0.5, `rgba(0, 240, 255, ${alpha * 1.3})`);
            gradient.addColorStop(1, `rgba(0, 102, 255, ${alpha})`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();

            // Occasionally spawn an electrical pulse traveling down synoptic connection
            if (Math.random() < 0.0008 && pulses.length < 15) {
              pulses.push(new ElectricalPulse(particles[i], particles[j]));
            }
          }
        }
      }

      // Update and draw active pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i].update();
        pulses[i].draw();
        if (!pulses[i].alive) {
          pulses.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
  });
}

function initStarlightCanvas() {
  const canvas = document.getElementById('starlight-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const section = canvas.parentElement;

  let width = 0;
  let height = 0;

  const resize = () => {
    width = section.clientWidth;
    height = section.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  };

  resize();
  window.addEventListener('resize', resize);

  const starColors = [
    '#ffffff',
    '#ffffff',
    '#00f0ff',
    '#e0f7ff',
    '#ffffff'
  ];

  class FlashingStar {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2.5 + 1;
      this.color = starColors[Math.floor(Math.random() * starColors.length)];
      this.alpha = Math.random();
      this.flashSpeed = (0.005 + Math.random() * 0.01) * (Math.random() < 0.5 ? 1 : -1);
      this.isBigFlare = Math.random() < 0.3; // 30% are 4-point sparkling lens flare stars
      this.rotation = Math.random() * Math.PI;
    }

    update() {
      this.alpha += this.flashSpeed;
      if (this.alpha >= 1 || this.alpha <= 0.15) {
        this.flashSpeed *= -1;
      }
      this.rotation += 0.0015;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0.15, Math.min(1, this.alpha));

      // Draw Star Core Glow
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 12 * this.alpha;
      ctx.fill();

      // Draw 4-point sparkling lens flare for big stars
      if (this.isBigFlare && this.alpha > 0.35) {
        const rayLen = this.size * 6 * this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.2;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 15;

        ctx.beginPath();
        ctx.moveTo(-rayLen, 0); ctx.lineTo(rayLen, 0);
        ctx.moveTo(0, -rayLen); ctx.lineTo(0, rayLen);
        const diagLen = rayLen * 0.45;
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
      this.x = Math.random() * width;
      this.y = Math.random() * (height * 0.6);
      this.len = Math.random() * 90 + 50;
      this.speed = Math.random() * 2 + 1.8;
      this.size = Math.random() * 1.8 + 1;
      this.active = false;
      this.waitTime = Math.random() * 300 + 150;
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
      if (this.x > width || this.y > height) {
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

  const stars = Array.from({ length: 130 }, () => new FlashingStar());
  const shootingStars = Array.from({ length: 3 }, () => new ShootingStar());

  const animate = () => {
    ctx.clearRect(0, 0, width, height);

    stars.forEach(star => {
      star.update();
      star.draw();
    });

    shootingStars.forEach(sStar => {
      sStar.update();
      sStar.draw();
    });

    requestAnimationFrame(animate);
  };

  animate();
}
