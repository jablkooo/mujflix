/**
 * ═══════════════════════════════════════════════════════════════════
 * MŮJFLIX — Notifications + Changelog + Streak Rewards  v2
 * ═══════════════════════════════════════════════════════════════════
 *
 * NOVINKY v2:
 * ✨ Verziování — při nové verzi se automaticky ukáže "Co je nového" banner
 * 📋 Hardcoded changelog — záznamy jsou v kódu, viditelné vždy pro všechny
 * 🔍 Filtrování — v panelu lze filtrovat podle typu záznamu
 * 🪟 Vylepšený detail overlay — verze + popis
 * 🔔 Auto-toast — animovaný banner při prvním spuštění nové verze
 *
 * PŘIDÁNÍ ZÁZNAMU:
 *   MFNotifications.changelog.add('feature', 'Přidán tmavý režim', 'Šetří oči');
 *
 * TEST:
 *   MFNotifications.streak.demo(7);
 *   MFNotifications.showWhatsNew();
 *   MFNotifications.switchTab('changelog');
 *
 * RESET VERZE (pro test "Co je nového"):
 *   localStorage.removeItem('mf_app_version_seen'); location.reload();
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────
  // VERZE APLIKACE — změň při každém deployi!
  // ─────────────────────────────────────────────

  const APP_VERSION = '2.5.0';
  const VERSION_KEY = 'mf_app_version_seen';

  // ─────────────────────────────────────────────
  // HARDCODED CHANGELOG
  // Přidávej nové záznamy NA ZAČÁTEK pole (nejnovější první)
  // ─────────────────────────────────────────────

  const HARDCODED_CHANGELOG = [
    {
      id: 20250521001,
      ts: 1716249600000,
      version: '2.5.0',
      date: '21. května 2025',
      time: '10:00',
      type: 'feature',
      description: 'Filtrování changelogu podle typu',
      purpose: 'V panelu aktualizací lze nyní filtrovat záznamy — zobrazit jen novinky, opravy nebo vylepšení.',
    },
    {
      id: 20250520001,
      ts: 1716163200000,
      version: '2.5.0',
      date: '20. května 2025',
      time: '14:30',
      type: 'feature',
      description: '"Co je nového" banner při aktualizaci',
      purpose: 'Při prvním spuštění po nové verzi se zobrazí přehledné oznámení s novinkami.',
    },
    {
      id: 20250519001,
      ts: 1716076800000,
      version: '2.4.1',
      date: '19. května 2025',
      time: '09:15',
      type: 'fix',
      description: 'Opravena synchronizace streak dat',
      purpose: 'Série dní se nyní ukládá správně i po obnovení stránky.',
    },
    {
      id: 20250517001,
      ts: 1715904000000,
      version: '2.4.0',
      date: '17. května 2025',
      time: '16:45',
      type: 'feature',
      description: 'Legální streamingové služby v cinema mode',
      purpose: 'Pod přehrávačem se zobrazují dostupné legální služby (Netflix, Disney+, Apple TV+…).',
    },
    {
      id: 20250515001,
      ts: 1715731200000,
      version: '2.3.2',
      date: '15. května 2025',
      time: '11:00',
      type: 'refactor',
      description: 'Výkon notifikačního panelu',
      purpose: 'Panel se načítá rychleji, animace jsou plynulejší.',
    },
    {
      id: 20250510001,
      ts: 1715299200000,
      version: '2.3.0',
      date: '10. května 2025',
      time: '13:20',
      type: 'feature',
      description: 'Streak odměny při milnících',
      purpose: 'Po 3, 7, 14, 30, 50 a 100 dnech každodenního sledování se zobrazí speciální odměna s titulem.',
    },
    {
      id: 20250505001,
      ts: 1714867200000,
      version: '2.2.0',
      date: '5. května 2025',
      time: '10:00',
      type: 'security',
      description: 'Aktualizace TMDB proxy',
      purpose: 'Přechod na Cloudflare Workers, lepší zabezpečení API klíče.',
    },
  ];

  // ─────────────────────────────────────────────
  // CHANGELOG STORE
  // ─────────────────────────────────────────────

  const CL_KEY      = 'mf_changelog_entries';
  const CL_READ_KEY = 'mf_changelog_read_ts';

  const TYPE_META = {
    feature:  { icon: '✨', label: 'Novinka',     color: '#30d158', bg: 'rgba(48,209,88,0.12)'   },
    fix:      { icon: '🔧', label: 'Oprava',      color: '#ff9f0a', bg: 'rgba(255,159,10,0.12)'  },
    update:   { icon: '📦', label: 'Aktualizace', color: '#0a84ff', bg: 'rgba(10,132,255,0.12)'  },
    refactor: { icon: '♻️', label: 'Vylepšení',   color: '#bf5af2', bg: 'rgba(191,90,242,0.12)'  },
    security: { icon: '🔒', label: 'Bezpečnost',  color: '#ff453a', bg: 'rgba(255,69,58,0.12)'   },
    content:  { icon: '🎬', label: 'Obsah',       color: '#64d2ff', bg: 'rgba(100,210,255,0.12)' },
  };

  function _meta(type) {
    return TYPE_META[type] || { icon: '📝', label: type, color: '#8e8e93', bg: 'rgba(142,142,147,0.1)' };
  }

  function getUserChangelog() {
    try { return JSON.parse(localStorage.getItem(CL_KEY) || '[]'); } catch { return []; }
  }

  function saveUserChangelog(entries) {
    localStorage.setItem(CL_KEY, JSON.stringify(entries));
  }

  function getAllChangelog() {
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
      version:     APP_VERSION,
      date:        now.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' }),
      time:        now.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }),
      type:        type || 'update',
      description: description || '',
      purpose:     purpose || '',
    };
    entries.unshift(entry);
    if (entries.length > 50) entries.length = 50;
    saveUserChangelog(entries);
    _updateBadge();
    return entry;
  }

  function getUnreadCount() {
    const lastRead = parseInt(localStorage.getItem(CL_READ_KEY) || '0', 10);
    return getAllChangelog().filter(e => e.ts > lastRead).length;
  }

  function markChangelogRead() {
    localStorage.setItem(CL_READ_KEY, Date.now().toString());
    _updateBadge();
  }

  // ─────────────────────────────────────────────
  // VERZE — "Co je nového" banner
  // ─────────────────────────────────────────────

  function _checkVersion() {
    const seenVersion = localStorage.getItem(VERSION_KEY);
    if (seenVersion === APP_VERSION) return;
    localStorage.setItem(VERSION_KEY, APP_VERSION);
    const newEntries = getAllChangelog().filter(e => e.version === APP_VERSION);
    if (newEntries.length === 0) return;
    setTimeout(() => _showWhatsNewBanner(APP_VERSION, newEntries), 2000);
  }

  function _showWhatsNewBanner(version, entries) {
    const existing = document.getElementById('mfWhatsNewBanner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'mfWhatsNewBanner';
    banner.style.cssText = `
      position:fixed;bottom:24px;left:50%;
      transform:translateX(-50%) translateY(120px);
      z-index:99980;width:min(420px, calc(100vw - 32px));
      background:linear-gradient(140deg,rgba(20,20,28,0.97) 0%,rgba(12,12,18,0.99) 100%);
      backdrop-filter:blur(40px) saturate(1.8);-webkit-backdrop-filter:blur(40px) saturate(1.8);
      border:1px solid rgba(255,255,255,0.1);border-top:1px solid rgba(255,255,255,0.18);
      border-radius:20px;overflow:hidden;
      box-shadow:0 30px 80px rgba(0,0,0,0.7),0 0 0 1px rgba(255,255,255,0.04) inset;
      transition:transform 0.5s cubic-bezier(0.34,1.2,0.64,1), opacity 0.4s ease;opacity:0;
    `;

    const listItems = entries.slice(0, 3).map(e => {
      const m = _meta(e.type);
      return `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;">
        <div style="width:22px;height:22px;border-radius:6px;flex-shrink:0;
          background:${m.bg};border:1px solid ${m.color}30;
          display:flex;align-items:center;justify-content:center;font-size:0.65rem;">${m.icon}</div>
        <span style="font-size:0.73rem;color:rgba(255,255,255,0.8);line-height:1.3">${_escHtml(e.description)}</span>
      </div>`;
    }).join('');

    const moreCount = entries.length - 3;

    banner.innerHTML = `
      <div style="height:2px;background:linear-gradient(90deg,transparent,#30d158,transparent);"></div>
      <div style="padding:16px 18px 18px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="font-size:0.6rem;font-weight:800;color:#30d158;text-transform:uppercase;
              letter-spacing:.8px;background:rgba(48,209,88,0.12);border:1px solid rgba(48,209,88,0.25);
              padding:3px 8px;border-radius:50px;">✦ Co je nového</div>
            <div style="font-size:0.58rem;color:rgba(255,255,255,0.28);font-weight:600">v${version}</div>
          </div>
          <button onclick="document.getElementById('mfWhatsNewBanner')._dismiss()"
            style="width:24px;height:24px;border-radius:50%;
              background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);
              color:rgba(255,255,255,0.4);cursor:pointer;font-size:0.7rem;
              display:flex;align-items:center;justify-content:center;">✕</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:2px;margin-bottom:14px;">
          ${listItems}
          ${moreCount > 0 ? `<div style="font-size:0.62rem;color:rgba(255,255,255,0.28);padding:4px 0 0 30px">+ ${moreCount} dalších změn</div>` : ''}
        </div>
        <button
          onclick="document.getElementById('mfWhatsNewBanner')._dismiss();if(typeof openNotifPanel==='function')openNotifPanel();setTimeout(()=>MFNotifications.switchTab('changelog'),200);"
          style="width:100%;padding:10px;border-radius:12px;border:none;cursor:pointer;
            background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);
            color:rgba(255,255,255,0.75);font-size:0.75rem;font-weight:700;
            letter-spacing:.2px;transition:all .18s;"
          onmouseenter="this.style.background='rgba(255,255,255,0.12)';this.style.color='#fff'"
          onmouseleave="this.style.background='rgba(255,255,255,0.07)';this.style.color='rgba(255,255,255,0.75)'"
        >Zobrazit vše →</button>
      </div>
    `;

    banner._dismiss = () => {
      banner.style.transform = 'translateX(-50%) translateY(120px)';
      banner.style.opacity = '0';
      setTimeout(() => banner.remove(), 450);
    };

    document.body.appendChild(banner);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      banner.style.transform = 'translateX(-50%) translateY(0)';
      banner.style.opacity = '1';
    }));
    setTimeout(() => { if (document.getElementById('mfWhatsNewBanner')) banner._dismiss(); }, 10000);
  }

  // ─────────────────────────────────────────────
  // CHANGELOG DETAIL OVERLAY
  // ─────────────────────────────────────────────

  function openChangelogDetail(entryId) {
    const entry = getAllChangelog().find(e => e.id === entryId);
    if (!entry) return;
    const m = _meta(entry.type);

    const existing = document.getElementById('mfChangelogDetail');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'mfChangelogDetail';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:99990;
      display:flex;align-items:center;justify-content:center;
      background:rgba(0,0,0,0.55);
      backdrop-filter:blur(28px) saturate(1.4);-webkit-backdrop-filter:blur(28px) saturate(1.4);
      animation:mfCdFadeIn 0.25s ease both;padding:20px;
    `;

    overlay.innerHTML = `
      <style>
        @keyframes mfCdFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes mfCdSlideUp { from{opacity:0;transform:translateY(22px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes mfCdGlow    { 0%,100%{opacity:.35} 50%{opacity:.7} }
        #mfChangelogDetailCard {
          animation:mfCdSlideUp 0.32s cubic-bezier(0.34,1.2,0.64,1) both;
          position:relative;width:100%;max-width:360px;
          background:linear-gradient(140deg,rgba(22,22,28,0.88) 0%,rgba(14,14,18,0.94) 100%);
          backdrop-filter:blur(40px) saturate(1.6);-webkit-backdrop-filter:blur(40px) saturate(1.6);
          border:1px solid rgba(255,255,255,0.09);border-top:1px solid rgba(255,255,255,0.16);
          border-radius:24px;overflow:hidden;
          box-shadow:0 0 0 1px rgba(255,255,255,0.04) inset,0 30px 80px rgba(0,0,0,0.85),0 0 60px ${m.color}18;
        }
        #mfCdGlowStrip {
          position:absolute;top:0;left:0;right:0;height:3px;
          background:linear-gradient(90deg,transparent,${m.color},transparent);
          animation:mfCdGlow 3s ease-in-out infinite;
        }
        #mfCdXBtn {
          position:absolute;top:14px;right:14px;width:28px;height:28px;border-radius:50%;
          background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);
          color:rgba(255,255,255,0.4);cursor:pointer;display:flex;align-items:center;
          justify-content:center;font-size:0.78rem;transition:all .18s;
        }
        #mfCdXBtn:hover { background:rgba(255,255,255,0.14);color:#fff; }
        #mfCdCloseBtn {
          width:100%;padding:13px;border-radius:14px;border:none;cursor:pointer;
          background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);
          color:rgba(255,255,255,0.7);font-size:0.8rem;font-weight:700;
          letter-spacing:.2px;transition:all 0.18s;
        }
        #mfCdCloseBtn:hover { background:rgba(255,255,255,0.12);color:#fff;transform:translateY(-1px); }
      </style>

      <div id="mfChangelogDetailCard">
        <div id="mfCdGlowStrip"></div>
        <div style="padding:28px 24px 20px;position:relative;
          background:radial-gradient(ellipse 80% 60% at 50% 0%, ${m.color}12, transparent);">
          <button id="mfCdXBtn" onclick="document.getElementById('mfChangelogDetail').remove()">✕</button>
          <div style="margin-bottom:14px;">
            <span style="display:inline-flex;align-items:center;gap:5px;
              padding:4px 10px 4px 7px;border-radius:50px;
              background:${m.bg};border:1px solid ${m.color}35;
              font-size:0.62rem;font-weight:700;color:${m.color};
              letter-spacing:.5px;text-transform:uppercase;">
              <span>${m.icon}</span><span>${m.label}</span>
            </span>
            ${entry.version ? `<span style="display:inline-flex;align-items:center;
              padding:3px 8px;border-radius:50px;margin-left:6px;
              background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);
              font-size:0.58rem;font-weight:700;color:rgba(255,255,255,0.35);">v${_escHtml(entry.version)}</span>` : ''}
          </div>
          <div style="font-size:1.22rem;font-weight:800;color:#fff;letter-spacing:-.4px;
            line-height:1.25;margin-bottom:6px;">${_escHtml(entry.description)}</div>
          <div style="font-size:0.58rem;color:rgba(255,255,255,0.3);">${entry.time} · ${entry.date}</div>
        </div>

        <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent);margin:0 24px;"></div>

        <div style="padding:18px 24px 24px;">
          ${entry.purpose ? `
            <div style="font-size:0.58rem;font-weight:700;color:rgba(255,255,255,0.3);
              text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Co to přináší</div>
            <div style="font-size:0.82rem;color:rgba(255,255,255,0.72);line-height:1.55;
              margin-bottom:20px;">${_escHtml(entry.purpose)}</div>
          ` : '<div style="height:8px"></div>'}
          <button id="mfCdCloseBtn" onclick="document.getElementById('mfChangelogDetail').remove()">Zavřít</button>
        </div>
      </div>
    `;

    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  }

  // ─────────────────────────────────────────────
  // NOTIF PANEL — TABS + FILTROVÁNÍ
  // ─────────────────────────────────────────────

  let _activeTab    = 'episodes';
  let _activeFilter = 'all';

  const FILTER_OPTIONS = [
    { key: 'all',      label: 'Vše' },
    { key: 'feature',  label: '✨ Novinky' },
    { key: 'fix',      label: '🔧 Opravy' },
    { key: 'refactor', label: '♻️ Vylepšení' },
    { key: 'security', label: '🔒 Bezpečnost' },
    { key: 'update',   label: '📦 Updaty' },
    { key: 'content',  label: '🎬 Obsah' },
  ];

  function _injectNewPanel() {
    const panel = document.getElementById('notifPanel');
    if (!panel || panel.dataset.mfInjected) return;
    panel.dataset.mfInjected = '1';

    const header = panel.querySelector('.notif-panel-header');
    if (!header) return;

    header.style.cssText = 'display:flex;flex-direction:column;gap:0;padding:12px 12px 10px;border-bottom:1px solid var(--border)';
    header.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div class="notif-panel-title" style="font-size:0.82rem;font-weight:800">🔔 Oznámení</div>
        <button class="notif-panel-close" onclick="closeNotifPanel()" style="line-height:1">✕</button>
      </div>
      <div id="mfNotifTabs" style="display:flex;gap:0;border-radius:9px;overflow:hidden;
        background:rgba(255,255,255,0.05);padding:2.5px;">
        <button id="mfTabEpisodes" onclick="MFNotifications.switchTab('episodes')"
          style="flex:1;padding:5px 6px;font-size:0.66rem;font-weight:700;
            border:none;border-radius:7px;cursor:pointer;transition:all 0.2s;letter-spacing:.2px;
            background:rgba(0,122,255,0.85);color:#fff;">🎬 Epizody</button>
        <button id="mfTabChangelog" onclick="MFNotifications.switchTab('changelog')"
          style="flex:1;padding:5px 6px;font-size:0.66rem;font-weight:700;
            border:none;border-radius:7px;cursor:pointer;transition:all 0.2s;letter-spacing:.2px;
            background:transparent;color:rgba(255,255,255,0.45);
            display:flex;align-items:center;justify-content:center;gap:4px;">
          📋 Aktualizace
          <span id="mfChangelogBadge" style="display:none;background:#ff4040;color:#fff;
            border-radius:50px;padding:0px 5px;font-size:0.52rem;font-weight:800;line-height:1.6;"></span>
        </button>
      </div>
    `;
    _updateBadge();
  }

  function switchTab(tab) {
    _activeTab = tab;
    _activeFilter = 'all';
    const btnEp = document.getElementById('mfTabEpisodes');
    const btnCl = document.getElementById('mfTabChangelog');
    if (btnEp && btnCl) {
      if (tab === 'episodes') {
        btnEp.style.background = 'rgba(0,122,255,0.85)'; btnEp.style.color = '#fff';
        btnCl.style.background = 'transparent'; btnCl.style.color = 'rgba(255,255,255,0.45)';
      } else {
        btnCl.style.background = 'rgba(0,122,255,0.85)'; btnCl.style.color = '#fff';
        btnEp.style.background = 'transparent'; btnEp.style.color = 'rgba(255,255,255,0.45)';
        markChangelogRead();
      }
    }
    _renderCurrentTab();
  }

  function _renderCurrentTab() {
    const list = document.getElementById('notifPanelList');
    if (!list) return;
    if (_activeTab === 'episodes') {
      if (typeof renderNotifPanel === 'function') renderNotifPanel();
    } else {
      _renderChangelogTab(list);
    }
  }

  function _renderChangelogTab(container) {
    const allEntries = getAllChangelog();
    const filtered   = _activeFilter === 'all' ? allEntries : allEntries.filter(e => e.type === _activeFilter);

    const filterBar = FILTER_OPTIONS.map(f => {
      const isActive = _activeFilter === f.key;
      return `<button onclick="MFNotifications._setFilter('${f.key}')"
        style="flex-shrink:0;padding:4px 10px;border-radius:20px;border:none;cursor:pointer;
          font-size:0.62rem;font-weight:700;letter-spacing:.2px;transition:all .15s;white-space:nowrap;
          ${isActive ? 'background:rgba(0,122,255,0.8);color:#fff;' : 'background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.42);'}"
        >${f.label}</button>`;
    }).join('');

    const filterBarHtml = `<div id="mfFilterBar" style="overflow-x:auto;display:flex;gap:5px;
      padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.04);scrollbar-width:none;">${filterBar}</div>`;

    if (filtered.length === 0) {
      container.innerHTML = `${filterBarHtml}
        <div class="notif-empty" style="padding:32px 14px">
          <div style="font-size:2rem;margin-bottom:10px;opacity:.5">📋</div>
          <div style="font-weight:600;margin-bottom:4px">Žádné záznamy</div>
          <div style="font-size:0.6rem;color:rgba(255,255,255,0.2)">Pro tento typ nejsou žádné záznamy</div>
        </div>`;
      return;
    }

    container.innerHTML = filterBarHtml + filtered.map(e => {
      const m = _meta(e.type);
      return `<div data-cl-id="${e.id}" onclick="MFNotifications.openDetail(${e.id})"
        style="display:flex;align-items:flex-start;gap:10px;padding:10px 13px;
          border-bottom:1px solid rgba(255,255,255,0.04);cursor:pointer;transition:background .15s;"
        onmouseenter="this.style.background='rgba(255,255,255,0.04)'"
        onmouseleave="this.style.background='transparent'">
        <div style="width:30px;height:30px;border-radius:9px;flex-shrink:0;
          background:${m.bg};border:1px solid ${m.color}25;
          display:flex;align-items:center;justify-content:center;font-size:0.85rem;margin-top:1px;">${m.icon}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:2px;">
            <span style="font-size:0.57rem;font-weight:700;color:${m.color};text-transform:uppercase;letter-spacing:.5px;">${m.label}</span>
            ${e.version ? `<span style="font-size:0.52rem;color:rgba(255,255,255,0.18);background:rgba(255,255,255,0.06);border-radius:4px;padding:1px 5px;">v${_escHtml(e.version)}</span>` : ''}
            <span style="font-size:0.52rem;color:rgba(255,255,255,0.22);margin-left:auto;white-space:nowrap">${e.time}</span>
          </div>
          <div style="font-size:0.75rem;font-weight:700;color:rgba(255,255,255,0.9);line-height:1.3;
            white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_escHtml(e.description)}</div>
          ${e.purpose ? `<div style="font-size:0.62rem;color:rgba(255,255,255,0.38);margin-top:2px;
            line-height:1.35;overflow:hidden;text-overflow:ellipsis;
            display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;">${_escHtml(e.purpose)}</div>` : ''}
        </div>
        <div style="color:rgba(255,255,255,0.18);font-size:0.7rem;margin-top:6px;flex-shrink:0">›</div>
      </div>`;
    }).join('');
  }

  function _setFilter(filterKey) {
    _activeFilter = filterKey;
    _renderCurrentTab();
    setTimeout(() => {
      const bar = document.getElementById('mfFilterBar');
      if (!bar) return;
      const active = bar.querySelector('button[style*="rgba(0,122,255"]');
      if (active) active.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
    }, 50);
  }

  function _updateBadge() {
    const badge  = document.getElementById('mfChangelogBadge');
    const unread = getUnreadCount();
    if (badge) {
      if (unread > 0) {
        badge.textContent = unread > 9 ? '9+' : unread;
        badge.style.display = 'inline';
      } else {
        badge.style.display = 'none';
      }
    }
    const bell      = document.getElementById('notifBell');
    const bellBadge = document.getElementById('notifBellBadge');
    if (unread > 0 && bell && bellBadge) {
      bell.classList.add('has-notifs');
      bellBadge.classList.add('visible');
    }
  }

  // Override openNotifPanel
  const _origOpen = window.openNotifPanel;
  window.openNotifPanel = function () {
    if (_origOpen) _origOpen.apply(this, arguments);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      _injectNewPanel();
      _renderCurrentTab();
    }));
  };

  // ─────────────────────────────────────────────
  // STREAK MILESTONES
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

  function _markMilestoneSeen(days) {
    const seen = _getSeenMilestones();
    if (!seen.includes(days)) { seen.push(days); localStorage.setItem(STREAK_REWARD_KEY, JSON.stringify(seen)); }
  }

  function checkStreakMilestone(streak) {
    if (!streak || streak < 3) return;
    const seen = _getSeenMilestones();
    const milestone = [...STREAK_MILESTONES].reverse().find(m => streak >= m.days && !seen.includes(m.days));
    if (milestone) { _markMilestoneSeen(milestone.days); setTimeout(() => showStreakRewardOverlay(milestone), 1500); }
  }

  function showStreakRewardOverlay(milestone) {
    const existing = document.getElementById('mfStreakRewardOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'mfStreakRewardOverlay';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:99999;
      display:flex;align-items:center;justify-content:center;
      background:rgba(0,0,0,0.65);
      backdrop-filter:blur(30px) saturate(1.5);-webkit-backdrop-filter:blur(30px) saturate(1.5);
      animation:mfSrFadeIn 0.3s ease;padding:24px;
    `;

    overlay.innerHTML = `
      <style>
        @keyframes mfSrFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes mfSrBounce  { 0%{opacity:0;transform:scale(.75) translateY(24px)} 65%{transform:scale(1.04) translateY(-6px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes mfSrSpin    { 0%,100%{transform:scale(1) rotate(-4deg)} 50%{transform:scale(1.18) rotate(4deg)} }
        @keyframes mfSrPulse   { 0%,100%{box-shadow:0 0 28px ${milestone.color}30} 50%{box-shadow:0 0 50px ${milestone.color}55} }
        #mfSrCard {
          width:100%;max-width:320px;position:relative;text-align:center;
          background:linear-gradient(150deg,rgba(20,20,26,0.92) 0%,rgba(12,12,16,0.97) 100%);
          backdrop-filter:blur(40px) saturate(1.8);-webkit-backdrop-filter:blur(40px) saturate(1.8);
          border:1px solid rgba(255,255,255,0.1);border-top:1px solid rgba(255,255,255,0.18);
          border-radius:28px;overflow:hidden;
          box-shadow:0 40px 100px rgba(0,0,0,0.9),0 0 80px ${milestone.color}20;
          animation:mfSrBounce 0.45s cubic-bezier(0.34,1.25,0.64,1) both,mfSrPulse 3s ease-in-out 1s infinite;
        }
        #mfSrXBtn {
          position:absolute;top:13px;right:13px;width:27px;height:27px;border-radius:50%;
          background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);
          color:rgba(255,255,255,0.4);cursor:pointer;display:flex;align-items:center;
          justify-content:center;font-size:0.76rem;transition:all .18s;
        }
        #mfSrXBtn:hover { background:rgba(255,255,255,0.14);color:#fff; }
        #mfSrConfirmBtn {
          width:100%;padding:13px;border-radius:15px;border:none;cursor:pointer;
          background:${milestone.color};color:#000;font-size:0.82rem;font-weight:800;letter-spacing:.2px;
          transition:all .2s;box-shadow:0 4px 22px ${milestone.color}40;
        }
        #mfSrConfirmBtn:hover  { transform:translateY(-2px);box-shadow:0 8px 30px ${milestone.color}55; }
        #mfSrConfirmBtn:active { transform:translateY(0); }
      </style>

      <div id="mfSrCard">
        <div style="height:3px;background:linear-gradient(90deg,transparent 0%,${milestone.color} 50%,transparent 100%);"></div>
        <div style="padding:28px 24px 20px;
          background:radial-gradient(ellipse 80% 55% at 50% 0%, ${milestone.color}15, transparent);position:relative;">
          <button id="mfSrXBtn" onclick="document.getElementById('mfStreakRewardOverlay').remove()">✕</button>
          <div style="width:88px;height:88px;border-radius:50%;margin:0 auto 16px;
            background:radial-gradient(circle,${milestone.color}1a,transparent 70%);
            border:1.5px solid ${milestone.color}45;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 0 28px ${milestone.color}25;">
            <span style="font-size:2.3rem;line-height:1;animation:mfSrSpin 2s ease-in-out infinite;display:block;">${milestone.emoji}</span>
          </div>
          <div style="font-size:0.6rem;font-weight:700;color:${milestone.color};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">🔥 Série pokračuje</div>
          <div style="font-size:1.35rem;font-weight:800;color:#fff;letter-spacing:-.5px;line-height:1.2;margin-bottom:8px;">${milestone.title}</div>
          <div style="font-size:0.76rem;color:rgba(255,255,255,0.55);line-height:1.5;">${milestone.desc}</div>
        </div>
        <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent);margin:0 20px;"></div>
        <div style="padding:16px 22px 22px;">
          <div style="background:${milestone.color}14;border:1px solid ${milestone.color}28;
            border-radius:13px;padding:10px 14px;font-size:0.72rem;font-weight:700;color:${milestone.color};
            letter-spacing:.2px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:6px;">
            🏅 ${milestone.reward}
          </div>
          <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:18px;">
            <span style="font-size:.7rem;color:rgba(255,255,255,.3)">Série:</span>
            <span style="font-size:1.05rem;font-weight:800;color:${milestone.color}">${milestone.days} dní</span>
          </div>
          <button id="mfSrConfirmBtn" onclick="document.getElementById('mfStreakRewardOverlay').remove()">
            💪 Pokračovat v sérii!
          </button>
        </div>
      </div>
    `;

    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);

    addChangelogEntry('feature', `🏅 ${milestone.title}`, milestone.reward);
  }

  // ─────────────────────────────────────────────
  // HOOK DO updateStreak
  // ─────────────────────────────────────────────

  function _hookStreak() {
    if (typeof window.updateStreak === 'function') {
      const orig = window.updateStreak;
      window.updateStreak = function (...args) {
        orig.apply(this, args);
        setTimeout(() => {
          try {
            const d = JSON.parse(localStorage.getItem('mf_streak_v1') || '{}');
            checkStreakMilestone(d.streak || 0);
          } catch {}
        }, 250);
      };
    } else {
      setTimeout(_hookStreak, 500);
    }
  }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  function _escHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────

  function init() {
    _hookStreak();
    _checkVersion();
    const panel = document.getElementById('notifPanel');
    if (panel) _injectNewPanel();

    setTimeout(() => {
      try {
        const d = JSON.parse(localStorage.getItem('mf_streak_v1') || '{}');
        if ((d.streak || 0) >= 3) checkStreakMilestone(d.streak);
      } catch {}
    }, 3000);

    console.log('[MFNotifications] v2 — Changelog + Versioning + Filtering + Streak Rewards ✓');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ─────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────

  window.MFNotifications = {
    switchTab,
    openDetail: openChangelogDetail,
    _setFilter,
    showWhatsNew: () => {
      const entries = getAllChangelog().filter(e => e.version === APP_VERSION);
      _showWhatsNewBanner(APP_VERSION, entries.length ? entries : getAllChangelog().slice(0, 3));
    },

    changelog: {
      /**
       * Přidá záznam do changelogu
       * @param {'feature'|'fix'|'update'|'refactor'|'security'|'content'} type
       * @param {string} description
       * @param {string} [purpose]
       */
      add:    addChangelogEntry,
      getAll: getAllChangelog,
      clear:  () => { localStorage.removeItem(CL_KEY); _updateBadge(); },
    },

    streak: {
      check:     checkStreakMilestone,
      /** Test — ukáže reward overlay pro daný počet dní */
      demo:      (days = 7) => {
        const m = STREAK_MILESTONES.find(m => m.days === days) || STREAK_MILESTONES[1];
        showStreakRewardOverlay(m);
      },
      resetSeen: () => localStorage.removeItem(STREAK_REWARD_KEY),
    },
  };

})();

// ═══════════════════════════════════════════════════
// PŘÍKLADY POUŽITÍ
// ═══════════════════════════════════════════════════
//
// Přidat changelog záznam:
//   MFNotifications.changelog.add('feature', 'Přidáno fullscreen tlačítko', 'Lepší zážitek na mobilu');
//   MFNotifications.changelog.add('fix', 'Opraveno přehrávání', 'Stream se nenačítá dvakrát');
//
// Manuálně ukázat "Co je nového" banner:
//   MFNotifications.showWhatsNew();
//
// Testovat streak reward overlay:
//   MFNotifications.streak.demo(7);
//   MFNotifications.streak.demo(30);
//
// Přepnout na changelog záložku:
//   MFNotifications.switchTab('changelog');
//
// Reset verze (pro test "Co je nového"):
//   localStorage.removeItem('mf_app_version_seen'); location.reload();
