import { isEqual } from 'lodash'
import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect'
import { serializeNoFormatting } from '../slate_serializers/to_plain_text'

// Other selector dependencies
import { allBookIdsSelector, allBooksAsArraySelector } from './booksFirstOrder'
import { selectedCharacterAttributeTabSelector, showBookTabsSelector } from './charactersThirdOrder'
import { characterTabSelector, selectedCharacterSelector, uiSelector } from './secondOrder'
import { seriesSelector } from './seriesFirstOrder'
import { card, place, note } from '../store/initialState'
import { allLinesSelector } from './linesFirstOrder'
import {
  characterCustomAttributesSelector,
  cardsCustomAttributesSelector,
  noteCustomAttributesSelector,
  placeCustomAttributesSelector,
} from './customAttributesFirstOrder'
import { allBeatsSelector } from './beatsFirstOrder'
import { createAggressiveDeepEqualSelector } from './createDeepEqualSelector'
import { escapeUIPathElement } from '../helpers/ui'

export const cardDialogSelector = createSelector(uiSelector, ({ cardDialog }) => {
  return cardDialog
})
export const bookDialogSelector = createSelector(uiSelector, ({ bookDialog }) => {
  return bookDialog
})

export const cardDialogCardIdSelector = createSelector(cardDialogSelector, (cardDialog) => {
  return cardDialog?.cardId
})
export const cardDialogLineIdSelector = createSelector(cardDialogSelector, (cardDialog) => {
  return cardDialog?.lineId
})
export const cardDialogBeatIdSelector = createSelector(cardDialogSelector, (cardDialog) => {
  return cardDialog?.beatId
})
export const isCardDialogVisibleSelector = createSelector(cardDialogSelector, (cardDialog) => {
  return cardDialog?.isOpen
})

export const isBookDialogVisibleSelector = createSelector(bookDialogSelector, (bookDialog) => {
  return bookDialog?.isOpen
})

export const bookDialogBookIdSelector = createSelector(bookDialogSelector, (bookDialog) => {
  return bookDialog?.bookId
})

export const bookNumberSelector = createSelector(
  allBookIdsSelector,
  bookDialogBookIdSelector,
  (allBookIds, bookDialogBookId) => {
    if (bookDialogBookId) {
      return allBookIds.indexOf(bookDialogBookId) + 1
    }

    return allBookIds.length + 1
  }
)

export const outlineScrollPositionSelector = createSelector(
  uiSelector,
  ({ outlineScrollPosition }) => outlineScrollPosition
)

export const restructureModalOpenSelector = createSelector(
  uiSelector,
  ({ resturctureTimelineModal }) => {
    return !!resturctureTimelineModal?.open
  }
)

