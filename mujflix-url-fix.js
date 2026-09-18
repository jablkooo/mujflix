/**
 * MůjFlix — URL Fix Patch v15
 * ════════════════════════════
 * Opravuje:
 *  1. Bombuj filmy — popupOnly=true (iframe blokován), rok jen pro 2020+
 *  2. SvetSerialu seriály — /serial/SLUG/sSSeEE
 *  3. TV→SvetSerialu popup, filmy→Bombuj popup (bez CinAI probe)
 *  4. "Zkusit bez roku" tlačítko v glass panelu — jen když URL má rok,
 *     zmizí po kliknutí
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
  // Rok jen pro filmy z 2020+ (starší mají URL bez roku)
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
      bombuj.popupOnly = false; // iframe povoleno
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

  // ── FIX 3: TV→SvetSerialu, filmy→Bombuj, bez CinAI probe ────
  function patchCinemaOpen() {
    const _orig = window.openMovieInCinema;
    if (typeof _orig !== 'function') { setTimeout(patchCinemaOpen, 200); return; }

    window.openMovieInCinema = function(tmdbId, title, type) {
      const isTV = type === 'tv' || type === 'tv_ep';
      if (window.CinAI) {
        const _saved = window.CinAI.findBestSource;
        window.CinAI.findBestSource = async function() { return isTV ? 0 : 1; };
        setTimeout(() => { window.CinAI.findBestSource = _saved; }, 3000);
      }
      return _orig.apply(this, arguments);
    };

    console.log('[MFUrlFix] v12 — cinema override aktivní');
  }

  // ── FIX 4: "Zkusit bez roku" tlačítko v glass panelu ────────
  // Override _cinShowPlayButton — bezpečnější než MutationObserver,
  // funguje i po druhém volání y(backdrop) které přepíše innerHTML.
  function patchShowPlayButton() {
    function tryPatch() {
      if (typeof window._cinShowEmbedPlayer !== 'function') {
        setTimeout(tryPatch, 200);
        return;
      }

      const _origCinShowEmbedPlayer = window._cinShowEmbedPlayer;

      window._cinShowEmbedPlayer = function(url) {
        _origCinShowEmbedPlayer.apply(this, arguments);

        // Odstraň staré tlačítko
        const old = document.getElementById('_mfFallbackBtn');
        if (old) old.remove();

        // Zkontroluj jestli URL je bombuj s rokem
        if (!url || !url.includes('bombuj.si/online-film-')) return;
        if (!/online-film-.+-\d{4}$/.test(url)) return;

        const urlWithoutYear = url.replace(/-\d{4}$/, '');

        requestAnimationFrame(() => requestAnimationFrame(() => {
          const topBar = document.getElementById('cinemaTopBar');
          if (!topBar) return;

          const btn = document.createElement('button');
          btn.id = '_mfFallbackBtn';
          btn.innerHTML = `
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
            </svg>
            Zkusit bez roku
          `;
          btn.style.cssText = `
            display:flex;align-items:center;gap:6px;
            padding:6px 14px;border-radius:40px;
            background:rgba(255,255,255,0.08);
            border:1px solid rgba(255,255,255,0.15);
            color:rgba(255,255,255,0.7);
            font-size:0.72rem;font-weight:600;cursor:pointer;
            font-family:-apple-system,'SF Pro Display',Inter,sans-serif;
            transition:all 0.18s;letter-spacing:-0.1px;
            flex-shrink:0;
          `;
          btn.onmouseenter = () => { btn.style.background='rgba(255,255,255,0.16)'; btn.style.color='#fff'; };
          btn.onmouseleave = () => { btn.style.background='rgba(255,255,255,0.08)'; btn.style.color='rgba(255,255,255,0.7)'; };
          btn.onclick = () => {
            const iframe = document.querySelector('#cinemaFrameWrap iframe');
            if (iframe) iframe.src = urlWithoutYear;
            btn.remove();
          };

          // Vlož před zavírací tlačítko v top baru
          const closeBtn = topBar.querySelector('button[onclick*="closeCinema"]');
          if (closeBtn) topBar.insertBefore(btn, closeBtn);
          else topBar.appendChild(btn);

          console.log('[MFUrlFix] Fallback tlačítko v TopBar:', url, '→', urlWithoutYear);
        }));
      };

      console.log('[MFUrlFix] _cinShowEmbedPlayer override aktivní');
    }

    tryPatch();
  }

  // Spustit — po DOMContentLoaded + 500ms aby app.js dokončil patche
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(patchCinemaOpen, 500);
      patchShowPlayButton();
    });
  } else {
    setTimeout(patchCinemaOpen, 500);
    patchShowPlayButton();
  }

  console.log('[MFUrlFix] v15 načten');
})();
