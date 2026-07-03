/* 971threads: hero slideshow: autoplay + arrows + dots + grab/swipe */
(function () {
  function init(root) {
    if (root.dataset.heroReady === '1') return;
    var track = root.querySelector('.hero__track');
    var slides = root.querySelectorAll('.hero__slide');
    if (!track || slides.length <= 1) return;
    root.dataset.heroReady = '1';

    var vp = root.querySelector('.hero__viewport') || track;
    var dots = root.querySelectorAll('.hero__dot');
    var index = 0;
    var timer = null;
    var speed = (parseInt(root.dataset.speed, 10) || 5) * 1000;
    var auto = root.dataset.autoplay === 'true';

    var EASE = 'transform 0.6s cubic-bezier(0.65, 0.05, 0.36, 1)';
    function set(i, animate) {
      var n = slides.length;
      index = ((i % n) + n) % n;
      // Explicit inline transition so slides always glide (overrides reduced-motion CSS).
      track.style.transition = animate === false ? 'none' : EASE;
      track.style.transform = 'translateX(-' + index * 100 + '%)';
      for (var d = 0; d < dots.length; d++) dots[d].classList.toggle('is-active', d === index);
    }
    function stop() { clearInterval(timer); }
    function start() { if (auto) { stop(); timer = setInterval(function () { set(index + 1); }, speed); } }
    function go(i) { set(i); start(); }

    var prev = root.querySelector('.hero__arrow--prev');
    var next = root.querySelector('.hero__arrow--next');
    if (prev) prev.addEventListener('click', function () { go(index - 1); });
    if (next) next.addEventListener('click', function () { go(index + 1); });
    for (var k = 0; k < dots.length; k++) {
      (function (j) { dots[j].addEventListener('click', function () { go(j); }); })(k);
    }

    /* grab / swipe */
    var dragging = false, startX = 0, dx = 0, width = 1;
    vp.addEventListener('pointerdown', function (e) {
      dragging = true; startX = e.clientX; dx = 0; width = vp.clientWidth || 1;
      stop();
      track.style.transition = 'none';
      root.classList.add('is-dragging');
      try { vp.setPointerCapture(e.pointerId); } catch (err) {}
    });
    vp.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      dx = e.clientX - startX;
      track.style.transform = 'translateX(calc(' + (-index * 100) + '% + ' + dx + 'px))';
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      root.classList.remove('is-dragging');
      track.style.transition = '';
      var threshold = Math.max(50, width * 0.12);
      if (dx <= -threshold) set(index + 1);
      else if (dx >= threshold) set(index - 1);
      else set(index);
      start();
    }
    vp.addEventListener('pointerup', endDrag);
    vp.addEventListener('pointercancel', endDrag);
    /* swallow the click that follows a real drag so CTAs don't fire */
    vp.addEventListener('click', function (e) {
      if (Math.abs(dx) > 8) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    set(0, false);
    start();
  }

  function initAll() {
    var nodes = document.querySelectorAll('.hero');
    for (var i = 0; i < nodes.length; i++) init(nodes[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();
  document.addEventListener('shopify:section:load', initAll);
})();