export const characterAttributesDialogOpenSelector = createSelector(
  characterTabSelector,
  ({ attributesDialogOpen }) => {
    return attributesDialogOpen
  }
)
export const characterCategoriesDialogOpenSelector = createSelector(
  characterTabSelector,
  ({ categoriesDialogOpen }) => {
    return categoriesDialogOpen
  }
)
export const editingSelectedCharacterSelector = createSelector(
  characterTabSelector,
  ({ editingSelected }) => {
    return editingSelected
  }
)
export const characterTemplatePickerVisibleSelector = createSelector(
  characterTabSelector,
  ({ showTemplatePicker }) => {
    return showTemplatePicker
  }
)
export const creatingCharacterSelector = createSelector(characterTabSelector, ({ creating }) => {
  return creating
})
export const characterTemplateDataSelector = createSelector(
  characterTabSelector,
  ({ templateData }) => {
    return templateData
  }
)
export const characterFilterVisibleSelector = createSelector(
  characterTabSelector,
  ({ filterVisible }) => {
    return filterVisible
  }
)
export const characterSortVisibleSelector = createSelector(
  characterTabSelector,
  ({ sortVisible }) => {
    return sortVisible
  }
)
export const characterDetailsVisible = createSelector(
  characterTabSelector,
  ({ detailsVisible }) => {
    if (typeof detailsVisible === 'undefined') {
      return true
    }

    return detailsVisible
  }
)
export const characterEditorSelector = createSelector(
  characterTabSelector,
  ({ characterEditor }) => {
    return characterEditor || {}
  }
)
export const characterEditorIsDeletingSelector = createSelector(
  characterEditorSelector,
  ({ deleting }) => {
    return deleting
  }
)
export const characterEditorIsRemovingTemplateSelector = createSelector(
  characterEditorSelector,
  ({ removing }) => {
    return removing
  }
)
export const characterEditorTemplateBeingRemovedSelector = createSelector(
  characterEditorSelector,
  ({ removeWhichTemplate }) => {
    return removeWhichTemplate
  }
)
export const characterEditorActiveTabSelector = createSelector(
  characterEditorSelector,
  ({ activeTab }) => {
    return activeTab ?? 1
  }
)
export const characterEditorShowTemplatePickerSelector = createSelector(
  characterEditorSelector,
  ({ showTemplatePicker }) => {
    return showTemplatePicker
  }
)
export const characterFociSelector = createSelector(characterTabSelector, ({ focus }) => {
  return focus || []
})
const characterAttributeTabSelector = createSelector(
  selectedCharacterAttributeTabSelector,
  showBookTabsSelector,
  (selectedTab, showTabs) => {
    return !showTabs ? 'all' : selectedTab
  }
)
export const characterCurrentFociSelector = createSelector(
  characterFociSelector,
  selectedCharacterSelector,
  characterAttributeTabSelector,
  (foci, characterId, characterTab) => {
    return foci.filter((focus) => {
      return (
        focus.path[1] === characterId &&
        (focus.path.length === 3 ||
          (focus.path.length === 4 && focus.path[3] === characterTab) ||
          (focus.path.length === 6 && focus.path[5] === characterTab) ||
          (focus.path.length === 5 && focus.path[4] === characterTab))
      )
    })
  }
)

export const searchDialogSelector = createSelector(uiSelector, ({ searchDialog }) => {
  return searchDialog || {}
})
export const searchDialogIsOpenSelector = createSelector(searchDialogSelector, ({ isOpen }) => {
  return isOpen
})
export const isJumpingSelector = createSelector(searchDialogSelector, ({ jumping }) => {
  return jumping
})
export const searchDialogSearchTermSelector = createSelector(searchDialogSelector, ({ term }) => {
  return term
})
export const searchDialogCurrentHitIndexSelector = createSelector(
  searchDialogSelector,
  ({ currentHitIndex }) => {
    return currentHitIndex
  }
)
export const searchDialogIsScanningSelector = createSelector(
  searchDialogSelector,
  ({ scanning }) => {
    return scanning
  }
)
export const searchDialogIsReplacingSelector = createSelector(
  searchDialogSelector,
  ({ replacing }) => {
    return replacing
  }
)
export const searchReplacementTextSelector = createSelector(
  searchDialogSelector,
  ({ replacement }) => {
    return replacement
  }
)
export const hitsMarkedForReplacementSelector = createSelector(
  searchDialogSelector,
  ({ hitsToReplace }) => {
    return hitsToReplace || []
  }
)
export const searchModalReplaceWordSelector = createSelector(
  searchDialogSelector,
  ({ replaceWord }) => {
    return replaceWord
  }
)

const literalRegExp = (unescapedTerm, replaceWord) => {
  const flags = [...unescapedTerm].some((c) => c.match(/\w/) && c.toLocaleUpperCase() === c)
    ? 'g'
    : 'gi'
  return new RegExp(
    (replaceWord ? '(?:^|\\W)(?<term>' : '') +
      unescapedTerm.replace(/[\\[\](){}$^\-.*+?|/]/g, '\\$&') +
      (replaceWord ? ')(?:$|\\W)' : ''),
    flags
  )
}

const HIT_LIMIT = 30
const hits = (pathSansPosition, regexMatches) => {
  const results = []
  let result = null
  let count = 0
  while (((result = regexMatches.next()), !result.done && count++ < HIT_LIMIT)) {
    const isGroupMatch = !!result.value.groups?.term
    const value = result.value.groups?.term ?? result.value[0]
    const position =
      result.value.index + (isGroupMatch ? (result.value[0].match(/^\W/) ? 1 : 0) : 0)
    results.push({
      path: `${pathSansPosition}/${position}`,
      hit: value,
    })
  }
  return results
}

