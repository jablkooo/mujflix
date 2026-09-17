# 🎬 MůjFlix

> **Moderní filmový a seriálový discovery hub postavený na Vanilla JavaScriptu, Cloudflare a TMDB.**

MůjFlix je rychlá a responzivní webová aplikace pro **objevování, vyhledávání a organizaci filmů a seriálů**.

Design kombinuje **cinematic streaming UI**, moderní dark mode, jemný **glassmorphism** a prvky inspirované prémiovými platformami jako Apple TV+ nebo Netflix — bez použití těžkých frontend frameworků.

---

## ✨ Hlavní funkce

### 🔎 Discover & Search

MůjFlix využívá **TMDB** pro vyhledávání a objevování obsahu v reálném čase.

* 🎬 Filmy
* 📺 Seriály
* 👤 Herci a tvůrci
* 🏷️ Žánry
* 🔥 Populární obsah
* ⭐ Hodnocení
* 🆕 Novinky
* 🎯 Dynamické filtrování
* 🔍 Rychlé vyhledávání

---

### 🎞️ Cinema Player

Vlastní přehrávací rozhraní navržené pro co nejpříjemnější sledování.

* Cinematic fullscreen UI
* Modulární ovládání
* Podpora externích zdrojů
* Kontextové propojení s dostupným obsahem
* Responzivní rozhraní pro desktop i mobil

> MůjFlix odděluje samotné UI přehrávače od zdrojů videa.

---

### 🎨 Moderní Dark UI

MůjFlix používá moderní **cinematic dark-mode design**.

#### Designové principy

* 🌑 Deep Black / Midnight background
* 🧊 Jemný glassmorphism
* ✨ Ambient gradients
* 🔵 Electric Blue / Purple accents
* 🎞️ Velké filmové postery
* 🫧 Floating UI prvky
* 📱 Mobile-first responsive layout
* 🎯 Výrazná vizuální hierarchie

Glass efekt není používán na každém prvku. Používá se především tam, kde má smysl — například u navigace, vyhledávání, modalů a floating komponent.

---

### 🧭 Floating Dock

Spodní navigace funguje jako plovoucí dock inspirovaný moderními desktopovými a mobilními rozhraními.

```text
        ┌───────────────────────────────────┐
        │  🏠    🔎    🎬    ❤️    ⚙️       │
        └───────────────────────────────────┘
                    ↑
              Floating Dock
```

* Glass / blur background
* Zaoblené rohy
* Aktivní stav
* Plynulé animace
* Desktop + mobile layout
* Optimalizováno pro dotykové ovládání

---

### 🖼️ TMDB Image Proxy

MůjFlix obsahuje vlastní serverless image proxy:

```text
/functions/api/tmdb-img/
└── [[catchall]].js
```

Cloudflare Function slouží jako proxy vrstva mezi aplikací a TMDB obrázky.

Výhody:

* ⚡ Lepší kontrola cachování
* 🛡️ Oddělení proxy vrstvy od frontendu
* 🌐 Edge processing
* 🖼️ Spolehlivější načítání posterů a backdropů
* 🚀 Využití Cloudflare infrastruktury

---

### 📱 PWA

MůjFlix je navržen s ohledem na **Progressive Web App** použití.

Aplikaci lze připravit pro instalaci:

* 💻 Windows
* 🖥️ macOS
* 📱 Android
* 📱 iOS

Rozhraní je responzivní a přizpůsobuje se velikosti obrazovky.

---

### 📺 Legální poskytovatelé

Modul:

```text
legal-streaming-providers.js
```

zobrazuje dostupné **oficiální streamovací služby** pro jednotlivé tituly.

Například:

* Netflix
* HBO Max
* Disney+
* Apple TV+
* Prime Video
* další dostupní poskytovatelé

Cílem je uživateli ukázat, **kde lze titul legálně sledovat, pronajmout nebo zakoupit**.

---

# 🏗️ Technologie

MůjFlix je záměrně postaven bez velkého frontend frameworku.

| Technologie          | Použití                    |
| -------------------- | -------------------------- |
| HTML5                | Struktura aplikace         |
| CSS3                 | Design a animace           |
| Vanilla JavaScript   | Aplikační logika           |
| TMDB API             | Filmová databáze           |
| Cloudflare Pages     | Hosting                    |
| Cloudflare Functions | Serverless backend         |
| Wrangler             | Lokální vývoj a deployment |
| PWA                  | Instalovatelná aplikace    |

