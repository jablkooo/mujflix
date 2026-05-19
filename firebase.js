import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getDatabase, ref, set, get, update, onValue, off, remove,
  push as fbPush, onDisconnect, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

// ════════════════════════════════════════════════════════════════════
//  MůjFlix Firebase — sync engine v5.0
//
//  ├─ ⚡ Delta sync      — posílá jen změněné klíče (ne snapshot)
//  ├─ 🔀 Merge strategie — watchlist/ratings se mergují, ne přepisují
//  ├─ 💾 Auto zálohy    — denní/týdenní snapshot do Firebase
//  ├─ 📱 QR kód skupiny — vygeneruj QR, naskenuj na druhém zařízení
//  ├─ 🎫 Pozvánky       — jednorázové invite linky pro sync skupiny
//  ├─ 🛠 Admin panel    — JS API pro adminRefreshDevices, zálohy, klíče
//  └─ 🔁 Kompatibilita  — pushData, connectGroup, _syncRef pro app.js
// ════════════════════════════════════════════════════════════════════

const VERSION = 'v5.0.0';

const FIREBASE_CONFIG = (() => {
  try {
    const s = JSON.parse(localStorage.getItem('mf_firebase_cfg') || '{}');
    return {
      apiKey:            s.apiKey            || "AIzaSyCqbrI7B5DY7WsWOgHZZzGl0TpW20Sax9w",
      authDomain:        s.authDomain        || "mujflix.firebaseapp.com",
      databaseURL:       s.databaseURL       || "https://mujflix-default-rtdb.firebaseio.com",
      projectId:         s.projectId         || "mujflix",
      storageBucket:     s.storageBucket     || "mujflix.firebasestorage.app",
      messagingSenderId: s.messagingSenderId || "730605839292",
      appId:             s.appId             || "1:730605839292:web:9ca2f0c189a121ed4d81b9"
    };
  } catch(e) { return {}; }
})();

const DEVICE_ID = (() => {
  let id = localStorage.getItem('mf_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).slice(2,10) + '_' + Date.now().toString(36);
    Object.getPrototypeOf(localStorage).setItem.call(localStorage, 'mf_device_id', id);
  }
  return id;
})();

// ── Sync klíče ─────────────────────────────────────────────────────
const SYNC_PREFIXES = [
  'mf_watched_', 'mf_watchlist_', 'mf_watchlist',
  'mf_ratings_', 'mf_streak_', 'mf_streak',
  'mf_ai_brain_', 'mf_ai_brain',
  'mf_user_profile', 'mf_continue_', 'mf_partial_watched_', 'mf_recent_views_',
];

const NOSYNC = new Set([
  'mf_device_id','mf_device_label','mf_firebase_cfg','mf_sync_group',
  'mf_sync_local_ts','mf_profiles_v2','mf_active_pid',
  'mf_sync_binid','mf_sync_code','mf_sync_codemap',
  'mf_ai_usage','mf_ai_history','mf_watch_timeline',
  'trakt_access_token','trakt_refresh_token','trakt_username',
  'trakt_expires_at','trakt_client_id_user','mf_changelog_seen',
  'mf_last_push_day','mf_pending_changes','mf_sync_last_ts',
]);

const NOSYNC_PREFIXES = ['mf_trakt_','mf_customize_','mf_last_','mujflix_users_'];

// ── Merge klíče — tyto se mergují místo přepsání ───────────────────
const MERGE_KEYS = ['mf_watchlist','mf_watchlist_','mf_ratings_','mf_ratings'];

function _shouldSync(key) {
  if (!key || NOSYNC.has(key)) return false;
  if (NOSYNC_PREFIXES.some(p => key.startsWith(p))) return false;
  return SYNC_PREFIXES.some(p => key.startsWith(p));
}

function _isMergeKey(key) {
  return MERGE_KEYS.some(p => key.startsWith(p));
}

const ALL_API_KEYS = [
  'mf_gemini_key','mf_or_key','mf_groq_key','mf_jina_key',
  'mf_tavily_key','mf_tmdb_key','mf_openai_key','mf_anthropic_key','mf_jsonbin_key'
];

// ── Raw localStorage (obchází všechny hooky) ────────────────────────
const _nativeSetLS = Object.getPrototypeOf(localStorage).setItem.bind(localStorage);
function _rawSetLS(key, value) { try { _nativeSetLS(key, value); } catch(e) {} }

// ════════════════════════════════════════════════════════════════════
//  📦 IndexedDB — CRDT store + offline fronta + delta tracker
// ════════════════════════════════════════════════════════════════════
const MFStore = {
  _db: null,

  async open() {
    if (this._db) return this._db;
    return new Promise((res, rej) => {
      const req = indexedDB.open('mujflix_sync', 3);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('queue'))
          db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
        if (!db.objectStoreNames.contains('crdt'))
          db.createObjectStore('crdt', { keyPath: 'key' });
        if (!db.objectStoreNames.contains('delta'))
          db.createObjectStore('delta', { keyPath: 'key' });
      };
      req.onsuccess = e => { this._db = e.target.result; res(this._db); };
      req.onerror   = () => rej(req.error);
    });
  },

  async enqueue(item) {
    const db = await this.open().catch(() => null); if (!db) return;
    db.transaction('queue','readwrite').objectStore('queue').add({...item, ts: Date.now()});
  },

  async dequeueAll() {
    const db = await this.open().catch(() => null); if (!db) return [];
    return new Promise(res => {
      const tx = db.transaction('queue','readwrite'), store = tx.objectStore('queue');
      const items = [];
      store.openCursor().onsuccess = e => {
        const cur = e.target.result;
        if (cur) { items.push(cur.value); store.delete(cur.primaryKey); cur.continue(); }
        else res(items);
      };
    });
  },

  async setCRDT(key, value, ts, deviceId) {
    const db = await this.open().catch(() => null); if (!db) return;
    db.transaction('crdt','readwrite').objectStore('crdt').put({key, v: value, t: ts, d: deviceId});
  },

  async getCRDT(key) {
    const db = await this.open().catch(() => null); if (!db) return null;
    return new Promise(res => {
      const req = db.transaction('crdt','readonly').objectStore('crdt').get(key);
      req.onsuccess = () => res(req.result || null);
      req.onerror   = () => res(null);
    });
  },

  async getDelta(key) {
    const db = await this.open().catch(() => null); if (!db) return null;
    return new Promise(res => {
      const req = db.transaction('delta','readonly').objectStore('delta').get(key);
      req.onsuccess = () => res(req.result || null);
      req.onerror   = () => res(null);
    });
  },

  async setDelta(key, hash) {
    const db = await this.open().catch(() => null); if (!db) return;
    db.transaction('delta','readwrite').objectStore('delta').put({key, hash, ts: Date.now()});
  },

  async clearDelta() {
    const db = await this.open().catch(() => null); if (!db) return;
    db.transaction('delta','readwrite').objectStore('delta').clear();
  }
};