export const projectSearchHitsSelector = createSelector(
  searchDialogSearchTermSelector,
  seriesSelector,
  allBooksAsArraySelector,
  searchModalReplaceWordSelector,
  (term, series, books, replaceWord) => {
    if (term === '' || !term || term.length < 3) {
      return []
    }

    const bookLikeMatch = (entity, prefix, id) => {
      const nameKey = prefix === 'book' ? 'title' : 'name'
      const which = id ? `/${id}` : ''
      const nameMatch = entity[nameKey]?.matchAll(literalRegExp(term, replaceWord))
      const genreMatch = entity.genre?.matchAll(literalRegExp(term, replaceWord))
      const premiseMatch = entity.premise?.matchAll(literalRegExp(term, replaceWord))
      const themeMatch = entity.theme?.matchAll(literalRegExp(term, replaceWord))
      return [
        ...(nameMatch ? hits(`/project/${prefix}${which}/${nameKey}`, nameMatch) : []),
        ...(genreMatch ? hits(`/project/${prefix}${which}/genre`, genreMatch) : []),
        ...(premiseMatch ? hits(`/project/${prefix}${which}/premise`, premiseMatch) : []),
        ...(themeMatch ? hits(`/project/${prefix}${which}/theme`, themeMatch) : []),
      ]
    }
    const bookMatches = books.flatMap((book) => {
      return bookLikeMatch(book, 'book', book.id)
    })

    return [...bookLikeMatch(series, 'series'), ...bookMatches].filter((hit) => {
      return hit.hit.length > 0
    })
  }
)
const allCardsSelector = (state) => {
  return state.cards
}
const CARD_BASIC_ATTRIBUTES = [...Object.keys(card), 'positionInChapter', 'position']
export const timelineSearchHitsSelector = createSelector(
  searchDialogSearchTermSelector,
  allLinesSelector,
  allCardsSelector,
  cardsCustomAttributesSelector,
  searchModalReplaceWordSelector,
  (term, lines, cards, customAttributes, replaceWord) => {
    if (term === '' || !term || term.length < 3) {
      return []
    }

    const cardMatch = (card) => {
      const timeline = lines.find((line) => {
        return line.id == card.lineId
      })?.bookId
      const titleMatch = card.title.matchAll(literalRegExp(term, replaceWord))
      const descriptionText = serializeNoFormatting(card.description)
      const descriptionMatch = descriptionText.matchAll(literalRegExp(term, replaceWord))
      const cardCustomAttributes = customAttributes
        .filter((attribute) => {
          return typeof card[attribute.name] !== 'undefined'
        })
        .map((attribute) => {
          return {
            id: attribute.name,
            value: card[attribute.name],
          }
        })
      const customAttributeMatches = cardCustomAttributes.flatMap((attribute) => {
        const { id, value } = attribute
        const valueAsString =
          (Array.isArray(value) ? serializeNoFormatting(value) : String(value)) || ''
        const valueMatch = valueAsString.matchAll(literalRegExp(term, replaceWord))
        if (!valueMatch) {
          return []
        }
        return hits(
          `/timeline/${timeline}/card/${card.id}/customAttribute/${escapeUIPathElement(id)}`,
          valueMatch
        )
      })
      const templateMatches = card.templates.flatMap((template) => {
        const templateAttributeHit = (attribute) => {
          const name = attribute.name
          const value = attribute.value
          const valueAsString =
            (Array.isArray(value) ? serializeNoFormatting(value) : String(value)) || ''
          const valueMatch = valueAsString.matchAll(literalRegExp(term))
          if (!valueMatch) {
            return []
          }
          return hits(
            `/timeline/${timeline}/card/${card.id}/templateAttribute/${
              template.id
            }/${escapeUIPathElement(name)}`,
            valueMatch
          )
        }
        return template.attributes.flatMap(templateAttributeHit)
      })
      const titleMatches = hits(`/timeline/${timeline}/card/${card.id}/title`, titleMatch)
      const descriptionMatches = hits(
        `/timeline/${timeline}/card/${card.id}/description`,
        descriptionMatch
      )
      return [
        ...[titleMatches, descriptionMatches].flatMap((x) => x),
        ...customAttributeMatches,
        ...templateMatches,
      ]
    }

    return cards
      .flatMap((card) => {
        return cardMatch(card, 'card')
      })
      .filter((hit) => {
        return hit.hit.length > 0
      })
  }
)
export const outlineSearchHitsSelector = createSelector(
  searchDialogSearchTermSelector,
  allLinesSelector,
  allCardsSelector,
  searchModalReplaceWordSelector,
  (term, lines, cards, replaceWord) => {
    if (term === '' || !term || term.length < 3) {
      return []
    }

    const cardMatch = (card) => {
      const titleMatch = card?.title?.matchAll(literalRegExp(term, replaceWord))
      const descriptionText = serializeNoFormatting(card.description)
      const descriptionMatch = descriptionText.matchAll(literalRegExp(term, replaceWord))
      const timeline = lines.find((line) => {
        return line.id == card.lineId
      })?.bookId
      return [
        titleMatch ? hits(`/outline/${timeline}/card/${card.id}/title`, titleMatch) : [],
        descriptionMatch
          ? hits(`/outline/${timeline}/card/${card.id}/description`, descriptionMatch)
          : [],
      ].flatMap((x) => x)
    }

    return cards.flatMap(cardMatch).filter((hit) => {
      return hit.hit.length > 0
    })
  }
)
const allNotes = (state) => {
  return state.notes
}
const NOTE_BASIC_ATTRIBUTES = [...Object.keys(note)]
export const notesSearchHitsSelector = createSelector(
  searchDialogSearchTermSelector,
  allNotes,
  noteCustomAttributesSelector,
  searchModalReplaceWordSelector,
  (term, notes, customAttributes, replaceWord) => {
    if (term === '' || !term || term.length < 3) {
      return []
    }

    const noteMatch = (note) => {
      const titleMatch = note.title.matchAll(literalRegExp(term, replaceWord))
      const contentText = serializeNoFormatting(note.content)
      const contentMatch = contentText.matchAll(literalRegExp(term, replaceWord))
      const noteCustomAttributes = customAttributes
        .filter((attribute) => {
          return typeof note[attribute.name] !== 'undefined'
        })
        .map((attribute) => {
          return [attribute.name, note[attribute.name]]
        })
      const customAttributeMatches = noteCustomAttributes.flatMap(([key, value]) => {
        const valueAsString =
          (Array.isArray(value) ? serializeNoFormatting(value) : String(value)) || ''
        const valueMatch = valueAsString.matchAll(literalRegExp(term, replaceWord))
        if (!valueMatch) {
          return []
        }
        return hits(`/notes/${note.id}/customAttribute/${escapeUIPathElement(key)}`, valueMatch)
      })
      return [
        ...[
          titleMatch ? hits(`/notes/${note.id}/title`, titleMatch) : [],
          contentMatch ? hits(`/notes/${note.id}/content`, contentMatch) : [],
        ].flatMap((x) => x),
        ...customAttributeMatches,
      ]
    }

    return notes.flatMap(noteMatch).filter((hit) => {
      return hit.hit.length > 0
    })
  }
)
const characters = (state) => {
  return state.characters
}
const attributes = (state) => {
  return state.attributes
}
const books = (state) => {
  return state.books
}
export const charactersHitsSelector = createSelector(
  searchDialogSearchTermSelector,
  characters,
  attributes,
  books,
  characterCustomAttributesSelector,
  searchModalReplaceWordSelector,
  (term, allCharacters, allAttributes, allBooks, legacyCustomAttributes, replaceWord) => {
    if (term === '' || !term || term.length < 3) {
      return []
    }

    const characterMatch = (character) => {
      const nameMatch = character.name.matchAll(literalRegExp(term, replaceWord))
      const characterCustomAttributes = (character.attributes || []).reduce((acc, attribute) => {
        const indexAttribute = allAttributes.characters.find(({ id }) => {
          return id === attribute.id
        })
        if (indexAttribute.type === 'base-attribute' && indexAttribute.name === 'tags') {
          return acc
        } else {
          const valueAsString =
            (Array.isArray(attribute.value)
              ? serializeNoFormatting(attribute.value)
              : String(attribute.value)) || ''
          const valueMatch = valueAsString.matchAll(literalRegExp(term, replaceWord))

          const bookTitle =
            attribute.bookId === 'all' ? 'Series' : allBooks[attribute.bookId]?.title
          const bookId = attribute.bookId
          if (!valueMatch || !indexAttribute || !bookTitle) {
            return acc
          } else {
            return [
              ...hits(
                `/characters/${character.id}/customAttribute/${attribute.id}/${bookId}`,
                valueMatch
              ),
              ...acc,
            ]
          }
        }
      }, [])
      const characterTemplateAttributes = character.templates.reduce((acc, template) => {
        const templateAttributes = (template.values || []).flatMap((attribute) => {
          const valueAsString =
            (Array.isArray(attribute.value)
              ? serializeNoFormatting(attribute.value)
              : String(attribute.value)) || ''
          const valueMatch = valueAsString.matchAll(literalRegExp(term, replaceWord))
          const indexAttribute = template.attributes.find(({ name }) => {
            return name === attribute.name
          })
          const bookTitle =
            attribute.bookId === 'all' ? 'Series' : allBooks[attribute.bookId]?.title
          const bookId = attribute.bookId
          if (!valueMatch || !indexAttribute || !bookTitle) {
            return []
          }
          return hits(
            `/characters/${character.id}/templateAttribute/${template.id}/${escapeUIPathElement(
              attribute.name
            )}/${bookId}`,
            valueMatch
          )
        })
        return [...acc, ...templateAttributes]
      }, [])
      const characterLegacyAttributesHits = [
        'notes',
        'description',
        ...legacyCustomAttributes.map(({ name }) => {
          return name
        }),
      ]
        .filter((attributeName) => {
          return !(character.attributes || []).some((attribute) => {
            const indexAttribute = allAttributes.characters.find(({ id }) => {
              return id === attribute.id
            })
            const attributeAttributeName = attributeName === 'notes' ? 'description' : attributeName
            return indexAttribute.name === attributeAttributeName && attribute.bookId === 'all'
          })
        })
        .flatMap((attributeName) => {
          const attributeValue = character[attributeName]
          const valueAsString =
            (Array.isArray(attributeValue)
              ? serializeNoFormatting(attributeValue)
              : String(attributeValue)) || ''
          const valueMatch = valueAsString.matchAll(literalRegExp(term, replaceWord))
          return hits(
            `/characters/${character.id}/customAttribute/${escapeUIPathElement(attributeName)}/all`,
            valueMatch
          )
        })
      return [
        ...[nameMatch ? hits(`/characters/${character.id}/name`, nameMatch) : []].flatMap((x) => x),
        ...characterCustomAttributes,
        ...characterTemplateAttributes,
        ...characterLegacyAttributesHits,
      ]
    }

    return allCharacters.flatMap(characterMatch).filter((hit) => {
      return hit.hit.length > 0
    })
  }
)
const PLACE_BASIC_ATTRIBUTES = [...Object.keys(place)]
const places = (state) => {
  return state.places
}
export const placesHitsSelector = createSelector(
  searchDialogSearchTermSelector,
  places,
  placeCustomAttributesSelector,
  searchModalReplaceWordSelector,
  (term, allPlaces, customAttributes, replaceWord) => {
    if (term === '' || !term || term.length < 3) {
      return []
    }

    const placeMatch = (place) => {
      const nameMatch = place.name.matchAll(literalRegExp(term, replaceWord))
      const descriptionMatch = place.description.matchAll(literalRegExp(term, replaceWord))
      const notesText = serializeNoFormatting(place.notes)
      const notesMatch = notesText.matchAll(literalRegExp(term, replaceWord))
      const placeCustomAttributes = customAttributes
        .filter((attribute) => {
          return typeof place[attribute.name] !== 'undefined'
        })
        .map((attribute) => {
          return [attribute.name, place[attribute.name]]
        })
      const customAttributeMatches = placeCustomAttributes.flatMap(([key, value]) => {
        const valueAsString =
          (Array.isArray(value) ? serializeNoFormatting(value) : String(value)) || ''
        const valueMatch = valueAsString.matchAll(literalRegExp(term, replaceWord))
        if (!valueMatch) {
          return []
        }
        return hits(`/places/${place.id}/customAttribute/${escapeUIPathElement(key)}`, valueMatch)
      })
      // TODO template attributes
      return [
        ...[
          nameMatch ? hits(`/places/${place.id}/name`, nameMatch) : [],
          descriptionMatch ? hits(`/places/${place.id}/description`, descriptionMatch) : [],
          notesMatch ? hits(`/places/${place.id}/notes`, notesMatch) : [],
        ].flatMap((x) => x),
        ...customAttributeMatches,
      ]
    }

    return allPlaces.flatMap(placeMatch).filter((hit) => {
      return hit.hit.length > 0
    })
  }
)
const tags = (state) => {
  return state.tags
}
export const tagsSearchHitsSelector = createSelector(
  searchDialogSearchTermSelector,
  tags,
  searchModalReplaceWordSelector,
  (term, allTags, replaceWord) => {
    if (term === '' || !term || term.length < 3) {
      return []
    }

    const tagMatch = (tag) => {
      const titleMatch = tag.title.matchAll(literalRegExp(term, replaceWord))
      return [titleMatch ? hits(`/tags/${tag.id}/title`, titleMatch) : []].flatMap((x) => x)
    }

    return allTags.flatMap(tagMatch).filter((hit) => {
      return hit.hit.length > 0
    })
  }
)
export const linesSearchHitsSelector = createSelector(
  searchDialogSearchTermSelector,
  allLinesSelector,
  searchModalReplaceWordSelector,
  (term, lines, replaceWord) => {
    if (term === '' || !term || term.length < 3) {
      return []
    } else {
      const lineHit = (line) => {
        const titleMatch = line.title.matchAll(literalRegExp(term, replaceWord))
        return [titleMatch ? hits(`/lines/${line.id}/title`, titleMatch) : []].flatMap((x) => x)
      }
      return lines.flatMap(lineHit).filter((hit) => {
        return hit.hit.length > 0
      })
    }
  }
)
export const beatHitsSelector = createSelector(
  searchDialogSearchTermSelector,
  allBeatsSelector,
  searchModalReplaceWordSelector,
  (term, allBeatTrees, replaceWord) => {
    if (term === '' || !term || term.length < 3) {
      return []
    } else {
      const beatHit = (bookId) => (beat) => {
        const titleMatch = beat.title.matchAll(literalRegExp(term, replaceWord))
        return [titleMatch ? hits(`/beats/${bookId}/${beat.id}/title`, titleMatch) : []].flatMap(
          (x) => x
        )
      }
      return Object.entries(allBeatTrees).reduce((acc, nextKeyValue) => {
        const [bookId, beatTree] = nextKeyValue
        const beats = Object.values(beatTree.index)
        return [
          ...acc,
          ...beats.flatMap(beatHit(bookId)).filter((hit) => {
            return hit.hit.length > 0
          }),
        ]
      }, [])
    }
  }
)
const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual)
export const searchHitsSelector = createDeepEqualSelector(
  projectSearchHitsSelector,
  timelineSearchHitsSelector,
  outlineSearchHitsSelector,
  notesSearchHitsSelector,
  charactersHitsSelector,
  placesHitsSelector,
  tagsSearchHitsSelector,
  linesSearchHitsSelector,
  beatHitsSelector,
  (
    projectHits,
    timelineHits,
    outlineHits,
    notesHits,
    charactersHits,
    placesHits,
    tagsHits,
    lineHits,
    beatHits
  ) => {
    return {
      project: projectHits,
      timeline: timelineHits,
      outline: outlineHits,
      notes: notesHits,
      characters: charactersHits,
      places: placesHits,
      tags: tagsHits,
      lines: lineHits,
      beats: beatHits,
    }
  }
)

