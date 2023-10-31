import { cloneDeep, groupBy, sortBy } from 'lodash'
import {
  ADD_NOTE,
  EDIT_NOTE,
  DELETE_NOTE,
  FILE_LOADED,
  NEW_FILE,
  RESET,
  ATTACH_CHARACTER_TO_NOTE,
  REMOVE_CHARACTER_FROM_NOTE,
  ATTACH_PLACE_TO_NOTE,
  REMOVE_PLACE_FROM_NOTE,
  ATTACH_TAG_TO_NOTE,
  REMOVE_TAG_FROM_NOTE,
  DELETE_TAG,
  DELETE_CHARACTER,
  DELETE_PLACE,
  DELETE_IMAGE,
  ATTACH_BOOK_TO_NOTE,
  REMOVE_BOOK_FROM_NOTE,
  EDIT_NOTES_ATTRIBUTE,
  DELETE_NOTE_CATEGORY,
  LOAD_NOTES,
  LOAD_NOTE,
  BATCH_LOAD_NOTE,
  REMOVE_NOTE,
  EDIT_NOTE_TEMPLATE_ATTRIBUTE,
  DUPLICATE_NOTE,
  EDIT_NOTE_CONTENT,
  EDIT_NOTE_TITLE,
  EDIT_NOTE_CUSTOM_ATTRIBUTE,
  REPLACE_MARKED_HITS,
  REORDER_NOTE_MANUALLY,
} from '../constants/ActionTypes'
import { note } from '../store/initialState'
import { newFileNotes } from '../store/newFileState'
import { nextId } from '../store/newIds'
import { applyToCustomAttributes } from './applyToCustomAttributes'
import { repairIfPresent } from './repairIfPresent'
import { positionReset, reorderList } from '../helpers/lists'
import { safeParseInt } from './safeParseInt'
import { sortByHitPosition } from './sortByHitPosition'
import { replacePlainTextHit, replaceInSlateDatastructure } from './replace'

const initialState = [note]