// ════════════════════════════════════════════════════════════════════
//  🔀 MERGE ENGINE
// ════════════════════════════════════════════════════════════════════
const MFMerge = {
  mergeWatchlist(localRaw, remoteRaw) {
    try {
      const local  = JSON.parse(localRaw  || '[]');
      const remote = JSON.parse(remoteRaw || '[]');
      if (!Array.isArray(local) || !Array.isArray(remote)) return remoteRaw;
      const map = new Map();
      remote.forEach(item => { const id = item.id || item.tmdbId || item; map.set(String(id), item); });
      local.forEach(item => {
        const id = item.id || item.tmdbId || item;
        const key = String(id);
        const existing = map.get(key);
        if (!existing || (item._ts || 0) >= (existing._ts || 0)) map.set(key, item);
      });
      return JSON.stringify([...map.values()]);
    } catch(e) { return remoteRaw; }
  },

  mergeRatings(localRaw, remoteRaw) {
    try {
      const local  = JSON.parse(localRaw  || '{}');
      const remote = JSON.parse(remoteRaw || '{}');
      if (typeof local !== 'object' || typeof remote !== 'object') return remoteRaw;
      return JSON.stringify({ ...remote, ...local });
    } catch(e) { return remoteRaw; }
  },

  mergeWatched(localRaw, remoteRaw) {
    try {
      const local  = JSON.parse(localRaw  || '{}');
      const remote = JSON.parse(remoteRaw || '{}');
      if (typeof local !== 'object' || typeof remote !== 'object') return remoteRaw;
      const result = { ...remote };
      Object.keys(local).forEach(key => {
        if (!result[key]) { result[key] = local[key]; return; }
        if (Array.isArray(local[key]) && Array.isArray(result[key])) {
          result[key] = [...new Set([...result[key], ...local[key]])];
        } else {
          result[key] = local[key];
        }
      });
      return JSON.stringify(result);
    } catch(e) { return remoteRaw; }
  },

  merge(key, localRaw, remoteRaw) {
    if (!localRaw) return remoteRaw;
    if (!remoteRaw) return localRaw;
    if (key.startsWith('mf_watchlist')) return this.mergeWatchlist(localRaw, remoteRaw);
    if (key.startsWith('mf_ratings'))  return this.mergeRatings(localRaw, remoteRaw);
    if (key.startsWith('mf_watched'))  return this.mergeWatched(localRaw, remoteRaw);
    return null;
  }
};

