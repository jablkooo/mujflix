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

  // ── Čekej dokud jsou elementy k dispozici ──
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function getEl(id) { return document.getElementById(id); }

  // ── Force-hide přes setProperty (přebije vše) ──
  function hide(el, props) {
    if (!el) return;
    Object.keys(props).forEach(function(k) {
      el.style.setProperty(k, props[k], 'important');
    });
  }
  function unhide(el, keys) {
    if (!el) return;
    keys.forEach(function(k) { el.style.removeProperty(k); });
  }

  function hideChrome() {
    hide(getEl('mfDock'), {
      'opacity': '0',
      'transform': 'translateY(120%)',
      'pointer-events': 'none',
      'transition': 'opacity 0.25s ease, transform 0.25s ease'
    });
    hide(getEl('mfProfileBadge'), {
      'opacity': '0',
      'transform': 'translateY(-10px)',
      'pointer-events': 'none',
      'transition': 'opacity 0.2s ease, transform 0.2s ease'
    });
  }

  function showChrome() {
    unhide(getEl('mfDock'),         ['opacity','transform','pointer-events','transition']);
    unhide(getEl('mfProfileBadge'), ['opacity','transform','pointer-events','transition']);
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
    if (mb)      mb._mfPatch = false;
  }

  // ── MutationObserver na body.modal-open ──
  ready(function() {
    var wasOpen = document.body.classList.contains('modal-open');
    if (wasOpen) { hideChrome(); setTimeout(setupHeroScroll, 300); }

    new MutationObserver(function() {
      var isOpen = document.body.classList.contains('modal-open');
      if (isOpen === wasOpen) return;
      wasOpen = isOpen;
      if (isOpen) {
        hideChrome();
        setTimeout(setupHeroScroll, 300);
      } else {
        showChrome();
        resetHero();
      }
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  });

  // ── CSS pro hero transition (injektovat do <head>) ──
  var style = document.createElement('style');
  style.textContent = [
    '.modal-hero { transition: height 0.3s cubic-bezier(0.4,0,0.2,1) !important; overflow: hidden !important; }',
    '.modal-hero-img { height: 100% !important; object-fit: cover !important; }',
    '.modal-hero-content { transition: opacity 0.22s ease, transform 0.22s ease !important; }'
  ].join('\n');
  (document.head || document.documentElement).appendChild(style);

  console.log('[MFPatch] dock/profil hide + hero scroll ✓');
})();
