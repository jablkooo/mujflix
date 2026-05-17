import { initializeApp }    from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getDatabase, ref, set, get, onValue, off }
                            from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

// ════════════════════════════════════════════════════════════════════
//  MůjFlix Firebase — kompletní sync engine v2
//
//  Struktura v Realtime DB:
//  /global/
//    profiles   → profily (sdílené, všechna zařízení čtou i píší)
//    apikeys    → API klíče base64 (sdílené)
//    changelog  → changelog entries (admin pushuje, všichni čtou)
//
//  /devices/{deviceId}/
//    meta       → { label, ts, online }
//    data       → localStorage data tohoto zařízení (watched, watchlist, ratings...)
//
//  Jak sync funguje:
//  PC1 změní data → pushne do /devices/PC1/data
//  PC2 poslouchá onValue na /devices/PC1/data → aplikuje změny
//  Vyhrává vždy novější timestamp → žádné konflikty
// ════════════════════════════════════════════════════════════════════

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

// Unikátní ID zařízení — přežije refresh ale ne vymazání localStorage
const DEVICE_ID = (() => {
  let id = localStorage.getItem('mf_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).slice(2,10) + '_' + Date.now().toString(36);
    localStorage.setItem('mf_device_id', id);
  }
  return id;
})();

// Co synchronizujeme mezi zařízeními (watched, watchlist, ratings, streak...)
const SYNC_PREFIXES = ['mf_watched_','mf_watchlist','mf_ratings','mf_streak',
                       'mf_ai_brain','mf_user_profile','mf_continue_'];

// Co NESYNCHRONIZUJEME (device-specific nebo globální věci)
const NOSYNC = new Set(['mf_device_id','mf_sync_local_ts','mf_firebase_cfg',
                        'mf_sync_group','mf_active_pid','mf_changelog_seen',
                        'mf_last_push_day','mf_pending_changes','mf_profiles_v2']);

