/**
 * ═══════════════════════════════════════════════════════════════════
 * MŮJFLIX — Legal Streaming Providers (Apple TV+ style)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Zobrazí legální streamingové služby kde lze pustit film/seriál
 * v cinema mode. Používá TMDB Watch Providers API.
 */

(function() {
  // ══ STREAMING PROVIDERS CONFIG ══
  // Mapování TMDB provider IDs na logo + URL
  const STREAMING_PROVIDERS = {
    // Apple TV+
    350: {
      name: "Apple TV+",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/23/Apple_TV_Plus_Logo.svg",
      url: (title, type) => `https://tv.apple.com/search?term=${encodeURIComponent(title)}`
    },
    // Netflix
    8: {
      name: "Netflix",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
      url: (title, type) => `https://www.netflix.com/search?query=${encodeURIComponent(title)}`
    },
    // Prime Video
    9: {
      name: "Prime Video",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Amazon_Prime_Video_logo.jpg",
      url: (title, type) => `https://www.primevideo.com/search?phrase=${encodeURIComponent(title)}`
    },
    // Disney+
    337: {
      name: "Disney+",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Disney%2B_logo.svg",
      url: (title, type) => `https://www.disneyplus.com/search?query=${encodeURIComponent(title)}`
    },
    // HBO Max (now Max)
    1899: {
      name: "Max",
      logo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Max_Logo.svg",
      url: (title, type) => `https://www.max.com/search/${encodeURIComponent(title)}`
    },
    // HBO Max (old)
    274: {
      name: "HBO Max",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/1e/HBO_Max_Logo.svg",
      url: (title, type) => `https://www.hbomax.com/search?query=${encodeURIComponent(title)}`
    },
    // Crunchyroll
    372: {
      name: "Crunchyroll",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Crunchyroll_2021.svg",
      url: (title, type) => `https://www.crunchyroll.com/search?query=${encodeURIComponent(title)}`
    },
    // Canal+ (Czech)
    203: {
      name: "Canal+",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Canal_plus.svg",
      url: (title, type) => `https://canalplus.cz/vyhledavani?query=${encodeURIComponent(title)}`
    },
    // Voyo
    679: {
      name: "Voyo",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Voyo_logo.svg",
      url: (title, type) => `https://voyo.cz/hledat?q=${encodeURIComponent(title)}`
    },
    // Netflix basic (sk)
    100032: {
      name: "Netflix",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
      url: (title, type) => `https://www.netflix.com/search?query=${encodeURIComponent(title)}`
    },
    // SkyShowtime
    625: {
      name: "SkyShowtime",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d6/SkyShowtime_2022.svg",
      url: (title, type) => `https://www.skyshowtime.com/search?q=${encodeURIComponent(title)}`
    },
    // O2 TV
    1777: {
      name: "O2 TV",
      logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/O2_logo.svg",
      url: (title, type) => `https://www.o2tv.cz/hledej?q=${encodeURIComponent(title)}`
    },
    // Mall.TV
    435: {
      name: "Mall.TV",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/MallTV_logo.svg",
      url: (title, type) => `https://mall.tv/vysledky-vyhledavani?search=${encodeURIComponent(title)}`
    },
    // Kiwi
    682: {
      name: "Kiwi",
      logo: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Kiwi.com_logo.svg",
      url: (title, type) => `https://kiwi.com/cz/search?search=${encodeURIComponent(title)}`
    },
    // Plex
    68: {
      name: "Plex",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/df/Plex_logo.svg",
      url: (title, type) => `https://app.plex.tv/search?query=${encodeURIComponent(title)}`
    },
    // Rakuten TV
    358: {
      name: "Rakuten",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Rakuten_TV_logo.svg",
      url: (title, type) => `https://rakuten.tv/search/${encodeURIComponent(title)}`
    },
    // Mubi
    326: {
      name: "Mubi",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/2c/MUBI_Logo.svg",
      url: (title, type) => `https://mubi.com/search?q=${encodeURIComponent(title)}`
    },
    // Amazon Prime (old ID)
    10: {
      name: "Prime Video",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Amazon_Prime_Video_logo.jpg",
      url: (title, type) => `https://www.primevideo.com/search?phrase=${encodeURIComponent(title)}`
    },
    // Hulu
    418: {
      name: "Hulu",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Hulu_Logo.svg",
      url: (title, type) => `https://www.hulu.com/search?query=${encodeURIComponent(title)}`
    },
    // Disney+ Hotstar
    122: {
      name: "Disney+ Hotstar",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Disney%2B_Logo.svg",
      url: (title, type) => `https://www.hotstar.com/search?query=${encodeURIComponent(title)}`
    },
    // Paramount+
    531: {
      name: "Paramount+",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Paramount%2B_logo.svg",
      url: (title, type) => `https://www.paramountplus.com/search/${encodeURIComponent(title)}`
    },
    // Peacock
    391: {
      name: "Peacock",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/Peacock_Logo.svg",
      url: (title, type) => `https://www.peacocktv.com/search/${encodeURIComponent(title)}`
    },
    // Discovery+
    1537: {
      name: "Discovery+",
      logo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Discovery%2B_logo.svg",
      url: (title, type) => `https://www.discoveryplus.com/search?query=${encodeURIComponent(title)}`
    }
  };

  // Region priority for Czech Republic
  const REGIONS_TO_TRY = ['CZ', 'SK', 'US', 'GB', 'DE'];

  // ══ FETCH WATCH PROVIDERS FROM TMDB ══
  async function fetchWatchProviders(tmdbId, type) {
    const endpoint = type === 'movie' ? 'movie' : 'tv';
    const url = `https://api.themoviedb.org/3/${endpoint}/${tmdbId}/watch/providers?api_key=${window.TMDB_KEY || '36a429855b5872e5db851b6e04db81f0'}`;

    try {
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const data = await resp.json();
      return data;
    } catch (err) {
      console.warn('[LegalProviders] Fetch error:', err);
      return null;
    }
  }

  // ══ GET PROVIDERS FOR CZECH REGION ══
  function getCzechProviders(providersData) {
    if (!providersData?.results) return null;

    // Try CZ first, then SK, then US
    for (const region of REGIONS_TO_TRY) {
      const regionData = providersData.results[region];
      if (regionData?.flatrate?.length) {
        return {
          region: region,
          providers: regionData.flatrate
        };
      }
    }
    return null;
  }

  // ══ RENDER PROVIDERS IN CINEMA MODAL ══
  function renderLegalProviders(tmdbId, title, type) {
    // Remove existing
    const existing = document.getElementById('legalProvidersSection');
    if (existing) existing.remove();

    // Create section
    const section = document.createElement('div');
    section.id = 'legalProvidersSection';
    section.style.cssText = `
      padding: 16px 20px;
      background: rgba(10, 10, 12, 0.85);
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;

    // Title
    const titleEl = document.createElement('div');
    titleEl.style.cssText = `
      font-size: 0.7rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 1px;
    `;
    titleEl.textContent = '🎬 Legálně dostupné na';
    section.appendChild(titleEl);

    // Loading state
    const loadingEl = document.createElement('div');
    loadingEl.id = 'legalProvidersLoading';
    loadingEl.style.cssText = `
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.35);
      padding: 10px 0;
    `;
    loadingEl.textContent = 'Hledám dostupné služby...';
    section.appendChild(loadingEl);

    // Find the cinema modal and add our section before the player
    const cinemaModal = document.getElementById('cinemaModal');
    const frameWrap = document.getElementById('cinemaFrameWrap');
    if (cinemaModal && frameWrap) {
      cinemaModal.insertBefore(section, frameWrap.nextSibling);
    }

    // Fetch providers
    fetchWatchProviders(tmdbId, type).then(data => {
      const czData = getCzechProviders(data);

      if (!czData?.providers?.length) {
        loadingEl.textContent = 'V ČR nejsou dostupné žádné legální služby';
        loadingEl.style.color = 'rgba(255, 255, 255, 0.25)';
        return;
      }

      // Update loading text
      loadingEl.textContent = `Dostupné v: ${czData.region === 'CZ' ? 'Česko' : czData.region === 'SK' ? 'Slovensko' : czData.region}`;
      loadingEl.style.color = 'rgba(10, 132, 255, 0.8)';

      // Create providers row
      const providersRow = document.createElement('div');
      providersRow.style.cssText = `
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: flex-start;
      `;

      czData.providers.forEach(provider => {
        const providerInfo = STREAMING_PROVIDERS[provider.provider_id];
        if (!providerInfo) return; // Skip unknown providers

        const btn = document.createElement('a');
        btn.href = providerInfo.url(title, type);
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
        btn.style.cssText = `
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 22px;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
        `;
        btn.onmouseenter = () => {
          btn.style.background = 'rgba(255, 255, 255, 0.12)';
          btn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          btn.style.transform = 'translateY(-2px)';
        };
        btn.onmouseleave = () => {
          btn.style.background = 'rgba(255, 255, 255, 0.06)';
          btn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          btn.style.transform = 'translateY(0)';
        };

        // Logo
        const logo = document.createElement('img');
        logo.src = providerInfo.logo;
        logo.alt = providerInfo.name;
        logo.style.cssText = `
          width: 28px;
          height: 28px;
          object-fit: contain;
          border-radius: 6px;
          background: transparent;
        `;
        logo.onerror = () => {
          logo.style.display = 'none'; // Hide if logo fails
        };

        // Name
        const name = document.createElement('span');
        name.style.cssText = `
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.85);
          white-space: nowrap;
        `;
        name.textContent = providerInfo.name;

        btn.appendChild(logo);
        btn.appendChild(name);
        providersRow.appendChild(btn);
      });

      section.appendChild(providersRow);
    }).catch(err => {
      loadingEl.textContent = 'Nepodařilo se načíst';
      loadingEl.style.color = 'rgba(255, 255, 255, 0.25)';
    });
  }

  // ══ HOOK INTO CINEMA MODE ══
  // app.js má defer → musíme počkat na DOMContentLoaded než hookujeme
  function hookCinema() {
    const originalOpenMovieInCinema = window.openMovieInCinema;
    if (!originalOpenMovieInCinema) {
      console.warn('[MFLegalProviders] openMovieInCinema nenalezena, hook přeskočen');
      return;
    }
    window.openMovieInCinema = function(tmdbId, title, type) {
      // Zavolej originál
      originalOpenMovieInCinema.apply(this, arguments);

      // Vytáhni čisté tmdbId (tv_ep formát: id/season/ep)
      const actualTmdbId = String(tmdbId).split('/')[0];
      const actualType = (type === 'tv_ep') ? 'tv' : (type || 'movie');

      // Počkej až se modal vykreslí, pak přidej sekci
      setTimeout(() => {
        renderLegalProviders(actualTmdbId, title, actualType);
      }, 800);
    };
    console.log('[MFLegalProviders] Hook na openMovieInCinema aktivní ✓');
  }

  // ══ EXPORT FOR MANUAL USE ══
  window.MFLegalProviders = {
    show: renderLegalProviders,
    providers: STREAMING_PROVIDERS
  };

  // Spustit hook až po načtení app.js (defer)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookCinema);
  } else {
    hookCinema();
  }

  console.log('[MFLegalProviders] Legal streaming providers loaded');
})();

/**
 * ══ POUŽITÍ ══
 *
 * Funkce se automaticky spustí při otevření cinema mode.
 * Zobrazí sekci s logy legálních streaming služeb.
 *
 * Podporované služby:
 * - Apple TV+
 * - Netflix
 * - Prime Video
 * - Disney+
 * - Max (HBO)
 * - Crunchyroll
 * - Canal+
 * - Voyo
 * - SkyShowtime
 * - O2 TV
 * - Mall.TV
 * - a další...
 */
