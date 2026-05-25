/**
 * MůjFlix — URL Fix Patch v12
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
      bombuj.popupOnly = true; // bombuj blokuje iframe → vždy popup
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
  // MutationObserver sleduje cinemaFrameWrap — když se vykreslí
  // glass panel s bombuj URL s rokem → přidá fallback tlačítko.
  function patchShowPlayButton() {
    const obs = new MutationObserver(() => {
      const wrap = document.getElementById('cinemaFrameWrap');
      if (!wrap) return;

      // Glass panel má border-radius:28px
      const glassPanel = wrap.querySelector('div[style*="border-radius:28px"]');
      if (!glassPanel) return;
      if (glassPanel.querySelector('#_mfFallbackBtn')) return;

      // Najdi URL v onclick play tlačítka
      const playBtn = glassPanel.querySelector('button');
      if (!playBtn) return;
      const onclickStr = playBtn.getAttribute('onclick') || '';
      const urlMatch = onclickStr.match(/window\.open\('(https?:\/\/[^']+)'/);
      if (!urlMatch) return;

      const url = urlMatch[1];
      if (!url.includes('bombuj.si/online-film-')) return;

      // Jen pokud URL má rok na konci
      const hasYear = /online-film-.+-\d{4}$/.test(url);
      if (!hasYear) return;

      const urlWithoutYear = url.replace(/-\d{4}$/, '');

      const btn = document.createElement('button');
      btn.id = '_mfFallbackBtn';
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
        </svg>
        Zkusit bez roku
      `;
      btn.style.cssText = `
        display:flex;align-items:center;gap:7px;
        padding:10px 24px;border-radius:40px;
        background:rgba(255,255,255,0.07);
        border:1px solid rgba(255,255,255,0.14);
        color:rgba(255,255,255,0.65);
        font-size:0.8rem;font-weight:600;cursor:pointer;
        font-family:-apple-system,'SF Pro Display',Inter,sans-serif;
        transition:all 0.18s;letter-spacing:-0.1px;
      `;
      btn.onmouseenter = () => { btn.style.background='rgba(255,255,255,0.14)'; btn.style.color='#fff'; };
      btn.onmouseleave = () => { btn.style.background='rgba(255,255,255,0.07)'; btn.style.color='rgba(255,255,255,0.65)'; };
      btn.onclick = () => {
        const pw = screen.width, ph = screen.height;
        const pop = window.open(urlWithoutYear, 'MujFlixCinema',
          `width=${pw},height=${ph},left=0,top=0,menubar=no,toolbar=no,location=no,scrollbars=yes`);
        if (!pop || pop.closed) window.open(urlWithoutYear, '_blank', 'noopener');
        btn.remove();
      };

      // Vlož před "Hledat na webu" nebo na konec
      const searchLink = glassPanel.querySelector('a[href*="?s="]');
      if (searchLink) glassPanel.insertBefore(btn, searchLink);
      else glassPanel.appendChild(btn);

      console.log('[MFUrlFix] Fallback tlačítko přidáno:', url, '→', urlWithoutYear);
    });

    obs.observe(document.body, { childList: true, subtree: true });
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

  console.log('[MFUrlFix] v12 načten');
})();
