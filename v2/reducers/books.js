import { find, mapValues } from 'lodash'
import {
  FILE_LOADED,
  NEW_FILE,
  EDIT_BOOK,
  ADD_BOOK,
  DELETE_BOOK,
  REORDER_BOOKS,
  ADD_LINES_FROM_TEMPLATE,
  CLEAR_TEMPLATE_FROM_TIMELINE,
  LOAD_BOOKS,
  ADD_BOOK_FROM_TEMPLATE,
  DELETE_IMAGE,
  EDIT_BOOK_IMAGE,
  SET_BOOK_TITLE,
  SET_BOOK_PREMISE,
  SET_BOOK_THEME,
  SET_BOOK_GENRE,
  DUPLICATE_BOOK,
  REPLACE_MARKED_HITS,
  UNDO,
  REDO,
  UNDO_N_TIMES,
  REDO_N_TIMES,
} from '../constants/ActionTypes'
import { getCopyName, isSeries } from '../helpers/books'
import { book as defaultBook } from '../store/initialState'
import { newFileBooks } from '../store/newFileState'
import { safeParseInt } from './safeParseInt'
import { sortByHitPosition } from './sortByHitPosition'
import { replacePlainTextHit } from './replace'
import { parseNumberOrString } from './parseNumberOrString'

const initialState = {
  allIds: [1],
  1: defaultBook,
}

const books =
  (dataRepairers) =>
  (state = initialState, action) => {
    switch (action.type) {
      case EDIT_BOOK: {
        // this allows us to edit new book with
        // any predefined param values only within
        // the scope of the new book schema
        if (!action.id) return state
        const editedBook = Object.assign({}, defaultBook, state[action.id])
        Object.keys(defaultBook).forEach((key) => {
          if (action[key] !== undefined) editedBook[key] = action[key]
        })
        return {
          ...state,
          [action.id]: editedBook,
        }
      }

      case EDIT_BOOK_IMAGE:
        return {
          ...state,
          [action.id]: {
            ...state[action.id],
            imageId: action.imageId,
          },
        }

      case ADD_BOOK_FROM_TEMPLATE: {
        if (typeof action.templateData?.id === 'string') {
          return {
            ...state,
            allIds: [...state.allIds, action.newBookId],
            [action.newBookId]: {
              ...action.book,
              id: action.newBookId,
              title: action.title ?? '',
              premise: action.premise ?? '',
              genre: action.genre ?? '',
              theme: action.theme ?? '',
              timelineTemplates: [action.templateData.id],
            },
          }
        } else {
          return state
        }
      }

      case ADD_BOOK: {
        return {
          ...state,
          allIds: [...state.allIds, action.newBookId],
          [action.newBookId]: {
            ...action.book,
            id: action.newBookId,
            title: action.title ?? '',
            premise: action.premise ?? '',
            genre: action.genre ?? '',
            theme: action.theme ?? '',
          },
        }
      }

      case DUPLICATE_BOOK: {
        const duplicatedBook = find(state, (book) => book.id === action.id)
        const duplicatedIndex = state.allIds.indexOf(action.id)
        const titleWithCopy = getCopyName(
          Object.values(state),
          `${duplicatedBook.title} - copy`,
          'title'
        )

        let newIds = []
        if (duplicatedIndex !== -1) {
          newIds = [
            ...state.allIds.slice(0, duplicatedIndex + 1),
            action.newBookId,
            ...state.allIds.slice(duplicatedIndex + 1),
          ]
        } else {
          newIds = [...state.allIds, action.newBookId]
        }

        return {
          ...state,
          allIds: newIds,
          [action.newBookId]: {
            ...duplicatedBook,
            title: titleWithCopy,
            id: action.newBookId,
          },
        }
      }

      case REPLACE_MARKED_HITS: {
        const applicableHits = action.hitsMarkedForReplacement.filter((hit) => {
          return hit.path.startsWith('/project/book')
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
          const [_, _project, _series, rawBookId, attribute, rawFocusStart] = path.split('/')
          const focusStart = safeParseInt(rawFocusStart)
          const bookId = parseNumberOrString(rawBookId)
          if (['title', 'premise', 'genre', 'theme'].indexOf(attribute) !== -1) {
            return {
              ...acc,
              [bookId]: {
                ...acc[bookId],
                [attribute]: replacePlainTextHit(
                  acc[bookId][attribute],
                  focusStart,
                  hit,
                  action.replacementText
                ),
              },
            }
          } else {
            return acc
          }
        }, state)
      }

      case REORDER_BOOKS:
        return {
          ...state,
          allIds: action.ids,
        }

      case DELETE_BOOK: {
        const newIds = [...state.allIds]
        newIds.splice(newIds.indexOf(action.id), 1)
        return state.allIds.reduce(
          (acc, id) => {
            if (id != action.id) {
              acc[id] = state[id]
            }
            return acc
          },
          { allIds: newIds }
        )
      }

      case ADD_LINES_FROM_TEMPLATE:
        if (isSeries(action.bookId)) return state
        return {
          ...state,
          [action.bookId]: {
            ...state[action.bookId],
            timelineTemplates: [...state[action.bookId].timelineTemplates, action.templateData.id],
          },
        }

      case CLEAR_TEMPLATE_FROM_TIMELINE:
        return {
          ...state,
          [action.bookId]: {
            ...state[action.bookId],
            timelineTemplates: state[action.bookId].timelineTemplates.filter(
              (tt) => tt.id != action.templateId
            ),
          },
        }

      case DELETE_IMAGE:
        return mapValues(state, (value, key) => {
          if (
            !Array.isArray(value) &&
            value instanceof Object &&
            value.imageId &&
            value.imageId == action.id
          ) {
            return {
              ...value,
              imageId: null,
            }
          }
          return value
        })

      case SET_BOOK_TITLE: {
        return mapValues(state, (value, key) => {
          if (!Array.isArray(value) && value instanceof Object && value.id === action.id) {
            return {
              ...value,
              title: action.title,
            }
          }
          return value
        })
      }

      case SET_BOOK_PREMISE: {
        return mapValues(state, (value, key) => {
          if (!Array.isArray(value) && value instanceof Object && value.id === action.id) {
            return {
              ...value,
              premise: action.premise,
            }
          }
          return value
        })
      }

      case SET_BOOK_GENRE: {
        return mapValues(state, (value, key) => {
          if (!Array.isArray(value) && value instanceof Object && value.id === action.id) {
            return {
              ...value,
              genre: action.genre,
            }
          }
          return value
        })
      }

      case SET_BOOK_THEME: {
        return mapValues(state, (value, key) => {
          if (!Array.isArray(value) && value instanceof Object && value.id === action.id) {
            return {
              ...value,
              theme: action.theme,
            }
          }
          return value
        })
      }

      case FILE_LOADED:
        return action.data.books

      case NEW_FILE:
        return newFileBooks

      case UNDO_N_TIMES:
      case REDO_N_TIMES:
      case UNDO:
      case REDO: {
        if (action?.state?.books && typeof action.state.books === 'object') {
          return action.state.books
        } else {
          return state
        }
      }

      case LOAD_BOOKS:
        return action.books

      default:
        return state
    }
  }

export default books
