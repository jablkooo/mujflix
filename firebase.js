import {
  initializeApp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  off
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

// ══════════════════════════════════════════════════════════════════
// 🔥 FIREBASE SYNC ENGINE — MůjFlix Cross-Device Sync
// ══════════════════════════════════════════════════════════════════

// 1. Bezpečné načtení konfigurace
const _fbCfgStored = (function() {
  try {
    const stored = localStorage.getItem('mf_firebase_cfg');
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
})();

const FIREBASE_CONFIG = {
  apiKey: _fbCfgStored.apiKey || "AIzaSyCqbrI7B5DY7WsWOgHZZzGl0TpW20Sax9w",
  authDomain: _fbCfgStored.authDomain || "mujflix.firebaseapp.com",
  databaseURL: _fbCfgStored.databaseURL || "https://mujflix-default-rtdb.firebaseio.com",
  projectId: _fbCfgStored.projectId || "mujflix",
  storageBucket: _fbCfgStored.storageBucket || "mujflix.firebasestorage.app",
  messagingSenderId: _fbCfgStored.messagingSenderId || "730605839292",
  appId: _fbCfgStored.appId || "1:730605839292:web:9ca2f0c189a121ed4d81b9"
};

// Klíč pro identifikaci sync skupiny
let SYNC_GROUP_KEY = localStorage.getItem('mf_sync_group') || null;

window.MFSync = {
  _db: null,
  _app: null,
  _syncRef: null,
  _listening: false,
  _lastLocalWrite: 0,
  _ignoreNextRemote: false,
  _syncDebounce: null,

  init() {
    if (!FIREBASE_CONFIG.apiKey || !FIREBASE_CONFIG.databaseURL) {
      console.info('[MFSync] Firebase config není nastaven — sync vypnut.');
      this._updateStatus('offline');
      return;
    }
    try {
      this._app = initializeApp(FIREBASE_CONFIG, 'mujflix');
      this._db = getDatabase(this._app);
      console.info('[MFSync] Firebase inicializován ✓');
      
      if (SYNC_GROUP_KEY) {
        this.connectGroup(SYNC_GROUP_KEY);
      } else {
        this._updateStatus('no-group');
      }
    } catch (e) {
      console.warn('[MFSync] Firebase init chyba:', e);
      this._updateStatus('error');
    }
  },

  connectGroup(groupKey) {
    if (!this._db) return;
    SYNC_GROUP_KEY = groupKey;
    localStorage.setItem('mf_sync_group', groupKey);
    
    if (this._syncRef) off(this._syncRef);
    this._syncRef = ref(this._db, 'groups/' + groupKey + '/data');
    this._listening = true;
    this._updateStatus('syncing');

    onValue(this._syncRef, (snapshot) => {
      if (this._ignoreNextRemote) {
        this._ignoreNextRemote = false;
        return;
      }
      const remote = snapshot.val();
      if (!remote) {
        this._updateStatus('online');
        return;
      }
      const remoteTs = remote._syncTs || 0;
      const localTs = parseInt(localStorage.getItem('mf_sync_local_ts') || '0');
      
      if (remoteTs > localTs && (Date.now() - this._lastLocalWrite) > 2000) {
        this._applyRemoteData(remote);
        this._updateStatus('online');
        if (typeof showToast === 'function') showToast('🔄 Synchronizováno', 'success');
      } else {
        this._updateStatus('online');
      }
    });
  },

  async pushData() {
    if (!this._db || !this._syncRef || !SYNC_GROUP_KEY) return;
    this._updateStatus('syncing');
    this._lastLocalWrite = Date.now();
    this._ignoreNextRemote = true;

    const payload = this._collectLocalData();
    payload._syncTs = Date.now();
    localStorage.setItem('mf_sync_local_ts', payload._syncTs);

    try {
      await set(this._syncRef, payload);
      this._updateStatus('online');
      console.log('[MFSync] Data úspěšně odeslána do cloudu');
    } catch (e) {
      console.error('[MFSync] Push failed:', e);
      this._updateStatus('error');
      // User-facing error
      if (typeof showToast === 'function') {
        const msg = e.code === 'PERMISSION_DENIED' ? '⚠️ Sync: Nemáš oprávnění' :
                    e.code === 'QUOTA_EXCEEDED' ? '⚠️ Sync: Překročen limit' :
                    e.message?.includes('net') ? '⚠️ Sync: Chyba sítě' :
                    '⚠️ Sync chyba';
        showToast(msg, 'error');
      }
    }
  },

  _collectLocalData() {
    const keys = [];
    const prefixes = ['mf_', 'watched_', 'watchlist', 'streak', 'aiMem'];
    
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && prefixes.some(p => k.startsWith(p))) {
        keys.push(k);
      }
    }
    
    const data = {};
    keys.forEach(k => {
      try {
        data[k.replace(/\./g, '__DOT__')] = localStorage.getItem(k);
      } catch (e) {}
    });
    return data;
  },

  _applyRemoteData(remote) {
    Object.entries(remote).forEach(([k, v]) => {
      if (k === '_syncTs') return;
      const realKey = k.replace(/__DOT__/g, '.');
      try {
        localStorage.setItem(realKey, v);
      } catch (e) {}
    });

    // ── KDO SE DÍVÁ: extrahuj watched data všech profilů ze sync dat ──
    this._buildWatchersMap(remote);
    
    setTimeout(() => {
      if (typeof refreshUserContent === 'function') refreshUserContent();
      if (typeof updateWatchlistBadge === 'function') updateWatchlistBadge();
      if (typeof updateLogoProgress === 'function') updateLogoProgress();
      if (typeof updateContinueWidget === 'function') updateContinueWidget();
      if (typeof ProfileGate !== 'undefined') ProfileGate.renderBadge();
      if (typeof updateWatcherBadges === 'function') updateWatcherBadges();
    }, 200);
  },

  _buildWatchersMap(remote) {
    try {
      // Profily jsou sdílené v sync skupině — vždy pod klíčem mf_profiles_v2
      const profilesRaw = remote['mf_profiles_v2'];
      if (!profilesRaw) return;
      const profiles = JSON.parse(profilesRaw);
      if (!Array.isArray(profiles) || !profiles.length) return;

      const activeId = localStorage.getItem('mf_active_pid') || null;
      // watchers: slug → [{ pid, name, avatar, avatarIsUrl, color }]
      const watchers = {};

      profiles.forEach(profile => {
        // Přeskočit aktuální profil — nechceme zobrazovat sami sebe
        if (profile.id === activeId) return;

        // watched klíč = "mf_watched_" + profileId, tečky escapované jako __DOT__
        const rawKey = 'mf_watched_' + profile.id;
        const escapedKey = rawKey.replace(/\./g, '__DOT__');
        const watchedRaw = remote[escapedKey];
        if (!watchedRaw) return;

        let watched;
        try { watched = JSON.parse(watchedRaw); } catch (e) { return; }

        // Watched data jsou flat: { "slug-S1-E1": true, "slug-S1-E2": true, "movie-slug": true }
        // Extrahujeme unikátní slugy — TV slug je část před "-S\d"
        const slugsSeen = new Set();

        Object.keys(watched).forEach(watchKey => {
          if (watched[watchKey] !== true) return;
          // Pro TV epizody: "the-simpsons-S1-E1" → slug = "the-simpsons"
          const tvMatch = watchKey.match(/^(.+)-S\d+-E\d+$/);
          if (tvMatch) {
            slugsSeen.add(tvMatch[1]);
          } else {
            // Film nebo jiný přímý slug: "some-movie" → slug = "some-movie"
            slugsSeen.add(watchKey);
          }
        });

        slugsSeen.forEach(slug => {
          if (!watchers[slug]) watchers[slug] = [];
          if (!watchers[slug].find(w => w.pid === profile.id)) {
            watchers[slug].push({
              pid: profile.id,
              name: profile.name || '?',
              avatar: profile.avatar || '🎬',
              avatarIsUrl: false,
              color: profile.color || '#007AFF'
            });
          }
        });
      });

      window._mfWatchers = watchers;
      console.info('[MFSync] Watchers:', Object.keys(watchers).length, 'titulů');
    } catch (e) {
      console.warn('[MFSync] _buildWatchersMap chyba:', e);
    }
  },

  _updateStatus(status) {
    window._mfSyncStatus = status;
    const badge = document.getElementById('syncStatusBadge');
    if (!badge) return;
    
    const icons = { online: '☁️', syncing: '🔄', offline: '📴', error: '⚠️', 'no-group': '🔗' };
    const labels = { online: 'Sync ON', syncing: 'Syncing…', offline: 'Offline', error: 'Chyba', 'no-group': 'Nastav sync' };
    const colors = { online: '#007AFF', syncing: '#007AFF', offline: '#636e72', error: '#e17055', 'no-group': '#a29bfe' };
    
    badge.innerHTML = `<span>${icons[status]||'☁️'}</span><span>${labels[status]||status}</span>`;
    badge.style.color = colors[status] || '#fff';
    badge.style.borderColor = (colors[status] || '#fff') + '44';
    
    if (status === 'syncing') badge.classList.add('syncing');
    else badge.classList.remove('syncing');
  },

  disconnect() {
    if (this._syncRef) {
      off(this._syncRef);
      this._syncRef = null;
    }
    localStorage.removeItem('mf_sync_group');
    this._updateStatus('offline');
  }
};

