/* ══════════════════════════════════════════════════════════════
 * MůjFlix Cinema Player v2
 * Samostatný přehrávač s podporou více zdrojů a navigací epizod.
 *
 * Zdroje filmů:  Bombuj, Prehrajto.cz, Uzi.la
 * Zdroje seriálů: SvetSerialu, Bombuj, Prehrajto.cz, Uzi.la
 * ══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var modal, frame, titleNode, sourceLabelNode, sourceCounterNode;
  var tvBar, epGridPanel, epGridBody;
  var current = null; // { tmdbId, title, type, season, episode, sourceIdx, localSlug, year, tried: Set }

  /* ── Helpery na slugy / dotazy ───────────────────────────── */
  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function stripDiacritics(s) {
    return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // Dash-slug — použij globální _czSlug z app.js (stejná logika jako
  // pro Bombuj/SvetSerialu), s lokálním fallbackem pro jistotu.
  function daslug(value) {
    if (typeof window._czSlug === "function") return window._czSlug(value);
    if (typeof _czSlug === "function") {
      try {
        return _czSlug(value);
      } catch (e) {}
    }
    return stripDiacritics(String(value || ""))
      .toLowerCase()
      .replace(/[':.]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Slug pro vyhledávací dotaz (mezery zůstávají mezerami → %20)
  function searchQuery(value) {
    return stripDiacritics(String(value || ""))
      .toLowerCase()
      .replace(/[^a-z0-9\s]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function cleanTitle(t) {
    return String(t || "").replace(/\s*[—–-]+\s*S\d+E\d+.*/i, "").trim();
  }

  /* ── URL buildery pro filmy ──────────────────────────────── */
  function bombujMovieUrl(title, year) {
    if (typeof window._bombujMovieUrlVariants === "function") {
      try {
        var arr = window._bombujMovieUrlVariants(title, year);
        if (arr && arr[0]) return arr[0];
      } catch (e) {}
    }
    var s = daslug(title);
    if (!s) return "https://www.bombuj.si/?s=" + encodeURIComponent(title || "");
    return year
      ? "https://www.bombuj.si/online-film-" + s + "-" + encodeURIComponent(year)
      : "https://www.bombuj.si/online-film-" + s;
  }

  function bombujMovieUrlNoYear(title) {
    var s = daslug(title);
    return s
      ? "https://www.bombuj.si/online-film-" + s
      : "https://www.bombuj.si/?s=" + encodeURIComponent(title || "");
  }

  function prehrajtoUrl(query) {
    return "https://prehrajto.cz/hledej/" + encodeURIComponent(searchQuery(query));
  }

  function uziMovieUrl(title) {
    var s = daslug(title);
    return s ? "https://uzi.la/p/" + s : "https://uzi.la/?s=" + encodeURIComponent(title || "");
  }

  /* ── URL buildery pro seriály (season/episode) ───────────── */
  function svetSerialuUrl(title, season, episode, siteSlug) {
    if (typeof window._svetSerialuSlugVariants === "function") {
      try {
        var variants = window._svetSerialuSlugVariants(siteSlug, title);
        if (variants && variants[0]) {
          return "https://svetserialu.to/serial/" + variants[0] + "/s" + pad2(season) + "e" + pad2(episode);
        }
      } catch (e) {}
    }
    var s = daslug(title);
    return s
      ? "https://svetserialu.to/serial/" + s + "/s" + pad2(season) + "e" + pad2(episode)
      : "https://svetserialu.to/?s=" + encodeURIComponent(title || "");
  }

  function bombujTvUrl(title, season, episode) {
    var s = daslug(title);
    return s
      ? "https://serialy.bombuj.si/serial/" + s + "-" + season + "x" + pad2(episode)
      : "https://serialy.bombuj.si/?s=" + encodeURIComponent(title || "");
  }

  function prehrajtoTvUrl(title, season, episode) {
    return prehrajtoUrl(title + " S" + pad2(season) + "E" + pad2(episode));
  }

  function uziTvUrl(title, season, episode) {
    var s = daslug(title);
    return s
      ? "https://uzi.la/p/" + s + "-s" + pad2(season) + "e" + pad2(episode)
      : "https://uzi.la/?s=" + encodeURIComponent(title || "");
  }

  /* ── Seznamy zdrojů ───────────────────────────────────────── */
  var MOVIE_SOURCES = [
    { id: "bombuj", label: "Bombuj", build: function (t, y) { return bombujMovieUrl(t, y); } },
    { id: "prehrajto", label: "Prehrajto.cz", build: function (t) { return prehrajtoUrl(t); } },
    { id: "uzila", label: "Uzi.la", build: function (t) { return uziMovieUrl(t); } }
  ];

  var TV_SOURCES = [
    { id: "svetserialu", label: "SvetSerialu", build: function (t, s, e, slug) { return svetSerialuUrl(t, s, e, slug); } },
    { id: "bombuj", label: "Bombuj", build: function (t, s, e) { return bombujTvUrl(t, s, e); } },
    { id: "prehrajto", label: "Prehrajto.cz", build: function (t, s, e) { return prehrajtoTvUrl(t, s, e); } },
    { id: "uzila", label: "Uzi.la", build: function (t, s, e) { return uziTvUrl(t, s, e); } }
  ];

  function sourcesFor(type) {
    return type === "movie" ? MOVIE_SOURCES : TV_SOURCES;
  }

  function buildUrl() {
    var sources = sourcesFor(current.type);
    var src = sources[current.sourceIdx];
    if (current.type === "movie") {
      return src.build(current.title, current.year);
    }
    return src.build(current.title, current.season, current.episode, current.localSlug);
  }

  /* ── Napojení na appku (watched stav, seznam seriálů) ────── */
  function appGetWatched() {
    try {
      return typeof getWatched === "function" ? getWatched() : {};
    } catch (e) {
      return {};
    }
  }

  function appDb() {
    try {
      return typeof db !== "undefined" ? db : null;
    } catch (e) {
      return null;
    }
  }

  function appTotalSeasons(slug) {
    try {
      return typeof totalSeasons === "function" ? totalSeasons(slug) : 1;
    } catch (e) {
      return 1;
    }
  }

  function appEpsInSeason(slug, season) {
    try {
      return typeof epsInSeason === "function" ? epsInSeason(slug, season) : (current.totalEps[season] || 20);
    } catch (e) {
      return current.totalEps[season] || 20;
    }
  }

  function appMarkWatched(uid) {
    try {
      if (typeof markWatched === "function") markWatched(uid);
    } catch (e) {}
  }

  function isEpWatched(season, episode) {
    if (!current.localSlug) return false;
    var w = appGetWatched();
    return !!w[current.localSlug + "-S" + season + "-E" + episode];
  }

  // Zjisti počet sezón/epizod — z lokální db, jinak dotažením z TMDB (fallback).
  function ensureEpCounts(cb) {
    if (current.localSlug && appDb() && appDb()[current.localSlug]) {
      current.totalSeasonsCount = appTotalSeasons(current.localSlug);
      current.epCountFn = function (s) { return appEpsInSeason(current.localSlug, s); };
      cb && cb();
      return;
    }
    // fallback: TMDB
    var key = (typeof TMDB_KEY !== "undefined" && TMDB_KEY) || null;
    if (key && current.tmdbId && !isNaN(parseInt(current.tmdbId, 10))) {
      fetch("https://api.themoviedb.org/3/tv/" + current.tmdbId + "?api_key=" + key + "&language=cs")
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          if (data) {
            current.totalSeasonsCount = data.number_of_seasons || 1;
            current.totalEps = {};
            (data.seasons || []).forEach(function (s) {
              if (s.season_number > 0) current.totalEps[s.season_number] = s.episode_count;
            });
            current.epCountFn = function (s) { return current.totalEps[s] || 20; };
          }
          cb && cb();
        })
        .catch(function () { cb && cb(); });
    } else {
      current.totalSeasonsCount = current.totalSeasonsCount || 20;
      current.epCountFn = current.epCountFn || function () { return 20; };
      cb && cb();
    }
  }

  function findNextSeriesSlug() {
    var d = appDb();
    if (!d || !current.localSlug) return null;
    var keys = Object.keys(d);
    var idx = keys.indexOf(current.localSlug);
    if (idx === -1) return null;
    for (var i = 1; i <= keys.length; i++) {
      var candidate = keys[(idx + i) % keys.length];
      if (candidate !== current.localSlug) return candidate;
    }
    return null;
  }

  /* ── Modal DOM ────────────────────────────────────────────── */
  function ensureModal() {
    if (modal) return;
    modal = document.createElement("div");
    modal.id = "mfStandaloneCinema";
    modal.innerHTML =
      '<div class="mf-standalone-cinema-top">' +
        '<div><strong id="mfStandaloneCinemaTitle"></strong><span id="mfStandaloneCinemaSource"></span></div>' +
        '<button type="button" id="mfStandaloneCinemaClose" aria-label="Zavřít">×</button>' +
      "</div>" +

      '<div class="mf-cin-sourcebar">' +
        '<button type="button" class="mf-cin-src-arrow" id="mfCinSrcPrev" aria-label="Předchozí zdroj">‹</button>' +
        '<div class="mf-cin-src-info">' +
          '<span class="mf-cin-src-label" id="mfCinSrcLabel"></span>' +
          '<span class="mf-cin-src-counter" id="mfCinSrcCounter"></span>' +
        "</div>" +
        '<button type="button" class="mf-cin-src-arrow" id="mfCinSrcNext" aria-label="Další zdroj">›</button>' +
        '<button type="button" class="mf-cin-switch-btn" id="mfCinSwitchSrc">🔄 Zkusit jiný zdroj</button>' +
      "</div>" +

      '<div class="mf-cin-tvbar" id="mfCinTvBar" style="display:none">' +
        '<button type="button" class="mf-cin-ep-btn" id="mfCinPrevEp">⏮ Předchozí epizoda</button>' +
        '<span class="mf-cin-ep-current" id="mfCinEpCurrent"></span>' +
        '<button type="button" class="mf-cin-ep-btn" id="mfCinNextEp">Další epizoda ⏭</button>' +
        '<button type="button" class="mf-cin-ep-btn mf-cin-ep-pick" id="mfCinPickEp">📺 Vybrat epizodu</button>' +
        '<button type="button" class="mf-cin-ep-btn mf-cin-next-series" id="mfCinNextSeries">⏭⏭ Další seriál</button>' +
      "</div>" +

      '<div class="mf-cin-epgrid" id="mfCinEpGrid" style="display:none">' +
        '<div class="mf-cin-epgrid-seasons" id="mfCinEpGridSeasons"></div>' +
        '<div class="mf-cin-epgrid-body" id="mfCinEpGridBody"></div>' +
      "</div>" +

      '<div class="mf-standalone-cinema-frame"><div id="mfStandaloneCinemaFrame"></div></div>' +
      '<div class="mf-standalone-cinema-actions">' +
        '<button type="button" id="mfStandaloneCinemaNoYear">Zkusit bez roku</button>' +
        '<a id="mfStandaloneCinemaExternal" target="_blank" rel="noopener">Otevřít zdroj v nové kartě</a>' +
      "</div>";
    document.body.appendChild(modal);

    frame = modal.querySelector("#mfStandaloneCinemaFrame");
    titleNode = modal.querySelector("#mfStandaloneCinemaTitle");
    sourceLabelNode = modal.querySelector("#mfCinSrcLabel");
    sourceCounterNode = modal.querySelector("#mfCinSrcCounter");
    tvBar = modal.querySelector("#mfCinTvBar");
    epGridPanel = modal.querySelector("#mfCinEpGrid");
    epGridBody = modal.querySelector("#mfCinEpGridBody");

    modal.querySelector("#mfStandaloneCinemaClose").onclick = close;
    modal.querySelector("#mfStandaloneCinemaNoYear").onclick = function () {
      if (current && current.type === "movie") loadUrl(bombujMovieUrlNoYear(current.title), "Bombuj");
    };
    modal.querySelector("#mfCinSrcPrev").onclick = function () { cycleSource(-1); };
    modal.querySelector("#mfCinSrcNext").onclick = function () { cycleSource(1); };
    modal.querySelector("#mfCinSwitchSrc").onclick = function () { cycleSource(1); };
    modal.querySelector("#mfCinPrevEp").onclick = function () { stepEpisode(-1); };
    modal.querySelector("#mfCinNextEp").onclick = function () { stepEpisode(1); };
    modal.querySelector("#mfCinPickEp").onclick = toggleEpGrid;
    modal.querySelector("#mfCinNextSeries").onclick = goNextSeries;

    modal.addEventListener("click", function (event) {
      if (event.target === modal) close();
    });
  }

  /* ── Zdroje: přepínání + počítadlo ────────────────────────── */
  function cycleSource(dir) {
    var sources = sourcesFor(current.type);
    current.sourceIdx = (current.sourceIdx + dir + sources.length) % sources.length;
    renderCurrent();
  }

  function renderSourceBar() {
    var sources = sourcesFor(current.type);
    var src = sources[current.sourceIdx];
    current.tried.add(current.sourceIdx);
    var used = current.tried.size;
    var total = sources.length;
    var remaining = total - used;
    sourceLabelNode.textContent = src.label + " (" + (current.sourceIdx + 1) + "/" + total + ")";
    sourceCounterNode.textContent =
      "Vyzkoušeno " + used + " z " + total + (remaining > 0 ? " · zbývá ještě " + remaining : " · vyzkoušeny všechny");
    modal.querySelector("#mfStandaloneCinemaNoYear").style.display =
      current.type === "movie" && src.id === "bombuj" && current.year ? "inline-flex" : "none";
  }

  /* ── TV navigace (epizody) ────────────────────────────────── */
  function updateEpCurrentLabel() {
    modal.querySelector("#mfCinEpCurrent").textContent =
      "S" + pad2(current.season) + " · E" + pad2(current.episode);
  }

  function stepEpisode(dir) {
    ensureEpCounts(function () {
      var epsInThis = current.epCountFn(current.season);
      var newEp = current.episode + dir;
      var newSeason = current.season;
      if (newEp < 1) {
        if (newSeason > 1) {
          newSeason -= 1;
          newEp = current.epCountFn(newSeason);
        } else {
          newEp = 1;
        }
      } else if (newEp > epsInThis) {
        if (!current.totalSeasonsCount || newSeason < current.totalSeasonsCount) {
          newSeason += 1;
          newEp = 1;
        } else {
          newEp = epsInThis;
        }
      }
      current.season = newSeason;
      current.episode = newEp;
      if (current.localSlug) appMarkWatched(current.localSlug + "-S" + current.season + "-E" + current.episode);
      current.tried = new Set();
      current.sourceIdx = 0;
      renderCurrent();
      if (epGridPanel.style.display !== "none") renderEpGrid();
    });
  }

  function goNextSeries() {
    var nextSlug = findNextSeriesSlug();
    if (!nextSlug) {
      if (typeof showToast === "function") showToast("Žádný další seriál v seznamu nenalezen", "error");
      return;
    }
    var d = appDb();
    var entry = d[nextSlug];
    var next = null;
    try {
      next = typeof findNextEp === "function" ? findNextEp(nextSlug) : null;
    } catch (e) {}
    var season = next ? next.se : 1;
    var episode = next ? next.ep : 1;
    if (typeof showToast === "function") showToast("▶ " + (entry.name || nextSlug), "success");
    open(entry.tmdbId || nextSlug, entry.name || nextSlug, "tv_ep", {
      season: season,
      episode: episode,
      localSlug: nextSlug
    });
  }

  /* ── Panel výběru konkrétní epizody (se stavem zhlédnutí) ─── */
  function toggleEpGrid() {
    var show = epGridPanel.style.display === "none";
    epGridPanel.style.display = show ? "flex" : "none";
    if (show) {
      ensureEpCounts(function () {
        renderEpGrid();
      });
    }
  }

  function renderEpGrid() {
    var seasonsBar = modal.querySelector("#mfCinEpGridSeasons");
    var totalS = current.totalSeasonsCount || 1;
    seasonsBar.innerHTML = "";
    for (var s = 1; s <= totalS; s++) {
      (function (s) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "mf-cin-season-chip" + (s === current.season ? " active" : "");
        b.textContent = "S" + pad2(s);
        b.onclick = function () {
          current.season = s;
          renderEpGrid();
        };
        seasonsBar.appendChild(b);
      })(s);
    }

    var epsCount = current.epCountFn ? current.epCountFn(current.season) : 20;
    epGridBody.innerHTML = "";
    for (var e = 1; e <= epsCount; e++) {
      (function (e) {
        var watched = isEpWatched(current.season, e);
        var b = document.createElement("button");
        b.type = "button";
        b.className =
          "mf-cin-ep-chip" +
          (watched ? " watched" : "") +
          (e === current.episode ? " current" : "");
        b.innerHTML =
          '<span class="mf-cin-ep-chip-num">E' + pad2(e) + "</span>" +
          '<span class="mf-cin-ep-chip-mark">' + (watched ? "✓" : "") + "</span>";
        b.title = watched ? "Zhlédnuto" : "Nezhlédnuto";
        b.onclick = function () {
          current.episode = e;
          if (current.localSlug) appMarkWatched(current.localSlug + "-S" + current.season + "-E" + e);
          current.tried = new Set();
          current.sourceIdx = 0;
          renderCurrent();
          renderEpGrid();
        };
        epGridBody.appendChild(b);
      })(e);
    }
  }

  /* ── Vykreslení / načtení přehrávače ──────────────────────── */
  function loadUrl(url, label) {
    frame.classList.remove("mf-cinema-ready");
    frame.innerHTML =
      '<div class="mf-cinema-skeleton" role="status" aria-live="polite">' +
        '<div class="mf-cinema-skeleton-mark">▶</div>' +
        '<div class="mf-cinema-skeleton-line mf-cinema-skeleton-line-title"></div>' +
        '<div class="mf-cinema-skeleton-line mf-cinema-skeleton-line-meta"></div>' +
        "<span>Načítám přehrávač…</span>" +
      "</div>" +
      '<iframe title="Cinema Mode" allow="autoplay; fullscreen" referrerpolicy="no-referrer" src="' +
      String(url).replace(/"/g, "&quot;") + '"></iframe>';
    var playerFrame = frame.querySelector("iframe");
    playerFrame.addEventListener(
      "load",
      function () {
        frame.classList.add("mf-cinema-ready");
        var skeleton = frame.querySelector(".mf-cinema-skeleton");
        if (skeleton) skeleton.setAttribute("aria-hidden", "true");
      },
      { once: true }
    );
    modal.querySelector("#mfStandaloneCinemaExternal").href = url;
  }

  function renderCurrent() {
    var url = buildUrl();
    var sources = sourcesFor(current.type);
    var label = sources[current.sourceIdx].label;
    modal.querySelector("#mfStandaloneCinemaSource").textContent = label;
    loadUrl(url, label);
    renderSourceBar();
    if (current.type === "tv") {
      tvBar.style.display = "flex";
      updateEpCurrentLabel();
      modal.querySelector("#mfCinNextSeries").style.display = findNextSeriesSlug() ? "inline-flex" : "none";
    } else {
      tvBar.style.display = "none";
      epGridPanel.style.display = "none";
    }
  }

  /* ── Veřejné API ──────────────────────────────────────────── */
  function open(tmdbId, title, type, extra) {
    ensureModal();
    var rawId = String(tmdbId || "");
    var parts = rawId.split("/");
    var isEpisode = type === "tv_ep" || parts.length === 3;
    var baseId = isEpisode ? parts[0] : rawId;
    var year = window._cinYear || null;
    var localSlug =
      (extra && extra.localSlug) ||
      window._cinSiteSlug ||
      (typeof activeSeries !== "undefined" && activeSeries ? activeSeries : null);

    current = {
      tmdbId: baseId,
      title: cleanTitle(title),
      type: isEpisode || type === "tv" ? "tv" : "movie",
      season: extra && extra.season ? extra.season : (isEpisode ? parseInt(parts[1], 10) || 1 : 1),
      episode: extra && extra.episode ? extra.episode : (isEpisode ? parseInt(parts[2], 10) || 1 : 1),
      sourceIdx: 0,
      year: year,
      localSlug: localSlug,
      totalSeasonsCount: null,
      totalEps: {},
      epCountFn: null,
      tried: new Set()
    };
    window._cinSiteSlug = null;
    window._cinYear = null;

    titleNode.textContent = current.title || "Cinema Mode";
    modal.classList.add("open");
    document.body.style.overflow = "hidden";

    renderCurrent();
    if (current.type === "tv") ensureEpCounts(function () {});
  }

  function close() {
    if (!modal) return;
    modal.classList.remove("open");
    frame.innerHTML = "";
    if (epGridPanel) epGridPanel.style.display = "none";
    document.body.style.overflow = "";
  }

  window.MFCinemaPlayer = { open: open, close: close };
})();
