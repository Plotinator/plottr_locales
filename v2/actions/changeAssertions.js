// Commentary: these assertions were originally designed to verify
// that the state of the store is valid after a big change; however,
// it's difficult to know when to check the new state of the store
// because many actions are asynchronous.
//
// Today, these assertions are still here because they're useful for
// tests.

import { identity, differenceBy } from 'lodash'

import selectors from '../selectors'

const {
  bookByIdSelector,
  allCardsSelector,
  beatByIdSelector,
  singleLineSelector,
  allLinesSelector,
  allBeatsAsArraySelector,
  allTagsSelector,
  allCharactersSelector,
  allNotesSelector,
  allPlacesSelector,
  allBeatsSelector,
  allHierarchyLevelsSelector,
  placeCustomAttributesSelector,
  noteCustomAttributesSelector,
  cardsCustomAttributesSelector,
  allBooksAsArraySelector,
  characterAttributesForBookSelector,
} = selectors(identity)

export const noDanglingCards = (_startingFullState, endingFullState) => {
  const allCards = allCardsSelector(endingFullState)
  return allCards.reduce((noneDangle, nextCard) => {
    // @ts-ignore
    const cardsBeat = beatByIdSelector(endingFullState, nextCard.beatId)
    // @ts-ignore
    const cardsLine = singleLineSelector(endingFullState, nextCard.lineId)
    return (
      noneDangle &&
      typeof cardsBeat?.bookId === 'number' &&
      typeof cardsLine?.bookId === 'number' &&
      cardsBeat?.bookId === cardsLine?.bookId
    )
  }, true)
}

export const noCardsRemoved = (startingFullState, endingFullState) => {
  const allCardsBefore = allCardsSelector(startingFullState)
  const allCardsAfter = allCardsSelector(endingFullState)
  return differenceBy(allCardsBefore, allCardsAfter, 'id').length === 0
}

export const noDanglingPlotlines = (_startingFullState, endingFullState) => {
  const allLines = allLinesSelector(endingFullState)
  return allLines.every((line) => {
    // @ts-ignore
    const linesBook = bookByIdSelector(endingFullState, line.bookId)
    return line.bookId === 'series' || typeof linesBook === 'object'
  })
}

export const noPlotlinesRemoved = (startingFullState, endingFullState) => {
  const allLinesBefore = allLinesSelector(startingFullState)
  const allLinesAfter = allLinesSelector(endingFullState)
  return differenceBy(allLinesBefore, allLinesAfter, 'id').length === 0
}

export const noDanglingBeats = (_startingFullState, endingFullState) => {
  const allBeats = allBeatsAsArraySelector(endingFullState)
  return allBeats.every((beat) => {
    const { bookId } = beat
    // @ts-ignore
    const book = bookByIdSelector(endingFullState, bookId)
    return bookId === 'series' || typeof book === 'object'
  })
}

export const noBeatsRemoved = (startingFullState, endingFullState) => {
  const allBeatsBefore = allBeatsAsArraySelector(startingFullState)
  const allBeatsAfter = allBeatsAsArraySelector(endingFullState)
  return differenceBy(allBeatsBefore, allBeatsAfter, 'id').length === 0
}

export const noNotesRemoved = (startingFullState, endingFullState) => {
  const allNotesBefore = allNotesSelector(startingFullState)
  const allNotesAfter = allNotesSelector(endingFullState)
  return differenceBy(allNotesBefore, allNotesAfter, 'id').length === 0
}

export const noPlacesRemoved = (startingFullState, endingFullState) => {
  const allPlacesBefore = allPlacesSelector(startingFullState)
  const allPlacesAfter = allPlacesSelector(endingFullState)
  return differenceBy(allPlacesBefore, allPlacesAfter, 'id').length === 0
}

export const noCharactersRemoved = (startingFullState, endingFullState) => {
  const allCharactersBefore = allCharactersSelector(startingFullState)
  const allCharactersAfter = allCharactersSelector(endingFullState)
  return differenceBy(allCharactersBefore, allCharactersAfter, 'id').length === 0
}

export const noTagsRemoved = (startingFullState, endingFullState) => {
  const allTagsBefore = allTagsSelector(startingFullState)
  const allTagsAfter = allTagsSelector(endingFullState)
  return differenceBy(allTagsBefore, allTagsAfter, 'id').length === 0
}

export const hierarchyConfigMatchesBeatDepthForEachBook = (_startingFullState, endingFullState) => {
  const allBeatsByBook = allBeatsSelector(endingFullState)
  const allHierarchiesByBook = allHierarchyLevelsSelector(endingFullState)
  return Object.entries(allBeatsByBook).every((beatTreeEntry) => {
    const [bookId, beatTree] = beatTreeEntry
    function maxDepth(id) {
      return (
        1 +
        beatTree.children[id].reduce((max, childId) => {
          return Math.max(max, maxDepth(childId))
        }, 0)
      )
    }
    const maxBeatTreeDepth = maxDepth('null') - 1
    const hierarchyConfigDepth = Object.values(allHierarchiesByBook[bookId]).length
    return maxBeatTreeDepth <= hierarchyConfigDepth
  })
}

