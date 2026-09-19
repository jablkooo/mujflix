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
    const url = `https://api.themoviedb.org/3/${endpoint}/${tmdbId}/watch/providers?api_key=${window.TMDB_KEY || window.TMDB_KEY_DEFAULT || ''}`;

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

  // ══ RENDER PROVIDERS — floating badge v pravém dolním rohu ══
  function renderLegalProviders(tmdbId, title, type) {
    // Odstraň existující
    const existing = document.getElementById('legalProvidersSection');
    if (existing) existing.remove();

    const cinemaModal = document.getElementById('cinemaModal');
    if (!cinemaModal) return;

    // ── Wrapper: fixně v pravém dolním rohu cinema modalu ──
    const wrap = document.createElement('div');
    wrap.id = 'legalProvidersSection';
    wrap.style.cssText = `
      position: absolute;
      bottom: 72px;
      right: 16px;
      z-index: 50;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      pointer-events: none;
    `;

    // ── Rozbalený panel (skrytý dokud nejsou data) ──
    const panel = document.createElement('div');
    panel.id = 'legalProvidersPanel';
    panel.style.cssText = `
      background: rgba(10,10,16,0.92);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 12px 14px;
      display: none;
      flex-direction: column;
      gap: 8px;
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.7);
      pointer-events: auto;
      max-width: 260px;
    `;

    const panelLabel = document.createElement('div');
    panelLabel.style.cssText = `
      font-size: 0.52rem;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.3);
      margin-bottom: 2px;
    `;
    panelLabel.textContent = 'Legálně dostupné na';
    panel.appendChild(panelLabel);

    const providersRow = document.createElement('div');
    providersRow.style.cssText = `
      display: flex;
      gap: 7px;
      flex-wrap: wrap;
      justify-content: flex-end;
    `;
    panel.appendChild(providersRow);

    // ── Toggle badge ──
    const badge = document.createElement('button');
    badge.id = 'legalProvidersBadge';
    badge.title = 'Kde legálně sledovat';
    badge.style.cssText = `
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px 7px 9px;
      background: rgba(10,10,16,0.88);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 50px;
      cursor: pointer;
      pointer-events: auto;
      transition: all 0.2s ease;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.6);
      color: rgba(255,255,255,0.55);
      font-size: 0.68rem;
      font-weight: 600;
      font-family: -apple-system, sans-serif;
      white-space: nowrap;
    `;
    badge.innerHTML = `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
      <span id="legalBadgeText">Kde sledovat?</span>
    `;
    badge.onmouseenter = () => {
      badge.style.background = 'rgba(20,20,30,0.95)';
      badge.style.borderColor = 'rgba(255,255,255,0.18)';
      badge.style.color = 'rgba(255,255,255,0.85)';
    };
    badge.onmouseleave = () => {
      badge.style.background = 'rgba(10,10,16,0.88)';
      badge.style.borderColor = 'rgba(255,255,255,0.1)';
      badge.style.color = 'rgba(255,255,255,0.55)';
    };

    let panelOpen = false;
    badge.onclick = () => {
      panelOpen = !panelOpen;
      panel.style.display = panelOpen ? 'flex' : 'none';
    };

    wrap.appendChild(panel);
    wrap.appendChild(badge);
    cinemaModal.appendChild(wrap);

    // ── Fetch providers ──
    fetchWatchProviders(tmdbId, type).then(data => {
      const czData = getCzechProviders(data);

      if (!czData?.providers?.length) {
        badge.style.display = 'none'; // Skryj badge pokud nic není
        return;
      }

      // Aktualizuj badge text
      const badgeText = document.getElementById('legalBadgeText');
      if (badgeText) badgeText.textContent = `Dostupné v ${czData.region === 'CZ' ? 'ČR' : czData.region}`;

      // Zvýrazni badge — jsou data
      badge.style.borderColor = 'rgba(0,122,255,0.3)';
      badge.querySelector('svg').style.stroke = '#007aff';

      // Přidej provider tlačítka
      czData.providers.forEach(provider => {
        const info = STREAMING_PROVIDERS[provider.provider_id];
        if (!info) return;

        const btn = document.createElement('a');
        btn.href = info.url(title, type);
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
        btn.title = info.name;
        btn.style.cssText = `
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          text-decoration: none;
          transition: all 0.18s;
          cursor: pointer;
        `;
        btn.onmouseenter = () => {
          btn.style.background = 'rgba(255,255,255,0.1)';
          btn.style.borderColor = 'rgba(255,255,255,0.18)';
        };
        btn.onmouseleave = () => {
          btn.style.background = 'rgba(255,255,255,0.05)';
          btn.style.borderColor = 'rgba(255,255,255,0.08)';
        };

        const logo = document.createElement('img');
        logo.src = info.logo;
        logo.alt = info.name;
        logo.style.cssText = `width:20px;height:20px;object-fit:contain;border-radius:4px;`;
        logo.onerror = () => logo.style.display = 'none';

        const name = document.createElement('span');
        name.style.cssText = `font-size:0.65rem;font-weight:600;color:rgba(255,255,255,0.8);white-space:nowrap;font-family:-apple-system,sans-serif;`;
        name.textContent = info.name;

        btn.appendChild(logo);
        btn.appendChild(name);
        providersRow.appendChild(btn);
      });

    }).catch(() => {
      badge.style.display = 'none';
    });
  }

  // ══ HOOK INTO CINEMA MODE ══
  // Override openMovieInCinema to add providers
  const originalOpenMovieInCinema = window.openMovieInCinema;
  window.openMovieInCinema = function(tmdbId, title, type) {
    // Call original
    if (originalOpenMovieInCinema) {
      originalOpenMovieInCinema.apply(this, arguments);
    }

    // Extract actual tmdbId (handle tv_ep format: id/season/ep)
    const actualTmdbId = String(tmdbId).split('/')[0];

    // Add legal providers after a short delay to let modal render
    setTimeout(() => {
      renderLegalProviders(actualTmdbId, title, type);
    }, 800);
  };

  // ══ EXPORT FOR MANUAL USE ══
  window.MFLegalProviders = {
    show: renderLegalProviders,
    providers: STREAMING_PROVIDERS
  };

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
