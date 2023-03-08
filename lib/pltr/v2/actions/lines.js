import {
  ADD_LINE,
  ADD_LINE_WITH_TITLE,
  ADD_LINES_FROM_TEMPLATE,
  EDIT_LINE,
  EDIT_LINE_TITLE,
  EDIT_LINE_COLOR,
  REORDER_LINES,
  DELETE_LINE,
  EXPAND_LINE,
  COLLAPSE_LINE,
  LOAD_LINES,
  DUPLICATE_LINE,
  MOVE_LINE,
  PIN_PLOTLINE,
  UNPIN_PLOTLINE,
} from '../constants/ActionTypes'
import { reorderList } from '../helpers/lists'
import {
  allLinesSelector,
  currentTimelineSelector,
  pinnedPlotlinesSelector,
  sortedLinesByBookSelector,
  timelineSelector,
} from '../selectors'

// N.B. if one does not supply a book ID, then it is assumed that the
// action refers to the broadest scope possible, i.e. the series of
// books.

export function addLine(bookId) {
  return { type: ADD_LINE, bookId }
}

export function addLineWithTitle(title, bookId) {
  return { type: ADD_LINE_WITH_TITLE, title, bookId }
}

export function addLinesFromTemplate(templateData) {
  return { type: ADD_LINES_FROM_TEMPLATE, templateData }
}

export function editLine(id, title, color) {
  return { type: EDIT_LINE, id, title, color }
}

export function editLineTitle(id, title) {
  return { type: EDIT_LINE_TITLE, id, title }
}

export function editLineColor(id, color) {
  return { type: EDIT_LINE_COLOR, id, color }
}

export const reorderLines = (droppedPosition, originalPosition) => (dispatch, getState) => {
  const fullState = getState()
  const state = fullState.present ? fullState.present : fullState
  const lines = sortedLinesByBookSelector(state)
  const bookId = currentTimelineSelector(state)
  const isConflictWithPinned = lines.find((line) => {
    if (line.position >= 0 && line.isPinned && line.position == droppedPosition) {
      return line
    }
  })
  const isPinnedPlotline = lines.find((line) => {
    if (line.position >= 0 && line.isPinned && line.position == originalPosition) {
      return line
    }
  })

  const bothPinned = lines.find((line) => {
    if (
      line.isPinned &&
      line.position >= 0 &&
      line.position == droppedPosition &&
      isPinnedPlotline &&
      isPinnedPlotline.position >= 0 &&
      isPinnedPlotline.position == originalPosition
    ) {
      return line
    }
  })

  if ((!bothPinned && isPinnedPlotline) || (!bothPinned && isConflictWithPinned)) {
    return false
  }

  const reorderedLines = reorderList(droppedPosition, originalPosition, lines)
  return dispatch({ type: REORDER_LINES, lines: reorderedLines, bookId })
}

export const togglePinPlotline = (line) => (dispatch, getState) => {
  const fullState = getState()
  const state = fullState.present ? fullState.present : fullState
  const pinnedPlotlines = pinnedPlotlinesSelector(state)
  const lines = sortedLinesByBookSelector(state)
  const bookId = currentTimelineSelector(state)

  if (line?.id) {
    if (line?.isPinned) {
      const reorderedLines = reorderList(pinnedPlotlines - 1, line?.position, lines)
      const totalPinnedPlotlines = Math.max(0, pinnedPlotlines - 1)
      return dispatch({
        type: UNPIN_PLOTLINE,
        lineId: line.id,
        lines: reorderedLines,
        bookId,
        totalPinnedPlotlines,
      })
    } else {
      const reorderedLines = reorderList(pinnedPlotlines, line?.position, lines)
      const totalPinnedPlotlines = Math.max(1, pinnedPlotlines + 1)
      return dispatch({
        type: PIN_PLOTLINE,
        lineId: line.id,
        lines: reorderedLines,
        bookId,
        totalPinnedPlotlines,
      })
    }
  }
  return false
}

