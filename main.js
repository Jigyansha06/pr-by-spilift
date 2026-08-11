/* ==========================================================================
   PR BY SPILIFT — MAIN
   Boot sequence: loader -> Lenis smooth scroll -> ScrollTrigger sync ->
   nav behavior -> mobile menu -> contact form validation.
   ========================================================================== */

(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     LOADER
     Target duration ~0.8–1.5s per brief. Runs the progress bar, then
     reveals the page and hands off to PRAnimations.init().
     --------------------------------------------------------------------- */
  function runLoader(done) {
    const loader = document.getElementById('loader');
    if (!loader) return done();

    if (reduced) {
      loader.style.display = 'none';
      return done();
    }

    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        loader.style.display = 'none';
        document.body.style.overflow = '';
        done();
      }
    });

    tl.to('.loader-bar span', { width: '100%', duration: 0.9, ease: 'power2.inOut' }, 0)
      .to('.loader-line', { opacity: 1, duration: 0.01 }, 0)
      .to(loader, { yPercent: -100, duration: 0.6, ease: 'power4.inOut' }, 0.95);
  }

  /* ---------------------------------------------------------------------
     LENIS SMOOTH SCROLL + ScrollTrigger sync
     --------------------------------------------------------------------- */
  function initLenis() {
    if (reduced || typeof Lenis === 'undefined') return null;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.2
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return lenis;
  }

  /* ---------------------------------------------------------------------
     NAVIGATION — hide on scroll down, reveal on scroll up, compress
     --------------------------------------------------------------------- */
  function initNavBehavior() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    let lastY = window.scrollY;

    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const y = window.scrollY;
        nav.classList.toggle('nav--scrolled', y > 40);

        if (self.direction === 1 && y > 160) {
          nav.classList.add('nav--hidden');
        } else if (self.direction === -1) {
          nav.classList.remove('nav--hidden');
        }
        lastY = y;
      }
    });
  }

  /* ---------------------------------------------------------------------
     MOBILE MENU
     --------------------------------------------------------------------- */
  function initMobileMenu() {
    const btn = document.getElementById('hamburger');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    let open = false;

    function toggle() {
      open = !open;
      btn.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }

    btn.addEventListener('click', toggle);
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
      if (open) toggle();
    }));

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && open) toggle();
    });
  }

  /* ---------------------------------------------------------------------
     CONTACT FORM
     No backend is connected yet. To go live, pick ONE:

     1) FORMSPREE
        <form action="https://formspree.io/f/yourFormId" method="POST">
        Remove the preventDefault() below and let it submit natively,
        or fetch() the action URL with FormData.

     2) EMAILJS
        Include the EmailJS SDK, then inside handleSubmit():
        emailjs.sendForm('service_id','template_id', form)

     3) NETLIFY FORMS
        Add data-netlify="true" and a hidden <input name="form-name">
        matching the form's name attribute; Netlify handles the rest.

     4) CUSTOM BACKEND
        fetch('/api/enquiry', { method:'POST', body: JSON.stringify(data) })

     Until one of these is wired up, the form only validates client-side
     and shows a status message — it does not claim to send anything.
     --------------------------------------------------------------------- */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const status = document.getElementById('form-status');

    const rules = {
      name: (v) => v.trim().length >= 2 || 'Please enter your name.',
      phone: (v) => /^[0-9+\-\s()]{7,}$/.test(v.trim()) || 'Please enter a valid phone number.',
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Please enter a valid email address.',
      need: (v) => v.trim().length >= 10 || 'Tell us a little more (10+ characters).'
    };

    function validateField(input) {
      const rule = rules[input.name];
      const field = input.closest('.field');
      const errorEl = field.querySelector('.field-error');
      if (!rule) return true;

      const result = rule(input.value);
      if (result === true) {
        field.classList.remove('has-error');
        errorEl.textContent = '';
        return true;
      } else {
        field.classList.add('has-error');
        errorEl.textContent = result;
        return false;
      }
    }

    form.querySelectorAll('input, textarea').forEach((input) => {
      input.addEventListener('blur', () => validateField(input));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const fields = form.querySelectorAll('input[required], textarea[required]');
      let valid = true;
      fields.forEach((f) => { if (!validateField(f)) valid = false; });

      if (!valid) {
        status.textContent = 'Please fix the highlighted fields.';
        status.className = 'form-status is-error';
        return;
      }

      // No backend is connected — be honest about that instead of faking success.
      status.textContent = 'This form isn\u2019t connected to a backend yet. Hook up Formspree, EmailJS, Netlify Forms or a custom API to send enquiries \u2014 see the comment in js/main.js.';
      status.className = 'form-status is-error';
    });
  }

  /* ---------------------------------------------------------------------
     SCROLLSPY — highlight the nav link for the section in view
     --------------------------------------------------------------------- */
  function initScrollspy() {
    const links = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!links.length) return;

    const map = new Map();
    links.forEach((link) => {
      const id = link.getAttribute('href').slice(1);
      const section = document.getElementById(id);
      if (section) map.set(section, link);
    });
    if (!map.size) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = map.get(entry.target);
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    map.forEach((_, section) => observer.observe(section));
  }

  /* ---------------------------------------------------------------------
     BOOT
     --------------------------------------------------------------------- */
  function boot() {
    const lenis = initLenis();
    initNavBehavior();
    initMobileMenu();
    initContactForm();
    initScrollspy();

    if (window.PRAnimations) window.PRAnimations.init();

    window.addEventListener('resize', () => ScrollTrigger.refresh());
  }

  document.addEventListener('DOMContentLoaded', () => {
    runLoader(boot);
  });
})();