// ════════════════════════════════════════════════════════════════════
//  🔥 HLAVNÍ SYNC ENGINE
// ════════════════════════════════════════════════════════════════════
window.MFSync = {
  _db:          null,
  _app:         null,
  _applying:    false,
  _online:      navigator.onLine,
  _retryCount:  0,
  _retryTimer:  null,
  _writeBuffer: {},
  _writeTimer:  null,
  _listeners:   [],

  get _syncRef() { return this._db ? true : null; },

  async init() {
    if (!FIREBASE_CONFIG.apiKey || !FIREBASE_CONFIG.databaseURL) {
      this._status('offline'); return;
    }
    try {
      this._app = initializeApp(FIREBASE_CONFIG, 'mujflix_v5');
      this._db  = getDatabase(this._app);
      console.info(`[MFSync] ${VERSION} — ${DEVICE_ID}`);
      this._status('syncing');
      this._watchConnectivity();
      await this._setup();
    } catch(e) {
      if (e.code === 'app/duplicate-app') {
        try {
          const { getApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
          this._app = getApp('mujflix_v5');
          this._db  = getDatabase(this._app);
          await this._setup(); return;
        } catch(e2) {}
      }
      console.error('[MFSync] Init:', e);
      this._status('error');
      this._scheduleRetry();
    }
  },

  async _setup() {
    const db = this._db;
    const label = localStorage.getItem('mf_device_label') || _autoLabel();
    const activePid = localStorage.getItem('mf_active_pid') || null;

    await set(ref(db, `devices/${DEVICE_ID}/meta`), {
      label, ts: Date.now(), online: true, activeProfile: activePid, version: VERSION
    }).catch(()=>{});

    const presRef = ref(db, `presence/${DEVICE_ID}`);
    await set(presRef, { label, online: true, activeProfile: activePid, ts: Date.now() }).catch(()=>{});
    onDisconnect(presRef).remove().catch(()=>{});
    onDisconnect(ref(db, `devices/${DEVICE_ID}/meta/online`)).set(false).catch(()=>{});

    this._listenCRDT(db);
    MFProfilesDB.init(db);
    MFApiKeysDB.init(db);
    MFChangelog.init(db);
    MFPresence.init(db);
    MFNotifications.init(db);
    MFBackup.init(db);

    const savedGroup = localStorage.getItem('mf_sync_group');
    if (savedGroup) this._applyGroup(savedGroup);

    setTimeout(async () => {
      await MFProfilesDB.migrate();
      await MFApiKeysDB.migrateGlobal();
      await this._flushOfflineQueue();
      this._hookSafeSetItem();
      if (typeof ProfileGate !== 'undefined') ProfileGate.renderGate?.();
      MFAdminBridge.init(db);
    }, 1500);

    this._status('online');
    this._retryCount = 0;
    setTimeout(() => this._pushDelta(true), 2000);
  },

  _listenCRDT(db) {
    onValue(ref(db, 'devices'), snap => {
      const devs = snap.val() || {};
      Object.keys(devs).forEach(devId => {
        if (devId === DEVICE_ID || this[`_crdt_${devId}`]) return;
        this[`_crdt_${devId}`] = true;

        onValue(ref(db, `devices/${devId}/crdt`), async cSnap => {
          if (this._applying) return;
          const remote = cSnap.val(); if (!remote) return;

          this._applying = true;
          let changed = 0;

          for (const [encodedKey, entry] of Object.entries(remote)) {
            if (!entry || typeof entry.t !== 'number') continue;
            const key = _dk(encodedKey);
            const local = await MFStore.getCRDT(key);
            const localRaw = localStorage.getItem(key);
            const merged   = MFMerge.merge(key, localRaw, entry.v);

            if (merged !== null) {
              if (localRaw !== merged) { try { _rawSetLS(key, merged); changed++; } catch(e) {} }
              const t = Math.max(local?.t || 0, entry.t);
              await MFStore.setCRDT(key, merged, t, DEVICE_ID);
            } else {
              if (local && local.t >= entry.t) continue;
              if (localRaw !== entry.v) { try { _rawSetLS(key, entry.v); changed++; } catch(e) {} }
              await MFStore.setCRDT(key, entry.v, entry.t, devId);
            }
          }

          setTimeout(() => {
            this._applying = false;
            if (!changed) return;
            this._refreshUI(changed, devs[devId]?.meta?.label || devId);
          }, 100);
        });
        this._listeners.push(() => off(ref(db, `devices/${devId}/crdt`)));
      });
    });
  },

  _bufferWrite(key, value) {
    if (!_shouldSync(key)) return;
    this._writeBuffer[key] = { v: value, t: Date.now() };
    clearTimeout(this._writeTimer);
    this._writeTimer = setTimeout(() => this._flushBuffer(), 800);
  },

  async _flushBuffer() {
    if (!Object.keys(this._writeBuffer).length) return;
    if (!this._db || !this._online) {
      for (const [key, entry] of Object.entries(this._writeBuffer)) {
        await MFStore.enqueue({ type: 'crdt', key, ...entry });
        await MFStore.setCRDT(key, entry.v, entry.t, DEVICE_ID);
      }
      this._writeBuffer = {};
      return;
    }

    this._status('syncing');
    const updates = {};
    for (const [key, entry] of Object.entries(this._writeBuffer)) {
      const hash = _hash(entry.v);
      const prev = await MFStore.getDelta(key);
      if (prev && prev.hash === hash) continue;
      updates[`devices/${DEVICE_ID}/crdt/${_ek(key)}`] = { v: entry.v, t: entry.t, d: DEVICE_ID };
      await MFStore.setCRDT(key, entry.v, entry.t, DEVICE_ID);
      await MFStore.setDelta(key, hash);
    }
    this._writeBuffer = {};

    if (!Object.keys(updates).length) { this._status('online'); return; }

    try {
      await update(ref(this._db), updates);
      this._status('online');
    } catch(e) {
      this._status('error');
      _toast('⚠️ Sync chyba: ' + (e.message || e.code), 'error');
    }
  },

  async _pushDelta(force = false) {
    if (!this._db) return;
    this._status('syncing');
    const updates = {};
    const now = Date.now();

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!_shouldSync(k)) continue;
      const v = localStorage.getItem(k); if (!v) continue;
      const hash     = _hash(v);
      const prev     = force ? null : await MFStore.getDelta(k);
      if (!force && prev && prev.hash === hash) continue;
      const existing = await MFStore.getCRDT(k);
      const t = existing?.t || now;
      updates[`devices/${DEVICE_ID}/crdt/${_ek(k)}`] = { v, t, d: DEVICE_ID };
      await MFStore.setCRDT(k, v, t, DEVICE_ID);
      await MFStore.setDelta(k, hash);
    }

    if (!Object.keys(updates).length) { this._status('online'); return; }
    console.info(`[MFSync] Delta push: ${Object.keys(updates).length} klíčů`);
    try { await update(ref(this._db), updates); this._status('online'); }
    catch(e) { this._status('error'); }
  },

  async _flushOfflineQueue() {
    const items = await MFStore.dequeueAll(); if (!items.length) return;
    const updates = {};
    for (const item of items) {
      if (item.type === 'crdt')
        updates[`devices/${DEVICE_ID}/crdt/${_ek(item.key)}`] = { v: item.v, t: item.t, d: DEVICE_ID };
    }
    if (Object.keys(updates).length) {
      await update(ref(this._db), updates).catch(()=>{});
      _toast(`📤 Offline změny synchronizovány (${items.length})`, 'success');
    }
  },

  connectGroup(groupCode) {
    if (!groupCode) return;
    const code = groupCode.trim().toUpperCase();
    _rawSetLS('mf_sync_group', code);
    this._applyGroup(code);
    console.info(`[MFSync] Skupina: ${code}`);
  },

  _applyGroup(code) {
    if (!this._db) return;
    const groupRef = ref(this._db, `groups/${code}`);
    onValue(groupRef, snap => {
      const d = snap.val(); if (!d || this._applying) return;
      if (d.profiles) MFProfilesDB.saveProfiles(d.profiles).catch(()=>{});
    });
    set(ref(this._db, `groups/${code}/members/${DEVICE_ID}`), {
      label: localStorage.getItem('mf_device_label') || _autoLabel(),
      ts: Date.now(), version: VERSION
    }).catch(()=>{});
  },

  pushData()      { return this._pushDelta(); },
  schedulePush()  { clearTimeout(this._writeTimer); this._writeTimer = setTimeout(() => this._flushBuffer(), 800); },

  _hookSafeSetItem() {
    if (!window.safeSetItem || window.safeSetItem._mfPatched) return;
    const orig = window.safeSetItem;
    window.safeSetItem = (key, value) => {
      const result = orig(key, value);
      if (result !== false && _shouldSync(key)) this._bufferWrite(key, value);
      return result;
    };
    window.safeSetItem._mfPatched = true;
  },

  _watchConnectivity() {
    window.addEventListener('online', async () => {
      this._online = true; this._status('syncing');
      if (this._db) { await this._flushOfflineQueue(); await this._flushBuffer(); }
      else await this.init();
    });
    window.addEventListener('offline', () => {
      this._online = false; this._status('offline');
      _toast('📴 Offline — změny se uloží lokálně', 'info');
    });
    if (this._db) {
      onValue(ref(this._db, '.info/connected'), snap => {
        if (snap.val() === true) { this._online = true; this._retryCount = 0; }
      });
    }
  },

  _scheduleRetry() {
    clearTimeout(this._retryTimer);
    const delay = Math.min(1000 * Math.pow(2, this._retryCount), 30000);
    this._retryCount++;
    this._retryTimer = setTimeout(() => this.init(), delay);
  },

  _refreshUI(changed, fromDevice) {
    typeof refreshUserContent   === 'function' && refreshUserContent();
    typeof updateWatchlistBadge === 'function' && updateWatchlistBadge();
    typeof updateLogoProgress   === 'function' && updateLogoProgress();
    typeof updateContinueWidget === 'function' && updateContinueWidget();
    typeof updateWatcherBadges  === 'function' && updateWatcherBadges();
    typeof ProfileGate          !== 'undefined' && ProfileGate.renderBadge?.();
    _toast(`🔄 ${fromDevice}: ${changed} změn`, 'success');
  },

  _status(s) {
    window._mfSyncStatus = s;
    const b = document.getElementById('syncStatusBadge');
    if (b) {
      const ic = {online:'☁️',syncing:'🔄',offline:'📴',error:'⚠️'};
      const lb = {online:'Sync ON',syncing:'Syncing…',offline:'Offline',error:'Chyba'};
      const cl = {online:'#30d158',syncing:'#0a84ff',offline:'#636e72',error:'#ff375f'};
      b.innerHTML = `<span>${ic[s]||'☁️'}</span><span>${lb[s]||s}</span>`;
      b.style.color = cl[s]||'#fff';
      b.style.borderColor = (cl[s]||'#fff') + '44';
      s === 'syncing' ? b.classList.add('syncing') : b.classList.remove('syncing');
    }
    if (typeof _updateSyncModalStatus === 'function') try { _updateSyncModalStatus(); } catch(e) {}
    window.dispatchEvent(new CustomEvent('mf:syncStatus', { detail: { status: s } }));
  },

  async setActiveProfile(pid) {
    _rawSetLS('mf_active_pid', pid);
    if (this._db) {
      await update(ref(this._db, `devices/${DEVICE_ID}/meta`), { activeProfile: pid }).catch(()=>{});
      await update(ref(this._db, `presence/${DEVICE_ID}`), { activeProfile: pid }).catch(()=>{});
    }
    window.dispatchEvent(new CustomEvent('mf:profileChanged', { detail: { pid } }));
  },

  async getDevices() {
    if (!this._db) return [];
    const snap = await get(ref(this._db, 'devices')).catch(()=>null);
    if (!snap?.val()) return [];
    return Object.entries(snap.val()).map(([id, d]) => ({
      id, isMe: id === DEVICE_ID,
      label: d.meta?.label || id, online: d.meta?.online || false,
      ts: d.meta?.ts || 0, activeProfile: d.meta?.activeProfile || null,
      version: d.meta?.version || '?'
    }));
  },

  setDeviceLabel(label) {
    _rawSetLS('mf_device_label', label);
    if (this._db) update(ref(this._db, `devices/${DEVICE_ID}/meta`), { label }).catch(()=>{});
  },

  disconnect() {
    this._listeners.forEach(fn => fn());
    _rawSetLS('mf_sync_group', '');
    this._status('offline');
  }
};

