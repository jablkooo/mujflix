// ══════════════════════════════════════════════════════════════
// MůjFlix — vzor konfigurace
// ──────────────────────────────────────────────────────────────
// 1. Zkopíruj tenhle soubor jako "config.js" (bez ".example")
// 2. Vlož svůj vlastní TMDB API klíč (zdarma na
//    https://www.themoviedb.org/settings/api)
// 3. "config.js" je v .gitignore, takže zůstane jen u tebe lokálně
//    / na tvém hostingu a nikdy se nenahraje na GitHub.
//
// Bez tohohle souboru appka nastartuje, ale nebudou se načítat
// obrázky, popisky a další data z TMDB.
// ══════════════════════════════════════════════════════════════
window.TMDB_KEY_DEFAULT = "TVŮJ_TMDB_API_KLÍČ_SEM";
