# 🎬 MůjFlix

**MůjFlix** je moderní webová aplikace pro objevování, vyhledávání a organizaci filmů a seriálů.

Projekt kombinuje **prémiový dark-mode design, cinematic UI a jemný glassmorphism** s rychlým frontendem postaveným na Vanilla JavaScriptu a serverless infrastruktuře Cloudflare.

> 🖥️ Aktuálně optimalizováno pro **PC a notebooky**.
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
* Desktopové ovládání

### 🎨 Moderní UI

* Dark / Midnight design
* Glassmorphism
* Velké filmové postery
* Gradienty a ambientní efekty
* Zaoblené komponenty
* Floating navigation dock
* Blue / Purple accent barvy

### 📺 Legální poskytovatelé

`legal-streaming-providers.js` zobrazuje dostupné oficiální streamovací služby pro jednotlivé tituly.

---

## 🏗️ Technologie

* **HTML5**
* **CSS3**
* **Vanilla JavaScript (ES6+)**
* **TMDB API**
* **Cloudflare Pages**
* **Cloudflare Pages Functions**
* **Wrangler**

Bez Reactu, Vue nebo jiného velkého frontend frameworku.

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

### Spuštění

```bash
git clone https://github.com/jablkooo/mujflix.git
cd mujflix
npx wrangler pages dev .
```

Aplikace bude dostupná na:

```text
http://localhost:8788
```

---

## 🚀 Deployment

MůjFlix je připravený pro **Cloudflare Pages**.

```bash
npx wrangler pages deploy . --project-name=mujflix
```

Při propojení s GitHubem lze nastavit automatický deployment při pushnutí do `main`.

---

## 🔐 API klíče

Citlivé údaje nejsou ukládány přímo do zdrojového kódu.

Používají se **Environment Variables** v Cloudflare nebo lokální:

```text
.dev.vars
```

Serverless Functions k nim přistupují přes:

```javascript
context.env
```

---

## 🖥️ Aktuální platforma

MůjFlix je momentálně zaměřený na:

* 🖥️ Desktop PC
* 💻 Notebooky

Mobilní rozhraní je **ve vývoji** a zatím není považováno za dokončené.

---

## 🤖 Vibe Coded

MůjFlix je **vibe-coded projekt**.

Velká část vývoje vznikla ve spolupráci s AI nástroji — od návrhu UI a architektury přes psaní a úpravu kódu až po debugging a experimentování s novými funkcemi.

Používané nástroje:

* **Claude**
* **GitHub Copilot**
* **ChatGPT**
* **DeepSeek**
* **Kimi**

AI není pouze použita pro jednotlivé úryvky kódu — byla součástí celého vývojového procesu.

> **Built by a human, coded with AI.**

---

## 👤 Autor

**jablkooo**

GitHub:
https://github.com/jablkooo

---

<div align="center">

### 🎬 MůjFlix

**Discover. Explore. Watch.**

*Built by a human, coded with AI.*

</div>
