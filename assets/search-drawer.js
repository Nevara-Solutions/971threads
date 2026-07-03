/*
  971threads — slide transition for the header search drawer.

  Dawn's DetailsModal flips <details open> on/off instantly. A closed <details>
  doesn't render its content, so there's no start frame to animate from — the panel
  just appears/vanishes. Dawn's menu drawer solves this by gating the visible state
  on a class added a frame AFTER opening, and by holding [open] during the close
  animation. We do the same here:

    - open:  after [open] is set, add `.search-open` next frame -> panel slides in.
    - close: remove `.search-open` -> panel slides out; keep [open] until the
             transition ends, THEN let DetailsModal actually close.

  We patch DetailsModal's prototype so every close path (Esc, overlay, outside
  click, summary re-click) animates. The close button captured the original
  close via .bind() at construction, so we re-point that one listener directly.
*/
(function () {
  if (typeof DetailsModal === 'undefined') return;

  var CLOSE_MS = 420;
  var proto = DetailsModal.prototype;
  var origOpen = proto.open;
  var origClose = proto.close;

  function isSearch(el) {
    return el.classList && el.classList.contains('header__search');
  }

  proto.open = function (event) {
    origOpen.call(this, event);
    if (!isSearch(this)) return;
    var el = this;
    // Two frames: let the panel paint at its off-screen start, then release the slide.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('search-open');
      });
    });
  };

  proto.close = function (focusToggle) {
    if (focusToggle === undefined) focusToggle = true;

    if (!isSearch(this) || !this.detailsContainer.hasAttribute('open')) {
      return origClose.call(this, focusToggle);
    }
    if (this._searchClosing) return;
    this._searchClosing = true;

    var el = this;
    var panel = this.querySelector('.search-modal__content');
    this.classList.remove('search-open'); // start the slide-out

    var done = function () {
      if (panel) panel.removeEventListener('transitionend', done);
      clearTimeout(el._searchCloseTimer);
      el._searchClosing = false;
      origClose.call(el, focusToggle); // now actually remove [open] + release focus
    };

    if (panel) panel.addEventListener('transitionend', done);
    el._searchCloseTimer = setTimeout(done, CLOSE_MS); // fallback if transitionend is missed
  };

  // Re-point the close button (its listener was bound to the ORIGINAL close at
  // construction time, so the prototype patch above doesn't reach it).
  function rebindCloseButtons() {
    document.querySelectorAll('details-modal.header__search').forEach(function (modal) {
      var btn = modal.querySelector('.search-modal__close-button');
      if (!btn || btn.dataset.slideBound) return;
      btn.dataset.slideBound = '1';
      var fresh = btn.cloneNode(true); // clone drops Dawn's old click listener
      btn.parentNode.replaceChild(fresh, btn);
      fresh.addEventListener('click', function () {
        modal.close();
      });
    });
  }

  // Make the header search PREDICTIVE-ONLY: it never navigates to the /search page.
  //  - Submitting the form (Enter or the magnifier button) does nothing.
  //  - Clicking a query suggestion fills the input instead of navigating.
  //  - The "Search for X" term link is hidden (CSS) and blocked here as a backstop.
  // Product results keep their normal links (clicking a product opens its page).
  function initSearchBehaviour() {
    document.querySelectorAll('details-modal.header__search').forEach(function (modal) {
      if (modal.dataset.searchBehaviour) return;
      modal.dataset.searchBehaviour = '1';

      var input = modal.querySelector('input[type="search"]');
      var form = input && input.form;

      if (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault();
        });
      }

      // Results are AJAX-injected, so delegate from the stable modal element.
      var suggestionSelector = '#predictive-search-results-queries-list .predictive-search__item';

      // Keep the input focused when a suggestion is clicked. Without this the input
      // blurs, PredictiveSearch.onFocusOut() fires, and the results close ("closes the sidebar").
      modal.addEventListener('mousedown', function (event) {
        if (event.target.closest(suggestionSelector)) event.preventDefault();
      });

      modal.addEventListener('click', function (event) {
        if (event.target.closest('.predictive-search__item--term')) {
          event.preventDefault();
          return;
        }
        var suggestion = event.target.closest(suggestionSelector);
        if (!suggestion || !input) return;
        event.preventDefault();
        var label =
          suggestion.querySelector('.predictive-search__item-query-result') ||
          suggestion.querySelector('.predictive-search__item-heading') ||
          suggestion;
        var text = (label.textContent || '').trim();
        if (!text) return;
        input.value = text;
        input.focus();
        input.dispatchEvent(new Event('input', { bubbles: true })); // re-run predictive search
      });
    });
  }

  function ready() {
    rebindCloseButtons();
    initSearchBehaviour();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }
})();
