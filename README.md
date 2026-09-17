# MůjFlix

Osobní streamovací "hub" — sleduje rozkoukané seriály a filmy, propojuje je s externími
zdroji (Bombuj, SvetSerialu, Prehrajto.cz, Uzi.la) a nabízí Netflix-like rozhraní
(Objevování, Cinema mód, profily s PINem, cross-device sync).

Nasazeno přes **Cloudflare Pages** (viz `wrangler.toml` a `functions/`).

---

## 🗂 Struktura projektu

```
mujflix/
├── index.html                      hlavní HTML — všechny modály, dock, PIN, cinema DOM
├── app.js                          jádro appky (11 000+ řádků) — DB seriálů, watchlist,
│                                    profily, Objevování, cinema logika, AI panel...
│
├── styles.css                      hlavní styly (nejstarší a nejrozsáhlejší vrstva)
├── styles-premium.css               │
├── styles-apple-tv.css              │  postupně přidávané vizuální vrstvy —
├── styles-glass.css                 │  načítají se v tomto pořadí a přebíjí se navzájem
├── styles-discover-redesign.css     │  (pozor na pořadí při další úpravě!)
├── mujflix-fixes.css                ★ NAŠE opravná vrstva — načítá se JAKO POSLEDNÍ,
│                                      má tak vždy poslední slovo
│
├── mujflix-img-fix.js              drobné opravy obrázků
├── legal-streaming-providers.js    seznam legálních VOD platforem
├── notifications-changelog.js      in-app novinky/changelog panel
├── mujflix-patch.js                starší drobné opravy
├── mujflix-url-fix.js              opravy URL pro externí zdroje
├── mujflix-discover-redesign.js    doplňuje ikony/badge do Objevování
├── mujflix-cinema-player.js        ★ Cinema mód — přehrávač s více zdroji,
│                                      navigace epizod, přidání do seznamu
├── mujflix-dock-fix.js             ★ NAŠE opravná vrstva — spodní lišta, onboarding,
│                                      personalizace domovských dlaždic, multi-žánry
│
├── _headers                        Cloudflare Pages HTTP hlavičky
├── wrangler.toml                   Cloudflare Pages/Workers konfigurace
└── functions/api/                  serverless funkce (např. proxy pro TMDB obrázky)
```

### ⚠️ Kritické pravidlo pořadí scriptů

`app.js` se načítá s atributem **`defer`**. Jakýkoliv další `<script>`, který má za úkol
**přepsat/rozšířit funkci z `app.js`** (typicky naše `mujflix-*-fix.js` soubory), musí mít
`defer` také — jinak se spustí DŘÍV než `app.js` a `app.js` mu při svém pozdějším
spuštění vše přepíše zpátky na původní chování. Proto:

```html
<script src="app.js?v=6" defer></script>
...
<script src="mujflix-cinema-player.js" defer></script>
<script src="mujflix-dock-fix.js" defer></script>
```

Skripty, které jen definují funkce volané POZDĚJI (na klik, na timeout), `defer`
nutně nepotřebují — ale je to bezpečnější default, ať se tahle chyba už neopakuje.

### 🔄 Cache-busting

`app.js` se natahuje s `?v=6` v URL právě proto, aby si ho prohlížeč/Cloudflare
nedržel v cache po úpravě. **Ostatní `.js`/`.css` soubory verzovací parametr nemají** —
po každé úpravě `mujflix-*.js`/`.css` je dobré:
1. připsat/zvýšit `?v=N` u daného `<script>`/`<link>` tagu v `index.html`, NEBO
2. tvrdě obnovit stránku (Ctrl+Shift+R / vymazat cache), jinak se změna nemusí projevit.

---

## ✨ Klíčové vlastní úpravy (nad rámec původního kódu)

### `mujflix-fixes.css`
- Spodní lišta (dock): v klidu menší, při hoveru zvětšení (opak původního chování)
- Dock se v Objevování celý schová (ne jen ztlumí) — `body.discover-open #mfDock`
- Cinema mód — vzhled source baru, TV navigace, mřížky epizod, tlačítka "Přidat do seznamu"
- Oprava sync tečky (`.mf-sync-dot`) — správné šedá/zelená/modrá/červená stavy
- Skrytí 🔖 ikony na domovských dlaždicích
- Hezčí PIN políčka při zakládání profilu (`.pc-pin-digit`)