const notes =
  (dataRepairers) =>
  (state = initialState, action) => {
    const repair = repairIfPresent(dataRepairers)
    switch (action.type) {
      case ADD_NOTE: {
        const newNote = {
          ...note,
          id: nextId(state),
        }
        // this allows us to add new notes with
        // any predefined param values only within
        // the scope of the new note schema
        Object.keys(note).forEach((key) => {
          if (action[key] !== undefined) newNote[key] = action[key]
        })
        return [...state, newNote]
      }

      case EDIT_NOTE: {
        const attributes = Object.keys(action.attributes).reduce((acc, nextKey) => {
          const attribute = action.attributes[nextKey]
          return {
            ...acc,
            [nextKey]: typeof attribute.value === 'undefined' ? attribute : attribute.value,
          }
        }, {})
        const lastEdited = { lastEdited: new Date().getTime() }
        return state.map((note) =>
          note.id === action.id ? Object.assign({}, note, attributes, lastEdited) : note
        )
      }

      case EDIT_NOTE_CONTENT: {
        return state.map((note) => {
          if (note.id === action.id) {
            return {
              ...note,
              content: action.newContent,
            }
          }
          return note
        })
      }

      case EDIT_NOTE_TITLE: {
        return state.map((note) => {
          if (note.id === action.id) {
            return {
              ...note,
              title: action.newTitle,
            }
          }
          return note
        })
      }

      case REORDER_NOTE_MANUALLY: {
        const { id, oldPosition, newPosition, newCategoryId } = action
        const originalNote = state.find((note) => note.id == id)
        const isNewcategory = originalNote.categoryId != newCategoryId
        const notesByCategory = groupBy(state, 'categoryId')

        const reorderedList = Object.values(notesByCategory).flatMap((group) => {
          const groupCategory = group[0].categoryId

          if (!isNewcategory && groupCategory == newCategoryId) {
            return reorderList(newPosition, oldPosition, group)
          } else if (isNewcategory && groupCategory == newCategoryId) {
            const note = {
              ...originalNote,
              position: newPosition,
              categoryId: newCategoryId,
            }
            return positionReset(sortBy([...group, note], ['position', 'lastEdited']))
          } else if (isNewcategory && originalNote.categoryId == groupCategory) {
            const filteredGroup = group.filter((grp) => grp.id != id)
            return positionReset(sortBy(filteredGroup, ['position', 'lastEdited']))
          }
          return group
        })

        return reorderedList
      }

      case DUPLICATE_NOTE: {
        const itemToDuplicate = state.find(({ id }) => id === action.id)
        if (!itemToDuplicate) {
          return state
        }
        const duplicated = {
          ...cloneDeep(itemToDuplicate),
          id: nextId(state),
        }
        return [...state, { ...duplicated, lastEdited: action.lastEdited }]
      }

      case EDIT_NOTE_TEMPLATE_ATTRIBUTE: {
        return state.map((note) => {
          if (note.id === action.id) {
            return {
              ...state,
              templates: note.templates.map((template) => {
                if (template.id === action.templateId) {
                  return {
                    ...template,
                    [action.name]: action.value,
                  }
                }
                return template
              }),
            }
          }
          return state
        })
      }

      case EDIT_NOTES_ATTRIBUTE:
        if (
          action.oldAttribute.type != 'text' &&
          action.oldAttribute.name == action.newAttribute.name
        )
          return state

        return state.map((n) => {
          let note = cloneDeep(n)

          if (action.oldAttribute.name != action.newAttribute.name) {
            // Firebase doesn't support undefined, so use null when the attribute isn't set
            note[action.newAttribute.name] = note[action.oldAttribute.name] || null
            delete note[action.oldAttribute.name]
          }

          // reset value to blank string
          // (if changing to something other than text type)
          // see ../selectors/customAttributes.js for when this is allowed
          if (action.oldAttribute.type == 'text') {
            let desc = note[action.newAttribute.name]
            if (!desc || (desc && desc.length && typeof desc !== 'string')) {
              desc = ''
            }
            note[action.newAttribute.name] = desc
          }
          return note
        })

      case DELETE_NOTE:
        return state.filter((note) => note.id !== action.id)

      case ATTACH_CHARACTER_TO_NOTE:
        return state.map((note) => {
          let characters = cloneDeep(note.characters)
          characters.push(action.characterId)
          return note.id === action.id ? Object.assign({}, note, { characters: characters }) : note
        })

      case REMOVE_CHARACTER_FROM_NOTE:
        return state.map((note) => {
          let characters = cloneDeep(note.characters)
          characters.splice(characters.indexOf(action.characterId), 1)
          return note.id === action.id ? Object.assign({}, note, { characters: characters }) : note
        })

      case ATTACH_PLACE_TO_NOTE:
        return state.map((note) => {
          let places = cloneDeep(note.places)
          places.push(action.placeId)
          return note.id === action.id ? Object.assign({}, note, { places: places }) : note
        })

      case DELETE_NOTE_CATEGORY:
        return state.map((note) => {
          // In one case the ids are strings and the other they are numbers
          // so just to be safe string them both
          if (String(note.categoryId) !== String(action.category.id)) {
            return note
          }

          return {
            ...note,
            categoryId: null,
          }
        })

      case REMOVE_PLACE_FROM_NOTE:
        return state.map((note) => {
          let places = cloneDeep(note.places)
          places.splice(places.indexOf(action.placeId), 1)
          return note.id === action.id ? Object.assign({}, note, { places: places }) : note
        })

      case ATTACH_TAG_TO_NOTE:
        return state.map((note) => {
          let tags = cloneDeep(note.tags)
          tags.push(action.tagId)
          return note.id === action.id ? Object.assign({}, note, { tags: tags }) : note
        })

      case REMOVE_TAG_FROM_NOTE:
        return state.map((note) => {
          let tags = cloneDeep(note.tags)
          tags.splice(tags.indexOf(action.tagId), 1)
          return note.id === action.id ? Object.assign({}, note, { tags: tags }) : note
        })

      case ATTACH_BOOK_TO_NOTE:
        return state.map((note) => {
          let bookIds = cloneDeep(note.bookIds)
          bookIds.push(action.bookId)
          return note.id === action.id ? Object.assign({}, note, { bookIds: bookIds }) : note
        })

      case REMOVE_BOOK_FROM_NOTE:
        return state.map((note) => {
          let bookIds = cloneDeep(note.bookIds)
          bookIds.splice(bookIds.indexOf(action.bookId), 1)
          return note.id === action.id ? Object.assign({}, note, { bookIds: bookIds }) : note
        })

      case DELETE_TAG:
        return state.map((note) => {
          if (note.tags.includes(action.id)) {
            let tags = cloneDeep(note.tags)
            tags.splice(tags.indexOf(action.id), 1)
            return Object.assign({}, note, { tags: tags })
          } else {
            return note
          }
        })

      case DELETE_CHARACTER:
        return state.map((note) => {
          if (note.characters.includes(action.id)) {
            let characters = cloneDeep(note.characters)
            characters.splice(characters.indexOf(action.id), 1)
            return Object.assign({}, note, { characters: characters })
          } else {
            return note
          }
        })

      case DELETE_PLACE:
        return state.map((note) => {
          if (note.places.includes(action.id)) {
            let places = cloneDeep(note.places)
            places.splice(places.indexOf(action.id), 1)
            return Object.assign({}, note, { places: places })
          } else {
            return note
          }
        })

      case DELETE_IMAGE:
        return state.map((n) => {
          if (action.id == n.imageId) {
            return {
              ...n,
              imageId: null,
            }
          } else {
            return n
          }
        })

      case RESET:
      case FILE_LOADED: {
        const notes = action.data.notes || []
        return notes.map((note) => {
          const normalizeRCEContent = repair('normalizeRCEContent')
          return {
            ...note,
            ...applyToCustomAttributes(
              note,
              normalizeRCEContent,
              action.data.customAttributes.notes,
              'paragraph'
            ),
            content: normalizeRCEContent(note.content),
          }
        })
      }

      case EDIT_NOTE_CUSTOM_ATTRIBUTE: {
        return state.map((note) => {
          if (note.id === action.id) {
            return {
              ...note,
              [action.name]: action.newValue,
            }
          }
          return note
        })
      }

      case REPLACE_MARKED_HITS: {
        const applicableHits = action.hitsMarkedForReplacement.filter((hit) => {
          return hit.path.match(/^\/notes\/[0-9a-zA-Z]+\//)
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
          const [_, _note, rawNoteId, attributeName, rawFocusStart] = path.split('/')
          const noteId = safeParseInt(rawNoteId)
          return acc.map((nextNote) => {
            if (nextNote.id === noteId) {
              const attributeValue = nextNote[attributeName]
              const focusStart = safeParseInt(rawFocusStart)
              const replaceFunction = Array.isArray(attributeValue)
                ? replaceInSlateDatastructure
                : replacePlainTextHit
              return {
                ...nextNote,
                [attributeName]: replaceFunction(
                  attributeValue,
                  focusStart,
                  hit,
                  action.replacementText
                ),
              }
            } else {
              return nextNote
            }
          })
        }, state)
      }

      case NEW_FILE:
        return newFileNotes

      case LOAD_NOTES:
        return action.notes

      case LOAD_NOTE: {
        let didUpdate = false
        const updated = state.map((note) => {
          if (note.id === action.note.id) {
            didUpdate = true
            return action.note
          } else {
            return note
          }
        })

        if (didUpdate) {
          return updated
        } else {
          return [...state, action.note]
        }
      }

      case BATCH_LOAD_NOTE: {
        const indexedNotesToLoad = action.notes.reduce((acc, next) => {
          acc.set(next.id, next)
          return acc
        }, new Map())
        const existingNotes = new Set()
        const updated = state.map((note) => {
          existingNotes.add(note.id)
          const noteToSwapIn = indexedNotesToLoad.get(note.id)
          if (typeof noteToSwapIn !== 'undefined') {
            return noteToSwapIn
          } else {
            return note
          }
        })

        const newNotes = action.notes.filter((newNote) => {
          return !existingNotes.has(newNote.id)
        })

        return [...updated, ...newNotes]
      }

      case REMOVE_NOTE: {
        return state.filter(({ id }) => {
          return id !== action.note.id
        })
      }

      default:
        return state
    }
  }

export default notes
