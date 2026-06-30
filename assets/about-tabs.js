/* 971threads — About section tab switcher */
(function () {
  if (window.__aboutLoaded) return;
  window.__aboutLoaded = true;

  function setup(root) {
    if (root.dataset.ready) return;
    root.dataset.ready = '1';
    var tabs = root.querySelectorAll('.about__tab');
    var panels = root.querySelectorAll('.about__panel');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function () {
        var id = this.getAttribute('data-tab');
        for (var t = 0; t < tabs.length; t++) tabs[t].classList.toggle('is-active', tabs[t] === this);
        for (var p = 0; p < panels.length; p++) panels[p].classList.toggle('is-active', panels[p].getAttribute('data-panel') === id);
      });
    }
  }

  function initAll() {
    var nodes = document.querySelectorAll('.about');
    for (var i = 0; i < nodes.length; i++) setup(nodes[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
  document.addEventListener('shopify:section:load', initAll);
})();