// ════════════════════════════════════════════════════════════════════
//  💾 AUTO ZÁLOHY
// ════════════════════════════════════════════════════════════════════
const MFBackup = window.MFBackup = {
  _db: null,
  DAILY_KEY:  'mf_backup_last_daily',
  WEEKLY_KEY: 'mf_backup_last_weekly',

  init(db) {
    this._db = db;
    setTimeout(() => this._checkAutoBackup(), 10000);
  },

  async _checkAutoBackup() {
    const now   = Date.now();
    const DAY   = 24 * 60 * 60 * 1000;
    const WEEK  = 7 * DAY;
    const lastDaily  = parseInt(localStorage.getItem(this.DAILY_KEY)  || '0');
    const lastWeekly = parseInt(localStorage.getItem(this.WEEKLY_KEY) || '0');
    if (now - lastDaily > DAY)   { await this.createBackup('daily');  _rawSetLS(this.DAILY_KEY,  now + ''); }
    if (now - lastWeekly > WEEK) { await this.createBackup('weekly'); _rawSetLS(this.WEEKLY_KEY, now + ''); }
  },

  async createBackup(type = 'manual') {
    if (!this._db) return null;
    const snapshot = {};
    const syncKeys = [];

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || k.startsWith('mf_firebase') || k.startsWith('mf_device')) continue;
      const v = localStorage.getItem(k); if (!v) continue;
      snapshot[_ek(k)] = v;
      if (_shouldSync(k)) syncKeys.push(k);
    }

    const backup = {
      type, ts: Date.now(), deviceId: DEVICE_ID,
      deviceLabel: localStorage.getItem('mf_device_label') || _autoLabel(),
      version: VERSION, keyCount: syncKeys.length, data: snapshot
    };

    const backupId = `${type}_${Date.now()}`;
    await set(ref(this._db, `backups/${DEVICE_ID}/${backupId}`), backup).catch(e => {
      console.warn('[MFBackup] Záloha selhala:', e); return null;
    });

    await this._pruneBackups(type);
    console.info(`[MFBackup] ${type} záloha OK — ${syncKeys.length} klíčů`);
    if (type !== 'daily') _toast(`💾 Záloha vytvořena (${syncKeys.length} klíčů)`, 'success');
    return backupId;
  },

  async restoreBackup(backupId, deviceId = DEVICE_ID) {
    if (!this._db) return false;
    const snap = await get(ref(this._db, `backups/${deviceId}/${backupId}`)).catch(()=>null);
    const backup = snap?.val(); if (!backup?.data) return false;
    const confirm = window.confirm?.(`Obnovit zálohu z ${new Date(backup.ts).toLocaleString('cs-CZ')}?\nBude přepsáno ${backup.keyCount} klíčů.`);
    if (!confirm) return false;
    Object.entries(backup.data).forEach(([ek, v]) => { const key = _dk(ek); try { _rawSetLS(key, v); } catch(e) {} });
    typeof refreshUserContent === 'function' && refreshUserContent();
    _toast('✅ Data obnovena ze zálohy', 'success');
    return true;
  },

  async listBackups(deviceId = DEVICE_ID) {
    if (!this._db) return [];
    const snap = await get(ref(this._db, `backups/${deviceId}`)).catch(()=>null);
    const d = snap?.val(); if (!d) return [];
    return Object.entries(d)
      .map(([id, b]) => ({ id, ...b, data: undefined }))
      .sort((a, b) => b.ts - a.ts);
  },

  async _pruneBackups(type) {
    const limits = { daily: 7, weekly: 4, manual: 10 };
    const limit  = limits[type] || 10;
    const snap   = await get(ref(this._db, `backups/${DEVICE_ID}`)).catch(()=>null);
    const d = snap?.val(); if (!d) return;
    const ofType = Object.entries(d)
      .filter(([id]) => id.startsWith(type + '_'))
      .sort(([,a],[,b]) => a.ts - b.ts);
    if (ofType.length <= limit) return;
    const toDelete = ofType.slice(0, ofType.length - limit);
    for (const [id] of toDelete)
      await remove(ref(this._db, `backups/${DEVICE_ID}/${id}`)).catch(()=>{});
  }
};

