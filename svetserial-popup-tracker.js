/**
 * ═══════════════════════════════════════════════════════════════════
 * MŮJFLIX — SvetSerial Popup Tracker  v2.0
 * ═══════════════════════════════════════════════════════════════════
 *
 * Vylepšení v2.0:
 *  • Časový threshold — dialog jen pokud byl uživatel pryč > 2 min
 *  • Chytrý odhad počtu epizod z doby sledování (průměrná ep. ~45 min)
 *  • Vizuální badge "Sleduješ SvetSerial" s pulzující animací
 *  • Auto-detect kontextu z _nextEpTarget a _cinState
 *  • Debounce focus eventu (zamezí falešné spuštění při alt+tab)
 *  • Animovaný dialog s přesným skóre a přívětivým UX
 *
 * Přidej na KONEC app.js (nebo jako samostatný <script> za app.js).
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ── Konstanty ───────────────────────────────────────────────────
  const MIN_AWAY_MS        = 2 * 60 * 1000;   // 2 minuty = reálné sledování
  const AVG_EP_DURATION_MS = 45 * 60 * 1000;  // průměrná epizoda
  const FOCUS_DEBOUNCE_MS  = 1200;             // debounce focusu (alt+tab filtr)
  const POLL_INTERVAL_MS   = 1500;
  const NO_REF_CLEANUP_MS  = 4 * 60 * 60 * 1000;

  // ── Stav ────────────────────────────────────────────────────────
  let _tracker     = null;
  let _dialogOpen  = false;
  let _badge       = null;

  // ── Pomocné: parsuj SvetSerial URL ──────────────────────────────
  function parseSvetSerialUrl(url) {
    if (!url) return null;
    const m = url.match(/svetserialu\.to\/serial\/([^/]+)\/s(\d+)e(\d+)/i);
    if (m) return { slug: m[1], season: parseInt(m[2]), ep: parseInt(m[3]) };
    const m2 = url.match(/svetserialu\.to\/serial\/([^/?#]+)/i);
    if (m2) return { slug: m2[1], season: null, ep: null };
    return null;
  }

  // ── Uid epizody ─────────────────────────────────────────────────
  function makeEpUid(seriesSlug, season, ep) {
    return `${seriesSlug}-S${season}-E${ep}`;
  }

  // ── Auto-detect kontextu z _nextEpTarget / _cinState ────────────
  function resolveContext(hint) {
    const ctx = { slug: null, season: null, ep: null, seriesName: null };

    // 1) Zkus _cinState (cinema mode)
    try {
      if (typeof _cinState !== 'undefined' && _cinState) {
        ctx.slug       = _cinState.slug   || _cinState.seriesSlug || ctx.slug;
        ctx.season     = _cinState.season || ctx.season;
        ctx.ep         = _cinState.ep     || _cinState.episode    || ctx.ep;
      }
    } catch (e) {}

    // 2) Zkus _nextEpTarget (globální proměnná MůjFlixu pro "Další ep.")
    try {
      if (typeof _nextEpTarget !== 'undefined' && _nextEpTarget) {
        ctx.slug   = ctx.slug   || _nextEpTarget.slug;
        ctx.season = ctx.season || _nextEpTarget.season;
        ctx.ep     = ctx.ep     || _nextEpTarget.ep;
      }
    } catch (e) {}

    // 3) Doplň z hintu (z parsované URL)
    ctx.slug   = ctx.slug   || hint.slug;
    ctx.season = ctx.season || hint.season;
    ctx.ep     = ctx.ep     || hint.ep;

    // 4) Jméno série z db
    try {
      if (ctx.slug && typeof db !== 'undefined' && db[ctx.slug]) {
        ctx.seriesName = db[ctx.slug].name || ctx.slug;
      }
    } catch (e) {}
    ctx.seriesName = ctx.seriesName || hint.seriesName || ctx.slug;

    return ctx;
  }

  // ── Chytrý odhad epizod z doby sledování ────────────────────────
  function estimateEpisodeCount(awayMs) {
    if (awayMs < MIN_AWAY_MS) return 0;
    return Math.max(1, Math.round(awayMs / AVG_EP_DURATION_MS));
  }

  // ── Označ rozsah epizod ─────────────────────────────────────────
  function markEpisodesWatched(seriesSlug, season, startEp, count) {
    let marked = 0, curSeason = season, curEp = startEp;

    for (let i = 0; i < count; i++) {
      const uid = makeEpUid(seriesSlug, curSeason, curEp);
      if (typeof markWatched === 'function') {
        markWatched(uid);
      } else {
        try {
          const watched = JSON.parse(localStorage.getItem('mf_watched') || '{}');
          watched[uid] = true;
          localStorage.setItem('mf_watched', JSON.stringify(watched));
        } catch (e) {}
      }
      marked++;

      const eps = (typeof epsInSeason === 'function')
        ? epsInSeason(seriesSlug, curSeason) : 99;
      if (curEp >= eps) { curSeason++; curEp = 1; }
      else              { curEp++; }
    }
    return marked;
  }

  // ══ BADGE — živý indikátor sledování ═══════════════════════════

  function showBadge(seriesName) {
    if (_badge) return;

    injectStyles();

    const b = document.createElement('div');
    b.id = '_mfSvetBadge';
    b.innerHTML = `
      <span class="_mfb-dot"></span>
      <span class="_mfb-label">Sleduješ SvetSerial</span>
      <span class="_mfb-name">${(seriesName || '').slice(0, 24)}</span>
      <button class="_mfb-close" title="Zrušit tracking">✕</button>
    `;
    document.body.appendChild(b);
    _badge = b;

    // Animace vstupu
    requestAnimationFrame(() => { b.style.opacity = '1'; b.style.transform = 'translateY(0)'; });

    b.querySelector('._mfb-close').addEventListener('click', () => {
      hideBadge();
      stopTracker();
    });
  }

  function hideBadge() {
    if (!_badge) return;
    _badge.style.opacity = '0';
    _badge.style.transform = 'translateY(12px)';
    setTimeout(() => { _badge && _badge.remove(); _badge = null; }, 300);
  }

  // ══ DIALOG ══════════════════════════════════════════════════════

  function showEpCountDialog(seriesSlug, season, startEp, seriesName, awayMs) {
    if (_dialogOpen) return;
    _dialogOpen = true;
    hideBadge();

    injectStyles();

    // Max epizod
    let maxEps = 20;
    try {
      if (typeof epsInSeason === 'function' && typeof totalSeasons === 'function') {
        let rem = 0;
        const totalSe = totalSeasons(seriesSlug) || season;
        for (let s = season; s <= totalSe; s++) {
          const c = epsInSeason(seriesSlug, s) || 10;
          rem += (s === season) ? (c - startEp + 1) : c;
        }
        maxEps = Math.max(rem, 1);
      }
    } catch (e) {}

    const smartGuess  = Math.min(estimateEpisodeCount(awayMs), maxEps);
    const awayMinutes = Math.round((awayMs || 0) / 60000);
    const epLabel     = `S${String(season).padStart(2,'0')}E${String(startEp).padStart(2,'0')}`;
    const shortName   = (seriesName || seriesSlug || 'seriál').slice(0, 32);

    const overlay = document.createElement('div');
    overlay.id = '_mfEpCountOverlay';

    // Tlačítka 1–6
    const quickCounts = [1,2,3,4,5,6].filter(n => n <= maxEps);
    const btnHtml = quickCounts.map(n => `
      <button class="_mf-ep-btn${n === smartGuess ? ' suggested' : ''}" data-count="${n}">
        ${n}${n === smartGuess ? '<span class="_mf-ep-hint">✦</span>' : ''}
      </button>`
    ).join('');

    overlay.innerHTML = `
      <div class="_mf-dialog">
        <div class="_mf-dialog-glow"></div>

        <div class="_mf-dialog-icon">📺</div>
        <h2 class="_mf-dialog-title">Kolik epizod jsi odsledoval?</h2>
        <p class="_mf-dialog-sub">
          <strong>${shortName}</strong> · od ${epLabel}
        </p>
        ${awayMinutes >= 2 ? `<p class="_mf-dialog-time">Byl jsi pryč ~${awayMinutes} min
          ${smartGuess > 0 ? `→ odhadujeme <strong>${smartGuess} ep.</strong>` : ''}</p>` : ''}

        <div class="_mf-ep-grid" id="_mfEpBtns">
          ${btnHtml}
          ${maxEps > 6 ? `<button class="_mf-ep-btn" data-count="more">…</button>` : ''}
        </div>

        <div id="_mfEpCustom" class="_mf-custom-row" style="display:none">
          <input id="_mfEpInput" type="number" min="1" max="${maxEps}" placeholder="počet" class="_mf-custom-input">
          <button id="_mfEpCustomOk" class="_mf-custom-ok">OK</button>
        </div>

        <button id="_mfEpSkip" class="_mf-skip-btn">Nic neoznačovat</button>
      </div>
    `;

    document.body.appendChild(overlay);

    // Animace vstupu
    requestAnimationFrame(() => { overlay.classList.add('_mf-visible'); });

    // Event listenery
    overlay.querySelectorAll('[data-count]').forEach(btn => {
      btn.addEventListener('click', function () {
        const val = this.dataset.count;
        if (val === 'more') {
          const row = document.getElementById('_mfEpCustom');
          row.style.display = 'flex';
          document.getElementById('_mfEpInput').focus();
          return;
        }
        confirmCount(parseInt(val));
      });
    });

    const customOk = document.getElementById('_mfEpCustomOk');
    if (customOk) {
      customOk.addEventListener('click', () => {
        const v = parseInt(document.getElementById('_mfEpInput').value);
        if (v > 0) confirmCount(v);
      });
      document.getElementById('_mfEpInput').addEventListener('keydown', e => {
        if (e.key === 'Enter') { const v = parseInt(e.target.value); if (v > 0) confirmCount(v); }
      });
    }

    document.getElementById('_mfEpSkip').addEventListener('click', closeDialog);

    // Zavření kliknutím na overlay
    overlay.addEventListener('click', e => { if (e.target === overlay) closeDialog(); });

    function confirmCount(n) {
      // Ripple feedback na tlačítku
      const activeBtn = overlay.querySelector(`[data-count="${n}"]`);
      if (activeBtn) activeBtn.classList.add('_mf-ep-btn-confirmed');

      setTimeout(() => {
        closeDialog();
        const marked = markEpisodesWatched(seriesSlug, season, startEp, n);
        if (typeof showToast === 'function') {
          const word = marked === 1 ? 'epizoda' : marked < 5 ? 'epizody' : 'epizod';
          showToast(`✅ Označeno ${marked} ${word} jako zhlédnuté`, 3500);
        }
      }, 220);
    }

    function closeDialog() {
      overlay.classList.remove('_mf-visible');
      setTimeout(() => { overlay.remove(); _dialogOpen = false; }, 300);
    }
  }

  // ══ STYLY ═══════════════════════════════════════════════════════

  function injectStyles() {
    if (document.getElementById('_mfTrackerStyle')) return;
    const st = document.createElement('style');
    st.id = '_mfTrackerStyle';
    st.textContent = `
      /* ─── Badge ──────────────────────────────────────────────── */
      #_mfSvetBadge {
        position: fixed;
        bottom: 24px; right: 24px;
        z-index: 99990;
        display: flex; align-items: center; gap: 8px;
        padding: 9px 14px 9px 10px;
        background: rgba(10,10,14,0.92);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 999px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,122,255,0.15);
        backdrop-filter: blur(12px);
        font-family: -apple-system, "SF Pro Text", Inter, sans-serif;
        font-size: 0.75rem;
        color: rgba(255,255,255,0.75);
        opacity: 0;
        transform: translateY(12px);
        transition: opacity 0.28s ease, transform 0.28s ease;
        cursor: default;
        user-select: none;
      }
      ._mfb-dot {
        width: 8px; height: 8px; border-radius: 50%;
        background: #34C759;
        box-shadow: 0 0 0 0 rgba(52,199,89,0.6);
        animation: _mfbPulse 1.8s ease-in-out infinite;
        flex-shrink: 0;
      }
      @keyframes _mfbPulse {
        0%   { box-shadow: 0 0 0 0 rgba(52,199,89,0.55); }
        60%  { box-shadow: 0 0 0 7px rgba(52,199,89,0); }
        100% { box-shadow: 0 0 0 0 rgba(52,199,89,0); }
      }
      ._mfb-label { color: rgba(255,255,255,0.5); }
      ._mfb-name  { color: #fff; font-weight: 600; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      ._mfb-close {
        background: none; border: none;
        color: rgba(255,255,255,0.25); font-size: 0.7rem;
        cursor: pointer; padding: 0 0 0 4px; line-height: 1;
        transition: color 0.15s;
      }
      ._mfb-close:hover { color: rgba(255,255,255,0.65); }

      /* ─── Overlay ────────────────────────────────────────────── */
      #_mfEpCountOverlay {
        position: fixed; inset: 0; z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0);
        backdrop-filter: blur(0px);
        transition: background 0.3s ease, backdrop-filter 0.3s ease;
        font-family: -apple-system, "SF Pro Display", Inter, sans-serif;
      }
      #_mfEpCountOverlay._mf-visible {
        background: rgba(0,0,0,0.72);
        backdrop-filter: blur(8px);
      }
      #_mfEpCountOverlay._mf-visible ._mf-dialog {
        opacity: 1; transform: scale(1) translateY(0);
      }

      /* ─── Dialog ─────────────────────────────────────────────── */
      ._mf-dialog {
        position: relative;
        background: rgba(14,14,18,0.97);
        border: 1px solid rgba(255,255,255,0.09);
        border-radius: 28px;
        padding: 32px 28px 24px;
        max-width: 370px; width: 90%;
        box-shadow: 0 40px 100px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04);
        text-align: center;
        opacity: 0;
        transform: scale(0.93) translateY(16px);
        transition: opacity 0.3s cubic-bezier(0.34,1.56,0.64,1), transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        overflow: hidden;
      }
      ._mf-dialog-glow {
        position: absolute; top: -60px; left: 50%; transform: translateX(-50%);
        width: 200px; height: 120px;
        background: radial-gradient(ellipse, rgba(0,122,255,0.18) 0%, transparent 70%);
        pointer-events: none;
      }
      ._mf-dialog-icon { font-size: 2.2rem; margin-bottom: 12px; }
      ._mf-dialog-title {
        font-size: 1.05rem; font-weight: 700;
        color: #fff; margin: 0 0 6px;
        letter-spacing: -0.01em;
      }
      ._mf-dialog-sub {
        font-size: 0.78rem; color: rgba(255,255,255,0.42);
        margin: 0 0 6px; line-height: 1.5;
      }
      ._mf-dialog-sub strong { color: rgba(255,255,255,0.65); }
      ._mf-dialog-time {
        display: inline-block;
        font-size: 0.72rem;
        color: rgba(255,255,255,0.35);
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 999px;
        padding: 3px 12px; margin: 0 0 20px;
      }
      ._mf-dialog-time strong { color: #ffd60a; }

      /* ─── Mřížka tlačítek ────────────────────────────────────── */
      ._mf-ep-grid {
        display: flex; flex-wrap: wrap; gap: 8px;
        justify-content: center; margin-bottom: 18px;
      }
      ._mf-ep-btn {
        position: relative;
        width: 48px; height: 48px; border-radius: 14px;
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.1);
        color: #fff; font-size: 0.9rem; font-weight: 700;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        flex-direction: column; gap: 1px;
        transition: background 0.15s, border-color 0.15s, transform 0.12s;
      }
      ._mf-ep-btn:hover {
        background: rgba(0,122,255,0.28);
        border-color: rgba(0,122,255,0.45);
        transform: scale(1.07);
      }
      ._mf-ep-btn:active { transform: scale(0.96); }
      ._mf-ep-btn.suggested {
        background: rgba(0,122,255,0.22);
        border-color: rgba(0,122,255,0.5);
        box-shadow: 0 0 0 1px rgba(0,122,255,0.3);
      }
      ._mf-ep-btn._mf-ep-btn-confirmed {
        background: rgba(52,199,89,0.3) !important;
        border-color: #34C759 !important;
        transform: scale(1.1);
      }
      ._mf-ep-hint {
        font-size: 0.48rem;
        color: #ffd60a;
        line-height: 1;
        display: block;
      }

      /* ─── Custom input ───────────────────────────────────────── */
      ._mf-custom-row {
        align-items: center; justify-content: center;
        gap: 8px; margin-bottom: 14px;
      }
      ._mf-custom-input {
        width: 72px; padding: 10px 8px;
        border-radius: 12px;
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.18);
        color: #fff; font-size: 1rem; text-align: center;
        outline: none; transition: border-color 0.15s;
      }
      ._mf-custom-input:focus { border-color: #007AFF; }
      ._mf-custom-ok {
        padding: 10px 18px; border-radius: 12px;
        background: #007AFF; border: none;
        color: #fff; font-size: 0.85rem; font-weight: 700;
        cursor: pointer; transition: opacity 0.15s;
      }
      ._mf-custom-ok:hover { opacity: 0.82; }

      /* ─── Skip ───────────────────────────────────────────────── */
      ._mf-skip-btn {
        background: none; border: none;
        color: rgba(255,255,255,0.2); font-size: 0.72rem;
        cursor: pointer; padding: 6px 12px;
        transition: color 0.15s;
      }
      ._mf-skip-btn:hover { color: rgba(255,255,255,0.45); }
    `;
    document.head.appendChild(st);
  }

  // ══ TRACKER s časovým měřením ════════════════════════════════════

  function startPopupTracker(popupRef, hint) {
    stopTracker();
    if (!popupRef || !hint.slug) return;

    const ctx = resolveContext(hint);
    if (!ctx.slug || !ctx.season || !ctx.ep) return;

    const openedAt = Date.now();

    _tracker = {
      ...ctx,
      popupRef,
      openedAt,
      pollId: null,
      focusHandler: null,
      focusTimer: null,
      triggered: false,
    };

    showBadge(ctx.seriesName);

    function trigger() {
      if (_tracker && !_tracker.triggered) {
        _tracker.triggered = true;
        const awayMs = Date.now() - openedAt;
        const { slug, season, ep, seriesName } = _tracker;
        stopTracker();

        // Časový threshold — ignoruj pokud byl pryč méně než 2 min
        if (awayMs < MIN_AWAY_MS) {
          console.log(`[MFSvetTracker] Ignorováno — pryč pouze ${Math.round(awayMs/1000)}s`);
          return;
        }

        setTimeout(() => {
          showEpCountDialog(slug, season, ep, seriesName, awayMs);
        }, 400);
      }
    }

    // Polling popup.closed
    _tracker.pollId = setInterval(() => {
      try {
        if (popupRef.closed) trigger();
      } catch (e) { trigger(); }
    }, POLL_INTERVAL_MS);

    // Debounced focus event
    _tracker.focusHandler = () => {
      if (_tracker.focusTimer) clearTimeout(_tracker.focusTimer);
      _tracker.focusTimer = setTimeout(() => {
        try {
          if (!popupRef.closed) return; // popup stále živý
        } catch (e) {}
        trigger();
      }, FOCUS_DEBOUNCE_MS);
    };

    window.addEventListener('focus', _tracker.focusHandler);
  }

  function stopTracker() {
    if (!_tracker) return;
    if (_tracker.pollId)     clearInterval(_tracker.pollId);
    if (_tracker.focusTimer) clearTimeout(_tracker.focusTimer);
    if (_tracker.focusHandler) window.removeEventListener('focus', _tracker.focusHandler);
    _tracker = null;
    hideBadge();
  }

  // ══ FALLBACK: nová karta bez reference (noopener) ════════════════

  let _noRefTracker = null;

  function startNoRefTracker(hint) {
    if (_noRefTracker) {
      clearTimeout(_noRefTracker.cleanupTimer);
      clearTimeout(_noRefTracker.focusTimer);
      window.removeEventListener('focus', _noRefTracker.handler);
      _noRefTracker = null;
    }

    const ctx = resolveContext(hint);
    if (!ctx.slug || !ctx.season || !ctx.ep) return;

    const openedAt = Date.now();
    let activated  = false;
    let focusTimer = null;

    showBadge(ctx.seriesName);

    const handler = () => {
      if (activated) return;
      if (focusTimer) clearTimeout(focusTimer);

      // Debounce — alt+tab filtr
      focusTimer = setTimeout(() => {
        const awayMs = Date.now() - openedAt;
        if (awayMs < MIN_AWAY_MS) return; // příliš krátká nepřítomnost

        activated = true;
        window.removeEventListener('focus', handler);
        _noRefTracker = null;

        setTimeout(() => {
          showEpCountDialog(ctx.slug, ctx.season, ctx.ep, ctx.seriesName, awayMs);
        }, 300);
      }, FOCUS_DEBOUNCE_MS);
    };

    const cleanupTimer = setTimeout(() => {
      window.removeEventListener('focus', handler);
      hideBadge();
      _noRefTracker = null;
    }, NO_REF_CLEANUP_MS);

    _noRefTracker = { handler, cleanupTimer, focusTimer: null };
    window.addEventListener('focus', handler);
  }

  // ══ HOOK: window.open ════════════════════════════════════════════

  const _origOpen = window.open.bind(window);
  window.open = function (url, target, features) {
    const result = _origOpen(url, target, features);
    const parsed = parseSvetSerialUrl(url);

    if (parsed && parsed.slug && parsed.season && parsed.ep) {
      const hint = {
        slug: parsed.slug,
        season: parsed.season,
        ep: parsed.ep,
        seriesName: parsed.slug,
      };

      if (result && !result.closed) {
        startPopupTracker(result, hint);
      } else {
        startNoRefTracker(hint);
      }
    }

    return result;
  };

  // ══ INICIALIZACE ════════════════════════════════════════════════

  injectStyles();
  window._MFSvetTracker = {
    stop:         stopTracker,
    startPopup:   startPopupTracker,
    startNoRef:   startNoRefTracker,
    showDialog:   showEpCountDialog,
    showBadge:    showBadge,
    hideBadge:    hideBadge,
  };

  console.log('[MFSvetTracker] v2.0 loaded — threshold 2min, smart estimate, badge active');
})();