export const flatSearchHitsSelector = createDeepEqualSelector(
  projectSearchHitsSelector,
  timelineSearchHitsSelector,
  outlineSearchHitsSelector,
  notesSearchHitsSelector,
  charactersHitsSelector,
  placesHitsSelector,
  tagsSearchHitsSelector,
  linesSearchHitsSelector,
  beatHitsSelector,
  (
    projectHits,
    timelineHits,
    outlineHits,
    notesHits,
    charactersHits,
    placesHits,
    tagsHits,
    lineHits,
    beatHits
  ) => {
    return [
      ...projectHits,
      ...timelineHits,
      ...outlineHits,
      ...notesHits,
      ...charactersHits,
      ...placesHits,
      ...tagsHits,
      ...lineHits,
      ...beatHits,
    ]
  }
)

export const hasNoResultsSelector = createSelector(
  projectSearchHitsSelector,
  timelineSearchHitsSelector,
  outlineSearchHitsSelector,
  notesSearchHitsSelector,
  charactersHitsSelector,
  placesHitsSelector,
  tagsSearchHitsSelector,
  linesSearchHitsSelector,
  beatHitsSelector,
  (
    projectHits,
    timelineHits,
    outlineHits,
    notesHits,
    charactersHits,
    placesHits,
    tagsHits,
    lineHits,
    beatHits
  ) => {
    const total = [
      projectHits,
      timelineHits,
      outlineHits,
      notesHits,
      charactersHits,
      placesHits,
      tagsHits,
      lineHits,
      beatHits,
    ].reduce((acc, hits) => {
      return hits?.length + acc
    }, 0)

    return !total ? true : false
  }
)