// ════════════════════════════════════════════════════════════════════
//  📱 QR KÓD + POZVÁNKY
// ════════════════════════════════════════════════════════════════════
const MFInvite = window.MFInvite = {
  _db: null,

  init(db) { this._db = db; },

  async createInvite(groupCode) {
    if (!this._db || !groupCode) return null;
    const token = Math.random().toString(36).slice(2,10).toUpperCase();
    const invite = {
      groupCode: groupCode.toUpperCase(), token, createdBy: DEVICE_ID,
      createdAt: Date.now(), expiresAt: Date.now() + 24 * 60 * 60 * 1000, used: false
    };
    await set(ref(this._db, `invites/${token}`), invite).catch(()=>{});
    const url = `${location.origin}${location.pathname}?mf_invite=${token}`;
    return { token, url, groupCode };
  },

  async checkUrlInvite() {
    const params = new URLSearchParams(location.search);
    const token  = params.get('mf_invite');
    if (!token || !this._db) return;
    const snap   = await get(ref(this._db, `invites/${token}`)).catch(()=>null);
    const invite = snap?.val();
    if (!invite || invite.used || Date.now() > invite.expiresAt) {
      if (invite) _toast('⚠️ Pozvánka expirovala nebo byla použita', 'error');
      return;
    }
    const ok = window.confirm?.(`Připojit se ke sync skupině "${invite.groupCode}"?`);
    if (!ok) return;
    await update(ref(this._db, `invites/${token}`), { used: true, usedBy: DEVICE_ID, usedAt: Date.now() }).catch(()=>{});
    window.MFSync.connectGroup(invite.groupCode);
    _toast(`✅ Připojeno ke skupině ${invite.groupCode}!`, 'success');
    const url = new URL(location.href);
    url.searchParams.delete('mf_invite');
    history.replaceState({}, '', url.toString());
  },

  async showQR(groupCode, container) {
    if (!container) return;
    const invite = await this.createInvite(groupCode);
    if (!invite) return;
    if (!window.QRCode) {
      await _loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js');
    }
    container.innerHTML = '';
    const qrDiv = document.createElement('div');
    qrDiv.style.cssText = 'display:inline-block;padding:12px;background:#fff;border-radius:12px;margin:8px 0';
    container.appendChild(qrDiv);
    if (window.QRCode) {
      new window.QRCode(qrDiv, {
        text: invite.url, width: 160, height: 160,
        colorDark: '#000', colorLight: '#fff',
        correctLevel: window.QRCode.CorrectLevel.M
      });
    }
    const urlEl = document.createElement('div');
    urlEl.style.cssText = 'font-size:11px;color:rgba(255,255,255,0.4);word-break:break-all;margin-top:6px;text-align:center;max-width:180px';
    urlEl.textContent = `Platný 24h • ${invite.token}`;
    container.appendChild(urlEl);
    const copyBtn = document.createElement('button');
    copyBtn.textContent = '📋 Kopírovat link';
    copyBtn.style.cssText = 'display:block;width:100%;margin-top:8px;padding:8px;border-radius:9px;background:rgba(0,122,255,0.12);border:1px solid rgba(0,122,255,0.25);color:#0a84ff;font-size:12px;font-weight:700;cursor:pointer';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(invite.url).then(() => {
        copyBtn.textContent = '✅ Zkopírováno!';
        setTimeout(() => { copyBtn.textContent = '📋 Kopírovat link'; }, 2000);
      });
    };
    container.appendChild(copyBtn);
    return invite;
  }
};