### `mujflix-dock-fix.js`
- Spolehlivé zvýrazňování aktivní položky v docku (`setDockActive` přepsáno)
- Synchronizace při zavření Objevování / změně URL hashe
- Vypnutí onboarding otázky "Co tě baví?" po založení profilu
- Oprava počtu sezón u seriálů otevřených z Objevování (`epsBySeason` se dřív nedoplňovalo)
- Personalizace 4 domovských dlaždic podle skutečně sledovaného obsahu
- Vícenásobný výběr žánrů v Objevování (nezávislé zapínání/vypínání)

### `mujflix-cinema-player.js`
Kompletně přepsaný samostatný přehrávač (nahrazuje původní `MFCinemaPlayer`):
- **Zdroje filmů:** Bombuj → Bombuj (bez roku) → Prehrajto.cz → Uzi.la
- **Zdroje seriálů:** SvetSerialu → Bombuj → Prehrajto.cz → Uzi.la
- Tlačítko "Nepovedlo se najít? Zkusit jiný zdroj →" s počítadlem vyzkoušených zdrojů
- Navigace epizod: ⏮ Předchozí / Další ⏭ / 📺 Vybrat epizodu (grid se stavem zhlédnuto) / ⏭⏭ Další seriál
- "➕ Přidat do seznamu" — propisuje se do Watchlistu a rozsvítí ikonu v docku

### `styles-apple-tv.css` (oprava, ne nový soubor)
- Chybějící `}` u `.pc-btn-save` rozbíjelo parsování CSS hned za tím (`.pc-pin-digit`)
- Nesmyslné natvrdo-zelené `.mf-sync-dot` bez ohledu na stav (opraveno v `mujflix-fixes.css`)

---

## 🌐 Externí zdroje videí — logika URL

| Zdroj | Film | Seriál (S/E) |
|---|---|---|
| **Bombuj** | `bombuj.si/online-film-{slug}-{rok}` | `serialy.bombuj.si/serial/{slug}-{S}x{EE}` |
| **SvetSerialu** | — | `svetserialu.to/serial/{slug}/s{SS}e{EE}` |
| **Prehrajto.cz** | `prehrajto.cz/hledej/{název bez diakritiky, mezery}` | totéž + `" S01E02"` v dotazu |
| **Uzi.la** | `uzi.la/p/{slug}` | `uzi.la/p/{slug}-s{SS}e{EE}` |

`{slug}` = název bez diakritiky, malými písmeny, mezery/speciální znaky → pomlčky
(sdílená funkce `_czSlug` z `app.js`). U Prehrajto.cz zůstávají mezery jako mezery
(→ `%20` v URL), protože jde o vyhledávací dotaz, ne přímou stránku.

Formáty pro seriály u Prehrajto.cz/Uzi.la jsou **odhad** (weby nemají oficiální API) —
pokud nesedí, je potřeba upravit `prehrajtoTvUrl()` / `uziTvUrl()` v `mujflix-cinema-player.js`.

---

## 🚀 Nasazení

Projekt běží na **Cloudflare Pages**. Push do `main` větve na GitHubu spustí automatický
deploy (pokud je Pages projekt napojený na repo).

Lokální test bez Cloudflare CLI: stačí servírovat složku libovolným statickým serverem
(`python3 -m http.server`, `npx serve`, …) — appka je čistě statická (HTML/CSS/JS),
kromě `functions/api/` (Cloudflare Pages Functions, běží jen po nasazení).

---

## 🐛 Known issues / co ještě ověřit

- Formáty URL pro Prehrajto.cz/Uzi.la u seriálů jsou nepotvrzený odhad
- Personalizace domovských dlaždic řadí podle počtu zhlédnutých epizod — ne podle
  data posledního zhlédnutí (mohlo by se přesnějc, kdyby appka ukládala timestamp)
- CSS má napříč soubory hodně duplicitních/přebíjejících se pravidel (historický dluh) —
  při jakékoliv další vizuální úpravě ověřit finální chování v prohlížeči, ne jen v kódu
