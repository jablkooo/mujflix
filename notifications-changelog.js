/**
 * MŮJFLIX — Changelog Panel  v3
 * Pouze záložka Aktualizace — větší, přehlednější, bez emoji ikon (SVG vizuály)
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────
  // CONFIG
  // ─────────────────────────────────────────────

  const CL_KEY         = 'mf_changelog_entries';
  const CL_READ_KEY    = 'mf_changelog_read_ts';
  const CL_INSTALL_KEY = 'mf_changelog_install_ts';

  // SVG ikony pro typy — místo emoji
  const TYPE_META = {
    feature: {
      label: 'Novinka',
      color: '#30d158',
      bg: 'rgba(48,209,88,0.12)',
      svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 2L12.09 7.26L18 7.27L13.5 10.74L15.18 16L10 12.77L4.82 16L6.5 10.74L2 7.27L7.91 7.26L10 2Z"
          fill="currentColor"/>
      </svg>`,
    },
    fix: {
      label: 'Oprava',
      color: '#ff9f0a',
      bg: 'rgba(255,159,10,0.12)',
      svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.5 3.5C13.5 3.5 15 2 17 3L14.5 5.5L15.5 6.5L18 4C19 6 17.5 7.5 17.5 7.5L14 9L11 12L9 14.5L6.5 17L3 13.5L5.5 11L8 8.5L10 6L13.5 3.5Z"
          fill="currentColor" stroke="currentColor" stroke-width="0.5" stroke-linejoin="round"/>
      </svg>`,
    },
    update: {
      label: 'Aktualizace',
      color: '#0a84ff',
      bg: 'rgba(10,132,255,0.12)',
      svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 3V10M10 3L7 6M10 3L13 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4 13C4 15.2 6.7 17 10 17C13.3 17 16 15.2 16 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M4 10V13M16 10V13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>`,
    },
    refactor: {
      label: 'Vylepšení',
      color: '#bf5af2',
      bg: 'rgba(191,90,242,0.12)',
      svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 10C3 6.13 6.13 3 10 3C12.39 3 14.5 4.16 15.83 5.96" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M17 10C17 13.87 13.87 17 10 17C7.61 17 5.5 15.84 4.17 14.04" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M13 4L16 6L14 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M7 12L4 14L6 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    },
    security: {
      label: 'Bezpečnost',
      color: '#ff453a',
      bg: 'rgba(255,69,58,0.12)',
      svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 2L3 5V10C3 13.87 6.13 17.4 10 18C13.87 17.4 17 13.87 17 10V5L10 2Z"
          stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M7 10L9 12L13 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    },
    content: {
      label: 'Obsah',
      color: '#64d2ff',
      bg: 'rgba(100,210,255,0.12)',
      svg: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/>
        <path d="M8.5 8L12.5 10L8.5 12V8Z" fill="currentColor"/>
        <path d="M6 17H14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>`,
    },
  };

  function _meta(type) {
    return TYPE_META[type] || {
      label: type,
      color: '#8e8e93',
      bg: 'rgba(142,142,147,0.1)',
      svg: `<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M10 7V11M10 13V13.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    };
  }

  // ─────────────────────────────────────────────
  // HARDCODED CHANGELOG
  // ─────────────────────────────────────────────

  const HARDCODED_CHANGELOG = [
    {
      id: 20250521001,
      ts: 1716249600000,
      date: '21. května 2025',
      time: '10:00',
      type: 'feature',
      description: 'Přehlednější panel aktualizací',
      purpose: 'Nový design panelu — větší, čitelnější, s ikonami místo emoji.',
    },
    {
      id: 20250517001,
      ts: 1715904000000,
      date: '17. května 2025',
      time: '16:45',
      type: 'feature',
      description: 'Legální streamingové služby v cinema mode',
      purpose: 'Pod přehrávačem se zobrazují dostupné legální služby (Netflix, Disney+, Apple TV+…) kde lze film nebo seriál legálně sledovat.',
    },
    {
      id: 20250515001,
      ts: 1715731200000,
      date: '15. května 2025',
      time: '11:00',
      type: 'refactor',
      description: 'Výkon notifikačního panelu',
      purpose: 'Panel se načítá rychleji, animace jsou plynulejší.',
    },
    {
      id: 20250510001,
      ts: 1715299200000,
      date: '10. května 2025',
      time: '13:20',
      type: 'feature',
      description: 'Streak odměny při milnících',
      purpose: 'Po 3, 7, 14, 30, 50 a 100 dnech každodenního sledování se zobrazí speciální odměna s titulem.',
    },
    {
      id: 20250505001,
      ts: 1714867200000,
      date: '5. května 2025',
      time: '10:00',
      type: 'security',
      description: 'Aktualizace TMDB proxy',
      purpose: 'Přechod na Cloudflare Workers, lepší zabezpečení API klíče.',
    },
    {
      id: 20250501001,
      ts: 1714521600000,
      date: '1. května 2025',
      time: '09:00',
      type: 'update',
      description: 'Changelog systém spuštěn',
      purpose: 'Přehled všech změn přímo v aplikaci — vždy víš co je nového.',
    },
  ];

  // ─────────────────────────────────────────────
  // STORE
  // ─────────────────────────────────────────────

  function getUserChangelog() {
    try { return JSON.parse(localStorage.getItem(CL_KEY) || '[]'); } catch { return []; }
  }

  function getChangelog() {
    const user = getUserChangelog();
    const combined = [...user, ...HARDCODED_CHANGELOG];
    const seen = new Set();
    return combined.filter(e => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    }).sort((a, b) => b.ts - a.ts);
  }

  function addChangelogEntry(type, description, purpose) {
    const entries = getUserChangelog();
    const now = new Date();
    const entry = {
      id:          Date.now(),
      ts:          Date.now(),
      date:        now.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' }),
      time:        now.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }),
      type:        type || 'update',
      description: description || '',
      purpose:     purpose || '',
    };
    entries.unshift(entry);
    if (entries.length > 50) entries.length = 50;
    localStorage.setItem(CL_KEY, JSON.stringify(entries));
    _updateBell();
    return entry;
  }

  function _getInstallTs() {
    let ts = parseInt(localStorage.getItem(CL_INSTALL_KEY) || '0', 10);
    if (!ts) {
      // První spuštění – vše starší než 48 h považujeme za přečtené,
      // novější položky zůstanou jako "nové".
      ts = Date.now() - 48 * 60 * 60 * 1000;
      localStorage.setItem(CL_INSTALL_KEY, ts.toString());
    }
    return ts;
  }

  function getUnreadCount() {
    const rawRead  = localStorage.getItem(CL_READ_KEY);
    // Pokud uživatel ještě nikdy panel neotevřel, použijeme install timestamp
    const lastRead = rawRead ? parseInt(rawRead, 10) : _getInstallTs();
    return getChangelog().filter(e => e.ts > lastRead).length;
  }

  function markRead() {
    localStorage.setItem(CL_READ_KEY, Date.now().toString());
    _updateBell();
  }

  // ─────────────────────────────────────────────
  // PANEL INJECT — přepíše header + list
  // ─────────────────────────────────────────────

  function _injectPanel() {
    const panel = document.getElementById('notifPanel');
    if (!panel) return;

    // Pozicování — uprostřed jako sync badge, ne vlevo
    panel.style.left = '50%';
    panel.style.transform = 'translateX(-50%) translateY(-6px) scale(0.97)';
    panel.style.right = 'auto';
    panel.style.top = 'max(62px, env(safe-area-inset-top, 62px))';
    // Přebij transition aby animace fungovala správně
    panel.style.transition = 'opacity 0.22s, transform 0.22s cubic-bezier(0.34, 1.3, 0.64, 1)';

    // Rozšíř panel
    panel.style.width = '340px';
    panel.style.borderRadius = '20px';
    panel.style.boxShadow = '0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.07) inset';

    // Oprav visible stav — musí zahrnout nový transform
    if (panel.classList.contains('visible')) {
      panel.style.transform = 'translateX(-50%) translateY(0) scale(1)';
    }
    const origAdd = panel.classList.add.bind(panel.classList);
    panel.classList.add = function(...args) {
      origAdd(...args);
      if (args.includes('visible')) {
        panel.style.transform = 'translateX(-50%) translateY(0) scale(1)';
      }
    };

    // Vždy znovu vyrenderuj — odstraňujeme starý guard který způsoboval "Načítám..."
    panel.dataset.mfV3 = '1';

    // Header
    const header = panel.querySelector('.notif-panel-header');
    if (header) {
      header.style.cssText = `
        display:flex;align-items:center;justify-content:space-between;
        padding:16px 16px 12px;
        border-bottom:1px solid rgba(255,255,255,0.06);
        background:linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);
      `;
      header.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:2px;">
          <div style="
            font-size:0.62rem;font-weight:700;color:rgba(255,255,255,0.3);
            text-transform:uppercase;letter-spacing:1.2px;
          ">MůjFlix</div>
          <div style="
            font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif;
            font-size:1rem;font-weight:800;color:#fff;letter-spacing:-.3px;
          ">Aktualizace</div>
        </div>
        <button onclick="closeNotifPanel()" style="
          width:30px;height:30px;border-radius:50%;
          background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);
          color:rgba(255,255,255,0.5);cursor:pointer;font-size:0.8rem;
          display:flex;align-items:center;justify-content:center;
          transition:all .18s;
        "
        onmouseenter="this.style.background='rgba(255,255,255,0.13)';this.style.color='#fff'"
        onmouseleave="this.style.background='rgba(255,255,255,0.07)';this.style.color='rgba(255,255,255,0.5)'"
        >✕</button>
      `;
    }

    // List — výška
    const list = document.getElementById('notifPanelList');
    if (list) {
      list.style.maxHeight = '460px';
      list.style.padding = '8px 0';
    }

    _renderPanel();
    markRead();
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  function _renderPanel() {
    const list = document.getElementById('notifPanelList');
    if (!list) return;

    const entries = getChangelog();

    if (entries.length === 0) {
      list.innerHTML = `
        <div style="text-align:center;padding:40px 20px;">
          <div style="
            width:48px;height:48px;border-radius:14px;margin:0 auto 14px;
            background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);
            display:flex;align-items:center;justify-content:center;
          ">
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none" style="color:rgba(255,255,255,0.2)">
              <path d="M10 2L12.09 7.26L18 7.27L13.5 10.74L15.18 16L10 12.77L4.82 16L6.5 10.74L2 7.27L7.91 7.26L10 2Z" fill="currentColor"/>
            </svg>
          </div>
          <div style="font-size:0.8rem;font-weight:700;color:rgba(255,255,255,0.4);margin-bottom:4px;">Žádné záznamy</div>
          <div style="font-size:0.65rem;color:rgba(255,255,255,0.2);">Záznamy se přidávají s každou změnou</div>
        </div>`;
      return;
    }

    const rawRead  = localStorage.getItem(CL_READ_KEY);
    const lastRead = rawRead ? parseInt(rawRead, 10) : _getInstallTs();

    list.innerHTML = entries.map((e, i) => {
      const m = _meta(e.type);
      const isUnread = e.ts > lastRead;
      return `
        <div
          onclick="MFNotifications.openDetail(${e.id})"
          style="
            display:flex;align-items:flex-start;gap:12px;
            padding:12px 16px;
            border-bottom:1px solid rgba(255,255,255,0.04);
            cursor:pointer;transition:background .15s;
            ${isUnread ? 'background:rgba(255,255,255,0.025);' : ''}
          "
          onmouseenter="this.style.background='rgba(255,255,255,0.05)'"
          onmouseleave="this.style.background='${isUnread ? 'rgba(255,255,255,0.025)' : 'transparent'}'"
        >
          <!-- Ikona -->
          <div style="
            width:38px;height:38px;border-radius:11px;flex-shrink:0;
            background:${m.bg};border:1px solid ${m.color}22;
            display:flex;align-items:center;justify-content:center;
            color:${m.color};margin-top:1px;
          ">
            <div style="width:18px;height:18px;">${m.svg}</div>
          </div>

          <!-- Text -->
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
              <span style="
                font-size:0.58rem;font-weight:700;
                color:${m.color};
                text-transform:uppercase;letter-spacing:.6px;
              ">${m.label}</span>
              ${isUnread ? `<span style="
                font-size:0.52rem;font-weight:800;color:#30d158;
                background:rgba(48,209,88,0.12);border:1px solid rgba(48,209,88,0.25);
                padding:1px 6px;border-radius:50px;letter-spacing:.3px;
              ">Nové</span>` : ''}
              <span style="font-size:0.55rem;color:rgba(255,255,255,0.2);margin-left:auto;white-space:nowrap;">${e.date}</span>
            </div>
            <div style="
              font-size:0.8rem;font-weight:700;
              color:rgba(255,255,255,0.92);line-height:1.3;
              margin-bottom:3px;
            ">${_esc(e.description)}</div>
            ${e.purpose ? `<div style="
              font-size:0.65rem;color:rgba(255,255,255,0.38);line-height:1.4;
              overflow:hidden;text-overflow:ellipsis;
              display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;
            ">${_esc(e.purpose)}</div>` : ''}
          </div>

          <!-- Šipka -->
          <div style="color:rgba(255,255,255,0.15);font-size:0.75rem;margin-top:10px;flex-shrink:0;">›</div>
        </div>`;
    }).join('');
  }

  // ─────────────────────────────────────────────
  // DETAIL OVERLAY
  // ─────────────────────────────────────────────

  function openDetail(entryId) {
    const entry = getChangelog().find(e => e.id === entryId);
    if (!entry) return;
    const m = _meta(entry.type);

    document.getElementById('mfClDetail')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'mfClDetail';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:99990;
      display:flex;align-items:center;justify-content:center;padding:24px;
      background:rgba(0,0,0,0.6);
      backdrop-filter:blur(32px) saturate(1.5);
      -webkit-backdrop-filter:blur(32px) saturate(1.5);
      animation:mfDlFade .22s ease both;
    `;

    overlay.innerHTML = `
      <style>
        @keyframes mfDlFade  { from{opacity:0} to{opacity:1} }
        @keyframes mfDlUp    { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:none} }
        @keyframes mfDlGlow  { 0%,100%{opacity:.3} 50%{opacity:.8} }
        #mfDlCard {
          animation:mfDlUp .3s cubic-bezier(0.34,1.2,0.64,1) both;
          width:100%;max-width:360px;position:relative;
          background:linear-gradient(150deg,rgba(18,18,22,0.92),rgba(10,10,14,0.97));
          backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);
          border:1px solid rgba(255,255,255,0.08);
          border-top:1px solid rgba(255,255,255,0.15);
          border-radius:24px;overflow:hidden;
          box-shadow:0 40px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.03) inset, 0 0 60px ${m.color}14;
        }
        #mfDlGlow {
          position:absolute;top:0;left:0;right:0;height:2px;
          background:linear-gradient(90deg,transparent,${m.color},transparent);
          animation:mfDlGlow 3s ease-in-out infinite;
        }
        #mfDlXBtn {
          position:absolute;top:14px;right:14px;width:28px;height:28px;border-radius:50%;
          background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);
          color:rgba(255,255,255,0.4);cursor:pointer;display:flex;align-items:center;
          justify-content:center;font-size:0.75rem;transition:all .18s;
        }
        #mfDlXBtn:hover{background:rgba(255,255,255,0.14);color:#fff;}
        #mfDlClose {
          width:100%;padding:13px;border-radius:14px;border:none;cursor:pointer;
          background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);
          color:rgba(255,255,255,0.65);font-size:0.78rem;font-weight:700;
          transition:all .18s;
        }
        #mfDlClose:hover{background:rgba(255,255,255,0.12);color:#fff;transform:translateY(-1px);}
      </style>

      <div id="mfDlCard">
        <div id="mfDlGlow"></div>

        <div style="padding:28px 24px 20px;position:relative;
          background:radial-gradient(ellipse 70% 50% at 50% 0%, ${m.color}10, transparent);">
          <button id="mfDlXBtn" onclick="document.getElementById('mfClDetail').remove()">✕</button>

          <!-- Typ badge + ikona -->
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
            <div style="
              width:44px;height:44px;border-radius:13px;
              background:${m.bg};border:1px solid ${m.color}25;
              display:flex;align-items:center;justify-content:center;
              color:${m.color};
            "><div style="width:22px;height:22px;">${m.svg}</div></div>
            <div>
              <div style="font-size:0.6rem;font-weight:700;color:${m.color};text-transform:uppercase;letter-spacing:.7px;">${m.label}</div>
              <div style="font-size:0.58rem;color:rgba(255,255,255,0.28);margin-top:1px;">${entry.time} · ${entry.date}</div>
            </div>
          </div>

          <!-- Název -->
          <div style="
            font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif;
            font-size:1.25rem;font-weight:800;color:#fff;
            letter-spacing:-.4px;line-height:1.2;
          ">${_esc(entry.description)}</div>
        </div>

        <!-- Divider -->
        <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);margin:0 24px;"></div>

        <!-- Body -->
        <div style="padding:18px 24px 24px;">
          ${entry.purpose ? `
            <div style="font-size:0.58rem;font-weight:700;color:rgba(255,255,255,0.28);
              text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Co to přináší</div>
            <div style="font-size:0.85rem;color:rgba(255,255,255,0.7);line-height:1.6;
              margin-bottom:22px;">${_esc(entry.purpose)}</div>
          ` : '<div style="height:6px"></div>'}
          <button id="mfDlClose" onclick="document.getElementById('mfClDetail').remove()">Zavřít</button>
        </div>
      </div>
    `;

    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  }

  // ─────────────────────────────────────────────
  // BELL BADGE
  // ─────────────────────────────────────────────

  function _updateBell() {
    const unread    = getUnreadCount();
    const bell      = document.getElementById('notifBell');
    const bellBadge = document.getElementById('notifBellBadge');
    if (!bell || !bellBadge) return;
    if (unread > 0) {
      bell.classList.add('has-notifs');
      bellBadge.classList.add('visible');
    } else {
      bell.classList.remove('has-notifs');
      bellBadge.classList.remove('visible');
    }
  }

  // ─────────────────────────────────────────────
  // OVERRIDE openNotifPanel
  // ─────────────────────────────────────────────

  const _origOpen = window.openNotifPanel;
  window.openNotifPanel = function () {
    if (_origOpen) _origOpen.apply(this, arguments);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      _injectPanel();
    }));
  };

  // ─────────────────────────────────────────────
  // STREAK MILESTONES (zachováno)
  // ─────────────────────────────────────────────

  const STREAK_REWARD_KEY = 'mf_streak_rewards_seen';
  const STREAK_MILESTONES = [
    { days:   3, emoji: '⭐',   title: '3 dny v řadě!',  desc: 'Dobrý start! Série nabírá tempo.',                 reward: 'Titul: Začátečník 🌱',        color: '#ffd60a' },
    { days:   7, emoji: '🔥',   title: 'Týden v řadě!',  desc: 'Celý týden každý den — to je výkon.',              reward: 'Titul: Týdenní maratonec 🎯', color: '#ff9f0a' },
    { days:  14, emoji: '🔥🔥', title: 'Dva týdny!',     desc: 'Dva týdny bez přerušení. Série je silná s tebou.', reward: 'Titul: Zanícený divák 📺',    color: '#ff6b00' },
    { days:  30, emoji: '💥',   title: 'Celý měsíc!',    desc: 'Měsíc každodenního sledování. Legendární výkon.',  reward: 'Titul: Filmový mág 🎩',       color: '#ff453a' },
    { days:  50, emoji: '🏆',   title: '50 dní!',        desc: 'Padesát dní bez přerušení. Jsi mezi elitou.',      reward: 'Titul: Mistr obrazovky 👑',   color: '#bf5af2' },
    { days: 100, emoji: '🌟',   title: '100 dní!',       desc: 'Sto dní — místo v síni slávy je tvoje.',           reward: 'Titul: Legenda MůjFlix 🌟',   color: '#30d158' },
  ];

  function _getSeenMilestones() {
    try { return JSON.parse(localStorage.getItem(STREAK_REWARD_KEY) || '[]'); } catch { return []; }
  }

  function checkStreakMilestone(streak) {
    if (!streak || streak < 3) return;
    const seen = _getSeenMilestones();
    const milestone = [...STREAK_MILESTONES].reverse().find(m => streak >= m.days && !seen.includes(m.days));
    if (!milestone) return;
    const s = _getSeenMilestones(); s.push(milestone.days); localStorage.setItem(STREAK_REWARD_KEY, JSON.stringify(s));
    setTimeout(() => _showStreakOverlay(milestone), 1500);
  }

  function _showStreakOverlay(milestone) {
    document.getElementById('mfStreakRewardOverlay')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'mfStreakRewardOverlay';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:99999;
      display:flex;align-items:center;justify-content:center;padding:24px;
      background:rgba(0,0,0,0.65);
      backdrop-filter:blur(30px) saturate(1.5);-webkit-backdrop-filter:blur(30px) saturate(1.5);
      animation:mfSrFadeIn 0.3s ease;
    `;
    overlay.innerHTML = `
      <style>
        @keyframes mfSrFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes mfSrBounce { 0%{opacity:0;transform:scale(.75) translateY(24px)} 65%{transform:scale(1.04) translateY(-6px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes mfSrSpin   { 0%,100%{transform:scale(1) rotate(-4deg)} 50%{transform:scale(1.18) rotate(4deg)} }
        @keyframes mfSrPulse  { 0%,100%{box-shadow:0 0 28px ${milestone.color}30} 50%{box-shadow:0 0 50px ${milestone.color}55} }
        #mfSrCard {
          width:100%;max-width:320px;position:relative;text-align:center;
          background:linear-gradient(150deg,rgba(20,20,26,0.92),rgba(12,12,16,0.97));
          backdrop-filter:blur(40px) saturate(1.8);-webkit-backdrop-filter:blur(40px) saturate(1.8);
          border:1px solid rgba(255,255,255,0.1);border-top:1px solid rgba(255,255,255,0.18);
          border-radius:28px;overflow:hidden;
          box-shadow:0 40px 100px rgba(0,0,0,0.9),0 0 80px ${milestone.color}20;
          animation:mfSrBounce .45s cubic-bezier(0.34,1.25,0.64,1) both,mfSrPulse 3s ease-in-out 1s infinite;
        }
        #mfSrConfirmBtn {
          width:100%;padding:13px;border-radius:15px;border:none;cursor:pointer;
          background:${milestone.color};color:#000;font-size:0.82rem;font-weight:800;
          transition:all .2s;box-shadow:0 4px 22px ${milestone.color}40;
        }
        #mfSrConfirmBtn:hover{transform:translateY(-2px);box-shadow:0 8px 30px ${milestone.color}55;}
      </style>
      <div id="mfSrCard">
        <div style="height:3px;background:linear-gradient(90deg,transparent,${milestone.color},transparent);"></div>
        <div style="padding:28px 24px 20px;background:radial-gradient(ellipse 80% 55% at 50% 0%,${milestone.color}15,transparent);position:relative;">
          <button onclick="document.getElementById('mfStreakRewardOverlay').remove()" style="
            position:absolute;top:13px;right:13px;width:27px;height:27px;border-radius:50%;
            background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);
            color:rgba(255,255,255,0.4);cursor:pointer;display:flex;align-items:center;
            justify-content:center;font-size:0.76rem;">✕</button>
          <div style="width:88px;height:88px;border-radius:50%;margin:0 auto 16px;
            background:radial-gradient(circle,${milestone.color}1a,transparent 70%);
            border:1.5px solid ${milestone.color}45;display:flex;align-items:center;
            justify-content:center;box-shadow:0 0 28px ${milestone.color}25;">
            <span style="font-size:2.3rem;line-height:1;animation:mfSrSpin 2s ease-in-out infinite;display:block;">${milestone.emoji}</span>
          </div>
          <div style="font-size:0.6rem;font-weight:700;color:${milestone.color};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Série pokračuje</div>
          <div style="font-size:1.35rem;font-weight:800;color:#fff;letter-spacing:-.5px;line-height:1.2;margin-bottom:8px;">${milestone.title}</div>
          <div style="font-size:0.76rem;color:rgba(255,255,255,0.55);line-height:1.5;">${milestone.desc}</div>
        </div>
        <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent);margin:0 20px;"></div>
        <div style="padding:16px 22px 22px;">
          <div style="background:${milestone.color}14;border:1px solid ${milestone.color}28;border-radius:13px;
            padding:10px 14px;font-size:0.72rem;font-weight:700;color:${milestone.color};
            margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:6px;">
            ${milestone.reward}
          </div>
          <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:18px;">
            <span style="font-size:.7rem;color:rgba(255,255,255,.3)">Série:</span>
            <span style="font-size:1.05rem;font-weight:800;color:${milestone.color}">${milestone.days} dní</span>
          </div>
          <button id="mfSrConfirmBtn" onclick="document.getElementById('mfStreakRewardOverlay').remove()">
            Pokračovat v sérii!
          </button>
        </div>
      </div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
    addChangelogEntry('feature', `Série: ${milestone.title}`, milestone.reward);
  }

  function _hookStreak() {
    if (typeof window.updateStreak === 'function') {
      const orig = window.updateStreak;
      window.updateStreak = function (...args) {
        orig.apply(this, args);
        setTimeout(() => {
          try { checkStreakMilestone(JSON.parse(localStorage.getItem('mf_streak_v1') || '{}').streak || 0); } catch {}
        }, 250);
      };
    } else { setTimeout(_hookStreak, 500); }
  }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  function _esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────

  function init() {
    _hookStreak();
    _updateBell();
    setTimeout(() => {
      try { checkStreakMilestone(JSON.parse(localStorage.getItem('mf_streak_v1') || '{}').streak || 0); } catch {}
    }, 3000);
    console.log('[MFNotifications] v3 — Changelog panel ✓');
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

  // ─────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────

  window.MFNotifications = {
    openDetail,
    changelog: {
      add:    addChangelogEntry,
      getAll: getChangelog,
      clear:  () => { localStorage.removeItem(CL_KEY); _updateBell(); },
    },
    streak: {
      check: checkStreakMilestone,
      demo:  (days = 7) => { const m = STREAK_MILESTONES.find(m => m.days === days) || STREAK_MILESTONES[1]; _showStreakOverlay(m); },
      resetSeen: () => localStorage.removeItem(STREAK_REWARD_KEY),
    },
  };

})();
