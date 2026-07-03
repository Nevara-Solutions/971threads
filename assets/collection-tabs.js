/* 971threads — collection tabs: switch panels + update the Shop link */
(function () {
  if (window.__ctabsLoaded) return;
  window.__ctabsLoaded = true;

  function setup(root) {
    if (root.dataset.ready) return;
    root.dataset.ready = '1';
    var tabs = root.querySelectorAll('.ctabs__tab');
    var panels = root.querySelectorAll('.ctabs__panel');
    var shop = root.querySelector('.ctabs__shop');

    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function () {
        var id = this.getAttribute('data-tab');
        for (var t = 0; t < tabs.length; t++) tabs[t].classList.toggle('is-active', tabs[t] === this);
        for (var p = 0; p < panels.length; p++) panels[p].classList.toggle('is-active', panels[p].getAttribute('data-panel') === id);
        if (shop) {
          shop.textContent = this.getAttribute('data-shop-label');
          shop.setAttribute('href', this.getAttribute('data-shop-link'));
        }
        // let the now-visible slider recalculate its arrows
        window.dispatchEvent(new Event('resize'));
      });
    }
  }

  function initAll() {
    var nodes = document.querySelectorAll('.ctabs');
    for (var i = 0; i < nodes.length; i++) setup(nodes[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();
  document.addEventListener('shopify:section:load', initAll);
})();
