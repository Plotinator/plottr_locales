import {
  ADD_BEAT,
  EDIT_BEAT_TITLE,
  REORDER_BEATS,
  DELETE_BEAT,
  AUTO_SORT_BEAT,
  INSERT_BEAT,
  EXPAND_BEAT,
  COLLAPSE_BEAT,
  LOAD_BEATS,
  APPEND_TOP_LEVEL_BEAT,
  RESTRUCTURE_TIMELINE,
} from '../constants/ActionTypes'
import { beat } from '../store/initialState'

export function addBeat(bookId, parentId) {
  return { type: ADD_BEAT, title: beat.title, bookId, parentId }
}

export function editBeatTitle(id, bookId, title) {
  return { type: EDIT_BEAT_TITLE, id, bookId, title }
}

export function reorderBeats(beatId, beatDroppedOnto, bookId) {
  return { type: REORDER_BEATS, beatId, beatDroppedOnto, bookId }
}

export function insertBeat(bookId, peerBeatId) {
  return { type: INSERT_BEAT, bookId, peerBeatId }
}

export function deleteBeat(id, bookId) {
  return { type: DELETE_BEAT, id, bookId }
}

export function autoSortBeat(id, bookId) {
  return { type: AUTO_SORT_BEAT, id, bookId }
}

export function expandBeat(id, bookId) {
  return { type: EXPAND_BEAT, id, bookId }
}

export function collapseBeat(id, bookId) {
  return { type: COLLAPSE_BEAT, id, bookId }
}

export function appendTopLevelBeat(bookId) {
  return { type: APPEND_TOP_LEVEL_BEAT, bookId }
}

export function restructureTimeline(flatBeats, beatHierarchyLevels) {
  return { type: RESTRUCTURE_TIMELINE, flatBeats, beatHierarchyLevels }
}

export function load(patching, beats) {
  return { type: LOAD_BEATS, patching, beats }
}