// ════════════════════════════════════════════════════════════════════
//  🛠 ADMIN BRIDGE
// ════════════════════════════════════════════════════════════════════
const MFAdminBridge = window.MFAdminBridge = {
  _db: null,

  init(db) {
    this._db = db;
    this._patchAdminFunctions();
    // Inject sync tab po DOMContentLoaded nebo ihned pokud DOM připraven
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._injectSyncTab());
    } else {
      setTimeout(() => this._injectSyncTab(), 500);
    }
    MFInvite.init(db);
    MFInvite.checkUrlInvite();
  },

  _patchAdminFunctions() {
    const _origRefresh = window.adminRefreshDevices;

    window.adminRefreshDevices = async () => {
      if (typeof _origRefresh === 'function') { try { _origRefresh(); } catch(e) {} }
      const el = document.getElementById('adminDevicesList');
      if (!el || !this._db) return;
      const devices = await window.MFSync.getDevices();
      if (!devices.length) return;

      let fbSection = document.getElementById('mfFirebaseDevices');
      if (!fbSection) {
        fbSection = document.createElement('div');
        fbSection.id = 'mfFirebaseDevices';
        fbSection.style.cssText = 'margin-top:14px';
        el.parentElement?.appendChild(fbSection);
      }

      const now = Date.now();
      fbSection.innerHTML = `
        <div style="font-size:0.75rem;font-weight:800;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06)">
          ☁️ Firebase — online zařízení
        </div>
        ${devices.map(d => {
          const ago = _timeAgo(now - d.ts);
          const isOnline = d.online && (now - d.ts < 5 * 60 * 1000);
          return `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(255,255,255,0.025);border:1px solid ${d.isMe ? 'rgba(0,122,255,0.25)' : 'rgba(255,255,255,0.06)'};border-radius:10px;margin-bottom:6px">
            <div style="width:8px;height:8px;border-radius:50%;background:${isOnline ? '#30d158' : '#636e72'};flex-shrink:0"></div>
            <div style="flex:1;min-width:0">
              <div style="font-size:0.8rem;font-weight:700;display:flex;align-items:center;gap:6px">
                ${d.label}
                ${d.isMe ? '<span style="font-size:0.48rem;background:rgba(0,122,255,0.1);border:1px solid rgba(0,122,255,0.3);color:#0a84ff;padding:1px 7px;border-radius:20px;font-weight:800">TOTO</span>' : ''}
                <span style="font-size:0.48rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.3);padding:1px 7px;border-radius:20px">${d.version}</span>
              </div>
              <div style="font-size:0.58rem;color:rgba(255,255,255,0.25);margin-top:2px;font-family:monospace">${d.id}</div>
              <div style="font-size:0.55rem;color:rgba(255,255,255,0.2);margin-top:1px">${isOnline ? '🟢 Online' : `⚫ ${ago}`}${d.activeProfile ? ` • Profil: ${d.activeProfile}` : ''}</div>
            </div>
            <div style="display:flex;gap:5px">
              ${!d.isMe ? `<button onclick="MFAdminBridge.sendNotifTo('${d.id}')" style="padding:5px 10px;border-radius:7px;background:rgba(0,122,255,0.08);border:1px solid rgba(0,122,255,0.2);color:#0a84ff;font-size:0.6rem;font-weight:700;cursor:pointer">💬 Ping</button>` : ''}
              ${!d.isMe ? `<button onclick="MFAdminBridge.kickDevice('${d.id}')" style="padding:5px 10px;border-radius:7px;background:rgba(255,80,80,0.08);border:1px solid rgba(255,80,80,0.2);color:rgba(255,100,100,0.7);font-size:0.6rem;cursor:pointer">⏏ Kick</button>` : ''}
            </div>
          </div>`;
        }).join('')}
      `;
    };

    window.adminCreateBackup = () => MFBackup.createBackup('manual');
    window.adminListBackups  = () => MFBackup.listBackups().then(list => {
      console.table(list.map(b => ({
        id: b.id, typ: b.type,
        čas: new Date(b.ts).toLocaleString('cs-CZ'),
        klíče: b.keyCount, zařízení: b.deviceLabel
      })));
      _toast(`💾 ${list.length} záloh — viz konzole`, 'info');
    });
  },

  _injectSyncTab() {
    const syncBox = document.querySelector('.sync-box');
    if (!syncBox || document.getElementById('mfSyncExtended')) return;

    const ext = document.createElement('div');
    ext.id = 'mfSyncExtended';
    ext.innerHTML = `
      <div class="sync-section-label" style="margin-top:14px">📱 QR kód pro připojení</div>
      <div id="mfQrContainer" style="text-align:center;padding:4px 0"></div>
      <button onclick="MFAdminBridge._genQR()" style="width:100%;padding:10px;border-radius:11px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);font-size:0.78rem;font-weight:600;cursor:pointer;margin-top:6px">
        📲 Vygenerovat QR / Invite link
      </button>
      <div class="sync-section-label" style="margin-top:14px">💾 Zálohy dat</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button onclick="MFBackup.createBackup('manual')" style="flex:1;padding:9px 10px;border-radius:11px;background:rgba(48,209,88,0.08);border:1px solid rgba(48,209,88,0.2);color:#30d158;font-size:0.72rem;font-weight:700;cursor:pointer">
          💾 Vytvořit zálohu
        </button>
        <button onclick="MFAdminBridge._showBackups(this)" style="flex:1;padding:9px 10px;border-radius:11px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);font-size:0.72rem;font-weight:700;cursor:pointer">
          📂 Zálohy
        </button>
      </div>
      <div id="mfBackupList" style="margin-top:8px;display:none"></div>
    `;

    const footer = syncBox.querySelector('.sync-footer-row');
    if (footer) syncBox.insertBefore(ext, footer);
    else syncBox.appendChild(ext);
  },

  async _genQR() {
    const code = localStorage.getItem('mf_sync_group');
    if (!code) { _toast('⚠️ Nejprve zadej kód skupiny', 'error'); return; }
    const container = document.getElementById('mfQrContainer');
    if (container) await MFInvite.showQR(code, container);
  },

  async _showBackups(btn) {
    const list = await MFBackup.listBackups();
    const el   = document.getElementById('mfBackupList');
    if (!el) return;

    if (el.style.display !== 'none') { el.style.display = 'none'; return; }

    if (!list.length) {
      el.style.display = 'block';
      el.innerHTML = '<div style="font-size:11px;color:rgba(255,255,255,0.3);padding:8px 0">Žádné zálohy</div>';
      return;
    }

    el.style.display = 'block';
    el.innerHTML = list.slice(0, 5).map(b => `
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:9px;margin-bottom:5px">
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:600">${b.type==='daily'?'📅':b.type==='weekly'?'📆':'💾'} ${new Date(b.ts).toLocaleString('cs-CZ',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
          <div style="font-size:10px;color:rgba(255,255,255,0.3)">${b.keyCount} klíčů • ${b.deviceLabel}</div>
        </div>
        <button onclick="MFBackup.restoreBackup('${b.id}')" style="padding:5px 10px;border-radius:7px;background:rgba(255,159,10,0.1);border:1px solid rgba(255,159,10,0.25);color:#ff9f0a;font-size:10px;font-weight:700;cursor:pointer">Obnovit</button>
      </div>
    `).join('');
  },

  sendNotifTo(deviceId) {
    const msg = window.prompt?.('Zpráva pro zařízení:');
    if (!msg) return;
    MFNotifications.sendTo(deviceId, { title: 'Zpráva od admina', body: msg, icon: '📢', type: 'info' });
    _toast('✉️ Zpráva odeslána', 'success');
  },

  async kickDevice(deviceId) {
    if (!this._db) return;
    if (!window.confirm?.(`Odpojit zařízení ${deviceId}?`)) return;
    await MFNotifications.sendTo(deviceId, {
      title: 'Odpojeno adminem', body: 'Admin tě odpojil ze sync skupiny.', icon: '⏏', type: 'error'
    });
    await remove(ref(this._db, `devices/${deviceId}/crdt`)).catch(()=>{});
    _toast('⏏ Zařízení odpojeno', 'info');
  }
};

// ════════════════════════════════════════════════════════════════════
//  👁️  PRESENCE
// ════════════════════════════════════════════════════════════════════
const MFPresence = window.MFPresence = {
  _db: null, _cache: {}, _cbs: [],

  init(db) {
    this._db = db;
    onValue(ref(db, 'presence'), snap => {
      this._cache = snap.val() || {};
      this._cbs.forEach(fn => { try { fn(this._cache); } catch(e){} });
      this._renderBadges();
    });
  },

  getOnline() {
    return Object.entries(this._cache)
      .filter(([, d]) => d && d.online)
      .map(([id, d]) => ({ id, ...d, isMe: id === DEVICE_ID }));
  },

  onChange(fn) { this._cbs.push(fn); },

  startHeartbeat() {
    const tick = () => { if (this._db) update(ref(this._db, `presence/${DEVICE_ID}`), { ts: Date.now() }).catch(()=>{}); };
    tick(); setInterval(tick, 60000);
  },

  _renderBadges() {
    const el = document.getElementById('mfPresenceBadge'); if (!el) return;
    const online = this.getOnline();
    const others = online.filter(d => !d.isMe);
    el.textContent = others.length ? `👥 ${others.length + 1} online` : '👤 Jen ty';
    el.title = online.map(d => `${d.isMe ? '✓ ' : ''}${d.label || d.id}`).join('\n');
  }
};

