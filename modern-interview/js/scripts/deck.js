import { ConnectionMessages } from './messages.js';

import HotkeyController from './hotkey-controller.js';
import LocationHash from './location-hash.js';
import Messenger from './messenger.js';

import {
  DeckCommands,
  DeckElementAttributes,
  DeckElementEvents,
  ProgressElementAttributes,
  SlideNavigationAttributes,
  SlideNavigationCommands
} from '../elements/constants.js';

/*---*/
const hash = new LocationHash();
const messages = new Messenger();

const deck = document.getElementById('deck');
const counter = document.querySelector('x-counter');
const overlay = document.getElementById('overlay');
const deckNavigation = document.getElementById('drawer');

const makeCommand = (command) => new CommandEvent('command', { command });

const goToNextSlide = () => deck.dispatchEvent(makeCommand(DeckCommands.Next));
const goToPrevSlide = () => deck.dispatchEvent(makeCommand(DeckCommands.Prev));

const broadcastActiveSlide = () => {
  messages.broadcast(ConnectionMessages.activeSlideNameChanged, hash.value);
};

function syncActiveSlide(slideId) {
  deck.setAttribute(DeckElementAttributes.ActiveId, slideId);
  deckNavigation.setAttribute(SlideNavigationAttributes.ActiveId, slideId);

  broadcastActiveSlide();
}

/*---*/
deck.addEventListener(DeckElementEvents.ActiveIndexChanged, ({ detail: index }) => {
  counter.setAttribute(ProgressElementAttributes.Value, index + 1);
});

deck.addEventListener(DeckElementEvents.ActiveIdChanged, ({ detail }) => {
  hash.value = detail;
});

/*---*/
hash.subscribe((value) => {
  if (overlay.open) {
    overlay.hidden = true;
    overlay.close();
  }

  syncActiveSlide(value);
});

/*---*/
messages.listen(ConnectionMessages.DECK_NEXT_SLIDE, goToNextSlide);
messages.listen(ConnectionMessages.DECK_PREV_SLIDE, goToPrevSlide);

/*---*/
const hotkeys = new HotkeyController();

hotkeys.on(['ArrowRight', 'Space'], goToNextSlide);
hotkeys.on(['ArrowLeft', 'Shift + Space'], goToPrevSlide);

hotkeys.on('KeyF', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

hotkeys.on('KeyS', () => {
  if (document.fullscreenElement) return;
  const url = new URL('./presenter.html', window.location.href);

  url.hash = hash.value;

  window.open(url.toString(), null, 'popup=true,width=1440,height=900');

  broadcastActiveSlide();
});

hotkeys.on('KeyM', (event) => {
  event.preventDefault();

  if (overlay.open) {
    overlay.close();
    return;
  }

  overlay.hidden = false;
  overlay.showModal();

  requestAnimationFrame(() => deckNavigation.focus());
});

const navigationHotkeys = hotkeys.scope(deckNavigation);

navigationHotkeys.on('ArrowRight', () => {
  deckNavigation.dispatchEvent(makeCommand(SlideNavigationCommands.Right));
});

navigationHotkeys.on('ArrowDown', () => {
  deckNavigation.dispatchEvent(makeCommand(SlideNavigationCommands.Down));
});

navigationHotkeys.on('ArrowLeft', () => {
  deckNavigation.dispatchEvent(makeCommand(SlideNavigationCommands.Left));
});

navigationHotkeys.on('ArrowUp', () => {
  deckNavigation.dispatchEvent(makeCommand(SlideNavigationCommands.Up));
});

/*---*/
syncActiveSlide(hash.value);
