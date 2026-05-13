import { SlideNavigationAttributes, SlideNavigationCommands } from './constants.js';

const commands = new Set([
  SlideNavigationCommands.Left,
  SlideNavigationCommands.Right,
  SlideNavigationCommands.Up,
  SlideNavigationCommands.Down
]);

const Selectors = {
  SlideById: (id) => `:scope > [data-id="${CSS.escape(id)}"]`
};

const $selectedId = Symbol('selectedId');
const $rowSize = Symbol('rowSize');

class XDeckNav extends HTMLElement {
  static observedAttributes = [SlideNavigationAttributes.ActiveId];

  #resizeObserver = new ResizeObserver(() => this.#cache.delete($rowSize));
  #cache = new Map();

  get #rowSize() {
    return this.#cache.getOrInsertComputed($rowSize, () => {
      const children = [...this.children];
      if (children.length === 0) return 0;

      // Measure lazily because the drawer is laid out only after its dialog opens.
      const firstTop = children[0].offsetTop;
      const index = children.findIndex((element) => element.offsetTop !== firstTop);

      return index === -1 ? children.length : index;
    });
  }

  get #selectedId() {
    return this.#cache.get($selectedId);
  }

  set #selectedId(id) {
    if (!this.querySelector(Selectors.SlideById(id))) return;

    this.#cache.set($selectedId, id);

    this.querySelector(Selectors.SlideById(id)).focus();
  }

  connectedCallback() {
    this.#resizeObserver.observe(this);

    this.addEventListener('pointermove', this.#onPointerMove);
    this.addEventListener('command', this.#onCommandEvent);
  }

  disconnectedCallback() {
    this.#resizeObserver.disconnect();

    this.removeEventListener('pointermove', this.#onPointerMove);
    this.removeEventListener('command', this.#onCommandEvent);
  }

  attributeChangedCallback(__, prev, next) {
    if (prev === next) return;

    const target = this.querySelector(Selectors.SlideById(next)) || this.children.item(0);

    if (!target) return;

    this.#selectedId = target.dataset.id;
    this.querySelector(Selectors.SlideById(prev))?.classList.remove('current');
    this.querySelector(Selectors.SlideById(this.#selectedId))?.classList.add('current');
  }

  #onPointerMove = ({ target }) => {
    if (!(target instanceof Element)) return;

    this.#selectedId = target.closest('a')?.dataset.id;
  };

  #onCommandEvent = ({ command }) => {
    if (!commands.has(command)) return;
    const selected = this.querySelector(Selectors.SlideById(this.#selectedId));

    if (command === SlideNavigationCommands.Right) {
      this.#selectedId = selected?.nextElementSibling?.dataset.id;
    }

    if (command === SlideNavigationCommands.Left) {
      this.#selectedId = selected?.previousElementSibling?.dataset.id;
    }

    if (command === SlideNavigationCommands.Down) {
      this.#hopRow(+1);
    }

    if (command === SlideNavigationCommands.Up) {
      this.#hopRow(-1);
    }
  };

  #hopRow(delta) {
    if (delta === 0) return;

    const index = Number(this.querySelector(Selectors.SlideById(this.#selectedId))?.dataset.index);
    const nextIndex = index + this.#rowSize * delta;

    if (nextIndex < 0 || nextIndex >= this.children.length) return;

    const item = this.children.item(nextIndex);

    if (!item) return;

    this.#selectedId = item.dataset.id;
  }
}

customElements.define('x-deck-nav', XDeckNav);
