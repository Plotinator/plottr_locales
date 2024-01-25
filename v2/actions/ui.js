import { identity, isEqual, isObject } from 'lodash'

import {
  CHANGE_CURRENT_VIEW,
  CHANGE_ORIENTATION,
  FILE_LOADED,
  NAVIGATE_TO_BOOK_TIMELINE,
  FILE_SAVED,
  NEW_FILE,
  CHANGE_CURRENT_TIMELINE,
  CLEAR_TEMPLATE_FROM_TIMELINE,
  SET_CHARACTER_SORT,
  SET_PLACE_SORT,
  SET_CHARACTER_FILTER,
  EXPAND_TIMELINE,
  COLLAPSE_TIMELINE,
  SET_TIMELINE_FILTER,
  SET_PLACE_FILTER,
  RESET_TIMELINE,
  RECORD_TIMELINE_SCROLL_POSITION,
  EDIT_FILENAME,
  SET_TIMELINE_SIZE,
  OPEN_ATTRIBUTES_DIALOG,
  CLOSE_ATTRIBUTES_DIALOG,
  SET_NOTE_SORT,
  SET_NOTE_FILTER,
  SET_OUTLINE_FILTER,
  SET_NOTES_FILTER,
  LOAD_UI,
  LOAD_FILE,
  SET_NOTES_SEARCH_TERM,
  SET_CHARACTERS_SEARCH_TERM,
  SET_PLACES_SEARCH_TERM,
  SET_TAGS_SEARCH_TERM,
  SET_OUTLINE_SEARCH_TERM,
  SET_TIMELINE_SEARCH_TERM,
  SET_ACTIVE_TIMELINE_TAB,
  SET_TIMELINE_VIEW,
  SELECT_CHARACTER_ATTRIBUTE_BOOK_TAB,
  SELECT_CHARACTER,
  SET_CARD_DIALOG_OPEN,
  SET_CARD_DIALOG_CLOSE,
  OPEN_NEW_BOOK_DIALOG,
  OPEN_EDIT_BOOK_DIALOG,
  CLOSE_BOOK_DIALOG,
  RECORD_OUTLINE_SCROLL_POSITION,
  CLOSE_SEARCH,
  OPEN_SEARCH,
  SET_SEARCH_TERM,
  SELECT_OUTLINE_CARD,
  SELECT_NOTE,
  SELECT_PLACE,
  SELECT_TAG,
  NEXT_SEARCH_HIT,
  PREVIOUS_SEARCH_HIT,
  START_DELETING_CARD_FROM_CARD_DIALOG,
  STOP_DELETING_CARD_FROM_CARD_DIALOG,
  SHOW_CARD_DIALOG_COLOR_PICKER,
  HIDE_CARD_DIALOG_COLOR_PICKER,
  START_REMOVING_TEMPLATE_FROM_CARD_DIALOG,
  STOP_REMOVING_TEMPLATE_FROM_CARD_DIALOG,
  SET_ACTIVE_TAB_ON_CARD_DIALOG,
  SHOW_CARD_DIALOG_TEMPLATE_PICKER,
  HIDE_CARD_DIALOG_TEMPLATE_PICKER,
  FINISH_EDITING_SELECTED_PLACE,
  HIDE_PLACE_ATTRIBUTE_DIALOG,
  HIDE_PLACE_CATETORIES_MODAL,
  HIDE_PLACE_FILTER_LIST,
  HIDE_PLACE_SORT,
  SHOW_PLACE_ATTRIBUTE_DIALOG,
  SHOW_PLACE_CATETORIES_MODAL,
  SHOW_PLACE_FILTER_LIST,
  SHOW_PLACE_SORT,
  START_EDITING_SELECTED_PLACE,
  START_EDITING_SELECTED_NOTE,
  FINISH_EDITING_SELECTED_NOTE,
  SHOW_NOTES_CATEGORY_DIALOG,
  HIDE_NOTES_CATEGORY_DIALOG,
  SHOW_NOTES_ATTRIBUTES_DIALOG,
  HIDE_NOTES_ATTRIBUTES_DIALOG,
  SHOW_NOTES_FILTER_LIST,
  HIDE_NOTES_FILTER_LIST,
  SHOW_NOTES_SORT,
  HIDE_NOTES_SORT,
  SHOW_CHARACTERS_ATTRIBUTES_DIALOG,
  HIDE_CHARACTERS_ATTRIBUTES_DIALOG,
  SHOW_CHARACTERS_CATEGORIES_DIALOG,
  HIDE_CHARACTERS_CATEGORIES_DIALOG,
  START_EDITING_SELECTED_CHARACTER,
  FINISH_EDITING_SELECTED_CHARACTER,
  SHOW_CHARACTERS_TEMPLATE_PICKER,
  HIDE_CHARACTERS_TEMPLATE_PICKER,
  START_CREATING_CHARACTER,
  FINISH_CREATING_CHARACTER,
  SET_CHARACTER_TEMPLATE_DATA,
  SHOW_CHARACTER_FILTER,
  HIDE_CHARACTER_FILTER,
  SHOW_CHARACTER_SORT,
  HIDE_CHARACTER_SORT,
  SHOW_CHARACTER_DETAILS,
  HIDE_CHARACTER_DETAILS,
  START_DELETING_CHARACTER,
  FINISH_DELETING_CHARACTER,
  START_REMOVING_TEMPLATE_FROM_CHARACTER,
  FINISH_REMOVING_TEMPLATE_FROM_CHARACTER,
  SET_TEMPLATE_TO_REMOVE_FROM_CHARACTER,
  SET_ACTIVE_CHARACTER_TAB,
  SHOW_CHARACTER_EDITOR_TEMPLATE_PICKER,
  HIDE_CHARACTER_EDITOR_TEMPLATE_PICKER,
  START_EDITING_OUTLINE_CARD,
  FINISH_EDITING_OUTLINE_CARD,
  TOGGLE_ADVANCED_SAVE_TEMPLATE_PANEL,
  SET_FOCUSSED_TIMELINE_TAB_BEAT,
  SET_TIMELINE_TAB_BEAT_TO_DELETE,
  SET_ACT_CONFIG_MODAL_OPEN,
  SET_EDITING_BEAT_ID,
  OPEN_RESTRUCTURE_TIMELINE_MODAL,
  CLOSE_RESTRUCTURE_TIMELINE_MODAL,
  PUSH_FOCUS,
  EDIT_SELECTED_TAG,
  FINISH_EDITING_SELECTED_TAG,
  TOGGLE_REPLACE_SEARCH,
  SET_REPLACEMENT_TEXT,
  OPEN_REPLACE,
  TOGGLE_HIT_MARKED_FOR_REPLACEMENT,
  REPLACE_MARKED_HITS,
  UPDATE_HITS_MARKED_FOR_REPLACEMENT,
  START_SCANNING_SEARCH,
  START_EDITING_BEAT_HEADING_TITLE,
  STOP_EDITING_BEAT_HEADING_TITLE,
  START_EDITING_PLOTLINE_HEADING_TITLE,
  STOP_EDITING_PLOTLINE_HEADING_TITLE,
  START_JUMPING,
  FINISH_JUMPING,
  START_VIEWING,
  START_SEARCHING,
  SET_REPLACE_WORD,
  SET_DASHBOARD_MODAL_VIEW,
} from '../constants/ActionTypes'
import selectors from '../selectors'
import { cardFocusPath, outlineCardFocusPath } from '../helpers/cards'
import { projectFocusPath } from '../helpers/project'
import { incrementJumpCounter } from './applicationState'
import { noteFocusPath } from '../helpers/notes'
import { characterFocusPath } from '../helpers/characters'
import { placeFocusPath } from '../helpers/places'
import { tagFocusPath } from '../helpers/tags'
import { lineFocusPath } from '../helpers/lines'
import { beatFocusPath } from '../helpers/beats'
import { parseNumberOrString } from '../helpers/parseNumberOrString'
import { safeParseInt } from '../helpers/safeParseInt'

