/** @module Actions */
import {
  ADD_TAG,
  ADD_TAG_WITH_VALUES,
  ADD_CREATED_TAG,
  EDIT_TAG,
  DELETE_TAG,
  CHANGE_TAG_COLOR,
  LOAD_TAGS,
  DUPLICATE_TAG,
} from '../constants/ActionTypes'

/**
 * Adds a tag
 */
export function addTag() {
  return { type: ADD_TAG }
}

/**
 * Adds a tag with values
 * @param {string} title the title of the tag
 * @param {string} color the color of the tag (either a hex value or a color name)
 * @returns {Array} test something
 */
export function addTagWithValues(title, color) {
  return { type: ADD_TAG_WITH_VALUES, title, color }
}

/**
 * Adds a tag from an object
 * @param {Object} attributes all the attributes of a tag
 */
export function addCreatedTag(attributes) {
  return { type: ADD_CREATED_TAG, attributes }
}

/**
 * Edits a tag
 * @param {number} id the tag's id
 * @param {string} title the tag's title
 * @param {string} color the tag's color
 * @param {string} categoryId the tag's category id
 */
export function editTag(id, title, color, categoryId) {
  return { type: EDIT_TAG, id, title, color, categoryId: categoryId || null }
}

/**
 * Changes a tag's color
 * @param {number} id the tag's id
 * @param {string} color the tag's new color
 */
export function changeColor(id, color) {
  return { type: CHANGE_TAG_COLOR, id, color }
}

/**
 * Deletes a tag
 * @param {number} id the tag's id
 */
export function deleteTag(id) {
  return { type: DELETE_TAG, id }
}

/**
 * Loads a tag
 * @param {Object} patching ???
 * @param {Object[]} tags array of tag objects
 */
export function load(patching, tags) {
  return { type: LOAD_TAGS, patching, tags }
}

/**
 * Duplicates a tag
 * @param {number} id the id of the tag to duplicate
 */
export function duplicateTag(id) {
  return { type: DUPLICATE_TAG, id }
}
