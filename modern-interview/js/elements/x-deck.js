import {
  DeckCommands,
  DeckElementAttributes as Attributes,
  DeckElementEvents,
  VIEW_TRANSITION_ENABLED
} from './constants.js';

const Selectors = {
  Visible: ':scope > [data-id]:not([hidden])',
  Slide: ':scope > [data-id]',
  SlideById: (id) => `:scope > [data-id="${CSS.escape(id)}"]`
};

const commands = new Set([DeckCommands.Next, DeckCommands.Prev]);

const $visibleSlideCount = Symbol('visibleSlideCount');

export class XDeck extends HTMLElement {
  #cache = new Map();

  static get observedAttributes() {
    return [Attributes.ActiveId, Attributes.VisibleCount];
  }

  get #isViewTransitionEnabled() {
    return VIEW_TRANSITION_ENABLED && this.hasAttribute(Attributes.EnableViewTransition);
  }

  get #activeSlideElement() {
    const activeId = this.getAttribute(Attributes.ActiveId);
    if (!activeId) return null;

    return this.querySelector(Selectors.SlideById(activeId));
  }

  get #visibleSlideCount() {
    return this.#cache.getOrInsertComputed($visibleSlideCount, () => {
      const count = Number(this.getAttribute(Attributes.VisibleCount));
      return Number.isFinite(count) && count >= 1 ? Math.floor(count) : 1;
    });
  }

  connectedCallback() {
    this.addEventListener('command', this.#onCommandEvent);
  }

  disconnectedCallback() {
    this.removeEventListener('command', this.#onCommandEvent);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    const activeId = this.getAttribute(Attributes.ActiveId);

    switch (name) {
      case Attributes.ActiveId:
        if (!activeId || !this.querySelector(Selectors.SlideById(activeId))) {
          const slide = this.querySelector(Selectors.Slide);
          if (!slide) {
            this.removeAttribute(Attributes.ActiveId);
            return;
          }
          this.setAttribute(Attributes.ActiveId, slide.dataset.id);
          return;
        }

        this.#updateVisibleSlides();
        this.#dispatch(DeckElementEvents.ActiveIdChanged, activeId);
        break;

      case Attributes.VisibleCount:
        this.#cache.delete($visibleSlideCount);
        this.#updateVisibleSlides();
        break;

      default:
        return;
    }
  }

  #onCommandEvent = ({ command }) => {
    if (!commands.has(command)) return;

    let target;

    if (command === DeckCommands.Next) {
      target = this.#activeSlideElement?.nextElementSibling;
    }

    if (command === DeckCommands.Prev) {
      target = this.#activeSlideElement?.previousElementSibling;
    }

    if (!target) return;

    this.setAttribute(Attributes.ActiveId, target.dataset.id);
  };

  #updateVisibleSlides() {
    const target = this.querySelector(Selectors.SlideById(this.getAttribute(Attributes.ActiveId)));
    if (!target) return;

    const update = () => {
      for (const item of this.querySelectorAll(Selectors.Visible)) {
        this.#setSlideVisibility(item, false);
      }

      let current = target;
      let counter = 0;
      while (current && counter < this.#visibleSlideCount) {
        this.#setSlideVisibility(current, true);
        current = current.nextElementSibling;
        counter++;
      }

      this.#dispatch(DeckElementEvents.ActiveIndexChanged, Number(target.dataset.index));
    };

    if (!this.#isViewTransitionEnabled) {
      update();
      return;
    }

    document.startViewTransition(update);
  }

  #setSlideVisibility(item, isVisible) {
    item.inert = item.hidden = item.ariaHidden = !isVisible;
  }

  #dispatch(eventName, detail) {
    this.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
}

customElements.define('x-deck', XDeck);