const {
  allCardsSelector,
  fileURLSelector,
  searchDialogCurrentHitIndexSelector,
  flatSearchHitsSelector,
  allCharacterAttributesSelector,
  fullFileStateSelector,
  singleCharacterSelector,
  characterAttributeTabSelector,
  hitsMarkedForReplacementSelector,
  searchReplacementTextSelector,
  allBooksSelector,
  seriesSelector,
  allNotesSelector,
  allPlacesSelector,
  allTagsSelector,
  allLinesSelector,
  allBeatsAsArraySelector,
  displayedSingleCharacterSelector,
  allBooksAsArraySelector,
} = selectors(identity)

export function changeCurrentView(view) {
  return { type: CHANGE_CURRENT_VIEW, view }
}

export function changeOrientation(orientation) {
  return { type: CHANGE_ORIENTATION, orientation }
}

export function loadFile(fileName, dirty, payload, version, fileURL) {
  return { type: FILE_LOADED, data: payload, fileName, dirty, version, fileURL }
}

export function newFile(fileName) {
  return { type: NEW_FILE, fileName }
}

export function fileSaved() {
  return { type: FILE_SAVED, dirty: false }
}

export function setCharacterSort(attr, direction) {
  return { type: SET_CHARACTER_SORT, attr, direction }
}

export function setPlaceSort(attr, direction) {
  return { type: SET_PLACE_SORT, attr, direction }
}

export function setNoteSort(attr, direction) {
  return { type: SET_NOTE_SORT, attr, direction }
}

export function setCharacterFilter(filter) {
  return { type: SET_CHARACTER_FILTER, filter }
}

export function setPlaceFilter(filter) {
  return { type: SET_PLACE_FILTER, filter }
}

export function setNoteFilter(filter) {
  return { type: SET_NOTE_FILTER, filter }
}

export function setTimelineFilter(filter) {
  return { type: SET_TIMELINE_FILTER, filter }
}

export function setOutlineFilter(filter) {
  return { type: SET_OUTLINE_FILTER, filter }
}

export function changeCurrentTimeline(id) {
  return { type: CHANGE_CURRENT_TIMELINE, id }
}

export function navigateToBookTimeline(bookId, inBrowser, history) {
  if (inBrowser && history) {
    history.push(`/timeline`)
  }

  return { type: NAVIGATE_TO_BOOK_TIMELINE, bookId }
}

export function expandTimeline() {
  return { type: EXPAND_TIMELINE }
}

export function collapseTimeline() {
  return { type: COLLAPSE_TIMELINE }
}

export function clearTemplateFromTimeline(bookId, templateId) {
  return { type: CLEAR_TEMPLATE_FROM_TIMELINE, bookId, templateId }
}

export function resetTimeline(bookId) {
  return { type: RESET_TIMELINE, bookId }
}

export function recordTimelineScrollPosition({ x, y }) {
  return { type: RECORD_TIMELINE_SCROLL_POSITION, x, y }
}

export function recordOutlineScrollPosition(position) {
  return { type: RECORD_OUTLINE_SCROLL_POSITION, position }
}

export const editFileName = (persistFileNameChange, newName) => (dispatch, getState) => {
  const state = getState()
  const fileURL = fileURLSelector(state)
  // TODO: dispatch an error for not being able to edit the file name.
  persistFileNameChange(fileURL, newName).then(() => {
    dispatch({ type: EDIT_FILENAME, newName })
  })
}

export function setTimelineSize(newSize) {
  return { type: SET_TIMELINE_SIZE, newSize }
}

