
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
    import { getDatabase, ref, set, get, onValue, off } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

    // ══════════════════════════════════════════════════════════════════
    // 🔥 FIREBASE SYNC ENGINE — MůjFlix Cross-Device Sync
    // Config lze nastavit přes GUI (Settings → Sync → Nastavit Firebase)
    // nebo přímo zde:
    // ══════════════════════════════════════════════════════════════════
    // Načti config z localStorage (nastaven přes GUI) nebo použij vestavěný
    const _fbCfgStored = (function() {
      try { return safeLS('mf_firebase_cfg', '{}'); } catch(e) { return {}; }
    })();
    const FIREBASE_CONFIG = {
      apiKey:            _fbCfgStored.apiKey            || "AIzaSyCqbrI7B5DY7WsWOgHZZzGl0TpW20Sax9w",
      authDomain:        _fbCfgStored.authDomain        || "mujflix.firebaseapp.com",
      databaseURL:       _fbCfgStored.databaseURL       || "https://mujflix-default-rtdb.firebaseio.com",
      projectId:         _fbCfgStored.projectId         || "mujflix",
      storageBucket:     _fbCfgStored.storageBucket     || "mujflix.firebasestorage.app",
      messagingSenderId: _fbCfgStored.messagingSenderId || "730605839292",
      appId:             _fbCfgStored.appId             || "1:730605839292:web:9ca2f0c189a121ed4d81b9"
    };

    // Klíč pro identifikaci sync skupiny (stejný klíč = stejná data na všech zařízeních)
    // Změň na libovolný tajný řetězec, který sdílíš mezi svými zařízeními
    const SYNC_GROUP_KEY = localStorage.getItem('mf_sync_group') || null;

    window.MFSync = {
      _db: null,
      _app: null,
      _syncRef: null,
      _listening: false,
      _lastLocalWrite: 0,
      _ignoreNextRemote: false,

      init() {
        // Firebase je dostupný pouze pokud je config vyplněn
        if (!FIREBASE_CONFIG.apiKey || !FIREBASE_CONFIG.databaseURL) {
          console.info('[MFSync] Firebase config není nastaven — sync vypnut. Nastav ho v Settings.');
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
        } catch(e) {
          console.warn('[MFSync] Firebase init chyba:', e);
          this._updateStatus('error');
        }
      },

      connectGroup(groupKey) {
        if (!this._db) return;
        localStorage.setItem('mf_sync_group', groupKey);
        if (this._syncRef) off(this._syncRef);
        this._syncRef = ref(this._db, 'groups/' + groupKey + '/data');
        this._listening = true;
        this._updateStatus('syncing');

        // Poslouchej změny z ostatních zařízení
        onValue(this._syncRef, (snapshot) => {
          if (this._ignoreNextRemote) { this._ignoreNextRemote = false; return; }
          const remote = snapshot.val();
          if (!remote) { this._updateStatus('online'); return; }
          const remoteTs = remote._syncTs || 0;
          const localTs = parseInt(localStorage.getItem('mf_sync_local_ts') || '0');
          // Aplikuj remote data pouze pokud jsou novější než lokální
          if (remoteTs > localTs && (Date.now() - this._lastLocalWrite) > 2000) {
            this._applyRemoteData(remote);
            this._updateStatus('online');
            if (typeof showToast === 'function') showToast('🔄 Synchronizováno s jiným zařízením', 'success');
          } else {
            this._updateStatus('online');
          }
        });
      },

      // Nahraje aktuální lokální data do Firebaseé
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
        } catch(e) {
          console.warn('[MFSync] Push failed:', e);
          this._updateStatus('error');
        }
      },

      // Sbírá všechna lokální data k synchronizaci
      _collectLocalData() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (
            k.startsWith('mf_') ||
            k.startsWith('watched_') ||
            k.startsWith('watchlist') ||
            k.startsWith('streak') ||
            k.startsWith('aiMem')
          )) keys.push(k);
        }
        const data = {};
        keys.forEach(k => {
          try { data[k.replace(/\./g,'__DOT__')] = localStorage.getItem(k); } catch(e) {}
        });
        return data;
      },

      // Aplikuje vzdálená data do localStorage
      _applyRemoteData(remote) {
        Object.entries(remote).forEach(([k, v]) => {
          if (k === '_syncTs') return;
          const realKey = k.replace(/__DOT__/g, '.');
          try { localStorage.setItem(realKey, v); } catch(e) {}
        });
        // Refresh UI po aplikaci dat
        setTimeout(() => {
          if (typeof refreshUserContent === 'function') refreshUserContent();
          if (typeof updateWatchlistBadge === 'function') updateWatchlistBadge();
          if (typeof updateLogoProgress === 'function') updateLogoProgress();
          if (typeof updateContinueWidget === 'function') updateContinueWidget();
          if (typeof ProfileGate !== 'undefined') ProfileGate.renderBadge();
        }, 200);
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
        if (status === 'syncing') badge.classList.add('syncing'); else badge.classList.remove('syncing');
      },

      disconnect() {
        if (this._syncRef) { off(this._syncRef); this._syncRef = null; }
        localStorage.removeItem('mf_sync_group');
        this._updateStatus('offline');
      }
    };

    // Inicializuj po načtení stránky
    document.addEventListener('DOMContentLoaded', () => {
      window.MFSync.init();
    });

    // Automaticky push data při změně localStorage (debounced)
    let _syncDebounce = null;
    const _origLS = localStorage.setItem.bind(localStorage);
    // Hook se přidá po inicializaci (viz konec souboru)
  