import { identity, isEmpty, mapValues } from 'lodash'

import {
  SELECT_FILE,
  SELECT_EMPTY_FILE,
  SET_FILE_LIST,
  SET_FILE_LOADED,
  SHOW_LOADER,
  UNSET_FILE_LOADED,
  SET_OFFLINE,
  SET_RESUMING,
  SET_CHECKING_FOR_OFFLINE_DRIFT,
  SET_OVERWRITING_CLOUD_WITH_BACKUP,
  SET_SHOW_RESUME_MESSAGE_DIALOG,
  SET_BACKING_UP_OFFLINE_FILE,
  START_CREATING_NEW_PROJECT,
  FINISH_CREATING_NEW_PROJECT,
  ADD_BOOK_FROM_PLTR,
  CLOSE_IMPORT_PLOTTR_MODAL,
  ADD_CHARACTER_FROM_PLTR,
  ADD_PLACE_FROM_PLTR,
  ADD_NOTE_FROM_PLTR,
  ADD_TAG_FROM_PLTR,
  ADD_IMAGE_FROM_PLTR,
} from '../constants/ActionTypes'
import selectors from '../selectors'
import { addCardAttr, addLineAttr, addNoteAttr, addPlaceAttr } from './customAttributes'
import { imageId, nextId } from '../store/newIds'
import { newTree } from '../reducers/tree'
const {
  fileURLSelector,
  importModalBookDataSelector,
  importPltrDataSelector,
  offlineModeEnabledSelector,
  imagesSelector,
  allCharactersSelector,
  allPlacesSelector,
  allTagsSelector,
} = selectors(identity)

export const withFullFileState = (cb) => (dispatch, getState) => {
  cb(getState())
}

export const selectFile = (selectedFile) => ({
  type: SELECT_FILE,
  selectedFile,
})

export const selectEmptyFile = () => ({
  type: SELECT_EMPTY_FILE,
})

export const setFileLoaded = () => ({
  type: SET_FILE_LOADED,
})

export const unsetFileLoaded = () => ({
  type: UNSET_FILE_LOADED,
})

export const showLoader = (isLoading) => ({
  type: SHOW_LOADER,
  isLoading,
})

export const setOffline = (isOffline) => (dispatch, getState) => {
  const state = getState()
  const offlineModeIsEnabled = offlineModeEnabledSelector(state)
  const fileIsLoaded = !!fileURLSelector(state)

  dispatch({
    type: SET_OFFLINE,
    isOffline,
    offlineModeIsEnabled,
    fileIsLoaded,
  })
}

export const setResuming = (resuming) => ({
  type: SET_RESUMING,
  resuming,
})

export const setCheckingForOfflineDrift = (checkingOfflineDrift) => ({
  type: SET_CHECKING_FOR_OFFLINE_DRIFT,
  checkingOfflineDrift,
})

export const setOverwritingCloudWithBackup = (overwritingCloudWithBackup) => ({
  type: SET_OVERWRITING_CLOUD_WITH_BACKUP,
  overwritingCloudWithBackup,
})

export const setShowResumeMessageDialog = (showResumeMessageDialog) => ({
  type: SET_SHOW_RESUME_MESSAGE_DIALOG,
  showResumeMessageDialog,
})

export const setBackingUpOfflineFile = (backingUpOfflineFile) => ({
  type: SET_BACKING_UP_OFFLINE_FILE,
  backingUpOfflineFile,
})

export const startCreatingNewProject = (template, defaultName) => ({
  type: START_CREATING_NEW_PROJECT,
  template,
  defaultName,
})

export const finishCreatingNewProject = () => ({
  type: FINISH_CREATING_NEW_PROJECT,
})