export function openAttributesDialog() {
  return { type: OPEN_ATTRIBUTES_DIALOG }
}

export function closeAttributesDialog() {
  return { type: CLOSE_ATTRIBUTES_DIALOG }
}

export function setNotesSearchTerm(searchTerm) {
  return { type: SET_NOTES_SEARCH_TERM, searchTerm }
}

export function setCharactersSearchTerm(searchTerm) {
  return { type: SET_CHARACTERS_SEARCH_TERM, searchTerm }
}

export function setPlacesSearchTerm(searchTerm) {
  return { type: SET_PLACES_SEARCH_TERM, searchTerm }
}

export function setTagsSearchTerm(searchTerm) {
  return { type: SET_TAGS_SEARCH_TERM, searchTerm }
}

export function setOutlineSearchTerm(searchTerm) {
  return { type: SET_OUTLINE_SEARCH_TERM, searchTerm }
}

export function setTimelineSearchTerm(searchTerm) {
  return { type: SET_TIMELINE_SEARCH_TERM, searchTerm }
}

export function patchFile(patching, file) {
  return { type: LOAD_FILE, patching, file }
}

export function setTimelineActiveTab(activeTab) {
  return { type: SET_ACTIVE_TIMELINE_TAB, activeTab }
}

export function setTimelineView(timelineView) {
  return { type: SET_TIMELINE_VIEW, timelineView }
}

export function selectCharacterAttributeBookTab(bookId) {
  return { type: SELECT_CHARACTER_ATTRIBUTE_BOOK_TAB, bookId }
}

export function selectCharacter(id) {
  return { type: SELECT_CHARACTER, id }
}

export const setCardDialogOpen = (cardId, beatId, lineId) => (dispatch, getState) => {
  const state = getState()
  const allCards = allCardsSelector(state)
  const cardExists = allCards.find((card) => card.id == cardId)
  if (cardExists) {
    dispatch({
      type: SET_CARD_DIALOG_OPEN,
      cardId,
      lineId,
      beatId,
    })
  }
}

export function setCardDialogClose() {
  return { type: SET_CARD_DIALOG_CLOSE }
}

export function openNewBookDialog() {
  return { type: OPEN_NEW_BOOK_DIALOG }
}

export function openEditBookDialog(bookId) {
  return {
    type: OPEN_EDIT_BOOK_DIALOG,
    bookId,
  }
}

export function closeBookDialog() {
  return { type: CLOSE_BOOK_DIALOG }
}

export function closeSearch() {
  return { type: CLOSE_SEARCH }
}

export function toggleAdvancedSaveTemplatePanel() {
  return { type: TOGGLE_ADVANCED_SAVE_TEMPLATE_PANEL }
}

export function openSearch() {
  return { type: OPEN_SEARCH }
}

export function openReplace() {
  return { type: OPEN_REPLACE }
}

export function setFocussedTimelineTabBeat(beatId) {
  return { type: SET_FOCUSSED_TIMELINE_TAB_BEAT, beatId }
}

export function setSearchTerm(term) {
  return function (dispatch, getState) {
    dispatch({ type: SET_SEARCH_TERM, term })
    const newState = getState()
    const newHits = flatSearchHitsSelector(newState)
    dispatch({
      type: UPDATE_HITS_MARKED_FOR_REPLACEMENT,
      newHits,
    })
  }
}

export function setTimelineTabBeatToDelete(beatId) {
  return { type: SET_TIMELINE_TAB_BEAT_TO_DELETE, beatId }
}

export function selectOutlineCard(cardId) {
  return { type: SELECT_OUTLINE_CARD, cardId }
}

export function setActConfigIsOpen(open) {
  return { type: SET_ACT_CONFIG_MODAL_OPEN, open }
}

export function selectNote(id) {
  return { type: SELECT_NOTE, id }
}

export function selectPlace(id) {
  return { type: SELECT_PLACE, id }
}

export function selectTag(id) {
  return { type: SELECT_TAG, id }
}

const withShortDelay = (f) => setTimeout(f, 0)

const startJumping = () => {
  return {
    type: START_JUMPING,
  }
}

const finishJumping = () => {
  return {
    type: FINISH_JUMPING,
  }
}

