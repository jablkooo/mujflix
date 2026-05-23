/**
 * MůjFlix — UI Patch
 * Hero scroll: plynulé mizení přes margin-top + opacity
 * Opravy: žádný Math.round (sub-pixel), delší SCROLL_END, CSS transition vypnut během scrollu
 */
(function() {
  'use strict';

  var HERO_FULL  = 180;   // px — výška hero obrázku
  var SCROLL_END = 260;   // px — za kolik px scrollu hero úplně zmizí (bylo 160 → trhat)
  var _interval  = null;
  var _ticking   = false;

  function easeOut(t) {
    // Plynulejší než easeInOut pro scroll — začne rychle, zpomalí ke konci
    return 1 - Math.pow(1 - t, 2.5);
  }

  // ── CSS ──
  var style = document.createElement('style');
  style.textContent = [
    '#seriesModal .modal-hero {',
    '  overflow: visible !important;',
    '  will-change: margin-top;',
    '  /* Žádný CSS transition — animaci řídí rAF, transition by způsobovala lag */',
    '  transition: none !important;',
    '}',
    '#seriesModal .modal-hero-img {',
    '  height: 100% !important;',
    '  width: 100% !important;',
    '  object-fit: cover !important;',
    '}',
    '#seriesModal .modal-hero-content {',
    '  will-change: opacity, transform;',
    '  transition: none !important;',
    '}'
  ].join('\n');
  (document.head || document.documentElement).appendChild(style);

  // ── Dock + profil ──
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

  // ── Hero scroll ──
  function updateHero(mb) {
    var hero    = document.querySelector('#seriesModal .modal-hero');
    var content = hero && hero.querySelector('.modal-hero-content');
    if (!hero) { _ticking = false; return; }

    // raw 0→1 podle scrollTop
    var raw      = Math.min(1, Math.max(0, mb.scrollTop / SCROLL_END));
    var progress = easeOut(raw);

    // Záporný margin-top — hero se "zasune" nahoru a zmizí
    // Bez Math.round → sub-pixel přesnost = žádné trhání
    var offset = HERO_FULL * progress;
    hero.style.setProperty('margin-top', '-' + offset + 'px', 'important');
    hero.style.setProperty('height', HERO_FULL + 'px', 'important');

    // Content: fade out v první třetině scrollu, lehký posun nahoru
    if (content) {
      var fadeEnd = 0.35; // opacity = 0 při 35 % scrollu
      var op      = Math.max(0, 1 - raw / fadeEnd);
      content.style.opacity       = op;
      content.style.transform     = 'translateY(' + (-14 * progress) + 'px)';
      content.style.pointerEvents = op < 0.05 ? 'none' : '';
    }

    _ticking = false;
  }

  function setupHeroScroll() {
    var mb = document.getElementById('modalBody');
    if (!mb || mb._mfPatch) return;
    mb._mfPatch = true;
    mb.addEventListener('scroll', function() {
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
        if (hero)    { hero.style.removeProperty('margin-top'); hero.style.removeProperty('height'); }
        if (content) { content.style.opacity = '1'; content.style.transform = ''; content.style.pointerEvents = ''; }
        if (mb)      mb._mfPatch = false;
      }
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState !== 'loading') setTimeout(init, 50);
  else document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 50); });

  console.log('[MFPatch] smooth hero scroll ✓');
})();
