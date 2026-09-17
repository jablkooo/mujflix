# 🎬 MůjFlix

**MůjFlix** je moderní, lehká a vysoce responzivní webová aplikace určená k objevování, vyhledávání a organizaci filmového a seriálového obsahu. Projekt kombinuje estetiku prémiových streamovacích platforem (např. Apple TV+, Netflix) s rychlostí statického frontendu a silou bezserverové (serverless) architektury na platformě Cloudflare.

---

## 📋 Obsah
- [Hlavní klíčové funkce](#-hlavní-klíčové-funkce)
- [Architektura a použité technologie](#-architektura-a-použité-technologie)
- [Struktura souborů v projektu](#-struktura-souborů-v-projektu)
- [Příprava prostředí a lokální vývoj](#-příprava-prostředí-a-lokální-vývoj)
- [CI/CD a automatické nasazení (Cloudflare Pages)](#-cicd-a-automatická-nasazení-cloudflare-pages)
- [Bezpečnostní zásady a správa API klíčů](#-bezpečnostní-zásady-a-správa-api-klíčů)
- [Prispůsobení vzhledu a témat](#-přizpůsobení-vzhledu-a-témat)
- [Přispívání do projektu & Poděkování](#-přispívání-do-projektu--poděkování)

---

## 🚀 Hlavní klíčové funkce

### 1. Objevování a vyhledávání obsahu (Discover Redesign)
- **Integrovaná databáze TMDB:** Vyhledávání filmů, seriálů, herců, žánrových výběrů a novinek v reálném čase.
- **Kategorizace a doporučení:** Dynamické rozhraní nabízející filtrování podle žánrů, hodnocení a popularity.

### 2. Vlastní Kino Přehrávač (Cinema Player)
- Modulární rozhraní přehrávače uzpůsobené pro nerušené sledování.
- Podpora pro externí přehrávací zdroje a kontextové propojení s dostupnými streamy.

### 3. Serverless Image Proxy (`/functions/api/tmdb-img/`)
- Cloudflare Pages Function funguje jako proxy vrstva pro obrázky z TMDB.
- Zabezpečuje správné kešování, rychlejší načítání plákátů/postorů a obcházení případných CORS omezení nebo výpadků.

### 4. PWA & Mobilní optimalizace
- Podpora **Progressive Web App (PWA)** – možnost instalace aplikace na plochu mobilu i PC.
- Plovoucí spodní navigace (Dock) s plynulými CSS animacemi.

### 5. Legální poskytovatelé streamu
- Modul `legal-streaming-providers.js` zobrazuje přehled oficiálních služeb (Netflix, HBO Max, Disney+, Apple TV+ apod.), kde je daný titul dostupný k pronájmu či ke sledování.

---

## 🏗️ Architektura a použité technologie

Projekt je navržen s důrazem na **minimální režii** a **extrémní rychlost načtení**:

- **Frontend:** Pure Vanilla JavaScript (ES6+ modularizace), HTML5 a CSS3 bez těžkopádných frameworků (React/Vue).
- **Styling:** CSS proměnné, Flexbox, CSS Grid a pokročilé efekty (Glassmorphism, backdrop-filter).
- **Backend / Edge Computations:** Cloudflare Pages Functions (v adresáři `/functions`).
- **Infrastruktura / Hosting:** Cloudflare Pages s konfigurací přes `wrangler.toml`.

---

## 📁 Struktura souborů v projektu

```text
mujflix/
├── functions/
│   └── api/
│       └── tmdb-img/
│           └── [[catchall]].js    # Serverless proxy pro dynamické načítání obrázků z TMDB
├── app.js                         # Hlavní aplikační logika, obsluha stavu a událostí
├── index.html                     # Vstupní bod webové aplikace
├── legal-streaming-providers.js   # Modul pro ověřování legálních streamovacích platforem
├── mujflix-cinema-player.js       # Logika a UI vlastní komponenty přehrávače
├── mujflix-discover-redesign.js   # Komponenta pro předělané rozhraní vyhledávání a sekce Objevit
├── mujflix-dock-fix.js            # Skript pro korekci a animace spodního navigačního doku
├── mujflix-fixes.css              # Dodatečné opravy zobrazení a mobilního layoutu
├── notifications-changelog.js     # Systém interních notifikací a informací o novinkách v aplikaci
├── styles.css                     # Základní globální styly
├── styles-apple-tv.css            # Vzhled inspirovaný Apple TV UI
├── styles-glass.css               # Téma využívající efekt skla (Glassmorphism)
├── styles-premium.css             # Tmavé prémiové téma
└── wrangler.toml                  # Konfigurační soubor pro Cloudflare Pages / Workers

⚙️ Příprava prostředí a lokální vývoj

Pro lokální vývoj je doporučeno použít oficiální CLI nástroj Wrangler od Cloudflare.
Požadavky

    Node.js (verze 18.x nebo novější)

    npm nebo pnpm

Krok za krokem

    Klonování repozitáře:
    Bash

    git clone [https://github.com/jablkooo/mujflix.git](https://github.com/jablkooo/mujflix.git)
    cd mujflix

    Spuštění lokálního vývojového serveru:
    Použijte Wrangler pro simulaci prostředí Cloudflare Pages včetně Serverless Functions:
    Bash

    npx wrangler pages dev .

    Aplikace bude dostupná na adrese http://localhost:8788.

🚀 CI/CD a automatická nasazení (Cloudflare Pages)

Projekt využívá automatickou integraci přes GitHub a Cloudflare Pages:

    Každý Push do větvě main automaticky spustí sestavení a nasazení nové verze.

    Při vytvoření Pull Requestu vytvoří Cloudflare Pages unikátní náhledovou URL (Preview Deployment) pro testování změn.

Ruční nasazení přes CLI:
Bash

npx wrangler pages deploy . --project-name=mujflix

🔒 Bezpečnostní zásady a správa API klíčů

Důležité bezpečnostní pokyny pro vývojáře přispívající do repozitáře:

    Nikdy nevkládejte soukromé API klíče přímo do zdrojového kódu (Hardcoding):

        Všechny citlivé klíče (TMDB API Key, Jina API klíče, Cloudflare Tokens atd.) musí být uloženy v Environment Variables v prostředí Cloudflare Pages Dashboardu nebo v lokálním souboru .dev.vars (který je ignorován v .gitignore).

    Proxy přes Cloudflare Functions:

        Volání externích API provádějte skrze Cloudflare Functions v adresáři /functions/, kde můžete k prostředí a klíčům přistupovat bezpečně na straně serveru (context.env).

🎨 Přizpůsobení vzhledu a témat

Aplikace podporuje několik CSS vrstev, které lze modifikovat nebo přepínat:

    styles-glass.css: Pro průhledné prvky s rozostřeným pozadím (backdrop-filter).

    styles-apple-tv.css: Pro velké bannery, kartové rozvržení a čistou typografii.

    styles-premium.css: Pro kontrastní tmavé téma šetřící zrak.

🤝 Přispívání do projektu & Poděkování

Vývoj probíhá za spolupráce vývojářů i AI asistentů:

    Vývoj: jablkooo

    AI Asistenti: Claude (Anthropic) a další vývojové nástroje.

Chcete-li přispět:

    Vytvořte Fork repozitáře.

    Vytvořte vlastní větev pro úpravy (git checkout -b feature/nova-funkce).

    Proveďte commit a pošlete Pull Request.
