/**
 * MůjFlix — URL Fix Patch v3
 * ════════════════════════════
 * Vzory dle skutečných URL:
 *  bombuj:      https://www.bombuj.si/online-film-SLUG-YYYY
 *  svetserialu: https://svetserialu.to/serial/SLUG/s01e01
 *
 * Opravuje:
 *  1. Bombuj filmy — /online-film-SLUG-YYYY (s rokem vždy na konci)
 *  2. SvetSerialu filmy — /film/SLUG místo search
 *  3. SvetSerialu seriály — /serial/SLUG/sSSeEE správný formát
 *  4. TV seriály vždy přes SvetSerialu — CinAI probe zakázán pro TV
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
      // Filmy
      svet.movie = function (_id, title) {
        const slug = czSlug(title || '');
        return slug ? `https://svetserialu.to/film/${slug}` : `https://svetserialu.to/?s=${encodeURIComponent(title || '')}`;
      };
      // Seriály — SLUG/sSSeEE
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

  // ── FIX 4: TV vždy SvetSerialu — přepíšeme openMovieInCinema ─
  // Přístup: zachytíme volání CinAI.findBestSource které app.js
  // zavolá uvnitř closure `c()`. Protože nemůžeme přímo do `c()`
  // vstoupit, přepíšeme CinAI objekt jakmile existuje A zároveň
  // přepíšeme openMovieInCinema aby před voláním originálu
  // dočasně nahradil CinAI za mock který pro TV vrátí 0.
  function patchForTV() {
    const _origOpen = window.openMovieInCinema;
    if (typeof _origOpen !== 'function') { setTimeout(patchForTV, 200); return; }

    window.openMovieInCinema = function(tmdbId, title, type) {
      const resolvedType = (!type || type === 'movie') ? 'movie' : 'tv';

      // Pro TV: dočasně vyměníme CinAI.findBestSource za verzi která vždy vrátí 0
      let _savedFind = null;
      if (resolvedType === 'tv' && window.CinAI) {
        _savedFind = window.CinAI.findBestSource;
        window.CinAI.findBestSource = async function() { return 0; };
        // Obnov po 3s (víc než dost pro probe)
        setTimeout(() => {
          if (_savedFind && window.CinAI) window.CinAI.findBestSource = _savedFind;
        }, 3000);
      }

      return _origOpen.apply(this, arguments);
    };

    console.log('[MFUrlFix] v3 — TV→SvetSerialu override aktivní');
  }
  patchForTV();

  console.log('[MFUrlFix] v3 načten');
})();
