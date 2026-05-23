/**
 * MůjFlix — UI Patch
 * - Skrýt dock + profil badge při otevřeném detailu seriálu
 * - Scroll-to-minimize hero fotka
 */
(function() {
  'use strict';

  var HERO_FULL = 180;
  var HERO_MIN  = 56;
  var SCROLL_T  = 50;
  var _enforceInterval = null;

  // ── CSS injekce ──
  var style = document.createElement('style');
  style.id = 'mf-patch-styles';
  style.textContent = [
    '.modal-hero { transition: height 0.3s cubic-bezier(0.4,0,0.2,1) !important; overflow: hidden !important; }',
    '.modal-hero-img { height: 100% !important; width: 100% !important; object-fit: cover !important; }',
    '.modal-hero-content { transition: opacity 0.22s ease, transform 0.22s ease !important; }'
  ].join('\n');
  (document.head || document.documentElement).appendChild(style);

  function getEl(id) { return document.getElementById(id); }

  // ── Silné skrytí přes setAttribute style ──
  function forceHide() {
    var dock  = getEl('mfDock');
    var badge = getEl('mfProfileBadge');

    if (dock && dock.style.opacity !== '0') {
      dock.style.setProperty('opacity',        '0',              'important');
      dock.style.setProperty('transform',      'translateY(120%)','important');
      dock.style.setProperty('pointer-events', 'none',           'important');
      dock.style.setProperty('transition',     'opacity 0.25s ease, transform 0.25s ease', 'important');
    }
    if (badge && badge.style.opacity !== '0') {
      badge.style.setProperty('opacity',        '0',              'important');
      badge.style.setProperty('transform',      'translateY(-10px)','important');
      badge.style.setProperty('pointer-events', 'none',           'important');
      badge.style.setProperty('transition',     'opacity 0.2s ease, transform 0.2s ease', 'important');
    }
  }

  function startEnforce() {
    stopEnforce();
    forceHide();
    // Každých 200ms zkontroluj a znovu skryj — přebije i app.js patche
    _enforceInterval = setInterval(forceHide, 200);

    // Taky sleduj přímé změny stylu na elementech
    ['mfDock', 'mfProfileBadge'].forEach(function(id) {
      var el = getEl(id);
      if (!el || el._mfObserver) return;
      var obs = new MutationObserver(function() {
        if (document.body.classList.contains('modal-open')) forceHide();
      });
      obs.observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
      el._mfObserver = obs;
    });
  }

  function stopEnforce() {
    if (_enforceInterval) { clearInterval(_enforceInterval); _enforceInterval = null; }
  }

  function showChrome() {
    stopEnforce();
    ['mfDock', 'mfProfileBadge'].forEach(function(id) {
      var el = getEl(id);
      if (!el) return;
      el.style.removeProperty('opacity');
      el.style.removeProperty('transform');
      el.style.removeProperty('pointer-events');
      el.style.removeProperty('transition');
      // Odpoj observer
      if (el._mfObserver) { el._mfObserver.disconnect(); el._mfObserver = null; }
    });
  }

  // ── Hero scroll ──
  function setupHeroScroll() {
    var mb = getEl('modalBody');
    if (!mb || mb._mfPatch) return;
    mb._mfPatch = true;

    mb.addEventListener('scroll', function() {
      var hero    = document.querySelector('#seriesModal .modal-hero');
      var content = hero && hero.querySelector('.modal-hero-content');
      if (!hero) return;

      if (mb.scrollTop > SCROLL_T) {
        hero.style.setProperty('height', HERO_MIN + 'px', 'important');
        if (content) {
          content.style.opacity       = '0';
          content.style.transform     = 'translateY(-8px)';
          content.style.pointerEvents = 'none';
        }
      } else {
        hero.style.setProperty('height', HERO_FULL + 'px', 'important');
        if (content) {
          content.style.opacity       = '1';
          content.style.transform     = '';
          content.style.pointerEvents = '';
        }
      }
    }, { passive: true });
  }

  function resetHero() {
    var hero    = document.querySelector('#seriesModal .modal-hero');
    var content = hero && hero.querySelector('.modal-hero-content');
    var mb      = getEl('modalBody');
    if (hero)    hero.style.setProperty('height', HERO_FULL + 'px', 'important');
    if (content) { content.style.opacity = '1'; content.style.transform = ''; content.style.pointerEvents = ''; }
    if (mb)      { mb._mfPatch = false; }
  }

  // ── Sleduj body.modal-open ──
  function init() {
    var wasOpen = document.body.classList.contains('modal-open');
    if (wasOpen) { startEnforce(); setTimeout(setupHeroScroll, 400); }

    new MutationObserver(function() {
      var isOpen = document.body.classList.contains('modal-open');
      if (isOpen === wasOpen) return;
      wasOpen = isOpen;
      if (isOpen) {
        startEnforce();
        setTimeout(setupHeroScroll, 400);
      } else {
        showChrome();
        resetHero();
      }
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState !== 'loading') {
    // Počkej až app.js dokončí své patche
    setTimeout(init, 100);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(init, 100);
    });
  }

  console.log('[MFPatch] dock/profil hide + hero scroll ✓');
})();
