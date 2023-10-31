import { identity, sortBy } from 'lodash'

import {
  ADD_CHARACTER,
  ADD_CHARACTER_WITH_TEMPLATE,
  ATTACH_BOOK_TO_CHARACTER,
  ATTACH_TAG_TO_CHARACTER,
  DELETE_CHARACTER,
  EDIT_CHARACTER,
  LOAD_CHARACTERS,
  LOAD_CHARACTER,
  BATCH_LOAD_CHARACTER,
  REMOVE_CHARACTER,
  ADD_TEMPLATE_TO_CHARACTER,
  REMOVE_TEMPLATE_FROM_CHARACTER,
  REMOVE_BOOK_FROM_CHARACTER,
  REMOVE_TAG_FROM_CHARACTER,
  EDIT_CHARACTER_TEMPLATE_ATTRIBUTE,
  DUPLICATE_CHARACTER,
  CREATE_CHARACTER_ATTRIBUTE,
  EDIT_CHARACTER_ATTRIBUTE_VALUE,
  EDIT_CHARACTER_SHORT_DESCRIPTION,
  EDIT_CHARACTER_DESCRIPTION,
  EDIT_CHARACTER_CATEGORY,
  EDIT_CHARACTER_NAME,
  EDIT_CHARACTER_IMAGE,
  DELETE_CHARACTER_LEGACY_CUSTOM_ATTRIBUTE,
  SELECT_CHARACTER_ATTRIBUTE_BOOK_TAB,
  REORDER_CHARACTER_TEMPLATES,
  REORDER_CHARACTER_MANUALLY,
} from '../constants/ActionTypes'
import selectors from '../selectors'
import { character } from '../store/initialState'
import { escapeBraces } from './customAttributes'
import { nextId } from '../store/newIds'

const {
  characterAttributesForCurrentBookSelector,
  selectedCharacterAttributeTabSelector,
  legacyCustomCharacterAttributeByName,
  characterAttributesForBookSelector,
  allBookIdsSelector,
  allDisplayedCharactersForCurrentBookSelector,
  visibleSortedCharactersByCategorySelector,
} = selectors(identity)

export function addCharacter(name) {
  return {
    type: ADD_CHARACTER,
    name: name || character.name,
    description: character.description,
    notes: character.notes,
  }
}

export function addCharacterWithTemplate(name, templateData) {
  return {
    type: ADD_CHARACTER_WITH_TEMPLATE,
    name: name || character.name,
    description: character.description,
    notes: character.notes,
    templateData,
  }
}

export function editCharacterName(id, name, selection) {
  return {
    type: EDIT_CHARACTER_NAME,
    id,
    name,
    selection,
  }
}

export function editCharacterImage(id, imageId) {
  return {
    type: EDIT_CHARACTER_IMAGE,
    id,
    imageId,
  }
}

export const editCharacterTemplateAttribute =
  (id, templateId, name, value, selection) => (dispatch, getState) => {
    const state = getState()
    const bookId = selectedCharacterAttributeTabSelector(state)

    dispatch({
      type: EDIT_CHARACTER_TEMPLATE_ATTRIBUTE,
      id,
      templateId,
      name,
      value,
      bookId,
      selection,
    })
  }

export function addTemplateToCharacter(id, templateData) {
  return { type: ADD_TEMPLATE_TO_CHARACTER, id, templateData }
}

export function deleteCharacter(id) {
  return { type: DELETE_CHARACTER, id }
}

export function addTag(id, tagId) {
  return { type: ATTACH_TAG_TO_CHARACTER, id, tagId }
}

export const addBook = (id, bookId) => (dispatch, getState) => {
  const state = getState()
  const bookIds = allBookIdsSelector(state)

  if (bookId === 'series' || bookIds.indexOf(bookId) > -1) {
    dispatch({ type: ATTACH_BOOK_TO_CHARACTER, id, bookId })
  }
  // TODO: error message?
}

export function removeTag(id, tagId) {
  return { type: REMOVE_TAG_FROM_CHARACTER, id, tagId }
}

export const removeBook = (id, bookId) => (dispatch, getState) => {
  const state = getState()
  const allCharactersByBook = allDisplayedCharactersForCurrentBookSelector(state)

  dispatch({ type: REMOVE_BOOK_FROM_CHARACTER, id, bookId })
  if (allCharactersByBook.length === 1) {
    dispatch({ type: SELECT_CHARACTER_ATTRIBUTE_BOOK_TAB, bookId: 'all' })
  }
}