export const jumpToHit = (cards, hitType, searchHit) => (dispatch, getState) => {
  withShortDelay(() => {
    // Note; you should avoid changing any state if we're not going to
    // jump.
    switch (hitType) {
      case 'project': {
        const { path, hit } = searchHit
        const [_, _project, bookOrSeries, ...rest] = path.split('/')
        if (bookOrSeries === 'book') {
          const [id, attribute] = rest
          const bookId = parseNumberOrString(id)
          const book = allBooksSelector(getState())[bookId]
          if (
            typeof book !== 'undefined' &&
            ['title', 'premise', 'genre', 'theme'].indexOf(attribute) !== -1
          ) {
            const focusPath = projectFocusPath(bookId, attribute)
            const focusStart = safeParseInt(rest[rest.length - 1])
            dispatch(startJumping())
            dispatch(closeBookDialog())
            dispatch(changeCurrentView('project'))
            dispatch(
              pushFocus('project', focusPath, {
                start: focusStart,
                end: focusStart + hit.length,
                direction: 'forward',
              })
            )
            dispatch(openEditBookDialog(bookId))
            dispatch(incrementJumpCounter())
            dispatch(finishJumping())
          }
        } else {
          const [attribute] = rest
          if (['name', 'premise', 'genre', 'theme'].indexOf(attribute) !== -1) {
            dispatch(closeBookDialog())
            const focusPath = projectFocusPath(null, attribute)
            const focusStart = safeParseInt(rest[rest.length - 1])
            dispatch(startJumping())
            dispatch(changeCurrentView('project'))
            dispatch(
              pushFocus('project', focusPath, {
                start: focusStart,
                end: focusStart + hit.length,
                direction: 'forward',
              })
            )
            dispatch(incrementJumpCounter())
            dispatch(finishJumping())
          }
        }
        return
      }
      case 'timeline': {
        const { path, hit } = searchHit
        const [_, _timeline, rawBookId, _card, cardId, type, ...rest] = path.split('/')
        const bookId = parseNumberOrString(rawBookId)
        const books = allBooksSelector(getState())
        const book = books[bookId]
        if (typeof book !== 'undefined') {
          const card = cards.find((card) => {
            return card.id == cardId
          })
          if (typeof card !== 'undefined') {
            if (type === 'customAttribute') {
              // This is the tab on Card dialog corresponding to custom attributes.
              const focusPath = cardFocusPath(cardId, { customAttributeName: rest[0] })
              const focusStart = safeParseInt(rest[rest.length - 1])
              if (typeof card[rest[0]] !== 'undefined') {
                dispatch(startJumping())
                dispatch(changeCurrentView('timeline'))
                dispatch(changeCurrentTimeline(bookId))
                dispatch(
                  pushFocus('timeline', focusPath, {
                    start: focusStart,
                    end: focusStart + hit.length,
                    direction: 'forward',
                  })
                )
                dispatch(setActiveTabOnCardDialog(2))
                dispatch(incrementJumpCounter())
                setCardDialogOpen(card?.id, card?.beatId, card?.lineId)(dispatch, getState)
                dispatch(finishJumping())
              }
            } else if (type === 'templateAttribute') {
              const [templateId, attributeName] = rest
              const template = card.templates.find(({ id }) => {
                return id === templateId
              })
              if (typeof template !== 'undefined') {
                const attribute = template.attributes.find(({ name }) => {
                  return name === attributeName
                })
                if (typeof attribute !== 'undefined') {
                  const focusStart = safeParseInt(rest[rest.length - 1])
                  const focusPath = cardFocusPath(cardId, {
                    template: { id: templateId, attributeName },
                  })
                  const indexOfTemplate = card.templates.findIndex((template) => {
                    return template.id === templateId
                  })
                  dispatch(startJumping())
                  dispatch(changeCurrentView('timeline'))
                  dispatch(changeCurrentTimeline(bookId))
                  dispatch(
                    pushFocus('timeline', focusPath, {
                      start: focusStart,
                      end: focusStart + hit.length,
                      direction: 'forward',
                    })
                  )
                  // ASSUME: order of tabs is the same as the order of
                  // templates on the card.
                  dispatch(setActiveTabOnCardDialog(3 + indexOfTemplate))
                  dispatch(incrementJumpCounter())
                  setCardDialogOpen(card?.id, card?.beatId, card?.lineId)(dispatch, getState)
                  dispatch(finishJumping())
                }
              }
            } else {
              const baseAttributeName = type
              if (['title', 'description'].indexOf(baseAttributeName) !== -1) {
                const [rawFocusStart] = rest
                const focusStart = safeParseInt(rawFocusStart)
                const focusPath = cardFocusPath(cardId, { baseAttributeName })
                dispatch(startJumping())
                dispatch(changeCurrentView('timeline'))
                dispatch(changeCurrentTimeline(bookId))
                dispatch(
                  pushFocus('timeline', focusPath, {
                    start: focusStart,
                    end: focusStart + hit.length,
                    direction: 'forward',
                  })
                )
                // It's not a template attribute or a custom attribute.
                // Go to the normal tab.
                dispatch(setActiveTabOnCardDialog(1))
                dispatch(incrementJumpCounter())
                setCardDialogOpen(card?.id, card?.beatId, card?.lineId)(dispatch, getState)
                dispatch(finishJumping())
              }
            }
          }
        }
        return
      }
      case 'outline': {
        const { path, hit } = searchHit
        const [_, _outline, rawBookId, _card, cardIdAsString, descriptionOrTitle, ...rest] =
          path.split('/')
        const bookId = parseNumberOrString(rawBookId)
        const books = allBooksSelector(getState())
        const book = books[bookId]
        if (typeof book !== 'undefined') {
          const cardId = safeParseInt(cardIdAsString)
          const card = cards.find(({ id }) => {
            return id === cardId
          })
          if (
            typeof card !== 'undefined' &&
            ['description', 'title'].indexOf(descriptionOrTitle) !== -1
          ) {
            const focusPath = outlineCardFocusPath(cardId, descriptionOrTitle)
            const [rawFocusStart] = rest
            const focusStart = safeParseInt(rawFocusStart)
            dispatch(startJumping())
            dispatch(changeCurrentView('outline'))
            dispatch(changeCurrentTimeline(bookId))
            dispatch(
              pushFocus('outline', focusPath, {
                start: focusStart,
                end: focusStart + hit.length,
                direction: 'forward',
              })
            )
            dispatch(selectOutlineCard(cardId))
            dispatch(startEditingOutlineCard(cardId))
            dispatch(incrementJumpCounter())
            dispatch(finishJumping())
          }
        }
        return
      }
      case 'notes': {
        const { path, hit } = searchHit
        const [_, _notes, noteIdAsString, type, ...rest] = path.split('/')
        const noteId = parseNumberOrString(noteIdAsString)
        const notes = allNotesSelector(getState())
        const note = notes.find(({ id }) => {
          return id === noteId
        })
        if (typeof note !== 'undefined') {
          if (type === 'customAttribute') {
            const [attributeName, rawFocusStart] = rest
            if (typeof note[attributeName] !== 'undefined') {
              const focusStart = safeParseInt(rawFocusStart)
              const focusPath = noteFocusPath(noteId, { attributeName })
              dispatch(startJumping())
              dispatch(changeCurrentView('notes'))
              dispatch(
                pushFocus('note', focusPath, {
                  start: focusStart,
                  end: focusStart + hit.length,
                  direction: 'forward',
                })
              )
              dispatch(selectNote(noteId))
              dispatch(startEditingSelectedNote())
              dispatch(incrementJumpCounter())
              dispatch(finishJumping())
            }
          } else {
            if (typeof note[type] !== 'undefined') {
              const [rawFocusStart] = rest
              const contentOrTitle = type
              const focusStart = safeParseInt(rawFocusStart)
              const focusPath = noteFocusPath(noteId, { contentOrTitle })
              dispatch(startJumping())
              dispatch(changeCurrentView('notes'))
              dispatch(
                pushFocus('note', focusPath, {
                  start: focusStart,
                  end: focusStart + hit.length,
                  direction: 'forward',
                })
              )
              dispatch(selectNote(noteId))
              dispatch(startEditingSelectedNote())
              dispatch(incrementJumpCounter())
              dispatch(finishJumping())
            }
          }
        }
        return
      }
      case 'characters': {
        const { path, hit } = searchHit
        const [_, _characters, rawCharacterId, type, ...rest] = path.split('/')
        const characterId = parseNumberOrString(rawCharacterId)
        const character = displayedSingleCharacterSelector(getState(), characterId)
        if (character === null || typeof character === 'undefined') {
          return
        } else if (type === 'customAttribute') {
          const [rawAttributeId, rawBookId, rawFocusStart] = rest
          const focusStart = safeParseInt(rawFocusStart)
          const attributeId = parseNumberOrString(rawAttributeId)
          const tabBookId = parseNumberOrString(rawBookId)
          const state = fullFileStateSelector(getState())
          const characterAttributes = allCharacterAttributesSelector(state)
          const attributeType = characterAttributes.find(({ id }) => {
            return id === attributeId
          })?.type
          const allBooks = allBooksSelector(state)
          const series = seriesSelector(state)
          const book = tabBookId === 'all' ? series : allBooks[tabBookId]
          if (typeof book !== 'undefined' && typeof attributeType !== 'undefined') {
            dispatch(startJumping())
            dispatch(selectCharacterAttributeBookTab(tabBookId))
            dispatch(hideCharacterDetails())
            dispatch(changeCurrentView('characters'))
            dispatch(selectCharacter(characterId))
            dispatch(startEditingSelectedCharacter())
            // 2 is the id of the attributes tab in `CharacterEditDetails`
            if (attributeType === 'base-attribute') {
              dispatch(setActiveCharacterTab(1))
            } else {
              dispatch(setActiveCharacterTab(2))
            }
            const focusPath = characterFocusPath(characterId, tabBookId, { attributeId })
            dispatch(
              pushFocus('character', focusPath, {
                start: focusStart,
                end: focusStart + hit.length,
                direction: 'forward',
              })
            )
            dispatch(incrementJumpCounter())
            dispatch(showCharacterDetails())
            dispatch(finishJumping())
          } else if (
            typeof book !== 'undefined' &&
            typeof attributeType === 'undefined' &&
            typeof character[rawAttributeId] !== 'undefined'
          ) {
            dispatch(startJumping())
            dispatch(selectCharacterAttributeBookTab(tabBookId))
            dispatch(hideCharacterDetails())
            dispatch(changeCurrentView('characters'))
            dispatch(selectCharacter(characterId))
            dispatch(startEditingSelectedCharacter())
            // 2 is the id of the attributes tab in `CharacterEditDetails`
            if (['description', 'notes'].includes(rawAttributeId)) {
              dispatch(setActiveCharacterTab(1))
            } else {
              dispatch(setActiveCharacterTab(2))
            }
            const focusPath = characterFocusPath(characterId, tabBookId, { attributeId })
            dispatch(
              pushFocus('character', focusPath, {
                start: focusStart,
                end: focusStart + hit.length,
                direction: 'forward',
              })
            )
            dispatch(incrementJumpCounter())
            dispatch(showCharacterDetails())
            dispatch(finishJumping())
          }
        } else if (type === 'templateAttribute') {
          const [templateId, attributeName, rawBookId, rawFocusStart] = rest
          const currentCharacterAttributeBookTab = characterAttributeTabSelector(getState())
          const bookId = parseNumberOrString(rawBookId)
          const allBooks = allBooksSelector(getState())
          const book = allBooks[bookId]
          if (typeof book !== 'undefined') {
            const character = singleCharacterSelector(getState(), characterId)
            const template = character.templates.find(({ id }) => {
              return id === templateId
            })
            if (typeof template !== 'undefined') {
              const templateTab = character.templates.findIndex((template) => {
                return template.id === templateId
              })
              const attribute = template.attributes.find(({ name }) => {
                return name === attributeName
              })
              if (typeof attribute !== 'undefined') {
                const focusPath = characterFocusPath(characterId, bookId, {
                  templateId,
                  attributeName,
                })
                const focusStart = safeParseInt(rawFocusStart)
                dispatch(startJumping())
                if (currentCharacterAttributeBookTab !== bookId) {
                  dispatch(selectCharacterAttributeBookTab(bookId))
                }
                dispatch(hideCharacterDetails())
                dispatch(changeCurrentView('characters'))
                dispatch(selectCharacter(characterId))
                dispatch(startEditingSelectedCharacter())
                dispatch(
                  pushFocus('character', focusPath, {
                    start: focusStart,
                    end: focusStart + hit.length,
                    direction: 'forward',
                  })
                )
                if (templateTab !== -1) {
                  dispatch(setActiveCharacterTab(templateTab + 3))
                }
                dispatch(incrementJumpCounter())
                dispatch(showCharacterDetails())
                dispatch(finishJumping())
              }
            }
          }
        } else {
          dispatch(startJumping())
          dispatch(hideCharacterDetails())
          dispatch(changeCurrentView('characters'))
          dispatch(selectCharacter(characterId))
          dispatch(startEditingSelectedCharacter())
          const [rawFocusStart] = rest
          const focusStart = safeParseInt(rawFocusStart)
          const focusPath = characterFocusPath(characterId, 'all', { type })
          dispatch(
            pushFocus('character', focusPath, {
              start: focusStart,
              end: focusStart + hit.length,
              direction: 'forward',
            })
          )
          dispatch(incrementJumpCounter())
          dispatch(showCharacterDetails())
          dispatch(finishJumping())
        }
        return
      }
      case 'places': {
        const { path, hit } = searchHit
        const [_, _places, rawPlaceId, type, ...rest] = path.split('/')
        const placeId = safeParseInt(rawPlaceId)
        const places = allPlacesSelector(getState())
        const place = places.find(({ id }) => {
          return id === placeId
        })
        if (typeof place !== 'undefined') {
          if (type === 'customAttribute') {
            const [customAttributeName, rawFocusStart] = rest
            const focusPath = placeFocusPath(placeId, { customAttributeName })
            const focusStart = safeParseInt(rawFocusStart)
            if (typeof place[customAttributeName] !== 'undefined') {
              dispatch(startJumping())
              dispatch(changeCurrentView('places'))
              dispatch(selectPlace(placeId))
              dispatch(
                pushFocus('place', focusPath, {
                  start: focusStart,
                  end: focusStart + hit.length,
                  direction: 'forward',
                })
              )
              dispatch(startEditingSelectedPlace())
              dispatch(incrementJumpCounter())
              dispatch(finishJumping())
            }
          } else {
            const [rawFocusStart] = rest
            const focusStart = safeParseInt(rawFocusStart)
            const focusPath = placeFocusPath(placeId, { type })
            if (typeof place[type] !== 'undefined') {
              dispatch(startJumping())
              dispatch(startEditingSelectedPlace())
              dispatch(incrementJumpCounter())
              dispatch(
                pushFocus('place', focusPath, {
                  start: focusStart,
                  end: focusStart + hit.length,
                  direction: 'forward',
                })
              )
              dispatch(changeCurrentView('places'))
              dispatch(selectPlace(placeId))
              dispatch(finishJumping())
            }
          }
        }
        return
      }
      case 'tags': {
        const { path, hit } = searchHit
        const [_, _tags, rawTagId, type, rawFocusStart] = path.split('/')
        const focusStart = safeParseInt(rawFocusStart)
        const tagId = safeParseInt(rawTagId)
        const tags = allTagsSelector(getState())
        const tag = tags.find(({ id }) => {
          return id === tagId
        })
        if (typeof tag !== 'undefined' && typeof tag[type] !== 'undefined') {
          dispatch(startJumping())
          dispatch(changeCurrentView('tags'))
          dispatch(selectTag(tagId))
          dispatch(editSelectedTag())
          const focusPath = tagFocusPath(tagId, type)
          dispatch(
            pushFocus('tag', focusPath, {
              start: focusStart,
              end: focusStart + hit.length,
              direction: 'forward',
            })
          )
          dispatch(incrementJumpCounter())
          dispatch(finishJumping())
        }
        return
      }
      case 'lines': {
        const { path, hit } = searchHit
        const [_, _lines, rawLineId, type, rawFocusStart] = path.split('/')
        const focusStart = safeParseInt(rawFocusStart)
        const lineId = safeParseInt(rawLineId)
        const lines = allLinesSelector(getState())
        const line = lines.find(({ id }) => {
          return id === lineId
        })
        if (typeof line !== 'undefined' && typeof line[type] !== 'undefined') {
          dispatch(startJumping())
          dispatch(setCardDialogClose())
          dispatch(changeCurrentView('timeline'))
          dispatch(changeCurrentTimeline(line.bookId))
          dispatch(startEditingPlotlineHeadingTitle(line.id))
          const focusPath = lineFocusPath(lineId, type)
          dispatch(
            pushFocus('line', focusPath, {
              start: focusStart,
              end: focusStart + hit.length,
              direction: 'forward',
            })
          )
          dispatch(incrementJumpCounter())
          dispatch(finishJumping())
        }
        return
      }
      case 'beats': {
        const { path, hit } = searchHit
        const [_, _beats, rawBookId, rawBeatId, type, rawFocusStart] = path.split('/')
        const focusStart = safeParseInt(rawFocusStart)
        const beatId = safeParseInt(rawBeatId)
        const bookId = parseNumberOrString(rawBookId)
        const books = allBooksAsArraySelector(getState())
        const book = books.find(({ id }) => {
          return id === bookId
        })
        const beats = allBeatsAsArraySelector(getState())
        const beat = beats.find(({ id }) => {
          return id === beatId
        })
        if (
          typeof book !== 'undefined' &&
          typeof beat !== 'undefined' &&
          typeof beat[type] !== 'undefined'
        ) {
          dispatch(startJumping())
          dispatch(setCardDialogClose())
          dispatch(changeCurrentView('timeline'))
          dispatch(changeCurrentTimeline(bookId))
          dispatch(startEditingBeatHeadingTitle(beat.id))
          const focusPath = beatFocusPath(beatId, bookId, type)
          dispatch(
            pushFocus('beat', focusPath, {
              start: focusStart,
              end: focusStart + hit.length,
              direction: 'forward',
            })
          )
          dispatch(incrementJumpCounter())
          dispatch(finishJumping())
        }
        return
      }
      default: {
        return
      }
    }
  })
}

