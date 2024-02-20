import { identity } from 'lodash'

import {
  ADD_PLACE,
  ADD_PLACE_WITH_VALUES,
  ATTACH_BOOK_TO_PLACE,
  ATTACH_TAG_TO_PLACE,
  DELETE_PLACE,
  DUPLICATE_PLACE,
  EDIT_PLACE,
  EDIT_PLACE_CUSTOM_ATTRIBUTE,
  EDIT_PLACE_DESCRIPTION,
  EDIT_PLACE_NAME,
  EDIT_PLACE_NOTES,
  EDIT_PLACE_TEMPLATE_ATTRIBUTE,
  LOAD_PLACES,
  LOAD_PLACE,
  BATCH_LOAD_PLACE,
  REMOVE_PLACE,
  REMOVE_BOOK_FROM_PLACE,
  REMOVE_TAG_FROM_PLACE,
  REORDER_PLACE_MANUALLY,
} from '../constants/ActionTypes'
import { place } from '../store/initialState'
import selectors from '../selectors'

const { visibleSortedPlacesByCategorySelector } = selectors(identity)

export function addPlace() {
  return { type: ADD_PLACE, name: place.name, description: place.description, notes: place.notes }
}

export function addPlaceWithValues(place) {
  return { type: ADD_PLACE_WITH_VALUES, place }
}

export function editPlace(id, attributes) {
  return { type: EDIT_PLACE, id, attributes }
}

export function duplicatePlace(id) {
  return { type: DUPLICATE_PLACE, id }
}

export function editPlaceTemplateAttribute(id, templateId, name, value, selection) {
  return {
    type: EDIT_PLACE_TEMPLATE_ATTRIBUTE,
    id,
    templateId,
    name,
    value,
    selection,
  }
}

export function deletePlace(id) {
  return { type: DELETE_PLACE, id }
}

export function addTag(id, tagId) {
  return { type: ATTACH_TAG_TO_PLACE, id, tagId }
}

export function addBook(id, bookId) {
  return { type: ATTACH_BOOK_TO_PLACE, id, bookId }
}

export function removeTag(id, tagId) {
  return { type: REMOVE_TAG_FROM_PLACE, id, tagId }
}

export function removeBook(id, bookId) {
  return { type: REMOVE_BOOK_FROM_PLACE, id, bookId }
}

export function editPlaceName(id, newName, selection) {
  return { type: EDIT_PLACE_NAME, id, newName, selection }
}

export function editPlaceDescription(id, newDescription, selection) {
  return { type: EDIT_PLACE_DESCRIPTION, id, newDescription, selection }
}

export function editPlaceNotes(id, newNotes, selection) {
  return { type: EDIT_PLACE_NOTES, id, newNotes, selection }
}

export function editPlaceCustomAttribute(id, name, newValue, selection) {
  return { type: EDIT_PLACE_CUSTOM_ATTRIBUTE, id, name, newValue, selection }
}

// NOTE: "load", "loadSingle", "batchLoad" and "removeSingle" are for
// external sync and not for general use.
export function load(patching, places) {
  return { type: LOAD_PLACES, patching, places }
}

// NOTE: "load", "loadSingle", "batchLoad" and "removeSingle" are for
// external sync and not for general use.
export function loadSingle(patching, place) {
  return { type: LOAD_PLACE, patching, place }
}

// NOTE: "load", "loadSingle", "batchLoad" and "removeSingle" are for
// external sync and not for general use.
export function batchLoad(patching, places) {
  return { type: BATCH_LOAD_PLACE, patching, places }
}

// NOTE: "load", "loadSingle", "batchLoad" and "removeSingle" are for
// external sync and not for general use.
export function removeSingle(patching, place) {
  return { type: REMOVE_PLACE, patching, place }
}

export const reorderPlaces =
  (placeId, oldPosition, newPosition, newCategoryId, direction) => (dispatch, getState) => {
    const visiblePlacesByCategory = visibleSortedPlacesByCategorySelector(getState())
    dispatch({
      type: REORDER_PLACE_MANUALLY,
      id: placeId,
      oldPosition,
      newPosition,
      newCategoryId,
      direction,
      placesByCategory: visiblePlacesByCategory,
    })
  }
