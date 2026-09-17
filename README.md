<div align="center">

# 🎬 MůjFlix

**Osobní streamovací hub ve stylu Netflixu — jedno místo pro filmy, seriály a objevování. 100% zdarma.**

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=16&pause=1000&color=FFFFFF&center=true&vCenter=true&width=600&lines=Watch+movies+%26+series+for+free;Cinematic+dark+UI;Glassmorphism;Vanilla+JavaScript;No+install+%E2%80%94+runs+in+browser" />

<br>

<img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/>
<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/>
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
<img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white"/>
<img src="https://img.shields.io/badge/TMDB-01B4E4?style=for-the-badge&logo=themoviedatabase&logoColor=white"/>

<br>

<img src="https://img.shields.io/badge/status-active-brightgreen?style=flat-square"/>
<img src="https://img.shields.io/badge/price-100%25_FREE-8b0000?style=flat-square"/>
<img src="https://img.shields.io/badge/license-personal-lightgrey?style=flat-square"/>
<img src="https://img.shields.io/badge/PRs-welcome-orange?style=flat-square"/>

</div>

---

## 📖 O projektu

MůjFlix je **osobní streamovací hub** ve stylu Netflixu — jedno místo, kde si spravuješ, co sleduješ, objevuješ nové filmy a seriály, a **rovnou je i pustíš úplně zdarma**.

> 💰 **Zdarma, bez předplatného, bez reklam.** Žádné měsíční poplatky, žádný premium tarif, žádné skryté poplatky. Prostě otevřeš appku a koukáš.
>
> 💡 **Žádná instalace, žádný build.** Čistě statická webová appka (HTML/CSS/JS), běží přímo v prohlížeči.
>
> 🐛 **Pozor — ještě to má mouchy!** Není to 100% doladěné. Občas něco blbne, něco se nenačte, něco se rozbije. Ale s bráchou na tom makáme a postupně **všechno doladíme**. Ber to tak, že je to **živý projekt ve vývoji** — ne hotový produkt. 👍

---

## ⚠️ Status projektu

Tenhle projekt **NENÍ finální verze**. Je to **work-in-progress**, který pořád roste a mění se.

- 🐛 **Bugy a mouchy** — občas se něco rozbije, občas něco nefunguje jak má
- 🚧 **Nedotažené detaily** — UI, UX a funkce se ještě ladí
- 🔧 **Postupný vývoj** — s bráchou to pomalu ale jistě vylepšujeme
- 💬 **Zpětná vazba vítána** — když najdeš bug, klidně napiš

**Slibujeme:** budeme se snažit to co nejvíc doladit, aby to fungovalo tak, jak má. 🫡

---

## ✨ Funkce

<table>
<tr>
<td width="50%" valign="top">

### 🏠 Domovská obrazovka
- Přehled seriálů s **progress barem**
- Odznak **„pokračovat"** ukazuje, kde jsi skončil
- Dlaždice se automaticky přeskládají podle aktivity

### 🧭 Objevování
- Procházení podle **žánru, popularity, hodnocení** (TMDB)
- Filtrování podle **víc žánrů najednou**
- Fulltextové vyhledávání

### 🎥 Cinema mód
- Přehrávání přes víc externích zdrojů
- Automatický fallback při selhání zdroje
- U seriálů: **Další / Předchozí epizoda**, výběr epizody, skok na další seriál
- **„Přidat do seznamu"** přímo z přehrávače

</td>
<td width="50%" valign="top">

### 📋 Můj seznam
- Ulož si, co chceš zhlédnout později
- Vše na jednom místě, synchronizováno

### 👤 Profily
- **Víc profilů** na jednom zařízení (jako Netflix)
- Volitelné **zamčení PIN kódem**

### 🔄 Cross-device sync
- Rozkoukanost a seznam mezi zařízeními
- 🟢 Zelená tečka = synchronizováno

### 🤖 AI asistent
- Doporučení podle nálady nebo žánru
- Zná tvoji historii sledování

</td>
</tr>
</table>

---

## 💰 Proč MůjFlix?

| | **MůjFlix** | Netflix | HBO Max | Disney+ |
|---|:---:|:---:|:---:|:---:|
| **Cena** | 🟢 **Zdarma** | ~250 Kč/měs | ~200 Kč/měs | ~200 Kč/měs |
| **Reklamy** | ❌ Ne | ⚠️ V Basic | ⚠️ V Basic | ⚠️ V Basic |
| **Vlastní zdroje** | ✅ Ano | ❌ Ne | ❌ Ne | ❌ Ne |
| **Bez instalace** | ✅ PWA | ❌ App | ❌ App | ❌ App |
| **Vlastní profily** | ✅ Neomezeně | ⚠️ Limit | ⚠️ Limit | ⚠️ Limit |
| **Mouchy a bugy** | 🐛 Občas 😅 | 🟢 Ne | 🟢 Ne | 🟢 Ne |

**Prostě koukáš — zadarmo, bez omezení.**

---

## 🚀 Spuštění

MůjFlix je **čistě statická webová appka** — žádný build krok, žádné závislosti.

### 🌐 Nasazená verze

