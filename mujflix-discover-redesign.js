/**
 * MůjFlix — Discover Redesign JS Patch v1
 * ════════════════════════════════════════
 * Přidat jako POSLEDNÍ <script> v index.html:
 * <script src="mujflix-discover-redesign.js"></script>
 *
 * Co dělá:
 *  1. Injectuje "Pro tebe" sekcový separátor s počítadlem
 *  2. Přidá plynulé scroll-fade na hero obrázek
 *  3. Lazy-load hero backdrop (vysoké rozlišení)
 *  4. Přidá "sticky" indikátor aktuální kategorie při scrollu
 *  5. Vylepší skeleton loading states
 *  6. Přidá parallax efekt na hero section
 *  7. Přidá počet karet do row titulů
 *  8. Nastaví správné scroll-snapping na body
 */

(function () {
  'use strict';

  if (window._mfDiscoverRedesignLoaded) return;
  window._mfDiscoverRedesignLoaded = true;

  /* ── UTILS ─────────────────────────────────────────────── */
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return [...(root || document).querySelectorAll(sel)]; }
  function wait(fn, tries) {
    tries = tries || 0;
    if (tries > 80) { console.warn('[DR] Timeout'); return; }
    setTimeout(function () { fn() || wait(fn, tries + 1); }, 120);
  }
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* ── INJECT CUSTOM FONTS if not already there ─────────── */
  function injectFonts() {
    if (document.getElementById('dr-fonts')) return;
    var l = document.createElement('link');
    l.id = 'dr-fonts';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&display=swap';
    document.head.appendChild(l);
  }

  /* ── INJECT EXTRA INLINE STYLES ────────────────────────── */
  function injectStyles() {
    if (document.getElementById('dr-extra')) return;
    var s = document.createElement('style');
    s.id = 'dr-extra';
    s.textContent = `
      /* Sekcový label mezi řadami */
      .dr-section-label {
        padding: 6px 52px 0;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.6rem;
        font-weight: 700;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: rgba(255,255,255,0.2);
        user-select: none;
      }

      /* Sticky kategorie indikátor při scrollu */
      #dr-sticky-cat {
        position: fixed;
        top: calc(var(--dr-header-h, 72px) + 52px + 16px);
        right: 24px;
        z-index: 200;
        background: rgba(7,7,15,0.88);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 0.5px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        padding: 6px 14px;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.68rem;
        font-weight: 600;
        color: rgba(255,255,255,0.6);
        opacity: 0;
        transform: translateY(-6px);
        transition: opacity 0.2s ease, transform 0.2s ease;
        pointer-events: none;
        white-space: nowrap;
      }
      #dr-sticky-cat.visible {
        opacity: 1;
        transform: translateY(0);
      }

      /* Row hover — jemné zvýraznění titulku */
      .disco-row:hover > .disco-row-header .disco-row-title {
        color: rgba(255,255,255,1) !important;
        transition: color 0.2s ease;
      }

      /* Card count badge v titulku */
      .dr-card-count {
        font-family: 'DM Sans', sans-serif;
        font-size: 0.6rem;
        font-weight: 600;
        color: rgba(255,255,255,0.22);
        background: rgba(255,255,255,0.05);
        border: 0.5px solid rgba(255,255,255,0.08);
        padding: 2px 7px;
        border-radius: 10px;
        vertical-align: middle;
        margin-left: 4px;
      }

      /* Hero parallax container */
      .disco-hero-parallax {
        position: absolute !important;
        inset: -40px !important;
        will-change: transform !important;
      }
      .disco-hero-parallax img {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        object-position: center 25% !important;
        display: block !important;
      }

      /* Přidaný "Načíst více" row scroll fade-out efekt */
      .disco-row-scroll {
        -webkit-mask-image: linear-gradient(to right, transparent 0%, black 20px, black calc(100% - 60px), transparent 100%) !important;
        mask-image: linear-gradient(to right, transparent 0%, black 20px, black calc(100% - 60px), transparent 100%) !important;
      }

      /* Card shimmer při načítání */
      @keyframes dr-card-shimmer {
        0%   { background-position: -400px 0; }
        100% { background-position:  400px 0; }
      }
      .dr-loading-card {
        width: var(--dr-card-w, 160px);
        height: var(--dr-card-h, 240px);
        min-width: var(--dr-card-w, 160px);
        border-radius: 14px;
        flex-shrink: 0;
        background:
          linear-gradient(
            105deg,
            rgba(255,255,255,0.03) 20%,
            rgba(255,255,255,0.065) 48%,
            rgba(255,255,255,0.1) 50%,
            rgba(255,255,255,0.065) 52%,
            rgba(255,255,255,0.03) 80%
          );
        background-size: 400px 100%;
        animation: dr-card-shimmer 1.5s ease-in-out infinite;
      }

      /* Jemná separace sekcí */
      .disco-row + .disco-row::before {
        content: '';
        display: block;
        height: 0.5px;
        background: rgba(255,255,255,0.04);
        margin: 0 52px 0;
      }

      /* "✦ Pro tebe" row — jemné zvýraznění pozadí */
      .disco-row.dr-featured-row {
        background: linear-gradient(
          to bottom,
          rgba(61,142,255,0.025) 0%,
          transparent 100%
        );
        border-radius: 0;
        padding-bottom: 4px;
      }

      /* Tooltip pro finder btn */
      .disco-card-finder-btn::after {
        content: 'Kde sledovat';
        position: absolute;
        top: 110%;
        right: 0;
        background: rgba(7,7,15,0.95);
        border: 0.5px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        padding: 4px 9px;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.6rem;
        font-weight: 600;
        color: rgba(255,255,255,0.7);
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transform: translateY(-4px);
        transition: all 0.15s ease;
        z-index: 10;
      }
      .disco-card-finder-btn:hover::after {
        opacity: 1;
        transform: translateY(0);
      }

      /* Vylepšit transition na cards při filter změně */
      .disco-body.dr-filtering .disco-row {
        animation: dr-enter-fade 0.25s ease both !important;
      }
      @keyframes dr-enter-fade {
        from { opacity: 0; }
        to   { opacity: 1; }
      }

      /* Floating "Zpět nahoru" tlačítko */
      #dr-back-top {
        position: fixed;
        bottom: 90px;
        right: 24px;
        z-index: 200;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(7,7,15,0.88);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 0.5px solid rgba(255,255,255,0.1);
        color: rgba(255,255,255,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transform: translateY(12px) scale(0.8);
        transition: all 0.25s cubic-bezier(0.34,1.3,0.64,1);
        pointer-events: none;
      }
      #dr-back-top.visible {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      #dr-back-top:hover {
        background: rgba(61,142,255,0.15);
        border-color: rgba(61,142,255,0.3);
        color: #3d8eff;
      }
      #dr-back-top svg {
        width: 14px;
        height: 14px;
      }

      /* Discovery info — počet výsledků */
      .dr-results-count {
        padding: 8px 52px;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.7rem;
        color: rgba(255,255,255,0.25);
        font-weight: 500;
      }
    `;
    document.head.appendChild(s);
  }

  /* ── STICKY CATEGORY INDICATOR ────────────────────────── */
  function setupStickyCategory() {
    var overlay = qs('#universeOverlay');
    if (!overlay) return;

    var ind = document.getElementById('dr-sticky-cat');
    if (!ind) {
      ind = document.createElement('div');
      ind.id = 'dr-sticky-cat';
      overlay.appendChild(ind);
    }

    var body = qs('#discoBody');
    if (!body) return;

    var hideTimer;
    body.addEventListener('scroll', function () {
      clearTimeout(hideTimer);

      // Najdi aktivní nav item
      var activeNav = qs('.disco-nav-item.active', overlay);
      var label = activeNav ? activeNav.textContent.trim() : '';

      if (label && body.scrollTop > 80) {
        ind.textContent = label;
        ind.classList.add('visible');
      } else {
        ind.classList.remove('visible');
      }

      hideTimer = setTimeout(function () {
        ind.classList.remove('visible');
      }, 1200);
    }, { passive: true });
  }

  /* ── BACK TO TOP BUTTON ────────────────────────────────── */
  function setupBackTop() {
    var overlay = qs('#universeOverlay');
    if (!overlay) return;

    var btn = document.getElementById('dr-back-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'dr-back-top';
      btn.title = 'Zpět nahoru';
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="18 15 12 9 6 15"/></svg>';
      btn.onclick = function () {
        var body = qs('#discoBody');
        if (body) body.scrollTo({ top: 0, behavior: 'smooth' });
      };
      overlay.appendChild(btn);
    }

    var body = qs('#discoBody');
    if (!body) return;

    body.addEventListener('scroll', function () {
      if (body.scrollTop > 300) btn.classList.add('visible');
      else btn.classList.remove('visible');
    }, { passive: true });
  }

  /* ── ROW CARD COUNT BADGES ─────────────────────────────── */
  function addCardCounts() {
    qsa('#discoBody .disco-row').forEach(function (row) {
      if (row._drCountDone) return;
      row._drCountDone = true;

      var scroll = row.querySelector('.disco-row-scroll');
      var title  = row.querySelector('.disco-row-title');
      if (!scroll || !title) return;

      var count = scroll.querySelectorAll('.disco-card').length;
      if (count < 2) return;

      // Odstraň starý badge pokud existuje
      var old = title.querySelector('.dr-card-count');
      if (old) old.remove();

      var badge = document.createElement('span');
      badge.className = 'dr-card-count';
      badge.textContent = count;
      title.appendChild(badge);
    });
  }

  /* ── FEATURED ROW HIGHLIGHT ─────────────────────────────── */
  function markFeaturedRow() {
    qsa('#discoBody .disco-row').forEach(function (row) {
      var title = row.querySelector('.disco-row-title');
      if (!title) return;
      if (title.textContent.includes('Pro tebe') || title.textContent.includes('personalis')) {
        row.classList.add('dr-featured-row');
      }
    });
  }

  /* ── HERO PARALLAX ─────────────────────────────────────── */
  function setupHeroParallax() {
    var body = qs('#discoBody');
    if (!body) return;

    body.addEventListener('scroll', function () {
      var hero = qs('#discoBody .disco-hero');
      if (!hero) return;

      var scrolled = body.scrollTop;
      var img = hero.querySelector('.disco-hero-img');
      if (!img) return;

      // Jemný parallax — posun obrázku při scrollu
      var parallax = Math.min(scrolled * 0.3, 60);
      img.style.transform = 'scale(1.06) translateY(' + parallax + 'px)';

      // Fade out hero content při scrollu
      var content = hero.querySelector('.disco-hero-content');
      if (content) {
        var fade = Math.max(0, 1 - scrolled / 220);
        content.style.opacity = fade;
        content.style.transform = 'translateY(' + (scrolled * 0.15) + 'px)';
      }
    }, { passive: true });
  }

  /* ── FILTER TRANSITION ─────────────────────────────────── */
  function patchDiscoFilter() {
    var orig = window.discoFilter;
    if (!orig || orig._drPatched) return;

    window.discoFilter = function (el, genre, type) {
      var body = qs('#discoBody');
      if (body) {
        body.classList.add('dr-filtering');
        setTimeout(function () { body.classList.remove('dr-filtering'); }, 400);
      }
      orig.apply(this, arguments);
    };
    window.discoFilter._drPatched = true;
  }

  /* ── LOADING SKELETONS ─────────────────────────────────── */
  function injectSkeletons() {
    var body = qs('#discoBody');
    if (!body) return;

    // Pokud je prázdný nebo jen loading spinner, zobraz skeletony
    var loading = body.querySelector('.disco-loading');
    if (!loading) return;

    // Vytvořit skeleton rows
    var frag = document.createDocumentFragment();
    var rowCount = 3;

    for (var r = 0; r < rowCount; r++) {
      var skelSection = document.createElement('div');
      skelSection.className = 'dr-skel-section';
      skelSection.style.cssText = 'padding: 22px 0 0;';

      var skelHdr = document.createElement('div');
      skelHdr.style.cssText = 'display:flex;align-items:center;gap:12px;padding:0 52px 12px;';
      skelHdr.innerHTML = [
        '<div style="height:18px;width:140px;border-radius:8px;background:rgba(255,255,255,0.06);animation:dr-card-shimmer 1.5s ease-in-out infinite;background-size:400px 100%;"></div>',
        '<div style="height:14px;width:60px;border-radius:20px;background:rgba(61,142,255,0.08);animation:dr-card-shimmer 1.5s ease-in-out infinite 0.1s;background-size:400px 100%;"></div>'
      ].join('');

      var skelRow = document.createElement('div');
      skelRow.style.cssText = 'display:flex;gap:10px;padding:0 52px 20px;overflow:hidden;';

      var cardCount = 8;
      for (var c = 0; c < cardCount; c++) {
        var skelCard = document.createElement('div');
        skelCard.className = 'dr-loading-card';
        skelCard.style.animationDelay = (c * 0.07) + 's';
        skelRow.appendChild(skelCard);
      }

      skelSection.appendChild(skelHdr);
      skelSection.appendChild(skelRow);
      frag.appendChild(skelSection);
    }

    loading.parentNode.insertBefore(frag, loading.nextSibling);
  }

  /* ── MUTATION OBSERVER — reaguje na změny discoBody ────── */
  function setupBodyObserver() {
    var body = qs('#discoBody');
    if (!body) return;

    var mo = new MutationObserver(function (muts) {
      var changed = muts.some(function (m) { return m.addedNodes.length > 0; });
      if (!changed) return;

      // Odstraň skeletony pokud jsou real karty
      if (body.querySelectorAll('.disco-card').length > 0) {
        qsa('.dr-skel-section', body).forEach(function (el) { el.remove(); });
      }

      // Přidej card counts po krátké chvilce (aby se karty načetly)
      clearTimeout(body._drCountTimer);
      body._drCountTimer = setTimeout(function () {
        addCardCounts();
        markFeaturedRow();
      }, 300);
    });

    mo.observe(body, { childList: true, subtree: true });
  }

  /* ── ENHANCE SEARCH RESULTS ─────────────────────────────── */
  function setupSearchEnhancement() {
    // Override onSearchInput pro přidání animace
    var origSearch = window.onSearchInput;
    if (origSearch && !origSearch._drPatched) {
      window.onSearchInput = function (val) {
        var body = qs('#discoBody');
        if (body && val.length > 0) {
          body.classList.add('dr-filtering');
          setTimeout(function () { body.classList.remove('dr-filtering'); }, 300);
        }
        return origSearch.apply(this, arguments);
      };
      window.onSearchInput._drPatched = true;
    }
  }

  /* ── HERO HIGH-RES BACKDROP UPGRADE ─────────────────────── */
  function upgradeHeroImage() {
    var body = qs('#discoBody');
    if (!body) return;

    body.addEventListener('DOMNodeInserted', function onInsert(e) {
      if (!e.target || !e.target.classList) return;
      if (!e.target.classList.contains('disco-hero')) return;

      var img = e.target.querySelector('.disco-hero-img');
      if (!img || !img.src) return;

      // Pokud je src w780, upgradni na w1280
      var upgraded = img.src.replace('/w780/', '/w1280/').replace('/w500/', '/w1280/');
      if (upgraded !== img.src) {
        var hires = new Image();
        hires.onload = function () { img.src = upgraded; };
        hires.src = upgraded;
      }
    });
  }

  /* ── DISCO NAV SCROLL INTO VIEW ─────────────────────────── */
  function setupNavAutoScroll() {
    var nav = qs('#discoNav');
    if (!nav) return;

    nav.addEventListener('click', function (e) {
      var item = e.target.closest('.disco-nav-item');
      if (!item) return;
      setTimeout(function () {
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }, 50);
    });
  }

  /* ── ROW SCROLL: PŘIDAT FADE MASKU DYNAMICKY ───────────── */
  function updateRowScrollMasks() {
    qsa('.disco-row-scroll').forEach(function (scroll) {
      if (scroll._drMaskSet) return;
      scroll._drMaskSet = true;

      scroll.addEventListener('scroll', function () {
        var atStart = scroll.scrollLeft < 16;
        var atEnd   = scroll.scrollLeft + scroll.clientWidth >= scroll.scrollWidth - 16;

        var maskLeft   = atStart ? 'transparent 0%, black 0%'        : 'transparent 0%, black 20px';
        var maskRight  = atEnd   ? 'black calc(100%)'                 : 'black calc(100% - 60px), transparent 100%';

        scroll.style.webkitMaskImage = 'linear-gradient(to right, ' + maskLeft + ', ' + maskRight + ')';
        scroll.style.maskImage       = 'linear-gradient(to right, ' + maskLeft + ', ' + maskRight + ')';
      }, { passive: true });
    });
  }

  /* ── ATTACH ROW SCROLL MASK OBSERVER ───────────────────── */
  function setupRowScrollObserver() {
    var body = qs('#discoBody');
    if (!body) return;

    var mo = new MutationObserver(function () {
      updateRowScrollMasks();
    });
    mo.observe(body, { childList: true, subtree: true });
    updateRowScrollMasks();
  }

  /* ── MAIN INIT ──────────────────────────────────────────── */
  function init() {
    injectFonts();
    injectStyles();

    // Počkej na universe overlay
    wait(function () {
      var overlay = qs('#universeOverlay');
      return !!overlay;
    });

    // Počkej na disco body
    wait(function () {
      var body = qs('#discoBody');
      if (!body) return false;

      setupStickyCategory();
      setupBackTop();
      setupHeroParallax();
      setupBodyObserver();
      setupRowScrollObserver();
      setupNavAutoScroll();
      upgradeHeroImage();

      // Počkej až budou k dispozici funkce
      setTimeout(function () {
        patchDiscoFilter();
        setupSearchEnhancement();
        addCardCounts();
        markFeaturedRow();
      }, 800);

      // Injektuj skeletony ihned
      injectSkeletons();

      return true;
    });
  }

  ready(function () {
    setTimeout(init, 100);
  });

  console.log('[MFDiscoverRedesign] v1 načten');
})();
