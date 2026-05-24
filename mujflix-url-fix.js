// ==UserScript==
// @name         MůjFlix — URL Fix
// @namespace    mujflix
// @version      11
// @description  Opravuje bombuj URL, iframe embedding, rok v URL, fallback tlačítko
// @match        *://mujflix.*/*
// @match        *://*.mujflix.*/*
// @grant        GM_webRequest
// @run-at       document-start
// ==/UserScript==

// ── Odstranění X-Frame-Options pro bombuj ───────────────────
GM_webRequest([
  {
    selector: { include: ['*://www.bombuj.si/*', '*://bombuj.si/*', '*://serialy.bombuj.si/*'] },
    action: {
      cancel: false,
      redirect: false,
      setHeaders: [],
      removeHeaders: ['x-frame-options', 'content-security-policy', 'content-security-policy-report-only']
    }
  }
], () => {});

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
      bombuj.popupOnly = false;
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
  }

  // ── FIX 4: Patch _cinShowPlayButton — přidej "Zkusit bez roku" ──
  // _cinShowPlayButton je v closure, ale volá se přes requestAnimationFrame.
  // Patchujeme requestAnimationFrame aby zachytil callback a po vykreslení
  // přidal tlačítko do glass panelu.
  function patchShowPlayButton() {
    // Počkej až bude _cinLoad definovaný (signál že app.js je načtený)
    if (typeof _cinLoad === 'undefined') {
      // _cinLoad je v closure — nemůžeme zkontrolovat přímo
      // Místo toho sledujeme DOM
    }

    // Sleduj cinemaFrameWrap přes MutationObserver na document.body
    // Když se objeví glass panel s bombuj URL s rokem → přidej tlačítko
    const obs = new MutationObserver(() => {
      const wrap = document.getElementById('cinemaFrameWrap');
      if (!wrap) return;

      // Najdi glass panel (div s border-radius:28px)
      const glassPanel = wrap.querySelector('div[style*="border-radius:28px"]');
      if (!glassPanel) return;

      // Už tam tlačítko je?
      if (glassPanel.querySelector('#_mfFallbackBtn')) return;

      // Najdi URL v onclick play tlačítka
      const playBtn = glassPanel.querySelector('button');
      if (!playBtn) return;

      const onclickStr = playBtn.getAttribute('onclick') || '';
      const urlMatch = onclickStr.match(/window\.open\('(https?:\/\/[^']+)'/);
      if (!urlMatch) return;

      const url = urlMatch[1];

      // Jen pro bombuj s rokem na konci
      if (!url.includes('bombuj.si/online-film-')) return;
      const hasYear = /online-film-.+-\d{4}$/.test(url);
      if (!hasYear) return;

      const urlWithoutYear = url.replace(/-\d{4}$/, '');

      // Najdi místo — za "Hledat na webu" odkazem, před koncem glass panelu
      const searchLink = glassPanel.querySelector('a[href*="bombuj"]') ||
                         glassPanel.querySelector('a[href*="?s="]');

      const btn = document.createElement('button');
      btn.id = '_mfFallbackBtn';
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
        </svg>
        Zkusit bez roku
      `;
      btn.style.cssText = `
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 10px 24px;
        border-radius: 40px;
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.14);
        color: rgba(255,255,255,0.65);
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        font-family: -apple-system,'SF Pro Display',Inter,sans-serif;
        transition: all 0.18s;
        letter-spacing: -0.1px;
      `;
      btn.onmouseenter = () => {
        btn.style.background = 'rgba(255,255,255,0.14)';
        btn.style.color = '#fff';
      };
      btn.onmouseleave = () => {
        btn.style.background = 'rgba(255,255,255,0.07)';
        btn.style.color = 'rgba(255,255,255,0.65)';
      };
      btn.onclick = () => {
        // Otevři URL bez roku jako popup (stejně jako hlavní Přehrát tlačítko)
        const pw = screen.width, ph = screen.height;
        const pop = window.open(urlWithoutYear, 'MujFlixCinema',
          `width=${pw},height=${ph},left=0,top=0,menubar=no,toolbar=no,location=no,scrollbars=yes`);
        if (!pop || pop.closed) window.open(urlWithoutYear, '_blank', 'noopener');
        btn.remove();
      };

      // Vlož před "Hledat na webu" nebo na konec glass panelu
      if (searchLink) {
        glassPanel.insertBefore(btn, searchLink);
      } else {
        glassPanel.appendChild(btn);
      }

      console.log('[MFUrlFix] Fallback tlačítko přidáno pro:', url);
    });

    obs.observe(document.body, { childList: true, subtree: true });
    console.log('[MFUrlFix] FallbackObserver aktivní');
  }

  // Spustit vše
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(patchCinemaOpen, 500);
      patchShowPlayButton();
    });
  } else {
    setTimeout(patchCinemaOpen, 500);
    patchShowPlayButton();
  }

  console.log('[MFUrlFix] v11 načten');
})();
