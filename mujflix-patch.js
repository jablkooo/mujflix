/**
 * MůjFlix — UI Patch v5
 * Hero scroll: lerp interpolace = máslovitá plynulost i při rychlém scrollu
 */
(function() {
  'use strict';

  if (window._mfPatchLoaded) return;
  window._mfPatchLoaded = true;

  var HERO_CSS_H = 260;
  var SCROLL_END = 320;
  var LERP_SPEED = 0.24;  // 0.0–1.0: nižší = plynulejší/pomalejší dotah

  var _current   = 0;     // aktuálně vykreslená hodnota (0–1)
  var _target    = 0;     // cílová hodnota ze scrollTop
  var _rafId     = null;
  var _interval  = null;

  // ── CSS ──
  var old = document.getElementById('mf-patch-style');
  if (old) old.remove();
  var style = document.createElement('style');
  style.id = 'mf-patch-style';
  style.textContent = [
    '#seriesModal .modal-hero {',
    '  transition: none !important;',
    '  overflow: hidden !important;',
    '  will-change: height !important;',
    '  min-height: 0 !important;',
    '  flex-shrink: 1 !important;',
    '  position: relative !important;',
    '}',
    '#seriesModal .modal-hero-img {',
    '  position: relative !important;',
    '  width: 100% !important;',
    '  height: ' + HERO_CSS_H + 'px !important;',
    '  object-fit: cover !important;',
    '  object-position: center 22% !important;',
    '  display: block !important;',
    '  transform: scale(1) !important;',
    '  filter: brightness(0.5) !important;',
    '  transition: none !important;',
    '}',
    '#seriesModal .modal-hero-overlay {',
    '  position: absolute !important;',
    '  inset: 0 !important;',
    '  transition: none !important;',
    '  will-change: opacity !important;',
    '}',
    '#seriesModal .modal-hero-content {',
    '  transition: none !important;',
    '  will-change: opacity, transform !important;',
    '  position: absolute !important;',
    '  bottom: 0 !important;',
    '  left: 0 !important;',
    '  right: 0 !important;',
    '}',
  ].join('\n');
  document.head.appendChild(style);

  // ── Lerp ──
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // ── Render loop — běží dokud current ≈ target ──
  function renderLoop() {
    _current = lerp(_current, _target, LERP_SPEED);

    // Zastavit loop když jsme dost blízko cíli
    if (Math.abs(_current - _target) < 0.0005) {
      _current = _target;
      _rafId = null;
    } else {
      _rafId = requestAnimationFrame(renderLoop);
    }

    applyHero(_current);
  }

  function applyHero(raw) {
    var hero    = document.querySelector('#seriesModal .modal-hero');
    var overlay = hero && hero.querySelector('.modal-hero-overlay');
    var content = hero && hero.querySelector('.modal-hero-content');
    if (!hero) return;

    hero.style.setProperty('height', (HERO_CSS_H * (1 - raw)) + 'px', 'important');

    if (overlay) overlay.style.opacity = String(1 - raw);

    if (content) {
      var op = Math.max(0, 1 - (raw / 0.4));
      content.style.opacity       = op;
      content.style.transform     = 'translateY(' + (-12 * raw) + 'px)';
      content.style.pointerEvents = op < 0.05 ? 'none' : '';
    }
  }

  function startLoop() {
    if (!_rafId) _rafId = requestAnimationFrame(renderLoop);
  }

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

  function setupHeroScroll() {
    var mb = document.getElementById('modalBody');
    if (!mb || mb._mfPatch) return;
    mb._mfPatch = true;
    var hero = document.querySelector('#seriesModal .modal-hero');
    if (hero) hero.style.setProperty('height', HERO_CSS_H + 'px', 'important');

    mb.addEventListener('scroll', function() {
      // Aktualizuj pouze target — loop se postará o plynulé dotažení
      _target = Math.min(1, Math.max(0, mb.scrollTop / SCROLL_END));
      startLoop();
    }, { passive: true });
  }

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
        if (_rafId)    { cancelAnimationFrame(_rafId); _rafId = null; }
        _current = 0; _target = 0;
        var hero    = document.querySelector('#seriesModal .modal-hero');
        var overlay = hero && hero.querySelector('.modal-hero-overlay');
        var content = hero && hero.querySelector('.modal-hero-content');
        var mb      = document.getElementById('modalBody');
        if (hero)    hero.style.setProperty('height', HERO_CSS_H + 'px', 'important');
        if (overlay) overlay.style.removeProperty('opacity');
        if (content) { content.style.opacity = '1'; content.style.transform = ''; content.style.pointerEvents = ''; }
        if (mb)      mb._mfPatch = false;
      }
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState !== 'loading') setTimeout(init, 50);
  else document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 50); });

  console.log('[MFPatch] v5 lerp ✓');
})();
