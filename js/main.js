/**
 * Keagr Photography Portfolio — Main JavaScript
 */
(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────
     HELPERS
  ────────────────────────────────────────────────────────── */
  function qs(sel, ctx)    { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx)   { return Array.from((ctx || document).querySelectorAll(sel)); }
  function on(el, ev, fn)  { if (el) el.addEventListener(ev, fn); }

  /* ──────────────────────────────────────────────────────────
     FOOTER YEAR
  ────────────────────────────────────────────────────────── */
  var yearEl = qs('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ──────────────────────────────────────────────────────────
     NAVBAR — Scroll Background & Mobile Toggle
  ────────────────────────────────────────────────────────── */
  var navbar    = qs('#navbar');
  var navToggle = qs('#navToggle');
  var navLinks  = qs('#navLinks');

  function updateNav() {
    if (!navbar) return;
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  on(window, 'scroll', updateNav);
  updateNav();

  on(navToggle, 'click', function () {
    var open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    // Animate hamburger → X
    var spans = qsa('span', navToggle);
    if (open) {
      spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      spans.forEach(function (s) { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Close mobile nav on link click
  qsa('a', navLinks).forEach(function (link) {
    on(link, 'click', function () {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      qsa('span', navToggle).forEach(function (s) { s.style.transform = ''; s.style.opacity = ''; });
    });
  });

  /* ──────────────────────────────────────────────────────────
     HERO PARALLAX
  ────────────────────────────────────────────────────────── */
  var heroBg = qs('#heroBg');

  if (heroBg && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    on(window, 'scroll', function () {
      var offset = window.scrollY;
      heroBg.style.transform = 'scale(1.05) translateY(' + (offset * 0.25) + 'px)';
    });
  }

  /* ──────────────────────────────────────────────────────────
     GALLERY FILTER
  ────────────────────────────────────────────────────────── */
  var filterBtns = qsa('.filter-btn');
  var galleryItems = qsa('.gallery-item');

  filterBtns.forEach(function (btn) {
    on(btn, 'click', function () {
      var filter = btn.dataset.filter;

      // Update active state
      filterBtns.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Show/hide items
      galleryItems.forEach(function (item) {
        var cat = item.dataset.category;
        if (filter === 'all' || cat === filter) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  /* ──────────────────────────────────────────────────────────
     LIGHTBOX
  ────────────────────────────────────────────────────────── */
  var lightbox     = qs('#lightbox');
  var lbImg        = qs('#lightboxImg');
  var lbTitle      = qs('#lightboxTitle');
  var lbSub        = qs('#lightboxSub');
  var lbClose      = qs('#lightboxClose');
  var lbPrev       = qs('#lightboxPrev');
  var lbNext       = qs('#lightboxNext');

  var visibleItems = [];
  var currentIndex = 0;

  function getVisibleItems() {
    return qsa('.gallery-item:not(.hidden)');
  }

  function openLightbox(index) {
    visibleItems = getVisibleItems();
    if (!visibleItems.length) return;
    currentIndex = Math.max(0, Math.min(index, visibleItems.length - 1));
    loadLightboxItem(currentIndex);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function loadLightboxItem(index) {
    var item   = visibleItems[index];
    var img    = qs('img', item);
    var capH   = qs('.gallery-caption h3', item);
    var capP   = qs('.gallery-caption p', item);

    // Use full-quality image (replace w=800 with w=1400)
    var src = img.src.replace(/w=\d+/, 'w=1400');
    lbImg.src   = src;
    lbImg.alt   = img.alt;
    lbTitle.textContent = capH ? capH.textContent : '';
    lbSub.textContent   = capP ? capP.textContent : '';

    // Show/hide nav buttons
    lbPrev.style.visibility = index === 0 ? 'hidden' : 'visible';
    lbNext.style.visibility = index === visibleItems.length - 1 ? 'hidden' : 'visible';
  }

  // Open on gallery item click
  galleryItems.forEach(function (item, i) {
    on(item, 'click', function () {
      // Find index among currently visible items
      var visible = getVisibleItems();
      var idx = visible.indexOf(item);
      openLightbox(idx);
    });

    // Keyboard accessibility
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', function () {
      var h = qs('.gallery-caption h3', item);
      return h ? 'View photo: ' + h.textContent : 'View photo';
    }());
    on(item, 'keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
    });
  });

  on(lbClose, 'click', closeLightbox);
  on(lightbox, 'click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  on(lbPrev, 'click', function () {
    if (currentIndex > 0) { currentIndex--; loadLightboxItem(currentIndex); }
  });

  on(lbNext, 'click', function () {
    if (currentIndex < visibleItems.length - 1) { currentIndex++; loadLightboxItem(currentIndex); }
  });

  on(document, 'keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   lbPrev.click();
    if (e.key === 'ArrowRight')  lbNext.click();
  });

  /* ──────────────────────────────────────────────────────────
     SCROLL REVEAL
  ────────────────────────────────────────────────────────── */
  var revealEls = qsa('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    // Fallback: just show everything
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ──────────────────────────────────────────────────────────
     CONTACT FORM (client-side validation + Formspree ready)
  ────────────────────────────────────────────────────────── */
  var form     = qs('#contactForm');
  var formNote = qs('#formNote');

  function showNote(msg, type) {
    if (!formNote) return;
    formNote.textContent  = msg;
    formNote.className    = 'form-note ' + type;
    formNote.hidden       = false;
  }

  on(form, 'submit', function (e) {
    e.preventDefault();

    var name    = qs('#name', form).value.trim();
    var email   = qs('#email', form).value.trim();
    var message = qs('#message', form).value.trim();

    if (!name || !email || !message) {
      showNote('Please fill in all required fields.', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showNote('Please enter a valid email address.', 'error');
      return;
    }

    /**
     * To enable real form submissions, sign up at https://formspree.io
     * and replace the action URL below with your endpoint, e.g.:
     *   form.action = 'https://formspree.io/f/YOUR_FORM_ID';
     *
     * Then remove the e.preventDefault() above and let the form submit.
     *
     * Or use Netlify Forms by adding data-netlify="true" to the <form> tag.
     */

    // Demo success state
    var btn = qs('button[type=submit]', form);
    btn.disabled    = true;
    btn.textContent = 'Sending…';

    setTimeout(function () {
      showNote('Message sent! I\'ll get back to you soon.', 'success');
      form.reset();
      btn.disabled    = false;
      btn.textContent = 'Send Message';
    }, 1000);
  });

  /* ──────────────────────────────────────────────────────────
     ADD REVEAL CLASS TO KEY SECTIONS
  ────────────────────────────────────────────────────────── */
  qsa('.section-header, .about-image, .about-text, .contact-info, .contact-form, .gallery-item, .insta-item').forEach(function (el) {
    el.classList.add('reveal');
  });

  // Re-trigger observer for dynamically added elements
  if (typeof revealObserver !== 'undefined') {
    qsa('.reveal').forEach(function (el) {
      if (!el.classList.contains('visible')) revealObserver.observe(el);
    });
  }

})();