window.MFSync = {
  _db:           null,
  _app:          null,
  _deviceRef:    null,
  _otherDevices: {},    // devId → ref
  _pushDebounce: null,
  _applying:     false,

  // ── INIT ────────────────────────────────────────────────────────
  init() {
    if (!FIREBASE_CONFIG.apiKey) {
      this._status('offline'); return;
    }
    try {
      this._app = initializeApp(FIREBASE_CONFIG, 'mujflix');
      this._db  = getDatabase(this._app);
      console.info('[MFSync] Firebase OK, zařízení:', DEVICE_ID);
      this._status('syncing');
      this._setup();
    } catch(e) {
      console.error('[MFSync] Init chyba:', e);
      this._status('error');
    }
  },

  async _setup() {
    const db = this._db;

    // 1. Zaregistruj toto zařízení
    const label = localStorage.getItem('mf_device_label') || _autoLabel();
    await set(ref(db, `devices/${DEVICE_ID}/meta`), { label, ts: Date.now(), online: true }).catch(()=>{});
    this._deviceRef = ref(db, `devices/${DEVICE_ID}/data`);
    window.addEventListener('beforeunload', () => {
      set(ref(db, `devices/${DEVICE_ID}/meta/online`), false).catch(()=>{});
    });

    // 2. Poslouchej na všechna ostatní zařízení (i budoucí)
    onValue(ref(db, 'devices'), snap => {
      const devs = snap.val() || {};
      Object.keys(devs).forEach(devId => {
        if (devId === DEVICE_ID || this._otherDevices[devId]) return;
        const dataRef = ref(db, `devices/${devId}/data`);
        this._otherDevices[devId] = dataRef;
        onValue(dataRef, dataSnap => {
          if (this._applying) return;
          const remote = dataSnap.val();
          if (!remote) return;
          const remoteTs = remote._ts || 0;
          const localTs  = parseInt(localStorage.getItem('mf_sync_local_ts') || '0');
          if (remoteTs > localTs) {
            console.info(`[MFSync] Data od ${devs[devId]?.meta?.label || devId}`);
            this._apply(remote);
          }
        });
      });
    });

    // 3. Init subsystémů
    MFProfilesDB.init(db);
    MFApiKeysDB.init(db);
    MFChangelog.init(db);

    // 4. Migrace z localStorage → Firebase
    setTimeout(async () => {
      await MFProfilesDB.migrate();
      await MFApiKeysDB.migrate();
      if (typeof ProfileGate !== 'undefined') ProfileGate.renderGate?.();
    }, 1500);

    this._status('online');

    // 5. Ihned pushni svá data
    setTimeout(() => this.pushNow(), 2000);
  },

  // ── Naplánuj push (debounce 1.5s) ────────────────────────────────
  schedulePush() {
    clearTimeout(this._pushDebounce);
    this._pushDebounce = setTimeout(() => this.pushNow(), 1500);
  },

  // ── Pushni lokální data do Firebase ──────────────────────────────
  async pushNow() {
    if (!this._db || !this._deviceRef) return;
    this._status('syncing');
    const data = { _ts: Date.now(), _device: DEVICE_ID };

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || NOSYNC.has(k)) continue;
      if (!SYNC_PREFIXES.some(p => k.startsWith(p))) continue;
      try { data[k.replace(/\./g,'__D__')] = localStorage.getItem(k); } catch(e) {}
    }

    localStorage.setItem('mf_sync_local_ts', data._ts);

    try {
      await set(this._deviceRef, data);
      this._status('online');
    } catch(e) {
      this._status('error');
      const msg = e.code === 'PERMISSION_DENIED'
        ? '⚠️ Firebase: Nastav DB Rules (read/write: true)'
        : '⚠️ Sync chyba: ' + (e.message || e.code);
      typeof showToast === 'function' && showToast(msg, 'error');
    }
  },

  // ── Aplikuj data z jiného zařízení ────────────────────────────────
  _apply(remote) {
    this._applying = true;
    let changed = 0;
    Object.entries(remote).forEach(([k, v]) => {
      if (k === '_ts' || k === '_device') return;
      const key = k.replace(/__D__/g, '.');
      try {
        if (localStorage.getItem(key) !== v) { localStorage.setItem(key, v); changed++; }
      } catch(e) {}
    });
    localStorage.setItem('mf_sync_local_ts', remote._ts || Date.now());

    setTimeout(() => {
      this._applying = false;
      if (!changed) return;
      typeof refreshUserContent   === 'function' && refreshUserContent();
      typeof updateWatchlistBadge === 'function' && updateWatchlistBadge();
      typeof updateLogoProgress   === 'function' && updateLogoProgress();
      typeof updateContinueWidget === 'function' && updateContinueWidget();
      typeof updateWatcherBadges  === 'function' && updateWatcherBadges();
      typeof ProfileGate !== 'undefined' && ProfileGate.renderBadge?.();
      typeof showToast === 'function' &&
        showToast('🔄 Synchronizováno (' + changed + ' změn)', 'success');
    }, 150);
  },

  // ── Status badge ──────────────────────────────────────────────────
  _status(s) {
    window._mfSyncStatus = s;
    const b = document.getElementById('syncStatusBadge');
    if (!b) return;
    const ic = {online:'☁️',syncing:'🔄',offline:'📴',error:'⚠️','no-group':'🔗'};
    const lb = {online:'Sync ON',syncing:'Syncing…',offline:'Offline',error:'Chyba','no-group':'Nastav sync'};
    const cl = {online:'#007AFF',syncing:'#007AFF',offline:'#636e72',error:'#e17055','no-group':'#a29bfe'};
    b.innerHTML = `<span>${ic[s]||'☁️'}</span><span>${lb[s]||s}</span>`;
    b.style.color = cl[s]||'#fff';
    b.style.borderColor = (cl[s]||'#fff') + '44';
    s === 'syncing' ? b.classList.add('syncing') : b.classList.remove('syncing');
  },

  // Vrátí seznam zařízení (pro admin panel)
  async getDevices() {
    if (!this._db) return [];
    const snap = await get(ref(this._db, 'devices')).catch(()=>null);
    if (!snap?.val()) return [];
    return Object.entries(snap.val()).map(([id, d]) => ({
      id, isMe: id === DEVICE_ID,
      label:  d.meta?.label  || id,
      online: d.meta?.online || false,
      ts:     d.meta?.ts     || 0
    }));
  },

  setDeviceLabel(label) {
    localStorage.setItem('mf_device_label', label);
    if (this._db) set(ref(this._db, `devices/${DEVICE_ID}/meta/label`), label).catch(()=>{});
  },

  // Zpětná kompatibilita
  connectGroup(key) { localStorage.setItem('mf_sync_group', key); },
  disconnect()      { Object.values(this._otherDevices).forEach(r => off(r)); this._status('offline'); }
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
      this._cache = Array.isArray(d) ? d : d ? Object.values(d) : [];
      this._cbs.forEach(fn => { try { fn(this._cache); } catch(e){} });
      // Re-render gate pokud je otevřený
      if (typeof ProfileGate !== 'undefined') ProfileGate.renderGate?.();
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

  async saveProfiles(p) {
    try { localStorage.setItem('mf_profiles_v2', JSON.stringify(p)); } catch(e) {}
    this._cache = p;
    if (this._db) await set(ref(this._db, 'global/profiles'), p).catch(e => console.warn('[MFProfilesDB]', e));
  },

  getSync()       { return this._cache ?? this._local(); },
  onChange(fn)    { this._cbs.push(fn); },
  _local()        { try { return JSON.parse(localStorage.getItem('mf_profiles_v2') || '[]'); } catch(e) { return []; } },

  async migrate() {
    const local = this._local();
    if (!local.length) return;
    const fb = await this.getProfiles();
    if (!fb.length) { await this.saveProfiles(local); console.info('[MFProfilesDB] Migrace OK'); }
  }
};

