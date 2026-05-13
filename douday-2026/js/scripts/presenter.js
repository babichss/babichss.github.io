import { ConnectionMessages } from './messages.js';

import {
  DeckElementAttributes,
  DeckElementEvents,
  ProgressElementAttributes
} from '../elements/constants.js';

import Messenger from './messenger.js';
import LocationHash from './location-hash.js';
import HotkeyController from './hotkey-controller.js';
/*---*/

const hash = new LocationHash();
const messenger = new Messenger();

const notes = document.getElementById('presenter-notes');
const deck = document.getElementById('previews');
const counter = document.querySelector('x-counter');

deck.addEventListener(DeckElementEvents.ActiveIndexChanged, ({ detail: index }) => {
  counter.setAttribute(ProgressElementAttributes.Value, index + 1);
});

messenger.listen(ConnectionMessages.activeSlideNameChanged, (id) => {
  hash.value = id;
});

const hotkeyController = new HotkeyController();

hotkeyController.on('ArrowRight', () => {
  messenger.broadcast(ConnectionMessages.DECK_NEXT_SLIDE);
});

hotkeyController.on('ArrowLeft', () => {
  messenger.broadcast(ConnectionMessages.DECK_PREV_SLIDE);
});

hotkeyController.on('Escape', () => {
  window.close();
});

hash.subscribe((value) => {
  notes.setAttribute(DeckElementAttributes.ActiveId, value);
  deck.setAttribute(DeckElementAttributes.ActiveId, value);
});

notes.setAttribute(DeckElementAttributes.ActiveId, hash.value);
deck.setAttribute(DeckElementAttributes.ActiveId, hash.value);