// Where "section" is one of "project", "timeline", "outline", "note",
// "character", "place", "tag", "line", or "beat".
export const pushFocus = (section, path, selection) => (dispatch) => {
  const sectionIsValid =
    ['project', 'timeline', 'outline', 'note', 'character', 'place', 'tag', 'line', 'beat'].indexOf(
      section
    ) !== -1
  const pathIsValid = Array.isArray(path) && path[0] !== 'unknown'
  const selectionIsValid =
    isObject(selection) &&
    ((typeof selection.start === 'number' &&
      typeof selection.end === 'number' &&
      typeof selection.direction === 'string') ||
      (isObject(selection.anchor) &&
        isObject(selection.focus) &&
        Array.isArray(selection.anchor.path) &&
        typeof selection.anchor.offset === 'number' &&
        typeof selection.focus.offset === 'number' &&
        Array.isArray(selection.focus.path)))
  if (sectionIsValid && pathIsValid && selectionIsValid) {
    dispatch({ type: PUSH_FOCUS, section, path, selection })
  }
}

export const nextSearchHit = () => (dispatch, getState) => {
  const state = getState()
  const searchHits = flatSearchHitsSelector(state)
  const cards = allCardsSelector(state)
  const allHitsLength = searchHits.length
  const currentHitIndex = searchDialogCurrentHitIndexSelector(state)
  const nextHitIndex = currentHitIndex + 1 < allHitsLength ? currentHitIndex + 1 : currentHitIndex
  if (currentHitIndex + 1 < allHitsLength) {
    dispatch({ type: NEXT_SEARCH_HIT })
  }
  const hit = searchHits[nextHitIndex]
  const [_, hitType] = hit.path.split('/')
  jumpToHit(cards, hitType, hit)(dispatch, getState)
}

