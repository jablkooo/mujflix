/**
 * MůjFlix — URL Fix Patch v7
 * ════════════════════════════
 * Opravuje:
 *  1. Bombuj filmy — popupOnly (iframe blokován), rok jen pro 2020+
 *  2. SvetSerialu seriály — /serial/SLUG/sSSeEE
 *  3. TV vždy SvetSerialu, filmy vždy Bombuj
 *  4. "Zkusit bez roku" tlačítko — zobrazí se jen když URL má rok,
 *     zmizí po kliknutí nebo po 30s
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

    console.log('[MFUrlFix] v7 aktivní');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(applyOverride, 500));
  } else {
    setTimeout(applyOverride, 500);
  }

  // ── FIX 4: "Zkusit bez roku" tlačítko ───────────────────────
  function injectFallbackButton(popupUrl) {
    const hasYear = /online-film-.+-\d{4}$/.test(popupUrl);
    if (!hasYear) return;

    const urlWithoutYear = popupUrl.replace(/-\d{4}$/, '');

    const existing = document.getElementById('_mfFallbackBtn');
    if (existing) existing.remove();

    const btn = document.createElement('button');
    btn.id = '_mfFallbackBtn';
    btn.textContent = '🔄 Nenašlo se? Zkusit bez roku';
    btn.style.cssText = `
      position: fixed;
      bottom: 90px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      padding: 10px 22px;
      border-radius: 50px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: rgba(255,255,255,0.7);
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      font-family: -apple-system, Inter, sans-serif;
      backdrop-filter: blur(20px);
      transition: all 0.2s;
      white-space: nowrap;
    `;

    btn.onclick = () => {
      window.open(urlWithoutYear, '_blank', 'noopener');
      btn.remove();
    };
    btn.onmouseenter = () => {
      btn.style.background = 'rgba(255,255,255,0.18)';
      btn.style.color = '#fff';
    };
    btn.onmouseleave = () => {
      btn.style.background = 'rgba(255,255,255,0.1)';
      btn.style.color = 'rgba(255,255,255,0.7)';
    };

    document.body.appendChild(btn);
    setTimeout(() => btn.remove(), 30000);

    const cinemaModal = document.getElementById('cinemaModal');
    if (cinemaModal) {
      const observer = new MutationObserver(() => {
        if (cinemaModal.style.display === 'none' || !cinemaModal.style.display) {
          btn.remove();
          observer.disconnect();
        }
      });
      observer.observe(cinemaModal, { attributes: true, attributeFilter: ['style'] });
    }
  }

  // Hook window.open pro zachycení bombuj popup URL
  const _origOpen = window.open.bind(window);
  window.open = function(url, target, features) {
    const result = _origOpen(url, target, features);
    if (url && url.includes('bombuj.si/online-film-')) {
      setTimeout(() => injectFallbackButton(url), 800);
    }
    return result;
  };

  console.log('[MFUrlFix] v7 načten');
})();
