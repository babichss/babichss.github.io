const ConnectionScope = 'connection';
const DeckScope = 'deck';

export const ConnectionMessages = {
  DECK_NEXT_SLIDE: `${ConnectionScope}:${DeckScope}:next`,
  DECK_PREV_SLIDE: `${ConnectionScope}:${DeckScope}:prev`,
  activeSlideNameChanged: `${ConnectionScope}:${DeckScope}:name`
};