export function removeTemplateFromCharacter(id, templateId) {
  return { type: REMOVE_TEMPLATE_FROM_CHARACTER, id, templateId }
}

// NOTE: "load", "loadSingle", "batchLoad" and "removeSingle" are for
// external sync and not for general use.
export function load(patching, characters) {
  return { type: LOAD_CHARACTERS, patching, characters }
}

// NOTE: "load", "loadSingle", "batchLoad" and "removeSingle" are for
// external sync and not for general use.
export function loadSingle(patching, character) {
  return { type: LOAD_CHARACTER, patching, character }
}

// NOTE: "load", "loadSingle", "batchLoad" and "removeSingle" are for
// external sync and not for general use.
export function batchLoad(patching, characters) {
  return { type: BATCH_LOAD_CHARACTER, patching, characters }
}

// NOTE: "load", "loadSingle", "batchLoad" and "removeSingle" are for
// external sync and not for general use.
export function removeSingle(patching, character) {
  return { type: REMOVE_CHARACTER, patching, character }
}

export function duplicateCharacter(id) {
  return { type: DUPLICATE_CHARACTER, id }
}

export function createCharacterAttribute(type, name, fromLegacyAttribute) {
  return {
    type: CREATE_CHARACTER_ATTRIBUTE,
    attribute: {
      type,
      name: escapeBraces(name),
    },
    fromLegacyAttribute,
  }
}

export const editCharacterAttributeValue =
  (characterId, attributeId, value, selection) => (dispatch, getState) => {
    if (!attributeId) {
      return
    }

    const state = getState()
    const characterAttributesForBook = characterAttributesForCurrentBookSelector(state)
    const selectedBook = selectedCharacterAttributeTabSelector(state)
    const newAttribute = characterAttributesForBook.find((attribute) => {
      return attribute.id === attributeId
    })
    if (newAttribute) {
      if (newAttribute.bookId !== selectedBook) {
        // This is the first time we're editing an attribute for the
        // current book that was previously only defined for the whole
        // series.
        dispatch({
          type: EDIT_CHARACTER_ATTRIBUTE_VALUE,
          bookId: selectedBook,
          characterId,
          attributeId,
          value,
          selection,
        })
        return
      }
      dispatch({
        type: EDIT_CHARACTER_ATTRIBUTE_VALUE,
        characterId,
        attributeId,
        value,
        selection,
      })
      return
    }

    const legacyCustomAttribute = legacyCustomCharacterAttributeByName(state, attributeId)
    if (legacyCustomAttribute) {
      const characterAttributes = characterAttributesForBookSelector(state)
      const nextAttributeId = nextId(characterAttributes)
      dispatch(
        createCharacterAttribute(legacyCustomAttribute.type, legacyCustomAttribute.name, true)
      )
      dispatch({
        type: DELETE_CHARACTER_LEGACY_CUSTOM_ATTRIBUTE,
        attributeName: attributeId,
      })
      editCharacterAttributeValue(characterId, nextAttributeId, value)(dispatch, getState)
    }

    // TODO: handle error state.  There was no legacy attribute.
  }

export const editShortDescription = (characterId, shortDescription, selection) => {
  return {
    type: EDIT_CHARACTER_SHORT_DESCRIPTION,
    characterId,
    value: shortDescription,
    selection,
  }
}

export const editDescription = (characterId, description, selection) => {
  return {
    type: EDIT_CHARACTER_DESCRIPTION,
    characterId,
    value: description,
    selection,
  }
}

export const editCategory = (characterId, categoryId) => {
  return {
    type: EDIT_CHARACTER_CATEGORY,
    characterId,
    value: categoryId,
  }
}

export const reorderCharacterTemplateAttribute = (originalPosition, destination, characterId) => {
  return {
    type: REORDER_CHARACTER_TEMPLATES,
    originalPosition,
    destination,
    id: characterId,
  }
}

export const reorderCharacter =
  (characterId, newPosition, newCategoryId) => (dispatch, getState) => {
    const characterIdsInOrder = sortBy(
      Object.entries(visibleSortedCharactersByCategorySelector(getState())),
      ([groupName, _characters]) => groupName
    )
      .flatMap(([groupName, characters]) => {
        return characters
      })
      .map(({ id }) => {
        return id
      })

    dispatch({
      type: REORDER_CHARACTER_MANUALLY,
      characterIdsInOrder,
      characterId,
      newPosition,
      newCategoryId,
    })
  }
