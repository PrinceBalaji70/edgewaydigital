/* ============================================================
   js/main.js — Edgeway Digital Services
   Handles: Navbar, Hamburger, Scroll Reveal, Typewriter, Counters
   ============================================================ */

(function () {
  'use strict';

  /* ── Navbar scroll shadow ───────────────────────────────── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ── Hamburger menu ─────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });

  // Close menu on nav link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    }
  });

  /* ── Scroll Reveal (IntersectionObserver) ───────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObs.observe(el));

  /* ── Typewriter Effect ──────────────────────────────────── */
  const typeTarget = document.getElementById('typewriter');
  const phrases = [
    'Digital Advertising',
    'Programmatic Campaigns',
    'Ad Tech Solutions',
    'Campaign Performance',
  ];
  let phraseIdx = 0, charIdx = 0, deleting = false;

  function typewriter() {
    const currentPhrase = phrases[phraseIdx];

    if (!deleting) {
      typeTarget.textContent = currentPhrase.slice(0, ++charIdx);
      if (charIdx === currentPhrase.length) {
        deleting = true;
        setTimeout(typewriter, 1800); // pause at full word
        return;
      }
    } else {
      typeTarget.textContent = currentPhrase.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
    }
    setTimeout(typewriter, deleting ? 55 : 100);
  }

  // Add cursor class
  typeTarget.classList.add('typewriter-cursor');
  typewriter();

  /* ── Animated Counters ──────────────────────────────────── */
  const statEls = document.querySelectorAll('[data-target]');

  function animateCounter(el) {
    const target = +el.dataset.target;
    const duration = 1200;
    const step = target / (duration / 16);
    let current = 0;

    const tick = () => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current);
      if (current < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statEls.forEach(el => counterObs.observe(el));

  /* ── Smooth scroll polyfill for older Safari ────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
