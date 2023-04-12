// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.
import { createSelector } from 'reselect'

import { fullFileStateSelector } from './fullFileFirstOrder'

export const filterItemsSelector = createSelector(fullFileStateSelector, (state, type) => {
  switch (type) {
    case 'outline':
    case 'cards': {
      return state.cards
    }
    case 'characters': {
      return state.characters
    }
    case 'notes': {
      return state.notes
    }
    case 'places': {
      return state.places
    }
    default: {
      return []
    }
  }
})