### Frontend

```text
HTML5
CSS3
Vanilla JavaScript ES6+
```

Projekt nepoužívá React, Vue ani podobný framework.

Důvodem je především:

* minimální režie
* rychlé načítání
* jednoduchá struktura
* plná kontrola nad DOM
* minimální množství závislostí

---

# 📁 Struktura projektu

```text
mujflix/
│
├── functions/
│   └── api/
│       └── tmdb-img/
│           └── [[catchall]].js
│
├── app.js
├── index.html
│
├── legal-streaming-providers.js
├── mujflix-cinema-player.js
├── mujflix-discover-redesign.js
├── mujflix-dock-fix.js
├── notifications-changelog.js
│
├── styles.css
├── styles-apple-tv.css
├── styles-glass.css
├── styles-premium.css
├── mujflix-fixes.css
│
└── wrangler.toml
```

### Hlavní soubory

**`app.js`**

Hlavní aplikační logika, stav aplikace a event handling.

**`mujflix-cinema-player.js`**

Vlastní Cinema Player a jeho UI.

**`mujflix-discover-redesign.js`**

Discover rozhraní, vyhledávání a objevování obsahu.

**`legal-streaming-providers.js`**

Informace o legálních poskytovatelích streamingu.

**`mujflix-dock-fix.js`**

Chování a opravy floating navigation docku.

**`notifications-changelog.js`**

Systém interních notifikací a changelogu.

**`functions/api/tmdb-img/[[catchall]].js`**

Serverless proxy pro TMDB obrázky.

---

# ⚡ Architektura

MůjFlix používá jednoduchou serverless architekturu:

```text
                    ┌──────────────┐
                    │    User      │
                    └──────┬───────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Cloudflare     │
                  │     Pages       │
                  └───────┬─────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
       ┌─────────────┐       ┌────────────────┐
       │  Static     │       │ Cloudflare     │
       │  Frontend   │       │ Functions      │
       └─────────────┘       └───────┬────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │     TMDB     │
                              └──────────────┘
```

Díky tomu není potřeba provozovat klasický VPS nebo vlastní backend server.

---

# 🛠️ Lokální vývoj

## Požadavky

Doporučeno:

* Node.js 18+
* npm nebo pnpm
* Git
* Cloudflare účet pro deployment

---

## 1. Klonování

```bash
git clone https://github.com/jablkooo/mujflix.git
cd mujflix
```

---

## 2. Lokální server

Pro spuštění Cloudflare Pages prostředí:

```bash
npx wrangler pages dev .
```

Aplikace bude dostupná na:

```text
http://localhost:8788
```

---

# 🔐 Environment Variables

Citlivé údaje **nikdy nevkládej přímo do zdrojového kódu**.

Používej:

```text
Cloudflare Environment Variables
```

nebo lokálně:

```text
.dev.vars
```

který musí být přidán do `.gitignore`.

Příklady citlivých údajů:

```text
TMDB_API_KEY
JINA_API_KEY
CLOUDFLARE_API_TOKEN
```

Serverless Functions k nim mohou přistupovat přes:

```javascript
context.env
```

Například:

```javascript
const apiKey = context.env.TMDB_API_KEY;
```

### ❌ Nedělej

```javascript
const TMDB_API_KEY = "tajny-klic";
```

### ✅ Používej

```javascript
const TMDB_API_KEY = context.env.TMDB_API_KEY;
```

---

# 🚀 Deployment

MůjFlix je určený pro **Cloudflare Pages**.

## Automatický deployment

Při propojení GitHubu s Cloudflare Pages lze nastavit:

```text
git push
    │
    ▼
GitHub
    │
    ▼
Cloudflare Pages
    │
    ▼
Deployment
```

Push do hlavní větve může automaticky vytvořit novou produkční verzi.

Pull Requesty lze využít pro preview deployments.

---

## Manuální deployment

```bash
npx wrangler pages deploy . --project-name=mujflix
```

---

# 🎨 Design System

MůjFlix používá několik vizuálních vrstev.

### `styles.css`

Základní layout, komponenty a globální styly.

### `styles-premium.css`

Prémiové dark téma.

### `styles-glass.css`

Glassmorphism komponenty:

* blur
* průhledné panely
* jemné borders
* floating UI

### `styles-apple-tv.css`

Vizuální styl inspirovaný moderními streaming rozhraními.

### `mujflix-fixes.css`

Dodatečné opravy layoutu a responzivity.

---

# 🎨 Barevný systém

```css
--bg: #07080c;
--bg-secondary: #0d0f15;

--surface: rgba(255,255,255,.055);
--surface-hover: rgba(255,255,255,.09);

--border: rgba(255,255,255,.09);

--text: #f5f7fb;
--text-secondary: #a5a9b5;
--text-muted: #6f7480;

--accent: #5b7cff;
--accent-secondary: #8b5cf6;
```

### Design philosophy

Místo čistě černého pozadí používá MůjFlix velmi tmavé grafitové a midnight odstíny.

Výsledkem je hlubší vizuální prostor, ve kterém více vynikají filmové postery a cinematic artwork.

---

# 📐 Responsive Design

MůjFlix je navržen pro:

```text
📱 Mobile
   ↓
📱 Tablet
   ↓
💻 Laptop
   ↓
🖥️ Desktop
   ↓
📺 Large Display / TV
```

Desktop a mobilní rozhraní nemusí používat pouze stejné komponenty v menší velikosti.

Na mobilu se například:

* floating dock přizpůsobuje velikosti displeje
* mění počet filmů v řádku
* upravuje velikost hero sekce
* zjednodušují některé ovládací prvky
* optimalizuje touch interaction

---

# ⚡ Výkon

Jedním z hlavních cílů projektu je **rychlé načtení bez zbytečného JavaScriptového frameworku**.

Projekt se snaží minimalizovat:

* počet závislostí
* velikost bundle
* zbytečné DOM operace
* počet serverových komponent
* nepotřebné requesty

Cloudflare zároveň umožňuje využít edge infrastrukturu pro statický obsah i Functions.

---

# 🛡️ Bezpečnost

### Nikdy necommituj:

```text
.env
.dev.vars
API keys
Cloudflare tokens
private credentials
```

Doporučený `.gitignore`:

```gitignore
.env
.env.*
.dev.vars
.dev.vars.*
node_modules/
.wrangler/
.DS_Store
```

Pokud do Git repozitáře omylem nahraješ API klíč, nestačí soubor pouze smazat.

**Klíč je potřeba zneplatnit a vygenerovat nový.**

---

# 🤖 AI-assisted Development

Vývoj MůjFlixu využívá také AI nástroje jako pomoc při:

* návrhu UI
* refaktoringu
* debugování
* generování komponent
* optimalizaci CSS
* dokumentaci
* hledání problémů v kódu

AI je používána jako vývojový nástroj, zatímco výsledný kód je součástí projektu MůjFlix.

---

# 🤝 Přispívání

Pull Requesty a další příspěvky jsou vítány.

### 1. Fork

Vytvoř vlastní fork projektu.

### 2. Vytvoř branch

```bash
git checkout -b feature/nova-funkce
```

### 3. Proveď změny

```bash
git add .
git commit -m "feat: pridana nova funkce"
```

### 4. Push

```bash
git push origin feature/nova-funkce
```

### 5. Pull Request

Vytvoř Pull Request do hlavní větve projektu.

---

# 🗺️ Roadmap

Budoucí vývoj může zahrnovat:

* [ ] Pokročilejší filmová doporučení
* [ ] Uživatelské watchlisty
* [ ] Oblíbené tituly
* [ ] Pokračování ve sledování
* [ ] Detailnější profil filmu
* [ ] Vylepšený Cinema Player
* [ ] Více PWA funkcí
* [ ] Offline základní UI
* [ ] Pokročilé filtrování
* [ ] Personalizované Discover
* [ ] Další vizuální témata
* [ ] Optimalizace pro TV obrazovky

---

# 📜 Licence

Licence projektu bude definována samostatně v repozitáři.

---

# ❤️ Poděkování

MůjFlix vzniká jako samostatný open-source / experimentální projekt zaměřený na moderní web development, UI/UX a serverless architekturu.

### Vývoj

**jablkooo**

### AI nástroje

Claude, ChatGPT a další vývojové nástroje.

---

<div align="center">

### 🎬 MůjFlix

**Discover. Explore. Watch.**

Built with ❤️, JavaScript & Cloudflare.

</div>