// NOTE: character attributes are automatically migrated to the new
// per-book schema and verified whenever we save.
export const allTextCustomAttributeTypesHaveValidValues = (_startingFullState, endingFullState) => {
  const typeIsText = ({ type }) => type === 'text'

  const allPlaceCustomAttributes = placeCustomAttributesSelector(endingFullState)
  const allTextTypePlaceCustomAttributes = allPlaceCustomAttributes.filter(typeIsText)
  const allPlaces = allPlacesSelector(endingFullState)
  const allPlaceAttributesAreGood = allPlaces.every((place) => {
    return allTextTypePlaceCustomAttributes.every(({ name }) => {
      return typeof place[name] === 'string' || typeof place[name] === 'undefined'
    })
  })

  const allNoteCustomAttributes = noteCustomAttributesSelector(endingFullState)
  const allTextTypeNoteCustomAttributes = allNoteCustomAttributes.filter(typeIsText)
  const allNotes = allNotesSelector(endingFullState)
  const allNoteAttributesAreGood = allNotes.every((note) => {
    return allTextTypeNoteCustomAttributes.every(({ name }) => {
      return typeof note[name] === 'string' || typeof note[name] === 'undefined'
    })
  })

  const allCardCustomAttributes = cardsCustomAttributesSelector(endingFullState)
  const allTextTypeCardCustomAttributes = allCardCustomAttributes.filter(typeIsText)
  const allCards = allCardsSelector(endingFullState)
  const allCardAttributesAreGood = allCards.every((card) => {
    return allTextTypeCardCustomAttributes.every(({ name }) => {
      return typeof card[name] === 'string' || typeof card[name] === 'undefined'
    })
  })

  return allPlaceAttributesAreGood && allNoteAttributesAreGood && allCardAttributesAreGood
}

export const allEntityToEntityAssociationsAreValid = (_startingFullState, endingFullState) => {
  const allCards = allCardsSelector(endingFullState)
  const allCharacters = allCharactersSelector(endingFullState)
  const allPlaces = allPlacesSelector(endingFullState)
  const allTags = allTagsSelector(endingFullState)
  const allNotes = allNotesSelector(endingFullState)
  const allBooks = allBooksAsArraySelector(endingFullState)

  const withId = (id) => (entity) => id === entity.id

  const allCardRelationshipsExist = allCards.every(({ tags, characters, places }) => {
    return (
      tags.every((tagId) => {
        return allTags.find(withId(tagId))
      }) &&
      characters.every((characterId) => {
        return allCharacters.find(withId(characterId))
      }) &&
      places.every((placeId) => {
        return allPlaces.find(withId(placeId))
      })
    )
  })
  const allPlaceRelationshipsExist = allPlaces.every(({ noteIds, tags, bookIds }) => {
    return (
      tags.every((tagId) => {
        return allTags.find(withId(tagId))
      }) &&
      noteIds.every((noteId) => {
        return allNotes.find(withId(noteId))
      }) &&
      bookIds.every((bookId) => {
        return allBooks.find(withId(bookId))
      })
    )
  })
  const allNoteRelationshipsExist = allNotes.every(({ tags, characters, places, bookIds }) => {
    return (
      tags.every((tagId) => {
        return allTags.find(withId(tagId))
      }) &&
      characters.every((characterId) => {
        return allCharacters.find(withId(characterId))
      }) &&
      bookIds.every((bookId) => {
        return allBooks.find(withId(bookId))
      }) &&
      places.every((placeId) => {
        return allPlaces.find(withId(placeId))
      })
    )
  })
  const allCharacterAttributes = characterAttributesForBookSelector(endingFullState)
  const tagAttributes = allCharacterAttributes.filter(({ type, name }) => {
    return type === 'base-attribute' && name === 'tags'
  })
  const allCharacterRelationshipsExist = allCharacters.every(({ attributes }) => {
    return attributes.every(({ id, value }) => {
      return !tagAttributes.find(withId(id)) || allTags.find(withId(value))
    })
  })

  return (
    allCardRelationshipsExist &&
    allPlaceRelationshipsExist &&
    allNoteRelationshipsExist &&
    allCharacterRelationshipsExist
  )
}

export const allValidations = {
  noDanglingCards,
  noCardsRemoved,
  noDanglingPlotlines,
  noPlotlinesRemoved,
  noDanglingBeats,
  noBeatsRemoved,
  noNotesRemoved,
  noPlacesRemoved,
  noCharactersRemoved,
  noTagsRemoved,
  hierarchyConfigMatchesBeatDepthForEachBook,
  allTextCustomAttributeTypesHaveValidValues,
  allEntityToEntityAssociationsAreValid,
}

const validateFullFileAfterChange =
  (validations = allValidations) =>
  (startingFullState, endingFullState) => {
    return Object.entries(validations).reduce(
      (result, nextAssertion) => {
        const [assertionName, assertionFunction] = nextAssertion
        const { failures, passes, isValid } = result
        const nextAssertionPasses = assertionFunction(startingFullState, endingFullState)
        if (nextAssertionPasses) {
          return {
            failures,
            passes: [assertionName, ...passes],
            isValid,
          }
        } else {
          return {
            failures: [assertionName, ...failures],
            passes: passes,
            isValid: false,
          }
        }
      },
      {
        failures: [],
        passes: [],
        isValid: true,
      }
    )
  }

export default validateFullFileAfterChange