export const saveImportPltrData = () => (dispatch, getState) => {
  const state = getState()
  const importData = importPltrDataSelector(state)
  const bookData = importModalBookDataSelector(state)
  const currentCharacters = allCharactersSelector(state)
  const currentPlaces = allPlacesSelector(state)
  const currentTags = allTagsSelector(state)
  const books = importData['books']
  const hierarchyLevels = bookData['hierarchyLevels']
  const beats = bookData['beats']
  const cards = bookData['cards']
  const lines = bookData['lines']
  const customAttributes = importData['customAttributes']
  const notes = importData['notes']
  const characters = importData['characters']
  const places = importData['places']
  const tags = importData['tags']
  const images = importData['images']

  const booksWithAllIds = { ...books, allIds: bookData['allIds'] }
  const allImages = imagesSelector(state)
  const newImageId = imageId(allImages)
  const newCharacterId = nextId(currentCharacters)
  const newPlaceId = nextId(currentPlaces)
  const newTagId = nextId(currentTags)

  const newImages = Object.values(images)
    .map((image, idx) => {
      dispatch({
        type: ADD_IMAGE_FROM_PLTR,
        image,
        newId: newImageId + idx,
      })
      return {
        ...image,
        newId: newImageId + idx,
      }
    })
    .reduce((acc, item) => {
      if (item) {
        acc[item.id] = item
      }
      return acc
    }, {})

  const newCharacters = characters
    .map((character, idx) => {
      if (character.isChecked) {
        dispatch({
          type: ADD_CHARACTER_FROM_PLTR,
          character: {
            ...character,
            bookIds: [],
            tags: [],
            attributes: [],
            noteIds: [],
            places: [],
            cards: [],
            templates: [],
            categoryId: null,
            imageId:
              character.imageId && newImages[character.imageId]?.newId
                ? String(newImages[character.imageId]?.newId)
                : null,
          },
        })

        return {
          ...character,
          newId: newCharacterId + idx,
        }
      }
    })
    .reduce((acc, obj) => {
      if (obj) {
        acc[obj.id] = obj
      }
      return acc
    }, {})

  const newPlaces = places
    .map((place, idx) => {
      if (place.isChecked) {
        dispatch({
          type: ADD_PLACE_FROM_PLTR,
          place: {
            ...place,
            bookIds: [],
            tags: [],
            noteIds: [],
            characters: [],
            templates: [],
            cards: [],
            imageId:
              place.imageId && newImages[place.imageId]?.newId
                ? String(newImages[place.imageId]?.newId)
                : null,
          },
        })

        return {
          ...place,
          newId: newPlaceId + idx,
        }
      }
    })
    .reduce((acc, obj) => {
      if (obj) {
        acc[obj.id] = obj
      }
      return acc
    }, {})

  const newTags = tags
    .map((tag, idx) => {
      if (tag.isChecked) {
        dispatch({
          type: ADD_TAG_FROM_PLTR,
          tag,
        })

        return {
          ...tag,
          newId: newTagId + idx,
        }
      }
    })
    .reduce((acc, obj) => {
      if (obj) {
        acc[obj.id] = obj
      }
      return acc
    }, {})

  notes.forEach((note, _idx) => {
    if (note.isChecked) {
      dispatch({
        type: ADD_NOTE_FROM_PLTR,
        note: {
          ...note,
          tags: [],
          characters: [],
          templates: [],
          cards: [],
          imageId:
            note.imageId && newImages[note.imageId]?.newId
              ? String(newImages[note.imageId].newId)
              : null,
        },
      })
    }
  })

  mapValues(booksWithAllIds, (bookItem, bookId) => {
    if (bookItem.isChecked) {
      dispatch({
        type: ADD_BOOK_FROM_PLTR,
        book: bookItem,
        id: bookId,
        cards: cards.map((card) => {
          // replace old character, place and tag ids
          // inside the cards
          const newCharacterIds = (card.characters || []).map((characterId) => {
            if (String(characterId) === String(newCharacters[characterId]?.id)) {
              return newCharacters[characterId].newId
            }
            return characterId
          })
          const newPlaceIds = (card.places || []).map((placeId) => {
            if (String(placeId) === String(newPlaces[placeId]?.id)) {
              return newPlaces[placeId].newId
            }
            return placeId
          })
          const newTagIds = (card.tags || []).map((tagId) => {
            if (String(tagId) === String(newTags[tagId]?.id)) {
              return newTags[tagId].newId
            }
            return tagId
          })

          return {
            ...card,
            fromTemplateId: null,
            templates: [],
            characters: newCharacterIds,
            places: newPlaceIds,
            tags: newTagIds,
          }
        }),
        lines: lines.filter((l) => l.id && String(l.bookId) === String(bookId)),
        beats: !isEmpty(beats[bookId]) ? beats[bookId] : newTree('id'),
        hierarchyLevels:
          !isEmpty(hierarchyLevels) && !isEmpty(hierarchyLevels[bookId])
            ? hierarchyLevels[bookId]
            : null,
        images: newImages,
      })
    }
  })

  Object.values(customAttributes).forEach((sectionAttr) => {
    switch (sectionAttr) {
      case 'scenes':
        addCardAttr(sectionAttr.attributes)
        break
      case 'places':
        addPlaceAttr(sectionAttr.attributes)
        break
      case 'notes':
        addNoteAttr(sectionAttr.attributes)
        break
      case 'lines':
        addLineAttr(sectionAttr.attributes)
        break
      default:
        break
    }
  })

  dispatch({
    type: CLOSE_IMPORT_PLOTTR_MODAL,
  })
}
