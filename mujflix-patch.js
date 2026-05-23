/**
 * MůjFlix — UI Patch
 * Sleduje #seriesModal.open + smooth hero scroll
 */
(function() {
  'use strict';

  var HERO_FULL    = 180;
  var HERO_MIN     = 0;    // úplně zmizí
  var SCROLL_END   = 160;  // px kdy je plně minimalizováno
  var _interval    = null;
  var _ticking     = false;
  var _lastScroll  = 0;

  // ── Easing: ease-in-out cubic ──
  function easeInOut(t) {
    return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
  }

  // ── CSS injekce ──
  var style = document.createElement('style');
  style.textContent = [
    '.modal-hero { overflow: hidden !important; will-change: height; }',
    '.modal-hero-img { position: absolute !important; top: 0; left: 0; width: 100% !important; height: 100% !important; object-fit: cover !important; }',
    '.modal-hero-content { will-change: opacity, transform; }'
  ].join('\n');
  (document.head || document.documentElement).appendChild(style);

  // ── Dock + profil hide/show ──
  function forceHide() {
    var dock  = document.getElementById('mfDock');
    var badge = document.getElementById('mfProfileBadge');
    if (dock)  { dock.style.setProperty('opacity','0','important'); dock.style.setProperty('transform','translateY(120%)','important'); dock.style.setProperty('pointer-events','none','important'); }
    if (badge) { badge.style.setProperty('opacity','0','important'); badge.style.setProperty('transform','translateY(-10px)','important'); badge.style.setProperty('pointer-events','none','important'); }
  }

  function forceShow() {
    ['mfDock','mfProfileBadge'].forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.style.removeProperty('opacity');
      el.style.removeProperty('transform');
      el.style.removeProperty('pointer-events');
    });
  }

  function startEnforce() {
    forceHide();
    if (_interval) clearInterval(_interval);
    _interval = setInterval(function() {
      var m = document.getElementById('seriesModal');
      if (m && m.classList.contains('open')) forceHide();
      else { clearInterval(_interval); _interval = null; forceShow(); }
    }, 150);
  }

  // ── Hero scroll s rAF ──
  function updateHero(mb) {
    var hero    = document.querySelector('#seriesModal .modal-hero');
    var content = hero && hero.querySelector('.modal-hero-content');
    if (!hero) { _ticking = false; return; }

    var scrolled = mb.scrollTop;
    var raw      = Math.min(1, Math.max(0, scrolled / SCROLL_END));
    var progress = easeInOut(raw);

    // Výška: 180 → 0
    hero.style.height = (HERO_FULL * (1 - progress)) + 'px';

    // Content: fade + posun nahoru, začne mizet od 20% progressu
    if (content) {
      var op = Math.max(0, 1 - (raw - 0.15) / 0.45);
      content.style.opacity      = op;
      content.style.transform    = 'translateY(' + (-12 * progress) + 'px)';
      content.style.pointerEvents = op < 0.1 ? 'none' : '';
    }

    _ticking = false;
  }

  function setupHeroScroll() {
    var mb = document.getElementById('modalBody');
    if (!mb || mb._mfPatch) return;
    mb._mfPatch = true;

    mb.addEventListener('scroll', function() {
      _lastScroll = mb.scrollTop;
      if (!_ticking) {
        _ticking = true;
        requestAnimationFrame(function() { updateHero(mb); });
      }
    }, { passive: true });
  }

  // ── Sleduj #seriesModal.open ──
  function init() {
    var modal = document.getElementById('seriesModal');
    if (!modal) { setTimeout(init, 200); return; }

    var wasOpen = modal.classList.contains('open');
    if (wasOpen) { startEnforce(); setTimeout(setupHeroScroll, 400); }

    new MutationObserver(function() {
      var isOpen = modal.classList.contains('open');
      if (isOpen === wasOpen) return;
      wasOpen = isOpen;
      if (isOpen) {
        startEnforce();
        setTimeout(setupHeroScroll, 400);
      } else {
        forceShow();
        if (_interval) { clearInterval(_interval); _interval = null; }
        var hero    = document.querySelector('#seriesModal .modal-hero');
        var content = hero && hero.querySelector('.modal-hero-content');
        var mb      = document.getElementById('modalBody');
        if (hero)    hero.style.height = HERO_FULL + 'px';
        if (content) { content.style.opacity = '1'; content.style.transform = ''; content.style.pointerEvents = ''; }
        if (mb)      mb._mfPatch = false;
      }
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState !== 'loading') setTimeout(init, 50);
  else document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 50); });

  console.log('[MFPatch] smooth hero scroll ✓');
})();
