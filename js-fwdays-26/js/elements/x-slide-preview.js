class XSlidePreview extends HTMLElement {
  #observer = new ResizeObserver(() => {
    // getBoundingClientRect provides size with applied scale
    const { width, height } = window.getComputedStyle(this);
    const scale = Math.min(parseFloat(width) / 1440, parseFloat(height) / 900);

    this.style.setProperty('--preview-content-scale', String(scale));
  });

  connectedCallback() {
    this.#observer.observe(this);
  }

  disconnectedCallback() {
    this.#observer.unobserve(this);
  }
}

customElements.define('x-slide-preview', XSlidePreview);
