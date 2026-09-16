/* MůjFlix Cinema Player
 * A small, independent player shell for the two supported sources.
 */
(function () {
  "use strict";

  var modal;
  var frame;
  var titleNode;
  var sourceNode;
  var current;

  function slug(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function movieUrl(title, year) {
    var base = "https://www.bombuj.si/online-film-" + slug(title);
    return year ? base + "-" + encodeURIComponent(year) : base;
  }

  function tvUrl(title, season, episode) {
    return "https://svetserialu.to/serial/" + slug(title) +
      "/s" + String(season).padStart(2, "0") +
      "e" + String(episode).padStart(2, "0");
  }

  function ensureModal() {
    if (modal) return;
    modal = document.createElement("div");
    modal.id = "mfStandaloneCinema";
    modal.innerHTML =
      '<div class="mf-standalone-cinema-top">' +
        '<div><strong id="mfStandaloneCinemaTitle"></strong><span id="mfStandaloneCinemaSource"></span></div>' +
        '<button type="button" id="mfStandaloneCinemaClose" aria-label="Zavřít">×</button>' +
      "</div>" +
      '<div class="mf-standalone-cinema-frame"><div id="mfStandaloneCinemaFrame"></div></div>' +
      '<div class="mf-standalone-cinema-actions">' +
        '<button type="button" id="mfStandaloneCinemaNoYear">Zkusit bez roku</button>' +
        '<a id="mfStandaloneCinemaExternal" target="_blank" rel="noopener">Otevřít zdroj v nové kartě</a>' +
      "</div>";
    document.body.appendChild(modal);
    frame = modal.querySelector("#mfStandaloneCinemaFrame");
    titleNode = modal.querySelector("#mfStandaloneCinemaTitle");
    sourceNode = modal.querySelector("#mfStandaloneCinemaSource");
    modal.querySelector("#mfStandaloneCinemaClose").onclick = close;
    modal.querySelector("#mfStandaloneCinemaNoYear").onclick = function () {
      if (current && current.type === "movie") showUrl(movieUrl(current.title, null), "Bombuj");
    };
    modal.addEventListener("click", function (event) {
      if (event.target === modal) close();
    });
  }

  function showUrl(url, source) {
    ensureModal();
    sourceNode.textContent = source;
    frame.innerHTML = '<iframe title="Cinema Mode" allow="autoplay; fullscreen" referrerpolicy="no-referrer" src="' +
      url.replace(/"/g, "&quot;") + '"></iframe>';
    modal.querySelector("#mfStandaloneCinemaExternal").href = url;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function open(tmdbId, title, type) {
    ensureModal();
    var rawId = String(tmdbId || "");
    var parts = rawId.split("/");
    var isEpisode = type === "tv_ep" || parts.length === 3;
    var year = window._cinYear || null;
    current = {
      title: String(title || "").replace(/\s*[—–-]+\s*S\d+E\d+.*/i, "").trim(),
      type: isEpisode || type === "tv" ? "tv" : "movie",
      season: isEpisode ? parseInt(parts[1], 10) || 1 : 1,
      episode: isEpisode ? parseInt(parts[2], 10) || 1 : 1
    };
    titleNode.textContent = current.title || "Cinema Mode";
    if (current.type === "tv") {
      showUrl(tvUrl(current.title, current.season, current.episode), "SvetSerialu");
      modal.querySelector("#mfStandaloneCinemaNoYear").style.display = "none";
    } else {
      showUrl(movieUrl(current.title, year), "Bombuj");
      modal.querySelector("#mfStandaloneCinemaNoYear").style.display = "inline-flex";
    }
    window._cinYear = null;
  }

  function close() {
    if (!modal) return;
    modal.classList.remove("open");
    frame.innerHTML = "";
    document.body.style.overflow = "";
  }

  window.MFCinemaPlayer = { open: open, close: close };
})();
