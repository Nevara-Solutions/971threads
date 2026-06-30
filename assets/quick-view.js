/* 971threads — Quick View modal.
   Delegated click on any [data-quick-view][data-product-url] opens a modal that fetches
   the product JSON ({handle}.js), lets the user pick a variant, and adds to cart via AJAX. */
(function () {
  if (window.__qvLoaded) return;
  window.__qvLoaded = true;

  var modal;

  function money(cents) {
    return 'Dhs. ' + (cents / 100).toFixed(2);
  }

  function build() {
    modal = document.createElement('div');
    modal.className = 'qv';
    modal.hidden = true;
    modal.innerHTML =
      '<div class="qv__overlay" data-qv-close></div>' +
      '<div class="qv__dialog" role="dialog" aria-modal="true" aria-label="Quick view">' +
      '<button class="qv__close" type="button" data-qv-close aria-label="Close">&times;</button>' +
      '<div class="qv__body"><p class="qv__loading">Loading…</p></div>' +
      '</div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function (e) {
      if (e.target.closest('[data-qv-close]')) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  function imgUrl(u) {
    if (!u) return '';
    if (u.indexOf('//') === 0) u = 'https:' + u;
    return u + (u.indexOf('?') > -1 ? '&' : '?') + 'width=900';
  }

  function render(p) {
    var body = modal.querySelector('.qv__body');
    var hasCompare = p.compare_at_price && p.compare_at_price > p.price;
    var firstAvail = (p.variants || []).filter(function (v) { return v.available; })[0] || (p.variants || [])[0] || {};

    var variantsHtml = '';
    if (p.variants && p.variants.length > 1) {
      variantsHtml = '<select class="qv__variant" aria-label="Variant">' +
        p.variants.map(function (v) {
          return '<option value="' + v.id + '" data-price="' + v.price + '"' + (v.available ? '' : ' disabled') + '>' +
            v.title + (v.available ? '' : ' — sold out') + '</option>';
        }).join('') + '</select>';
    }

    body.innerHTML =
      '<div class="qv__media">' + (p.featured_image ? '<img src="' + imgUrl(p.featured_image) + '" alt="' + p.title + '">' : '') + '</div>' +
      '<div class="qv__info">' +
      (p.vendor ? '<p class="qv__vendor">' + p.vendor + '</p>' : '') +
      '<h3 class="qv__title">' + p.title + '</h3>' +
      '<p class="qv__price"><span data-qv-price>' + money(firstAvail.price != null ? firstAvail.price : p.price) + '</span>' +
      (hasCompare ? ' <s class="qv__was">' + money(p.compare_at_price) + '</s>' : '') + '</p>' +
      '<div class="qv__desc">' + (p.description || '') + '</div>' +
      variantsHtml +
      '<button class="qv__add" type="button" data-variant="' + (firstAvail.id || '') + '"' + (firstAvail.available ? '' : ' disabled') + '>' +
      (firstAvail.available ? 'Add to cart' : 'Sold out') + '</button>' +
      '<a class="qv__full" href="' + p.url + '">View full details</a>' +
      '<p class="qv__msg" hidden></p>' +
      '</div>';

    var sel = body.querySelector('.qv__variant');
    var addBtn = body.querySelector('.qv__add');
    if (sel) {
      sel.addEventListener('change', function () {
        var opt = sel.options[sel.selectedIndex];
        addBtn.dataset.variant = sel.value;
        addBtn.disabled = opt.disabled;
        addBtn.textContent = opt.disabled ? 'Sold out' : 'Add to cart';
        body.querySelector('[data-qv-price]').textContent = money(parseInt(opt.dataset.price, 10));
      });
    }
    addBtn.addEventListener('click', function () { addToCart(addBtn, body); });
  }

  function addToCart(btn, body) {
    var id = btn.dataset.variant;
    if (!id) return;
    var msg = body.querySelector('.qv__msg');
    btn.disabled = true;
    btn.textContent = 'Adding…';
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id, quantity: 1 })
    })
      .then(function (r) { return r.json(); })
      .then(function () {
        btn.textContent = 'Added ✓';
        msg.hidden = false;
        msg.textContent = 'Added to your cart.';
        updateCartCount();
        setTimeout(function () { btn.disabled = false; btn.textContent = 'Add to cart'; }, 1600);
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = 'Add to cart';
        msg.hidden = false;
        msg.textContent = 'Could not add — please try again.';
      });
  }

  function updateCartCount() {
    fetch('/cart.js')
      .then(function (r) { return r.json(); })
      .then(function (c) {
        document.querySelectorAll('.cart-count-bubble span[aria-hidden="true"]').forEach(function (s) {
          s.textContent = c.item_count;
        });
      })
      .catch(function () {});
  }

  function openQuickView(url) {
    if (!modal) build();
    modal.querySelector('.qv__body').innerHTML = '<p class="qv__loading">Loading…</p>';
    openModal();
    fetch(url + '.js')
      .then(function (r) { return r.json(); })
      .then(render)
      .catch(function () {
        modal.querySelector('.qv__body').innerHTML = '<p class="qv__loading">Could not load this product.</p>';
      });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-quick-view]');
    if (!btn) return;
    e.preventDefault();
    openQuickView(btn.getAttribute('data-product-url'));
  });
})();
