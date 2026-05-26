import { ProgressElementAttributes } from './constants.js';

class XCounter extends HTMLElement {
  static observedAttributes = [ProgressElementAttributes.Value, ProgressElementAttributes.Max];

  attributeChangedCallback(name, prev, next) {
    if (prev === next) return;

    this.#update();
  }

  #update() {
    const value = Number(this.getAttribute(ProgressElementAttributes.Value)) || 0;
    this.textContent = `${value} / ${this.getAttribute(ProgressElementAttributes.Max)}`;
  }
}

customElements.define('x-counter', XCounter);
