/* 971threads — hero slideshow (robust, framework-free) */
(function () {
  function init(root) {
    if (root.dataset.heroReady === '1') return;
    var track = root.querySelector('.hero__track');
    var slides = root.querySelectorAll('.hero__slide');
    if (!track || slides.length <= 1) return;
    root.dataset.heroReady = '1';

    var dots = root.querySelectorAll('.hero__dot');
    var index = 0;
    var timer = null;
    var speed = (parseInt(root.dataset.speed, 10) || 5) * 1000;
    var auto =
      root.dataset.autoplay === 'true' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function show(i) {
      var n = slides.length;
      index = ((i % n) + n) % n;
      track.style.transform = 'translateX(-' + index * 100 + '%)';
      for (var d = 0; d < dots.length; d++) {
        dots[d].classList.toggle('is-active', d === index);
      }
    }
    function start() {
      if (auto) timer = window.setInterval(function () { show(index + 1); }, speed);
    }
    function stop() { window.clearInterval(timer); }
    function goTo(i) { show(i); if (auto) { stop(); start(); } }

    var prev = root.querySelector('.hero__arrow--prev');
    var next = root.querySelector('.hero__arrow--next');
    if (prev) prev.addEventListener('click', function () { goTo(index - 1); });
    if (next) next.addEventListener('click', function () { goTo(index + 1); });
    for (var k = 0; k < dots.length; k++) {
      (function (j) {
        dots[j].addEventListener('click', function () { goTo(j); });
      })(k);
    }

    if (auto) {
      root.addEventListener('mouseenter', stop);
      root.addEventListener('mouseleave', start);
      start();
    }
    show(0);
  }

  function initAll() {
    var nodes = document.querySelectorAll('.hero');
    for (var i = 0; i < nodes.length; i++) init(nodes[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
  // Re-init when a section is re-rendered in the Theme Editor.
  document.addEventListener('shopify:section:load', initAll);
})();