export const deleteLine = (id) => (dispatch, getState) => {
  const fullState = getState()
  const state = fullState.present ? fullState.present : fullState
  const pinnedPlotlines = pinnedPlotlinesSelector(state)
  const lines = sortedLinesByBookSelector(state)
  const bookId = currentTimelineSelector(state)

  const selectedLine = lines.find((l) => l.id === id)
  if (selectedLine?.isPinned) {
    const reorderedLines = reorderList(pinnedPlotlines - 1, selectedLine?.position, lines)
    const totalPinnedPlotlines = Math.max(0, pinnedPlotlines - 1)
    dispatch({
      type: UNPIN_PLOTLINE,
      lineId: selectedLine.id,
      lines: reorderedLines,
      bookId,
      totalPinnedPlotlines,
    })
  }
  return dispatch({ type: DELETE_LINE, id, bookId })
}

export function expandLine(id) {
  return { type: EXPAND_LINE, id }
}

export function collapseLine(id) {
  return { type: COLLAPSE_LINE, id }
}

const pinDuplicatedPlotline = (id, position) => (dispatch, getState) => {
  const fullState = getState()
  const state = fullState.present ? fullState.present : fullState
  const pinnedPlotlines = pinnedPlotlinesSelector(state)
  const lines = sortedLinesByBookSelector(state)
  const bookId = currentTimelineSelector(state)

  const selectedLine = lines.find((l) => l.id === id)
  const duplicatedLine = lines.find(
    (l) => l.title == selectedLine.title && l?.isPinned && selectedLine?.isPinned
  )
  if (duplicatedLine) {
    const reorderedLines = reorderList(pinnedPlotlines, position, lines)
    const totalPinnedPlotlines = Math.max(1, pinnedPlotlines + 1)
    return dispatch({
      type: PIN_PLOTLINE,
      lineId: id,
      lines: reorderedLines,
      bookId,
      totalPinnedPlotlines,
    })
  }
}

export const duplicateLine = (id, position) => (dispatch, getState) => {
  const fullState = getState()
  const state = fullState.present ? fullState.present : fullState
  const lines = sortedLinesByBookSelector(state)

  dispatch({ type: DUPLICATE_LINE, id, position })

  const selectedLine = lines.find((l) => l.id === id)
  if (selectedLine?.isPinned) {
    return pinDuplicatedPlotline(id, position)(dispatch, getState)
  }
}

export function load(patching, lines) {
  return { type: LOAD_LINES, patching, lines }
}

const pinMovedLine = (id, destinationBookId, position) => (dispatch, getState) => {
  const fullState = getState()
  const state = fullState.present ? fullState.present : fullState
  const lines = allLinesSelector(state)
  const destinationBookLines = lines.filter((l) => l.bookId === destinationBookId)
  const timeline = timelineSelector(state)
  const destinationBookPinnedPlotlines = timeline.pinnedPlotlines[destinationBookId]
  const reorderedLines = reorderList(
    destinationBookPinnedPlotlines + 1,
    position,
    destinationBookLines
  )
  return dispatch({
    type: PIN_PLOTLINE,
    lineId: id,
    lines: reorderedLines,
    bookId: destinationBookId,
    totalPinnedPlotlines: Math.max(1, destinationBookPinnedPlotlines + 1),
  })
}

export const moveLine = (id, destinationBookId) => (dispatch, getState) => {
  const fullState = getState()
  const state = fullState.present ? fullState.present : fullState
  const lines = sortedLinesByBookSelector(state)
  const bookId = currentTimelineSelector(state)
  const selectedLine = lines.find((l) => l.id === id)
  const timeline = timelineSelector(state)
  const currentBookPinnedPlotlines = timeline.pinnedPlotlines[bookId]

  if (selectedLine?.isPinned) {
    const reorderedLines = reorderList(currentBookPinnedPlotlines - 1, selectedLine.position, lines)
    dispatch({
      type: UNPIN_PLOTLINE,
      lineId: selectedLine.id,
      lines: reorderedLines,
      bookId,
      totalPinnedPlotlines: Math.max(0, currentBookPinnedPlotlines - 1),
    })
    dispatch({ type: MOVE_LINE, id, destinationBookId })
    return pinMovedLine(id, destinationBookId, selectedLine.position)(dispatch, getState)
  }
  return dispatch({ type: MOVE_LINE, id, destinationBookId })
}
