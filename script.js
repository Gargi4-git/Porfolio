/* ============================================================
   Gargi Padate — Portfolio  |  script.js
   Pure vanilla JS · No dependencies
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     0. UTILITY — Throttle helper (perf-safe scroll handlers)
  ---------------------------------------------------------- */
  const throttle = (fn, delay = 100) => {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= delay) { last = now; fn(...args); }
    };
  };

  /* ----------------------------------------------------------
     1. PRELOADER
  ---------------------------------------------------------- */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    // Minimum display time so the animation feels intentional
    setTimeout(() => {
      preloader.classList.add('fade-out');
      document.body.classList.add('loaded');
      // Remove from DOM after CSS transition ends
      preloader.addEventListener('transitionend', () => {
        preloader.style.display = 'none';
      });
    }, 1500);
  }

  /* ----------------------------------------------------------
     2. NAVIGATION
  ---------------------------------------------------------- */
  const navbar    = document.querySelector('.navbar');
  const navLinks  = document.querySelector('.nav-links');
  const hamburger = document.querySelector('.hamburger');
  const allLinks  = document.querySelectorAll('.nav-links a');
  const sections  = document.querySelectorAll('section[id]');

  // 2a. Scrolled class — adds backdrop when past 100 px
  const handleNavScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 100);
  };

  // 2b. Active link highlighting based on scroll position
  const highlightNavLink = () => {
    const scrollY = window.scrollY + window.innerHeight / 3;

    sections.forEach(section => {
      const top    = section.offsetTop - 80;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = document.querySelector(`.nav-links a[href="#${id}"]`);

      if (link) {
        link.classList.toggle('active', scrollY >= top && scrollY < bottom);
      }
    });
  };

  // Attach scroll listeners (throttled)
  window.addEventListener('scroll', throttle(() => {
    handleNavScroll();
    highlightNavLink();
  }, 80));

  // 2c. Smooth scroll on nav-link click
  allLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const target   = document.querySelector(targetId);
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 70,   // offset for fixed navbar
          behavior: 'smooth'
        });
      }
      // Close mobile menu if open
      navLinks?.classList.remove('active');
      hamburger?.classList.remove('active');
    });
  });

  // 2d. Hamburger toggle
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks?.classList.toggle('active');
      hamburger.classList.toggle('active');
    });
  }

  /* ----------------------------------------------------------
     3. SCROLL ANIMATIONS  (IntersectionObserver)
  ---------------------------------------------------------- */
  const animatedEls = document.querySelectorAll('.animate-on-scroll');

  if (animatedEls.length) {
    const scrollObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el    = entry.target;
            const delay = el.dataset.delay || 0;   // ms from data-delay
            setTimeout(() => el.classList.add('animate-in'), Number(delay));
            observer.unobserve(el);                 // fire only once
          }
        });
      },
      { threshold: 0.15 }
    );

    animatedEls.forEach(el => scrollObserver.observe(el));
  }

  /* ----------------------------------------------------------
     4. TYPING EFFECT  (hero section)
  ---------------------------------------------------------- */
  const typingEl = document.querySelector('.typing-text');

  if (typingEl) {
    const designations = [
      'ML Engineer',
      'IoT Developer',
      'Research Enthusiast',
      'B.Tech IT Student'
    ];

    const TYPING_SPEED  = 100;   // ms per character typed
    const DELETING_SPEED = 50;   // ms per character deleted
    const PAUSE_DURATION = 2000; // ms to hold the completed word

    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const type = () => {
      const currentWord = designations[wordIndex];

      if (isDeleting) {
        charIndex--;
        typingEl.textContent = currentWord.substring(0, charIndex);
      } else {
        charIndex++;
        typingEl.textContent = currentWord.substring(0, charIndex);
      }

      let nextDelay = isDeleting ? DELETING_SPEED : TYPING_SPEED;

      // Finished typing the whole word → pause, then delete
      if (!isDeleting && charIndex === currentWord.length) {
        nextDelay = PAUSE_DURATION;
        isDeleting = true;
      }

      // Finished deleting → move to next word
      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % designations.length;
        nextDelay = 400; // brief pause before next word
      }

      setTimeout(type, nextDelay);
    };

    // Kick off after preloader finishes
    setTimeout(type, 1800);
  }

  /* ----------------------------------------------------------
     5. STAT COUNTERS  (achievements section)
  ---------------------------------------------------------- */
  const statNumbers   = document.querySelectorAll('.stat-number');
  let   statsCounted  = false;

  const animateCounters = () => {
    if (statsCounted) return;
    statsCounted = true;

    statNumbers.forEach(stat => {
      const target   = +stat.dataset.target || 0;
      const duration = 2000; // ms
      const start    = performance.now();

      const step = (now) => {
        const elapsed  = now - start;
        // ease-out-quad for a natural feel
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        stat.textContent = Math.floor(eased * target);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          stat.textContent = target;   // ensure exact final value
        }
      };

      requestAnimationFrame(step);
    });
  };

  // Observe the first stat element (fires once)
  if (statNumbers.length) {
    const statsObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounters();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    // Observe the parent section if possible, else the first stat
    const statsSection = statNumbers[0].closest('section') || statNumbers[0];
    statsObserver.observe(statsSection);
  }

  /* ----------------------------------------------------------
     6. PROGRESS BARS  (skills section)
  ---------------------------------------------------------- */
  const progressBars     = document.querySelectorAll('.skill-bar');
  let   progressAnimated = false;

  const animateProgressBars = () => {
    if (progressAnimated) return;
    progressAnimated = true;

    progressBars.forEach((bar, i) => {
      const targetWidth = bar.getAttribute('data-width') || '0';
      // Stagger each bar by 120 ms for a cascading look
      setTimeout(() => {
        bar.classList.add('progress-animate');
        bar.style.width = targetWidth + '%';
      }, i * 120);
    });
  };

  if (progressBars.length) {
    const progressObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateProgressBars();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    const skillsSection = progressBars[0].closest('section') || progressBars[0];
    progressObserver.observe(skillsSection);
  }

  /* ----------------------------------------------------------
     7. SKILL CATEGORY TABS
  ---------------------------------------------------------- */
  const categoryTabs  = document.querySelectorAll('.skill-tab');
  const skillGroups   = document.querySelectorAll('.skill-category[data-group]');

  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Toggle active tab
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.dataset.category; // e.g. 'all', 'frontend', etc.

      skillGroups.forEach(group => {
        const cat = group.dataset.group;
        if (category === 'all' || cat === category) {
          group.style.display = '';
          // Re-trigger entrance animation
          group.classList.remove('animate-in');
          void group.offsetWidth;            // force reflow
          group.classList.add('animate-in');
        } else {
          group.style.display = 'none';
        }
      });
    });
  });

  /* ----------------------------------------------------------
     8. CERTIFICATE MODAL
  ---------------------------------------------------------- */
  const certCards = document.querySelectorAll('.cert-card');
  const certModal = document.getElementById('cert-modal');
  const modalImg  = document.getElementById('modal-image');
  const modalClose = document.getElementById('modal-close');

  const openModal = (imgSrc, imgAlt) => {
    if (!certModal || !modalImg) return;
    modalImg.src = imgSrc;
    modalImg.alt = imgAlt || 'Certificate';
    certModal.classList.add('active');
    document.body.style.overflow = 'hidden';  // prevent background scroll
  };

  const closeModal = () => {
    if (!certModal) return;
    certModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  certCards.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      if (img) openModal(img.src, img.alt);
    });
  });

  modalClose?.addEventListener('click', closeModal);

  // Close on overlay click
  const modalOverlay = certModal?.querySelector('.modal-overlay');
  modalOverlay?.addEventListener('click', () => {
    closeModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  /* ----------------------------------------------------------
     9. CONTACT FORM  (mailto approach)
  ---------------------------------------------------------- */
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();

      const name    = contactForm.querySelector('[name="name"]');
      const email   = contactForm.querySelector('[name="email"]');
      const subject = contactForm.querySelector('[name="subject"]');
      const message = contactForm.querySelector('[name="message"]');

      // --- Basic validation ---
      if (!name?.value.trim()) {
        shakeField(name);
        return;
      }
      if (!email?.value.trim() || !isValidEmail(email.value)) {
        shakeField(email);
        return;
      }

      // --- Build mailto link ---
      const mailSubject = encodeURIComponent(
        (subject?.value.trim() || 'Portfolio Contact') + ` — from ${name.value.trim()}`
      );
      const mailBody = encodeURIComponent(
        `Name: ${name.value.trim()}\nEmail: ${email.value.trim()}\n\n${message?.value.trim() || ''}`
      );
      const mailto = `mailto:gargipadate57@gmail.com?subject=${mailSubject}&body=${mailBody}`;
      window.open(mailto, '_blank');

      // --- Success feedback ---
      showFormSuccess(contactForm);
      contactForm.reset();
    });
  }

  /** Email format check */
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  /** Quick shake animation for invalid fields */
  const shakeField = (el) => {
    if (!el) return;
    el.classList.add('shake');
    el.focus();
    el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
  };

  /** Brief success message overlay */
  const showFormSuccess = (form) => {
    const msg = document.createElement('div');
    msg.className = 'form-success-msg';
    msg.innerHTML = '<span>✓</span> Message ready to send!';
    form.style.position = 'relative';
    form.appendChild(msg);

    // Auto-remove after 3 s
    setTimeout(() => {
      msg.classList.add('fade-out');
      msg.addEventListener('transitionend', () => msg.remove());
    }, 3000);
  };

  /* ----------------------------------------------------------
     10. SCROLL-TO-TOP BUTTON
  ---------------------------------------------------------- */
  const scrollTopBtn = document.getElementById('scroll-top');

  if (scrollTopBtn) {
    window.addEventListener('scroll', throttle(() => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
    }, 120));

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----------------------------------------------------------
     11. PARALLAX EFFECTS  (hero background elements)
  ---------------------------------------------------------- */
  const heroSection    = document.getElementById('landing');
  const parallaxLayers = heroSection?.querySelectorAll('.parallax-layer, .hero-bg-element');

  if (parallaxLayers?.length) {
    window.addEventListener('scroll', throttle(() => {
      const scrollY = window.scrollY;
      // Only compute while hero is in view
      if (scrollY > window.innerHeight * 1.2) return;

      parallaxLayers.forEach((layer, i) => {
        const speed = (i + 1) * 0.08;           // subtle shift per layer
        layer.style.transform = `translateY(${scrollY * speed}px)`;
      });
    }, 16));   // ~60 fps
  }

  /* ----------------------------------------------------------
     12. EXTRA POLISH
  ---------------------------------------------------------- */

  // a. Highlight correct nav link on initial load (hash or scroll pos)
  handleNavScroll();
  highlightNavLink();

  // b. Prevent FOUC — reveal body after a micro-delay
  document.body.style.visibility = 'visible';

});