const outlineSelector = createSelector(uiSelector, ({ outlineTab }) => {
  return outlineTab || {}
})
export const selectedOutlineCardSelector = createSelector(outlineSelector, ({ selectedCard }) => {
  return selectedCard
})
export const outlineFociSelector = createSelector(outlineSelector, ({ focus }) => {
  return focus || []
})
const outlineTabCardEditorSelector = createSelector(outlineSelector, ({ cardEditor }) => {
  return cardEditor || {}
})
export const editingOutlineCardSelector = createSelector(
  outlineTabCardEditorSelector,
  ({ editing }) => {
    return editing
  }
)
export const outlineCurrentFocusSelector = createSelector(
  outlineFociSelector,
  editingOutlineCardSelector,
  (foci, cardId) => {
    return foci.filter((focus) => {
      return focus.path[1] === cardId
    })
  }
)

const notesSelector = createSelector(uiSelector, ({ noteTab }) => {
  return noteTab || {}
})
export const selectedNoteSelector = createSelector(notesSelector, ({ selectedNote }) => {
  return selectedNote
})
export const editingSelectedNoteSelector = createSelector(notesSelector, ({ editingSelected }) => {
  return editingSelected
})
export const noteCategoriesDialogOpenSelector = createSelector(
  notesSelector,
  ({ categoriesDialogOpen }) => {
    return categoriesDialogOpen
  }
)
export const noteAttributesDialogOpenSelector = createSelector(
  notesSelector,
  ({ attributesDialogOpen }) => {
    return attributesDialogOpen
  }
)
export const noteFilterVisibleSelector = createSelector(notesSelector, ({ filterVisible }) => {
  return filterVisible
})
export const noteSortVisibleSelector = createSelector(notesSelector, ({ sortVisible }) => {
  return sortVisible
})
export const noteFociSelector = createSelector(notesSelector, ({ focus }) => {
  return focus || []
})
export const noteCurrentFocusSelector = createSelector(
  noteFociSelector,
  selectedNoteSelector,
  (foci, noteId) => {
    return foci.filter((focus) => {
      return focus.path[1] === noteId
    })
  }
)