export const previousSearchHit = () => (dispatch, getState) => {
  const state = getState()
  const cards = allCardsSelector(state)
  const searchHits = flatSearchHitsSelector(state)
  const currentHitIndex = searchDialogCurrentHitIndexSelector(state)
  const nextHitIndex = currentHitIndex - 1 >= 0 ? currentHitIndex - 1 : currentHitIndex
  if (currentHitIndex - 1 >= 0) {
    dispatch({ type: PREVIOUS_SEARCH_HIT })
  }
  const hit = searchHits[nextHitIndex]
  const [_, hitType] = hit.path.split('/')
  jumpToHit(cards, hitType, hit)(dispatch, getState)
}

export const startDeletingCardFromCardDialog = () => {
  return { type: START_DELETING_CARD_FROM_CARD_DIALOG }
}

export const stopDeletingCardFromCardDialog = () => {
  return { type: STOP_DELETING_CARD_FROM_CARD_DIALOG }
}

export const showCardDialogColorPicker = () => {
  return { type: SHOW_CARD_DIALOG_COLOR_PICKER }
}

export const hideCardDialogColorPicker = () => {
  return { type: HIDE_CARD_DIALOG_COLOR_PICKER }
}

export const showCardDialogTemplatePicker = () => {
  return { type: SHOW_CARD_DIALOG_TEMPLATE_PICKER }
}

