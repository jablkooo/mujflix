/**
 * MůjFlix — FULLSCREEN PATCH (JS fallback)
 *
 * Přidává třídu body.overlay-open když je universe-overlay otevřený.
 * Potřebné pro prohlížeče bez podpory CSS :has() selektoru.
 */
(function() {
  // MutationObserver sleduje přidání/odebrání tříd na universe overlay
  function watchOverlays() {
    const overlays = document.querySelectorAll('.universe-overlay');

    function updateBodyClass() {
      const anyOpen = !!document.querySelector('.universe-overlay.open, .universe-overlay.visible');
      document.body.classList.toggle('overlay-open', anyOpen);
    }

    overlays.forEach(function(el) {
      new MutationObserver(updateBodyClass).observe(el, { attributes: true, attributeFilter: ['class'] });
    });

    // Sleduj i nově přidané overlay elementy
    new MutationObserver(function(muts) {
      muts.forEach(function(m) {
        m.addedNodes.forEach(function(node) {
          if (node.nodeType === 1 && node.classList && node.classList.contains('universe-overlay')) {
            new MutationObserver(updateBodyClass).observe(node, { attributes: true, attributeFilter: ['class'] });
          }
        });
      });
      updateBodyClass();
    }).observe(document.body, { childList: true, subtree: false });

    updateBodyClass();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchOverlays);
  } else {
    watchOverlays();
  }
})();
