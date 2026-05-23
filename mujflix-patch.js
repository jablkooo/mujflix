/**
 * MůjFlix — UI Patch
 * Sleduje #seriesModal.open (ne body.modal-open)
 */
(function() {
  'use strict';

  var HERO_FULL = 180;
  var HERO_MIN  = 52;
  var SCROLL_START = 0;   // scroll od kdy začíná zmenšovat
  var SCROLL_END   = 120; // scroll kdy je plně minimalizováno
  var _interval = null;

  // ── CSS ──
  var style = document.createElement('style');
  style.textContent =
    '#seriesModal.open ~ * #mfDock,' +
    '#seriesModal.open ~ * #mfProfileBadge { opacity: 0 !important; }' +
    '.modal-hero { overflow: hidden !important; }' +
    '.modal-hero-img { height: 100% !important; width: 100% !important; object-fit: cover !important; }' +
    '.modal-hero-content { transition: none !important; }';
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
      if (!hero) return;

      var scrolled = mb.scrollTop;
      // Clamp progress 0→1
      var progress = Math.min(1, Math.max(0, (scrolled - SCROLL_START) / (SCROLL_END - SCROLL_START)));

      // Plynulá výška
      var newH = Math.round(HERO_FULL - (HERO_FULL - HERO_MIN) * progress);
      hero.style.height = newH + 'px';

      // Content fade — začne mizet od progress 0.2, zmizí při 0.7
      if (content) {
        var contentOpacity = Math.max(0, 1 - (progress - 0.2) / 0.5);
        content.style.opacity      = contentOpacity;
        content.style.transform    = 'translateY(' + (-8 * progress) + 'px)';
        content.style.pointerEvents = progress > 0.8 ? 'none' : '';
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
        if (hero) hero.style.height = HERO_FULL + 'px';
        if (mb)   mb._mfPatch = false;
      }
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState !== 'loading') setTimeout(init, 50);
  else document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 50); });

  console.log('[MFPatch] sleduje #seriesModal.open ✓');
})();
