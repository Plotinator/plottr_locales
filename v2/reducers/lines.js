import { cloneDeep, sortBy } from 'lodash'
import { t } from 'plottr_locales'
import {
  ADD_LINE,
  ADD_LINE_WITH_TITLE,
  ADD_LINES_FROM_TEMPLATE,
  EDIT_LINE_TITLE,
  EXPAND_LINE,
  COLLAPSE_LINE,
  EDIT_LINE,
  EXPAND_TIMELINE,
  COLLAPSE_TIMELINE,
  CLEAR_TEMPLATE_FROM_TIMELINE,
  RESET_TIMELINE,
  EDIT_LINE_COLOR,
  REORDER_LINES,
  DELETE_LINE,
  FILE_LOADED,
  NEW_FILE,
  RESET,
  DELETE_BOOK,
  LOAD_LINES,
  ADD_BOOK_FROM_TEMPLATE,
  ADD_BOOK,
  DUPLICATE_LINE,
  MOVE_LINE,
  PIN_PLOTLINE,
  UNPIN_PLOTLINE,
  DUPLICATE_BOOK,
  REPLACE_MARKED_HITS,
} from '../constants/ActionTypes'
import { line } from '../store/initialState'
import { newFileLines, newFileSeriesLines } from '../store/newFileState'
import { nextId } from '../store/newIds'
import { nextColor } from '../store/lineColors'
import { nextPositionInBook, positionReset } from '../helpers/lists'
import { associateWithBroadestScope, isNotSeries } from '../helpers/lines'
import { sortByHitPosition } from './sortByHitPosition'
import { safeParseInt } from './safeParseInt'
import { replacePlainTextHit, replaceInSlateDatastructure } from './replace'

// bookId is:
// Union of:
//  - bookId: Number,
//  - "series": String literal,

