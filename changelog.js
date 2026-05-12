/**
 * CHANGELOG SYSTEM - Systém pro sledování změn a notifikace
 *
 * Funkce:
 * - Sleduje změny v kódu a ukládá je
 * - Zobrazuje notifikace při aktualizacích
 * - Integruje se s MFSync pro automatickou synchronizaci
 */

const ChangelogSystem = (function() {
  const STORAGE_KEY = 'mf_changelog_version';
  const PENDING_KEY = 'mf_pending_changes';
  const LAST_SYNC_KEY = 'mf_last_sync_check';

  /**
   * Inicializace - spustí se automaticky při načtení
   */
  function init() {
    checkForUpdates();
    setupMFSyncIntegration();
    markChangesAsRead();
  }

  /**
   * Přidá novou změnu do systému
   * @param {string} type - feature, fix, update, refactor, security
   * @param {string} description - co změna dělá
   * @param {string} purpose - k čemu slouží
   */
  function addChange(type, description, purpose) {
    const change = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      type: type,
      description: description,
      purpose: purpose
    };

    const pending = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
    pending.push(change);
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending));

    console.log('[Changelog] Přidána změna:', change.type, '-', change.description);
    return change;
  }

  /**
   * Kontrola aktualizací při načtení
   */
  function checkForUpdates() {
    const lastCheck = localStorage.getItem(LAST_SYNC_KEY);
    const now = Date.now();

    // Kontrola MFSync pro vzdálené aktualizace
    if (window.MFSync && window._mfSyncStatus === 'online') {
      const currentVersion = localStorage.getItem(STORAGE_KEY) || '1.0.0';
      // Pokud existují nové změny od poslední kontroly
      const pending = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
      if (pending.length > 0) {
        showUpdateNotification(pending[pending.length - 1]);
      }
    }

    localStorage.setItem(LAST_SYNC_KEY, now);
  }

  /**
   * Zobrazí notifikaci o aktualizaci
   */
  function showUpdateNotification(change) {
    if (typeof showToast === 'function') {
      const icons = {
        feature: '✨',
        fix: '🔧',
        update: '📦',
        refactor: '♻️',
        security: '🔒'
      };
      const icon = icons[change.type] || '📝';
      showToast(`${icon} Aktualizace: ${change.description}`, 6000);
    }
  }

  /**
   * Integrace s MFSync - automatické načtení dat po sync
   */
  function setupMFSyncIntegration() {
    // Monitor MFSync status pro notifikace o sync
    const originalUpdateStatus = window.MFSync?._updateStatus;
    if (originalUpdateStatus) {
      window.MFSync._updateStatus = function(status) {
        originalUpdateStatus.call(this, status);
        if (status === 'online') {
          showSyncNotification();
        }
      };
    }
  }

  /**
   * Zobrazí notifikaci po synchronizaci
   */
  function showSyncNotification() {
    if (typeof showToast === 'function') {
      showToast('☁️ Data synchronizována', 3000);
    }
  }

  /**
   * Označí změny jako přečtené
   */
  function markChangesAsRead() {
    const pending = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
    if (pending.length > 0) {
      const latestDate = pending[pending.length - 1].date;
      localStorage.setItem(STORAGE_KEY, latestDate);
    }
  }

  /**
   * Vrátí seznam změn
   */
  function getChanges() {
    return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
  }

  /**
   * Zobrazí changelog UI
   */
  function showChangelog() {
    const changes = getChanges();
    if (changes.length === 0) {
      showToast('Žádné nové změny', 3000);
      return;
    }

    const latest = changes[changes.length - 1];
    const icons = {
      feature: '✨',
      fix: '🔧',
      update: '📦',
      refactor: '♻️',
      security: '🔒'
    };
    showToast(`${icons[latest.type] || '📝'} Poslední změna: ${latest.description}`, 5000);
  }

  // Spustit při načtení
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    add: addChange,
    show: showChangelog,
    getAll: getChanges,
    check: checkForUpdates
  };
})();

// Příklad použití:
// ChangelogSystem.add('feature', 'Přidáno vyhledávání', 'Umožňuje hledat filmy');
// ChangelogSystem.add('fix', 'Opravena chyba', 'Synchronizace funguje správně');