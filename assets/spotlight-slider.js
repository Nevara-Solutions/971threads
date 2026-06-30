/* 971threads — collection-spotlight slider arrows */
(function () {
  if (window.__cspotLoaded) return;
  window.__cspotLoaded = true;

  function setup(slider) {
    if (slider.dataset.ready) return;
    slider.dataset.ready = '1';
    var row = slider.querySelector('.cspot__row');
    if (!row) return;
    var prev = slider.querySelector('.cspot__arrow--prev');
    var next = slider.querySelector('.cspot__arrow--next');

    function amount() { return Math.max(row.clientWidth * 0.85, 280); }
    if (prev) prev.addEventListener('click', function () { row.scrollBy({ left: -amount(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { row.scrollBy({ left: amount(), behavior: 'smooth' }); });

    function refresh() {
      slider.classList.toggle('is-scrollable', row.scrollWidth - row.clientWidth > 4);
    }
    refresh();
    window.addEventListener('resize', refresh);
    // Images can change scrollWidth after they load.
    window.setTimeout(refresh, 500);
    window.setTimeout(refresh, 1500);
  }

  function initAll() {
    var nodes = document.querySelectorAll('.cspot__slider');
    for (var i = 0; i < nodes.length; i++) setup(nodes[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
  document.addEventListener('shopify:section:load', initAll);
})();
