/**
 * MujFlix Discover — enhancer v5 (lean)
 * ════════════════════════════════════════════════════════════════
 * Co dělá: doplňuje ikony do žánrové navigace, hvězdičkové hodnocení
 * a expand panel na kartách v sekci Objevování.
 *
 * Proč přepsáno (v4 → v5):
 *  - v4 každých 900/1800/3600 ms znovu vkládala celý <style> tag
 *    (`injectOverrideTag`), i když se obsah nezměnil → zbytečné
 *    přepočítávání stylů na celé stránce = jeden z hlavních důvodů
 *    "lagování" Objevování.
 *  - v4 měla `* { font-family: ... !important }` BEZ omezení na
 *    .universe-overlay → po prvním otevření Objevování to natrvalo
 *    přebilo písmo v CELÉ aplikaci (proto vypadalo "jinak" i mimo
 *    Objevování). V5 tohle nedělá vůbec — vzhled karet/navigace už
 *    kompletně řeší styles-discover-redesign.css.
 *  - v4 běžela až 5 nezávislých MutationObserverů + setInterval
 *    poll (100× po 120 ms) + poll (150 ms) jen proto, aby počkala,
 *    až se objeví #discoBody — ten je ale v HTML staticky přítomný
 *    od začátku, takže čekání není potřeba.
 *  - v4 měla MutationObserver na KAŽDÉ jednotlivé kartě (sledoval
 *    styl), aby vynutil viditelnost popisku — to už dělá čistě CSS.
 *
 * Vizuální výstup zůstává stejný, jen se k němu dochází levněji.
 */
