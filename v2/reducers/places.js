import { cloneDeep, isNumber, omit } from 'lodash'
import {
  ADD_PLACE,
  EDIT_PLACE,
  FILE_LOADED,
  NEW_FILE,
  ADD_PLACE_WITH_VALUES,
  ATTACH_PLACE_TO_CARD,
  REMOVE_PLACE_FROM_CARD,
  ATTACH_PLACE_TO_NOTE,
  REMOVE_PLACE_FROM_NOTE,
  DELETE_NOTE,
  DELETE_CARD,
  DELETE_PLACE,
  DELETE_IMAGE,
  EDIT_PLACES_ATTRIBUTE,
  ATTACH_TAG_TO_PLACE,
  REMOVE_TAG_FROM_PLACE,
  ATTACH_BOOK_TO_PLACE,
  REMOVE_BOOK_FROM_PLACE,
  DELETE_TAG,
  LOAD_PLACES,
  LOAD_PLACE,
  BATCH_LOAD_PLACE,
  REMOVE_PLACE,
  EDIT_PLACE_TEMPLATE_ATTRIBUTE,
  DUPLICATE_PLACE,
  DELETE_PLACE_CATEGORY,
  EDIT_PLACE_NAME,
  EDIT_PLACE_DESCRIPTION,
  EDIT_PLACE_NOTES,
  EDIT_PLACE_CUSTOM_ATTRIBUTE,
  REPLACE_MARKED_HITS,
  REORDER_PLACE_MANUALLY,
  ADD_PLACE_FROM_PLTR,
  UNDO,
  REDO,
  UNDO_N_TIMES,
  REDO_N_TIMES,
} from '../constants/ActionTypes'
import { place } from '../store/initialState'
import { newFilePlaces } from '../store/newFileState'
import { nextId } from '../store/newIds'
import { applyToCustomAttributes } from './applyToCustomAttributes'
import { repairIfPresent } from './repairIfPresent'
import { safeParseInt } from './safeParseInt'
import { sortByHitPosition } from './sortByHitPosition'
import { replacePlainTextHit, replaceInSlateDatastructure } from './replace'
import { moveItemToPosition, moveToAbove, positionReset } from '../helpers/lists'

const initialState = [place]