// ════════════════════════════════════════════════════════════════════
//  🔔 NOTIFIKACE
// ════════════════════════════════════════════════════════════════════
const MFNotifications = window.MFNotifications = {
  _db: null, _seen: new Set(),

  init(db) {
    this._db = db;
    onValue(ref(db, `global/notifications/${DEVICE_ID}`), snap => {
      const d = snap.val(); if (!d) return;
      (Array.isArray(d) ? d : Object.values(d)).forEach(n => this._show(n));
      remove(ref(db, `global/notifications/${DEVICE_ID}`)).catch(()=>{});
    });
    onValue(ref(db, 'global/broadcast'), snap => {
      const n = snap.val();
      if (!n || this._seen.has(n.id)) return;
      this._seen.add(n.id); this._show(n);
    });
  },

  async sendTo(deviceId, notif) {
    if (!this._db) return;
    await fbPush(ref(this._db, `global/notifications/${deviceId}`),
      { id: Date.now()+'', ts: Date.now(), ...notif }).catch(()=>{});
  },

  async broadcast(notif) {
    if (!this._db) return;
    await set(ref(this._db, 'global/broadcast'),
      { id: Date.now()+'', ts: Date.now(), ...notif }).catch(()=>{});
  },

  _show(n) {
    if (!n?.id) return;
    _toast(`${n.icon||'🔔'} ${n.title||''}${n.body?' — '+n.body:''}`, n.type||'info', n.duration||6000);
    if ('Notification' in window && Notification.permission === 'granted')
      new Notification(n.title||'MůjFlix', { body: n.body||'', icon:'/favicon.ico', tag: n.id });
  },

  async requestPermission() {
    if ('Notification' in window && Notification.permission === 'default')
      await Notification.requestPermission().catch(()=>{});
  }
};

// ════════════════════════════════════════════════════════════════════
//  👥 PROFILES DB
// ════════════════════════════════════════════════════════════════════
const MFProfilesDB = window.MFProfilesDB = {
  _db: null, _cache: null, _cbs: [],

  init(db) {
    this._db = db;
    onValue(ref(db, 'global/profiles'), snap => {
      const d = snap.val();
      const fresh = Array.isArray(d) ? d : d ? Object.values(d) : [];
      this._cache = fresh;
      this._cbs.forEach(fn => { try { fn(fresh); } catch(e){} });
      if (typeof ProfileGate !== 'undefined') { ProfileGate.renderGate?.(); ProfileGate.renderBadge?.(); }
      if (localStorage.getItem('mf_active_pid'))
        typeof refreshUserContent === 'function' && refreshUserContent();
    });
  },

  async getProfiles() {
    if (this._cache !== null) return this._cache;
    if (!this._db) return this._local();
    try {
      const d = (await get(ref(this._db, 'global/profiles'))).val();
      this._cache = Array.isArray(d) ? d : d ? Object.values(d) : [];
      return this._cache;
    } catch(e) { return this._local(); }
  },

  getSync() { return this._cache ?? this._local(); },

  async saveProfiles(profiles) {
    try { _rawSetLS('mf_profiles_v2', JSON.stringify(profiles)); } catch(e) {}
    this._cache = profiles;
    if (this._db) await set(ref(this._db, 'global/profiles'), profiles).catch(()=>{});
  },

  async saveProfile(profile) {
    const all = await this.getProfiles();
    const idx = all.findIndex(p => p.id === profile.id);
    const updated = { ...profile, _ts: Date.now() };
    if (idx >= 0) all[idx] = { ...all[idx], ...updated }; else all.push(updated);
    await this.saveProfiles(all);
  },

  async deleteProfile(pid) {
    const all = await this.getProfiles();
    await this.saveProfiles(all.filter(p => p.id !== pid));
    if (this._db) await remove(ref(this._db, `global/apikeys_profile/${pid}`)).catch(()=>{});
  },

  onChange(fn) { this._cbs.push(fn); },
  _local() { try { return JSON.parse(localStorage.getItem('mf_profiles_v2')||'[]'); } catch(e) { return []; } },

  async migrate() {
    const local = this._local(); if (!local.length) return;
    const fb = await this.getProfiles();
    if (!fb.length) { await this.saveProfiles(local); console.info('[Profiles] Migrace OK'); }
  }
};