Nejjednodušší způsob — otevřít nasazenou verzi v prohlížeči. Pokud je projekt napojený na **Cloudflare Pages**, běží na tvé `.pages.dev` doméně nebo vlastní doméně.

### 💻 Lokální spuštění

```bash
git clone https://github.com/jablkooo/mujflix.git
cd mujflix
python3 -m http.server 8000
```

Pak otevři 👉 **http://localhost:8000**

### ✅ Podporované prohlížeče

| Prohlížeč | Desktop | Mobil |
|-----------|:-------:|:-----:|
| Chrome    |    ✅   |   ✅  |
| Safari    |    ✅   |   ✅  |
| Firefox   |    ✅   |   ✅  |
| Edge      |    ✅   |   ✅  |

> 📱 Appku jde přes **„Přidat na plochu"** nainstalovat jako **PWA** — ikonka jako klasická appka, spouští se na plné obrazovce.

---

## 📸 Screenshoty

<div align="center">

> 🖼️ *Sem přidej screenshoty — ideálně 2–3 obrázky (Home, Cinema mód, AI asistent).*
>
> ```
> ![Home](./screenshots/home.png)
> ![Cinema](./screenshots/cinema.png)
> ![AI](./screenshots/ai.png)
> ```

</div>

---

## 🛠️ Tech Stack

<div align="center">

| Vrstva | Technologie |
|--------|-------------|
| **Frontend** | HTML5, CSS3 (Glassmorphism, Dark UI), Vanilla JavaScript |
| **Data** | TMDB API (filmy, seriály, žánry) |
| **Streaming** | Externí zdroje (Bombuj, Prehrajto.cz, Uzi.la, SvetSerialu) |
| **AI** | AI asistent pro doporučení |
| **Deploy** | Cloudflare Pages |
| **PWA** | Service Worker + Manifest |

</div>

---

## 🗺️ Roadmap

- [x] Domovská obrazovka s progress barem
- [x] Objevování podle žánrů (TMDB)
- [x] Cinema mód s víc zdroji
- [x] Profily + PIN
- [x] Cross-device sync
- [x] AI asistent
- [ ] Vyladit bugy a mouchy 🐛
- [ ] Offline režim (service worker cache)
- [ ] Sdílení seznamu s přáteli
- [ ] Statistiky sledování (kolik hodin, top žánry)
- [ ] Tmavý/světlý režim přepínač
- [ ] Vlastní zdroje pro přehrávání

---

## ⚠️ Upozornění

> **MůjFlix je osobní / vzdělávací projekt** pro organizaci vlastní sledovanosti.
>
> Odkazy na externí streamovací weby jsou jen **zprostředkované** — MůjFlix sám **žádný obsah nehostuje ani nedistribuuje**.
>
> Dostupnost a legálnost obsahu na jednotlivých zdrojích si **řiď podle pravidel platných ve své zemi**.

---

## 🤝 Přispívání

Projekt je primárně osobní, ale **PR a nápady jsou vítány**. Pokud chceš přispět:

1. Forkni repo
2. Vytvoř branch (`git checkout -b feature/napad`)
3. Commitni změny (`git commit -m 'Add: skvělá funkce'`)
4. Pushni (`git push origin feature/napad`)
5. Otevři **Pull Request**

---

## 👥 Kdo za tím stojí

<div align="center">

<table>
<tr>
<td align="center" width="33%">
<a href="https://github.com/jablkooo">
<img src="https://github.com/jablkooo.png" width="100" alt="jablkooo"/><br>
<sub><b>jablkooo</b></sub>
</a><br>
👨‍💻 <b>Owner & Developer</b><br>
<sub>Hlavní nápad, vývoj, design</sub>
</td>
<td align="center" width="33%">
<a href="https://github.com/jirulaso43">
<img src="https://github.com/jirulaso43.png" width="100" alt="jirulaso43"/><br>
<sub><b>jirulaso43</b></sub>
</a><br>
🤝 <b>Co-owner & Developer</b><br>
<sub>Spolupráce, testování, feedback</sub>
</td>
<td align="center" width="33%">
<img src="https://cdn.simpleicons.org/openai/ffffff" width="100" alt="AI"/><br>
<sub><b>AI asistenti</b></sub><br>
🤖 <b>Vývojoví parťáci</b><br>
<sub>Kód, nápady, debugging</sub>
</td>
</tr>
</table>

<br>

**Vytvořeno s ❤️ námi dvěma a spoustou AI.** 🤖✨

Bez AI by to nebylo tam, kde to je. Díky, ChatGPT, Claude a spol.!

</div>

---

## 🛠️ Pro vývojáře

Architektura, souborová struktura a poznámky k údržbě jsou v **[`DEVELOPMENT.md`](./DEVELOPMENT.md)**.

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0d0d0d,100:330000&height=100&section=footer&animation=fadeIn"/>

**🎬 MůjFlix** — *your movies, your rules. For free.*

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=13&pause=2000&color=FFFFFF&center=true&vCenter=true&width=400&lines=Still+in+work...;Buggy+but+getting+better.;Made+by+us+%2B+a+lot+of+AI.;%24+exit" />

</div>
