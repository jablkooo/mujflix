/* ══════════════════════════════════════════════════════════════
 * MůjFlix — Dock active-state fix
 *
 * Problém: v aplikaci existuje víc míst, která na klik na dolní
 * lištu reagují (inline onclick, delegovaný capture listener,
 * delegovaný data-hash listener, hashchange routing) a některé
 * z nich zapomínají zavolat setDockActive() nebo ho volají se
 * špatným ID. Výsledek: "Objevovat" se zvýrazní, ale "Domů" už ne.
 *
 * Řešení: přepíšeme window.setDockActive na jednu spolehlivou
 * implementaci a navíc po každém kliku / změně hashe / návratu
 * (back/forward) ještě jednou (s malým zpožděním, ať vyhraje nad
 * všemi staršími setTimeout(...,50) apod.) vynutíme správný stav
 * podle toho, na co uživatel reálně klikl nebo jaký je aktuální hash.
 * ══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  function applyActiveDock(id) {
    if (!id) return;
    document.querySelectorAll("#mfDock .dock-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.id === id);
    });
    window._mfActiveDockId = id;
  }

  // Přepiš globální setDockActive — všechna stará volání v app.js
  // (setDockActive("dockHome") atd.) automaticky použijí tuhle verzi,
  // protože jde o stejné globální jméno.
  window.setDockActive = function (id) {
    applyActiveDock(id);
  };

  function idForHash(hash) {
    var h = (hash || "").toLowerCase();
    if (h.indexOf("#filmy") === 0) return "dockFilmy";
    if (h.indexOf("#protebe") === 0 || h.indexOf("#watchlist") === 0) return "dockProtebe";
    if (h.indexOf("#profil") === 0) return "dockProfile";
    return "dockHome";
  }

  // Finální slovo po každém kliknutí na tlačítko v docku —
  // spustí se PO všech starších (rychlejších) handlerech.
  document.addEventListener(
    "click",
    function (e) {
      var btn = e.target && e.target.closest && e.target.closest("#mfDock .dock-btn");
      if (!btn || !btn.id) return;
      var clickedId = btn.id;
      setTimeout(function () {
        applyActiveDock(clickedId);
      }, 90);
    },
    false
  );

  // Synchronizace i při změně hashe (zpět/vpřed v prohlížeči, programové přesměrování).
  window.addEventListener("hashchange", function () {
    setTimeout(function () {
      applyActiveDock(idForHash(location.hash));
    }, 90);
  });

  // Počáteční stav po načtení stránky.
  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
      applyActiveDock(idForHash(location.hash || "#serialy"));
    }, 950);
  });

  // Sledování režimu Objevování: dock se schovává přes CSS
  // (body.discover-open), ale tady hlídáme, že se po ZAVŘENÍ
  // Objevování (ať už přes ✕, Esc, nebo cokoliv jiného, co tu
  // třídu smaže) lišta spolehlivě vrátí a zvýrazní se "Domů".
  var wasDiscoverOpen = document.body.classList.contains("discover-open");
  new MutationObserver(function () {
    var isDiscoverOpen = document.body.classList.contains("discover-open");
    if (wasDiscoverOpen && !isDiscoverOpen) {
      // Právě jsme opustili Objevování → jsme doma.
      setTimeout(function () {
        applyActiveDock("dockHome");
      }, 90);
    }
    wasDiscoverOpen = isDiscoverOpen;
  }).observe(document.body, { attributes: true, attributeFilter: ["class"] });

  console.info("[MůjFlix] ✓ Dock active-state fix načten");

  /* ── Umožnit výběr více žánrů v Objevování najednou ──
   * Původní discoFilter() při každém kliku smazal aktivní stav
   * VŠECH položek (typ i žánry) a zapnul jen tu jednu klikutou —
   * takže šlo vybrat vždy jen 1 žánr. Tady žánry (druhý parametr
   * neprázdný) přepínáme nezávisle na sobě (toggle), zatímco
   * volby typu (Vše/Filmy/Seriály, druhý parametr prázdný) se
   * chovají jako dřív — jsou vždy jen jedna aktivní a reset i
   * vybraných žánrů, aby šlo snadno začít znovu od "Vše".
   */
  window._mfActiveGenres = window._mfActiveGenres || [];
  if (typeof window.discoFilter === "function" && !window.discoFilter._mfMultiGenre) {
    var _origDiscoFilter = window.discoFilter;
    var mfMultiDiscoFilter = function (el, genre, type) {
      if (!genre) {
        // Tlačítko typu (Vše/Filmy/Seriály) — reset žánrů, chování jako dřív.
        window._mfActiveGenres = [];
        document.querySelectorAll(".disco-nav-item[onclick*=\"discoFilter\"]").forEach(function (item) {
          if (item !== el) item.classList.remove("active");
        });
        return _origDiscoFilter(el, genre, type);
      }
      // Tlačítko žánru — nezávislé přepínání (toggle).
      var idx = window._mfActiveGenres.indexOf(genre);
      if (idx >= 0) {
        window._mfActiveGenres.splice(idx, 1);
        el.classList.remove("active");
      } else {
        window._mfActiveGenres.push(genre);
        el.classList.add("active");
      }
      // Žánrový výběr ruší aktivní "Vše/Filmy/Seriály" tlačítka (jiná osa filtru).
      document.querySelectorAll(".disco-nav-item[onclick*=\"discoFilter(this, '', \"]").forEach(function (item) {
        item.classList.remove("active");
      });
      var combinedGenre = window._mfActiveGenres.join("|");
      try { _discoCurrent = { genre: combinedGenre, type: type }; } catch (e) {}
      var searchInput = document.getElementById("searchTitleInput");
      if (searchInput) searchInput.value = "";
      var clearBtn = document.getElementById("shClearBtn");
      if (clearBtn) clearBtn.style.display = "none";
      if (typeof loadDiscoContent === "function") loadDiscoContent(combinedGenre || "", type);
    };
    mfMultiDiscoFilter._mfMultiGenre = true;
    window.discoFilter = mfMultiDiscoFilter;
  }

  /* ── Domovské dlaždice (Simpsons/Griffinovi/South Park/Futurama)
   * podle toho, co člověk doopravdy sleduje ──
   * Standardně jsou 4 natvrdo dané. Tady je přeskládáme podle
   * skutečně odkoukaných epizod (z db katalogu) — kdo nic nekoukal,
   * tomu zůstanou výchozí 4 tituly.
   */
  function personalizeHomeTiles() {
    try {
      if (typeof db === "undefined" || typeof calcProgress !== "function") return;
      var wrappers = Array.prototype.slice.call(document.querySelectorAll("#mainMenu .ps-tile-wrapper[data-slug]"));
      if (!wrappers.length) return;
      var defaultOrder = wrappers.map(function (w) { return w.dataset.slug; });

      var ranked = Object.keys(db)
        .filter(function (slug) { return slug.indexOf("__dtv_") !== 0; })
        .map(function (slug) {
          var p = calcProgress(slug);
          return { slug: slug, seen: p.seen };
        })
        .filter(function (r) { return r.seen > 0; })
        .sort(function (a, b) { return b.seen - a.seen; });

      if (!ranked.length) return; // nikdo zatím nic nesledoval → necháme výchozí 4

      var chosen = ranked.slice(0, wrappers.length).map(function (r) { return r.slug; });
      defaultOrder.forEach(function (slug) {
        if (chosen.length >= wrappers.length) return;
        if (chosen.indexOf(slug) === -1) chosen.push(slug);
      });

      wrappers.forEach(function (wrapper, idx) {
        var newSlug = chosen[idx];
        var oldSlug = wrapper.dataset.slug;
        if (!newSlug || newSlug === oldSlug) return;
        var entry = db[newSlug];
        if (!entry) return;

        wrapper.dataset.slug = newSlug;
        wrapper.onclick = function () { if (typeof openSeries === "function") openSeries(newSlug); };
        wrapper.setAttribute("title", entry.name || newSlug);

        var img = wrapper.querySelector(".tile-bg");
        if (img) {
          img.id = "tile-bg-" + newSlug;
          img.alt = entry.name || newSlug;
          var poster = entry.poster || entry._poster || entry._backdrop;
          if (poster) {
            img.src = /^https?:/.test(poster) ? poster : "https://image.tmdb.org/t/p/w500" + poster;
            img.classList.remove("loaded");
          }
        }
        var prog = wrapper.querySelector(".tile-progress-fill");
        if (prog) prog.id = "prog-" + newSlug;

        var badge = wrapper.querySelector(".tile-continue-badge");
        if (badge) {
          badge.id = "cont-" + newSlug;
          var badgeText = badge.querySelector(".tcb-text");
          if (badgeText) badgeText.id = "cont-text-" + newSlug;
        }

        var wlBtn = wrapper.querySelector(".tile-watchlist-btn");
        if (wlBtn) {
          wlBtn.id = "wlbtn-" + newSlug;
          wlBtn.onclick = function (event) {
            event.stopPropagation();
            if (typeof toggleWatchlistItem === "function") toggleWatchlistItem(newSlug);
          };
        }
      });

      chosen.forEach(function (slug) {
        if (typeof updateTileProgress === "function") updateTileProgress(slug);
        if (typeof updateContinueBadge === "function") updateContinueBadge(slug);
      });
      if (typeof updateWatchlistBtns === "function") updateWatchlistBtns();
      if (typeof initTileEffects === "function") initTileEffects();
    } catch (err) {
      console.warn("[MůjFlix fix] personalizeHomeTiles selhalo", err);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(personalizeHomeTiles, 300);
  });

  /* ── Vypnutí onboarding otázky "Co tě baví?" po vytvoření profilu ── */
  document.addEventListener("DOMContentLoaded", function () {
    if (window.ProfileGate && typeof window.ProfileGate.openOnboarding === "function") {
      window.ProfileGate.openOnboarding = function () {
        // Nic nezobrazuj — otázka na žánry při zakládání profilu je vypnutá.
      };
    }
  });

  /* ── Oprava: seriály otevřené z Objevování ukazovaly jen 1 sezónu ──
   * openDiscoverTv() správně naplní db[slug] daty o všech epizodách
   * a sezónách z TMDB, ale nezapíše počty do epsBySeason[slug] —
   * což je tabulka, ze které si totalSeasons()/epsInSeason() (a tedy
   * i výběr sezóny v modálu seriálu) berou, kolik sezón/epizod má
   * zobrazit. Bez ní appka spadne na výchozích "1 sezóna / 10 epizod".
   * Dopočítáme to tady z klíčů, co už db[slug] obsahuje.
   */
  if (typeof window.openDiscoverTv === "function") {
    var _origOpenDiscoverTv = window.openDiscoverTv;
    window.openDiscoverTv = function (tmdbId, title) {
      var result = _origOpenDiscoverTv(tmdbId, title);
      Promise.resolve(result).then(function () {
        try {
          var slug = "__dtv_" + tmdbId;
          if (typeof db === "undefined" || !db[slug] || typeof epsBySeason === "undefined") return;
          var rec = db[slug];
          var prefix = slug + "-S";
          var counts = {};
          Object.keys(rec).forEach(function (k) {
            if (k.indexOf(prefix) !== 0) return;
            var m = k.match(/-S(\d+)-E(\d+)$/);
            if (!m) return;
            var s = parseInt(m[1], 10), e = parseInt(m[2], 10);
            counts[s] = Math.max(counts[s] || 0, e);
          });
          var maxSeason = 0;
          Object.keys(counts).forEach(function (s) { if (+s > maxSeason) maxSeason = +s; });
          if (maxSeason > 0) {
            var arr = [];
            for (var s = 1; s <= maxSeason; s++) arr.push(counts[s] || 1);
            epsBySeason[slug] = arr;
          }
        } catch (e) {
          console.warn("[MůjFlix fix] epsBySeason patch selhal", e);
        }
      });
      return result;
    };
  }
})();