// ════════════════════════════════════════════════════════════════════
//  🔑 API KEYS DB
// ════════════════════════════════════════════════════════════════════
const MFApiKeysDB = window.MFApiKeysDB = {
  _db: null,
  KEYS: ALL_API_KEYS,

  init(db) {
    this._db = db;
    onValue(ref(db, 'global/apikeys'), snap => {
      const d = snap.val(); if (!d) return;
      this.KEYS.forEach(k => { const v = d[_ek(k)]; if (v) _rawSetLS(k, _dec(v)); });
    });
    onValue(ref(db, 'global/apikeys_admin'), snap => {
      const d = snap.val(); if (!d) return;
      this.KEYS.forEach(k => { const v = d[_ek(k)]; if (v) _rawSetLS(k, _dec(v)); });
      _toast('🔑 Admin API klíče aktualizovány', 'info');
    });
    onValue(ref(db, 'global/apikeys_profile'), snap => {
      const pid = localStorage.getItem('mf_active_pid'); if (!pid) return;
      const d = snap.val(); if (!d?.[pid]) return;
      this.KEYS.forEach(k => { const v = d[pid][_ek(k)]; if (v) _rawSetLS(k, _dec(v)); });
    });
    const pid = localStorage.getItem('mf_active_pid');
    if (pid) setTimeout(() => this.loadProfileKeys(pid), 600);
    window.addEventListener('mf:profileChanged', e => { if (e.detail?.pid) this.loadProfileKeys(e.detail.pid); });
  },

  async loadProfileKeys(pid) {
    if (!this._db || !pid) return;
    const snap = await get(ref(this._db, `global/apikeys_profile/${pid}`)).catch(()=>null);
    const d = snap?.val(); if (!d) return;
    this.KEYS.forEach(k => { const v = d[_ek(k)]; if (v) _rawSetLS(k, _dec(v)); });
  },

  async saveKey(name, value, opts = {}) {
    _rawSetLS(name, value);
    if (!this._db || !value) return;
    const path = opts.isAdmin
      ? `global/apikeys_admin/${_ek(name)}`
      : opts.profileId
        ? `global/apikeys_profile/${opts.profileId}/${_ek(name)}`
        : `global/apikeys/${_ek(name)}`;
    await set(ref(this._db, path), _enc(value)).catch(()=>{});
  },

  async deleteKey(name, opts = {}) {
    try { localStorage.removeItem(name); } catch(e) {}
    if (!this._db) return;
    const path = opts.isAdmin
      ? `global/apikeys_admin/${_ek(name)}`
      : opts.profileId
        ? `global/apikeys_profile/${opts.profileId}/${_ek(name)}`
        : `global/apikeys/${_ek(name)}`;
    await remove(ref(this._db, path)).catch(()=>{});
  },

  async getProfileKeys(pid) {
    if (!this._db) return {};
    const snap = await get(ref(this._db, `global/apikeys_profile/${pid}`)).catch(()=>null);
    const d = snap?.val() || {}; const result = {};
    this.KEYS.forEach(k => { const v = d[_ek(k)]; if (v) result[k] = _dec(v); });
    return result;
  },

  async getAdminKeys() {
    if (!this._db) return {};
    const snap = await get(ref(this._db, 'global/apikeys_admin')).catch(()=>null);
    const d = snap?.val() || {}; const result = {};
    this.KEYS.forEach(k => { const v = d[_ek(k)]; if (v) result[k] = _dec(v); });
    return result;
  },

  async migrateGlobal() {
    if (!this._db) return;
    const snap = await get(ref(this._db, 'global/apikeys')).catch(()=>null);
    if (snap?.val()) return;
    const u = {};
    this.KEYS.forEach(k => { const v = localStorage.getItem(k); if (v) u[_ek(k)] = _enc(v); });
    if (Object.keys(u).length) await set(ref(this._db, 'global/apikeys'), u).catch(()=>{});
  }
};

// ════════════════════════════════════════════════════════════════════
//  📢 CHANGELOG
// ════════════════════════════════════════════════════════════════════
const MFChangelog = window.MFChangelog = {
  _db: null, SEEN: 'mf_changelog_seen',

  init(db) {
    this._db = db;
    onValue(ref(db, 'global/changelog'), snap => {
      const v = snap.val(); if (!v) return;
      this._check(Array.isArray(v) ? v : Object.values(v));
    });
  },

  async push(e) {
    if (!this._db) return;
    const entry = { id: Date.now()+'', ts: Date.now(), title: e.title||'Aktualizace',
      body: e.body||'', type: e.type||'update', icon: e.icon||'📦', version: e.version||'' };
    const snap = await get(ref(this._db, 'global/changelog')).catch(()=>null);
    const arr = (() => { const v = snap?.val(); return Array.isArray(v)?v:v?Object.values(v):[]; })();
    arr.unshift(entry); if (arr.length > 50) arr.length = 50;
    await set(ref(this._db, 'global/changelog'), arr).catch(()=>{});
  },

  markSeen() { _rawSetLS(this.SEEN, Date.now()+''); this._badge(0); },

  _check(list) {
    const seen = parseInt(localStorage.getItem(this.SEEN)||'0');
    const news = list.filter(e => (e.ts||0) > seen);
    if (!news.length) return;
    this._badge(news.length);
    const latest = news[0];
    setTimeout(() => _toast(`${latest.icon} ${latest.title}${latest.body?' — '+latest.body.slice(0,60):''}`, 'info', 7000), 3000);
  },

  _badge(n) {
    const bell = document.getElementById('notifBell'); if (!bell) return;
    let b = document.getElementById('mfChangelogBadge');
    if (n > 0) {
      if (!b) {
        b = Object.assign(document.createElement('span'), { id:'mfChangelogBadge' });
        b.style.cssText = 'position:absolute;top:-4px;right:-4px;background:#0a84ff;color:#fff;font-size:10px;font-weight:700;border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center;z-index:10';
        bell.style.position='relative'; bell.appendChild(b);
      }
      b.textContent = n > 9 ? '9+' : n;
    } else b?.remove();
  }
};

// ════════════════════════════════════════════════════════════════════
//  ⚡ HOOK — localStorage.setItem → CRDT delta buffer
// ════════════════════════════════════════════════════════════════════
const _prevSetLS = localStorage.setItem.bind(localStorage);
localStorage.setItem = function(key, value) {
  _prevSetLS(key, value);
  if (window.MFSync?._applying) return;
  if (key === 'mf_active_pid') { window.MFSync?.setActiveProfile(value); return; }
  if (_shouldSync(key)) window.MFSync?._bufferWrite(key, value);
};

// ════════════════════════════════════════════════════════════════════
//  🛠 HELPERS
// ════════════════════════════════════════════════════════════════════
function _ek(k)  { return k.replace(/[.#$[\]/]/g, '__'); }
function _dk(k)  { return k.replace(/__/g, '.'); }
function _enc(v) { try { return btoa(unescape(encodeURIComponent(v))); } catch(e) { return btoa(v); } }
function _dec(v) { try { return decodeURIComponent(escape(atob(v))); } catch(e) { try { return atob(v); } catch(e2) { return v; } } }
function _toast(msg, type, dur) { if (typeof showToast === 'function') showToast(msg, type, dur); }
function _autoLabel() {
  const ua = navigator.userAgent;
  if (/TV|SmartTV|Tizen|WebOS/i.test(ua)) return 'TV';
  if (/Mobile|Android/i.test(ua)) return 'Mobil';
  if (/iPad|Tablet/i.test(ua)) return 'Tablet';
  return 'PC';
}
function _hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < Math.min(str?.length || 0, 10000); i++) {
    h ^= str.charCodeAt(i); h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16);
}
function _timeAgo(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60)   return `${s}s`;
  if (s < 3600) return `${Math.floor(s/60)}min`;
  if (s < 86400) return `${Math.floor(s/3600)}h`;
  return `${Math.floor(s/86400)}d`;
}
function _loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = Object.assign(document.createElement('script'), { src, onload: res, onerror: rej });
    document.head.appendChild(s);
  });
}

// ════════════════════════════════════════════════════════════════════
//  🚀 START
// ════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  await window.MFSync.init();
  MFPresence.startHeartbeat();
  MFNotifications.requestPermission();
});
