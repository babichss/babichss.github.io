const regex = /^\/+|\/[^/]*\.html$|\/+$/g;
const channelName = `slide-deck:presenter:${location.pathname.replace(regex, '')}`;

export default class Messenger {
  #listeners = new Map();
  #channel = new BroadcastChannel(channelName);

  constructor() {
    this.#channel.onmessage = ({ data }) => {
      const { type, payload } = data;
      this.#listeners.get(type)?.forEach((callback) => callback(payload));
    };
  }

  listen(type, callback) {
    this.#listeners.getOrInsert(type, new Set()).add(callback);
  }

  broadcast(type, payload = null) {
    this.#channel.postMessage({ type, payload });
  }
}
