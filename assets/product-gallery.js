/*
  971threads custom product gallery.
  Vertical thumbnails (desktop, left) / horizontal thumbnails (mobile, below),
  a transform-based main carousel with arrows, thumbnail switching, pointer swipe,
  and a fullscreen zoom lightbox. Products here use size-only variants that share the
  same images, so no variant-to-image sync is needed.
*/
class ProductGallery extends HTMLElement {
  connectedCallback() {
    this.track = this.querySelector('.pgal__track');
    this.viewport = this.querySelector('.pgal__viewport');
    this.slides = Array.from(this.querySelectorAll('.pgal__slide'));
    this.thumbs = Array.from(this.querySelectorAll('.pgal__thumb'));
    this.count = this.slides.length;
    this.index = 0;
    if (!this.count) return;

    this.querySelector('.pgal__arrow--prev')?.addEventListener('click', () => this.go(this.index - 1));
    this.querySelector('.pgal__arrow--next')?.addEventListener('click', () => this.go(this.index + 1));
    this.thumbs.forEach((t, i) => {
      t.addEventListener('click', () => this.go(i));
      t.addEventListener('mouseenter', () => this.go(i)); // hover-to-preview like the reference
    });

    // lightbox
    this.lightbox = this.querySelector('.pgal__lightbox');
    this.lbTrack = this.querySelector('.pgal__lightbox-track');
    this.querySelector('.pgal__zoom')?.addEventListener('click', () => this.openLightbox());
    this.querySelector('.pgal__lightbox-close')?.addEventListener('click', () => this.closeLightbox());
    this.querySelector('.pgal__lightbox-prev')?.addEventListener('click', () => this.go(this.index - 1));
    this.querySelector('.pgal__lightbox-next')?.addEventListener('click', () => this.go(this.index + 1));
    this.lightbox?.addEventListener('click', (e) => { if (e.target === this.lightbox) this.closeLightbox(); });
    document.addEventListener('keydown', (e) => this.onKey(e));

    this.addSwipe(this.viewport);
    if (this.lightbox) this.addSwipe(this.querySelector('.pgal__lightbox-viewport'));

    window.addEventListener('resize', () => this.apply(false));
    this.apply(false);
  }

  isOpen() {
    return this.lightbox && this.lightbox.getAttribute('aria-hidden') === 'false';
  }

  onKey(e) {
    if (this.isOpen()) {
      if (e.key === 'Escape') this.closeLightbox();
      else if (e.key === 'ArrowRight') this.go(this.index + 1);
      else if (e.key === 'ArrowLeft') this.go(this.index - 1);
    }
  }

  go(i) {
    this.index = (i + this.count) % this.count;
    this.apply(true);
  }

  apply(animate) {
    const t = animate ? 'transform 0.4s cubic-bezier(0.4,0,0.2,1)' : 'none';
    const x = `translateX(-${this.index * 100}%)`;
    if (this.track) { this.track.style.transition = t; this.track.style.transform = x; }
    if (this.lbTrack) { this.lbTrack.style.transition = t; this.lbTrack.style.transform = x; }
    this.thumbs.forEach((th, i) => th.classList.toggle('is-active', i === this.index));
    const active = this.thumbs[this.index];
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }

  addSwipe(el) {
    if (!el) return;
    let startX = 0, dx = 0, dragging = false, target = null;
    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true; startX = e.clientX; dx = 0;
      target = el.classList.contains('pgal__lightbox-viewport') ? this.lbTrack : this.track;
      if (target) target.style.transition = 'none';
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
    });
    el.addEventListener('pointermove', (e) => {
      if (!dragging || !target) return;
      dx = e.clientX - startX;
      target.style.transform = `translateX(calc(-${this.index * 100}% + ${dx}px))`;
    });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(dx) > 40) this.go(this.index + (dx < 0 ? 1 : -1));
      else this.apply(true);
      dx = 0;
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('pointerleave', end);
  }

  openLightbox() {
    if (!this.lightbox) return;
    this.lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');
    this.apply(false);
  }

  closeLightbox() {
    if (!this.lightbox) return;
    this.lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overflow-hidden');
  }
}
customElements.define('product-gallery', ProductGallery);