const places =
  (dataRepairers) =>
  (state = initialState, action) => {
    const repair = repairIfPresent(dataRepairers)
    switch (action.type) {
      case ADD_PLACE:
        return [
          ...state,
          {
            ...place,
            id: nextId(state),
            name: action.name,
            description: action.description,
            notes: action.notes,
          },
        ]

      case ADD_PLACE_WITH_VALUES:
        return [
          ...state,
          {
            ...place,
            ...action.place,
            id: nextId(state),
          },
        ]

      case EDIT_PLACE: {
        const attributes = Object.keys(action.attributes).reduce((acc, nextKey) => {
          const attribute = action.attributes[nextKey]
          return {
            ...acc,
            [nextKey]: typeof attribute.value === 'undefined' ? attribute : attribute.value,
          }
        }, {})
        return state.map((place) =>
          place.id === action.id ? Object.assign({}, place, attributes) : place
        )
      }

      case EDIT_PLACE_TEMPLATE_ATTRIBUTE: {
        return state.map((place) => {
          if (place.id === action.id) {
            return {
              ...place,
              templates: place.templates.map((template) => {
                // @ts-ignore
                if (template.id === action.templateId) {
                  return {
                    // @ts-ignore
                    ...template,
                    [action.name]: action.value,
                  }
                }
                return template
              }),
            }
          }
          return place
        })
      }

      case EDIT_PLACES_ATTRIBUTE:
        if (
          action.oldAttribute.type != 'text' &&
          action.oldAttribute.name == action.newAttribute.name
        )
          return state

        return state.map((p) => {
          let pl = cloneDeep(p)

          if (action.oldAttribute.name != action.newAttribute.name) {
            // Firebase doesn't support undefined, so use null when the attribute isn't set
            pl[action.newAttribute.name] = pl[action.oldAttribute.name] || null
            delete pl[action.oldAttribute.name]
          }

          // reset value to blank string
          // (if changing to something other than text type)
          // see ../selectors/customAttributes.js for when this is allowed
          if (action.oldAttribute.type == 'text') {
            let desc = pl[action.newAttribute.name]
            if (!desc || (desc && desc.length && typeof desc !== 'string')) {
              desc = ''
            }
            pl[action.newAttribute.name] = desc
          }
          return pl
        })

      case ATTACH_PLACE_TO_CARD:
        return state.map((place) => {
          let cards = cloneDeep(place.cards)
          cards.push(action.id)
          return place.id === action.placeId ? Object.assign({}, place, { cards: cards }) : place
        })

      case REMOVE_PLACE_FROM_CARD:
        return state.map((place) => {
          let cards = cloneDeep(place.cards)
          cards.splice(cards.indexOf(action.id), 1)
          return place.id === action.placeId ? Object.assign({}, place, { cards: cards }) : place
        })

      case ATTACH_PLACE_TO_NOTE:
        return state.map((place) => {
          let notes = cloneDeep(place.noteIds)
          notes.push(action.id)
          return place.id === action.placeId ? Object.assign({}, place, { noteIds: notes }) : place
        })

      case REMOVE_PLACE_FROM_NOTE:
        return state.map((place) => {
          let notes = cloneDeep(place.noteIds)
          notes.splice(notes.indexOf(action.id), 1)
          return place.id === action.placeId ? Object.assign({}, place, { noteIds: notes }) : place
        })

      case ATTACH_TAG_TO_PLACE:
        return state.map((place) => {
          let tags = cloneDeep(place.tags)
          tags.push(action.tagId)
          return place.id === action.id ? Object.assign({}, place, { tags: tags }) : place
        })

      case REMOVE_TAG_FROM_PLACE:
        return state.map((place) => {
          let tags = cloneDeep(place.tags)
          tags.splice(tags.indexOf(action.tagId), 1)
          return place.id === action.id ? Object.assign({}, place, { tags: tags }) : place
        })

      case DELETE_TAG:
        return state.map((place) => {
          // @ts-ignore
          if (place.tags.includes(action.id)) {
            let tags = cloneDeep(place.tags)
            tags.splice(tags.indexOf(action.id), 1)
            return Object.assign({}, place, { tags: tags })
          } else {
            return place
          }
        })

      case ATTACH_BOOK_TO_PLACE:
        return state.map((place) => {
          let bookIds = cloneDeep(place.bookIds)
          bookIds.push(action.bookId)
          return place.id === action.id ? Object.assign({}, place, { bookIds: bookIds }) : place
        })

      case REMOVE_BOOK_FROM_PLACE:
        return state.map((place) => {
          let bookIds = cloneDeep(place.bookIds)
          bookIds.splice(bookIds.indexOf(action.bookId), 1)
          return place.id === action.id ? Object.assign({}, place, { bookIds: bookIds }) : place
        })

      case DELETE_NOTE:
        return state.map((place) => {
          let notes = cloneDeep(place.noteIds)
          if (!notes) {
            return place
          } else if (!notes.includes(action.id)) {
            return place
          } else {
            notes.splice(notes.indexOf(action.id), 1)
            return Object.assign({}, place, { noteIds: notes })
          }
        })

      case DELETE_CARD:
        return state.map((place) => {
          let cards = cloneDeep(place.cards)
          if (!cards) {
            return place
          } else if (cards.indexOf(action.id) === -1) {
            return place
          } else {
            cards.splice(cards.indexOf(action.id), 1)
            return Object.assign({}, place, { cards: cards })
          }
        })

      case DELETE_PLACE:
        return state.filter((place) => place.id !== action.id)

      case DELETE_IMAGE:
        return state.map((pl) => {
          if (action.id == pl.imageId) {
            return {
              ...pl,
              imageId: null,
            }
          } else {
            return pl
          }
        })

      case DELETE_PLACE_CATEGORY: {
        return state.map((place) => {
          // In one case the ids are strings and the other they are numbers
          // so just to be safe string them both
          if (String(place.categoryId) !== String(action.category.id)) {
            return place
          }

          return {
            ...place,
            categoryId: null,
          }
        })
      }

      case FILE_LOADED:
        return action.data.places.map((place) => {
          const normalizeRCEContent = repair('normalizeRCEContent')
          return {
            ...place,
            ...applyToCustomAttributes(
              place,
              normalizeRCEContent,
              action.data.customAttributes.places,
              'paragraph'
            ),
            notes: normalizeRCEContent(place.notes),
          }
        })

      case NEW_FILE:
        return newFilePlaces

      case LOAD_PLACES:
        return action.places

      case LOAD_PLACE: {
        let didUpdate = false
        const updated = state.map((place) => {
          if (place.id === action.place.id) {
            didUpdate = true
            return action.place
          } else {
            return place
          }
        })

        if (didUpdate) {
          return updated
        } else {
          return [...state, action.place]
        }
      }

      case BATCH_LOAD_PLACE: {
        const indexedPlacesToLoad = action.places.reduce((acc, next) => {
          acc.set(next.id, next)
          return acc
        }, new Map())
        const existingPlaces = new Set()
        const updated = state.map((place) => {
          existingPlaces.add(place.id)
          const placeToSwapIn = indexedPlacesToLoad.get(place.id)
          if (typeof placeToSwapIn !== 'undefined') {
            return placeToSwapIn
          } else {
            return place
          }
        })

        const newPlaces = action.places.filter((newPlace) => {
          return !existingPlaces.has(newPlace.id)
        })

        return [...updated, ...newPlaces]
      }

      case REMOVE_PLACE: {
        return state.filter(({ id }) => {
          return id !== action.place.id
        })
      }

      case DUPLICATE_PLACE: {
        const itemToDuplicate = state.find(({ id }) => id === action.id)
        if (!itemToDuplicate) {
          return state
        }
        const duplicated = {
          ...cloneDeep(itemToDuplicate),
          id: nextId(state),
        }
        return [...state, { ...duplicated }]
      }

      case ADD_PLACE_FROM_PLTR: {
        if (
          typeof action?.place?.id !== 'number' ||
          state.find(({ id }) => {
            return id === action.place.id
          })
        ) {
          return state
        } else {
          const newPlace = omit(cloneDeep(action.place), 'isChecked')
          return [...state, newPlace]
        }
      }

      case EDIT_PLACE_NAME: {
        return state.map((place) => {
          if (place.id === action.id) {
            return {
              ...place,
              name: action.newName,
            }
          }
          return place
        })
      }

      case EDIT_PLACE_DESCRIPTION: {
        return state.map((place) => {
          if (place.id === action.id) {
            return {
              ...place,
              description: action.newDescription,
            }
          }
          return place
        })
      }

      case EDIT_PLACE_NOTES: {
        return state.map((place) => {
          if (place.id === action.id) {
            return {
              ...place,
              notes: action.newNotes,
            }
          }
          return place
        })
      }

      case EDIT_PLACE_CUSTOM_ATTRIBUTE: {
        return state.map((place) => {
          if (place.id === action.id) {
            return {
              ...place,
              [action.name]: action.newValue,
            }
          }
          return place
        })
      }

      case REPLACE_MARKED_HITS: {
        const applicableHits = action.hitsMarkedForReplacement.filter((hit) => {
          return hit.path.match(/^\/places\/[0-9a-zA-Z]+\//)
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
          const [_, _place, rawPlaceId, attributeName, rawFocusStart] = path.split('/')
          const placeId = safeParseInt(rawPlaceId)
          return acc.map((nextplace) => {
            if (nextplace.id === placeId) {
              const attributeValue = nextplace[attributeName]
              const focusStart = safeParseInt(rawFocusStart)
              const replaceFunction = Array.isArray(attributeValue)
                ? replaceInSlateDatastructure
                : replacePlainTextHit
              return {
                ...nextplace,
                [attributeName]: replaceFunction(
                  attributeValue,
                  focusStart,
                  hit,
                  action.replacementText
                ),
              }
            } else {
              return nextplace
            }
          })
        }, state)
      }

      case REORDER_PLACE_MANUALLY: {
        const { id, oldPosition, newPosition, newCategoryId, direction, placesByCategory } = action
        const moveUp = direction === 'up'
        const originalPlace = state.find((place) => place.id == id)
        // @ts-ignore
        const isNewcategory = originalPlace.categoryId != newCategoryId
        const reorderedList = Object.values(placesByCategory).flatMap((group) => {
          const groupCategory = group[0].categoryId

          if (!isNewcategory && groupCategory == newCategoryId) {
            return moveToAbove(oldPosition, newPosition, group, moveUp)
          } else if (isNewcategory && groupCategory == newCategoryId) {
            const newPlace = {
              ...originalPlace,
              position: newPosition,
              categoryId: newCategoryId,
            }
            const placesInCategoryHasPositions = group.every((place) => isNumber(place?.position))
            if (!placesInCategoryHasPositions) {
              const placesWithPositions = positionReset(group)
              return moveItemToPosition(newPosition, placesWithPositions, newPlace, moveUp)
            } else {
              return moveItemToPosition(newPosition, group, newPlace, moveUp)
            }
            // @ts-ignore
          } else if (isNewcategory && originalPlace.categoryId == groupCategory) {
            const filteredGroup = group.filter((grp) => grp.id != id)
            return positionReset(filteredGroup)
          }
          return group
        })

        return reorderedList
      }

      case UNDO_N_TIMES:
      case REDO_N_TIMES:
      case UNDO:
      case REDO: {
        if (Array.isArray(action.state.places)) {
          return action.state.places
        } else {
          return state
        }
      }

      default:
        return state
    }
  }

export default places
