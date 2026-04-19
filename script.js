/* =============================================
   APEX FITNESS — JavaScript
   Navigation, animations, interactions
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ===== INITIALIZE AOS =====
  AOS.init({
    duration: 800,
    once: true,
    easing: 'ease-out-cubic',
    offset: 60
  });

  // ===== SCROLL PROGRESS BAR =====
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.prepend(progressBar);

  window.addEventListener('scroll', () => {
    const scrollPct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    progressBar.style.width = scrollPct + '%';
  });

  // ===== CUSTOM CURSOR =====
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  const cursorFollower = document.createElement('div');
  cursorFollower.className = 'cursor-follower';
  document.body.appendChild(cursor);
  document.body.appendChild(cursorFollower);

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  // Smooth follower animation
  function animateCursor() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top = followerY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Expand on hover of interactive elements
  document.querySelectorAll('a, button, .trainer-card, .prog-card, .sched-class').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('expanded');
      cursorFollower.classList.add('expanded');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('expanded');
      cursorFollower.classList.remove('expanded');
    });
  });

  // ===== STICKY NAVBAR =====
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ===== SINGLE PAGE NAVIGATION =====
  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('.nav-link');
  const hamburger = document.getElementById('hamburger');
  const navLinksContainer = document.getElementById('nav-links');

  function showPage(id) {
    // Hide all pages
    pages.forEach(page => {
      page.classList.remove('active-page');
    });

    // Show target page
    const target = document.getElementById(id);
    if (target) {
      target.classList.add('active-page');
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update nav active state
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + id) {
        link.classList.add('active');
      }
    });

    // Reinit AOS for newly visible elements
    setTimeout(() => AOS.refresh(), 100);
  }

  // Attach click events to all nav links & internal links
  function attachLinkHandlers() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const hash = link.getAttribute('href').slice(1);
        const target = document.getElementById(hash);
        if (target && target.classList.contains('page')) {
          e.preventDefault();
          showPage(hash);
          // Close mobile menu
          navLinksContainer.classList.remove('open');
          hamburger.classList.remove('open');
        }
      });
    });
  }
  attachLinkHandlers();

  // ===== HAMBURGER MENU =====
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinksContainer.classList.toggle('open');
  });

  // Close mobile menu on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      hamburger.classList.remove('open');
      navLinksContainer.classList.remove('open');
    }
  });

  // ===== COUNTER ANIMATION =====
  function animateCounter(el, target, duration = 2000) {
    let start = 0;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Intersection observer for stats
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll('[data-target]');
        counters.forEach(counter => {
          const target = parseInt(counter.getAttribute('data-target'));
          animateCounter(counter, target);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsBand = document.querySelector('.stats-band');
  if (statsBand) statsObserver.observe(statsBand);

  // ===== TESTIMONIALS SLIDER =====
  const track = document.getElementById('testimonials-track');
  const dotsContainer = document.getElementById('testi-dots');
  const prevBtn = document.getElementById('testi-prev');
  const nextBtn = document.getElementById('testi-next');

  if (track) {
    const cards = track.querySelectorAll('.testimonial-card');
    let currentSlide = 0;
    let slidesPerView = getSlidesPerView();

    function getSlidesPerView() {
      if (window.innerWidth < 768) return 1;
      if (window.innerWidth < 1100) return 2;
      return 3;
    }

    const totalSlides = Math.max(0, cards.length - slidesPerView + 1);

    // Create dots
    function createDots() {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      dotsContainer.querySelectorAll('.testi-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
      });
    }

    function goToSlide(index) {
      currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
      const cardWidth = cards[0].offsetWidth + 32; // gap: 2rem = 32px
      track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
      updateDots();
    }

    prevBtn.addEventListener('click', () => {
      goToSlide(currentSlide === 0 ? totalSlides - 1 : currentSlide - 1);
    });

    nextBtn.addEventListener('click', () => {
      goToSlide(currentSlide === totalSlides - 1 ? 0 : currentSlide + 1);
    });

    // Auto-play
    let autoSlide = setInterval(() => {
      goToSlide(currentSlide === totalSlides - 1 ? 0 : currentSlide + 1);
    }, 5000);

    track.addEventListener('mouseenter', () => clearInterval(autoSlide));
    track.addEventListener('mouseleave', () => {
      autoSlide = setInterval(() => {
        goToSlide(currentSlide === totalSlides - 1 ? 0 : currentSlide + 1);
      }, 5000);
    });

    // Touch / swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
      }
    });

    // Responsive update
    window.addEventListener('resize', () => {
      slidesPerView = getSlidesPerView();
      currentSlide = 0;
      track.style.transform = 'translateX(0)';
      createDots();
    });

    createDots();
  }

  // ===== SCHEDULE FILTER =====
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      const cells = document.querySelectorAll('.sched-class');

      cells.forEach(cell => {
        if (filter === 'all' || cell.getAttribute('data-type') === filter) {
          cell.style.opacity = '1';
          cell.style.transform = 'scale(1)';
        } else {
          cell.style.opacity = '0.15';
          cell.style.transform = 'scale(0.97)';
        }
        cell.style.transition = 'opacity 0.3s, transform 0.3s';
      });
    });
  });

  // ===== CONTACT FORM =====
  const form = document.getElementById('trial-form');
  const formSuccess = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Basic validation
      const inputs = form.querySelectorAll('input[required], select[required]');
      let valid = true;
      inputs.forEach(input => {
        if (!input.value.trim()) {
          valid = false;
          input.style.borderColor = 'var(--red)';
          setTimeout(() => input.style.borderColor = '', 2000);
        }
      });

      if (!valid) return;

      // Simulate form submission
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Sending...';
      btn.style.opacity = '0.7';
      btn.disabled = true;

      setTimeout(() => {
        form.style.display = 'none';
        if (formSuccess) {
          formSuccess.classList.add('show');
        }
      }, 1200);
    });
  }

  // ===== PARALLAX EFFECT ON HERO =====
  const heroContent = document.querySelector('.hero-content');
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (heroContent && scrolled < window.innerHeight) {
      heroContent.style.transform = `translateY(${scrolled * 0.25}px)`;
      heroContent.style.opacity = 1 - (scrolled / (window.innerHeight * 0.7));
    }
  });

  // ===== HOVER TILT ON CARDS =====
  document.querySelectorAll('.trainer-card, .pricing-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ===== MAGNETIC BUTTONS =====
  document.querySelectorAll('.btn-primary, .btn-ghost, .btn-nav').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // ===== SCHEDULE CLASS CLICK POPUP =====
  document.querySelectorAll('.sched-class').forEach(cell => {
    cell.addEventListener('click', function() {
      const name = this.querySelector('.class-name')?.textContent || '';
      const trainer = this.querySelector('.class-trainer')?.textContent || '';
      const spots = this.querySelector('.class-spots')?.textContent || '';

      // Create tooltip
      const existing = document.querySelector('.sched-tooltip');
      if (existing) existing.remove();

      const tooltip = document.createElement('div');
      tooltip.className = 'sched-tooltip';
      tooltip.style.cssText = `
        position: fixed;
        bottom: 2rem; right: 2rem;
        background: var(--dark-2);
        border: 1px solid var(--accent);
        padding: 1.2rem 1.8rem;
        z-index: 5000;
        animation: slideInRight 0.3s ease;
        max-width: 280px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      `;
      tooltip.innerHTML = `
        <div style="font-family: 'Barlow Condensed', sans-serif; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); margin-bottom: 0.5rem;">CLASS DETAILS</div>
        <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.3rem; color: var(--white);">${name}</div>
        <div style="font-size: 0.85rem; color: rgba(244,244,240,0.6); margin-bottom: 0.3rem;">${trainer}</div>
        <div style="font-size: 0.8rem; color: var(--accent);">${spots} available</div>
        <button onclick="this.parentElement.remove()" style="position: absolute; top: 0.5rem; right: 0.75rem; background: none; border: none; color: var(--white-dim); cursor: pointer; font-size: 1rem;">×</button>
      `;

      document.body.appendChild(tooltip);
      setTimeout(() => tooltip.remove(), 4000);
    });
  });

  // Style for tooltip animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(40px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .sched-tooltip { position: relative; }
  `;
  document.head.appendChild(style);

  // ===== VIDEO PLAY ATTEMPT =====
  const video = document.querySelector('.hero-video');
  if (video) {
    video.play().catch(() => {
      // If video fails, the poster image is shown — no action needed
      console.log('Video autoplay blocked, poster displayed.');
    });
  }

  // ===== LOADING ANIMATION =====
  const loader = document.createElement('div');
  loader.id = 'apex-loader';
  loader.style.cssText = `
    position: fixed;
    inset: 0;
    background: var(--black);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 1.5rem;
    transition: opacity 0.6s ease, visibility 0.6s;
  `;
  loader.innerHTML = `
    <div style="font-family: 'Bebas Neue', cursive; font-size: 4rem; letter-spacing: 0.1em; color: #f4f4f0;">
      APEX<span style="color: #c8f73a;">.</span>
    </div>
    <div style="width: 200px; height: 2px; background: #1e1e1e; overflow: hidden;">
      <div id="loader-bar" style="height: 100%; width: 0%; background: #c8f73a; transition: width 0.8s ease;"></div>
    </div>
  `;
  document.body.prepend(loader);

  // Animate loader bar
  setTimeout(() => {
    document.getElementById('loader-bar').style.width = '100%';
  }, 100);

  setTimeout(() => {
    loader.style.opacity = '0';
    loader.style.visibility = 'hidden';
    setTimeout(() => loader.remove(), 600);
  }, 1200);

  // ===== KEYBOARD NAVIGATION =====
  document.addEventListener('keydown', (e) => {
    const pages = ['home', 'programs', 'schedule', 'trainers', 'membership', 'transformations', 'contact'];
    const activePage = document.querySelector('.page.active-page');
    if (!activePage) return;
    const currentIndex = pages.indexOf(activePage.id);

    if (e.key === 'ArrowRight' && currentIndex < pages.length - 1) {
      showPage(pages[currentIndex + 1]);
    }
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      showPage(pages[currentIndex - 1]);
    }
  });

  console.log('%cAPEX Elite Performance Center', 'color: #c8f73a; font-size: 20px; font-weight: bold;');
  console.log('%cBuilt for champions.', 'color: #a0a09a; font-size: 12px;');
});