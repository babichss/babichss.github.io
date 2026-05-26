const $hash = Symbol('hash');
export default class LocationHash {
  #cache = new Map();
  #handlers = new Set();

  get value() {
    return this.#cache.getOrInsertComputed($hash, () => location.hash.slice(1));
  }

  set value(hash) {
    if (this.value === hash) return;
    this.#cache.delete($hash);
    location.hash = hash;
  }

  constructor() {
    window.addEventListener('hashchange', () => {
      this.#cache.delete($hash);
      this.#handlers.forEach((callback) => callback(this.value));
    });
  }

  subscribe(handler) {
    this.#handlers.add(handler);
  }
}
