/**
 * MůjFlix — Discover TV → Series Modal Patch v2
 * ════════════════════════════════════════════════
 * Zachytí openMovieInCinema — pokud je typ "tv" (ne "tv_ep", ne "movie"),
 * otevře series modal místo cinema playeru.
 */
(function () {
  'use strict';

  if (window._mfDiscoverTvPatchLoaded) return;
  window._mfDiscoverTvPatchLoaded = true;

  const IMG_P = 'https://image.tmdb.org/t/p/w342';
  const IMG_B = 'https://image.tmdb.org/t/p/w780';

  function waitForReady(cb, tries) {
    tries = tries || 0;
    if (
      typeof window.openMovieInCinema === 'function' &&
      typeof window.openSeries === 'function' &&
      typeof window.db !== 'undefined'
    ) {
      cb();
    } else if (tries < 80) {
      setTimeout(function () { waitForReady(cb, tries + 1); }, 150);
    } else {
      console.warn('[MFDiscoverTV] Timeout — nenalezeny funkce');
    }
  }

  waitForReady(function () {
    var _origCinema = window.openMovieInCinema;

    window.openMovieInCinema = function (tmdbId, title, type) {
      // Normalizuj typ (stejná logika jako originál)
      var resolvedType = type || 'movie';

      // Zachyť POUZE čisté TV seriály z Discover — ne epizody, ne filmy
      if (resolvedType === 'tv' && !String(tmdbId).includes('/')) {
        openDiscoverTvInModal(tmdbId, title);
        return;
      }

      // Vše ostatní → původní cinema player
      _origCinema.apply(this, arguments);
    };

    console.log('[MFDiscoverTV] v2 patch aktivní — TV seriály → Series Modal');
  });

  // ── Načti TMDB, vytvoř db slot, otevři modal ──
  async function openDiscoverTvInModal(tmdbId, title) {
    var slug = '__discover_tv_' + tmdbId;

    // Cache hit
    if (window.db[slug]) {
      _openModal(slug);
      return;
    }

    if (typeof showToast === 'function') showToast('📺 Načítám seriál…', 2000);

    try {
      var data = await tmdbGet('/tv/' + tmdbId + '?language=cs');
      if (!data || data.success === false) throw new Error('no data');

      var numSeasons  = data.number_of_seasons  || 1;
      var numEpisodes = data.number_of_episodes || 0;
      var poster      = data.poster_path   ? IMG_P + data.poster_path   : '';
      var backdrop    = data.backdrop_path ? IMG_B + data.backdrop_path : poster;
      var name        = data.name || title;
      var genres      = (data.genres || []).map(function (g) { return g.name; });

      // Minimální db záznam
      var record = {
        name:        name,
        tmdbId:      tmdbId,
        totalEps:    numEpisodes,
        poster:      poster,
        _poster:     poster,
        _backdrop:   backdrop,
        _genres:     genres,
        _isDiscover: true,
      };

      // Přidej sloty epizod pro každou sezónu (aby epsInSeason() fungovalo)
      var seasons = data.seasons || [];
      for (var s = 1; s <= numSeasons; s++) {
        var seasonData = seasons.find(function (x) { return x.season_number === s; });
        var epCount = (seasonData && seasonData.episode_count) ? seasonData.episode_count : 1;
        for (var e = 1; e <= epCount; e++) {
          record[slug + '-S' + s + '-E' + e] = { se: s, ep: e };
        }
      }

      window.db[slug] = record;
      _openModal(slug);

    } catch (err) {
      console.error('[MFDiscoverTV] Chyba:', err);
      if (typeof showToast === 'function') showToast('⚠ Nepodařilo se načíst seriál', 3000);
    }
  }

  function _openModal(slug) {
    if (typeof closeUniverse === 'function') closeUniverse();

    setTimeout(function () {
      if (typeof openSeries === 'function') openSeries(slug);
    }, 150);

    _scheduleCleanup(slug);
  }

  function _scheduleCleanup(slug) {
    var modal = document.getElementById('seriesModal');
    if (!modal) return;
    var observer = new MutationObserver(function () {
      if (!modal.classList.contains('open') && window.db[slug] && window.db[slug]._isDiscover) {
        delete window.db[slug];
        observer.disconnect();
      }
    });
    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

})();
