/* 971threads — countdown timer */
(function () {
  if (window.__cdLoaded) return;
  window.__cdLoaded = true;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function run(el) {
    var end = new Date(el.dataset.end).getTime();
    if (isNaN(end)) return;
    var d = el.querySelector('[data-days]');
    var h = el.querySelector('[data-hours]');
    var m = el.querySelector('[data-minutes]');
    var s = el.querySelector('[data-seconds]');

    function update() {
      var diff = end - Date.now();
      if (diff < 0) diff = 0;
      var t = Math.floor(diff / 1000);
      if (d) d.textContent = pad(Math.floor(t / 86400));
      if (h) h.textContent = pad(Math.floor((t % 86400) / 3600));
      if (m) m.textContent = pad(Math.floor((t % 3600) / 60));
      if (s) s.textContent = pad(t % 60);
    }
    update();
    setInterval(update, 1000);
  }

  function initAll() {
    var nodes = document.querySelectorAll('[data-countdown]');
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].dataset.cdReady) continue;
      nodes[i].dataset.cdReady = '1';
      run(nodes[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
  document.addEventListener('shopify:section:load', initAll);
})();
