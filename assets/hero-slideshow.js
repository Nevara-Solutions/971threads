/* 971threads — hero slideshow web component */
if (!customElements.get('hero-slideshow')) {
  customElements.define(
    'hero-slideshow',
    class extends HTMLElement {
      connectedCallback() {
        this.track = this.querySelector('.hero__track');
        this.slides = Array.from(this.querySelectorAll('.hero__slide'));
        this.dots = Array.from(this.querySelectorAll('.hero__dot'));
        this.index = 0;
        if (!this.track || this.slides.length <= 1) return;

        const prev = this.querySelector('.hero__arrow--prev');
        const next = this.querySelector('.hero__arrow--next');
        if (prev) prev.addEventListener('click', () => this.go(this.index - 1));
        if (next) next.addEventListener('click', () => this.go(this.index + 1));
        this.dots.forEach((dot, i) => dot.addEventListener('click', () => this.go(i)));

        this.speed = (parseInt(this.dataset.speed, 10) || 5) * 1000;
        this.auto =
          this.dataset.autoplay === 'true' &&
          !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (this.auto) {
          this.addEventListener('mouseenter', () => this.stop());
          this.addEventListener('mouseleave', () => this.start());
          this.start();
        }
      }

      disconnectedCallback() {
        this.stop();
      }

      go(i) {
        const n = this.slides.length;
        this.index = ((i % n) + n) % n;
        this.track.style.transform = 'translateX(-' + this.index * 100 + '%)';
        this.dots.forEach((d, j) => d.classList.toggle('is-active', j === this.index));
        if (this.auto) {
          this.stop();
          this.start();
        }
      }

      start() {
        this.timer = setInterval(() => this.go(this.index + 1), this.speed);
      }

      stop() {
        clearInterval(this.timer);
      }
    }
  );
}
