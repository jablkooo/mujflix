/**
 * MůjFlix — TMDB Image Proxy Patch v1
 * ════════════════════════════════════
 * Přepisuje <img src="https://image.tmdb.org/..."> na vlastní proxy
 * /api/tmdb-img/... (viz functions/api/tmdb-img/[[catchall]].js),
 * který vynucuje JPEG a obchází Cloudflare WebP content negotiation.
 *
 * Důvod: na některých systémech se WebP varianta z image.tmdb.org
 * nevykresluje (zůstává černá), i když se reálně načte.
 */
(function () {
  'use strict';

  if (window._mfImgProxyLoaded) return;
  window._mfImgProxyLoaded = true;

  var SRC_PREFIX = 'https://image.tmdb.org';
  var PROXY_PREFIX = '/api/tmdb-img';

  function rewrite(img) {
    if (!img || img._mfProxied) return;
    var src = img.getAttribute && img.getAttribute('src');
    if (!src || src.indexOf(SRC_PREFIX) !== 0) return;
    img._mfProxied = true;
    img.src = PROXY_PREFIX + src.slice(SRC_PREFIX.length);
  }

  function scan(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('img[src^="' + SRC_PREFIX + '"]').forEach(rewrite);
  }

  // Počáteční průchod (pro obrázky, co už jsou v DOM)
  scan(document);

  // Sleduj nově vkládané/aktualizované <img> elementy
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.type === 'childList') {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.tagName === 'IMG') rewrite(node);
          else scan(node);
        });
      } else if (m.type === 'attributes' && m.target.tagName === 'IMG') {
        rewrite(m.target);
      }
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src'],
  });

  console.log('[MFImgProxy] v1 — TMDB obrázky routovány přes /api/tmdb-img (vynucený JPEG)');
})();