// ══════════════════════════════════════════════════════════════════
// ⚡ AUTOMATICKÝ SYNC HOOK (Sledování změn v reálném čase)
// ══════════════════════════════════════════════════════════════════

const _origLS = localStorage.setItem.bind(localStorage);

localStorage.setItem = function(key, value) {
  // 1. Proveď standardní uložení
  _origLS(key, value);

  // 2. Pokud se mění data, která nás zajímají, spusť push
  const prefixes = ['mf_', 'watched_', 'watchlist', 'streak', 'aiMem'];
  if (prefixes.some(p => key.startsWith(p)) && SYNC_GROUP_KEY) {
    
    // Debouncing (pauza 1.5s před odesláním), aby se neposílalo moc dat naráz
    clearTimeout(window.MFSync._syncDebounce);
    window.MFSync._syncDebounce = setTimeout(() => {
      window.MFSync.pushData();
    }, 1500);
  }
};

// Inicializace po načtení
document.addEventListener('DOMContentLoaded', () => {
  window.MFSync.init();
});

// ══════════════════════════════════════════════════════════════════
// 👥 PROFILES DB — Profily přímo ve Firebase
// ══════════════════════════════════════════════════════════════════
window.MFProfilesDB = {
  _db: null, _cache: null, _listeners: [], _ref: null,

  init(db) {
    this._db = db;
    this._ref = ref(db, 'global/profiles');
    onValue(this._ref, snap => {
      const d = snap.val();
      this._cache = Array.isArray(d) ? d : d ? Object.values(d) : [];
      this._listeners.forEach(fn => { try { fn(this._cache); } catch(e){} });
    });
  },

  async getProfiles() {
    if (this._cache !== null) return this._cache;
    if (!this._db) return this._local();
    try {
      const snap = await get(ref(this._db, 'global/profiles'));
      const d = snap.val();
      this._cache = Array.isArray(d) ? d : d ? Object.values(d) : [];
      return this._cache;
    } catch(e) { return this._local(); }
  },

  async saveProfiles(profiles) {
    try { localStorage.setItem('mf_profiles_v2', JSON.stringify(profiles)); } catch(e) {}
    this._cache = profiles;
    if (!this._db) return;
    try { await set(ref(this._db, 'global/profiles'), profiles); } catch(e) { console.warn('[MFProfilesDB]', e); }
  },

  getSync() {
    return this._cache !== null ? this._cache : this._local();
  },

  onChange(fn) { this._listeners.push(fn); },

  _local() {
    try { return JSON.parse(localStorage.getItem('mf_profiles_v2') || '[]'); } catch(e) { return []; }
  },

  async migrate() {
    const local = this._local();
    if (!local.length) return;
    const fb = await this.getProfiles();
    if (!fb.length) {
      console.info('[MFProfilesDB] Migrace', local.length, 'profilů z localStorage');
      await this.saveProfiles(local);
    }
  }
};

