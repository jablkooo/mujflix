/**
 * MůjFlix — UI Patch
 * Sleduje #seriesModal.open (ne body.modal-open)
 */
(function() {
  'use strict';

  var HERO_FULL = 180;
  var HERO_MIN  = 56;
  var SCROLL_T  = 50;
  var _interval = null;

  // ── CSS ──
  var style = document.createElement('style');
  style.textContent =
    '#seriesModal.open ~ * #mfDock,' +
    '#seriesModal.open ~ * #mfProfileBadge { opacity: 0 !important; }' +
    '.modal-hero { transition: height 0.3s cubic-bezier(0.4,0,0.2,1) !important; overflow: hidden !important; }' +
    '.modal-hero-img { height: 100% !important; width: 100% !important; object-fit: cover !important; }' +
    '.modal-hero-content { transition: opacity 0.22s ease, transform 0.22s ease !important; }';
  (document.head || document.documentElement).appendChild(style);

  function isModalOpen() {
    var m = document.getElementById('seriesModal');
    return m && m.classList.contains('open');
  }

  function forceHide() {
    var dock  = document.getElementById('mfDock');
    var badge = document.getElementById('mfProfileBadge');
    if (dock)  { dock.style.setProperty('opacity','0','important');  dock.style.setProperty('transform','translateY(120%)','important');  dock.style.setProperty('pointer-events','none','important'); }
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
      if (isModalOpen()) forceHide();
      else { clearInterval(_interval); _interval = null; forceShow(); }
    }, 150);
  }

  // ── Hero scroll ──
  function setupHeroScroll() {
    var mb = document.getElementById('modalBody');
    if (!mb || mb._mfPatch) return;
    mb._mfPatch = true;
    mb.addEventListener('scroll', function() {
      var hero    = document.querySelector('#seriesModal .modal-hero');
      var content = hero && hero.querySelector('.modal-hero-content');
      var img     = hero && hero.querySelector('.modal-hero-img');
      if (!hero) return;
      if (mb.scrollTop > SCROLL_T) {
        hero.style.setProperty('height',   HERO_MIN + 'px', 'important');
        hero.style.setProperty('overflow', 'hidden',        'important');
        hero.style.setProperty('min-height', '0',           'important');
        hero.style.setProperty('max-height', HERO_MIN + 'px', 'important');
        if (img) {
          img.style.setProperty('height',     HERO_MIN + 'px', 'important');
          img.style.setProperty('max-height', HERO_MIN + 'px', 'important');
          img.style.setProperty('min-height', '0',             'important');
        }
        if (content) { content.style.opacity = '0'; content.style.transform = 'translateY(-8px)'; content.style.pointerEvents = 'none'; }
      } else {
        hero.style.setProperty('height',   HERO_FULL + 'px', 'important');
        hero.style.removeProperty('max-height');
        hero.style.removeProperty('min-height');
        if (img) {
          img.style.setProperty('height', '100%', 'important');
          img.style.removeProperty('max-height');
          img.style.removeProperty('min-height');
        }
        if (content) { content.style.opacity = '1'; content.style.transform = ''; content.style.pointerEvents = ''; }
      }
    }, { passive: true });
  }

  // ── Sleduj #seriesModal classList ──
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
        // Reset hero
        var hero = document.querySelector('#seriesModal .modal-hero');
        var mb   = document.getElementById('modalBody');
        if (hero) hero.style.setProperty('height', HERO_FULL + 'px', 'important');
        if (mb)   mb._mfPatch = false;
      }
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState !== 'loading') setTimeout(init, 50);
  else document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 50); });

  console.log('[MFPatch] sleduje #seriesModal.open ✓');
})();
