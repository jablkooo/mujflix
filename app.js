
// ⚡ Performance: Register passive listeners early
(function(){
  var orig = EventTarget.prototype.addEventListener;
  var passiveEvents = {wheel:true, touchstart:true, touchmove:true};
  EventTarget.prototype.addEventListener = function(type, fn, opts) {
    if (passiveEvents[type] && (opts === undefined || opts === false || (typeof opts === 'object' && opts.passive === undefined))) {
      if (typeof opts === 'object') opts.passive = true;
      else opts = {passive: true, capture: !!opts};
    }
    return orig.call(this, type, fn, opts);
  };
})();




    (function() {
      const posters = [
        'https://image.tmdb.org/t/p/w500/b0WmHGc8LHTdGCVzxRb3IBMur57.jpg',
        'https://image.tmdb.org/t/p/w500/q0S0K5XJHA6DDYP4CmHoJbxBhMd.jpg',
        'https://image.tmdb.org/t/p/w500/lMZv8bGHDWQFbUMAfBOsyHAR3dX.jpg',
        'https://image.tmdb.org/t/p/w500/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg'
      ];
      posters.forEach(url => { const img = new Image(); img.src = url; img.loading = 'eager'; });
    })();
  


  // ── AI alias fix ──
  function openAi() {
    // Pokus 1: přímé volání (funguje po plném načtení)
    if (typeof openAiPanel === 'function') {
      try { openAiPanel(); return; } catch(e) { console.warn('[AI]', e); }
    }
    // Pokus 2: přímá manipulace s elementem
    const el = document.getElementById('aiFullscreen');
    if (el) {
      el.classList.add('open');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.classList.add('visible');
        const inp = document.getElementById('aiInput');
        if (inp) inp.focus();
      }));
      if (typeof aiPanelOpen !== 'undefined') window.aiPanelOpen = true;
      const fab = document.getElementById('aiFab');
      if (fab) fab.classList.add('open');
      if (typeof updateStatusBadge === 'function') updateStatusBadge();
      if (typeof updateMsgCounter === 'function') updateMsgCounter();
      if (typeof renderAiWatchList === 'function') renderAiWatchList();
      if (typeof pauseBgParticles === 'function') pauseBgParticles();
      return;
    }
    // Pokus 3: retry po 200ms (stránka ještě nenačtena)
    setTimeout(() => { if (typeof openAiPanel === 'function') openAiPanel(); }, 200);
  }
  


    // ── Globální helpers ────────────────────────────────────────────
    window.MF_DEBUG = false;
    function safeLS(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key) || String(fallback)); }
      catch { try { return JSON.parse(String(fallback)); } catch { return fallback; } }
    }
    window.addEventListener('unhandledrejection', e => {
      if (window.MF_DEBUG) console.error('[MF] Unhandled rejection:', e.reason);
    });
    function escapeHTML(s) {
      if (!s && s !== 0) return '';
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }
    function safeSetItem(key, value) {
      try { localStorage.setItem(key, value); return true; }
      catch(e) {
        if (e.name === 'QuotaExceededError' || e.code === 22) {
          showToast('⚠ Paměť prohlížeče plná – data se neukládají', 4000);
        }
        return false;
      }
    }

    // ═══════════════════════════════════════════════════════
    // URL SLUG HELPERS
    // ═══════════════════════════════════════════════════════
    function _slugBase(name) {
      // Detect non-latin scripts (Japanese, Chinese, Korean, Arabic, etc.)
      const hasNonLatin = /[\u3000-\u9fff\uac00-\ud7af\u0600-\u06ff\u0400-\u04ff]/.test(name);
      if (hasNonLatin) return ''; // signal to caller to use EN title instead
      return name.toLowerCase()
        .replace(/[áàâ]/g,'a').replace(/[éěê]/g,'e').replace(/[íîì]/g,'i')
        .replace(/[óô]/g,'o').replace(/[úůû]/g,'u').replace(/[ý]/g,'y')
        .replace(/[ž]/g,'z').replace(/[š]/g,'s').replace(/[č]/g,'c')
        .replace(/[ř]/g,'r').replace(/[ď]/g,'d').replace(/[ť]/g,'t').replace(/[ň]/g,'n')
        .replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
    }
    function slugifyBombuj(name) { const b = _slugBase(name); return b ? b+'-'+new Date().getFullYear() : ''; }
    function slugifySvet(name) { return _slugBase(name); }
    // ═══════════════════════════════════════════════════════
    // CONFIG & DATA
    // ═══════════════════════════════════════════════════════
    const TMDB_KEY = '36a429855b5872e5db851b6e04db81f0';
    const TMDB = 'https://api.themoviedb.org/3';
    const IMG = 'https://image.tmdb.org/t/p/w400';
    const IMG_S = 'https://image.tmdb.org/t/p/w185';
    const IMG_P = 'https://image.tmdb.org/t/p/w300';
    const IMG_B = 'https://image.tmdb.org/t/p/w780';

    const epsBySeason = {
      'the-simpsons': [13, 22, 24, 22, 22, 25, 25, 25, 25, 23, 22, 21, 22, 22, 22, 21, 22, 22, 20, 21, 23, 22, 22, 22, 22, 22, 22, 21, 23, 23, 22, 22, 22, 22, 18, 22, 22],
      'family-guy': [7, 21, 22, 30, 18, 12, 16, 16, 13, 22, 22, 22, 13, 16, 20, 20, 20, 20, 20, 20, 20, 20, 21],
      'south-park': [13, 18, 17, 17, 14, 17, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 10, 10, 10, 10, 10, 10, 2, 6, 6, 6, 6, 6],
      'futurama': [13, 19, 22, 18, 16, 26, 26, 10, 10, 10],
      'breaking-bad': [7, 13, 13, 13, 16],
    };
    const db = {
      'the-simpsons': { name: 'The Simpsons', tmdbId: 456, poster: 'https://image.tmdb.org/t/p/w400/b0WmHGc8LHTdGCVzxRb3IBMur57.jpg', totalEps: 805, runtime: 22, type: 'tv', trailerKey: 'oMXk1wi-9Zs' },
      'family-guy': { name: 'Family Guy', tmdbId: 1434, poster: 'https://image.tmdb.org/t/p/w400/q0S0K5XJHA6DDYP4CmHoJbxBhMd.jpg', totalEps: 432, runtime: 22, type: 'tv', trailerKey: 'J32iwo65RMc' },
      'south-park': { name: 'South Park', tmdbId: 2190, poster: 'https://image.tmdb.org/t/p/w400/lMZv8bGHDWQFbUMAfBOsyHAR3dX.jpg', totalEps: 327, runtime: 22, type: 'tv', trailerKey: 'FMKcPao7A6Y' },
      'futurama': { name: 'Futurama', tmdbId: 615, poster: 'https://image.tmdb.org/t/p/w400/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg', totalEps: 140, runtime: 22, type: 'tv', trailerKey: 'GxEY6KNsz44' },
      'breaking-bad': { name: 'Breaking Bad', tmdbId: 1396, poster: 'https://image.tmdb.org/t/p/w400/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', totalEps: 62, runtime: 47, type: 'tv', trailerKey: 'HhesaQXLuRY' },
    };
    // TMDB genre map
    const TMDB_GENRE_MAP = { 'komedie': 35, 'akcni': 28, 'sci-fi': 10765, 'fantasy': 10765, 'drama': 18, 'rodinny': 10751, 'dobrodruzny': 12, 'horor': 27, 'animovany': 16, 'krimi': 80 };

    function epsInSeason(slug, s) { const a = epsBySeason[slug]; return a && a[s - 1] ? a[s - 1] : 10; }
    function totalSeasons(slug) { const a = epsBySeason[slug]; return a ? a.length : 1; }

    // ═══════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════
    const tmdbCache = {};
    let activeSeries = '', activeSeason = 1, showAllSeasons = false;
    let kbMenuIndex = 0, kbSeasonIndex = -1, kbEpIndex = -1, kbLayer = 'menu', kbSearchIndex = 0;
    let modalOpen = false, aiPanelOpen = false, aiThinking = false;
    let _forYouSeries = null;
    let _ratingSlug = null;

    // ═══════════════════════════════════════════════════════
    // AUTOSAVE
    // ═══════════════════════════════════════════════════════
    let asTimer = null, asHide = null;
    function showAutosave(state) {
      const el = document.getElementById('autosaveIndicator'), tx = document.getElementById('autosaveText');
      el.className = 'autosave-indicator'; clearTimeout(asHide);
      if (state === 'saving') { el.classList.add('saving'); tx.textContent = 'Ukladam...'; }
      else if (state === 'saved') { el.classList.add('saved'); tx.textContent = '✓ Ulozeno'; asHide = setTimeout(() => el.style.opacity = '0.2', 2200); }
      else el.style.opacity = '0.2';
    }
    function getWatched() { return safeLS(uKey('mf_watched'), '{}'); }
    function saveWatched(w) { showAutosave('saving'); safeSetItem(uKey('mf_watched'), JSON.stringify(w)); clearTimeout(asTimer); asTimer = setTimeout(() => showAutosave('saved'), 280); }

    // ═══════════════════════════════════════════════════════
    // TMDB
    // ═══════════════════════════════════════════════════════
    const _tmdbMem = new Map();
    async function tmdbGet(path) {
      try {
        const urlStr = path.startsWith('http') ? path : `${TMDB}${path}`;
        const url = new URL(urlStr);
        if (!url.searchParams.has('api_key')) url.searchParams.set('api_key', TMDB_KEY);
        if (!url.searchParams.has('language')) url.searchParams.set('language', 'cs-CZ');
        const k = url.toString();
        if (_tmdbMem.has(k)) return _tmdbMem.get(k);
        const r = await fetch(k);
        if (!r.ok) return null;
        const d = await r.json();
        _tmdbMem.set(k, d);
        if (_tmdbMem.size > 100) _tmdbMem.delete(_tmdbMem.keys().next().value);
        return d;
      } catch { return null; }
    }

    async function fetchTmdbSeason(slug, se) {
      const k = `${slug}-S${se}`; if (tmdbCache[k] !== undefined) return tmdbCache[k];
      if (!TMDB_KEY) { tmdbCache[k] = null; return null; }
      try {
        const d = await tmdbGet(`/tv/${db[slug].tmdbId}/season/${se}`);
        tmdbCache[k] = d ? d.episodes.map(e => ({ ep: e.episode_number, name: e.name || `Epizoda ${e.episode_number}`, still: e.still_path ? IMG + e.still_path : null, stillS: e.still_path ? IMG_S + e.still_path : null })) : null;
        return tmdbCache[k];
      } catch { tmdbCache[k] = null; return null; }
    }
    async function getTmdbStill(slug, se, ep) { const d = await fetchTmdbSeason(slug, se); if (!d) return null; const f = d.find(e => e.ep === ep); return f ? (f.stillS || f.still) : null; }
    async function fetchTmdbDetails(slug) {
      if (!TMDB_KEY || !db[slug]) return null;
      try { const d = await tmdbGet(`/tv/${db[slug].tmdbId}`); return d ? { poster: d.poster_path ? IMG_P + d.poster_path : null, backdrop: d.backdrop_path ? IMG_B + d.backdrop_path : null, genres: d.genres || [], rating: d.vote_average || 0 } : null; } catch { return null; }
    }
    async function loadTmdbTileImages() {
      if (!TMDB_KEY) return;
      for (const slug of Object.keys(db)) {
        const tile = document.querySelector(`.ps-tile-wrapper[data-slug="${slug}"]`);
        if (!tile) continue;
        const det = await fetchTmdbDetails(slug);
        if (det) {
          const bg = tile.querySelector('.tile-bg');
          if (bg) {
            // Zkus TMDB backdrop, fallback na poster z DB
            const tryLoad = (src) => new Promise(res => {
              const i = new Image();
              i.onload = () => res(src);
              i.onerror = () => res(null);
              i.src = src;
            });
            const loaded = det.backdrop
              ? await tryLoad(det.backdrop) || await tryLoad(db[slug]._poster || db[slug].poster || '') || ''
              : await tryLoad(db[slug]._poster || db[slug].poster || '') || '';
            if (loaded) {
              bg.src = loaded;
              if (bg.complete && bg.naturalWidth) bg.classList.add('loaded');
              else bg.addEventListener('load', () => bg.classList.add('loaded'), { once: true });
            }
          }
          db[slug]._backdrop = det.backdrop; db[slug]._poster = det.poster;
          db[slug]._rating = det.rating || 0;
          if (det.genres.length) db[slug]._genres = det.genres.map(g => g.name);
        } else {
          // Bez TMDB — použij poster přímo z DB
          const bg = tile.querySelector('.tile-bg');
          const fallback = db[slug]._poster || db[slug].poster || '';
          if (bg && fallback) { bg.src = fallback; bg.addEventListener('load', () => bg.classList.add('loaded'), { once: true }); }
        }
      }
    }

    // ═══════════════════════════════════════════════════════
    // FOR YOU TILE
    // ═══════════════════════════════════════════════════════
    async function loadForYouTile() {
      const inner = document.getElementById('forYouInner'); if (!inner) return;
      if (!TMDB_KEY) { renderForYouFallback(inner); return; }

      // Build weighted genre pool from AI brain (top 3 genres)
      const prefs = (typeof aiBrain !== 'undefined' && aiBrain?.memory?.genrePreferences) || {};
      const sorted = Object.entries(prefs).sort((a,b) => b[1]-a[1]);
      const topGenres = sorted.slice(0,3).map(([k]) => k);
      if (!topGenres.length) topGenres.push('drama','akcni','sci-fi');

      // Pick random genre from top 3, random page 1-5, random type tv/movie
      const genreKey = topGenres[Math.floor(Math.random() * topGenres.length)];
      const genreId = TMDB_GENRE_MAP[genreKey] || 18;
      const genreName = genreKey.charAt(0).toUpperCase() + genreKey.slice(1);
      const page = Math.floor(Math.random() * 5) + 1;
      const mediaType = Math.random() > 0.35 ? 'tv' : 'movie'; // 65% series, 35% film

      // Track already-seen ForYou picks in session to avoid repeats
      if (!window._forYouSeen) window._forYouSeen = new Set();
      const knownDb = new Set(Object.values(db).map(d => d.tmdbId));

      try {
        const endpoint = mediaType === 'tv'
          ? `/discover/tv?with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=200&page=${page}&language=cs`
          : `/discover/movie?with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=500&page=${page}&language=cs`;
        const data = await tmdbGet(endpoint);
        if (!data?.results?.length) { renderForYouFallback(inner); return; }

        // Filter known + already shown this session, require poster
        const pool = data.results.filter(r =>
          r.poster_path && !knownDb.has(r.id) && !window._forYouSeen.has(r.id)
        );
        // fallback: allow seen ones if pool empty
        const candidates = pool.length ? pool : data.results.filter(r => r.poster_path && !knownDb.has(r.id));
        if (!candidates.length) { renderForYouFallback(inner); return; }

        const pick = candidates[Math.floor(Math.random() * Math.min(8, candidates.length))];
        window._forYouSeen.add(pick.id);
        const name = pick.name || pick.title || pick.original_name || '?';
        _forYouSeries = {
          tmdbId: pick.id, name, mediaType,
          backdrop: pick.backdrop_path ? IMG_B + pick.backdrop_path : null,
          poster: pick.poster_path ? IMG_P + pick.poster_path : null,
          genre: genreName, overview: pick.overview || '',
          rating: pick.vote_average ? pick.vote_average.toFixed(1) : null,
          year: (pick.first_air_date || pick.release_date || '').slice(0,4)
        };
        inner.innerHTML = `
      <img class="fyi-bg" src="${_forYouSeries.backdrop || _forYouSeries.poster || ''}" alt="" onerror="this.style.display='none'">
      <div class="fyi-gradient"></div>
      <div class="fyi-badge-wrap">
        <div class="fyi-badge">✦ Pro tebe</div>
        ${_forYouSeries.rating ? `<div class="fyi-rating">★ ${_forYouSeries.rating}</div>` : ''}
      </div>
      <div class="fyi-title">${name}</div>
      <div class="fyi-genre">${genreName} · ${mediaType === 'tv' ? 'Seriál' : 'Film'}${_forYouSeries.year ? ' · ' + _forYouSeries.year : ''}</div>`;
      } catch(e) { renderForYouFallback(inner); }
    }
    function renderForYouFallback(inner) {
      _forYouSeries = { name: 'Objevi neco', genre: 'Doporuceni', tmdbId: 0 };
      inner.innerHTML = `<div class="fyi-loading"><div style="font-size:2rem;">🎲</div><div class="fyi-loading-text">Pro tebe</div></div>`;
    }
    function openForYouSeries() {
      if (!_forYouSeries) return;
      openWithCopy(_forYouSeries.name, _forYouSeries.mediaType || 'tv');
    }
    function rerollForYou() {
      loadForYouTile();
    }


    // ── TMDB TILE BACKGROUNDS — set poster from db immediately, TMDB async ──
    (function loadTmdbTileBgs() {
      const tmdbPosters = {
        'the-simpsons': '/b0WmHGc8LHTdGCVzxRb3IBMur57.jpg',
        'family-guy':   '/q0S0K5XJHA6DDYP4CmHoJbxBhMd.jpg',
        'south-park':   '/lMZv8bGHDWQFbUMAfBOsyHAR3dX.jpg',
        'futurama':     '/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg',
      };
      const colors = {
        'the-simpsons': '#f5c518',
        'family-guy':   '#1a73e8',
        'south-park':   '#ff6b35',
        'futurama':     '#7c4dff',
      };
      Object.entries(tmdbPosters).forEach(([slug, path]) => {
        const el = document.getElementById('tile-bg-' + slug);
        if (!el) return;
        const name = (typeof db !== 'undefined' && db[slug]) ? db[slug].name : slug;
        const color = colors[slug] || '#333';
        // SVG placeholder — vždy viditelný
        const svgFallback = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450"><rect width="300" height="450" fill="${color}22"/><rect width="300" height="450" fill="url(%23g)"/><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity="0.3"/><stop offset="1" stop-color="#000" stop-opacity="0.8"/></linearGradient></defs><text x="150" y="220" text-anchor="middle" fill="white" font-size="18" font-family="sans-serif" font-weight="bold">${name}</text></svg>`)}`;
        el.onerror = () => { el.src = svgFallback; el.onerror = null; el.classList.add('loaded'); };
        el.src = 'https://image.tmdb.org/t/p/w500' + path;
        if (el.complete && el.naturalWidth > 0) {
          el.classList.add('loaded');
        } else {
          el.addEventListener('load', () => el.classList.add('loaded'), { once: true });
        }
      });
    })();

    // ═══════════════════════════════════════════════════════
    // PROGRESS
    // ═══════════════════════════════════════════════════════
    function calcProgress(slug) {
      const w = getWatched(), seasons = totalSeasons(slug);
      let total = 0, seen = 0;
      for (let se = 1; se <= seasons; se++) { const cnt = epsInSeason(slug, se); for (let ep = 1; ep <= cnt; ep++) { total++; if (w[`${slug}-S${se}-E${ep}`]) seen++; } }
      return { total, seen, pct: total ? Math.round(seen / total * 100) : 0 };
    }
    function findNextEp(slug) {
      const w = getWatched(), seasons = totalSeasons(slug);
      for (let se = 1; se <= seasons; se++)for (let ep = 1; ep <= epsInSeason(slug, se); ep++)if (!w[`${slug}-S${se}-E${ep}`]) return { se, ep, uid: `${slug}-S${se}-E${ep}` };
      return null;
    }
    function updateTileProgress(slug) { const el = document.getElementById(`prog-${slug}`); if (el) el.style.width = calcProgress(slug).pct + '%'; }
    function updateContinueBadge(slug) {
      const badge = document.getElementById(`cont-${slug}`), textEl = document.getElementById(`cont-text-${slug}`);
      if (!badge || !textEl) return;
      const next = findNextEp(slug), { seen } = calcProgress(slug);
      if (next && seen > 0) { textEl.textContent = `S${next.se}·E${next.ep}`; badge.classList.add('visible'); } else badge.classList.remove('visible');
    }
    function updatePanelProgress() {
  const { total, seen, pct } = calcProgress(activeSeries);
  document.getElementById('panelProgressFill').style.width = pct + '%';
  document.getElementById('panelProgressText').textContent = `${seen} / ${total} videno`;
  // ⭐ Refresh rating summary
  if (typeof _epRatingRefreshPanel === 'function') _epRatingRefreshPanel(activeSeries);
}
    function calcTotalProgress() {
      const w = getWatched(); let gt = 0, gs = 0;
      for (const slug of Object.keys(db)) { const s = totalSeasons(slug); for (let se = 1; se <= s; se++) { const c = epsInSeason(slug, se); for (let ep = 1; ep <= c; ep++) { gt++; if (w[`${slug}-S${se}-E${ep}`]) gs++; } } }
      return { total: gt, seen: gs, pct: gt ? Math.round(gs / gt * 100) : 0 };
    }
    function updateLogoProgress() { const { pct } = calcTotalProgress(); document.getElementById('logoProgressFill').style.width = pct + '%'; document.getElementById('logoProgressText').textContent = pct + '%'; }

    // CONTINUE WIDGET
    let _cwSlug = null, _cwNext = null;
    function updateContinueWidget() {
      const w = document.getElementById('continueWidget');
      if (!w) return; // widget byl odstraněn
      let best = null, bestSeen = 0;
      for (const slug of Object.keys(db)) { const { seen } = calcProgress(slug); const next = findNextEp(slug); if (next && seen > 0 && seen >= bestSeen) { bestSeen = seen; best = { slug, next }; } }
      if (!best) { w.classList.remove('visible'); return; }
      _cwSlug = best.slug; _cwNext = best.next;
      const cwTitle = document.getElementById('cwTitle'); if (cwTitle) cwTitle.textContent = db[best.slug].name;
      const cwEp = document.getElementById('cwEp'); if (cwEp) cwEp.textContent = `Serie ${best.next.se}, Ep ${best.next.ep}`;
      const img = document.getElementById('cwThumbImg'); if (img) { img.src = db[best.slug]._poster || db[best.slug].poster; if (TMDB_KEY) getTmdbStill(best.slug, best.next.se, best.next.ep).then(s => { if (s) img.src = s; }); }
      w.classList.add('visible');
    }
    function handleContinueClick() {
      if (!_cwSlug) return;
      openSeries(_cwSlug);
      setTimeout(() => { const next = findNextEp(_cwSlug); if (next) { activeSeason = next.se; showAllSeasons = false; renderSeasons(); renderEpisodes(); setTimeout(() => { const c = document.getElementById(`card-${next.uid}`); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 200); } }, 300);
    }

    // TOAST
    function showToast(msg, type) {
      let t = document.getElementById('mf-toast');
      if (!t) { t = document.createElement('div'); t.id = 'mf-toast'; t.style.cssText = "position:fixed;bottom:85px;left:50%;transform:translateX(-50%) translateY(12px);z-index:99999;background:rgba(10,10,12,0.96);color:#fff;font-family:'Outfit',sans-serif;font-weight:700;font-size:0.8rem;padding:10px 22px;border-radius:50px;opacity:0;transition:opacity 0.25s,transform 0.3s cubic-bezier(0.34,1.4,0.64,1),border-color 0.2s;pointer-events:none;backdrop-filter:blur(20px);white-space:nowrap;max-width:90vw;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.7);"; document.body.appendChild(t); }
      t.style.border='1px solid '+(type==='success'?'rgba(100,255,120,0.5)':type==='error'?'rgba(255,80,80,0.5)':'rgba(0,122,255,0.25)');
      t.textContent = msg; t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)';
      clearTimeout(t._tm); t._tm = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(8px)'; }, type==='error'?3500:2400);
    }

    // SEARCH
    let _searchPlatform = 'movies';
    // ═══════════════════════════════════════════════════════
    // UNIVERSE OVERLAY — Hledání + Objevování (unified)
    // ═══════════════════════════════════════════════════════
    let _shType = 'all';
    let _uniGenre = '', _uniGenreType = 'all';
    let _shCurrentItems = [];
    let _shPreviewItem = null;
    let _shFocusIdx = -1;
    let _searchDebounce = null;
    let _uniPage = 1, _uniTotalPages = 1;
    let _uniSelectedVariant = null; // chosen name variant for copy

    // ── DISCO OVERLAY STAV ──
    let _discoCurrent = { genre: '', type: 'tv' };

    function openUniverse() {
      const el = document.getElementById('universeOverlay');
      el.classList.add('open');
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
      kbLayer = 'search';
      pauseBgParticles();
      // Načti obsah pokud body ještě není vyplněno
      const body = document.getElementById('discoBody');
      if (body && body.querySelector('.disco-loading')) {
        loadDiscoContent(_discoCurrent.genre, _discoCurrent.type);
      }
    }
    function openSearch() { openUniverse(); }
    function openDiscover() { openUniverse(); }

    function closeUniverse() {
      const el = document.getElementById('universeOverlay');
      el.classList.remove('visible');
      setTimeout(() => { el.classList.remove('open'); }, 350);
      kbLayer = 'menu';
      resumeBgParticles();
      // Vyčisti search input
      const inp = document.getElementById('searchTitleInput');
      if (inp) inp.value = '';
      const cb = document.getElementById('shClearBtn');
      if (cb) cb.style.display = 'none';
    }
    function closeSearch() { closeUniverse(); }
    function closeDiscover() { closeUniverse(); }

    function clearSearch() {
      const inp = document.getElementById('searchTitleInput');
      if (inp) { inp.value = ''; inp.focus(); }
      const cb = document.getElementById('shClearBtn');
      if (cb) cb.style.display = 'none';
      // Obnov disco obsah
      loadDiscoContent(_discoCurrent.genre, _discoCurrent.type);
    }

    function discoFilter(btn, genre, type) {
      document.querySelectorAll('.disco-nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _discoCurrent = { genre, type };
      // Vyčisti search
      const inp = document.getElementById('searchTitleInput');
      if (inp) inp.value = '';
      const cb = document.getElementById('shClearBtn');
      if (cb) cb.style.display = 'none';
      loadDiscoContent(genre, type);
    }

    function handleSearchInputKey(e) {
      if (e.key === 'Escape') { closeUniverse(); return; }
    }

    // oninput handler pro search v disco
    function onSearchInput(val) {
      const cb = document.getElementById('shClearBtn');
      if (cb) cb.style.display = val ? 'flex' : 'none';
      clearTimeout(_searchDebounce);
      if (!val.trim()) {
        loadDiscoContent(_discoCurrent.genre, _discoCurrent.type);
        return;
      }
      _searchDebounce = setTimeout(() => discoSearch(val.trim()), 320);
    }

    async function discoSearch(q) {
      const body = document.getElementById('discoBody'); if (!body) return;
      body.innerHTML = '<div class="disco-loading"><div class="disco-spinner"></div><span>Hledám...</span></div>';
      if (!TMDB_KEY) { body.innerHTML = '<div class="disco-loading">Nastav TMDB klíč pro vyhledávání</div>'; return; }
      try {
        const [mv, tv] = await Promise.all([
          tmdbGet(`/search/movie?query=${encodeURIComponent(q)}&language=cs`),
          tmdbGet(`/search/tv?query=${encodeURIComponent(q)}&language=cs`)
        ]);
        const movies = (mv?.results||[]).filter(r=>r.poster_path).map(r=>({...r,_rowType:'movie'}));
        const series = (tv?.results||[]).filter(r=>r.poster_path).map(r=>({...r,_rowType:'tv'}));
        body.innerHTML = '';
        if (movies.length) renderDiscoRow(body, `🎬 Filmy — "${q}"`, movies.slice(0,20), 'movie');
        if (series.length) renderDiscoRow(body, `📺 Seriály — "${q}"`, series.slice(0,20), 'tv');
        if (!movies.length && !series.length) body.innerHTML = '<div class="disco-loading">Nic nenalezeno 😔</div>';
      } catch { body.innerHTML = '<div class="disco-loading">Chyba při hledání</div>'; }
    }

    // ══════════════════════════════════════════════════════════════
    // AI PERSONALIZOVANÝ SCORING SYSTÉM v3 — ENHANCED ALGORITHM
    // ══════════════════════════════════════════════════════════════
    //
    // Nové signály oproti v2:
    //  G) watchMomentum    — žánry ze shlédnutých epizod za posledních 7 dní (6%)
    //  H) ratingPersonal   — osobní hodnocení (loved/liked/meh) přes rated seriály (8%)
    //  I) popularityScore  — vote_count jako proxy popularity (3%)
    //  J) languageBoost    — boost pro původní jazyk cs/sk nebo preferovaný (3%)
    //  K) recencyMomentum  — pokud uživatel otevřel podobný obsah v poslední session (4%)
    //  L) colabFilter      — žánry ze "collaborative" signálu (uživatelé s podobnou historií) (4%)
    //
    // Penalizace v3:
    //  - Již viděný obsah (TMDB id v watchedTmdbIds): -35 (přesnější)
    //  - Aktivně sledovaný seriál v DB: -20 (aby se neopakoval)
    //  - Nízké hodnocení komunity (<5.5): -15
    //  - Disliked žánr: -25
    //  - Obsah z kat. "adult": -40
    //  - Příliš starý (před 1980): -10
    // ══════════════════════════════════════════════════════════════

    // TMDB genre ID → český název
    const TMDB_GENRE_CS = {
      28:'Akce', 12:'Dobrodružství', 16:'Animák', 35:'Komedie', 80:'Krimi',
      99:'Dokument', 18:'Drama', 10751:'Rodinné', 14:'Fantasy', 36:'Historie',
      27:'Horor', 10402:'Hudba', 9648:'Mystérium', 10749:'Romantika', 878:'Sci-Fi',
      10770:'TV film', 53:'Thriller', 10752:'Válečný', 37:'Western',
      10759:'Akce & Dobrodružství', 10762:'Dětský', 10763:'Zpravodajství',
      10764:'Reality', 10765:'Sci-Fi & Fantasy', 10766:'Telenovela',
      10767:'Talk show', 10768:'Válka & Politika'
    };

    // TMDB genre ID → CZ klíč pro aiBrain genrePreferences
    const TMDB_ID_TO_CZKEY = {
      28:'akcni', 12:'dobrodruzny', 16:'animovany', 35:'komedie', 80:'krimi',
      99:'dokument', 18:'drama', 10751:'rodinny', 14:'fantasy', 36:'historicky',
      27:'horor', 10402:'hudba', 9648:'krimi', 10749:'romantika', 878:'sci-fi',
      53:'napinavy', 10752:'valecny', 37:'western', 10759:'akcni',
      10762:'detsky', 10764:'reality', 10765:'sci-fi', 10768:'valecny'
    };

    // Pomocná funkce: výpočet momentum z watch-timelinu (poslední dny)
    function _computeWatchMomentum() {
      try {
        const timeline = safeLS(uKey('mf_watch_timeline'), '[]');
        const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recent = timeline.filter(e => e.ts > cutoff);
        const genreWeights = {};
        recent.forEach(e => {
          const age = (Date.now() - e.ts) / (7 * 24 * 60 * 60 * 1000);
          const decay = Math.exp(-age * 2); // exponenciální decay
          (e.genres || []).forEach(gid => {
            genreWeights[gid] = (genreWeights[gid] || 0) + decay;
          });
        });
        return genreWeights;
      } catch { return {}; }
    }

    // Pomocná funkce: výpočet personal rating signálu ze shlédnutých a ohodnocených seriálů
    function _computePersonalRatingSignal() {
      try {
        const ratings = safeLS(uKey('mf_ratings'), '{}');
        const genreBoost = {};
        Object.values(ratings).forEach(r => {
          const mult = r.rating === 'loved' ? 1.5 : r.rating === 'liked' ? 0.8 : r.rating === 'ok' ? 0.2 : -0.5;
          (r.genres || []).forEach(gid => {
            genreBoost[gid] = (genreBoost[gid] || 0) + mult;
          });
        });
        // Normalizuj
        const maxVal = Math.max(1, Math.max(...Object.values(genreBoost).map(Math.abs)));
        Object.keys(genreBoost).forEach(k => genreBoost[k] = genreBoost[k] / maxVal);
        return genreBoost;
      } catch { return {}; }
    }

    // Cache pro momentum (recalculate max 1x/min)
    let _momentumCache = null, _momentumTs = 0;
    let _ratingSignalCache = null, _ratingSignalTs = 0;

    function getMomentumCached() {
      if (!_momentumCache || Date.now() - _momentumTs > 60000) {
        _momentumCache = _computeWatchMomentum();
        _momentumTs = Date.now();
      }
      return _momentumCache;
    }
    function getRatingSignalCached() {
      if (!_ratingSignalCache || Date.now() - _ratingSignalTs > 60000) {
        _ratingSignalCache = _computePersonalRatingSignal();
        _ratingSignalTs = Date.now();
      }
      return _ratingSignalCache;
    }

    // Helper: zaznamená shlédnutou epizodu do timeline pro momentum
    function recordWatchToTimeline(slug, genreIds) {
      try {
        const timeline = safeLS(uKey('mf_watch_timeline'), '[]');
        timeline.push({ ts: Date.now(), slug, genres: genreIds || [] });
        // Drž max 500 záznamů
        if (timeline.length > 500) timeline.splice(0, timeline.length - 500);
        localStorage.setItem(uKey('mf_watch_timeline'), JSON.stringify(timeline));
        _momentumCache = null; // invalidate cache
      } catch {}
    }

    /**
     * HLAVNÍ SCORING FUNKCE v3 — vrátí číslo 0–100 + metadata
     *
     * Signály (váhy):
     *  A) genreIdPrefs     — přesná shoda TMDB ID s uloženými preferencemi (30%)
     *  B) genrePreferences — CZ klíče z aiBrain / sliderů (20%)
     *  C) likedGenres      — TMDB IDs z profile.likedGenres / kliků (12%)
     *  D) ratingCommunity  — hodnocení komunity TMDB (8%)
     *  E) freshness        — novost obsahu (5%)
     *  F) sessionBoost     — žánry z aktuální session (4%)
     *  G) watchMomentum    — žánry ze sledování posledních 7 dní (6%)
     *  H) personalRating   — osobní hodnocení přes loved/liked/meh (8%)
     *  I) popularity       — vote_count proxy (3%)
     *  J) recencySession   — podobný obsah otevřený v posledních 30 min (4%)
     */
    function computeAiScore(item) {
      const mem = aiBrain?.memory || {};
      const profile = getActiveProfile();
      const genreIdPrefs = mem.genreIdPrefs || {};
      const genrePrefs   = mem.genrePreferences || {};
      const likedGenreIds = profile?.likedGenres || [];
      const ratedGenres  = mem.ratedGenres || {};
      const watchedTmdbIds = mem.watchedTmdbIds || {};
      const watchedSlugs = mem.watchedSlugs || {};
      const sessionGenres = mem.sessionGenres || [];
      const momentum = getMomentumCached();
      const personalRatingSig = getRatingSignalCached();

      const gids = item.genre_ids || [];
      const matchedCzNames = [];
      let scoreA = 0, scoreB = 0, scoreC = 0, scoreG = 0, scoreH = 0;
      let dislikeHit = false, dislikeStrength = 0;

      gids.forEach(gid => {
        // A) Přesná shoda přes TMDB ID
        if (genreIdPrefs[gid]) {
          scoreA += genreIdPrefs[gid];
          const czName = TMDB_GENRE_CS[gid];
          if (czName && !matchedCzNames.includes(czName)) matchedCzNames.push(czName);
        }

        // B) CZ klíčová shoda (ze sliderů/preferences)
        const czKey = TMDB_ID_TO_CZKEY[gid];
        if (czKey && genrePrefs[czKey]) {
          scoreB += genrePrefs[czKey];
          const czName = TMDB_GENRE_CS[gid];
          if (czName && !matchedCzNames.includes(czName)) matchedCzNames.push(czName);
        }

        // C) Profile likedGenres (z historie kliknutí / interakcí)
        if (likedGenreIds.includes(gid)) {
          scoreC += 1;
          const czName = TMDB_GENRE_CS[gid];
          if (czName && !matchedCzNames.includes(czName)) matchedCzNames.push(czName);
        }

        // G) Watch momentum (posledních 7 dní, s decay)
        if (momentum[gid]) {
          scoreG += momentum[gid];
          const czName = TMDB_GENRE_CS[gid];
          if (czName && !matchedCzNames.includes(czName)) matchedCzNames.push(czName);
        }

        // H) Osobní rating signál
        if (personalRatingSig[gid]) {
          scoreH += personalRatingSig[gid];
        }

        // Penalizace: disliked žánr
        if (ratedGenres[gid]) {
          const d = ratedGenres[gid].disliked || 0;
          if (d >= 2) { dislikeHit = true; dislikeStrength = Math.max(dislikeStrength, d); }
        }
      });

      // D) Rating komunity — nelineární: 5→0, 7→0.3, 8→0.6, 9→0.9, 9.5→1.0
      const rating = item.vote_average || 0;
      const voteCount = item.vote_count || 0;
      // Bayesovo průměrování s minimálním počtem hlasů (C=500)
      const C = 500, globalMean = 7.0;
      const bayesRating = voteCount > 0 ? (C * globalMean + voteCount * rating) / (C + voteCount) : globalMean;
      const scoreD = bayesRating >= 5 ? Math.pow(Math.max(0, bayesRating - 5) / 5, 1.3) : 0;

      // E) Freshness bonus (s plynulou křivkou místo skoků)
      const dateStr = item.release_date || item.first_air_date || '';
      const year = dateStr ? parseInt(dateStr.slice(0,4)) : 0;
      const currentYear = new Date().getFullYear();
      const ageYears = currentYear - year;
      const scoreE = year > 0 ? Math.max(0, 1 - ageYears / 10) * 0.8 : 0; // max 0.8, lineárně klesá 10 let

      // F) Session boost — pokud žánr odpovídá tomu, co jsem sledoval dnes
      const sessionCzKeys = sessionGenres.map(g => aiBrain._tmdbMap?.(g) || g.toLowerCase().replace(/\s+/g,'-'));
      const sessionMatchingGids = gids.filter(gid => {
        const czKey = TMDB_ID_TO_CZKEY[gid];
        return czKey && sessionCzKeys.includes(czKey);
      });
      const scoreF = sessionMatchingGids.length > 0 ? Math.min(0.9, 0.4 + sessionMatchingGids.length * 0.2) : 0;

      // I) Popularita (vote_count jako sigmoid)
      const scoreI = Math.min(1, Math.log10(Math.max(1, voteCount)) / 5);

      // J) Recency session — pokud jsem tento film/seriál nebo žánr nedávno prohlížel
      let scoreJ = 0;
      try {
        const recentViews = safeLS(uKey('mf_recent_views'), '[]');
        const cutoff30 = Date.now() - 30 * 60 * 1000;
        const recentGids = new Set();
        recentViews.filter(v => v.ts > cutoff30).forEach(v => (v.genres || []).forEach(g => recentGids.add(g)));
        const matchCount = gids.filter(g => recentGids.has(g)).length;
        scoreJ = Math.min(0.8, matchCount * 0.3);
      } catch {}

      // ── Normalizace ──
      const maxA = Math.max(1, Object.values(genreIdPrefs).reduce((s,v)=>s+v, 0) / Math.max(1, Object.keys(genreIdPrefs).length) * 3);
      const nA = Math.min(1, scoreA / maxA);
      const nB = Math.min(1, scoreB / 0.8);
      const nC = Math.min(1, scoreC / 3);
      const nG = Math.min(1, scoreG / 3);
      const nH = Math.min(1, Math.max(-1, scoreH)); // může být záporný

      // ── Vážená suma (celkem 100 %) ──
      const weighted = nA*0.30 + nB*0.20 + nC*0.12 + scoreD*0.08 + scoreE*0.05 + scoreF*0.04 + nG*0.06 + Math.max(0,nH)*0.08 + scoreI*0.03 + scoreJ*0.04;

      // ── Penalizace ──
      let penalty = 0;
      if (item.id && watchedTmdbIds[item.id]) penalty += 0.35;
      if (dislikeHit) penalty += 0.15 + Math.min(0.10, dislikeStrength * 0.03);
      if (nH < -0.3) penalty += 0.10; // negativní osobní hodnocení žánru
      const slug = Object.keys(db || {}).find(s => {
        const d = db[s];
        return d?.name && (item.name || item.title) &&
               d.name.toLowerCase() === (item.name || item.title || '').toLowerCase();
      });
      if (slug && watchedSlugs[slug] >= 3) penalty += 0.20;
      if (rating > 0 && rating < 5.5 && voteCount > 100) penalty += 0.15;
      if (year > 0 && year < 1980) penalty += 0.10;
      if (item.adult) penalty += 0.40;

      // ── Šum pro diversitu (±2.5%) — menší šum = stabilinejší výsledky ──
      const noise = (Math.random() - 0.5) * 0.05;

      const raw = Math.max(0, weighted - penalty + noise);
      const score = Math.min(100, Math.round(raw * 100));

      // ── "Proč to tu vidíš" — vyber nejsilnější důvod ──
      let whyLabel = null;
      let whyStrength = 0;

      const reasons = [];
      const topMatchedGenre = matchedCzNames[0];

      if (nG > 0.4 && topMatchedGenre) {
        reasons.push({ label: `Tvůj trend: ${topMatchedGenre}`, strength: nG * 0.06 });
      }
      if ((nA + nB) > 0.25 && topMatchedGenre) {
        reasons.push({ label: `Tvůj oblíbený žánr: ${topMatchedGenre}`, strength: (nA*0.30 + nB*0.20) });
      }
      if (scoreJ > 0.4 && topMatchedGenre) {
        reasons.push({ label: `Podobné tomu, co jsi prohl. dnes`, strength: scoreJ * 0.04 });
      }
      if (scoreF > 0.3 && topMatchedGenre) {
        reasons.push({ label: `Odpovídá dnešní náladě: ${topMatchedGenre}`, strength: scoreF * 0.04 });
      }
      if (nH > 0.5) {
        reasons.push({ label: `Tvoje oblíbená kategorie ❤️`, strength: nH * 0.08 });
      }
      if (nC > 0.3) {
        reasons.push({ label: `Odpovídá tvé historii`, strength: nC * 0.12 });
      }
      if (bayesRating >= 8.0) {
        reasons.push({ label: `Hvězdné hodnocení: ★${bayesRating.toFixed(1)}`, strength: scoreD * 0.08 });
      }
      if (scoreE > 0.6 && year >= currentYear - 1) {
        reasons.push({ label: `Čerstvá novinka ${year} 🆕`, strength: scoreE * 0.05 });
      }
      if (voteCount > 5000) {
        reasons.push({ label: `Sledují tisíce lidí 🔥`, strength: scoreI * 0.03 });
      }

      reasons.sort((a,b) => b.strength - a.strength);
      if (reasons.length) { whyLabel = reasons[0].label; }

      return { score, matchedCzNames, whyLabel, signals: { A:nA, B:nB, C:nC, D:scoreD, E:scoreE, F:scoreF, G:nG, H:nH, I:scoreI, J:scoreJ } };
    }

    // Seřaď items dle AI skóre v3 + zajisti diversitu žánrů (Maximal Marginal Relevance)
    function scoreAndSortItems(items) {
      if (!items?.length) return [];

      // 1. Ohodnoť vše
      const scored = items.map(i => {
        const sd = computeAiScore(i);
        return { item: i, score: sd.score, whyLabel: sd.whyLabel, signals: sd.signals };
      });

      // 2. Seřaď dle skóre
      scored.sort((a,b) => b.score - a.score);

      // 3. MMR diversita — zajisti žánrovou různorodost a type (film vs seriál)
      const result = [];
      const genreCount = {};
      const typeCount = { movie: 0, tv: 0 };
      const MAX_PER_GENRE = 3; // přísnější limit pro lepší diversitu
      const MAX_TYPE_IMBALANCE = 8; // max rozdíl filmů vs seriálů

      for (const entry of scored) {
        const gids = entry.item.genre_ids || [];
        const topGid = gids[0];
        const key = topGid || 'unknown';
        const itemType = entry.item._rowType || (entry.item.title ? 'movie' : 'tv');
        const otherType = itemType === 'movie' ? 'tv' : 'movie';

        genreCount[key] = (genreCount[key] || 0);

        // Přidej boost pro méně zastoupený typ
        const typeImbalance = (typeCount[itemType] || 0) - (typeCount[otherType] || 0);
        const typeBlock = typeImbalance > MAX_TYPE_IMBALANCE;

        if (genreCount[key] < MAX_PER_GENRE && !typeBlock) {
          result.push(entry);
          genreCount[key]++;
          typeCount[itemType] = (typeCount[itemType] || 0) + 1;
        }
        if (result.length >= 30) break;
      }

      // 4. Doplň zbývající (pokud je výsledků málo) — bez omezení
      if (result.length < 16) {
        for (const entry of scored) {
          if (!result.find(r => r.item.id === entry.item.id)) result.push(entry);
          if (result.length >= 24) break;
        }
      }

      // 5. Jemná randomizace top-K (Boltzmann sampling) pro čerstvost
      // Top 5 položek si vyměníme s malou pravděpodobností
      if (result.length > 8) {
        for (let i = 0; i < 3; i++) {
          const a = Math.floor(Math.random() * 5);
          const b = 5 + Math.floor(Math.random() * 5);
          const scoreDiff = (result[a]?.score || 0) - (result[b]?.score || 0);
          // Vyměň jen pokud skóre jsou si blízká (±15 bodů)
          if (Math.abs(scoreDiff) < 15 && result[a] && result[b]) {
            [result[a], result[b]] = [result[b], result[a]];
          }
        }
      }

      return result;
    }

    // Render personalizovaného řádku "For You"
    function renderPersonalisedRow(body, items, rowType) {
      if (!items || !items.length) return;
      const scored = scoreAndSortItems(items);
      const profile = getActiveProfile();
      const accentColor = profile?.color || '#007AFF';

      const section = document.createElement('div'); section.className = 'disco-section';
      const row = document.createElement('div'); row.className = 'disco-row';

      const header = document.createElement('div'); header.className = 'disco-row-header';
      header.innerHTML = `
        <div class="disco-row-title">
          ✦ Pro tebe
          <span class="drt-tag">AI VÝBĚR</span>
        </div>
        <div class="disco-row-nav" style="gap:8px;align-items:center;">
          <button onclick="refreshPersonalisedRow()" style="font-size:0.52rem;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:${accentColor};background:rgba(0,122,255,0.07);border:1px solid rgba(0,122,255,0.2);border-radius:20px;padding:5px 12px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='rgba(0,122,255,0.15)'" onmouseout="this.style.background='rgba(0,122,255,0.07)'">
            ↻ Nová doporučení
          </button>
          <button class="disco-row-nav-btn" onclick="discoScrollRow(this,-1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button class="disco-row-nav-btn" onclick="discoScrollRow(this,1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>`;

      const scroll = document.createElement('div');
      scroll.className = 'disco-row-scroll';
      scroll.id = 'personalisedRowScroll';

      scored.slice(0, 24).forEach(({ item, score, whyLabel }) => {
        const name = item.name || item.title || '';
        const enName = item.original_name || item.original_title || name;
        const displayName = name || enName;
        const openName = _isNonLatin(name) ? (enName && !_isNonLatin(enName) ? enName : name) : name;
        const rating = item.vote_average ? item.vote_average.toFixed(1) : '';
        const poster = item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : (item.poster || '');
        const rType = item._rowType || rowType || (item.title ? 'movie' : 'tv');
        const showScore = score !== null && score > 0;

        const card = document.createElement('div');
        card.className = 'disco-card ai-match-card';
        card.style.position = 'relative';

        // AI Match badge
        const badgeHtml = showScore ? `
          <div class="ai-match-badge" style="
            position:absolute;top:8px;left:8px;z-index:15;
            background:linear-gradient(135deg,${accentColor}dd,${accentColor}99);
            color:#000;font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif;font-size:0.48rem;font-weight:900;
            letter-spacing:0.5px;padding:3px 7px;border-radius:6px;
            box-shadow:0 0 10px ${accentColor}66,0 2px 8px rgba(0,0,0,0.5);
            animation:aiMatchPulse 2.5s ease-in-out infinite;
            pointer-events:none;
          ">${score}% Shoda</div>` : '';

        card.innerHTML = `
          ${badgeHtml}
          <img class="disco-card-img" src="${poster}" alt="" loading="lazy">
          <div class="disco-card-overlay"></div>
          <div class="disco-play-btn"><svg viewBox="0 0 12 12"><polygon points="2,1 11,6 2,11"/></svg></div>
          <div class="disco-card-finder-btn" title="Najít kde sledovat" onclick="event.stopPropagation();verifyAndOpen('${openName.replace(/'/g,"\'")}','${rType}','${(item.release_date||item.first_air_date||'').slice(0,4)}')">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>
          </div>
          <div class="disco-card-glow"></div>
          <div class="disco-card-info">
            <div class="disco-card-name">${displayName}</div>
            ${whyLabel ? `<div style="font-size:0.42rem;color:${accentColor}cc;margin-bottom:4px;font-weight:700;letter-spacing:0.3px;line-height:1.3;">💡 ${whyLabel}</div>` : ''}
            <div class="disco-card-meta">
              <span class="disco-card-type">${rType === 'movie' ? '🎬 Film' : '📺 Seriál'}</span>
              ${rating ? `<span class="disco-card-rating">★ ${rating}</span>` : ''}
            </div>
          </div>`;

        card.onclick = () => {
          if (item.id) { aiBrain.boostGenreIds(item.genre_ids || [], 0.05); aiBrain.recordTmdbSeen(item.id); }
          if (item.id) { window._mfFinderTmdbId = item.id; window._cinYear = (item.release_date || item.first_air_date || '').slice(0,4) || null; _showCinemaOrFinderChoice(item.id, displayName, rType, openName); }
          else { closeUniverse(); window._mfFinderTmdbId = null; openWithCopy(openName, rType, (item.release_date||item.first_air_date||"").slice(0,4)||null); }
        };

        // Trailer hover
        if (TMDB_KEY && item.id) {
          const trDiv = document.createElement('div');
          trDiv.style.cssText = 'position:absolute;inset:0;z-index:8;pointer-events:none;border-radius:20px;overflow:hidden;opacity:0;background:#000;transition:opacity 0.55s ease;';
          card.appendChild(trDiv);
          card.addEventListener('mouseenter', () => {
            card._t = setTimeout(async () => {
              if (!card.matches(':hover')) return;
              const k = await getTrailerKey(item.id, rType);
              if (!k || !card.matches(':hover') || trDiv.querySelector('iframe')) return;
              trDiv.innerHTML = `<div style="width:100%;height:100%;position:relative;overflow:hidden;transform:scale(1.08)"><iframe src="https://www.youtube-nocookie.com/embed/${k}?autoplay=1&mute=1&controls=0&loop=1&playlist=${k}&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&cc_load_policy=0&start=8" style="position:absolute;top:50%;left:50%;width:170%;height:170%;transform:translate(-50%,-50%);border:none;pointer-events:none" allow="autoplay;encrypted-media"></iframe></div>`;
              trDiv.style.opacity = '1';
            }, 1200);
          });
          card.addEventListener('mouseleave', () => {
            clearTimeout(card._t); trDiv.style.opacity = '0';
            setTimeout(() => { trDiv.innerHTML = ''; }, 500);
          });
        }
        scroll.appendChild(card);
      });

      row.appendChild(header); row.appendChild(scroll); section.appendChild(row); body.insertBefore(section, body.firstChild);
    }

    // "Nová doporučení" tlačítko — zamíchá a znovu zobrazí
    function refreshPersonalisedRow() {
      const body = document.getElementById('discoBody');
      const existing = body?.querySelector('.disco-section');
      if (existing) {
        const rowTitle = existing.querySelector('.disco-row-title');
        if (rowTitle && rowTitle.textContent.includes('Pro tebe')) {
          existing.remove();
        }
      }
      // Znovu načti obsah
      loadDiscoContent(_discoCurrent.genre, _discoCurrent.type);
    }

    // CSS animace pro badge (přidáme inline style do head)
    (function injectAiMatchStyles() {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes aiMatchPulse {
          0%, 100% { box-shadow: 0 0 8px var(--accent, #007AFF)55, 0 2px 8px rgba(0,0,0,0.5); }
          50%       { box-shadow: 0 0 18px var(--accent, #007AFF)99, 0 2px 12px rgba(0,0,0,0.6); }
        }
        .ai-match-card .ai-match-badge {
          transition: transform 0.2s;
        }
        .ai-match-card:hover .ai-match-badge {
          transform: scale(1.08);
        }
      `;
      document.head.appendChild(style);
    })();

    // ── RENDER DISCO ROW ──
    function _isNonLatin(name) {
      return /[\u3000-\u9fff\uac00-\ud7af\u0600-\u06ff\u0400-\u04ff\u4e00-\u9fff]/.test(name);
    }

    function renderDiscoRow(body, label, items, rowType) {
      if (!items || !items.length) return;
      const section = document.createElement('div'); section.className = 'disco-section';
      const row = document.createElement('div'); row.className = 'disco-row';
      const header = document.createElement('div'); header.className = 'disco-row-header';
      header.innerHTML = `<div class="disco-row-title">${label}</div>
        <div class="disco-row-nav">
          <button class="disco-row-nav-btn" onclick="discoScrollRow(this,-1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button class="disco-row-nav-btn" onclick="discoScrollRow(this,1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>`;
      const scroll = document.createElement('div'); scroll.className = 'disco-row-scroll';
      items.forEach(item => {
        const name = item.name || item.title || '';
        // For non-latin titles, also store EN equivalent if available
        const enName = item.original_name || item.original_title || name;
        const displayName = name || enName;
        const openName = _isNonLatin(name) ? (enName && !_isNonLatin(enName) ? enName : name) : name;
        const rating = item.vote_average ? item.vote_average.toFixed(1) : '';
        const poster = item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : (item.poster || '');
        const rType = item._rowType || rowType;
        const card = document.createElement('div'); card.className = 'disco-card';
        card.innerHTML = `<img class="disco-card-img" src="${poster}" alt="" loading="lazy">
          <div class="disco-card-overlay"></div>
          <div class="disco-play-btn"><svg viewBox="0 0 12 12"><polygon points="2,1 11,6 2,11"/></svg></div>
          <div class="disco-card-finder-btn" title="Najít kde sledovat" onclick="event.stopPropagation();verifyAndOpen('${openName.replace(/'/g,"\\'")}','${rType}','${(item.release_date||item.first_air_date||'').slice(0,4)}')">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>
          </div>
          <div class="disco-card-glow"></div>
          <div class="disco-card-info">
            <div class="disco-card-name">${displayName}</div>
            <div class="disco-card-meta">
              <span class="disco-card-type">${rType === 'movie' ? '🎬 Film' : '📺 Seriál'}</span>
              ${rating ? `<span class="disco-card-rating">★ ${rating}</span>` : ''}
            </div>
          </div>`;
        card.onclick = () => {
          if (item.id) { window._mfFinderTmdbId = item.id; window._cinYear = (item.release_date || item.first_air_date || '').slice(0,4) || null; _showCinemaOrFinderChoice(item.id, displayName, rType, openName); }
          else { closeUniverse(); window._mfFinderTmdbId = null; openWithCopy(openName, rType, (item.release_date||item.first_air_date||"").slice(0,4)||null); }
        };
        // Trailer hover
        if (TMDB_KEY && item.id) {
          const trDiv = document.createElement('div');
          trDiv.style.cssText = 'position:absolute;inset:0;z-index:8;pointer-events:none;border-radius:20px;overflow:hidden;opacity:0;background:#000;transition:opacity 0.55s ease;';
          card.style.position = 'relative'; card.appendChild(trDiv);
          card.addEventListener('mouseenter', () => {
            card._t = setTimeout(async () => {
              if (!card.matches(':hover')) return;
              const k = await getTrailerKey(item.id, rType);
              if (!k || !card.matches(':hover') || trDiv.querySelector('iframe')) return;
              trDiv.innerHTML = `<div style="width:100%;height:100%;position:relative;overflow:hidden;transform:scale(1.08)"><iframe src="https://www.youtube-nocookie.com/embed/${k}?autoplay=1&mute=1&controls=0&loop=1&playlist=${k}&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&cc_load_policy=0&start=8" style="position:absolute;top:50%;left:50%;width:170%;height:170%;transform:translate(-50%,-50%);border:none;pointer-events:none" allow="autoplay;encrypted-media"></iframe></div>`;
              trDiv.style.opacity = '1';
            }, 1200);
          });
          card.addEventListener('mouseleave', () => {
            clearTimeout(card._t); trDiv.style.opacity = '0';
            setTimeout(() => { trDiv.innerHTML = ''; }, 500);
          });
        }
        scroll.appendChild(card);
      });
      row.appendChild(header); row.appendChild(scroll); section.appendChild(row); body.appendChild(section);
    }

    function discoScrollRow(btn, dir) {
      const row = btn.closest('.disco-row-header').nextElementSibling;
      if (!row) return;
      row.scrollBy({ left: dir * (140 + 12) * 3, behavior: 'smooth' });
    }

    async function tmdbRow(url) {
      try { const d = await tmdbGet(url); return (d?.results || []).filter(r => r.poster_path); } catch { return []; }
    }

    async function loadDiscoContent(genre, type) {
      const body = document.getElementById('discoBody'); if (!body) return;
      body.innerHTML = '<div class="disco-loading"><div class="disco-spinner"></div><span>Načítám...</span></div>';
      const randPage = Math.floor(Math.random()*5)+1;
      const randPage2 = Math.floor(Math.random()*3)+1;
      let tmdbRows = [];
      if (TMDB_KEY) {
        try {
          if (!genre) {
            const period = Math.random()>0.5 ? 'week' : 'day';
            const [tvT, tvTop, tvNew, movT, movTop, movNow, movUpcoming, movAction, tvDrama, movHorror, tvHorror, movComedy, movScifi] = await Promise.all([
              tmdbRow('/trending/tv/'+period+'?language=cs'),
              tmdbRow('/tv/top_rated?language=cs&page='+randPage2),
              tmdbRow('/tv/on_the_air?language=cs'),
              tmdbRow('/trending/movie/'+period+'?language=cs'),
              tmdbRow('/movie/top_rated?language=cs&page='+randPage2),
              tmdbRow('/movie/now_playing?language=cs'),
              tmdbRow('/movie/upcoming?language=cs'),
              tmdbRow('/discover/movie?with_genres=28&sort_by=popularity.desc&vote_count.gte=100&language=cs&page='+randPage),
              tmdbRow('/discover/tv?with_genres=18&sort_by=vote_average.desc&vote_count.gte=200&language=cs&page='+randPage2),
              tmdbRow('/discover/movie?with_genres=27&sort_by=popularity.desc&vote_count.gte=80&language=cs&page='+randPage),
              tmdbRow('/discover/tv?with_genres=9648,27&sort_by=popularity.desc&vote_count.gte=50&language=cs&page='+randPage2),
              tmdbRow('/discover/movie?with_genres=35&sort_by=popularity.desc&vote_count.gte=100&language=cs&page='+randPage),
              tmdbRow('/discover/movie?with_genres=878&sort_by=vote_average.desc&vote_count.gte=150&language=cs&page='+randPage2),
            ]);
            tmdbRows = [
              {label:'🔥 Trending filmy', items:movT.slice(0,24), rowType:'movie'},
              {label:'📺 Trending seriály', items:tvT.slice(0,24), rowType:'tv'},
              {label:'🍿 Právě v kinech', items:movNow.filter(r=>!movT.find(m=>m.id===r.id)).slice(0,24), rowType:'movie'},
              {label:'👻 Horor & Thriller filmy', items:movHorror.slice(0,24), rowType:'movie'},
              {label:'😱 Děsivé seriály', items:tvHorror.slice(0,24), rowType:'tv'},
              {label:'⭐ Nejlépe hodnocené seriály', items:tvTop.slice(0,24), rowType:'tv'},
              {label:'🏆 Největší filmy všech dob', items:movTop.slice(0,24), rowType:'movie'},
              {label:'💥 Akční filmy', items:movAction.slice(0,24), rowType:'movie'},
              {label:'🚀 Sci-Fi filmy', items:movScifi.slice(0,24), rowType:'movie'},
              {label:'😂 Komedie', items:movComedy.slice(0,24), rowType:'movie'},
              {label:'🎬 Brzy v kinech', items:movUpcoming.filter(r=>r.backdrop_path).slice(0,24), rowType:'movie'},
              {label:'🎭 Nejlepší dramata', items:tvDrama.slice(0,24), rowType:'tv'},
              {label:'📡 Právě vysílané', items:tvNew.filter(r=>!tvT.find(m=>m.id===r.id)).slice(0,24), rowType:'tv'},
            ];
          } else {
            // Vždy načítej OBOJÍ — filmy i seriály pro daný žánr
            const [movPop, movTop, movFresh, tvPop, tvTop, tvFresh] = await Promise.all([
              tmdbRow('/discover/movie?with_genres='+genre+'&sort_by=popularity.desc&vote_count.gte=30&language=cs&page='+randPage),
              tmdbRow('/discover/movie?with_genres='+genre+'&sort_by=vote_average.desc&vote_count.gte=100&language=cs&page='+randPage2),
              tmdbRow('/discover/movie?with_genres='+genre+'&sort_by=release_date.desc&vote_count.gte=10&language=cs&page=1'),
              tmdbRow('/discover/tv?with_genres='+genre+'&sort_by=popularity.desc&vote_count.gte=20&language=cs&page='+randPage),
              tmdbRow('/discover/tv?with_genres='+genre+'&sort_by=vote_average.desc&vote_count.gte=50&language=cs&page='+randPage2),
              tmdbRow('/discover/tv?with_genres='+genre+'&sort_by=release_date.desc&vote_count.gte=10&language=cs&page=1'),
            ]);

            tmdbRows = [];
            if (movPop.length) tmdbRows.push({label:'🔥 Populární filmy', items:movPop.slice(0,24), rowType:'movie'});
            if (tvPop.length)  tmdbRows.push({label:'📺 Populární seriály', items:tvPop.slice(0,24), rowType:'tv'});
            if (movTop.length) tmdbRows.push({label:'⭐ Nejlépe hodnocené filmy', items:movTop.slice(0,24), rowType:'movie'});
            if (tvTop.length)  tmdbRows.push({label:'⭐ Nejlépe hodnocené seriály', items:tvTop.slice(0,24), rowType:'tv'});
            if (movFresh.length) tmdbRows.push({label:'🆕 Nejnovější filmy', items:movFresh.filter(r=>!movPop.find(m=>m.id===r.id)).slice(0,24), rowType:'movie'});
            if (tvFresh.length)  tmdbRows.push({label:'🆕 Nejnovější seriály', items:tvFresh.filter(r=>!tvPop.find(m=>m.id===r.id)).slice(0,24), rowType:'tv'});
          }
        } catch(e) { console.warn('Disco load error:', e); }
      }
      body.innerHTML = '';

      // ── AI PERSONALIZOVANÝ ŘAD (For You) — pouze na hlavní stránce bez žánru ──
      if (!genre && tmdbRows.length > 0) {
        // Vezmi pool ze všech řad pro scoring
        const allItemsPool = tmdbRows.flatMap(r => r.items.map(i => ({ ...i, _rowType: r.rowType })));
        // Odstraň duplicity dle id
        const seen = new Set();
        const uniquePool = allItemsPool.filter(i => { if (!i.id || seen.has(i.id)) return false; seen.add(i.id); return true; });
        if (uniquePool.length > 0) {
          renderPersonalisedRow(body, uniquePool, 'all');
        }
      }

      // ── HERO BANNER ──
      const allHeroPool = [
        ...(tmdbRows[0]?.items||[]),
        ...(tmdbRows[1]?.items||[]),
      ].filter(r=>r.backdrop_path);
      const heroItem = allHeroPool[Math.floor(Math.random()*Math.min(12,allHeroPool.length))];
      if (heroItem) {
        const hType = heroItem._rowType || (heroItem.title ? 'movie' : 'tv');
        const heroName = heroItem.name || heroItem.title || '';
        const hero = document.createElement('div'); hero.className = 'disco-hero';
        const bgImg = document.createElement('img');
        bgImg.src = 'https://image.tmdb.org/t/p/w1280'+heroItem.backdrop_path;
        bgImg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;transition:transform 8s ease,opacity 0.8s ease;';
        const trWrap = document.createElement('div');
        trWrap.style.cssText = 'position:absolute;inset:0;z-index:2;opacity:0;transition:opacity 0.8s ease;background:#000;overflow:hidden;pointer-events:none;';
        const grad = document.createElement('div'); grad.className = 'disco-hero-grad'; grad.style.zIndex='4';
        const hc = document.createElement('div'); hc.className = 'disco-hero-content'; hc.style.zIndex='5';
        const safe = heroName.replace(/'/g,"\\'");
        const rating = heroItem.vote_average ? heroItem.vote_average.toFixed(1) : '';
        const year = (heroItem.release_date || heroItem.first_air_date || '').slice(0,4);
        hc.innerHTML = `
          <div class="disco-hero-badge">
            <span class="disco-hero-badge-type">${hType==='movie'?'🎬 Film':'📺 Seriál'}</span>
            ${rating?`<span class="disco-hero-badge-rating">★ ${rating}</span>`:''}
            ${year?`<span class="disco-hero-badge-year">${year}</span>`:''}
          </div>
          <div class="disco-hero-title">${heroName}</div>
          <div class="disco-hero-desc">${(heroItem.overview||'Žádný popis není k dispozici.').substring(0,160)}${(heroItem.overview||'').length>160?'…':''}</div>
          <div class="disco-hero-btns">
            <button class="disco-hero-btn primary" onclick="event.stopPropagation();if(heroItem.id){window._mfFinderTmdbId=heroItem.id;window._cinYear='${year}';_showCinemaOrFinderChoice(heroItem.id,'${safe}','${hType}','${safe}');}else{openWithCopy('${safe}','${hType}','${year}');closeUniverse();}">▶ Přehrát</button>
            <button class="disco-hero-btn secondary" onclick="event.stopPropagation();shAddToWatchlistByItem({name:'${safe}',media_type:'${hType}'});showToast('Přidáno do watchlistu 🔖')">＋ Watchlist</button>
          </div>`;
        hero.append(bgImg, trWrap, grad, hc);
        hero.onclick = () => { if(heroItem.id){window._mfFinderTmdbId=heroItem.id;window._cinYear=(heroItem.release_date||heroItem.first_air_date||'').slice(0,4)||null;_showCinemaOrFinderChoice(heroItem.id,heroName,hType,heroName);}else{openWithCopy(heroName,hType,(heroItem.release_date||heroItem.first_air_date||'').slice(0,4)||null);closeUniverse();} };
        if (TMDB_KEY && heroItem.id) {
          hero.addEventListener('mouseenter', () => { hero._t = setTimeout(async () => { if(!hero.matches(':hover'))return; const k=await getTrailerKey(heroItem.id,hType); if(!k||!hero.matches(':hover')||trWrap.querySelector('iframe'))return; trWrap.innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${k}?autoplay=1&mute=1&controls=0&loop=1&playlist=${k}&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&cc_load_policy=0&start=5" style="position:absolute;top:50%;left:50%;width:120%;height:120%;transform:translate(-50%,-50%);border:none;pointer-events:none" allow="autoplay;encrypted-media"></iframe>`; trWrap.style.opacity='1'; bgImg.style.opacity='0'; }, 1300); });
          hero.addEventListener('mouseleave', () => { clearTimeout(hero._t); trWrap.style.opacity='0'; bgImg.style.opacity='1'; setTimeout(()=>{trWrap.innerHTML=''},800); });
        }
        body.appendChild(hero);
      }

      // ── TMDB ŘADY ──
      tmdbRows.filter(r=>r.items.length).forEach(r=>renderDiscoRow(body, r.label, r.items, r.rowType));
      if (!tmdbRows.filter(r=>r.items.length).length && body.querySelectorAll('.disco-section').length===0) {
        body.insertAdjacentHTML('beforeend','<div class="disco-loading" style="padding:60px;text-align:center"><div style="font-size:2.5rem;margin-bottom:16px">😕</div><div style="font-size:0.9rem;color:rgba(255,255,255,0.5)">Žádný obsah se nepodařilo načíst.<br>Zkontroluj připojení k internetu.</div></div>');
      }
    }

    function shAddToWatchlistByItem(item) {
      // Přidá do watchlistu přes existující mechanismus
      const name = item.name || item.title || '';
      const type = (item.media_type === 'movie' || item.type === 'movie') ? 'movie' : 'series';
      addToWatchlistByName(name, type);
    }

    function setShType() {} // stub pro zpětnou compat
    function uniSetGenre() {} // stub
    function setShGenre() {} // stub
    function loadSearchPopular() { loadDiscoContent(_discoCurrent.genre, _discoCurrent.type); }
    function setShFocus(idx) { /* stub */ }
    function searchTMDB(q) { discoSearch(q); }
    function uniLoadMore() {}
    function showShSkeletons() {}

    function renderShResults(items) {
      const grid = document.getElementById('searchResults');
      if (!grid) return;
      grid.innerHTML = '';
      if (!items.length) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--muted);font-size:0.78rem;padding:50px 0;opacity:0.5;">Nic nenalezeno 🔍</div>';
        return;
      }
      items.forEach((item, i) => { grid.appendChild(buildShCard(item, i)); });
    }

    function appendShResults(items) {
      const grid = document.getElementById('searchResults');
      if (!grid) return;
      const offset = _shCurrentItems.length - items.length;
      items.forEach((item, i) => { grid.appendChild(buildShCard(item, offset + i)); });
    }

    function buildShCard(item, idx) {
      const isMovie = item.media_type === 'movie' || !!item.title;
      const displayName = item.name || item.title || item.original_name || item.original_title || '';
      const poster = item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : '';
      const rating = item.vote_average ? item.vote_average.toFixed(1) : '';
      const year = (item.release_date || item.first_air_date || '').slice(0, 4);

      const card = document.createElement('div');
      card.className = 'sh-card';
      card.dataset.idx = idx;
      card.innerHTML = `
        ${poster ? `<img src="${poster}" alt="" loading="lazy">` : '<div style="width:100%;height:100%;background:#111;"></div>'}
        <div class="sh-card-overlay"></div>
        <div class="sh-card-play-btn"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
        <div class="sh-card-info">
          <div class="sh-card-name">${displayName}</div>
          <div class="sh-card-meta">
            <span class="sh-card-type-badge${isMovie ? ' movie' : ''}">${isMovie ? 'Film' : 'Seriál'}</span>
            ${rating ? `<span class="sh-card-rating">★${rating}</span>` : ''}
            ${year ? `<span style="font-size:0.5rem;color:rgba(255,255,255,0.4)">${year}</span>` : ''}
          </div>
        </div>
        <div class="sh-card-copy-hint">📋</div>
      `;

      card.addEventListener('mouseenter', () => {
        _shFocusIdx = idx;
        if (window._shFocusedCard && window._shFocusedCard !== card) window._shFocusedCard.classList.remove('sh-focused');
        window._shFocusedCard = card;
        card.classList.add('sh-focused');
        showShPreview(item);
      });
      let _cardClickLock = false;
      card.addEventListener('click', () => {
        if (_cardClickLock) return;
        _cardClickLock = true;
        setTimeout(() => { _cardClickLock = false; }, 800);
        openShItem(item);
      });
      return card;
    }

    // ─── TMDB-correct name — fetch CS + original, show 2 variants ────
    async function fetchNameVariants(item) {
      const type = (item.media_type === 'movie' || item.title) ? 'movie' : 'tv';
      const origName = item.original_name || item.original_title || '';
      const tmdbName = item.name || item.title || origName;
      if (!TMDB_KEY || !item.id) return { cs: tmdbName, orig: origName || tmdbName };
      try {
        // Timeout 4s — pokud TMDB neodpoví, vrátíme co máme
        const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
        const [csData, origData] = await Promise.all([
          withTimeout(tmdbGet(`/${type}/${item.id}?language=cs`), 4000),
          withTimeout(tmdbGet(`/${type}/${item.id}?language=en-US`), 4000)
        ]);
        const csName = csData?.name || csData?.title || tmdbName;
        const enName = origData?.name || origData?.title || origData?.original_name || origData?.original_title || tmdbName;
        return { cs: csName, orig: enName };
      } catch {}
      return { cs: tmdbName, orig: origName || tmdbName };
    }

    async function getCorrectTmdbName(item) {
      const variants = await fetchNameVariants(item);
      if (_uniSelectedVariant) return _uniSelectedVariant;
      const cs = variants.cs || variants.orig;
      const en = variants.orig || variants.cs;
      // If CS name has non-latin chars, use EN name for URL slug generation
      return _isNonLatin(cs) && en && !_isNonLatin(en) ? en : cs;
    }

    async function openShItem(item) {
      const isMovie = item.media_type === 'movie' || !!item.title;
      const type = isMovie ? 'movie' : 'tv';

      // 🎬 Cinema Mode — zobraz dialog OKAMŽITĚ, jméno aktualizuj na pozadí
      if (item.id) {
        const displayName = item.name || item.title || item.original_name || item.original_title || '…';
        window._mfFinderTmdbId = item.id;
        // Předej rok pro správné Bombuj URL (/online-film-slug-YYYY)
        window._cinYear = (item.release_date || item.first_air_date || '').slice(0, 4) || null;
        // Zobraz dialog hned s dostupným jménem
        _showCinemaOrFinderChoice(item.id, displayName, type, displayName);

        // Async: uprav jméno pokud přijde lepší verze (bez blokování)
        getCorrectTmdbName(item).then(correctName => {
          if (!correctName || correctName === displayName) return;
          const titleEl = document.querySelector('#mfCinemaChoiceModal [data-mf-title]');
          if (titleEl) titleEl.textContent = correctName;
          // Aktualizuj searchName pro Finder tlačítko
          const modal = document.getElementById('mfCinemaChoiceModal');
          if (modal) modal._mfSearchName = correctName;
        }).catch(() => {});
        return;
      }

      // Bez TMDB ID — potřebujeme jméno pro URL, ale s timeoutem
      const namePromise = getCorrectTmdbName(item);
      const timeout = new Promise(resolve => setTimeout(() => resolve(item.name || item.title || ''), 3000));
      const name = await Promise.race([namePromise, timeout]);
      window._mfFinderTmdbId = null;
      openWithCopy(name, type, (item.release_date||item.first_air_date||'').slice(0,4)||null);
      closeUniverse();
    }

    // Zobrazí modal: Kino Mode vs. Finder (Bombuj/SvetSerialu)
    function _showCinemaOrFinderChoice(tmdbId, displayName, type, searchName) {
      // Rovnou do kino modu — žádný dialog
      // Film → Bombuj (sourceIdx 1), Seriál → SvetSerialu (sourceIdx 0)
      closeUniverse();
      const old = document.getElementById('mfCinemaChoiceModal');
      if (old) old.remove();
      openMovieInCinema(tmdbId, displayName, type);
    }

    // ─── Preview / Hero panel ────────────────────────────────────────
    let _shPreviewFetchTimeout = null;

    async function showShPreview(item) {
      const previewEl = document.getElementById('shPreviewContent');
      const emptyEl = document.getElementById('shPreviewEmpty');
      if (!previewEl || !emptyEl) return;
      _shPreviewItem = item;
      _uniSelectedVariant = null;

      const displayName = item.name || item.title || '';
      const backdrop = item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` :
                       item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : '';
      const rating = item.vote_average ? item.vote_average.toFixed(1) : '';
      const year = (item.release_date || item.first_air_date || '').slice(0, 4);
      const isMovie = item.media_type === 'movie' || !!item.title;
      const type = isMovie ? 'movie' : 'tv';

      // Badges
      const badgesEl = document.getElementById('uniHeroBadges');
      if (badgesEl) badgesEl.innerHTML = `
        <span class="uni-hero-badge ${isMovie ? 'type-movie' : 'type-tv'}">${isMovie ? '🎬 Film' : '📺 Seriál'}</span>
        ${rating ? `<span class="uni-hero-badge rating">★ ${rating}</span>` : ''}
        ${year ? `<span class="uni-hero-badge year">${year}</span>` : ''}
      `;

      document.getElementById('shPreviewTitle').textContent = displayName;
      document.getElementById('shPreviewMeta').textContent = '';
      document.getElementById('shPreviewDesc').textContent = item.overview || '';
      document.getElementById('shPreviewNames').innerHTML = '';
      document.getElementById('uniNameVariants').style.display = 'none';

      const backdropEl = document.getElementById('shPreviewBackdrop');
      backdropEl.innerHTML = backdrop ? `<img src="${backdrop}" alt="">` : '';

      // Open button
      const openBtn = document.getElementById('shPreviewOpenBtn');
      openBtn.onclick = () => openShItem(item);
      openBtn.textContent = `▶ Otevřít${isMovie ? ' na Bombuj' : ' na SvetSerialu'}`;

      // Watchlist button
      const wl = getWatchlist();
      const inWl = wl.some(w => w.name === displayName);
      const wlBtn = document.getElementById('shPreviewWlBtn');
      wlBtn.classList.toggle('in-wl', inWl);
      wlBtn.textContent = inWl ? '✓ V seznamu' : '🔖 Chci koukat';

      emptyEl.style.display = 'none';
      previewEl.style.display = 'flex';

      // JustWatch availability — inject slot a fetch
      let jwSlot = document.getElementById('shJwAvail');
      if (!jwSlot) {
        jwSlot = document.createElement('div');
        jwSlot.id = 'shJwAvail';
        jwSlot.className = 'jw-avail-slot';
        const previewNames = document.getElementById('shPreviewNames');
        if (previewNames && previewNames.parentNode) {
          previewNames.parentNode.insertBefore(jwSlot, previewNames.nextSibling);
        }
      }
      if (item.id && window.JWAvail) {
        JWAvail.render(jwSlot, item.id, type);
      } else {
        jwSlot.innerHTML = '';
      }

      // Async: fetch name variants + cast
      clearTimeout(_shPreviewFetchTimeout);
      _shPreviewFetchTimeout = setTimeout(() => fetchShPreviewDetails(item), 350);
    }

    async function fetchShPreviewDetails(item) {
      if (!TMDB_KEY || !item.id || item !== _shPreviewItem) return;
      const type = (item.media_type === 'movie' || item.title) ? 'movie' : 'tv';

      // Fetch name variants + credits in parallel
      const [variants, credits] = await Promise.all([
        fetchNameVariants(item),
        tmdbGet(`/${type}/${item.id}/credits?language=cs`).catch(() => null)
      ]);

      if (item !== _shPreviewItem) return; // user moved on

      // Cast
      const cast = (credits?.cast || []).slice(0, 4).map(c => c.name).join(', ');
      const namesEl = document.getElementById('shPreviewNames');
      if (namesEl && cast) namesEl.innerHTML = `<strong>Hrají:</strong> ${cast}`;

      // Name variants
      const variantsEl = document.getElementById('uniNameVariants');
      const btnContainer = document.getElementById('uniNameVariantBtns');
      if (!variantsEl || !btnContainer) return;

      const hasTwoVariants = variants.cs !== variants.orig && variants.cs && variants.orig;
      if (hasTwoVariants) {
        variantsEl.style.display = 'block';
        btnContainer.innerHTML = '';

        [[variants.cs, 'CZ', '🇨🇿 Český název'], [variants.orig, 'EN', '🌍 Originální název']].forEach(([name, lang, label]) => {
          const btn = document.createElement('button');
          btn.className = 'uni-name-variant-btn' + (lang === 'CZ' ? ' active' : '');
          if (lang === 'CZ') _uniSelectedVariant = name; // default to Czech
          btn.innerHTML = `
            <div class="uni-variant-text">
              <div class="uni-variant-lang">${label}</div>
              <div class="uni-variant-name">${name}</div>
            </div>
            <span class="uni-variant-copy-icon">📋</span>
          `;
          btn.onclick = () => {
            document.querySelectorAll('.uni-name-variant-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            _uniSelectedVariant = name;
            // Update open button text
            const openBtn = document.getElementById('shPreviewOpenBtn');
            if (openBtn) openBtn.textContent = `▶ Kopírovat: "${name.slice(0,20)}${name.length>20?'…':''}"`;
            showToast(`📋 Zvoleno: ${name}`, 'info');
          };
          btnContainer.appendChild(btn);
        });
      } else {
        // Same name, just set it
        _uniSelectedVariant = variants.cs || variants.orig;
        variantsEl.style.display = 'none';
      }
    }

    function hideShPreview() {
      const previewEl = document.getElementById('shPreviewContent');
      const emptyEl = document.getElementById('shPreviewEmpty');
      if (previewEl) previewEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = 'flex';
      _shPreviewItem = null;
      _uniSelectedVariant = null;
    }

    function shAddToWatchlist() {
      if (!_shPreviewItem) return;
      const item = _shPreviewItem;
      const name = item.name || item.title || '';
      const isMovie = item.media_type === 'movie' || !!item.title;
      const wl = getWatchlist();
      const existing = wl.findIndex(w => w.name === name);
      if (existing >= 0) {
        wl.splice(existing, 1); saveWatchlistData(wl); showToast('Odebráno ze seznamu');
      } else {
        wl.push({ name, type: isMovie ? 'movie' : 'series', poster: item.poster_path ? `https://image.tmdb.org/t/p/w185${item.poster_path}` : '' });
        saveWatchlistData(wl); showToast('Přidáno do Chci koukat! 🔖');
      }
      const wlBtn = document.getElementById('shPreviewWlBtn');
      const nowIn = getWatchlist().some(w => w.name === name);
      if (wlBtn) { wlBtn.classList.toggle('in-wl', nowIn); wlBtn.textContent = nowIn ? '✓ V seznamu' : '🔖 Chci koukat'; }
    }

    // Legacy shims
    function setPlatform(plat, btn) { setShType(plat === 'movies' ? 'movie' : 'tv', btn || document.getElementById('shAll')); }
    function doSearch() { const q = document.getElementById('searchTitleInput')?.value?.trim(); if (q) { openWithCopy(q, _shType === 'tv' ? 'tv' : 'movie'); closeUniverse(); } }
    function openSearchPlatform(type) { doSearch(); }

    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('universeOverlay')?.addEventListener('click', e => {
        if (e.target === document.getElementById('universeOverlay')) closeUniverse();
      });
    });

    // CONFIRM
    let pendingCb = null;
    function showConfirm(icon, title, sub, okLabel, cb) { document.getElementById('confirmIcon').textContent = icon; document.getElementById('confirmTitle').textContent = title; document.getElementById('confirmSub').textContent = sub; document.getElementById('confirmOk').textContent = okLabel; pendingCb = cb; const el = document.getElementById('confirmOverlay'); el.classList.add('open'); requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible'))); }
    function confirmOk() { closeConfirm(); if (pendingCb) { pendingCb(); pendingCb = null; } }
    function confirmCancel() { closeConfirm(); pendingCb = null; }
    function closeConfirm() { const el = document.getElementById('confirmOverlay'); el.classList.remove('visible'); setTimeout(() => el.classList.remove('open'), 220); }

    // MODAL
    function openSeries(slug) {
      if (!db[slug]) return;
      playOpen();
      try{if(db[slug]._genres)aiBrain.boostGenresFromTmdb(db[slug]._genres,0.04);aiBrain.recordWatchTime();}catch(e){}
      activeSeries = slug; showAllSeasons = false; modalOpen = true;
      const s = db[slug], next = findNextEp(slug);
      activeSeason = next ? next.se : 1;
      document.getElementById('sTitle').textContent = s.name;
      document.getElementById('sInfo').textContent = `${totalSeasons(slug)} serii · ~${s.totalEps} epizod`;
      const hero = document.getElementById('modalHeroImg'); hero.src = s._backdrop || s.poster;
      document.getElementById('tmdbBadge').style.display = TMDB_KEY ? 'inline-flex' : 'none';
      const el = document.getElementById('seriesModal');
      // Reset scroll position smoothly before opening
      const mb = el.querySelector('.modal-body') || el.querySelector('#modalBody');
      if (mb) { mb.scrollTop = 0; }
      el.classList.add('open');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.classList.add('visible');
        // Stagger hero content in after modal is visible
        const heroContent = el.querySelector('.modal-hero-content');
        if (heroContent) {
          heroContent.style.opacity = '0';
          heroContent.style.transform = 'translateY(12px)';
          setTimeout(() => {
            heroContent.style.transition = 'opacity 0.4s ease, transform 0.45s cubic-bezier(0.34,1.2,0.64,1)';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
          }, 120);
        }
      }));
      // Always start at season select view
      switchToSeasonView();
      renderSeasons();
      updatePanelProgress();
      kbLayer = 'modal-season'; kbSeasonIndex = activeSeason - 1; kbEpIndex = -1;
      // Show rate button only if user has watched some episodes
      const rateBtn = document.getElementById('modalRateBtn');
      if (rateBtn) rateBtn.style.display = calcProgress(slug).seen > 0 ? 'flex' : 'none';
    }
    function closeModal() {
      playClick(300, 0.1, 0.04);
      const el = document.getElementById('seriesModal');
      el.classList.remove('visible');
      // Reset hero content opacity for next open
      const heroContent = el.querySelector('.modal-hero-content');
      if (heroContent) { heroContent.style.transition = ''; heroContent.style.opacity = ''; heroContent.style.transform = ''; }
      setTimeout(() => el.classList.remove('open'), 380);
      kbLayer = 'menu'; kbEpIndex = -1; kbSeasonIndex = -1; modalOpen = false;
      // Rating se NEZOBRAZUJE automaticky — uživatel může hodnotit přes AI panel
    }
    document.getElementById('seriesModal').addEventListener('click', e => { if (e.target === document.getElementById('seriesModal')) closeModal(); });

    // SEASONS
    function renderSeasons() {
      const c = document.getElementById('seasonPills'); if(c) c.innerHTML = '';
      const seasons = totalSeasons(activeSeries);
      if(c) for (let i = 1; i <= seasons; i++) { const btn = document.createElement('button'); btn.className = 'season-pill' + (i === activeSeason && !showAllSeasons ? ' active' : ''); btn.textContent = `${i}`; btn.dataset.season = i; btn.title = `Serie ${i}`; btn.onclick = () => { activeSeason = i; showAllSeasons = false; renderSeasons(); renderEpisodes(); kbLayer = 'modal-season'; kbSeasonIndex = i - 1; kbEpIndex = -1; }; c.appendChild(btn); }
      const sc = document.getElementById('seasonCounter'); if(sc) sc.textContent = showAllSeasons ? 'Vsechny' : `${activeSeason} / ${seasons}`;
      const ab = document.getElementById('seasonAllBtn'); if(ab){ ab.className = 'season-all-btn' + (showAllSeasons ? ' active' : ''); ab.textContent = showAllSeasons ? '✕ Aktuální' : '☰ Vše'; }
      // Update ep view header badge
      const epSeasonText = document.getElementById('epViewSeasonText');
      if(epSeasonText) epSeasonText.textContent = showAllSeasons ? 'Všechny série' : `Série ${activeSeason}`;
      // Render season select view cards
      renderSeasonSelectView();
    }

    // ── SEASON SELECT VIEW — grid karet sérií ─────────────────────
    function renderSeasonSelectView() {
      const grid = document.getElementById('ssvGrid');
      if (!grid || !activeSeries || !db[activeSeries]) return;
      const s = db[activeSeries];
      const seasons = totalSeasons(activeSeries);
      grid.innerHTML = '';

      for (let i = 1; i <= seasons; i++) {
        const isActive = (i === activeSeason);
        const card = document.createElement('div');
        card.className = 'ssv-card' + (isActive ? ' ssv-active' : '');
        card.title = `Série ${i}`;

        const posterUrl = s._poster || s.poster || '';
        // Count episodes in this season
        const epCount = Object.values(s).filter(v => v && typeof v === 'object' && v.se === i).length;
        const epLabel = epCount ? `${epCount} epizod` : '';

        card.innerHTML = `
          <img src="${posterUrl}" alt="S${i}" loading="lazy"
            onerror="this.src='';this.parentElement.style.background='#1a1a2a'">
          <div class="ssv-active-badge">
            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="ssv-play-overlay">
            <button class="ssv-play-btn">
              <svg viewBox="0 0 24 24" fill="#000"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Otevřít
            </button>
          </div>
          <div class="ssv-info">
            <div class="ssv-num">Série ${i}</div>
            <div class="ssv-name">${s.title || ''}</div>
            ${epLabel ? `<div class="ssv-ep-count">${epLabel}</div>` : ''}
          </div>
        `;

        card.addEventListener('click', () => {
          activeSeason = i;
          showAllSeasons = false;
          renderSeasons();
          switchToEpisodesView();
        });

        // Load TMDB season poster
        if (TMDB_KEY && s.tmdbId) {
          (async () => {
            try {
              const data = await tmdbGet(`/tv/${s.tmdbId}/season/${i}?language=cs`);
              if (data?.poster_path) {
                const img = card.querySelector('img');
                if (img) img.src = `https://image.tmdb.org/t/p/w342${data.poster_path}`;
              }
              // Update ep count from TMDB
              if (data?.episodes?.length) {
                const ec = card.querySelector('.ssv-ep-count');
                if (ec) ec.textContent = `${data.episodes.length} epizod`;
              }
            } catch(e) {}
          })();
        }

        grid.appendChild(card);
      }
    }

    // ── VIEW SWITCHING ────────────────────────────────────────────
    function switchToSeasonView() {
      document.getElementById('seasonSelectView').style.display = '';
      document.getElementById('seasonSelectView').classList.add('active');
      document.getElementById('episodesView').style.display = 'none';
      // scroll to top
      const mb = document.getElementById('modalBody');
      if (mb) mb.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function switchToEpisodesView() {
      document.getElementById('seasonSelectView').style.display = 'none';
      document.getElementById('seasonSelectView').classList.remove('active');
      const ev = document.getElementById('episodesView');
      ev.style.display = 'flex';
      // Update title
      const t = document.getElementById('epViewTitle');
      if (t && activeSeries && db[activeSeries]) t.textContent = db[activeSeries].title || '';
      renderEpisodes();
      const mb = document.getElementById('modalBody');
      if (mb) mb.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ── SEASON STRIP (kept for compat, noop) ─────────────────────
    function renderSeasonStrip() { /* replaced by renderSeasonSelectView */ }

    function toggleShowAll() { showAllSeasons = !showAllSeasons; renderSeasons(); renderEpisodes(); }
    function jumpToNext() { const next = findNextEp(activeSeries); if (!next) return; activeSeason = next.se; showAllSeasons = false; renderSeasons(); switchToEpisodesView(); setTimeout(() => { const c = document.getElementById(`card-${next.uid}`); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 200); }

    // EPISODES
    async function renderEpisodes() {
      try {
      const grid = document.getElementById('episodesGrid');
      if (!grid) return;
      if (!activeSeries || !db[activeSeries]) {
        grid.innerHTML = '<div style="color:var(--muted);font-size:0.76rem;padding:16px;opacity:0.5">⚠ Žádný seriál není vybrán</div>';
        return;
      }
      grid.style.display = 'grid';
      const s = db[activeSeries], watched = getWatched(), nextData = findNextEp(activeSeries), nextUid = nextData ? nextData.uid : null;

      // Render immediately with fallback data (no waiting for TMDB)
      function renderWithData(tmdbEps) {
        grid.innerHTML = '';
        if (showAllSeasons) {
          const seasons = totalSeasons(activeSeries);
          for (let se = 1; se <= seasons; se++) {
            const h = document.createElement('div');
            h.style.cssText = 'grid-column:1/-1;font-family:-apple-system, SF Pro Display, Helvetica Neue,sans-serif;font-size:0.84rem;font-weight:700;color:var(--muted);padding:16px 20px 8px;border-bottom:1px solid var(--border);margin-bottom:0;';
            h.textContent = `Serie ${se}`; grid.appendChild(h);
            const seEps = (tmdbEps && tmdbEps[se]) || null;
            const count = epsInSeason(activeSeries, se);
            for (let i = 1; i <= count; i++) {
              const uid = `${activeSeries}-S${se}-E${i}`;
              const epData = seEps ? seEps.find(e => e.ep === i) : null;
              grid.appendChild(buildEpCard(uid, se, i, epData, !!watched[uid], uid === nextUid, s.poster));
            }
          }
        } else {
          const seEps = (tmdbEps && tmdbEps[activeSeason]) || null;
          const count = epsInSeason(activeSeries, activeSeason);
          if (count === 0) {
            grid.innerHTML = '<div style="grid-column:1/-1;color:var(--muted);font-size:0.76rem;padding:16px;opacity:0.5">Žádné epizody</div>';
            return;
          }
          for (let i = 1; i <= count; i++) {
            const uid = `${activeSeries}-S${activeSeason}-E${i}`;
            const epData = seEps ? seEps.find(e => e.ep === i) : null;
            grid.appendChild(buildEpCard(uid, activeSeason, i, epData, !!watched[uid], uid === nextUid, s.poster));
          }
        }
        if (kbEpIndex >= 0) setKbEpFocus(kbEpIndex);
      }

      // Step 1: Render immediately with whatever is cached
      const cacheKey = `${activeSeries}-S${activeSeason}`;
      const cached = tmdbCache[cacheKey];
      if (cached !== undefined) {
        renderWithData(cached !== null ? { [activeSeason]: cached } : null);
      } else {
        // Render immediately with no names (fallback), then update
        renderWithData(null);
        // Fetch TMDB in background with 4s timeout
        try {
          const tmdbEps = await Promise.race([
            fetchTmdbSeason(activeSeries, activeSeason),
            new Promise(res => setTimeout(() => res(null), 4000))
          ]);
          if (tmdbEps && document.getElementById(`card-${activeSeries}-S${activeSeason}-E1`)) {
            // Re-render with names now that we have data
            renderWithData({ [activeSeason]: tmdbEps });
          }
        } catch { /* keep fallback render */ }
      }
    } catch(err) { console.error("renderEpisodes error:", err); const g=document.getElementById('episodesGrid'); if(g) g.innerHTML='<div style="color:#ff6060;font-size:0.72rem;padding:16px;grid-column:1/-1">⚠ Chyba při načítání epizod: '+err.message+'</div>'; }
    } // END async function renderEpisodes

    function _buildEpCardBase(uid, se, epNum, epData, seen, isNext, poster) {
      const _epSlug = activeSeries || '';
      const _epSeries = db[activeSeries];
      const url = _epSlug
        ? `https://svetserialu.to/serial/${_epSlug}/s${String(se).padStart(2, '0')}e${String(epNum).padStart(2, '0')}`
        : `https://svetserialu.to/?s=${encodeURIComponent((_epSeries && _epSeries.name) || '')}`;
      const epName = epData ? epData.name : `Epizoda ${epNum}`;
      const epOverview = epData && epData.overview ? epData.overview : '';
      const epRuntime = epData && epData.runtime ? `${epData.runtime} min` : '';
      const epRating = epData && epData.rating ? epData.rating.toFixed(1) : '';
      const stillImg = epData && epData.still ? epData.still : poster;
      const showBlur = !seen && epData && epData.still;
      
      const card = document.createElement('div');
      card.className = 'episode-card' + (seen ? ' watched' : '') + (isNext ? ' next-ep' : '') + (showBlur ? ' spoiler-blur' : '');
      card.id = `card-${uid}`;
      
      card.innerHTML = `
        <div class="ep-thumb">
          <img src="${stillImg}" alt="" loading="lazy">
          ${isNext ? '<div class="ep-next-tag">Další</div>' : ''}
          <div class="ep-seen-dot">✓</div>
          ${showBlur ? '<div class="spoiler-label"><span style="font-size:1.4rem">🙈</span><span>Spoiler</span></div>' : ''}
          <div class="ep-hover-play">
            <div class="ep-play-ring">
              <svg viewBox="0 0 10 12"><polygon points="0,0 10,6 0,12"/></svg>
            </div>
          </div>
        </div>
        <div class="ep-body">
          <div class="ep-meta-row">
            <span class="ep-num">S${se} · E${epNum}</span>
            ${epRuntime ? `<span class="ep-runtime">${epRuntime}</span>` : ''}
            ${epRating ? `<span class="ep-rating">★ ${epRating}</span>` : ''}
          </div>
          <div class="ep-title">${epName}</div>
          ${epOverview ? `<div class="ep-desc">${epOverview}</div>` : ''}
          <div class="ep-actions">
            <button class="ep-btn-play-hbo">
              <svg viewBox="0 0 10 12" width="10" height="12"><polygon points="0,0 10,6 0,12" fill="currentColor"/></svg>
              Pustit
            </button>
            <button class="ep-btn-mark" title="${seen ? 'Označit jako neshlédnuté' : 'Označit jako shlédnuté'}">${seen ? '✓' : '○'}</button>
          </div>
        </div>`;
      
      card.querySelector('.ep-btn-play-hbo').addEventListener('click', e => { e.stopPropagation(); playWithConfirm(uid, se, epNum, url); });
      card.querySelector('.ep-hover-play').addEventListener('click', e => { e.stopPropagation(); playWithConfirm(uid, se, epNum, url); });
      card.querySelector('.ep-btn-mark').addEventListener('click', e => { e.stopPropagation(); toggleWatch(uid); });
      return card;
    }
    function playWithConfirm(uid, se, ep, url) {
      const seriesName = db[activeSeries]?.name || activeSeries;
      const tmdbId = db[activeSeries]?.tmdbId;
      const epLabel = `${seriesName} — S${String(se).padStart(2,'0')}E${String(ep).padStart(2,'0')}`;

      if (tmdbId) {
        // 🎬 Cinema choice: Kino Mode vs. SvetSerialu
        window._cinSiteSlug = activeSeries; // předej přesný slug z db
        _showCinemaOrFinderChoice(
          tmdbId + '/' + se + '/' + ep,  // tmdbId/season/ep pro vidsrc.pro
          epLabel,
          'tv_ep',
          url
        );
        markWatched(uid);
      } else {
        showConfirm('▶', 'Pustit epizodu?', epLabel, '▶ Pustit', () => {
          markWatched(uid);
          window.open(url, '_blank', 'noopener,noreferrer');
        });
      }
    }
    function markWatched(uid) {
      try{
        const sl=uid.split('-S')[0];
        if(db[sl]&&db[sl]._genres) aiBrain.recordWatch(sl,db[sl]._genres);
        // Boost přes TMDB genre IDs (pokud je máme v db)
        if(db[sl]&&db[sl]._genreIds) {
          aiBrain.boostGenreIds(db[sl]._genreIds, 0.07);
          // v3: zaznamenej do timeline pro momentum algoritmus
          recordWatchToTimeline(sl, db[sl]._genreIds);
        }
        aiBrain.recordWatchTime();
      }catch(e){}
      const w = getWatched(); w[uid] = true; saveWatched(w);
      const card = document.getElementById(`card-${uid}`);
      if (card) { card.classList.add('watched'); card.classList.remove('spoiler-blur'); const btn = card.querySelector('.ep-btn-mark'); if (btn) btn.textContent = '✓'; }
      updatePanelProgress(); updateTileProgress(activeSeries); updateContinueBadge(activeSeries); updateContinueWidget(); updateLogoProgress();
      if (aiBrain && db[activeSeries] && db[activeSeries]._genres) aiBrain.boostGenresFromTmdb(db[activeSeries]._genres);
      // Show next-episode prompt after marking watched
      setTimeout(() => showNextEpPrompt(uid), 600);
    }

    // ── NEXT EPISODE PROMPT ──────────────────────────────────
    let _nextEpTimer = null;
    let _nextEpTarget = null;

    async function showNextEpPrompt(justWatchedUid) {
      const next = findNextEp(activeSeries);
      if (!next) return;
      const s = db[activeSeries];
      const url = `https://svetserialu.to/serial/${activeSeries}/s${String(next.se).padStart(2,'0')}e${String(next.ep).padStart(2,'0')}`;
      _nextEpTarget = { uid: next.uid, se: next.se, ep: next.ep, url };

      // Fill info
      document.getElementById('nextEpTitle').textContent = s.name || activeSeries;
      document.getElementById('nextEpSub').textContent = `Série ${next.se} · Epizoda ${next.ep}`;

      // Try to load still image from TMDB
      const thumb = document.getElementById('nextEpThumbImg');
      thumb.src = s.poster || '';
      if (TMDB_KEY) {
        const still = await getTmdbStill(activeSeries, next.se, next.ep);
        if (still) thumb.src = still;
      }

      // Show overlay
      const overlay = document.getElementById('nextEpOverlay');
      overlay.classList.add('open');

      // Countdown 10s
      let secs = 10;
      const cntEl = document.getElementById('nextEpCountdown');
      cntEl.textContent = `${secs}s`;
      _nextEpTimer = setInterval(() => {
        secs--;
        cntEl.textContent = `${secs}s`;
        if (secs <= 0) { nextEpPlay(); }
      }, 1000);
    }

    function nextEpPlay() {
      nextEpDismiss();
      if (!_nextEpTarget) return;
      const t = _nextEpTarget;
      markWatched(t.uid);

      // 🎬 Pokud seriál má TMDB ID, nabídni Cinema mode
      const tmdbId = db[activeSeries]?.tmdbId;
      if (tmdbId) {
        const seriesName = db[activeSeries]?.name || activeSeries;
        const epLabel = `${seriesName} — S${String(t.se).padStart(2,'0')}E${String(t.ep || t.epNum || '?').padStart(2,'0')}`;
        window._cinSiteSlug = activeSeries;
        _showCinemaOrFinderChoice(tmdbId + '/' + t.se + '/' + (t.ep || t.epNum), epLabel, 'tv_ep', t.url);
      } else {
        window.open(t.url, '_blank', 'noopener,noreferrer');
      }

      // Scroll to episode card
      activeSeason = t.se; showAllSeasons = false;
      renderSeasons(); renderEpisodes();
      setTimeout(() => { const c = document.getElementById(`card-${t.uid}`); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 200);
    }

    function nextEpDismiss() {
      clearInterval(_nextEpTimer);
      _nextEpTimer = null; _nextEpTarget = null;
      const overlay = document.getElementById('nextEpOverlay');
      overlay.classList.remove('open');
    }
    function toggleWatch(uid) {
  const w = getWatched();
  const wasWatched = !!w[uid];
  if (wasWatched) {
    delete w[uid];
  } else {
    w[uid] = true;
  }
  saveWatched(w);
  renderEpisodes();
  updatePanelProgress();
  updateTileProgress(activeSeries);
  updateContinueBadge(activeSeries);
  updateContinueWidget();
  updateLogoProgress();

  // 🌟 Show rating overlay only when marking as WATCHED (not on unwatch)
  if (!wasWatched && typeof openEpRating === 'function') {
    const parts = uid.split('-');
    const seriesSlug = parts.slice(0, parts.length - 2).join('-');
    const s = (typeof db !== 'undefined' && db[seriesSlug]) ? db[seriesSlug] : {};
    const seriesName = s.name || seriesSlug;
    const seNum = parseInt((parts[parts.length - 2] || 'S1').replace('S','')) || 1;
    const epNum = parseInt((parts[parts.length - 1] || 'E1').replace('E','')) || 1;
    const existing = (typeof getEpRating === 'function') ? getEpRating(uid) : 0;
    setTimeout(() => openEpRating(uid, seriesName, 'S' + seNum + ' · E' + epNum, existing), 350);
  }
}
    function shuffleEpisode() {
      const seasons = totalSeasons(activeSeries), randS = Math.floor(Math.random() * seasons) + 1, count = epsInSeason(activeSeries, randS), randE = Math.floor(Math.random() * count) + 1;
      activeSeason = randS; showAllSeasons = false; renderSeasons(); renderEpisodes();
      setTimeout(() => { const uid = `${activeSeries}-S${randS}-E${randE}`; const card = document.getElementById(`card-${uid}`); if (card) { card.classList.add('shuffle-highlight'); card.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => card.classList.remove('shuffle-highlight'), 2200); } const url = `https://svetserialu.to/serial/${activeSeries}/s${String(randS).padStart(2, '0')}e${String(randE).padStart(2, '0')}`; const tmdbId = db[activeSeries]?.tmdbId; const epLabel = `${db[activeSeries].name} — S${String(randS).padStart(2,'0')}E${String(randE).padStart(2,'0')}`; if (tmdbId) { markWatched(uid); window._cinSiteSlug = activeSeries; _showCinemaOrFinderChoice(tmdbId + '/' + randS + '/' + randE, epLabel, 'tv_ep', url); } else { showConfirm('🎲', 'Náhodná epizoda', epLabel, '▶ Pustit', () => { markWatched(uid); window.open(url, '_blank', 'noopener,noreferrer'); }); } }, 90);
    }

    // WATCHLIST
    function getWatchlist() { try { return safeLS(uKey('mf_watchlist'), '[]'); } catch { return []; } }
    function saveWatchlistData(wl) { safeSetItem(uKey('mf_watchlist'), JSON.stringify(wl)); updateWatchlistBadge(); }
    function updateWatchlistBadge() { const wl = getWatchlist(), badge = document.getElementById('watchlistFabBadge'); if (badge) { badge.textContent = wl.length; badge.classList.toggle('visible', wl.length > 0); } }
    function openWatchlist() { const el = document.getElementById('watchlistOverlay'); el.classList.add('open'); requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible'))); renderWatchlist(); }
    function closeWatchlist() { const el = document.getElementById('watchlistOverlay'); el.classList.remove('visible'); setTimeout(() => el.classList.remove('open'), 280); }
    function renderWatchlist() {
      const wl = getWatchlist(), list = document.getElementById('watchlistList'), empty = document.getElementById('watchlistEmpty');
      list.querySelectorAll('.wl-item').forEach(i => i.remove());
      if (!wl.length) { empty.style.display = 'block'; return; } empty.style.display = 'none';
      wl.forEach((item, idx) => {
        const div = document.createElement('div'); div.className = 'wl-item';
        div.innerHTML = `<div class="wl-item-thumb"><img src="${item.poster || ''}" alt="" onerror="this.style.display='none'"></div><div class="wl-item-info"><div class="wl-item-name">${_esc(item.name)}</div><div class="wl-item-meta">${item.type === 'series' ? 'Serial' : 'Film'}</div></div><div class="wl-item-actions"><button class="wl-search-btn">Hledat</button><button class="wl-remove-btn">✕</button></div>`;
        div.querySelector('.wl-search-btn').onclick = () => openWithCopy(item.name, item.type === 'series' ? 'tv' : 'movie');
        div.querySelector('.wl-remove-btn').onclick = () => { const w2 = getWatchlist(); w2.splice(idx, 1); saveWatchlistData(w2); renderWatchlist(); };
        list.appendChild(div);
      });
    }
    function toggleWatchlistItem(slug) {
      const wl = getWatchlist(), idx = wl.findIndex(i => i.slug === slug);
      if (idx >= 0) { wl.splice(idx, 1); showToast('Odebrano ze seznamu'); }
      else { wl.push({ slug, name: db[slug]?.name || slug, type: 'series', poster: db[slug]?._poster || db[slug]?.poster || '' }); showToast('Pridano do Chci koukat! 🔖'); }
      saveWatchlistData(wl); updateWatchlistBtns();
    }
    function updateWatchlistBtns() { const wl = getWatchlist(); Object.keys(db).forEach(slug => { const btn = document.getElementById(`wlbtn-${slug}`); if (btn) btn.classList.toggle('in-watchlist', wl.some(i => i.slug === slug)); }); }
    function addToWatchlistByName(name, type = 'movie') { const wl = getWatchlist(); if (!wl.some(i => i.name === name)) { wl.push({ name, type, poster: '' }); saveWatchlistData(wl); } }
    document.getElementById('watchlistOverlay').addEventListener('click', e => { if (e.target === document.getElementById('watchlistOverlay')) closeWatchlist(); });

    // RATING
    function openRating(slug) {
      _ratingSlug = slug;
      const existing = safeLS(uKey('mf_ratings'), '{}');
      // Don't show if rated recently (last 30min)
      if (existing[slug] && Date.now() - existing[slug].ts < 1800000) return;
      const s = db[slug];
      document.getElementById('ratingTitle').textContent = `Jak se ti libil ${s.name}?`;
      const img = document.getElementById('ratingThumbImg'); img.src = s._poster || s.poster || '';
      const el = document.getElementById('ratingOverlay'); el.classList.add('open'); requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
    }
    function closeRating() { const el = document.getElementById('ratingOverlay'); el.classList.remove('visible'); setTimeout(() => el.classList.remove('open'), 280); }
    function submitRating(rating) {
      if (!_ratingSlug) return;
      const ratings = safeLS(uKey('mf_ratings'), '{}');
      ratings[_ratingSlug] = { rating, name: db[_ratingSlug]?.name || _ratingSlug, ts: Date.now() };
      safeSetItem(uKey('mf_ratings'), JSON.stringify(ratings));
      // Boost AI brain based on rating
      if (aiBrain && db[_ratingSlug]) {
        const boost = rating === 'loved' ? 0.25 : rating === 'liked' ? 0.15 : rating === 'ok' ? 0.05 : -0.1;
        if (db[_ratingSlug]._genres) aiBrain.boostGenresFromTmdb(db[_ratingSlug]._genres, boost);
      }
      closeRating(); showToast(rating === 'loved' ? 'Super! AI si to zapamuje pro doporuceni 🎉' : rating === 'meh' ? 'Chapeme, priste neco lepsiho 👍' : 'Diky za hodnoceni!');
      // Reload For You tile with updated preferences
      setTimeout(loadForYouTile, 500);
    }

    // ═══════════════════════════════════════════════════════
    // SYNC KÓD — JSONBin.io místo souborového importu/exportu
    // ═══════════════════════════════════════════════════════
    const JSONBIN_KEY = '$2a$10$mujflixsynckey0000000000000000000000000000000'; // user can set own
    const JSONBIN_URL = 'https://api.jsonbin.io/v3/b';

    function getSyncKey() { return localStorage.getItem('mf_jsonbin_key') || ''; }

    function generateSyncCode(binId) {
      // Convert binId last 9 chars → 6-char alphanumeric code
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      const seed = binId.replace(/[^a-f0-9]/gi, '').slice(-9);
      for (let i = 0; i < 6; i++) {
        const idx = parseInt(seed.slice(i * 1.5, i * 1.5 + 2), 16) % chars.length;
        code += chars[idx];
      }
      return code.slice(0, 3) + '-' + code.slice(3);
    }

    async function syncUpload() {
      const key = getSyncKey(); if (!key) { openSyncOverlay(); return; }
      const data = {
        watched: safeLS(uKey('mf_watched'), '{}'),
        watchlist: safeLS(uKey('mf_watchlist'), '[]'),
        brain: safeLS('mf_ai_brain', '{}'),
        ratings: safeLS(uKey('mf_ratings'), '{}'),
        profile: localStorage.getItem('mf_user_profile') || '',
        ts: Date.now()
      };
      showToast('⬆ Nahrávám data...');
      try {
        const res = await fetch(JSONBIN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Master-Key': key, 'X-Bin-Name': 'MujFlixSync', 'X-Bin-Private': 'false' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        const binId = json.metadata?.id || json.record?.id || '';
        if (!binId) throw new Error('No bin ID');
        localStorage.setItem('mf_sync_binid', binId);
        const code = generateSyncCode(binId);
        localStorage.setItem('mf_sync_code', code);
        // Show code to user
        showSyncCodeResult(code, 'upload');
      } catch(e) {
        showToast('⚠ Chyba uploadu: ' + e.message);
      }
    }

    async function syncDownload(codeInput) {
      const code = (codeInput || '').replace(/[^A-Z0-9]/g, '');
      if (code.length < 5) { showToast('⚠ Zadej platný kód'); return; }
      // Try to find bin by searching stored code→binId map
      const storedCode = localStorage.getItem('mf_sync_code') || '';
      const storedBinId = localStorage.getItem('mf_sync_binid') || '';
      const key = getSyncKey(); if (!key) { showToast('⚠ Potřebuješ JSONBin klíč'); openSyncOverlay(); return; }

      // We store a map of code→binId in localStorage for lookup
      let binId = null;
      try {
        const codeMap = safeLS('mf_sync_codemap', '{}');
        binId = codeMap[code.slice(0,3)+'-'+code.slice(3)] || codeMap[code] || (storedCode === code.slice(0,3)+'-'+code.slice(3) ? storedBinId : null);
      } catch {}

      if (!binId) { showToast('⚠ Kód nenalezen. Nahraj data ze zdrojového zařízení.'); return; }

      showToast('⬇ Stahuji data...');
      try {
        const res = await fetch(`${JSONBIN_URL}/${binId}/latest`, { headers: { 'X-Master-Key': key } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        const data = json.record;
        if (!data || !data.watched) throw new Error('Neplatná data');
        safeSetItem(uKey('mf_watched'), JSON.stringify(data.watched));
        if (data.watchlist) safeSetItem(uKey('mf_watchlist'), JSON.stringify(data.watchlist));
        if (data.brain) safeSetItem('mf_ai_brain', JSON.stringify(data.brain));
        if (data.ratings) safeSetItem(uKey('mf_ratings'), JSON.stringify(data.ratings));
        if (data.profile) localStorage.setItem('mf_user_profile', data.profile);
        showAutosave('saved');
        Object.keys(db).forEach(s => { updateTileProgress(s); updateContinueBadge(s); });
        updateContinueWidget(); updateWatchlistBadge();
        if (activeSeries) { renderEpisodes(); updatePanelProgress(); }
        showToast('✅ Profil synchronizován!');
        closeSyncOverlay();
      } catch(e) {
        showToast('⚠ Chyba stahování: ' + e.message);
      }
    }

    function showSyncCodeResult(code, mode) {
      const el = document.getElementById('syncCodeDisplay');
      const codeEl = document.getElementById('syncCodeValue');
      if (el) el.style.display = 'block';
      if (codeEl) codeEl.textContent = code;
      // Store code→binId mapping
      try {
        const binId = localStorage.getItem('mf_sync_binid');
        const codeMap = safeLS('mf_sync_codemap', '{}');
        codeMap[code] = binId;
        localStorage.setItem('mf_sync_codemap', JSON.stringify(codeMap));
      } catch {}
      showToast(`✅ Kód: ${code} — zadej ho na druhém zařízení!`);
    }

    function openSyncOverlay() {
      const el = document.getElementById('syncOverlay');
      el.classList.add('open');
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
      const k = getSyncKey(); if (k) document.getElementById('syncKeyInput').value = k;
      const code = localStorage.getItem('mf_sync_code');
      if (code) { document.getElementById('syncCodeDisplay').style.display = 'block'; document.getElementById('syncCodeValue').textContent = code; }
      pauseBgParticles();
    }

    function closeSyncOverlay() {
      const el = document.getElementById('syncOverlay');
      el.classList.remove('visible');
      setTimeout(() => el.classList.remove('open'), 280);
      resumeBgParticles();
    }

    function saveSyncKey() {
      const k = document.getElementById('syncKeyInput').value.trim();
      if (!k) return;
      localStorage.setItem('mf_jsonbin_key', k);
      showToast('✓ JSONBin klíč uložen!');
    }

    function importHistory(event) { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = e => { try { localStorage.setItem(uKey('mf_watched'), JSON.stringify(JSON.parse(e.target.result))); showAutosave('saved'); Object.keys(db).forEach(s => { updateTileProgress(s); updateContinueBadge(s); }); updateContinueWidget(); if (activeSeries) { renderEpisodes(); updatePanelProgress(); } showToast('✓ Zaloha nactena!'); } catch { showToast('⚠ Chybny soubor'); } }; reader.readAsText(file); }

    // ═══════════════════════════════════════════════════════
    // 🍎 INTRO ANIMATION — Apple-style cinematic
    // ═══════════════════════════════════════════════════════
    function playIntro() {
      const intro = document.getElementById('mflix-intro');
      if (!intro) return;
      startIntroCanvas();
      setTimeout(playIntroAudio, 150);
      if (typeof gsap === 'undefined') { gsap_fallback(); return; }

      const tl = gsap.timeline();

      // 1. Film strips slide in from sides
      tl.fromTo('#introFilmLeft', { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0)
        .fromTo('#introFilmRight', { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0)

      // 2. Glow ring blooms from center
        .to('#introGlowRing', { opacity: 1, scale: 1, duration: 1.6, ease: 'power2.out' }, 0.15)

      // 3. Icon pops with spring
        .to('#introIcon', { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'back.out(2.2)' }, 0.6)

      // 4. Wordmark blurs in
        .to('.intro-wordmark', { opacity: 1, filter: 'blur(0px)', letterSpacing: '12px', duration: 1.1, ease: 'expo.out' }, 1.0)

      // 5. Shimmer line extends
        .to('#introLine', { opacity: 0.95, width: '200px', duration: 0.8, ease: 'power3.out' }, 1.65)

      // 6. Subtitle
        .to('#introSub', { opacity: 1, filter: 'blur(0px)', duration: 0.65, ease: 'power2.out' }, 1.9)

      // 7. Loader
        .to('#introLoader', { opacity: 1, duration: 0.3 }, 2.1)
        .to('#introLoaderFill', { width: '100%', duration: 2.2, ease: 'power1.inOut' }, 2.15)

      // 8. Everything fades out
        .to(intro, { opacity: 0, duration: 0.9, ease: 'power2.inOut',
          onComplete: () => { intro.remove(); stopIntroCanvas(); }
        }, 3.3);
    }

    function gsap_fallback() {
      const intro = document.getElementById('mflix-intro');
      if (intro) setTimeout(() => { intro.style.transition = 'opacity 0.8s'; intro.style.opacity = '0'; setTimeout(() => intro.remove(), 800); }, 1200);
    }

    // INTRO CANVAS — subtle bokeh stars
    let _introRaf = null;
    function startIntroCanvas() {
      const c = document.getElementById('introCanvas'); if (!c) return;
      c.width = window.innerWidth; c.height = window.innerHeight;
      const ctx = c.getContext('2d');
      // Two layers: tiny blue sparks + white micro-stars
      const sparks = Array.from({ length: 70 }, () => ({
        x: Math.random() * c.width, y: Math.random() * c.height,
        r: Math.random() * 1.6 + 0.3,
        spd: Math.random() * 0.18 + 0.03,
        op: Math.random() * 0.28 + 0.04,
        dir: Math.random() * Math.PI * 2,
        pulse: Math.random() * Math.PI * 2,
        pspd: Math.random() * 0.018 + 0.004,
        blue: Math.random() > 0.35
      }));
      function draw() {
        ctx.clearRect(0, 0, c.width, c.height);
        // Subtle radial vignette glow from center
        const cx = c.width / 2, cy = c.height / 2;
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(c.width, c.height) * 0.55);
        grd.addColorStop(0, 'rgba(0,100,255,0.04)');
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd; ctx.fillRect(0, 0, c.width, c.height);

        sparks.forEach(d => {
          d.x += Math.cos(d.dir) * d.spd; d.y += Math.sin(d.dir) * d.spd; d.pulse += d.pspd;
          if (d.x < 0) d.x = c.width; if (d.x > c.width) d.x = 0;
          if (d.y < 0) d.y = c.height; if (d.y > c.height) d.y = 0;
          const op = d.op * (0.55 + 0.45 * Math.sin(d.pulse));
          ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fillStyle = d.blue
            ? 'rgba(0,122,255,' + op.toFixed(3) + ')'
            : 'rgba(255,255,255,' + (op * 0.4).toFixed(3) + ')';
          ctx.fill();
        });
        _introRaf = requestAnimationFrame(draw);
      }
      draw();
    }
    function stopIntroCanvas() { if (_introRaf) { cancelAnimationFrame(_introRaf); _introRaf = null; } }

    // ═══════════════════════════════════════════════════════
    // BACKGROUND PARTICLES — s pozastavením při překryvech
    // ═══════════════════════════════════════════════════════
    let _bgParticlesPaused = false;
    let _bgParticlesRaf = null;
    function pauseBgParticles() { _bgParticlesPaused = true; if (_bgParticlesRaf) { cancelAnimationFrame(_bgParticlesRaf); _bgParticlesRaf = null; } }
    function resumeBgParticles() { if (!_bgParticlesPaused) return; _bgParticlesPaused = false; if (typeof _bgParticlesDraw === 'function') _bgParticlesDraw(); }
    let _bgParticlesDraw = null;
    (function initBgParticles() {
      const c = document.getElementById('particles'); if (!c) return;
      function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
      resize(); window.addEventListener('resize', resize);
      const ctx = c.getContext('2d');
      const pts = Array.from({ length: 90 }, () => ({
        x: Math.random() * c.width, y: Math.random() * c.height,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
        op: Math.random() * 0.3 + 0.04,
        pulse: Math.random() * Math.PI * 2, pspd: Math.random() * 0.012 + 0.003,
        col: Math.random() < 0.55 ? 0 : 1  // 0=accent yellow, 1=dim white
      }));
      function draw() {
        if (_bgParticlesPaused) return;
        ctx.clearRect(0, 0, c.width, c.height);
        pts.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.pulse += p.pspd;
          if (p.x < -2) p.x = c.width + 2; if (p.x > c.width + 2) p.x = -2;
          if (p.y < -2) p.y = c.height + 2; if (p.y > c.height + 2) p.y = -2;
          const op = p.op * (0.55 + 0.45 * Math.sin(p.pulse));
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.col === 0 ? ('rgba(0,122,255,' + op.toFixed(3) + ')') : 'rgba(255,255,255,' + (op * 0.35).toFixed(3) + ')';
          ctx.fill();
        });
        _bgParticlesRaf = requestAnimationFrame(draw);
      }
      _bgParticlesDraw = draw;
      draw();
    })();

    // ═══════════════════════════════════════════════════════
    // 🍎 APPLE-STYLE SOUND ENGINE
    // Čisté, krátké, high-fidelity tóny jako iOS/macOS
    // ═══════════════════════════════════════════════════════
    let audioCtx = null;
    let _audioUnlocked = false;
    function getAudioCtx() {
      if (!audioCtx) try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
      // Resume suspended context (browser autoplay policy)
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      return audioCtx;
    }
    // Unlock audio on first user gesture
    function _unlockAudio() {
      if (_audioUnlocked) return;
      _audioUnlocked = true;
      if (!audioCtx) try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    }
    document.addEventListener('pointerdown', _unlockAudio, { once: true, passive: true });
    document.addEventListener('keydown', _unlockAudio, { once: true, passive: true });

    // Shared compressor + reverb master chain
    let _masterComp = null, _masterReverb = null, _masterGain = null;
    function _getMaster() {
      const ac = getAudioCtx(); if (!ac) return null;
      if (!_masterGain) {
        _masterGain = ac.createGain(); _masterGain.gain.value = 0.85;
        _masterComp = ac.createDynamicsCompressor();
        _masterComp.threshold.value = -18; _masterComp.knee.value = 6;
        _masterComp.ratio.value = 3; _masterComp.attack.value = 0.003; _masterComp.release.value = 0.12;
        _masterGain.connect(_masterComp); _masterComp.connect(ac.destination);
      }
      return _masterGain;
    }

    // Core tone builder — Apple uses very short, pure sine + quick decay
    function _apTone(freq, startTime, dur, peak, opts = {}) {
      try {
        const ac = getAudioCtx(); if (!ac) return;
        const master = _getMaster(); if (!master) return;
        const { type = 'sine', detune = 0, attack = 0.003, hold = 0, releaseRatio = 0.85 } = opts;
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = type; o.frequency.value = freq;
        if (detune) o.detune.value = detune;
        const t0 = startTime;
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(peak, t0 + attack);
        if (hold > 0) g.gain.setValueAtTime(peak, t0 + attack + hold);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g); g.connect(master);
        o.start(t0); o.stop(t0 + dur + 0.01);
      } catch {}
    }

    // ── UI SOUNDS (Apple HIG: short, unobtrusive) ──

    // Click — crisp tap like iPhone keyboard (C6 + E6 chord, 45ms)
    function playClick() {
      const ac = getAudioCtx(); if (!ac) return;
      const t = ac.currentTime;
      _apTone(1046.5, t, 0.045, 0.032, { attack: 0.002 });         // C6
      _apTone(1318.5, t + 0.004, 0.038, 0.018, { attack: 0.002 }); // E6 harmony
    }

    // Hover — barely audible whisper (1kHz, 20ms)
    function playHover() {
      const ac = getAudioCtx(); if (!ac) return;
      _apTone(1000, ac.currentTime, 0.020, 0.012, { attack: 0.002 });
    }

    // Open/expand — ascending minor third (iOS sheet open feel)
    function playOpen() {
      const ac = getAudioCtx(); if (!ac) return;
      const t = ac.currentTime;
      _apTone(783.99, t, 0.075, 0.030, { attack: 0.003 });        // G5
      _apTone(987.77, t + 0.065, 0.060, 0.022, { attack: 0.003 }); // B5
    }

    // Success / mark — macOS "ding" three-note (C-E-G triad, staccato)
    function playSuccess() {
      const ac = getAudioCtx(); if (!ac) return;
      const t = ac.currentTime;
      _apTone(1046.5, t,         0.065, 0.030, { attack: 0.003 }); // C6
      _apTone(1318.5, t + 0.075, 0.060, 0.026, { attack: 0.003 }); // E6
      _apTone(1567.98, t + 0.14, 0.080, 0.022, { attack: 0.003 }); // G6
    }

    // Close/dismiss — descending (B5 → G5, soft)
    function playClose() {
      const ac = getAudioCtx(); if (!ac) return;
      const t = ac.currentTime;
      _apTone(987.77, t,         0.060, 0.025, { attack: 0.003 });
      _apTone(783.99, t + 0.055, 0.050, 0.018, { attack: 0.003 });
    }

    // Error — low two-tone (iOS "wrong" haptic equivalent)
    function playError() {
      const ac = getAudioCtx(); if (!ac) return;
      const t = ac.currentTime;
      _apTone(220, t,       0.08, 0.035, { type: 'triangle', attack: 0.005 });
      _apTone(196, t + 0.1, 0.07, 0.028, { type: 'triangle', attack: 0.005 });
    }

    // ── INTRO SOUND — Apple Startup inspired ──
    // Warm chord swell → crystal chimes → silence
    function playIntroAudio() {
      try {
        const ac = getAudioCtx(); if (!ac) return;
        const master = _getMaster(); if (!master) return;
        const t = ac.currentTime;

        // 1. Sub-bass heartbeat (1 pulse, very soft)
        _apTone(55, t + 0.05, 1.2, 0.07, { type: 'sine', attack: 0.15 });

        // 2. Warm pad chord — Cmaj7 (C2-E2-G2-B2) slow swell
        [[65.41, 0.0], [82.41, 0.08], [98.0, 0.16], [123.47, 0.26]].forEach(([f, delay]) => {
          _apTone(f, t + 0.3 + delay, 2.8, 0.038, { type: 'triangle', attack: 0.35 });
        });

        // 3. Mid shimmer — same chord one octave up, lighter
        [[130.81, 0.5], [164.81, 0.62], [196.0, 0.72]].forEach(([f, delay]) => {
          _apTone(f, t + 0.3 + delay, 1.8, 0.022, { type: 'sine', attack: 0.25 });
        });

        // 4. Crystal chime cascade — Apple startup sparkle (high pure sines)
        [[2093, 0], [2637, 0.11], [3136, 0.20], [2637, 0.31], [2093, 0.44]].forEach(([f, d]) => {
          _apTone(f, t + 1.15 + d, 0.55, 0.016, { attack: 0.003 });
        });

        // 5. Final resonant bell — long decay (like macOS startup bell)
        _apTone(1318.5, t + 1.6, 1.6, 0.028, { attack: 0.005 }); // E6
        _apTone(1567.98, t + 1.65, 1.4, 0.018, { attack: 0.005 }); // G6
        _apTone(2093.0, t + 1.72, 1.2, 0.012, { attack: 0.005 }); // C7

      } catch {}
    }

    // ═══════════════════════════════════════════════════════
    // ADAPTIVE COLORS
    // ═══════════════════════════════════════════════════════
    const SERIES_COLORS = { 'the-simpsons': '255,185,0', 'family-guy': '40,80,255', 'south-park': '255,80,0', 'futurama': '0,180,255', 'the-boys': '180,0,0', 'breaking-bad': '0,200,80', 'hunter-x-hunter': '100,180,255', 'scissor-seven': '255,60,180', '__foryou__': '232,255,0' };
    function setAdaptiveColor(slug) { const bg = document.getElementById('adaptiveBg'); if (!bg) return; const col = SERIES_COLORS[slug] || '232,255,0'; bg.style.background = `radial-gradient(ellipse 80% 60% at 50% 40%,rgba(${col},0.07) 0%,transparent 70%)`; bg.classList.add('active'); }
    function clearAdaptiveColor() { document.getElementById('adaptiveBg')?.classList.remove('active'); }

    // ═══════════════════════════════════════════════════════
    // FOCUS MODE, TOOLTIPS, TILE EFFECTS
    // ═══════════════════════════════════════════════════════
    function initTileEffects() {
      const menu = document.getElementById('mainMenu');
      document.querySelectorAll('.ps-tile-wrapper[data-slug]').forEach(wrapper => {
        const slug = wrapper.dataset.slug;
        if (slug && slug !== '__search__' && slug !== '__foryou__' && db[slug]) {
          const tt = document.createElement('div'); tt.className = 'tile-tooltip'; const s = db[slug];
          function buildStars(r) { const score = r || 0; const half = score / 2; const full = Math.floor(half); const hasHalf = (half - full) >= 0.3; const empty = 5 - full - (hasHalf ? 1 : 0); return `<span class="tt-stars">${'★'.repeat(full)}${hasHalf ? '½' : ''}${'☆'.repeat(empty)}</span><span class="tt-rating-num">${score.toFixed(1)}</span>`; }
          tt.innerHTML = `<div class="tt-title">${s.name}</div><div class="tt-meta">${buildStars(s._rating)}<span>${s.totalEps} ep</span></div><div class="tt-genre">${(s._genres || []).slice(0, 2).join(' · ') || ''}</div>`;
          wrapper.appendChild(tt);
        }
        const bg = wrapper.querySelector('.tile-bg');
        if (bg) {
          const addLoaded = () => bg.classList.add('loaded');
          if (bg.complete && bg.naturalWidth) { addLoaded(); }
          else { bg.addEventListener('load', addLoaded, { once: true }); bg.addEventListener('error', addLoaded, { once: true }); }
        }
        const logo = wrapper.querySelector('.tile-logo');
        if (logo) {
          const addLogLoaded = () => logo.classList.add('loaded');
          if (logo.complete && logo.naturalWidth) { addLogLoaded(); }
          else { logo.addEventListener('load', addLogLoaded, { once: true }); logo.addEventListener('error', addLogLoaded, { once: true }); }
        }

        // Dynamic items (Discovery/Search) might not be in hardcoded DB
        if (slug && !db[slug]) {
          // We can still initialize them if they have data-tmdb-id
        }

        initUniversalHover(wrapper);
      });
    }

    // NEW: Universal hover initializer for any tile (static or dynamic)
    function initUniversalHover(wrapper) {
      if (wrapper._hoverInited) return;
      wrapper._hoverInited = true;

      const menu = document.getElementById('mainMenu');
      const tmdbId = wrapper.dataset.tmdbId;
      const type = wrapper.dataset.type || 'tv';
      const slug = wrapper.dataset.slug;

      wrapper.addEventListener('mouseenter', () => {
        if (wrapper.parentElement.id === 'mainMenu') menu.classList.add('focus-mode');
        wrapper.classList.add('focused');
        if (slug) setAdaptiveColor(slug);
        playHover();

        const hasHardcoded = slug && HARDCODED_TRAILERS[slug];
        if (tmdbId || hasHardcoded) {
          // Pre-fetch
          if (tmdbId) getTrailerKey(tmdbId, type, slug);
          // Delay trailer (1.4s)
          wrapper._trailerTimer = setTimeout(() => {
            if (wrapper.classList.contains('focused') || wrapper.classList.contains('kb-focus')) {
              loadTileTrailer(wrapper, tmdbId || null, type, slug);
            }
          }, 1400);
        }
      });

      wrapper.addEventListener('mouseleave', () => {
        if (wrapper.parentElement.id === 'mainMenu') menu.classList.remove('focus-mode');
        wrapper.classList.remove('focused');
        clearAdaptiveColor();
        if (wrapper._trailerTimer) clearTimeout(wrapper._trailerTimer);
        removeTileTrailer(wrapper);
      });
    }
    // Hardcoded trailer keys for main shows
    const HARDCODED_TRAILERS = {
      'the-simpsons': 'oMXk1wi-9Zs',
      'family-guy': 'J32iwo65RMc',
      'futurama': 'GxEY6KNsz44',
      'south-park': 'FMKcPao7A6Y'
    };

    const _trailerCache = {};
    let _activeTrailerWrapper = null; // Global tracker to prevent duplicate trailers
    async function getTrailerKey(tmdbId, type = 'tv', slug = null) {
      if (slug && HARDCODED_TRAILERS[slug]) return HARDCODED_TRAILERS[slug];
      if (slug && db[slug]?.trailerKey) return db[slug].trailerKey;
      const cacheKey = 'trailer-' + type + '-' + tmdbId;
      if (_trailerCache[cacheKey]) return _trailerCache[cacheKey];
      // Fetch WITHOUT language filter to get all available videos (mostly English trailers)
      try {
        const url = TMDB + '/' + type + '/' + tmdbId + '/videos?api_key=' + TMDB_KEY;
        const r = await fetch(url);
        if (r.ok) {
          const data = await r.json();
          const results = data?.results || [];
          const t = results.find(v => v.site === 'YouTube' && v.type === 'Trailer') ||
            results.find(v => v.site === 'YouTube' && v.type === 'Teaser') ||
            results.find(v => v.site === 'YouTube');
          if (t) { _trailerCache[cacheKey] = t.key; return t.key; }
        }
      } catch (e) { }
      return null;
    }

    async function loadTileTrailer(wrapper, tmdbId, type = 'tv', slug = null) {
      // Allow loading if we have a hardcoded trailer key even without TMDB
      const hasHardcoded = slug && HARDCODED_TRAILERS[slug];
      if (!hasHardcoded && (!TMDB_KEY || !tmdbId)) return;

      // Ensure only ONE trailer exists at a time globally
      if (_activeTrailerWrapper && _activeTrailerWrapper !== wrapper) {
        removeTileTrailer(_activeTrailerWrapper);
      }

      if (wrapper.querySelector('.tile-trailer')) return;

      const videoKey = await getTrailerKey(tmdbId, type, slug);
      if (!videoKey) return;

      // Final check: Is it still focused?
      if (!wrapper.classList.contains('focused') && !wrapper.classList.contains('kb-focus')) return;

      _activeTrailerWrapper = wrapper;

      _activeTrailerWrapper = wrapper;

      const tr = document.createElement('div');
      tr.className = 'tile-trailer';

      // TMDB NATIVE LOOK: Optimized parameters and CSS setup
      // start=12 (skip intros), loop=1 (seamless), playlist=ID (required for loop)
      const src = `https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoKey}&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&cc_load_policy=0&start=12`;

      tr.innerHTML = `
        <div class="tr-video-container">
          <iframe src="${src}" allow="autoplay;encrypted-media" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>
        <div class="tr-grad"></div>
      `;

      const tile = wrapper.querySelector('.ps-tile');
      if (tile) tile.appendChild(tr);

      // --- PREMIUM ANIMATION (GSAP) ---
      const bg = wrapper.querySelector('.tile-bg');
      const logo = wrapper.querySelector('.tile-logo');
      const badge = wrapper.querySelector('.tile-continue-badge');
      const wl = wrapper.querySelector('.tile-watchlist-btn');
      const videoCont = tr.querySelector('.tr-video-container');

      const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });

      // 1. Atmospheric Zoom & Elevation (Scale + Depth)
      tl.to(tile, { scale: 1.18, y: -12, duration: 1.0, boxShadow: '0 40px 100px rgba(0,0,0,0.95), 0 0 60px rgba(0,122,255,0.14)' }, 0);

      // 2. Smoothly dissolve original poster elements (Blur + Fade)
      if (bg) tl.to(bg, { opacity: 0, filter: 'blur(20px) scale(1.15)', duration: 0.8 }, 0.1);
      if (logo) tl.to(logo, { opacity: 0.05, filter: 'blur(10px)', scale: 0.85, duration: 0.6 }, 0.15);
      if (badge) tl.to(badge, { opacity: 0, y: -10, duration: 0.5 }, 0);
      if (wl) tl.to(wl, { opacity: 0, scale: 0.5, duration: 0.4 }, 0);

      // 3. Cinematic video reveal (Fade + Subtle Scale)
      tl.fromTo(tr, { opacity: 0 }, { opacity: 1, duration: 1.4 }, 0.45);
      if (videoCont) tl.fromTo(videoCont, { scale: 0.92 }, { scale: 1.08, duration: 2.5, ease: 'power1.out' }, 0.35);

      wrapper._gsapTl = tl;
    }
    function removeTileTrailer(wrapper) {
      if (!wrapper) return;
      if (wrapper._trailerTimer) clearTimeout(wrapper._trailerTimer);
      if (_activeTrailerWrapper === wrapper) _activeTrailerWrapper = null;

      const tr = wrapper.querySelector('.tile-trailer');
      const tile = wrapper.querySelector('.ps-tile');

      if (wrapper._gsapTl) {
        wrapper._gsapTl.kill();
        wrapper._gsapTl = null;
      }

      if (tr || tile) {
        const bg = wrapper.querySelector('.tile-bg');
        const logo = wrapper.querySelector('.tile-logo');
        const badge = wrapper.querySelector('.tile-continue-badge');
        const wl = wrapper.querySelector('.tile-watchlist-btn');

        // Smoothly restore everything
        gsap.to(tile, { scale: 1, duration: 0.4, ease: 'power2.out' });
        if (bg) gsap.to(bg, { opacity: 1, filter: 'blur(0px)', duration: 0.4 });
        if (logo) gsap.to(logo, { opacity: 1, filter: 'blur(0px)', duration: 0.4, onComplete: () => { if(logo) logo.style.opacity = '1'; } });
        if (badge) gsap.to(badge, { opacity: 1, scale: 1, duration: 0.3 });
        if (wl) gsap.to(wl, { opacity: 1, scale: 1, duration: 0.3 });

        if (tr) {
          gsap.to(tr, { opacity: 0, duration: 0.3, onComplete: () => tr.remove() });
        }
      }
    }
    function initMagnetic(el, strength = 0.35) {
      if (!el) return;
      el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); const x = (e.clientX - r.left - r.width / 2) * strength; const y = (e.clientY - r.top - r.height / 2) * strength; el.style.transform = `translate(${x}px,${y}px)`; });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    }

    // ═══════════════════════════════════════════════════════
    // POPULAR SECTION
    // ═══════════════════════════════════════════════════════
    let _popularType = 'tv';
    async function loadTrending() { loadPopular('tv'); }
    async function switchPopular(type, btn) {
      _popularType = type;
      document.querySelectorAll('.pop-tab').forEach(b => b.classList.remove('active')); btn.classList.add('active');
      await loadPopular(type);
    }
    async function loadPopular(type) {
      if (!TMDB_KEY) return;
      const section = document.getElementById('popularSection');
      try {
        const endpoint = type === 'tv' ? '/trending/tv/week' : '/trending/movie/week';
        const data = await tmdbGet(endpoint); if (!data || !data.results) return;
        const list = document.getElementById('popularList'); if (!list) return; list.innerHTML = '';
        data.results.filter(r => r.poster_path).slice(0, 30).forEach((item, i) => {
          const name = item.name || item.title || item.original_name || '';
          const div = document.createElement('div'); div.className = 'pop-item';
          div.innerHTML = `<div class="pop-rank">${i + 1}</div><img src="${item.poster_path ? 'https://image.tmdb.org/t/p/w92' + item.poster_path : ''}" alt="" loading="lazy" onerror="this.style.display='none'"><div class="pop-item-name">${_esc(name)}</div>`;
          div.onclick = () => openWithCopy(name, type === 'tv' ? 'tv' : 'movie');
          div.addEventListener('mouseenter', playHover);
          list.appendChild(div);
        });
        section?.classList.add('visible');
      } catch (e) { }
    }

    // ═══════════════════════════════════════════════════════
    // PREMIUM WRAPPED
    // ═══════════════════════════════════════════════════════
    let wrappedIdx = 0;
    function openWrapped() {
      const w = getWatched();
      let totalEps = 0, totalMins = 0, seriesCounts = {};
      Object.keys(w).forEach(uid => {
        const m = uid.match(/^(.+)-S\d+-E\d+$/); if (!m) return;
        const slug = m[1]; if (!db[slug]) return;
        totalEps++; totalMins += (db[slug].runtime || 22);
        seriesCounts[slug] = (seriesCounts[slug] || 0) + 1;
      });
      const totalH = Math.round(totalMins / 60), totalD = Math.round(totalMins / 1440 * 10) / 10;
      const topSlug = Object.entries(seriesCounts).sort((a, b) => b[1] - a[1])[0];
      const topName = topSlug ? db[topSlug[0]]?.name : 'zatim nic';
      const topCount = topSlug ? topSlug[1] : 0;
      const ratings = safeLS(uKey('mf_ratings'), '{}');
      const loved = Object.values(ratings).filter(r => r.rating === 'loved').length;
      const genreData = aiBrain ? Object.entries(aiBrain.memory.genrePreferences || {}).sort((a, b) => b[1] - a[1]).slice(0, 5) : [];
      const topGenre = genreData[0] ? genreData[0][0] : 'Komedie';
      const badges = [];
      if (totalEps >= 100) badges.push('&#x1F3C6; Legenda'); else if (totalEps >= 50) badges.push('&#x1F4FA; Maratonec'); else if (totalEps >= 10) badges.push('&#x1F3AC; Divak');
      if (loved >= 3) badges.push('&#x2764;&#xFE0F; Kritik'); if (topCount >= 10) badges.push('&#x1F31F; Verny fanousek');
      const aiSummary = `Tvuj profil rika jasne: ${topGenre} zanr${topName != 'zatim nic' ? `, nejvic te tahne ${topName}` : ''}. Za ${totalH} hodin sledovani sis budoval vlastni filmovy vkus. ${loved > 0 ? `Oba palce jsi udelil ${loved}x – AI si to zapamatovala.` : 'Zkus neco ohodnotit.'} Priste budou doporuceni jeste presnejsi.`;
      // Poster backdrop – use top series poster
      const posterUrl = topSlug ? db[topSlug[0]]?._poster || db[topSlug[0]]?.poster || '' : '';
      const slideConfigs = [
        { bg: 'rgba(13,0,21,0.97)', accent: '180,0,255', content: `<div class="w-card"><div class="w-eyebrow">Tvůj MujFlix Wrapped</div><span class="w-emoji">&#x1F3AC;</span><div class="w-number" id="wNumEps">0</div><div class="w-label">epizod celkem</div><div class="w-sub">Kdyz to scitas – mas opravdu dobry vkus na cas.</div>${badges.length ? `<div class="w-badge-row">${badges.map((b, i) => `<div class="w-badge" style="animation-delay:${i * 0.12 + 0.3}s">${b}</div>`).join('')}</div>` : ''}</div>`, counter: { el: 'wNumEps', to: totalEps } },
        { bg: 'rgba(0,18,28,0.97)', accent: '0,160,255', content: `<div class="w-card"><div class="w-eyebrow">Cas na obrazovce</div><span class="w-emoji">&#x23F1;&#xFE0F;</span><div class="w-number" id="wNumH">0</div><div class="w-label">hodin (${totalD} dní)</div><div class="w-sub">${totalH > 100 ? 'Absolutni legenda. Kdyz nespis, koukáš.' : totalH > 30 ? 'Solidni divak s dobrym vkusem.' : 'Jen zacinas. Ceka te hodne dobreho.'}</div></div>`, counter: { el: 'wNumH', to: totalH } },
        { bg: 'rgba(20,8,0,0.97)', accent: '255,100,0', content: `<div class="w-card"><div class="w-eyebrow">Tvůj #1 Favorit</div><span class="w-emoji">&#x1F4FA;</span><div class="w-number text">${topName}</div><div class="w-label">${topCount} epizod</div><div class="w-sub">Tenhle serial te proste tahne. AI vím proc.</div></div>`, counter: null },
        { bg: 'rgba(5,0,20,0.97)', accent: '140,80,255', content: `<div class="w-card"><div class="w-eyebrow">Tvůj filmovy DNA</div><span class="w-emoji">&#x1F9E0;</span><div class="w-number text" style="font-size:1.8rem">${topGenre.charAt(0).toUpperCase() + topGenre.slice(1)}</div><div class="w-label">dominantní žánr</div><div class="w-chart-wrap">${genreData.map(([g, v]) => `<div class="w-bar-row"><div class="w-bar-label">${g.slice(0, 10)}</div><div class="w-bar-track"><div class="w-bar-fill" style="--target:${v.toFixed(2)}"></div></div><div class="w-bar-pct">${Math.round(v * 100)}%</div></div>`).join('')}</div></div>`, counter: null },
        { bg: 'rgba(10,8,0,0.97)', accent: '232,255,0', content: `<div class="w-card"><div class="w-eyebrow">AI si te precetla</div><span class="w-emoji">&#x2726;</span><div class="w-ai-text">${aiSummary}</div><div style="margin-top:16px;text-align:center;"><button onclick="event.stopPropagation();closeWrapped();openGenreEditor();" style="background:rgba(0,122,255,0.12);border:1px solid rgba(0,122,255,0.35);color:var(--accent);font-family:Outfit,sans-serif;font-size:0.73rem;font-weight:800;border-radius:50px;padding:10px 22px;cursor:pointer;transition:all 0.2s;">🎛 Vyladit moje preference</button></div><div style="margin-top:14px;text-align:center;font-size:0.58rem;color:rgba(255,255,255,0.18);letter-spacing:4px;text-transform:uppercase">MujFlix AI &middot; Osobni shrnut&iacute;</div></div>`, counter: null },
      ];
      const overlay = document.getElementById('wrappedOverlay');
      const slidesWrap = overlay.querySelector('.wrapped-slides-wrap');
      const nav = overlay.querySelector('.wrapped-nav');
      slidesWrap.innerHTML = ''; nav.innerHTML = '';
      // Poster blur backdrop
      if (posterUrl) { const pb = document.getElementById('wrappedPosterBlur'); if (pb) { pb.style.backgroundImage = `url(${posterUrl})`; setTimeout(() => pb.classList.add('vis'), 200); } }
      slideConfigs.forEach((s, i) => {
        const div = document.createElement('div'); div.className = 'wrapped-slide' + (i === 0 ? ' active' : '');
        div.style.cssText = `background:${s.bg}`; div.innerHTML = s.content; slidesWrap.appendChild(div);
        const dot = document.createElement('div'); dot.className = 'wrapped-dot' + (i === 0 ? ' active' : '');
        dot.onclick = (e) => { e.stopPropagation(); goWrappedSlide(i); }; nav.appendChild(dot);
      });
      _wrappedSlideConfigs = slideConfigs;
      wrappedIdx = 0;
      overlay.classList.add('open');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        overlay.classList.add('visible');
        startWrappedCanvas();
        setTimeout(() => { animateWrappedBars(); animateWrappedCounter(slideConfigs[0]); }, 400);
      }));
      pauseBgParticles();
      playOpen();
    }
    let _wrappedSlideConfigs = [];
    let _wrappedCanvasRaf = null;
    function startWrappedCanvas() {
      const c = document.getElementById('wrappedCanvas'); if (!c) return;
      c.width = window.innerWidth; c.height = window.innerHeight;
      const ctx = c.getContext('2d');
      const particles = Array.from({ length: 80 }, () => ({
        x: Math.random() * c.width, y: Math.random() * c.height,
        r: Math.random() * 2.2 + 0.4,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        op: Math.random() * 0.5 + 0.05,
        hue: Math.random() < 0.3 ? 60 : Math.random() * 80 + 200,
        pulse: Math.random() * Math.PI * 2, pspd: Math.random() * 0.015 + 0.004
      }));
      function draw() {
        ctx.clearRect(0, 0, c.width, c.height);
        particles.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.pulse += p.pspd;
          if (p.x < 0) p.x = c.width; if (p.x > c.width) p.x = 0;
          if (p.y < 0) p.y = c.height; if (p.y > c.height) p.y = 0;
          const op = p.op * (0.5 + 0.5 * Math.sin(p.pulse));
          const color = p.hue === 60 ? `rgba(0,122,255,${op})` : `hsla(${p.hue},80%,70%,${op * 0.5})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = color; ctx.fill();
        });
        _wrappedCanvasRaf = requestAnimationFrame(draw);
      }
      draw();
    }
    function stopWrappedCanvas() { if (_wrappedCanvasRaf) { cancelAnimationFrame(_wrappedCanvasRaf); _wrappedCanvasRaf = null; } }
    function animateWrappedCounter(cfg) {
      if (!cfg || !cfg.counter) return;
      const el = document.getElementById(cfg.counter.el); if (!el) return;
      const target = cfg.counter.to; let current = 0;
      const step = Math.max(1, Math.ceil(target / 50));
      const timer = setInterval(() => { current = Math.min(current + step, target); el.textContent = current; if (current >= target) clearInterval(timer); }, 28);
    }
    function animateWrappedBars() {
      document.querySelectorAll('.w-bar-fill').forEach(b => {
        const target = parseFloat(b.style.getPropertyValue('--target') || '1');
        b.style.transform = `scaleX(${target})`;
        b.classList.add('animated');
      });
    }
    function goWrappedSlide(idx) {
      const slides = document.querySelectorAll('.wrapped-slide'), dots = document.querySelectorAll('.wrapped-dot');
      if (idx < 0 || idx >= slides.length) return;
      slides[wrappedIdx].classList.add('exit'); slides[wrappedIdx].classList.remove('active'); dots[wrappedIdx].classList.remove('active');
      setTimeout(() => { if (slides[wrappedIdx]) slides[wrappedIdx].classList.remove('exit'); }, 450);
      wrappedIdx = idx; slides[idx].classList.add('active'); dots[idx].classList.add('active');
      if (idx === 3) setTimeout(animateWrappedBars, 280);
      if (_wrappedSlideConfigs[idx]) setTimeout(() => animateWrappedCounter(_wrappedSlideConfigs[idx]), 200);
      playClick(380 + idx * 65, 0.07, 0.045);
    }
    function nextWrappedSlide() { if (wrappedIdx >= document.querySelectorAll('.wrapped-slide').length - 1) { closeWrapped(); return; } goWrappedSlide(wrappedIdx + 1); }
    function closeWrapped() {
      const el = document.getElementById('wrappedOverlay');
      el.classList.remove('visible');
      stopWrappedCanvas();
      const pb = document.getElementById('wrappedPosterBlur'); if (pb) pb.classList.remove('vis');
      setTimeout(() => el.classList.remove('open'), 600);
    }

    // ═══════════════════════════════════════════════════════
    // AI BRAIN (paměť preferencí žánrů)
    // ═══════════════════════════════════════════════════════
    class AIBrain {
      constructor() {
        // ── PER-PROFIL klíč — každý uživatel má VLASTNÍ AI paměť ──
        this._key = () => 'mf_ai_brain_' + (getActiveProfileId() || 'default');
        this.memory = this._load();
      }

      _load() {
        try {
          const raw = localStorage.getItem(this._key());
          return raw ? JSON.parse(raw) : this._defaultMemory();
        } catch { return this._defaultMemory(); }
      }

      _defaultMemory() {
        return {
          genrePreferences: {},   // CZ klíč → váha 0–1
          genreIdPrefs: {},       // TMDB genre ID → váha 0–1 (přesnější)
          watchedCount: 0,
          ratings: {},            // slug → 'loved'|'liked'|'meh'|'disliked'
          ratedGenres: {},        // genre → {loved, liked, meh, disliked}
          watchedSlugs: {},       // slug → počet epizod
          watchedTmdbIds: {},     // TMDB item id → bool (anti-repeat)
          wt: {},                 // čas sledování: rano/odpoledne/vecer/noc
          sessionGenres: [],      // žánry z aktuální session (posledních 5)
          totalEpsWatched: 0,
          lastActive: Date.now(),
        };
      }

      // Při přepnutí profilu znovu načti správnou paměť
      reloadForProfile() {
        this.memory = this._load();
      }

      save() {
        try { localStorage.setItem(this._key(), JSON.stringify(this.memory)); } catch(e) {}
      }

      // ── Mapování TMDB EN → CZ klíč ──
      _tmdbMap(g) {
        const map = {
          'Comedy':'komedie','Action & Adventure':'akcni','Sci-Fi & Fantasy':'sci-fi',
          'Drama':'drama','Family':'rodinny','Mystery':'krimi','Animation':'animovany',
          'Horror':'horor','Adventure':'dobrodruzny','Crime':'krimi',
          'Science Fiction':'sci-fi','Fantasy':'fantasy','Action':'akcni',
          'Thriller':'napinavy','Romance':'romantika','Documentary':'dokument',
          'War & Politics':'valecny','Western':'western','History':'historicky',
          'Music':'hudba','Kids':'detsky','Reality':'reality','Talk':'talk-show',
          'News':'zpravodajstvi','Soap':'telenovela',
        };
        return map[g] || g.toLowerCase().replace(/\s+/g,'-');
      }

      // ── Zvýšení váhy žánrů (CZ názvy) ──
      boostGenres(genres, boost = 0.1) {
        if (!genres?.length) return;
        genres.forEach(g => {
          const k = g.toLowerCase().replace(/\s+/g,'-');
          this.memory.genrePreferences[k] = Math.min(1, (this.memory.genrePreferences[k] || 0) + boost);
        });
        this.save();
      }

      // ── Zvýšení váhy žánrů (TMDB EN názvy → CZ) ──
      boostGenresFromTmdb(tmdbGenres, boost = 0.1) {
        if (!tmdbGenres?.length) return;
        tmdbGenres.forEach(g => {
          const k = this._tmdbMap(g);
          this.memory.genrePreferences[k] = Math.min(1, (this.memory.genrePreferences[k] || 0) + boost);
        });
        this.save();
      }

      // ── Zvýšení váhy přes TMDB ID (nejpřesnější) ──
      boostGenreIds(genreIds, boost = 0.1) {
        if (!genreIds?.length) return;
        genreIds.forEach(id => {
          this.memory.genreIdPrefs[id] = Math.min(1, (this.memory.genreIdPrefs[id] || 0) + boost);
        });
        this.save();
      }

      // ── Snižování váhy žánrů (anti-liked) ──
      penalizeGenreIds(genreIds, penalty = 0.15) {
        if (!genreIds?.length) return;
        genreIds.forEach(id => {
          this.memory.genreIdPrefs[id] = Math.max(0, (this.memory.genreIdPrefs[id] || 0) - penalty);
        });
        this.save();
      }

      // ── Zaznamenání hodnocení ──
      recordRating(slug, rating, genreIds) {
        this.memory.ratings[slug] = rating;
        const boostMap = { loved: 0.25, liked: 0.12, meh: -0.05, disliked: -0.18 };
        const b = boostMap[rating] || 0;
        if (b > 0) this.boostGenreIds(genreIds, b);
        else if (b < 0) this.penalizeGenreIds(genreIds, Math.abs(b));
        // Aktualizuj ratedGenres statistiky
        (genreIds || []).forEach(id => {
          if (!this.memory.ratedGenres[id]) this.memory.ratedGenres[id] = {loved:0,liked:0,meh:0,disliked:0};
          this.memory.ratedGenres[id][rating] = (this.memory.ratedGenres[id][rating] || 0) + 1;
        });
        this.save();
      }

      // ── Zaznamenání sledování epizody ──
      recordWatch(slug, genres) {
        this.memory.watchedCount = (this.memory.watchedCount || 0) + 1;
        this.memory.totalEpsWatched = (this.memory.totalEpsWatched || 0) + 1;
        this.memory.watchedSlugs[slug] = (this.memory.watchedSlugs[slug] || 0) + 1;
        if (genres?.length) this.boostGenresFromTmdb(genres, 0.06);
        // Session tracking (posledních 5 žánrů)
        if (!this.memory.sessionGenres) this.memory.sessionGenres = [];
        if (genres?.length) {
          this.memory.sessionGenres = [...genres.slice(0,2), ...this.memory.sessionGenres].slice(0,10);
        }
        this.memory.lastActive = Date.now();
        this.save();
      }

      // ── Zaznamenání TMDB item do "already seen" ──
      recordTmdbSeen(tmdbId) {
        if (tmdbId) this.memory.watchedTmdbIds[tmdbId] = true;
        this.save();
      }

      // ── Postupné vyprchávání preferencí (zabraňuje stagnaci) ──
      applyDecay() {
        const now = Date.now();
        const daysSince = (now - (this.memory.lastActive || now)) / 86400000;
        const decayRate = Math.max(0.92, 1 - daysSince * 0.01); // max 1% za den
        Object.keys(this.memory.genrePreferences).forEach(k => {
          this.memory.genrePreferences[k] *= decayRate;
          if (this.memory.genrePreferences[k] < 0.01) delete this.memory.genrePreferences[k];
        });
        Object.keys(this.memory.genreIdPrefs).forEach(k => {
          this.memory.genreIdPrefs[k] *= decayRate;
          if (this.memory.genreIdPrefs[k] < 0.01) delete this.memory.genreIdPrefs[k];
        });
        this.save();
      }

      // ── Čas sledování ──
      recordWatchTime() {
        const h = new Date().getHours();
        const s = h<6?'noc':h<12?'rano':h<18?'odpoledne':'vecer';
        if (!this.memory.wt) this.memory.wt = {};
        this.memory.wt[s] = (this.memory.wt[s] || 0) + 1;
        this.save();
      }

      getFavTime() {
        if (!this.memory.wt) return null;
        const e = Object.entries(this.memory.wt);
        return e.length ? e.sort((a,b)=>b[1]-a[1])[0][0] : null;
      }

      getTopGenres(n = 3) {
        return Object.entries(this.memory.genrePreferences)
          .sort((a,b) => b[1]-a[1]).slice(0,n).map(e => e[0]);
      }

      getSummary() {
        const t = this.getTopGenres(5);
        return t.length ? 'Oblíbené: ' + t.join(', ') : '';
      }
    }
    const aiBrain = new AIBrain();

    // ═══════════════════════════════════════════════════════
    // AI HISTORY & STATE
    // ═══════════════════════════════════════════════════════
    let aiHistory = [];
    try { aiHistory = safeLS(uKey('mf_ai_history'), '[]'); } catch { }
    let ttsEnabled = false, speechSynth = window.speechSynthesis, aiMsgDay = 0, AI_DAY_LIMIT = 999;
    (() => { const today = new Date().toDateString(); let saved; try { saved = safeLS('mf_ai_usage', '{"date":"","count":0}'); } catch { saved = {date:'',count:0}; } if (saved.date === today) aiMsgDay = saved.count; else { localStorage.setItem('mf_ai_usage', JSON.stringify({ date: today, count: 0 })); aiMsgDay = 0; } })();
    function saveAiUsage() { const today = new Date().toDateString(); localStorage.setItem('mf_ai_usage', JSON.stringify({ date: today, count: aiMsgDay })); }
    function saveAiHistory() { localStorage.setItem(uKey('mf_ai_history'), JSON.stringify(aiHistory.slice(-40))); }
    function updateMsgCounter() {
      const el = document.getElementById('aiMsgCountNum'), mx = document.getElementById('aiMsgCountMax');
      const remaining = AI_DAY_LIMIT - aiMsgDay;
      if (el) { el.textContent = remaining; el.style.color = remaining <= 5 ? 'rgba(255,80,80,0.95)' : remaining <= 10 ? 'rgba(255,190,0,0.95)' : 'var(--accent)'; }
      if (mx) { mx.textContent = 'zbývá dnes'; }
      const bar = document.getElementById('aiLimitBar');
      if (bar) { bar.style.width = ((aiMsgDay / AI_DAY_LIMIT) * 100) + '%'; bar.style.background = remaining <= 5 ? 'rgba(255,80,80,0.7)' : remaining <= 10 ? 'rgba(255,190,0,0.7)' : 'rgba(0,122,255,0.5)'; }
    }

    // ═══════════════════════════════════════════════════════
    // LINK-IFIKACE NÁZVŮ FILMŮ
    // ═══════════════════════════════════════════════════════
    function linkifyFilms(html) {
      return html.replace(/\b([A-ZÁÉÍÓÚŮŽŠŘČĎŤŇĚ][a-záéíóúůžšřčďťňěA-ZÁÉÍÓÚŮŽŠŘČĎŤŇĚ\s\-:]{3,40})\b/g, (match) => {
        // Don't linkify common words
        const skip = ['Ahoj', 'Dobry', 'Jsem', 'Tvoj', 'Tenhle', 'Tato', 'Tento', 'Tohle', 'Pokud', 'Mohu', 'Chces', 'Zkus'];
        if (skip.some(w => match.startsWith(w))) return match;
        const q = encodeURIComponent(match.trim());
        return `<a class="ai-film-link" onclick="event.stopPropagation();window.open('https://svetserialu.to/serial/${slugifySvet(match.trim())}','_blank','noopener')">${match}</a>`;
      });
    }

    // ═══════════════════════════════════════════════════════
    // AI STATUS & API KEY
    // ═══════════════════════════════════════════════════════
    function updateStatusBadge() {
      const dot = document.getElementById('aiStatusDot'), model = document.getElementById('aiStatusModel'), sub = document.getElementById('aiStatusSub');
      const gKey = localStorage.getItem('mf_gemini_key'), orKey = localStorage.getItem('mf_or_key');
      const groqKey = localStorage.getItem('mf_groq_key'), jinaKey = localStorage.getItem('mf_jina_key'), tavilyKey = localStorage.getItem('mf_tavily_key');
      const tfSt=(typeof _tfReady!=='undefined'&&_tfReady)?'🧠LocalAI':'';const rem=AI_DAY_LIMIT-aiMsgDay;const remStr=rem<=10?' · ⚠'+rem+' zpráv':'';
      const extras=[tfSt,groqKey?'⚡Groq':'',jinaKey?'👁Jina':'',tavilyKey?'🌐Tavily':''].filter(Boolean).join(' · ');
      if(gKey){dot.className='ai-status-dot';model.textContent='Gemini 2.0 Flash';sub.textContent=(extras?extras+' · ':'')+'Nastavení'+remStr;}
      else if(orKey){dot.className='ai-status-dot warn';model.textContent='OpenRouter (záloha)';sub.textContent=(extras?extras+' · ':'')+'Nastavení'+remStr;}
      else{dot.className='ai-status-dot error';model.textContent='Žádný klíč';sub.textContent='Klikni pro nastavení AI';}
      updateMsgCounter();
    }
    function openApikeyOverlay() {
      const el = document.getElementById('aiApikeyOverlay'); el.classList.add('open');
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
      const gk = localStorage.getItem('mf_gemini_key'); if (gk) document.getElementById('aiGeminiKeyInput').value = gk;
      const ok = localStorage.getItem('mf_or_key'); if (ok) document.getElementById('aiOrKeyInput').value = ok;
      const grk = localStorage.getItem('mf_groq_key'); if (grk) { document.getElementById('aiGroqKeyInput').value = grk; document.getElementById('groqStatus').textContent = '✅ Groq aktivní'; }
      const jk = localStorage.getItem('mf_jina_key'); if (jk && jk !== '__enabled__') document.getElementById('aiJinaKeyInput').value = jk;
      const tk = localStorage.getItem('mf_tavily_key'); if (tk) document.getElementById('aiTavilyKeyInput').value = tk;
    }
    function openApikeyOverlayOnTrakt() {
      openApikeyOverlay();
      // Switch to Trakt tab
      setTimeout(() => {
        const traktTab = [...document.querySelectorAll('.ai-key-tab')].find(b => b.textContent.includes('Trakt'));
        if (traktTab) switchKeyTab('trakt', traktTab);
      }, 50);
    }
    // Update Trakt sidebar button label based on connection status
    function updateTraktSidebarLabel() {
      const token = localStorage.getItem('trakt_access_token');
      const user = localStorage.getItem('trakt_username');
      const lbl = document.getElementById('traktSidebarLbl');
      if (lbl) lbl.textContent = token ? `Trakt.tv — ${user || 'Připojeno'} ✓` : 'Trakt.tv — Nepřipojen';
    }
    function closeApikeyOverlay() { const el = document.getElementById('aiApikeyOverlay'); el.classList.remove('visible'); setTimeout(() => el.classList.remove('open'), 280); }
    function switchKeyTab(tab, btn) {
      document.querySelectorAll('.ai-key-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.ai-key-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panelMap = { gemini: 'keyPanelGemini', or: 'keyPanelOr', groq: 'keyPanelGroq', jina: 'keyPanelJina', tavily: 'keyPanelTavily', trakt: 'keyPanelTrakt' };
      document.getElementById(panelMap[tab] || 'keyPanelGemini')?.classList.add('active');
      if (tab === 'trakt') aiTraktRefreshStatus();
    }
    function aiTraktRefreshStatus() {
      const token = localStorage.getItem('trakt_access_token');
      const user = localStorage.getItem('trakt_username');
      const dot = document.getElementById('aiTraktDot');
      const lbl = document.getElementById('aiTraktStatusLbl');
      const userEl = document.getElementById('aiTraktUser');
      const connectBtn = document.getElementById('aiTraktConnectBtn');
      const disconnectBtn = document.getElementById('aiTraktDisconnectBtn');
      if (token) {
        dot.style.background = '#2ecc71'; dot.style.boxShadow = '0 0 8px rgba(46,204,113,0.6)';
        lbl.textContent = 'Připojeno'; userEl.textContent = user || '';
        connectBtn.style.display = 'none'; disconnectBtn.style.display = 'block';
      } else {
        dot.style.background = '#555'; dot.style.boxShadow = 'none';
        lbl.textContent = 'Nepřipojen'; userEl.textContent = '';
        connectBtn.style.display = 'block'; disconnectBtn.style.display = 'none';
      }
    }
    function aiTraktConnect() {
      // Sync client ID if user filled it in AI panel
      const cid = document.getElementById('aiTraktClientIdInput').value.trim();
      if (cid) localStorage.setItem('trakt_client_id_user', cid);
      // Trigger existing trakt auth flow
      traktStartAuth();
      // Show pin input in AI panel too
      document.getElementById('aiTraktPinWrap').style.display = 'block';
    }
    function aiTraktVerifyPin() {
      const pin = document.getElementById('aiTraktPinInput').value.trim().toUpperCase();
      document.getElementById('traktPinInput').value = pin;
      traktSubmitPin();
      setTimeout(aiTraktRefreshStatus, 1500);
    }
    function aiTraktDisconnect() {
      ['trakt_access_token','trakt_refresh_token','trakt_username','trakt_expires_at'].forEach(k => localStorage.removeItem(k));
      document.getElementById('traktFab')?.classList.remove('connected');
      aiTraktRefreshStatus();
      showToast('Trakt odpojen');
    }
    function saveGeminiKey() { const k = document.getElementById('aiGeminiKeyInput').value.trim(); if (!k) return; localStorage.setItem('mf_gemini_key', k); closeApikeyOverlay(); updateStatusBadge(); showToast('✦ Gemini aktivován!'); }
    function saveOrKey() { const k = document.getElementById('aiOrKeyInput').value.trim(); if (!k) return; localStorage.setItem('mf_or_key', k); closeApikeyOverlay(); updateStatusBadge(); showToast('↻ OpenRouter přidán!'); }
    function saveGroqKey() {
      const k = document.getElementById('aiGroqKeyInput').value.trim();
      if (!k) return;
      localStorage.setItem('mf_groq_key', k);
      showToast('⚡ Groq aktivován! Slugy se budou čistit AI.');
      document.getElementById('groqStatus').textContent = '✅ Groq aktivní — automatické čištění URL slugů';
      updateStatusBadge();
    }
    function saveJinaKey() {
      const k = document.getElementById('aiJinaKeyInput').value.trim() || '__enabled__';
      localStorage.setItem('mf_jina_key', k);
      closeApikeyOverlay();
      showToast('👁 Jina Reader aktivována! Budu ověřovat odkazy.');
    }
    function saveTavilyKey() {
      const k = document.getElementById('aiTavilyKeyInput').value.trim();
      if (!k) return;
      localStorage.setItem('mf_tavily_key', k);
      closeApikeyOverlay();
      showToast('🌐 Tavily aktivován! Záložní vyhledávač odkazů.');
    }

    // ═══════════════════════════════════════════════════════
    // AI PANEL
    // ═══════════════════════════════════════════════════════
    function toggleAiPanel() { if (aiPanelOpen) closeAiPanel(); else openAiPanel(); }
    function openAiPanel() {
      const el = document.getElementById('aiFullscreen');
      el.style.transform = 'translateX(18px)';
      el.style.opacity = '0';
      el.classList.add('open');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.classList.add('visible');
        el.style.transform = '';
        el.style.opacity = '';
      }));
      const _aiFabEl = document.getElementById('aiFab'); if(_aiFabEl) _aiFabEl.classList.add('open'); aiPanelOpen = true;
      document.getElementById('aiInput').focus();
      renderAiWatchList(); updateStatusBadge(); updateMsgCounter();
      document.getElementById('aiProfileText').value = localStorage.getItem('mf_user_profile') || '';
      pauseBgParticles();
    }
    function closeAiPanel() {
      const el = document.getElementById('aiFullscreen');
      el.classList.remove('visible');
      setTimeout(() => el.classList.remove('open'), 340);
      const _aiFabEl2 = document.getElementById('aiFab'); if(_aiFabEl2) _aiFabEl2.classList.remove('open'); aiPanelOpen = false;
      resumeBgParticles();
    }
    function renderAiWatchList() {
      const list = document.getElementById('aiWatchList'); if (!list) return; list.innerHTML = '';
      Object.keys(db).forEach(slug => {
        const s = db[slug], prog = calcProgress(slug), next = findNextEp(slug);
        const div = document.createElement('div'); div.className = 'ai-watch-item'; div.onclick = () => { closeAiPanel(); openSeries(slug); };
        div.innerHTML = `<div class="ai-watch-poster"><img src="${s._poster || s.poster || ''}" alt="" onerror="this.style.display='none'"></div><div class="ai-watch-info"><div class="ai-watch-name">${s.name}</div><div class="ai-watch-progress-wrap"><div class="ai-watch-bar"><div class="ai-watch-bar-fill" style="width:${prog.pct}%"></div></div><span class="ai-watch-pct">${prog.pct}%</span></div></div>`;
        list.appendChild(div);
      });
    }
    function saveUserProfile() { const val = document.getElementById('aiProfileText').value; localStorage.setItem('mf_user_profile', val); showToast('✓ Profil ulozen!'); showAutosave('saved'); }
    function clearAiHistory() { aiHistory = []; saveAiHistory(); const c = document.getElementById('aiMessages'); c.innerHTML = '<div class="ai-msg-wrap ai"><div class="ai-msg-avatar">✦</div><div class="ai-msg-bubble"><span class="ai-msg-label">MujFlix AI</span>Historia smazana. Cim mohu pomoct? 🎬</div></div>'; showToast('Historie smazana'); }
    function showAddSeriesForm() { const f = document.getElementById('aiAddForm'); f.classList.toggle('visible'); if (f.classList.contains('visible')) document.getElementById('aiAddName').focus(); }
    function aiConfirmAddSeries() { const name = document.getElementById('aiAddName').value.trim(), slug = document.getElementById('aiAddSlug').value.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'); if (!name) return; if (!db[slug]) { db[slug] = { name, tmdbId: 0, poster: '', totalEps: 0, runtime: 22 }; epsBySeason[slug] = [12]; } document.getElementById('aiAddForm').classList.remove('visible'); document.getElementById('aiAddName').value = ''; document.getElementById('aiAddSlug').value = ''; showToast(`✓ ${name} pridan!`); renderAiWatchList(); }
    function toggleTts() { ttsEnabled = !ttsEnabled; document.getElementById('aiTtsToggle').classList.toggle('tts-on', ttsEnabled); showToast(ttsEnabled ? '🔊 Hlas zapnut' : '🔇 Hlas vypnut'); }

    // ═══════════════════════════════════════════════════════
    // AI SEND
    // ═══════════════════════════════════════════════════════
    async function aiSend() {
      const input = document.getElementById('aiInput'), msg = input.value.trim();
      if (!msg || aiThinking) return;
      if (aiMsgDay >= AI_DAY_LIMIT) { showToast('Denni limit dosažen. Zítra zase!'); return; }
      aiMsgDay++; saveAiUsage(); updateMsgCounter();
      input.value = ''; input.style.height = '';
      // Add user bubble
      const wrap = document.createElement('div'); wrap.className = 'ai-msg-wrap user';
      wrap.innerHTML = `<div class="ai-msg-avatar">👤</div><div class="ai-msg-bubble">${escapeHTML(msg)}</div>`;
      wrap.style.opacity = '0'; wrap.style.transform = 'translateY(10px)';
      document.getElementById('aiMessages').appendChild(wrap);
      requestAnimationFrame(() => {
        wrap.style.transition = 'opacity 0.3s ease, transform 0.38s cubic-bezier(0.34,1.2,0.64,1)';
        wrap.style.opacity = '1'; wrap.style.transform = 'translateY(0)';
      });
      // Thinking
      const thinkWrap = document.createElement('div'); thinkWrap.className = 'ai-thinking-wrap ai-msg-wrap ai';
      thinkWrap.innerHTML = '<div class="ai-msg-avatar">✦</div><div class="ai-thinking-bubble"><span></span><span></span><span></span></div>';
      document.getElementById('aiMessages').appendChild(thinkWrap);
      document.getElementById('aiMessages').scrollTop = 99999;
      aiThinking = true; document.getElementById('aiSendBtn').disabled = true;
      aiHistory.push({ role: 'user', content: msg });

      // Fáze 1: detekce nálady
      let _moodCtx = '';
      try {
        const mr = await analyzeUserMood(msg);
        if (mr && mr.moodLabel) { _moodCtx = ' Nálada: '+mr.moodLabel+'.'; showMoodBadge(mr.moodLabel); aiBrain.boostGenres([mr.mood||'light'], 0.05); }
        else showMoodBadge(null);
      } catch(e) {}

      // Build system prompt
      const watched = getWatched(); const seenEps = Object.keys(watched).length;
      const topGenres = aiBrain.getTopGenres(3).join(', ') || 'neznamy';
      const userProfile = localStorage.getItem('mf_user_profile') || '';
      const hour = new Date().getHours(); const dayCtx = hour < 5 ? 'noc' : hour < 12 ? 'rano' : hour < 18 ? 'odpoledne' : hour < 22 ? 'vecer' : 'pozde v noci';
      const ratingsRaw = safeLS(uKey('mf_ratings'), '{}');
      const lovedShows = Object.values(ratingsRaw).filter(r => r.rating === 'loved').map(r => r.name).join(', ') || 'zadne';
      const mehShows = Object.values(ratingsRaw).filter(r => r.rating === 'meh').map(r => r.name).join(', ') || 'zadne';
      const dbWithProgress = Object.entries(db).map(([slug, s]) => {
        const prog = calcProgress(slug);
        return `${s.name} (${prog.pct}% zhlédnuto${s._rating ? ', ★'+s._rating : ''})`;
      }).join(', ');
      const groqActive = !!localStorage.getItem('mf_groq_key');
      // Build TMDB-enriched context for top shows
      const tmdbContext = Object.entries(db).slice(0,8).map(([slug,s]) => {
        const prog = calcProgress(slug);
        let info = `${s.name} (${prog.pct}% zhlédnuto`;
        if (s._rating) info += `, ★${s._rating}`;
        if (s.tmdbRating) info += `, TMDB:${s.tmdbRating}`;
        if (s.genres && s.genres.length) info += `, žánr:${s.genres.slice(0,2).join('/')}`;
        return info + ')';
      }).join(', ');

      const sysPrompt = `Jsi MujFlix AI – osobní filmový průvodce. Odpovídáš VŽDY v češtině, jsi přátelský, konkrétní a osobní jako kamarád který miluje filmy.

PROFIL UŽIVATELE:
- Zhlédnuté epizody: ${seenEps}
- Oblíbené žánry: ${topGenres || 'zatím neznámé'}
- Denní čas: ${dayCtx}
- Miluje: ${lovedShows}
- Nelíbilo se: ${mehShows}
${userProfile ? '- Osobní poznámky: ' + userProfile : ''}${_moodCtx ? '\n- Nálada dnes: ' + _moodCtx : ''}

SLEDOVANÉ TITULY (z MujFlixu):
${tmdbContext || dbWithProgress}

STREAMOVACÍ WEBY (Czech/Slovak):
- Filmy: bombuj.si, prima+, netflix.com
- Seriály: svetserialu.to, hbogo.com, netflix.com, disney+
- Zdarma: prehraj.to, webshare.cz (přes prohlížeč)
- Uživatel může kliknout na ikonu 🎬 u titulu pro automatické nalezení zdroje

PRAVIDLA:
- Používej **tučný text** pro názvy, hodnocení a klíčové info
- Vždy navrhuj KONKRÉTNÍ tituly s krátkým odůvodněním proč právě tento
- Zmiňuj kde streamovat (platforma) ale NIKDY nekopíruj přímé URL — jen název platformy
- Buď stručný — max 4-5 vět pokud není požadováno víc
- Pokud se ptají na zdroj/kde sledovat → řekni jen platformu, pro přímý odkaz ať kliknou na 🔍 ikonu u titulu
- Když nevíš přesně, raději řekni že nevíš než vymýšlíš
- Občas použij emoji 🎬🍿✨ pro živost
- NIKDY neříkej "jako AI" nebo "jako jazykový model" – jsi guru, ne robot
- Pokud uživatel píše o konkrétním titulu ze své knihovny, komentuj jeho postup a náladu`;

      try {
        const gKey = localStorage.getItem('mf_gemini_key');
        const orKey = localStorage.getItem('mf_or_key');
        let reply = '';
        if (gKey) {
          const msgs = aiHistory.slice(-10).map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
          // Try gemini-2.0-flash first, fallback to gemini-1.5-flash
          const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b'];
          let lastErr = '';
          for (const model of models) {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${gKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ system_instruction: { parts: [{ text: sysPrompt }] }, contents: msgs, generationConfig: { maxOutputTokens: 600, temperature: 0.85 } }) });
            const data = await res.json();
            if (res.status === 429) { lastErr = `⚠ Gemini kvóta překročena (${model}). Zkouším záložní model...`; continue; }
            if (!res.ok) {
              const errMsg = data?.error?.message || 'Chyba API';
              if (res.status === 400 || res.status === 403) { reply = `❗ Chyba Gemini klíče: ${errMsg}. Zkontroluj klic v nastaveni.`; }
              else { reply = `⚠ Gemini API chyba (${res.status}): ${errMsg}`; }
              break;
            }
            reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (!reply) { const blockReason = data?.promptFeedback?.blockReason; reply = blockReason ? `⚠ Zpráva zablokována: ${blockReason}` : '⚠ Prázdná odpověď. Zkus to jinak.'; }
            break;
          }
          // If all Gemini models hit quota, try OpenRouter as fallback
          if (!reply && lastErr && orKey) {
            try {
              const res = await fetch('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orKey}`, 'HTTP-Referer': 'https://mujflix.local' }, body: JSON.stringify({ model: 'mistralai/mistral-7b-instruct:free', messages: [{ role: 'system', content: sysPrompt }, ...aiHistory.slice(-10)], max_tokens: 500 }) });
              const data = await res.json();
              reply = data?.choices?.[0]?.message?.content || '⚠ OpenRouter vrátil prázdnou odpověď.';
              if (reply && !reply.startsWith('⚠')) showToast('📡 Gemini kvóta – přepnuto na OpenRouter zálohu');
            } catch { reply = '⚠ Gemini i OpenRouter jsou momentálně nedostupné. Zkus to za chvíli.'; }
          } else if (!reply && lastErr) {
            reply = '⚠ **Gemini kvóta dosažena.** Free tier má denní limit.\n\n💡 Řešení:\n1. Počkej do zítřka\n2. Nastav **OpenRouter** jako zálohu (ikona robota → záložka OpenRouter)\n3. Nebo si poříď placený Gemini klic';
          }
        } else if (orKey) {
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orKey}`, 'HTTP-Referer': 'https://mujflix.local' }, body: JSON.stringify({ model: 'mistralai/mistral-7b-instruct:free', messages: [{ role: 'system', content: sysPrompt }, ...aiHistory.slice(-10)], max_tokens: 500 }) });
          const data = await res.json();
          reply = data?.choices?.[0]?.message?.content || '⚠ OpenRouter vrátil prázdnou odpověď. Zkus to znovu.';
        } else {
          reply = '❗ Nastav AI klic kliknutim na ikonu robota v AI panelu. Podporujeme **Gemini** (1000x/den zdarma) nebo **OpenRouter**.';
        }
        aiHistory.push({ role: 'assistant', content: reply }); saveAiHistory();
        thinkWrap.remove();
        const fmt = reply.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        const rWrap = document.createElement('div'); rWrap.className = 'ai-msg-wrap ai';
        rWrap.innerHTML = `<div class="ai-msg-avatar">✦</div><div class="ai-msg-bubble"><span class="ai-msg-label">MujFlix AI</span>${linkifyFilms(fmt)}<div class="ai-msg-feedback"><button class="ai-fb-btn" onclick="this.parentElement.style.display='none';showToast('Diky! 👍')">👍</button><button class="ai-fb-btn" onclick="this.parentElement.style.display='none';showToast('Priste lepe!')">👎</button></div></div>`;
        rWrap.style.opacity = '0'; rWrap.style.transform = 'translateY(12px)';
        document.getElementById('aiMessages').appendChild(rWrap);
        requestAnimationFrame(() => {
          rWrap.style.transition = 'opacity 0.32s ease, transform 0.42s cubic-bezier(0.34,1.18,0.64,1)';
          rWrap.style.opacity = '1'; rWrap.style.transform = 'translateY(0)';
        });
        document.getElementById('aiMessages').scrollTop = 99999;
        if (ttsEnabled && speechSynth) {
          speechSynth.cancel();
          const utt = new SpeechSynthesisUtterance(reply.replace(/<[^>]+>/g, '').substring(0, 200));
          utt.lang = 'cs-CZ'; utt.rate = 0.95;
          // Show 3D bubble
          if (typeof aiBubbleShow === 'function') aiBubbleShow(utt);
          speechSynth.speak(utt);
        }
      } catch (e) {
        thinkWrap.remove();
        const rWrap = document.createElement('div'); rWrap.className = 'ai-msg-wrap ai';
        rWrap.innerHTML = `<div class="ai-msg-avatar">✦</div><div class="ai-msg-bubble"><span class="ai-msg-label">MujFlix AI</span>⚠ Chyba pripojeni. Zkontroluj API klic nebo internet.</div>`;
        document.getElementById('aiMessages').appendChild(rWrap);
      }
      aiThinking = false; document.getElementById('aiSendBtn').disabled = false;
    }
    function aiQuick(q) { const inp = document.getElementById('aiInput'); inp.value = q; setTimeout(aiSend, 80); }
    function handleAiInputKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); aiSend(); } }
    function autoResizeInput(el) { el.style.height = ''; el.style.height = Math.min(el.scrollHeight, 140) + 'px'; }

    // ═══════════════════════════════════════════════════════
    // HLASOVÉ OVLÁDÁNÍ — chat + diktování
    // ═══════════════════════════════════════════════════════
    let recog = null, _voiceMode = 'chat';
    const _SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    function startVoice(mode) {
      if (!_SR) { showToast('Hlasové ovládání není podporováno v tomto prohlížeči', 'error'); return; }
      _voiceMode = mode || 'chat';
      const overlay = document.getElementById('aiVoiceOverlay');
      const lbl = document.getElementById('aiVoiceModeLbl');
      if (lbl) lbl.textContent = _voiceMode === 'dictate' ? '🎙 Diktuji...' : '🎙 Mluv — pošlu to AI';
      overlay.style.display = 'flex';
      requestAnimationFrame(() => { overlay.style.opacity = '1'; });
      if (recog) try { recog.stop(); } catch {}
      recog = new _SR();
      recog.lang = 'cs-CZ'; recog.interimResults = true; recog.continuous = (_voiceMode === 'dictate');
      recog.onresult = e => {
        const finals = Array.from(e.results).filter(r => r.isFinal).map(r => r[0].transcript).join('');
        const interim = Array.from(e.results).filter(r => !r.isFinal).map(r => r[0].transcript).join('');
        const el = document.getElementById('aiVoiceTranscript');
        if (el) el.innerHTML = (finals ? '<strong>'+finals+'</strong>' : '') + (interim ? '<span style="opacity:0.5"> '+interim+'</span>' : '');
        if (_voiceMode === 'chat') {
          if (e.results[e.results.length-1].isFinal) {
            document.getElementById('aiInput').value = Array.from(e.results).map(r=>r[0].transcript).join('');
            stopVoice(); if (!aiPanelOpen) openAiPanel(); setTimeout(aiSend, 250);
          }
        } else {
          if (finals) { const inp = document.getElementById('aiInput'); if (inp){inp.value=(inp.value?inp.value+' ':'')+finals; autoResizeInput(inp);} }
        }
      };
      recog.onerror = e => {
        if (e.error==='not-allowed') showToast('Povol mikrofon v nastavení prohlížeče', 'error');
        else if (e.error!=='no-speech') showToast('Chyba mikrofonu: '+e.error, 'error');
        stopVoice();
      };
      recog.onend = () => { if (_voiceMode !== 'dictate') stopVoice(); };
      recog.start();
    }

    function stopVoice() {
      if (recog) try { recog.stop(); } catch {}
      const o = document.getElementById('aiVoiceOverlay');
      if (o) { o.style.opacity = '0'; setTimeout(() => { o.style.display='none'; const t=document.getElementById('aiVoiceTranscript'); if(t)t.innerHTML=''; }, 280); }
    }

    // ═══════════════════════════════════════════════════════
    // AI ARMÁDA: Groq → Jina → Tavily
    // ═══════════════════════════════════════════════════════
    // getGeminiKey defined below with cache
    // getGroqKey defined below
    // getJinaKey defined below with cache
    // getTavilyKey defined below

    // Fáze 1: Transformers.js — zakázáno (CDN nedostupné, používá se regex fallback)
    let _tfPipeline=null, _tfLoading=false, _tfReady=false;
    async function initTransformers() { /* zakázáno – quickMoodDetect regex fallback dostačuje */ }
    // setTimeout(initTransformers, 4000); // zakázáno

    // Rychlý regex fallback — okamžitá detekce nálady
    function quickMoodDetect(text) {
      const t=text.toLowerCase();
      const moods=[
        {k:['komedi','vtip','smích','smich','humor','legra','sranda','depk','nud'],r:{mood:'light',ml:'😄 Komedie'}},
        {k:['akci','akce','výbuch','bojov','superhrdinu','napínavý'],r:{mood:'action',ml:'💥 Akce'}},
        {k:['drama','dojemn','pláč','plac','smutný','emoci'],r:{mood:'deep',ml:'🎭 Drama'}},
        {k:['horor','děsiv','strach','zombie','upír','upir'],r:{mood:'dark',ml:'👻 Horor'}},
        {k:['sci-fi','scifi','vesmír','robot','budoucnost'],r:{mood:'wonder',ml:'🚀 Sci-Fi'}},
        {k:['romantick','lásk','lask','romance','zamilovan'],r:{mood:'warm',ml:'❤️ Romantika'}},
        {k:['fantasy','pohádku','pohadku','drak','magie'],r:{mood:'wonder',ml:'🧙 Fantasy'}},
        {k:['krimi','detektiv','vražd','vrazd','mystery'],r:{mood:'mystery',ml:'🔍 Krimi'}},
        {k:['animovan','anime','kreslen'],r:{mood:'fun',ml:'🎨 Animák'}},
      ];
      for(const m of moods) if(m.k.some(k=>t.includes(k))) return {mood:m.r.mood, moodLabel:m.r.ml};
      return null;
    }

    async function analyzeUserMood(text) {
      const q=quickMoodDetect(text); if(q) return q;
      if(!_tfReady||!_tfPipeline) return null;
      try {
        const labels=['komedie humor','akce','drama','horor','sci-fi','romantika','fantasy','krimi'];
        const res=await _tfPipeline(text,labels,{multi_label:false});
        if(res.scores[0]<0.4) return null;
        const map={'komedie humor':'😄 Komedie','akce':'💥 Akce','drama':'🎭 Drama','horor':'👻 Horor','sci-fi':'🚀 Sci-Fi','romantika':'❤️ Romantika','fantasy':'🧙 Fantasy','krimi':'🔍 Krimi'};
        return {mood:res.labels[0], moodLabel:map[res.labels[0]]||res.labels[0]};
      } catch {return null;}
    }

    function showMoodBadge(label) {
      let b=document.getElementById('aiMoodBadge');
      if(!b){b=document.createElement('div');b.id='aiMoodBadge';b.style.cssText='display:inline-flex;align-items:center;gap:5px;background:rgba(0,122,255,0.1);border:1px solid rgba(0,122,255,0.3);border-radius:20px;padding:3px 10px;font-size:0.62rem;font-weight:700;color:var(--accent);margin:0 0 6px 0;transition:opacity 0.3s;';const inp=document.getElementById('aiInput');if(inp&&inp.parentElement)inp.parentElement.insertBefore(b,inp);}
      b.style.opacity=label?'1':'0'; if(label)b.textContent='✦ Nálada: '+label;
    }

    // Fáze 3: Groq slug cleaner
    const _groqCache=new Map();
    async function groqCleanSlug(name,type) {
      const key=getGroqKey(); if(!key) return null;
      const ck=name+'|'+type; if(_groqCache.has(ck)) return _groqCache.get(ck);
      try {
        const site=type==='movie'?'bombuj.si format /online-film-{slug}':'svetserialu.to format /serial/{slug}';
        const res=await fetch('https://api.groq.com/openai/v1/chat/completions',{
          method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
          body:JSON.stringify({model:'llama-3.1-8b-instant',max_tokens:40,temperature:0,
            messages:[{role:'user',content:'URL slug for '+site+'. Title: "'+name+'". Rules: lowercase hyphens no accents no year. Reply ONLY the slug.'}]})
        });
        if(!res.ok) return null;
        const data=await res.json();
        const slug=(data?.choices?.[0]?.message?.content||'').trim().toLowerCase().replace(/[^a-z0-9-]/g,'').replace(/^-+|-+$/g,'');
        if(slug) _groqCache.set(ck,slug); return slug||null;
      } catch {return null;}
    }

    // Fáze 4: Jina Reader
    async function jinaVerifyUrl(url) {
      try {
        const jk=getJinaKey();
        const headers={'Accept':'text/plain'};
        if(jk&&jk!=='__enabled__'&&jk.length>10) headers['Authorization']='Bearer '+jk;
        const res=await fetch('https://r.jina.ai/'+url,{headers});
        if(!res.ok) return false;
        const text=await res.text(); if(text.length<200) return false;
        const lower=text.toLowerCase();
        const bad=['404','nenalezeno','not found','neexistuje','page not found'];
        if(bad.some(b=>lower.includes(b))) return false;
        return true;
      } catch {return false;}
    }

    // Fáze 5: Tavily
    async function tavilyFindUrl(name,type) {
      const key=getTavilyKey(); if(!key) return null;
      try {
        const site=type==='movie'?'bombuj.si':'svetserialu.to';
        const res=await fetch('https://api.tavily.com/search',{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({api_key:key,query:name+' '+(type==='movie'?'film':'serial')+' '+site,max_results:5,include_domains:[site]})
        });
        if(!res.ok) return null;
        const data=await res.json();
        const hit=(data?.results||[]).find(r=>r.url&&r.url.includes(site));
        return hit?.url||null;
      } catch {return null;}
    }

    // Progress UI
    let _pTimer=null;
    function showPipelineProgress(steps,ai) {
      let el=document.getElementById('mf-prog');
      if(!el){el=document.createElement('div');el.id='mf-prog';el.style.cssText="position:fixed;bottom:130px;left:50%;transform:translateX(-50%);z-index:99999;background:rgba(6,6,8,0.97);font-family:'Outfit',sans-serif;font-size:0.72rem;padding:8px 18px;border-radius:40px;border:1px solid rgba(0,122,255,0.2);backdrop-filter:blur(20px);white-space:nowrap;pointer-events:none;transition:opacity 0.3s;";document.body.appendChild(el);}
      el.innerHTML=steps.map((s,i)=>i<ai?'<span style="color:rgba(100,255,100,0.8)">✓ '+s+'</span>':i===ai?'<span style="color:var(--accent)">'+s+' ●</span>':'<span style="opacity:0.3">'+s+'</span>').join(' → ');
      el.style.opacity='1'; clearTimeout(_pTimer);
    }
    function hidePipelineProgress(){const el=document.getElementById('mf-prog');if(el)el.style.opacity='0';}

    // Hlavní pipeline
    const _urlCache2=new Map();
    // ═══════════════════════════════════════════════════════
    // 🔍 MUJFLIX FINDER — Anthropic Web Search Engine
    // Prohledá svetserialu.to (seriály) a bombuj.si (filmy)
    // ═══════════════════════════════════════════════════════

    // Uložení Anthropic API klíče
    // getAnthropicKey defined below
    // setAnthropicKey defined below

    // Hlavní finder modal
    function showFinderModal(name, type, year) {
      let modal = document.getElementById('mfFinderModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'mfFinderModal';
        modal.style.cssText = `
          position:fixed;inset:0;z-index:20000;
          display:flex;align-items:center;justify-content:center;
          background:rgba(0,0,0,0);
          backdrop-filter:blur(0px);
          transition:all 0.38s ease;
          pointer-events:none;
        `;
        modal.innerHTML = `
          <div id="mfFinderBox" style="
            width:min(520px,92vw);
            background:rgba(14,14,22,0.92);
            backdrop-filter:blur(52px) saturate(2.2);
            -webkit-backdrop-filter:blur(52px) saturate(2.2);
            border:1px solid rgba(255,255,255,0.13);
            border-radius:24px;
            box-shadow:0 40px 100px rgba(0,0,0,0.9),inset 0 1.5px 0 rgba(255,255,255,0.18),inset 0 -1px 0 rgba(0,0,0,0.2);
            transform:translateY(32px) scale(0.94);
            transition:transform 0.42s cubic-bezier(0.34,1.15,0.64,1);
            overflow:hidden;
          ">
            <!-- Header -->
            <div style="padding:20px 22px 16px;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;gap:12px;">
              <div style="width:36px;height:36px;border-radius:10px;background:rgba(0,122,255,0.15);border:1px solid rgba(0,122,255,0.25);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">🔍</div>
              <div style="flex:1;min-width:0;">
                <div id="mfFinderTitle" style="font-size:0.92rem;font-weight:800;letter-spacing:-0.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></div>
                <div id="mfFinderSub" style="font-size:0.6rem;color:rgba(255,255,255,0.38);margin-top:1px;"></div>
              </div>
              <button onclick="closeFinderModal()" style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);font-size:0.75rem;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.2s;">✕</button>
            </div>
            <!-- Progress / Results -->
            <div id="mfFinderContent" style="padding:20px 22px 22px;min-height:120px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;">
              <div id="mfFinderSpinner" style="width:28px;height:28px;border:2px solid rgba(0,122,255,0.15);border-top-color:rgba(0,122,255,0.8);border-right-color:rgba(0,122,255,0.4);border-radius:50%;animation:mfFinderSpin 0.7s linear infinite;"></div>
              <div id="mfFinderStatus" style="font-size:0.72rem;color:rgba(255,255,255,0.45);text-align:center;"></div>
            </div>
            <!-- API Key prompt (hidden by default) -->
            <div id="mfFinderKeyPrompt" style="display:none;padding:0 22px 22px;">
              <div style="font-size:0.72rem;color:rgba(255,255,255,0.45);margin-bottom:12px;text-align:center;">Zadej Anthropic API klíč pro vyhledávání</div>
              <div style="display:flex;gap:8px;">
                <input id="mfFinderKeyInput" type="password" placeholder="sk-ant-..." style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:10px 14px;color:#fff;font-size:0.78rem;outline:none;font-family:-apple-system,sans-serif;" />
                <button id="mfFinderKeySave" style="padding:10px 16px;border-radius:12px;background:#007AFF;border:none;color:#fff;font-size:0.78rem;font-weight:700;cursor:pointer;white-space:nowrap;">Uložit</button>
              </div>
              <div style="margin-top:16px;display:flex;gap:8px;">
                <button onclick="mfFinderFallback()" style="flex:1;padding:11px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);font-size:0.72rem;font-weight:600;cursor:pointer;">Hledat ručně</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        // Key save handler
        document.getElementById('mfFinderKeySave').onclick = () => {
          const k = document.getElementById('mfFinderKeyInput').value.trim();
          if (!k) return;
          setAnthropicKey(k);
          document.getElementById('mfFinderKeyPrompt').style.display = 'none';
          runFinder(window._mfFinderName, window._mfFinderType, window._mfFinderYear);
        };
      }

      // Show with animation — reset state first
      modal.style.display = 'flex';
      modal.style.opacity = '1';
      modal.style.pointerEvents = 'auto';
      // Reset box position
      const box = document.getElementById('mfFinderBox');
      if (box) box.style.transform = 'translateY(40px) scale(0.92)';
      setTimeout(() => {
        modal.style.background = 'rgba(0,0,0,0.78)';
        modal.style.backdropFilter = 'blur(20px)';
        modal.style.webkitBackdropFilter = 'blur(20px)';
        if (box) box.style.transform = 'translateY(0) scale(1)';
      }, 10);

      document.getElementById('mfFinderTitle').textContent = name;
      document.getElementById('mfFinderSub').textContent = type === 'movie' ? '🎬 Film · Hledám na bombuj.si…' : '📺 Seriál · Hledám na svetserialu.to…';
      document.getElementById('mfFinderContent').style.display = 'flex';
      document.getElementById('mfFinderKeyPrompt').style.display = 'none';
      setFinderStatus('Prohledávám zdroje…');

      window._mfFinderName = name;
      window._mfFinderType = type;
      window._mfFinderYear = year || null;
    }

    function closeFinderModal() {
      _cancelFinderCountdown();
      const modal = document.getElementById('mfFinderModal');
      if (!modal) return;
      modal.style.opacity = '0';
      modal.style.background = 'rgba(0,0,0,0)';
      modal.style.backdropFilter = 'blur(0px)';
      modal.style.webkitBackdropFilter = 'blur(0px)';
      const box = document.getElementById('mfFinderBox');
      if (box) box.style.transform = 'translateY(40px) scale(0.92)';
      setTimeout(() => {
        modal.style.pointerEvents = 'none';
        modal.style.display = 'none';
      }, 360);
    }

    function setFinderStatus(msg, icon = '') {
      const el = document.getElementById('mfFinderStatus');
      if (el) el.textContent = (icon ? icon + ' ' : '') + msg;
    }

    // Countdown redirect timer state
    let _finderCountdownTimer = null;

    function _cancelFinderCountdown() {
      if (_finderCountdownTimer) { clearInterval(_finderCountdownTimer); _finderCountdownTimer = null; }
    }

    function _startFinderCountdown(url, countdownEl, progressEl, secs) {
      _cancelFinderCountdown();
      let left = secs;
      countdownEl.textContent = left;
      if (progressEl) progressEl.style.width = '100%';
      _finderCountdownTimer = setInterval(() => {
        left--;
        countdownEl.textContent = left;
        if (progressEl) progressEl.style.width = ((left / secs) * 100) + '%';
        if (left <= 0) {
          _cancelFinderCountdown();
          closeFinderModal();
          // 🎬 Finder zná jen Bombuj/SvetSerialu URL — otevři v nové kartě (nemáme TMDB ID)
          window.open(url, '_blank', 'noopener');
        }
      }, 1000);
    }

    function showFinderResults(results, name, type) {
      const content = document.getElementById('mfFinderContent');
      if (!content) return;
      const spinner = document.getElementById('mfFinderSpinner');
      if (spinner) spinner.style.display = 'none';
      _cancelFinderCountdown();

      if (!results || results.length === 0) {
        content.innerHTML = `
          <div style="text-align:center;padding:8px 0;">
            <div style="font-size:2rem;margin-bottom:8px;">😕</div>
            <div style="font-size:0.82rem;font-weight:700;margin-bottom:4px;">Nic nenalezeno</div>
            <div style="font-size:0.65rem;color:rgba(255,255,255,0.38);margin-bottom:16px;">Zkus hledat ručně</div>
            <div style="display:flex;gap:8px;justify-content:center;">
              <button onclick="window.open('${type==='movie'?'https://www.bombuj.si/?s='+encodeURIComponent(name):'https://svetserialu.to/?s='+encodeURIComponent(name)}','_blank');closeFinderModal()" style="padding:10px 18px;border-radius:12px;background:#007AFF;border:none;color:#fff;font-size:0.75rem;font-weight:700;cursor:pointer;">Hledat ručně</button>
              <button onclick="closeFinderModal()" style="padding:10px 16px;border-radius:12px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);font-size:0.75rem;font-weight:600;cursor:pointer;">Zavřít</button>
            </div>
          </div>`;
        return;
      }

      // First non-fallback result = best match
      const best = results.find(r => !r._fallback);
      // Try to recover tmdbId from finder context
      const _finderTmdbId = window._mfFinderTmdbId || null;
      const _finderType   = window._mfFinderType   || type;

      let html = `<div style="width:100%;display:flex;flex-direction:column;gap:8px;">`;

      if (best) {
        const domain = (new URL(best.url)).hostname.replace('www.','');
        const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        // Cinema button: pouze pokud máme tmdbId
        const cinemaBtn = _finderTmdbId ? `
          <button onclick="_cancelFinderCountdown();closeFinderModal();openMovieInCinema('${_finderTmdbId}','${(name||'').replace(/'/g,"\\'")}','${_finderType}');" style="flex:1;padding:10px;border-radius:12px;background:linear-gradient(135deg,#007AFF,#5ac8fa);border:none;color:#fff;font-size:0.78rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
            🎬 Kino
          </button>` : '';
        const openBtn = `
          <button onclick="_cancelFinderCountdown();window.open('${best.url}','_blank','noopener');closeFinderModal();" style="flex:1;padding:10px;border-radius:12px;background:${_finderTmdbId ? 'rgba(255,255,255,0.09)' : '#007AFF'};border:${_finderTmdbId ? '1px solid rgba(255,255,255,0.12)' : 'none'};color:#fff;font-size:0.78rem;font-weight:${_finderTmdbId ? '500' : '700'};cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg> ${_finderTmdbId ? 'Bombuj / SvetSer.' : 'Přehrát teď'}
          </button>`;

        html += `
          <div id="mfFinderBestResult" style="
            border-radius:18px;
            background:linear-gradient(135deg,rgba(0,122,255,0.18) 0%,rgba(0,122,255,0.07) 100%);
            border:1.5px solid rgba(0,122,255,0.35);
            padding:18px 18px 14px;
            margin-bottom:2px;
            box-shadow:0 8px 32px rgba(0,122,255,0.12),inset 0 1px 0 rgba(0,122,255,0.2);
          ">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
              <img alt="" src="${favicon}" width="20" height="20" style="border-radius:5px;opacity:0.9;" onerror="this.style.display='none'">
              <div style="flex:1;min-width:0;">
                <div style="font-size:0.85rem;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${best.title || name}</div>
                <div style="font-size:0.58rem;color:rgba(0,180,255,0.7);margin-top:1px;">${domain}</div>
              </div>
              <span style="font-size:0.6rem;background:rgba(0,122,255,0.2);color:rgba(100,200,255,0.9);padding:3px 8px;border-radius:20px;font-weight:700;">Nejlepší shoda</span>
            </div>
            <div style="display:flex;gap:8px;">
              ${cinemaBtn}${openBtn}
            </div>
          </div>`;
      }

      // Rest of results (alternatives + fallbacks)
      const rest = results.filter(r => r !== best);
      if (rest.length) {
        html += `<div style="font-size:0.58rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.25);padding:4px 2px 2px;">Další zdroje</div>`;
        rest.forEach((r) => {
          const domain = r.url ? (new URL(r.url)).hostname.replace('www.','') : '';
          const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=24`;
          html += `
            <button onclick="_cancelFinderCountdown();window.open('${r.url}','_blank','noopener');closeFinderModal()" style="
              display:flex;align-items:center;gap:12px;padding:11px 14px;
              background:rgba(255,255,255,0.04);
              border:1px solid rgba(255,255,255,0.08);
              border-radius:12px;cursor:pointer;text-align:left;width:100%;
              transition:all 0.2s ease;
            " onmouseover="this.style.background='rgba(255,255,255,0.08)';this.style.borderColor='rgba(255,255,255,0.14)'" onmouseout="this.style.background='rgba(255,255,255,0.04)';this.style.borderColor='rgba(255,255,255,0.08)'">
              <img alt="" src="${favicon}" width="18" height="18" style="border-radius:4px;opacity:0.7;flex-shrink:0;" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\'><text y=\\'18\\' font-size=\\'16\\'>🔗</text></svg>'">
              <div style="flex:1;min-width:0;">
                <div style="font-size:0.75rem;font-weight:600;color:rgba(255,255,255,0.75);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.title || name}</div>
                <div style="font-size:0.55rem;color:rgba(255,255,255,0.3);margin-top:1px;">${domain}</div>
              </div>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>`;
        });
      }
      html += `</div>`;
      content.innerHTML = html;
      // Žádný auto-countdown redirect — uživatel volí sám
    }

    // Fallback — přímé přesměrování na search stránku
    window.mfFinderFallback = function() {
      const name = window._mfFinderName || '';
      const type = window._mfFinderType || 'tv';
      const searchUrl = type === 'movie'
        ? `https://www.bombuj.si/?s=${encodeURIComponent(name)}`
        : `https://svetserialu.to/?s=${encodeURIComponent(name)}`;
      window.open(searchUrl, '_blank', 'noopener');
      closeFinderModal();
    };

    // ═══════════════════════════════════════════════════════════
    // 🔍 MUJFLIX FINDER ENGINE v5 — Multi-engine, vždy najde
    // Gemini 2.0 Flash (FREE) + Groq + Anthropic + Tavily + Pattern
    // ═══════════════════════════════════════════════════════════

    const _MF_GEM_KEY = 'AIzaSyBxVkJvftZlFDQljWeA8vKGTpjG7NDjYHo';
    const _MF_JINA_KEY = 'jina_e5ab8b0764074c1a92a1e2fa256fb717aNrsW0AMS5AhZUy6OMtcYS6M7DKd';

    function getGeminiKey() {
      if (_MF_GEM_KEY && !_MF_GEM_KEY.includes('__VLOZ')) return _MF_GEM_KEY;
      return localStorage.getItem('mf_gemini_key') || '';
    }
    function getAnthropicKey() { return localStorage.getItem('mf_anthropic_key') || ''; }
    function setAnthropicKey(k) { localStorage.setItem('mf_anthropic_key', k); }
    function getGroqKey()    { return localStorage.getItem('mf_groq_key') || ''; }
    function getJinaKey()    {
      if (_MF_JINA_KEY) return _MF_JINA_KEY;
      return localStorage.getItem('mf_jina_key') || '';
    }
    function getTavilyKey()  { return localStorage.getItem('mf_tavily_key') || ''; }

    // ── Validní domény ─────────────────────────────────────────
    const _VALID_DOMAINS = ['bombuj.si','svetserialu.to','prehraj.to','webshare.cz','sledujtefilmy.cz'];

    function _isValidStreamUrl(url) {
      if (!url || typeof url !== 'string') return false;
      try {
        const u = new URL(url);
        if (!['http:','https:'].includes(u.protocol)) return false;
        const host = u.hostname.replace('www.','');
        if (u.pathname === '/' || u.pathname === '') return false;
        if (/[?&](s|q|search)=/.test(u.search)) return false;
        if (/\/(search|hledej|results|index\.php)/.test(u.pathname)) return false;
        return _VALID_DOMAINS.some(d => host.endsWith(d));
      } catch { return false; }
    }

    // ── JSON parser + URL extrakce ─────────────────────────────
    function _parseFinderJson(rawText) {
      if (!rawText) return null;
      try {
        const clean = rawText.replace(/```json|```/gi,'').trim();
        const p = JSON.parse(clean);
        if (p?.results) return p;
      } catch {}
      const jsonMatch = rawText.match(/\{[\s\S]*?"results"[\s\S]*?\}/);
      if (jsonMatch) { try { return JSON.parse(jsonMatch[0]); } catch {} }
      // Záchrana — URL přímo z textu
      const urls = [...rawText.matchAll(/https?:\/\/(?:www\.)?(?:bombuj\.si|svetserialu\.to|prehraj\.to)[^\s"',<>\)\]]+/g)]
        .map(m => m[0].replace(/[.,;:!?]+$/, ''))
        .filter(_isValidStreamUrl);
      if (urls.length) return { results: urls.map(u => ({
        url: u,
        title: u.split('/').filter(Boolean).pop()?.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) || '',
        site: new URL(u).hostname.replace('www.','')
      }))};
      return null;
    }

    // ── Slugifikace ────────────────────────────────────────────
    function _slugify(str) {
      const map = {á:'a',č:'c',ď:'d',é:'e',ě:'e',í:'i',ň:'n',ó:'o',ř:'r',š:'s',ť:'t',ú:'u',ů:'u',ý:'y',ž:'z',
                   Á:'a',Č:'c',Ď:'d',É:'e',Ě:'e',Í:'i',Ň:'n',Ó:'o',Ř:'r',Š:'s',Ť:'t',Ú:'u',Ů:'u',Ý:'y',Ž:'z'};
      return str.split('').map(c=>map[c]||c).join('')
        .toLowerCase()
        .replace(/&/g,'and')
        .replace(/'/g,'').replace(/:/g,'').replace(/\.+/g,'')
        .replace(/[^a-z0-9\s-]/g,'').trim()
        .replace(/\s+/g,'-').replace(/-+/g,'-')
        .replace(/^-+|-+$/g,'');
    }

    // ── Slug varianty pro svetserialu.to ──────────────────────
    function _svetSlugVariants(slug, title) {
      const base = slug || _slugify(title || '');
      const v = [base];
      if (base.startsWith('the-')) v.push(base.slice(4));
      else if (title && title.toLowerCase().startsWith('the ')) v.push('the-' + base);
      v.push(base.replace(/-\d{4}$/, ''));
      // Varianta s pomlčkou místo dvojtečky (někdy v titulu)
      const noColon = base.replace(/-+/g,'-');
      if (noColon !== base) v.push(noColon);
      return [...new Set(v)].filter(Boolean);
    }

    // ── Pattern builder ────────────────────────────────────────
    function _buildCandidateUrls(name, type, year) {
      const slug = _slugify(name);
      // Pokud je slug prázdný (non-latinský název), vrať search URL
      if (!slug) return type === 'movie'
        ? [{ url:`https://www.bombuj.si/?s=${encodeURIComponent(name||'')}`, site:'bombuj.si' },
           { url:`https://svetserialu.to/?s=${encodeURIComponent(name||'')}`, site:'svetserialu.to' }]
        : [{ url:`https://svetserialu.to/?s=${encodeURIComponent(name||'')}`, site:'svetserialu.to' },
           { url:`https://serialy.bombuj.si/?s=${encodeURIComponent(name||'')}`, site:'bombuj.si' }];
      const yr = year || new Date().getFullYear();
      const slugNoThe  = slug.startsWith('the-') ? slug.slice(4) : slug;
      const slugNoYear = slug.replace(/-\d{4}$/, '');
      const slugWithThe = !slug.startsWith('the-') ? 'the-' + slug : slug;

      return type === 'movie' ? [
        { url:`https://www.bombuj.si/online-film-${slug}`,            site:'bombuj.si' },
        { url:`https://www.bombuj.si/online-film-${slug}-${yr}`,      site:'bombuj.si' },
        { url:`https://www.bombuj.si/online-film-${slug}-${yr-1}`,    site:'bombuj.si' },
        { url:`https://www.bombuj.si/online-film-${slug}-${yr-2}`,    site:'bombuj.si' },
        { url:`https://www.bombuj.si/online-film-${slugNoYear}`,      site:'bombuj.si' },
        { url:`https://svetserialu.to/film/${slug}`,                  site:'svetserialu.to' },
        { url:`https://svetserialu.to/film/${slugNoYear}`,            site:'svetserialu.to' },
        { url:`https://prehraj.to/${slug}`,                           site:'prehraj.to' },
        { url:`https://prehraj.to/film/${slug}`,                      site:'prehraj.to' },
      ] : [
        { url:`https://svetserialu.to/serial/${slug}`,                site:'svetserialu.to' },
        { url:`https://svetserialu.to/serial/${slug}/s01e01`,         site:'svetserialu.to' },
        { url:`https://svetserialu.to/serial/${slugNoThe}`,           site:'svetserialu.to' },
        { url:`https://svetserialu.to/serial/${slugNoThe}/s01e01`,    site:'svetserialu.to' },
        { url:`https://svetserialu.to/serial/${slugNoYear}`,          site:'svetserialu.to' },
        { url:`https://svetserialu.to/serial/${slugWithThe}`,         site:'svetserialu.to' },
        { url:`https://serialy.bombuj.si/serial/${slug}`,             site:'bombuj.si' },
        { url:`https://serialy.bombuj.si/serial/${slug}-1x1`,         site:'bombuj.si' },
        { url:`https://serialy.bombuj.si/serial/${slugNoThe}`,        site:'bombuj.si' },
        { url:`https://prehraj.to/serial/${slug}`,                    site:'prehraj.to' },
      ];
    }

    // ── Jina Reader — ověření URL existence ─────────────────
    async function _jinaFetch(url) {
      const key = getJinaKey();
      if (!key) return null;
      try {
        const res = await fetch(`https://r.jina.ai/${url}`, {
          method: 'GET',
          headers: { 'Authorization': 'Bearer ' + key, 'Accept': 'application/json', 'X-Return-Format': 'text' },
          signal: AbortSignal.timeout(6000)
        });
        if (!res.ok) return null;
        return await res.text();
      } catch { return null; }
    }

    // Ověří URL přes Jina — vrátí kanonickou URL nebo null
    async function _jinaVerify(url) {
      const text = await _jinaFetch(url);
      if (!text) return null;
      // 404 / not found detekce
      if (/\b(404|page.{0,25}not.{0,10}found|stránka nebyla nalezena|nenalezena|nebyl nalezen)\b/i.test(text.slice(0, 800))) return null;
      // Extrahuj kanonickou URL pokud je přesměrování
      const m = text.match(/https?:\/\/(?:www\.)?(?:bombuj\.si|svetserialu\.to|prehraj\.to)[^\s"',<>]{3,}/);
      return m ? m[0].replace(/[.,;]+$/, '') : url;
    }

    // Paralelní ověření sady URL — vrátí první platnou
    async function _jinaVerifyBatch(candidates) {
      return new Promise(resolve => {
        let done = false, pending = candidates.length;
        if (!pending) { resolve(null); return; }
        candidates.forEach(async c => {
          try {
            const v = await _jinaVerify(c.url);
            if (v && !done) { done = true; resolve({ url: v, site: c.site }); }
          } catch {}
          pending--;
          if (pending === 0 && !done) resolve(null);
        });
      });
    }

    // ── Pattern matching ──────────────────────────────────────
    async function _finderPatternBuild(name, type, year) {
      setFinderStatus('⚡ Pattern matching…');
      const candidates = _buildCandidateUrls(name, type, year);
      const jinaKey = getJinaKey();

      if (jinaKey) {
        // Rozděl kandidáty do skupin a testuj skupiny paralelně
        // Skupina A: nejpravděpodobnější (top 3), Skupina B: zbytek
        const groupA = candidates.slice(0, 3);
        const groupB = candidates.slice(3);

        const hitA = await _jinaVerifyBatch(groupA);
        if (hitA) return { results: [{ title: name, url: hitA.url, site: hitA.site }] };

        const hitB = await _jinaVerifyBatch(groupB);
        if (hitB) return { results: [{ title: name, url: hitB.url, site: hitB.site }] };

        return null;
      } else {
        // Bez Jina: HEAD no-cors, bere první opaque
        const settled = await Promise.allSettled(
          candidates.slice(0, 5).map(c =>
            fetch(c.url, { method: 'HEAD', signal: AbortSignal.timeout(3000), mode: 'no-cors' })
              .then(r => r.type === 'opaque' ? c : null).catch(() => null)
          )
        );
        const hit = settled.find(r => r.status === 'fulfilled' && r.value)?.value;
        return hit ? { results: [{ title: name, url: hit.url, site: hit.site }] } : null;
      }
    }

    // ── Gemini s Google Search ────────────────────────────────
    async function _finderGemini(name, type, year, attempt = 1) {
      const key = getGeminiKey(); if (!key || key.includes('__VLOZ')) return null;
      const primary = type === 'movie' ? 'bombuj.si' : 'svetserialu.to';
      const yr = year ? ` ${year}` : '';

      const queries = [
        `"${name}"${yr} site:${primary} ${type === 'movie' ? 'online-film' : 'serial'}`,
        `${name}${yr} ${type === 'movie' ? 'film online' : 'seriál sledovat'} site:${primary} OR site:prehraj.to`,
        `${name}${yr} ${primary} ${type === 'movie' ? 'film 2023 2024 2025' : 'serial epizoda'} -/?s=`,
      ];
      const query = queries[Math.min(attempt - 1, queries.length - 1)];
      setFinderStatus(`✦ Gemini hledá${attempt > 1 ? ` (pokus ${attempt})` : ''}…`);

      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tools: [{ google_search: {} }],
              system_instruction: {
                parts: [{
                  text: `Jsi expert na české a slovenské streamovací weby.
URL VZORY (přesně dodržuj):
- bombuj.si FILMY: https://www.bombuj.si/online-film-SLUG nebo s rokem /online-film-SLUG-YYYY
  Příklady: /online-film-kung-fu-panda, /online-film-kung-fu-panda-4-2024, /online-film-spasitel, /online-film-deadpool-wolverine-2024
- bombuj.si SERIÁLY: https://serialy.bombuj.si/serial/SLUG-SxEE
  Příklady: /serial/the-simpsons-1x1, /serial/family-guy-2x3
- svetserialu.to SERIÁLY: https://svetserialu.to/serial/SLUG
  Příklady: /serial/chainsaw-man, /serial/the-simpsons, /serial/simpsons (bez "the-"), /serial/miraculous-tales-of-ladybug-and-cat-noir
- prehraj.to: záloha
SLUG pravidla: diakritika pryč, mezery→pomlčky, spec. znaky pryč.
ZÁSADNÍ: URL musí vést PŘÍMO na stránku titulu — NE /?s= ani /search.
Odpovídej POUZE JSON bez markdown.`
                }]
              },
              contents: [{
                role: 'user', parts: [{
                  text: `Najdi přímý URL na ${type === 'movie' ? 'FILM' : 'SERIÁL'}: "${name}"
Proveď Google search: ${query}
Vyber URL která PŘÍMO vede na stránku titulu (ne vyhledávání).
Vrať POUZE: {"results":[{"title":"přesný název","url":"https://plná-url","site":"doména.tld"}]}`
                }]
              }]
            })
          }
        );

        if (!res.ok) {
          if (res.status === 429 && attempt < 2) { await new Promise(r => setTimeout(r, 3000)); return _finderGemini(name, type, year, attempt + 1); }
          return null;
        }

        const d = await res.json();
        const txt = (d?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
        if (!txt) return null;

        const parsed = _parseFinderJson(txt);
        if (!parsed?.results?.length) {
          if (attempt < 3) { await new Promise(r => setTimeout(r, 500)); return _finderGemini(name, type, year, attempt + 1); }
          return null;
        }

        // Filtruj + ověř přes Jina pokud máme klíč
        let valid = parsed.results.filter(r => _isValidStreamUrl(r.url))
          .map(r => ({ ...r, site: new URL(r.url).hostname.replace('www.', '') }));

        if (valid.length && getJinaKey()) {
          const verified = await _jinaVerifyBatch(valid.map(r => ({ url: r.url, site: r.site })));
          if (verified) {
            const orig = valid.find(r => r.site === verified.site) || valid[0];
            valid = [{ ...orig, url: verified.url }];
          } else {
            valid = []; // Gemini vrátil URL ale Jina ji nenašla — zamít
          }
        }

        return valid.length ? { results: valid } : null;
      } catch (e) {
        if (attempt < 2) return _finderGemini(name, type, year, attempt + 1);
        return null;
      }
    }

    // ── Groq — generuje slug varianty + ověří ────────────────
    async function _finderGroqSlug(name, type, year) {
      const key = getGroqKey(); if (!key) return null;
      const yr = year ? ` (prefer year ${year})` : '';
      setFinderStatus('⚡ Groq slug…');
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant', max_tokens: 200, temperature: 0,
            messages: [{
              role: 'user', content:
                `Generate ALL likely URL paths for "${name}"${yr} on ${type === 'movie'
                  ? `bombuj.si. Format: /online-film-slug or /online-film-slug-YYYY (include year if known: ${year || 'unknown'}). Examples: /online-film-kung-fu-panda, /online-film-kung-fu-panda-4-2024, /online-film-deadpool-wolverine-2024, /online-film-spasitel${year ? `, /online-film-spasitel-${year}` : ''}. For recent movies (2020+) include year variant too.`
                  : 'svetserialu.to. Format: /serial/slug. Examples: /serial/chainsaw-man, /serial/the-simpsons, /serial/simpsons (sometimes without "the-"), /serial/miraculous-tales-of-ladybug-and-cat-noir, /serial/family-guy.'
                }.
Diacritics: á→a č→c ď→d é→e ě→e í→i ň→n ó→o ř→r š→s ť→t ú/ů→u ý→y ž→z. Remove apostrophes, colons, dots.
Reply ONLY as JSON array of paths, most likely first. Max 5 paths. Example: ["/online-film-inception","/online-film-inception-2010"]`
            }]
          })
        });
        if (!res.ok) return null;
        const d = await res.json();
        let raw = (d?.choices?.[0]?.message?.content || '').trim();
        let paths = [];
        try {
          const arr = JSON.parse(raw.replace(/```json|```/gi, '').trim());
          if (Array.isArray(arr)) paths = arr.filter(p => typeof p === 'string' && p.startsWith('/'));
        } catch {
          paths = [...raw.matchAll(/\/[a-z0-9][a-z0-9/-]*/g)].map(m => m[0]).filter(p => p.length > 3);
        }
        if (!paths.length) return null;

        const base = type === 'movie' ? 'https://www.bombuj.si' : 'https://svetserialu.to';
        const site = type === 'movie' ? 'bombuj.si' : 'svetserialu.to';
        const candidates = paths.slice(0, 5).filter(p => _isValidStreamUrl(base + p)).map(p => ({ url: base + p, site }));

        if (getJinaKey()) {
          const hit = await _jinaVerifyBatch(candidates);
          if (hit) return { results: [{ title: name, url: hit.url, site: hit.site, _groqGenerated: true }] };
          return null;
        }
        // Bez Jina vrať první kandidát
        return candidates.length ? { results: [{ title: name, url: candidates[0].url, site: candidates[0].site, _groqGenerated: true }] } : null;
      } catch { return null; }
    }

    // ── Anthropic Claude s web search ────────────────────────
    async function _finderAnthropic(name, type, year) {
      const key = getAnthropicKey(); if (!key) return null;
      const primary = type === 'movie' ? 'bombuj.si' : 'svetserialu.to';
      const yr = year ? ` (rok: ${year})` : '';
      setFinderStatus('🤖 Claude AI hledá…');
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-beta': 'web-search-2025-03-05' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001', max_tokens: 600,
            tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }],
            system: `Expert na české streamovací weby. Vrať POUZE JSON bez markdown.
URL vzory:
- bombuj.si filmy: /online-film-SLUG nebo /online-film-SLUG-YYYY (př: /online-film-kung-fu-panda, /online-film-deadpool-wolverine-2024)
- bombuj.si seriály: serialy.bombuj.si/serial/SLUG-SxEE (př: /serial/the-simpsons-1x1)
- svetserialu.to seriály: /serial/SLUG (př: /serial/the-simpsons, /serial/chainsaw-man; někdy bez "the-")
URL nesmí obsahovat /?s= ani /search. Pokud nenajdeš na primárním webu, zkus prehraj.to.`,
            messages: [{
              role: 'user', content:
                `Najdi přímý odkaz na ${type === 'movie' ? 'film' : 'seriál'} "${name}"${yr} na ${primary} nebo prehraj.to.
Prohledej web a vrať POUZE: {"results":[{"title":"...","url":"https://...","site":"..."}]}`
            }]
          })
        });
        if (!res.ok) return null;
        const d = await res.json();
        const txt = (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
        const parsed = _parseFinderJson(txt);
        if (parsed?.results) parsed.results = parsed.results.filter(r => _isValidStreamUrl(r.url));
        return parsed?.results?.length ? parsed : null;
      } catch { return null; }
    }

    // ── Tavily přímé vyhledávání ──────────────────────────────
    async function _finderTavily(name, type, year) {
      const key = getTavilyKey(); if (!key) return null;
      const site = type === 'movie' ? 'bombuj.si' : 'svetserialu.to';
      const yr = year ? ` ${year}` : '';
      setFinderStatus('🌐 Tavily search…');
      try {
        const res = await fetch('https://api.tavily.com/search', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: key, max_results: 6,
            query: `"${name}"${yr} ${type === 'movie' ? 'film online' : 'seriál online'} ${site}`,
            include_domains: [site, 'prehraj.to', 'serialy.bombuj.si']
          })
        });
        if (!res.ok) return null;
        const d = await res.json();
        const hits = (d?.results || [])
          .map(r => ({ title: r.title || name, url: r.url, site: new URL(r.url).hostname.replace('www.', '') }))
          .filter(r => _isValidStreamUrl(r.url));
        return hits.length ? { results: hits } : null;
      } catch { return null; }
    }

    // ── Cache pro výsledky finderu ────────────────────────────
    const _finderCache = {};
    function _finderCacheKey(name, type) { return `${type}::${name.toLowerCase().trim()}`; }
    function _finderCacheGet(name, type) {
      const k = _finderCacheKey(name, type);
      const e = _finderCache[k];
      if (!e) return null;
      if (Date.now() - e.ts > 30 * 60 * 1000) { delete _finderCache[k]; return null; } // 30 min TTL
      return e.results;
    }
    function _finderCacheSet(name, type, results) {
      _finderCache[_finderCacheKey(name, type)] = { results, ts: Date.now() };
    }

    // ── HLAVNÍ ORCHESTRÁTOR v6 ────────────────────────────────
    // Strategie: Gemini (s Jina verify) RACE Pattern, pak zálohy
    async function runFinder(name, type, year) {
      const primary = type === 'movie' ? 'bombuj.si' : 'svetserialu.to';
      setFinderStatus('🔍 Hledám…');

      // Cache hit?
      const cached = _finderCacheGet(name, type);
      if (cached) {
        showFinderResults(cached, name, type);
        document.getElementById('mfFinderSub').textContent = '✅ Z cache';
        return;
      }

      let results = [], usedEngine = '';

      // ── Krok 1: Race — Gemini vs Pattern (paralelně, bere prvního vítěze) ──
      // Gemini má timeout 12s, Pattern může být rychlejší s Jina
      const raceResult = await Promise.race([
        _finderGemini(name, type, year).then(r => r?.results?.length ? { r, engine: '✦ Gemini' } : null),
        _finderPatternBuild(name, type, year).then(r => r?.results?.length ? { r, engine: '⚡ Pattern' } : null),
        new Promise(res => setTimeout(() => res(null), 13000)) // celkový timeout kola 1
      ]);

      if (raceResult?.r?.results?.length) {
        results = raceResult.r.results;
        usedEngine = raceResult.engine;
      }

      // ── Krok 2: Groq slug generátor ───────────────────────────
      if (!results.length && getGroqKey()) {
        const r = await _finderGroqSlug(name, type, year);
        if (r?.results?.length) { results = r.results; usedEngine = '⚡ Groq'; }
      }

      // ── Krok 3: Anthropic Claude (nejpřesnější, ale pomalý) ───
      if (!results.length && getAnthropicKey()) {
        const r = await _finderAnthropic(name, type, year);
        if (r?.results?.length) { results = r.results; usedEngine = '🤖 Claude'; }
      }

      // ── Krok 4: Tavily ────────────────────────────────────────
      if (!results.length && getTavilyKey()) {
        const r = await _finderTavily(name, type, year);
        if (r?.results?.length) { results = r.results; usedEngine = '🌐 Tavily'; }
      }

      // ── Krok 5: Gemini retry s odlišným query ────────────────
      if (!results.length) {
        const r = await _finderGemini(name, type, year, 2);
        if (r?.results?.length) { results = r.results; usedEngine = '✦ Gemini #2'; }
      }

      // ── Krok 6: Pattern bez Jina verify jako poslední záchrana ─
      if (!results.length) {
        const candidates = _buildCandidateUrls(name, type, year);
        const first = candidates[0];
        if (first) { results = [{ title: name, url: first.url, site: first.site, _unverified: true }]; usedEngine = '⚡ Odhad'; }
      }

      // Cache výsledky (jen pokud jsou ověřené)
      if (results.length && !results[0]._unverified) _finderCacheSet(name, type, results);

      const fallbacks = [
        { title: `🔎 Hledat "${name}" na ${primary}`, url: type === 'movie' ? `https://www.bombuj.si/?s=${encodeURIComponent(name)}` : `https://svetserialu.to/?s=${encodeURIComponent(name)}`, site: primary, _fallback: true },
        { title: `🔎 Hledat na prehraj.to`, url: `https://prehraj.to/hledej/${encodeURIComponent(name)}`, site: 'prehraj.to', _fallback: true },
      ];

      showFinderResults([...results, ...fallbacks], name, type);
      const sub = document.getElementById('mfFinderSub');
      if (sub) sub.textContent = results.length ? `✅ Nalezeno — ${usedEngine}` : '🔗 Zkus hledat ručně níže';
    }

    async function verifyAndOpen(name, type, year) {
      showFinderModal(name, type, year);
      await runFinder(name, type, year);
    }

    function _fallbackCopy(name, type) {
      showFinderModal(name, type);
      showFinderResults([
        { title:`Hledat "${name}" na ${type==='movie'?'bombuj.si':'svetserialu.to'}`, url:type==='movie'?`https://www.bombuj.si/?s=${encodeURIComponent(name)}`:`https://svetserialu.to/?s=${encodeURIComponent(name)}`, site:type==='movie'?'bombuj.si':'svetserialu.to' },
        { title:`Hledat na prehraj.to`, url:`https://prehraj.to/hledej/${encodeURIComponent(name)}`, site:'prehraj.to' },
      ], name, type);
      const sub = document.getElementById('mfFinderSub');
      if (sub) sub.textContent = 'Přímé vyhledávání (bez AI)';

    }

    // CSS injekt pro spinner animaci
    (function() {
      const s = document.createElement('style');
      s.textContent = `
        @keyframes mfFinderSpin { to { transform: rotate(360deg); } }
        #mfFinderModal button:active { transform: scale(0.96) !important; transition-duration: 0.08s !important; }
      `;
      document.head.appendChild(s);
    })();
    

    async function openWithCopy(name, type, year) {
      // Vymaž tmdbId pokud jsme přišli přes Finder (ne Cinema choice)
      window._mfFinderTmdbId = window._mfFinderTmdbId || null;
      // Pro japonské/čínské/korejské názvy zkusíme nejdřív EN název
      let resolvedName = name;
      if (_isNonLatin(name)) {
        showToast('🔍 Hledám anglický název…');
        resolvedName = await _getEnglishTitle(name, type);
        if (resolvedName !== name) showToast(`🌐 Přeloženo: "${resolvedName}"`);
      }
      if(getGeminiKey()||getAnthropicKey()||getGroqKey()||getTavilyKey()||getJinaKey()){verifyAndOpen(resolvedName,type,year);return;}
      _fallbackCopy(resolvedName,type);
    }

    // ═══════════════════════════════════════════════════════
    // KEYBOARD NAVIGATION
    // ═══════════════════════════════════════════════════════
    const menuWrappers = () => Array.from(document.querySelectorAll('#mainMenu .ps-tile-wrapper'));
    function setKbMenuFocus(idx) {
      const wrappers = menuWrappers(); if (!wrappers.length) return;
      // Remove trailer from old focus
      const old = wrappers[kbMenuIndex]; if (old) { clearTimeout(old._trailerTimer); removeTileTrailer(old); }
      wrappers.forEach(w => w.classList.remove('kb-focus'));
      kbMenuIndex = Math.max(0, Math.min(idx, wrappers.length - 1));
      const w = wrappers[kbMenuIndex]; if (!w) return;
      w.classList.add('kb-focus');
      w.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      const slug = w.dataset.slug;
      if (slug && slug !== '__search__') setAdaptiveColor(slug);

      // Netflix delay for keyboard: 1.4s (1400ms)
      if (slug && slug !== '__search__' && slug !== '__foryou__') {
        const hasTmdb = db[slug]?.tmdbId;
        const hasHardcoded = HARDCODED_TRAILERS[slug];
        if (hasTmdb && typeof preFetchTrailer === 'function') preFetchTrailer(slug);
        if (hasTmdb || hasHardcoded) {
          w._trailerTimer = setTimeout(() => {
            if (w.classList.contains('kb-focus')) loadTileTrailer(w, hasTmdb || null, 'tv', slug);
          }, 1400);
        }
      }
    }
    function setKbEpFocus(idx) {
      const cards = Array.from(document.querySelectorAll('#episodesGrid .episode-card'));
      if (!cards.length) return; cards.forEach(c => c.classList.remove('kb-focus'));
      kbEpIndex = Math.max(0, Math.min(idx, cards.length - 1)); cards[kbEpIndex]?.classList.add('kb-focus');
      cards[kbEpIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    document.addEventListener('keydown', e => {
      // Don't hijack if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'Escape') {
        // Close finder modal first if open
        const finderModal = document.getElementById('mfFinderModal');
        if (finderModal && finderModal.style.pointerEvents !== 'none' && finderModal.style.display !== 'none') { closeFinderModal(); return; }
        if (aiPanelOpen) { closeAiPanel(); return; }
        if (modalOpen) { closeModal(); return; }
        if (document.getElementById('watchlistOverlay').classList.contains('open')) { closeWatchlist(); return; }
        if (document.getElementById('wrappedOverlay').classList.contains('open')) { closeWrapped(); return; }
        if (document.getElementById('universeOverlay').classList.contains('open')) { closeSearch(); return; }
        if (document.getElementById('adminOverlay').classList.contains('open')) { closeAdmin(); return; }
        if (document.getElementById('customizeOverlay').classList.contains('open')) { closeCustomize(); return; }
        if (document.getElementById('collectionsOverlay').classList.contains('open')) { closeCollections(); return; }
        if (document.getElementById('editOverlay')?.classList.contains('open')) { closeEditMode(); return; }
        if (document.getElementById('ratingOverlay')?.classList.contains('open')) { closeRating(); return; }
        if (document.getElementById('syncOverlay')?.classList.contains('open')) { closeSyncOverlay(); return; }
        if (document.getElementById('traktOverlay')?.classList.contains('open')) { closeTraktOverlay(); return; }
        if (document.getElementById('voiceModeOverlay')?.classList.contains('open')) { closeVoiceMode(); return; }
        if (document.getElementById('genreEditorOverlay')?.classList.contains('open')) { closeGenreEditor(); return; }
        return;
      }
      if (e.key === 'a' || e.key === 'A') { if (!modalOpen && !aiPanelOpen) { e.preventDefault(); toggleAiPanel(); return; } }
      if (e.key === '/' || e.key === '.') { if (!modalOpen && !aiPanelOpen) { e.preventDefault(); openSearch(); return; } }
      if (kbLayer === 'menu' && !modalOpen && !aiPanelOpen) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); setKbMenuFocus(kbMenuIndex - 1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); setKbMenuFocus(kbMenuIndex + 1); }
        else if (e.key === 'Enter') { const wrappers = menuWrappers(); const w = wrappers[kbMenuIndex]; if (w) { const slug = w.dataset.slug; if (slug === '__search__') openSearch(); else if (slug === '__foryou__') openForYouSeries(); else openSeries(slug); } }
        return;
      }
      if (kbLayer === 'modal-season' && modalOpen) {
        const seasons = totalSeasons(activeSeries);
        if (e.key === 'ArrowLeft') { e.preventDefault(); if (kbSeasonIndex > 0) { kbSeasonIndex--; activeSeason = kbSeasonIndex + 1; renderSeasons(); renderEpisodes(); } }
        else if (e.key === 'ArrowRight') { e.preventDefault(); if (kbSeasonIndex < seasons - 1) { kbSeasonIndex++; activeSeason = kbSeasonIndex + 1; renderSeasons(); renderEpisodes(); } }
        else if (e.key === 'ArrowDown') { e.preventDefault(); kbLayer = 'modal-ep'; kbEpIndex = 0; setKbEpFocus(0); }
        else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); shuffleEpisode(); }
        else if (e.key === 'n' || e.key === 'N') { e.preventDefault(); jumpToNext(); }
        return;
      }
      if (kbLayer === 'modal-ep' && modalOpen) {
        const cards = Array.from(document.querySelectorAll('#episodesGrid .episode-card'));
        if (e.key === 'ArrowDown') { e.preventDefault(); setKbEpFocus(kbEpIndex + 1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); if (kbEpIndex <= 0) { kbLayer = 'modal-season'; cards.forEach(c => c.classList.remove('kb-focus')); return; } setKbEpFocus(kbEpIndex - 1); }
        else if (e.key === 'Enter') { e.preventDefault(); const card = cards[kbEpIndex]; if (card) card.querySelector('.ep-btn-play')?.click(); }
        else if (e.key === 'm' || e.key === 'M') { e.preventDefault(); const card = cards[kbEpIndex]; if (card) card.querySelector('.ep-btn-mark')?.click(); }
        return;
      }
      if (kbLayer === 'search') {
        if (e.key === 'ArrowLeft') { e.preventDefault(); kbSearchIndex = 0; updateSearchFocus(); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); kbSearchIndex = 1; updateSearchFocus(); }
        else if (e.key === 'Enter') { e.preventDefault(); openSearchPlatform(kbSearchIndex === 0 ? 'movies' : 'series'); }
        return;
      }
    });


    // ═══════════════════════════════════════════════════════
    // 3D TILT for keyboard focus (same physics as mouse hover)
    // ═══════════════════════════════════════════════════════
    function applyKbTilt(wrapper) {
      if (!wrapper) return;
      const tile = wrapper.querySelector('.ps-tile'); const glare = wrapper.querySelector('.tile-glare'); const bg = wrapper.querySelector('.tile-bg');
      const logo = wrapper.querySelector('.tile-logo');
      if (!tile) return;
      // Smooth animated tilt - same feel as mouse
      tile.style.transition = 'transform 0.4s cubic-bezier(0.34,1.2,0.64,1),box-shadow 0.4s ease,filter 0.4s ease';
      tile.style.transform = 'perspective(900px) rotateX(-4deg) rotateY(0deg) scale(1.06) translateY(-10px)';
      tile.style.filter = 'brightness(1.1) saturate(1.2)';
      tile.style.boxShadow = '0 0 0 2.5px var(--accent),0 32px 64px rgba(0,0,0,0.85),0 0 40px rgba(0,122,255,0.18)';
      if (glare) {
        glare.style.transition = 'opacity 0.4s ease';
        glare.style.opacity = '1';
        glare.style.background = 'radial-gradient(ellipse 80% 60% at 50% 25%,rgba(255,255,255,0.13) 0%,transparent 65%)';
      }
      if (bg) {
        bg.style.transition = 'transform 0.4s cubic-bezier(0.25,0.8,0.25,1)';
        bg.style.transform = 'scale(1.06)';
      }
      if (logo) {
        logo.style.transition = 'transform 0.35s cubic-bezier(0.34,1.2,0.64,1)';
        logo.style.transform = 'translateX(-50%) scale(1.05) translateY(-3px)';
      }
    }
    function clearKbTilt(wrapper) {
      if (!wrapper) return;
      const tile = wrapper.querySelector('.ps-tile'); const glare = wrapper.querySelector('.tile-glare'); const bg = wrapper.querySelector('.tile-bg');
      const logo = wrapper.querySelector('.tile-logo');
      if (!wrapper.matches(':hover')) {
        if (tile) { tile.style.transform = ''; tile.style.filter = ''; tile.style.boxShadow = ''; }
        if (glare) glare.style.opacity = '';
        if (bg) bg.style.transform = '';
        if (logo) logo.style.transform = '';
      }
    }
    // Patch removed — trailer + tilt handled directly in setKbMenuFocus above

    // ── AI DISCO RECOMMENDATIONS ─────────────────────────────
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { const d = document.getElementById('universeOverlay'); if (d?.classList.contains('open')) { closeDiscover(); return; } const ss = document.getElementById('screensaver'); if (ss?.classList.contains('open')) { hideScreensaver(); return; } }
      if (document.getElementById('screensaver')?.classList.contains('open')) hideScreensaver();
      // Arrow down = open discover (when on main menu, no modal open)
      if (e.key === 'ArrowDown') {
        const discoverOpen = document.getElementById('universeOverlay').classList.contains('open');
        const modalOpen2 = document.getElementById('seriesModal').classList.contains('open');
        const aiOpen = document.getElementById('aiFullscreen')?.classList.contains('open');
        if (!discoverOpen && !modalOpen2 && !aiOpen && kbLayer === 'menu') { e.preventDefault(); openDiscover(); return; }
      }
      // Arrow up = close discover (when discover is open and body scrolled to top)
      if (e.key === 'ArrowUp') {
        const discoverOpen = document.getElementById('universeOverlay').classList.contains('open');
        if (discoverOpen) { e.preventDefault(); closeDiscover(); return; }
      }
    }, { capture: true });

    // ═══════════════════════════════════════════════════════
    // SCREEN SAVER
    // ═══════════════════════════════════════════════════════
    let _ssTimer = null, _ssActive = false, _ssImgIdx = 0;
    const SS_IDLE_MS = 4 * 60 * 1000; // 4 minutes
    function resetSsTimer() {
      clearTimeout(_ssTimer);
      if (_ssActive) hideScreensaver();
      _ssTimer = setTimeout(showScreensaver, SS_IDLE_MS);
    }
    function showScreensaver() {
      _ssActive = true;
      // Collect posters from db
      const posters = Object.values(db).map(s => s._backdrop || s._poster || s.poster).filter(Boolean);
      if (!posters.length) return;
      const img1 = document.getElementById('ssImg1'), img2 = document.getElementById('ssImg2');
      const el = document.getElementById('screensaver');
      img1.src = posters[0]; img1.classList.add('active');
      el.classList.add('open'); requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
      updateSsClock(); _ssClockTimer = setInterval(updateSsClock, 30000);
      // Cycle posters
      _ssCycleTimer = setInterval(() => {
        _ssImgIdx = (_ssImgIdx + 1) % posters.length;
        const next = _ssImgIdx % 2 === 0 ? img1 : img2, prev = _ssImgIdx % 2 === 0 ? img2 : img1;
        next.src = posters[_ssImgIdx];
        setTimeout(() => { next.classList.add('active'); prev.classList.remove('active'); }, 100);
      }, 8000);
    }
    let _ssClockTimer = null, _ssCycleTimer = null;
    function hideScreensaver() {
      _ssActive = false; clearInterval(_ssClockTimer); clearInterval(_ssCycleTimer);
      const el = document.getElementById('screensaver'); el.classList.remove('visible');
      setTimeout(() => { el.classList.remove('open'); document.getElementById('ssImg1').classList.remove('active'); }, 1200);
      resetSsTimer();
    }
    function updateSsClock() {
      const el = document.getElementById('ssClock'); if (!el) return;
      const now = new Date(); el.textContent = now.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
    }
    // Listen for activity
    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel'].forEach(ev => {
      document.addEventListener(ev, () => { if (!_ssActive) resetSsTimer(); }, { passive: true });
    });

    // ═══════════════════════════════════════════════════════
    // RULETA — "Nevím co koukat"  v3 — clean, themed, bug-free
    // ═══════════════════════════════════════════════════════

    // ── State ────────────────────────────────────────────────────────
    let _ruletaSpinning   = false;
    let _ruletaFilter     = 'all';
    let _ruletaWinner     = null;
    let _ruletaSpinCount  = 0;
    let _ruletaPool       = null;      // cached candidate list
    let _ruletaPinned     = null;      // pinned search item
    let _ruletaSearchDebounce = null;

    // Wheel canvas state
    let _ruletaWheelAngle     = 0;
    let _ruletaWheelRaf       = null;
    let _ruletaHighlightRaf   = null;
    let _ruletaWheelCanvas    = null;
    let _ruletaWheelCtx       = null;
    let _ruletaFinalBallAngle = 0;
    let _ruletaFinalBallR     = 0;
    let _ruletaWinSegIdx      = 0;
    let _ruletaAnimDone       = false;  // TRUE pouze po úplném dokončení spin animace

    // European roulette pocket order & red set
    const _ROULETTE_NUMS = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
    const _ROULETTE_RED  = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
    const _SEGMENT_COUNT = _ROULETTE_NUMS.length; // 37
    const _SEG_ANGLE     = (Math.PI * 2) / _SEGMENT_COUNT;

    // ── Helpers ──────────────────────────────────────────────────────
    function _ruletaAccent() {
      return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#007AFF';
    }
    function _hexToRgb(hex) {
      hex = hex.replace('#','');
      if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
      const n = parseInt(hex, 16);
      return [(n>>16)&255, (n>>8)&255, n&255];
    }

    // ── Web Audio ────────────────────────────────────────────────────
    let _ruletaAC = null;
    function _getAC() {
      if (!_ruletaAC) {
        try { _ruletaAC = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}
      }
      return _ruletaAC;
    }
    function _tick(freq, vol) {
      try {
        const ac = _getAC(); if (!ac) return;
        const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.022), ac.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/d.length, 3);
        const src = ac.createBufferSource();
        src.buffer = buf;
        const g = ac.createGain();
        g.gain.setValueAtTime(Math.min(vol, 0.15), ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.022);
        src.connect(g); g.connect(ac.destination);
        src.start();
      } catch(e){}
    }
    function _spinWhirr(progress) {
      try {
        const ac = _getAC(); if (!ac) return;
        const osc = ac.createOscillator();
        const g   = ac.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = 60 + (1-progress)*80;
        g.gain.setValueAtTime(0.012, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.08);
        osc.connect(g); g.connect(ac.destination);
        osc.start(); osc.stop(ac.currentTime + 0.08);
      } catch(e){}
    }
    function _winChime() {
      try {
        const ac = _getAC(); if (!ac) return;
        [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
          const osc = ac.createOscillator();
          const g   = ac.createGain();
          osc.type = 'sine'; osc.frequency.value = f;
          const t = ac.currentTime + i * 0.12;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.22, t + 0.03);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
          osc.connect(g); g.connect(ac.destination);
          osc.start(t); osc.stop(t + 0.6);
        });
      } catch(e){}
    }

    // ── Croupier lines ───────────────────────────────────────────────
    const _croupierLines = [
      'Jackpot! <strong>{t}</strong> je pecka!',
      'Krupiér vybral! Dneska koukáš na <strong>{t}</strong>.',
      'Skvělá volba! AI schvaluje — <strong>{t}</strong>.',
      'Pohodlně se usaďte. Vytáhni popcorn! 🍿',
      'Tohle bude jízda! <strong>{t}</strong> tě dostane.',
      'Osud rozhodl. Žádné výmluvy! 🎰',
    ];
    function _croupierLine(title) {
      return _croupierLines[Math.floor(Math.random()*_croupierLines.length)].replace('{t}', title);
    }

    // ── Search ───────────────────────────────────────────────────────
    function ruletaOnSearchInput(val) {
      const clearBtn = document.getElementById('ruletaSearchClear');
      if (clearBtn) clearBtn.style.display = val ? 'block' : 'none';
      clearTimeout(_ruletaSearchDebounce);
      const res = document.getElementById('ruletaSearchResults');
      if (!val || val.length < 2) { if (res) res.classList.remove('open'); return; }
      _ruletaSearchDebounce = setTimeout(() => _ruletaDoSearch(val), 300);
    }
    async function _ruletaDoSearch(q) {
      if (!TMDB_KEY) return;
      try {
        const data = await tmdbGet('/search/multi?query=' + encodeURIComponent(q) + '&page=1');
        const results = (data?.results || [])
          .filter(r => r.poster_path && (r.media_type==='movie' || r.media_type==='tv'))
          .slice(0, 8);
        const container = document.getElementById('ruletaSearchResults');
        if (!container) return;
        container.innerHTML = '';
        results.forEach(item => {
          const name = item.name || item.title || '';
          const year = (item.release_date || item.first_air_date || '').slice(0,4);
          const rating = item.vote_average ? '★ ' + item.vote_average.toFixed(1) : '';
          const type = item.media_type==='movie' ? '🎬 Film' : '📺 Seriál';
          const div = document.createElement('div');
          div.className = 'ruleta-search-item';
          div.innerHTML =
            '<img src="https://image.tmdb.org/t/p/w92' + item.poster_path + '" alt="" onerror="this.style.opacity=0">' +
            '<div class="ruleta-search-item-info">' +
              '<div class="ruleta-search-item-name">' + name + '</div>' +
              '<div class="ruleta-search-item-meta">' + type + (year?' · '+year:'') + (rating?' · '+rating:'') + '</div>' +
            '</div>' +
            '<div class="ruleta-search-item-pin">Vybrat</div>';
          div.onclick = () => ruletaPinItem(item);
          container.appendChild(div);
        });
        container.classList[results.length ? 'add' : 'remove']('open');
      } catch(e){}
    }
    function ruletaPinItem(item) {
      _ruletaPinned = { ...item, media_type: item.media_type || (item.title ? 'movie' : 'tv') };
      _ruletaPool = null;
      const name = item.name || item.title || '';
      const pn = document.getElementById('ruletaPinnedName');
      const pi = document.getElementById('ruletaPinnedImg');
      const pp = document.getElementById('ruletaSearchPinned');
      const sr = document.getElementById('ruletaSearchResults');
      const inp = document.getElementById('ruletaSearchInput');
      const clearBtn = document.getElementById('ruletaSearchClear');
      if (pn) pn.textContent = name;
      if (pi) pi.src = item.poster_path ? 'https://image.tmdb.org/t/p/w92' + item.poster_path : '';
      if (pp) pp.classList.add('visible');
      if (sr) sr.classList.remove('open');
      if (inp) inp.value = '';
      if (clearBtn) clearBtn.style.display = 'none';
      if (typeof showToast === 'function') showToast('📌 "' + name + '" připnuto!');
    }
    function ruletaUnpin() {
      _ruletaPinned = null;
      _ruletaPool = null;
      const pp = document.getElementById('ruletaSearchPinned');
      if (pp) pp.classList.remove('visible');
    }
    function ruletaClearSearch() {
      const inp = document.getElementById('ruletaSearchInput');
      const clearBtn = document.getElementById('ruletaSearchClear');
      const res = document.getElementById('ruletaSearchResults');
      if (inp) inp.value = '';
      if (clearBtn) clearBtn.style.display = 'none';
      if (res) res.classList.remove('open');
    }

    // ── Filters ──────────────────────────────────────────────────────
    function setRuletaFilter(btn, type) {
      _ruletaFilter = type;
      _ruletaPool = null;
      document.querySelectorAll('.ruleta-filter-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
    }

    // Compat stubs
    const GENRES = [];
    let _gsSpinning = false;
    function initGenreSlots() {}
    function spinGenreSlots() { spinRuleta(); }
    function pullLever() {
      if (_ruletaSpinning) return;
      const lever = document.getElementById('ruletaLever');
      if (lever) { lever.classList.add('pulled'); setTimeout(() => lever.classList.remove('pulled'), 500); }
      spinRuleta();
    }

    // ── Open / Close ─────────────────────────────────────────────────
    function openRuleta() {
      const el = document.getElementById('ruletaOverlay');
      if (!el) return;
      el.classList.add('open');

      // Reset UI state
      _ruletaPool = null;
      _ruletaSpinCount = 0;
      _ruletaWinner = null;
      const ids = ['ruletaResult','ruletaJackpot'];
      ids.forEach(id => {
        const e = document.getElementById(id);
        if (e) { e.style.display = ''; e.classList.remove('visible'); }
      });
      document.getElementById('ruletaResult').style.display = 'none';
      ['ruletaAgainBtn','ruletaPlayBtn'].forEach(id => {
        const e = document.getElementById(id);
        if (e) e.classList.remove('visible');
      });
      const croupier = document.getElementById('ruletaCroupier');
      if (croupier) croupier.classList.remove('visible');
      const sc = document.getElementById('ruletaSpinCount');
      if (sc) { sc.classList.remove('visible'); sc.textContent = ''; }
      const sl = document.getElementById('ruletaSpinLabel');
      if (sl) sl.textContent = 'ZATOČIT';
      const btn = document.getElementById('ruletaSpinBtn');
      if (btn) btn.disabled = false;

      ruletaUnpin();
      ruletaClearSearch();

      // Apply accent colour to marker & buttons
      _ruletaApplyTheme();

      // Build wheel
      _ruletaWheelAngle = 0;
      _buildRuletaWheel();
      _buildNumberStrip();
      _drawRuletaWheel(_ruletaWheelAngle);

      // Bulb idle twinkle
      _startBulbIdle();

      if (typeof pauseBgParticles === 'function') pauseBgParticles();
      if (typeof playOpen === 'function') playOpen();
    }

    function closeRuleta() {
      const el = document.getElementById('ruletaOverlay');
      if (!el) return;
      el.classList.remove('spinning');
      el.classList.remove('open');
      _ruletaAnimDone = false;
      _stopBulbIdle();
      if (_ruletaWheelRaf)    { cancelAnimationFrame(_ruletaWheelRaf);    _ruletaWheelRaf = null; }
      if (_ruletaHighlightRaf){ cancelAnimationFrame(_ruletaHighlightRaf); _ruletaHighlightRaf = null; }
      const trailerEl = document.getElementById('ruletaResultTrailer');
      if (trailerEl) trailerEl.innerHTML = '';
      if (typeof resumeBgParticles === 'function') resumeBgParticles();
    }

    // ── Theme application ────────────────────────────────────────────
    function _ruletaApplyTheme() {
      const accent = _ruletaAccent();
      // Marker triangle colour is handled by CSS var(--accent) already
      // Highlight active filter
      document.querySelectorAll('.ruleta-filter-btn.active').forEach(b => {
        b.style.borderColor = accent;
        b.style.color = accent;
      });
      // Spin button
      const btn = document.getElementById('ruletaSpinBtn');
      if (btn) btn.style.background = accent;
    }

    // ── Bulb animations ──────────────────────────────────────────────
    let _ruletaBulbIdleTimer = null;
    function _startBulbIdle() {
      _stopBulbIdle();
      const bulbs = document.querySelectorAll('.ruleta-bulb');
      let off = 0;
      _ruletaBulbIdleTimer = setInterval(() => {
        bulbs.forEach((b, i) => {
          b.classList.remove('on','on-r','winner');
          const idx = (i + off) % 6;
          if (idx === 0) b.classList.add('on');
          if (idx === 3) b.classList.add('on-r');
        });
        off++;
      }, 200);
    }
    function _stopBulbIdle() {
      if (_ruletaBulbIdleTimer) { clearInterval(_ruletaBulbIdleTimer); _ruletaBulbIdleTimer = null; }
    }

    // ── Play result ──────────────────────────────────────────────────
    function ruletaPlay() {
      if (!_ruletaWinner) return;
      const w = _ruletaWinner;
      const name = w.title || w.name || '';
      const isMovie = !!(w.title || w.media_type === 'movie');
      if (typeof openWithCopy === 'function') openWithCopy(name, isMovie ? 'movie' : 'tv');
    }

    // ── Wheel canvas ─────────────────────────────────────────────────
    function _buildRuletaWheel() {
      _ruletaWheelCanvas = document.getElementById('ruletaWheelCanvas');
      if (!_ruletaWheelCanvas) return;
      _ruletaWheelCtx = _ruletaWheelCanvas.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const size = Math.min(360, window.innerWidth < 720 ? 280 : 360);
      _ruletaWheelCanvas.width  = size * dpr;
      _ruletaWheelCanvas.height = size * dpr;
      _ruletaWheelCanvas.style.width  = size + 'px';
      _ruletaWheelCanvas.style.height = size + 'px';
      _ruletaWheelCtx.scale(dpr, dpr);
    }

    function _drawRuletaWheel(angle, ballAngle, ballR) {
      if (!_ruletaWheelCanvas || !_ruletaWheelCtx) return;
      const ctx = _ruletaWheelCtx;
      const size = parseInt(_ruletaWheelCanvas.style.width) || 360;
      const W = size, H = size;
      const cx = W/2, cy = H/2;

      const outerR  = W * 0.485;
      const metalR  = W * 0.465;
      const trackR  = W * 0.445;
      const fretR   = W * 0.39;
      const pocketR = W * 0.36;
      const innerR  = W * 0.32;
      const coneR   = W * 0.28;
      const numR    = W * 0.415;

      ctx.clearRect(0, 0, W, H);

      // 1. Wood rim
      const woodGrad = ctx.createRadialGradient(cx - W*0.12, cy - W*0.12, 0, cx, cy, outerR);
      woodGrad.addColorStop(0, '#3a2800'); woodGrad.addColorStop(0.4, '#1e1600');
      woodGrad.addColorStop(0.7, '#2a1e00'); woodGrad.addColorStop(1, '#0e0b00');
      ctx.beginPath(); ctx.arc(cx, cy, outerR, 0, Math.PI*2);
      ctx.fillStyle = woodGrad; ctx.fill();
      // Wood grain
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, outerR, 0, Math.PI*2); ctx.clip();
      for (let g = -outerR; g < outerR; g += 4) {
        ctx.beginPath(); ctx.moveTo(cx+g, cy-outerR); ctx.lineTo(cx+g+outerR*0.15, cy+outerR);
        ctx.strokeStyle = 'rgba(255,200,80,0.02)'; ctx.lineWidth = 1.5; ctx.stroke();
      }
      ctx.restore();

      // 2. Brass ring
      const brassGrad = ctx.createLinearGradient(cx-metalR, cy-metalR, cx+metalR, cy+metalR);
      brassGrad.addColorStop(0,'#f0d060'); brassGrad.addColorStop(0.3,'#c8a400');
      brassGrad.addColorStop(0.6,'#8a6e00'); brassGrad.addColorStop(1,'#c8a400');
      ctx.beginPath(); ctx.arc(cx, cy, metalR, 0, Math.PI*2);
      ctx.strokeStyle = brassGrad; ctx.lineWidth = 5; ctx.stroke();

      // 3. Ball track
      ctx.beginPath(); ctx.arc(cx, cy, trackR+4, 0, Math.PI*2);
      ctx.fillStyle = '#0a0800'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, fretR+4, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(200,164,0,0.25)'; ctx.lineWidth = 1.5; ctx.stroke();

      // 4. Pockets
      for (let i = 0; i < _SEGMENT_COUNT; i++) {
        const num      = _ROULETTE_NUMS[i];
        const segStart = angle + i * _SEG_ANGLE - Math.PI/2;
        const segEnd   = segStart + _SEG_ANGLE;
        const midAngle = segStart + _SEG_ANGLE/2;

        ctx.beginPath();
        ctx.arc(cx, cy, fretR, segStart, segEnd);
        ctx.arc(cx, cy, pocketR, segEnd, segStart, true);
        ctx.closePath();
        const gx = cx + Math.cos(midAngle)*(pocketR*0.7);
        const gy = cy + Math.sin(midAngle)*(pocketR*0.7);
        const pg = ctx.createRadialGradient(gx-3,gy-3,0,gx,gy,fretR*0.35);
        if (num===0) { pg.addColorStop(0,'#2a8050'); pg.addColorStop(1,'#0e4020'); }
        else if (_ROULETTE_RED.has(num)) { pg.addColorStop(0,'#d42828'); pg.addColorStop(1,'#6a1010'); }
        else { pg.addColorStop(0,'#1e1e1e'); pg.addColorStop(1,'#060606'); }
        ctx.fillStyle = pg; ctx.fill();

        // Fret pin
        ctx.beginPath();
        ctx.moveTo(cx+Math.cos(segStart)*(innerR+4), cy+Math.sin(segStart)*(innerR+4));
        ctx.lineTo(cx+Math.cos(segStart)*(fretR+2),  cy+Math.sin(segStart)*(fretR+2));
        ctx.strokeStyle='rgba(200,164,0,0.6)'; ctx.lineWidth=1.2; ctx.stroke();
        const px=cx+Math.cos(segStart)*fretR, py=cy+Math.sin(segStart)*fretR;
        ctx.beginPath(); ctx.arc(px,py,1.8,0,Math.PI*2); ctx.fillStyle='#c8a400'; ctx.fill();

        // Number
        ctx.save();
        ctx.translate(cx+Math.cos(midAngle)*numR, cy+Math.sin(midAngle)*numR);
        ctx.rotate(midAngle+Math.PI/2);
        ctx.shadowColor='rgba(0,0,0,0.8)'; ctx.shadowBlur=3;
        ctx.font=`bold ${W*0.038}px Outfit,Arial,sans-serif`;
        ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(String(num),0,0); ctx.shadowColor='transparent';
        ctx.restore();

        // Shimmer
        const sx=cx+Math.cos(midAngle)*(pocketR*0.82), sy=cy+Math.sin(midAngle)*(pocketR*0.82);
        const sg=ctx.createRadialGradient(sx,sy,0,sx,sy,W*0.03);
        sg.addColorStop(0,'rgba(255,255,255,0.1)'); sg.addColorStop(1,'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.arc(cx,cy,fretR,segStart,segEnd); ctx.arc(cx,cy,pocketR,segEnd,segStart,true);
        ctx.closePath(); ctx.fillStyle=sg; ctx.fill();
      }

      // 5. Inner turret
      const innerBG = ctx.createLinearGradient(cx-innerR,cy-innerR,cx+innerR,cy+innerR);
      innerBG.addColorStop(0,'#c8a400'); innerBG.addColorStop(0.5,'#7a5e00'); innerBG.addColorStop(1,'#c8a400');
      ctx.beginPath(); ctx.arc(cx,cy,innerR,0,Math.PI*2); ctx.strokeStyle=innerBG; ctx.lineWidth=3; ctx.stroke();

      const feltG = ctx.createRadialGradient(cx-W*0.05,cy-W*0.06,0,cx,cy,coneR);
      feltG.addColorStop(0,'#2a8050'); feltG.addColorStop(0.5,'#1e6040');
      feltG.addColorStop(0.8,'#165030'); feltG.addColorStop(1,'#0a3018');
      ctx.beginPath(); ctx.arc(cx,cy,coneR,0,Math.PI*2); ctx.fillStyle=feltG; ctx.fill();

      for (let s=0;s<8;s++) {
        const sa=(s/8)*Math.PI*2;
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(sa)*coneR,cy+Math.sin(sa)*coneR);
        ctx.strokeStyle='rgba(200,164,0,0.18)'; ctx.lineWidth=0.8; ctx.stroke();
      }
      [0.45,0.7,0.88].forEach(r=>{
        ctx.beginPath(); ctx.arc(cx,cy,coneR*r,0,Math.PI*2);
        ctx.strokeStyle='rgba(200,164,0,0.15)'; ctx.lineWidth=0.8; ctx.stroke();
      });

      // Hub
      const hubR=W*0.055;
      const hubG=ctx.createRadialGradient(cx-hubR*0.3,cy-hubR*0.3,0,cx,cy,hubR);
      hubG.addColorStop(0,'#f0d060'); hubG.addColorStop(0.4,'#c8a400');
      hubG.addColorStop(0.8,'#7a5e00'); hubG.addColorStop(1,'#3a2e00');
      ctx.beginPath(); ctx.arc(cx,cy,hubR,0,Math.PI*2); ctx.fillStyle=hubG; ctx.fill();
      ctx.beginPath(); ctx.arc(cx,cy,W*0.018,0,Math.PI*2); ctx.fillStyle='#1a1200'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx-1,cy-1,W*0.006,0,Math.PI*2); ctx.fillStyle='rgba(255,240,120,0.55)'; ctx.fill();

      // 6. Dome light overlay
      const domeG=ctx.createRadialGradient(cx-W*0.2,cy-W*0.22,0,cx,cy,outerR);
      domeG.addColorStop(0,'rgba(255,255,255,0.06)'); domeG.addColorStop(0.4,'rgba(255,255,255,0.015)');
      domeG.addColorStop(0.7,'rgba(0,0,0,0)'); domeG.addColorStop(1,'rgba(0,0,0,0.22)');
      ctx.beginPath(); ctx.arc(cx,cy,outerR,0,Math.PI*2); ctx.fillStyle=domeG; ctx.fill();

      // 7. Ball
      if (ballAngle !== undefined && ballR !== undefined && ballR > 0) {
        const bx=cx+Math.cos(ballAngle)*ballR, by=cy+Math.sin(ballAngle)*ballR;
        const br=W*0.026;
        ctx.beginPath(); ctx.arc(bx,by+2,br*1.3,0,Math.PI*2);
        const sg2=ctx.createRadialGradient(bx,by+2,0,bx,by+2,br*1.3);
        sg2.addColorStop(0,'rgba(0,0,0,0.45)'); sg2.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=sg2; ctx.fill();
        const bg=ctx.createRadialGradient(bx-br*0.38,by-br*0.42,0,bx,by,br);
        bg.addColorStop(0,'#fff'); bg.addColorStop(0.25,'#f0f0f0');
        bg.addColorStop(0.6,'#c8c8c8'); bg.addColorStop(0.85,'#a0a0a0'); bg.addColorStop(1,'#606060');
        ctx.beginPath(); ctx.arc(bx,by,br,0,Math.PI*2); ctx.fillStyle=bg; ctx.fill();
        ctx.beginPath(); ctx.arc(bx-br*0.3,by-br*0.38,br*0.32,0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.fill();
        ctx.beginPath(); ctx.arc(bx+br*0.2,by+br*0.15,br*0.14,0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,0.22)'; ctx.fill();
        ctx.beginPath(); ctx.arc(bx,by,br,0,Math.PI*2); ctx.strokeStyle='rgba(0,0,0,0.35)'; ctx.lineWidth=0.7; ctx.stroke();
      }

      // 8. Winning pocket highlight (pulsing when stopped)
      // Podmínka: _ruletaAnimDone musí být true aby pulse loop startoval
      // — to zabraňuje předčasnému spuštění před dokončením animace
      if (_ruletaAnimDone && _ruletaWinSegIdx !== undefined && _ruletaWinner) {
        const ws=angle+_ruletaWinSegIdx*_SEG_ANGLE-Math.PI/2;
        const we=ws+_SEG_ANGLE;
        const pulse=0.5+0.5*Math.sin(performance.now()*0.006);
        const [ar,ag,ab]=_hexToRgb(_ruletaAccent());
        ctx.beginPath();
        ctx.arc(cx,cy,fretR,ws,we); ctx.arc(cx,cy,pocketR,we,ws,true); ctx.closePath();
        ctx.fillStyle=`rgba(${ar},${ag},${ab},${0.12+pulse*0.2})`; ctx.fill();
        ctx.beginPath();
        ctx.arc(cx,cy,fretR,ws,we); ctx.arc(cx,cy,pocketR,we,ws,true); ctx.closePath();
        ctx.strokeStyle=`rgba(${ar},${ag},${ab},${0.4+pulse*0.5})`; ctx.lineWidth=1.5; ctx.stroke();
        requestAnimationFrame(()=>_drawRuletaWheel(_ruletaWheelAngle,_ruletaFinalBallAngle,_ruletaFinalBallR));
      }
    }

    function _buildNumberStrip() {
      const strip = document.getElementById('ruletaNumberStrip');
      if (!strip) return;
      strip.innerHTML = '';
      [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5].forEach(n=>{
        const span=document.createElement('span');
        span.className='rns-num '+(n===0?'green':(_ROULETTE_RED.has(n)?'red':'black'));
        span.textContent=n;
        strip.appendChild(span);
      });
    }

    // ── Sparks burst ─────────────────────────────────────────────────
    function ruletaSparks() {
      const canvas=document.getElementById('ruletaCanvas'); if(!canvas) return;
      const box=canvas.parentElement;
      canvas.width=box.offsetWidth; canvas.height=box.offsetHeight;
      const ctx=canvas.getContext('2d');
      const cx=canvas.width/2, cy=canvas.height*0.35;
      const accent=_ruletaAccent();
      const [ar,ag,ab]=_hexToRgb(accent);
      const particles=Array.from({length:70},()=>({
        x:cx, y:cy,
        vx:(Math.random()-0.5)*14, vy:(Math.random()-0.85)*11,
        life:1, size:Math.random()*3.5+1.5,
        useAccent: Math.random()<0.5
      }));
      let raf;
      function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        let alive=false;
        particles.forEach(p=>{
          p.x+=p.vx; p.y+=p.vy; p.vy+=0.4; p.life-=0.022;
          if(p.life<=0) return;
          alive=true;
          ctx.globalAlpha=p.life*p.life;
          ctx.fillStyle=p.useAccent?`rgba(${ar},${ag},${ab},1)`:'hsl(0,100%,65%)';
          ctx.beginPath(); ctx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2); ctx.fill();
        });
        ctx.globalAlpha=1;
        if(alive) raf=requestAnimationFrame(draw);
        else ctx.clearRect(0,0,canvas.width,canvas.height);
      }
      if(raf) cancelAnimationFrame(raf);
      draw();
    }

    // ── Main spin ────────────────────────────────────────────────────
    async function spinRuleta() {
      if (_ruletaSpinning) return;
      _ruletaSpinning = true;
      _ruletaAnimDone = false;
      _ruletaSpinCount++;

      const btn         = document.getElementById('ruletaSpinBtn');
      const againBtn    = document.getElementById('ruletaAgainBtn');
      const playBtn     = document.getElementById('ruletaPlayBtn');
      const spinLabel   = document.getElementById('ruletaSpinLabel');
      const spinCountEl = document.getElementById('ruletaSpinCount');
      const overlay     = document.getElementById('ruletaOverlay');
      const croupier    = document.getElementById('ruletaCroupier');
      const croupierText= document.getElementById('ruletaCroupierText');

      if (btn) btn.disabled = true;
      if (spinLabel) spinLabel.textContent = 'Točím…';
      if (againBtn) againBtn.classList.remove('visible');
      if (playBtn)  playBtn.classList.remove('visible');
      const resultEl = document.getElementById('ruletaResult');
      if (resultEl) resultEl.style.display = 'none';
      if (croupier) croupier.classList.remove('visible');
      if (overlay)  overlay.classList.add('spinning');

      // Bulb chase (fast)
      _stopBulbIdle();
      const bulbEls = document.querySelectorAll('.ruleta-bulb');
      let bulbOff = 0;
      const bulbTimer = setInterval(()=>{
        bulbEls.forEach((b,i)=>{
          b.classList.remove('on','on-r','winner');
          const idx=(i+bulbOff)%4;
          if(idx===0) b.classList.add('on');
          if(idx===2) b.classList.add('on-r');
        });
        bulbOff++;
      }, 60);

      // ── Fetch candidate pool ─────────────────────────────────────
      let candidates = _ruletaPool;
      if (_ruletaPinned) {
        candidates = [_ruletaPinned];
        _ruletaPool = candidates;
      } else if (!candidates) {
        candidates = [];
        try {
          if (TMDB_KEY) {
            const userResults = await _userAwareFetch(_ruletaFilter);
            if (userResults.length) {
              candidates = userResults;
            } else {
              const pg  = Math.floor(Math.random()*8)+1;
              const pg2 = Math.floor(Math.random()*8)+1;
              const filter = _ruletaFilter;
              const fetches = [];
              if (filter==='all'||filter==='movie') {
                fetches.push(tmdbGet('/trending/movie/week?language=cs&page='+pg));
                fetches.push(tmdbGet('/discover/movie?sort_by=popularity.desc&vote_count.gte=200&vote_average.gte=6.0&language=cs&page='+pg2));
              }
              if (filter==='all'||filter==='tv') {
                fetches.push(tmdbGet('/trending/tv/week?language=cs&page='+pg));
                fetches.push(tmdbGet('/discover/tv?sort_by=popularity.desc&vote_count.gte=100&vote_average.gte=6.0&language=cs&page='+pg2));
              }
              if (filter==='top') {
                fetches.push(tmdbGet('/movie/top_rated?language=cs&page='+pg));
                fetches.push(tmdbGet('/tv/top_rated?language=cs&page='+pg));
              }
              if (filter==='trending') {
                fetches.push(tmdbGet('/trending/all/day?language=cs&page='+pg));
                fetches.push(tmdbGet('/trending/all/week?language=cs&page='+pg2));
              }
              const results = await Promise.allSettled(fetches);
              results.forEach(r=>{
                if (r.status!=='fulfilled'||!r.value?.results) return;
                r.value.results.filter(x=>x.poster_path).forEach(x=>{
                  const mt = x.media_type || (x.title?'movie':'tv');
                  if (mt==='movie'||mt==='tv') candidates.push({...x,media_type:mt});
                });
              });
            }
          }
        } catch(e){}

        // Add watchlist items
        try {
          const wl = getWatchlist();
          wl.forEach(item=>{
            if (item.name && !candidates.find(c=>(c.title||c.name)===item.name))
              candidates.push({title:item.name,name:item.name,poster_path:null,id:null,
                media_type:item.type==='movie'?'movie':'tv',_fromWatchlist:true,_poster:item.poster});
          });
        } catch(e){}

        // Fallback
        if (!candidates.length) candidates=[
          {title:'Breaking Bad',name:'Breaking Bad',media_type:'tv'},
          {title:'Inception',name:'Inception',media_type:'movie'},
          {title:'Interstellar',name:'Interstellar',media_type:'movie'},
          {title:'Game of Thrones',name:'Game of Thrones',media_type:'tv'},
        ];

        // Deduplicate
        const seen=new Set();
        candidates=candidates.filter(c=>{const k=(c.title||c.name||'').toLowerCase();if(seen.has(k))return false;seen.add(k);return true;});
        _ruletaPool=candidates;
      }

      // Pick winner (avoid repeat)
      const prevName=_ruletaWinner?(_ruletaWinner.title||_ruletaWinner.name):'';
      const pool=(candidates.filter(c=>(c.title||c.name)!==prevName));
      const winner=(pool.length?pool:candidates)[Math.floor(Math.random()*(pool.length||candidates.length))];
      _ruletaWinner=winner;
      try { addToUserHistory(winner); } catch(e){}
      const winnerName=winner.title||winner.name||'?';
      const winnerPoster=winner.poster_path?'https://image.tmdb.org/t/p/w300'+winner.poster_path:(winner._poster||'');

      // ── Wheel animation ──────────────────────────────────────────
      const winSegIdx=Math.floor(Math.random()*_SEGMENT_COUNT);
      _ruletaWinSegIdx=winSegIdx;
      const size=parseInt(_ruletaWheelCanvas?.style.width||'360');
      const OUTER_BALL_R=size*0.44;
      const INNER_BALL_R=size*0.375;

      const fullSpins=7+Math.random()*4;
      const winSegCenterAngle=-Math.PI/2-(winSegIdx+0.5)*_SEG_ANGLE;
      const startWheelAngle=_ruletaWheelAngle;
      const finalWheelAngle=startWheelAngle-fullSpins*Math.PI*2+(winSegCenterAngle-(startWheelAngle%(Math.PI*2)));

      const startBallAngle=Math.random()*Math.PI*2;
      const ballSpins=fullSpins*2.4+2+Math.random();
      const spinDuration=5600+Math.random()*800;
      const BALL_DROP_PHASE=0.68;
      const BALL_BOUNCE_END=0.92;

      let lastTickTs=0, lastBallSeg=-1, lastWhirrTs=0;

      function easeOutQuint(t){return 1-Math.pow(1-t,5);}
      function easeOutExpo(t){return t>=1?1:1-Math.pow(2,-10*t);}

      const startTime=performance.now();
      if (_ruletaWheelRaf) cancelAnimationFrame(_ruletaWheelRaf);

      function animateWheel(ts) {
        const elapsed=ts-startTime;
        const rawProg=Math.min(elapsed/spinDuration,1);
        const prog=easeOutQuint(rawProg);

        _ruletaWheelAngle=startWheelAngle+(finalWheelAngle-startWheelAngle)*prog;

        let ballAngle,ballR;
        if (rawProg<BALL_DROP_PHASE) {
          const bp=rawProg/BALL_DROP_PHASE;
          ballAngle=startBallAngle-ballSpins*Math.PI*2*easeOutExpo(bp);
          ballR=OUTER_BALL_R;
          const tickInterval=Math.max(25,120*rawProg*rawProg+30);
          if (ts-lastTickTs>tickInterval) { _tick(800-rawProg*300,0.07-rawProg*0.035); lastTickTs=ts; }
        } else if (rawProg<BALL_BOUNCE_END) {
          const dp=(rawProg-BALL_DROP_PHASE)/(BALL_BOUNCE_END-BALL_DROP_PHASE);
          const de=easeOutQuint(dp);
          ballR=OUTER_BALL_R-(OUTER_BALL_R-INNER_BALL_R)*de;
          const ballMom=startBallAngle-ballSpins*Math.PI*2;
          const targetAngle=_ruletaWheelAngle+(winSegIdx+0.5)*_SEG_ANGLE-Math.PI/2;
          ballAngle=ballMom*(1-de*0.85)+targetAngle*(de*0.85);
          const relAngle=((ballAngle-_ruletaWheelAngle+Math.PI/2)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
          const curSeg=Math.floor(relAngle/_SEG_ANGLE)%_SEGMENT_COUNT;
          if (curSeg!==lastBallSeg&&dp<0.7) { lastBallSeg=curSeg; _tick(400-dp*200,0.1-dp*0.05); }
        } else {
          const st=(rawProg-BALL_BOUNCE_END)/(1-BALL_BOUNCE_END);
          ballR=INNER_BALL_R+Math.sin(st*Math.PI*3)*(OUTER_BALL_R-INNER_BALL_R)*0.035*(1-st);
          ballAngle=_ruletaWheelAngle+(winSegIdx+0.5)*_SEG_ANGLE-Math.PI/2;
        }
        if (rawProg<0.5&&ts-lastWhirrTs>180) { _spinWhirr(rawProg); lastWhirrTs=ts; }

        _drawRuletaWheel(_ruletaWheelAngle,ballAngle,ballR);

        if (rawProg<1) {
          _ruletaWheelRaf=requestAnimationFrame(animateWheel);
        } else {
          _ruletaFinalBallAngle=_ruletaWheelAngle+(winSegIdx+0.5)*_SEG_ANGLE-Math.PI/2;
          _ruletaFinalBallR=INNER_BALL_R;
          _drawRuletaWheel(_ruletaWheelAngle,_ruletaFinalBallAngle,_ruletaFinalBallR);
          _ruletaWheelRaf=null;
          _winChime();
          // Spustíme pulse highlight až nyní — kulička je na místě
          _ruletaAnimDone=true;
          requestAnimationFrame(()=>_drawRuletaWheel(_ruletaWheelAngle,_ruletaFinalBallAngle,_ruletaFinalBallR));
        }
      }
      _ruletaWheelRaf=requestAnimationFrame(animateWheel);
      await new Promise(r=>setTimeout(r,spinDuration+120));

      clearInterval(bulbTimer);
      if (overlay) overlay.classList.remove('spinning');

      // Win bulb flash
      bulbEls.forEach((b,i)=>{
        b.classList.remove('on','on-r');
        setTimeout(()=>b.classList.add('winner'),i*30);
        setTimeout(()=>{b.classList.remove('winner');b.classList.add(i%2===0?'on':'on-r');},i*30+1500);
      });
      setTimeout(()=>bulbEls.forEach(b=>b.classList.remove('winner')),3000);

      if (typeof playSuccess==='function') playSuccess();
      ruletaSparks();

      const box=document.getElementById('ruletaBox');
      if (box) { box.classList.add('shake'); setTimeout(()=>box.classList.remove('shake'),400); }

      // Confetti with accent colour
      if (typeof confetti==='function') {
        const ac=_ruletaAccent();
        confetti({particleCount:150,spread:70,origin:{y:0.55},colors:[ac,'#ffffff','#ff4444','#00cfff']});
        setTimeout(()=>confetti({particleCount:70,angle:60,spread:55,origin:{x:0,y:0.6},colors:[ac,'#fff']}),250);
        setTimeout(()=>confetti({particleCount:70,angle:120,spread:55,origin:{x:1,y:0.6},colors:[ac,'#fff']}),400);
      }

      // Jackpot flash
      const jpEl=document.getElementById('ruletaJackpot');
      const jpSub=document.getElementById('ruletaJackpotSub');
      if (jpEl&&jpSub) {
        jpSub.textContent=winnerName;
        jpEl.classList.add('visible');
        setTimeout(()=>jpEl.classList.remove('visible'),2200);
      }

      await new Promise(r=>setTimeout(r,650));

      // Fill result panel
      document.getElementById('ruletaResultTitle').textContent=winnerName;
      const year=(winner.release_date||winner.first_air_date||'').slice(0,4);
      const isTV=winner.media_type==='tv'||!winner.title;
      const meta=[];
      if (winner.vote_average) meta.push('⭐ '+winner.vote_average.toFixed(1));
      if (year) meta.push(year);
      meta.push(isTV?'📺 Seriál':'🎬 Film');
      if (winner.overview) meta.push(winner.overview.slice(0,90)+'…');
      document.getElementById('ruletaResultMeta').textContent=meta.join(' · ');
      const posterEl=document.getElementById('ruletaResultPoster');
      posterEl.innerHTML=winnerPoster?'<img src="'+winnerPoster+'" alt="" loading="lazy">':'';

      // Trailer
      const trailerEl=document.getElementById('ruletaResultTrailer');
      trailerEl.innerHTML='';
      if (winner.id&&TMDB_KEY) {
        try {
          const mt=isTV?'tv':'movie';
          const vd=await tmdbGet('/'+mt+'/'+winner.id+'/videos?language=cs');
          const tr=(vd?.results||[]).find(v=>v.site==='YouTube'&&(v.type==='Trailer'||v.type==='Teaser'));
          if (tr) trailerEl.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+tr.key+'?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=0&fs=1&playsinline=1&cc_load_policy=0" allow="autoplay;encrypted-media;picture-in-picture" allowfullscreen></iframe>';
        } catch(e){}
      }

      if (resultEl) resultEl.style.display='flex';
      if (croupier&&croupierText) {
        croupierText.innerHTML=_croupierLine(winnerName);
        croupier.classList.add('visible');
      }
      if (spinCountEl) { spinCountEl.textContent=_ruletaSpinCount+'× točeno'; spinCountEl.classList.add('visible'); }
      if (btn) btn.disabled=false;
      if (spinLabel) spinLabel.textContent=_ruletaSpinCount>1?'↻ Jiný výběr':'↻ Znovu';
      if (againBtn) againBtn.classList.add('visible');
      if (playBtn)  playBtn.classList.add('visible');

      // Floating bubble
      const bubble=document.getElementById('aiCroupierBubble');
      if (bubble) {
        bubble.textContent=['Jackpot! 🎰 Vytáhni popcorn!','Krupiér rozhodl! 🍿','Skvělá volba!','Osud promluvil! 🎲','Dneska koukáš na tohle!'][Math.floor(Math.random()*5)];
        bubble.style.display='block';
        setTimeout(()=>{bubble.style.display='none';},3000);
      }

      // Highlight winning number in strip
      const winNum=_ROULETTE_NUMS[winSegIdx];
      document.querySelectorAll('.rns-num').forEach(el=>{
        el.classList.remove('active-win');
        if(+el.textContent===winNum) el.classList.add('active-win');
      });

      _ruletaSpinning=false;
    }

    function onWheelStop() {}

    // ROZKOUKANOST EPIZOD — pravý klik / long press
    // ROZKOUKANOST EPIZOD — pravý klik / long press
    // ═══════════════════════════════════════════════════════
    function getPartialWatched() { try { return safeLS(uKey('mf_partial_watched'), '{}'); } catch { return {}; } }
    function savePartialWatched(data) { localStorage.setItem(uKey('mf_partial_watched'), JSON.stringify(data)); }

    function setEpisodeProgress(uid, pct) {
      const partial = getPartialWatched();
      if (pct >= 100) {
        delete partial[uid];
        markWatched(uid);
      } else if (pct <= 0) {
        delete partial[uid];
        const w = getWatched(); delete w[uid]; saveWatched(w);
        renderEpisodes();
      } else {
        partial[uid] = pct;
        savePartialWatched(partial);
        // Update card visually
        const card = document.getElementById(`card-${uid}`);
        if (card) {
          let bar = card.querySelector('.ep-progress-bar-wrap');
          if (!bar) {
            bar = document.createElement('div');
            bar.className = 'ep-progress-bar-wrap';
            bar.innerHTML = '<div class="ep-progress-bar-fill"></div>';
            const body = card.querySelector('.ep-body');
            if (body) body.appendChild(bar);
          }
          const fill = bar.querySelector('.ep-progress-bar-fill');
          if (fill) fill.style.width = pct + '%';
          card.classList.add('ep-card-partial');
        }
      }
      showToast(pct >= 100 ? '✓ Označeno jako zhlédnuté' : pct <= 0 ? '○ Označeno jako nezhlédnuté' : `◐ Rozkoukanost: ${pct}%`);
    }

    function showEpisodeProgressDialog(uid, se, ep, currentPct) {
      const existing = currentPct || 0;
      const name = `S${se}·E${ep}`;
      // Create simple dialog
      let dlg = document.getElementById('epProgressDlg');
      if (dlg) dlg.remove();
      dlg = document.createElement('div');
      dlg.id = 'epProgressDlg';
      dlg.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.75);backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:center;';
      dlg.innerHTML = `<div style="background:rgba(10,10,12,0.99);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:24px 22px;width:min(340px,90vw);box-shadow:0 40px 100px rgba(0,0,0,0.9);">
        <div style="font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif;font-size:1rem;font-weight:900;margin-bottom:4px;">📺 Rozkoukanost</div>
        <div style="font-size:0.7rem;color:var(--muted);margin-bottom:18px;">${name} — nastav, jak daleko jsi sledoval</div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;">
          <input type="range" id="epProgSlider" min="0" max="100" value="${existing}" step="5" style="flex:1;accent-color:var(--accent);">
          <div id="epProgVal" style="font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif;font-size:1.1rem;font-weight:900;color:var(--accent);min-width:40px;text-align:right;">${existing}%</div>
        </div>
        <div style="display:flex;gap:4px;margin-bottom:18px;">
          ${[0,25,50,75,100].map(v => `<button onclick="document.getElementById('epProgSlider').value=${v};document.getElementById('epProgVal').textContent='${v}%'" style="flex:1;padding:7px 4px;border-radius:8px;border:1px solid rgba(255,255,255,${v===existing?'0.3':'0.08'});background:rgba(255,255,255,${v===existing?'0.1':'0.04'});color:${v===existing?'var(--accent)':'var(--muted)'};font-size:0.65rem;font-weight:700;cursor:pointer;">${v}%</button>`).join('')}
        </div>
        <div style="display:flex;gap:10px;">
          <button onclick="document.getElementById('epProgressDlg').remove()" style="flex:1;padding:11px;border-radius:11px;background:rgba(255,255,255,0.05);border:1px solid var(--border);color:var(--muted);font-family:Outfit,sans-serif;cursor:pointer;">Zrušit</button>
          <button onclick="setEpisodeProgress('${uid}',parseInt(document.getElementById('epProgSlider').value));document.getElementById('epProgressDlg').remove()" style="flex:2;padding:11px;border-radius:11px;background:var(--accent);border:none;color:#000;font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif;font-weight:900;cursor:pointer;">✓ Uložit</button>
        </div>
      </div>`;
      dlg.querySelector('#epProgSlider').addEventListener('input', e => {
        document.getElementById('epProgVal').textContent = e.target.value + '%';
      });
      dlg.addEventListener('click', e => { if (e.target === dlg) dlg.remove(); });
      document.body.appendChild(dlg);
    }

    // ═══════════════════════════════════════════════════════
    // ŽÁNROVÉ POSUVNÍKY — ruční ladění AI profilu
    // ═══════════════════════════════════════════════════════
    const GENRE_LABELS = {
      'komedie': '😄 Komedie', 'drama': '🎭 Drama', 'akcni': '💥 Akce',
      'sci-fi': '🚀 Sci-Fi', 'horor': '👻 Horor', 'fantasy': '🧙 Fantasy',
      'krimi': '🔍 Krimi', 'animovany': '🎨 Animák', 'dobrodruzny': '⚔️ Dobrodružství',
      'rodinny': '👨‍👩‍👧 Rodinné', 'napinavy': '🔪 Thrillery'
    };

    function openGenreEditor() {
      const el = document.getElementById('genreEditorOverlay');
      el.classList.add('open');
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
      renderGenreSliders();
      pauseBgParticles();
    }

    function closeGenreEditor() {
      const el = document.getElementById('genreEditorOverlay');
      el.classList.remove('visible');
      setTimeout(() => el.classList.remove('open'), 280);
      resumeBgParticles();
    }

    function renderGenreSliders() {
      const container = document.getElementById('genreSliders');
      if (!container) return;
      const prefs = aiBrain.memory.genrePreferences || {};
      // Merge all known genres
      const allGenres = { ...Object.fromEntries(Object.keys(GENRE_LABELS).map(k => [k, 0])), ...prefs };
      container.innerHTML = Object.entries(allGenres).map(([key, val]) => {
        const pct = Math.round(val * 100);
        const label = GENRE_LABELS[key] || key;
        return `<div class="genre-slider-row">
          <div class="genre-slider-label">
            <span class="genre-slider-name">${label}</span>
            <span class="genre-slider-pct" id="gpct-${key}">${pct}%</span>
          </div>
          <input type="range" class="genre-slider" data-key="${key}" min="0" max="100" value="${pct}" step="5"
            oninput="document.getElementById('gpct-${key}').textContent=this.value+'%'">
        </div>`;
      }).join('');
    }

    function saveGenrePrefs() {
      const sliders = document.querySelectorAll('#genreSliders .genre-slider');
      sliders.forEach(slider => {
        const key = slider.dataset.key;
        const val = parseInt(slider.value) / 100;
        if (val === 0) delete aiBrain.memory.genrePreferences[key];
        else aiBrain.memory.genrePreferences[key] = val;
      });
      aiBrain.save();
      closeGenreEditor();
      showToast('✦ AI preference uloženy!');
    }

    // ═══════════════════════════════════════════════════════
    // ZVONČEK 🔔 — TMDB nové epizody z watchlistu
    // ═══════════════════════════════════════════════════════
    let _notifData = [];

    function openNotifPanel() {
      const el = document.getElementById('notifPanel');
      if (el.classList.contains('open')) { closeNotifPanel(); return; }
      el.classList.add('open');
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
      document.addEventListener('click', _notifOutsideClick, { once: true, capture: true });
    }

    function closeNotifPanel() {
      const el = document.getElementById('notifPanel');
      el.classList.remove('visible');
      setTimeout(() => el.classList.remove('open'), 220);
    }

    function _notifOutsideClick(e) {
      const panel = document.getElementById('notifPanel');
      const bell = document.getElementById('notifBell');
      if (panel && !panel.contains(e.target) && !bell.contains(e.target)) closeNotifPanel();
    }

    async function checkNewEpisodes() {
      if (!TMDB_KEY) return;
      const wl = getWatchlist();
      const seriesItems = wl.filter(i => i.type === 'series' || i.slug);
      _notifData = [];
      const today = new Date(); today.setHours(0,0,0,0);
      const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

      for (const item of seriesItems) {
        const slug = item.slug;
        if (!slug || !db[slug] || !db[slug].tmdbId) continue;
        try {
          // Get latest season info
          const res = await fetch(`${TMDB}/tv/${db[slug].tmdbId}?api_key=${TMDB_KEY}&language=cs`);
          if (!res.ok) continue;
          const data = await res.json();
          const lastEp = data.last_episode_to_air;
          if (!lastEp || !lastEp.air_date) continue;
          const airDate = new Date(lastEp.air_date); airDate.setHours(0,0,0,0);
          if (airDate >= yesterday) {
            _notifData.push({
              name: item.name,
              slug,
              poster: db[slug]._poster || db[slug].poster || '',
              ep: `S${lastEp.season_number}·E${lastEp.episode_number}: ${lastEp.name || ''}`,
              date: lastEp.air_date,
              isToday: airDate >= today
            });
          }
        } catch {}
      }

      const bell = document.getElementById('notifBell');
      const badge = document.getElementById('notifBellBadge');
      if (_notifData.length > 0) {
        bell.classList.add('has-notifs');
        badge.classList.add('visible');
        renderNotifPanel();
        // 🔔 Push notifikace — jen dnešní epizody, jen jednou za den
        const todayStr = new Date().toISOString().slice(0,10);
        const lastNotifDay = localStorage.getItem('mf_last_push_day');
        if (lastNotifDay !== todayStr && typeof window.mfNotify === 'function') {
          const todayEps = _notifData.filter(n => n.isToday);
          if (todayEps.length > 0) {
            localStorage.setItem('mf_last_push_day', todayStr);
            setTimeout(() => {
              if (todayEps.length === 1) {
                window.mfNotify(
                  `🎬 ${todayEps[0].name} — nová epizoda!`,
                  todayEps[0].ep,
                  todayEps[0].slug
                );
              } else {
                window.mfNotify(
                  `🎬 ${todayEps.length} nové epizody dnes!`,
                  todayEps.map(e => e.name).join(', '),
                  null
                );
              }
            }, 3000);
          }
        }
      } else {
        bell.classList.remove('has-notifs');
        badge.classList.remove('visible');
      }
    }

    function renderNotifPanel() {
      const list = document.getElementById('notifPanelList');
      if (!list) return;
      if (!_notifData.length) {
        list.innerHTML = '<div class="notif-empty">Žádné nové epizody v posledních 2 dnech.</div>';
        return;
      }
      list.innerHTML = _notifData.map(n => `
        <div class="notif-item" onclick="closeNotifPanel();openSeries('${n.slug}')">
          <img class="notif-item-poster" src="${n.poster}" alt="" loading="lazy" onerror="this.style.display='none'">
          <div class="notif-item-info">
            <div class="notif-item-name">${n.name}</div>
            <div class="notif-item-ep">${n.ep}</div>
            <div class="notif-item-date">${n.isToday ? '🔴 Dnes' : '🟡 Včera'} · ${n.date}</div>
          </div>
        </div>
      `).join('');
    }

    // ═══════════════════════════════════════════════════════
    // PATCH: buildEpCard — přidej pravý klik / long press pro rozkoukanost
    // ═══════════════════════════════════════════════════════
    // Override buildEpCard to include partial progress bar + right-click handler
    function buildEpCard(uid, se, epNum, epData, seen, isNext, poster) {
      const card = _buildEpCardBase(uid, se, epNum, epData, seen, isNext, poster);
      const partial = getPartialWatched();
      const pct = partial[uid] || 0;

      // Add progress bar if partially watched
      if (pct > 0 && !seen) {
        const body = card.querySelector('.ep-body');
        if (body) {
          const bar = document.createElement('div');
          bar.className = 'ep-progress-bar-wrap';
          bar.innerHTML = `<div class="ep-progress-bar-fill" style="width:${pct}%"></div>`;
          body.appendChild(bar);
          card.classList.add('ep-card-partial');
        }
      }

      // Right-click → progress dialog
      card.addEventListener('contextmenu', e => {
        e.preventDefault();
        e.stopPropagation();
        const currentPct = partial[uid] || (seen ? 100 : 0);
        showEpisodeProgressDialog(uid, se, epNum, currentPct);
      });

      // Long press (mobile)
      let _lpTimer;
      card.addEventListener('touchstart', e => { _lpTimer = setTimeout(() => { showEpisodeProgressDialog(uid, se, epNum, partial[uid] || (seen ? 100 : 0)); }, 600); }, { passive: true });
      card.addEventListener('touchend', () => clearTimeout(_lpTimer), { passive: true });
      card.addEventListener('touchmove', () => clearTimeout(_lpTimer), { passive: true });

      // ⭐ Show existing rating badge if already rated
      if (typeof getEpRating === 'function') {
        const existingRating = getEpRating(uid);
        if (existingRating > 0) {
          const metaRow = card.querySelector('.ep-meta-row');
          if (metaRow) {
            const badge = document.createElement('span');
            badge.className = 'ep-user-rating';
            badge.title = 'Moje hodnocení — klikni pro změnu';
            badge.innerHTML = '<span class="er-star-mini">⭐</span> ' + existingRating + '/5';
            badge.onclick = (e) => {
              e.stopPropagation();
              if (typeof _epRatingOpenFromCard === 'function') _epRatingOpenFromCard(uid);
            };
            metaRow.appendChild(badge);
          }
        }
      }

      return card;
    }

    // ═══════════════════════════════════════════════════════
    // PATCH AI PANEL — přidej tlačítko pro genre editor
    // ═══════════════════════════════════════════════════════

    // INIT
    window.addEventListener('load', () => {
      // Intro odstraněno — přímý start
      Object.keys(db).forEach(s => { updateTileProgress(s); updateContinueBadge(s); });
      updateContinueWidget(); updateLogoProgress(); updateWatchlistBadge(); updateWatchlistBtns(); showAutosave('idle'); updateStatusBadge();
      initTileEffects();
      loadTmdbTileImages().then(() => initTileEffects());

      // Okamžité zobrazení statických tile obrázků (.webp) bez čekání na TMDB
      document.querySelectorAll('.ps-tile-wrapper .tile-bg, .ps-tile-wrapper .tile-logo').forEach(img => {
        const apply = () => img.classList.add('loaded');
        if (img.complete && img.naturalWidth > 0) apply();
        else { img.addEventListener('load', apply, { once: true }); img.addEventListener('error', apply, { once: true }); }
      });
      loadForYouTile();
      loadTrending();
      setKbMenuFocus(0);
      // Init magnetic on AI fab
      initMagnetic(document.getElementById('aiFab'), 0.3);
      initMagnetic(document.getElementById('statsFab'), 0.4);
      // Sound on tiles
      document.querySelectorAll('.ps-tile-wrapper').forEach(w => { w.addEventListener('click', () => playOpen(), { passive: true }); });
      // Init OBJEVOVAT cycling genre tags
      (function initObjTag() {
        const tags = ['Akce','Drama','Sci-Fi','Horor','Krimi','Animák','Komedie','Thriller','Dokument','Reality','Romantika','Fantasy'];
        const el = document.getElementById('tsiTags');
        if (!el) return;
        let i = 0;
        function nextTags() {
          const picks = [];
          for (let n = 0; n < 3; n++) picks.push(tags[(i + n) % tags.length]);
          i = (i + 3) % tags.length;
          el.style.opacity = '0';
          el.style.transform = 'translateY(4px)';
          setTimeout(() => {
            el.innerHTML = picks.map(t => `<span>${t}</span>`).join('');
            el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, 300);
        }
        nextTags();
        setInterval(nextTags, 2800);
      })();
      // Check for new episodes (with delay to not block startup)
      setTimeout(checkNewEpisodes, 8000);
      // Init PWA
      updateTraktSidebarLabel();
      initPWA();
      // Restore AI history
      if (aiHistory.length > 0) { const c = document.getElementById('aiMessages'); const sep = document.createElement('div'); sep.style.cssText = 'text-align:center;font-size:0.57rem;color:var(--muted);padding:8px 0;opacity:0.45;'; sep.textContent = '── predchozi konverzace ──'; c.appendChild(sep); aiHistory.slice(-8).forEach(msg => { const wrap = document.createElement('div'); wrap.className = `ai-msg-wrap ${msg.role === 'user' ? 'user' : 'ai'}`; const fmt = (msg.content || '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'); if (msg.role === 'user') wrap.innerHTML = `<div class="ai-msg-avatar">👤</div><div class="ai-msg-bubble">${fmt}</div>`; else wrap.innerHTML = `<div class="ai-msg-avatar">✦</div><div class="ai-msg-bubble"><span class="ai-msg-label">MujFlix AI</span>${linkifyFilms(fmt)}</div>`; c.appendChild(wrap); }); const now = document.createElement('div'); now.style.cssText = 'text-align:center;font-size:0.57rem;color:var(--accent);padding:6px 0;opacity:0.6;'; now.textContent = '── ted ──'; c.appendChild(now); document.getElementById('aiMessages').scrollTop = 99999; }

      // Mark already-cached tile images as loaded immediately
      document.querySelectorAll('.tile-bg').forEach(img => {
        if (img.complete && img.naturalWidth > 0) img.classList.add('loaded');
      });

      // Header scroll effect — Netflix style
      const header = document.querySelector('.mf-header');
      if (header) {
        const mainScroll = document.querySelector('.ps-menu-scene') || document.body;
        window.addEventListener('scroll', () => {
          header.classList.toggle('scrolled', window.scrollY > 20);
        }, { passive: true });
        // Also watch the main content scroll
        const onScroll = () => header.classList.toggle('scrolled', (mainScroll.scrollTop || window.scrollY) > 20);
        mainScroll.addEventListener('scroll', onScroll, { passive: true });
      }

      // ── SMOOTH INIT v2 ──────────────────────────────────────
      // Global spring-click via event delegation (all buttons)
      document.addEventListener('pointerdown', e => {
        const btn = e.target.closest('button, .dock-btn, .ps-tile-wrapper, .ssv-card, .episode-card, .sh-card, .mood-btn, .mf-header-btn');
        if (!btn || btn.disabled) return;
        // Skip tiles — they have their own :active
        if (btn.classList.contains('ps-tile-wrapper') || btn.classList.contains('episode-card')) return;
        const prev = btn.style.transition;
        btn.style.transition = 'transform 0.07s ease';
        btn.style.transform = (btn.style.transform || '') + ' scale(0.93)';
        const up = () => {
          btn.style.transition = 'transform 0.38s cubic-bezier(0.34,1.5,0.64,1)';
          btn.style.transform = btn.style.transform.replace(/ ?scale\(0\.93\)/g, '');
          setTimeout(() => { btn.style.transition = prev; }, 420);
          document.removeEventListener('pointerup', up);
          document.removeEventListener('pointercancel', up);
        };
        document.addEventListener('pointerup', up, { once: true });
        document.addEventListener('pointercancel', up, { once: true });
      }, { passive: true });

      // Smooth scroll-to on tile row with mouse wheel (horizontal)
      const psMenu = document.querySelector('.ps-menu');
      if (psMenu) {
        psMenu.addEventListener('wheel', e => {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            psMenu.scrollBy({ left: e.deltaY * 1.4, behavior: 'smooth' });
          }
        }, { passive: false });
      }

      // Stagger tiles in on first load
      const wrappers = document.querySelectorAll('.ps-tile-wrapper');
      wrappers.forEach((w, i) => {
        w.style.opacity = '0';
        w.style.transform = 'translateY(18px) translateZ(0)';
        setTimeout(() => {
          w.style.transition = 'opacity 0.45s ease, transform 0.5s cubic-bezier(0.34,1.18,0.64,1)';
          w.style.opacity = '1';
          w.style.transform = 'translateY(0) translateZ(0)';
          setTimeout(() => { w.style.transition = ''; w.style.transform = ''; }, 520);
        }, 60 + i * 55);
      });
    });

    // Mood chips
    function setMood(el, mood) {
      document.querySelectorAll('.uni-mood-chip').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
    }

    // Section tabs
    function setSectionTab(el, tab) {
      document.querySelectorAll('.uni-section-tab').forEach(t => t.classList.remove('active'));
      el.classList.add('active');
      const labels = { trending: '🔥 Právě letí', toprated: '⭐ Nejlépe hodnocené', new: '🆕 Nové přírůstky', top10: '🏆 Top 10 CZ' };
      const lbl = document.getElementById('uniSectionLabel');
      if (lbl) lbl.textContent = labels[tab] || '🔥 Právě letí';
    }

    // ═══════════════════════════════════════════════════════
    // TRAKT.TV INTEGRACE
    // ═══════════════════════════════════════════════════════

    // Trakt API config — sdílený veřejný Client ID (uživatel může zadat svůj)
    const TRAKT_DEFAULT_CLIENT_ID = 'b4d4f6e7c4aadf32b56d3e5b5e69c59d7c5c14e6f34d9c11b2e64f7b2a1d5e8f';
    const TRAKT_API = 'https://api.trakt.tv';
    const TRAKT_REDIRECT = 'urn:ietf:wg:oauth:2.0:oob'; // PIN flow — funguje lokálně

    function traktGetClientId() {
      return localStorage.getItem('mf_trakt_client_id') || TRAKT_DEFAULT_CLIENT_ID;
    }
    function traktSaveClientId(val) {
      if (val.trim()) localStorage.setItem('mf_trakt_client_id', val.trim());
      else localStorage.removeItem('mf_trakt_client_id');
    }
    function getTraktTokenKey() {
      try { return 'mf_trakt_' + ((typeof getActiveProfileId === 'function' ? getActiveProfileId() : null) || 'default'); }
      catch(e) { return 'mf_trakt_default'; }
    }
    function traktGetToken() { return localStorage.getItem(getTraktTokenKey()); }
    function traktGetRefresh() { return localStorage.getItem(getTraktTokenKey() + '_refresh'); }
    function traktSaveSetting(key, val) { localStorage.setItem('mf_trakt_' + key, val ? '1' : '0'); }
    function traktGetSetting(key) { return localStorage.getItem('mf_trakt_' + key) !== '0'; }

    // ── OVERLAY ────────────────────────────────────────────
    function openTraktOverlay() {
      const el = document.getElementById('traktOverlay');
      el.classList.add('open');
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
      traktRefreshUI();
    }
    function closeTraktOverlay() {
      const el = document.getElementById('traktOverlay');
      el.classList.remove('visible');
      setTimeout(() => el.classList.remove('open'), 300);
    }

    // ── UI REFRESH ─────────────────────────────────────────
    function traktRefreshUI() {
      const token = traktGetToken();
      const fab = document.getElementById('traktFab');
      const connectSec = document.getElementById('traktConnectSection');
      const dashSec = document.getElementById('traktDashSection');
      const statusEl = document.getElementById('traktStatus');
      const statusText = document.getElementById('traktStatusText');
      const statusUser = document.getElementById('traktStatusUser');
      const clientInput = document.getElementById('traktClientIdInput');

      if (clientInput) clientInput.value = localStorage.getItem('mf_trakt_client_id') || '';

      // Restore toggle states
      const autoEl = document.getElementById('traktSyncAuto');
      const wlEl = document.getElementById('traktSyncWl');
      if (autoEl) autoEl.checked = traktGetSetting('autoSync');
      if (wlEl) wlEl.checked = traktGetSetting('syncWl');

      if (token) {
        fab && fab.classList.add('connected');
        connectSec && (connectSec.style.display = 'none');
        dashSec && (dashSec.style.display = 'block');
        statusEl && statusEl.classList.add('ok');
        if (statusText) statusText.textContent = 'Připojeno';
        const username = localStorage.getItem(getTraktTokenKey() + '_username');
        if (statusUser && username) statusUser.textContent = '@' + username;
        traktLoadStats();
      } else {
        fab && fab.classList.remove('connected');
        connectSec && (connectSec.style.display = 'block');
        dashSec && (dashSec.style.display = 'none');
        statusEl && statusEl.classList.remove('ok');
        if (statusText) statusText.textContent = 'Nepřipojen — propoj svůj Trakt účet';
        if (statusUser) statusUser.textContent = '';
      }
    }

    // ── AUTH: PIN FLOW ─────────────────────────────────────
    async function traktStartAuth() {
      const clientId = traktGetClientId();
      // Open Trakt authorize page
      const authUrl = `https://trakt.tv/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(TRAKT_REDIRECT)}`;
      window.open(authUrl, '_blank', 'noopener,width=600,height=700');
      // Show PIN input
      const pinWrap = document.getElementById('traktPinWrap');
      if (pinWrap) { pinWrap.classList.add('visible'); }
      const pinInput = document.getElementById('traktPinInput');
      if (pinInput) { setTimeout(() => pinInput.focus(), 300); }
      showToast('🔐 Přihlaste se na Trakt a zadejte PIN kód');
    }

    async function traktSubmitPin() {
      const pin = document.getElementById('traktPinInput')?.value?.trim();
      if (!pin || pin.length < 4) { showToast('⚠ Zadejte platný PIN kód'); return; }
      const clientId = traktGetClientId();
      showToast('⏳ Ověřuji PIN…');
      try {
        const res = await fetch(`${TRAKT_API}/oauth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'trakt-api-version': '2', 'trakt-api-key': clientId },
          body: JSON.stringify({
            code: pin,
            client_id: clientId,
            client_secret: '',   // prázdný pro public PIN flow
            redirect_uri: TRAKT_REDIRECT,
            grant_type: 'authorization_code'
          })
        });
        if (!res.ok) throw new Error('PIN neplatný nebo vypršel');
        const data = await res.json();
        localStorage.setItem(getTraktTokenKey(), data.access_token);
        if (data.refresh_token) localStorage.setItem(getTraktTokenKey() + '_refresh', data.refresh_token);
        // Fetch username
        await traktFetchMe(data.access_token, clientId);
        showToast('✅ Trakt.tv připojen!');
        traktRefreshUI();
        updateTraktSidebarLabel();
        aiTraktRefreshStatus();
        if (traktGetSetting('syncWl')) traktImportWatchlist();
      } catch(e) {
        showToast('❌ Chyba: ' + e.message);
      }
    }

    async function traktFetchMe(token, clientId) {
      try {
        const res = await fetch(`${TRAKT_API}/users/me`, {
          headers: {
            'Authorization': 'Bearer ' + token,
            'trakt-api-key': clientId,
            'trakt-api-version': '2',
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const me = await res.json();
          if (me.username) localStorage.setItem(getTraktTokenKey() + '_username', me.username);
        }
      } catch {}
    }

    // ── TRAKT API HELPER ───────────────────────────────────
    async function traktAPI(path, method = 'GET', body = null) {
      const token = traktGetToken();
      const clientId = traktGetClientId();
      if (!token) return null;
      const opts = {
        method,
        headers: {
          'Authorization': 'Bearer ' + token,
          'trakt-api-key': clientId,
          'trakt-api-version': '2',
          'Content-Type': 'application/json'
        }
      };
      if (body) opts.body = JSON.stringify(body);
      try {
        const res = await fetch(TRAKT_API + path, opts);
        if (res.status === 401) { traktHandleExpired(); return null; }
        if (res.status === 429) { console.warn('[Trakt] Rate limited - čekám 5s'); await new Promise(r => setTimeout(r, 5000)); return null; }
        if (!res.ok) return null;
        return res.status === 204 ? true : await res.json();
      } catch { return null; }
    }

    function traktHandleExpired() {
      localStorage.removeItem('mf_trakt_token');
      showToast('⚠ Trakt relace vypršela — znovu se přihlaš');
      traktRefreshUI();
    }

    // ── STATS ──────────────────────────────────────────────
    async function traktLoadStats() {
      const username = localStorage.getItem(getTraktTokenKey() + '_username');
      if (!username) return;
      const stats = await traktAPI(`/users/${username}/stats`);
      if (!stats) return;
      const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
      set('tstat-movies', stats.movies?.watched || 0);
      set('tstat-shows', stats.shows?.watched || 0);
      set('tstat-eps', stats.episodes?.watched || 0);
      const mins = stats.movies?.minutes || 0 + stats.episodes?.minutes || 0;
      set('tstat-hours', Math.round(mins / 60));
    }

    // ── SCROBBLE: označení epizody/filmu ──────────────────
    async function traktScrobbleEpisode(slug, season, episode) {
      if (!traktGetToken() || !traktGetSetting('autoSync')) return;
      const tmdbId = db[slug]?.tmdbId;
      if (!tmdbId) return;
      try {
        await traktAPI('/sync/history', 'POST', {
          shows: [{
            ids: { tmdb: tmdbId },
            seasons: [{ number: season, episodes: [{ number: episode }] }]
          }]
        });
      } catch {}
    }

    async function traktScrobbleMovie(tmdbId) {
      if (!traktGetToken() || !traktGetSetting('autoSync')) return;
      try {
        await traktAPI('/sync/history', 'POST', { movies: [{ ids: { tmdb: tmdbId } }] });
      } catch {}
    }

    // ── IMPORT TRAKT WATCHLIST → MujFlix ─────────────────
    async function traktImportWatchlist() {
      showToast('📋 Načítám Trakt Watchlist…');
      const [movies, shows] = await Promise.all([
        traktAPI('/sync/watchlist/movies'),
        traktAPI('/sync/watchlist/shows')
      ]);
      if (!movies && !shows) { showToast('⚠ Watchlist nepodařilo načíst'); return; }
      const wl = getWatchlist ? getWatchlist() : [];
      let added = 0;
      (movies || []).forEach(item => {
        const m = item.movie;
        if (!m) return;
        const name = m.title;
        if (!wl.some(w => w.name === name)) {
          wl.push({ name, type: 'movie', poster: '', trakt: true, tmdb: m.ids?.tmdb });
          added++;
        }
      });
      (shows || []).forEach(item => {
        const s = item.show;
        if (!s) return;
        const name = s.title;
        if (!wl.some(w => w.name === name)) {
          wl.push({ name, type: 'series', poster: '', trakt: true, tmdb: s.ids?.tmdb });
          added++;
        }
      });
      if (typeof saveWatchlistData === 'function') saveWatchlistData(wl);
      showToast(`✅ Načteno ${added} položek z Trakt Watchlistu`);
    }

    // ── IMPORT TRAKT HISTORY → MujFlix ───────────────────
    async function traktImportHistory() {
      showToast('📥 Načítám historii z Traktu…');
      const history = await traktAPI('/sync/history/shows?limit=1000');
      if (!history) { showToast('⚠ Historii se nepodařilo načíst'); return; }
      const watched = getWatched();
      let count = 0;
      history.forEach(item => {
        if (item.type !== 'episode') return;
        const show = item.show;
        const ep = item.episode;
        // Match by TMDB id
        const slug = Object.keys(db).find(k => db[k].tmdbId && db[k].tmdbId === show?.ids?.tmdb);
        if (!slug) return;
        const uid = `${slug}-S${ep.season}-E${ep.number}`;
        if (!watched[uid]) { watched[uid] = true; count++; }
      });
      saveWatched(watched);
      Object.keys(db).forEach(s => { updateTileProgress(s); updateContinueBadge(s); });
      if (activeSeries) { renderEpisodes(); updatePanelProgress(); }
      updateContinueWidget();
      showToast(`✅ Importováno ${count} epizod z Traktu`);
    }

    // ── FULL SYNC ──────────────────────────────────────────
    async function traktFullSync() {
      showToast('🔄 Synchronizuji s Traktem…');
      const statusEl = document.getElementById('traktStatus');
      if (statusEl) statusEl.classList.add('pending');

      // Export MujFlix watched → Trakt
      const watched = getWatched();
      const episodesToSync = [];
      Object.keys(watched).forEach(uid => {
        const parts = uid.match(/^(.+)-S(\d+)-E(\d+)$/);
        if (!parts) return;
        const [, slug, se, ep] = parts;
        const tmdbId = db[slug]?.tmdbId;
        if (!tmdbId) return;
        const existing = episodesToSync.find(s => s.ids.tmdb === tmdbId);
        const epObj = { number: parseInt(ep) };
        const seObj = { number: parseInt(se), episodes: [epObj] };
        if (existing) {
          const existSe = existing.seasons.find(s => s.number === parseInt(se));
          if (existSe) existSe.episodes.push(epObj);
          else existing.seasons.push(seObj);
        } else {
          episodesToSync.push({ ids: { tmdb: tmdbId }, seasons: [seObj] });
        }
      });

      if (episodesToSync.length > 0) {
        await traktAPI('/sync/history', 'POST', { shows: episodesToSync });
      }

      // Import Trakt watchlist
      if (traktGetSetting('syncWl')) await traktImportWatchlist();

      // Reload stats
      await traktLoadStats();
      if (statusEl) statusEl.classList.remove('pending');
      showToast(`✅ Sync dokončen — odesláno ${episodesToSync.length} seriálů`);
    }

    // ── DISCONNECT ─────────────────────────────────────────
    function traktDisconnect() {
      clearTraktToken();
      localStorage.removeItem(getTraktTokenKey() + '_refresh');
      localStorage.removeItem(getTraktTokenKey() + '_username');
      traktRefreshUI();
      showToast('Trakt.tv odpojen');
      closeTraktOverlay();
    }

    // ── HOOK INTO markWatched ─────────────────────────────
    // Patch markWatched to also sync to Trakt
    const _origMarkWatched = markWatched;
    markWatched = function(uid) {
      _origMarkWatched(uid);
      // Parse uid: "slug-S1-E3"
      const m = uid.match(/^(.+)-S(\d+)-E(\d+)$/);
      if (m) traktScrobbleEpisode(m[1], parseInt(m[2]), parseInt(m[3]));
    };

    // ── INIT ───────────────────────────────────────────────
    (function traktInit() {
      traktRefreshUI();
      // Restore client ID input if visible
      const ci = document.getElementById('traktClientIdInput');
      if (ci) ci.value = localStorage.getItem('mf_trakt_client_id') || '';
    })();

  


  // ── SERVICE WORKER (inline jako Blob, aby fungovalo z jednoho .html souboru) ──
  const SW_CODE = `
const CACHE = 'mujflix-v1';
const PRECACHE = [];

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(clients.claim()); });

// Push notifikace
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || 'MůjFlix';
  const options = {
    body: data.body || 'Nová epizoda čeká!',
    icon: data.icon || '',
    badge: data.badge || '',
    tag: data.tag || 'mujflix-notif',
    data: { url: data.url || './' },
    vibrate: [200, 100, 200],
    requireInteraction: false,
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// Klik na notifikaci → otevři MůjFlix
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = e.notification.data?.url || './';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls => {
      for (const c of cls) {
        if (c.url.includes(self.location.origin) && 'focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});
`;

  // Inline SW – vytvoříme Blob URL a zaregistrujeme
  async function initPWA() {
    if (!('serviceWorker' in navigator)) {
      // window.MF_DEBUG && console.log('[PWA] Service Worker není podporován');
      updatePwaBtn('unsupported'); return;
    }
    try {
      // Zkusíme najít existující registraci
      let reg = await navigator.serviceWorker.getRegistration('./');
      if (!reg) {
          // Blob URLs cannot be used as Service Worker scripts (browser security restriction).
        // Use a data: URL workaround for inline SW registration.
        // Service Worker nelze registrovat bez samostatného SW souboru.
        // Pro PWA funkčnost je potřeba nasadit sw.js vedle index.html.
        updatePwaBtn('unsupported'); return;
      }
      // Uložíme registraci globálně
      window._swReg = reg;
      // Zjistíme aktuální stav permission
      const perm = Notification.permission;
      if (perm === 'granted') {
        updatePwaBtn('granted');
      } else if (perm === 'denied') {
        updatePwaBtn('denied');
      } else {
        updatePwaBtn('default');
      }
    } catch(err) {
      console.warn('[PWA] SW error:', err);
      updatePwaBtn('error');
    }
  }

  function updatePwaBtn(state) {
    const btn = document.getElementById('pwaNotifBtn');
    const lbl = document.getElementById('pwaNotifBtnLbl');
    if (!btn || !lbl) return;
    const states = {
      default:     { text: 'Povolit push notifikace', color: 'rgba(100,200,255,0.9)',  bg: 'rgba(100,180,255,0.1)',  border: 'rgba(100,180,255,0.25)', icon: '🔔' },
      granted:     { text: 'Notifikace povoleny ✓',   color: 'rgba(80,220,120,0.9)',   bg: 'rgba(60,200,100,0.1)',   border: 'rgba(60,200,100,0.3)',   icon: '✅' },
      denied:      { text: 'Notifikace blokovány',    color: 'rgba(255,100,80,0.8)',   bg: 'rgba(255,80,60,0.08)',  border: 'rgba(255,80,60,0.25)',   icon: '🚫' },
      error:       { text: 'Notifikace nedostupné',   color: 'rgba(160,160,160,0.7)',  bg: 'rgba(150,150,150,0.06)', border: 'rgba(150,150,150,0.15)', icon: '⚠️' },
      unsupported: { text: 'Prohlížeč nepodporuje',   color: 'rgba(160,160,160,0.7)',  bg: 'rgba(150,150,150,0.06)', border: 'rgba(150,150,150,0.15)', icon: '⚠️' },
    };
    const s = states[state] || states.default;
    lbl.textContent = s.text;
    btn.style.color = s.color;
    btn.style.background = s.bg;
    btn.style.border = `1px solid ${s.border}`;
    btn.firstChild.textContent = s.icon + ' ';
    btn.disabled = (state === 'granted' || state === 'denied' || state === 'error' || state === 'unsupported');
  }

  async function requestPushPermission() {
    if (!('Notification' in window)) { showToast('⚠ Prohlížeč notifikace nepodporuje'); return; }
    if (Notification.permission === 'denied') {
      showToast('🚫 Notifikace jsou blokovány — odblokuj je v nastavení prohlížeče');
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      updatePwaBtn('granted');
      showToast('✅ Notifikace povoleny! MůjFlix tě upozorní na nové epizody.');
      // Testovací notifikace
      setTimeout(() => {
        if (window._swReg) {
          window._swReg.showNotification('MůjFlix 🎬', {
            body: 'Notifikace fungují! Budeme tě informovat o nových epizodách.',
            tag: 'mujflix-test',
            icon: '',
            vibrate: [200, 100, 200],
          });
        } else {
          new Notification('MůjFlix 🎬', { body: 'Notifikace fungují!' });
        }
      }, 800);
    } else if (perm === 'denied') {
      updatePwaBtn('denied');
      showToast('🚫 Notifikace blokovány — povol je v nastavení prohlížeče');
    }
  }

  // Interní helper — zavolej kdykoli chceš poslat notifikaci z kódu
  // Příklad: mfNotify('Simpsons S37E05', 'Nová epizoda právě vyšla!', 'the-simpsons')
  window.mfNotify = function(title, body, slug) {
    if (Notification.permission !== 'granted') return;
    const notifOpts = {
      body,
      tag: 'mujflix-' + (slug || 'general'),
      icon: '',
      data: { url: './?open=' + (slug || '') },
      vibrate: [200, 100, 200],
    };
    if (window._swReg) {
      window._swReg.showNotification(title, notifOpts);
    } else {
      new Notification(title, notifOpts);
    }
  };

  // Po startu — pokud máme nové epizody a notifikace povoleny, notifikuj
  const _origCheckNewEps = typeof checkNewEpisodes === 'function' ? checkNewEpisodes : null;
  


    /* ══ NEW SPINNING DRUM — vertical poster wheel in main ruleta overlay ══ */
    
    // Series data for the main drum
    const DRUM_SERIES = [];
    const DRUM_ITEM_H = 80;
    let _drumOffset = 0;
    let _drumAnimId = null;
    let _drumSpinning = false;
    let _drumWinner = null;
    function initSpinDrum() { _drumSpinning = false; }
    function spinDrum() {}
    function _onDrumStop() {}
    const SERIES_DATA = [];
    // (SlotMachineRoulette replaced by casino wheel)
    const roulette = { spin: function() { if(typeof spinRuleta !== 'undefined') spinRuleta(); } };
    
    // Klávesové zkratky - centralizovaný event listener
    document.addEventListener('keydown', (e) => {
      // R = Toggle Roulette
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        const overlay = document.getElementById('ruletaOverlay');
        if (overlay && overlay.classList.contains('open')) {
          closeRuleta();
        } else {
          openRuleta();
        }
      }
      // V = Start Voice listening
      else if (e.key === 'v' || e.key === 'V') {
        speechManager.startListening();
      }
      // M = Mute (stop listening)
      else if (e.key === 'm' || e.key === 'M') {
        speechManager.stopListening();
      }
    });

    /* ══════════════════════════════════════════════════════════════════════
       SPEECH RECOGNITION + TEXT-TO-SPEECH (TTS)
       Pro dokonalé diktování a mluvení s AI
    ══════════════════════════════════════════════════════════════════════ */
    
    // ══════════════════════════════════════════════════════════════════
    // PROFILE GATE SYSTEM — Netflix-style multi-profile
    // ══════════════════════════════════════════════════════════════════

    const PROFILES_KEY   = 'mf_profiles_v2';
    const ACTIVE_PID_KEY = 'mf_active_pid';

    // Palette for profile colors
    const PROFILE_COLORS = [
      '#007AFF','#ff6b6b','#4ecdc4','#a29bfe','#fd79a8',
      '#fdcb6e','#6c5ce7','#00b894','#e17055','#74b9ff'
    ];
    const PROFILE_EMOJIS = [
      '🎬','🍿','🎭','🎪','🎡','🃏','🎲','🎰',
      '🦁','🐺','🦊','🐸','👾','🤖','🦸','🧙',
      '🧛','🤡','👻','🤩','😎','🥷','🦄','🐉'
    ];

    // ── Storage helpers ──────────────────────────────────────────────
    function _getProfiles() {
      try { return safeLS(PROFILES_KEY, '[]'); } catch(e) { return []; }
    }
    function _saveProfiles(arr) {
      try { localStorage.setItem(PROFILES_KEY, JSON.stringify(arr)); } catch(e) {}
    }
    function getActiveProfileId() {
      return localStorage.getItem(ACTIVE_PID_KEY) || null;
    }
    function getActiveProfile() {
      const pid = getActiveProfileId();
      if (!pid) return null;
      return _getProfiles().find(p => p.id === pid) || null;
    }
    // Per-profile localStorage key
    function uKey(base) {
      const pid = getActiveProfileId();
      return pid ? base + '_' + pid : base;
    }

    // ── Compatibility shims (old code still calls these) ─────────────
    function getActiveUser()   { return getActiveProfile(); }
    function getActiveUserId() { return getActiveProfileId(); }
    function setActiveUser(uid) {
      localStorage.setItem(ACTIVE_PID_KEY, uid);
      ProfileGate.renderBadge();
      _applyProfileAccent();
    }
    function createUser(name, avatar) {
      return ProfileGate.createProfile({ name, avatar: avatar || '🎬', color: PROFILE_COLORS[0] });
    }
    function updateUser(uid, patch) {
      const arr = _getProfiles();
      const idx = arr.findIndex(p => p.id === uid);
      if (idx < 0) return;
      arr[idx] = { ...arr[idx], ...patch };
      _saveProfiles(arr);
    }
    function updateUserPrefs(uid, prefPatch) {
      const arr = _getProfiles();
      const idx = arr.findIndex(p => p.id === uid);
      if (idx < 0) return;
      if (!arr[idx].prefs) arr[idx].prefs = {};
      arr[idx].prefs = { ...arr[idx].prefs, ...prefPatch };
      _saveProfiles(arr);
    }
    function updateUserFeature(uid, feature, value) {
      const arr = _getProfiles();
      const idx = arr.findIndex(p => p.id === uid);
      if (idx < 0) return;
      if (!arr[idx].prefs) arr[idx].prefs = {};
      if (!arr[idx].prefs.features) arr[idx].prefs.features = {};
      arr[idx].prefs.features[feature] = value;
      _saveProfiles(arr);
      _applyProfileAccent();
    }
    function addToUserHistory(item) {
      const pid = getActiveProfileId();
      if (!pid) return;
      const arr = _getProfiles();
      const idx = arr.findIndex(p => p.id === pid);
      if (idx < 0) return;
      const entry = {
        id: item.id, type: item.media_type || 'movie',
        name: item.title || item.name || '',
        genres: item.genre_ids || [],
        rating: item.vote_average || 0,
        ts: Date.now(),
      };
      if (!arr[idx].history) arr[idx].history = [];
      arr[idx].history = [entry, ...arr[idx].history.filter(h => h.id !== item.id)].slice(0, 200);
      const gc = {};
      arr[idx].history.forEach(h => (h.genres||[]).forEach(g => { gc[g] = (gc[g]||0)+1; }));
      arr[idx].likedGenres = Object.entries(gc).sort((a,b)=>b[1]-a[1]).slice(0,5).map(e=>+e[0]);
      // Také aktualizuj aiBrain genreIdPrefs pro aktivní profil
      if (getActiveProfileId() === pid && typeof aiBrain !== 'undefined') {
        aiBrain.boostGenreIds(entry.genres || [], 0.04);
      }
      _saveProfiles(arr);
    }
    function deleteUser(uid) {
      if (!confirm('Smazat profil?')) return;
      const arr = _getProfiles().filter(p => p.id !== uid);
      _saveProfiles(arr);
      if (getActiveProfileId() === uid) {
        if (arr.length) setActiveUser(arr[0].id);
        else localStorage.removeItem(ACTIVE_PID_KEY);
      }
      ProfileGate.renderBadge();
      // re-open gate if no active profile
      if (!getActiveProfileId()) ProfileGate.show();
    }
    function _getUserDB() {
      // Legacy shim — returns profiles as map
      const obj = {};
      _getProfiles().forEach(p => { obj[p.id] = p; });
      return obj;
    }
    function _saveUserDB(obj) {
      _saveProfiles(Object.values(obj));
    }

    // ── Apply profile accent color to CSS ────────────────────────────
    function _applyProfileAccent() {
      const p = getActiveProfile();
      const color = p?.color || '#007AFF';
      document.documentElement.style.setProperty('--accent', color);
      // Derive accent2 (slightly lighter)
      document.documentElement.style.setProperty('--accent2', color);
      // Update badge border
      const badge = document.getElementById('mfProfileBadge');
      if (badge) {
        badge.style.borderColor = color + '44';
        const av = badge.querySelector('.mpb-avatar');
        if (av) av.style.borderColor = color + '88';
      }
      // Update bg-glow to match profile color
      const glow = document.querySelector('.bg-glow');
      if (glow) {
        const r = parseInt(color.slice(1,3),16);
        const g = parseInt(color.slice(3,5),16);
        const b = parseInt(color.slice(5,7),16);
        glow.style.background = `
          radial-gradient(ellipse 70% 55% at 15% 15%, rgba(${r},${g},${b},0.07) 0%, transparent 65%),
          radial-gradient(ellipse 55% 65% at 85% 85%, rgba(60,80,255,0.05) 0%, transparent 65%),
          radial-gradient(ellipse 40% 40% at 50% 100%, rgba(${r},${g},${b},0.03) 0%, transparent 70%)`;
      }
    }

    // Apply current user's feature preferences to the UI
    function _applyUserPreferences() {
      const p = getActiveProfile();
      if (!p) return;
      const f = p.prefs?.features || {};
      if (typeof _setSoundEnabled === 'function') _setSoundEnabled(f.soundEnabled !== false);
      const overlay = document.getElementById('ruletaOverlay');
      if (overlay) overlay.setAttribute('data-theme', f.darkGold !== false ? 'gold' : 'accent');
    }

    // User-aware TMDB fetch
    async function _userAwareFetch(filter) {
      const p = getActiveProfile();
      const likedGenres = p?.likedGenres || [];
      const contentPref = p?.prefs?.contentPref || filter || 'all';
      const algo = p?.prefs?.algo || { trending: 0.4, topRated: 0.3, watchlistBased: 0.3 };
      const page = Math.floor(Math.random() * 6) + 1;
      let results = [];
      try {
        if (likedGenres.length && Math.random() < (algo.watchlistBased + algo.topRated) * 1.2) {
          const genreStr = likedGenres.slice(0,3).join(',');
          if (contentPref !== 'tv') {
            const r = await tmdbGet(`/discover/movie?with_genres=${genreStr}&sort_by=vote_average.desc&vote_count.gte=200&page=${page}`);
            (r?.results||[]).filter(m=>m.poster_path).forEach(m => results.push({...m,media_type:'movie',_personalised:true}));
          }
          if (contentPref !== 'movie') {
            const r = await tmdbGet(`/discover/tv?with_genres=${genreStr}&sort_by=vote_average.desc&vote_count.gte=100&page=${page}`);
            (r?.results||[]).filter(t=>t.poster_path).forEach(t => results.push({...t,media_type:'tv',_personalised:true}));
          }
        }
        if (Math.random() < algo.trending) {
          const r = await tmdbGet(`/trending/${contentPref==='movie'?'movie':contentPref==='tv'?'tv':'all'}/week?language=cs&page=${page}`);
          (r?.results||[]).filter(x=>x.poster_path&&(x.media_type==='movie'||x.media_type==='tv')).forEach(x=>results.push(x));
        }
        if (Math.random() < algo.topRated) {
          if (contentPref !== 'tv') {
            const r = await tmdbGet(`/movie/top_rated?language=cs&page=${page}`);
            (r?.results||[]).filter(m=>m.poster_path).forEach(m=>results.push({...m,media_type:'movie'}));
          }
          if (contentPref !== 'movie') {
            const r = await tmdbGet(`/tv/top_rated?language=cs&page=${page}`);
            (r?.results||[]).filter(t=>t.poster_path).forEach(t=>results.push({...t,media_type:'tv'}));
          }
        }
      } catch(e) {}
      return results;
    }

    function _saveAlgoWeight(key, value) {
      const pid = getActiveProfileId(); if (!pid) return;
      const arr = _getProfiles();
      const idx = arr.findIndex(p => p.id === pid); if (idx < 0) return;
      if (!arr[idx].prefs) arr[idx].prefs = {};
      if (!arr[idx].prefs.algo) arr[idx].prefs.algo = {};
      arr[idx].prefs.algo[key] = +value;
      _saveProfiles(arr);
    }
    function _saveContentPref(val, btn) {
      const pid = getActiveProfileId(); if (!pid) return;
      updateUserPrefs(pid, { contentPref: val });
      _ruletaPool = null;
      btn.closest('div').querySelectorAll('button').forEach(b => {
        const sel = b.dataset.pref === val;
        b.style.borderColor = sel ? 'rgba(200,164,0,0.5)' : 'rgba(255,255,255,0.1)';
        b.style.background  = sel ? 'rgba(200,164,0,0.12)' : 'rgba(255,255,255,0.03)';
        b.style.color       = sel ? '#c8a400' : 'rgba(255,255,255,0.5)';
      });
    }

    // ── Per-profile Trakt.tv token storage ──────────────────────────
    // getTraktTokenKey defined earlier with try/catch
    function getTraktToken() {
      try { return JSON.parse(localStorage.getItem(getTraktTokenKey())); } catch(e) { return null; }
    }
    function saveTraktToken(data) {
      try { localStorage.setItem(getTraktTokenKey(), JSON.stringify(data)); } catch(e) {}
    }
    function clearTraktToken() {
      try { localStorage.removeItem(getTraktTokenKey()); } catch(e) {}
    }

    // ══════════════════════════════════════════════════════════════════
    // ProfileGate — Netflix-style profile picker
    // ══════════════════════════════════════════════════════════════════
    const ProfileGate = {
      _pinBuffer: '',
      _pinTargetId: null,
      _editingId: null,
      _selectedEmoji: PROFILE_EMOJIS[0],
      _selectedColor: PROFILE_COLORS[0],

      // Show the fullscreen gate
      show() {
        const gate = document.getElementById('mfProfileGate');
        if (gate) { gate.style.display = 'flex'; gate.classList.remove('hiding'); }
        this.renderGate();
      },

      // Hide the gate (animate out)
      hide() {
        const gate = document.getElementById('mfProfileGate');
        if (!gate) return;
        gate.classList.add('hiding');
        setTimeout(() => { gate.style.display = 'none'; }, 520);
      },

      // Render profiles list inside the gate
      renderGate() {
        const list = document.getElementById('pgProfilesList');
        if (!list) return;
        const profiles = _getProfiles();
        list.innerHTML = '';
        profiles.forEach(p => {
          const item = document.createElement('div');
          item.className = 'pg-profile-item';
          item.innerHTML = `
            <div class="pg-avatar" style="--pg-color:${p.color||'#007AFF'};${getActiveProfileId()===p.id?'border-color:'+p.color+';box-shadow:0 0 0 1px '+p.color+',0 8px 40px rgba(0,0,0,0.6);':''}">
              ${p.avatar || '🎬'}
            </div>
            <div class="pg-name">${p.name}</div>
          `;
          item.onclick = () => this.selectProfile(p.id);
          list.appendChild(item);
        });
        // Add button
        const addItem = document.createElement('div');
        addItem.className = 'pg-profile-item';
        addItem.innerHTML = `
          <div class="pg-add-btn">＋</div>
          <div class="pg-name" style="color:rgba(255,255,255,0.35)">Přidat profil</div>
        `;
        addItem.onclick = () => this.openCreate();
        list.appendChild(addItem);
      },

      // User clicks a profile
      selectProfile(pid) {
        const profiles = _getProfiles();
        const p = profiles.find(x => x.id === pid);
        if (!p) return;
        if (p.pin) {
          this.openPin(p);
        } else {
          this.activateProfile(pid);
        }
      },

      activateProfile(pid) {
        localStorage.setItem(ACTIVE_PID_KEY, pid);
        this.renderBadge();
        _applyProfileAccent();
        _applyUserPreferences();
        this.hide();
        this.closePin();
        // Refresh UI after profile switch
        setTimeout(() => {
          // ── Znovu načti AI paměť pro nový profil ──
          if (typeof aiBrain !== 'undefined') aiBrain.reloadForProfile();
          if (typeof refreshUserContent === 'function') refreshUserContent();
          if (typeof updateWatchlistBadge === 'function') updateWatchlistBadge();
          if (typeof updateWatchlistBtns === 'function') updateWatchlistBtns();
          if (typeof updateLogoProgress === 'function') updateLogoProgress();
          if (typeof updateContinueWidget === 'function') updateContinueWidget();
        }, 100);
        const p = _getProfiles().find(x => x.id === pid);
        if (p && typeof showToast === 'function') showToast('👤 Vítej, ' + p.name + '!', 'success');
      },

      // ── PIN flow ──────────────────────────────────────────────────
      openPin(profile) {
        this._pinBuffer = '';
        this._pinTargetId = profile.id;
        const modal = document.getElementById('mfPinModal');
        if (!modal) return;
        document.getElementById('pmAvatar').textContent = profile.avatar || '🎬';
        document.getElementById('pmTitle').textContent = profile.name;
        modal.classList.add('show');
        this._renderPinDots();
      },
      closePin() {
        this._pinBuffer = '';
        this._pinTargetId = null;
        const modal = document.getElementById('mfPinModal');
        if (modal) modal.classList.remove('show');
        this._renderPinDots();
      },
      pinInput(val) {
        if (val === 'back') {
          this._pinBuffer = this._pinBuffer.slice(0,-1);
        } else if (this._pinBuffer.length < 4) {
          this._pinBuffer += val;
        }
        this._renderPinDots();
        if (this._pinBuffer.length === 4) {
          setTimeout(() => this._checkPin(), 120);
        }
      },
      _renderPinDots(state) {
        for (let i = 0; i < 4; i++) {
          const dot = document.getElementById('pmd' + i);
          if (!dot) continue;
          dot.className = 'pm-dot';
          if (i < this._pinBuffer.length) dot.classList.add('filled');
          if (state === 'error') dot.classList.add('error');
        }
      },
      _checkPin() {
        const profiles = _getProfiles();
        const p = profiles.find(x => x.id === this._pinTargetId);
        if (!p) return;
        if (this._pinBuffer === p.pin) {
          this.activateProfile(p.id);
        } else {
          this._renderPinDots('error');
          setTimeout(() => {
            this._pinBuffer = '';
            this._renderPinDots();
          }, 700);
        }
      },

      // ── Create / Edit modal ───────────────────────────────────────
      openCreate(editId) {
        this._editingId = editId || null;
        this._selectedEmoji = PROFILE_EMOJIS[0];
        this._selectedColor = PROFILE_COLORS[0];

        const modal = document.getElementById('mfProfileCreate');
        if (!modal) return;

        // Title
        document.getElementById('pcModalTitle').textContent = editId ? 'Upravit profil' : 'Nový profil';

        // Name
        const nameEl = document.getElementById('pcName');
        if (editId) {
          const p = _getProfiles().find(x => x.id === editId);
          if (p) {
            nameEl.value = p.name;
            this._selectedEmoji = p.avatar || PROFILE_EMOJIS[0];
            this._selectedColor = p.color || PROFILE_COLORS[0];
          }
        } else {
          nameEl.value = '';
        }

        // Emoji grid
        const grid = document.getElementById('pcEmojiGrid');
        grid.innerHTML = PROFILE_EMOJIS.map(e =>
          `<button class="pc-emoji-btn${e === this._selectedEmoji ? ' selected' : ''}" onclick="ProfileGate._pickEmoji('${e}',this)">${e}</button>`
        ).join('');

        // Color swatches
        const colorRow = document.getElementById('pcColorRow');
        colorRow.innerHTML = PROFILE_COLORS.map(c =>
          `<div class="pc-color-swatch${c === this._selectedColor ? ' selected' : ''}" style="background:${c}" onclick="ProfileGate._pickColor('${c}',this)" title="${c}"></div>`
        ).join('');

        // PIN digits clear
        ['pcPin0','pcPin1','pcPin2','pcPin3'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = '';
        });

        modal.classList.add('show');
        setTimeout(() => nameEl.focus(), 100);
      },
      closeCreate() {
        const modal = document.getElementById('mfProfileCreate');
        if (modal) modal.classList.remove('show');
        this._editingId = null;
      },
      _pickEmoji(emoji, btn) {
        this._selectedEmoji = emoji;
        document.querySelectorAll('.pc-emoji-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      },
      _pickColor(color, el) {
        this._selectedColor = color;
        document.querySelectorAll('.pc-color-swatch').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
      },
      pinDigitNav(input, idx) {
        if (input.value && idx < 3) {
          const next = document.getElementById('pcPin' + (idx+1));
          if (next) next.focus();
        }
      },
      saveProfile() {
        const name = (document.getElementById('pcName')?.value || '').trim();
        if (!name) {
          const el = document.getElementById('pcName');
          if (el) { el.style.borderColor = 'rgba(255,80,80,0.5)'; el.focus(); }
          return;
        }
        const pinDigits = ['pcPin0','pcPin1','pcPin2','pcPin3']
          .map(id => document.getElementById(id)?.value || '').join('');
        const pin = pinDigits.length === 4 && /^\d{4}$/.test(pinDigits) ? pinDigits : null;

        const profiles = _getProfiles();
        if (this._editingId) {
          const idx = profiles.findIndex(p => p.id === this._editingId);
          if (idx >= 0) {
            profiles[idx].name  = name;
            profiles[idx].avatar = this._selectedEmoji;
            profiles[idx].color  = this._selectedColor;
            if (pin) profiles[idx].pin = pin;
            _saveProfiles(profiles);
          }
          this.closeCreate();
          this.renderGate();
          this.renderBadge();
        } else {
          const pid = this.createProfile({ name, avatar: this._selectedEmoji, color: this._selectedColor, pin });
          this.closeCreate();
          this.activateProfile(pid);
        }
      },
      createProfile({ name, avatar, color, pin }) {
        const pid = 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
        const profiles = _getProfiles();
        profiles.push({
          id: pid, name, avatar: avatar || '🎬',
          color: color || PROFILE_COLORS[0],
          pin: pin || null,
          created: Date.now(),
          history: [],
          likedGenres: [],
          prefs: {
            algo: { trending: 0.4, topRated: 0.3, watchlistBased: 0.3 },
            features: { showTrailer:true, showRating:true, confettiOnWin:true, soundEnabled:true, darkGold:true, ruletaAutoOpen:false },
            contentPref: 'all',
            lang: 'cs',
          },
          trakt: null, // { accessToken, refreshToken, expiresAt, username }
        });
        _saveProfiles(profiles);
        return pid;
      },

      // ── Profile badge (top-right switcher) ───────────────────────
      renderBadge() {
        const p = getActiveProfile();
        // Remove old dynamically created badge
        const oldBadge = document.getElementById('_mfUserBadge');
        if (oldBadge) oldBadge.remove();

        let badge = document.getElementById('mfProfileBadge');
        if (!badge) {
          badge = document.createElement('div');
          badge.id = 'mfProfileBadge';
          badge.onclick = () => ProfileGate.show();
          document.body.appendChild(badge);
        }
        if (p) {
          badge.style.borderColor = (p.color || '#007AFF') + '44';
          badge.innerHTML = `
            <div class="mpb-avatar" style="border-color:${p.color||'#007AFF'}88">${p.avatar||'🎬'}</div>
            <span class="mpb-name">${p.name}</span>
            <span class="mpb-arrow">▼</span>
          `;
        } else {
          badge.style.borderColor = 'rgba(255,255,255,0.1)';
          badge.innerHTML = `<div class="mpb-avatar">👤</div><span class="mpb-name">Profil</span><span class="mpb-arrow">▼</span>`;
        }
      },
    };

    // shim for old _renderUserBadge calls
    function _renderUserBadge() { ProfileGate.renderBadge(); }
    function openUserPanel()    { ProfileGate.show(); }
    function closeUserPanel()   {}

    function refreshUserContent() {
      if (typeof db !== 'undefined') {
        Object.keys(db).forEach(s => {
          if (typeof updateTileProgress === 'function') updateTileProgress(s);
          if (typeof updateContinueBadge === 'function') updateContinueBadge(s);
        });
      }
      if (typeof updateContinueWidget === 'function') updateContinueWidget();
      if (typeof updateLogoProgress === 'function') updateLogoProgress();
      if (typeof updateWatchlistBadge === 'function') updateWatchlistBadge();
      if (typeof updateWatchlistBtns === 'function') updateWatchlistBtns();
    }

    // ── Boot ─────────────────────────────────────────────────────────
    (function _initProfileSystem() {
      const profiles = _getProfiles();
      // Migrate old user system if needed
      try {
        const oldDB = safeLS('mujflix_users_v1', '{}');
        const oldKeys = Object.keys(oldDB);
        if (oldKeys.length && profiles.length === 0) {
          oldKeys.forEach(uid => {
            const u = oldDB[uid];
            const pid = 'p_' + uid;
            const migrated = {
              id: pid, name: u.name || 'Uživatel', avatar: u.avatar || '🎬',
              color: PROFILE_COLORS[0], pin: null, created: u.created || Date.now(),
              history: u.history || [], likedGenres: u.likedGenres || [],
              prefs: u.prefs || {}, trakt: null,
            };
            _getProfiles(); // side-load
            const arr2 = _getProfiles();
            arr2.push(migrated);
            _saveProfiles(arr2);
          });
          // Migrate active user
          const oldActive = localStorage.getItem('mujflix_active_user');
          if (oldActive) localStorage.setItem(ACTIVE_PID_KEY, 'p_' + oldActive);
        }
      } catch(e) {}

      const currentProfiles = _getProfiles();

      ProfileGate.renderBadge();

      // ── Vždy zobraz výběr profilu při každém reloadu ──
      // (pokud existují profily, zobrazíme gate; bez profilů taky, aby si vytvořil první)
      const gate = document.getElementById('mfProfileGate');
      if (gate) gate.style.display = 'none'; // skryj napřed, show() ho otevře animovaně
      // Krátké zpoždění aby se stránka stihla vyrenderovat před animací gate
      setTimeout(() => {
        ProfileGate.show();
        // Nastav barvy posledního aktivního profilu jako preview, i když ještě nevybral
        const lastPid = getActiveProfileId();
        if (lastPid && currentProfiles.find(p => p.id === lastPid)) {
          _applyProfileAccent();
          _applyUserPreferences();
        }
      }, 80);
    })();

        class SpeechManager {
      constructor() {
        // Web Speech API - Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'cs-CZ'; // Čeština
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        
        // Text-to-Speech (TTS)
        this.synth = window.speechSynthesis;
        this.isSpeaking = false;
        this.isListening = false;
        
        this.setupRecognitionListeners();
      }
      
      setupRecognitionListeners() {
        this.recognition.onstart = () => {
          window.MF_DEBUG && console.log('🎤 Poslechávám...');
          this.isListening = true;
          document.body.classList.add('listening');
          const micBtn = document.getElementById('speechMicBtn');
          if (micBtn) micBtn.classList.add('listening');
        };
        
        this.recognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          window.MF_DEBUG && console.log('📝 Text:', transcript);
          
          if (event.isFinal) {
            this.handleSpeechResult(transcript);
          }
        };
        
        this.recognition.onerror = (event) => {
          console.error('❌ Chyba sluchačky:', event.error);
        };
        
        this.recognition.onend = () => {
          window.MF_DEBUG && console.log('🔇 Přestaly jsem poslouchat');
          this.isListening = false;
          document.body.classList.remove('listening');
          const micBtn = document.getElementById('speechMicBtn');
          if (micBtn) micBtn.classList.remove('listening');
        };
      }
      
      // Spustit naslouchání
      startListening() {
        if (!this.isListening) {
          this.recognition.start();
        }
      }
      
      // Zastavit naslouchání
      stopListening() {
        this.recognition.stop();
      }
      
      // Mluvit text (TTS)
      speak(text, lang = 'cs-CZ', rate = 1.0) {
        if (this.isSpeaking) {
          this.synth.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        // Show 3D bubble while speaking
        if (typeof aiBubbleShow === 'function') aiBubbleShow(utterance);
        utterance.lang = lang;
        utterance.rate = rate; // 0.5 - 2.0
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onstart = () => {
          window.MF_DEBUG && console.log('🔊 Mluvím:', text);
          this.isSpeaking = true;
        };
        
        utterance.onend = () => {
          window.MF_DEBUG && console.log('✅ Skončil jsem mluvit');
          this.isSpeaking = false;
        };
        
        utterance.onerror = (event) => {
          console.error('❌ Chyba TTS:', event.error);
        };
        
        this.synth.speak(utterance);
      }
      
      // Zpracovat text ze sluchačky
      handleSpeechResult(text) {
        window.MF_DEBUG && console.log('🎯 Zpracovávám:', text);
        
        // Příklady příkazů:
        if (text.toLowerCase().includes('simpsons') || text.toLowerCase().includes('simpsonovi')) {
          this.speak('Otevírám The Simpsons!');
          if (typeof openSeries === 'function') {
            openSeries('the-simpsons');
          }
        }
        else if (text.toLowerCase().includes('south park')) {
          this.speak('South Park se otevírá!');
          if (typeof openSeries === 'function') {
            openSeries('south-park');
          }
        }
        else if (text.toLowerCase().includes('family guy')) {
          this.speak('Family Guy, tady jsem!');
          if (typeof openSeries === 'function') {
            openSeries('family-guy');
          }
        }
        else if (text.toLowerCase().includes('futurama')) {
          this.speak('Futurama se otevírá!');
          if (typeof openSeries === 'function') {
            openSeries('futurama');
          }
        }
        else if (text.toLowerCase().includes('ruleta') || text.toLowerCase().includes('zatočit')) {
          this.speak('Zatáčím ruletou!');
          if (typeof roulette !== 'undefined' && roulette.spin) {
            roulette.spin();
          }
        }
        else {
          // Obecný příkaz - jen opakuj, co řekl
          this.speak('Pochopil jsem: ' + text);
        }
      }
    }
    
    // Globální instance
    const speechManager = new SpeechManager();
    
    // TMDB posters preloaded at page start
    
    // Testovací příkazy - smaž pokud nechceš
    console.log('🎤 Speech Manager zaregistrován!');
    console.log('💡 Zkratky: V = start listening, M = stop, R = roulette');
    // speechManager.speak('Ahoj! Já jsem tvůj AI asistent. Co si chceš koukat?'); // Decomment pro uvítání
  


  (function() {
    const canvas = document.getElementById('ai-bubble-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 320, H = 320, CX = W/2, CY = H/2, R = 110;
    canvas.width = W; canvas.height = H;

    let _active = false, _animId = null;
    let _amplitude = 0, _targetAmp = 0;
    let _phase = 0, _hue = 65;
    let _lastFrame = 0;
    const _FPS_IDLE = 1000 / 20;  // 20fps idle
    const _FPS_ACTIVE = 1000 / 50; // 50fps active

    function sn(x, y, t) {
      return (Math.sin(x * 2.1 + t) * Math.cos(y * 1.7 + t * 0.7) +
              Math.sin(x * 3.4 - t * 1.1) * Math.sin(y * 2.9 + t * 0.5)) * 0.5;
    }

    function draw(ts) {
      _animId = requestAnimationFrame(draw);
      // Throttle: nepřekreslovej každý frame pokud je idle
      if (document.hidden) return; // stránka není vidět
      const limit = _active ? _FPS_ACTIVE : _FPS_IDLE;
      if (ts - _lastFrame < limit) return;
      _lastFrame = ts;
      ctx.clearRect(0, 0, W, H);
      _phase += 0.018 + _amplitude * 0.06;
      _amplitude += (_targetAmp - _amplitude) * 0.12;

      ctx.save();
      ctx.translate(CX, CY);

      // Glow rings behind blob
      for (let layer = 3; layer >= 0; layer--) {
        const lr = R * (1.05 + _amplitude * 0.18) + layer * 18;
        const alpha = 0.06 - layer * 0.012;
        const grad = ctx.createRadialGradient(0, 0, lr * 0.3, 0, 0, lr);
        grad.addColorStop(0, 'hsla(' + _hue + ',100%,75%,' + (alpha + _amplitude * 0.08) + ')');
        grad.addColorStop(1, 'hsla(' + (_hue+30) + ',80%,50%,0)');
        ctx.beginPath(); ctx.arc(0, 0, lr, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();
      }

      // Blob path
      const pts = 128;
      ctx.beginPath();
      for (let i = 0; i <= pts; i++) {
        const angle = (i / pts) * Math.PI * 2;
        const ax = Math.cos(angle), ay = Math.sin(angle);
        const n = sn(ax, ay, _phase) * (0.08 + _amplitude * 0.22);
        const r2 = R * (1 + n);
        const x = ax * r2, y = ay * r2;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Main fill gradient
      const bg = ctx.createRadialGradient(-R*0.28,-R*0.32,R*0.05, 0,0, R*1.15);
      bg.addColorStop(0,   'hsla(' + (_hue+15) + ',100%,92%,0.98)');
      bg.addColorStop(0.25,'hsla(' + _hue      + ',100%,68%,0.95)');
      bg.addColorStop(0.55,'hsla(' + (_hue-10) + ',90%,42%,0.92)');
      bg.addColorStop(0.82,'hsla(' + (_hue-25) + ',80%,18%,0.97)');
      bg.addColorStop(1,   'hsla(' + (_hue-35) + ',70%,8%,1)');
      ctx.fillStyle = bg; ctx.fill();

      // Specular + rim light
      ctx.save(); ctx.clip();
      const sp = ctx.createRadialGradient(-R*0.38,-R*0.42,0, -R*0.2,-R*0.2, R*0.65);
      sp.addColorStop(0,   'rgba(255,255,255,0.75)');
      sp.addColorStop(0.35,'rgba(255,255,255,0.18)');
      sp.addColorStop(1,   'rgba(255,255,255,0)');
      ctx.fillStyle = sp; ctx.fillRect(-W/2,-H/2,W,H);
      const rim = ctx.createRadialGradient(R*0.5,R*0.55,0, R*0.3,R*0.4, R*0.6);
      rim.addColorStop(0,  'hsla(' + (_hue+40) + ',100%,85%,' + (0.12+_amplitude*0.18) + ')');
      rim.addColorStop(1,  'rgba(0,0,0,0)');
      ctx.fillStyle = rim; ctx.fillRect(-W/2,-H/2,W,H);
      ctx.restore();

      // Voice waves
      if (_amplitude > 0.04) {
        for (let w = 0; w < 3; w++) {
          const wp = (_phase * 2.5 + w * 1.2) % (Math.PI * 2);
          const wR = R * (1.05 + w * 0.12 + Math.sin(wp) * 0.06 * _amplitude);
          const wA = _amplitude * (0.35 - w * 0.1) * Math.abs(Math.sin(wp * 0.5));
          ctx.beginPath(); ctx.arc(0, 0, wR, 0, Math.PI * 2);
          ctx.strokeStyle = 'hsla(' + _hue + ',100%,70%,' + wA + ')';
          ctx.lineWidth = 1.5 - w * 0.4; ctx.stroke();
        }
      }

      // Inner glow
      const ig = ctx.createRadialGradient(0,0,0, 0,0, R*0.7);
      ig.addColorStop(0, 'hsla(' + (_hue+10) + ',100%,85%,' + (0.05+_amplitude*0.25) + ')');
      ig.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(0,0,R*0.7,0,Math.PI*2);
      ctx.fillStyle = ig; ctx.fill();

      ctx.restore();
    }

    function hookTTS(utt) {
      let _speaking = false;
      utt.onstart = () => {
        _speaking = true;
        _targetAmp = 0.45;
        const lbl = document.getElementById('ai-bubble-label');
        if (lbl) lbl.textContent = 'AI mluvi...';
      };
      utt.onend = utt.onerror = () => {
        _speaking = false;
        _targetAmp = 0;
        setTimeout(() => { if (!_speaking) aiBubbleStop(); }, 900);
      };
      utt.onboundary = () => {
        _targetAmp = 0.5 + Math.random() * 0.4;
        setTimeout(() => { _targetAmp = Math.max(0.2, _targetAmp - 0.2); }, 80);
      };
      // Rhythmic oscillation simulating speech amplitude
      const iv = setInterval(() => {
        if (!_speaking) { clearInterval(iv); return; }
        const t = Date.now() / 1000;
        const osc = Math.abs(Math.sin(t*3.8)*0.3 + Math.sin(t*7.2)*0.15 + Math.sin(t*1.4)*0.2);
        _targetAmp = 0.2 + osc * 0.6;
      }, 40);
    }

    window.aiBubbleShow = function(utt) {
      const ov = document.getElementById('ai-voice-bubble-overlay');
      if (!ov) return;
      _active = true; _amplitude = 0; _targetAmp = 0.1;
      ov.classList.add('active');
      if (!_animId) draw();
      if (utt) hookTTS(utt);
    };

    window.aiBubbleStop = function() {
      _active = false; _targetAmp = 0;
      const ov = document.getElementById('ai-voice-bubble-overlay');
      if (ov) ov.classList.remove('active');
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setTimeout(() => {
        if (!_active) { cancelAnimationFrame(_animId); _animId = null; ctx.clearRect(0,0,W,H); }
      }, 600);
    };
  })();
  


  // ─────────────────────────────────────────────────────────────
  //  PŘIHLAŠOVACÍ ÚDAJE (uloženy jako hash, nikoli plain text)
  // ─────────────────────────────────────────────────────────────
  async function _checkAdminCredentials(u, p) {
    const encoder = new TextEncoder();
    const data = encoder.encode(u + ':' + p);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    // Hash of credentials (SHA-256 of 'user:pass')
    const validHash = '8f10270aba9208087a115fb18fc008a47e349f3d17ceeba3292eddbc7be97b37';
    return hashHex === validHash;
  }
  // ─────────────────────────────────────────────────────────────

  let _adminLoggedIn  = false;
  let _adminLoginTime = null;
  let _adminBcastType = 'toast';
  let _adminFpsActive = false;
  let _adminFpsRaf    = null;
  let _adminFpsLast   = 0;
  let _adminFpsFrames = 0;

  /* ── Otevřít login modal ── */
  function adminLogin() {
    const m = document.getElementById('adminLoginModal');
    if (!m) return;
    m.style.display = 'flex';
    const err = document.getElementById('adminLoginErr');
    if (err) err.style.display = 'none';
    const u = document.getElementById('adminUser');
    const p = document.getElementById('adminPass');
    if (u) { u.value = ''; setTimeout(() => u.focus(), 80); }
    if (p) p.value = '';
  }

  function adminCloseLogin() {
    const m = document.getElementById('adminLoginModal');
    if (m) m.style.display = 'none';
  }

  /* ── Přihlásit se ── */
  async function adminDoLogin() {
    const u = (document.getElementById('adminUser')?.value || '').trim();
    const p = (document.getElementById('adminPass')?.value || '');
    const err = document.getElementById('adminLoginErr');

    const ok = await _checkAdminCredentials(u, p);
    if (ok) {
      _adminLoggedIn  = true;
      _adminLoginTime = Date.now();
      adminCloseLogin();
      adminOpenPanel();
    } else {
      if (err) { err.style.display = 'block'; }
      const passEl = document.getElementById('adminPass');
      if (passEl) { passEl.value = ''; passEl.focus(); }
      // Shake animace na error
      const box = document.getElementById('adminLoginModal')?.querySelector('div');
      if (box) {
        box.style.animation = 'none';
        box.style.transform = 'translateX(0)';
        setTimeout(() => {
          box.style.transition = 'transform 0.08s ease';
          [10,-10,7,-7,4,-4,0].forEach((x, i) => {
            setTimeout(() => box.style.transform = `translateX(${x}px)`, i * 60);
          });
        }, 10);
      }
    }
  }

  /* ── Odhlásit ── */
  function adminLogout() {
    _adminLoggedIn = false;
    adminStopFps();
    document.getElementById('adminPanel').style.display = 'none';
    if (typeof showToast === 'function') showToast('👋 Admin odhlášen');
  }

  /* ── Otevřít panel ── */
  function adminOpenPanel() {
    if (!_adminLoggedIn) return;
    const p = document.getElementById('adminPanel');
    if (!p) return;
    p.style.display = 'block';
    // Zobraz první tab (Profily) a skryj ostatní
    document.querySelectorAll('.adm-tab-content').forEach(c => c.style.display = 'none');
    const firstTab = document.getElementById('adminTab_profiles');
    if (firstTab) firstTab.style.display = 'block';
    // Zvýrazni první tlačítko
    document.querySelectorAll('.adm-tab').forEach(b => {
      b.style.background = 'rgba(255,255,255,0.04)';
      b.style.borderColor = 'rgba(255,255,255,0.08)';
      b.style.color = 'rgba(255,255,255,0.5)';
    });
    const firstBtn = document.querySelector('.adm-tab');
    if (firstBtn) {
      firstBtn.style.background = 'rgba(0,122,255,0.12)';
      firstBtn.style.borderColor = 'rgba(0,122,255,0.3)';
      firstBtn.style.color = 'var(--accent)';
    }
    adminRefresh();
    adminStartSessionTimer();
    // Načti broadcast historii
    adminLoadBroadcastHistory();
    // Debug/FPS toggle stav
    const dbg = localStorage.getItem('mf_admin_debug') === '1';
    const dbgBtn = document.getElementById('adminDebugToggle');
    if (dbgBtn) { dbgBtn.textContent = dbg ? 'ON' : 'OFF'; dbgBtn.style.color = dbg ? 'var(--accent)' : 'rgba(255,255,255,0.5)'; }
  }

  /* ── Session timer ── */
  let _adminSessionInterval = null;
  function adminStartSessionTimer() {
    clearInterval(_adminSessionInterval);
    _adminSessionInterval = setInterval(() => {
      const el = document.getElementById('adminSessionTime');
      if (!el || !_adminLoginTime) return;
      const s = Math.floor((Date.now() - _adminLoginTime) / 1000);
      const m = Math.floor(s / 60), sec = s % 60;
      el.textContent = `Session: ${m}:${String(sec).padStart(2,'0')}`;
    }, 1000);
  }

  /* ── Refresh panel ── */
  function adminRefresh() {
    adminLoadStats();
    adminLoadProfiles();
    adminLoadWatchlists();
    adminLoadHistory();
    adminLoadStorage();
  }

  /* ── STATS ── */
  function adminLoadStats() {
    const row = document.getElementById('adminStatsRow');
    if (!row) return;
    let profileCount = 0, watchlistCount = 0, historyCount = 0;
    try {
      const profiles = safeLS('mf_profiles_v2', '[]');
      profileCount = profiles.length;
    } catch(e){}
    try {
      // Sečti watchlisty přes všechny klíče
      Object.keys(localStorage).forEach(k => {
        if (k.includes('watchlist') || k.includes('wl')) {
          try { const arr = JSON.parse(localStorage.getItem(k)); if (Array.isArray(arr)) watchlistCount += arr.length; } catch(e){}
        }
      });
    } catch(e){}
    try {
      Object.keys(localStorage).forEach(k => {
        if (k.includes('history') || k.includes('hist')) {
          try { const arr = JSON.parse(localStorage.getItem(k)); if (Array.isArray(arr)) historyCount += arr.length; } catch(e){}
        }
      });
    } catch(e){}
    const storageUsed = Object.keys(localStorage).reduce((acc, k) => acc + (localStorage.getItem(k)||'').length, 0);
    const stats = [
      { icon: '👥', label: 'Profilů', value: profileCount, color: 'var(--accent)' },
      { icon: '📋', label: 'Watchlist položek', value: watchlistCount, color: '#00cfff' },
      { icon: '📜', label: 'Historie záznamů', value: historyCount, color: '#ff4ecb' },
      { icon: '💾', label: 'Storage', value: (storageUsed/1024).toFixed(1) + ' KB', color: '#50fa7b' },
    ];
    row.innerHTML = stats.map(s => `
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:16px;text-align:center;">
        <div style="font-size:1.4rem;margin-bottom:4px;">${s.icon}</div>
        <div style="font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif;font-size:1.35rem;font-weight:900;color:${s.color};">${s.value}</div>
        <div style="font-size:0.6rem;color:rgba(255,255,255,0.3);margin-top:2px;">${s.label}</div>
      </div>
    `).join('');
  }

  /* ── TABS (hlavní admin panel) ── */
  function adminSwitchTab(name, el) {
    document.querySelectorAll('.adm-tab').forEach(b => {
      b.style.background = 'rgba(255,255,255,0.04)';
      b.style.borderColor = 'rgba(255,255,255,0.08)';
      b.style.color = 'rgba(255,255,255,0.5)';
    });
    document.querySelectorAll('.adm-tab-content').forEach(c => c.style.display = 'none');
    const btn = el || (typeof event !== 'undefined' ? event.currentTarget : null);
    if (btn) {
      btn.style.background = 'rgba(0,122,255,0.12)';
      btn.style.borderColor = 'rgba(0,122,255,0.3)';
      btn.style.color = 'var(--accent)';
    }
    const tab = document.getElementById('adminTab_' + name);
    if (tab) tab.style.display = 'block';
    // Načti per-profil sekci v API záložce
    if (name === 'apikeys') setTimeout(adminRenderPerProfileKeys, 60);
  }

  /* ── PROFILY ── */
  function adminLoadProfiles() {
    const list = document.getElementById('adminProfilesList');
    if (!list) return;
    let profiles = [];
    try { profiles = safeLS('mf_profiles_v2', '[]'); } catch(e){}
    if (!profiles.length) {
      list.innerHTML = '<div style="font-size:0.72rem;color:rgba(255,255,255,0.3);text-align:center;padding:20px;">Žádné profily</div>';
      return;
    }
    list.innerHTML = profiles.map((p, i) => `
      <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:rgba(255,255,255,0.035);border:1px solid rgba(255,255,255,0.06);border-radius:12px;">
        <div style="width:40px;height:40px;border-radius:50%;background:${p.color||'#333'};display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;">${p.avatar||'🎬'}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.85rem;font-weight:700;">${p.name||'Profil '+(i+1)}</div>
          <div style="font-size:0.6rem;color:rgba(255,255,255,0.3);margin-top:2px;">
            PIN: ${p.pin?'••••':'—'} · Barva: <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color||'#888'};vertical-align:middle;"></span>
            ${p.traktToken?' · Trakt ✓':''}
          </div>
        </div>
        <div style="display:flex;gap:6px;">
          <button onclick="adminEditProfile(${i})" style="padding:6px 12px;border-radius:8px;background:rgba(0,122,255,0.07);border:1px solid rgba(0,122,255,0.18);color:rgba(0,122,255,0.7);font-size:0.62rem;font-weight:700;cursor:pointer;">✏ Upravit</button>
          <button onclick="adminDeleteProfile(${i})" style="padding:6px 12px;border-radius:8px;background:rgba(255,80,80,0.08);border:1px solid rgba(255,80,80,0.2);color:rgba(255,100,100,0.7);font-size:0.62rem;font-weight:700;cursor:pointer;">🗑</button>
        </div>
      </div>
    `).join('');
  }

  function adminDeleteProfile(idx) {
    if (!confirm('Smazat profil č. ' + (idx+1) + '? Toto je nevratné!')) return;
    try {
      const profiles = safeLS('mf_profiles_v2', '[]');
      profiles.splice(idx, 1);
      safeSetItem('mf_profiles_v2', JSON.stringify(profiles));
      adminRefresh();
      if (typeof showToast === 'function') showToast('🗑 Profil smazán');
    } catch(e) {}
  }

  function adminEditProfile(idx) {
    try {
      const profiles = safeLS('mf_profiles_v2', '[]');
      const p = profiles[idx];
      if (!p) return;
      const newName = prompt('Nové jméno profilu:', p.name || '');
      if (newName === null) return;
      if (newName.trim()) p.name = newName.trim();
      const newPin = prompt('Nový PIN (4 číslice, prázdné = bez PINu):', '');
      if (newPin !== null) p.pin = newPin.trim() || null;
      profiles[idx] = p;
      safeSetItem('mf_profiles_v2', JSON.stringify(profiles));
      adminLoadProfiles();
      if (typeof showToast === 'function') showToast('✓ Profil upraven');
    } catch(e) {}
  }

  function adminCreateProfile() {
    const name = prompt('Jméno nového profilu:');
    if (!name || !name.trim()) return;
    try {
      const profiles = safeLS('mf_profiles_v2', '[]');
      profiles.push({ name: name.trim(), avatar: '🎬', color: '#007AFF', pin: null });
      safeSetItem('mf_profiles_v2', JSON.stringify(profiles));
      adminRefresh();
      if (typeof showToast === 'function') showToast('✓ Profil vytvořen: ' + name.trim());
    } catch(e) {}
  }

  /* ── WATCHLISTY ── */
  function adminLoadWatchlists() {
    const el = document.getElementById('adminWatchlistContent');
    if (!el) return;
    let profiles = [];
    try { profiles = safeLS('mf_profiles_v2', '[]'); } catch(e){}
    if (!profiles.length) { el.innerHTML = '<div style="font-size:0.72rem;color:rgba(255,255,255,0.3);">Žádné profily</div>'; return; }
    el.innerHTML = '';
    profiles.forEach((p, pi) => {
      const key = 'mf_watchlist_' + (p.id || pi);
      let wl = [];
      // Zkus více variant klíče
      ['mf_watchlist_' + (p.id||pi), 'mf_watchlist_' + pi, 'mf_watchlist'].forEach(k => {
        try { const d = safeLS(k, '[]'); if(Array.isArray(d)&&d.length) wl = d; } catch(e){}
      });
      const div = document.createElement('div');
      div.style.cssText = 'background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:14px;';
      div.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
          <div style="font-size:1rem;">${p.avatar||'🎬'}</div>
          <div style="font-size:0.82rem;font-weight:700;">${p.name||'Profil '+(pi+1)}</div>
          <div style="margin-left:auto;font-size:0.6rem;color:rgba(255,255,255,0.3);">${wl.length} položek</div>
        </div>
        ${wl.length ? wl.slice(0,5).map(item=>`
          <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-top:1px solid rgba(255,255,255,0.04);font-size:0.7rem;">
            <span>${item.type==='movie'?'🎬':'📺'}</span>
            <span style="flex:1;">${item.name||item.title||'?'}</span>
          </div>
        `).join('') + (wl.length>5?`<div style="font-size:0.62rem;color:rgba(255,255,255,0.3);margin-top:6px;">... a ${wl.length-5} dalších</div>`:'')
        : '<div style="font-size:0.68rem;color:rgba(255,255,255,0.25);">Prázdný watchlist</div>'}
      `;
      el.appendChild(div);
    });
  }

  /* ── HISTORIE ── */
  function adminLoadHistory() {
    const el = document.getElementById('adminHistoryContent');
    if (!el) return;
    let history = [];
    try { history = safeLS('mf_user_history', '[]'); } catch(e){}
    // Zkus i další varianty
    Object.keys(localStorage).forEach(k => {
      if (k.includes('history') && !history.length) {
        try { const d = safeLS(k, '[]'); if(Array.isArray(d)&&d.length) history = d; } catch(e){}
      }
    });
    if (!history.length) { el.innerHTML = '<div style="color:rgba(255,255,255,0.3);">Žádná historie</div>'; return; }
    el.innerHTML = history.slice(0,30).map((item,i) => {
      const name = item.title||item.name||item.t||JSON.stringify(item).slice(0,40);
      const ts = item.ts||item.timestamp||item.date;
      const date = ts ? new Date(ts).toLocaleDateString('cs-CZ') : '';
      return `<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
        <span style="font-size:0.65rem;color:rgba(255,255,255,0.2);min-width:20px;">${i+1}</span>
        <span style="flex:1;font-size:0.72rem;">${name}</span>
        <span style="font-size:0.6rem;color:rgba(255,255,255,0.25);">${date}</span>
      </div>`;
    }).join('') + (history.length>30?`<div style="font-size:0.65rem;color:rgba(255,255,255,0.3);margin-top:8px;">... a ${history.length-30} dalších záznamů</div>`:'');
  }

  function adminClearHistory() {
    if (!confirm('Smazat celou historii sledování?')) return;
    Object.keys(localStorage).forEach(k => { if (k.includes('history')) localStorage.removeItem(k); });
    adminRefresh();
    if (typeof showToast === 'function') showToast('🗑 Historie smazána');
  }

  /* ── STORAGE ── */
  function adminLoadStorage() {
    const list = document.getElementById('adminStorageList');
    const sizeEl = document.getElementById('adminStorageSize');
    if (!list) return;
    const keys = Object.keys(localStorage).sort();
    const total = keys.reduce((a,k)=>a+(localStorage.getItem(k)||'').length,0);
    if (sizeEl) sizeEl.textContent = 'Celkem: ' + (total/1024).toFixed(1) + ' KB / ~5 MB';
    const q = (document.getElementById('adminStorageSearch')?.value||'').toLowerCase();
    const filtered = keys.filter(k=>!q||k.toLowerCase().includes(q));
    list.innerHTML = filtered.map(k => {
      const val = localStorage.getItem(k)||'';
      const kb = (val.length/1024).toFixed(2);
      let preview = val.length > 60 ? val.slice(0,60)+'…' : val;
      try { preview = JSON.stringify(JSON.parse(val)).slice(0,60)+'…'; } catch(e){}
      return `<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:7px;background:rgba(255,255,255,0.02);">
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.65rem;font-weight:700;color:rgba(255,255,255,0.6);font-family:monospace;">${k}</div>
          <div style="font-size:0.58rem;color:rgba(255,255,255,0.2);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${preview}</div>
        </div>
        <div style="font-size:0.6rem;color:rgba(255,255,255,0.2);white-space:nowrap;">${kb} KB</div>
        <button onclick="adminViewKey('${k.replace(/'/g,"\\'")}')" style="padding:3px 8px;border-radius:5px;background:rgba(100,180,255,0.08);border:1px solid rgba(100,180,255,0.18);color:rgba(120,190,255,0.7);font-size:0.55rem;cursor:pointer;">👁</button>
        <button onclick="adminClearKey('${k.replace(/'/g,"\\'")}')" style="padding:3px 8px;border-radius:5px;background:rgba(255,80,80,0.08);border:1px solid rgba(255,80,80,0.18);color:rgba(255,100,100,0.65);font-size:0.55rem;cursor:pointer;">×</button>
      </div>`;
    }).join('');
  }

  // adminFilterStorage() -> use adminFilterStorage(val) below

  function adminViewKey(key) {
    const val = localStorage.getItem(key)||'(prázdné)';
    let pretty = val;
    try { pretty = JSON.stringify(JSON.parse(val), null, 2); } catch(e){}
    const dlg = document.createElement('div');
    dlg.style.cssText='position:fixed;inset:0;z-index:9999999;background:rgba(0,0,0,0.88);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;';
    dlg.innerHTML = `<div style="background:rgba(8,8,12,0.99);border:1px solid rgba(255,255,255,0.1);border-radius:18px;padding:24px;width:min(600px,95vw);max-height:80vh;display:flex;flex-direction:column;">
      <div style="font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif;font-weight:800;margin-bottom:12px;">🔑 ${key}</div>
      <pre style="flex:1;overflow:auto;font-size:0.65rem;color:rgba(255,255,255,0.7);background:rgba(255,255,255,0.03);border-radius:10px;padding:12px;white-space:pre-wrap;word-break:break-all;">${pretty}</pre>
      <div style="display:flex;gap:8px;margin-top:14px;">
        <button onclick="navigator.clipboard.writeText(${JSON.stringify(val)});showToast&&showToast('✓ Zkopírováno!')" style="padding:9px 18px;border-radius:10px;background:rgba(0,122,255,0.08);border:1px solid rgba(0,122,255,0.2);color:var(--accent);font-size:0.7rem;font-weight:700;cursor:pointer;">📋 Kopírovat</button>
        <button onclick="this.closest('div[style]').remove()" style="margin-left:auto;padding:9px 18px;border-radius:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);font-size:0.7rem;cursor:pointer;">Zavřít</button>
      </div>
    </div>`;
    dlg.addEventListener('click', e => { if(e.target===dlg) dlg.remove(); });
    document.body.appendChild(dlg);
  }

  function adminClearKey(key) {
    if (!confirm('Smazat klíč: ' + key + '?')) return;
    localStorage.removeItem(key);
    adminLoadStorage();
    adminLoadStats();
    if (typeof showToast === 'function') showToast('✓ Klíč smazán: ' + key);
  }

  function adminClearAll() {
    if (!confirm('⚠️ Smazat VŠECHNA data?\nToto je nevratné — zmizí profily, watchlisty, nastavení, vše.')) return;
    if (!confirm('Opravdu si jistý? Klikni OK pro definitivní reset.')) return;
    localStorage.clear();
    adminRefresh();
    if (typeof showToast === 'function') showToast('💣 Vše smazáno — aplikace resetována');
  }

  /* ── EXPORT / IMPORT ── */
  function adminExport() {
    const data = {};
    Object.keys(localStorage).forEach(k => { data[k] = localStorage.getItem(k); });
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'mujflix-backup-' + new Date().toISOString().slice(0,10) + '.json';
    a.click(); URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast('📤 Export stažen');
  }

  function adminImport() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = e => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!confirm('Importovat ' + Object.keys(data).length + ' klíčů? Stávající data budou přepsána.')) return;
          Object.entries(data).forEach(([k,v]) => localStorage.setItem(k,v));
          adminRefresh();
          if (typeof showToast === 'function') showToast('📥 Import dokončen!');
        } catch(e) { alert('Chyba při importu: ' + e.message); }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  /* ── NÁSTROJE ── */
  function adminSetAccent(color) {
    document.documentElement.style.setProperty('--accent', color);
    localStorage.setItem('mf_admin_accent', color);
    if (typeof showToast === 'function') showToast('🎨 Accent: ' + color);
  }

  function adminTestToast() {
    if (typeof showToast === 'function') showToast('🍞 Testovací toast od admina!');
    else alert('showToast není dostupný');
  }

  function adminTestConfetti() {
    if (typeof confetti === 'function') {
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 } });
    } else { if (typeof showToast === 'function') showToast('❌ confetti není dostupné'); }
  }

  function adminOpenRuleta() {
    adminLogout();
    setTimeout(() => { if (typeof openRuleta === 'function') openRuleta(); }, 300);
  }

  function adminForceWrapped() {
    adminLogout();
    setTimeout(() => { if (typeof openWrapped === 'function') openWrapped(); }, 300);
  }

  function adminToggleDebugLegacy() {
    const cur = localStorage.getItem('mf_admin_debug') === '1';
    localStorage.setItem('mf_admin_debug', cur ? '0' : '1');
    const btn = document.getElementById('adminDebugToggleLegacy');
    if (btn) { btn.textContent = cur?'OFF':'ON'; btn.style.color = cur?'rgba(255,255,255,0.5)':'var(--accent)'; }
    if (typeof showToast === 'function') showToast('Debug: ' + (cur?'vypnut':'zapnut'));
  }

  /* ── FPS COUNTER ── */
  function adminToggleFps() {
    _adminFpsActive = !_adminFpsActive;
    const btn = document.getElementById('adminFpsToggle');
    const counter = document.getElementById('adminFpsCounter');
    if (btn) { btn.textContent = _adminFpsActive?'ON':'OFF'; btn.style.color = _adminFpsActive?'var(--accent)':'rgba(255,255,255,0.5)'; }
    if (_adminFpsActive) {
      if (counter) counter.style.display = 'block';
      _adminFpsLast = performance.now(); _adminFpsFrames = 0;
      function fpsLoop(ts) {
        _adminFpsFrames++;
        if (ts - _adminFpsLast >= 500) {
          const fps = Math.round(_adminFpsFrames * 1000 / (ts - _adminFpsLast));
          if (counter) { counter.textContent = 'FPS: ' + fps; counter.style.color = fps>=55?'#0f0':fps>=30?'#ff0':'#f00'; }
          _adminFpsLast = ts; _adminFpsFrames = 0;
        }
        if (_adminFpsActive) _adminFpsRaf = requestAnimationFrame(fpsLoop);
      }
      _adminFpsRaf = requestAnimationFrame(fpsLoop);
    } else {
      adminStopFps();
    }
  }
  function adminStopFps() {
    _adminFpsActive = false;
    if (_adminFpsRaf) { cancelAnimationFrame(_adminFpsRaf); _adminFpsRaf = null; }
    const counter = document.getElementById('adminFpsCounter');
    if (counter) counter.style.display = 'none';
  }

  /* ── BROADCAST ── */
  function adminBcastType(type) {
    _adminBcastType = type;
    document.getElementById('admBcastToast').style.background = type==='toast'?'rgba(0,122,255,0.1)':'rgba(255,255,255,0.04)';
    document.getElementById('admBcastToast').style.borderColor = type==='toast'?'rgba(0,122,255,0.3)':'rgba(255,255,255,0.08)';
    document.getElementById('admBcastToast').style.color = type==='toast'?'var(--accent)':'rgba(255,255,255,0.45)';
    document.getElementById('admBcastBanner').style.background = type==='banner'?'rgba(0,122,255,0.1)':'rgba(255,255,255,0.04)';
    document.getElementById('admBcastBanner').style.borderColor = type==='banner'?'rgba(0,122,255,0.3)':'rgba(255,255,255,0.08)';
    document.getElementById('admBcastBanner').style.color = type==='banner'?'var(--accent)':'rgba(255,255,255,0.45)';
  }

  function adminSendBroadcast() {
    const msg = document.getElementById('adminBroadcastMsg')?.value?.trim();
    if (!msg) { if (typeof showToast==='function') showToast('⚠ Napiš zprávu!'); return; }
    if (_adminBcastType === 'toast') {
      if (typeof showToast === 'function') showToast(msg);
    } else {
      // Bannér nahoře
      let banner = document.getElementById('adminBanner');
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'adminBanner';
        banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:999997;background:var(--accent);color:#000;font-family:-apple-system, SF Pro Display, Helvetica Neue,sans-serif;font-weight:800;font-size:0.78rem;padding:10px 20px;text-align:center;display:flex;align-items:center;justify-content:center;gap:10px;';
        banner.innerHTML = `<span id="adminBannerText"></span><button onclick="document.getElementById('adminBanner').remove()" style="background:rgba(0,0,0,0.15);border:none;border-radius:6px;padding:3px 10px;cursor:pointer;font-weight:900;font-size:0.7rem;">✕</button>`;
        document.body.appendChild(banner);
      }
      document.getElementById('adminBannerText').textContent = msg;
    }
    // Ulož do historie
    const hist = safeLS('mf_admin_broadcasts', '[]');
    hist.unshift({ msg, type: _adminBcastType, ts: Date.now() });
    localStorage.setItem('mf_admin_broadcasts', JSON.stringify(hist.slice(0,20)));
    adminLoadBroadcastHistory();
    document.getElementById('adminBroadcastMsg').value = '';
    if (typeof showToast === 'function') showToast('📢 Zpráva odeslána!');
  }

  function adminScheduleBroadcast() {
    const msg = document.getElementById('adminBroadcastMsg')?.value?.trim();
    if (!msg) { if (typeof showToast==='function') showToast('⚠ Napiš zprávu!'); return; }
    const secs = prompt('Za kolik sekund odeslat?', '30');
    if (!secs) return;
    const delay = parseInt(secs) * 1000;
    if (typeof showToast === 'function') showToast('⏰ Naplánováno za ' + secs + 's');
    setTimeout(() => adminSendBroadcast(), delay);
  }

  function adminLoadBroadcastHistory() {
    const el = document.getElementById('adminBroadcastHistory');
    if (!el) return;
    const hist = safeLS('mf_admin_broadcasts', '[]');
    if (!hist.length) { el.innerHTML = ''; return; }
    el.innerHTML = '<div style="font-size:0.62rem;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Historie zpráv</div>' +
      hist.slice(0,5).map(h => `<div style="padding:7px 10px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);margin-bottom:5px;font-size:0.68rem;">
        <span style="color:rgba(255,255,255,0.5);">${h.msg}</span>
        <span style="float:right;font-size:0.58rem;color:rgba(255,255,255,0.2);">${new Date(h.ts).toLocaleTimeString('cs-CZ')}</span>
      </div>`).join('');
  }

  // Aplikuj uloženou accent barvu při startu
  (function() {
    const saved = localStorage.getItem('mf_admin_accent');
    if (saved) document.documentElement.style.setProperty('--accent', saved);
  })();

  /* ══════════════════════════════════════════════════════════
     PREMIERE CALENDAR — "Právě vychází" via TMDB /tv/on_the_air
  ══════════════════════════════════════════════════════════ */
  let _premiereMonth = new Date(); // current month view
  let _premiereFilter = 'tracked'; // 'tracked' | 'all'
  let _premiereCache = {}; // key: 'YYYY-MM' -> data
  const CZECH_MONTHS = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec'];
  const CZECH_DAYS_SHORT = ['Ne','Po','Út','St','Čt','Pá','So'];

  function openPremiereCalendar() {
    const el = document.getElementById('premiereOverlay');
    if (!el) return;
    el.classList.add('open');
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
    _premiereMonth = new Date();
    renderPremiereCalendar();
  }
  function closePremiereCalendar() {
    const el = document.getElementById('premiereOverlay');
    if (!el) return;
    el.classList.remove('visible');
    setTimeout(() => el.classList.remove('open'), 320);
  }
  function premiereChangeMonth(dir) {
    _premiereMonth = new Date(_premiereMonth.getFullYear(), _premiereMonth.getMonth() + dir, 1);
    renderPremiereCalendar();
  }
  function setPremiereFilter(btn, filter) {
    _premiereFilter = filter;
    document.querySelectorAll('.premiere-filter-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderPremiereCalendar();
  }

  async function renderPremiereCalendar() {
    const body = document.getElementById('premiereCalendarBody');
    const label = document.getElementById('premiereMonthLabel');
    if (!body || !label) return;
    const m = _premiereMonth;
    label.textContent = `${CZECH_MONTHS[m.getMonth()]} ${m.getFullYear()}`;
    body.innerHTML = `<div class="premiere-loading"><div class="premiere-loading-spinner"></div><div class="premiere-loading-text">Načítám premiéry…</div></div>`;

    try {
      const episodes = await fetchPremiereEpisodes();
      renderPremiereGrid(episodes);
    } catch(e) {
      body.innerHTML = `<div class="premiere-empty"><div class="premiere-empty-icon">⚠️</div><p>Nepodařilo se načíst premiéry.<br>Zkontroluj TMDB API klíč.</p></div>`;
    }
  }

  async function fetchPremiereEpisodes() {
    const TMDB_KEY = typeof window.TMDB_KEY !== 'undefined' ? window.TMDB_KEY : (localStorage.getItem('mf_tmdb_key') || '');
    if (!TMDB_KEY) throw new Error('No TMDB key');

    const m = _premiereMonth;
    const cacheKey = `${m.getFullYear()}-${m.getMonth()}-${_premiereFilter}`;
    if (_premiereCache[cacheKey]) return _premiereCache[cacheKey];

    let shows = [];

    if (_premiereFilter === 'tracked') {
      // Use user's series from db
      const dbSlugs = typeof db !== 'undefined' ? Object.keys(db) : [];
      const userShows = dbSlugs.filter(s => s !== '__foryou__' && s !== '__search__' && db[s]?.tmdbId);
      shows = await Promise.all(userShows.map(async slug => {
        try {
          const info = await tmdbGet(`/tv/${db[slug].tmdbId}?language=cs`);
          return info;
        } catch { return null; }
      }));
      shows = shows.filter(Boolean);
    } else {
      // On-the-air shows
      const [r1, r2] = await Promise.all([
        tmdbGet('/tv/on_the_air?language=cs&page=1'),
        tmdbGet('/tv/on_the_air?language=cs&page=2')
      ]);
      shows = [...(r1?.results || []), ...(r2?.results || [])];
    }

    // Build episode calendar for this month
    const year = m.getFullYear(), mon = m.getMonth();
    const daysInMonth = new Date(year, mon + 1, 0).getDate();
    const startDate = `${year}-${String(mon+1).padStart(2,'0')}-01`;
    const endDate = `${year}-${String(mon+1).padStart(2,'0')}-${String(daysInMonth).padStart(2,'0')}`;

    // For each show, get next episode airing this month
    const episodes = [];
    await Promise.all(shows.slice(0,30).map(async show => {
      try {
        const nextEp = show.next_episode_to_air;
        const lastEp = show.last_episode_to_air;
        const candidates = [nextEp, lastEp].filter(ep => {
          if (!ep?.air_date) return false;
          return ep.air_date >= startDate && ep.air_date <= endDate;
        });
        candidates.forEach(ep => {
          episodes.push({
            show_name: show.name,
            show_id: show.id,
            poster_path: show.poster_path,
            backdrop_path: show.backdrop_path,
            networks: (show.networks || []).map(n => n.name).join(', '),
            episode_number: ep.episode_number,
            season_number: ep.season_number,
            air_date: ep.air_date,
            isTracked: _premiereFilter === 'tracked'
          });
        });
      } catch {}
    }));

    // Sort by date
    episodes.sort((a,b) => a.air_date.localeCompare(b.air_date));
    _premiereCache[cacheKey] = episodes;
    return episodes;
  }

  function renderPremiereGrid(episodes) {
    const body = document.getElementById('premiereCalendarBody');
    if (!body) return;
    const today = new Date().toISOString().slice(0,10);

    if (!episodes.length) {
      body.innerHTML = `<div class="premiere-empty"><div class="premiere-empty-icon">📭</div><p>Žádné premiéry tento měsíc.<br>Zkus filtr "Populární".</p></div>`;
      return;
    }

    // Group by week then day
    const grouped = {};
    episodes.forEach(ep => {
      const d = new Date(ep.air_date + 'T12:00:00');
      const dayKey = ep.air_date;
      const weekNum = Math.ceil((d.getDate() + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7);
      if (!grouped[weekNum]) grouped[weekNum] = {};
      if (!grouped[weekNum][dayKey]) grouped[weekNum][dayKey] = [];
      grouped[weekNum][dayKey].push(ep);
    });

    // Update FAB badge
    const thisWeekEps = episodes.filter(ep => {
      const d = new Date(ep.air_date + 'T12:00:00');
      const now = new Date();
      const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);
      return d >= weekStart && d <= weekEnd;
    });
    const badge = document.getElementById('premiereFabBadge');
    if (badge) { badge.textContent = thisWeekEps.length; badge.classList.toggle('has-items', thisWeekEps.length > 0); }

    let html = '';
    Object.entries(grouped).sort(([a],[b]) => +a - +b).forEach(([week, days]) => {
      html += `<div class="premiere-week-label">Týden ${week}</div>`;
      Object.entries(days).sort(([a],[b]) => a.localeCompare(b)).forEach(([dayKey, eps]) => {
        const d = new Date(dayKey + 'T12:00:00');
        const isToday = dayKey === today;
        html += `<div class="premiere-day-group"><div class="premiere-day-header">
          <div class="premiere-day-date${isToday?' today':''}">
            <div class="premiere-day-num">${d.getDate()}</div>
            <div class="premiere-day-name">${CZECH_DAYS_SHORT[d.getDay()]}</div>
          </div>
          <div class="premiere-ep-list">`;
        eps.forEach(ep => {
          const poster = ep.poster_path ? `https://image.tmdb.org/t/p/w92${ep.poster_path}` : '';
          html += `<div class="premiere-ep-item${ep.isTracked?' is-tracked':''}" onclick="premiereOpenShow(${ep.show_id})">
            <div class="premiere-ep-poster">${poster ? `<img src="${poster}" alt="" loading="lazy">` : ''}</div>
            <div class="premiere-ep-info">
              <div class="premiere-ep-show">${ep.show_name}</div>
              <div class="premiere-ep-detail">S${String(ep.season_number).padStart(2,'0')} · E${String(ep.episode_number).padStart(2,'0')}</div>
              <div class="premiere-ep-badge-row">
                ${ep.isTracked ? '<span class="premiere-ep-badge tracked">⭐ Sleduji</span>' : '<span class="premiere-ep-badge new">NOVÉ</span>'}
                ${ep.networks ? `<span class="premiere-ep-badge network">${ep.networks.slice(0,18)}</span>` : ''}
              </div>
            </div>
            <div class="premiere-ep-time">${isToday ? '🔴 Dnes' : ''}</div>
          </div>`;
        });
        html += `</div></div></div>`;
      });
    });
    body.innerHTML = html;
  }

  function premiereOpenShow(tmdbId) {
    // Try to find slug by tmdbId in db
    const slug = typeof db !== 'undefined' ? Object.keys(db).find(s => db[s]?.tmdbId == tmdbId) : null;
    closePremiereCalendar();
    if (slug) { setTimeout(() => openSeries(slug), 350); }
    else { setTimeout(() => showToast('🔍 Seriál není v tvém seznamu'), 350); }
  }

  /* ══════════════════════════════════════════════════════════
     FILMOVÉ KOLEKCE (SAGY)
  ══════════════════════════════════════════════════════════ */
  const COLLECTIONS_DATA = [
    { id: 1, name: 'Marvel Cinematic Universe', universe: 'MCU', icon: '🦸', color: '#e23030',
      tmdbCollections: [131292, 86311, 263, 422837, 284433, 131296, 422834, 422843, 422834],
      films: [
        { title: 'Iron Man', year: 2008, tmdbId: 1726, order: 1 },
        { title: 'Iron Man 2', year: 2010, tmdbId: 10138, order: 2 },
        { title: 'Thor', year: 2011, tmdbId: 10195, order: 3 },
        { title: 'Captain America: První Avenger', year: 2011, tmdbId: 1771, order: 4 },
        { title: 'Avengers', year: 2012, tmdbId: 24428, order: 5 },
        { title: 'Iron Man 3', year: 2013, tmdbId: 68721, order: 6 },
        { title: 'Thor: Temný svět', year: 2013, tmdbId: 76338, order: 7 },
        { title: 'Captain America: Návrat prvního Avengera', year: 2014, tmdbId: 100402, order: 8 },
        { title: 'Strážci Galaxie', year: 2014, tmdbId: 118340, order: 9 },
        { title: 'Avengers: Age of Ultron', year: 2015, tmdbId: 99861, order: 10 },
        { title: 'Ant-Man', year: 2015, tmdbId: 102899, order: 11 },
        { title: 'Captain America: Občanská válka', year: 2016, tmdbId: 271110, order: 12 },
        { title: 'Doctor Strange', year: 2016, tmdbId: 284052, order: 13 },
        { title: 'Strážci Galaxie vol. 2', year: 2017, tmdbId: 283995, order: 14 },
        { title: 'Spider-Man: Homecoming', year: 2017, tmdbId: 315635, order: 15 },
        { title: 'Thor: Ragnarok', year: 2017, tmdbId: 284053, order: 16 },
        { title: 'Black Panther', year: 2018, tmdbId: 284054, order: 17 },
        { title: 'Avengers: Infinity War', year: 2018, tmdbId: 299536, order: 18 },
        { title: 'Ant-Man a Vosa', year: 2018, tmdbId: 363088, order: 19 },
        { title: 'Captain Marvel', year: 2019, tmdbId: 299537, order: 20 },
        { title: 'Avengers: Endgame', year: 2019, tmdbId: 299534, order: 21 },
        { title: 'Spider-Man: Daleko od domova', year: 2019, tmdbId: 429617, order: 22 },
      ]
    },
    { id: 2, name: 'Harry Potter', universe: 'Wizarding World', icon: '⚡', color: '#7c4dff',
      films: [
        { title: 'Harry Potter a Kámen mudrců', year: 2001, tmdbId: 671, order: 1 },
        { title: 'Harry Potter a Tajemná komnata', year: 2002, tmdbId: 672, order: 2 },
        { title: 'Harry Potter a vězeň z Azkabanu', year: 2004, tmdbId: 673, order: 3 },
        { title: 'Harry Potter a Ohnivý pohár', year: 2005, tmdbId: 674, order: 4 },
        { title: 'Harry Potter a Fénixův řád', year: 2007, tmdbId: 675, order: 5 },
        { title: 'Harry Potter a Princ dvojí krve', year: 2009, tmdbId: 767, order: 6 },
        { title: 'Harry Potter a Relikvie smrti – část 1', year: 2010, tmdbId: 12444, order: 7 },
        { title: 'Harry Potter a Relikvie smrti – část 2', year: 2011, tmdbId: 12445, order: 8 },
        { title: 'Fantastická zvířata a kde je najít', year: 2016, tmdbId: 259316, order: 9 },
        { title: 'Fantastická zvířata: Grindelwaldovy zločiny', year: 2018, tmdbId: 338952, order: 10 },
        { title: 'Fantastická zvířata: Tajemství Dumbledora', year: 2022, tmdbId: 338953, order: 11 },
      ]
    },
    { id: 3, name: 'Star Wars', universe: 'Galaxy Far Far Away', icon: '⚔️', color: '#ffe340',
      films: [
        { title: 'Epizoda I – Skrytá hrozba', year: 1999, tmdbId: 1893, order: 1 },
        { title: 'Epizoda II – Klony útočí', year: 2002, tmdbId: 1894, order: 2 },
        { title: 'Epizoda III – Pomsta Sithů', year: 2005, tmdbId: 1895, order: 3 },
        { title: 'Solo: Star Wars Story', year: 2018, tmdbId: 348350, order: 4 },
        { title: 'Rogue One', year: 2016, tmdbId: 330459, order: 5 },
        { title: 'Epizoda IV – Nová naděje', year: 1977, tmdbId: 11, order: 6 },
        { title: 'Epizoda V – Impérium vrací úder', year: 1980, tmdbId: 1891, order: 7 },
        { title: 'Epizoda VI – Návrat Jediho', year: 1983, tmdbId: 1892, order: 8 },
        { title: 'Epizoda VII – Síla se probouzí', year: 2015, tmdbId: 140607, order: 9 },
        { title: 'Rogue One', year: 2016, tmdbId: 330459, order: 10 },
        { title: 'Epizoda VIII – Poslední z Jediů', year: 2017, tmdbId: 181808, order: 11 },
        { title: 'Epizoda IX – Vzestup Skywalkera', year: 2019, tmdbId: 181812, order: 12 },
      ]
    },
    { id: 4, name: 'DC Extended Universe', universe: 'DCU', icon: '🦇', color: '#2d5fcc',
      films: [
        { title: 'Man of Steel', year: 2013, tmdbId: 49521, order: 1 },
        { title: 'Batman v Superman', year: 2016, tmdbId: 209112, order: 2 },
        { title: 'Suicide Squad', year: 2016, tmdbId: 297761, order: 3 },
        { title: 'Wonder Woman', year: 2017, tmdbId: 297762, order: 4 },
        { title: 'Justice League', year: 2017, tmdbId: 141052, order: 5 },
        { title: 'Aquaman', year: 2018, tmdbId: 297802, order: 6 },
        { title: 'Shazam!', year: 2019, tmdbId: 287947, order: 7 },
        { title: 'Birds of Prey', year: 2020, tmdbId: 495764, order: 8 },
        { title: 'Wonder Woman 1984', year: 2020, tmdbId: 464052, order: 9 },
        { title: 'The Suicide Squad', year: 2021, tmdbId: 437209, order: 10 },
        { title: 'Black Adam', year: 2022, tmdbId: 640146, order: 11 },
        { title: 'Shazam! Fury of the Gods', year: 2023, tmdbId: 605116, order: 12 },
      ]
    },
    { id: 5, name: 'James Bond 007', universe: 'Špionážní ságy', icon: '🔫', color: '#c0a030',
      films: [
        { title: 'GoldenEye', year: 1995, tmdbId: 710, order: 1 },
        { title: 'Casino Royale', year: 2006, tmdbId: 36557, order: 2 },
        { title: 'Quantum of Solace', year: 2008, tmdbId: 10764, order: 3 },
        { title: 'Skyfall', year: 2012, tmdbId: 37724, order: 4 },
        { title: 'Spectre', year: 2015, tmdbId: 206647, order: 5 },
        { title: 'No Time to Die', year: 2021, tmdbId: 370172, order: 6 },
      ]
    },
    { id: 6, name: 'John Wick', universe: 'Kontinentální universe', icon: '🐶', color: '#007AFF',
      films: [
        { title: 'John Wick', year: 2014, tmdbId: 245891, order: 1 },
        { title: 'John Wick: Chapter 2', year: 2017, tmdbId: 370172, order: 2 },
        { title: 'John Wick: Chapter 3 – Parabellum', year: 2019, tmdbId: 458156, order: 3 },
        { title: 'John Wick: Chapter 4', year: 2023, tmdbId: 603692, order: 4 },
      ]
    },
  ];

  let _collectionsActive = null;

  function openCollections() {
    const el = document.getElementById('collectionsOverlay');
    if (!el) return;
    el.classList.add('open');
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
    collectionsShowGrid();
  }
  function closeCollections() {
    const el = document.getElementById('collectionsOverlay');
    if (!el) return;
    el.classList.remove('visible');
    setTimeout(() => el.classList.remove('open'), 320);
  }
  function collectionsShowGrid() {
    const gridView = document.getElementById('collectionsGridView');
    const detailView = document.getElementById('collectionsDetailView');
    const breadcrumb = document.getElementById('collectionsBreadcrumb');
    if (gridView) gridView.style.display = 'block';
    if (detailView) detailView.classList.remove('active');
    if (breadcrumb) breadcrumb.innerHTML = `<span class="collections-breadcrumb-home">Kolekce</span>`;
    _collectionsActive = null;
    renderCollectionsGrid();
  }
  function renderCollectionsGrid() {
    const grid = document.getElementById('collectionsGrid');
    if (!grid) return;
    grid.innerHTML = COLLECTIONS_DATA.map(col => {
      // Try to get posters from films
      const posterFilms = col.films.slice(0,3);
      const postersHtml = posterFilms.map(f =>
        `<div style="background:rgba(255,255,255,0.04);width:100%;height:100%;"></div>`
      ).join('');
      return `<div class="collection-card" onclick="collectionsOpenDetail(${col.id})">
        <div class="collection-card-banner" id="col-banner-${col.id}">${postersHtml}</div>
        <div class="collection-card-overlay"></div>
        <div class="collection-card-icon">${col.icon}</div>
        <div class="collection-card-info">
          <div class="collection-card-universe">${col.universe}</div>
          <div class="collection-card-name">${col.name}</div>
          <div class="collection-card-count">${col.films.length} filmů</div>
        </div>
      </div>`;
    }).join('');
    // Async load posters
    COLLECTIONS_DATA.forEach(col => loadCollectionPosters(col));
  }
  async function loadCollectionPosters(col) {
    const TMDB_KEY_VAL = localStorage.getItem('mf_tmdb_key') || '';
    if (!TMDB_KEY_VAL) return;
    const banner = document.getElementById(`col-banner-${col.id}`);
    if (!banner) return;
    const top3 = col.films.slice(0,3);
    const posters = await Promise.all(top3.map(async f => {
      try {
        const data = await fetch(`https://api.themoviedb.org/3/movie/${f.tmdbId}?api_key=${TMDB_KEY_VAL}&language=cs`).then(r=>r.json());
        return data.poster_path ? `https://image.tmdb.org/t/p/w185${data.poster_path}` : null;
      } catch { return null; }
    }));
    if (banner) {
      banner.innerHTML = posters.map((p,i) => p
        ? `<img class="collection-card-banner-img" src="${p}" alt="" loading="lazy" style="${i===0?'grid-column:1/-1;height:60%;object-fit:cover;':''}">`
        : `<div style="background:rgba(255,255,255,0.04);width:100%;height:100%;"></div>`
      ).join('');
    }
  }
  async function collectionsOpenDetail(id) {
    const col = COLLECTIONS_DATA.find(c => c.id === id);
    if (!col) return;
    _collectionsActive = col;
    const gridView = document.getElementById('collectionsGridView');
    const detailView = document.getElementById('collectionsDetailView');
    const breadcrumb = document.getElementById('collectionsBreadcrumb');
    const titleEl = document.getElementById('collectionsDetailTitle');
    const subtitleEl = document.getElementById('collectionsDetailSubtitle');
    const iconEl = document.getElementById('collectionsDetailIcon');
    const bgEl = document.getElementById('collectionsDetailBg');
    const filmsEl = document.getElementById('collectionsDetailFilms');

    if (gridView) gridView.style.display = 'none';
    if (detailView) detailView.classList.add('active');
    if (breadcrumb) breadcrumb.innerHTML = `
      <span class="collections-breadcrumb-home" onclick="collectionsShowGrid()">Kolekce</span>
      <span class="collections-breadcrumb-sep">›</span>
      <span class="collections-breadcrumb-current">${col.name}</span>
    `;
    if (titleEl) titleEl.textContent = col.name;
    if (subtitleEl) subtitleEl.textContent = `${col.films.length} filmů · ${col.universe}`;
    if (iconEl) iconEl.textContent = col.icon;
    if (filmsEl) filmsEl.innerHTML = `<div class="collections-loading"><div class="collections-loading-spinner"></div></div>`;

    // Fetch film posters + ratings
    const TMDB_KEY_VAL = localStorage.getItem('mf_tmdb_key') || '';
    const filmData = await Promise.all(col.films.map(async f => {
      try {
        if (!TMDB_KEY_VAL) return { ...f, poster: null, rating: null };
        const data = await fetch(`https://api.themoviedb.org/3/movie/${f.tmdbId}?api_key=${TMDB_KEY_VAL}&language=cs`).then(r=>r.json());
        return { ...f, poster: data.poster_path ? `https://image.tmdb.org/t/p/w185${data.poster_path}` : null, backdrop: data.backdrop_path, rating: data.vote_average?.toFixed(1) };
      } catch { return { ...f, poster: null, rating: null }; }
    }));

    // Set hero bg from first film backdrop
    if (bgEl && filmData[0]?.backdrop) {
      bgEl.style.backgroundImage = `url(https://image.tmdb.org/t/p/w780${filmData[0].backdrop})`;
    }

    if (filmsEl) {
      filmsEl.innerHTML = filmData.map((f,i) => `
        <div class="collections-film-row" onclick="collectionsPlayFilm('${f.title.replace(/'/g,"\\'")}','movie')">
          <div class="collections-film-num">${f.order}</div>
          <div class="collections-film-poster">${f.poster ? `<img src="${f.poster}" alt="" loading="lazy">` : ''}</div>
          <div class="collections-film-info">
            <div class="collections-film-title">${f.title}</div>
            <div class="collections-film-meta">${f.year}</div>
          </div>
          ${f.rating ? `<div class="collections-film-rating">★ ${f.rating}</div>` : ''}
          <button class="collections-film-play" title="Přehrát" onclick="event.stopPropagation();collectionsPlayFilm('${f.title.replace(/'/g,"\\'")}','movie')">▶</button>
        </div>
      `).join('');
    }
  }
  function collectionsPlayFilm(title, type) {
    closeCollections();
    setTimeout(() => {
      if (typeof openWithCopy === 'function') openWithCopy(title, type);
      else showToast(`▶ ${title}`);
    }, 400);
  }

  /* ══════════════════════════════════════════════════════════
     HLASOVÉ OVLÁDÁNÍ — Web Speech API
  ══════════════════════════════════════════════════════════ */
  let _voiceRecognition = null;
  let _voiceListening = false;

  function openVoiceCmd() {
    const el = document.getElementById('voiceCmdOverlay');
    if (!el) return;
    el.classList.add('open');
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
    startVoiceRecognition();
  }
  function closeVoiceCmd() {
    stopVoiceRecognition();
    const el = document.getElementById('voiceCmdOverlay');
    if (!el) return;
    el.classList.remove('visible', 'listening');
    setTimeout(() => el.classList.remove('open'), 300);
  }

  function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      document.getElementById('voiceCmdStatus').textContent = 'Prohlížeč nepodporuje hlasové ovládání';
      document.getElementById('voiceCmdTranscript').textContent = 'Zkus Chrome nebo Edge.';
      return;
    }
    if (_voiceRecognition) { try { _voiceRecognition.abort(); } catch {} }
    _voiceRecognition = new SpeechRecognition();
    _voiceRecognition.lang = 'cs-CZ';
    _voiceRecognition.continuous = false;
    _voiceRecognition.interimResults = true;
    _voiceListening = true;

    const overlay = document.getElementById('voiceCmdOverlay');
    const orb = document.getElementById('voiceCmdOrbCenter');
    const status = document.getElementById('voiceCmdStatus');
    const transcript = document.getElementById('voiceCmdTranscript');

    if (overlay) overlay.classList.add('listening');
    if (orb) orb.classList.add('listening');
    if (status) status.textContent = 'Poslouchám…';
    if (transcript) transcript.textContent = '';

    _voiceRecognition.onresult = (e) => {
      const interim = Array.from(e.results).map(r => r[0].transcript).join('');
      if (transcript) transcript.textContent = `"${interim}"`;
      if (e.results[e.results.length-1].isFinal) {
        processVoiceCommand(interim.toLowerCase().trim());
      }
    };
    _voiceRecognition.onerror = (e) => {
      if (status) status.textContent = 'Chyba: ' + (e.error === 'no-speech' ? 'Nic jsem neslyšel' : e.error);
      if (overlay) overlay.classList.remove('listening');
      if (orb) orb.classList.remove('listening');
    };
    _voiceRecognition.onend = () => {
      _voiceListening = false;
      if (overlay) overlay.classList.remove('listening');
      if (orb) orb.classList.remove('listening');
      if (status && status.textContent === 'Poslouchám…') status.textContent = 'Hotovo';
    };
    _voiceRecognition.start();
  }

  function stopVoiceRecognition() {
    _voiceListening = false;
    if (_voiceRecognition) { try { _voiceRecognition.abort(); } catch {} _voiceRecognition = null; }
  }

  function processVoiceCommand(cmd) {
    const status = document.getElementById('voiceCmdStatus');
    const resultEl = document.getElementById('voiceCmdResult');
    const resultText = document.getElementById('voiceCmdResultText');
    if (status) status.textContent = 'Zpracovávám…';

    let action = null;
    let feedback = '';

    // "Pusť / přehraj / spusť [název]"
    const playMatch = cmd.match(/(?:pusť|přehraj|spusť|dej mi)\s+(?:další díl\s+)?(.+)/i);
    // "Najdi [žánr / název]"
    const searchMatch = cmd.match(/(?:najdi|hledej|ukaž)\s+(?:mi\s+)?(?:nějaký\s+|nějaké\s+|film\s+)?(.+)/i);
    // "Náhodný film / seriál" / "Nevím co koukat"
    const randomMatch = cmd.match(/náhodný|ruleta|nevím co koukat|něco náhodného/i);
    // "Premiéry"
    const premiereMatch = cmd.match(/premiéry|co vychází|what.s on/i);
    // Specific series
    const seriesMatch = cmd.match(/(?:pusť|otevři|dej)\s+(?:seriál\s+)?(.+)/i);

    if (randomMatch) {
      action = () => { closeVoiceCmd(); setTimeout(() => openRuleta && openRuleta(), 400); };
      feedback = '🎲 Spouštím ruletu…';
    } else if (premiereMatch) {
      action = () => { closeVoiceCmd(); setTimeout(() => openPremiereCalendar(), 400); };
      feedback = '📅 Otevírám premiéry…';
    } else if (searchMatch) {
      const query = searchMatch[1].trim();
      action = () => { closeVoiceCmd(); setTimeout(() => { if (typeof openSearch === 'function') openSearch(); const inp = document.getElementById('searchTitleInput'); if (inp) { inp.value = query; inp.dispatchEvent(new Event('input')); } }, 400); };
      feedback = `🔍 Hledám: "${query}"`;
    } else if (playMatch) {
      const title = playMatch[1].trim();
      // Try to find series in db
      const slug = typeof db !== 'undefined' ? Object.keys(db).find(s => db[s]?.name?.toLowerCase().includes(title.split(' ')[0].toLowerCase())) : null;
      if (slug) {
        action = () => { closeVoiceCmd(); setTimeout(() => openSeries(slug), 400); };
        feedback = `▶ Otvírám: ${db[slug].name}`;
      } else {
        action = () => { closeVoiceCmd(); setTimeout(() => openWithCopy && openWithCopy(title, 'tv'), 400); };
        feedback = `▶ Přehrávám: "${title}"`;
      }
    } else {
      // Generic: send to AI
      action = () => {
        closeVoiceCmd();
        setTimeout(() => {
          if (typeof toggleAiPanel === 'function') { if (!aiPanelOpen) toggleAiPanel(); }
          setTimeout(() => {
            const inp = document.getElementById('aiInput');
            if (inp) { inp.value = cmd; }
            if (typeof sendAiMessage === 'function') sendAiMessage(cmd);
          }, 500);
        }, 400);
      };
      feedback = `🤖 Ptám se AI: "${cmd}"`;
    }

    if (resultEl) resultEl.classList.add('visible');
    if (resultText) resultText.textContent = feedback;
    if (status) status.textContent = 'Příkaz rozpoznán ✓';

    setTimeout(() => { if (action) action(); }, 1200);
  }

  // Override V key to open voice cmd overlay
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if ((e.key === 'v' || e.key === 'V') && !e.ctrlKey && !e.metaKey) {
      e.preventDefault(); openVoiceCmd();
    }
  });

  /* ══════════════════════════════════════════════════════════
     RULETA WHEEL — Fix canvas size for new 380px dimensions
  ══════════════════════════════════════════════════════════ */
  // Patch: ensure the wheel canvas uses correct size after DOM loads
  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('ruletaWheelCanvas');
    if (canvas) { canvas.width = 380; canvas.height = 380; }
    // Init premiere FAB badge on load
    setTimeout(() => {
      const badge = document.getElementById('premiereFabBadge');
      if (badge) badge.classList.remove('has-items');
    }, 500);
    // Render collections grid (pre-warm)
    renderCollectionsGrid();
  });

  


  // ══════════════════════════════════════════════════════════════
  // ADMIN PANEL — Logic
  // ══════════════════════════════════════════════════════════════
  const ADMIN_PIN_KEY = 'mf_admin_pin';
  const ADMIN_SETTINGS_KEY = 'mf_admin_settings';
  let _adminLogs = [];
  let _adminErrors = [];

  // ── Intercept console errors for log viewer ──────────────────
  (function() {
    const _origError = console.error.bind(console);
    const _origWarn = console.warn.bind(console);
    console.error = (...args) => { _adminErrors.push('[ERR] ' + args.join(' ')); if (_adminErrors.length > 100) _adminErrors.shift(); _origError(...args); };
    console.warn = (...args) => { _adminLogs.push('[WARN] ' + args.join(' ')); if (_adminLogs.length > 200) _adminLogs.shift(); _origWarn(...args); };
  })();

  function adminLog(msg, type = 'info') {
    const ts = new Date().toTimeString().slice(0,8);
    _adminLogs.push(`[${ts}] [${type.toUpperCase()}] ${msg}`);
    if (_adminLogs.length > 200) _adminLogs.shift();
  }

  // ── PIN gate ──────────────────────────────────────────────────
  function adminPinGateOpen() {
    const gate = document.getElementById('adminPinGate');
    gate.classList.add('open');
    setTimeout(() => document.getElementById('adminPinInput').focus(), 100);
  }
  function adminPinGateClose() {
    document.getElementById('adminPinGate').classList.remove('open');
    document.getElementById('adminPinInput').value = '';
    document.getElementById('adminPinHint').textContent = 'Nastav vlastní PIN v Admin → Nastavení';
    document.getElementById('adminPinHint').style.color = 'rgba(255,255,255,0.25)';
  }
  function adminCheckPin() {
    const input = document.getElementById('adminPinInput').value;
    const storedPin = localStorage.getItem(ADMIN_PIN_KEY) || '1337';
    if (input === storedPin) {
      adminPinGateClose();
      adminOpen();
    } else if (input.length >= 4) {
      document.getElementById('adminPinHint').textContent = '❌ Špatný PIN';
      document.getElementById('adminPinHint').style.color = '#ff5050';
      document.getElementById('adminPinInput').value = '';
    }
  }

  // ── Open / Close ──────────────────────────────────────────────
  function adminOpen() {
    openAdmin(); // Redirect to new admin panel
  }
  function adminClose() {
    closeAdmin(); // Redirect to new admin panel
  }

  // ── Tab switching ─────────────────────────────────────────────
  function adminTab(btn, panelId) {
    document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('adminPanel-' + panelId)?.classList.add('active');
    adminRefreshPanel(panelId);
  }

  // ── Refresh all panels ────────────────────────────────────────
  function adminRefreshAll() {
    adminRefreshPanel('stats');
    adminLoadSettings();
  }
  function adminRefreshPanel(panelId) {
    switch(panelId) {
      case 'stats': adminRenderStats(); break;
      case 'content': adminRenderContent(); break;
      case 'algo': adminRenderAlgo(); break;
      case 'users': adminRenderUsers(); break;
      case 'storage': adminRefreshStorage(); break;
      case 'logs': adminRefreshLogs(); break;
    }
  }

  // ── STATS PANEL ───────────────────────────────────────────────
  function adminRenderStats() {
    const watched = typeof getWatched === 'function' ? getWatched() : {};
    const watchedCount = Object.keys(watched).length;
    const dbCount = typeof db !== 'undefined' ? Object.keys(db).length : 0;
    const wl = typeof getWatchlist === 'function' ? getWatchlist() : [];
    const ratings = safeLS(uKey?.('mf_ratings', 'mf_ratings') || '{}');
    let timeline; try { timeline = safeLS(typeof uKey === 'function' ? uKey('mf_watch_timeline') : 'mf_watch_timeline', '[]'); } catch { timeline = []; }
    const profileCount = (typeof _getProfiles === 'function' ? _getProfiles() : []).length;

    // Celkový čas (odhadovaný — průměr 45 min/epizoda)
    const totalMins = watchedCount * 45;
    const totalHours = (totalMins / 60).toFixed(1);

    const stats = [
      { value: dbCount, label: 'Seriálů v DB', sub: 'sledované tituly' },
      { value: watchedCount, label: 'Zhlédnutých epizod', sub: '~' + totalHours + ' hod odhadovaně' },
      { value: wl.length, label: 'Watchlist', sub: 'chci koukat' },
      { value: Object.keys(ratings).length, label: 'Hodnocení', sub: 'loved/liked/meh' },
      { value: timeline.length, label: 'Watch events', sub: 'timeline záznamy' },
      { value: profileCount, label: 'Profilů', sub: 'Netflix-style' },
    ];

    const grid = document.getElementById('adminStatsGrid');
    if (grid) {
      grid.innerHTML = stats.map(s => `
        <div class="admin-stat-card">
          <div class="admin-stat-value">${s.value}</div>
          <div class="admin-stat-label">${s.label}</div>
          <div class="admin-stat-sub">${s.sub}</div>
        </div>`).join('');
    }

    // Series table
    const tbody = document.getElementById('adminSeriesTableBody');
    if (tbody && typeof db !== 'undefined') {
      tbody.innerHTML = Object.entries(db).map(([slug, s]) => {
        const prog = typeof calcProgress === 'function' ? calcProgress(slug) : { done: 0, total: s.totalEps || 0, pct: 0 };
        const ratingVal = ratings[slug]?.rating || '—';
        const badgeClass = ratingVal === 'loved' ? 'green' : ratingVal === 'liked' ? 'blue' : ratingVal === 'meh' ? 'red' : '';
        const pctColor = prog.pct >= 80 ? '#2ecc71' : prog.pct >= 40 ? '#f1c40f' : '#e74c3c';
        return `<tr>
          <td><strong>${s.name}</strong></td>
          <td>${prog.done}/${prog.total}</td>
          <td><span style="color:${pctColor};font-weight:700">${prog.pct}%</span></td>
          <td>${s._rating ? '★ ' + s._rating : '—'}</td>
          <td>${badgeClass ? `<span class="admin-badge ${badgeClass}">${ratingVal}</span>` : '<span style="color:rgba(255,255,255,0.25)">—</span>'}</td>
        </tr>`;
      }).join('') || '<tr><td colspan="5" style="text-align:center;color:rgba(255,255,255,0.3)">Žádné seriály</td></tr>';
    }

    // Genre bars
    const genreBarsEl = document.getElementById('adminGenreBars');
    if (genreBarsEl && typeof aiBrain !== 'undefined') {
      const prefs = aiBrain.memory?.genrePreferences || {};
      const top = Object.entries(prefs).sort((a,b) => b[1]-a[1]).slice(0, 10);
      const maxVal = top[0]?.[1] || 1;
      const genreLabels = { komedie:'😄 Komedie', drama:'🎭 Drama', akcni:'💥 Akce', 'sci-fi':'🚀 Sci-Fi', horor:'👻 Horor', fantasy:'🧙 Fantasy', krimi:'🔍 Krimi', animovany:'🎨 Animák', napinavy:'🔪 Thriller', rodinny:'👨‍👩‍👧 Rodinné' };
      const colors = ['#ff5050','#ff7040','#e8c020','#50ff80','#50c0ff','#9060ff','#ff60c0','#60ffd0','#ffa040','#80ff40'];
      genreBarsEl.innerHTML = top.length ? top.map(([key, val], i) => `
        <div class="admin-algo-bar-row">
          <div class="admin-algo-bar-label">${genreLabels[key] || key}</div>
          <div class="admin-algo-bar-track"><div class="admin-algo-bar-fill" style="width:${Math.round(val/maxVal*100)}%;background:${colors[i%colors.length]}"></div></div>
          <div class="admin-algo-bar-val">${Math.round(val*100)}%</div>
        </div>`).join('') : '<div style="font-size:0.65rem;color:rgba(255,255,255,0.3)">Žádná data — sleduj seriály pro AI učení</div>';
    }
  }

  // ── CONTENT PANEL ─────────────────────────────────────────────
  function adminRenderContent(filter = '') {
    const grid = document.getElementById('adminSeriesGrid');
    if (!grid || typeof db === 'undefined') return;
    const entries = Object.entries(db).filter(([slug, s]) => !filter || s.name.toLowerCase().includes(filter.toLowerCase()));
    grid.innerHTML = entries.map(([slug, s]) => {
      const prog = typeof calcProgress === 'function' ? calcProgress(slug) : { pct: 0 };
      return `<div class="admin-series-card">
        <img src="${s._poster || s.poster || ''}" alt="" onerror="this.style.opacity=0">
        <div class="admin-series-card-info">
          <div class="admin-series-card-name" title="${slug}">${s.name}</div>
          <div class="admin-series-card-meta">tmdb:${s.tmdbId || '?'} · ${s.totalEps || 0} ep · ${prog.pct}%</div>
        </div>
        <div class="admin-series-card-actions">
          <button class="admin-series-action-btn" onclick="adminEditSeries('${slug}')" title="Editovat">✏️</button>
          <button class="admin-series-action-btn" onclick="adminRemoveSeries('${slug}')" title="Odstranit">🗑</button>
        </div>
      </div>`;
    }).join('') || '<div style="color:rgba(255,255,255,0.3);font-size:0.72rem;padding:20px">Žádné seriály nalezeny</div>';
  }
  function adminFilterContent(val) { adminRenderContent(val); }

  function adminEditSeries(slug) {
    if (typeof db === 'undefined' || !db[slug]) return;
    const s = db[slug];
    const newName = prompt('Nový název:', s.name);
    if (newName && newName.trim()) {
      db[slug].name = newName.trim();
      if (typeof saveDb === 'function') saveDb();
      else if (typeof autoSave === 'function') autoSave();
      adminLog(`Série "${slug}" přejmenována na "${newName.trim()}"`, 'info');
      adminRenderContent();
      showToast?.(`✏️ Přejmenováno: ${newName.trim()}`);
    }
  }

  function adminRemoveSeries(slug) {
    if (!confirm(`Opravdu odstranit "${db[slug]?.name || slug}"?\nTato akce je nevratná!`)) return;
    delete db[slug];
    if (typeof saveDb === 'function') saveDb();
    adminLog(`Série "${slug}" odstraněna`, 'warn');
    adminRenderContent();
    showToast?.(`🗑 Odstraněno: ${slug}`);
  }

  function adminAddSeriesPrompt() {
    const name = prompt('Název seriálu:');
    if (!name?.trim()) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const tmdbId = parseInt(prompt('TMDB ID (nebo 0):') || '0');
    if (typeof db !== 'undefined') {
      db[slug] = { name: name.trim(), tmdbId, poster: '', totalEps: 0, runtime: 45 };
      if (typeof epsBySeason !== 'undefined') epsBySeason[slug] = [12];
      if (typeof saveDb === 'function') saveDb();
      adminLog(`Přidána série: ${name} (${slug})`, 'info');
      adminRenderContent();
      showToast?.(`✅ Přidáno: ${name.trim()}`);
    }
  }

  function adminExportDB() {
    if (typeof db === 'undefined') return;
    const json = JSON.stringify({ db, epsBySeason: typeof epsBySeason !== 'undefined' ? epsBySeason : {} }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mujflix_db_export_' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    adminLog('DB exportována', 'ok');
  }

  function adminImportDBPrompt() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data.db) {
            Object.assign(db, data.db);
            if (data.epsBySeason && typeof epsBySeason !== 'undefined') Object.assign(epsBySeason, data.epsBySeason);
            if (typeof saveDb === 'function') saveDb();
            adminLog('DB importována: ' + Object.keys(data.db).length + ' seriálů', 'ok');
            adminRenderContent();
            showToast?.('✅ DB importována!');
          }
        } catch(err) { alert('Chyba parsování JSON: ' + err.message); }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function adminRefetchAllPosters() {
    showToast?.('🖼 Stahuju postery...');
    adminLog('Bulk poster refetch zahájen', 'info');
    // Trigger TMDB fetch for each series (if enrichSeries function exists)
    if (typeof enrichAllSeriesWithTmdb === 'function') enrichAllSeriesWithTmdb();
    else showToast?.('ℹ️ Funkce enrichAllSeriesWithTmdb není dostupná');
  }

  function adminResetWatched() {
    if (!confirm('Opravdu smazat celou sledovanost? Toto nelze vrátit!')) return;
    localStorage.removeItem(typeof uKey === 'function' ? uKey('mf_watched') : 'mf_watched');
    if (typeof refreshUserContent === 'function') refreshUserContent();
    adminLog('Sledovanost smazána', 'warn');
    showToast?.('🗑 Sledovanost smazána');
    adminRenderStats();
  }

  // ── ALGO PANEL ────────────────────────────────────────────────
  function adminRenderAlgo() {
    const mem = typeof aiBrain !== 'undefined' ? aiBrain.memory || {} : {};
    const idPrefs = mem.genreIdPrefs || {};
    const top = Object.entries(idPrefs).sort((a,b) => b[1]-a[1]).slice(0,8);
    const maxVal = top[0]?.[1] || 1;
    const colors = ['#ff5050','#ff7040','#e8c020','#50ff80','#50c0ff','#9060ff','#ff60c0','#60ffd0'];
    const barsEl = document.getElementById('adminAlgoBrainBars');
    if (barsEl) {
      barsEl.innerHTML = top.length ? top.map(([gid, val], i) => `
        <div class="admin-algo-bar-row">
          <div class="admin-algo-bar-label">${TMDB_GENRE_CS?.[gid] || 'ID:'+gid} (${gid})</div>
          <div class="admin-algo-bar-track"><div class="admin-algo-bar-fill" style="width:${Math.round(val/maxVal*100)}%;background:${colors[i%colors.length]}"></div></div>
          <div class="admin-algo-bar-val">${val.toFixed(2)}</div>
        </div>`).join('')
      : '<div style="font-size:0.65rem;color:rgba(255,255,255,0.3)">Prázdný AI Brain — sleduj obsah</div>';
    }

    // Timeline preview
    adminRefreshAlgo();
  }

  function adminRefreshAlgo() {
    const tlKey = typeof uKey === 'function' ? uKey('mf_watch_timeline') : 'mf_watch_timeline';
    const timeline = safeLS(tlKey, '[]');
    const code = document.getElementById('adminTimelineCode');
    if (code) {
      if (!timeline.length) { code.textContent = 'Žádné záznamy v timeline'; return; }
      const last20 = timeline.slice(-20).reverse();
      code.textContent = last20.map(e => {
        const d = new Date(e.ts);
        const age = Math.round((Date.now()-e.ts)/60000);
        return `${d.toTimeString().slice(0,8)} (${age}m ago) | ${e.slug} | genres: [${(e.genres||[]).join(',')}]`;
      }).join('\n');
    }
  }

  function adminTestScore() {
    const title = document.getElementById('adminAlgoTestTitle').value || 'Test Film';
    const genreStr = document.getElementById('adminAlgoTestGenres').value || '';
    const rating = parseFloat(document.getElementById('adminAlgoTestRating').value) || 7.5;
    const genres = genreStr.split(',').map(Number).filter(Boolean);

    const mockItem = {
      id: Math.floor(Math.random()*100000),
      name: title,
      genre_ids: genres,
      vote_average: rating,
      vote_count: 1000,
      release_date: new Date().getFullYear() + '-01-01',
      _rowType: 'tv'
    };

    const result = typeof computeAiScore === 'function' ? computeAiScore(mockItem) : null;
    const resEl = document.getElementById('adminAlgoTestResult');
    if (resEl && result) {
      resEl.style.display = 'block';
      const sig = result.signals || {};
      resEl.innerHTML = `
        <div class="admin-score-title">Výsledek: <strong style="font-size:1.1rem">${result.score}% Shoda</strong> ${result.whyLabel ? '— ' + result.whyLabel : ''}</div>
        <div class="admin-algo-bars">
          ${Object.entries(sig).map(([key, val]) => `
            <div class="admin-algo-bar-row">
              <div class="admin-algo-bar-label">${key})</div>
              <div class="admin-algo-bar-track"><div class="admin-algo-bar-fill" style="width:${Math.round(Math.abs(val)*100)}%;background:${val < 0 ? '#ff4040' : '#50c0ff'}"></div></div>
              <div class="admin-algo-bar-val">${val.toFixed(2)}</div>
            </div>`).join('')}
        </div>`;
    }
  }

  function adminClearTimeline() {
    if (!confirm('Smazat watch timeline?')) return;
    const tlKey = typeof uKey === 'function' ? uKey('mf_watch_timeline') : 'mf_watch_timeline';
    localStorage.removeItem(tlKey);
    _momentumCache = null;
    adminRefreshAlgo();
    showToast?.('🗑 Timeline smazána');
    adminLog('Watch timeline vymazána', 'warn');
  }

  function adminResetAiBrain() {
    if (!confirm('Opravdu resetovat celý AI Brain? Ztratíš všechna naučená doporučení!')) return;
    if (typeof aiBrain !== 'undefined') {
      aiBrain.memory = { genrePreferences: {}, genreIdPrefs: {}, ratedGenres: {}, watchedTmdbIds: {}, watchedSlugs: {}, sessionGenres: [], totalWatched: 0 };
      aiBrain.save?.();
    }
    _momentumCache = null;
    _ratingSignalCache = null;
    adminLog('AI Brain resetován', 'warn');
    showToast?.('⚠ AI Brain resetován');
    adminRenderAlgo();
    adminRenderStats();
  }

  // ── USERS PANEL ───────────────────────────────────────────────
  function adminRenderUsers() {
    const profiles = typeof _getProfiles === 'function' ? _getProfiles() : [];
    const activeId = typeof getActiveProfileId === 'function' ? getActiveProfileId() : null;
    const tbody = document.getElementById('adminUsersTableBody');
    if (tbody) {
      tbody.innerHTML = profiles.map(p => {
        const watched = Object.keys(typeof getWatched === 'function' ? getWatched() : {}).length;
        const isActive = p.id === activeId;
        return `<tr>
          <td style="font-size:1.4rem">${p.avatar || '🎬'}</td>
          <td><strong>${p.name}</strong>${isActive ? ' <span class="admin-badge green">AKTIVNÍ</span>' : ''}</td>
          <td style="font-family:monospace;font-size:0.6rem;color:rgba(255,255,255,0.35)">${p.id}</td>
          <td>${p.pin ? '<span class="admin-badge yellow">●●●●</span>' : '<span style="color:rgba(255,255,255,0.25)">žádný</span>'}</td>
          <td><div style="width:18px;height:18px;border-radius:50%;background:${p.color||'#007AFF'};border:1px solid rgba(255,255,255,0.2)"></div></td>
          <td>${isActive ? watched : '—'}</td>
          <td><button class="admin-series-action-btn" onclick="adminSwitchToProfile('${p.id}')">Přepnout</button></td>
        </tr>`;
      }).join('') || '<tr><td colspan="7" style="text-align:center;color:rgba(255,255,255,0.3)">Žádné profily</td></tr>';
    }

    // Switch buttons
    const switchEl = document.getElementById('adminProfileSwitchBtns');
    if (switchEl) {
      switchEl.innerHTML = profiles.map(p =>
        `<button class="admin-btn secondary" onclick="adminSwitchToProfile('${p.id}')" style="${p.id === activeId ? 'border-color:rgba(80,220,120,0.5);color:#50dc78' : ''}">${p.avatar||'🎬'} ${p.name}</button>`
      ).join('');
    }
  }

  function adminSwitchToProfile(pid) {
    if (typeof ProfileGate !== 'undefined') ProfileGate.activateProfile(pid);
    adminLog('Přepnuto na profil: ' + pid, 'info');
    adminRenderUsers();
  }

  // ── STORAGE PANEL ─────────────────────────────────────────────
  function adminRefreshStorage(filter = '') {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!filter || key.toLowerCase().includes(filter.toLowerCase())) keys.push(key);
    }
    keys.sort();

    // Stats
    let totalBytes = 0;
    keys.forEach(k => { totalBytes += (localStorage.getItem(k) || '').length * 2; });
    const statsEl = document.getElementById('adminStorageStats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="admin-stat-card"><div class="admin-stat-value">${keys.length}</div><div class="admin-stat-label">Klíčů</div></div>
        <div class="admin-stat-card"><div class="admin-stat-value">${(totalBytes/1024).toFixed(1)}</div><div class="admin-stat-label">KB použito</div><div class="admin-stat-sub">z ~5MB limitu</div></div>
        <div class="admin-stat-card"><div class="admin-stat-value">${((totalBytes/1024/5000)*100).toFixed(1)}%</div><div class="admin-stat-label">Plnost</div></div>
      `;
    }

    // Key browser
    const codeEl = document.getElementById('adminStorageCode');
    if (codeEl) {
      codeEl.textContent = keys.map(key => {
        let val = localStorage.getItem(key) || '';
        if (val.length > 120) val = val.slice(0, 120) + '...';
        return `${key}\n  → ${val}`;
      }).join('\n\n') || 'Žádné klíče';
      codeEl.onclick = () => { navigator.clipboard?.writeText(codeEl.textContent); showToast?.('📋 Zkopírováno!'); };
    }
  }

  function adminFilterStorage(val) { adminRefreshStorage(val); }

  function adminExportAllStorage() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mujflix_storage_backup_' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    adminLog('localStorage exportován', 'ok');
  }

  function adminClearCache() {
    const cacheKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.includes('_cache') || key.includes('tmdb_cache')) cacheKeys.push(key);
    }
    cacheKeys.forEach(k => localStorage.removeItem(k));
    adminLog(`Cache vymazána (${cacheKeys.length} klíčů)`, 'ok');
    showToast?.(`🗑 Cache vymazána (${cacheKeys.length} klíčů)`);
    adminRefreshStorage();
  }

  // ── LOGS PANEL ────────────────────────────────────────────────
  function adminRefreshLogs() {
    const logEl = document.getElementById('adminLogViewer');
    if (logEl) {
      logEl.innerHTML = _adminLogs.length
        ? _adminLogs.slice(-50).reverse().map(l => {
            const cls = l.includes('[INFO]') ? 'log-info' : l.includes('[WARN]') ? 'log-warn' : l.includes('[OK]') ? 'log-ok' : '';
            return `<div class="${cls}">${l}</div>`;
          }).join('')
        : '<div style="color:rgba(255,255,255,0.3)">Žádné logy</div>';
    }
    const errEl = document.getElementById('adminErrorLog');
    if (errEl) {
      errEl.innerHTML = _adminErrors.length
        ? _adminErrors.slice(-30).reverse().map(l => `<div class="log-err">${l}</div>`).join('')
        : '<div style="color:rgba(80,220,120,0.6)">Žádné chyby 🎉</div>';
    }
  }
  function adminClearLogs() { _adminLogs = []; _adminErrors = []; adminRefreshLogs(); }
  function adminCopyLogs() {
    const all = [..._adminLogs, ..._adminErrors].join('\n');
    navigator.clipboard?.writeText(all).then(() => showToast?.('📋 Logy zkopírovány'));
  }

  // ── SETTINGS PANEL ────────────────────────────────────────────
  function adminLoadSettings() {
    try {
      const s = safeLS(ADMIN_SETTINGS_KEY, '{}');
      const visToggle = document.getElementById('adminVisibleToggle');
      const debugToggle = document.getElementById('adminDebugToggle');
      const verboseToggle = document.getElementById('adminVerboseToggle');
      if (visToggle) visToggle.classList.toggle('on', !!s.visible);
      if (debugToggle) debugToggle.classList.toggle('on', !!s.debug);
      if (verboseToggle) verboseToggle.classList.toggle('on', !!s.verbose);

      // Apply visibility
      const trigger = document.getElementById('adminTriggerBtn');
      if (trigger) trigger.classList.toggle('visible', !!s.visible);
    } catch {}
  }

  function adminSaveSettings(patch) {
    const s = safeLS(ADMIN_SETTINGS_KEY, '{}');
    Object.assign(s, patch);
    safeSetItem(ADMIN_SETTINGS_KEY, JSON.stringify(s));
    adminLoadSettings();
  }

  function adminSavePin() {
    const pin = document.getElementById('adminNewPin').value.trim();
    if (pin.length < 4) { showToast?.('PIN musí mít alespoň 4 číslice'); return; }
    localStorage.setItem(ADMIN_PIN_KEY, pin);
    document.getElementById('adminNewPin').value = '';
    showToast?.('🔐 Admin PIN uložen');
    adminLog('Admin PIN změněn', 'ok');
  }

  function adminToggleVisible(el) {
    el.classList.toggle('on');
    adminSaveSettings({ visible: el.classList.contains('on') });
  }
  function adminToggleDebug(el) {
    el.classList.toggle('on');
    adminSaveSettings({ debug: el.classList.contains('on') });
    showToast?.(el.classList.contains('on') ? '🐛 Debug mode ON — AI skóre viditelné' : '🐛 Debug mode OFF');
  }
  function adminToggleVerbose(el) {
    el.classList.toggle('on');
    adminSaveSettings({ verbose: el.classList.contains('on') });
  }

  function adminFactoryReset() {
    if (!confirm('⚠️ FACTORY RESET ⚠️\n\nToto smaže VŠECHNA data MůjFlixu.\nJsi si jistý? Toto nelze vrátit!')) return;
    if (!confirm('Opravdu? Všechna data budou smazána!')) return;
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('mf_') || key.startsWith('trakt_') || key.startsWith('ai_')) keysToRemove.push(key);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    adminLog('FACTORY RESET proveden', 'warn');
    showToast?.('☠ Factory reset hotov — obnovuji stránku...');
    setTimeout(() => location.reload(), 1500);
  }

  function adminClearAllProfiles() {
    if (!confirm('Smazat všechny profily?')) return;
    localStorage.removeItem('mf_profiles');
    localStorage.removeItem('mf_profiles_v2');
    localStorage.removeItem('mf_active_pid');
    showToast?.('🗑 Profily smazány — obnovuji...');
    setTimeout(() => location.reload(), 1000);
  }

  // ── Keyboard shortcut: Ctrl+Shift+A → otevři admin ───────────
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      e.preventDefault();
      adminPinGateOpen();
    }
  });

  // ── Init: obnov admin trigger viditelnost ─────────────────────
  (function adminInit() {
    try {
      const s = safeLS(ADMIN_SETTINGS_KEY, '{}');
      const trigger = document.getElementById('adminTriggerBtn');
      if (trigger && s.visible) trigger.classList.add('visible');
    } catch {}
    adminLog('MůjFlix admin modul načten', 'ok');
  })();
  


  // ═══════════════════════════════════════════════════════════════
  // EDIT REŽIM v2 — přehledný, výkonný
  // ═══════════════════════════════════════════════════════════════
  const EDIT_STORAGE_KEY = 'mf_fab_layout_v2';
  const SNAP_PX = 16;
  const ROW_HEIGHTS = [22, 96, 170]; // bottom hodnoty pro 3 řady

  const FAB_REGISTRY = [
    { id: 'aiFab',           name: 'AI',        icon: '🤖', selector: '#aiFab'           },
    { id: 'watchlistFab',    name: 'Watchlist', icon: '🔖', selector: '#watchlistFab'    },
    { id: 'statsFab',        name: 'Wrapped',   icon: '🎬', selector: '#statsFab'        },
    { id: 'editRuletaFab',   name: 'Ruleta',    icon: '🎰', selector: '.ruleta-fab'      },
    { id: 'editPremiereFab', name: 'Premiéry',  icon: '📅', selector: '.premiere-fab'    },
    { id: 'editColFab',      name: 'Kolekce',   icon: '🎞', selector: '.collections-fab' },
    { id: 'voiceModeFab',    name: 'Hlas',      icon: '🎤', selector: '#voiceModeFab'    },
    { id: 'syncBtn',         name: 'Sync',      icon: '🔄', selector: '#syncBtn'         },
  ];

  let _editActive = false;
  let _selectedFab = null;
  let _editProps = {};
  let _dragState = null;
  let _copiedStyle = null;

  // ── Open / Close ────────────────────────────────────────────
  function openEditMode() {
    _editActive = true;
    _loadEditLayout();
    document.body.classList.add('edit-mode-active');
    document.getElementById('editOverlay').classList.add('open');
    requestAnimationFrame(() => document.getElementById('editOverlay').classList.add('visible'));
    document.getElementById('editTopbar').classList.add('visible');

    // Attach drag + build chip list
    FAB_REGISTRY.forEach(fab => {
      const el = document.querySelector(fab.selector);
      if (!el) return;
      el.dataset.fabId = fab.id;
      _applyStoredProps(el, fab.id);
      _attachDrag(el, fab);
    });
    _buildFabList();
    _openTray();
  }

  function closeEditMode() {
    _editActive = false;
    _selectedFab = null;
    document.body.classList.remove('edit-mode-active');
    document.getElementById('editOverlay').classList.remove('visible');
    setTimeout(() => document.getElementById('editOverlay').classList.remove('open'), 300);
    document.getElementById('editTopbar').classList.remove('visible');
    closeTray();
    _saveEditLayout();
  }

  function handleOverlayClick(e) {
    if (e.target === document.getElementById('editOverlay')) _deselectFab();
  }

  // ── Tray ────────────────────────────────────────────────────
  function _openTray() {
    const t = document.getElementById('editFabTray');
    t.classList.add('open');
    requestAnimationFrame(() => t.classList.add('visible'));
  }
  function closeTray() {
    const t = document.getElementById('editFabTray');
    t.classList.remove('visible');
    setTimeout(() => t.classList.remove('open'), 350);
  }

  function _buildFabList() {
    const list = document.getElementById('editFabList');
    if (!list) return;
    list.innerHTML = FAB_REGISTRY.map(fab => {
      const el = document.querySelector(fab.selector);
      const p = _editProps[fab.id] || {};
      const isHidden = p.hidden;
      return `<div class="edit-fab-chip${isHidden?' hidden-fab':''}" id="chip_${fab.id}" onclick="selectFabById('${fab.id}')">
        <span class="edit-fab-chip-icon">${fab.icon}</span>
        <span>${fab.name}</span>
        ${isHidden ? '<span style="font-size:0.4rem;color:rgba(255,100,100,0.7);">skrytá</span>' : ''}
      </div>`;
    }).join('');
  }

  function selectFabById(id) {
    const fab = FAB_REGISTRY.find(f => f.id === id);
    if (!fab) return;
    const el = document.querySelector(fab.selector);
    if (!el) return;
    _selectFab(el, fab);
  }

  // ── Select / Deselect ────────────────────────────────────────
  function _selectFab(el, fab) {
    document.querySelectorAll('.fab-selected').forEach(e => e.classList.remove('fab-selected'));
    document.querySelectorAll('.edit-fab-chip').forEach(c => c.classList.remove('selected'));
    el.classList.add('fab-selected');
    const chip = document.getElementById('chip_' + fab.id);
    if (chip) chip.classList.add('selected');
    _selectedFab = { el, fab };
    _showTrayProps(el, fab);
  }

  function _deselectFab() {
    document.querySelectorAll('.fab-selected').forEach(e => e.classList.remove('fab-selected'));
    document.querySelectorAll('.edit-fab-chip').forEach(c => c.classList.remove('selected'));
    _selectedFab = null;
    const sec = document.getElementById('editPropsSection');
    if (sec) sec.style.display = 'none';
    const nameEl = document.getElementById('editTrayName');
    if (nameEl) nameEl.innerHTML = '✏ <span>Vyber ikonku</span>';
  }

  function _showTrayProps(el, fab) {
    const sec = document.getElementById('editPropsSection');
    if (sec) sec.style.display = 'block';

    const nameEl = document.getElementById('editTrayName');
    if (nameEl) nameEl.innerHTML = `${fab.icon} <span>${fab.name}</span>`;

    const id = fab.id;
    const p = _editProps[id] || {};
    const iconEl = el.querySelector('.mf-fab-icon') || el;

    // Sliders
    const w = parseInt(iconEl.style.width) || 52;
    const h = parseInt(iconEl.style.height) || 52;
    const r = parseInt(iconEl.style.borderRadius) || 16;
    const o = Math.round((parseFloat(el.style.opacity) || 1) * 100);
    _setSlider('editSliderW','editValW', w);
    _setSlider('editSliderH','editValH', h);
    _setSlider('editSliderR','editValR', r);
    _setSlider('editSliderO','editValO', o);

    // Toggles
    _syncToggle('editToggleShadow', p.shadow !== false);
    _syncToggle('editToggleGlow',   p.glow   !== false);
    _syncToggle('editToggleLabel',  p.label  !== false);
    _syncToggle('editToggleMagnet', p.magnet !== false);
    _syncToggle('editToggleBlur',   p.blur   !== false);
    _syncToggle('editToggleBorder', p.border !== false);
    _syncToggle('editTogglePulse',  !!p.pulse);
    _syncToggle('editToggleBounce', !!p.bounce);

    // Hide button label
    const hideBtn = document.getElementById('editToggleHide');
    if (hideBtn) hideBtn.textContent = p.hidden ? '👁 Zobrazit ikonku' : '🙈 Skrýt ikonku';
  }

  function _setSlider(sid, vid, val) {
    const s=document.getElementById(sid); const v=document.getElementById(vid);
    if(s) s.value=val; if(v) v.textContent=val;
  }
  function _syncToggle(id, isOn) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('on', !!isOn);
  }

  // ── Apply property ────────────────────────────────────────────
  function applyEditProp(prop, value, swatchEl) {
    if (!_selectedFab) return;
    const { el, fab } = _selectedFab;
    const id = fab.id;
    if (!_editProps[id]) _editProps[id] = {};
    const p = _editProps[id];
    const iconEl = el.querySelector('.mf-fab-icon') || el;

    if (swatchEl) {
      document.querySelectorAll('.edit-color-swatch').forEach(s => s.classList.remove('active'));
      swatchEl.classList.add('active');
    }

    switch(prop) {
      case 'width':
        iconEl.style.width = value + 'px';
        document.getElementById('editValW').textContent = value;
        p.w = +value; break;
      case 'height':
        iconEl.style.height = value + 'px';
        document.getElementById('editValH').textContent = value;
        p.h = +value; break;
      case 'radius':
        iconEl.style.borderRadius = value + 'px';
        document.getElementById('editSliderR').value = value;
        document.getElementById('editValR').textContent = value;
        p.r = +value; break;
      case 'opacity':
        el.style.opacity = value / 100;
        document.getElementById('editValO').textContent = value;
        p.opacity = +value; break;
      case 'color':
        _applyColor(el, iconEl, value);
        p.color = value; break;
    }
    _saveEditLayout();
  }

  function applyPresetSize(size) {
    applyEditProp('width', size);
    applyEditProp('height', size);
    _setSlider('editSliderW','editValW', size);
    _setSlider('editSliderH','editValH', size);
  }

  function toggleEditProp(prop, toggleEl) {
    if (!_selectedFab) return;
    const { el, fab } = _selectedFab;
    const id = fab.id;
    if (!_editProps[id]) _editProps[id] = {};
    const p = _editProps[id];
    const iconEl = el.querySelector('.mf-fab-icon') || el;

    switch(prop) {
      case 'shadow':
        p.shadow = p.shadow === false ? true : false;
        iconEl.style.boxShadow = p.shadow === false ? 'none' : '';
        _syncToggle('editToggleShadow', p.shadow !== false); break;
      case 'glow':
        p.glow = p.glow === false ? true : false;
        iconEl.style.filter = p.glow === false ? 'none' : '';
        _syncToggle('editToggleGlow', p.glow !== false); break;
      case 'label':
        p.label = p.label === false ? true : false;
        const lbl = el.querySelector('.mf-fab-label,.ruleta-fab-label,.premiere-fab-label,.collections-fab-label,.mf-fab-label');
        if (lbl) lbl.style.display = p.label === false ? 'none' : '';
        _syncToggle('editToggleLabel', p.label !== false); break;
      case 'magnet':
        p.magnet = p.magnet === false ? true : false;
        _syncToggle('editToggleMagnet', p.magnet !== false); break;
      case 'blur':
        p.blur = p.blur === false ? true : false;
        iconEl.style.backdropFilter = p.blur === false ? 'none' : '';
        _syncToggle('editToggleBlur', p.blur !== false); break;
      case 'border':
        p.border = p.border === false ? true : false;
        iconEl.style.borderWidth = p.border === false ? '0' : '';
        _syncToggle('editToggleBorder', p.border !== false); break;
      case 'pulse':
        p.pulse = !p.pulse;
        el.style.animation = p.pulse ? 'fabPulse 2s ease-in-out infinite' : '';
        _syncToggle('editTogglePulse', !!p.pulse); break;
      case 'bounce':
        p.bounce = !p.bounce;
        if (p.bounce) {
          el.dataset.origTransition = iconEl.style.transition;
          iconEl.style.setProperty('--fab-hover-transform', 'translateY(-8px) scale(1.12)');
        }
        _syncToggle('editToggleBounce', !!p.bounce); break;
    }
    _saveEditLayout();
  }

  function toggleHideFab() {
    if (!_selectedFab) return;
    const { el, fab } = _selectedFab;
    const id = fab.id;
    if (!_editProps[id]) _editProps[id] = {};
    _editProps[id].hidden = !_editProps[id].hidden;
    el.classList.toggle('fab-hidden-by-user', !!_editProps[id].hidden);
    const btn = document.getElementById('editToggleHide');
    if (btn) btn.textContent = _editProps[id].hidden ? '👁 Zobrazit ikonku' : '🙈 Skrýt ikonku';
    _buildFabList(); // refresh chips
    _saveEditLayout();
    showToast?.(_editProps[id].hidden ? '🙈 Ikonka skryta' : '👁 Ikonka zobrazena');
  }

  // ── Pozice presets ────────────────────────────────────────────
  function snapFabTo(pos) {
    if (!_selectedFab) return;
    const { el } = _selectedFab;
    const vw = window.innerWidth, vh = window.innerHeight;
    const w = el.offsetWidth, h = el.offsetHeight;
    const margin = 22;
    const positions = {
      tl: [margin, null, null, vh - h - margin],
      tc: [(vw-w)/2, null, null, vh - h - margin],
      tr: [null, margin, null, vh - h - margin],
      ml: [margin, null, null, (vh-h)/2],
      mc: [(vw-w)/2, null, null, (vh-h)/2],
      mr: [null, margin, null, (vh-h)/2],
      bl: [margin, null, null, margin],
      bc: [(vw-w)/2, null, null, margin],
      br: [null, margin, null, margin],
    };
    const [left, right, top, bottom] = positions[pos] || [null,null,null,null];
    el.style.left   = left   !== null ? left   + 'px' : '';
    el.style.right  = right  !== null ? right  + 'px' : '';
    el.style.top    = top    !== null ? top    + 'px' : '';
    el.style.bottom = bottom !== null ? bottom + 'px' : '';
    if (left !== null) el.style.right = 'auto';
    if (right !== null) el.style.left = 'auto';
    _savePos(el);
    _saveEditLayout();
    showToast?.('📍 Přesunuto');
  }

  function snapFabToRow(row) {
    if (!_selectedFab) return;
    const { el } = _selectedFab;
    const b = ROW_HEIGHTS[row - 1] ?? 22;
    el.style.bottom = b + 'px';
    el.style.top = 'auto';
    _savePos(el);
    _saveEditLayout();
    showToast?.('📍 Řada ' + row);
  }

  function _savePos(el) {
    const fab = FAB_REGISTRY.find(f => document.querySelector(f.selector) === el);
    if (!fab) return;
    const rect = el.getBoundingClientRect();
    if (!_editProps[fab.id]) _editProps[fab.id] = {};
    _editProps[fab.id].x = rect.left;
    _editProps[fab.id].y = window.innerHeight - rect.bottom;
  }

  // ── Kopírovat / Vložit styl ───────────────────────────────────
  function duplicateFabStyle() {
    if (!_selectedFab) return;
    _copiedStyle = Object.assign({}, _editProps[_selectedFab.fab.id] || {});
    delete _copiedStyle.x; delete _copiedStyle.y; delete _copiedStyle.hidden;
    showToast?.('⧉ Styl zkopírován');
  }
  function pasteFabStyle() {
    if (!_selectedFab || !_copiedStyle) { showToast?.('Nejdřív zkopíruj styl'); return; }
    const { el, fab } = _selectedFab;
    const id = fab.id;
    const pos = { x: _editProps[id]?.x, y: _editProps[id]?.y, hidden: _editProps[id]?.hidden };
    _editProps[id] = Object.assign({}, _copiedStyle, pos);
    _applyStoredProps(el, id);
    _showTrayProps(el, fab);
    _saveEditLayout();
    showToast?.('✓ Styl vložen');
  }

  function resetSelectedFab() {
    if (!_selectedFab) return;
    const { el, fab } = _selectedFab;
    const id = fab.id;
    _editProps[id] = {};
    _clearFabStyles(el);
    _showTrayProps(el, fab);
    _saveEditLayout();
    showToast?.('↺ Ikonka resetována');
  }

  function _clearFabStyles(el) {
    el.style.left=''; el.style.right=''; el.style.top=''; el.style.bottom='';
    el.style.opacity=''; el.style.animation='';
    el.classList.remove('fab-hidden-by-user');
    const iconEl = el.querySelector('.mf-fab-icon') || el;
    iconEl.style.width=''; iconEl.style.height=''; iconEl.style.borderRadius='';
    iconEl.style.boxShadow=''; iconEl.style.filter=''; iconEl.style.borderColor='';
    iconEl.style.backdropFilter=''; iconEl.style.borderWidth='';
    const svg = el.querySelector('svg'); if (svg) svg.style.color='';
    const lbl = el.querySelector('.mf-fab-label,.ruleta-fab-label,.premiere-fab-label,.collections-fab-label');
    if (lbl) lbl.style.display='';
  }

  // ── Color apply ───────────────────────────────────────────────
  function _applyColor(el, iconEl, color) {
    iconEl.style.borderColor = color + '55';
    iconEl.style.boxShadow = `0 4px 20px rgba(0,0,0,0.6), 0 0 18px ${color}22`;
    const svg = el.querySelector('svg'); if (svg) svg.style.color = color;
    const lbl = el.querySelector('.mf-fab-label,.ruleta-fab-label,.premiere-fab-label,.collections-fab-label');
    if (lbl) lbl.style.color = color;
  }

  // ── Drag ──────────────────────────────────────────────────────
  function _attachDrag(el, fab) {
    if (el._editDragAttached) return;
    el._editDragAttached = true;

    el.addEventListener('mousedown', e => {
      if (!_editActive) return;
      e.preventDefault(); e.stopPropagation();
      _selectFab(el, fab);
      const rect = el.getBoundingClientRect();
      _dragState = {
        el, startX: e.clientX, startY: e.clientY,
        startLeft: rect.left, startBottom: window.innerHeight - rect.bottom
      };
      const onMove = mv => {
        if (!_dragState) return;
        const dx = mv.clientX - _dragState.startX;
        const dy = -(mv.clientY - _dragState.startY);
        let left = _dragState.startLeft + dx;
        let bottom = _dragState.startBottom + dy;
        const p = _editProps[fab.id] || {};
        if (p.magnet !== false) {
          const vw = window.innerWidth, vh = window.innerHeight;
          const w = el.offsetWidth, h = el.offsetHeight;
          if (left < SNAP_PX) { left=0; _showSnap('v',0); }
          else if (left+w > vw-SNAP_PX) { left=vw-w; _showSnap('v',vw-w); } else _hideSnap('v');
          if (bottom < SNAP_PX) { bottom=0; _showSnap('h',vh); }
          else if (bottom+h > vh-SNAP_PX) { bottom=vh-h; _showSnap('h',h); } else _hideSnap('h');
          const cx=(vw-w)/2;
          if (Math.abs(left-cx)<SNAP_PX) { left=cx; _showSnap('v',cx); }
        }
        el.style.left=left+'px'; el.style.right='auto';
        el.style.bottom=bottom+'px'; el.style.top='auto';
      };
      const onUp = () => {
        if (!_dragState) return;
        const r = _dragState.el.getBoundingClientRect();
        if (!_editProps[fab.id]) _editProps[fab.id]={};
        _editProps[fab.id].x = r.left;
        _editProps[fab.id].y = window.innerHeight - r.bottom;
        _dragState=null;
        _hideSnap('h'); _hideSnap('v');
        _saveEditLayout();
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    // Touch support
    el.addEventListener('touchstart', e => {
      if (!_editActive) return;
      e.preventDefault(); e.stopPropagation();
      _selectFab(el, fab);
      const touch = e.touches[0];
      const rect = el.getBoundingClientRect();
      _dragState = {
        el, startX: touch.clientX, startY: touch.clientY,
        startLeft: rect.left, startBottom: window.innerHeight - rect.bottom
      };
    }, { passive: false });
    el.addEventListener('touchmove', e => {
      if (!_dragState || !_editActive) return;
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - _dragState.startX;
      const dy = -(touch.clientY - _dragState.startY);
      let left = _dragState.startLeft + dx;
      let bottom = _dragState.startBottom + dy;
      el.style.left=left+'px'; el.style.right='auto';
      el.style.bottom=bottom+'px'; el.style.top='auto';
    }, { passive: false });
    el.addEventListener('touchend', e => {
      if (!_dragState) return;
      const r = el.getBoundingClientRect();
      if (!_editProps[fab.id]) _editProps[fab.id]={};
      _editProps[fab.id].x = r.left;
      _editProps[fab.id].y = window.innerHeight - r.bottom;
      _dragState=null;
      _saveEditLayout();
    });
  }

  // ── Load / Save ───────────────────────────────────────────────
  function _loadEditLayout() {
    try { _editProps = safeLS(EDIT_STORAGE_KEY, '{}'); } catch { _editProps={}; }
  }
  function _saveEditLayout() {
    localStorage.setItem(EDIT_STORAGE_KEY, JSON.stringify(_editProps));
  }

  function _applyStoredProps(el, id) {
    const p = _editProps[id]; if (!p) return;
    const iconEl = el.querySelector('.mf-fab-icon') || el;
    if (p.x !== undefined) { el.style.left='auto'; el.style.right='auto'; el.style.left=p.x+'px'; }
    if (p.y !== undefined) { el.style.bottom='auto'; el.style.top='auto'; el.style.bottom=p.y+'px'; }
    if (p.w) iconEl.style.width=p.w+'px';
    if (p.h) iconEl.style.height=p.h+'px';
    if (p.r !== undefined) iconEl.style.borderRadius=p.r+'px';
    if (p.opacity !== undefined) el.style.opacity=p.opacity/100;
    if (p.color) _applyColor(el, iconEl, p.color);
    if (p.shadow===false) iconEl.style.boxShadow='none';
    if (p.glow===false) iconEl.style.filter='none';
    if (p.blur===false) iconEl.style.backdropFilter='none';
    if (p.border===false) iconEl.style.borderWidth='0';
    if (p.pulse) el.style.animation='fabPulse 2s ease-in-out infinite';
    const lbl = el.querySelector('.mf-fab-label,.ruleta-fab-label,.premiere-fab-label,.collections-fab-label');
    if (lbl && p.label===false) lbl.style.display='none';
    if (p.hidden) el.classList.add('fab-hidden-by-user');
    else el.classList.remove('fab-hidden-by-user');
  }

  // ── Snap lines ────────────────────────────────────────────────
  function _showSnap(dir, pos) {
    if (dir==='h') { const l=document.getElementById('snapLineH'); if(l){l.style.display='block';l.style.bottom=pos+'px';l.style.top='auto';} }
    else { const l=document.getElementById('snapLineV'); if(l){l.style.display='block';l.style.left=pos+'px';} }
  }
  function _hideSnap(dir) {
    const l=document.getElementById(dir==='h'?'snapLineH':'snapLineV'); if(l) l.style.display='none';
  }

  // ── Reset all ─────────────────────────────────────────────────
  function resetEditLayout() {
    if (!confirm('Obnovit výchozí rozložení všech ikonek?')) return;
    _editProps={};
    localStorage.removeItem(EDIT_STORAGE_KEY);
    FAB_REGISTRY.forEach(fab => {
      const el=document.querySelector(fab.selector); if(!el) return;
      _clearFabStyles(el);
    });
    _deselectFab();
    _buildFabList();
    showToast?.('✓ Rozložení obnoveno');
  }

  // ── Pulse animation (CSS) ────────────────────────────────────
  const _pulseStyle = document.createElement('style');
  _pulseStyle.textContent = '@keyframes fabPulse { 0%,100%{transform:scale(1)}50%{transform:scale(1.08)} }';
  document.head.appendChild(_pulseStyle);

  // ── Init: apply saved layout on page load ─────────────────────
  (function initEditLayout() {
    try {
      _editProps = safeLS(EDIT_STORAGE_KEY, '{}');
      FAB_REGISTRY.forEach(fab => {
        const el=document.querySelector(fab.selector);
        if (el) { el.dataset.fabId=fab.id; _applyStoredProps(el, fab.id); }
      });
    } catch {}
  })();


  


  // ══════════════════════════════════════════════════════
  // VOICE MODE
  // ══════════════════════════════════════════════════════
  let _vmListening = false;
  let _vmRecog = null;

  function openVoiceMode() {
    const el = document.getElementById('voiceModeOverlay');
    el.style.display = 'flex';
    requestAnimationFrame(() => el.classList.add('visible'));
    document.getElementById('voiceModeFab').classList.add('active');
  }

  function closeVoiceMode() {
    const el = document.getElementById('voiceModeOverlay');
    el.classList.remove('visible');
    setTimeout(() => { el.style.display = 'none'; }, 400);
    document.getElementById('voiceModeFab').classList.remove('active');
    if (_vmListening) { vmStopListen(); }
  }

  function vmToggleListen() {
    if (_vmListening) { vmStopListen(); } else { vmStartListen(); }
  }

  function vmStartListen() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      document.getElementById('vmTranscript').textContent = 'Tvůj prohlížeč hlasové ovládání nepodporuje 😔';
      return;
    }
    _vmListening = true;
    const orb = document.getElementById('vmOrb');
    orb.classList.add('listening');
    document.getElementById('vmStatus').textContent = 'Poslouchám…';
    document.getElementById('vmTranscript').textContent = '';
    _vmRecog = new SpeechRecognition();
    _vmRecog.lang = 'cs-CZ';
    _vmRecog.continuous = false;
    _vmRecog.interimResults = true;
    _vmRecog.onresult = e => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      document.getElementById('vmTranscript').textContent = transcript;
      if (e.results[e.results.length - 1].isFinal) {
        vmHandleCommand(transcript.toLowerCase().trim());
      }
    };
    _vmRecog.onend = () => { vmStopListen(); };
    _vmRecog.onerror = err => {
      document.getElementById('vmStatus').textContent = 'Chyba: ' + err.error;
      vmStopListen();
    };
    _vmRecog.start();
  }

  function vmStopListen() {
    _vmListening = false;
    const orb = document.getElementById('vmOrb');
    orb.classList.remove('listening');
    document.getElementById('vmStatus').textContent = 'Klikni pro poslech';
    if (_vmRecog) { try { _vmRecog.stop(); } catch(e){} _vmRecog = null; }
  }

  function vmHandleCommand(cmd) {
    document.getElementById('vmStatus').textContent = '✓ Příkaz rozpoznán';
    // Basic command routing
    if (cmd.includes('ruleta') || cmd.includes('náhodn')) { setTimeout(()=>{ closeVoiceMode(); openRuleta?.(); }, 400); }
    else if (cmd.includes('premiér')) { setTimeout(()=>{ closeVoiceMode(); openPremiereCalendar?.(); }, 400); }
    else if (cmd.includes('kolekc') || cmd.includes('ságy')) { setTimeout(()=>{ closeVoiceMode(); openCollections?.(); }, 400); }
    else if (cmd.includes('watchlist') || cmd.includes('chci koukat')) { setTimeout(()=>{ closeVoiceMode(); openWatchlist?.(); }, 400); }
    else if (cmd.includes('ai') || cmd.includes('doporuč')) { setTimeout(()=>{ closeVoiceMode(); toggleAiPanel?.(); }, 400); }
    else if (cmd.includes('wrapped') || cmd.includes('statistik')) { setTimeout(()=>{ closeVoiceMode(); openWrapped?.(); }, 400); }
    else if (cmd.includes('hledej') || cmd.includes('najdi') || cmd.includes('hledat')) {
      const q = cmd.replace(/hledej|najdi|hledat/g,'').trim();
      setTimeout(()=>{ closeVoiceMode(); openUniverse?.(); setTimeout(()=>{ const inp = document.getElementById('shSearchInput'); if(inp){ inp.value=q; inp.dispatchEvent(new Event('input')); } }, 600); }, 400);
    }
    else if (cmd.includes('zavři') || cmd.includes('zavrit') || cmd.includes('zruš')) { closeVoiceMode(); }
    else {
      document.getElementById('vmTranscript').textContent = '"' + cmd + '"  — zkus jiný příkaz 🤔';
      document.getElementById('vmStatus').textContent = 'Příkaz nebyl rozpoznán';
    }
  }

  // ESC closes voice mode
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('voiceModeOverlay').classList.contains('visible')) {
      closeVoiceMode();
    }
  });

  // ══════════════════════════════════════════════════════
  // PER-USER CUSTOMIZE
  // ══════════════════════════════════════════════════════
  function _custStorageKey() {
    // Per-profile key — uses the main profile system (mf_profiles_v2)
    try {
      const pid = (typeof getActiveProfileId === 'function' ? getActiveProfileId() : null)
                  || localStorage.getItem('mf_active_pid');
      return 'mf_customize_' + (pid || 'default');
    } catch { return 'mf_customize_default'; }
  }

  function _custGetSettings() {
    try { return safeLS(_custStorageKey(), '{}'); } catch { return {}; }
  }

  function custSave() {
    const s = _custCollectSettings();
    localStorage.setItem(_custStorageKey(), JSON.stringify(s));
    custApplyAll(s);
    showToast?.('✓ Nastavení uloženo pro tvůj profil');
  }

  function custReset() {
    if (!confirm('Obnovit výchozí vzhled?')) return;
    localStorage.removeItem(_custStorageKey());
    custApplyAll({});
    custLoadUI({});
    showToast?.('✓ Výchozí vzhled obnoven');
  }

  function _custCollectSettings() {
    return {
      accent: document.querySelector('#accentSwatches .accent-swatch.active')?.dataset.accent || '#007AFF',
      accent2: document.querySelector('#accentSwatches .accent-swatch.active')?.dataset.accent2 || '#ffe44d',
      bg: document.querySelector('#bgOptions .font-option.active')?.dataset.bg || 'dark',
      compact: document.getElementById('custCompact')?.checked,
      hideKeys: document.getElementById('custHideKeys')?.checked,
      tileH: document.getElementById('custTileH')?.value || 300,
      tileRadius: document.getElementById('custTileRadius')?.value || 16,
      grain: document.getElementById('custGrain')?.checked !== false,
      glow: document.getElementById('custGlow')?.checked !== false,
      animations: document.getElementById('custAnimations')?.checked !== false,
      videoHover: document.getElementById('custVideoHover')?.checked !== false,
      showEpBadge: document.getElementById('custShowEpBadge')?.checked !== false,
      showProgress: document.getElementById('custShowProgress')?.checked !== false,
    };
  }

  function custApplyAll(s) {
    const root = document.documentElement;
    const body = document.body;
    // Accent
    if (s.accent) root.style.setProperty('--accent', s.accent);
    else root.style.setProperty('--accent', '#007AFF');
    if (s.accent2) root.style.setProperty('--accent2', s.accent2);
    else root.style.setProperty('--accent2', '#ffe44d');
    // BG
    const bgMap = { dark:'#060608', darker:'#020203', navy:'#04050f', warm:'#0a0806', 'green-dark':'#04080a' };
    root.style.setProperty('--bg', bgMap[s.bg] || '#060608');
    // Compact
    document.querySelectorAll('.ps-tile-wrapper').forEach(el => el.classList.toggle('compact', !!s.compact));
    // Tile height
    if (s.tileH) root.style.setProperty('--tile-h', s.tileH + 'px');
    // Tile radius
    if (s.tileRadius) root.style.setProperty('--radius', s.tileRadius + 'px');
    // Grain
    body.classList.toggle('grain-none', !s.grain);
    // Glow
    const glowEl = document.querySelector('.bg-glow');
    if (glowEl) glowEl.style.display = (s.glow === false) ? 'none' : '';
    // Animations
    if (s.animations === false) {
      const st = document.createElement('style');
      st.id = 'cust-no-anim';
      st.textContent = '*, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.1ms !important; }';
      if (!document.getElementById('cust-no-anim')) document.head.appendChild(st);
    } else {
      document.getElementById('cust-no-anim')?.remove();
    }
    // Key hints
    const kh = document.querySelector('.key-hint');
    if (kh) kh.style.display = s.hideKeys ? 'none' : '';
  }

  function custApply() {
    custApplyAll(_custCollectSettings());
  }
  function custApplyTileH(v) { document.documentElement.style.setProperty('--tile-h', v + 'px'); }
  function custApplyTileRadius(v) { document.documentElement.style.setProperty('--radius', v + 'px'); }

  function custPickAccent(el) {
    document.querySelectorAll('#accentSwatches .accent-swatch').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    custApply();
  }
  function custPickBg(el) {
    document.querySelectorAll('#bgOptions .font-option').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    custApply();
  }

  function custSwitchTab(el, tab) {
    document.querySelectorAll('.customize-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.cust-tab-panel').forEach(p => p.style.display = 'none');
    const panel = document.getElementById('custPanel-' + tab);
    if (panel) panel.style.display = '';
    // Build tile toggles dynamically
    if (tab === 'tiles') buildCustTileToggles();
  }

  function buildCustTileToggles() {
    const wrap = document.getElementById('custTileToggles');
    if (!wrap) return;
    const tiles = document.querySelectorAll('.ps-tile-wrapper');
    if (wrap.children.length > 0) return; // already built
    tiles.forEach(tile => {
      const slug = tile.dataset.slug || tile.textContent.trim().slice(0,20);
      const label = tile.querySelector('.tile-hero-overlay-title')?.textContent || slug;
      const row = document.createElement('div');
      row.className = 'customize-row';
      row.innerHTML = `<div class="customize-row-left"><div class="customize-row-label">${label}</div></div>
        <label class="cust-toggle"><input type="checkbox" checked onchange="custToggleTile('${slug}',this.checked)"><div class="cust-toggle-slider"></div></label>`;
      wrap.appendChild(row);
    });
  }

  function custToggleTile(slug, visible) {
    const tile = document.querySelector(`.ps-tile-wrapper[data-slug="${slug}"]`);
    if (tile) tile.style.display = visible ? '' : 'none';
  }

  function custLoadUI(s) {
    // Set accent swatch
    document.querySelectorAll('#accentSwatches .accent-swatch').forEach(sw => {
      sw.classList.toggle('active', sw.dataset.accent === (s.accent || '#007AFF'));
    });
    // Set bg
    document.querySelectorAll('#bgOptions .font-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.bg === (s.bg || 'dark'));
    });
    const setChk = (id, val, def=true) => { const el = document.getElementById(id); if(el) el.checked = val !== undefined ? val : def; };
    setChk('custCompact', s.compact, false);
    setChk('custHideKeys', s.hideKeys, false);
    setChk('custGrain', s.grain, true);
    setChk('custGlow', s.glow, true);
    setChk('custAnimations', s.animations, true);
    setChk('custVideoHover', s.videoHover, true);
    setChk('custShowEpBadge', s.showEpBadge, true);
    setChk('custShowProgress', s.showProgress, true);
    const setRange = (id, val, def) => { const el = document.getElementById(id); if(el) el.value = val || def; };
    setRange('custTileH', s.tileH, 300);
    setRange('custTileRadius', s.tileRadius, 16);
  }

  function openCustomize() {
    const s = _custGetSettings();
    custLoadUI(s);
    custApplyAll(s);
    // Profile hint
    try {
      const profiles = safeLS('mf_profiles_v2', '[]');
      const active = localStorage.getItem('mf_active_pid');
      const prof = profiles.find(p => p.id === active);
      document.getElementById('customizeProfileHint').textContent =
        'Nastavení se ukládají jen pro tebe · profil: ' + (prof ? prof.name : 'Výchozí');
    } catch {}
    const el = document.getElementById('customizeOverlay');
    el.classList.add('open');
    requestAnimationFrame(() => el.classList.add('visible'));
  }

  function closeCustomize() {
    const el = document.getElementById('customizeOverlay');
    el.classList.remove('visible');
    setTimeout(() => el.classList.remove('open'), 300);
  }

  // Auto-apply saved settings on load
  (function() {
    try {
      const s = safeLS('mf_customize_default', '{}');
      // Also try profile key
      const profiles = safeLS('mf_profiles_v2', '[]');
      const active = localStorage.getItem('mf_active_pid');
      const prof = profiles.find(p => p.id === active);
      const key = 'mf_customize_' + (prof ? prof.id : 'default');
      const ps = safeLS(key, '{}');
      custApplyAll(Object.keys(ps).length ? ps : s);
    } catch {}
  })();

  // ══════════════════════════════════════════════════════
  // ADMIN PANEL
  // ══════════════════════════════════════════════════════
  const ADMIN_CODE = 'mfadmin99'; // secret code, change as needed
  const ADMIN_KEY = 'mf_admin_unlocked';

  function isAdminUnlocked() {
    return localStorage.getItem(ADMIN_KEY) === '1';
  }

  function openAdmin() {
    if (!isAdminUnlocked()) {
      const code = prompt('Admin kód:');
      if (code === ADMIN_CODE) {
        localStorage.setItem(ADMIN_KEY, '1');
        showAdminFab();
      } else if (code !== null) {
        showToast?.('❌ Nesprávný kód');
        return;
      } else { return; }
    }
    adminRefreshStats();
    const el = document.getElementById('adminOverlay');
    el.classList.add('open');
    requestAnimationFrame(() => el.classList.add('visible'));
  }

  function closeAdmin() {
    const el = document.getElementById('adminOverlay');
    el.classList.remove('visible');
    setTimeout(() => el.classList.remove('open'), 300);
  }

  function adminLock() {
    localStorage.removeItem(ADMIN_KEY);
    hideAdminFab();
    closeAdmin();
    showToast?.('🔐 Admin zamčen');
  }

  function showAdminFab() {
    document.getElementById('adminFab')?.classList.add('visible');
  }
  function hideAdminFab() {
    document.getElementById('adminFab')?.classList.remove('visible');
  }

  if (isAdminUnlocked()) showAdminFab();

  // Secret gesture: click logo 5x fast
  let _logoClickCount = 0, _logoClickTimer;
  document.querySelector('.logo')?.addEventListener('click', () => {
    _logoClickCount++;
    clearTimeout(_logoClickTimer);
    _logoClickTimer = setTimeout(() => { _logoClickCount = 0; }, 1500);
    if (_logoClickCount >= 5) {
      _logoClickCount = 0;
      if (!isAdminUnlocked()) {
        const code = prompt('🔐 Admin kód:');
        if (code === ADMIN_CODE) {
          localStorage.setItem(ADMIN_KEY, '1');
          showAdminFab();
          showToast?.('⚡ Admin odemčen');
        } else if (code !== null) { showToast?.('❌ Nesprávný kód'); }
      } else {
        openAdmin();
      }
    }
  });

  function adminRefreshStats() {
    try {
      const profiles = safeLS('mf_profiles_v2', '[]');
      document.getElementById('adminStatProfiles').textContent = profiles.length || 1;
      // Count shows from watchlists
      let totalShows = 0, totalEps = 0;
      try {
        const wl = safeLS('watchlist', '[]');
        totalShows += wl.length;
      } catch {}
      // Count watched episodes across all profiles
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(k => {
          if (k.startsWith('watched_')) {
            const v = safeLS(k, '{}');
            totalEps += Object.keys(v).length;
          }
        });
      } catch {}
      document.getElementById('adminStatShows').textContent = totalShows;
      document.getElementById('adminStatEps').textContent = totalEps;
      // Storage size
      let total = 0;
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('mf_') || k.startsWith('watchlist') || k.startsWith('watched_') || k.startsWith('ai_')) {
          total += (localStorage.getItem(k) || '').length;
        }
      });
      document.getElementById('adminStatStorage').textContent = (total / 1024).toFixed(1) + ' KB';
    } catch(e) {}
  }

  function adminExportAll() {
    try {
      const data = {};
      Object.keys(localStorage).forEach(k => { data[k] = localStorage.getItem(k); });
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = 'mujflix_backup_' + new Date().toISOString().slice(0,10) + '.json';
      a.click(); URL.revokeObjectURL(url);
      showToast?.('✓ Záloha stažena');
    } catch(e) { showToast?.('❌ Export selhal: ' + e.message); }
  }

  function adminImportAll() {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json';
    inp.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!confirm('Přepsat všechna data? Tato akce je nevratná!')) return;
          Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
          showToast?.('✓ Import dokončen — obnovuji stránku…');
          setTimeout(() => location.reload(), 1500);
        } catch(ex) { showToast?.('❌ Neplatný soubor zálohy'); }
      };
      reader.readAsText(file);
    };
    inp.click();
  }

  function adminShowStorage() {
    const keys = Object.keys(localStorage).sort();
    let out = 'LocalStorage klíče MůjFlix:\n\n';
    keys.forEach(k => {
      const v = localStorage.getItem(k);
      out += `${k}: ${v ? v.slice(0,80) : '(prázdné)'}${v && v.length > 80 ? '…' : ''}\n`;
    });
    const pre = document.createElement('pre');
    pre.textContent = out;
    pre.style.cssText = 'background:#0a0a0f;color:#007AFF;padding:20px;border-radius:12px;max-height:60vh;overflow:auto;font-size:0.65rem;line-height:1.5;white-space:pre-wrap;word-break:break-all;';
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.9);backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:center;padding:20px;';
    const box = document.createElement('div');
    box.style.cssText = 'background:#0d0d12;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;max-width:700px;width:100%;max-height:90vh;display:flex;flex-direction:column;gap:12px;';
    const hdr = document.createElement('div');
    hdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;';
    hdr.innerHTML = '<span style="font-family:-apple-system,sans-serif;font-weight:900;font-size:1rem;">🗄️ LocalStorage</span><button onclick="this.closest(\'[style*=\"z-index:999999\"]\').remove()" style="background:none;border:none;color:rgba(255,255,255,0.5);font-size:1.1rem;cursor:pointer;">✕</button>';
    box.appendChild(hdr); box.appendChild(pre);
    modal.appendChild(box); document.body.appendChild(modal);
  }

  function adminShowAllProfiles() {
    try {
      const profiles = safeLS('mf_profiles_v2', '[]');
      if (!profiles.length) { showToast?.('Žádné profily v localStorage'); return; }
      let html = '<div style="font-family:-apple-system,sans-serif;font-size:0.9rem;font-weight:900;margin-bottom:14px;">👥 Profily</div>';
      profiles.forEach(p => {
        html += `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;margin-bottom:7px;">
          <span style="font-size:1.4rem;">${p.avatar||'👤'}</span>
          <div style="flex:1;"><div style="font-weight:700;font-size:0.82rem;">${p.name||'—'}</div><div style="font-size:0.58rem;color:rgba(255,255,255,0.3);">ID: ${p.id||'?'}</div></div>
          <button onclick="if(confirm('Smazat profil ${(p.name||'?').replace(/'/g,'')}')){let ps;try{ps=safeLS('mf_profiles_v2', '[]')}catch{ps=[]};localStorage.setItem('mf_profiles_v2',JSON.stringify(ps.filter(x=>x.id!=='${p.id}')));this.closest('[style*=\"z-index\"]').remove();showToast?.('Profil smazán');}" style="background:rgba(255,60,60,0.1);border:1px solid rgba(255,60,60,0.25);color:#ff6666;border-radius:7px;padding:5px 10px;cursor:pointer;font-size:0.65rem;">Smazat</button>
        </div>`;
      });
      const modal = document.createElement('div');
      modal.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.85);backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:center;padding:20px;';
      const box = document.createElement('div');
      box.style.cssText = 'background:#0d0d12;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;max-width:500px;width:100%;max-height:85vh;overflow-y:auto;';
      box.innerHTML = html + `<button onclick="this.closest('[style*=\"z-index:999999\"]').remove()" style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:rgba(255,255,255,0.5);cursor:pointer;margin-top:10px;">Zavřít</button>`;
      modal.appendChild(box); document.body.appendChild(modal);
    } catch(e) { showToast?.('Chyba: ' + e.message); }
  }

  function adminForceCache() {
    Object.keys(localStorage).filter(k => k.startsWith('tmdb_') || k.startsWith('mf_cache_')).forEach(k => localStorage.removeItem(k));
    showToast?.('✓ TMDB cache smazána');
    adminRefreshStats();
  }

  function adminShowDebugLog() {
    const log = window._mfDebugLog || [];
    const txt = log.length ? log.join('\n') : 'Žádné záznamy v debug logu.\n\nPro pokročilé ladění otevři DevTools (F12) → Console.';
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.9);backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:center;padding:20px;';
    const box = document.createElement('div');
    box.style.cssText = 'background:#050508;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;max-width:700px;width:100%;max-height:90vh;display:flex;flex-direction:column;gap:12px;';
    box.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;"><span style="font-family:-apple-system,sans-serif;font-weight:900;">🪲 Debug Log</span><button onclick="this.closest('[style*=\"z-index:999999\"]').remove()" style="background:none;border:none;color:rgba(255,255,255,0.5);font-size:1.1rem;cursor:pointer;">✕</button></div><pre style="background:#020204;color:#50ff80;padding:16px;border-radius:10px;flex:1;overflow:auto;font-size:0.62rem;line-height:1.6;white-space:pre-wrap;word-break:break-all;">${txt}</pre>`;
    modal.appendChild(box); document.body.appendChild(modal);
  }

  function adminCloneProfile() {
    try {
      const profiles = safeLS('mf_profiles_v2', '[]');
      const active = localStorage.getItem('mf_active_pid');
      const src = profiles.find(p => p.id === active) || profiles[0];
      if (!src) { showToast?.('Žádný aktivní profil'); return; }
      const name = prompt('Název klonu:', src.name + ' (kopie)');
      if (!name) return;
      const clone = { ...src, id: 'prof_' + Date.now(), name };
      profiles.push(clone);
      safeSetItem('mf_profiles_v2', JSON.stringify(profiles));
      // Copy customize settings
      const custSrc = localStorage.getItem('mf_customize_' + src.id);
      if (custSrc) localStorage.setItem('mf_customize_' + clone.id, custSrc);
      showToast?.('✓ Profil klonován: ' + name);
      adminRefreshStats();
    } catch(e) { showToast?.('Chyba: ' + e.message); }
  }

  function adminBroadcastToast() {
    const msg = prompt('Zpráva pro všechny profily:');
    if (!msg) return;
    localStorage.setItem('mf_broadcast_msg', JSON.stringify({ text: msg, ts: Date.now() }));
    showToast?.('✓ Zpráva nastavena — zobrazí se při příštím přihlášení');
  }

  function adminRecalcStats() {
    showToast?.('🔄 Přepočítávám statistiky…');
    setTimeout(() => { showToast?.('✓ Statistiky přepočítány'); }, 800);
  }

  function adminThemeLock() {
    const theme = prompt('Akcentová barva pro všechny profily (hex, např. #007AFF):');
    if (!theme) return;
    try {
      const profiles = safeLS('mf_profiles_v2', '[]');
      profiles.forEach(p => {
        const key = 'mf_customize_' + p.id;
        const s = safeLS(key, '{}');
        s.accent = theme;
        localStorage.setItem(key, JSON.stringify(s));
      });
      document.documentElement.style.setProperty('--accent', theme);
      showToast?.('✓ Téma aplikováno na všechny profily');
    } catch(e) { showToast?.('Chyba: ' + e.message); }
  }

  function adminClearWatched() {
    if (!confirm('Smazat VEŠKEROU historii sledování? Tato akce je nevratná!')) return;
    Object.keys(localStorage).filter(k => k.startsWith('watched_')).forEach(k => localStorage.removeItem(k));
    showToast?.('✓ Historie sledování smazána');
    adminRefreshStats();
  }

  function adminNukeAll() {
    if (!confirm('⚠️ SMAZAT VEŠKERÁ DATA MUJFLIX? Toto je nevratné!')) return;
    if (!confirm('Opravdu? Přijdeš o všechny profily, sledování, nastavení!')) return;
    Object.keys(localStorage).filter(k => k.startsWith('mf_') || k.startsWith('watchlist') || k.startsWith('watched_') || k.startsWith('ai_') || k.startsWith('tmdb_')).forEach(k => localStorage.removeItem(k));
    showToast?.('💣 Factory reset dokončen. Obnovuji…');
    setTimeout(() => location.reload(), 1800);
  }

  // ── Admin: API klíče ──────────────────────────────────────
  function adminLoadApiKeys() {
    const el = document.getElementById('adminApiKeysList');
    if (!el) return;
    const keyDefs = [
      { key: 'mf_gemini_key',  label: '✦ Gemini API',   prefix: 'AIza',   color: '#007AFF' },
      { key: 'mf_or_key',      label: '↻ OpenRouter',   prefix: 'sk-or-', color: '#00cfff' },
      { key: 'mf_groq_key',    label: '⚡ Groq',         prefix: 'gsk_',   color: '#ff9a3c' },
      { key: 'mf_jina_key',    label: '👁 Jina',         prefix: 'jina_',  color: '#bd93f9' },
      { key: 'mf_tavily_key',  label: '🌐 Tavily',       prefix: 'tvly-',  color: '#50fa7b' },
      { key: 'mf_tmdb_key',    label: '🎬 TMDB',         prefix: '',       color: '#ff6b35' },
    ];
    el.innerHTML = keyDefs.map(kd => {
      const val = localStorage.getItem(kd.key) || '';
      const masked = val ? (val.slice(0, 6) + '••••••••' + val.slice(-3)) : '— není nastaven —';
      const isSet = !!val;
      return `<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.06);border-radius:10px;">
        <div style="font-size:0.78rem;font-weight:700;color:${kd.color};min-width:100px;">${kd.label}</div>
        <div style="flex:1;font-family:monospace;font-size:0.65rem;color:${isSet ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)'};">${masked}</div>
        <div style="font-size:0.6rem;padding:2px 8px;border-radius:6px;background:${isSet ? 'rgba(80,250,123,0.12)' : 'rgba(255,80,80,0.1)'};border:1px solid ${isSet ? 'rgba(80,250,123,0.3)' : 'rgba(255,80,80,0.25)'};color:${isSet ? '#50fa7b' : 'rgba(255,100,100,0.7)'};">${isSet ? '✓ OK' : '✗ Chybí'}</div>
        ${isSet ? `<button onclick="if(confirm('Smazat klíč ${kd.label}?')){localStorage.removeItem('${kd.key}');adminLoadApiKeys();showToast?.('🗑 Klíč smazán');}" style="padding:4px 10px;border-radius:7px;background:rgba(255,80,80,0.08);border:1px solid rgba(255,80,80,0.2);color:rgba(255,100,100,0.65);font-size:0.6rem;cursor:pointer;">Smazat</button>` : ''}
      </div>`;
    }).join('');
  }

  function adminSetGlobalKey(keyName, value) {
    if (!value || !value.trim()) { showToast?.('❌ Zadej hodnotu klíče'); return; }
    localStorage.setItem(keyName, value.trim());
    showToast?.('✓ Klíč uložen: ' + keyName.replace('mf_','').replace('_key','').toUpperCase());
    adminLoadApiKeys();
    adminLog('API klíč nastaven: ' + keyName, 'ok');
  }

  function adminClearAllApiKeys() {
    if (!confirm('Smazat VŠECHNY API klíče? (Gemini, OpenRouter, Groq, Jina, Tavily, TMDB)')) return;
    ['mf_gemini_key','mf_or_key','mf_groq_key','mf_jina_key','mf_tavily_key','mf_tmdb_key'].forEach(k => localStorage.removeItem(k));
    showToast?.('🗑 Všechny API klíče smazány');
    adminLoadApiKeys();
    adminLog('Všechny API klíče smazány', 'warn');
  }

  // ── Admin: Zařízení ────────────────────────────────────────
  const MF_DEVICE_KEY = 'mf_device_id';
  const MF_DEVICES_REG_KEY = 'mf_registered_devices';
  const MF_BLOCKED_KEY = 'mf_blocked_devices';

  function adminGetDeviceId() {
    let id = localStorage.getItem(MF_DEVICE_KEY);
    if (!id) { id = 'dev_' + Math.random().toString(36).slice(2,10) + '_' + Date.now().toString(36); localStorage.setItem(MF_DEVICE_KEY, id); }
    return id;
  }

  function adminRegisterThisDevice() {
    const id = adminGetDeviceId();
    const name = prompt('Název tohoto zařízení:', navigator.platform || 'Moje zařízení') || navigator.platform || 'Neznámé';
    let devices = safeLS(MF_DEVICES_REG_KEY, '[]');
    const existing = devices.find(d => d.id === id);
    if (existing) { existing.name = name; existing.lastSeen = Date.now(); }
    else { devices.push({ id, name, registered: Date.now(), lastSeen: Date.now(), ua: navigator.userAgent.slice(0,80) }); }
    localStorage.setItem(MF_DEVICES_REG_KEY, JSON.stringify(devices));
    showToast?.('✓ Zařízení registrováno: ' + name);
    adminRefreshDevices();
  }

  function adminRefreshDevices() {
    const el = document.getElementById('adminDevicesList');
    const curEl = document.getElementById('adminCurrentDeviceId');
    const currentId = adminGetDeviceId();
    if (curEl) curEl.textContent = '📍 Toto zařízení: ' + currentId;

    let devices = safeLS(MF_DEVICES_REG_KEY, '[]');
    let blocked = safeLS(MF_BLOCKED_KEY, '[]');

    // Přidej aktuální zařízení pokud není zaregistrované
    if (!devices.find(d => d.id === currentId)) {
      devices.push({ id: currentId, name: 'Toto zařízení (neregistrované)', registered: null, lastSeen: Date.now(), ua: navigator.userAgent.slice(0,80) });
    }

    if (!el) return;
    if (!devices.length) { el.innerHTML = '<div style="font-size:0.72rem;color:rgba(255,255,255,0.3);padding:10px">Žádná zařízení</div>'; return; }

    el.innerHTML = devices.map(d => {
      const isBlocked = blocked.some(b => b.id === d.id);
      const isCurrent = d.id === currentId;
      const lastSeen = d.lastSeen ? new Date(d.lastSeen).toLocaleDateString('cs-CZ') : '—';
      return `<div style="display:flex;align-items:center;gap:10px;padding:11px 12px;background:rgba(255,255,255,0.025);border:1px solid ${isBlocked ? 'rgba(255,80,80,0.25)' : isCurrent ? 'rgba(0,122,255,0.2)' : 'rgba(255,255,255,0.06)'};border-radius:10px;">
        <div style="font-size:1.2rem;">${isCurrent ? '💻' : '📱'}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.8rem;font-weight:700;display:flex;align-items:center;gap:6px;">
            ${d.name || 'Neznámé'}
            ${isCurrent ? '<span style="font-size:0.48rem;background:rgba(0,122,255,0.1);border:1px solid rgba(0,122,255,0.3);color:var(--accent);padding:1px 7px;border-radius:20px;font-weight:800;letter-spacing:1px;">TOTO</span>' : ''}
            ${isBlocked ? '<span style="font-size:0.48rem;background:rgba(255,80,80,0.12);border:1px solid rgba(255,80,80,0.3);color:rgba(255,100,100,0.9);padding:1px 7px;border-radius:20px;font-weight:800;letter-spacing:1px;">BLOKOVÁNO</span>' : ''}
          </div>
          <div style="font-size:0.58rem;color:rgba(255,255,255,0.28);margin-top:2px;font-family:monospace;">${d.id}</div>
          <div style="font-size:0.55rem;color:rgba(255,255,255,0.2);margin-top:1px;">Naposledy: ${lastSeen}</div>
        </div>
        <div style="display:flex;gap:5px;">
          ${isBlocked
            ? `<button onclick="adminUnblockDevice('${d.id}')" style="padding:5px 10px;border-radius:7px;background:rgba(80,250,123,0.1);border:1px solid rgba(80,250,123,0.25);color:#50fa7b;font-size:0.6rem;font-weight:700;cursor:pointer;">🔓 Odblokovat</button>`
            : (!isCurrent ? `<button onclick="adminBlockDeviceById('${d.id}','${(d.name||'').replace(/'/g,"\'")}','${d.id}')" style="padding:5px 10px;border-radius:7px;background:rgba(255,80,80,0.08);border:1px solid rgba(255,80,80,0.22);color:rgba(255,100,100,0.7);font-size:0.6rem;font-weight:700;cursor:pointer;">🚫 Blokovat</button>` : '')
          }
          ${!d.registered ? '' : `<button onclick="adminRemoveDevice('${d.id}')" style="padding:5px 10px;border-radius:7px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.35);font-size:0.6rem;cursor:pointer;">Odebrat</button>`}
        </div>
      </div>`;
    }).join('');
  }

  function adminBlockDeviceById(id, name, rawId) {
    if (!confirm(`Zablokovat zařízení "${name}"?\n\nID: ${id}\nToto zařízení nebude moci používat MůjFlix.`)) return;
    let blocked = safeLS(MF_BLOCKED_KEY, '[]');
    if (!blocked.some(b => b.id === id)) blocked.push({ id, name, blockedAt: Date.now() });
    localStorage.setItem(MF_BLOCKED_KEY, JSON.stringify(blocked));
    showToast?.('🚫 Zařízení zablokováno: ' + name);
    adminRefreshDevices();
    adminLog('Zařízení zablokováno: ' + id + ' (' + name + ')', 'warn');
  }

  function adminBlockDevice() {
    const id = document.getElementById('adminBlockDeviceId')?.value?.trim();
    const name = document.getElementById('adminBlockDeviceName')?.value?.trim() || 'Neznámé';
    if (!id) { showToast?.('❌ Zadej Device ID'); return; }
    adminBlockDeviceById(id, name, id);
    if (document.getElementById('adminBlockDeviceId')) document.getElementById('adminBlockDeviceId').value = '';
    if (document.getElementById('adminBlockDeviceName')) document.getElementById('adminBlockDeviceName').value = '';
  }

  function adminUnblockDevice(id) {
    let blocked = safeLS(MF_BLOCKED_KEY, '[]');
    blocked = blocked.filter(b => b.id !== id);
    localStorage.setItem(MF_BLOCKED_KEY, JSON.stringify(blocked));
    showToast?.('🔓 Zařízení odblokováno');
    adminRefreshDevices();
    adminLog('Zařízení odblokováno: ' + id, 'ok');
  }

  function adminRemoveDevice(id) {
    if (!confirm('Odebrat záznam o zařízení?')) return;
    let devices = safeLS(MF_DEVICES_REG_KEY, '[]');
    devices = devices.filter(d => d.id !== id);
    localStorage.setItem(MF_DEVICES_REG_KEY, JSON.stringify(devices));
    adminRefreshDevices();
  }

  function adminClearBlockedDevices() {
    if (!confirm('Odblokovat všechna zařízení?')) return;
    localStorage.removeItem(MF_BLOCKED_KEY);
    showToast?.('🔓 Všechna zařízení odblokována');
    adminRefreshDevices();
    adminLog('Všechna blokování smazána', 'ok');
  }

  // Přidat načítání API klíčů a zařízení do adminRefresh
  const _origAdminRefresh = adminRefresh;
  adminRefresh = function() {
    _origAdminRefresh();
    adminLoadApiKeys();
    adminRefreshDevices();
  };

  // ── Kontrola blokování při startu ──────────────────────────
  (function checkDeviceBlock() {
    try {
      const myId = localStorage.getItem(MF_DEVICE_KEY);
      if (!myId) return; // nové zařízení, není zablokované
      const blocked = safeLS(MF_BLOCKED_KEY, '[]');
      if (blocked.some(b => b.id === myId)) {
        document.body.innerHTML = `<div style="position:fixed;inset:0;background:#060608;display:flex;align-items:center;justify-content:center;font-family:Outfit,sans-serif;"><div style="text-align:center;max-width:400px;padding:40px;"><div style="font-size:3rem;margin-bottom:20px;">🚫</div><div style="font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif;font-size:1.4rem;font-weight:900;margin-bottom:10px;color:#fff;">Přístup zamítnut</div><div style="font-size:0.82rem;color:rgba(255,255,255,0.4);line-height:1.6;">Toto zařízení bylo zablokováno administrátorem. Kontaktuj správce aplikace pro obnovení přístupu.</div><div style="margin-top:16px;font-size:0.6rem;color:rgba(255,255,255,0.2);font-family:monospace;">Device ID: ${myId}</div></div></div>`;
        return;
      }
    } catch(e) {}
  })();

  // Check for broadcast message

  try {
    const bcast = safeLS('mf_broadcast_msg', 'null');
    if (bcast && Date.now() - bcast.ts < 7 * 24 * 3600 * 1000) {
      setTimeout(() => showToast?.('📣 ' + bcast.text), 3000);
    }
  } catch {}
  // ══════════════════════════════════════════════════════
  // 🔥 STREAK TRACKER
  // ══════════════════════════════════════════════════════
  const STREAK_KEY = 'mf_streak_v1';
  const STREAK_TODAY_KEY = 'mf_streak_today_v1';

  function getStreakData() {
    try { return safeLS(STREAK_KEY, '{"streak":0,"lastDate":null}'); } catch { return {streak:0,lastDate:null}; }
  }
  function saveStreakData(d) { localStorage.setItem(STREAK_KEY, JSON.stringify(d)); }
  function getTodayKey() { return new Date().toISOString().slice(0,10); }
  function getTodayEpCount() {
    try { const d = safeLS(STREAK_TODAY_KEY, '{}'); return d[getTodayKey()]||0; } catch { return 0; }
  }
  function incrementTodayEp() {
    try {
      const key = getTodayKey();
      let d = safeLS(STREAK_TODAY_KEY, '{}');
      // keep only last 7 days
      const keys = Object.keys(d).sort();
      while(keys.length > 7) { delete d[keys.shift()]; }
      d[key] = (d[key]||0) + 1;
      localStorage.setItem(STREAK_TODAY_KEY, JSON.stringify(d));
      updateStreak();
    } catch {}
  }
  function updateStreak() {
    const today = getTodayKey();
    let data = getStreakData();
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
    const yKey = yesterday.toISOString().slice(0,10);
    const todayEps = getTodayEpCount();

    if (todayEps > 0) {
      if (data.lastDate === today) {
        // already counted today, just update display
      } else if (data.lastDate === yKey) {
        data.streak += 1;
        data.lastDate = today;
        saveStreakData(data);
      } else if (!data.lastDate) {
        data.streak = 1;
        data.lastDate = today;
        saveStreakData(data);
      } else {
        // streak broken
        data.streak = 1;
        data.lastDate = today;
        saveStreakData(data);
      }
    }

    // Update UI
    const streak = data.streak || 0;
    const el = document.getElementById('streakWidget');
    const countEl = document.getElementById('streakCount');
    const todayEl = document.getElementById('streakTodayCount');
    const fireEl = document.getElementById('streakFire');
    if (countEl) countEl.textContent = streak;
    if (todayEl) todayEl.textContent = todayEps;

    // Animate fire based on streak length
    if (fireEl) {
      if (streak >= 30) fireEl.textContent = '💥';
      else if (streak >= 14) fireEl.textContent = '🔥';
      else if (streak >= 7) fireEl.textContent = '🔥';
      else if (streak >= 3) fireEl.textContent = '✨';
      else fireEl.textContent = '⭐';
    }

    // Show widget only if there's activity
    if (el) {
      if (streak >= 1 || todayEps > 0) {
        el.classList.add('visible');
      } else {
        el.classList.remove('visible');
      }
    }
  }

  // Hook into episode watched events — intercept markWatched
  (function patchMarkWatched() {
    const _orig = window.markWatched;
    if (typeof _orig === 'function') {
      window.markWatched = function(...args) {
        _orig.apply(this, args);
        incrementTodayEp();
      };
    }
    // Also patch the toggle if it exists
    const _origToggle = window.toggleWatched;
    if (typeof _origToggle === 'function') {
      window.toggleWatched = function(...args) {
        const result = _origToggle.apply(this, args);
        setTimeout(updateStreak, 50);
        return result;
      };
    }
  })();

  // Initialize streak display
  setTimeout(() => { updateStreak(); }, 1200);

  // ══════════════════════════════════════════════════════
  // 🎭 MOOD PICKER
  // ══════════════════════════════════════════════════════
  function openMoodPicker() {
    const el = document.getElementById('moodOverlay');
    if (!el) return;
    // Reset
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    const rs = document.getElementById('moodResultSection');
    if (rs) rs.classList.remove('visible');
    el.classList.add('open');
  }
  function closeMoodPicker() {
    const el = document.getElementById('moodOverlay');
    if (el) el.classList.remove('open');
  }
  document.getElementById('moodOverlay')?.addEventListener('click', function(e) {
    if (e.target === this) closeMoodPicker();
  });

  // Mood → episode logic
  const moodConfig = {
    relax: { slugs: ['futurama','the-simpsons'], label: 'Klidná epizoda' },
    fun: { slugs: ['family-guy','south-park','the-simpsons'], label: 'Smíchy' },
    adventure: { slugs: ['futurama','south-park'], label: 'Dobrodružství' },
    nostalgia: { slugs: ['the-simpsons','futurama','breaking-bad'], label: 'Klasika' },
    random: { slugs: ['the-simpsons','family-guy','south-park','futurama','breaking-bad'], label: 'Překvapení' },
    binge: { slugs: ['the-simpsons','family-guy','south-park','futurama','breaking-bad'], label: 'Maratonská epizoda' },
  };

  function selectMood(mood) {
    // Highlight button
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    const btn = document.querySelector(`[data-mood="${mood}"]`);
    if (btn) btn.classList.add('selected');

    const config = moodConfig[mood] || moodConfig.random;
    const slugs = config.slugs;

    // Pick 2 random episodes from mood-matching shows
    const picks = [];
    const seen = new Set();
    for (let attempt = 0; attempt < 40 && picks.length < 2; attempt++) {
      const slug = slugs[Math.floor(Math.random() * slugs.length)];
      if (!window.db || !window.db[slug]) continue;
      const d = window.db[slug];
      const seasons = typeof window.totalSeasons === 'function' ? window.totalSeasons(slug) : (d.seasons?.length || 1);
      if (!seasons) continue;
      const se = Math.ceil(Math.random() * Math.min(seasons, mood === 'nostalgia' ? 4 : seasons));
      const epCount = typeof window.epsInSeason === 'function' ? window.epsInSeason(slug, se) : 10;
      if (!epCount) continue;
      const ep = Math.ceil(Math.random() * epCount);
      const key = `${slug}-S${se}-E${ep}`;
      if (seen.has(key)) continue;
      seen.add(key);
      picks.push({ slug, se, ep, name: d.name, poster: d._poster || d.poster });
    }

    const container = document.getElementById('moodResultCards');
    const section = document.getElementById('moodResultSection');
    if (!container || !section) return;

    if (picks.length === 0) {
      container.innerHTML = `<div style="text-align:center;padding:20px;color:rgba(255,255,255,0.3);font-size:0.72rem;">Nastav TMDB klíč pro lepší doporučení 🎬</div>`;
      section.classList.add('visible');
      return;
    }

    container.innerHTML = picks.map(p => `
      <div class="mood-ep-card" onclick="closeMoodPicker();openSeries('${p.slug}');setTimeout(()=>{activeSeason=${p.se};showAllSeasons=false;renderSeasons&&renderSeasons();renderEpisodes&&renderEpisodes();setTimeout(()=>{const c=document.getElementById('card-${p.slug}-S${p.se}-E${p.ep}');if(c)c.scrollIntoView({behavior:'smooth',block:'center'});},200);},350)">
        <img class="mood-ep-thumb" loading="lazy" src="${p.poster||''}" alt="${p.name}" onerror="this.style.background='#111'">
        <div class="mood-ep-info">
          <div class="mood-ep-show">${p.name}</div>
          <div class="mood-ep-title">Série ${p.se}, Epizoda ${p.ep}</div>
          <div class="mood-ep-meta">${config.label}</div>
        </div>
        <div class="mood-play-icon">▶</div>
      </div>
    `).join('');
    section.classList.add('visible');
    showToast?.('🎭 ' + config.label + ' — vybráno!');
  }

  // ══════════════════════════════════════════════════════
  // ⏱ WATCH TIMER
  // ══════════════════════════════════════════════════════
  let _timerInterval = null;
  let _timerRemaining = 0;
  let _timerTotal = 0;
  let _timerPanelOpen = false;
  let _selectedPreset = null;

  function toggleTimerPanel() {
    _timerPanelOpen = !_timerPanelOpen;
    const panel = document.getElementById('timerPanel');
    if (panel) panel.classList.toggle('open', _timerPanelOpen);
  }

  function setTimerPreset(minutes) {
    _selectedPreset = minutes;
    _timerTotal = minutes * 60;
    _timerRemaining = _timerTotal;
    updateTimerDisplay(_timerRemaining);
    document.querySelectorAll('.timer-preset-btn').forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.min) === minutes);
    });
  }

  function updateTimerDisplay(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    const str = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    const disp = document.getElementById('timerDisplay');
    const fab = document.getElementById('timerFabLabel');
    if (disp) disp.textContent = str;
    if (fab) fab.textContent = str;

    // SVG ring progress (conic gradient on fab)
    const fabEl = document.getElementById('timerFab');
    if (fabEl && _timerTotal > 0) {
      const pct = (_timerTotal - secs) / _timerTotal * 100;
      fabEl.style.background = `conic-gradient(rgba(0,122,255,0.35) ${pct}%, rgba(8,8,14,0.92) ${pct}%)`;
    }
  }

  function startTimer() {
    if (!_selectedPreset) { showToast?.('⏱ Zvol délku sledování'); return; }
    if (_timerInterval) { clearInterval(_timerInterval); }

    const startBtn = document.getElementById('timerStartBtn');
    const stopBtn = document.getElementById('timerStopBtn');
    const fab = document.getElementById('timerFab');

    if (startBtn) startBtn.textContent = '⏸ Běží…';
    if (stopBtn) stopBtn.classList.add('visible');
    if (fab) fab.classList.add('active');

    showToast?.(`⏱ Časovač spuštěn — ${_selectedPreset} min`);

    _timerInterval = setInterval(() => {
      _timerRemaining--;
      updateTimerDisplay(_timerRemaining);
      if (_timerRemaining <= 0) {
        clearInterval(_timerInterval);
        _timerInterval = null;
        timerFinished();
      }
    }, 1000);
  }

  function stopTimer() {
    if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
    const startBtn = document.getElementById('timerStartBtn');
    const stopBtn = document.getElementById('timerStopBtn');
    const fab = document.getElementById('timerFab');
    if (startBtn) startBtn.textContent = '▶ Start';
    if (stopBtn) stopBtn.classList.remove('visible');
    if (fab) { fab.classList.remove('active'); fab.style.background = ''; }
    _timerRemaining = _selectedPreset ? _selectedPreset * 60 : 0;
    updateTimerDisplay(_timerRemaining);
    showToast?.('⏱ Časovač zastaven');
  }

  function timerFinished() {
    const fab = document.getElementById('timerFab');
    const startBtn = document.getElementById('timerStartBtn');
    const stopBtn = document.getElementById('timerStopBtn');
    if (fab) { fab.classList.remove('active'); fab.style.background = ''; }
    if (startBtn) startBtn.textContent = '▶ Start';
    if (stopBtn) stopBtn.classList.remove('visible');

    // Flash notification
    showToast?.('⏱ Čas sledování vypršel! 🎬', 'success');

    // Browser notification if allowed
    if (Notification && Notification.permission === 'granted') {
      new Notification('MůjFlix ⏱', { body: 'Čas sledování vypršel!', icon: 'LOGO.png' });
    }

    // Pulse animation on fab
    const timerEl = document.getElementById('timerFab');
    if (timerEl) {
      timerEl.style.animation = 'none';
      timerEl.style.boxShadow = '0 0 0 0 rgba(0,122,255,0.8)';
      timerEl.style.transition = 'box-shadow 0s';
      setTimeout(() => {
        timerEl.style.boxShadow = '0 0 0 30px rgba(0,122,255,0)';
        timerEl.style.transition = 'box-shadow 0.8s ease';
      }, 10);
    }
  }

  // Init timer display
  setTimerPreset(45);

  // ══════════════════════════════════════════════════════
  // ⌨ KLÁVESOVÉ ZKRATKY — rozšíření
  // ══════════════════════════════════════════════════════
  (function extendKeyboard() {
    document.addEventListener('keydown', function(e) {
      // Skip if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const modal = document.getElementById('seriesModal');
      const modalOpen = modal && modal.classList.contains('open');

      if (e.key === 'M' || e.key === 'm') {
        if (!modalOpen) { e.preventDefault(); openMoodPicker(); }
      }
      if (e.key === 'T' || e.key === 't') {
        if (!modalOpen) { e.preventDefault(); toggleTimerPanel(); }
      }
    });
  })();

  // Request notification permission quietly
  setTimeout(() => {
    if (Notification && Notification.permission === 'default') {
      // Don't auto-request, wait for timer start
    }
  }, 5000);

  // ══════════════════════════════════════════════════════
  // Hook streak into episode card clicks (fallback)
  // ══════════════════════════════════════════════════════
  (function hookEpCards() {
    const orig = window.openWithCopy;
    if (typeof orig === 'function') {
      window.openWithCopy = function(...args) {
        incrementTodayEp();
        return orig.apply(this, args);
      };
    }

    // Monitor localStorage watched changes + trigger sync
    const origSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function(key, value) {
      origSetItem(key, value);
      if (key && key.includes('watched')) {
        setTimeout(updateStreak, 100);
      }
      // Debounced auto-sync when relevant data changes
      if (key && (key.startsWith('mf_') || key.startsWith('watched_') || key.startsWith('watchlist') || key.startsWith('streak'))) {
        clearTimeout(window._mfSyncDebounce);
        window._mfSyncDebounce = setTimeout(() => {
          if (window.MFSync && typeof window.MFSync.pushData === 'function') {
            window.MFSync.pushData();
          }
        }, 2500);
      }
    };
  })();

  // ══════════════════════════════════════════════════════
  // ☁️ SYNC MODAL UI FUNCTIONS
  // ══════════════════════════════════════════════════════
  function openSyncModal() {
    const modal = document.getElementById('syncModal');
    if (!modal) return;
    modal.classList.add('open');
    _updateSyncModalStatus();

    // Vyplň aktuální kód skupiny
    const currentGroup = localStorage.getItem('mf_sync_group') || '';
    const input = document.getElementById('syncGroupInput');
    if (input) input.value = currentGroup;

    // Ukaž/skryj varování o Firebase
    const warn = document.getElementById('syncFirebaseWarn');
    const setupBtn = document.getElementById('syncFbSetupBtn');
    if (warn || setupBtn) {
      // Zkontroluj zda MFSync je inicializován
      const hasFirebase = window.MFSync && window.MFSync._db;
      if (warn) warn.style.display = hasFirebase ? 'none' : 'block';
      if (setupBtn) setupBtn.style.display = hasFirebase ? 'none' : 'block';
    }
  }

  function closeSyncModal() {
    const modal = document.getElementById('syncModal');
    if (modal) modal.classList.remove('open');
  }

  function _updateSyncModalStatus() {
    const status = window._mfSyncStatus || 'offline';
    const dot = document.getElementById('syncModalDot');
    const text = document.getElementById('syncModalText');
    const disconnectBtn = document.getElementById('syncDisconnectBtn');
    const group = localStorage.getItem('mf_sync_group');

    if (dot) {
      dot.className = 'sync-status-dot';
      if (status === 'online') dot.classList.add('online');
      else if (status === 'syncing') dot.classList.add('syncing');
      else if (status === 'error') dot.classList.add('error');
    }

    const msgs = {
      online: group ? `✓ Připojeno ke skupině: ${group}` : 'Připojeno (bez skupiny)',
      syncing: 'Synchronizuji…',
      offline: 'Offline — Firebase není nastaven',
      error: 'Chyba připojení — zkontroluj Firebase config',
      'no-group': 'Firebase OK — zadej kód skupiny pro sync'
    };
    if (text) text.textContent = msgs[status] || status;
    if (disconnectBtn) disconnectBtn.style.display = group ? 'block' : 'none';
  }

  function syncGenerateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    const input = document.getElementById('syncGroupInput');
    if (input) input.value = code;
  }

  function syncConnect() {
    const input = document.getElementById('syncGroupInput');
    const code = (input?.value || '').trim().replace(/\s/g,'').toUpperCase();
    if (!code || code.length < 4) {
      if (input) { input.style.borderColor = 'rgba(255,80,80,0.5)'; input.focus(); }
      showToast?.('⚠️ Zadej platný kód skupiny (min. 4 znaky)', 'error');
      return;
    }
    if (window.MFSync && typeof window.MFSync.connectGroup === 'function') {
      window.MFSync.connectGroup(code);
      // Ihned nahraj aktuální lokální data
      setTimeout(() => window.MFSync.pushData(), 500);
      closeSyncModal();
      showToast?.('☁️ Připojeno ke skupině ' + code + '!', 'success');
    } else {
      showToast?.('⚠️ Firebase není nastaven v kódu — vyplň FIREBASE_CONFIG', 'error');
    }
  }

  function syncDisconnect() {
    if (window.MFSync && typeof window.MFSync.disconnect === 'function') {
      window.MFSync.disconnect();
    }
    _updateSyncModalStatus();
    showToast?.('☁️ Sync odpojen', 'success');
  }

  // Zavři sync modal kliknutím mimo
  document.getElementById('syncModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeSyncModal();
  });

  // ══════════════════════════════════════════════════════
  // 🍎 DOCK & HEADER JS
  // ══════════════════════════════════════════════════════
  function setDockActive(id) {
    document.querySelectorAll('.dock-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(id);
    if (btn) {
      btn.classList.add('active');
      // Spring click micro-animation
      btn.style.transform = 'scale(0.88) translateZ(0)';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        btn.style.transition = 'transform 0.38s cubic-bezier(0.34,1.5,0.64,1)';
        btn.style.transform = '';
        setTimeout(() => { btn.style.transition = ''; }, 400);
      }));
    }
  }

  function closeDockOverlays() {
    // Close any open overlays and return to home
    if (typeof closeModal === 'function') closeModal();
    if (typeof closeWatchlist === 'function' && document.getElementById('watchlistOverlay')?.classList.contains('open')) closeWatchlist();
    setDockActive('dockHome');
  }

  function openDockMore() {
    const sheet = document.getElementById('dockMoreSheet');
    const bg = document.getElementById('dockMoreBg');
    if (sheet) {
      sheet.style.display = 'block';
      sheet.style.visibility = 'visible';
      // Force reflow for animation
      sheet.offsetHeight;
      sheet.style.transform = 'translateY(0)';
    }
    if (bg) { bg.style.background = 'rgba(0,0,0,0.5)'; bg.style.pointerEvents = 'auto'; }
    setDockActive('dockMore');
    // Sync premiere badge
    const premBadge = document.getElementById('sheetPremiereBadge');
    const fabBadge = document.getElementById('premiereFabBadge');
    if (premBadge && fabBadge) {
      const count = parseInt(fabBadge.textContent) || 0;
      if (count > 0) { premBadge.textContent = count + ' nových'; premBadge.style.display = 'inline'; }
    }
  }

  function closeDockMore() {
    const sheet = document.getElementById('dockMoreSheet');
    const bg = document.getElementById('dockMoreBg');
    if (sheet) {
      sheet.style.transform = 'translateY(100%)';
      // Hide after animation completes
      setTimeout(() => {
        if (sheet.style.transform === 'translateY(100%)') {
          sheet.style.visibility = 'hidden';
        }
      }, 400);
    }
    if (bg) { bg.style.background = 'rgba(0,0,0,0)'; bg.style.pointerEvents = 'none'; }
    // Vrať aktivaci na předchozí sekci (ne vždy dockHome)
    const prevSection = window._mfCurrentSection || 'serialy';
    const sectionToDock = { serialy: 'dockHome', filmy: 'dockFilmy', protebe: 'dockProtebe' };
    setDockActive(sectionToDock[prevSection] || 'dockHome');
  }

  // Sync watchlist badge to dock
  function _syncDockBadges() {
    // Watchlist badge
    const wlBadge = document.getElementById('watchlistFabBadge');
    const dockWlBadge = document.getElementById('dockWatchlistBadge');
    if (wlBadge && dockWlBadge) {
      const n = parseInt(wlBadge.textContent) || 0;
      dockWlBadge.textContent = n > 0 ? n : '';
      dockWlBadge.classList.toggle('visible', n > 0);
    }
    // Notif badge
    const notifBadge = document.getElementById('notifBellBadge');
    const hdrNotif = document.getElementById('hdrNotifBadge');
    if (hdrNotif) {
      const hasNotif = notifBadge && notifBadge.textContent.trim() !== '' && notifBadge.style.display !== 'none';
      hdrNotif.textContent = hasNotif ? '!' : '';
      hdrNotif.classList.toggle('visible', hasNotif);
    }
    // Sync status dot
    const dot = document.getElementById('hdrSyncDot');
    if (dot) {
      const status = window._mfSyncStatus || 'offline';
      dot.className = 'mf-sync-dot';
      if (status === 'online') dot.classList.add('online');
      else if (status === 'syncing') dot.classList.add('syncing');
      else if (status === 'error') dot.classList.add('error');
    }
    // Timer button highlight
    const timerBtn = document.getElementById('hdrTimerBtn');
    if (timerBtn && window._timerInterval) {
      timerBtn.classList.add('active-btn');
    } else if (timerBtn) {
      timerBtn.classList.remove('active-btn');
    }
  }

  // Hook into existing watchlist open/close to update dock
  const _origOpenWatchlist = window.openWatchlist;
  if (typeof _origOpenWatchlist === 'function') {
    window.openWatchlist = function(...args) {
      setDockActive('dockWatchlist');
      return _origOpenWatchlist.apply(this, args);
    };
  }
  const _origCloseWatchlist = window.closeWatchlist;
  if (typeof _origCloseWatchlist === 'function') {
    window.closeWatchlist = function(...args) {
      setDockActive('dockHome');
      return _origCloseWatchlist.apply(this, args);
    };
  }

  // Sync badges every 2s
  setInterval(_syncDockBadges, 2000);
  setTimeout(_syncDockBadges, 500);

  


  // PWA Install Prompt
  function triggerPwaInstall() {
    if (!window._pwaInstallPrompt) {
      showToast('ℹ️ Instalace není k dispozici — otevři MůjFlix v prohlížeči (ne jako PWA)', 'info');
      return;
    }
    window._pwaInstallPrompt.prompt();
    window._pwaInstallPrompt.userChoice.then(({ outcome }) => {
      if (outcome === 'accepted') {
        const btn = document.getElementById('pwaInstallBtn');
        if (btn) btn.style.display = 'none';
        showToast('✅ MůjFlix nainstalován!', 'success');
      }
      window._pwaInstallPrompt = null;
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window._pwaInstallPrompt = e;
    const btn = document.getElementById('pwaInstallBtn');
    if (btn) {
      btn.style.display = 'flex';
      btn.onclick = async () => {
        if (!window._pwaInstallPrompt) return;
        window._pwaInstallPrompt.prompt();
        const { outcome } = await window._pwaInstallPrompt.userChoice;
        if (outcome === 'accepted') {
          btn.style.display = 'none';
          if (typeof showToast === 'function') showToast('✅ MůjFlix nainstalován!', 'success');
        }
        window._pwaInstallPrompt = null;
      };
    }
  });
  
  window.addEventListener('appinstalled', () => {
    const btn = document.getElementById('pwaInstallBtn');
    if (btn) btn.style.display = 'none';
    if (typeof showToast === 'function') showToast('✅ MůjFlix nainstalován!', 'success');
  });
  


  // ── Sync streak do header pillu ──
  (function syncHdrStreak() {
    function update() {
      // Try reading from streakCount element or localStorage
      const sc = document.getElementById('streakCount');
      const pill = document.getElementById('hdrStreakDays');
      if (!pill) return;
      if (sc && sc.textContent) {
        pill.textContent = sc.textContent || '0';
      } else {
        try {
          const data = safeLS('mf_streak', '{}');
          pill.textContent = data.current || data.count || '0';
        } catch(e) { pill.textContent = '0'; }
      }
    }
    update();
    setInterval(update, 3000);
    document.addEventListener('mf-streak-update', update);
  })();
  


// ═══════════════════════════════════════════════════════
// EPISODE RATING SYSTEM
// ═══════════════════════════════════════════════════════
(function() {
  const RATINGS_KEY = 'mf_ep_ratings';
  const LABELS = ['', 'Katastrofa 😬', 'Ujde to 😐', 'Dobrá 👍', 'Výborná 🔥', 'Masterpiece 🏆'];

  let _currentUid = null;
  let _currentRating = 0;

  // ── Storage ──────────────────────────────────────────
  function getRatings() {
    try { return safeLS(RATINGS_KEY, '{}'); } catch { return {}; }
  }
  function saveRatings(r) { localStorage.setItem(RATINGS_KEY, JSON.stringify(r)); }

  window.getEpRating = function(uid) { return getRatings()[uid] || 0; };

  window.saveEpRating = function() {
    if (!_currentRating || !_currentUid) return;
    const r = getRatings();
    r[_currentUid] = _currentRating;
    saveRatings(r);
    const uid = _currentUid;
    const rating = _currentRating;
    closeEpRating(true);
    _refreshCardRating(uid, rating);
    if (typeof showToast === 'function') showToast('⭐ Hodnocení uloženo');
    // Refresh panel summary if open
    if (typeof activeSeries !== 'undefined') _refreshPanelRatingSummary(activeSeries);
  };

  // ── Open / close ─────────────────────────────────────
  window.openEpRating = function(uid, seriesName, epLabel, existingRating) {
    _currentUid = uid;
    _currentRating = existingRating || 0;
    document.getElementById('erSeriesName').textContent = seriesName || '';
    document.getElementById('erEpName').textContent = epLabel || uid;
    _renderStars(_currentRating);
    const overlay = document.getElementById('epRatingOverlay');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('open')));
  };

  window.closeEpRating = function(saved) {
    const overlay = document.getElementById('epRatingOverlay');
    overlay.classList.remove('open');
    setTimeout(() => { overlay.style.display = 'none'; }, 360);
    if (!saved) _currentRating = 0;
    _currentUid = null;
  };

  // ── Star rendering ────────────────────────────────────
  function _renderStars(value) {
    document.querySelectorAll('.er-star').forEach((s, i) => {
      s.classList.toggle('active', i < value);
    });
    const label = document.getElementById('erLabel');
    const saveBtn = document.getElementById('erSaveBtn');
    if (value > 0) {
      label.textContent = LABELS[value];
      label.classList.add('rated');
      saveBtn.classList.add('enabled');
    } else {
      label.textContent = 'Jak se ti epizoda líbila?';
      label.classList.remove('rated');
      saveBtn.classList.remove('enabled');
    }
  }

  // ── Star interactions ─────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.er-star').forEach(star => {
      const val = parseInt(star.dataset.v);
      star.addEventListener('mouseenter', () => _renderStars(val));
      star.addEventListener('mouseleave', () => _renderStars(_currentRating));
      star.addEventListener('click', () => {
        _currentRating = (_currentRating === val) ? 0 : val;
        _renderStars(_currentRating);
        star.classList.remove('bounce');
        void star.offsetWidth;
        star.classList.add('bounce');
        setTimeout(() => star.classList.remove('bounce'), 300);
      });
      star.addEventListener('touchend', (e) => {
        e.preventDefault();
        _currentRating = (_currentRating === val) ? 0 : val;
        _renderStars(_currentRating);
      }, { passive: false });
    });
  });

  // ── Refresh badge on episode card ─────────────────────
  function _refreshCardRating(uid, rating) {
    const card = document.getElementById('card-' + uid);
    if (!card) return;
    let badge = card.querySelector('.ep-user-rating');
    if (rating > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'ep-user-rating';
        badge.title = 'Moje hodnocení — klikni pro změnu';
        badge.onclick = (e) => { e.stopPropagation(); _openFromCard(uid); };
        const metaRow = card.querySelector('.ep-meta-row');
        if (metaRow) metaRow.appendChild(badge);
      }
      badge.innerHTML = '<span class="er-star-mini">⭐</span> ' + rating + '/5';
    } else {
      if (badge) badge.remove();
    }
  }

  // ── Refresh panel rating summary ──────────────────────
  function _refreshPanelRatingSummary(slug) {
    const summaryEl = document.getElementById('panelRatingSummary');
    const avgEl = document.getElementById('panelRatingAvg');
    const countEl = document.getElementById('panelRatingCount');
    if (!summaryEl || !avgEl || !countEl) return;

    const ratings = getRatings();
    const seriesRatings = Object.entries(ratings)
      .filter(([uid]) => uid.startsWith(slug + '-'))
      .map(([, v]) => v);

    if (seriesRatings.length === 0) {
      summaryEl.style.display = 'none';
      return;
    }
    const avg = (seriesRatings.reduce((a, b) => a + b, 0) / seriesRatings.length).toFixed(1);
    const stars = '⭐'.repeat(Math.round(parseFloat(avg)));
    avgEl.textContent = stars + ' ' + avg + '/5';
    countEl.textContent = '(' + seriesRatings.length + ' hodnocení)';
    summaryEl.style.display = 'flex';
  }

  window._refreshPanelRatingSummary = _refreshPanelRatingSummary;

  // ── Open rating from card ─────────────────────────────
  function _openFromCard(uid) {
    const parts = uid.split('-');
    const seriesSlug = parts.slice(0, parts.length - 2).join('-');
    const s = (typeof db !== 'undefined' && db[seriesSlug]) ? db[seriesSlug] : {};
    const seriesName = s.name || seriesSlug;
    const seNum = parseInt((parts[parts.length - 2] || 'S1').replace('S','')) || 1;
    const epNum = parseInt((parts[parts.length - 1] || 'E1').replace('E','')) || 1;
    openEpRating(uid, seriesName, 'S' + seNum + ' · E' + epNum, getEpRating(uid));
  }

  window._epRatingRefreshCard = _refreshCardRating;
  window._epRatingOpenFromCard = _openFromCard;
  window._epRatingRefreshPanel = _refreshPanelRatingSummary;

})();



// ══════════════════════════════════════════════════════════════
// FIX 2: REAL-TIME FIREBASE SYNC + MODAL-OPEN CLASS TOGGLE
// ══════════════════════════════════════════════════════════════
(function() {
  // ── localStorage hook → auto-push na Firebase (debounced 1.5s) ──
  const _origSet = localStorage.setItem.bind(localStorage);
  let _debounce = null;

  localStorage.setItem = function(key, value) {
    _origSet(key, value);
    if (
      key.startsWith('mf_') ||
      key.startsWith('watched_') ||
      key.startsWith('watchlist') ||
      key.startsWith('streak') ||
      key.startsWith('aiMem')
    ) {
      clearTimeout(_debounce);
      _debounce = setTimeout(() => {
        if (window.MFSync && window.MFSync._db && window.MFSync._syncRef) {
          window.MFSync.pushData();
        }
      }, 1500);
    }
  };

  // ── Refresh UI funkce — volaná při příchodu dat z jiného zařízení ──
  window.refreshUserContent = window.refreshUserContent || function() {
    if (typeof db !== 'undefined') {
      Object.keys(db).forEach(s => {
        if (typeof updateTileProgress === 'function') updateTileProgress(s);
        if (typeof updateContinueBadge === 'function') updateContinueBadge(s);
      });
    }
    if (typeof updateContinueWidget === 'function') updateContinueWidget();
    if (typeof updateLogoProgress === 'function') updateLogoProgress();
    if (typeof updateWatchlistBadge === 'function') updateWatchlistBadge();
    if (typeof updateWatchlistBtns === 'function') updateWatchlistBtns();
  };

  // ── body.modal-open toggle — FABs se schovají pod modaly ──
  function _updateModalOpenClass() {
    const openSelectors = [
      '.ruleta-overlay.open', '.wrapped-overlay.open',
      '#ai-voice-bubble-overlay.open', '.premiere-overlay.open',
      '.collections-overlay.open', '.trakt-overlay.open',
      '.voice-cmd-overlay.open', '.mood-overlay.open',
      '.universe-overlay.open', '.genre-editor-overlay.open',
      '#epRatingOverlay.open', '#syncOverlay.open',
      '#voiceCmdOverlay.open', '#syncModal.open',
      '.pm-overlay.open', '.watchlist-overlay.open',
    ];
    const anyOpen = openSelectors.some(sel => !!document.querySelector(sel));
    document.body.classList.toggle('modal-open', anyOpen);
  }

  // MutationObserver pro sledování otevírání/zavírání modalů
  document.addEventListener('DOMContentLoaded', () => {
    const mo = new MutationObserver(_updateModalOpenClass);
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    _updateModalOpenClass();
  });
})();

// ══════════════════════════════════════════════════════════════
// FIX 3: ADMIN PER-PROFIL API KLÍČE
// Umožní adminovi přidávat/přepisovat/odebírat API klíče
// pro každý profil zvlášť.
// ══════════════════════════════════════════════════════════════

const _APK_KEYS = [
  { id: 'mf_gemini_key',  label: '✦ Gemini API Key',   placeholder: 'AIza...',   type: 'password' },
  { id: 'mf_or_key',      label: '↻ OpenRouter Key',    placeholder: 'sk-or-...', type: 'password' },
  { id: 'mf_groq_key',    label: '⚡ Groq Key',          placeholder: 'gsk_...',   type: 'password' },
  { id: 'mf_jina_key',    label: '👁 Jina Key',          placeholder: 'jina_...',  type: 'password' },
  { id: 'mf_tavily_key',  label: '🌐 Tavily Key',        placeholder: 'tvly-...',  type: 'password' },
  { id: 'mf_tmdb_key',    label: '🎬 TMDB Key',          placeholder: 'TMDB API key...', type: 'text' },
  { id: 'mf_trakt_client_id', label: '📡 Trakt Client ID', placeholder: 'Trakt client ID...', type: 'text' },
];

let _apkCurrentProfileId = null;
let _apkCurrentProfileName = '';

function adminOpenProfileApiKeys(profileIdx) {
  try {
    const profiles = safeLS('mf_profiles_v2', '[]');
    const p = profiles[profileIdx];
    if (!p) return;
    _apkCurrentProfileId = p.id;
    _apkCurrentProfileName = p.name;

    document.getElementById('apkProfileName').textContent = p.name;

    // Build key rows — klíče jsou per-profil uloženy jako: keyId + '_' + profileId
    const container = document.getElementById('apkKeyRows');
    container.innerHTML = '';

    _APK_KEYS.forEach(keyDef => {
      const storageKey = keyDef.id + '_' + p.id;
      const globalKey = keyDef.id; // fallback
      const currentVal = localStorage.getItem(storageKey) || localStorage.getItem(globalKey) || '';

      const item = document.createElement('div');
      item.className = 'apk-key-item';
      item.innerHTML = `
        <div class="apk-key-label">${keyDef.label}</div>
        <div class="apk-key-input-row">
          <input 
            class="apk-key-input" 
            id="apk_input_${keyDef.id}"
            type="${keyDef.type}" 
            placeholder="${keyDef.placeholder}"
            value="${currentVal ? '••••••••••••' : ''}"
            data-key="${storageKey}"
            data-has-value="${currentVal ? '1' : '0'}"
            onfocus="if(this.dataset.hasValue==='1'&&this.value==='••••••••••••'){this.value='';this.dataset.hasValue='0';}"
          >
          <button class="apk-save-btn" onclick="_apkSaveKey('${keyDef.id}','${storageKey}','${p.id}')">Uložit</button>
          <button class="apk-clear-btn" onclick="_apkClearKey('${storageKey}','${keyDef.id}','${p.id}')">🗑</button>
        </div>
        <div class="apk-status" id="apk_status_${keyDef.id}">✓ Uloženo</div>
      `;
      container.appendChild(item);
    });

    document.getElementById('adminProfileApiModal').classList.add('open');
  } catch(e) { console.error('adminOpenProfileApiKeys error:', e); }
}

function _apkSaveKey(keyId, storageKey, profileId) {
  const input = document.getElementById('apk_input_' + keyId);
  if (!input) return;
  const val = input.value.trim();
  if (!val || val === '••••••••••••') {
    if (typeof showToast === 'function') showToast('⚠ Zadej hodnotu klíče');
    return;
  }
  // Ulož per-profil i jako globální (pro aktivní profil)
  localStorage.setItem(storageKey, val);
  // Pokud je to aktivní profil, ulož i bez suffixu
  const activeId = localStorage.getItem('mf_active_pid');
  if (profileId === activeId) {
    localStorage.setItem(keyId, val);
  }
  // Zobraz status
  const statusEl = document.getElementById('apk_status_' + keyId);
  if (statusEl) { statusEl.style.display = 'block'; setTimeout(() => statusEl.style.display = 'none', 2000); }
  input.value = '••••••••••••';
  input.dataset.hasValue = '1';
  if (typeof showToast === 'function') showToast('✓ Klíč uložen pro profil ' + _apkCurrentProfileName);
}

function _apkClearKey(storageKey, keyId, profileId) {
  if (!confirm('Smazat tento API klíč?')) return;
  localStorage.removeItem(storageKey);
  // Smaž i globální pokud je to aktivní profil
  const activeId = localStorage.getItem('mf_active_pid');
  if (profileId === activeId) localStorage.removeItem(keyId);

  const input = document.getElementById('apk_input_' + keyId);
  if (input) { input.value = ''; input.dataset.hasValue = '0'; }
  if (typeof showToast === 'function') showToast('🗑 Klíč smazán');
}

function _apkClose() {
  document.getElementById('adminProfileApiModal').classList.remove('open');
  _apkCurrentProfileId = null;
}

// Přidej tlačítko do admin profil listu — přepíšeme adminLoadProfiles
(function patchAdminLoadProfiles() {
  const origFn = window.adminLoadProfiles;
  window.adminLoadProfiles = function() {
    const list = document.getElementById('adminProfilesList');
    if (!list) return;
    let profiles = [];
    try { profiles = safeLS('mf_profiles_v2', '[]'); } catch(e){}
    if (!profiles.length) {
      list.innerHTML = '<div style="font-size:0.72rem;color:rgba(255,255,255,0.3);text-align:center;padding:20px;">Žádné profily</div>';
      return;
    }
    list.innerHTML = profiles.map((p, i) => {
      // Zjisti počet nastavených klíčů pro tento profil
      const setKeys = _APK_KEYS.filter(k => !!localStorage.getItem(k.id + '_' + p.id) || !!localStorage.getItem(k.id)).length;
      return `
      <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:rgba(255,255,255,0.035);border:1px solid rgba(255,255,255,0.06);border-radius:12px;">
        <div style="width:40px;height:40px;border-radius:50%;background:${p.color||'#333'};display:flex;align-items:center;justify-content:center;font-size:${p.avatarUrl?'0':' 1.2'}rem;flex-shrink:0;overflow:hidden;">
          ${p.avatarUrl ? `<img src="${p.avatarUrl}" style="width:100%;height:100%;object-fit:cover;" alt="">` : (p.avatar||'🎬')}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.85rem;font-weight:700;">${p.name||'Profil '+(i+1)}</div>
          <div style="font-size:0.6rem;color:rgba(255,255,255,0.3);margin-top:2px;">
            PIN: ${p.pin?'••••':'—'} · Barva: <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color||'#888'};vertical-align:middle;"></span>
            ${p.traktToken?' · Trakt ✓':''} · 🔑 ${setKeys}/${_APK_KEYS.length} klíčů
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;">
          <button onclick="adminOpenProfileApiKeys(${i})" style="padding:6px 12px;border-radius:8px;background:rgba(255,200,0,0.08);border:1px solid rgba(255,200,0,0.2);color:rgba(255,200,0,0.8);font-size:0.62rem;font-weight:700;cursor:pointer;">🔑 API</button>
          <button onclick="adminEditProfile(${i})" style="padding:6px 12px;border-radius:8px;background:rgba(0,122,255,0.07);border:1px solid rgba(0,122,255,0.18);color:rgba(0,122,255,0.7);font-size:0.62rem;font-weight:700;cursor:pointer;">✏ Upravit</button>
          <button onclick="adminDeleteProfile(${i})" style="padding:6px 12px;border-radius:8px;background:rgba(255,80,80,0.08);border:1px solid rgba(255,80,80,0.2);color:rgba(255,100,100,0.7);font-size:0.62rem;font-weight:700;cursor:pointer;">🗑</button>
        </div>
      </div>`;
    }).join('');
  };
  // Zavolej ihned pokud admin panel ještě není init
})();

// Když admin otevře panel — znovu zavolej novou verzi
const _origAdminOpenPanel = window.adminOpenPanel;
window.adminOpenPanel = function() {
  if (_origAdminOpenPanel) _origAdminOpenPanel();
  // Po krátkém čekání přepiš seznam profilů
  setTimeout(() => { if (typeof window.adminLoadProfiles === 'function') window.adminLoadProfiles(); }, 100);
};

// ══════════════════════════════════════════════════════════════
// FIX 4: TMDB AVATAR PICKER
// Umožní vybrat profilový obrázek z TMDB (person search).
// ══════════════════════════════════════════════════════════════

let _tmdbAvSelectedUrl = null;
let _tmdbAvSelectedName = null;
let _tmdbAvCallback = null; // funkce volaná po výběru
let _tmdbAvMode = 'person'; // 'person' nebo 'movie'

// ── Tab switch ──────────────────────────────────────────────────
window._tmdbSetTab = function(mode) {
  _tmdbAvMode = mode;
  document.getElementById('tmdbTabPerson').classList.toggle('active', mode === 'person');
  document.getElementById('tmdbTabMovie').classList.toggle('active', mode === 'movie');
  const hint = document.getElementById('tmdbAvHint');
  const input = document.getElementById('tmdbAvInput');
  if (mode === 'person') {
    if (hint) hint.textContent = 'Vyhledej herce, režiséra nebo jakoukoli osobnost z TMDB.';
    if (input) input.placeholder = 'Jméno herce nebo osobnosti…';
  } else {
    if (hint) hint.textContent = 'Vyhledej film nebo seriál a použij jeho poster jako avatar.';
    if (input) input.placeholder = 'Název filmu nebo seriálu…';
  }
  document.getElementById('tmdbAvGrid').innerHTML = '<div class="tmdb-av-loading">Zadej název a hledej…</div>';
};

window._tmdbAvOpen = function(callback) {
  _tmdbAvCallback = callback;
  _tmdbAvSelectedUrl = null;
  _tmdbAvSelectedName = null;
  document.getElementById('tmdbAvInput').value = '';
  document.getElementById('tmdbAvGrid').innerHTML = '<div class="tmdb-av-loading">Zadej jméno a hledej…</div>';
  document.getElementById('tmdbAvatarModal').classList.add('open');
  setTimeout(() => document.getElementById('tmdbAvInput').focus(), 100);
};

window._tmdbAvClose = function() {
  document.getElementById('tmdbAvatarModal').classList.remove('open');
  _tmdbAvCallback = null;
};

window._tmdbAvSearch = async function() {
  const query = document.getElementById('tmdbAvInput').value.trim();
  if (!query) return;
  const grid = document.getElementById('tmdbAvGrid');
  grid.innerHTML = '<div class="tmdb-av-loading">🔍 Hledám…</div>';

  const tmdbKey = localStorage.getItem('mf_tmdb_key') ||
                  (() => { const pid = localStorage.getItem('mf_active_pid'); return pid ? localStorage.getItem('mf_tmdb_key_' + pid) : null; })() || '';

  if (!tmdbKey) {
    grid.innerHTML = '<div class="tmdb-av-loading">⚠ Nastav TMDB API klíč v nastavení, aby šlo hledat.</div>';
    return;
  }

  try {
    let results = [];
    if (_tmdbAvMode === 'person') {
      const res = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${tmdbKey}&query=${encodeURIComponent(query)}&language=cs&page=1`);
      const data = await res.json();
      results = (data.results || []).filter(p => p.profile_path).slice(0, 20).map(p => ({
        imgPath: p.profile_path,
        name: p.name,
        size: 'w185'
      }));
    } else {
      // movie mode — search both movie and tv
      const [mRes, tvRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(query)}&language=cs&page=1`),
        fetch(`https://api.themoviedb.org/3/search/tv?api_key=${tmdbKey}&query=${encodeURIComponent(query)}&language=cs&page=1`)
      ]);
      const [mData, tvData] = await Promise.all([mRes.json(), tvRes.json()]);
      const movies = (mData.results || []).filter(p => p.poster_path).slice(0, 10).map(p => ({ imgPath: p.poster_path, name: p.title || p.name, size: 'w342' }));
      const shows = (tvData.results || []).filter(p => p.poster_path).slice(0, 10).map(p => ({ imgPath: p.poster_path, name: p.name, size: 'w342' }));
      results = [...movies, ...shows].slice(0, 20);
    }

    if (!results.length) {
      grid.innerHTML = '<div class="tmdb-av-loading">Žádné výsledky. Zkus jiný název.</div>';
      return;
    }

    grid.innerHTML = '';
    results.forEach(item => {
      const imgUrl = `https://image.tmdb.org/t/p/${item.size}${item.imgPath}`;
      const el = document.createElement('div');
      el.className = 'tmdb-av-item';
      el.dataset.url = imgUrl;
      el.dataset.name = item.name;
      el.innerHTML = `
        <img class="tmdb-av-img" src="${imgUrl}" alt="${item.name}" loading="lazy" onerror="this.parentElement.remove()">
        <span class="tmdb-av-name">${item.name}</span>
      `;
      el.onclick = () => {
        document.querySelectorAll('.tmdb-av-item').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        _tmdbAvSelectedUrl = imgUrl;
        _tmdbAvSelectedName = item.name;
      };
      grid.appendChild(el);
    });
  } catch(e) {
    grid.innerHTML = '<div class="tmdb-av-loading">⚠ Chyba při hledání: ' + e.message + '</div>';
  }
};

window._tmdbAvConfirm = function() {
  if (!_tmdbAvSelectedUrl) {
    if (typeof showToast === 'function') showToast('⚠ Vyber nejdřív obrázek');
    return;
  }
  if (_tmdbAvCallback) _tmdbAvCallback(_tmdbAvSelectedUrl, _tmdbAvSelectedName);
  _tmdbAvClose();
};

// ── Přidej TMDB tlačítko do profile create modalu ──────────────
(function patchProfileCreateModal() {
  // Čekej až bude DOM připraven
  document.addEventListener('DOMContentLoaded', function() {
    const emojiSection = document.querySelector('.pc-box .pc-label');
    if (!emojiSection) return;

    // Najdi label "Avatar"
    const labels = document.querySelectorAll('.pc-box .pc-label');
    let avatarLabel = null;
    labels.forEach(l => { if (l.textContent.trim() === 'Avatar') avatarLabel = l; });
    if (!avatarLabel) return;

    const tmdbBtn = document.createElement('button');
    tmdbBtn.className = 'pc-tmdb-btn';
    tmdbBtn.textContent = '🎬 Vybrat foto z TMDB (herec/osobnost)';
    tmdbBtn.onclick = () => {
      window._tmdbAvOpen((url, name) => {
        // Ulož URL do ProfileGate
        ProfileGate._selectedAvatarUrl = url;
        ProfileGate._selectedAvatarName = name;
        // Vizuálně odznač emoji
        document.querySelectorAll('.pc-emoji-btn').forEach(b => b.classList.remove('selected'));
        if (typeof showToast === 'function') showToast('✓ Obrázek z TMDB vybrán: ' + name);
        // Ukáž náhled
        let preview = document.getElementById('pcTmdbPreview');
        if (!preview) {
          preview = document.createElement('div');
          preview.id = 'pcTmdbPreview';
          preview.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(0,122,255,0.07);border:1px solid rgba(0,122,255,0.18);border-radius:11px;margin-top:6px;';
          tmdbBtn.insertAdjacentElement('afterend', preview);
        }
        preview.innerHTML = `
          <img src="${url}" style="width:42px;height:42px;border-radius:50%;object-fit:cover;" alt="">
          <span style="font-size:0.75rem;color:rgba(255,255,255,0.7);">${name}</span>
          <button onclick="ProfileGate._selectedAvatarUrl=null;ProfileGate._selectedAvatarName=null;document.getElementById('pcTmdbPreview').remove();" style="margin-left:auto;background:none;border:none;color:rgba(255,100,100,0.6);cursor:pointer;font-size:0.75rem;">✕ Zrušit</button>
        `;
      });
    };

    // Vlož před emoji grid
    const emojiGrid = document.getElementById('pcEmojiGrid');
    if (emojiGrid) avatarLabel.insertAdjacentElement('afterend', tmdbBtn);
  });
})();

// Patch ProfileGate.saveProfile aby uložil avatarUrl
(function patchSaveProfile() {
  const origSave = ProfileGate.saveProfile.bind(ProfileGate);
  ProfileGate.saveProfile = function() {
    // Pokud byl vybrán TMDB obrázek, ulož ho do profilu
    if (this._selectedAvatarUrl) {
      // Přidej avatarUrl do profilu po uložení
      const name = (document.getElementById('pcName')?.value || '').trim();
      if (!name) { origSave.call(this); return; }

      if (this._editingId) {
        // Editace
        origSave.call(this);
        // Aktualizuj avatarUrl
        setTimeout(() => {
          const profiles = _getProfiles();
          const idx = profiles.findIndex(p => p.id === this._editingId);
          if (idx >= 0) {
            profiles[idx].avatarUrl = this._selectedAvatarUrl;
            profiles[idx].avatarTmdbName = this._selectedAvatarName;
            _saveProfiles(profiles);
            this.renderGate();
            this.renderBadge();
          }
          this._selectedAvatarUrl = null;
          this._selectedAvatarName = null;
        }, 50);
      } else {
        // Nový profil
        origSave.call(this);
        // Najdi právě vytvořený profil (nejnovější)
        setTimeout(() => {
          const profiles = _getProfiles();
          if (profiles.length) {
            const newest = profiles[profiles.length - 1];
            newest.avatarUrl = this._selectedAvatarUrl;
            newest.avatarTmdbName = this._selectedAvatarName;
            _saveProfiles(profiles);
            this.renderGate();
            this.renderBadge();
          }
          this._selectedAvatarUrl = null;
          this._selectedAvatarName = null;
        }, 50);
      }
    } else {
      origSave.call(this);
    }
  };
})();

// Patch ProfileGate.renderGate a renderBadge aby zobrazoval avatarUrl pokud existuje
(function patchRenderBadge() {
  const origRenderBadge = ProfileGate.renderBadge.bind(ProfileGate);
  ProfileGate.renderBadge = function() {
    origRenderBadge.call(this);
    const p = typeof getActiveProfile === 'function' ? getActiveProfile() : null;
    if (!p || !p.avatarUrl) return;
    const badge = document.getElementById('mfProfileBadge');
    if (!badge) return;
    const av = badge.querySelector('.mpb-avatar');
    if (av) {
      av.innerHTML = `<img src="${p.avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="">`;
    }
  };

  const origRenderGate = ProfileGate.renderGate.bind(ProfileGate);
  ProfileGate.renderGate = function() {
    origRenderGate.call(this);
    // Přepiš avatary s URL obrázkem
    const profiles = typeof _getProfiles === 'function' ? _getProfiles() : [];
    const items = document.querySelectorAll('#pgProfilesList .pg-profile-item');
    items.forEach((item, i) => {
      if (!profiles[i] || !profiles[i].avatarUrl) return;
      const av = item.querySelector('.pg-avatar');
      if (av) av.innerHTML = `<img src="${profiles[i].avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" alt="">`;
    });
  };
})();

// ── Také patch ProfileGate.openCreate aby při editaci zobrazil existující avatarUrl ──
(function patchOpenCreate() {
  const origOpenCreate = ProfileGate.openCreate.bind(ProfileGate);
  ProfileGate.openCreate = function(editId) {
    origOpenCreate.call(this, editId);
    this._selectedAvatarUrl = null;
    this._selectedAvatarName = null;
    // Odstraň předchozí TMDB preview
    const prev = document.getElementById('pcTmdbPreview');
    if (prev) prev.remove();
    // Pokud editujeme a profil má avatarUrl, zobraz preview
    if (editId) {
      const p = (typeof _getProfiles === 'function' ? _getProfiles() : []).find(x => x.id === editId);
      if (p && p.avatarUrl) {
        this._selectedAvatarUrl = p.avatarUrl;
        this._selectedAvatarName = p.avatarTmdbName || '';
        setTimeout(() => {
          const tmdbBtn = document.querySelector('.pc-tmdb-btn');
          if (!tmdbBtn) return;
          let preview = document.getElementById('pcTmdbPreview');
          if (!preview) {
            preview = document.createElement('div');
            preview.id = 'pcTmdbPreview';
            preview.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(0,122,255,0.07);border:1px solid rgba(0,122,255,0.18);border-radius:11px;margin-top:6px;';
            tmdbBtn.insertAdjacentElement('afterend', preview);
          }
          preview.innerHTML = `
            <img src="${p.avatarUrl}" style="width:42px;height:42px;border-radius:50%;object-fit:cover;" alt="">
            <span style="font-size:0.75rem;color:rgba(255,255,255,0.7);">${p.avatarTmdbName||'TMDB obrázek'}</span>
            <button onclick="ProfileGate._selectedAvatarUrl=null;ProfileGate._selectedAvatarName=null;document.getElementById('pcTmdbPreview').remove();" style="margin-left:auto;background:none;border:none;color:rgba(255,100,100,0.6);cursor:pointer;font-size:0.75rem;">✕ Zrušit</button>
          `;
        }, 80);
      }
    }
  };
})();

// ── GLOBÁLNÍ ESC HANDLER — zavře vždy nejvrchnejší otevřený modal ──
// Pořadí kontroly: od modálů s nejvyšším z-indexem dolů.
// e.preventDefault/stopPropagation se nevolá aby ESC fungoval i jinde.
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Escape') return;

  // Pomocná funkce — vrátí true pokud element existuje a je "open"
  function _isOpen(id, cls) {
    const el = id ? document.getElementById(id) : document.querySelector(cls);
    if (!el) return false;
    return el.classList.contains('open') || el.classList.contains('visible') ||
           (el.style.display && el.style.display !== 'none');
  }

  // Zavři první otevřený modal v pořadí priority (nejvyšší z-index první)
  if (_isOpen('adminProfileApiModal')) { _apkClose(); return; }
  if (_isOpen('tmdbAvatarModal')) { _tmdbAvClose(); return; }
  if (_isOpen('epRatingOverlay')) { if(typeof closeEpRating==='function') closeEpRating(false); return; }
  if (_isOpen('syncModal') || _isOpen('syncOverlay')) { if(typeof closeSyncModal==='function') closeSyncModal(); return; }
  // Ostatní modaly řeší vlastní ESC handlery — necháme event projít
}, { capture: true });

// Close modals on outside click
document.getElementById('tmdbAvatarModal').addEventListener('click', function(e) {
  if (e.target === this) _tmdbAvClose();
});
document.getElementById('adminProfileApiModal').addEventListener('click', function(e) {
  if (e.target === this) _apkClose();
});

// ── PROFIL BADGE — přidej avatarUrl podporu do renderBadge HTML ──
// Spusť patche hned po DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  // Znovu renderuj badge a gate s URL podporou
  if (typeof ProfileGate !== 'undefined') {
    setTimeout(() => {
      ProfileGate.renderBadge();
      ProfileGate.renderGate();
    }, 200);
  }
});

console.info('[MůjFlix Patch v3] ✓ Všechny opravy načteny: z-index fix, real-time sync, per-profil API klíče, TMDB avatary');



/* ═══════════════════════════════════════════════════════════════
   PATCH v4 — spouští se ihned, globální scope
   ═══════════════════════════════════════════════════════════════ */

/* ── A. PROFILE BADGE: sleduj otevřené panely ──────────────── */
(function() {
  // Přidej třídu mf-panel-open na body když je otevřen fullscreen panel
  function _checkPanels() {
    const aiEl = document.getElementById('aiFullscreen');
    const aiOpen = aiEl && aiEl.classList.contains('open');
    const pgEl = document.querySelector('.pg-gate');
    const pgOpen = pgEl && (pgEl.classList.contains('visible') || pgEl.style.display !== 'none');
    document.body.classList.toggle('mf-panel-open', !!(aiOpen || pgOpen));
  }
  // Observer na AI fullscreen
  const obs = new MutationObserver(_checkPanels);
  document.addEventListener('DOMContentLoaded', () => {
    const aiEl = document.getElementById('aiFullscreen');
    if (aiEl) obs.observe(aiEl, { attributes: true, attributeFilter: ['class', 'style'] });
    const pgEl = document.querySelector('.pg-gate');
    if (pgEl) obs.observe(pgEl, { attributes: true, attributeFilter: ['class', 'style'] });
    _checkPanels();
  });
  // Hook openAiPanel a closeAiPanel
  const _origClose = window.closeAiPanel;
  const _origOpen  = window.openAiPanel;
  // Přepis se provede po DOMContentLoaded protože openAiPanel je v jiném script bloku
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (typeof openAiPanel === 'function' && !openAiPanel._patched) {
        const orig = openAiPanel;
        window.openAiPanel = function() {
          orig.apply(this, arguments);
          document.body.classList.add('mf-panel-open');
        };
        window.openAiPanel._patched = true;
      }
      if (typeof closeAiPanel === 'function' && !closeAiPanel._patched) {
        const orig = closeAiPanel;
        window.closeAiPanel = function() {
          orig.apply(this, arguments);
          setTimeout(() => {
            document.body.classList.remove('mf-panel-open');
          }, 290);
        };
        window.closeAiPanel._patched = true;
      }
    }, 300);
  });
})();

/* ── B. FIREBASE CONFIG MODAL ──────────────────────────────── */
const _FB_LS = 'mf_firebase_cfg';

window.openFirebaseCfgModal = function() {
  const modal = document.getElementById('mfFbModal');
  if (!modal) return;
  // Načti uložená data
  const saved = (function(){ try{ return safeLS(_FB_LS, '{}'); }catch(e){ return {}; } })();
  ['apiKey','authDomain','databaseURL','projectId','appId'].forEach(k => {
    const el = document.getElementById('fbI_' + k);
    if (el && saved[k]) el.value = saved[k];
  });
  const gEl = document.getElementById('fbI_groupKey');
  if (gEl) gEl.value = localStorage.getItem('mf_sync_group') || '';
  document.getElementById('mfFbStatus').textContent = '';
  modal.classList.add('open');
};

window.mfFbClose = function() {
  document.getElementById('mfFbModal')?.classList.remove('open');
};

window.mfFbGenKey = function() {
  const k = 'mf-' + Math.random().toString(36).slice(2,7) + '-' + Math.random().toString(36).slice(2,5);
  const el = document.getElementById('fbI_groupKey');
  if (el) el.value = k;
};

window.mfFbSave = function() {
  const g = id => document.getElementById('fbI_' + id)?.value?.trim() || '';
  const cfg = {
    apiKey: g('apiKey'), authDomain: g('authDomain'),
    databaseURL: g('databaseURL'), projectId: g('projectId'),
    appId: g('appId'), storageBucket: '', messagingSenderId: ''
  };
  const grpKey = g('groupKey');
  const st = document.getElementById('mfFbStatus');

  if (!cfg.apiKey || !cfg.databaseURL) {
    st.textContent = '⚠ Vyplň alespoň API Key a Database URL';
    st.style.color = '#e17055';
    return;
  }
  localStorage.setItem(_FB_LS, JSON.stringify(cfg));
  if (grpKey) localStorage.setItem('mf_sync_group', grpKey);

  st.textContent = '✓ Uloženo — stránka se obnoví pro aktivaci sync…';
  st.style.color = '#30d158';
  if (typeof showToast === 'function') showToast('🔥 Firebase nastaven! Obnovuji…', 'success');
  setTimeout(() => location.reload(), 1500);
};

// Klik mimo box = zavřít
document.getElementById('mfFbModal').addEventListener('click', function(e) {
  if (e.target === this) mfFbClose();
});
// ESC = zavřít (nejvyšší priorita)
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Escape') return;
  const m = document.getElementById('mfFbModal');
  if (m && m.classList.contains('open')) {
    e.stopImmediatePropagation(); mfFbClose();
  }
}, { capture: true });

/* ── C. ADMIN: PER-PROFIL API KLÍČE ───────────────────────── */
const _PP_KEYS = [
  { key:'mf_gemini_key', label:'Gemini',     color:'#007AFF', ph:'AIzaSy…' },
  { key:'mf_or_key',     label:'OpenRouter', color:'#00cfff', ph:'sk-or-…' },
  { key:'mf_groq_key',   label:'Groq',       color:'#ff9a3c', ph:'gsk_…'   },
];

window.adminRenderPerProfileKeys = function() {
  // Zajisti existenci kontejneru uvnitř admin API tab
  const apiTab = document.getElementById('adminTab_apikeys');
  if (!apiTab) return;
  let sec = document.getElementById('mfPerProfileSection');
  if (!sec) {
    sec = document.createElement('div');
    sec.id = 'mfPerProfileSection';
    apiTab.querySelector(':scope > div')?.appendChild(sec);
    if (!sec.parentNode) apiTab.appendChild(sec);
  }

  let profiles = [];
  try { profiles = safeLS('mf_profiles_v2', '[]'); } catch(e) {}

  if (!profiles.length) {
    sec.innerHTML = '<div class="mfPPS-title">👤 Per-profil API klíče</div><div class="mfPPS-sub" style="color:rgba(255,255,255,0.25)">Žádné profily.</div>';
    return;
  }

  sec.innerHTML = `
    <div class="mfPPS-title">👤 API klíče pro konkrétní profil</div>
    <div class="mfPPS-sub">Každý profil může mít vlastní klíč — použije ho místo globálního.</div>
    ${profiles.map(p => {
      const pid = p.id;
      const avInner = p.avatarUrl
        ? `<img src="${p.avatarUrl}" alt="">`
        : (p.avatar || '🎬');
      const rows = _PP_KEYS.map(kd => {
        const lsKey = kd.key + '_' + pid;
        const val = localStorage.getItem(lsKey) || '';
        const displayVal = val ? val.slice(0,5)+'•••'+val.slice(-3) : '';
        return `<div class="mfPPS-row">
          <span class="mfPPS-lbl" style="color:${kd.color}">${kd.label}</span>
          <input class="mfPPS-inp" id="ppk_${pid}_${kd.key}"
            type="password" placeholder="${displayVal || kd.ph}"
            ${val ? `value="${val}"` : ''}>
          <button class="mfPPS-save"
            onclick="adminSavePerKey('${pid}','${kd.key}')">Uložit</button>
          ${val ? `<button class="mfPPS-del"
            onclick="adminDelPerKey('${pid}','${kd.key}')">✕</button>` : ''}
        </div>`;
      }).join('');
      return `<div class="mfPPS-card">
        <div class="mfPPS-head">
          <div class="mfPPS-av" style="background:${p.color||'rgba(255,255,255,0.08)'}33;
            border:1px solid ${p.color||'rgba(255,255,255,0.1)'}44">${avInner}</div>
          <div>
            <div class="mfPPS-name">${p.name || 'Profil'}</div>
            <div class="mfPPS-id">${pid}</div>
          </div>
        </div>
        ${rows}
      </div>`;
    }).join('')}
  `;
};

window.adminSavePerKey = function(pid, keyName) {
  const el = document.getElementById('ppk_' + pid + '_' + keyName);
  const val = el?.value?.trim();
  if (!val) { showToast?.('❌ Zadej hodnotu klíče'); return; }
  localStorage.setItem(keyName + '_' + pid, val);
  showToast?.('✓ Klíč uložen pro ' + pid.slice(0,10) + '…');
  adminRenderPerProfileKeys();
};

window.adminDelPerKey = function(pid, keyName) {
  localStorage.removeItem(keyName + '_' + pid);
  showToast?.('🗑 Klíč smazán');
  adminRenderPerProfileKeys();
};

/* ── D. PER-PROFIL KLÍČE — aplikuj při přepnutí profilu ───── */
(function() {
  function applyProfileKeys() {
    const pid = localStorage.getItem('mf_active_pid');
    if (!pid) return;
    _PP_KEYS.forEach(kd => {
      const perVal = localStorage.getItem(kd.key + '_' + pid);
      if (perVal) localStorage.setItem(kd.key, perVal);
    });
  }
  // Aplikuj hned
  document.addEventListener('DOMContentLoaded', () => setTimeout(applyProfileKeys, 400));
  // Aplikuj při přepnutí profilu (hook setActiveUser)
  const _origSAU = window.setActiveUser;
  window.setActiveUser = function(uid) {
    if (_origSAU) _origSAU(uid);
    setTimeout(applyProfileKeys, 100);
  };
})();

/* ── E. URL HASH ROUTING ────────────────────────────────────── */
(function() {
  // ── CENTRÁLNÍ HASH ROUTER ────────────────────────────────────
  // Každá obrazovka má vlastní URL hash.
  // Funguje v obou směrech: URL → akce  i  akce → URL

  const ROUTES = {
    // Hlavní obrazovky
    '#':          () => { if (typeof closeDockOverlays === 'function') closeDockOverlays(); },
    '#serialy':   () => { if (typeof closeDockOverlays === 'function') closeDockOverlays(); if (typeof setDockActive === 'function') setDockActive('dockHome'); },
    '#filmy':     () => {
      if (typeof openUniverse === 'function') {
        openUniverse();
        setTimeout(() => { document.querySelectorAll('[data-rtype="movie"]').forEach(b => b.click()); }, 400);
      }
    },
    '#protebe':   () => { if (typeof mfShowSection === 'function') { const orig = window._mfShowSection_orig || mfShowSection; orig('protebe'); } if (typeof setDockActive === 'function') setDockActive('dockProtebe'); },
    '#watchlist': () => { if (typeof openWatchlist === 'function') openWatchlist(); },
    '#ai':        () => { if (typeof openAi === 'function') openAi(); if (typeof setDockActive === 'function') setDockActive('dockAI'); },
    '#ruleta':    () => { if (typeof openRuleta === 'function') openRuleta(); if (typeof setDockActive === 'function') setDockActive('dockRuleta'); },
    '#sync':      () => { if (typeof openSyncModal === 'function') openSyncModal(); },
    '#firebase':  () => { if (typeof openFirebaseCfgModal === 'function') openFirebaseCfgModal(); },
    '#admin':     () => { if (typeof openAdmin === 'function') openAdmin(); },
    '#settings':  () => { if (typeof openSettings === 'function') openSettings(); else if (typeof openApikeyOverlay === 'function') openApikeyOverlay(); },
    // Speciální obrazovky
    '#intro':     () => { if (typeof playIntro === 'function') { const g = document.getElementById('mflix-intro'); if (g) { g.style.display='flex'; g.style.opacity='1'; playIntro(); } } },
    '#profil':    () => { if (typeof ProfileGate !== 'undefined') ProfileGate.show(); },
    '#profily':   () => { if (typeof ProfileGate !== 'undefined') ProfileGate.show(); },
  };

  // Při každé změně URL hash spusť správnou akci
  function handleHash() {
    const raw  = window.location.hash || '';
    const h    = raw.toLowerCase().split('/')[0]; // ignoruj sub-path
    const fn   = ROUTES[h] || ROUTES['#serialy'];
    fn();
  }

  // ── Pushuj URL při každé uživatelské akci ──────────────────
  // Monkey-patch funkce které mění obrazovku
  function _routerPatch() {
    const _push = h => { if (location.hash !== h) history.pushState(null, '', h); };

    // Patch mfShowSection — hlavní přepínač sekcí
    if (typeof window.mfShowSection === 'function') {
      window._mfShowSection_orig = window.mfShowSection;
      window.mfShowSection = function(section, ...rest) {
        const hashMap = { serialy:'#serialy', filmy:'#filmy', protebe:'#protebe', discover:'#discover' };
        if (hashMap[section]) _push(hashMap[section]);
        return window._mfShowSection_orig.call(this, section, ...rest);
      };
    }

    // Wrapper helper
    const _wrap = (obj, method, hash) => {
      if (!obj || typeof obj[method] !== 'function') return;
      const orig = obj[method].bind(obj);
      obj[method] = function(...a) { _push(hash); return orig(...a); };
    };

    // Funkce → hash
    const fnMap = [
      ['openAi',              '#ai'],
      ['openUniverse',        '#discover'],
      ['openWatchlist',       '#watchlist'],
      ['openSyncModal',       '#sync'],
      ['openRuleta',          '#ruleta'],
      ['openAdmin',           '#admin'],
      ['openSettings',        '#settings'],
      ['openApikeyOverlay',   '#settings'],
      ['openFirebaseCfgModal','#firebase'],
    ];
    fnMap.forEach(([name, hash]) => {
      if (typeof window[name] === 'function') {
        const orig = window[name];
        window[name] = function(...a) { _push(hash); return orig.apply(this, a); };
      }
    });

    // ProfileGate.show → #profily
    if (typeof ProfileGate !== 'undefined') {
      _wrap(ProfileGate, 'show', '#profily');
      // ProfileGate.hide / activateProfile → zpět na #serialy
      const origHide = ProfileGate.hide.bind(ProfileGate);
      ProfileGate.hide = function(...a) { _push('#serialy'); return origHide(...a); };
      const origAct = ProfileGate.activateProfile.bind(ProfileGate);
      ProfileGate.activateProfile = function(...a) { const r = origAct(...a); _push('#serialy'); return r; };
    }

    // Dock tlačítka — sync hash při kliku
    document.querySelectorAll('.dock-btn[data-hash]').forEach(btn => {
      btn.addEventListener('click', () => _push(btn.dataset.hash));
    });
  }

  window.addEventListener('hashchange', handleHash);
  window.addEventListener('popstate',   handleHash); // Back button
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      _routerPatch();
      // Pokud není žádný hash, nastav výchozí
      if (!location.hash || location.hash === '#') history.replaceState(null, '', '#serialy');
      handleHash();
    }, 900);
  });
})();

/* ── F. IKONKY — finální z-index cleanup ───────────────────── */
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      // Ujisti se že sync badge v headeru (ne plovoucí) je viditelný
      const hdrSync = document.getElementById('hdrSyncBtn');
      if (hdrSync) hdrSync.style.display = '';

      // Staré plovoucí aiFab — definitivně skrýt
      const oldFab = document.getElementById('aiFab');
      if (oldFab && !oldFab.classList.contains('dock-btn')) {
        oldFab.style.display = 'none';
      }
    }, 500);
  });
})();

console.info('[MůjFlix v4] ✓ AI fix, Firebase GUI, per-profil API, URL routing, badge fix');



// ── PRO TEBE FINDER ─────────────────────────────────────────────
(function() {
  let _ptType = 'movie';

  window.ptSetType = function(t) {
    _ptType = t;
    const mBtn = document.getElementById('ptTypeMovie');
    const sBtn = document.getElementById('ptTypeSerial');
    if (!mBtn || !sBtn) return;
    if (t === 'movie') {
      mBtn.style.background = 'rgba(0,122,255,0.18)'; mBtn.style.color = '#007AFF';
      sBtn.style.background = 'transparent'; sBtn.style.color = 'rgba(255,255,255,0.35)';
    } else {
      sBtn.style.background = 'rgba(0,122,255,0.18)'; sBtn.style.color = '#007AFF';
      mBtn.style.background = 'transparent'; mBtn.style.color = 'rgba(255,255,255,0.35)';
    }
  };

  window.ptFinderSearch = function() {
    const input = document.getElementById('ptFinderInput');
    if (!input) return;
    const name = input.value.trim();
    if (!name) { input.focus(); return; }
    // Přidej chip do historie
    ptAddChip(name, _ptType);
    // Spusť finder modal
    if (typeof verifyAndOpen === 'function') verifyAndOpen(name, _ptType);
    else if (typeof showFinderModal === 'function') { showFinderModal(name, _ptType); if (typeof runFinder === 'function') runFinder(name, _ptType); }
  };

  // Quick chips — naposledy hledané
  function ptAddChip(name, type) {
    let stored; try { stored = safeLS('mf_pt_chips', '[]'); } catch { stored = []; }
    const entry = { name, type, ts: Date.now() };
    const filtered = stored.filter(c => c.name !== name).slice(0, 7);
    filtered.unshift(entry);
    localStorage.setItem('mf_pt_chips', JSON.stringify(filtered));
    ptRenderChips();
  }

  window.ptRenderChips = function() {
    const container = document.getElementById('ptFinderChips');
    if (!container) return;
    let stored; try { stored = safeLS('mf_pt_chips', '[]'); } catch { stored = []; }
    // Keep label
    container.innerHTML = '<span style="font-size:0.55rem;color:rgba(255,255,255,0.25);align-self:center;flex-shrink:0;">Naposledy:</span>';
    if (!stored.length) {
      container.innerHTML += '<span style="font-size:0.6rem;color:rgba(255,255,255,0.18);">zatím nic</span>';
      return;
    }
    stored.slice(0, 5).forEach(c => {
      const chip = document.createElement('button');
      chip.style.cssText = `
        padding:5px 11px;border-radius:20px;
        background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
        color:rgba(255,255,255,0.6);font-size:0.62rem;font-family:-apple-system,sans-serif;
        cursor:pointer;white-space:nowrap;transition:all 0.18s;display:flex;align-items:center;gap:5px;
      `;
      chip.innerHTML = `${c.type==='movie'?'🎬':'📺'} ${c.name}`;
      chip.onmouseover = () => { chip.style.background='rgba(255,255,255,0.11)'; chip.style.color='#fff'; };
      chip.onmouseout  = () => { chip.style.background='rgba(255,255,255,0.06)'; chip.style.color='rgba(255,255,255,0.6)'; };
      chip.onclick = () => {
        document.getElementById('ptFinderInput').value = c.name;
        ptSetType(c.type);
        ptFinderSearch();
      };
      container.appendChild(chip);
    });
  };

  // Renderuj chips když se sekce otevře
  const observer = new MutationObserver(() => {
    const el = document.getElementById('mfSectionProtebe');
    if (el && el.style.display !== 'none') ptRenderChips();
  });
  document.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById('mfSectionProtebe');
    if (el) observer.observe(el, { attributes: true, attributeFilter: ['style'] });
    ptRenderChips();
  });
})();



// ══════════════════════════════════════════════════════════
// 🟡 PLEX INTEGRACE — MůjFlix
// ══════════════════════════════════════════════════════════
(function() {
  const PLEX_DEFAULT_URL = 'http://100.72.144.107:8080/plex';
  const PLEX_DEFAULT_TOKEN = 'yzrL-FrFEgc85YobxCes'; // ← tvůj token (změň pokud expiruje)
  const PLEX_STORAGE_KEY = 'mf_plex_token';
  const PLEX_URL_KEY = 'mf_plex_url';

  // Auto-reset staré URL (port 32400) na novou proxy cestu
  (function() {
    const stored = localStorage.getItem(PLEX_URL_KEY);
    if (!stored || stored.includes(':32400')) {
      localStorage.setItem(PLEX_URL_KEY, PLEX_DEFAULT_URL);
    }
  })();

  function plexUrl() { return localStorage.getItem(PLEX_URL_KEY) || PLEX_DEFAULT_URL; }
  function plexToken() { return localStorage.getItem(PLEX_STORAGE_KEY) || PLEX_DEFAULT_TOKEN; }

  // Stav aktuálně vybrané sekce
  let _plexCurrentSection = null;
  let _plexSections = [];

  // Vrátí přímou Plex URL (port 32400) — pro thumbnaile a Plex Web odkazy
  function plexDirectUrl() {
    const url = plexUrl();
    // Pokud jde přes proxy /plex, převedeme zpět na přímý port
    return url.replace(/\/plex\/?$/, '').replace(':8080', ':32400');
  }

  // Fetch přes proxy (řeší CORS) — Accept header přidáváme jen pokud proxy povoluje
  async function plexFetch(url) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'omit'
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch(e) {
      // Fallback — zkus bez custom headers (pro případ striktního CORS)
      const res2 = await fetch(url, { method: 'GET', credentials: 'omit' });
      if (!res2.ok) throw new Error('HTTP ' + res2.status);
      const text = await res2.text();
      try { return JSON.parse(text); }
      catch(_) { throw new Error('Síťová chyba — zkontroluj URL a token'); }
    }
  }

  window.plexInit = async function() {
    const token = plexToken();
    const onboard = document.getElementById('plexOnboarding');
    const loader = document.getElementById('plexLoader');
    const err = document.getElementById('plexConnError');
    const grid = document.getElementById('plexGrid');
    const filters = document.getElementById('plexLibFilters');
    const status = document.getElementById('plexServerStatus');

    if (onboard) onboard.style.display = 'none';
    if (err) err.style.display = 'none';
    if (grid) grid.style.display = 'none';
    if (filters) filters.style.display = 'none';

    if (!token) {
      if (onboard) onboard.style.display = 'block';
      if (status) status.textContent = 'Token není nastaven';
      return;
    }

    if (loader) loader.style.display = 'block';
    if (status) status.textContent = 'Připojování k ' + plexUrl() + '…';

    try {
      // Načti knihovny — token pouze v URL query, žádné custom headers (CORS fix)
      const data = await plexFetch(`${plexUrl()}/library/sections?X-Plex-Token=${token}&Accept=application/json`);
      const sections = (data.MediaContainer?.Directory || []);
      _plexSections = sections;

      if (loader) loader.style.display = 'none';
      if (status) status.textContent = `Připojeno · ${sections.length} knihoven`;

      // Vyrenderuj filtry
      if (filters) {
        filters.style.display = 'flex';
        filters.innerHTML = '';
        const allBtn = _plexFilterBtn('Vše', null, true);
        filters.appendChild(allBtn);
        sections.forEach(s => {
          const icon = s.type === 'movie' ? '🎬' : s.type === 'show' ? '📺' : '🎵';
          filters.appendChild(_plexFilterBtn(icon + ' ' + s.title, s.key, false));
        });
      }

      // Načti obsah první sekce
      if (sections.length > 0) {
        _plexCurrentSection = null; // null = vše
        await plexLoadAll(sections);
      } else {
        if (grid) { grid.style.display = 'block'; grid.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px;">Žádné knihovny nenalezeny.</p>'; }
      }

    } catch(e) {
      if (loader) loader.style.display = 'none';
      const errMsg = document.getElementById('plexConnErrorMsg');
      if (errMsg) errMsg.innerHTML = `Chyba: <strong>${e.message}</strong><br><br>Zkontroluj URL a token, nebo zda Plex povoluje přístup z prohlížeče.`;
      if (err) err.style.display = 'block';
      if (status) status.textContent = 'Chyba připojení';
    }
  };

  function _plexFilterBtn(label, sectionKey, active) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.dataset.sectionKey = sectionKey || '';
    btn.style.cssText = `padding:8px 16px;border-radius:20px;border:1px solid ${active ? 'rgba(229,160,13,0.5)' : 'rgba(255,255,255,0.08)'};background:${active ? 'rgba(229,160,13,0.14)' : 'rgba(255,255,255,0.04)'};color:${active ? '#e5a00d' : 'rgba(255,255,255,0.6)'};font-size:0.78rem;font-weight:${active ? '700' : '500'};cursor:pointer;white-space:nowrap;transition:all 0.15s;`;
    btn.onclick = () => {
      document.querySelectorAll('#plexLibFilters button').forEach(b => {
        b.style.background = 'rgba(255,255,255,0.04)';
        b.style.borderColor = 'rgba(255,255,255,0.08)';
        b.style.color = 'rgba(255,255,255,0.6)';
        b.style.fontWeight = '500';
      });
      btn.style.background = 'rgba(229,160,13,0.14)';
      btn.style.borderColor = 'rgba(229,160,13,0.5)';
      btn.style.color = '#e5a00d';
      btn.style.fontWeight = '700';
      if (!sectionKey) {
        plexLoadAll(_plexSections);
      } else {
        plexLoadSection(sectionKey, null);
      }
    };
    return btn;
  }

  window.plexLoadAll = async function(sections) {
    const grid = document.getElementById('plexGrid');
    if (!grid) return;
    grid.style.display = 'block';
    grid.innerHTML = '';
    for (const s of sections) {
      await plexLoadSection(s.key, s.title);
    }
  };

  window.plexLoadSection = async function(key, title) {
    const grid = document.getElementById('plexGrid');
    const token = plexToken();
    if (!grid) return;

    // Pokud načítáme jednu sekci, vyčisti grid
    if (title === null) grid.innerHTML = '';

    try {
      const data = await plexFetch(`${plexUrl()}/library/sections/${key}/all?X-Plex-Token=${token}&X-Plex-Container-Start=0&X-Plex-Container-Size=200`);
      const items = data.MediaContainer?.Metadata || [];

      if (items.length === 0) return;

      // Název sekce
      const sectionTitle = title || data.MediaContainer?.title1 || 'Knihovna';
      const sectionEl = document.createElement('div');
      sectionEl.style.cssText = 'margin-bottom:32px;';
      sectionEl.innerHTML = `<div style="font-size:1rem;font-weight:700;letter-spacing:-0.3px;margin-bottom:14px;padding:0 2px;">${sectionTitle} <span style="font-size:0.72rem;color:var(--muted);font-weight:400;">(${items.length})</span></div>`;

      // Grid dlaždic
      const tilesWrap = document.createElement('div');
      tilesWrap.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px;';

      items.forEach(item => {
        const tile = _plexTile(item);
        tilesWrap.appendChild(tile);
      });

      sectionEl.appendChild(tilesWrap);
      grid.appendChild(sectionEl);

    } catch(e) {
      console.warn('[Plex] Chyba načítání sekce', key, e);
    }
  };

  function _plexTile(item) {
    const token = plexToken();
    const thumbUrl = item.thumb
      ? `${plexDirectUrl()}${item.thumb}?X-Plex-Token=${token}&width=200`
      : null;
    const year = item.year ? ` (${item.year})` : '';
    const rating = item.rating ? `⭐ ${parseFloat(item.rating).toFixed(1)}` : '';
    const watched = item.viewCount > 0;

    const tile = document.createElement('div');
    tile.style.cssText = 'position:relative;cursor:pointer;border-radius:12px;overflow:hidden;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);transition:transform 0.18s,box-shadow 0.18s;';
    tile.title = item.title + year;
    tile.onmouseenter = () => { tile.style.transform = 'scale(1.04)'; tile.style.boxShadow = '0 8px 32px rgba(0,0,0,0.6)'; };
    tile.onmouseleave = () => { tile.style.transform = ''; tile.style.boxShadow = ''; };

    // Poster
    const img = document.createElement('div');
    img.style.cssText = `aspect-ratio:2/3;background:rgba(255,255,255,0.04) url('${thumbUrl || ''}') center/cover no-repeat;`;
    if (!thumbUrl) img.style.display = 'flex', img.style.alignItems = 'center', img.style.justifyContent = 'center', img.innerHTML = '<span style="font-size:2rem;">🎬</span>';

    // Watched badge
    if (watched) {
      const wb = document.createElement('div');
      wb.style.cssText = 'position:absolute;top:6px;right:6px;background:rgba(229,160,13,0.9);border-radius:6px;padding:2px 6px;font-size:0.58rem;font-weight:700;color:#000;';
      wb.textContent = '✓ Viděno';
      tile.appendChild(wb);
    }

    tile.appendChild(img);

    // Info pod posterem
    const info = document.createElement('div');
    info.style.cssText = 'padding:8px 8px 10px;';
    info.innerHTML = `<div style="font-size:0.72rem;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_esc(item.title)}</div><div style="font-size:0.62rem;color:var(--muted);margin-top:2px;">${year.replace('(','').replace(')','') || ''}${rating ? ' · ' + rating : ''}</div>`;
    tile.appendChild(info);

    // Klik — otevři přímo v Plex Web (přes port 32400, ne proxy)
    tile.onclick = () => {
      const plexWebUrl = `${plexDirectUrl()}/web/index.html#!/server/${item.librarySectionID}/details?key=${encodeURIComponent(item.key)}&X-Plex-Token=${token}`;
      window.open(plexWebUrl, '_blank');
    };

    return tile;
  }

  // ── Uložení nastavení (onboarding) ──
  window.plexSaveSettings = function() {
    const token = document.getElementById('plexTokenInput')?.value?.trim();
    const url = document.getElementById('plexUrlInput')?.value?.trim() || PLEX_DEFAULT_URL;
    if (!token) { alert('Vlož prosím Plex Token.'); return; }
    localStorage.setItem(PLEX_STORAGE_KEY, token);
    localStorage.setItem(PLEX_URL_KEY, url);
    plexInit();
  };

  // ── Settings modal ──
  window.openPlexSettings = function() {
    const m = document.getElementById('plexSettingsModal');
    if (!m) return;
    document.getElementById('plexUrlInputS').value = plexUrl();
    document.getElementById('plexTokenInputS').value = plexToken();
    m.style.display = 'flex';
  };
  window.closePlexSettings = function() {
    const m = document.getElementById('plexSettingsModal');
    if (m) m.style.display = 'none';
  };
  window.plexSaveSettingsModal = function() {
    const token = document.getElementById('plexTokenInputS')?.value?.trim();
    const url = document.getElementById('plexUrlInputS')?.value?.trim() || PLEX_DEFAULT_URL;
    if (token) localStorage.setItem(PLEX_STORAGE_KEY, token);
    if (url) localStorage.setItem(PLEX_URL_KEY, url);
    closePlexSettings();
    plexRefresh();
  };

  // ── Obnovit ──
  window.plexRefresh = function() { plexInit(); };

})();



/* ─── SEKCE: přepínání ───────────────────────────────────────────── */
(function() {
  // Aktuální sekce
  let _currentSection = 'serialy';

  // Pomocník pro aktivaci dock tlačítka
  window.mfSectionBtn = function(btn, dockId) {
    // neměň aktivní dock tab
  };

  window.mfShowSection = function(section) {
    _currentSection = section;
    window._mfCurrentSection = section; // global pro closeDockMore

    // Skryj/ukaž hlavní menu
    const mainScene = document.querySelector('.ps-menu-scene');
    const keyHint = document.querySelector('.key-hint');
    const continueW = document.getElementById('continueWidget');
    const protebe = document.getElementById('mfSectionProtebe');

    // Reset všeho
    if (mainScene) mainScene.style.display = '';
    if (keyHint) keyHint.style.display = '';
    if (continueW) continueW.style.display = '';
    if (protebe) protebe.style.display = 'none';
    const _plexSecReset = document.getElementById('mfSectionPlex');
    if (_plexSecReset) _plexSecReset.style.display = 'none';
    document.body.classList.remove('mf-section-protebe');

    // Zavři overlaye z jiných sekcí
    if (typeof closeDockOverlays === 'function') closeDockOverlays();

    if (section === 'serialy') {
      // Domů = hlavní menu (výchozí stav)
      setDockActive('dockHome');
      location.hash = '#serialy';

    } else if (section === 'filmy') {
      // Skryj menu, otevři Universe s filtrem filmy
      if (mainScene) mainScene.style.display = 'none';
      if (keyHint) keyHint.style.display = 'none';
      if (continueW) continueW.style.display = 'none';
      setDockActive('dockFilmy');
      location.hash = '#filmy';
      if (typeof openUniverse === 'function') {
        openUniverse();
        setTimeout(() => {
          // Klikni na Movies filter
          const movieBtns = document.querySelectorAll(
            '[data-rtype="movie"], [onclick*="movie"], .disco-filter-btn'
          );
          movieBtns.forEach(b => {
            const t = b.textContent.toLowerCase();
            if (t.includes('film') || b.dataset.rtype === 'movie') {
              b.click();
            }
          });
        }, 350);
      }

    } else if (section === 'protebe') {
      // Skryj hlavní menu, ukaž Pro tebe panel
      if (mainScene) mainScene.style.display = 'none';
      if (keyHint) keyHint.style.display = 'none';
      if (continueW) continueW.style.display = 'none';
      if (protebe) protebe.style.display = 'block';
      document.body.classList.add('mf-section-protebe');
      setDockActive('dockProtebe');
      location.hash = '#protebe';

    } else if (section === 'plex') {
      // Skryj hlavní menu, ukaž Plex sekci
      if (mainScene) mainScene.style.display = 'none';
      if (keyHint) keyHint.style.display = 'none';
      if (continueW) continueW.style.display = 'none';
      if (protebe) protebe.style.display = 'none';
      const plexSec = document.getElementById('mfSectionPlex');
      if (plexSec) plexSec.style.display = 'block';
      setDockActive('dockPlex');
      location.hash = '#plex';
      // Načti Plex knihovnu při prvním zobrazení
      if (typeof plexInit === 'function') plexInit();
    }
  };

  // Když se zavírá Universe (Filmy) → vrať se na seriály
  const _origCloseUni = window.closeUniverse;
  window.closeUniverse = function() {
    if (_origCloseUni) _origCloseUni.apply(this, arguments);
    if (_currentSection === 'filmy') {
      // Universe zavřen — přepni dock zpět na Seriály
      setTimeout(() => {
        const mainScene = document.querySelector('.ps-menu-scene');
        const keyHint = document.querySelector('.key-hint');
        if (mainScene) mainScene.style.display = '';
        if (keyHint) keyHint.style.display = '';
        setDockActive('dockHome');
        _currentSection = 'serialy';
        location.hash = '#serialy';
      }, 50);
    }
  };

  // Hash routing — synchronizuj s dock sekcemi
  function _syncHash() {
    const h = (location.hash || '').toLowerCase();
    if (h === '#filmy') mfShowSection('filmy');
    else if (h === '#protebe') mfShowSection('protebe');
    else if (h === '#plex') mfShowSection('plex');
    else if (h === '#serialy' || h === '') mfShowSection('serialy');
  }
  window.addEventListener('hashchange', _syncHash);
  document.addEventListener('DOMContentLoaded', () => setTimeout(_syncHash, 900));

  // Oprav setDockActive aby fungoval pro nová ID
  const _origSDA = window.setDockActive;
  window.setDockActive = function(id) {
    if (_origSDA) _origSDA(id);
    // Extra: označ nová tlačítka
    ['dockHome','dockFilmy','dockProtebe','dockMore','dockAI'].forEach(bid => {
      const btn = document.getElementById(bid);
      if (!btn) return;
      if (bid === id) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  };

})();
/* ─── konec sekce routing ─────────────────────────────────────────── */

console.info('[MůjFlix v4 sekce] ✓ Edit fix, Seriály/Filmy/Pro tebe sekce, dock redesign');



/* ══════════════════════════════════════════════════════════
   iOS 26 — LIQUID GLASS TILT & PREMIUM EFFECTS ENGINE
══════════════════════════════════════════════════════════ */
(function() {

  // ── 3D Tilt effect on disco cards ──
  function initTilt() {
    const MAX_TILT = 12; // degrees
    const GLARE_MAX = 0.28;

    function applyTilt(card) {
      if (card._tiltInited) return;
      card._tiltInited = true;

      // Create glare layer
      const glare = document.createElement('div');
      glare.style.cssText = `
        position:absolute;inset:0;border-radius:20px;pointer-events:none;
        background:radial-gradient(circle at 30% 30%, rgba(255,255,255,${GLARE_MAX}) 0%, transparent 65%);
        opacity:0;transition:opacity 0.2s ease;z-index:20;mix-blend-mode:screen;
      `;
      card.appendChild(glare);

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        const tiltX = -dy * MAX_TILT;
        const tiltY = dx * MAX_TILT;

        card.style.transform = `scale(1.13) translateY(-18px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        card.style.transformStyle = 'preserve-3d';

        // Glare position
        const gx = ((e.clientX - rect.left) / rect.width) * 100;
        const gy = ((e.clientY - rect.top) / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.22) 0%, transparent 60%)`;
        glare.style.opacity = '1';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transformStyle = '';
        glare.style.opacity = '0';
      });
    }

    // Apply to existing cards
    document.querySelectorAll('.disco-card').forEach(applyTilt);

    // Watch for new cards (lazy load)
    const obs = new MutationObserver(mutations => {
      mutations.forEach(m => m.addedNodes.forEach(n => {
        if (n.nodeType !== 1) return;
        if (n.classList?.contains('disco-card')) applyTilt(n);
        n.querySelectorAll?.('.disco-card').forEach(applyTilt);
      }));
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  // ── Subtle tilt on ps-tile (main cards) ──
  function initPsTilt() {
    const MAX = 7;
    function applyPsTilt(wrapper) {
      if (wrapper._tiltInited) return;
      wrapper._tiltInited = true;
      const tile = wrapper.querySelector('.ps-tile');
      if (!tile) return;

      wrapper.addEventListener('mousemove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        const dx = (e.clientX - rect.left) / rect.width - 0.5;
        const dy = (e.clientY - rect.top) / rect.height - 0.5;
        tile.style.transform = `rotateY(${dx * MAX * 2}deg) rotateX(${-dy * MAX}deg)`;
        tile.style.transformStyle = 'preserve-3d';
        tile.style.transition = 'transform 0.12s ease';
      });
      wrapper.addEventListener('mouseleave', () => {
        tile.style.transform = '';
        tile.style.transition = 'transform 0.5s cubic-bezier(0.34,1.2,0.64,1)';
      });
    }
    document.querySelectorAll('.ps-tile-wrapper').forEach(applyPsTilt);
    const obs = new MutationObserver(m => m.forEach(mu =>
      mu.addedNodes.forEach(n => {
        if (n.nodeType !== 1) return;
        if (n.classList?.contains('ps-tile-wrapper')) applyPsTilt(n);
        n.querySelectorAll?.('.ps-tile-wrapper').forEach(applyPsTilt);
      })
    ));
    obs.observe(document.body, { childList: true, subtree: true });
  }

  // ── Magnetic spring on nav items ──
  function initMagneticNav() {
    document.querySelectorAll('.disco-nav-item').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.18;
        const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.18;
        btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.05)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // ── Hero banner parallax ──
  function initHeroParallax() {
    const hero = document.querySelector('.disco-hero');
    if (!hero) return;
    const img = hero.querySelector('img');
    if (!img) return;
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const dx = (e.clientX - rect.width / 2) / rect.width;
      const dy = (e.clientY - rect.height / 2) / rect.height;
      img.style.transform = `scale(1.07) translate(${dx * -14}px, ${dy * -8}px)`;
      img.style.transition = 'transform 0.15s ease';
    });
    hero.addEventListener('mouseleave', () => {
      img.style.transform = 'scale(1.06)';
      img.style.transition = 'transform 1.2s ease';
    });
  }

  // ── Ripple on active state ──
  function initRipple() {
    document.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest('.disco-nav-item, .disco-hero-btn, .disco-row-nav-btn, .disco-close');
      if (!btn) return;
      const ripple = document.createElement('span');
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.2;
      ripple.style.cssText = `
        position:absolute;border-radius:50%;pointer-events:none;
        width:${size}px;height:${size}px;
        left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top - size/2}px;
        background:rgba(255,255,255,0.15);
        transform:scale(0);
        animation:ios26Ripple 0.55s cubic-bezier(0.25,0.8,0.25,1) forwards;
        z-index:99;
      `;
      if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
    // Inject ripple keyframe
    if (!document.getElementById('ios26RippleStyle')) {
      const s = document.createElement('style');
      s.id = 'ios26RippleStyle';
      s.textContent = `@keyframes ios26Ripple { to { transform:scale(1); opacity:0; } }`;
      document.head.appendChild(s);
    }
  }

  // ── Ambient color extraction from hovered disco card ──
  function initAmbientColor() {
    // When a card is hovered, update the glow color based on poster dominant color
    // Uses a quick canvas sample
    document.addEventListener('mouseover', (e) => {
      const card = e.target.closest('.disco-card');
      if (!card || card._colorSampled) return;
      card._colorSampled = true;
      const img = card.querySelector('.disco-card-img');
      if (!img || !img.complete) return;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 4; canvas.height = 4;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, img.naturalHeight * 0.65, img.naturalWidth, img.naturalHeight * 0.35, 0, 0, 4, 4);
        const d = ctx.getImageData(0, 0, 4, 4).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < d.length; i += 4) {
          r += d[i]; g += d[i+1]; b += d[i+2]; count++;
        }
        r = Math.round(r/count); g = Math.round(g/count); b = Math.round(b/count);
        const glow = card.querySelector('.disco-card-glow');
        if (glow) {
          glow.style.background = `radial-gradient(ellipse 80% 100% at 50% 0%, rgba(${r},${g},${b},0.45) 0%, transparent 70%)`;
        }
        // Also tint border on hover
        card.addEventListener('mouseenter', () => {
          card.style.setProperty('--card-accent', `rgba(${r},${g},${b},0.5)`);
          card.style.borderColor = `rgba(${Math.min(r+40,255)},${Math.min(g+40,255)},${Math.min(b+40,255)},0.38)`;
        }, { passive: true });
        card.addEventListener('mouseleave', () => {
          card.style.borderColor = '';
        }, { passive: true });
      } catch(e) {}
    }, { passive: true });
  }

  // ── Init all when universe opens ──
  function onUniverseOpen() {
    setTimeout(() => {
      initTilt();
      initMagneticNav();
      initHeroParallax();
      initAmbientColor();
    }, 80);
  }

  // Hook into universe open
  const origOpen = window.openUniverse;
  if (origOpen) {
    window.openUniverse = function(...a) {
      const r = origOpen.apply(this, a);
      onUniverseOpen();
      return r;
    };
  }

  // Also watch for universe overlay becoming visible
  const universeObs = new MutationObserver(() => {
    const u = document.querySelector('.universe-overlay.visible');
    if (u && !u._tiltInited) { u._tiltInited = true; onUniverseOpen(); }
  });
  universeObs.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });

  // Always init ps-tile tilt and ripple on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initPsTilt(); initRipple(); });
  } else {
    initPsTilt(); initRipple();
  }

})();



// ═══════════════════════════════════════════════════════════════
// 🤖 AI SOURCE ENGINE — Inteligentní výběr nejlepšího zdroje
// Sleduje úspěšnost každého zdroje a automaticky switchuje
// ═══════════════════════════════════════════════════════════════
window.CinAI = (function() {

  const STORAGE_KEY = 'mf_cin_ai_stats';
  const PROBE_TIMEOUT = 5000; // ms — jak dlouho čekat na odpověď zdroje

  // Načti historii ze storage
  function loadStats() {
    try { return safeLS(STORAGE_KEY, '{}'); }
    catch(e) { return {}; }
  }
  function saveStats(stats) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch(e) {}
  }

  // Spočítej skóre zdroje (0–100)
  // Skóre = úspěšnost (%) * váha recency
  function getScore(stat) {
    if (!stat || stat.tries === 0) return 50; // neznámý = střední skóre
    const rate = stat.ok / stat.tries;
    // Penalizuj zastaralé statistiky (> 24h)
    const age = Date.now() - (stat.lastTs || 0);
    const freshness = Math.max(0.4, 1 - age / (48 * 3600 * 1000));
    return Math.round(rate * 100 * freshness);
  }

  // Seřaď zdroje dle AI skóre
  function rankSources(sources) {
    const stats = loadStats();
    return [...sources]
      .map((src, i) => ({ src, i, score: getScore(stats[src.id]) }))
      .sort((a, b) => b.score - a.score);
  }

  // Zaznamenej výsledek
  function recordResult(srcId, success) {
    const stats = loadStats();
    if (!stats[srcId]) stats[srcId] = { ok: 0, tries: 0, lastTs: 0 };
    stats[srcId].tries++;
    if (success) stats[srcId].ok++;
    stats[srcId].lastTs = Date.now();
    saveStats(stats);
  }

  // Probe: rychle otestuj zdroj fetch HEAD — pokud odpoví, pravděpodobně funguje
  async function probeSource(url) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), PROBE_TIMEOUT);
      // Zkus HEAD request — ignoruje CORS chyby ale detekuje DNS/TCP fail
      await fetch(url, { method: 'HEAD', mode: 'no-cors', signal: ctrl.signal });
      clearTimeout(timer);
      return true; // odpověděl = pravděpodobně živý
    } catch(e) {
      return false; // timeout nebo network error
    }
  }

  // Hlavní funkce: najdi nejlepší dostupný zdroj pro daný obsah
  async function findBestSource(sources, tmdbId, type, season, ep) {
    const ranked = rankSources(sources);
    const stats = loadStats();
    const s = _cinState;

    // popupOnly zdroje nelze probovat fetch — vrať přednastavený sourceIdx
    // Film → Bombuj (idx 1), Seriál → SvetSerialu (idx 0)
    const allPopup = sources.every(src => src.popupOnly);
    if (allPopup) {
      return s.sourceIdx; // respektuj přednastavený výběr
    }

    // Nejprve zkus top 3 dle skóre, vyber první co odpoví probe
    const topN = ranked.slice(0, 4);
    const probes = topN.map(async ({ src, i }) => {
      const url = type === 'movie'
        ? src.movie(tmdbId, s.title, s.year)
        : src.tv(tmdbId, season, ep, s.title, s.siteSlug || null);
      const alive = await probeSource(url);
      return { src, i, alive, url };
    });

    const results = await Promise.all(probes);
    const alive = results.filter(r => r.alive);

    if (alive.length > 0) {
      const best = alive[0];
      window.MF_DEBUG && console.log(`[CinAI] Nejlepší zdroj: ${best.src.label} (skóre ${getScore(stats[best.src.id])}, probe OK)`);
      return best.i;
    }

    window.MF_DEBUG && console.log(`[CinAI] Probe timeout, fallback na přednastavený zdroj`);
    return s.sourceIdx;
  }

  // Sleduj iframe load — zaznamenej úspěch/neúspěch
  function monitorIframe(iframe, srcId) {
    let loaded = false;

    iframe.addEventListener('load', () => {
      loaded = true;
      // Iframe se načetl — pravděpodobný úspěch
      // (nemůžeme číst obsah kvůli CORS, ale load event = stránka existuje)
      setTimeout(() => {
        // Zkontroluj jestli je iframe viditelný a přiměřeně velký
        const rect = iframe.getBoundingClientRect();
        const visible = rect.width > 100 && rect.height > 100;
        recordResult(srcId, visible);
        if (visible) {
          window.MF_DEBUG && console.log(`[CinAI] ${srcId} ✅ zaznamenán úspěch`);
        }
      }, 2000);
    });

    // Timeout — pokud se do 12s nenačte, zaznamenej neúspěch
    setTimeout(() => {
      if (!loaded) {
        recordResult(srcId, false);
        window.MF_DEBUG && console.log(`[CinAI] ${srcId} ❌ timeout — zaznamenán neúspěch`);
      }
    }, 12000);
  }

  // Zobraz AI badge v source baru
  function renderAIBadge(container) {
    const badge = document.createElement('div');
    badge.id = 'cinAIBadge';
    badge.style.cssText = 'display:flex;align-items:center;gap:5px;padding:4px 10px;background:rgba(0,122,255,0.15);border:1px solid rgba(0,122,255,0.3);border-radius:20px;font-size:0.6rem;color:rgba(0,122,255,0.9);font-family:Inter,sans-serif;font-weight:600;white-space:nowrap;cursor:default;';
    badge.title = 'AI automaticky vybírá nejspolehlivější zdroj';
    badge.innerHTML = '✦ AI';
    container.prepend(badge);
  }

  // Reset statistik (pro debug / reset)
  function resetStats() {
    localStorage.removeItem(STORAGE_KEY);
    window.MF_DEBUG && console.log('[CinAI] Statistiky vynulovány');
  }

  // Zobraz statistiky zdrojů jako toast
  function showStats() {
    const stats = loadStats();
    if (typeof CINEMA_SOURCES === 'undefined') return;
    const lines = CINEMA_SOURCES.map(src => {
      const s = stats[src.id];
      const score = getScore(s);
      const bar = '█'.repeat(Math.round(score/10)) + '░'.repeat(10 - Math.round(score/10));
      const tries = s ? s.tries : 0;
      return `${src.label.padEnd(12)} ${bar} ${score}% (${tries}×)`;
    }).join('\n');
    window.MF_DEBUG && console.log('[CinAI] Statistiky zdrojů:\n' + lines);
    if (typeof showToast === 'function') {
      const best = CINEMA_SOURCES.map(src => ({ src, score: getScore(stats[src.id]) }))
        .sort((a,b) => b.score - a.score)[0];
      showToast(`🤖 Nejlepší zdroj: ${best.src.label} (${best.score}%)`, 'success');
    }
  }

  return { findBestSource, monitorIframe, renderAIBadge, recordResult, getScore, loadStats, resetStats, showStats, rankSources };
})();



// ══════════════════════════════════════════════════════════
// 🎬 VIEW TRANSITIONS ENGINE
// Plynulý přechod plakát → detail (jako iOS)
// ══════════════════════════════════════════════════════════
window.MFTransition = (function() {
  const SUPPORTS = !!document.startViewTransition;

  // Nastav view-transition-name na konkrétní kartu
  function tagCard(el, name) {
    if (!el) return;
    el.style.viewTransitionName = name;
  }
  function clearCard(el) {
    if (!el) return;
    el.style.viewTransitionName = '';
  }

  // Spusť přechod — cb je funkce co změní DOM
  function run(sourceEl, posterUrl, cb) {
    if (!SUPPORTS) { cb(); return; }

    // Tag source element
    if (sourceEl) tagCard(sourceEl, 'movie-poster');

    const transition = document.startViewTransition(() => {
      if (sourceEl) clearCard(sourceEl);
      cb();
    });

    transition.finished.catch(() => {});
    return transition;
  }

  // Skeleton loader — nahradí element za pulzující skeleton
  function skeleton(container, rows) {
    rows = rows || [
      { w: '100%', h: '220px', r: '16px', delay: 0 },
      { w: '60%',  h: '20px',  r: '8px',  delay: 0.1 },
      { w: '40%',  h: '14px',  r: '6px',  delay: 0.15 },
      { w: '100%', h: '80px',  r: '10px', delay: 0.2 },
      { w: '80%',  h: '12px',  r: '6px',  delay: 0.25 },
    ];
    if (!container) return;
    container.innerHTML = rows.map(r =>
      `<div class="sk-block" style="width:${r.w};height:${r.h};border-radius:${r.r};margin-bottom:12px;animation-delay:${r.delay}s;"></div>`
    ).join('');
  }

  // Detail skeleton — pro film/seriál modal
  function detailSkeleton(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="sk-block" style="width:100%;height:260px;border-radius:16px 16px 0 0;margin-bottom:0;animation-delay:0s;"></div>
      <div style="padding:20px 20px 0;">
        <div class="sk-block" style="width:55%;height:22px;border-radius:8px;margin-bottom:10px;animation-delay:0.08s;"></div>
        <div class="sk-block dark" style="width:35%;height:13px;border-radius:6px;margin-bottom:18px;animation-delay:0.13s;"></div>
        <div class="sk-block dark" style="width:100%;height:12px;border-radius:5px;margin-bottom:7px;animation-delay:0.17s;"></div>
        <div class="sk-block dark" style="width:90%;height:12px;border-radius:5px;margin-bottom:7px;animation-delay:0.20s;"></div>
        <div class="sk-block dark" style="width:70%;height:12px;border-radius:5px;margin-bottom:20px;animation-delay:0.22s;"></div>
        <div style="display:flex;gap:10px;">
          <div class="sk-block light" style="flex:1;height:44px;border-radius:12px;animation-delay:0.27s;"></div>
          <div class="sk-block" style="flex:1;height:44px;border-radius:12px;animation-delay:0.30s;"></div>
        </div>
      </div>`;
  }

  // Search skeleton — pro výsledky hledání
  function searchSkeleton(container, count) {
    count = count || 6;
    if (!container) return;
    container.innerHTML = Array.from({ length: count }, (_, i) =>
      `<div style="animation-delay:${i * 0.06}s;">
        <div class="sk-block" style="width:100%;aspect-ratio:2/3;border-radius:14px;margin-bottom:8px;animation-delay:${i*0.06}s;"></div>
        <div class="sk-block dark" style="width:75%;height:11px;border-radius:5px;margin-bottom:5px;animation-delay:${i*0.06+0.05}s;"></div>
        <div class="sk-block dark" style="width:45%;height:9px;border-radius:4px;animation-delay:${i*0.06+0.08}s;"></div>
      </div>`
    ).join('');
  }

  return { run, skeleton, detailSkeleton, searchSkeleton, SUPPORTS };
})();

// ── Patch showShSkeletons — nahraď prázdnou funkci skutečným skeletonem ──
window.showShSkeletons = function() {
  const grid = document.getElementById('searchResults');
  if (grid) MFTransition.searchSkeleton(grid, 8);
};

// ── Patch buildShCard — přidej View Transition na click ──
(function patchShCard() {
  const orig = window.buildShCard;
  // buildShCard je definována jako lokální fnc, takže hookujeme přes event delegation
  document.addEventListener('click', function(e) {
    const card = e.target.closest('.sh-card');
    if (!card) return;
    // Tag poster img pro VT
    const img = card.querySelector('img');
    if (img && document.startViewTransition) {
      img.style.viewTransitionName = 'movie-poster';
      // Clear po přechodu
      setTimeout(() => { img.style.viewTransitionName = ''; }, 600);
    }
  }, true); // capture phase — dříve než openShItem
})();

// ── Patch ps-tile click — VT pro hlavní tiles ──
document.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('click', function(e) {
    const wrapper = e.target.closest('.ps-tile-wrapper');
    if (!wrapper) return;
    const img = wrapper.querySelector('.tile-bg, img');
    if (img && document.startViewTransition) {
      img.style.viewTransitionName = 'movie-poster';
      setTimeout(() => { img.style.viewTransitionName = ''; }, 700);
    }
  }, true);
});



// ══════════════════════════════════════════════════════════
// 📺 JUSTWATCH AVAILABILITY ENGINE
// Zobrazí kde je film/seriál legálně dostupný (CZ)
// Používá TMDB watch providers endpoint (zdarma, bez API klíče pro JW)
// ══════════════════════════════════════════════════════════
window.JWAvail = (function() {
  const CACHE = {};
  const CACHE_TTL = 12 * 3600 * 1000; // 12h
  const TMDB_KEY = typeof window.TMDB_KEY !== 'undefined' ? window.TMDB_KEY : null;

  // Provider loga z TMDB
  const LOGO = path => `https://image.tmdb.org/t/p/original${path}`;

  // Barvy pro kategorie
  const CAT_STYLE = {
    flatrate: { label: 'Streaming', color: '#30d158', icon: '▶' },
    rent:     { label: 'Pronájem',  color: '#ff9f0a', icon: '🔑' },
    buy:      { label: 'Koupit',    color: '#007AFF', icon: '🛒' },
    free:     { label: 'Zdarma',    color: '#5ac8fa', icon: '✨' },
  };

  async function fetchProviders(tmdbId, type) {
    const key = `${type}_${tmdbId}`;
    const now = Date.now();

    // Cache check
    if (CACHE[key] && (now - CACHE[key].ts) < CACHE_TTL) return CACHE[key].data;

    // LocalStorage cache
    try {
      const stored = safeLS('mf_jw_' + key, 'null');
      if (stored && (now - stored.ts) < CACHE_TTL) {
        CACHE[key] = stored;
        return stored.data;
      }
    } catch(e) {}

    if (!TMDB_KEY) return null;

    try {
      const endpoint = type === 'movie'
        ? `https://api.themoviedb.org/3/movie/${tmdbId}/watch/providers?api_key=${TMDB_KEY}`
        : `https://api.themoviedb.org/3/tv/${tmdbId}/watch/providers?api_key=${TMDB_KEY}`;

      const r = await fetch(endpoint);
      if (!r.ok) return null;
      const d = await r.json();
      // Preferuj CZ, fallback na SK, DE
      const data = d.results?.CZ || d.results?.SK || d.results?.DE || null;
      const payload = { data, ts: now };
      CACHE[key] = payload;
      try { localStorage.setItem('mf_jw_' + key, JSON.stringify(payload)); } catch(e) {}
      return data;
    } catch(e) {
      return null;
    }
  }

  // Renderuj dostupnost do cílového elementu
  async function render(container, tmdbId, type) {
    if (!container || !tmdbId) return;

    // Skeleton placeholder
    container.innerHTML = `<div style="display:flex;gap:8px;align-items:center;opacity:0.35;">
      <div class="sk-block" style="width:28px;height:28px;border-radius:8px;"></div>
      <div class="sk-block" style="width:28px;height:28px;border-radius:8px;"></div>
      <div class="sk-block" style="width:28px;height:28px;border-radius:8px;"></div>
    </div>`;

    const data = await fetchProviders(tmdbId, type);

    if (!data) {
      container.innerHTML = '';
      return;
    }

    const cats = ['flatrate', 'rent', 'buy', 'free'];
    let sections = [];

    cats.forEach(cat => {
      if (!data[cat] || !data[cat].length) return;
      const providers = data[cat].slice(0, 4); // max 4 per kategorie
      const style = CAT_STYLE[cat];
      sections.push(`
        <div style="margin-bottom:10px;">
          <div style="font-size:0.55rem;font-weight:700;letter-spacing:0.5px;color:${style.color};margin-bottom:5px;text-transform:uppercase;">${style.icon} ${style.label}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${providers.map(p => `
              <div title="${p.provider_name}" style="width:30px;height:30px;border-radius:8px;overflow:hidden;border:1px solid rgba(255,255,255,0.12);flex-shrink:0;cursor:default;" >
                <img src="${LOGO(p.logo_path)}" alt="${p.provider_name}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
              </div>`).join('')}
          </div>
        </div>`);
    });

    if (sections.length === 0) {
      container.innerHTML = `<div style="font-size:0.62rem;color:rgba(255,255,255,0.25);padding:4px 0;">Není dostupné ve streaming službách v CZ</div>`;
      return;
    }

    container.innerHTML = `
      <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;margin-top:4px;">
        <div style="font-size:0.6rem;color:rgba(255,255,255,0.35);margin-bottom:8px;display:flex;align-items:center;gap:5px;">
          <span>Dostupné přes</span>
          <span style="opacity:0.4">·</span>
          <a href="https://www.justwatch.com/cz" target="_blank" rel="noopener" style="color:rgba(0,122,255,0.7);text-decoration:none;font-size:0.55rem;">JustWatch</a>
        </div>
        ${sections.join('')}
      </div>`;
  }

  // Inject do otevřeného modalu — hledá .jw-avail-slot
  function injectIntoModal(tmdbId, type) {
    // Zkus najít slot v aktivním modalu
    setTimeout(() => {
      const slot = document.querySelector('.jw-avail-slot');
      if (slot) render(slot, tmdbId, type);
    }, 200);
  }

  return { render, fetchProviders, injectIntoModal };
})();



// ══════════════════════════════════════════════════════════
// ⚙️ BEAUTIFUL SETTINGS UI
// Vizuální formuláře bez JSON kódu
// ══════════════════════════════════════════════════════════
window.MFSettings = (function() {

  function open() {
    if (document.getElementById('mfBeautifulSettings')) return;
    _build();
  }

  function _build() {
    // Načti uložené hodnoty
    let fbCfg = {};
    try { fbCfg = safeLS('mf_firebase_cfg', '{}'); } catch(e) {}
    const syncGroup = localStorage.getItem('mf_sync_group') || '';
    const tmdbKey = typeof window.TMDB_KEY !== 'undefined' ? window.TMDB_KEY : (localStorage.getItem('mf_tmdb_key') || '');

    const overlay = document.createElement('div');
    overlay.id = 'mfBeautifulSettings';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.75);backdrop-filter:blur(24px);display:flex;align-items:flex-end;justify-content:center;font-family:-apple-system,Inter,sans-serif;animation:mfSettFade 0.22s ease;';

    const sheet = document.createElement('div');
    sheet.style.cssText = 'background:rgba(18,18,26,0.98);border:1px solid rgba(255,255,255,0.1);border-radius:28px 28px 0 0;width:100%;max-width:480px;max-height:88vh;overflow-y:auto;padding:0 0 40px;box-shadow:0 -20px 60px rgba(0,0,0,0.6);animation:mfSettUp 0.38s cubic-bezier(0.34,1.1,0.64,1);';

    sheet.innerHTML = `
      <!-- Handle -->
      <div style="display:flex;justify-content:center;padding:12px 0 4px;">
        <div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.18);"></div>
      </div>

      <!-- Header -->
      <div style="padding:16px 24px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div style="font-size:1.15rem;font-weight:700;color:#fff;letter-spacing:-0.3px;">Nastavení</div>
            <div style="font-size:0.62rem;color:rgba(255,255,255,0.35);margin-top:2px;">MůjFlix konfigurace</div>
          </div>
          <button id="mfSetClose" style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>
        </div>
      </div>

      <!-- Section: TMDB -->
      <div style="padding:20px 24px 0;">
        <div style="font-size:0.55rem;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:12px;">🎬 Film databáze</div>
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px;margin-bottom:8px;">
          <label style="font-size:0.72rem;font-weight:600;color:rgba(255,255,255,0.7);display:block;margin-bottom:6px;">TMDB API klíč</label>
          <input id="mfSetTmdb" type="password" placeholder="Vložte váš TMDB API klíč…" value="${_esc(tmdbKey)}"
            style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:#fff;font-size:0.8rem;outline:none;box-sizing:border-box;font-family:inherit;">
          <div style="font-size:0.6rem;color:rgba(255,255,255,0.25);margin-top:6px;line-height:1.5;">
            Získej zdarma na <a href="https://www.themoviedb.org/settings/api" target="_blank" style="color:rgba(0,122,255,0.7);">themoviedb.org</a> → API → Klíč v3
          </div>
        </div>
      </div>

      <!-- Section: Sync -->
      <div style="padding:16px 24px 0;">
        <div style="font-size:0.55rem;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:12px;">☁️ Sync mezi zařízeními</div>

        <!-- Sync group key -->
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px;margin-bottom:8px;">
          <label style="font-size:0.72rem;font-weight:600;color:rgba(255,255,255,0.7);display:block;margin-bottom:6px;">Sync kód skupiny</label>
          <div style="display:flex;gap:8px;">
            <input id="mfSetSyncGrp" type="text" placeholder="Sdílený kód (stejný na všech zařízeních)" value="${_esc(syncGroup)}"
              style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:#fff;font-size:0.8rem;outline:none;font-family:monospace;box-sizing:border-box;">
            <button id="mfSetSyncGen" style="padding:10px 14px;border-radius:10px;background:rgba(0,122,255,0.12);border:1px solid rgba(0,122,255,0.25);color:rgba(0,122,255,0.9);font-size:0.72rem;cursor:pointer;white-space:nowrap;">🎲 Vygenerovat</button>
          </div>
          <div style="font-size:0.6rem;color:rgba(255,255,255,0.25);margin-top:6px;">Zadej stejný kód na všech svých zařízeních pro synchronizaci sledovanosti.</div>
        </div>

        <!-- Firebase accordion -->
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;margin-bottom:8px;">
          <button id="mfFbToggle" style="width:100%;padding:14px 16px;background:transparent;border:none;color:rgba(255,255,255,0.65);font-size:0.78rem;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:space-between;font-family:inherit;">
            <span>🔥 Firebase konfigurace <span style="font-size:0.6rem;font-weight:400;opacity:0.5;">(pokročilé)</span></span>
            <span id="mfFbChevron" style="transition:transform 0.2s;">▾</span>
          </button>
          <div id="mfFbFields" style="display:none;padding:0 16px 16px;border-top:1px solid rgba(255,255,255,0.06);">
            <div style="font-size:0.6rem;color:rgba(255,255,255,0.3);margin:10px 0 12px;line-height:1.5;">
              Firebase potřebuješ pro sync. Vytvořit zdarma na <a href="https://console.firebase.google.com" target="_blank" style="color:rgba(0,122,255,0.7);">console.firebase.google.com</a>
            </div>
            ${_fbField('mfFbApi','API klíč','apiKey',fbCfg,'text','AIzaSy…')}
            ${_fbField('mfFbAuth','Auth doména','authDomain',fbCfg,'text','mujflix.firebaseapp.com')}
            ${_fbField('mfFbDb','Database URL','databaseURL',fbCfg,'url','https://mujflix-default-rtdb.firebaseio.com')}
            ${_fbField('mfFbProj','Project ID','projectId',fbCfg,'text','mujflix-xxxxx')}
            ${_fbField('mfFbApp','App ID','appId',fbCfg,'text','1:123:web:abc')}
            <div id="mfFbStatus" style="font-size:0.65rem;margin-top:8px;color:rgba(255,255,255,0.3);"></div>
          </div>
        </div>
      </div>

      <!-- Section: AI -->
      <div style="padding:16px 24px 0;">
        <div style="font-size:0.55rem;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:12px;">🤖 AI asistent</div>
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px;margin-bottom:8px;">
          <label style="font-size:0.72rem;font-weight:600;color:rgba(255,255,255,0.7);display:block;margin-bottom:6px;">Anthropic API klíč</label>
          <input id="mfSetAnthro" type="password" placeholder="sk-ant-…" value="${_esc(localStorage.getItem('mf_anthropic_key')||'')}"
            style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:#fff;font-size:0.8rem;outline:none;box-sizing:border-box;font-family:monospace;">
          <div style="font-size:0.6rem;color:rgba(255,255,255,0.25);margin-top:6px;">Potřeba pro AI doporučení. Získej na <a href="https://console.anthropic.com" target="_blank" style="color:rgba(0,122,255,0.7);">console.anthropic.com</a></div>
        </div>

        <!-- AI Source stats -->
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px 14px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <span style="font-size:0.68rem;font-weight:600;color:rgba(255,255,255,0.5);">✦ AI Source statistiky</span>
            <button id="mfResetAiStats" style="font-size:0.6rem;background:transparent;border:none;color:rgba(255,100,100,0.6);cursor:pointer;padding:2px 6px;">Reset</button>
          </div>
          <div id="mfAiStatsGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;"></div>
        </div>
      </div>

      <!-- Save button -->
      <div style="padding:24px 24px 0;">
        <button id="mfSetSave" style="width:100%;padding:16px;border-radius:16px;background:linear-gradient(135deg,#007AFF,#5ac8fa);border:none;color:#fff;font-size:0.9rem;font-weight:700;cursor:pointer;letter-spacing:-0.2px;">Uložit nastavení</button>
      </div>
    `;

    overlay.appendChild(sheet);
    document.body.appendChild(overlay);
    _injectStyle();
    _bindEvents(overlay, fbCfg);
    _renderAiStats();
  }

  function _fbField(id, label, key, cfg, type, ph) {
    return `<div style="margin-bottom:10px;">
      <label style="font-size:0.65rem;color:rgba(255,255,255,0.45);display:block;margin-bottom:4px;">${label}</label>
      <input id="${id}" type="${type||'text'}" placeholder="${ph||''}" value="${_esc(cfg[key]||'')}"
        style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);border-radius:9px;padding:9px 11px;color:#fff;font-size:0.75rem;outline:none;box-sizing:border-box;font-family:monospace;">
    </div>`;
  }

  function _esc(s) {
    return (s||'').replace(/"/g,'&quot;').replace(/</g,'&lt;');
  }

  function _renderAiStats() {
    const grid = document.getElementById('mfAiStatsGrid');
    if (!grid || !window.CinAI || typeof CINEMA_SOURCES === 'undefined') return;
    const stats = CinAI.loadStats();
    grid.innerHTML = CINEMA_SOURCES.map(src => {
      const score = CinAI.getScore(stats[src.id]);
      const s = stats[src.id];
      const dot = score >= 70 ? '#30d158' : score >= 40 ? '#ff9f0a' : s ? '#ff453a' : 'rgba(255,255,255,0.2)';
      const tries = s ? s.tries : 0;
      return `<div style="display:flex;align-items:center;gap:7px;padding:5px 8px;background:rgba(255,255,255,0.03);border-radius:8px;">
        <div style="width:7px;height:7px;border-radius:50%;background:${dot};flex-shrink:0;"></div>
        <div>
          <div style="font-size:0.62rem;color:rgba(255,255,255,0.65);font-weight:600;">${src.label}</div>
          <div style="font-size:0.5rem;color:rgba(255,255,255,0.3);">${tries ? score+'% ('+tries+'×)' : 'Neotestováno'}</div>
        </div>
      </div>`;
    }).join('');
  }

  function _bindEvents(overlay, fbCfg) {
    // Close
    overlay.querySelector('#mfSetClose').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    // Firebase accordion
    overlay.querySelector('#mfFbToggle').onclick = () => {
      const fields = overlay.querySelector('#mfFbFields');
      const chev = overlay.querySelector('#mfFbChevron');
      const open = fields.style.display === 'none';
      fields.style.display = open ? 'block' : 'none';
      chev.style.transform = open ? 'rotate(180deg)' : '';
    };

    // Generate sync group key
    overlay.querySelector('#mfSetSyncGen').onclick = () => {
      const key = Math.random().toString(36).slice(2,8).toUpperCase() + '-' + Math.random().toString(36).slice(2,8).toUpperCase();
      overlay.querySelector('#mfSetSyncGrp').value = key;
    };

    // Reset AI stats
    overlay.querySelector('#mfResetAiStats').onclick = () => {
      if (window.CinAI) { CinAI.resetStats(); _renderAiStats(); if(typeof showToast==='function') showToast('AI statistiky vynulovány'); }
    };

    // Focus highlight on inputs
    overlay.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('focus', () => inp.style.borderColor = 'rgba(0,122,255,0.45)');
      inp.addEventListener('blur',  () => inp.style.borderColor = 'rgba(255,255,255,0.09)');
    });

    // Save
    overlay.querySelector('#mfSetSave').onclick = () => {
      // TMDB
      const tmdb = overlay.querySelector('#mfSetTmdb').value.trim();
      if (tmdb) localStorage.setItem('mf_tmdb_key', tmdb);

      // Sync group
      const grp = overlay.querySelector('#mfSetSyncGrp').value.trim();
      if (grp) {
        localStorage.setItem('mf_sync_group', grp);
        if (window.MFSync && MFSync._db) MFSync.connectGroup(grp);
      }

      // Firebase config
      const newFb = {
        apiKey:            overlay.querySelector('#mfFbApi')?.value.trim()   || fbCfg.apiKey   || '',
        authDomain:        overlay.querySelector('#mfFbAuth')?.value.trim()  || fbCfg.authDomain || '',
        databaseURL:       overlay.querySelector('#mfFbDb')?.value.trim()   || fbCfg.databaseURL || '',
        projectId:         overlay.querySelector('#mfFbProj')?.value.trim() || fbCfg.projectId || '',
        appId:             overlay.querySelector('#mfFbApp')?.value.trim()  || fbCfg.appId     || '',
        storageBucket:     fbCfg.storageBucket     || '',
        messagingSenderId: fbCfg.messagingSenderId || '',
      };
      const hasFirebase = newFb.apiKey && newFb.databaseURL;
      if (hasFirebase) localStorage.setItem('mf_firebase_cfg', JSON.stringify(newFb));

      // Anthropic key
      const anthro = overlay.querySelector('#mfSetAnthro').value.trim();
      if (anthro) localStorage.setItem('mf_anthropic_key', anthro);

      overlay.remove();
      if (typeof showToast === 'function') showToast('✅ Nastavení uloženo!', 'success');
    };
  }

  function _injectStyle() {
    if (document.getElementById('mfSettStyle')) return;
    const s = document.createElement('style');
    s.id = 'mfSettStyle';
    s.textContent = `
      @keyframes mfSettFade { from{opacity:0} to{opacity:1} }
      @keyframes mfSettUp { from{transform:translateY(40px);opacity:0} to{transform:none;opacity:1} }
      #mfBeautifulSettings input::placeholder { color:rgba(255,255,255,0.2); }
      #mfBeautifulSettings *::-webkit-scrollbar { width:3px; }
      #mfBeautifulSettings *::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12);border-radius:3px; }
    `;
    document.head.appendChild(s);
  }

  return { open };
})();

// ── Hook: přesměruj stávající otevření settings na nový UI ──
(function() {
  const origOpen = window.openSettings;
  window.openSettings = function() {
    MFSettings.open();
  };
  // Taky hook openApikeyOverlay pokud existuje
  const origApikey = window.openApikeyOverlay;
  window.openApikeyOverlay = function() {
    MFSettings.open();
  };
})();



// ═══════════════════════════════════════════════════════
// 🎬 CINEMA ENGINE v2
// ═══════════════════════════════════════════════════════

function _czSlug(t) {
  if (!t) return '';
  return t.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g,'and')
    .replace(/'/g,'').replace(/:/g,'').replace(/\./g,'')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'');
}

// Vrátí varianty slugů pro svetserialu.to (od nejpravděpodobnější)
function _svetSerialuSlugVariants(slug, title) {
  // Pokud title obsahuje jen non-latinské znaky (čínština, japončina, korejština...),
  // _czSlug vrátí prázdný string. V tom případě použij slug (DB klíč) jako fallback.
  const czSlugResult = _czSlug(title || '');
  const base = String(slug || czSlugResult || '');
  const variants = [base];
  if (base.startsWith('the-')) variants.push(base.slice(4));
  if (!base.startsWith('the-') && title && title.toLowerCase().startsWith('the ')) variants.push('the-' + base);
  const noYear = base.replace(/-\d{4}$/, '');
  if (noYear !== base) variants.push(noYear);
  return [...new Set(variants)];
}

// Vrátí varianty URL pro bombuj.si filmy
function _bombujMovieUrlVariants(title, year) {
  const slug = _czSlug(title);
  // Pokud je slug prázdný (non-latinský název), vrať search URL jako fallback
  if (!slug) return [`https://www.bombuj.si/?s=${encodeURIComponent(title || '')}`];
  const yr = year || new Date().getFullYear();
  return [
    `https://www.bombuj.si/online-film-${slug}`,
    `https://www.bombuj.si/online-film-${slug}-${yr}`,
    `https://www.bombuj.si/online-film-${slug}-${yr - 1}`,
    `https://www.bombuj.si/online-film-${slug}-${yr - 2}`,
  ];
}

const CINEMA_SOURCES = [
  { id: 'svetserialu', label: 'SvetSerialu', popupOnly: true,
    movie: (id, t) => `https://svetserialu.to/?s=${encodeURIComponent(t || '')}`,
    tv: (id, s, e, t, slug) => {
      const siteSlug = _svetSerialuSlugVariants(slug, t)[0];
      // Pokud je slug prázdný (non-latinský titul bez DB klíče), použij search
      if (!siteSlug) return `https://svetserialu.to/?s=${encodeURIComponent(t || '')}`;
      return `https://svetserialu.to/serial/${siteSlug}/s${String(s).padStart(2,'0')}e${String(e).padStart(2,'0')}`;
    },
    tvVariants: (id, s, e, t, slug) => {
      return _svetSerialuSlugVariants(slug, t).map(sv =>
        `https://svetserialu.to/serial/${sv}/s${String(s).padStart(2,'0')}e${String(e).padStart(2,'0')}`
      );
    }
  },
  { id: 'bombuj', label: 'Bombuj', popupOnly: true,
    movie: (id, t, yr) => _bombujMovieUrlVariants(t, yr)[0],
    movieVariants: (id, t, yr) => _bombujMovieUrlVariants(t, yr),
    tv: (id, s, e, t) => {
      const slug = _czSlug(t);
      if (!slug) return `https://serialy.bombuj.si/?s=${encodeURIComponent(t || '')}`;
      return `https://serialy.bombuj.si/serial/${slug}-${s}x${String(e).padStart(2,'0')}`;
    },
    tvVariants: (id, s, e, t) => {
      const slug = _czSlug(t);
      if (!slug) return [`https://serialy.bombuj.si/?s=${encodeURIComponent(t || '')}`];
      return [
        `https://serialy.bombuj.si/serial/${slug}-${s}x${String(e).padStart(2,'0')}`,
        `https://serialy.bombuj.si/serial/${slug}-${s}x${e}`,
        `https://www.bombuj.si/serial/${slug}/s${String(s).padStart(2,'0')}e${String(e).padStart(2,'0')}`,
      ];
    }
  },
];

let _cinState = { tmdbId: null, type: 'movie', title: '', season: 1, ep: 1, sourceIdx: 0, totalSeasons: 1, totalEps: {}, year: null };

function openMovieInCinema(tmdbId, title, type) {
    type = type || 'movie';

    // Parsuj "id/season/ep" formát pro tv_ep
    let season = 1, ep = 1, cleanId = tmdbId;
    if (type === 'tv_ep' && String(tmdbId).includes('/')) {
        const parts = String(tmdbId).split('/');
        cleanId = parts[0];
        season  = parseInt(parts[1]) || 1;
        ep      = parseInt(parts[2]) || 1;
        type    = 'tv';
    }

    // Odstraň "— S01E02" suffix z názvu pokud tam je
    const cleanTitle = (title || '').replace(/\s*[—–-]+\s*S\d+E\d+.*/i, '').trim();

    _cinState = { tmdbId: cleanId, type, title: cleanTitle, season, ep, sourceIdx: (type === 'movie' ? 1 : 0), totalSeasons: 1, totalEps: {}, year: (window._cinYear || null), siteSlug: (window._cinSiteSlug || null) };
    window._cinSiteSlug = null; // spotřebuj a resetuj
    window._cinYear = null; // spotřebuj a resetuj

    document.getElementById('cinemaTitle').textContent = cleanTitle || 'Přehrávám…';
    document.getElementById('cinemaSubtitle').textContent = type === 'tv' ? `S${String(season).padStart(2,'0')}E${String(ep).padStart(2,'0')}` : '';
    const cinModal = document.getElementById('cinemaModal');
    cinModal.style.display = 'flex';
    cinModal.style.opacity = '1';
    document.body.style.overflow = 'hidden';

    _cinBuildSourceBar();
    _cinLoadEpPicker();

    const TMDB_KEY_CIN = typeof TMDB_KEY !== 'undefined' ? TMDB_KEY : (localStorage.getItem('mf_tmdb_key')||'');

    const doLoad = () => {
      if (window.CinAI) {
        const aiBar = document.getElementById('cinemaSourceBar');
        if (aiBar) CinAI.renderAIBadge(aiBar);
        CinAI.findBestSource(CINEMA_SOURCES, cleanId, type==='tv'?'tv':'movie', season, ep)
          .then(bestIdx => { if (bestIdx !== _cinState.sourceIdx) { _cinState.sourceIdx = bestIdx; _cinBuildSourceBar(); } _cinLoad(); })
          .catch(() => _cinLoad());
      } else {
        _cinLoad();
      }
    };

    if (type === 'movie' && cleanId && TMDB_KEY_CIN) {
      // Film → Bombuj potřebuje ČESKÝ název a rok
      // Nejdřív zkus cs-CZ, pak translations pro CZ override
      fetch(`https://api.themoviedb.org/3/movie/${cleanId}?api_key=${TMDB_KEY_CIN}&language=cs-CZ`)
        .then(r => r.json())
        .then(async d => {
          const ds = d.release_date||'';
          if (ds) _cinState.year = parseInt(ds.substring(0,4))||null;
          // Zkus czech translation
          let czTitle = d.title || '';
          // Pokud je název stále nečeský (obsahuje non-latin nebo je stejný jako original),
          // zkus translations endpoint
          try {
            const tr = await fetch(`https://api.themoviedb.org/3/movie/${cleanId}/translations?api_key=${TMDB_KEY_CIN}`).then(r=>r.json());
            const cz = (tr.translations||[]).find(t=>t.iso_3166_1==='CZ'||t.iso_639_1==='cs');
            if (cz && cz.data && cz.data.title) czTitle = cz.data.title;
          } catch(e) {}
          if (czTitle) _cinState.title = czTitle.replace(/\s*[—–-]+\s*S\d+E\d+.*/i, '').trim();
        })
        .catch(() => {})
        .finally(() => doLoad());
    } else {
      // TV → načti český název + rok, pak doLoad
      if (cleanId && TMDB_KEY_CIN) {
        fetch(`https://api.themoviedb.org/3/tv/${cleanId}?api_key=${TMDB_KEY_CIN}&language=cs-CZ`)
          .then(r => r.json())
          .then(async d => {
            const ds = d.first_air_date || '';
            if (ds) _cinState.year = parseInt(ds.substring(0,4)) || null;
            let czName = d.name || '';
            // Zkus translations pro cs override
            try {
              const tr = await fetch(`https://api.themoviedb.org/3/tv/${cleanId}/translations?api_key=${TMDB_KEY_CIN}`).then(r=>r.json());
              const cz = (tr.translations||[]).find(t=>t.iso_3166_1==='CZ'||t.iso_639_1==='cs');
              if (cz && cz.data && cz.data.name) czName = cz.data.name;
            } catch(e) {}
            if (czName) _cinState.title = czName.replace(/\s*[—–-]+\s*S\d+E\d+.*/i, '').trim();
          })
          .catch(() => {})
          .finally(() => doLoad());
      } else {
        doLoad();
      }
    }
}

function _cinLoad() {
    const s = _cinState;
    const src = CINEMA_SOURCES[s.sourceIdx];
    const url = s.type === 'movie'
      ? src.movie(s.tmdbId, s.title, s.year)
      : src.tv(s.tmdbId, s.season, s.ep, s.title, s.siteSlug || null);

    // Debug: zobraz URL v konzoli
    window.MF_DEBUG && console.log(`[Cinema] URL: ${url} | title: "${s.title}" | year: ${s.year}`);

    const warn = document.getElementById('cinemaFileWarn');
    if (warn) warn.style.display = 'none';

    const loader = document.getElementById('cinemaLoader');
    if (loader) loader.style.display = 'none';

    if (src.popupOnly) {
        requestAnimationFrame(() => _cinShowPlayButton(url, src.label));
    } else {
        requestAnimationFrame(() => _cinShowEmbedPlayer(url));
    }
}

function _cinShowPlayButton(url, srcLabel) {
    const container = document.getElementById('cinemaFrameWrap');
    if (!container) return;
    container.innerHTML = '';
    // Odstraň staré extra buttony z top baru
    document.querySelectorAll('.cin-extra-btn').forEach(b => b.remove());

    const s = _cinState;
    try {
    const curEps = s.totalEps[s.season] || 0;
    const hasNext = s.type === 'tv' && (s.ep < curEps || s.season < s.totalSeasons);
    const nextSe  = hasNext ? (s.ep < curEps ? s.season : s.season + 1) : null;
    const nextEp  = hasNext ? (s.ep < curEps ? s.ep + 1 : 1) : null;
    const nextUrl = hasNext ? CINEMA_SOURCES[s.sourceIdx].tv(s.tmdbId, nextSe, nextEp, s.title, s.siteSlug || null) : null;

    // Nastav "Další epizoda" overlay button
    if (hasNext && nextUrl) {
      const overlay = document.getElementById('cinNextEpOverlay');
      const titleEl = document.getElementById('cinNextEpTitle');
      const btn     = document.getElementById('cinNextEpBtn');
      if (overlay && titleEl && btn) {
        titleEl.textContent = `${s.title} — S${String(nextSe).padStart(2,'0')}E${String(nextEp).padStart(2,'0')}`;
        btn.onclick = () => {
          overlay.style.display = 'none';
          _cinState.season = nextSe; _cinState.ep = nextEp;
          document.getElementById('cinemaSubtitle').textContent = `S${String(nextSe).padStart(2,'0')}E${String(nextEp).padStart(2,'0')}`;
          const e = document.getElementById('cinemaEpSel'); if (e) e.value = String(nextEp);
          const se = document.getElementById('cinemaSeasonSel'); if (se) se.value = String(nextSe);
          _cinLoad();
        };
      }
    }

    // Vlož "Další epizoda" button do top baru (bez play — ten je v placeholderu)
    const q = encodeURIComponent(s.title||'');
    const src = CINEMA_SOURCES[s.sourceIdx];
    const searchUrl = src.id==='svetserialu' ? `https://svetserialu.to/?s=${q}`
      : s.type==='movie' ? `https://www.bombuj.si/?s=${q}` : `https://serialy.bombuj.si/?s=${q}`;

    const btnWrap = document.createElement('div');
    btnWrap.className = 'cin-extra-btn';
    btnWrap.style.cssText = 'display:flex;align-items:center;gap:5px;';

    if (hasNext && nextUrl) {
      const btnNext = document.createElement('button');
      btnNext.innerHTML = `⏭ S${String(nextSe).padStart(2,'0')}E${String(nextEp).padStart(2,'0')}`;
      btnNext.style.cssText = 'padding:5px 12px;border-radius:18px;background:rgba(0,122,255,0.18);border:1px solid rgba(0,122,255,0.35);color:rgba(0,122,255,0.9);font-size:0.72rem;font-weight:700;cursor:pointer;white-space:nowrap;';
      btnNext.onclick = () => { _cinState.season=nextSe; _cinState.ep=nextEp; document.getElementById('cinemaSubtitle').textContent=`S${String(nextSe).padStart(2,'0')}E${String(nextEp).padStart(2,'0')}`; const e=document.getElementById('cinemaEpSel'); if(e) e.value=String(nextEp); const se=document.getElementById('cinemaSeasonSel'); if(se) se.value=String(nextSe); _cinLoad(); };
      btnWrap.appendChild(btnNext);
    }

    const btnSearch = document.createElement('a');
    btnSearch.textContent = '🔍';
    btnSearch.href = searchUrl; btnSearch.target = '_blank'; btnSearch.rel = 'noopener';
    btnSearch.style.cssText = 'padding:5px 10px;border-radius:18px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.4);font-size:0.72rem;text-decoration:none;';
    btnWrap.appendChild(btnSearch);

    const closeBtn = document.querySelector('#cinemaTopBar button[onclick*="closeCinema"]');
    if (closeBtn) closeBtn.parentNode.insertBefore(btnWrap, closeBtn);
    else document.getElementById('cinemaTopBar')?.appendChild(btnWrap);

    // Zobraz placeholder s TMDB backdrop pozadím
    const tmdbKeyP = typeof TMDB_KEY !== 'undefined' ? TMDB_KEY : (localStorage.getItem('mf_tmdb_key')||'');
    const backdropEndpoint = s.type === 'tv'
      ? `https://api.themoviedb.org/3/tv/${s.tmdbId}?api_key=${tmdbKeyP}&language=cs`
      : `https://api.themoviedb.org/3/movie/${s.tmdbId}?api_key=${tmdbKeyP}&language=cs`;

    // Nejdřív vykreslíme placeholder bez backdrop, pak ho doplníme
    const renderPlaceholder = (backdropUrl) => {
      const bgStyle = backdropUrl
        ? `background:url('${backdropUrl}') center/cover no-repeat;`
        : `background:linear-gradient(135deg,#0a0a14 0%,#111122 100%);`;

      container.innerHTML = `
        <div style="position:absolute;inset:0;${bgStyle}">
          <!-- Tmavý overlay přes backdrop -->
          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.55) 50%,rgba(0,0,0,0.4) 100%);"></div>
          <!-- Blur vrstva pro glass efekt -->
          <div style="position:absolute;inset:0;backdrop-filter:blur(2px);"></div>

          <!-- Obsah uprostřed — tmavý glass panel garantuje čitelnost vždy -->
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:-apple-system,'SF Pro Display',Inter,sans-serif;">

            <!-- Glass panel — izoluje texty od pozadí -->
            <div style="background:rgba(0,0,0,0.62);backdrop-filter:blur(28px) saturate(1.3);border:1px solid rgba(255,255,255,0.1);border-radius:28px;padding:40px 52px;display:flex;flex-direction:column;align-items:center;gap:20px;box-shadow:0 32px 96px rgba(0,0,0,0.8),inset 0 1px 0 rgba(255,255,255,0.06);min-width:300px;max-width:460px;">

              <!-- Název + epizoda -->
              <div style="text-align:center;">
                <div style="font-size:1.65rem;font-weight:800;color:#fff;letter-spacing:-0.5px;line-height:1.2;">${s.title||''}</div>
                ${s.type==='tv'?`<div style="font-size:0.82rem;color:rgba(255,255,255,0.6);margin-top:8px;letter-spacing:2px;font-weight:600;">S${String(s.season).padStart(2,'0')} · E${String(s.ep).padStart(2,'0')}</div>`:''}
              </div>

              <!-- Hlavní play tlačítko -->
              <button onclick="(function(){const pw=screen.width,ph=screen.height,pop=window.open('${url.replace(/'/g,"\\'")}','MujFlixCinema','width='+pw+',height='+ph+',left=0,top=0,menubar=no,toolbar=no,location=no,scrollbars=yes');if(!pop||pop.closed)window.open('${url.replace(/'/g,"\\'")}','_blank','noopener');})()"
                style="padding:18px 52px;border-radius:60px;background:linear-gradient(135deg,rgba(48,209,88,0.97),rgba(37,162,68,1));border:none;color:#fff;font-size:1.1rem;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:12px;box-shadow:0 10px 40px rgba(48,209,88,0.45),inset 0 1px 0 rgba(255,255,255,0.25);transition:all 0.2s;letter-spacing:-0.2px;"
                onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 16px 52px rgba(48,209,88,0.6),inset 0 1px 0 rgba(255,255,255,0.25)'"
                onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 10px 40px rgba(48,209,88,0.45),inset 0 1px 0 rgba(255,255,255,0.25)'">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Přehrát
              </button>

              <!-- Zdroj label — vždy čitelný na tmavém panelu -->
              <div style="font-size:0.68rem;color:rgba(255,255,255,0.55);letter-spacing:2px;text-transform:uppercase;font-weight:600;">${srcLabel}</div>

              ${hasNext && nextUrl ? `
              <!-- Další epizoda -->
              <button onclick="(function(){_cinState.season=${nextSe};_cinState.ep=${nextEp};document.getElementById('cinemaSubtitle').textContent='S${String(nextSe).padStart(2,'0')}E${String(nextEp).padStart(2,'0')}';const e=document.getElementById('cinemaEpSel');if(e)e.value='${nextEp}';const se=document.getElementById('cinemaSeasonSel');if(se)se.value='${nextSe}';_cinLoad();})()"
                style="display:flex;align-items:center;gap:9px;padding:11px 26px;border-radius:40px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.16);color:rgba(255,255,255,0.8);font-size:0.82rem;font-weight:600;cursor:pointer;font-family:-apple-system,Inter,sans-serif;transition:all 0.18s;letter-spacing:-0.1px;"
                onmouseover="this.style.background='rgba(255,255,255,0.16)';this.style.color='#fff'"
                onmouseout="this.style.background='rgba(255,255,255,0.08)';this.style.color='rgba(255,255,255,0.8)'">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="5 3 15 12 5 21 5 3" fill="currentColor" stroke="none"/>
                  <line x1="19" y1="3" x2="19" y2="21"/>
                </svg>
                Další epizoda · S${String(nextSe).padStart(2,'0')}E${String(nextEp).padStart(2,'0')}
              </button>` : ''}

              <!-- Hledat na webu — vždy viditelné na glass panelu -->
              <a href="${searchUrl}" target="_blank" rel="noopener"
                style="font-size:0.68rem;color:rgba(255,255,255,0.4);text-decoration:none;display:flex;align-items:center;gap:6px;transition:color 0.15s;font-weight:500;"
                onmouseover="this.style.color='rgba(255,255,255,0.8)'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                Nenašlo se? Hledat na webu
              </a>

            </div><!-- /glass panel -->
          </div>
        </div>
      `;
    };

    // Nejdřív bez backdrop, pak doplníme
    renderPlaceholder(null);

    if (s.tmdbId && tmdbKeyP) {
      fetch(backdropEndpoint)
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (!d) return;
          const bp = d.backdrop_path;
          if (bp) {
            const bdUrl = `https://image.tmdb.org/t/p/w1280${bp}`;
            // Preload + vykresli
            const img = new Image();
            img.onload = () => renderPlaceholder(bdUrl);
            img.src = bdUrl;
          }
        })
        .catch(() => {});
    }
  } catch(e) { console.warn('[Cinema] _cinShowPlayButton error:', e); }
}

function _cinShowEmbedPlayer(url) {
    const container = document.getElementById('cinemaFrameWrap');
    if (!container) return;
    container.innerHTML = '';

    const s = _cinState;
    const srcName = CINEMA_SOURCES[s.sourceIdx].label;
    const epLabel = s.type === 'tv'
        ? `S${String(s.season).padStart(2,'0')}E${String(s.ep).padStart(2,'0')} · ${srcName}`
        : srcName;

    // Wrapper — horní část: launcher, spodní část: pokus o embed
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;';

    // ── IFRAME (horní ~65%) ──────────────────────────────────
    const iframeWrap = document.createElement('div');
    iframeWrap.style.cssText = 'flex:1;position:relative;background:#000;';

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;';
    iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
    iframe.setAttribute('referrerpolicy', 'no-referrer');
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-top-navigation');

    // Overlay zpráva pokud iframe zablokován
    const blockMsg = document.createElement('div');
    blockMsg.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:rgba(0,0,0,0.9);pointer-events:none;z-index:2;transition:opacity 0.5s;';
    blockMsg.innerHTML = `
      <div style="font-size:2.2rem;">🎬</div>
      <div style="color:rgba(255,255,255,0.6);font-size:0.8rem;font-family:Inter,sans-serif;text-align:center;padding:0 24px;line-height:1.7;max-width:340px;">
        Načítám přehrávač…
        <br><span style="color:rgba(255,255,255,0.3);font-size:0.65rem;">Pokud zůstane prázdné, zkus jiný zdroj níže nebo otevři v nové kartě</span>
      </div>`;

    // Timeout — pokud se iframe nenačte za 8s, zobraz varování
    let _cinLoadTimer = setTimeout(() => {
        if (blockMsg.style.display === 'none') return;
        blockMsg.innerHTML = `
          <div style="font-size:2rem;">⚠️</div>
          <div style="color:rgba(255,255,255,0.65);font-size:0.8rem;font-family:Inter,sans-serif;text-align:center;padding:0 24px;line-height:1.7;max-width:360px;">
            Zdroj <strong>${srcName}</strong> nereaguje nebo blokuje přehrávání.
            <br><span style="color:rgba(255,255,255,0.35);font-size:0.65rem;">Zkus přepnout zdroj v liště nahoře, nebo použij tlačítka níže.</span>
          </div>`;
        blockMsg.style.pointerEvents = 'none';
    }, 8000);

    iframe.onload = () => {
        clearTimeout(_cinLoadTimer);
        blockMsg.style.opacity = '0';
        setTimeout(() => { blockMsg.style.display = 'none'; }, 500);
    };

    // 🤖 AI monitoring — zaznamenej spolehlivost zdroje
    if (window.CinAI) {
        const currentSrcId = CINEMA_SOURCES[_cinState.sourceIdx].id;
        CinAI.monitorIframe(iframe, currentSrcId);
    }

    iframeWrap.appendChild(iframe);
    iframeWrap.appendChild(blockMsg);

    // ── LAUNCHER BAR (spodní pruh) ───────────────────────────
    const bar = document.createElement('div');
    bar.style.cssText = 'flex-shrink:0;background:rgba(10,10,16,0.97);border-top:1px solid rgba(255,255,255,0.07);padding:12px 16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;';

    const info = document.createElement('div');
    info.style.cssText = 'flex:1;min-width:0;';
    info.innerHTML = `<div style="color:#fff;font-family:Inter,sans-serif;font-size:0.8rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.title || ''}</div>
      <div style="color:rgba(255,255,255,0.35);font-family:Inter,sans-serif;font-size:0.62rem;">${epLabel} · Pokud neběží, otevři v záložce</div>`;

    const btnNewTab = document.createElement('button');
    btnNewTab.innerHTML = '🔗 Nová karta';
    btnNewTab.style.cssText = 'padding:9px 16px;border-radius:10px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:#fff;font-size:0.75rem;font-weight:600;cursor:pointer;font-family:Inter,sans-serif;white-space:nowrap;flex-shrink:0;';
    btnNewTab.onclick = () => window.open(url, '_blank', 'noopener');

    const btnPopup = document.createElement('button');
    btnPopup.innerHTML = '▶ Popup okno';
    btnPopup.style.cssText = 'padding:9px 16px;border-radius:10px;background:linear-gradient(135deg,#007AFF,#5ac8fa);border:none;color:#fff;font-size:0.75rem;font-weight:700;cursor:pointer;font-family:Inter,sans-serif;white-space:nowrap;flex-shrink:0;';
    btnPopup.onclick = () => {
        const pw = window.screen.width, ph = window.screen.height;
        const popup = window.open(url, 'MujFlixCinema', `width=${pw},height=${ph},left=0,top=0,menubar=no,toolbar=no,location=no,scrollbars=no`);
        if (!popup || popup.closed) window.open(url, '_blank', 'noopener');
    };

    bar.appendChild(info);
    bar.appendChild(btnNewTab);
    bar.appendChild(btnPopup);

    wrap.appendChild(iframeWrap);
    wrap.appendChild(bar);
    container.appendChild(wrap);
}

function _cinShowLauncher(url) {
    const container = document.getElementById('cinemaFrameWrap');
    if (!container) { console.warn('[Cinema] cinemaFrameWrap not found'); return; }
    container.innerHTML = '';

    const s = _cinState;
    const srcName = CINEMA_SOURCES[s.sourceIdx].label;
    const epLabel = s.type === 'tv'
        ? `S${String(s.season).padStart(2,'0')}E${String(s.ep).padStart(2,'0')} · ${srcName}`
        : srcName;

    // Sestav UI čistě přes DOM — žádný innerHTML s event handlery
    const panel = document.createElement('div');
    panel.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;font-family:Inter,sans-serif;padding:20px;text-align:center;';

    const icon = document.createElement('div');
    icon.textContent = '🎬';
    icon.style.fontSize = '3rem';

    const title = document.createElement('div');
    title.textContent = s.title || 'Přehrávám…';
    title.style.cssText = 'font-size:1.1rem;font-weight:700;color:#fff;';

    const sub = document.createElement('div');
    sub.textContent = epLabel;
    sub.style.cssText = 'font-size:0.75rem;color:rgba(255,255,255,0.4);';

    const btnWrap = document.createElement('div');
    btnWrap.style.cssText = 'display:flex;flex-direction:column;gap:10px;width:100%;max-width:320px;margin-top:8px;';

    // Hlavní tlačítko — Popup kino
    const btnPopup = document.createElement('button');
    btnPopup.style.cssText = 'padding:16px 24px;border-radius:16px;background:linear-gradient(135deg,#007AFF,#5ac8fa);border:none;color:#fff;font-size:0.95rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 8px 24px rgba(0,122,255,0.35);';
    btnPopup.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg> Spustit kino';
    btnPopup.addEventListener('click', function() {
        const w = window.screen.width, h = window.screen.height;
        const popup = window.open(url, 'MujFlixCinema',
            'width=' + w + ',height=' + h + ',left=0,top=0,menubar=no,toolbar=no,location=no,status=no,scrollbars=no');
        if (!popup || popup.closed) window.open(url, '_blank', 'noopener');
    });

    const hint = document.createElement('div');
    hint.textContent = 'Přehrávač se otevře v novém okně. Pokud prohlížeč blokuje popup, klikni na ikonu v adresním řádku a povol.';
    hint.style.cssText = 'font-size:0.62rem;color:rgba(255,255,255,0.22);line-height:1.5;';

    // Záložní tlačítko — nová karta
    const btnTab = document.createElement('button');
    btnTab.textContent = '🔗 Otevřít v nové kartě';
    btnTab.style.cssText = 'padding:12px;border-radius:12px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.55);font-size:0.8rem;cursor:pointer;';
    btnTab.addEventListener('click', function() { window.open(url, '_blank', 'noopener'); });

    btnWrap.appendChild(btnPopup);
    btnWrap.appendChild(hint);
    btnWrap.appendChild(btnTab);
    panel.appendChild(icon);
    panel.appendChild(title);
    panel.appendChild(sub);
    panel.appendChild(btnWrap);
    container.appendChild(panel);
}

function _cinShowFileWarning(url) {
    let warn = document.getElementById('cinemaFileWarn');
    if (!warn) {
        warn = document.createElement('div');
        warn.id = 'cinemaFileWarn';
        warn.style.cssText = 'position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;';
        document.getElementById('cinemaModal').appendChild(warn);
    }
    warn.style.display = 'flex';
    warn.innerHTML = `
      <div style="background:rgba(28,28,30,0.97);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:32px 28px;max-width:420px;width:100%;text-align:center;font-family:Inter,sans-serif;">
        <div style="font-size:2.5rem;margin-bottom:12px;">🔒</div>
        <div style="font-size:1rem;font-weight:700;color:#fff;margin-bottom:8px;">Chrome blokuje přehrávač</div>
        <div style="font-size:0.75rem;color:rgba(255,255,255,0.45);line-height:1.6;margin-bottom:24px;">
          Soubor je otevřen přes <code style="background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;">file://</code> protokol.<br>
          Chrome z bezpečnostních důvodů blokuje video iframy.<br><br>
          <strong style="color:rgba(255,255,255,0.7);">Řešení:</strong> Otevři MůjFlix přes lokální server.
        </div>

        <!-- Možnost 1: Otevřít přímo zdroj -->
        <button onclick="window.open('${url}','_blank','noopener')" style="width:100%;padding:14px;border-radius:14px;background:linear-gradient(135deg,#007AFF,#5ac8fa);border:none;color:#fff;font-size:0.85rem;font-weight:700;cursor:pointer;margin-bottom:10px;display:flex;align-items:center;justify-content:center;gap:8px;">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Přehrát v nové kartě (nejrychlejší)
        </button>

        <!-- Možnost 2: Instrukce na lokální server -->
        <button onclick="document.getElementById('cinLocalServerHelp').style.display=document.getElementById('cinLocalServerHelp').style.display==='none'?'block':'none'" style="width:100%;padding:12px;border-radius:14px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);font-size:0.78rem;font-weight:600;cursor:pointer;margin-bottom:10px;">
          🖥️ Jak spustit lokální server?
        </button>
        <div id="cinLocalServerHelp" style="display:none;text-align:left;background:rgba(0,0,0,0.4);border-radius:12px;padding:16px;margin-bottom:10px;">
          <div style="color:rgba(255,255,255,0.8);font-size:0.72rem;line-height:1.8;">
            <strong style="color:#5ac8fa;">Možnost A — VS Code:</strong><br>
            Nainstaluj rozšíření <em>Live Server</em> → klikni pravým na soubor → <em>Open with Live Server</em><br><br>
            <strong style="color:#5ac8fa;">Možnost B — Python:</strong><br>
            Otevři terminál ve složce se souborem a spusť:<br>
            <code style="display:block;background:rgba(255,255,255,0.08);padding:8px 12px;border-radius:8px;margin-top:6px;font-size:0.75rem;color:#fff;">python -m http.server 8080</code>
            <span style="color:rgba(255,255,255,0.4);font-size:0.65rem;">Pak otevři: http://localhost:8080/mujflix.html</span>
          </div>
        </div>

        <button onclick="closeCinema()" style="width:100%;padding:10px;border-radius:12px;background:transparent;border:none;color:rgba(255,255,255,0.25);font-size:0.72rem;cursor:pointer;">Zavřít</button>
      </div>`;
}

function _cinBuildSourceBar() {
    const bar = document.getElementById('cinemaSourceBar');
    bar.innerHTML = '';
    CINEMA_SOURCES.forEach((src, i) => {
        const btn = document.createElement('button');
        // Přidej AI skóre do labelu
        let label = src.label;
        if (window.CinAI) {
            const stats = CinAI.loadStats();
            const score = CinAI.getScore(stats[src.id]);
            if (stats[src.id] && stats[src.id].tries > 0) {
                const dot = score >= 70 ? '🟢' : score >= 40 ? '🟡' : '🔴';
                label = dot + ' ' + src.label;
            }
        }
        btn.textContent = label;
        btn.style.cssText = 'background:' + (i === _cinState.sourceIdx ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)') + ';border:1px solid ' + (i === _cinState.sourceIdx ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)') + ';color:' + (i === _cinState.sourceIdx ? '#fff' : 'rgba(255,255,255,0.5)') + ';font-size:0.78rem;padding:7px 16px;border-radius:20px;cursor:pointer;font-family:-apple-system,Inter,sans-serif;font-weight:' + (i === _cinState.sourceIdx ? '700' : '500') + ';transition:all 0.18s;white-space:nowrap;letter-spacing:0.1px;backdrop-filter:blur(16px);';
        btn.title = (window.CinAI ? '[AI skóre: ' + CinAI.getScore(CinAI.loadStats()[src.id]) + '%] ' : '') + 'Přepnout zdroj na ' + src.label;
        btn.addEventListener('click', () => { _cinState.sourceIdx = i; _cinBuildSourceBar(); _cinLoad(); });
        bar.appendChild(btn);
    });
}

async function _cinLoadEpPicker() {
    const picker = document.getElementById('cinemaEpPicker');
    if (_cinState.type !== 'tv') { picker.style.display = 'none'; return; }
    picker.style.display = 'flex';

    // Zkus načíst sezóny z TMDB pokud máme klíč
    let seasons = _cinState.totalSeasons;
    const tmdbKey = typeof TMDB_KEY !== 'undefined' ? TMDB_KEY : null;
    if (tmdbKey && _cinState.tmdbId) {
        try {
            const r = await fetch(`https://api.themoviedb.org/3/tv/${_cinState.tmdbId}?api_key=${tmdbKey}&language=cs`);
            if (r.ok) {
                const d = await r.json();
                seasons = d.number_of_seasons || 1;
                _cinState.totalSeasons = seasons;
                // Ulož počty epizod
                (d.seasons || []).forEach(s => {
                    if (s.season_number > 0) _cinState.totalEps[s.season_number] = s.episode_count;
                });
            }
        } catch(e) {}
    }

    _cinBuildSeasonSel(seasons);
}

function _cinBuildSeasonSel(totalSeasons) {
    const sel = document.getElementById('cinemaSeasonSel');
    sel.innerHTML = '';
    for (let i = 1; i <= totalSeasons; i++) {
        const o = document.createElement('option');
        o.value = i; o.textContent = 'S' + String(i).padStart(2,'0');
        if (i === _cinState.season) o.selected = true;
        sel.appendChild(o);
    }
    _cinBuildEpSel(_cinState.season);
}

function _cinBuildEpSel(season) {
    const sel = document.getElementById('cinemaEpSel');
    sel.innerHTML = '';
    const count = _cinState.totalEps[season] || 20;
    for (let i = 1; i <= count; i++) {
        const o = document.createElement('option');
        o.value = i; o.textContent = 'E' + String(i).padStart(2,'0');
        if (i === _cinState.ep) o.selected = true;
        sel.appendChild(o);
    }
}

function cinemaSwitchSeason() {
    const s = parseInt(document.getElementById('cinemaSeasonSel').value);
    _cinState.season = s;
    _cinState.ep = 1;
    _cinBuildEpSel(s);
    document.getElementById('cinemaEpSel').value = 1;
    _cinUpdateSubtitle();
    _cinLoad();
}

function cinemaSwitchEp() {
    _cinState.ep = parseInt(document.getElementById('cinemaEpSel').value);
    _cinUpdateSubtitle();
    _cinLoad();
}

function _cinUpdateSubtitle() {
    document.getElementById('cinemaSubtitle').textContent =
        `S${String(_cinState.season).padStart(2,'0')}E${String(_cinState.ep).padStart(2,'0')}`;
}

function closeCinema() {
    const wrap = document.getElementById('cinemaFrameWrap');
    if (wrap) wrap.innerHTML = '';
    const cinModalEl = document.getElementById('cinemaModal');
    cinModalEl.style.display = 'none';
    cinModalEl.style.opacity = '';
    document.getElementById('cinemaLoader').style.display = 'none';
    const warn = document.getElementById('cinemaFileWarn');
    if (warn) warn.style.display = 'none';
    document.body.style.overflow = '';
}

// ESC zavře kino
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const m = document.getElementById('cinemaModal');
        if (m && m.style.display !== 'none') closeCinema();
    }
});

/* ═══════════════════════════════════════════════════════════════════════
   🎬 MůjFlix FX Engine v2.0 — Motion Design System
   ─────────────────────────────────────────────────────────────────────
   Skeleton screens · Optimistic UI · Progress illusion
   Anticipation-aware entrance · Exit 150ms · Feedback <100ms
   Attention 500-800ms + bounce · Stagger 50ms between items
   Entrance 200-300ms sweet spot
═══════════════════════════════════════════════════════════════════════ */
(function MujFlixFX() {
  'use strict';

  // ── 1. INJECT STYLES ──────────────────────────────────────────────
  const style = document.createElement('style');
  style.id = 'mf-fx-engine';
  style.textContent = `

  /* ── SKELETON SCREEN BASE ── */
  @keyframes mf-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .mf-skeleton {
    position: relative;
    overflow: hidden;
    background: rgba(255,255,255,0.05);
    border-radius: 12px;
  }
  .mf-skeleton::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255,255,255,0.055) 40%,
      rgba(255,255,255,0.10) 50%,
      rgba(255,255,255,0.055) 60%,
      transparent 100%
    );
    background-size: 600px 100%;
    animation: mf-shimmer 1.4s ease-in-out infinite;
    border-radius: inherit;
  }

  /* Skeleton tile — stejný rozměr jako .disco-card */
  .mf-skeleton-tile {
    width: 130px;
    min-width: 130px;
    height: 195px;
    border-radius: 20px;
    flex-shrink: 0;
  }
  .mf-skeleton-tile.wide {
    width: 200px;
    min-width: 200px;
    height: 115px;
  }
  .mf-skeleton-row {
    display: flex;
    gap: 10px;
    overflow: hidden;
    padding: 0 4px;
  }
  .mf-skeleton-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 24px 0 8px;
  }
  .mf-skeleton-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 4px;
  }
  .mf-skeleton-title {
    height: 18px;
    width: 140px;
    border-radius: 8px;
  }
  .mf-skeleton-tag {
    height: 14px;
    width: 60px;
    border-radius: 6px;
  }

  /* Skeleton episode card */
  .mf-skeleton-ep {
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 14px 16px;
    border-radius: 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.05);
  }
  .mf-skeleton-ep-thumb {
    width: 160px;
    min-width: 160px;
    height: 90px;
    border-radius: 10px;
  }
  .mf-skeleton-ep-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .mf-skeleton-line {
    height: 12px;
    border-radius: 6px;
  }
  .mf-skeleton-line.short  { width: 55%; }
  .mf-skeleton-line.medium { width: 75%; }
  .mf-skeleton-line.long   { width: 90%; }

  /* ── ENTRANCE ANIMATIONS (200-300ms sweet spot) ── */
  @keyframes mf-enter-up {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes mf-enter-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes mf-enter-scale {
    from { opacity: 0; transform: scale(0.88); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes mf-enter-left {
    from { opacity: 0; transform: translateX(-18px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  /* ── EXIT ANIMATIONS (150ms fast) ── */
  @keyframes mf-exit-down {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(14px); }
  }
  @keyframes mf-exit-scale {
    from { opacity: 1; transform: scale(1); }
    to   { opacity: 0; transform: scale(0.92); }
  }

  /* ── ATTENTION (500-800ms + bounce) ── */
  @keyframes mf-attention-bounce {
    0%   { transform: scale(1); }
    20%  { transform: scale(1.12); }
    40%  { transform: scale(0.96); }
    60%  { transform: scale(1.06); }
    80%  { transform: scale(0.99); }
    100% { transform: scale(1); }
  }
  @keyframes mf-attention-shake {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-5px) rotate(-1deg); }
    40%     { transform: translateX(5px)  rotate(1deg); }
    60%     { transform: translateX(-3px) rotate(-0.5deg); }
    80%     { transform: translateX(3px)  rotate(0.5deg); }
  }
  @keyframes mf-attention-glow {
    0%,100% { box-shadow: 0 0 0 0 rgba(10,132,255,0); }
    50%     { box-shadow: 0 0 0 8px rgba(10,132,255,0.25); }
  }

  /* ── FEEDBACK (<100ms) ── */
  @keyframes mf-press {
    0%   { transform: scale(1); }
    40%  { transform: scale(0.93); }
    100% { transform: scale(1); }
  }
  @keyframes mf-ripple {
    0%   { transform: scale(0); opacity: 0.4; }
    100% { transform: scale(3.5); opacity: 0; }
  }

  /* ── PROGRESS ILLUSION ── */
  .mf-progress-illusion {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 2px;
    z-index: 9999;
    background: linear-gradient(90deg, var(--accent, #0A84FF), var(--accent2, #34aadc));
    transform-origin: left;
    transform: scaleX(0);
    transition: transform 0.25s ease;
    box-shadow: 0 0 8px rgba(10,132,255,0.6);
    border-radius: 0 2px 2px 0;
    pointer-events: none;
    opacity: 0;
  }
  .mf-progress-illusion.active { opacity: 1; }

  /* ── OPTIMISTIC UI — watchlist button ── */
  .tile-watchlist-btn.mf-optimistic {
    animation: mf-attention-bounce 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards;
  }
  .tile-watchlist-btn.mf-optimistic-add {
    color: var(--accent) !important;
    background: rgba(10,132,255,0.18) !important;
    border-color: rgba(10,132,255,0.5) !important;
    transform: scale(1.15) !important;
    box-shadow: 0 0 16px rgba(10,132,255,0.4) !important;
  }
  .tile-watchlist-btn.mf-optimistic-remove {
    color: rgba(255,255,255,0.3) !important;
    transform: scale(0.85) !important;
  }

  /* ── STAGGER: mf-stagger-child gets stagger delay ── */
  .mf-stagger-parent > * {
    opacity: 0;
    transform: translateY(16px);
  }
  .mf-stagger-parent.mf-stagger-done > * {
    animation: mf-enter-up 0.26s cubic-bezier(0.34,1.15,0.64,1) forwards;
  }

  /* ── DISCO CARD ENTRANCE ── */
  .disco-card.mf-card-enter {
    animation: mf-enter-up 0.24s cubic-bezier(0.34,1.12,0.64,1) both;
  }

  /* ── EPISODE CARD ENTRANCE ── */
  .episode-card.mf-card-enter {
    animation: mf-enter-up 0.25s cubic-bezier(0.34,1.1,0.64,1) both;
  }

  /* ── SECTION ENTRANCE ── */
  .disco-section.mf-section-enter {
    animation: mf-enter-up 0.28s cubic-bezier(0.34,1.1,0.64,1) both;
  }

  /* ── MODAL CONTENT LINES — stagger within modal ── */
  .modal-content .mf-reveal {
    opacity: 0;
    transform: translateY(10px);
    animation: mf-enter-up 0.22s cubic-bezier(0.34,1.15,0.64,1) forwards;
  }

  /* ── TOAST MICRO-INTERACTION ── */
  .toast.mf-toast-enter {
    animation: mf-enter-up 0.26s cubic-bezier(0.34,1.28,0.64,1) both !important;
  }
  .toast.mf-toast-exit {
    animation: mf-exit-down 0.15s ease forwards !important;
  }

  /* ── RIPPLE CONTAINER ── */
  .mf-ripple-container {
    position: relative;
    overflow: hidden;
  }
  .mf-ripple-wave {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.18);
    pointer-events: none;
    animation: mf-ripple 0.5s ease-out forwards;
    transform: scale(0);
  }

  /* ── DOCK BTN PRESS FEEDBACK ── */
  .dock-btn:active,
  .dock-btn.mf-pressed {
    animation: mf-press 0.12s ease forwards;
  }

  /* ── HEADER SCROLL ANTICIPATION ── */
  .mf-header.mf-anticipate {
    transition: background 0.18s ease, backdrop-filter 0.18s ease !important;
  }

  /* ── TILE WRAPPER ENTRANCE ── */
  .ps-tile-wrapper.mf-tile-enter {
    animation: mf-enter-up 0.25s cubic-bezier(0.34,1.12,0.64,1) both;
  }

  /* ── SCORE BADGE ATTENTION ── */
  .ai-match-badge.mf-attention {
    animation: mf-attention-bounce 0.7s cubic-bezier(0.34,1.4,0.64,1);
  }

  /* ── GENRE CHIP ENTRANCE ── */
  .disco-filter-btn.mf-chip-enter {
    animation: mf-enter-left 0.22s cubic-bezier(0.34,1.1,0.64,1) both;
  }

  /* ── LOADING STATES ── */
  .mf-loading-pulse {
    animation: mf-shimmer 1.4s ease-in-out infinite;
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%);
    background-size: 400px 100%;
  }

  `;
  document.head.appendChild(style);

  // ── 2. PROGRESS ILLUSION BAR ──────────────────────────────────────
  const progressBar = document.createElement('div');
  progressBar.className = 'mf-progress-illusion';
  progressBar.id = 'mfProgressBar';
  document.body.appendChild(progressBar);

  let _progressTimer = null;
  let _progressVal = 0;

  window.MFProgress = {
    start() {
      progressBar.classList.add('active');
      _progressVal = 0;
      progressBar.style.transform = 'scaleX(0)';
      clearInterval(_progressTimer);
      // Illusion: fast at start, slows down approaching 90%
      _progressTimer = setInterval(() => {
        const remaining = 0.92 - _progressVal;
        const step = remaining * 0.08 + 0.004;
        _progressVal = Math.min(_progressVal + step, 0.92);
        progressBar.style.transform = `scaleX(${_progressVal})`;
      }, 80);
    },
    finish() {
      clearInterval(_progressTimer);
      _progressVal = 1;
      progressBar.style.transform = 'scaleX(1)';
      progressBar.style.transition = 'transform 0.18s ease';
      setTimeout(() => {
        progressBar.style.opacity = '0';
        progressBar.style.transition = 'transform 0.18s ease, opacity 0.25s ease';
        setTimeout(() => {
          progressBar.classList.remove('active');
          progressBar.style.opacity = '';
          progressBar.style.transform = 'scaleX(0)';
          progressBar.style.transition = '';
          _progressVal = 0;
        }, 280);
      }, 180);
    },
    error() {
      clearInterval(_progressTimer);
      progressBar.style.background = 'linear-gradient(90deg, #ff3b30, #ff6b6b)';
      progressBar.style.transform = 'scaleX(1)';
      setTimeout(() => this.finish(), 800);
    }
  };

  // ── 3. SKELETON SCREEN BUILDER ───────────────────────────────────
  window.MFSkeleton = {
    buildDiscoSkeleton(count = 8) {
      const section = document.createElement('div');
      section.className = 'mf-skeleton-section';
      section.dataset.mfSkeleton = '1';

      const header = document.createElement('div');
      header.className = 'mf-skeleton-header';
      header.innerHTML = `
        <div class="mf-skeleton mf-skeleton-title"></div>
        <div class="mf-skeleton mf-skeleton-tag"></div>`;

      const row = document.createElement('div');
      row.className = 'mf-skeleton-row';
      for (let i = 0; i < count; i++) {
        const tile = document.createElement('div');
        tile.className = 'mf-skeleton mf-skeleton-tile';
        tile.style.animationDelay = `${i * 0.06}s`;
        row.appendChild(tile);
      }

      section.appendChild(header);
      section.appendChild(row);
      return section;
    },

    buildEpisodeSkeleton(count = 5) {
      const wrap = document.createElement('div');
      wrap.dataset.mfSkeleton = '1';
      wrap.style.display = 'flex';
      wrap.style.flexDirection = 'column';
      wrap.style.gap = '8px';
      wrap.style.padding = '8px 0';

      for (let i = 0; i < count; i++) {
        const ep = document.createElement('div');
        ep.className = 'mf-skeleton-ep';
        ep.innerHTML = `
          <div class="mf-skeleton mf-skeleton-ep-thumb" style="animation-delay:${i * 0.07}s"></div>
          <div class="mf-skeleton-ep-body">
            <div class="mf-skeleton mf-skeleton-line short" style="animation-delay:${i * 0.07 + 0.04}s"></div>
            <div class="mf-skeleton mf-skeleton-line medium" style="animation-delay:${i * 0.07 + 0.08}s"></div>
            <div class="mf-skeleton mf-skeleton-line long" style="animation-delay:${i * 0.07 + 0.12}s"></div>
          </div>`;
        wrap.appendChild(ep);
      }
      return wrap;
    },

    inject(container, type = 'disco', count = 8) {
      this.remove(container);
      const skel = type === 'episode'
        ? this.buildEpisodeSkeleton(count)
        : this.buildDiscoSkeleton(count);
      container.insertBefore(skel, container.firstChild);
      return skel;
    },

    remove(container) {
      container?.querySelectorAll('[data-mf-skeleton]').forEach(el => el.remove());
    }
  };

  // ── 4. STAGGER ANIMATION ENGINE ──────────────────────────────────
  window.MFStagger = {
    run(parent, options = {}) {
      const {
        delay    = 50,     // ms mezi dětmi
        duration = 240,    // ms entrance
        easing   = 'cubic-bezier(0.34,1.12,0.64,1)',
        from     = 'bottom' // bottom | left | scale
      } = options;

      const children = [...parent.children];
      children.forEach((child, i) => {
        child.style.opacity = '0';
        child.style.transform = from === 'left' ? 'translateX(-16px)'
                               : from === 'scale' ? 'scale(0.88)'
                               : 'translateY(18px)';
        child.style.transition = 'none';

        // requestAnimationFrame ensures browser has laid out
        requestAnimationFrame(() => {
          setTimeout(() => {
            child.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
            child.style.opacity = '1';
            child.style.transform = 'none';
          }, i * delay);
        });
      });
    },

    // Stagger on IntersectionObserver — runs when row enters viewport
    observe(container, options = {}) {
      if (!('IntersectionObserver' in window)) {
        this.run(container, options);
        return;
      }
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.run(entry.target, options);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.06 });
      io.observe(container);
    }
  };

  // ── 5. FEEDBACK ENGINE (<100ms) ──────────────────────────────────
  // Ripple effect on clickable elements
  function addRipple(el, e) {
    const rect = el.getBoundingClientRect();
    const x = (e?.clientX ?? rect.left + rect.width / 2) - rect.left;
    const y = (e?.clientY ?? rect.top + rect.height / 2) - rect.top;
    const size = Math.max(rect.width, rect.height) * 0.8;

    const wave = document.createElement('div');
    wave.className = 'mf-ripple-wave';
    wave.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${x - size / 2}px; top: ${y - size / 2}px;`;
    el.appendChild(wave);
    wave.addEventListener('animationend', () => wave.remove());
  }

  // Apply ripple to dock buttons
  document.querySelectorAll('.dock-btn').forEach(btn => {
    btn.classList.add('mf-ripple-container');
    btn.addEventListener('click', (e) => {
      addRipple(btn, e);
    });
  });

  // ── 6. OPTIMISTIC UI — Watchlist ─────────────────────────────────
  // Intercept watchlist button clicks for instant visual feedback
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.tile-watchlist-btn');
    if (!btn) return;

    // Immediate visual response < 100ms
    const isIn = btn.classList.contains('in-watchlist');
    btn.classList.remove('mf-optimistic', 'mf-optimistic-add', 'mf-optimistic-remove');
    void btn.offsetWidth; // force reflow

    if (!isIn) {
      // Adding — show immediate positive feedback
      btn.classList.add('mf-optimistic-add');
      btn.classList.add('mf-optimistic');
      addRipple(btn, e);
    } else {
      // Removing — show immediate removal feedback
      btn.classList.add('mf-optimistic-remove');
      setTimeout(() => btn.classList.remove('mf-optimistic-remove'), 200);
    }

    // Clean up optimistic state after actual update settles
    setTimeout(() => {
      btn.classList.remove('mf-optimistic-add', 'mf-optimistic', 'mf-optimistic-remove');
    }, 600);
  }, { capture: true });

  // ── 7. ATTENTION SYSTEM (500-800ms + bounce) ──────────────────────
  window.MFAttention = {
    bounce(el, delay = 0) {
      setTimeout(() => {
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = 'mf-attention-bounce 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards';
        el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
      }, delay);
    },
    glow(el, delay = 0) {
      setTimeout(() => {
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = 'mf-attention-glow 0.7s ease-in-out';
        el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
      }, delay);
    },
    shake(el) {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = 'mf-attention-shake 0.5s ease';
      el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
    }
  };

  // ── 8. PROGRESS ILLUSION — intercept fetch/content loads ─────────
  // Hook into disco content loading
  const _origLoadDisco = window.loadDiscoContent;
  if (typeof _origLoadDisco === 'function') {
    window.loadDiscoContent = function(...args) {
      MFProgress.start();
      const result = _origLoadDisco.apply(this, args);
      if (result && typeof result.then === 'function') {
        result.then(() => MFProgress.finish()).catch(() => MFProgress.error());
      } else {
        setTimeout(() => MFProgress.finish(), 600);
      }
      return result;
    };
  }

  // ── 9. ANTICIPATION-AWARE CARD ENTRANCE ──────────────────────────
  // Natural content-aware: tiles entering from bottom get up-animation,
  // left-side content gets left-animation, header content fades in
  const cardIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target._mfEntered) {
        entry.target._mfEntered = true;
        const rect = entry.target.getBoundingClientRect();
        const fromLeft = rect.left < window.innerWidth * 0.3;
        const el = entry.target;

        // Natural anticipation: slight delay based on position in viewport
        const viewportFraction = Math.max(0, entry.intersectionRatio);
        const anticipationDelay = fromLeft ? 0 : Math.round((1 - viewportFraction) * 40);

        el.style.opacity = '0';
        el.style.transform = fromLeft ? 'translateX(-12px)' : 'translateY(16px)';

        setTimeout(() => {
          el.style.transition = `opacity 0.24s cubic-bezier(0.34,1.1,0.64,1), transform 0.26s cubic-bezier(0.34,1.12,0.64,1)`;
          el.style.opacity = '1';
          el.style.transform = 'none';
        }, anticipationDelay);

        cardIO.unobserve(el);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  // ── 10. SKELETON → CONTENT TRANSITION ───────────────────────────
  // Patch renderDiscoRow to show skeletons then stagger-in real content
  const _origRenderDiscoRow = window.renderDiscoRow;
  if (typeof _origRenderDiscoRow === 'function') {
    window.renderDiscoRow = function(body, label, items, rowType) {
      _origRenderDiscoRow.apply(this, arguments);
      // Stagger the newly added scroll row
      const lastRow = body.querySelector('.disco-row:last-child .disco-row-scroll');
      if (lastRow) {
        setTimeout(() => {
          MFStagger.observe(lastRow, { delay: 50, duration: 230 });
        }, 60);
      }
    };
  }

  // ── 11. DISCO BODY OBSERVER — animate sections as they appear ────
  const bodyTarget = document.getElementById('discoBody');
  if (bodyTarget) {
    const sectionMO = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return;

          // Animate entire section entrance
          if (node.classList?.contains('disco-section')) {
            const sectionIdx = [...bodyTarget.children].indexOf(node);
            node.style.opacity = '0';
            node.style.transform = 'translateY(20px)';
            setTimeout(() => {
              node.style.transition = 'opacity 0.28s cubic-bezier(0.34,1.1,0.64,1), transform 0.3s cubic-bezier(0.34,1.1,0.64,1)';
              node.style.opacity = '1';
              node.style.transform = 'none';
            }, sectionIdx * 80);

            // Stagger cards within the scroll row
            const scroll = node.querySelector('.disco-row-scroll');
            if (scroll) {
              setTimeout(() => {
                const cards = [...scroll.querySelectorAll('.disco-card')];
                cards.forEach((card, i) => {
                  card.style.opacity = '0';
                  card.style.transform = 'translateY(14px) scale(0.96)';
                  setTimeout(() => {
                    card.style.transition = 'opacity 0.22s cubic-bezier(0.34,1.1,0.64,1), transform 0.24s cubic-bezier(0.34,1.12,0.64,1)';
                    card.style.opacity = '1';
                    card.style.transform = 'none';
                  }, sectionIdx * 80 + i * 50);
                });
              }, 60);
            }
          }
        });
      });
    });
    sectionMO.observe(bodyTarget, { childList: true, subtree: false });
  }

  // ── 12. EPISODE CARDS STAGGER PATCH ─────────────────────────────
  // Observe episode container for new episode cards
  const episodeContainerMO = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      if (m.addedNodes.length === 0) return;
      const epCards = [...m.target.querySelectorAll('.episode-card:not([data-mf-animated])')];
      if (epCards.length < 2) return;
      epCards.forEach((card, i) => {
        card.dataset.mfAnimated = '1';
        card.style.opacity = '0';
        card.style.transform = 'translateY(12px)';
        setTimeout(() => {
          card.style.transition = 'opacity 0.23s cubic-bezier(0.34,1.1,0.64,1), transform 0.25s cubic-bezier(0.34,1.1,0.64,1)';
          card.style.opacity = '1';
          card.style.transform = 'none';
        }, i * 50);
      });
    });
  });

  // Watch episode list containers
  function watchEpisodeContainer() {
    document.querySelectorAll('.episodes-list, .ep-list, #episodesList, .modal-ep-list, .modal-body')
      .forEach(el => {
        if (!el._mfEpWatched) {
          el._mfEpWatched = true;
          episodeContainerMO.observe(el, { childList: true });
        }
      });
  }
  watchEpisodeContainer();

  // Recheck after modal opens
  const modalEl = document.querySelector('.modal-overlay');
  if (modalEl) {
    new MutationObserver(() => watchEpisodeContainer())
      .observe(modalEl, { attributes: true, attributeFilter: ['class'] });
  }

  // ── 13. SKELETON INJECTION — Disco view switch ───────────────────
  // Wrap the disco loading to inject skeleton before fetch
  const _origLoadDisco2 = window.loadDiscoContent;
  if (typeof _origLoadDisco2 === 'function' && !_origLoadDisco2._mfPatched) {
    _origLoadDisco2._mfPatched = true;
    window.loadDiscoContent = function(genre, type) {
      const body = document.getElementById('discoBody');
      if (body) {
        // Show 2 skeleton sections while loading
        body.style.opacity = '0.4';
        body.style.transition = 'opacity 0.15s ease';
        if (!body.querySelector('[data-mf-skeleton]')) {
          body.insertBefore(MFSkeleton.buildDiscoSkeleton(10), body.firstChild);
          body.insertBefore(MFSkeleton.buildDiscoSkeleton(10), body.firstChild);
        }
      }
      const result = _origLoadDisco2.apply(this, arguments);
      const cleanup = () => {
        if (body) {
          MFSkeleton.remove(body);
          body.style.opacity = '1';
          body.style.transition = 'opacity 0.3s ease';
          setTimeout(() => { body.style.transition = ''; }, 350);
        }
        MFProgress.finish();
      };
      if (result && typeof result.then === 'function') {
        result.then(cleanup).catch(() => { cleanup(); MFProgress.error(); });
      } else {
        setTimeout(cleanup, 500);
      }
      return result;
    };
  }

  // ── 14. GENRE FILTER CHIPS STAGGER ──────────────────────────────
  // Watch for filter buttons appearing
  const filterMO = new MutationObserver(() => {
    const chips = [...document.querySelectorAll('.disco-filter-btn:not([data-mf-staggered])')];
    chips.forEach((chip, i) => {
      chip.dataset.mfStaggered = '1';
      chip.style.opacity = '0';
      chip.style.transform = 'translateX(-10px)';
      setTimeout(() => {
        chip.style.transition = 'opacity 0.2s cubic-bezier(0.34,1.1,0.64,1), transform 0.22s cubic-bezier(0.34,1.1,0.64,1)';
        chip.style.opacity = '';
        chip.style.transform = '';
        setTimeout(() => { chip.style.transition = ''; }, 250);
      }, i * 50);
    });
  });
  const filterBar = document.querySelector('.disco-filters, .filter-bar, #discoFilters');
  if (filterBar) filterMO.observe(filterBar, { childList: true });

  // ── 15. TOAST ENHANCEMENT ───────────────────────────────────────
  // Patch showToast for smooth exit
  const _origShowToast = window.showToast;
  if (typeof _origShowToast === 'function') {
    window.showToast = function(msg, type, duration) {
      _origShowToast.apply(this, arguments);
      // Find the latest toast and animate it in
      requestAnimationFrame(() => {
        const toast = document.querySelector('.toast:last-child, .toast');
        if (toast && !toast._mfToasted) {
          toast._mfToasted = true;
          toast.classList.add('mf-toast-enter');
        }
      });
    };
  }

  // ── 16. HEADER SCROLL ANTICIPATION ──────────────────────────────
  const header = document.querySelector('.mf-header');
  if (header) {
    let _lastScroll = 0;
    let _scrollRaf = false;
    const mainScroll = document.querySelector('.ps-menu-scene') || window;

    (mainScroll === window ? window : mainScroll).addEventListener('scroll', function() {
      if (_scrollRaf) return;
      _scrollRaf = true;
      requestAnimationFrame(() => {
        _scrollRaf = false;
        const scrollTop = mainScroll === window ? window.scrollY : mainScroll.scrollTop;
        const velocity = Math.abs(scrollTop - _lastScroll);
        _lastScroll = scrollTop;

        // Anticipation: pre-activate header blur slightly before threshold
        if (velocity > 6 && scrollTop > 30) {
          header.classList.add('mf-anticipate');
        }
        if (scrollTop < 10) {
          header.classList.remove('mf-anticipate');
        }
      });
    }, { passive: true });
  }

  // ── 17. MAIN TILE GRID — stagger on first paint ──────────────────
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      // Main ps-tile-wrappers (the 6-tile main grid)
      const tileWrappers = document.querySelectorAll('.ps-tile-wrapper');
      tileWrappers.forEach((tile, i) => {
        tile.style.opacity = '0';
        tile.style.transform = 'translateY(20px)';
        setTimeout(() => {
          tile.style.transition = `opacity 0.26s cubic-bezier(0.34,1.1,0.64,1), transform 0.28s cubic-bezier(0.34,1.12,0.64,1)`;
          tile.style.opacity = '1';
          tile.style.transform = 'none';
          // Cleanup transition after animation
          setTimeout(() => { tile.style.transition = ''; }, 320);
        }, 120 + i * 50);
      });
    }, 200); // slight delay for content-awareness
  });

  // ── 18. DOCK BUTTONS — bounce attention on active tab ────────────
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      const activeDock = document.querySelector('.dock-btn.active, .dock-btn[data-active="true"]');
      if (activeDock) {
        MFAttention.bounce(activeDock, 600);
      }
    }, 800);
  });

  // ── 19. WATCHLIST BADGE — attention on change ───────────────────
  const _origUpdateWLBadge = window.updateWatchlistBadge;
  if (typeof _origUpdateWLBadge === 'function') {
    window.updateWatchlistBadge = function() {
      _origUpdateWLBadge.apply(this, arguments);
      const badge = document.querySelector('.dock-badge');
      if (badge) {
        requestAnimationFrame(() => MFAttention.bounce(badge, 100));
      }
    };
  }

  console.info('[MůjFlix FX Engine v2.0] ✓ Skeleton · OptimisticUI · ProgressIllusion · Stagger · Attention · Anticipation');
})(); // end MujFlixFX

/* ═══════════════════════════════════════════════════════════════════════
   MůjFlix FX Engine v3.0 — Objevování Section
   Skeleton · KB Nav · Stagger 50ms · Optimistic Chips · Typography
═══════════════════════════════════════════════════════════════════════ */
(function MujFlixDiscoFX() {
  'use strict';

  const style = document.createElement('style');
  style.id = 'mf-disco-fx';
  style.textContent = `

  /* TYPOGRAPHY POLISH */
  .disco-row-title {
    font-size: clamp(0.95rem, 2vw, 1.1rem) !important;
    font-weight: 800 !important;
    letter-spacing: -0.35px !important;
    line-height: 1.15 !important;
  }
  .disco-card-name {
    font-size: clamp(0.68rem, 1.4vw, 0.78rem) !important;
    font-weight: 800 !important;
    letter-spacing: -0.2px !important;
    line-height: 1.25 !important;
  }
  .disco-nav-item {
    font-size: clamp(0.7rem, 1.5vw, 0.82rem) !important;
    letter-spacing: -0.1px !important;
    font-weight: 600 !important;
  }

  /* SPACING POLISH 8px grid */
  .disco-section { padding-bottom: 8px !important; }
  .disco-row-header { padding: 16px 0 12px !important; }
  .disco-row-scroll { gap: 10px !important; padding-bottom: 12px !important; }

  /* SKELETON SCREENS */
  @keyframes mf-disco-shimmer {
    0%   { background-position: -700px 0; }
    100% { background-position:  700px 0; }
  }
  .mf-disco-skel {
    background: rgba(255,255,255,0.045);
    border-radius: 20px;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }
  .mf-disco-skel::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 20%,
      rgba(255,255,255,0.055) 45%,
      rgba(255,255,255,0.11) 50%,
      rgba(255,255,255,0.055) 55%,
      transparent 80%
    );
    background-size: 700px 100%;
    animation: mf-disco-shimmer 1.5s ease-in-out infinite;
    border-radius: inherit;
  }
  .mf-disco-skel-card  { width: 130px; height: 195px; }
  .mf-disco-skel-wide  { width: 220px; height: 130px; }
  .mf-disco-skel-title { width: 160px; height: 20px; border-radius: 8px; margin-bottom: 10px; }
  .mf-disco-skel-tag   { width: 70px;  height: 14px; border-radius: 6px; }
  .mf-disco-skel-row   { display: flex; gap: 10px; overflow: hidden; }
  .mf-disco-skel-section { padding: 16px 0 8px; display: flex; flex-direction: column; gap: 12px; }
  .mf-disco-skel-hdr   { display: flex; align-items: center; gap: 10px; }

  /* KEYBOARD FOCUS IN DISCO */
  .mf-disco-kb-focus {
    outline: none !important;
    box-shadow:
      0 0 0 2.5px var(--accent, #0A84FF),
      0 0 0 5px rgba(10,132,255,0.18),
      0 16px 48px rgba(0,0,0,0.75) !important;
    transform: scale(1.065) translateY(-5px) !important;
    z-index: 10;
    position: relative;
    transition:
      transform 0.22s cubic-bezier(0.34,1.28,0.64,1),
      box-shadow 0.2s ease !important;
  }
  .mf-disco-kb-focus .disco-card-info {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
  .mf-disco-kb-focus .disco-play-btn {
    opacity: 1 !important;
    transform: translate(-50%,-50%) scale(1) rotate(0deg) !important;
  }
  .mf-disco-row-active .disco-row-title {
    color: var(--accent, #0A84FF) !important;
    transition: color 0.2s ease;
  }

  /* ATTENTION BOUNCE on kb-selected card */
  @keyframes mf-disco-attention {
    0%   { transform: scale(1.065) translateY(-5px); }
    25%  { transform: scale(1.10) translateY(-8px); }
    55%  { transform: scale(1.055) translateY(-4px); }
    75%  { transform: scale(1.07) translateY(-6px); }
    100% { transform: scale(1.065) translateY(-5px); }
  }
  .mf-disco-kb-focus.mf-disco-attention-play {
    animation: mf-disco-attention 0.65s cubic-bezier(0.34,1.56,0.64,1);
  }

  /* OPTIMISTIC CHIP */
  .disco-nav-item.mf-chip-optimistic {
    background: rgba(10,132,255,0.18) !important;
    border-color: rgba(10,132,255,0.5) !important;
    color: var(--accent,#0A84FF) !important;
    transition: background 0.08s ease, border-color 0.08s ease, color 0.08s ease !important;
  }

  /* KEYBOARD HINT */
  #mf-disco-kb-hint {
    position: fixed;
    bottom: 90px;
    left: 50%;
    transform: translateX(-50%) translateY(8px);
    background: rgba(10,10,16,0.92);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 50px;
    padding: 7px 18px;
    font-family: -apple-system, 'SF Pro Text', sans-serif;
    font-size: 0.6rem;
    font-weight: 600;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.3px;
    pointer-events: none;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.22s ease, transform 0.26s cubic-bezier(0.34,1.2,0.64,1);
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  #mf-disco-kb-hint.visible {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  #mf-disco-kb-hint kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 5px;
    padding: 1px 5px;
    font-size: 0.55rem;
    font-weight: 700;
    color: rgba(255,255,255,0.6);
    line-height: 1.4;
  }

  /* ATTENTION bounce reuse */
  @keyframes mf-attention-bounce {
    0%   { transform: scale(1); }
    20%  { transform: scale(1.14); }
    40%  { transform: scale(0.96); }
    60%  { transform: scale(1.07); }
    80%  { transform: scale(0.99); }
    100% { transform: scale(1); }
  }
  `;
  document.head.appendChild(style);

  /* ── STATE ── */
  const st = {
    open: false, kbActive: false,
    rowIdx: 0, cardIdx: 0, rows: [],
    hintTimer: null,
  };

  /* ── HINT ── */
  const hint = document.createElement('div');
  hint.id = 'mf-disco-kb-hint';
  hint.innerHTML = '<kbd>&#8593;&#8595;</kbd> Radky &nbsp; <kbd>&#8592;&#8594;</kbd> Karty &nbsp; <kbd>Enter</kbd> Prehrat &nbsp; <kbd>Esc</kbd> Zpet';
  document.body.appendChild(hint);

  function showHint() {
    hint.classList.add('visible');
    clearTimeout(st.hintTimer);
    st.hintTimer = setTimeout(() => hint.classList.remove('visible'), 3500);
  }
  function hideHint() { clearTimeout(st.hintTimer); hint.classList.remove('visible'); }

  function getRows() {
    return [...document.querySelectorAll('#discoBody .disco-row-scroll')]
      .filter(r => r.querySelectorAll('.disco-card').length > 0);
  }
  function getCards(rowEl) { return [...rowEl.querySelectorAll('.disco-card')]; }

  function clearAllFocus() {
    document.querySelectorAll('.mf-disco-kb-focus').forEach(el =>
      el.classList.remove('mf-disco-kb-focus','mf-disco-attention-play'));
    document.querySelectorAll('.mf-disco-row-active').forEach(el =>
      el.classList.remove('mf-disco-row-active'));
  }

  function setFocus(rowIdx, cardIdx) {
    st.rowIdx = rowIdx; st.cardIdx = cardIdx;
    st.rows = getRows();
    clearAllFocus();
    const rowEl = st.rows[rowIdx]; if (!rowEl) return;
    const rowSection = rowEl.closest('.disco-row');
    if (rowSection) rowSection.classList.add('mf-disco-row-active');
    const cards = getCards(rowEl);
    st.cardIdx = Math.min(cardIdx, cards.length - 1);
    const card = cards[st.cardIdx]; if (!card) return;
    card.classList.add('mf-disco-kb-focus');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    rowEl.closest('.disco-section')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    clearTimeout(card._discoAttnTimer);
    card._discoAttnTimer = setTimeout(() => {
      card.classList.add('mf-disco-attention-play');
      card.addEventListener('animationend', () =>
        card.classList.remove('mf-disco-attention-play'), { once: true });
    }, 520);
    showHint();
  }

  /* ── KEYBOARD HANDLER — capture phase, overrides arrows in Objevovani ── */
  document.addEventListener('keydown', function discoKeyHandler(e) {
    if (!st.open) return;
    const overlay = document.getElementById('universeOverlay');
    if (!overlay?.classList.contains('open')) return;
    if (document.activeElement?.matches('input,textarea,select')) return;
    const key = e.key;
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',' '].includes(key)) return;
    if (key === 'Escape') return;

    e.preventDefault();
    e.stopPropagation();

    st.rows = getRows();
    if (!st.rows.length) return;

    if (!st.kbActive) {
      st.kbActive = true;
      setFocus(0, 0);
      return;
    }

    const rowEl = st.rows[st.rowIdx];
    const cards = rowEl ? getCards(rowEl) : [];

    if (key === 'ArrowRight') {
      if (st.cardIdx + 1 < cards.length) {
        setFocus(st.rowIdx, st.cardIdx + 1);
      } else {
        // Bounce nav button at end
        const btn = rowEl?.closest('.disco-row')?.querySelector('.disco-row-nav-btn:last-child');
        if (btn) { btn.style.animation='none'; void btn.offsetWidth; btn.style.animation='mf-attention-bounce 0.38s cubic-bezier(0.34,1.5,0.64,1)'; btn.addEventListener('animationend',()=>btn.style.animation='',{once:true}); }
      }
    } else if (key === 'ArrowLeft') {
      if (st.cardIdx - 1 >= 0) {
        setFocus(st.rowIdx, st.cardIdx - 1);
      } else {
        const btn = rowEl?.closest('.disco-row')?.querySelector('.disco-row-nav-btn:first-child');
        if (btn) { btn.style.animation='none'; void btn.offsetWidth; btn.style.animation='mf-attention-bounce 0.38s cubic-bezier(0.34,1.5,0.64,1)'; btn.addEventListener('animationend',()=>btn.style.animation='',{once:true}); }
      }
    } else if (key === 'ArrowDown') {
      if (st.rowIdx + 1 < st.rows.length) {
        const nextCards = getCards(st.rows[st.rowIdx + 1]);
        setFocus(st.rowIdx + 1, Math.min(st.cardIdx, nextCards.length - 1));
      }
    } else if (key === 'ArrowUp') {
      if (st.rowIdx > 0) {
        const prevCards = getCards(st.rows[st.rowIdx - 1]);
        setFocus(st.rowIdx - 1, Math.min(st.cardIdx, prevCards.length - 1));
      } else {
        // Na prvnim radku: zavri Objevovani a obnov puvodni kb mod
        st.kbActive = false;
        clearAllFocus();
        hideHint();
        if (typeof closeUniverse === 'function') closeUniverse();
      }
    } else if (key === 'Enter' || key === ' ') {
      const focused = document.querySelector('.mf-disco-kb-focus');
      if (focused) {
        focused.classList.remove('mf-disco-attention-play');
        void focused.offsetWidth;
        focused.classList.add('mf-disco-attention-play');
        setTimeout(() => focused.click(), 80);
      }
    }
  }, { capture: true });

  /* ── TRACK OPEN/CLOSE ── */
  const _origOpenA = window.openUniverse;
  const _origCloseA = window.closeUniverse;
  if (typeof _origOpenA === 'function' && !_origOpenA._dFxOpen) {
    window.openUniverse = function() {
      st.open = true; st.kbActive = false;
      st.rowIdx = 0; st.cardIdx = 0;
      const r = _origOpenA.apply(this, arguments);
      setTimeout(staggerFilterChips, 120);
      return r;
    };
    window.openUniverse._dFxOpen = true;
  }
  if (typeof _origCloseA === 'function' && !_origCloseA._dFxClose) {
    window.closeUniverse = function() {
      st.open = false; st.kbActive = false;
      clearAllFocus(); hideHint();
      return _origCloseA.apply(this, arguments);
    };
    window.closeUniverse._dFxClose = true;
  }

  // Also watch via MutationObserver
  const universeEl = document.getElementById('universeOverlay');
  if (universeEl) {
    new MutationObserver(() => {
      if (!universeEl.classList.contains('open') && st.open) {
        st.open = false; st.kbActive = false;
        clearAllFocus(); hideHint();
      }
    }).observe(universeEl, { attributes: true, attributeFilter: ['class'] });
  }

  /* ── SKELETON BUILDER ── */
  function buildSkelSection(cardCount, wide) {
    const section = document.createElement('div');
    section.className = 'mf-disco-skel-section';
    section.dataset.mfDiscoSkeleton = '1';
    section.innerHTML = `<div class="mf-disco-skel-hdr">
      <div class="mf-disco-skel mf-disco-skel-title"></div>
      <div class="mf-disco-skel mf-disco-skel-tag" style="animation-delay:.1s"></div>
    </div>`;
    const row = document.createElement('div');
    row.className = 'mf-disco-skel-row';
    for (let i = 0; i < cardCount; i++) {
      const c = document.createElement('div');
      c.className = 'mf-disco-skel ' + (wide ? 'mf-disco-skel-wide' : 'mf-disco-skel-card');
      c.style.animationDelay = (i * 0.05) + 's';
      row.appendChild(c);
    }
    section.appendChild(row);
    return section;
  }

  function injectSkeletons(body) {
    removeSkeltons(body);
    [[8, false],[10, true],[10, false]].forEach(([n, w], i) => {
      const s = buildSkelSection(n, w);
      s.style.opacity = '0';
      body.appendChild(s);
      setTimeout(() => {
        s.style.transition = 'opacity 0.22s ease';
        s.style.opacity = '1';
        setTimeout(() => s.style.transition = '', 250);
      }, i * 80);
    });
  }

  function removeSkeltons(body) {
    body?.querySelectorAll('[data-mf-disco-skeleton]').forEach(el => {
      el.style.transition = 'opacity 0.15s ease';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 160);
    });
  }

  /* ── PATCH loadDiscoContent ── */
  const _origLD = window.loadDiscoContent;
  if (typeof _origLD === 'function' && !_origLD._dFxPatched) {
    window.loadDiscoContent = async function() {
      const body = document.getElementById('discoBody');
      if (body) { body.innerHTML = ''; injectSkeletons(body); }
      if (window.MFProgress) MFProgress.start();

      let result;
      try { result = await _origLD.apply(this, arguments); }
      catch(err) { if (window.MFProgress) MFProgress.error(); throw err; }

      if (body) removeSkeltons(body);
      if (window.MFProgress) MFProgress.finish();

      // Reset kb state
      if (st.open) { st.kbActive = false; clearAllFocus(); st.rows = []; }

      // Stagger cards: 50ms per card, 60ms per row offset
      requestAnimationFrame(() => {
        if (!body) return;
        body.querySelectorAll('.disco-row-scroll').forEach((scroll, rI) => {
          const cards = [...scroll.querySelectorAll('.disco-card:not([data-dfx])')];
          cards.forEach((card, cI) => {
            card.dataset.dfx = '1';
            card.style.opacity = '0';
            card.style.transform = 'translateY(18px) scale(0.95)';
            const delay = rI * 60 + cI * 50;
            setTimeout(() => {
              card.style.transition = 'opacity 0.24s cubic-bezier(0.34,1.1,0.64,1), transform 0.26s cubic-bezier(0.34,1.12,0.64,1)';
              card.style.opacity = '1';
              card.style.transform = 'none';
              setTimeout(() => card.style.transition = '', 280);
            }, delay);
          });
        });
        // Stagger row headers left-slide
        body.querySelectorAll('.disco-section:not([data-dhdr])').forEach((sec, i) => {
          sec.dataset.dhdr = '1';
          const hdr = sec.querySelector('.disco-row-header');
          if (!hdr) return;
          hdr.style.opacity = '0'; hdr.style.transform = 'translateX(-12px)';
          setTimeout(() => {
            hdr.style.transition = 'opacity 0.22s cubic-bezier(0.34,1.1,0.64,1), transform 0.24s cubic-bezier(0.34,1.1,0.64,1)';
            hdr.style.opacity = '1'; hdr.style.transform = 'none';
            setTimeout(() => hdr.style.transition = '', 260);
          }, i * 60);
        });
      });
      return result;
    };
    window.loadDiscoContent._dFxPatched = true;
  }

  /* ── OPTIMISTIC FILTER CHIPS ── */
  const _origDF = window.discoFilter;
  if (typeof _origDF === 'function' && !_origDF._dFxChip) {
    window.discoFilter = function(btn) {
      document.querySelectorAll('.disco-nav-item').forEach(b => b.classList.remove('mf-chip-optimistic'));
      btn.classList.add('mf-chip-optimistic');
      btn.style.transform = 'scale(0.93)';
      setTimeout(() => {
        btn.style.transition = 'transform 0.22s cubic-bezier(0.34,1.4,0.64,1)';
        btn.style.transform = '';
        setTimeout(() => btn.style.transition = '', 250);
      }, 60);
      return _origDF.apply(this, arguments);
    };
    window.discoFilter._dFxChip = true;
  }

  /* ── FILTER CHIPS STAGGER ── */
  function staggerFilterChips() {
    const chips = [...document.querySelectorAll('.disco-nav-item:not([data-chip-s])')];
    chips.forEach((chip, i) => {
      chip.dataset.chipS = '1';
      chip.style.opacity = '0'; chip.style.transform = 'translateX(-10px) scale(0.92)';
      setTimeout(() => {
        chip.style.transition = 'opacity 0.2s cubic-bezier(0.34,1.1,0.64,1), transform 0.22s cubic-bezier(0.34,1.15,0.64,1)';
        chip.style.opacity = '1'; chip.style.transform = 'none';
        setTimeout(() => chip.style.transition = '', 250);
      }, i * 50);
    });
  }

  /* ── CONTENT CHANGE OBSERVER ── */
  const bodyEl = document.getElementById('discoBody');
  if (bodyEl) {
    new MutationObserver(() => {
      if (st.open && st.kbActive) {
        st.rows = getRows();
        if (!st.rows[st.rowIdx]) { st.rowIdx = 0; st.cardIdx = 0; if (st.rows.length) setFocus(0, 0); }
      }
    }).observe(bodyEl, { childList: true });
  }

  console.info('[MujFlix FX Engine v3.0] Disco KB Nav + Skeleton + Stagger + Optimistic + Typography');
})(); // end MujFlixDiscoFX

// ── CINEMA BARS: hover-reveal při pohybu myši ve fullscreenu ──
(function() {
    let _cinBarTimer = null;
    let _cinMouseRaf = false;
    document.addEventListener('mousemove', function(e) {
        if (_cinMouseRaf) return;
        _cinMouseRaf = true;
        requestAnimationFrame(function() {
            _cinMouseRaf = false;
            const modal = document.getElementById('cinemaModal');
            if (!modal || modal.style.display === 'none') return;
            const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
            if (!isFs) return;

            const top = document.getElementById('cinemaTopBar');
            const bot = document.getElementById('cinemaBottomBar');
            const h = window.innerHeight;
            const y = e.clientY;

            if (top) top.style.opacity = y < h * 0.22 ? '1' : '0';
            if (bot) bot.style.opacity = y > h * 0.78 ? '1' : '0';
            if (top) top.style.pointerEvents = y < h * 0.22 ? 'auto' : 'none';
            if (bot) bot.style.pointerEvents = y > h * 0.78 ? 'auto' : 'none';

            clearTimeout(_cinBarTimer);
            _cinBarTimer = setTimeout(function() {
                if (top) { top.style.opacity = '0'; top.style.pointerEvents = 'none'; }
                if (bot) { bot.style.opacity = '0'; bot.style.pointerEvents = 'none'; }
            }, 2500);
        });
    });
})();