export const hideCardDialogTemplatePicker = () => {
  return { type: HIDE_CARD_DIALOG_TEMPLATE_PICKER }
}

export const startRemovingTemplateFromCardDialog = (id) => {
  return { type: START_REMOVING_TEMPLATE_FROM_CARD_DIALOG, id }
}

export const stopRemovingTemplateFromCardDialog = () => {
  return { type: STOP_REMOVING_TEMPLATE_FROM_CARD_DIALOG }
}

export const setActiveTabOnCardDialog = (tabIndex) => {
  return { type: SET_ACTIVE_TAB_ON_CARD_DIALOG, tabIndex }
}

export function showPlaceAttributeDialog() {
  return { type: SHOW_PLACE_ATTRIBUTE_DIALOG }
}

export function hidePlaceAttributeDialog() {
  return { type: HIDE_PLACE_ATTRIBUTE_DIALOG }
}

export function startEditingSelectedPlace() {
  return { type: START_EDITING_SELECTED_PLACE }
}

export function finishEditingSelectedPlace() {
  return { type: FINISH_EDITING_SELECTED_PLACE }
}

export function showPlaceCategoryModal() {
  return { type: SHOW_PLACE_CATETORIES_MODAL }
}

export function hidePlaceCategoryModal() {
  return { type: HIDE_PLACE_CATETORIES_MODAL }
}

export function showPlaceFilterList() {
  return { type: SHOW_PLACE_FILTER_LIST }
}

export function hidePlaceFilterList() {
  return { type: HIDE_PLACE_FILTER_LIST }
}

export function showPlaceSort() {
  return { type: SHOW_PLACE_SORT }
}

export function hidePlaceSort() {
  return { type: HIDE_PLACE_SORT }
}

export function startEditingSelectedNote() {
  return { type: START_EDITING_SELECTED_NOTE }
}

export function finishEditingSelectedNote() {
  return { type: FINISH_EDITING_SELECTED_NOTE }
}

export function showNotesCategoryDialog() {
  return { type: SHOW_NOTES_CATEGORY_DIALOG }
}

export function hideNotesCategoryDialog() {
  return { type: HIDE_NOTES_CATEGORY_DIALOG }
}

export function showNotesAttributesDialog() {
  return { type: SHOW_NOTES_ATTRIBUTES_DIALOG }
}

export function hideNotesAttributesDialog() {
  return { type: HIDE_NOTES_ATTRIBUTES_DIALOG }
}

export function showNotesFilterList() {
  return { type: SHOW_NOTES_FILTER_LIST }
}

export function hideNotesFilterList() {
  return { type: HIDE_NOTES_FILTER_LIST }
}

export function showNotesSort() {
  return { type: SHOW_NOTES_SORT }
}

export function hideNotesSort() {
  return { type: HIDE_NOTES_SORT }
}

export function showCharactersAttributesDialog() {
  return { type: SHOW_CHARACTERS_ATTRIBUTES_DIALOG }
}

export function hideCharactersAttributesDialog() {
  return { type: HIDE_CHARACTERS_ATTRIBUTES_DIALOG }
}