const placesSelector = createSelector(uiSelector, ({ placeTab }) => {
  return placeTab || {}
})
export const selectedPlaceSelector = createSelector(placesSelector, ({ selectedPlace }) => {
  return selectedPlace
})
export const placeAttributeDialogIsOpenSelector = createSelector(
  placesSelector,
  ({ attributeDialogOpen }) => {
    return attributeDialogOpen
  }
)
export const editingSelectedPlaceSelector = createSelector(
  placesSelector,
  ({ editingSelected }) => {
    return editingSelected
  }
)
export const placesCategoriesOpenSelector = createSelector(placesSelector, ({ categoriesOpen }) => {
  return categoriesOpen
})
export const placesFilterIsVisibleSelector = createSelector(placesSelector, ({ filterVisible }) => {
  return filterVisible
})
export const placesSortIsVisibleSelector = createSelector(placesSelector, ({ sortVisible }) => {
  return sortVisible
})
export const placeFociSelector = createSelector(placesSelector, ({ focus }) => {
  return focus || []
})
export const placeCurrentFocusSelector = createSelector(
  placeFociSelector,
  selectedPlaceSelector,
  (foci, placeId) => {
    return foci.filter((focus) => {
      return focus.path[1] === placeId
    })
  }
)

const tagsSelector = createSelector(uiSelector, ({ tagTab }) => {
  return tagTab || {}
})