// ══════════════════════════════════════════════════════════════════
// 🔑 API KEYS DB — API klíče ve Firebase (šifrované base64)
// ══════════════════════════════════════════════════════════════════
window.MFApiKeysDB = {
  _db: null, _cache: null,
  _keys: ['mf_gemini_key','mf_or_key','mf_groq_key','mf_jina_key','mf_tavily_key','mf_tmdb_key','mf_openai_key'],

  init(db) {
    this._db = db;
    // Realtime sync klíčů
    onValue(ref(db, 'global/apikeys'), snap => {
      const d = snap.val();
      if (!d) return;
      this._cache = d;
      // Aplikuj do localStorage pro zpětnou kompatibilitu s app.js
      this._keys.forEach(k => {
        const enc = d[k.replace(/\./g,'__')];
        if (enc) {
          try { localStorage.setItem(k, atob(enc)); } catch(e) {}
        }
      });
    });
  },

  async saveKey(keyName, value) {
    // Ulož lokálně
    try { localStorage.setItem(keyName, value); } catch(e) {}
    if (!this._db) return;
    // Ulož do Firebase jako base64 (lehká obfuskace)
    const path = keyName.replace(/\./g, '__');
    try {
      await set(ref(this._db, 'global/apikeys/' + path), btoa(value));
      console.info('[MFApiKeysDB] Klíč uložen:', keyName);
    } catch(e) { console.warn('[MFApiKeysDB]', e); }
  },

  async loadAll() {
    if (!this._db) return;
    try {
      const snap = await get(ref(this._db, 'global/apikeys'));
      const d = snap.val();
      if (!d) return;
      this._keys.forEach(k => {
        const enc = d[k.replace(/\./g,'__')];
        if (enc) { try { localStorage.setItem(k, atob(enc)); } catch(e) {} }
      });
    } catch(e) {}
  },

  async migrate() {
    if (!this._db) return;
    const snap = await get(ref(this._db, 'global/apikeys'));
    if (snap.val()) return; // už jsou ve Firebase
    const updates = {};
    this._keys.forEach(k => {
      const v = localStorage.getItem(k);
      if (v) updates[k.replace(/\./g,'__')] = btoa(v);
    });
    if (Object.keys(updates).length) {
      await set(ref(this._db, 'global/apikeys'), updates);
      console.info('[MFApiKeysDB] Migrace klíčů do Firebase');
    }
  }
};

