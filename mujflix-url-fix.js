/**
 * MůjFlix — URL Fix Patch v8
 * ════════════════════════════
 * Opravuje:
 *  1. Bombuj filmy — popupOnly (iframe blokován), rok jen pro 2020+
 *  2. SvetSerialu seriály — /serial/SLUG/sSSeEE
 *  3. TV vždy SvetSerialu, filmy vždy Bombuj
 *  4. "Zkusit bez roku" tlačítko — zobrazí se v cinemaBottomBar,
 *     zmizí po kliknutí nebo po 30s nebo při zavření modalu
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

  // ── FIX 1: Bombuj filmy — rok jen pro 2020+ ─────────────────
  window._bombujMovieUrlVariants = function (title, year) {
    const slug   = czSlug(title);
    const search = `https://www.bombuj.si/?s=${encodeURIComponent(title || '')}`;
    if (!slug) return [search];
    const base = `https://www.bombuj.si/online-film-${slug}`;
    const yr   = parseInt(year) || null;
    if (yr && yr >= 2020) {
      return [`${base}-${yr}`, `${base}-${yr - 1}`, base, search];
    }
    return [base, search];
  };

  // ── FIX 2: CINEMA_SOURCES ────────────────────────────────────
  function patchSources() {
    if (typeof CINEMA_SOURCES === 'undefined') { setTimeout(patchSources, 200); return; }

    const bombuj = CINEMA_SOURCES.find(s => s.id === 'bombuj');
    if (bombuj) {
      bombuj.popupOnly = true;
      bombuj.tv = function (_id, season, ep, title, siteSlug) {
        const epStr = `${season}x${String(ep).padStart(2,'0')}`;
        const slug  = siteSlug || czSlug(title || '');
        return slug
          ? `https://serialy.bombuj.si/serial/${slug}-${epStr}`
          : `https://serialy.bombuj.si/?s=${encodeURIComponent(title || '')}`;
      };
    }

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
  }
  patchSources();

  // ── FIX 3: TV→SvetSerialu, filmy→Bombuj ─────────────────────
  function applyOverride() {
    const _orig = window.openMovieInCinema;
    if (typeof _orig !== 'function') { setTimeout(applyOverride, 200); return; }

    window.openMovieInCinema = function(tmdbId, title, type) {
      const isTV = type === 'tv' || type === 'tv_ep';
      if (window.CinAI) {
        const _saved = window.CinAI.findBestSource;
        window.CinAI.findBestSource = async function() { return isTV ? 0 : 1; };
        setTimeout(() => { window.CinAI.findBestSource = _saved; }, 3000);
      }
      return _orig.apply(this, arguments);
    };

    console.log('[MFUrlFix] v8 aktivní');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(applyOverride, 500));
  } else {
    setTimeout(applyOverride, 500);
  }

  // ── FIX 4: "Zkusit bez roku" tlačítko v cinemaBottomBar ─────
  function injectFallbackButton(popupUrl) {
    const hasYear = /online-film-.+-\d{4}$/.test(popupUrl);
    if (!hasYear) return;

    const urlWithoutYear = popupUrl.replace(/-\d{4}$/, '');

    const existing = document.getElementById('_mfFallbackBtn');
    if (existing) existing.remove();

    const bottomBar = document.getElementById('cinemaBottomBar');
    if (!bottomBar) {
      console.warn('[MFUrlFix] cinemaBottomBar nenalezen');
      return;
    }

    const btn = document.createElement('button');
    btn.id = '_mfFallbackBtn';
    btn.textContent = '🔄 Zkusit bez roku';
    btn.style.cssText = `
      padding: 6px 16px;
      border-radius: 20px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: rgba(255,255,255,0.75);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
      white-space: nowrap;
      margin-left: 8px;
    `;

    btn.onmouseenter = () => {
      btn.style.background = 'rgba(255,255,255,0.2)';
      btn.style.color = '#fff';
    };
    btn.onmouseleave = () => {
      btn.style.background = 'rgba(255,255,255,0.1)';
      btn.style.color = 'rgba(255,255,255,0.75)';
    };
    btn.onclick = () => {
      window.open(urlWithoutYear, '_blank', 'noopener');
      btn.remove();
    };

    bottomBar.appendChild(btn);

    // Zmizí po 30s
    const timer = setTimeout(() => btn.remove(), 30000);

    // Zmizí při zavření cinema modalu
    const cinemaModal = document.getElementById('cinemaModal');
    if (cinemaModal) {
      const observer = new MutationObserver(() => {
        if (cinemaModal.style.display === 'none' || cinemaModal.style.visibility === 'hidden') {
          clearTimeout(timer);
          btn.remove();
          observer.disconnect();
        }
      });
      observer.observe(cinemaModal, { attributes: true, attributeFilter: ['style', 'class'] });
    }
  }

  // Hook window.open
  const _origOpen = window.open.bind(window);
  window.open = function(url, target, features) {
    const result = _origOpen(url, target, features);
    if (url && url.includes('bombuj.si/online-film-')) {
      setTimeout(() => injectFallbackButton(url), 800);
    }
    return result;
  };

  console.log('[MFUrlFix] v8 načten');
})();