export const isTagTabFocusingSelector = createSelector(
  tagsSelector,
  ({ focus, editingSelectedTab }) => {
    return Boolean(focus?.length) || editingSelectedTab
  }
)

export const selectedTagSelector = createSelector(tagsSelector, ({ selectedTag }) => {
  return selectedTag
})
export const editingSelectedTagSelector = createSelector(tagsSelector, ({ editingSelectedTab }) => {
  return editingSelectedTab
})
const tagIdSelector = (_state, id) => id
export const isEditingTagSelector = createSelector(
  selectedTagSelector,
  tagIdSelector,
  editingSelectedTagSelector,
  (selectedTagId, tagId, editing) => {
    return selectedTagId === tagId && editing
  }
)
export const allTagFociSelector = createSelector(tagsSelector, ({ focus }) => {
  return focus || []
})
export const tagCurrentFociSelector = createSelector(
  selectedTagSelector,
  allTagFociSelector,
  (selectedTagId, foci) => {
    return foci.filter((focus) => {
      return focus.path.length && focus.path[1] === selectedTagId
    })
  }
)

const projectTabSelector = createSelector(uiSelector, ({ projectTab }) => {
  return projectTab || {}
})
export const projectCurrentFocusSelector = createSelector(
  projectTabSelector,
  isBookDialogVisibleSelector,
  bookDialogBookIdSelector,
  ({ focus }, bookDialogIsOpen, bookDialogId) => {
    const relevantFoci = (focus || []).filter((focus) => {
      return (
        (!bookDialogIsOpen && focus.path[0] !== 'book') ||
        (bookDialogIsOpen && focus.path[0] === 'book' && focus.path[1] === bookDialogId)
      )
    })
    return relevantFoci && relevantFoci[0]
  }
)
export const projectAllFociSelector = createSelector(projectTabSelector, ({ focus }) => {
  return focus
})