// ══════════════════════════════════════════════════════════════════
// 📢 CHANGELOG / OZNÁMENÍ — Firebase realtime notifikace o změnách
// ══════════════════════════════════════════════════════════════════
window.MFChangelog = {
  _db: null,
  SEEN_KEY: 'mf_changelog_seen',

  init(db) {
    this._db = db;
    onValue(ref(db, 'global/changelog'), snap => {
      const entries = snap.val();
      if (!entries) return;
      const list = Array.isArray(entries) ? entries : Object.values(entries);
      this._checkNew(list);
    });
  },

  // Admin: přidat nový changelog entry
  async push(entry) {
    if (!this._db) return;
    const e = {
      id: Date.now().toString(),
      ts: Date.now(),
      title: entry.title || 'Aktualizace',
      body: entry.body || '',
      type: entry.type || 'update', // update | fix | feature | security
      icon: entry.icon || '📦',
      version: entry.version || ''
    };
    try {
      const snap = await get(ref(this._db, 'global/changelog'));
      const existing = snap.val() || [];
      const arr = Array.isArray(existing) ? existing : Object.values(existing);
      arr.unshift(e); // nejnovější první
      if (arr.length > 50) arr.length = 50; // max 50 záznamů
      await set(ref(this._db, 'global/changelog'), arr);
      console.info('[MFChangelog] Přidán entry:', e.title);
    } catch(err) { console.warn('[MFChangelog]', err); }
  },

  _checkNew(list) {
    const seen = parseInt(localStorage.getItem(this.SEEN_KEY) || '0');
    const newEntries = list.filter(e => e.ts > seen);
    if (!newEntries.length) return;

    // Aktualizuj notif bell badge
    this._updateBadge(newEntries.length);

    // Inject do notif panelu
    this._injectToNotifPanel(newEntries, list);

    // Toast pro nejnovější
    const latest = newEntries[0];
    setTimeout(() => {
      if (typeof showToast === 'function') {
        showToast(latest.icon + ' ' + latest.title + (latest.body ? ' — ' + latest.body.substring(0,60) : ''), 'info', 6000);
      }
    }, 3000);
  },

  markSeen() {
    localStorage.setItem(this.SEEN_KEY, Date.now().toString());
    this._updateBadge(0);
  },

  _updateBadge(count) {
    // Přidej extra badge na notif bell
    const bell = document.getElementById('notifBell');
    if (!bell) return;
    let badge = document.getElementById('mfChangelogBadge');
    if (count > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.id = 'mfChangelogBadge';
        badge.style.cssText = 'position:absolute;top:-4px;right:-4px;background:#0a84ff;color:#fff;font-size:10px;font-weight:700;border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center;z-index:10;';
        bell.style.position = 'relative';
        bell.appendChild(badge);
      }
      badge.textContent = count > 9 ? '9+' : count;
    } else if (badge) {
      badge.remove();
    }
  },

  _injectToNotifPanel(newEntries, allEntries) {
    // Hookneme renderNotifPanel aby zobrazoval i changelog
    if (window._mfChangelogInjected) return;
    window._mfChangelogInjected = true;
    window._mfChangelogEntries = allEntries;

    const origRender = window.renderNotifPanel;
    window.renderNotifPanel = function() {
      if (typeof origRender === 'function') origRender();
      const panel = document.getElementById('notifPanelList');
      if (!panel || !window._mfChangelogEntries?.length) return;

      const seen = parseInt(localStorage.getItem(window.MFChangelog.SEEN_KEY) || '0');
      const html = window._mfChangelogEntries.slice(0, 10).map(e => {
        const isNew = e.ts > seen;
        const date = new Date(e.ts).toLocaleDateString('cs-CZ', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'});
        const colors = { feature:'#30d158', fix:'#ff9f0a', update:'#0a84ff', security:'#ff375f' };
        const color = colors[e.type] || '#0a84ff';
        return `
          <div class="notif-item mf-changelog-item" style="border-left:3px solid ${color};${isNew?'background:rgba(10,132,255,0.06)':''}" onclick="window.MFChangelog.markSeen()">
            <div style="font-size:22px;flex-shrink:0">${e.icon}</div>
            <div class="notif-item-info">
              <div class="notif-item-name" style="display:flex;align-items:center;gap:8px">
                ${e.title}
                ${isNew ? '<span style="background:#0a84ff;color:#fff;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px">NOVÉ</span>' : ''}
                ${e.version ? '<span style="color:rgba(255,255,255,0.3);font-size:11px">'+e.version+'</span>' : ''}
              </div>
              ${e.body ? '<div class="notif-item-ep" style="white-space:normal;line-height:1.4">'+e.body+'</div>' : ''}
              <div class="notif-item-date">📅 ${date}</div>
            </div>
          </div>`;
      }).join('');

      if (html) {
        const divider = document.createElement('div');
        divider.style.cssText = 'padding:10px 16px 4px;font-size:11px;font-weight:800;letter-spacing:1.5px;color:rgba(255,255,255,0.3);text-transform:uppercase';
        divider.textContent = 'Changelog & aktualizace';
        panel.insertAdjacentElement('afterbegin', divider);
        divider.insertAdjacentHTML('afterend', html);
      }
    };
  }
};

// ══════════════════════════════════════════════════════════════════
// ⚡ INIT HOOK — spustí vše po Firebase init
// ══════════════════════════════════════════════════════════════════
const _origMFSyncInit = window.MFSync.init.bind(window.MFSync);
window.MFSync.init = async function() {
  _origMFSyncInit();
  await new Promise(r => setTimeout(r, 500)); // počkej na DB
  const db = window.MFSync._db;
  if (!db) { console.warn('[MFInit] Firebase DB není dostupná'); return; }

  window.MFProfilesDB.init(db);
  window.MFApiKeysDB.init(db);
  window.MFChangelog.init(db);

  await Promise.all([
    window.MFProfilesDB.migrate(),
    window.MFApiKeysDB.migrate()
  ]);

  // Re-render profile gate s Firebase daty
  await new Promise(r => setTimeout(r, 800));
  if (typeof ProfileGate !== 'undefined' && typeof ProfileGate.renderGate === 'function') {
    ProfileGate.renderGate();
  }

  console.info('[MFInit] Firebase subsystémy inicializovány ✓');
};
