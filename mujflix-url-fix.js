/**
 * MůjFlix — URL Fix Patch v4
 * ════════════════════════════
 * Vzory dle skutečných URL:
 *  bombuj:      https://www.bombuj.si/online-film-SLUG-YYYY
 *  svetserialu: https://svetserialu.to/serial/SLUG/s01e01
 *
 * Opravuje:
 *  1. Bombuj filmy — /online-film-SLUG-YYYY
 *  2. SvetSerialu filmy — /film/SLUG
 *  3. SvetSerialu seriály — /serial/SLUG/sSSeEE
 *  4. TV seriály vždy přes SvetSerialu — override po plném načtení app.js
 */

(function () {
  'use strict';

  if (window._mfUrlFixLoaded) return;
  window._mfUrlFixLoaded = true;

  function czSlug(s) {
    if (!s) return '';
    return s.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, 'and').replace(/'/g, '').replace(/:/g, '').replace(/\./g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  // ── FIX 1: Bombuj filmy ──────────────────────────────────────
  window._bombujMovieUrlVariants = function (title, year) {
    const slug   = czSlug(title);
    const search = `https://www.bombuj.si/?s=${encodeURIComponent(title || '')}`;
    if (!slug) return [search];
    const base = `https://www.bombuj.si/online-film-${slug}`;
    const yr   = parseInt(year) || null;
    if (yr) return [`${base}-${yr}`, `${base}-${yr - 1}`, base, search];
    return [base, search];
  };

  // ── FIX 2+3: CINEMA_SOURCES patch ───────────────────────────
  function patchSources() {
    if (typeof CINEMA_SOURCES === 'undefined') { setTimeout(patchSources, 200); return; }

    const svet = CINEMA_SOURCES.find(s => s.id === 'svetserialu');
    if (svet) {
      svet.movie = function (_id, title) {
        const slug = czSlug(title || '');
        return slug ? `https://svetserialu.to/film/${slug}` : `https://svetserialu.to/?s=${encodeURIComponent(title || '')}`;
      };
      svet.tv = function (_id, season, ep, title, siteSlug) {
        const epStr = `s${String(season).padStart(2,'0')}e${String(ep).padStart(2,'0')}`;
        const slug  = siteSlug || czSlug(title || '');
        return slug ? `https://svetserialu.to/serial/${slug}/${epStr}` : `https://svetserialu.to/?s=${encodeURIComponent(title || '')}`;
      };
      svet.tvVariants = function (_id, season, ep, title, siteSlug) {
        const epStr  = `s${String(season).padStart(2,'0')}e${String(ep).padStart(2,'0')}`;
        const slug   = czSlug(title || '');
        const base   = siteSlug || slug;
        const search = `https://svetserialu.to/?s=${encodeURIComponent(title || '')}`;
        if (!base) return [search];
        const v = [`https://svetserialu.to/serial/${base}/${epStr}`];
        if (siteSlug && slug && siteSlug !== slug) v.push(`https://svetserialu.to/serial/${slug}/${epStr}`);
        if (base.startsWith('the-')) v.push(`https://svetserialu.to/serial/${base.slice(4)}/${epStr}`);
        v.push(search);
        return [...new Set(v)];
      };
    }

    const bombuj = CINEMA_SOURCES.find(s => s.id === 'bombuj');
    if (bombuj) {
      bombuj.tv = function (_id, season, ep, title, siteSlug) {
        const epStr = `${season}x${String(ep).padStart(2,'0')}`;
        const slug  = siteSlug || czSlug(title || '');
        return slug ? `https://serialy.bombuj.si/serial/${slug}-${epStr}` : `https://serialy.bombuj.si/?s=${encodeURIComponent(title || '')}`;
      };
    }
  }
  patchSources();

  // ── FIX 4: TV vždy SvetSerialu ──────────────────────────────
  // app.js dokončí inicializaci až po DOMContentLoaded + vlastní
  // patche uvnitř app.js přepíší openMovieInCinema nakonec.
  // Proto čekáme až je DOM hotový + 500ms navíc.
  function applyTVOverride() {
    const _orig = window.openMovieInCinema;
    if (typeof _orig !== 'function') {
      setTimeout(applyTVOverride, 200);
      return;
    }

    window.openMovieInCinema = function(tmdbId, title, type) {
      const isTV = type === 'tv' || type === 'tv_ep';
      if (isTV && window.CinAI) {
        const _saved = window.CinAI.findBestSource;
        window.CinAI.findBestSource = async function() { return 0; };
        setTimeout(() => { window.CinAI.findBestSource = _saved; }, 3000);
      }
      return _orig.apply(this, arguments);
    };

    console.log('[MFUrlFix] v4 — TV→SvetSerialu override aktivní');
  }

  // Počkej na DOMContentLoaded + 500ms aby app.js dokončil všechny své patche
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(applyTVOverride, 500));
  } else {
    setTimeout(applyTVOverride, 500);
  }

  console.log('[MFUrlFix] v4 načten');
})();
