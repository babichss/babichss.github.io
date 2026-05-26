export default class HotkeyController {
  #keyMap = new Map();

  constructor() {
    window.addEventListener('keydown', (event) => {
      this.#getHandlers(event)?.forEach((handler) => handler(event));
    });
  }

  on(hotkeys, callback) {
    this.#add(hotkeys, window, callback);
  }

  scope(scope) {
    return {
      on: (hotkeys, callback) => this.#add(hotkeys, scope, callback)
    };
  }

  #add(hotkeys, scope, callback) {
    const list = Array.isArray(hotkeys) ? hotkeys : [hotkeys];

    for (const hotkey of list) {
      const keyMap = this.#keyMap.getOrInsert(hotkey.replaceAll(' ', ''), new Map());
      const handlers = keyMap.getOrInsert(scope, new Set());

      handlers.add(callback);
    }
  }

  #getHandlers(event) {
    const sequence = [event.code];

    if (event.shiftKey) {
      sequence.unshift('Shift');
    }

    if (event.metaKey || event.ctrlKey) {
      sequence.unshift('Ctrl');
    }
    const hotkey = sequence.join('+');

    if (!this.#keyMap.has(hotkey)) return;

    const scopes = this.#keyMap.get(hotkey);

    for (const scope of event.composedPath()) {
      if (scopes.has(scope)) {
        return scopes.get(scope);
      }
    }
  }
}
