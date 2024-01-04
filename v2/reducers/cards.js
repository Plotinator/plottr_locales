import { cloneDeep } from 'lodash'
import {
  ADD_CARD,
  ADD_CARD_IN_BEAT,
  ADD_LINES_FROM_TEMPLATE,
  ATTACH_CHARACTER_TO_CARD,
  ATTACH_PLACE_TO_CARD,
  ATTACH_TAG_TO_CARD,
  AUTO_SORT_BEAT,
  CHANGE_BOOK,
  CHANGE_LINE,
  CHANGE_BEAT,
  CLEAR_TEMPLATE_FROM_TIMELINE,
  DELETE_BEAT,
  DELETE_CARD,
  DELETE_CHARACTER,
  DELETE_LINE,
  DELETE_PLACE,
  DELETE_TAG,
  EDIT_CARD_COORDINATES,
  EDIT_CARD_DETAILS,
  EDIT_CARDS_ATTRIBUTE,
  FILE_LOADED,
  NEW_FILE,
  REMOVE_CHARACTER_FROM_CARD,
  REMOVE_PLACE_FROM_CARD,
  REMOVE_TAG_FROM_CARD,
  REORDER_CARDS_IN_BEAT,
  REORDER_CARDS_WITHIN_LINE,
  RESET,
  RESET_TIMELINE,
  DELETE_BOOK,
  LOAD_CARDS,
  LOAD_CARD,
  BATCH_LOAD_CARD,
  REMOVE_CARD,
  EDIT_CARD_TEMPLATE_ATTRIBUTE,
  ADD_TEMPLATE_TO_CARD,
  REMOVE_TEMPLATE_FROM_CARD,
  ADD_BOOK_FROM_TEMPLATE,
  DUPLICATE_CARD,
  MOVE_CARD_TO_BOOK,
  DUPLICATE_LINE,
  MOVE_LINE,
  EDIT_CARD_TITLE,
  EDIT_CARD_DESCRIPTION,
  EDIT_CARD_CUSTOM_ATTRIBUTE,
  DUPLICATE_BOOK,
  REORDER_CARD_TEMPLATE_ATTRIBUTES,
  REPLACE_MARKED_HITS,
} from '../constants/ActionTypes'
import { newFileCards } from '../store/newFileState'
import { card as defaultCard } from '../store/initialState'
import { nextId } from '../store/newIds'
import { applyToCustomAttributes } from './applyToCustomAttributes'
import { repairIfPresent } from './repairIfPresent'
import { reorderList } from '../helpers/lists'
import { safeParseInt } from './safeParseInt'
import { sortByHitPosition } from './sortByHitPosition'
import { replacePlainTextHit, replaceInSlateDatastructure } from './replace'

const INITIAL_STATE = []

