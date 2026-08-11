/* ==========================================================================
   PR BY SPILIFT — ANIMATIONS
   All GSAP / ScrollTrigger choreography lives here.
   main.js calls PRAnimations.init() once Lenis + the loader are ready.
   ========================================================================== */

window.PRAnimations = (function () {
  gsap.registerPlugin(ScrollTrigger);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.matchMedia('(max-width: 1024px)').matches;

  /* ---------------------------------------------------------------------
     Utility: split an element's text into <span class="word"> wrappers
     already present in the hero markup; for other elements we split here.
     --------------------------------------------------------------------- */
  function splitWords(el) {
    const text = el.textContent.trim();
    el.innerHTML = '';
    text.split(' ').forEach((w, i, arr) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.style.display = 'inline-block';
      span.textContent = w + (i < arr.length - 1 ? '\u00A0' : '');
      el.appendChild(span);
    });
  }

  function splitLinesForReveal() {
    document.querySelectorAll('.reveal-lines .reveal-line').forEach((line) => {
      const inner = document.createElement('span');
      inner.className = 'reveal-line-inner';
      inner.style.display = 'inline-block';
      inner.style.willChange = 'transform';
      while (line.firstChild) inner.appendChild(line.firstChild);
      line.appendChild(inner);
    });
  }

  /* ---------------------------------------------------------------------
     HERO
     --------------------------------------------------------------------- */
  function heroIntro() {
    const tl = gsap.timeline({ delay: 0.1 });
    tl.set('.hero-headline .word', { yPercent: 120, rotate: 4 })
      .set('.hero-eyebrow, .hero-sub, .hero-services, .hero-ctas', { opacity: 0, y: 16 })
      .to('.hero-headline .word', {
        yPercent: 0, rotate: 0, duration: 1.1, ease: 'power4.out', stagger: 0.05
      }, 0.05)
      .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.1)
      .to(['.hero-sub', '.hero-services', '.hero-ctas'], {
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.1
      }, 0.5)
      .from('.nav', { yPercent: -100, duration: 0.8, ease: 'power3.out' }, 0.2);

    // Parallax lines at different speeds on scroll
    gsap.utils.toArray('.hero-headline .line').forEach((line, i) => {
      gsap.to(line, {
        yPercent: (i + 1) * -8,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
      });
    });

    gsap.to('.hero-bg-glow', {
      y: 120, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
    });
  }

  /* ---------------------------------------------------------------------
     GENERIC LINE REVEALS (used by most section headlines)
     --------------------------------------------------------------------- */
  function lineReveals() {
    document.querySelectorAll('.reveal-lines').forEach((headline) => {
      const inners = headline.querySelectorAll('.reveal-line-inner');
      gsap.set(inners, { yPercent: 110 });
      ScrollTrigger.create({
        trigger: headline,
        start: 'top 85%',
        onEnter: () => gsap.to(inners, { yPercent: 0, duration: 1, stagger: 0.08, ease: 'power4.out' }),
        once: true
      });
    });
  }

  function simpleReveals() {
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      gsap.set(el, { opacity: 0, y: 24 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }),
        once: true
      });
    });
  }

  function paragraphSplitReveals() {
    document.querySelectorAll('[data-split]').forEach((p) => {
      gsap.set(p, { opacity: 0, y: 20 });
      ScrollTrigger.create({
        trigger: p,
        start: 'top 88%',
        onEnter: () => gsap.to(p, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }),
        once: true
      });
    });
  }

  /* ---------------------------------------------------------------------
     ABOUT — pinned storytelling section
     --------------------------------------------------------------------- */
  function aboutSection() {
    if (isMobile()) return;
    gsap.to('.about-visual-frame', {
      scale: 1.06, ease: 'none',
      scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: 0.6 }
    });
  }

  /* ---------------------------------------------------------------------
     SERVICES — accordion rows
     --------------------------------------------------------------------- */
  function servicesAccordion() {
    // Desktop reveals the description on hover (CSS-only). On touch devices
    // hover doesn't fire, so tapping toggles an .is-open class instead.
    const cells = document.querySelectorAll('.service-cell');
    cells.forEach((cell) => {
      cell.addEventListener('click', () => {
        if (!isMobile()) return;
        cells.forEach((c) => c !== cell && c.classList.remove('is-open'));
        cell.classList.toggle('is-open');
      });
      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          cells.forEach((c) => c !== cell && c.classList.remove('is-open'));
          cell.classList.toggle('is-open');
        }
      });
      gsap.set(cell, { opacity: 0, y: 20 });
      ScrollTrigger.create({
        trigger: cell, start: 'top 94%',
        onEnter: () => gsap.to(cell, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }),
        once: true
      });
    });
  }

  /* ---------------------------------------------------------------------
     TRUST — big background word + list stagger
     --------------------------------------------------------------------- */
  function trustSection() {
    gsap.fromTo('.trust-bg-word',
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out',
        scrollTrigger: { trigger: '.trust', start: 'top 70%' }
      }
    );
    gsap.to('.trust-bg-word', {
      yPercent: -10, ease: 'none',
      scrollTrigger: { trigger: '.trust', start: 'top bottom', end: 'bottom top', scrub: 0.8 }
    });
  }

  /* ---------------------------------------------------------------------
     PROCESS — horizontal scroll driven by vertical scroll (desktop only)
     --------------------------------------------------------------------- */
  function processSection() {
    const track = document.querySelector('.process-track');
    const pin = document.querySelector('.process-pin');
    if (!track || !pin) return;

    if (isMobile()) {
      gsap.set(track, { x: 0 });
      document.querySelectorAll('.process-step').forEach((step) => {
        gsap.set(step, { opacity: 0, y: 24 });
        ScrollTrigger.create({
          trigger: step, start: 'top 90%',
          onEnter: () => gsap.to(step, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }),
          once: true
        });
      });
      return;
    }

    const getScrollAmount = () => track.scrollWidth - pin.clientWidth;

    let tween = gsap.to(track, {
      x: () => -getScrollAmount(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.process',
        start: 'top top',
        end: () => `+=${getScrollAmount() + window.innerHeight}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true
      }
    });
  }

  /* ---------------------------------------------------------------------
     WHY GRID — block reveal
     --------------------------------------------------------------------- */
  function whyGrid() {
    gsap.utils.toArray('.why-block').forEach((block, i) => {
      gsap.set(block, { opacity: 0, y: 24 });
      ScrollTrigger.create({
        trigger: block, start: 'top 92%',
        onEnter: () => gsap.to(block, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: (i % 3) * 0.06 }),
        once: true
      });
    });
  }

  /* ---------------------------------------------------------------------
     CASE STUDIES — panel reveal + image scale on hover
     --------------------------------------------------------------------- */
  function caseStudies() {
    gsap.utils.toArray('.case-panel').forEach((panel) => {
      gsap.set(panel, { opacity: 0, y: 30 });
      ScrollTrigger.create({
        trigger: panel, start: 'top 90%',
        onEnter: () => gsap.to(panel, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }),
        once: true
      });
    });
  }

  /* ---------------------------------------------------------------------
     CTA — dramatic full screen reveal
     --------------------------------------------------------------------- */
  function ctaSection() {
    gsap.set('.cta-headline .word', { yPercent: 110 });
    ScrollTrigger.create({
      trigger: '.cta', start: 'top 75%',
      onEnter: () => gsap.to('.cta-headline .word', { yPercent: 0, duration: 1, stagger: 0.04, ease: 'power4.out' }),
      once: true
    });
  }

  /* ---------------------------------------------------------------------
     MAGNETIC BUTTONS
     --------------------------------------------------------------------- */
  function magneticButtons() {
    if (isMobile() || reduced) return;
    document.querySelectorAll('.btn').forEach((btn) => {
      const strength = 0.35;
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * strength;
        const y = (e.clientY - rect.top - rect.height / 2) * strength;
        gsap.to(btn, { x, y, duration: 0.4, ease: 'power3.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ---------------------------------------------------------------------
     FAQ ACCORDION
     --------------------------------------------------------------------- */
  function faqAccordion() {
    document.querySelectorAll('.faq-item').forEach((item) => {
      const btn = item.querySelector('.faq-q');
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        document.querySelectorAll('.faq-item').forEach((i) => {
          i.classList.remove('is-open');
          i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
      gsap.set(item, { opacity: 0, y: 16 });
      ScrollTrigger.create({
        trigger: item, start: 'top 92%',
        onEnter: () => gsap.to(item, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }),
        once: true
      });
    });
  }

  /* ---------------------------------------------------------------------
     TESTIMONIAL / TEAM / PARTNER / LOCATION CARD REVEALS
     --------------------------------------------------------------------- */
  function cardReveals(selector, stagger) {
    gsap.utils.toArray(selector).forEach((card, i) => {
      gsap.set(card, { autoAlpha: 0 });
      ScrollTrigger.create({
        trigger: card, start: 'top 92%',
        onEnter: () => gsap.to(card, {
          autoAlpha: 1, duration: 0.6, ease: 'power2.out', delay: (i % 4) * (stagger || 0.06),
          onComplete: () => gsap.set(card, { clearProps: 'opacity,visibility' })
        }),
        once: true
      });
    });
  }

  /* ---------------------------------------------------------------------
     PARTNER BUBBLES — gentle continuous float, like held balloons
     --------------------------------------------------------------------- */
  function partnerFloat() {
    if (reduced) return;
    document.querySelectorAll('.partner-bubble').forEach((bubble, i) => {
      gsap.to(bubble, {
        y: i % 2 === 0 ? -10 : 10,
        duration: 2.4 + (i % 3) * 0.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.15
      });
    });
  }

  /* ---------------------------------------------------------------------
     PUBLIC INIT
     --------------------------------------------------------------------- */
  function init() {
    splitLinesForReveal();

    heroIntro();
    lineReveals();
    simpleReveals();
    paragraphSplitReveals();
    aboutSection();
    servicesAccordion();
    trustSection();
    processSection();
    whyGrid();
    caseStudies();
    ctaSection();
    magneticButtons();
    faqAccordion();
    cardReveals('.testimonial-card');
    cardReveals('.testimonial-chip');
    cardReveals('.partner-bubble');
    cardReveals('.team-card');
    cardReveals('.location-card');
    cardReveals('.stat-card');
    partnerFloat();

    ScrollTrigger.refresh();
  }

  return { init };
})();