export function showCharactersCategoryDialog() {
  return { type: SHOW_CHARACTERS_CATEGORIES_DIALOG }
}

export function hideCharactersCategoryDialog() {
  return { type: HIDE_CHARACTERS_CATEGORIES_DIALOG }
}

export function startEditingSelectedCharacter() {
  return { type: START_EDITING_SELECTED_CHARACTER }
}

export function finishEditingSelectedCharacter() {
  return { type: FINISH_EDITING_SELECTED_CHARACTER }
}

export function showCharactersTemplatePicker() {
  return { type: SHOW_CHARACTERS_TEMPLATE_PICKER }
}

export function hideCharactersTemplatePicker() {
  return { type: HIDE_CHARACTERS_TEMPLATE_PICKER }
}

export function startCreatingCharacter() {
  return { type: START_CREATING_CHARACTER }
}

export function finishCreatingCharacter() {
  return { type: FINISH_CREATING_CHARACTER }
}

export function setCharacterTemplateData(templateData) {
  return { type: SET_CHARACTER_TEMPLATE_DATA, templateData }
}

export function showCharacterFilter() {
  return { type: SHOW_CHARACTER_FILTER }
}

export function hideCharacterFilter() {
  return { type: HIDE_CHARACTER_FILTER }
}

export function showCharacterSort() {
  return { type: SHOW_CHARACTER_SORT }
}

export function hideCharacterSort() {
  return { type: HIDE_CHARACTER_SORT }
}

export function showCharacterDetails() {
  return { type: SHOW_CHARACTER_DETAILS }
}

export function hideCharacterDetails() {
  return { type: HIDE_CHARACTER_DETAILS }
}

export const startDeletingCharacter = () => {
  return { type: START_DELETING_CHARACTER }
}

export const finishDeletingCharacter = () => {
  return { type: FINISH_DELETING_CHARACTER }
}

export const startRemovingTemplateFromCharacter = () => {
  return { type: START_REMOVING_TEMPLATE_FROM_CHARACTER }
}

export const finishRemovingTemplateFromCharacter = () => {
  return { type: FINISH_REMOVING_TEMPLATE_FROM_CHARACTER }
}

export const setTemplateToRemoveFromCharacter = (template) => {
  return { type: SET_TEMPLATE_TO_REMOVE_FROM_CHARACTER, template }
}

export const setActiveCharacterTab = (tab) => {
  return { type: SET_ACTIVE_CHARACTER_TAB, tab }
}

export const showCharacterEditorTemplatePicker = () => {
  return { type: SHOW_CHARACTER_EDITOR_TEMPLATE_PICKER }
}

export const hideCharacterEditorTemplatePicker = () => {
  return { type: HIDE_CHARACTER_EDITOR_TEMPLATE_PICKER }
}

export const startEditingOutlineCard = (id) => {
  return { type: START_EDITING_OUTLINE_CARD, id }
}

export const finishEditingOutlineCard = () => {
  return { type: FINISH_EDITING_OUTLINE_CARD }
}

export function setEditingBeatTitleId(id) {
  return { type: SET_EDITING_BEAT_ID, id }
}

export function openRestructureTimelineModal() {
  return { type: OPEN_RESTRUCTURE_TIMELINE_MODAL }
}

export function closeRestructureTimelineModal() {
  return { type: CLOSE_RESTRUCTURE_TIMELINE_MODAL }
}

export function editSelectedTag() {
  return { type: EDIT_SELECTED_TAG }
}

export function finishEditingSelectedTag() {
  return { type: FINISH_EDITING_SELECTED_TAG }
}

export function toggleReplaceSearch() {
  return { type: TOGGLE_REPLACE_SEARCH }
}

export function setReplacementText(newReplacementText) {
  return { type: SET_REPLACEMENT_TEXT, newReplacementText }
}

export function toggleHitMarkedForReplacement(hit) {
  return function (dispatch, getState) {
    const state = getState()
    const currentHits = flatSearchHitsSelector(state)
    const foundInList = currentHits.find((currentHit) => {
      return isEqual(currentHit, hit)
    })
    if (foundInList) {
      dispatch({
        type: TOGGLE_HIT_MARKED_FOR_REPLACEMENT,
        hit,
      })
    }
  }
}

export function replaceMarkedHits() {
  return function (dispatch, getState) {
    const state = getState()
    const hitsMarkedForReplacement = hitsMarkedForReplacementSelector(state)
    if (hitsMarkedForReplacement.length > 0) {
      dispatch({
        type: START_SEARCHING,
      })
      const replacementText = searchReplacementTextSelector(state)
      dispatch({
        type: REPLACE_MARKED_HITS,
        hitsMarkedForReplacement,
        replacementText,
      })
      dispatch({
        type: START_VIEWING,
      })
    }
    dispatch(closeSearch())
  }
}

export function setReplaceWord(replaceWord) {
  return {
    type: SET_REPLACE_WORD,
    replaceWord,
  }
}

export function startScanningSearch() {
  return { type: START_SCANNING_SEARCH }
}

export function startEditingBeatHeadingTitle(id) {
  return { type: START_EDITING_BEAT_HEADING_TITLE, id }
}

export function stopEditingBeatHeadingTitle() {
  return { type: STOP_EDITING_BEAT_HEADING_TITLE }
}

export function startEditingPlotlineHeadingTitle(id) {
  return { type: START_EDITING_PLOTLINE_HEADING_TITLE, id }
}

export function stopEditingPlotlineHeadingTitle() {
  return { type: STOP_EDITING_PLOTLINE_HEADING_TITLE }
}

export function setDashboardModalView(view) {
  return { type: SET_DASHBOARD_MODAL_VIEW, view }
}

export function load(patching, ui) {
  return { type: LOAD_UI, patching, ui }
}
