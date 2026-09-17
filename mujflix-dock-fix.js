/* ══════════════════════════════════════════════════════════════
 * MůjFlix — Dock active-state fix
 *
 * Problém: v aplikaci existuje víc míst, která na klik na dolní
 * lištu reagují (inline onclick, delegovaný capture listener,
 * delegovaný data-hash listener, hashchange routing) a některé
 * z nich zapomínají zavolat setDockActive() nebo ho volají se
 * špatným ID. Výsledek: "Objevovat" se zvýrazní, ale "Domů" už ne.
 *
 * Řešení: přepíšeme window.setDockActive na jednu spolehlivou
 * implementaci a navíc po každém kliku / změně hashe / návratu
 * (back/forward) ještě jednou (s malým zpožděním, ať vyhraje nad
 * všemi staršími setTimeout(...,50) apod.) vynutíme správný stav
 * podle toho, na co uživatel reálně klikl nebo jaký je aktuální hash.
 * ══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  function applyActiveDock(id) {
    if (!id) return;
    document.querySelectorAll("#mfDock .dock-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.id === id);
    });
    window._mfActiveDockId = id;
  }

  // Přepiš globální setDockActive — všechna stará volání v app.js
  // (setDockActive("dockHome") atd.) automaticky použijí tuhle verzi,
  // protože jde o stejné globální jméno.
  window.setDockActive = function (id) {
    applyActiveDock(id);
  };

  function idForHash(hash) {
    var h = (hash || "").toLowerCase();
    if (h.indexOf("#filmy") === 0) return "dockFilmy";
    if (h.indexOf("#protebe") === 0 || h.indexOf("#watchlist") === 0) return "dockProtebe";
    if (h.indexOf("#profil") === 0) return "dockProfile";
    return "dockHome";
  }

  // Finální slovo po každém kliknutí na tlačítko v docku —
  // spustí se PO všech starších (rychlejších) handlerech.
  document.addEventListener(
    "click",
    function (e) {
      var btn = e.target && e.target.closest && e.target.closest("#mfDock .dock-btn");
      if (!btn || !btn.id) return;
      var clickedId = btn.id;
      setTimeout(function () {
        applyActiveDock(clickedId);
      }, 90);
    },
    false
  );

  // Synchronizace i při změně hashe (zpět/vpřed v prohlížeči, programové přesměrování).
  window.addEventListener("hashchange", function () {
    setTimeout(function () {
      applyActiveDock(idForHash(location.hash));
    }, 90);
  });

  // Počáteční stav po načtení stránky.
  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
      applyActiveDock(idForHash(location.hash || "#serialy"));
    }, 950);
  });

  console.info("[MůjFlix] ✓ Dock active-state fix načten");
})();
