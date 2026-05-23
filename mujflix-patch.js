/**
 * MůjFlix — UI Patch
 * Hero scroll: plynulé mizení přes margin-top + opacity
 */
(function() {
  'use strict';

  var HERO_FULL  = 180;
  var SCROLL_END = 280;
  var _interval  = null;
  var _ticking   = false;

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 2.2);
  }

  // ── CSS ──
  // Musí přebít styles.css řádek 20051 kde je transition + overflow:hidden na .modal-hero
  var style = document.createElement('style');
  style.textContent = [
    // Přebití globálního .modal-hero z styles.css (specificita: #seriesModal > .modal-body > ...)
    '#seriesModal .modal-hero,',
    '#seriesModal > * .modal-hero,',
    '.modal-hero {',
    '  transition: none !important;',   /* <-- toto přebíjí "transition: height 0.3s" z styles.css */
    '  overflow: visible !important;',  /* <-- overflow:hidden blokoval sub-pixel vykreslení */
    '  will-change: margin-top !important;',
    '}',
    '#seriesModal .modal-hero-img {',
    '  height: 100% !important;',
    '  width: 100% !important;',
    '  object-fit: cover !important;',
    '}',
    '#seriesModal .modal-hero-content,',
    '.modal-hero-content {',
    '  transition: none !important;',   /* stejně přebít — rAF animuje přímo */
    '  will-change: opacity, transform !important;',
    '}'
  ].join('\n');
  // Inject jako poslední styl → nejvyšší priorita
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

    var raw      = Math.min(1, Math.max(0, mb.scrollTop / SCROLL_END));
    var progress = easeOut(raw);

    // Záporný margin-top — hero se "zasune" nahoru
    // Bez Math.round → sub-pixel přesnost = žádné trhání
    var offset = HERO_FULL * progress;
    hero.style.setProperty('margin-top', '-' + offset + 'px', 'important');
    hero.style.setProperty('height', HERO_FULL + 'px', 'important');

    // Content: fade out v první třetině scrollu
    if (content) {
      var op = Math.max(0, 1 - raw / 0.38);
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
