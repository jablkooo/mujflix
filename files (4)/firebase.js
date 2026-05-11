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
      console.warn('[MFSync] Push failed:', e);
      this._updateStatus('error');
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
      const profilesRaw = remote['mf_profiles_v2'];
      if (!profilesRaw) return;
      const profiles = JSON.parse(profilesRaw);
      if (!Array.isArray(profiles) || !profiles.length) return;

      const activeId = localStorage.getItem('mf_active_pid') || null;
      const watchers = {};

      profiles.forEach(profile => {
        if (profile.id === activeId) return;

        const watchedKey = ('mf_watched_' + profile.id).replace(/\./g, '__DOT__');
        const watchedRaw = remote[watchedKey];
        if (!watchedRaw) return;

        let watched;
        try { watched = JSON.parse(watchedRaw); } catch (e) { return; }

        Object.keys(watched).forEach(slug => {
          const val = watched[slug];
          const hasSeen = val === true || (typeof val === 'object' && val !== null &&
            (val.ep > 0 || val.s > 0 || (val.eps && Object.keys(val.eps).length > 0)));
          if (!hasSeen) return;

          if (!watchers[slug]) watchers[slug] = [];
          if (!watchers[slug].find(w => w.pid === profile.id)) {
            watchers[slug].push({
              pid: profile.id,
              name: profile.name || '?',
              avatar: profile.avatarUrl || profile.avatar || '🎬',
              avatarIsUrl: !!profile.avatarUrl,
              color: profile.color || '#007AFF'
            });
          }
        });
      });

      window._mfWatchers = watchers;
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