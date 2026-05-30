/**
 * MujFlix Discover Redesign v4
 * Posledni <script> pred </body>
 */
(function () {
  'use strict';
  if (window._mfDRv4) return;
  window._mfDRv4 = true;

  /* SVG IKONY NAV */
  var NAV_ICONS = {
    trending:   '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="M2 14l4-4 3 3 4-5 3 3"/><path d="M14 6h4v4"/></svg>',
    film:       '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><rect x="2" y="4" width="16" height="13" rx="2"/><path d="M2 8h16M7 4v4M13 4v4"/></svg>',
    serial:     '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><rect x="1" y="3" width="18" height="13" rx="2"/><path d="M6 17l2-1h4l2 1"/></svg>',
    komedi:     '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><circle cx="10" cy="9" r="7"/><path d="M7 11c.8 1.5 5.2 1.5 6 0"/><circle cx="8" cy="8" r="0.8" fill="currentColor"/><circle cx="12" cy="8" r="0.8" fill="currentColor"/></svg>',
    drama:      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><path d="M4 14c1-3 4-5 6-3s5 0 6-3"/><path d="M3 7c1 3 4 5 6 3s5 0 6 3"/></svg>',
    sci:        '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><ellipse cx="10" cy="10" rx="4" ry="4"/><ellipse cx="10" cy="10" rx="9" ry="4"/></svg>',
    krim:       '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><circle cx="9" cy="9" r="6"/><path d="M13.5 13.5L18 18"/></svg>',
    horor:      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><path d="M10 2L3 18h14L10 2z"/><path d="M10 8v5"/></svg>',
    anim:       '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><circle cx="10" cy="10" r="7"/><circle cx="7.5" cy="10" r="1.2" fill="currentColor"/><circle cx="12.5" cy="10" r="1.2" fill="currentColor"/><path d="M7 13c1 1.5 5 1.5 6 0"/></svg>',
    mysteri:    '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><circle cx="10" cy="10" r="8"/><path d="M10 6c-1.6 0-3 1-3 2.5S8.5 11 10 11"/><circle cx="10" cy="14" r="0.9" fill="currentColor"/></svg>',
    akce:       '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><path d="M12 2L4 12h6l-2 6 8-10h-6z"/></svg>',
    realit:     '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><circle cx="10" cy="10" r="3.5"/><circle cx="10" cy="10" r="7" stroke-dasharray="2 3"/></svg>',
    dokum:      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><rect x="4" y="2" width="12" height="16" rx="1.5"/><path d="M7 7h6M7 10h6M7 13h4"/></svg>',
    romant:     '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><path d="M10 17S3 12 3 7a4 4 0 017-2.6A4 4 0 0117 7c0 5-7 10-7 10z"/></svg>',
    thriller:   '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><path d="M12 2L4 12h6l-2 6 8-10h-6z"/></svg>',
    fantas:     '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><path d="M10 2l2 6h6l-5 3.5 2 6L10 14l-5 3.5 2-6L2 8h6z"/></svg>',
    sport:      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><circle cx="10" cy="10" r="8"/><path d="M10 2c2 4 2 12 0 16M2 10c4-2 12-2 16 0"/></svg>',
    hudba:      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><path d="M9 17V6l9-2v11"/><circle cx="6" cy="17" r="3"/><circle cx="15" cy="15" r="3"/></svg>',
    valec:      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><path d="M3 15h14M6 12l-3 3M14 12l3 3M10 3v9M7 6l3-3 3 3"/></svg>',
    histor:     '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><path d="M4 18V9l6-6 6 6v9"/><path d="M8 18v-5h4v5"/></svg>',
    rodin:      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><circle cx="7" cy="6" r="2.5"/><circle cx="13" cy="6" r="2.5"/><path d="M2 18c0-4 10-4 10 0"/><circle cx="14.5" cy="13" r="1.8"/><path d="M11 18c0-2.5 7-2.5 7 0"/></svg>'
  };

  function getNavIcon(label) {
    var norm = label.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
    for (var key in NAV_ICONS) {
      if (norm.indexOf(key) === 0 || key.indexOf(norm.slice(0,5)) === 0) {
        return NAV_ICONS[key];
      }
    }
    return null;
  }

  function upgradeNavIcons() {
    var nav = document.getElementById('discoNav');
    if (!nav) return;
    nav.querySelectorAll('.disco-nav-item').forEach(function(item) {
      if (item._drDone) return;
      item._drDone = true;
      var raw = item.textContent.trim();
      var ico = getNavIcon(raw);
      if (!ico) return;
      var clean = raw.replace(/^[^\w\u00C0-\u024F]+/, '').trim();
      item.innerHTML = ico + '<span style="margin-left:4px">' + clean + '</span>';
      item.style.setProperty('display','inline-flex','important');
      item.style.setProperty('align-items','center','important');
    });
  }

  function upgradeHeroBtns() {
    var PLAY = '<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><polygon points="3,2 14,8 3,14"/></svg>';
    var PLUS = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="13" height="13"><path d="M8 3v10M3 8h10"/></svg>';
    document.querySelectorAll('.disco-hero-btn').forEach(function(btn) {
      if (btn._drDone) return; btn._drDone = true;
      var t = btn.textContent.trim();
      var n = t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      if (n.indexOf('prehrat') !== -1 || n.indexOf('spustit') !== -1 || n.indexOf('play') !== -1) {
        btn.innerHTML = PLAY + '<span style="margin-left:7px">' + t + '</span>';
      } else {
        btn.innerHTML = PLUS + '<span style="margin-left:7px">' + t + '</span>';
      }
    });
  }

  /* KRITICKÁ FUNKCE — prebíjí inline opacity:0 z app.js */
  function forceInfoVisible(info) {
    if (!info) return;
    info.style.setProperty('opacity',        '1',        'important');
    info.style.setProperty('transform',      'none',     'important');
    info.style.setProperty('display',        'flex',     'important');
    info.style.setProperty('flex-direction', 'column',   'important');
    info.style.setProperty('gap',            '4px',      'important');
    info.style.setProperty('position',       'absolute', 'important');
    info.style.setProperty('bottom',         '0',        'important');
    info.style.setProperty('left',           '0',        'important');
    info.style.setProperty('right',          '0',        'important');
    info.style.setProperty('padding',        '8px 11px 11px', 'important');
    info.style.setProperty('z-index',        '5',        'important');
    info.style.setProperty('pointer-events', 'none',     'important');
    info.style.setProperty('transition',     'none',     'important');
  }

  var STAR = '<svg viewBox="0 0 12 12" fill="#f0c94a" width="9" height="9"><polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9.2,11 6,9.2 2.8,11 3.5,7.5 1,5 4.5,4.5"/></svg>';
  var FILM_ICO = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" width="9" height="9"><rect x=".5" y="2" width="11" height="8" rx="1.2"/><path d=".5 5h11M4 2v3M8 2v3"/></svg>';
  var TV_ICO   = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" width="9" height="9"><rect x=".5" y="1.5" width="11" height="8" rx="1.2"/><path d="M4 10.5l1.5-1.5h1L8 10.5"/></svg>';

  function upgradeCards() {
    document.querySelectorAll('#discoBody .disco-card, .universe-overlay .disco-card').forEach(function(card) {
      if (card._drV4) return;
      card._drV4 = true;

      /* 1. INFO vzdy viditelne */
      var info = card.querySelector('.disco-card-info');
      forceInfoVisible(info);
      if (info && !info._drMo) {
        info._drMo = true;
        new MutationObserver(function() { forceInfoVisible(info); })
          .observe(info, { attributes: true, attributeFilter: ['style'] });
      }

      /* 2. Nazev stylovani */
      var name = card.querySelector('.disco-card-name');
      if (name) {
        name.style.setProperty('font-size',      '0.73rem',                 'important');
        name.style.setProperty('font-weight',    '700',                     'important');
        name.style.setProperty('color',          'rgba(255,255,255,0.97)',  'important');
        name.style.setProperty('line-height',    '1.28',                    'important');
        name.style.setProperty('text-shadow',    '0 1px 10px rgba(0,0,0,1)','important');
        name.style.setProperty('letter-spacing', '-0.1px',                  'important');
        name.style.setProperty('margin-bottom',  '3px',                     'important');
      }

      /* 3. Rating badge nahore vlevo */
      var rEl = card.querySelector('.disco-card-rating');
      var rTxt = rEl ? rEl.textContent.replace(/[^0-9.]/g,'').trim() : '';
      var rVal = parseFloat(rTxt);
      if (rVal > 0 && !card.querySelector('.dr-rating-top')) {
        var hasAI = !!card.querySelector('.ai-match-badge');
        var rb = document.createElement('div');
        rb.className = 'dr-rating-top';
        rb.style.cssText = 'position:absolute;top:' + (hasAI ? '34px' : '9px') + ';left:9px;z-index:9;display:inline-flex;align-items:center;gap:3px;font-size:0.6rem;font-weight:800;color:#f0c94a;background:rgba(6,6,16,0.9);border:0.5px solid rgba(240,201,74,0.25);padding:3px 8px 3px 5px;border-radius:20px;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);pointer-events:none;line-height:1;';
        rb.innerHTML = STAR + '<span style="margin-left:2px">' + rTxt + '</span>';
        card.appendChild(rb);
      }
      if (rEl) rEl.style.setProperty('display','none','important');

      /* 4. AI badge — zkratit + zeslabit */
      var ai = card.querySelector('.ai-match-badge');
      if (ai && !ai._drV4) {
        ai._drV4 = true;
        var m = ai.textContent.match(/(\d+)\s*%/);
        if (m) ai.textContent = m[1] + '%';
        ai.style.setProperty('font-size',     '0.49rem',                'important');
        ai.style.setProperty('font-weight',   '700',                    'important');
        ai.style.setProperty('color',         'rgba(255,255,255,0.36)', 'important');
        ai.style.setProperty('background',    'rgba(6,6,16,0.8)',       'important');
        ai.style.setProperty('border',        '0.5px solid rgba(255,255,255,0.07)','important');
        ai.style.setProperty('padding',       '2px 6px',                'important');
        ai.style.setProperty('border-radius', '20px',                   'important');
        ai.style.setProperty('top',           '9px',                    'important');
        ai.style.setProperty('left',          '9px',                    'important');
        ai.style.setProperty('z-index',       '9',                      'important');
      }

      /* 5. Type badge — SVG + text */
      var te = card.querySelector('.disco-card-type');
      if (te && !te._drV4) {
        te._drV4 = true;
        var tt = te.textContent.trim();
        var ico = (tt.toLowerCase().indexOf('film') !== -1) ? FILM_ICO : TV_ICO;
        te.innerHTML = ico + '<span style="margin-left:3px">' + tt + '</span>';
        te.style.cssText = 'display:inline-flex!important;align-items:center;gap:2px;font-size:.52rem;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:rgba(255,255,255,.45);background:rgba(255,255,255,.07);border:.5px solid rgba(255,255,255,.1);padding:2px 7px;border-radius:5px;';
      }

      /* 6. AI reason text — skryt */
      card.querySelectorAll('[style*="italic"],[style*="0.4rem"],[style*="0.42rem"]').forEach(function(el) {
        if (!el._drHidden) { el._drHidden = true; el.style.setProperty('display','none','important'); }
      });
    });
  }

  function addCardCounts() {
    document.querySelectorAll('#discoBody .disco-row').forEach(function(row) {
      if (row._drCnt) return; row._drCnt = true;
      var sc = row.querySelector('.disco-row-scroll');
      var ti = row.querySelector('.disco-row-title');
      if (!sc || !ti) return;
      var n = sc.querySelectorAll('.disco-card').length;
      if (n < 2) return;
      var old = ti.querySelector('.dr-cnt'); if (old) old.remove();
      var b = document.createElement('span');
      b.className = 'dr-cnt';
      b.style.cssText = 'font-size:.54rem;font-weight:600;color:rgba(255,255,255,.18);background:rgba(255,255,255,.04);border:.5px solid rgba(255,255,255,.07);padding:2px 7px;border-radius:10px;margin-left:5px;vertical-align:middle;';
      b.textContent = n;
      ti.appendChild(b);
    });
  }

  function setupParallax() {
    var body = document.getElementById('discoBody');
    if (!body) return;
    var raf = false;
    body.addEventListener('scroll', function() {
      if (raf) return; raf = true;
      requestAnimationFrame(function() {
        raf = false;
        var hero = body.querySelector('.disco-hero');
        if (!hero) return;
        var s = body.scrollTop;
        var img = hero.querySelector('.disco-hero-img');
        if (img) img.style.transform = 'scale(1.06) translateY(' + Math.min(s * 0.3, 60) + 'px)';
        var cnt = hero.querySelector('.disco-hero-content');
        if (cnt) { cnt.style.opacity = Math.max(0, 1 - s / 240); cnt.style.transform = 'translateY(' + s * 0.15 + 'px)'; }
      });
    }, { passive: true });
  }

  function upgradeHeroImage() {
    document.querySelectorAll('.disco-hero-img').forEach(function(img) {
      if (img._drHi || !img.src) return; img._drHi = true;
      var hi = img.src.replace('/w780/','/w1280/').replace('/w500/','/w1280/').replace('/w342/','/w780/');
      if (hi !== img.src) { var t = new Image(); t.onload = function(){ img.src = hi; }; t.src = hi; }
    });
  }

  function addScrollHint() {
    var body = document.getElementById('discoBody');
    if (!body) return;
    var hero = body.querySelector('.disco-hero');
    if (!hero || hero.querySelector('.dr-sh')) return;
    var h = document.createElement('div');
    h.className = 'dr-sh';
    h.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);z-index:10;display:flex;flex-direction:column;align-items:center;gap:5px;color:rgba(255,255,255,.25);font-size:0.48rem;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;cursor:pointer;animation:dr-bounce 2.5s ease-in-out infinite;pointer-events:auto;';
    h.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="15" height="15"><path d="M4 6l4 4 4-4"/></svg><span>Scroll</span>';
    h.onclick = function(){ body.scrollBy({top:340,behavior:'smooth'}); };
    body.addEventListener('scroll', function(){ h.style.opacity = body.scrollTop > 50 ? '0' : ''; }, { passive: true });
    hero.appendChild(h);
  }

  function setupBackTop() {
    var ov = document.getElementById('universeOverlay');
    if (!ov || document.getElementById('dr-btt')) return;
    var btn = document.createElement('button');
    btn.id = 'dr-btt';
    btn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" width="14" height="14"><path d="M4 10l4-4 4 4"/></svg>';
    btn.style.cssText = 'position:fixed;bottom:88px;right:22px;z-index:400;width:40px;height:40px;border-radius:50%;background:rgba(6,6,16,0.92);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:0.5px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transform:translateY(14px) scale(0.8);transition:all 0.28s cubic-bezier(.34,1.3,.64,1);pointer-events:none;';
    btn.onclick = function(){ var b = document.getElementById('discoBody'); if(b) b.scrollTo({top:0,behavior:'smooth'}); };
    ov.appendChild(btn);
    var body = document.getElementById('discoBody');
    if (body) body.addEventListener('scroll', function(){
      var show = body.scrollTop > 300;
      btn.style.opacity = show ? '1' : '0';
      btn.style.transform = show ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.8)';
      btn.style.pointerEvents = show ? 'auto' : 'none';
    }, { passive: true });
  }

  function injectOverrideTag() {
    var old = document.getElementById('dr-ov4'); if (old) old.remove();
    var s = document.createElement('style');
    s.id = 'dr-ov4';
    s.textContent = [
      /* Nav */
      '.disco-nav-item{font-family:"DM Sans",-apple-system,sans-serif!important;font-size:.78rem!important;font-weight:500!important;letter-spacing:0!important;}',
      '.disco-nav-item.active,.disco-nav-item.mf-chip-optimistic{background:rgba(255,255,255,.1)!important;border-color:rgba(255,255,255,.2)!important;color:rgba(255,255,255,.97)!important;font-weight:700!important;box-shadow:none!important;transform:none!important;}',
      /* Rows */
      '.disco-row-title{font-family:"Syne",-apple-system,sans-serif!important;font-size:1.2rem!important;font-weight:900!important;letter-spacing:-.6px!important;}',
      '.disco-row-header{padding:36px 52px 16px!important;}',
      '.disco-row-scroll{gap:12px!important;padding-left:52px!important;padding-right:52px!important;padding-bottom:32px!important;}',
      /* Card — landscape format */
      '.disco-card{position:relative!important;width:220px!important;min-width:220px!important;height:138px!important;border-radius:12px!important;overflow:hidden!important;background:#12121e!important;box-shadow:0 2px 10px rgba(0,0,0,.5),inset 0 0 0 .5px rgba(255,255,255,.04)!important;transition:transform .32s cubic-bezier(.34,1.44,.64,1),box-shadow .32s cubic-bezier(.25,1,.5,1)!important;display:block!important;}',
      '.disco-card:hover{transform:translateY(-16px) scale(1.05)!important;box-shadow:0 36px 80px rgba(0,0,0,.95),0 0 0 .5px rgba(255,255,255,.12)!important;z-index:10!important;}',
      /* Image */
      '.disco-card-img{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center 20%!important;border-radius:0!important;transition:transform .5s,filter .3s!important;transform:scale(1)!important;}',
      '.disco-card:hover .disco-card-img{transform:scale(1.08)!important;filter:brightness(.45) saturate(1.15)!important;}',
      /* Overlay */
      '.disco-card-overlay{position:absolute!important;inset:0!important;background:linear-gradient(to top,rgba(6,6,16,1) 0%,rgba(6,6,16,.85) 30%,rgba(6,6,16,.2) 62%,transparent 85%)!important;opacity:1!important;z-index:2!important;}',
      '.disco-card-glow{display:none!important;}',
      /* Info */
      '.disco-card-info{position:absolute!important;bottom:0!important;left:0!important;right:0!important;padding:8px 11px 11px!important;z-index:5!important;display:flex!important;flex-direction:column!important;gap:4px!important;pointer-events:none!important;}',
      '.disco-card-name{font-size:.73rem!important;font-weight:700!important;color:rgba(255,255,255,.97)!important;line-height:1.28!important;letter-spacing:-.1px!important;text-shadow:0 1px 10px rgba(0,0,0,1)!important;overflow:hidden!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;}',
      '.disco-card-meta{display:flex!important;align-items:center!important;gap:5px!important;}',
      '.disco-card-type{display:inline-flex!important;align-items:center;gap:3px;font-size:.52rem!important;font-weight:800!important;letter-spacing:.5px!important;text-transform:uppercase!important;color:rgba(255,255,255,.45)!important;background:rgba(255,255,255,.07)!important;border:.5px solid rgba(255,255,255,.1)!important;padding:2px 7px!important;border-radius:5px!important;}',
      '.disco-card-rating{display:none!important;}',
      /* Play btn */
      '.disco-play-btn{position:absolute!important;top:50%!important;left:50%!important;transform:translate(-50%,-60%) scale(.55)!important;width:56px!important;height:56px!important;border-radius:50%!important;background:rgba(255,255,255,.96)!important;display:flex!important;align-items:center!important;justify-content:center!important;opacity:0!important;transition:opacity .22s,transform .28s cubic-bezier(.34,1.44,.64,1)!important;z-index:6!important;box-shadow:0 8px 32px rgba(0,0,0,.8)!important;}',
      '.disco-play-btn svg{fill:#060610!important;width:18px!important;height:18px!important;margin-left:4px!important;}',
      '.disco-card:hover .disco-play-btn{opacity:1!important;transform:translate(-50%,-60%) scale(1)!important;}',
      /* Finder */
      '.disco-card-finder-btn{position:absolute!important;top:9px!important;right:9px!important;width:28px!important;height:28px!important;border-radius:50%!important;background:rgba(6,6,16,.78)!important;border:.5px solid rgba(255,255,255,.15)!important;display:flex!important;align-items:center!important;justify-content:center!important;color:rgba(255,255,255,.75)!important;cursor:pointer!important;z-index:8!important;backdrop-filter:blur(10px)!important;opacity:0!important;transform:scale(.7) translateY(-4px)!important;transition:all .22s cubic-bezier(.34,1.44,.64,1)!important;}',
      '.disco-card:hover .disco-card-finder-btn{opacity:1!important;transform:scale(1) translateY(0)!important;}',
      '.disco-card-finder-btn:hover{background:rgba(74,158,255,.35)!important;border-color:rgba(74,158,255,.55)!important;color:#fff!important;}',
      /* Skeletons */
      '.mf-skeleton-tile,.mf-disco-skel-card{width:220px!important;min-width:220px!important;height:138px!important;border-radius:12px!important;}',
      /* Hero */
      '.disco-hero-btn.primary{background:#4a9eff!important;color:#fff!important;box-shadow:0 8px 32px rgba(74,158,255,.45)!important;}',
      '.disco-hero-btn.primary:hover{background:#6fb3ff!important;transform:translateY(-2px)!important;}',
      /* Animace */
      '@keyframes dr-bounce{0%,100%{transform:translateX(-50%) translateY(0)}55%{transform:translateX(-50%) translateY(6px)}}',
      '@keyframes dr-enter{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}',
    ].join('\n');
    document.head.appendChild(s);
  }

  function runAll() {
    upgradeNavIcons();
    upgradeHeroBtns();
    upgradeCards();
    addCardCounts();
    upgradeHeroImage();
    addScrollHint();
  }

  function setupObserver() {
    var body = document.getElementById('discoBody');
    if (!body) return;
    var timer;
    new MutationObserver(function() {
      clearTimeout(timer);
      timer = setTimeout(function(){ runAll(); injectOverrideTag(); }, 80);
    }).observe(body, { childList: true, subtree: true });

    var nav = document.getElementById('discoNav');
    if (nav) new MutationObserver(function() {
      clearTimeout(timer);
      timer = setTimeout(upgradeNavIcons, 60);
    }).observe(nav, { childList: true, subtree: true, attributes: true });
  }

  /* Prebij mf-disco-fx kdyz se injectuje */
  function watchHead() {
    new MutationObserver(function(muts) {
      muts.forEach(function(m) {
        m.addedNodes.forEach(function(n) {
          if (n.id && (n.id.indexOf('mf-disco') !== -1 || n.id.indexOf('mf-fx') !== -1)) {
            setTimeout(injectOverrideTag, 15);
          }
        });
      });
    }).observe(document.head, { childList: true });
  }

  function injectFonts() {
    if (document.getElementById('dr-fonts')) return;
    var l = document.createElement('link');
    l.id = 'dr-fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap';
    document.head.appendChild(l);
  }

  function init() {
    injectFonts();
    injectOverrideTag();
    watchHead();

    var tries = 0;
    var poll = setInterval(function() {
      if (++tries > 100) { clearInterval(poll); return; }
      var body = document.getElementById('discoBody');
      if (!body) return;
      clearInterval(poll);
      setupObserver();
      setupParallax();
      setupBackTop();
      setTimeout(runAll, 350);
      [900, 1800, 3600].forEach(function(t) {
        setTimeout(function(){ runAll(); injectOverrideTag(); }, t);
      });
    }, 120);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, 80); });
  } else {
    setTimeout(init, 80);
  }

  console.log('[MFDiscover] v4 loaded');
})();
