export const filterItemsSelector = (state, type) => {
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
}
