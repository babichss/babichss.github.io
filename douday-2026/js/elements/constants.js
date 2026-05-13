export const VIEW_TRANSITION_ENABLED = typeof document.startViewTransition === 'function';

export const DeckElementAttributes = {
  ActiveId: 'active-id',
  VisibleCount: 'visible-count',
  EnableViewTransition: 'enable-view-transition'
};

export const DeckElementEvents = {
  ActiveIndexChanged: 'active-index-changed',
  ActiveIdChanged: 'active-id-changed'
};

export const DeckCommands = {
  Next: '--next',
  Prev: '--prev'
};

export const SlideNavigationCommands = {
  Left: '--left',
  Right: '--right',
  Up: '--up',
  Down: '--down'
};

export const ProgressElementAttributes = {
  Value: 'value',
  Max: 'max'
};

export const SlideNavigationAttributes = {
  ActiveId: 'active-id'
};