const timelineSelector = createSelector(uiSelector, ({ timeline }) => {
  return timeline
})
export const timelineFociSelector = createSelector(timelineSelector, ({ focus }) => {
  return focus || []
})
export const timelineFocusCandidateSelector = createAggressiveDeepEqualSelector(
  timelineFociSelector,
  (foci) => {
    return foci.length && typeof foci[0] !== 'undefined' && foci[0]
  }
)
const beatIdSelector = (_state, beatId) => {
  return beatId
}
export const timelineBeatSelectionSelector = createAggressiveDeepEqualSelector(
  timelineFocusCandidateSelector,
  beatIdSelector,
  (focusCandidate, beatId) => {
    return (
      Array.isArray(focusCandidate.path) &&
      focusCandidate.path[0] === 'beat' &&
      focusCandidate.path[1] === beatId &&
      focusCandidate.path[2] === 'title' &&
      focusCandidate.selection
    )
  }
)
export const timelineCurrentFocusSelector = createSelector(
  timelineFociSelector,
  cardDialogCardIdSelector,
  (foci, cardId) => {
    return foci.filter((focus) => {
      return focus.path[1] === cardId
    })
  }
)
const selectBeatId = (_state, beatId) => {
  return beatId
}
const beatIdOfHeadingBeingEditedSelector = createSelector(
  timelineSelector,
  ({ beatHeadingTitleBeingEdited }) => {
    return beatHeadingTitleBeingEdited
  }
)
export const editingGivenBeatsTitleSelector = createSelector(
  beatIdOfHeadingBeingEditedSelector,
  selectBeatId,
  (beatIdBeingEdited, suppliedBeatId) => {
    return typeof beatIdBeingEdited === 'number' && beatIdBeingEdited === suppliedBeatId
  }
)
const selectLineId = (_state, lineId) => {
  return lineId
}
const lineIdOfPlotlineTitleBeingEditedSelector = createSelector(
  timelineSelector,
  ({ plotlineTitleBeingEdited }) => {
    return plotlineTitleBeingEdited
  }
)
export const editingGivenLinesTitleSelector = createSelector(
  lineIdOfPlotlineTitleBeingEditedSelector,
  selectLineId,
  (lineIdBeingEdited, suppliedLineId) => {
    return typeof lineIdBeingEdited === 'number' && lineIdBeingEdited === suppliedLineId
  }
)

const dashboardModalSelector = createSelector(uiSelector, ({ dashboardModal }) => {
  return dashboardModal || {}
})
export const dashboardModalViewSelector = createSelector(dashboardModalSelector, ({ view }) => {
  return view ?? null
})
