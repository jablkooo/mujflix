/**
 * MůjFlix — UI Patch
 * Hero scroll: height 260→0 synchronizovaně se scrollem
 */
(function() {
  'use strict';

  // Skutečná výška z CSS (.modal-hero { height: 260px })
  var HERO_CSS_H = 260;
  var SCROLL_END = 300;
  var _interval  = null;
  var _ticking   = false;

  // ── CSS ──
  var style = document.createElement('style');
  style.textContent = [
    '#seriesModal .modal-hero,',
    '.modal-hero {',
    '  transition: none !important;',
    '  overflow: hidden !important;',
    '  will-change: height !important;',
    '  min-height: 0 !important;',
    '  flex-shrink: 1 !important;',
    '}',
    '#seriesModal .modal-hero-img {',
    '  position: absolute !important;',
    '  top: 0 !important;',
    '  left: 0 !important;',
    '  width: 100% !important;',
    '  height: ' + HERO_CSS_H + 'px !important;',
    '  object-fit: cover !important;',
    '  object-position: center 22% !important;',
    '  display: block !important;',
    '}',
    '#seriesModal .modal-hero-content,',
    '.modal-hero-content {',
    '  transition: none !important;',
    '  will-change: opacity, transform !important;',
    '}'
  ].join('\n');
  document.head
    ? document.head.appendChild(style)
    : document.documentElement.appendChild(style);

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

    // Vždy používáme HERO_CSS_H — žádné měření které může být špatně
    var raw = Math.min(1, Math.max(0, mb.scrollTop / SCROLL_END));

    hero.style.setProperty('height', (HERO_CSS_H * (1 - raw)) + 'px', 'important');

    if (content) {
      var op = Math.max(0, 1 - raw / 0.4);
      content.style.opacity       = op;
      content.style.transform     = 'translateY(' + (-10 * raw) + 'px)';
      content.style.pointerEvents = op < 0.05 ? 'none' : '';
    }

    _ticking = false;
  }

  function setupHeroScroll() {
    var mb = document.getElementById('modalBody');
    if (!mb || mb._mfPatch) return;
    mb._mfPatch = true;

    // Reset hero výšky na plnou hodnotu při každém otevření
    var hero = document.querySelector('#seriesModal .modal-hero');
    if (hero) hero.style.setProperty('height', HERO_CSS_H + 'px', 'important');

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
        // Reset vše
        if (hero)    hero.style.setProperty('height', HERO_CSS_H + 'px', 'important');
        if (content) { content.style.opacity = '1'; content.style.transform = ''; content.style.pointerEvents = ''; }
        if (mb)      { mb._mfPatch = false; }
      }
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState !== 'loading') setTimeout(init, 50);
  else document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 50); });

  console.log('[MFPatch] hero 260→0 ✓');
})();
