/**
 * MůjFlix — URL Fix Patch v5
 * ════════════════════════════
 * Vzory dle skutečných URL:
 *  bombuj filmy:      https://www.bombuj.si/online-film-SLUG-YYYY
 *  svetserialu seriály: https://svetserialu.to/serial/SLUG/s01e01
 *
 * Svetserialu NEMÁ filmy → filmy vždy přes bombuj.
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

  // ── FIX 1: Bombuj filmy — vždy přímý URL, i bez roku ────────
  window._bombujMovieUrlVariants = function (title, year) {
    const slug   = czSlug(title);
    const search = `https://www.bombuj.si/?s=${encodeURIComponent(title || '')}`;
    if (!slug) return [search];
    const base = `https://www.bombuj.si/online-film-${slug}`;
    const yr   = parseInt(year) || null;
    if (yr) return [`${base}-${yr}`, `${base}-${yr - 1}`, base, search];
    // Bez roku — zkus bez roku (funguje pro starší filmy) a search jako záloha
    return [base, search];
  };

  // ── FIX 2: CINEMA_SOURCES ────────────────────────────────────
  function patchSources() {
    if (typeof CINEMA_SOURCES === 'undefined') { setTimeout(patchSources, 200); return; }

    // Svetserialu: seriály opravit, movie NECHAT (svetserialu filmy nemá)
    const svet = CINEMA_SOURCES.find(s => s.id === 'svetserialu');
    if (svet) {
      svet.tv = function (_id, season, ep, title, siteSlug) {
        const epStr = `s${String(season).padStart(2,'0')}e${String(ep).padStart(2,'0')}`;
        const slug  = siteSlug || czSlug(title || '');
        return slug
          ? `https://svetserialu.to/serial/${slug}/${epStr}`
          : `https://svetserialu.to/?s=${encodeURIComponent(title || '')}`;
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

    // Bombuj: TV seriály
    const bombuj = CINEMA_SOURCES.find(s => s.id === 'bombuj');
    if (bombuj) {
      bombuj.tv = function (_id, season, ep, title, siteSlug) {
        const epStr = `${season}x${String(ep).padStart(2,'0')}`;
        const slug  = siteSlug || czSlug(title || '');
        return slug
          ? `https://serialy.bombuj.si/serial/${slug}-${epStr}`
          : `https://serialy.bombuj.si/?s=${encodeURIComponent(title || '')}`;
      };
    }
  }
  patchSources();

  // ── FIX 3: Filmy vždy přes Bombuj (sourceIdx=1), seriály přes SvetSerialu (0) ──
  function applyTVOverride() {
    const _orig = window.openMovieInCinema;
    if (typeof _orig !== 'function') { setTimeout(applyTVOverride, 200); return; }

    window.openMovieInCinema = function(tmdbId, title, type) {
      const isTV = type === 'tv' || type === 'tv_ep';
      if (window.CinAI) {
        const _saved = window.CinAI.findBestSource;
        window.CinAI.findBestSource = async function() {
          return isTV ? 0 : 1; // TV→svetserialu, filmy→bombuj
        };
        setTimeout(() => { window.CinAI.findBestSource = _saved; }, 3000);
      }
      return _orig.apply(this, arguments);
    };

    console.log('[MFUrlFix] v5 — filmy→Bombuj, seriály→SvetSerialu');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(applyTVOverride, 500));
  } else {
    setTimeout(applyTVOverride, 500);
  }

  console.log('[MFUrlFix] v5 načten');
})();
