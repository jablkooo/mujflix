/**
 * MůjFlix — Discover TV → Series Modal Patch
 * ═══════════════════════════════════════════
 * Seriály z Objevování se otevírají v series modalu (stejný styl jako The Simpsons),
 * nikoliv v cinema/finder flow.
 *
 * Jak to funguje:
 * 1. Zachytí _showCinemaOrFinderChoice volání pro TV typ
 * 2. Stáhne detaily seriálu z TMDB (počet sérií, epizod, backdrop, poster...)
 * 3. Vytvoří dočasný záznam v db pod slugem "__discover_tv_<tmdbId>"
 * 4. Otevře standardní series modal
 * 5. Dočasný záznam se smaže při zavření modalu
 */
(function () {
  'use strict';

  if (window._mfDiscoverTvPatchLoaded) return;
  window._mfDiscoverTvPatchLoaded = true;

  const IMG_P = 'https://image.tmdb.org/t/p/w342';
  const IMG_B = 'https://image.tmdb.org/t/p/w780';

  // ── Počkej na openSeries a _showCinemaOrFinderChoice ──
  function waitForReady(cb, tries = 0) {
    if (
      typeof window.openSeries === 'function' &&
      typeof window._showCinemaOrFinderChoice === 'function' &&
      typeof window.db !== 'undefined'
    ) {
      cb();
    } else if (tries < 60) {
      setTimeout(() => waitForReady(cb, tries + 1), 200);
    } else {
      console.warn('[MFDiscoverTV] Timeout — funkce nenalezeny');
    }
  }

  waitForReady(() => {
    const _origChoice = window._showCinemaOrFinderChoice;

    window._showCinemaOrFinderChoice = function (tmdbId, title, type, fallbackUrl) {
      // Pouze TV seriály z Discover — ne epizody (tv_ep), ne filmy
      if (type === 'tv') {
        openDiscoverTvInModal(tmdbId, title);
        return;
      }
      // Vše ostatní (movie, tv_ep...) → původní chování
      _origChoice.apply(this, arguments);
    };

    console.log('[MFDiscoverTV] Patch aktivní — TV z Objevování → Series Modal');
  });

  // ── Hlavní funkce: načti TMDB data, vytvoř db slot, otevři modal ──
  async function openDiscoverTvInModal(tmdbId, title) {
    const slug = `__discover_tv_${tmdbId}`;

    // Pokud už záznam existuje (cache), rovnou otevři
    if (window.db[slug]) {
      _openModal(slug);
      return;
    }

    // Loading toast
    if (typeof showToast === 'function') showToast('📺 Načítám seriál…', 2000);

    try {
      const data = await tmdbGet(`/tv/${tmdbId}?language=cs`);
      if (!data || data.success === false) throw new Error('TMDB no data');

      const numSeasons  = data.number_of_seasons  || 1;
      const numEpisodes = data.number_of_episodes || 0;
      const poster      = data.poster_path   ? IMG_P + data.poster_path   : '';
      const backdrop    = data.backdrop_path ? IMG_B + data.backdrop_path : poster;
      const name        = data.name || title;
      const genres      = (data.genres || []).map(g => g.name);

      // Vytvoř minimální db záznam — stačí pro renderEpisodes + series modal
      // Epizody nejsou hard-coded, TMDB je načte dynamicky při otevření sezóny
      const record = {
        name,
        tmdbId,
        totalEps: numEpisodes,
        poster,
        _poster:   poster,
        _backdrop: backdrop,
        _genres:   genres,
        _isDiscover: true,   // příznak pro pozdější úklid
      };

      // Přidej prázdné sloty pro každou sezónu (aby totalSeasons fungovalo)
      for (let s = 1; s <= numSeasons; s++) {
        // Přidej alespoň 1 placeholder ep aby epsInSeason > 0
        const eps = data.seasons?.find(x => x.season_number === s)?.episode_count || 1;
        for (let e = 1; e <= eps; e++) {
          record[`${slug}-S${s}-E${e}`] = { se: s, ep: e };
        }
      }

      window.db[slug] = record;
      _openModal(slug);

    } catch (err) {
      console.error('[MFDiscoverTV] Chyba při načítání:', err);
      if (typeof showToast === 'function') showToast('⚠ Nepodařilo se načíst seriál', 3000);
    }
  }

  function _openModal(slug) {
    if (typeof closeUniverse === 'function') closeUniverse();

    // Krátká prodleva aby se zavřel discover panel
    setTimeout(() => {
      if (typeof openSeries === 'function') {
        openSeries(slug);
      }
    }, 150);

    // Úklid: smaž dočasný záznam po zavření modalu
    _scheduleCleanup(slug);
  }

  function _scheduleCleanup(slug) {
    const modal = document.getElementById('seriesModal');
    if (!modal) return;

    const observer = new MutationObserver(() => {
      if (!modal.classList.contains('open') && window.db[slug]?._isDiscover) {
        delete window.db[slug];
        observer.disconnect();
      }
    });
    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

})();
