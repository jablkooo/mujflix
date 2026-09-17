# 🎬 MůjFlix

**MůjFlix** je moderní webová aplikace pro objevování, vyhledávání a organizaci filmů a seriálů.

Projekt kombinuje **prémiový dark-mode design, cinematic UI a jemný glassmorphism** s rychlým frontendem postaveným na Vanilla JavaScriptu a serverless infrastruktuře Cloudflare.

> 🖥️ **Aktuálně optimalizováno pro PC a notebooky.**
> 📱 Mobilní verze je stále ve vývoji.

---

## ✨ Funkce

### 🔎 Discover & Search

* Vyhledávání filmů, seriálů a herců přes TMDB
* Populární a doporučený obsah
* Žánry a filtrování
* Detailní informace o titulech

### 🎬 Cinema Player

* Vlastní přehrávací rozhraní
* Cinematic fullscreen UI
* Podpora externích přehrávacích zdrojů
* Ovládání přizpůsobené desktopovému použití

### 🎨 Moderní UI

* Dark / Midnight design
* Glassmorphism
* Velké filmové postery
* Jemné gradienty a ambientní efekty
* Zaoblené komponenty
* Floating navigation dock
* Blue / Purple accent barvy

### 📺 Legální poskytovatelé

Modul `legal-streaming-providers.js` zobrazuje dostupné oficiální streamovací služby pro jednotlivé tituly.

---

## 🏗️ Technologie

* **HTML5**
* **CSS3**
* **Vanilla JavaScript (ES6+)**
* **TMDB API**
* **Cloudflare Pages**
* **Cloudflare Pages Functions**
* **Wrangler**

Projekt nepoužívá React, Vue ani jiné těžké frontend frameworky.

---

## 📁 Struktura

```text
mujflix/
├── functions/
│   └── api/
│       └── tmdb-img/
│           └── [[catchall]].js
│
├── app.js
├── index.html
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
└── wrangler.toml
```

---

## ⚡ Lokální vývoj

### Požadavky

* Node.js 18+
* npm nebo pnpm
* Git

### Instalace

```bash
git clone https://github.com/jablkooo/mujflix.git
cd mujflix
```

### Spuštění

```bash
npx wrangler pages dev .
```

Aplikace bude dostupná na:

```text
http://localhost:8788
```

---

## 🚀 Deployment

MůjFlix je připravený pro **Cloudflare Pages**.

Manuální deployment:

```bash
npx wrangler pages deploy . --project-name=mujflix
```

Při propojení s GitHubem lze nastavit automatický deployment při pushnutí do `main`.

---

## 🔐 API klíče

Citlivé údaje nikdy nevkládej přímo do zdrojového kódu.

Používej Cloudflare Environment Variables nebo lokální:

```text
.dev.vars
```

který musí být v `.gitignore`.

Serverless Functions mohou k proměnným přistupovat přes:

```javascript
context.env
```

---

## 🖥️ Platforma

**Aktuální zaměření:**

```text
🖥️ Desktop PC
💻 Notebook
```

Mobilní rozhraní je **ve vývoji** a zatím není považováno za plně dokončenou součást projektu.

---

## 🤖 Vývoj

MůjFlix vzniká za použití klasických vývojářských nástrojů a AI asistentů pro návrh, programování, debugging a optimalizaci.

**Developer:** [jablkooo](https://github.com/jablkooo)

---

<div align="center">

### 🎬 MůjFlix

**Discover. Explore. Watch.**

</div>
