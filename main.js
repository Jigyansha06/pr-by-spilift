/* ==========================================================================
   PR BY SPILIFT — MAIN JS
   Loader → Lenis → Navigation → Mobile Menu → Forms → Scrollspy → Lightbox
   ========================================================================== */

(function () {
  'use strict';

  const reduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /* ========================================================================
     LOADER
     ======================================================================== */

  function runLoader(done) {
  const loader = document.getElementById('loader');

  if (!loader) {
    done();
    return;
  }

  // Respect reduced-motion preference
  if (reduced) {
    loader.style.display = 'none';
    done();
    return;
  }

  document.body.style.overflow = 'hidden';

  // Start loader animation
  loader.classList.add('is-loading');

  // Give the loader enough time to feel intentional,
  // but keep it fast.
  setTimeout(() => {
    loader.classList.add('is-done');

    // Restore page scrolling
    document.body.style.overflow = '';

    // Initialize the website
    setTimeout(() => {
      loader.style.display = 'none';
      done();
    }, 550);

  }, 1100);
}


  /* ========================================================================
     LENIS SMOOTH SCROLL
     ======================================================================== */

  function initLenis() {

    if (
      reduced ||
      typeof Lenis === 'undefined' ||
      typeof gsap === 'undefined' ||
      typeof ScrollTrigger === 'undefined'
    ) {
      return null;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: function (t) {
        return Math.min(
          1,
          1.001 - Math.pow(2, -10 * t)
        );
      },
      smoothWheel: true,
      touchMultiplier: 1.2
    });

    lenis.on('scroll', function () {
      ScrollTrigger.update();
    });

    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return lenis;
  }


  /* ========================================================================
     NAVIGATION
     
     IMPORTANT:
     - Navbar stays fixed
     - Navbar hides only after scrolling down
     - Navbar returns when scrolling up
     - Navbar NEVER gets permanently hidden
     ======================================================================== */

  function initNavBehavior() {
  const nav = document.getElementById('nav');

  if (!nav) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  const showNav = () => {
    nav.classList.remove('nav--hidden');
  };

  const hideNav = () => {
    // Never hide while mobile menu is open
    if (nav.classList.contains('menu-open')) return;

    nav.classList.add('nav--hidden');
  };

  function updateNav() {
    const currentScrollY = window.scrollY;

    // At the very top — always show
    if (currentScrollY <= 20) {
      showNav();
      nav.classList.remove('nav--scrolled');
      lastScrollY = currentScrollY;
      ticking = false;
      return;
    }

    // Add compact/scrolled style
    nav.classList.add('nav--scrolled');

    const difference = currentScrollY - lastScrollY;

    // Ignore tiny movements
    if (Math.abs(difference) < 6) {
      ticking = false;
      return;
    }

    // Scrolling DOWN
    if (difference > 0) {
      hideNav();
    }

    // Scrolling UP
    else {
      showNav();
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNav);
        ticking = true;
      }
    },
    { passive: true }
  );

  // Initial state
  showNav();
}
  /* ========================================================================
     MOBILE MENU
     ======================================================================== */

  function initMobileMenu() {

    const btn = document.getElementById('hamburger');
    const menu = document.getElementById('mobile-menu');
    const nav = document.getElementById('nav');

    if (!btn || !menu) return;

    let open = false;

    function openMenu() {

      open = true;

      btn.setAttribute('aria-expanded', 'true');
      menu.classList.add('is-open');

      if (nav) {
        nav.classList.add('menu-open');
        nav.classList.remove('nav--hidden');
      }

      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {

      open = false;

      btn.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');

      if (nav) {
        nav.classList.remove('menu-open');
        nav.classList.remove('nav--hidden');
      }

      document.body.style.overflow = '';
    }

    btn.addEventListener('click', function () {

      if (open) {
        closeMenu();
      } else {
        openMenu();
      }

    });

    menu.querySelectorAll('a').forEach(function (link) {

      link.addEventListener('click', function () {
        closeMenu();
      });

    });

    document.addEventListener('keydown', function (e) {

      if (e.key === 'Escape' && open) {
        closeMenu();
      }

    });

  }


  /* ========================================================================
     CONTACT FORM
     ======================================================================== */

  function initContactForm() {

    const form = document.getElementById('contact-form');

    if (!form) return;

    const status = document.getElementById('form-status');

    const rules = {

      name: function (value) {
        return value.trim().length >= 2 ||
          'Please enter your name.';
      },

      phone: function (value) {
        return /^[0-9+\-\s()]{7,}$/.test(value.trim()) ||
          'Please enter a valid phone number.';
      },

      email: function (value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ||
          'Please enter a valid email address.';
      },

      need: function (value) {
        return value.trim().length >= 10 ||
          'Tell us a little more (10+ characters).';
      }

    };


    function validateField(input) {

      const rule = rules[input.name];

      if (!rule) return true;

      const field = input.closest('.field');

      if (!field) return true;

      const errorEl = field.querySelector('.field-error');

      const result = rule(input.value);

      if (result === true) {

        field.classList.remove('has-error');

        if (errorEl) {
          errorEl.textContent = '';
        }

        return true;

      } else {

        field.classList.add('has-error');

        if (errorEl) {
          errorEl.textContent = result;
        }

        return false;
      }

    }


    form.querySelectorAll('input, textarea').forEach(function (input) {

      input.addEventListener('blur', function () {
        validateField(input);
      });

    });


    form.addEventListener('submit', function (e) {

      e.preventDefault();

      const fields = form.querySelectorAll(
        'input[required], textarea[required]'
      );

      let valid = true;

      fields.forEach(function (field) {

        if (!validateField(field)) {
          valid = false;
        }

      });


      if (!valid) {

        if (status) {
          status.textContent =
            'Please fix the highlighted fields.';

          status.className =
            'form-status is-error';
        }

        return;
      }


      if (status) {

        status.textContent =
          'This form is not connected to a backend yet.';

        status.className =
          'form-status is-error';

      }

    });

  }


  /* ========================================================================
     SCROLLSPY
     ======================================================================== */

  function initScrollspy() {

    const links = document.querySelectorAll(
      '.nav-links a[href^="#"]'
    );

    if (!links.length) return;

    const map = new Map();

    links.forEach(function (link) {

      const id = link
        .getAttribute('href')
        .slice(1);

      const section =
        document.getElementById(id);

      if (section) {
        map.set(section, link);
      }

    });

    if (!map.size) return;

    const observer =
      new IntersectionObserver(

        function (entries) {

          entries.forEach(function (entry) {

            const link =
              map.get(entry.target);

            if (!link) return;

            if (entry.isIntersecting) {

              links.forEach(function (item) {
                item.classList.remove('is-active');
              });

              link.classList.add('is-active');

            }

          });

        },

        {
          rootMargin: '-45% 0px -50% 0px',
          threshold: 0
        }

      );


    map.forEach(function (_, section) {
      observer.observe(section);
    });

  }


  /* ========================================================================
     LIGHTBOX
     ======================================================================== */

  function initLightbox() {

    const lightbox =
      document.getElementById('lightbox');

    const lightboxImg =
      document.getElementById('lightbox-img');

    const closeBtn =
      document.getElementById('lightbox-close');

    if (!lightbox || !lightboxImg || !closeBtn) {
      return;
    }


    function open(item) {

      const img = item.querySelector('img');

      if (!img) return;

      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || '';

      lightbox.classList.add('is-open');

      lightbox.setAttribute(
        'aria-hidden',
        'false'
      );

      document.body.style.overflow = 'hidden';

    }


    function close() {

      lightbox.classList.remove('is-open');

      lightbox.setAttribute(
        'aria-hidden',
        'true'
      );

      document.body.style.overflow = '';

    }


    document
      .querySelectorAll('.lightbox-trigger')
      .forEach(function (item) {

        item.addEventListener('click', function () {
          open(item);
        });

        item.addEventListener('keydown', function (e) {

          if (
            e.key === 'Enter' ||
            e.key === ' '
          ) {

            e.preventDefault();
            open(item);

          }

        });

      });


    closeBtn.addEventListener('click', close);

    lightbox.addEventListener('click', function (e) {

      if (e.target === lightbox) {
        close();
      }

    });


    document.addEventListener('keydown', function (e) {

      if (e.key === 'Escape') {
        close();
      }

    });

  }


  /* ========================================================================
     BOOT
     ======================================================================== */

  function boot() {

    initLenis();

    initNavBehavior();

    initMobileMenu();

    initContactForm();

    initScrollspy();

    initLightbox();

//temorary fix for animations not working on page load
    //if (window.PRAnimations) {
    //  window.PRAnimations.init();
    //}


    if (
      typeof ScrollTrigger !== 'undefined'
    ) {

      window.addEventListener(
        'resize',
        function () {
          ScrollTrigger.refresh();
        }
      );

    }

  }


  /* ========================================================================
     START
     ======================================================================== */

  document.addEventListener(
    'DOMContentLoaded',
    function () {
      runLoader(boot);
    }
  );

})();