// ════════════════════════════════════════════════════════════════════
//  🔑 API KEYS DB
// ════════════════════════════════════════════════════════════════════
const MFApiKeysDB = window.MFApiKeysDB = {
  _db: null,
  KEYS: ['mf_gemini_key','mf_or_key','mf_groq_key','mf_jina_key',
         'mf_tavily_key','mf_tmdb_key','mf_openai_key','mf_anthropic_key','mf_jsonbin_key'],

  init(db) {
    this._db = db;
    // Realtime → při změně klíče na PC1 se PC2 okamžitě aktualizuje
    onValue(ref(db, 'global/apikeys'), snap => {
      const d = snap.val();
      if (!d) return;
      this.KEYS.forEach(k => {
        const v = d[k.replace(/\./g,'__')];
        if (v) try { localStorage.setItem(k, atob(v)); } catch(e) {}
      });
      console.info('[MFApiKeysDB] Klíče sync ✓');
    });
  },

  async saveKey(name, value) {
    try { localStorage.setItem(name, value); } catch(e) {}
    if (!this._db || !value) return;
    await set(ref(this._db, 'global/apikeys/' + name.replace(/\./g,'__')), btoa(value)).catch(e => console.warn('[MFApiKeysDB]', e));
  },

  async deleteKey(name) {
    try { localStorage.removeItem(name); } catch(e) {}
    if (this._db) await set(ref(this._db, 'global/apikeys/' + name.replace(/\./g,'__')), null).catch(()=>{});
  },

  async migrate() {
    if (!this._db) return;
    const snap = await get(ref(this._db, 'global/apikeys')).catch(()=>null);
    if (snap?.val()) return;
    const u = {};
    this.KEYS.forEach(k => { const v = localStorage.getItem(k); if (v) u[k.replace(/\./g,'__')] = btoa(v); });
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
      const v = snap.val();
      if (!v) return;
      const list = Array.isArray(v) ? v : Object.values(v);
      this._check(list);
    });
  },

  async push(e) {
    if (!this._db) return;
    const entry = { id: Date.now()+'', ts: Date.now(),
      title: e.title||'Aktualizace', body: e.body||'',
      type: e.type||'update', icon: e.icon||'📦', version: e.version||'' };
    const snap = await get(ref(this._db, 'global/changelog')).catch(()=>null);
    const arr = (() => { const v = snap?.val(); return Array.isArray(v)?v:v?Object.values(v):[]; })();
    arr.unshift(entry);
    if (arr.length > 50) arr.length = 50;
    await set(ref(this._db, 'global/changelog'), arr).catch(e => console.warn('[MFChangelog]', e));
  },

  markSeen() { localStorage.setItem(this.SEEN, Date.now()+''); this._badge(0); },

  _check(list) {
    const seen = parseInt(localStorage.getItem(this.SEEN)||'0');
    const news = list.filter(e => (e.ts||0) > seen);
    if (!news.length) return;
    this._badge(news.length);
    this._injectPanel(list);
    const latest = news[0];
    setTimeout(() => typeof showToast === 'function' &&
      showToast(`${latest.icon} ${latest.title}${latest.body?' — '+latest.body.slice(0,60):''}`, 'info', 7000), 3000);
  },

  _badge(n) {
    const bell = document.getElementById('notifBell');
    if (!bell) return;
    let b = document.getElementById('mfChangelogBadge');
    if (n > 0) {
      if (!b) {
        b = Object.assign(document.createElement('span'), { id:'mfChangelogBadge' });
        b.style.cssText = 'position:absolute;top:-4px;right:-4px;background:#0a84ff;color:#fff;font-size:10px;font-weight:700;border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center;z-index:10';
        bell.style.position = 'relative';
        bell.appendChild(b);
      }
      b.textContent = n > 9 ? '9+' : n;
    } else b?.remove();
  },

  _injectPanel(all) {
    window._mfCLEntries = all;
    if (window._mfCLInjected) return;
    window._mfCLInjected = true;
    const orig = window.renderNotifPanel;
    window.renderNotifPanel = function() {
      typeof orig === 'function' && orig();
      const p = document.getElementById('notifPanelList');
      if (!p || !window._mfCLEntries?.length) return;
      const seen = parseInt(localStorage.getItem(window.MFChangelog.SEEN)||'0');
      const clr  = { feature:'#30d158', fix:'#ff9f0a', update:'#0a84ff', security:'#ff375f' };
      const div  = document.createElement('div');
      div.style.cssText = 'padding:10px 16px 4px;font-size:11px;font-weight:800;letter-spacing:1.5px;color:rgba(255,255,255,0.3);text-transform:uppercase';
      div.textContent = 'Changelog & aktualizace';
      p.insertAdjacentElement('afterbegin', div);
      div.insertAdjacentHTML('afterend', window._mfCLEntries.slice(0,10).map(e => {
        const isNew = (e.ts||0) > seen;
        const date  = new Date(e.ts||0).toLocaleDateString('cs-CZ',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
        return `<div class="notif-item mf-changelog-item" style="border-left:3px solid ${clr[e.type]||'#0a84ff'};${isNew?'background:rgba(10,132,255,0.06)':''}" onclick="window.MFChangelog.markSeen()">
          <div style="font-size:22px;flex-shrink:0">${e.icon||'📦'}</div>
          <div class="notif-item-info">
            <div class="notif-item-name" style="display:flex;align-items:center;gap:8px">${e.title}
              ${isNew?'<span style="background:#0a84ff;color:#fff;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px">NOVÉ</span>':''}
              ${e.version?`<span style="color:rgba(255,255,255,0.3);font-size:11px">${e.version}</span>`:''}
            </div>
            ${e.body?`<div class="notif-item-ep" style="white-space:normal;line-height:1.4">${e.body}</div>`:''}
            <div class="notif-item-date">📅 ${date}</div>
          </div>
        </div>`;
      }).join(''));
    };
  }
};

// ════════════════════════════════════════════════════════════════════
//  ⚡ HOOK — každý localStorage.setItem → push do Firebase
// ════════════════════════════════════════════════════════════════════
const _origLS = localStorage.setItem.bind(localStorage);
localStorage.setItem = function(key, value) {
  _origLS(key, value);
  if (window.MFSync?._applying || NOSYNC.has(key)) return;
  if (SYNC_PREFIXES.some(p => key.startsWith(p))) window.MFSync?.schedulePush();
};

// ════════════════════════════════════════════════════════════════════
//  🚀 START
// ════════════════════════════════════════════════════════════════════
function _autoLabel() {
  const ua = navigator.userAgent;
  if (/TV|SmartTV|Tizen|WebOS/i.test(ua)) return 'TV';
  if (/Mobile|Android/i.test(ua)) return 'Mobil';
  if (/iPad|Tablet/i.test(ua)) return 'Tablet';
  return 'PC';
}

document.addEventListener('DOMContentLoaded', () => window.MFSync.init());
