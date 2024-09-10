import { createSelector } from 'reselect'

import { allCardsSelector } from './cardsFirstOrder'
import { allCharactersSelector } from './charactersFirstOrder'
import { allNotesSelector } from './notesFirstOrder'
import { allPlacesSelector } from './placesFirstOrder'

const filterTypeSelector = (_state, type) => type
export const filterItemsSelector = createSelector(
  allCardsSelector,
  allCharactersSelector,
  allNotesSelector,
  allPlacesSelector,
  filterTypeSelector,
  (cards, characters, notes, places, type) => {
    switch (type) {
      case 'outline':
      case 'cards': {
        return cards
      }
      case 'characters': {
        return characters
      }
      case 'notes': {
        return notes
      }
      case 'places': {
        return places
      }
      default: {
        return []
      }
    }
  }
)
