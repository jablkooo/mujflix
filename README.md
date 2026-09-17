# 🎬 MůjFlix

> **Moderní filmový a seriálový discovery hub pro PC a notebooky.**

MůjFlix je webová aplikace pro **objevování, vyhledávání a organizaci filmů a seriálů**.

Projekt kombinuje **moderní dark-mode, cinematic UI, jemný glassmorphism a prémiovou streaming estetiku** s rychlým frontendem postaveným na Vanilla JavaScriptu a serverless infrastruktuře Cloudflare.

🖥️ **PC / Notebook:** ✅  
📱 **Mobil:** 🚧 Ve vývoji

---

## 📖 Obsah

* [🎬 O MůjFlixu](#-o-můjflixu)
* [⚡ Jak spustit](#-jak-spustit)
* [✨ Funkce](#-funkce)
* [🏗️ Technologie](#️-technologie)
* [📁 Struktura projektu](#-struktura-projektu)
* [🚀 Deployment](#-deployment)
* [🔐 API klíče](#-api-klíče)
* [🤖 Vibe Coded](#-vibe-coded)
* [👤 Autor](#-autor)

---

## 🎬 O MůjFlixu

MůjFlix je navržen jako moderní desktopové rozhraní pro objevování filmů a seriálů.

### 🎨 Design

* 🌑 Deep Dark / Midnight background
* 🧊 Glassmorphism
* 🎞️ Velké filmové postery
* ✨ Ambientní gradienty
* 🔵 Blue / Purple accent barvy
* 🫧 Floating navigation dock
* 🎬 Cinematic streaming UI
* 🖥️ Optimalizováno pro velké obrazovky

Design je inspirován moderními streaming platformami, ale MůjFlix používá vlastní UI a komponenty.

> 📱 **Mobilní verze je stále ve vývoji a zatím není kompletně dokončená.**

---

## ⚡ Jak spustit

### 🌐 Online verze

MůjFlix je dostupný přímo přes Cloudflare Pages:

👉 **https://mujflix.pages.dev/**

Není potřeba nic instalovat — stačí otevřít odkaz v prohlížeči.

### 💻 Lokální spuštění

Pokud chceš projekt spustit lokálně:

### 📋 Požadavky

Před spuštěním potřebuješ:

* [Node.js](https://nodejs.org/) 18+
* npm nebo pnpm
* Git

### 1. 📥 Naklonování projektu

```bash
git clone https://github.com/jablkooo/mujflix.git
cd mujflix
```

### 2. 📦 Spuštění vývojového serveru

```bash
npx wrangler pages dev .
```

### 3. 🌐 Otevření aplikace

Po spuštění otevři:

```text
http://localhost:8788
```

Aplikace by měla být dostupná v prohlížeči.

---

## ✨ Funkce

### 🔎 Discover & Search

MůjFlix využívá **TMDB** pro vyhledávání a objevování obsahu.

* 🎬 Filmy
* 📺 Seriály
* 👤 Herci
* 🏷️ Žánry
* 🔥 Populární obsah
* ⭐ Hodnocení
* 🔍 Vyhledávání
* 🎯 Filtrování

---

### 🎬 Cinema Player

Vlastní přehrávací rozhraní navržené pro desktopové sledování.

* Cinematic UI
* Fullscreen režim
* Vlastní ovládací prvky
* Podpora externích přehrávacích zdrojů
* Přizpůsobení desktopovému prostředí

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

---

### 🖼️ TMDB Image Proxy

MůjFlix používá Cloudflare Function jako proxy pro TMDB obrázky:

```text
/functions/api/tmdb-img/[[catchall]].js
```

Proxy pomáhá s:

* načítáním posterů
* načítáním backdropů
* cachováním
* komunikací mezi frontendem a externími zdroji

---

## 🏗️ Technologie

MůjFlix je záměrně vytvořen bez velkého frontend frameworku.

| Technologie          | Použití                    |
| -------------------- | -------------------------- |
| HTML5                | Struktura aplikace         |
| CSS3                 | Design, animace a layout   |
| Vanilla JavaScript   | Aplikační logika           |
| TMDB API             | Filmová databáze           |
| Cloudflare Pages     | Hosting                    |
| Cloudflare Functions | Serverless funkce          |
| Wrangler             | Lokální vývoj a deployment |

### Frontend

```text
HTML5
CSS3
Vanilla JavaScript ES6+
```

Projekt nepoužívá React, Vue ani podobný frontend framework.

---

## 📁 Struktura projektu

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
Hlavní aplikační logika a práce se stavem aplikace.

**`mujflix-cinema-player.js`**  
Cinema Player a jeho UI.

**`mujflix-discover-redesign.js`**  
Discover rozhraní a vyhledávání.

**`legal-streaming-providers.js`**  
Informace o dostupných legálních poskytovatelích.

**`mujflix-dock-fix.js`**  
Opravy a animace floating navigation docku.

**`notifications-changelog.js`**  
Systém interních notifikací a informací o novinkách.

**`functions/api/tmdb-img/[[catchall]].js`**  
Cloudflare serverless proxy pro TMDB obrázky.

---

## 🚀 Deployment

MůjFlix je připravený pro **Cloudflare Pages**.

### Manuální deployment

```bash
npx wrangler pages deploy . --project-name=mujflix
```

### GitHub → Cloudflare

Po propojení GitHub repozitáře s Cloudflare Pages lze nastavit automatický deployment.

```text
git push
   ↓
GitHub
   ↓
Cloudflare Pages
   ↓
Nová verze MůjFlixu
```

---

## 🔐 API klíče

Citlivé údaje **nikdy nevkládej přímo do zdrojového kódu**.

Používej Cloudflare Environment Variables nebo lokální:

```text
.dev.vars
```

Lokální `.dev.vars` by měl být uvedený v `.gitignore`.

Serverless Functions mohou k environment variables přistupovat například přes:

```javascript
context.env
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

## 🤖 Vibe Coded

MůjFlix je **vibe-coded projekt**.

Celý projekt vznikal ve spolupráci s AI nástroji — od návrhu UI a psaní kódu až po debugging, refactoring a experimentování s novými funkcemi.

### Použité AI nástroje

* 🤖 **Claude**
* 🐙 **GitHub Copilot**
* 💬 **ChatGPT**
* 🧠 **DeepSeek**
* 🌐 **Kimi**

AI byla součástí prakticky celého vývojového procesu.

> **Built by a human, coded with AI.**

---

## 🖥️ Aktuální stav

### Desktop

**PC / Notebook**

🟢 Aktivně vyvíjeno

### Mobil

**Telefon / Tablet**

🟡 Ve vývoji

Mobilní rozhraní zatím není považováno za kompletně dokončené.

---

## 👤 Autor

**jablkooo**

GitHub:

https://github.com/jablkooo/mujflix

---

<div align="center">

## 🎬 MůjFlix

**Discover. Explore. Watch.**

*Built by a human, coded with AI.*

</div>