const cards =
  (dataRepairers) =>
  (state = INITIAL_STATE, action) => {
    const repair = repairIfPresent(dataRepairers)

    switch (action.type) {
      case ADD_CARD:
        return [Object.assign({}, defaultCard, action.card, { id: nextId(state) }), ...state]

      case ADD_CARD_IN_BEAT:
        // add a new card
        // and reorder cards in the beat
        return [
          Object.assign(
            {},
            defaultCard,
            {
              ...action.newCard,
              ...(action.reorderIds ? { positionWithinLine: action.reorderIds.indexOf(null) } : {}),
            },
            { id: nextId(state) }
          ),
          ...state.map((card) => {
            const idx = action.reorderIds.indexOf(card.id)
            if (idx != -1) {
              return Object.assign({}, card, { positionWithinLine: idx })
            } else {
              return card
            }
          }),
        ]

      case ADD_LINES_FROM_TEMPLATE: {
        const newCards = action.templateData.cards.map((c) => {
          const newCard = cloneDeep(c)
          newCard.id = newCard.id + action.nextCardId // give it a new id
          newCard.lineId = action.nextLineId + newCard.lineId // give it the correct lineId
          newCard.beatId = action.cardToBeatIdMap[c.id] // give it the correct beatId
          newCard.fromTemplateId = action.templateData.id
          return newCard
        })

        return [...state, ...newCards]
      }

      case ADD_BOOK_FROM_TEMPLATE: {
        if (Array.isArray(action.templateData.cards)) {
          const newCards = action.templateData.cards.map((c) => {
            const newCard = cloneDeep(c)
            newCard.id = newCard.id + action.nextCardId // give it a new id
            newCard.lineId = action.nextLineId + newCard.lineId // give it the correct lineId
            newCard.beatId = action.nextBeatId + newCard.beatId // give it the correct beatId
            newCard.fromTemplateId = action.templateData.id
            return newCard
          })

          return [...state, ...newCards]
        } else {
          return state
        }
      }

      case DUPLICATE_BOOK: {
        const newCards = action.newCards.map((c) => {
          const newCard = cloneDeep(c)
          newCard.id = newCard.id + action.nextCardId // give it a new id
          newCard.lineId = action.nextLineId + newCard.lineId // give it the correct lineId
          newCard.beatId = action.nextBeatId + newCard.beatId // give it the correct beatId
          return newCard
        })

        return [...state, ...newCards]
      }

      case ADD_TEMPLATE_TO_CARD:
        return state.map((card) => {
          if (card.id === action.id) {
            if (card.templates.some(({ id }) => id === action.templateData.id)) {
              return card
            }
            const newCard = cloneDeep(card)
            newCard.templates.push({
              id: action.templateData.id,
              version: action.templateData.version,
              attributes: action.templateData.attributes,
              value: '',
            })
            return newCard
          } else {
            return card
          }
        })

      case EDIT_CARD_DETAILS: {
        if (!action.attributes) return state
        const attributeValues = Object.keys(action.attributes).reduce((acc, nextKey) => {
          if (typeof action.attributes[nextKey].value !== 'undefined') {
            return {
              ...acc,
              [nextKey]: action.attributes[nextKey].value,
            }
          } else {
            return {
              ...acc,
              [nextKey]: action.attributes[nextKey],
            }
          }
        }, {})
        return state.map((card) =>
          card.id === action.id ? Object.assign({}, card, attributeValues) : card
        )
      }

      case EDIT_CARD_COORDINATES: {
        const diffObj = {
          beatId: action.beatId,
          lineId: action.lineId,
        }
        return state.map((card) =>
          card.id === action.id ? Object.assign({}, card, diffObj) : card
        )
      }

      case REORDER_CARD_TEMPLATE_ATTRIBUTES: {
        return state.map((card) => {
          if (card.id === action.id) {
            const reorderedTemplates = reorderList(
              action.destination,
              action.originalPosition,
              card.templates
            )
            return {
              ...card,
              templates: reorderedTemplates,
            }
          }
          return card
        })
      }

      case EDIT_CARD_TEMPLATE_ATTRIBUTE:
        return state.map((card) => {
          if (card.id === action.id) {
            return {
              ...card,
              templates: card.templates.map((template) =>
                template.id === action.templateId
                  ? {
                      ...template,
                      attributes: template.attributes.map((attribute) =>
                        attribute.name === action.name
                          ? { ...attribute, value: action.value }
                          : attribute
                      ),
                    }
                  : template
              ),
            }
          }
          return card
        })

      case CHANGE_LINE: {
        const diffObj = {
          lineId: action.lineId,
        }
        return state.map((card) =>
          card.id === action.id ? Object.assign({}, card, diffObj) : card
        )
      }

      case CHANGE_BEAT: {
        const diffObj = {
          beatId: action.beatId,
        }
        return state.map((card) =>
          card.id === action.id ? Object.assign({}, card, diffObj) : card
        )
      }

      case CHANGE_BOOK:
        return state.map((card) =>
          card.id === action.id ? Object.assign({}, card, { bookId: action.bookId }) : card
        )

      case REORDER_CARDS_WITHIN_LINE:
        return state.map((card) => {
          const idx = action.ids.indexOf(card.id)
          if (idx != -1) {
            return Object.assign({}, card, {
              positionWithinLine: idx,
              beatId: action.beatId,
              lineId: action.lineId,
            })
          } else {
            return card
          }
        })

      case REORDER_CARDS_IN_BEAT:
        return state.map((card) => {
          const idxInBeat = action.newOrderInBeat.indexOf(card.id)
          let idxWithinLine = -1
          if (action.newOrderWithinLine) idxWithinLine = action.newOrderWithinLine.indexOf(card.id)

          if (idxWithinLine == -1 && idxInBeat == -1) {
            return card
          }

          let newCard = { ...card }
          // set beatId of the new-to-this-beat card (if any)
          if (card.id == action.newIdInBeat) {
            newCard.beatId = action.beatId
          }
          // change positions
          if (idxWithinLine != -1) newCard.positionWithinLine = idxWithinLine
          if (idxInBeat != -1) newCard.positionInBeat = idxInBeat

          return newCard
        })

      case AUTO_SORT_BEAT:
        return state.map((card) => {
          let idToMatch = card.beatId
          if (action.isSeries) idToMatch = card.beatId
          if (card.beatId != idToMatch) return card

          return Object.assign({}, card, { positionInBeat: 0 })
        })

      case DELETE_BOOK:
        // remove the link for deleted books
        // and delete cards that are on deleted lines
        return state.reduce((acc, c) => {
          if (c.bookId == action.id) {
            c.bookId = null
          }
          if (!action.linesToDelete.includes(c.lineId)) {
            acc.push(c)
          }
          return acc
        }, [])

      case DELETE_CARD:
        return state.filter((card) => card.id !== action.id)

      case DELETE_LINE:
        return state.filter((card) => card.lineId !== action.id)

      case DELETE_BEAT:
        return state.filter((card) => card.beatId !== action.id)

      case EDIT_CARDS_ATTRIBUTE:
        if (
          action.oldAttribute.type !== 'text' &&
          action.oldAttribute.name === action.newAttribute.name
        )
          return state

        return state.map((card) => {
          const newCard = cloneDeep(card)

          if (action.oldAttribute.name !== action.newAttribute.name) {
            // Firebase doesn't support undefined, so use null when the attribute isn't set
            newCard[action.newAttribute.name] = newCard[action.oldAttribute.name] || null
            delete newCard[action.oldAttribute.name]
          }

          // reset value to blank string
          // (if changing to something other than text type)
          // see ../selectors/customAttributes.js for when this is allowed
          if (action.oldAttribute.type === 'text') {
            let description = newCard[action.newAttribute.name]
            if (
              !description ||
              (description && description.length && typeof description !== 'string')
            ) {
              description = ''
            }
            newCard[action.newAttribute.name] = description
          }
          return newCard
        })

      case ATTACH_CHARACTER_TO_CARD:
        return state.map((card) => {
          let characters = cloneDeep(card.characters)
          characters.push(action.characterId)
          return card.id === action.id ? Object.assign({}, card, { characters: characters }) : card
        })

      case REMOVE_CHARACTER_FROM_CARD:
        return state.map((card) => {
          let characters = cloneDeep(card.characters)
          characters.splice(characters.indexOf(action.characterId), 1)
          return card.id === action.id ? Object.assign({}, card, { characters: characters }) : card
        })

      case ATTACH_PLACE_TO_CARD:
        return state.map((card) => {
          let places = cloneDeep(card.places)
          places.push(action.placeId)
          return card.id === action.id ? Object.assign({}, card, { places: places }) : card
        })

      case REMOVE_PLACE_FROM_CARD:
        return state.map((card) => {
          let places = cloneDeep(card.places)
          places.splice(places.indexOf(action.placeId), 1)
          return card.id === action.id ? Object.assign({}, card, { places: places }) : card
        })

      case ATTACH_TAG_TO_CARD:
        return state.map((card) => {
          let tags = cloneDeep(card.tags)
          tags.push(action.tagId)
          return card.id === action.id ? Object.assign({}, card, { tags: tags }) : card
        })

      case REMOVE_TAG_FROM_CARD:
        return state.map((card) => {
          let tags = cloneDeep(card.tags)
          tags.splice(tags.indexOf(action.tagId), 1)
          return card.id === action.id ? Object.assign({}, card, { tags: tags }) : card
        })

      case REMOVE_TEMPLATE_FROM_CARD:
        return state.map((card) => {
          if (card.id !== action.id) return card
          const newTemplates = card.templates.filter((t) => t.id != action.templateId)
          return Object.assign({}, card, { templates: newTemplates })
        })

      case DELETE_TAG:
        return state.map((card) => {
          if (card.tags.includes(action.id)) {
            let tags = cloneDeep(card.tags)
            tags.splice(tags.indexOf(action.id), 1)
            return Object.assign({}, card, { tags: tags })
          } else {
            return card
          }
        })

      case DELETE_CHARACTER:
        return state.map((card) => {
          if (card.characters.includes(action.id)) {
            let characters = cloneDeep(card.characters)
            characters.splice(characters.indexOf(action.id), 1)
            return Object.assign({}, card, { characters: characters })
          } else {
            return card
          }
        })

      case DELETE_PLACE:
        return state.map((card) => {
          if (card.places.includes(action.id)) {
            let places = cloneDeep(card.places)
            places.splice(places.indexOf(action.id), 1)
            return Object.assign({}, card, { places: places })
          } else {
            return card
          }
        })

      case RESET_TIMELINE:
        // isSeries & beatIds & lineIds come from root reducer
        return state.filter((card) => action.beatIds[card.beatId] || action.lineIds[card.lineId])

      case CLEAR_TEMPLATE_FROM_TIMELINE:
        // beatIds & lineIds come from root reducer
        // they are ones that are NOT being removed
        return state.filter((card) => action.beatIds[card.beatId] || action.lineIds[card.lineId])

      case RESET:
      case FILE_LOADED:
        return action.data.cards.map((card) => {
          const normalizeRCEContent = repair('normalizeRCEContent')
          return {
            ...card,
            ...applyToCustomAttributes(
              card,
              normalizeRCEContent,
              action.data.customAttributes.scenes,
              'paragraph'
            ),
            description: normalizeRCEContent(card.description),
          }
        })

      case NEW_FILE:
        return newFileCards

      case LOAD_CARDS:
        return action.cards

      case LOAD_CARD: {
        let didUpdate = false
        const updated = state.map((card) => {
          if (card.id === action.card.id) {
            didUpdate = true
            return action.card
          } else {
            return card
          }
        })

        if (didUpdate) {
          return updated
        } else {
          return [...state, action.card]
        }
      }

      case BATCH_LOAD_CARD: {
        const indexedCardsToLoad = action.cards.reduce((acc, next) => {
          acc.set(next.id, next)
          return acc
        }, new Map())
        const existingCards = new Set()
        const updated = state.map((card) => {
          existingCards.add(card.id)
          const cardToSwapIn = indexedCardsToLoad.get(card.id)
          if (typeof cardToSwapIn !== 'undefined') {
            return cardToSwapIn
          } else {
            return card
          }
        })

        const newCards = action.cards.filter((newCard) => {
          return !existingCards.has(newCard.id)
        })

        return [...updated, ...newCards]
      }

      case REMOVE_CARD: {
        return state.filter(({ id }) => {
          return id !== action.card.id
        })
      }

      case DUPLICATE_CARD: {
        const existingCard = state.find(({ id }) => id === action.id)

        // NOP if the card doesn't exist.
        if (!existingCard) return state

        const newId = nextId(state)
        const highestPositionInLine = state.reduce((highestPositionInLine, nextCard) => {
          if (nextCard.beatId === existingCard.beatId) {
            return Math.max(highestPositionInLine, nextCard.positionWithinLine)
          }

          return highestPositionInLine
        }, 0)

        return [
          ...state,
          { ...existingCard, id: newId, positionWithinLine: highestPositionInLine + 1 },
        ]
      }

      // NOTE: it's undefined behaviour to supply a destinationBeatId
      // and destinationLineId that don't correspond to actual beats
      // and lines that intersect in a book.
      case MOVE_CARD_TO_BOOK: {
        const { destinationBeatId, destinationLineId, cardId } = action

        // NOP if we're supplied with falsy destinations
        if (!destinationBeatId || !destinationLineId) {
          return state
        }

        const existingCard = state.find(({ id }) => id === cardId)

        // NOP if the card doesn't exist.
        if (!existingCard) {
          return state
        }

        const highestPositionInLine = state.reduce((highestPositionInLine, nextCard) => {
          if (nextCard.beatId !== existingCard.beatId) {
            return Math.max(highestPositionInLine, nextCard.positionWithinLine)
          }

          return highestPositionInLine
        })

        return [
          ...state.filter(({ id }) => cardId !== id),
          {
            ...existingCard,
            beatId: destinationBeatId,
            lineId: destinationLineId,
            positionWithinLine: highestPositionInLine + 1,
          },
        ]
      }

      case DUPLICATE_LINE: {
        const cardsOnLine = state.filter(({ lineId }) => lineId === action.id)
        const newState = cloneDeep(cardsOnLine)
          .map((card, index) => ({
            ...card,
            lineId: action.newLineId,
          }))
          .reduce((acc, nextCard) => {
            return [{ ...nextCard, id: nextId(acc) }, ...acc]
          }, state)
        return newState
      }

      case MOVE_LINE: {
        const { cardToBeatIdMapping } = action
        return state.map((card) => {
          if (cardToBeatIdMapping[card.id]) {
            return {
              ...card,
              beatId: cardToBeatIdMapping[card.id],
            }
          } else {
            return card
          }
        })
      }

      case EDIT_CARD_TITLE: {
        return state.map((card) => {
          if (card.id === action.id) {
            return {
              ...card,
              title: action.newTitle,
            }
          } else {
            return card
          }
        })
      }

      case EDIT_CARD_DESCRIPTION: {
        return state.map((card) => {
          if (card.id === action.id) {
            return {
              ...card,
              description: action.description,
            }
          }
          return card
        })
      }

      case EDIT_CARD_CUSTOM_ATTRIBUTE: {
        return state.map((card) => {
          if (card.id === action.id) {
            return {
              ...card,
              [action.name]: action.value,
            }
          }
          return card
        })
      }

      case REPLACE_MARKED_HITS: {
        const applicableHits = action.hitsMarkedForReplacement.filter((hit) => {
          return (
            hit.path.match(/^\/timeline\/[0-9a-zA-Z]+\/card/) ||
            hit.path.match(/^\/outline\/[0-9a-zA-Z]+\/card/)
          )
        })
        // IMPORTANT!!!
        //
        // We sort by the hit position so that we deal with later hits
        // first.  By doing so, we don't invalidate the start position
        // of other hits when we replace those hits.
        //
        // i.e. it's fine to do multiple replacements in the same
        // field, as long as you replace the hits in reverse order,
        // i.e. the last hit first and the first hit last.
        return sortByHitPosition(applicableHits).reduce((acc, nextHit) => {
          const { path, hit } = nextHit
          const [_, _timelineOrOutline, _rawBookId, _card, rawCardId, type, ...rest] =
            path.split('/')
          const cardId = safeParseInt(rawCardId)
          return acc.map((nextCard) => {
            if (nextCard.id === cardId) {
              if (type === 'customAttribute') {
                const [attributeName, rawFocusStart] = rest
                const attributeValue = nextCard[attributeName]
                const replaceFunction = Array.isArray(attributeValue)
                  ? replaceInSlateDatastructure
                  : replacePlainTextHit
                const focusStart = safeParseInt(rawFocusStart)
                return {
                  ...nextCard,
                  [attributeName]: replaceFunction(
                    attributeValue,
                    focusStart,
                    hit,
                    action.replacementText
                  ),
                }
              } else if (type === 'templateAttribute') {
                const [templateId, attributeName, rawFocusStart] = rest
                const focusStart = safeParseInt(rawFocusStart)
                return {
                  ...nextCard,
                  templates: nextCard.templates.map((template) => {
                    if (template.id === templateId) {
                      return {
                        ...template,
                        attributes: template.attributes.map((attribute) => {
                          const attributeValue = attribute.value
                          const replaceFunction = Array.isArray(attributeValue)
                            ? replaceInSlateDatastructure
                            : replacePlainTextHit
                          if (attribute.name === attributeName) {
                            return {
                              ...attribute,
                              value: replaceFunction(
                                attributeValue,
                                focusStart,
                                hit,
                                action.replacementText
                              ),
                            }
                          } else {
                            return attribute
                          }
                        }),
                      }
                    } else {
                      return template
                    }
                  }),
                }
              } else {
                const [rawFocusStart] = rest
                const attributeName = type
                const attributeValue = nextCard[attributeName]
                const focusStart = safeParseInt(rawFocusStart)
                const replaceFunction = Array.isArray(attributeValue)
                  ? replaceInSlateDatastructure
                  : replacePlainTextHit
                return {
                  ...nextCard,
                  [attributeName]: replaceFunction(
                    attributeValue,
                    focusStart,
                    hit,
                    action.replacementText
                  ),
                }
              }
            } else {
              return nextCard
            }
          })
        }, state)
      }

      default:
        return state || INITIAL_STATE
    }
  }

export default cards
