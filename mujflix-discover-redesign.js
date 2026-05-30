/**
 * MůjFlix — Discover Total Redesign JS v2
 * ════════════════════════════════════════
 * Přidat jako POSLEDNÍ <script> před </body>:
 * <script src="mujflix-discover-redesign.js"></script>
 */
(function () {
  'use strict';
  if (window._mfDiscoverRedesignLoaded) return;
  window._mfDiscoverRedesignLoaded = true;

  /* ── SVG IKONY PRO NAV ────────────────────────────────────────────── */
  var NAV_ICONS = {
    'Trending':             '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M2 14l4-4 3 3 4-5 3 3"/><path d="M14 6h4v4" stroke-width="1.6"/></svg>',
    'Filmy':                '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14"><rect x="2" y="4" width="16" height="13" rx="2"/><path d="M2 8h16M7 4v4M13 4v4"/></svg>',
    'Seriály':              '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14"><rect x="1" y="3" width="18" height="13" rx="2"/><path d="M6 17l2-1h4l2 1"/></svg>',
    'Komedie':              '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14"><circle cx="10" cy="9" r="7"/><path d="M7 11c.8 1.5 5.2 1.5 6 0"/><circle cx="8" cy="8" r="0.8" fill="currentColor"/><circle cx="12" cy="8" r="0.8" fill="currentColor"/></svg>',
    'Drama':                '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14"><path d="M4 14c1-3 4-5 6-3s5 0 6-3"/><path d="M3 7c1 3 4 5 6 3s5 0 6 3"/></svg>',
    'Sci-Fi':               '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14"><ellipse cx="10" cy="10" rx="4" ry="4"/><ellipse cx="10" cy="10" rx="9" ry="4"/><path d="M10 1v18M1 10h18" stroke-width="1.2" stroke-dasharray="1 3"/></svg>',
    'Krimi':                '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14"><circle cx="9" cy="9" r="6"/><path d="M13.5 13.5L18 18"/><circle cx="9" cy="9" r="2.5" stroke-dasharray="1.5 2"/></svg>',
    'Horor':                '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14"><path d="M10 2L3 18h14L10 2z"/><path d="M10 8v5M10 15v.5" stroke-width="2"/></svg>',
    'Animované':            '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14"><path d="M3 10c0-4 3-7 7-7s7 3 7 7"/><path d="M6 13c.5 2 1.8 3.5 4 4M10 17c2.2-.5 3.5-2 4-4"/><circle cx="7.5" cy="10" r="1.2" fill="currentColor"/><circle cx="12.5" cy="10" r="1.2" fill="currentColor"/></svg>',
    'Mysteriózní':          '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14"><circle cx="10" cy="10" r="8"/><path d="M10 6c-1.6 0-3 1-3 2.5S8.5 11 10 11"/><circle cx="10" cy="14" r="0.9" fill="currentColor"/></svg>',
    'Akce & Dobrodružství': '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14"><path d="M10 2l1.5 5h5.5l-4.5 3 1.5 5L10 12l-4 3 1.5-5L3 7h5.5z"/></svg>',
    'Reality':              '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14"><circle cx="10" cy="10" r="3.5"/><circle cx="10" cy="10" r="7" stroke-dasharray="2 3"/></svg>',
    'Dokumenty':            '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14"><rect x="4" y="2" width="12" height="16" rx="1.5"/><path d="M7 7h6M7 10h6M7 13h4"/></svg>',
    'Romantika':            '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14"><path d="M10 17S3 12 3 7a4 4 0 017-2.6A4 4 0 0117 7c0 5-7 10-7 10z"/></svg>',
    'Thriller':             '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14"><path d="M10 2v8"/><path d="M6 6l4-4 4 4"/><rect x="4" y="12" width="12" height="6" rx="1.5"/><path d="M10 15v1"/></svg>',
    'Fantasy':              '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14"><path d="M10 2l2 6h6l-5 3.5 2 6L10 14l-5 3.5 2-6L2 8h6z"/></svg>',
    'Sport':                '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14"><circle cx="10" cy="10" r="8"/><path d="M10 2c2 4 2 12 0 16M2 10c4-2 12-2 16 0" stroke-dasharray="2.5 2"/></svg>',
    'Hudba':                '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14"><path d="M9 17V6l9-2v11"/><circle cx="6" cy="17" r="3"/><circle cx="15" cy="15" r="3"/></svg>',
    'Válečné':              '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14"><path d="M3 15h14M6 12l-3 3M14 12l3 3M10 3v9M7 6l3-3 3 3"/></svg>',
    'Historické':           '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14"><path d="M4 18V9l6-6 6 6v9"/><path d="M8 18v-5h4v5"/><path d="M2 9h16" stroke-width="1.4"/></svg>',
    'Rodinné':              '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14"><circle cx="7" cy="6" r="2.5"/><circle cx="13" cy="6" r="2.5"/><path d="M2 18c0-4 10-4 10 0"/><circle cx="14.5" cy="13" r="1.8"/><path d="M11 18c0-2.5 7-2.5 7 0"/></svg>',
  };

  /* ── NAV ITEM IKONY — inject SVG před text ─────────────────────────── */
  function upgradeNavIcons() {
    var navEl = document.getElementById('discoNav');
    if (!navEl) return;
    var items = navEl.querySelectorAll('.disco-nav-item');
    items.forEach(function (item) {
      if (item._drIconDone) return;
      item._drIconDone = true;

      var label = item.textContent.trim();

      // Najdi ikonu — přesná shoda nebo contains
      var svg = NAV_ICONS[label];
      if (!svg) {
        for (var key in NAV_ICONS) {
          if (label.includes(key) || key.includes(label.split(' ')[0])) {
            svg = NAV_ICONS[key]; break;
          }
        }
      }
      if (!svg) return;

      // Odstraň existující emoji (první znak pokud je emoji)
      var text = item.textContent.trim();
      // Odstraň emoji prefix (Unicode ranges)
      text = text.replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F1FF}]\s*/u, '').trim();

      item.innerHTML = svg + '<span>' + text + '</span>';
      item.style.gap = '5px';
      item.style.display = 'inline-flex';
      item.style.alignItems = 'center';
    });
  }

  /* ── HERO PŘEHRÁT + WATCHLIST IKONY ───────────────────────────────── */
  function upgradeHeroBtns() {
    var PLAY_SVG = '<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><polygon points="4,2 14,8 4,14"/></svg>';
    var PLUS_SVG = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="14" height="14"><path d="M8 3v10M3 8h10"/></svg>';

    document.querySelectorAll('.disco-hero-btn').forEach(function (btn) {
      if (btn._drBtnDone) return;
      btn._drBtnDone = true;
      var txt = btn.textContent.trim();

      // Odstraň emoji prefix
      txt = txt.replace(/^[▶►▷▸＋+✚✙✓•·\s]+/, '').trim();

      if (txt.toLowerCase().includes('přehrat') || txt.toLowerCase().includes('přehr')) {
        btn.innerHTML = PLAY_SVG + '<span>' + txt + '</span>';
      } else if (txt.toLowerCase().includes('watchlist') || txt.toLowerCase().includes('přidat')) {
        btn.innerHTML = PLUS_SVG + '<span>' + txt + '</span>';
      }
    });
  }

  /* ── HERO BADGE IKONKY ─────────────────────────────────────────────── */
  function upgradeHeroBadge() {
    document.querySelectorAll('.disco-hero-badge-type').forEach(function (el) {
      if (el._drDone) return;
      el._drDone = true;
      var txt = el.textContent.trim();
      var FILM_SVG = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="11" height="11"><rect x="1" y="3" width="14" height="10" rx="1.5"/><path d="M1 6.5h14M5 3v3.5M11 3v3.5"/></svg>';
      var TV_SVG   = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="11" height="11"><rect x="1" y="2" width="14" height="10" rx="1.5"/><path d="M5 14l2-2h2l2 2"/></svg>';
      txt = txt.replace(/^[🎬📺\s]+/, '').trim();
      if (txt === 'Film' || txt === 'FILM') el.innerHTML = FILM_SVG + '<span> ' + txt + '</span>';
      else if (txt === 'Seriál' || txt === 'SERIÁL') el.innerHTML = TV_SVG + '<span> ' + txt + '</span>';
    });
  }

  /* ── CARD TYPE BADGES — SVG místo emoji ───────────────────────────── */
  function upgradeCardTypes() {
    var FILM_SVG = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" width="9" height="9"><rect x="0.5" y="2" width="11" height="8" rx="1.2"/><path d="M.5 5h11M4 2v3M8 2v3"/></svg>';
    var TV_SVG   = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" width="9" height="9"><rect x=".5" y="1.5" width="11" height="8" rx="1.2"/><path d="M4 11l1.5-1.5h1L8 11"/></svg>';

    document.querySelectorAll('.disco-card-type').forEach(function (el) {
      if (el._drDone) return;
      el._drDone = true;
      var txt = el.textContent.trim();
      txt = txt.replace(/^[🎬📺\s]+/, '').trim();
      if (txt === 'Film') el.innerHTML = FILM_SVG + ' ' + txt;
      else if (txt === 'Seriál') el.innerHTML = TV_SVG + ' ' + txt;
      el.style.display = 'inline-flex';
      el.style.alignItems = 'center';
      el.style.gap = '4px';
    });
  }

  /* ── CARD COUNT BADGE V TITULKU ────────────────────────────────────── */
  function addCardCounts() {
    document.querySelectorAll('#discoBody .disco-row').forEach(function (row) {
      if (row._drCount) return;
      row._drCount = true;
      var scroll = row.querySelector('.disco-row-scroll');
      var title  = row.querySelector('.disco-row-title');
      if (!scroll || !title) return;
      var count = scroll.querySelectorAll('.disco-card').length;
      if (count < 2) return;
      var old = title.querySelector('.dr-count');
      if (old) old.remove();
      var badge = document.createElement('span');
      badge.className = 'dr-count';
      badge.style.cssText = 'font-family:var(--dr-font-b,-apple-system,sans-serif);font-size:0.55rem;font-weight:600;color:rgba(255,255,255,0.2);background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.07);padding:2px 7px;border-radius:10px;margin-left:4px;vertical-align:middle;';
      badge.textContent = count;
      title.appendChild(badge);
    });
  }

  /* ── PARALLAX NA HERO (desktop) ────────────────────────────────────── */
  function setupParallax() {
    var body = document.getElementById('discoBody');
    if (!body) return;
    var ticking = false;
    body.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var hero = body.querySelector('.disco-hero');
        if (!hero) return;
        var s = body.scrollTop;
        var img = hero.querySelector('.disco-hero-img');
        if (img) img.style.transform = 'scale(1.06) translateY(' + Math.min(s * 0.28, 55) + 'px)';
        var content = hero.querySelector('.disco-hero-content');
        if (content) {
          content.style.opacity = Math.max(0, 1 - s / 260);
          content.style.transform = 'translateY(' + s * 0.14 + 'px)';
        }
      });
    }, { passive: true });
  }

  /* ── HERO IMAGE UPGRADE NA HIGH-RES ───────────────────────────────── */
  function upgradeHeroImage() {
    document.querySelectorAll('.disco-hero-img').forEach(function (img) {
      if (img._drHiRes || !img.src) return;
      img._drHiRes = true;
      var hi = img.src.replace('/w780/', '/w1280/').replace('/w500/', '/w1280/').replace('/w342/', '/w780/');
      if (hi !== img.src) {
        var tmp = new Image();
        tmp.onload = function () { img.src = hi; };
        tmp.src = hi;
      }
    });
  }

  /* ── SCROLL HINT ────────────────────────────────────────────────────── */
  function addScrollHint() {
    var hero = document.querySelector('#discoBody .disco-hero');
    if (!hero || hero.querySelector('.disco-scroll-hint')) return;
    var hint = document.createElement('div');
    hint.className = 'disco-scroll-hint';
    hint.style.cssText = 'position:absolute;bottom:18px;left:50%;transform:translateX(-50%);z-index:10;display:flex;flex-direction:column;align-items:center;gap:5px;color:rgba(255,255,255,0.3);font-family:var(--dr-font-b,-apple-system,sans-serif);font-size:0.52rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;pointer-events:auto;cursor:pointer;animation:dr-bounce 2.5s ease-in-out infinite;';
    hint.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16"><path d="M4 6l4 4 4-4"/></svg><span>Scroll</span>';
    hint.onclick = function () {
      var body = document.getElementById('discoBody');
      if (body) body.scrollBy({ top: 300, behavior: 'smooth' });
    };
    hero.appendChild(hint);

    // Skryj po scrollu
    var body = document.getElementById('discoBody');
    if (body) {
      body.addEventListener('scroll', function () {
        hint.style.opacity = body.scrollTop > 30 ? '0' : '';
      }, { passive: true, once: false });
    }
  }

  /* ── BACK TO TOP ──────────────────────────────────────────────────── */
  function setupBackTop() {
    var overlay = document.getElementById('universeOverlay');
    if (!overlay) return;
    var btn = document.getElementById('dr-back-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'dr-back-top';
      btn.title = 'Zpět nahoru';
      btn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="14" height="14"><path d="M4 10l4-4 4 4"/></svg>';
      btn.style.cssText = 'position:fixed;bottom:88px;right:22px;z-index:300;width:38px;height:38px;border-radius:50%;background:rgba(8,8,15,0.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:0.5px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transform:translateY(12px) scale(0.8);transition:all 0.28s cubic-bezier(0.34,1.3,0.64,1);pointer-events:none;';
      btn.onclick = function () {
        var b = document.getElementById('discoBody');
        if (b) b.scrollTo({ top: 0, behavior: 'smooth' });
      };
      overlay.appendChild(btn);
    }
    var body = document.getElementById('discoBody');
    if (!body) return;
    body.addEventListener('scroll', function () {
      var show = body.scrollTop > 320;
      btn.style.opacity = show ? '1' : '0';
      btn.style.transform = show ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.8)';
      btn.style.pointerEvents = show ? 'auto' : 'none';
    }, { passive: true });
  }

  /* ── MUTATION OBSERVER — spustit upgrade při každé změně DOM ──────── */
  function setupObserver() {
    var body = document.getElementById('discoBody');
    if (!body) return;

    var timer;
    var mo = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        upgradeNavIcons();
        upgradeHeroBtns();
        upgradeHeroBadge();
        upgradeCardTypes();
        addCardCounts();
        upgradeHeroImage();
        addScrollHint();
      }, 80);
    });
    mo.observe(body, { childList: true, subtree: true });

    // Observer na nav
    var nav = document.getElementById('discoNav');
    if (nav) {
      var navMo = new MutationObserver(function () {
        clearTimeout(timer);
        timer = setTimeout(upgradeNavIcons, 60);
      });
      navMo.observe(nav, { childList: true, subtree: true, attributes: true });
    }
  }

  /* ── PŘEPSAT INLINE STYLY Z app.js (mf-disco-fx) ────────────────── */
  function patchInlineStyles() {
    // Smaž a znovu aplikuj po každém injektu mf-disco-fx
    var mo = new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        m.addedNodes.forEach(function (n) {
          if (n.id === 'mf-disco-fx' || n.id === 'mf-disco-fxv3' || n.id === 'mf-fx-engine') {
            // Přidej override appended za jejich style tag
            setTimeout(injectOverrideTag, 10);
          }
        });
      });
    });
    mo.observe(document.head, { childList: true });
    injectOverrideTag();
  }

  function injectOverrideTag() {
    var old = document.getElementById('dr-override');
    if (old) old.remove();
    var s = document.createElement('style');
    s.id = 'dr-override';
    s.textContent = [
      // Nav font override
      '.disco-nav-item{font-family:"DM Sans",-apple-system,sans-serif!important;font-size:.8rem!important;font-weight:500!important;letter-spacing:0!important;}',
      // Active nav
      '.disco-nav-item.active,.disco-nav-item.mf-chip-optimistic{background:rgba(255,255,255,0.1)!important;border-color:rgba(255,255,255,0.18)!important;color:rgba(255,255,255,0.96)!important;font-weight:700!important;box-shadow:none!important;transform:none!important;}',
      // Row title
      '.disco-row-title{font-family:"Syne",-apple-system,sans-serif!important;font-size:1.15rem!important;font-weight:800!important;letter-spacing:-.5px!important;line-height:1.2!important;}',
      // Card
      '.disco-card{border-radius:16px!important;transition:transform .3s cubic-bezier(.34,1.44,.64,1),box-shadow .3s cubic-bezier(.25,1,.5,1)!important;}',
      '.disco-card-inner{border-radius:16px!important;}',
      '.disco-card-img{border-radius:16px!important;}',
      // Row spacing override mf-disco-fx
      '.disco-row-header{padding:30px 52px 14px!important;}',
      '.disco-row-scroll{gap:12px!important;padding-left:52px!important;padding-right:52px!important;padding-bottom:28px!important;}',
      // Skeleton tiles bigger
      '.mf-skeleton-tile,.mf-disco-skel-card{width:172px!important;min-width:172px!important;height:258px!important;border-radius:16px!important;}',
      // Hero btn
      '.disco-hero-btn.primary{background:#3b8eff!important;color:#fff!important;box-shadow:0 6px 28px rgba(59,142,255,.4)!important;}',
      '.disco-hero-btn.primary:hover{background:#5aaaff!important;transform:translateY(-2px)!important;box-shadow:0 10px 36px rgba(59,142,255,.55)!important;}',
      // Card rating gold
      '.disco-card-rating{color:#e8c050!important;}',
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ── FONT INJECT ──────────────────────────────────────────────────── */
  function injectFonts() {
    if (document.getElementById('dr-fonts')) return;
    var l = document.createElement('link');
    l.id = 'dr-fonts';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap';
    document.head.appendChild(l);
  }

  /* ── MAIN ─────────────────────────────────────────────────────────── */
  function init() {
    injectFonts();
    patchInlineStyles();

    // Počkej na discoBody
    var tries = 0;
    var poll = setInterval(function () {
      tries++;
      if (tries > 100) { clearInterval(poll); return; }
      var body = document.getElementById('discoBody');
      if (!body) return;
      clearInterval(poll);

      setupObserver();
      setupParallax();
      setupBackTop();

      // Initial run
      setTimeout(function () {
        upgradeNavIcons();
        upgradeHeroBtns();
        upgradeHeroBadge();
        upgradeCardTypes();
        addCardCounts();
        upgradeHeroImage();
        addScrollHint();
      }, 400);

      // Re-run several times to catch app.js renders
      [800, 1500, 3000].forEach(function (t) {
        setTimeout(function () {
          upgradeNavIcons();
          upgradeHeroBtns();
          upgradeHeroBadge();
          upgradeCardTypes();
          addCardCounts();
          upgradeHeroImage();
          injectOverrideTag();
        }, t);
      });
    }, 120);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 100); });
  } else {
    setTimeout(init, 100);
  }

  console.log('[MFDiscoverRedesign] v2 načten');
})();
