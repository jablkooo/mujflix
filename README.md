<div align="center">

# 🎬 MůjFlix

**Osobní streamovací hub ve stylu Netflixu — jedno místo pro filmy, seriály a objevování.**

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=16&pause=1000&color=FFFFFF&center=true&vCenter=true&width=600&lines=Modern+movie+%26+series+discovery;Cinematic+dark+UI;Glassmorphism;Vanilla+JavaScript;No+install+%E2%80%94+runs+in+browser" />

<br>

<img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/>
<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/>
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
<img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white"/>
<img src="https://img.shields.io/badge/TMDB-01B4E4?style=for-the-badge&logo=themoviedatabase&logoColor=white"/>

<br>

<img src="https://img.shields.io/badge/status-active-brightgreen?style=flat-square"/>
<img src="https://img.shields.io/badge/version-1.0-blue?style=flat-square"/>
<img src="https://img.shields.io/badge/license-personal-lightgrey?style=flat-square"/>
<img src="https://img.shields.io/badge/PRs-welcome-orange?style=flat-square"/>

</div>

---

## 📖 O projektu

MůjFlix je **osobní streamovací hub** ve stylu Netflixu — jedno místo, kde si spravuješ, co sleduješ, objevuješ nové filmy a seriály, a rovnou je i pustíš přes externí zdroje.

> 💡 **Žádná instalace, žádný build.** Čistě statická webová appka (HTML/CSS/JS), běží přímo v prohlížeči.

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

## 🚀 Spuštění

MůjFlix je **čistě statická webová appka** — žádný build krok, žádné závislosti.

### 🌐 Nasazená verze

Nejjednodušší způsob — otevřít nasazenou verzi v prohlížeči. Pokud je projekt napojený na **Cloudflare Pages**, běží na tvé `.pages.dev` doméně nebo vlastní doméně.

### 💻 Lokální spuštění

```bash
git clone https://github.com/jablkooo/mujflix.git
cd mujflix
python3 -m http.server 8000
