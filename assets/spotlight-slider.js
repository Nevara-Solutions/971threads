/* 971threads — product carousel (transform-based): smooth, one-by-one, drag/swipe,
   arrows hidden when everything fits, plain column on mobile. */
(function () {
  if (window.__cspotLoaded) return;
  window.__cspotLoaded = true;

  function setup(slider) {
    if (slider.dataset.ready) return;
    slider.dataset.ready = '1';
    var viewport = slider.querySelector('.cspot__viewport');
    var row = slider.querySelector('.cspot__row');
    if (!viewport || !row) return;
    var prev = slider.querySelector('.cspot__arrow--prev');
    var next = slider.querySelector('.cspot__arrow--next');
    var index = 0;

    function isColumn() { return window.matchMedia('(max-width: 749px)').matches; }
    function step() {
      var card = row.querySelector('.cspot__card');
      if (!card) return 1;
      var style = getComputedStyle(row);
      var gap = parseFloat(style.columnGap || style.gap) || 0;
      return card.getBoundingClientRect().width + gap;
    }
    function maxOffset() { return Math.max(0, row.scrollWidth - viewport.clientWidth); }
    function maxIndex() { var s = step(); return s ? Math.ceil(maxOffset() / s) : 0; }
    function currentX() {
      var m = /translateX\((-?[0-9.]+)px\)/.exec(row.style.transform);
      return m ? parseFloat(m[1]) : 0;
    }
    function apply(animate) {
      row.style.transition = animate === false ? 'none' : '';
      var x = Math.min(index * step(), maxOffset());
      row.style.transform = 'translateX(' + -x + 'px)';
      if (prev) prev.disabled = index <= 0;
      if (next) next.disabled = index >= maxIndex();
    }
    function go(i) { index = Math.max(0, Math.min(i, maxIndex())); apply(true); }

    function refresh() {
      if (isColumn()) {
        slider.classList.remove('is-scrollable');
        row.style.transform = '';
        index = 0;
        return;
      }
      slider.classList.toggle('is-scrollable', maxOffset() > 4);
      if (index > maxIndex()) index = maxIndex();
      apply(false);
    }

    if (prev) prev.addEventListener('click', function () { go(index - 1); });
    if (next) next.addEventListener('click', function () { go(index + 1); });

    /* drag / swipe */
    var dragging = false, startX = 0, startTx = 0, dx = 0;
    viewport.addEventListener('pointerdown', function (e) {
      if (isColumn()) return;
      dragging = true; startX = e.clientX; startTx = currentX(); dx = 0;
      row.classList.add('is-dragging');
      viewport.classList.add('is-grabbing');
      try { viewport.setPointerCapture(e.pointerId); } catch (err) {}
    });
    viewport.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      dx = e.clientX - startX;
      var x = Math.max(-maxOffset() - 80, Math.min(80, startTx + dx));
      row.style.transform = 'translateX(' + x + 'px)';
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      row.classList.remove('is-dragging');
      viewport.classList.remove('is-grabbing');
      go(Math.round(-currentX() / step()));
    }
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('click', function (e) {
      if (Math.abs(dx) > 8) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    refresh();
    window.addEventListener('resize', refresh);
    window.setTimeout(refresh, 400);
    window.setTimeout(refresh, 1200);
  }

  function initAll() {
    var nodes = document.querySelectorAll('.cspot__slider');
    for (var i = 0; i < nodes.length; i++) setup(nodes[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();
  document.addEventListener('shopify:section:load', initAll);
})();