const lines = (dataRepairers) => (state, action) => {
  const actionBookId = associateWithBroadestScope(action.bookId || action.newBookId)

  switch (action.type) {
    case ADD_LINE: {
      const linesInBook = state.filter((l) => l.bookId == actionBookId).length
      return [
        {
          id: nextId(state),
          bookId: actionBookId,
          title: '',
          color: nextColor(linesInBook),
          position: nextPositionInBook(state, actionBookId),
          expanded: null,
          fromTemplateId: null,
        },
        ...state,
      ]
    }

    case ADD_BOOK:
    case ADD_LINE_WITH_TITLE: {
      const linesInBook_ = state.filter((l) => l.bookId == actionBookId).length
      return [
        {
          ...line,
          id: nextId(state),
          bookId: actionBookId,
          title: (action.type !== ADD_BOOK && action.title) || t('Main Plot'),
          color: nextColor(linesInBook_),
          position: nextPositionInBook(state, actionBookId),
        },
        ...state,
      ]
    }

    case ADD_LINES_FROM_TEMPLATE:
    case ADD_BOOK_FROM_TEMPLATE: {
      const linesInBook = state.filter((l) => l.bookId == actionBookId)
      const nextPosition = nextPositionInBook(linesInBook, actionBookId)
      const newLines = action.templateData.lines
        .filter(({ bookId }) => bookId !== 'series') // this is to protect against a bad template that unnecessarily had a series line
        .map((l, index) => {
          const newLine = cloneDeep(l)
          newLine.id = action.nextLineId + newLine.id // give it a new id
          newLine.bookId = actionBookId // add it to the new/current book
          newLine.position = nextPosition + newLine.position // put it in the right position
          newLine.fromTemplateId = action.id || action.templateData.id
          if (!newLine.color || newLine.color == nextColor(0)) {
            newLine.color = nextColor(linesInBook.length + index)
          }
          return newLine
        })
      return [
        ...positionReset(
          sortBy(
            [...state, ...newLines],
            [(item) => (item?.isPinned === true ? 'isPinned' : 'position')]
          )
        ),
      ]
    }

    case DUPLICATE_BOOK: {
      const newLines = action.newLines
        .filter(({ bookId }) => bookId !== 'series') // this is to protect against a bad template that unnecessarily had a series line
        .map((l, index) => {
          const newLine = cloneDeep(l)
          newLine.id = action.nextLineId + newLine.id // give it a new id
          newLine.bookId = action.newBookId // add it to the new/current book
          return newLine
        })
      return [...state, ...newLines]
    }

    case EDIT_LINE:
      return state.map((l) =>
        l.id === action.id ? Object.assign({}, l, { title: action.title, color: action.color }) : l
      )

    case EDIT_LINE_TITLE:
      return state.map((l) =>
        l.id === action.id ? Object.assign({}, l, { title: action.title }) : l
      )

    case EDIT_LINE_COLOR:
      return state.map((l) =>
        l.id === action.id ? Object.assign({}, l, { color: action.color }) : l
      )

    case DELETE_BOOK:
      return state.filter(({ bookId }) => bookId !== action.id)

    case DELETE_LINE:
      return state.filter((l) => l.id !== action.id)

    case PIN_PLOTLINE: {
      const bookLines = action.lines.map((l) =>
        l.id === action.lineId && l.bookId === action.bookId
          ? Object.assign({}, l, { isPinned: true, expanded: false })
          : l
      )
      return [
        ...state.filter((l) => l && l.bookId != actionBookId),
        ...positionReset(
          sortBy(bookLines, [(item) => (item?.isPinned === true ? 'isPinned' : 'position')])
        ),
      ]
    }

    case UNPIN_PLOTLINE: {
      const bookLines = action.lines.map((l) =>
        l.id === action.lineId && l.bookId === action.bookId
          ? Object.assign({}, l, { isPinned: false })
          : l
      )
      return [
        ...state.filter((l) => l && l.bookId != actionBookId),
        ...positionReset(
          sortBy(bookLines, [(item) => (item?.isPinned === true ? 'isPinned' : 'position')])
        ),
      ]
    }

    case REORDER_LINES:
      return [...state.filter((l) => l && l.bookId != actionBookId), ...positionReset(action.lines)]

    case EXPAND_LINE:
      return state.map((l) =>
        l.id === action.id && !l?.isPinned ? Object.assign({}, l, { expanded: true }) : l
      )

    case COLLAPSE_LINE:
      return state.map((l) => (l.id === action.id ? Object.assign({}, l, { expanded: false }) : l))

    case COLLAPSE_TIMELINE:
    case EXPAND_TIMELINE:
      return state.map((l) => (!l?.isPinned ? Object.assign({}, l, { expanded: null }) : l))

    case CLEAR_TEMPLATE_FROM_TIMELINE: {
      const values = state.reduce(
        (acc, line) => {
          if (line.bookId == actionBookId) {
            if (line.fromTemplateId != action.templateId) acc.book.push(line)
          } else {
            acc.notBook.push(line)
          }
          return acc
        },
        { book: [], notBook: [] }
      )
      const bookLines = positionReset(sortBy(values.book, 'position'))
      return values.notBook.concat(bookLines)
    }

    case RESET_TIMELINE: {
      // remove any from this book
      const linesToKeep = action.isSeries
        ? state.filter(isNotSeries)
        : state.filter((line) => line.bookId != actionBookId)
      // create a new line in the book so there's 1
      return [
        {
          id: nextId(state),
          bookId: actionBookId,
          title: t('Main Plot'),
          color: nextColor(0),
          position: 0,
          expanded: null,
          fromTemplateId: null,
        },
        ...linesToKeep,
      ]
    }

    case DUPLICATE_LINE: {
      const lineToDuplicate = state.find(({ id }) => id === action.id)
      // Couldn't find the requested line
      if (!lineToDuplicate) {
        return state
      }
      const duplicatedLine = {
        ...cloneDeep(lineToDuplicate),
        id: action.newLineId,
        position: action.position,
      }
      const linesInBook = state.filter(({ bookId }) => bookId === lineToDuplicate.bookId)
      const linesInBookWithUpdatedPositions = linesInBook.map((line) => {
        if (line.position < action.position) {
          return line
        } else {
          return {
            ...line,
            position: line.position + 1,
          }
        }
      })
      const linesNotInBook = state.filter(({ bookId }) => bookId !== lineToDuplicate.bookId)
      return [...linesInBookWithUpdatedPositions, ...linesNotInBook, duplicatedLine]
    }

    case MOVE_LINE: {
      return state.map((line) => {
        if (line.id === action.id) {
          return {
            ...line,
            bookId: action.destinationBookId,
          }
        }
        return line
      })
    }

    case REPLACE_MARKED_HITS: {
      const applicableHits = action.hitsMarkedForReplacement.filter((hit) => {
        // Only support replacing line titles for now.
        return hit.path.match(/^\/lines\/[0-9a-zA-Z]+\/title\/[0-9]+/)
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
        const [_, _lines, rawLineId, type, ...rest] = path.split('/')
        const lineId = safeParseInt(rawLineId)
        return acc.map((nextLine) => {
          if (nextLine.id === lineId) {
            const [rawFocusStart] = rest
            const attributeName = type
            const attributeValue = nextLine[attributeName]
            const focusStart = safeParseInt(rawFocusStart)
            const replaceFunction = Array.isArray(attributeValue)
              ? replaceInSlateDatastructure
              : replacePlainTextHit
            return {
              ...nextLine,
              [attributeName]: replaceFunction(
                attributeValue,
                focusStart,
                hit,
                action.replacementText
              ),
            }
          } else {
            return nextLine
          }
        })
      }, state)
    }

    case RESET:
    case FILE_LOADED:
      return action.data.lines

    case NEW_FILE:
      return newFileLines

    case LOAD_LINES:
      return action.lines

    default:
      return state || [...newFileLines(), ...newFileSeriesLines()]
  }
}

export default lines