(function () {
  'use strict';
  if (window._mfDiscoverEnhancer) return;
  window._mfDiscoverEnhancer = true;

  /* ── SVG ikony pro žánrovou navigaci ── */
  var NAV_ICONS = {
    trending: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="M2 14l4-4 3 3 4-5 3 3"/><path d="M14 6h4v4"/></svg>',
    film:     '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><rect x="2" y="4" width="16" height="13" rx="2"/><path d="M2 8h16M7 4v4M13 4v4"/></svg>',
    serial:   '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><rect x="1" y="3" width="18" height="13" rx="2"/><path d="M6 17l2-1h4l2 1"/></svg>',
    komedi:   '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><circle cx="10" cy="9" r="7"/><path d="M7 11c.8 1.5 5.2 1.5 6 0"/><circle cx="8" cy="8" r="0.8" fill="currentColor"/><circle cx="12" cy="8" r="0.8" fill="currentColor"/></svg>',
    drama:    '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><path d="M4 14c1-3 4-5 6-3s5 0 6-3"/><path d="M3 7c1 3 4 5 6 3s5 0 6 3"/></svg>',
    sci:      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><ellipse cx="10" cy="10" rx="4" ry="4"/><ellipse cx="10" cy="10" rx="9" ry="4"/></svg>',
    krim:     '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><circle cx="9" cy="9" r="6"/><path d="M13.5 13.5L18 18"/></svg>',
    horor:    '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><path d="M10 2L3 18h14L10 2z"/><path d="M10 8v5"/></svg>',
    anim:     '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><circle cx="10" cy="10" r="7"/><circle cx="7.5" cy="10" r="1.2" fill="currentColor"/><circle cx="12.5" cy="10" r="1.2" fill="currentColor"/><path d="M7 13c1 1.5 5 1.5 6 0"/></svg>',
    mysteri:  '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><circle cx="10" cy="10" r="8"/><path d="M10 6c-1.6 0-3 1-3 2.5S8.5 11 10 11"/><circle cx="10" cy="14" r="0.9" fill="currentColor"/></svg>',
    akce:     '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><path d="M12 2L4 12h6l-2 6 8-10h-6z"/></svg>',
    realit:   '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><circle cx="10" cy="10" r="3.5"/><circle cx="10" cy="10" r="7" stroke-dasharray="2 3"/></svg>',
    dokum:    '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><rect x="4" y="2" width="12" height="16" rx="1.5"/><path d="M7 7h6M7 10h6M7 13h4"/></svg>',
    romant:   '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><path d="M10 17S3 12 3 7a4 4 0 017-2.6A4 4 0 0117 7c0 5-7 10-7 10z"/></svg>',
    thriller: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><path d="M12 2L4 12h6l-2 6 8-10h-6z"/></svg>',
    fantas:   '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><path d="M10 2l2 6h6l-5 3.5 2 6L10 14l-5 3.5 2-6L2 8h6z"/></svg>'
  };

  function getNavIcon(label) {
    var norm = label.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
    for (var key in NAV_ICONS) {
      if (norm.indexOf(key) === 0 || key.indexOf(norm.slice(0, 5)) === 0) {
        return NAV_ICONS[key];
      }
    }
    return null;
  }

  function upgradeNavIcons() {
    var nav = document.getElementById('discoNav');
    if (!nav) return;
    nav.querySelectorAll('.disco-nav-item').forEach(function (item) {
      if (item._drDone) return;
      item._drDone = true;
      var raw = item.textContent.trim();
      var ico = getNavIcon(raw);
      if (!ico) return;
      var clean = raw.replace(/^[^\w\u00C0-\u024F]+/, '').trim();
      item.innerHTML = ico + '<span style="margin-left:4px">' + clean + '</span>';
    });
  }

  function compactGenreFilters() {
    var nav = document.getElementById('discoNav');
    if (!nav || nav._mfGenreCompact) return;
    var labels = Array.prototype.slice.call(nav.querySelectorAll('.disco-nav-label'));
    var genreLabel = labels.find(function (label) {
      return label.textContent.trim().toLowerCase() === 'žánr';
    });
    if (!genreLabel) return;
    var genreItems = [];
    var node = genreLabel.nextElementSibling;
    while (node && !node.classList.contains('disco-nav-divider') && !node.classList.contains('disco-nav-label')) {
      if (node.classList.contains('disco-nav-item')) genreItems.push(node);
      node = node.nextElementSibling;
    }
    if (genreItems.length <= 3) return;
    nav._mfGenreCompact = true;
    genreItems.slice(3).forEach(function (item) { item.classList.add('mf-genre-hidden'); });
    var more = document.createElement('button');
    more.type = 'button';
    more.className = 'disco-nav-more';
    more.textContent = 'Více';
    more.setAttribute('aria-expanded', 'false');
    more.addEventListener('click', function () {
      var expanded = nav.classList.toggle('mf-genres-expanded');
      more.textContent = expanded ? 'Méně' : 'Více';
      more.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      genreItems.slice(3).forEach(function (item) {
        item.classList.toggle('mf-genre-hidden', !expanded);
      });
    });
    genreLabel.parentNode.insertBefore(more, genreItems[3]);
  }

  function upgradeHeroBtns() {
    var PLAY = '<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><polygon points="3,2 14,8 3,14"/></svg>';
    var PLUS = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="13" height="13"><path d="M8 3v10M3 8h10"/></svg>';
    document.querySelectorAll('.disco-hero-btn').forEach(function (btn) {
      if (btn._drDone) return;
      btn._drDone = true;
      var t = btn.textContent.trim();
      var n = t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      var isPlay = n.indexOf('prehrat') !== -1 || n.indexOf('spustit') !== -1 || n.indexOf('play') !== -1;
      btn.innerHTML = (isPlay ? PLAY : PLUS) + '<span style="margin-left:7px">' + t + '</span>';
    });
  }

  var STAR = '<svg viewBox="0 0 12 12" fill="#f0c94a" width="9" height="9"><polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9.2,11 6,9.2 2.8,11 3.5,7.5 1,5 4.5,4.5"/></svg>';
  var PLAY_SM = '<svg viewBox="0 0 14 14" fill="currentColor" width="11" height="11"><polygon points="3,2 12,7 3,12"/></svg>';
  var PLUS_SM = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="11" height="11"><path d="M7 3v8M3 7h8"/></svg>';
  var FILM_ICO = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" width="9" height="9"><rect x=".5" y="2" width="11" height="8" rx="1.2"/><path d=".5 5h11M4 2v3M8 2v3"/></svg>';
  var TV_ICO   = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" width="9" height="9"><rect x=".5" y="1.5" width="11" height="8" rx="1.2"/><path d="M4 10.5l1.5-1.5h1L8 10.5"/></svg>';

  /* Vizuál karet (rozměry, barvy, hover) žije v styles-discover-redesign.css.
     Tady se jen jednorázově doplní ikony/badge, které vyžadují text/DOM logiku. */
  function upgradeCards() {
    document.querySelectorAll('#discoBody .disco-card').forEach(function (card) {
      if (card._drDone) return;
      card._drDone = true;

      /* Rating badge nahoře vlevo (z .disco-card-rating, kterou CSS skryje) */
      var rEl = card.querySelector('.disco-card-rating');
      var rTxt = rEl ? rEl.textContent.replace(/[^0-9.]/g, '').trim() : '';
      var rVal = parseFloat(rTxt);
      if (rVal > 0) {
        var hasAI = !!card.querySelector('.ai-match-badge');
        var rb = document.createElement('div');
        rb.className = 'dr-rating-top';
        rb.style.top = hasAI ? '34px' : '9px';
        rb.style.left = '9px';
        rb.innerHTML = STAR + '<span style="margin-left:2px">' + rTxt + '</span>';
        card.appendChild(rb);
      }

      /* AI match badge — zkrátit na "NN%" */
      var ai = card.querySelector('.ai-match-badge');
      if (ai) {
        var m = ai.textContent.match(/(\d+)\s*%/);
        if (m) ai.textContent = m[1] + '%';
      }

      /* Typ (Film/Seriál) — doplnit ikonu, styl řeší CSS */
      var te = card.querySelector('.disco-card-type');
      if (te) {
        var tt = te.textContent.trim();
        var ico = tt.toLowerCase().indexOf('film') !== -1 ? FILM_ICO : TV_ICO;
        te.innerHTML = ico + '<span style="margin-left:3px">' + tt + '</span>';
      }

      /* Skrýt drobný AI "reason" text (kurzíva) — příliš šumu v kartě */
      card.querySelectorAll('[style*="italic"]').forEach(function (el) {
        el.style.setProperty('display', 'none', 'important');
      });

      attachExpand(card);
    });
  }

  function addCardCounts() {
    document.querySelectorAll('#discoBody .disco-row').forEach(function (row) {
      if (row._drCnt) return;
      row._drCnt = true;
      var sc = row.querySelector('.disco-row-scroll');
      var ti = row.querySelector('.disco-row-title');
      if (!sc || !ti) return;
      var n = sc.querySelectorAll('.disco-card').length;
      if (n < 2) return;
      var b = document.createElement('span');
      b.className = 'dr-cnt';
      b.textContent = n;
      ti.appendChild(b);
    });
  }

  function upgradeHeroImage() {
    document.querySelectorAll('.disco-hero-img').forEach(function (img) {
      if (img._drHi || !img.src) return;
      img._drHi = true;
      var hi = img.src.replace('/w780/', '/w1280/').replace('/w500/', '/w1280/').replace('/w342/', '/w780/');
      if (hi !== img.src) {
        var t = new Image();
        t.onload = function () { img.src = hi; };
        t.src = hi;
      }
    });
  }

  function addScrollHint() {
    var body = document.getElementById('discoBody');
    if (!body) return;
    var hero = body.querySelector('.disco-hero');
    if (!hero || hero.querySelector('.dr-sh')) return;
    var h = document.createElement('div');
    h.className = 'dr-sh';
    h.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="15" height="15"><path d="M4 6l4 4 4-4"/></svg><span>Scroll</span>';
    h.addEventListener('click', function () { body.scrollBy({ top: 340, behavior: 'smooth' }); });
    body.addEventListener('scroll', function () { h.style.opacity = body.scrollTop > 50 ? '0' : ''; }, { passive: true });
    hero.appendChild(h);
  }

  /* ── Hover expand panel na kartě ── */
  function getCardData(card) {
    var nameEl = card.querySelector('.disco-card-name');
    var ratTop = card.querySelector('.dr-rating-top');
    var typeEl = card.querySelector('.disco-card-type');
    var title = nameEl ? nameEl.textContent.trim() : '';

    var rTxt = '';
    if (ratTop) rTxt = ratTop.textContent.replace(/[^0-9.]/g, '').trim();
    else {
      var rEl = card.querySelector('.disco-card-rating');
      if (rEl) rTxt = rEl.textContent.replace(/[^0-9.]/g, '').trim();
    }

    var type = typeEl ? typeEl.textContent.replace(/[^a-zA-ZáčďéěíňóřšťůúýžÁČĎÉĚÍŇÓŘŠŤŮÚÝŽ\s]/g, '').trim() : '';

    var year = '';
    var oc = card.getAttribute('onclick') || '';
    var ym = oc.match(/[,\s](\d{4})[,\s\)]/);
    if (ym) year = ym[1];

    return { title: title, rating: rTxt, type: type, year: year };
  }

  function buildExpand(card) {
    var d = getCardData(card);
    var wrap = document.createElement('div');
    wrap.className = 'dr-expand';

    var titleEl = document.createElement('div');
    titleEl.className = 'dr-expand-title';
    titleEl.textContent = d.title;
    wrap.appendChild(titleEl);

    var meta = document.createElement('div');
    meta.className = 'dr-expand-meta';

    function dot() {
      var el = document.createElement('span');
      el.className = 'dr-expand-dot';
      return el;
    }

    if (d.type) {
      var t = document.createElement('span');
      t.className = 'dr-expand-type';
      t.textContent = d.type;
      meta.appendChild(t);
    }
    var rVal = parseFloat(d.rating);
    if (rVal > 0) {
      if (d.type) meta.appendChild(dot());
      var r = document.createElement('span');
      r.className = 'dr-expand-rating';
      r.innerHTML = STAR + '<span style="margin-left:2px">' + d.rating + '</span>';
      meta.appendChild(r);
    }
    if (d.year) {
      if (meta.children.length) meta.appendChild(dot());
      var y = document.createElement('span');
      y.className = 'dr-expand-year';
      y.textContent = d.year;
      meta.appendChild(y);
    }
    if (meta.children.length) wrap.appendChild(meta);

    var btns = document.createElement('div');
    btns.className = 'dr-expand-btns';

    var playBtn = document.createElement('button');
    playBtn.className = 'dr-expand-btn-play';
    playBtn.innerHTML = PLAY_SM + '<span style="margin-left:5px">Přehrát</span>';
    playBtn.addEventListener('click', function (e) { e.stopPropagation(); card.click(); });

    var wlBtn = document.createElement('button');
    wlBtn.className = 'dr-expand-btn-wl';
    wlBtn.innerHTML = PLUS_SM;
    wlBtn.title = 'Přidat do Watchlist';
    wlBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var finder = card.querySelector('.disco-card-finder-btn');
      if (finder) finder.click(); else card.click();
    });

    btns.appendChild(playBtn);
    btns.appendChild(wlBtn);
    wrap.appendChild(btns);
    return wrap;
  }

  function attachExpand(card) {
    if (card.querySelector('.dr-loader-bar')) return;
    var lb = document.createElement('div');
    lb.className = 'dr-loader-bar';
    card.appendChild(lb);
    card.appendChild(buildExpand(card));
  }

  /* ── Parallax hero (v discoBody) ── */
  function setupParallax(body) {
    if (body._drParallax) return;
    body._drParallax = true;
    var raf = false;
    body.addEventListener('scroll', function () {
      if (raf) return;
      raf = true;
      requestAnimationFrame(function () {
        raf = false;
        var hero = body.querySelector('.disco-hero');
        if (!hero) return;
        var s = body.scrollTop;
        var img = hero.querySelector('.disco-hero-img');
        if (img) img.style.transform = 'scale(1.06) translateY(' + Math.min(s * 0.3, 60) + 'px)';
        var cnt = hero.querySelector('.disco-hero-content');
        if (cnt) {
          cnt.style.opacity = Math.max(0, 1 - s / 240);
          cnt.style.transform = 'translateY(' + s * 0.15 + 'px)';
        }
      });
    }, { passive: true });
  }

  function setupBackTop(overlay, body) {
    if (document.getElementById('dr-btt')) return;
    var btn = document.createElement('button');
    btn.id = 'dr-btt';
    btn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" width="14" height="14"><path d="M4 10l4-4 4 4"/></svg>';
    btn.addEventListener('click', function () { body.scrollTo({ top: 0, behavior: 'smooth' }); });
    overlay.appendChild(btn);
    body.addEventListener('scroll', function () {
      btn.classList.toggle('dr-visible', body.scrollTop > 300);
    }, { passive: true });
  }

  /* ── Orchestrace: jeden debounced běh místo pěti observerů + pollingu ── */
  function runAll() {
    [upgradeNavIcons, compactGenreFilters, upgradeHeroBtns, upgradeCards, addCardCounts, upgradeHeroImage, addScrollHint]
      .forEach(function (fn) {
        try { fn(); } catch (err) { console.warn('[MFDiscover] krok selhal:', fn.name, err); }
      });
  }

  var pending = false;
  function scheduleRun() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; runAll(); });
  }

  function init() {
    var overlay = document.getElementById('universeOverlay');
    var body = document.getElementById('discoBody');
    var nav = document.getElementById('discoNav');
    if (!overlay || !body) return; // markup ještě není v DOM (nemělo by nastat)

    setupParallax(body);
    setupBackTop(overlay, body);

    var observer = new MutationObserver(scheduleRun);
    observer.observe(body, { childList: true, subtree: true });
    if (nav) observer.observe(nav, { childList: true, subtree: true, attributes: true });

    scheduleRun();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('[MFDiscover] v5 (lean) načteno');
})();
