import { omit, isEqual, isEmpty, identity, uniqWith, groupBy, countBy } from 'lodash'

import {
  ADD_PLACES_ATTRIBUTE,
  CHANGE_CURRENT_TIMELINE,
  CHANGE_CURRENT_VIEW,
  CHANGE_ORIENTATION,
  CLOSE_ATTRIBUTES_DIALOG,
  COLLAPSE_TIMELINE,
  EDIT_PLACES_ATTRIBUTE,
  EXPAND_TIMELINE,
  FILE_LOADED,
  LOAD_UI,
  LOAD_BEATS,
  NAVIGATE_TO_BOOK_TIMELINE,
  NEW_FILE,
  OPEN_ATTRIBUTES_DIALOG,
  RECORD_TIMELINE_SCROLL_POSITION,
  REMOVE_PLACES_ATTRIBUTE,
  SET_CHARACTER_FILTER,
  SET_CHARACTER_SORT,
  SET_NOTE_FILTER,
  SET_NOTE_SORT,
  SET_OUTLINE_FILTER,
  SET_PLACE_FILTER,
  SET_PLACE_SORT,
  SET_TIMELINE_FILTER,
  SET_TIMELINE_SIZE,
  SET_NOTES_SEARCH_TERM,
  SET_TAGS_SEARCH_TERM,
  SET_PLACES_SEARCH_TERM,
  SET_CHARACTERS_SEARCH_TERM,
  SET_OUTLINE_SEARCH_TERM,
  SET_TIMELINE_SEARCH_TERM,
  ADD_NOTE,
  ADD_CHARACTER,
  ADD_PLACE,
  ADD_TAG,
  ADD_CARD,
  ADD_CREATED_TAG,
  SET_ACTIVE_TIMELINE_TAB,
  SET_TIMELINE_VIEW,
  DELETE_BEAT,
  SELECT_CHARACTER_ATTRIBUTE_BOOK_TAB,
  SELECT_CHARACTER,
  DELETE_CHARACTER_ATTRIBUTE,
  DELETE_BOOK,
  REORDER_CHARACTER_ATTRIBUTE_METADATA,
  CREATE_CHARACTER_ATTRIBUTE,
  DELETE_CHARACTER_LEGACY_CUSTOM_ATTRIBUTE,
  EDIT_CHARACTER_ATTRIBUTE_METADATA,
  SET_CARD_DIALOG_OPEN,
  SET_CARD_DIALOG_CLOSE,
  DELETE_CARD,
  CHANGE_BEAT,
  CHANGE_LINE,
  OPEN_NEW_BOOK_DIALOG,
  OPEN_EDIT_BOOK_DIALOG,
  CLOSE_BOOK_DIALOG,
  MOVE_CARD_TO_BOOK,
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
  SET_SERIES_GENRE,
  SET_SERIES_NAME,
  SET_SERIES_PREMISE,
  SET_SERIES_THEME,
  SET_BOOK_TITLE,
  SET_BOOK_PREMISE,
  SET_BOOK_GENRE,
  SET_BOOK_THEME,
  START_DELETING_CARD_FROM_CARD_DIALOG,
  STOP_DELETING_CARD_FROM_CARD_DIALOG,
  SHOW_CARD_DIALOG_COLOR_PICKER,
  HIDE_CARD_DIALOG_COLOR_PICKER,
  START_REMOVING_TEMPLATE_FROM_CARD_DIALOG,
  STOP_REMOVING_TEMPLATE_FROM_CARD_DIALOG,
  SET_ACTIVE_TAB_ON_CARD_DIALOG,
  SHOW_CARD_DIALOG_TEMPLATE_PICKER,
  HIDE_CARD_DIALOG_TEMPLATE_PICKER,
  EDIT_CARD_DESCRIPTION,
  EDIT_CARD_TITLE,
  EDIT_CARD_CUSTOM_ATTRIBUTE,
  EDIT_CARD_TEMPLATE_ATTRIBUTE,
  SHOW_PLACE_ATTRIBUTE_DIALOG,
  HIDE_PLACE_ATTRIBUTE_DIALOG,
  START_EDITING_SELECTED_PLACE,
  FINISH_EDITING_SELECTED_PLACE,
  SHOW_PLACE_CATETORIES_MODAL,
  HIDE_PLACE_CATETORIES_MODAL,
  SHOW_PLACE_FILTER_LIST,
  HIDE_PLACE_FILTER_LIST,
  SHOW_PLACE_SORT,
  HIDE_PLACE_SORT,
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
  EDIT_NOTE_TITLE,
  EDIT_NOTE_CONTENT,
  EDIT_PLACE_NAME,
  EDIT_PLACE_DESCRIPTION,
  EDIT_PLACE_NOTES,
  EDIT_NOTE_CUSTOM_ATTRIBUTE,
  EDIT_PLACE_CUSTOM_ATTRIBUTE,
  START_DELETING_CHARACTER,
  FINISH_DELETING_CHARACTER,
  START_REMOVING_TEMPLATE_FROM_CHARACTER,
  FINISH_REMOVING_TEMPLATE_FROM_CHARACTER,
  SET_TEMPLATE_TO_REMOVE_FROM_CHARACTER,
  SET_ACTIVE_CHARACTER_TAB,
  SHOW_CHARACTER_EDITOR_TEMPLATE_PICKER,
  HIDE_CHARACTER_EDITOR_TEMPLATE_PICKER,
  EDIT_CHARACTER_NAME,
  EDIT_CHARACTER_DESCRIPTION,
  EDIT_CHARACTER_TEMPLATE_ATTRIBUTE,
  EDIT_CHARACTER_ATTRIBUTE_VALUE,
  EDIT_CHARACTER_SHORT_DESCRIPTION,
  START_EDITING_OUTLINE_CARD,
  FINISH_EDITING_OUTLINE_CARD,
  TOGGLE_ADVANCED_SAVE_TEMPLATE_PANEL,
  SET_FOCUSSED_TIMELINE_TAB_BEAT,
  SET_TIMELINE_TAB_BEAT_TO_DELETE,
  SET_ACT_CONFIG_MODAL_OPEN,
  SET_EDITING_BEAT_ID,
  PIN_PLOTLINE,
  UNPIN_PLOTLINE,
  RESET_TIMELINE,
  OPEN_RESTRUCTURE_TIMELINE_MODAL,
  CLOSE_RESTRUCTURE_TIMELINE_MODAL,
  PUSH_FOCUS,
  DELETE_LINE,
  EDIT_SELECTED_TAG,
  FINISH_EDITING_SELECTED_TAG,
  TOGGLE_REPLACE_SEARCH,
  SET_REPLACEMENT_TEXT,
  OPEN_REPLACE,
  TOGGLE_HIT_MARKED_FOR_REPLACEMENT,
  UPDATE_HITS_MARKED_FOR_REPLACEMENT,
  EDIT_CARD_DETAILS,
  EDIT_NOTE,
  EDIT_PLACE,
  EDIT_SERIES,
  START_SCANNING_SEARCH,
  LOAD_LINES,
  START_EDITING_BEAT_HEADING_TITLE,
  STOP_EDITING_BEAT_HEADING_TITLE,
  START_EDITING_PLOTLINE_HEADING_TITLE,
  STOP_EDITING_PLOTLINE_HEADING_TITLE,
  REORDER_NOTE_MANUALLY,
  REORDER_CHARACTER_MANUALLY,
  REORDER_PLACE_MANUALLY,
} from '../constants/ActionTypes'
import {
  ui as defaultUI,
  card as defaultCard,
  note as defaultNote,
  place as defaultPlace,
} from '../store/initialState'
import { newFileUI } from '../store/newFileState'
import selectors from '../selectors'
import { cardFocusPath } from '../helpers/cards'

const removeCustomAttributeFilter = (state, action) => {
  if (!state.characterFilter || !state.characterFilter[(action.id || action.name).toString()]) {
    return state
  }

  const currentFilter = state.characterFilter

  return {
    ...state,
    characterFilter: omit(currentFilter, action.id.toString()),
  }
}

const addCustomAttributeOrdering = (state, fullState) => {
  const { characterAttributesForCurrentBookSelector } = selectors(identity)

  const toAttributeOrderEntry = (attribute) => {
    if (attribute.id) {
      return {
        type: 'attributes',
        id: attribute.id,
      }
    }

    return {
      type: 'customAttributes',
      name: attribute.name,
    }
  }

  // Case 1: there is no custom attribute ordering
  if (!state.customAttributeOrder) {
    const attributes = fullState?.ui ? characterAttributesForCurrentBookSelector(fullState) : []
    return {
      ...state,
      customAttributeOrder: {
        characters: attributes.map(toAttributeOrderEntry),
      },
    }
  }

  // Case 2: there is an incomplete custom attribute ordering
  const attributes = fullState?.ui ? characterAttributesForCurrentBookSelector(fullState) : []
  const notOrdered = attributes.filter((attribute) => {
    return !state.customAttributeOrder.characters.some((orderEntry) => {
      if (attribute.id) {
        return orderEntry.type === 'attributes' && orderEntry.id === attribute.id
      }

      return orderEntry.type === 'customAttributes' && orderEntry.name === attribute.name
    })
  })
  if (notOrdered.length > 0) {
    return {
      ...state,
      customAttributeOrder: {
        characters: [
          ...state.customAttributeOrder.characters,
          ...notOrdered.map(toAttributeOrderEntry),
        ],
      },
    }
  }

  return state
}

const updateUI = (state, action) => {
  let filter

  switch (action.type) {
    case CHANGE_CURRENT_VIEW:
      return Object.assign({}, state, { currentView: action.view })

    case CHANGE_ORIENTATION:
      return Object.assign({}, state, { orientation: action.orientation })

    case CHANGE_CURRENT_TIMELINE:
      return Object.assign({}, state, {
        currentTimeline: action.id,
        timelineScrollPosition: { x: 0, y: 0 },
      })

    case LOAD_BEATS: {
      if (!action.beats[state.currentTimeline]) {
        return {
          ...state,
          currentTimeline: Object.keys(action.beats)[0],
        }
      }
      return state
    }

    case LOAD_LINES: {
      const linesPerBook = groupBy(action.lines, 'bookId')
      const pinnedPlotlines = {}

      Object.entries(linesPerBook).forEach(([bookId, group]) => {
        const pinnedCount = countBy(group, 'isPinned')[true] || 0
        if (pinnedCount > 0) {
          pinnedPlotlines[String(bookId)] = pinnedCount
        }
      })

      return {
        ...state,
        timeline: {
          ...state.timeline,
          pinnedPlotlines,
        },
      }
    }

    case NAVIGATE_TO_BOOK_TIMELINE:
      return Object.assign({}, state, {
        currentTimeline: action.bookId,
        currentView: 'timeline',
        timelineScrollPosition: { x: 0, y: 0 },
      })

    case EXPAND_TIMELINE:
      return Object.assign({}, state, { timelineIsExpanded: true })

    case COLLAPSE_TIMELINE:
      return Object.assign({}, state, { timelineIsExpanded: false })

    case SET_CHARACTER_SORT:
      return Object.assign({}, state, { characterSort: `${action.attr}~${action.direction}` })

    case SET_PLACE_SORT:
      return Object.assign({}, state, { placeSort: `${action.attr}~${action.direction}` })

    case SET_NOTE_SORT:
      return Object.assign({}, state, { noteSort: `${action.attr}~${action.direction}` })

    case REORDER_CHARACTER_MANUALLY:
      return Object.assign({}, state, { characterSort: 'manual' })

    case REORDER_PLACE_MANUALLY:
      return Object.assign({}, state, { placeSort: 'manual' })

    case REORDER_NOTE_MANUALLY:
      return Object.assign({}, state, { noteSort: 'manual' })

    case SET_NOTE_FILTER:
      return Object.assign({}, state, { noteFilter: action.filter })

    case SET_CHARACTER_FILTER:
      return Object.assign({}, state, { characterFilter: action.filter })

    case ADD_PLACES_ATTRIBUTE:
      filter = { ...state.placeFilter }
      if (action.attribute.type == 'paragraph') return state
      filter[action.attribute.name] = []
      return Object.assign({}, state, { placeFilter: filter })

    case REMOVE_PLACES_ATTRIBUTE:
      filter = { ...state.placeFilter }
      delete filter[action.attribute]
      return Object.assign({}, state, { placeFilter: filter })

    case EDIT_PLACES_ATTRIBUTE:
      filter = { ...state.placeFilter }
      delete filter[action.oldAttribute.name]
      if (action.newAttribute.type == 'paragraph') return state
      filter[action.newAttribute.name] = []
      return Object.assign({}, state, { placeFilter: filter })

    case SET_PLACE_FILTER:
      return Object.assign({}, state, { placeFilter: action.filter })

    case SET_TIMELINE_FILTER:
      return Object.assign({}, state, { timelineFilter: action.filter })

    case SET_OUTLINE_FILTER: {
      if (!action.filter || !Object.values(action.filter)) {
        filter = null
      } else if (typeof action.filter === 'object') {
        filter = action.filter
      } else if (
        Array.isArray(state.outlineFilter) &&
        state.outlineFilter.includes(action.filter)
      ) {
        filter = state.outlineFilter.filter((item) => item !== action.filter)
        if (filter.length === 0) {
          filter = null
        }
      } else if (!Array.isArray(state.outlineFilter)) {
        filter = [action.filter]
      } else if (Array.isArray(state.outlineFilter)) {
        filter = [...state.outlineFilter, action.filter]
      }

      return Object.assign({}, state, { outlineFilter: filter })
    }

    case FILE_LOADED: {
      const initialState = (!isEmpty(action.data.ui) && action.data.ui) || newFileUI
      return addCustomAttributeOrdering(initialState, action.data)
    }

    case CREATE_CHARACTER_ATTRIBUTE: {
      if (action.fromLegacyAttribute) {
        return {
          ...state,
          customAttributeOrder: {
            ...state.customAttributeOrder,
            characters: state.customAttributeOrder.characters.map((attribute) => {
              if (attribute.name === action.attribute.name) {
                return {
                  type: 'attributes',
                  id: action.nextAttributeId,
                }
              }

              return attribute
            }),
          },
        }
      }

      return {
        ...state,
        customAttributeOrder: {
          ...state.customAttributeOrder,
          characters: [
            ...state.customAttributeOrder.characters,
            {
              type: 'attributes',
              id: action.nextAttributeId,
            },
          ],
        },
      }
    }

    case DELETE_CHARACTER_LEGACY_CUSTOM_ATTRIBUTE: {
      return {
        ...state,
        customAttributeOrder: {
          ...state.customAttributeOrder,
          characters: state.customAttributeOrder.characters.filter((attribute) => {
            return attribute.name !== action.attributeName
          }),
        },
      }
    }

    case DELETE_CHARACTER_ATTRIBUTE: {
      const nextState = removeCustomAttributeFilter(state, action)

      return {
        ...nextState,
        customAttributeOrder: {
          ...nextState.customAttributeOrder,
          characters: nextState.customAttributeOrder.characters.filter((attribute) => {
            return attribute.id !== action.id
          }),
        },
      }
    }

    case EDIT_CHARACTER_ATTRIBUTE_METADATA: {
      const { id, name, oldName } = action
      if (id) {
        return state
      }

      const isAttribute = (attribute) => {
        return attribute.type === 'customAttributes' && attribute.name === oldName
      }
      const existingAttribute = state.customAttributeOrder.characters.some(isAttribute)

      if (existingAttribute) {
        return {
          ...state,
          customAttributeOrder: {
            ...state.customAttributeOrder,
            characters: state.customAttributeOrder.characters.map((attribute) => {
              if (isAttribute(attribute)) {
                return {
                  ...attribute,
                  name,
                }
              }

              return attribute
            }),
          },
        }
      }

      return state
    }

    case REORDER_CHARACTER_ATTRIBUTE_METADATA: {
      const { toIndex, attributeId, attributeName } = action

      const characterAttributeOrder = state.customAttributeOrder.characters

      const isAttribute = (existingAttribute) => {
        return (
          (existingAttribute.type === 'attributes' && existingAttribute.id === attributeId) ||
          (existingAttribute.type === 'customAttributes' &&
            existingAttribute.name === attributeName)
        )
      }
      const existingAttribute = characterAttributeOrder.find(isAttribute)
      if (!existingAttribute) {
        return state
      }
      const copy = characterAttributeOrder.slice().filter((attribute) => !isAttribute(attribute))
      copy.splice(toIndex, 0, existingAttribute)

      return {
        ...state,
        customAttributeOrder: {
          characters: copy,
        },
      }
    }

    case NEW_FILE:
      return newFileUI

    case RECORD_TIMELINE_SCROLL_POSITION:
      return {
        ...state,
        timelineScrollPosition: {
          x: action.x,
          y: action.y,
        },
      }

    case RECORD_OUTLINE_SCROLL_POSITION:
      return {
        ...state,
        outlineScrollPosition: action.position,
        outlineTab: {
          ...state.outlineTab,
          selectedCard: null,
        },
      }

    case OPEN_ATTRIBUTES_DIALOG:
      return {
        ...state,
        attributesDialogIsOpen: true,
      }

    case CLOSE_ATTRIBUTES_DIALOG:
      return {
        ...state,
        attributesDialogIsOpen: false,
      }

    case SET_TIMELINE_SIZE:
      return {
        ...state,
        timeline: timeline(state.timeline, action),
      }

    case SET_NOTES_SEARCH_TERM: {
      return {
        ...state,
        searchTerms: {
          ...state.searchTerms,
          notes: action.searchTerm,
        },
      }
    }

    case ADD_NOTE: {
      return {
        ...state,
        searchTerms: {
          ...state.searchTerms,
          notes: null,
        },
      }
    }

    case SET_CHARACTERS_SEARCH_TERM: {
      return {
        ...state,
        searchTerms: {
          ...state.searchTerms,
          characters: action.searchTerm,
        },
      }
    }

    case ADD_CHARACTER: {
      return {
        ...state,
        searchTerms: {
          ...state.searchTerms,
          characters: null,
        },
        characterTab: {
          ...state.characterTab,
          selectedCharacter: action.nextCharacterId,
        },
      }
    }

    case SET_PLACES_SEARCH_TERM: {
      return {
        ...state,
        searchTerms: {
          ...state.searchTerms,
          places: action.searchTerm,
        },
      }
    }

    case ADD_PLACE: {
      return {
        ...state,
        searchTerms: {
          ...state.searchTerms,
          places: null,
        },
      }
    }

    case SET_TAGS_SEARCH_TERM: {
      return {
        ...state,
        searchTerms: {
          ...state.searchTerms,
          tags: action.searchTerm,
        },
      }
    }

    case ADD_CREATED_TAG:
    case ADD_TAG: {
      return {
        ...state,
        searchTerms: {
          ...state.searchTerms,
          tags: null,
        },
      }
    }

    case SET_OUTLINE_SEARCH_TERM: {
      return {
        ...state,
        searchTerms: {
          ...state.searchTerms,
          outline: action.searchTerm,
        },
      }
    }

    case SET_TIMELINE_SEARCH_TERM: {
      return {
        ...state,
        searchTerms: {
          ...state.searchTerms,
          timeline: action.searchTerm,
        },
      }
    }

    case ADD_CARD: {
      return {
        ...state,
        searchTerms: {
          ...state.searchTerms,
          outline: null,
          timeline: null,
        },
      }
    }

    case SET_ACTIVE_TIMELINE_TAB: {
      return {
        ...state,
        timeline: {
          ...state.timeline,
          actTab: action.activeTab,
        },
      }
    }

    case SET_TIMELINE_VIEW: {
      return {
        ...state,
        timeline: {
          ...state.timeline,
          view: action.timelineView,
        },
      }
    }

    case DELETE_BEAT: {
      return {
        ...state,
        timeline: {
          ...state.timeline,
          actTab: action.actTab || state.timeline.actTab,
        },
      }
    }

    case SELECT_CHARACTER_ATTRIBUTE_BOOK_TAB: {
      return {
        ...state,
        characterFilter: {},
        attributeTabs: {
          ...state.attributeTabs,
          characters: action.bookId,
        },
      }
    }

    case DELETE_BOOK: {
      const selectedBook = state.attributeTabs?.characters

      return {
        ...state,
        characterFilter: selectedBook === action.id ? {} : state.characterFilter,
        attributeTabs: {
          ...state.attributeTabs,
          characters: selectedBook === action.id ? 'all' : selectedBook,
        },
        timeline: {
          ...state.timeline,
          pinnedPlotlines: {
            ...(state.timeline?.pinnedPlotlines || {}),
            [action.bookId]: 0,
          },
        },
      }
    }

    case SELECT_CHARACTER: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          selectedCharacter: action.id,
        },
      }
    }

    case CHANGE_BEAT:
      return {
        ...state,
        cardDialog: {
          ...state.cardDialog,
          beatId: action.beatId,
        },
      }

    case CHANGE_LINE:
      return {
        ...state,
        cardDialog: {
          ...state.cardDialog,
          lineId: action.lineId,
        },
      }

    case SET_CARD_DIALOG_OPEN: {
      return {
        ...state,
        cardDialog: {
          ...state.cardDialog,
          cardId: action.cardId,
          lineId: action.lineId,
          beatId: action.beatId,
          isOpen: true,
          deleting: false,
          showColorPicker: false,
          showTemplatePicker: false,
          removing: false,
          removeWhichTemplate: null,
        },
      }
    }

    case MOVE_CARD_TO_BOOK:
    case DELETE_CARD:
    case SET_CARD_DIALOG_CLOSE: {
      return {
        ...state,
        cardDialog: {
          cardId: null,
          lineId: null,
          beatId: null,
          isOpen: false,
          deleting: false,
          showColorPicker: false,
          showTemplatePicker: false,
          removing: false,
          removeWhichTemplate: null,
          activeTab: 1,
        },
      }
    }

    case OPEN_EDIT_BOOK_DIALOG:
      return {
        ...state,
        bookDialog: {
          bookId: action.bookId,
          isOpen: true,
        },
      }

    case OPEN_NEW_BOOK_DIALOG: {
      return {
        ...state,
        bookDialog: {
          bookId: null,
          isOpen: true,
        },
      }
    }

    case CLOSE_BOOK_DIALOG: {
      return {
        ...state,
        bookDialog: {
          bookId: null,
          isOpen: false,
        },
      }
    }

    case TOGGLE_ADVANCED_SAVE_TEMPLATE_PANEL: {
      return {
        ...state,
        templateModal: {
          ...(state.templateModal || {}),
          expanded: !state.templateModal?.expanded,
        },
      }
    }

    case SET_FOCUSSED_TIMELINE_TAB_BEAT: {
      return {
        ...state,
        timeline: {
          ...state.timeline,
          contextMenuBeat: action.beatId,
        },
      }
    }

    case SET_TIMELINE_TAB_BEAT_TO_DELETE: {
      return {
        ...state,
        timeline: {
          ...state.timeline,
          beatToDelete: action.beatId,
        },
      }
    }

    case SET_ACT_CONFIG_MODAL_OPEN: {
      return {
        ...state,
        actConfigModal: {
          ...state.actConfigModal,
          open: action.open,
        },
      }
    }

    case SET_EDITING_BEAT_ID: {
      return {
        ...state,
        timeline: {
          ...state.timeline,
          editingBeatId: action.id,
        },
      }
    }

    case PIN_PLOTLINE: {
      return {
        ...state,
        timeline: {
          ...state.timeline,
          pinnedPlotlines: {
            ...(state.timeline?.pinnedPlotlines || {}),
            [action.bookId]: action.totalPinnedPlotlines,
          },
        },
      }
    }

    case UNPIN_PLOTLINE: {
      return {
        ...state,
        timeline: {
          ...state.timeline,
          pinnedPlotlines: {
            ...(state.timeline?.pinnedPlotlines || {}),
            [action.bookId]: action.totalPinnedPlotlines,
          },
        },
      }
    }

    case DELETE_LINE: {
      if (action.isPinned) {
        const totalPinnedPlotlines = Math.max(
          1,
          Number(state.timeline?.pinnedPlotlines[action.bookId] || 1)
        )
        return {
          ...state,
          timeline: {
            ...state.timeline,
            pinnedPlotlines: {
              ...(state.timeline?.pinnedPlotlines || {}),
              [action.bookId]: totalPinnedPlotlines - 1,
            },
          },
        }
      }
      return state
    }

    case RESET_TIMELINE: {
      return {
        ...state,
        timeline: {
          ...state.timeline,
          pinnedPlotlines: {
            ...(state.timeline?.pinnedPlotlines || {}),
            [action.bookId]: 0,
          },
        },
      }
    }

    case OPEN_RESTRUCTURE_TIMELINE_MODAL: {
      return {
        ...state,
        resturctureTimelineModal: {
          ...state.resturctureTimelineModal,
          open: true,
        },
      }
    }

    case CLOSE_RESTRUCTURE_TIMELINE_MODAL: {
      return {
        ...state,
        resturctureTimelineModal: {
          ...state.resturctureTimelineModal,
          open: false,
        },
      }
    }

    case CLOSE_SEARCH: {
      return {
        ...state,
        searchDialog: {
          ...(state.searchDialog || {}),
          isOpen: false,
          scanning: false,
          replacing: false,
        },
      }
    }

    case OPEN_SEARCH: {
      return {
        ...state,
        searchDialog: {
          ...(state.searchDialog || {}),
          isOpen: true,
          scanning: false,
          replacing: false,
        },
      }
    }

    case OPEN_REPLACE: {
      return {
        ...state,
        searchDialog: {
          ...(state.searchDialog || {}),
          isOpen: true,
          replacing: true,
        },
      }
    }

    case SET_SEARCH_TERM: {
      return {
        ...state,
        searchDialog: {
          ...(state.searchDialog || {}),
          term: action.term,
          currentHitIndex: 0,
          scanning: false,
        },
      }
    }

    case UPDATE_HITS_MARKED_FOR_REPLACEMENT: {
      const hitsToReplace = state.searchDialog.hitsToReplace || []
      const newHits = action.newHits
      const validHits = uniqWith(
        hitsToReplace.reduce((acc, nextHit) => {
          const matchingNewHit = newHits.find((newHit) => {
            return newHit.path === nextHit.path
          })
          if (!matchingNewHit) {
            return acc
          } else {
            return [matchingNewHit, ...acc]
          }
        }, []),
        isEqual
      )
      return {
        ...state,
        searchDialog: {
          ...state.searchDialog,
          hitsToReplace: validHits,
        },
      }
    }

    case NEXT_SEARCH_HIT: {
      return {
        ...state,
        searchDialog: {
          ...(state.searchDialog || {}),
          currentHitIndex: !state.searchDialog?.scanning
            ? 0
            : (state.searchDialog.currentHitIndex || 0) + 1,
          scanning: true,
        },
      }
    }

    case PREVIOUS_SEARCH_HIT: {
      return {
        ...state,
        searchDialog: {
          ...(state.searchDialog || {}),
          currentHitIndex: (state.searchDialog.currentHitIndex || 0) - 1,
          scanning: true,
        },
      }
    }

    case SELECT_OUTLINE_CARD: {
      return {
        ...state,
        outlineTab: {
          ...state.outlineTab,
          selectedCard: action.cardId,
        },
      }
    }

    case SELECT_NOTE: {
      return {
        ...state,
        noteTab: {
          ...state.noteTab,
          selectedNote: action.id,
        },
      }
    }

    case SELECT_PLACE: {
      return {
        ...state,
        placeTab: {
          ...state.placeTab,
          selectedPlace: action.id,
        },
      }
    }

    case SELECT_TAG: {
      return {
        ...state,
        tagTab: {
          ...state.tags,
          selectedTag: action.id,
        },
      }
    }

    // ===Updating Focus===
    // Project
    case EDIT_SERIES: {
      const attributesToUpdate = Object.keys(action.attributes).filter((attribute) => {
        return ['name', 'premise', 'genre', 'theme'].indexOf(attribute) !== -1
      })
      return attributesToUpdate.reduce((acc, nextAttributeKey) => {
        const pathToSet = [nextAttributeKey]
        const newFocus = {
          path: pathToSet,
          selection: action.attributes[nextAttributeKey].selection,
        }
        const key = 'projectTab'
        const foci = acc[key]?.focus || []
        const existing = foci.find(({ path }) => {
          return isEqual(path, pathToSet)
        })
        if (!action.attributes[nextAttributeKey].selection) {
          return acc
        } else {
          if (existing) {
            return {
              ...acc,
              [key]: {
                ...acc[key],
                focus: [
                  newFocus,
                  ...foci.filter(({ path }) => {
                    return !isEqual(path, pathToSet)
                  }),
                ],
              },
            }
          }
          return {
            ...acc,
            [key]: {
              ...acc[key],
              focus: [newFocus, ...foci],
            },
          }
        }
      }, state)
    }
    case SET_BOOK_TITLE:
    case SET_BOOK_PREMISE:
    case SET_BOOK_GENRE:
    case SET_BOOK_THEME:
    case SET_SERIES_NAME:
    case SET_SERIES_PREMISE:
    case SET_SERIES_GENRE:
    case SET_SERIES_THEME: {
      const pathToSet =
        action.type === SET_SERIES_NAME
          ? ['name']
          : action.type === SET_SERIES_PREMISE
          ? ['premise']
          : action.type === SET_SERIES_GENRE
          ? ['genre']
          : action.type === SET_SERIES_THEME
          ? ['theme']
          : action.type === SET_BOOK_TITLE
          ? ['book', action.id, 'title']
          : action.type === SET_BOOK_PREMISE
          ? ['book', action.id, 'premise']
          : action.type === SET_BOOK_GENRE
          ? ['book', action.id, 'genre']
          : ['book', action.id, 'theme']
      const newFocus = {
        path: pathToSet,
        selection: action.selection,
      }
      const seriesFoci = state.projectTab?.focus || []
      const existing = seriesFoci.find(({ path }) => {
        return isEqual(path, pathToSet)
      })
      if (existing) {
        return {
          ...state,
          projectTab: {
            ...state.projectTab,
            focus: [
              newFocus,
              ...seriesFoci.filter(({ path }) => {
                return !isEqual(path, pathToSet)
              }),
            ],
          },
        }
      }
      return {
        ...state,
        projectTab: {
          ...state.projectTab,
          focus: [newFocus, ...seriesFoci],
        },
      }
    }
    // Timeline & Outline
    case EDIT_CARD_DETAILS: {
      const attributesToUpdate = Object.keys(action.attributes).filter((attribute) => {
        return typeof defaultCard[attribute] !== 'undefined'
      })
      return attributesToUpdate.reduce((acc, nextAttributeKey) => {
        const baseAttributeName = nextAttributeKey
        const pathToSet = cardFocusPath(action.id, {
          baseAttributeName,
        })
        const newFocus = {
          path: pathToSet,
          selection: action.attributes[nextAttributeKey].selection,
        }
        const key =
          acc.currentView === 'timeline'
            ? 'timeline'
            : acc.currentView === 'outline'
            ? 'outlineTab'
            : 'timeline'
        const foci = acc[key]?.focus || []
        const existing = foci.find(({ path }) => {
          return isEqual(path, pathToSet)
        })
        if (!action.attributes[nextAttributeKey].selection) {
          return acc
        } else {
          if (existing) {
            return {
              ...acc,
              [key]: {
                ...acc[key],
                focus: [
                  newFocus,
                  ...foci.filter(({ path }) => {
                    return !isEqual(path, pathToSet)
                  }),
                ],
              },
            }
          }
          return {
            ...acc,
            [key]: {
              ...acc[key],
              focus: [newFocus, ...foci],
            },
          }
        }
      }, state)
    }
    case EDIT_CARD_TEMPLATE_ATTRIBUTE:
    case EDIT_CARD_CUSTOM_ATTRIBUTE:
    case EDIT_CARD_TITLE:
    case EDIT_CARD_DESCRIPTION: {
      const baseAttributeName =
        action.type === EDIT_CARD_DESCRIPTION
          ? 'description'
          : action.type === EDIT_CARD_TITLE
          ? 'title'
          : null
      const customAttributeName = action.type === EDIT_CARD_CUSTOM_ATTRIBUTE ? action.name : null
      const template =
        action.type === EDIT_CARD_TEMPLATE_ATTRIBUTE
          ? {
              id: action.templateId,
              attributeName: action.name,
            }
          : null
      const pathToSet = cardFocusPath(action.id, {
        baseAttributeName,
        customAttributeName,
        template,
      })
      const newFocus = {
        path: pathToSet,
        selection: action.selection,
      }
      const key =
        state.currentView === 'timeline'
          ? 'timeline'
          : state.currentView === 'outline'
          ? 'outlineTab'
          : 'timeline'
      const foci = state[key]?.focus || []
      const existing = foci.find(({ path }) => {
        return isEqual(path, pathToSet)
      })
      if (existing) {
        return {
          ...state,
          [key]: {
            ...state[key],
            focus: [
              newFocus,
              ...foci.filter(({ path }) => {
                return !isEqual(path, pathToSet)
              }),
            ],
          },
        }
      }
      return {
        ...state,
        [key]: {
          ...state[key],
          focus: [newFocus, ...foci],
        },
      }
    }
    // Notes.
    case EDIT_NOTE: {
      const attributesToUpdate = Object.keys(action.attributes).filter((attribute) => {
        return typeof defaultNote[attribute] !== 'undefined'
      })
      return attributesToUpdate.reduce((acc, nextAttributeKey) => {
        const baseAttributeName = nextAttributeKey
        const pathToSet = ['note', action.id, baseAttributeName]
        const newFocus = {
          path: pathToSet,
          selection: action.attributes[nextAttributeKey].selection,
        }
        const key = 'noteTab'
        const foci = acc[key]?.focus || []
        const existing = foci.find(({ path }) => {
          return isEqual(path, pathToSet)
        })
        if (!action.attributes[nextAttributeKey].selection) {
          return acc
        } else {
          if (existing) {
            return {
              ...acc,
              [key]: {
                ...acc[key],
                focus: [
                  newFocus,
                  ...foci.filter(({ path }) => {
                    return !isEqual(path, pathToSet)
                  }),
                ],
              },
            }
          }
          return {
            ...acc,
            [key]: {
              ...acc[key],
              focus: [newFocus, ...foci],
            },
          }
        }
      }, state)
    }
    case EDIT_NOTE_CUSTOM_ATTRIBUTE:
    case EDIT_NOTE_TITLE:
    case EDIT_NOTE_CONTENT: {
      const pathToSet =
        action.type === EDIT_NOTE_TITLE
          ? ['note', action.id, 'title']
          : action.type === EDIT_NOTE_CONTENT
          ? ['note', action.id, 'content']
          : action.type === EDIT_NOTE_CUSTOM_ATTRIBUTE
          ? ['note', action.id, action.name]
          : ['unknown']
      const newFocus = {
        path: pathToSet,
        selection: action.selection,
      }
      const foci = state.noteTab?.focus || []
      const existing = foci.find(({ path }) => {
        return isEqual(path, pathToSet)
      })
      if (existing) {
        return {
          ...state,
          noteTab: {
            ...state.noteTab,
            focus: [
              newFocus,
              ...foci.filter(({ path }) => {
                return !isEqual(path, pathToSet)
              }),
            ],
          },
        }
      }
      return {
        ...state,
        noteTab: {
          ...state.noteTab,
          focus: [newFocus, ...foci],
        },
      }
    }
    // Characters
    case EDIT_CHARACTER_NAME:
    case EDIT_CHARACTER_DESCRIPTION:
    case EDIT_CHARACTER_TEMPLATE_ATTRIBUTE:
    case EDIT_CHARACTER_SHORT_DESCRIPTION:
    case EDIT_CHARACTER_ATTRIBUTE_VALUE: {
      const pathToSet =
        action.type === EDIT_CHARACTER_NAME
          ? ['character', action.id, 'name']
          : action.type === EDIT_CHARACTER_DESCRIPTION
          ? [
              'character',
              action.characterId,
              'description',
              action.attributeId,
              action.currentBookId,
            ]
          : action.type === EDIT_CHARACTER_SHORT_DESCRIPTION
          ? [
              'character',
              action.characterId,
              'short-description',
              action.attributeId,
              action.currentBookId,
            ]
          : action.type === EDIT_CHARACTER_TEMPLATE_ATTRIBUTE
          ? ['character', action.id, 'template', action.templateId, action.name, action.bookId]
          : action.type === EDIT_CHARACTER_ATTRIBUTE_VALUE
          ? ['character', action.characterId, action.attributeId, action.bookId]
          : ['unknown']
      const newFocus = {
        path: pathToSet,
        selection: action.selection,
      }
      const foci = state.characterTab?.focus || []
      const existing = foci.find(({ path }) => {
        return isEqual(path, pathToSet)
      })
      if (existing) {
        return {
          ...state,
          characterTab: {
            ...state.characterTab,
            focus: [
              newFocus,
              ...foci.filter(({ path }) => {
                return !isEqual(path, pathToSet)
              }),
            ],
          },
        }
      }
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          focus: [newFocus, ...foci],
        },
      }
    }
    // Places
    case EDIT_PLACE: {
      const attributesToUpdate = Object.keys(action.attributes).filter((attribute) => {
        return typeof defaultPlace[attribute] !== 'undefined'
      })
      return attributesToUpdate.reduce((acc, nextAttributeKey) => {
        const baseAttributeName = nextAttributeKey
        const pathToSet = ['place', action.id, baseAttributeName]
        const newFocus = {
          path: pathToSet,
          selection: action.attributes[nextAttributeKey].selection,
        }
        const key = 'placeTab'
        const foci = acc[key]?.focus || []
        const existing = foci.find(({ path }) => {
          return isEqual(path, pathToSet)
        })
        if (!action.attributes[nextAttributeKey].selection) {
          return acc
        } else {
          if (existing) {
            return {
              ...acc,
              [key]: {
                ...acc[key],
                focus: [
                  newFocus,
                  ...foci.filter(({ path }) => {
                    return !isEqual(path, pathToSet)
                  }),
                ],
              },
            }
          }
          return {
            ...acc,
            [key]: {
              ...acc[key],
              focus: [newFocus, ...foci],
            },
          }
        }
      }, state)
    }
    case EDIT_PLACE_CUSTOM_ATTRIBUTE:
    case EDIT_PLACE_NAME:
    case EDIT_PLACE_DESCRIPTION:
    case EDIT_PLACE_NOTES: {
      const pathToSet =
        action.type === EDIT_PLACE_NAME
          ? ['place', action.id, 'name']
          : action.type === EDIT_PLACE_DESCRIPTION
          ? ['place', action.id, 'description']
          : action.type === EDIT_PLACE_NOTES
          ? ['place', action.id, 'notes']
          : action.type === EDIT_PLACE_CUSTOM_ATTRIBUTE
          ? ['place', action.id, action.name]
          : ['unknown']
      const newFocus = {
        path: pathToSet,
        selection: action.selection,
      }
      const foci = state.placeTab?.focus || []
      const existing = foci.find(({ path }) => {
        return isEqual(path, pathToSet)
      })
      if (existing) {
        return {
          ...state,
          placeTab: {
            ...state.placeTab,
            focus: [
              newFocus,
              ...foci.filter(({ path }) => {
                return !isEqual(path, pathToSet)
              }),
            ],
          },
        }
      }
      return {
        ...state,
        placeTab: {
          ...state.placeTab,
          focus: [newFocus, ...foci],
        },
      }
    }
    // Generic
    case PUSH_FOCUS: {
      const { section, path, selection } = action
      const rootKey =
        section === 'project'
          ? 'projectTab'
          : ['timeline', 'beat', 'line'].indexOf(section) !== -1
          ? 'timeline'
          : section === 'outline'
          ? 'outlineTab'
          : section === 'note'
          ? 'noteTab'
          : section === 'character'
          ? 'characterTab'
          : section === 'place'
          ? 'placeTab'
          : section === 'tag'
          ? 'tagTab'
          : null
      if (!rootKey) {
        return state
      } else {
        const foci = state[rootKey]?.focus || []
        const existing = foci.find((focus) => {
          return isEqual(focus.path, path)
        })
        const newFocus = {
          path,
          selection,
        }
        if (existing) {
          return {
            ...state,
            [rootKey]: {
              ...state[rootKey],
              focus: [
                newFocus,
                ...foci.filter((focus) => {
                  return !isEqual(focus.path, path)
                }),
              ],
            },
          }
        } else {
          return {
            ...state,
            [rootKey]: {
              ...state[rootKey],
              focus: [newFocus, ...foci],
            },
          }
        }
      }
    }

    case START_DELETING_CARD_FROM_CARD_DIALOG: {
      return {
        ...state,
        cardDialog: {
          ...state.cardDialog,
          deleting: true,
        },
      }
    }

    case STOP_DELETING_CARD_FROM_CARD_DIALOG: {
      return {
        ...state,
        cardDialog: {
          ...state.cardDialog,
          deleting: false,
        },
      }
    }

    case SHOW_CARD_DIALOG_COLOR_PICKER: {
      return {
        ...state,
        cardDialog: {
          ...state.cardDialog,
          showColorPicker: true,
        },
      }
    }

    case HIDE_CARD_DIALOG_COLOR_PICKER: {
      return {
        ...state,
        cardDialog: {
          ...state.cardDialog,
          showColorPicker: false,
        },
      }
    }

    case SHOW_CARD_DIALOG_TEMPLATE_PICKER: {
      return {
        ...state,
        cardDialog: {
          ...state.cardDialog,
          showTemplatePicker: true,
        },
      }
    }

    case HIDE_CARD_DIALOG_TEMPLATE_PICKER: {
      return {
        ...state,
        cardDialog: {
          ...state.cardDialog,
          showTemplatePicker: false,
        },
      }
    }

    case START_REMOVING_TEMPLATE_FROM_CARD_DIALOG: {
      return {
        ...state,
        cardDialog: {
          ...state.cardDialog,
          showTemplatePicker: true,
          removeWhichTemplate: action.id,
        },
      }
    }

    case STOP_REMOVING_TEMPLATE_FROM_CARD_DIALOG: {
      return {
        ...state,
        cardDialog: {
          ...state.cardDialog,
          showTemplatePicker: false,
          removeWhichTemplate: null,
        },
      }
    }

    case SET_ACTIVE_TAB_ON_CARD_DIALOG: {
      return {
        ...state,
        cardDialog: {
          ...state.cardDialog,
          activeTab: action.tabIndex,
        },
      }
    }

    case SHOW_PLACE_ATTRIBUTE_DIALOG: {
      return {
        ...state,
        placeTab: {
          ...state.placeTab,
          attributeDialogOpen: true,
        },
      }
    }

    case HIDE_PLACE_ATTRIBUTE_DIALOG: {
      return {
        ...state,
        placeTab: {
          ...state.placeTab,
          attributeDialogOpen: false,
        },
      }
    }

    case START_EDITING_SELECTED_PLACE: {
      return {
        ...state,
        placeTab: {
          ...state.placeTab,
          editingSelected: true,
        },
      }
    }

    case FINISH_EDITING_SELECTED_PLACE: {
      return {
        ...state,
        placeTab: {
          ...state.placeTab,
          editingSelected: false,
        },
      }
    }

    case SHOW_PLACE_CATETORIES_MODAL: {
      return {
        ...state,
        placeTab: {
          ...state.placeTab,
          categoriesOpen: true,
        },
      }
    }

    case HIDE_PLACE_CATETORIES_MODAL: {
      return {
        ...state,
        placeTab: {
          ...state.placeTab,
          categoriesOpen: false,
        },
      }
    }

    case SHOW_PLACE_FILTER_LIST: {
      return {
        ...state,
        placeTab: {
          ...state.placeTab,
          filterVisible: true,
        },
      }
    }

    case HIDE_PLACE_FILTER_LIST: {
      return {
        ...state,
        placeTab: {
          ...state.placeTab,
          filterVisible: false,
        },
      }
    }

    case SHOW_PLACE_SORT: {
      return {
        ...state,
        placeTab: {
          ...state.placeTab,
          sortVisible: true,
        },
      }
    }

    case HIDE_PLACE_SORT: {
      return {
        ...state,
        placeTab: {
          ...state.placeTab,
          sortVisible: false,
        },
      }
    }

    case START_EDITING_SELECTED_NOTE: {
      return {
        ...state,
        noteTab: {
          ...state.noteTab,
          editingSelected: true,
        },
      }
    }

    case FINISH_EDITING_SELECTED_NOTE: {
      return {
        ...state,
        noteTab: {
          ...state.noteTab,
          editingSelected: false,
        },
      }
    }

    case SHOW_NOTES_CATEGORY_DIALOG: {
      return {
        ...state,
        noteTab: {
          ...state.noteTab,
          categoriesDialogOpen: true,
        },
      }
    }

    case HIDE_NOTES_CATEGORY_DIALOG: {
      return {
        ...state,
        noteTab: {
          ...state.noteTab,
          categoriesDialogOpen: false,
        },
      }
    }

    case SHOW_NOTES_ATTRIBUTES_DIALOG: {
      return {
        ...state,
        noteTab: {
          ...state.noteTab,
          attributesDialogOpen: true,
        },
      }
    }

    case HIDE_NOTES_ATTRIBUTES_DIALOG: {
      return {
        ...state,
        noteTab: {
          ...state.noteTab,
          attributesDialogOpen: false,
        },
      }
    }

    case SHOW_NOTES_FILTER_LIST: {
      return {
        ...state,
        noteTab: {
          ...state.noteTab,
          filterVisible: true,
        },
      }
    }

    case HIDE_NOTES_FILTER_LIST: {
      return {
        ...state,
        noteTab: {
          ...state.noteTab,
          filterVisible: false,
        },
      }
    }

    case SHOW_NOTES_SORT: {
      return {
        ...state,
        noteTab: {
          ...state.noteTab,
          sortVisible: true,
        },
      }
    }

    case HIDE_NOTES_SORT: {
      return {
        ...state,
        noteTab: {
          ...state.noteTab,
          sortVisible: false,
        },
      }
    }

    case SHOW_CHARACTERS_ATTRIBUTES_DIALOG: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          attributesDialogOpen: true,
        },
      }
    }

    case HIDE_CHARACTERS_ATTRIBUTES_DIALOG: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          attributesDialogOpen: false,
        },
      }
    }

    case SHOW_CHARACTERS_CATEGORIES_DIALOG: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          categoriesDialogOpen: true,
        },
      }
    }

    case HIDE_CHARACTERS_CATEGORIES_DIALOG: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          categoriesDialogOpen: false,
        },
      }
    }

    case START_EDITING_SELECTED_CHARACTER: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          editingSelected: true,
        },
      }
    }

    case FINISH_EDITING_SELECTED_CHARACTER: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          editingSelected: false,
        },
      }
    }

    case SHOW_CHARACTERS_TEMPLATE_PICKER: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          showTemplatePicker: true,
        },
      }
    }

    case HIDE_CHARACTERS_TEMPLATE_PICKER: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          showTemplatePicker: false,
        },
      }
    }

    case START_CREATING_CHARACTER: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          creating: true,
        },
      }
    }

    case FINISH_CREATING_CHARACTER: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          creating: false,
        },
      }
    }

    case SET_CHARACTER_TEMPLATE_DATA: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          templateData: action.templateData,
        },
      }
    }

    case SHOW_CHARACTER_FILTER: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          filterVisible: true,
        },
      }
    }

    case HIDE_CHARACTER_FILTER: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          filterVisible: false,
        },
      }
    }

    case SHOW_CHARACTER_SORT: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          sortVisible: true,
        },
      }
    }

    case HIDE_CHARACTER_SORT: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          sortVisible: false,
        },
      }
    }

    case SHOW_CHARACTER_DETAILS: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          detailsVisible: true,
        },
      }
    }

    case HIDE_CHARACTER_DETAILS: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          detailsVisible: false,
        },
      }
    }

    case START_DELETING_CHARACTER: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          characterEditor: {
            ...state.characterTab.characterEditor,
            deleting: true,
          },
        },
      }
    }

    case FINISH_DELETING_CHARACTER: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          characterEditor: {
            ...state.characterTab.characterEditor,
            deleting: false,
          },
        },
      }
    }

    case START_REMOVING_TEMPLATE_FROM_CHARACTER: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          characterEditor: {
            ...state.characterTab.characterEditor,
            removing: true,
          },
        },
      }
    }

    case FINISH_REMOVING_TEMPLATE_FROM_CHARACTER: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          characterEditor: {
            ...state.characterTab.characterEditor,
            removing: false,
          },
        },
      }
    }

    case SET_TEMPLATE_TO_REMOVE_FROM_CHARACTER: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          characterEditor: {
            ...state.characterTab.characterEditor,
            removeWhichTemplate: action.template,
          },
        },
      }
    }

    case SET_ACTIVE_CHARACTER_TAB: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          characterEditor: {
            ...state.characterTab.characterEditor,
            activeTab: action.tab,
          },
        },
      }
    }

    case SHOW_CHARACTER_EDITOR_TEMPLATE_PICKER: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          characterEditor: {
            ...state.characterTab.characterEditor,
            showTemplatePicker: true,
          },
        },
      }
    }

    case HIDE_CHARACTER_EDITOR_TEMPLATE_PICKER: {
      return {
        ...state,
        characterTab: {
          ...state.characterTab,
          characterEditor: {
            ...state.characterTab.characterEditor,
            showTemplatePicker: false,
          },
        },
      }
    }

    case START_EDITING_OUTLINE_CARD: {
      return {
        ...state,
        outlineTab: {
          ...state.outlineTab,
          cardEditor: {
            ...state.outlineTab.cardEditor,
            editing: action.id,
          },
        },
      }
    }

    case FINISH_EDITING_OUTLINE_CARD: {
      return {
        ...state,
        outlineTab: {
          ...state.outlineTab,
          cardEditor: {
            ...state.outlineTab.cardEditor,
            editing: null,
          },
        },
      }
    }

    case EDIT_SELECTED_TAG: {
      return {
        ...state,
        tagTab: {
          ...state.tagTab,
          editingSelectedTab: true,
        },
      }
    }

    case FINISH_EDITING_SELECTED_TAG: {
      return {
        ...state,
        tagTab: {
          ...state.tagTab,
          editingSelectedTab: false,
        },
      }
    }

    case TOGGLE_REPLACE_SEARCH: {
      return {
        ...state,
        searchDialog: {
          ...state.searchDialog,
          replacing: !state.searchDialog.replacing,
        },
      }
    }

    case SET_REPLACEMENT_TEXT: {
      return {
        ...state,
        searchDialog: {
          ...state.searchDialog,
          replacement: action.newReplacementText,
        },
      }
    }

    case TOGGLE_HIT_MARKED_FOR_REPLACEMENT: {
      const hitsToReplace = state.searchDialog.hitsToReplace || []
      const hasHit =
        hitsToReplace.findIndex((hit) => {
          return hit.path === action.hit.path
        }) !== -1
      const newHits = hasHit
        ? hitsToReplace.filter((hit) => {
            return hit.path !== action.hit.path
          })
        : [action.hit, ...hitsToReplace]
      return {
        ...state,
        searchDialog: {
          ...state.searchDialog,
          hitsToReplace: newHits,
        },
      }
    }

    case START_SCANNING_SEARCH: {
      return {
        ...state,
        searchDialog: {
          ...state.searchDialog,
          scanning: true,
          currentHitIndex: 0,
        },
      }
    }

    case START_EDITING_BEAT_HEADING_TITLE: {
      return {
        ...state,
        timeline: {
          ...state.timeline,
          beatHeadingTitleBeingEdited: action.id,
        },
      }
    }

    case STOP_EDITING_BEAT_HEADING_TITLE: {
      return {
        ...state,
        timeline: {
          ...state.timeline,
          beatHeadingTitleBeingEdited: null,
        },
      }
    }

    case START_EDITING_PLOTLINE_HEADING_TITLE: {
      return {
        ...state,
        timeline: {
          ...state.timeline,
          plotlineTitleBeingEdited: action.id,
        },
      }
    }

    case STOP_EDITING_PLOTLINE_HEADING_TITLE: {
      return {
        ...state,
        timeline: {
          ...state.timeline,
          plotlineTitleBeingEdited: null,
        },
      }
    }

    default:
      return state
  }
}

const ui =
  (dataRepairers) =>
  (state = defaultUI, action) => {
    if (action.type === 'LOAD_UI') {
      return action.ui
    }

    if (
      action.currentlyShouldBeLoggedIn &&
      !action.currentUserId &&
      action.currentPermission !== 'owner'
    ) {
      return state
    }
    if (action.currentlyShouldBeLoggedIn && action.currentUserId) {
      if (!action.currentPermission) {
        return state
      }
      if (action.currentPermission === 'owner') {
        return updateUI(state, action)
      } else if (action.currentPermission === 'collaborator') {
        if (!state.collaborators || !state.collaborators.collaborators) {
          return {
            ...state,
            collaborators: {
              collaborators: [
                {
                  ...updateUI(state, action),
                  id: action.currentUserId,
                },
              ],
              viewers: state?.collaborators?.viewers || [],
            },
          }
        }

        const collaboratorExists = state?.collaborators?.collaborators?.some((uiState) => {
          return uiState.id === action.currentUserId
        })

        if (collaboratorExists) {
          return {
            ...state,
            collaborators: {
              ...state.collaborators,
              collaborators: state.collaborators.collaborators.map((collaboratorUI) => {
                if (collaboratorUI.id === action.currentUserId) {
                  return updateUI(collaboratorUI, action)
                } else {
                  return collaboratorUI
                }
              }),
            },
          }
        } else {
          return {
            ...state,
            collaborators: {
              ...state.collaborators,
              collaborators: [
                ...state.collaborators.collaborators,
                {
                  ...updateUI(omit(state, 'collaborators'), action),
                  id: action.currentUserId,
                },
              ],
            },
          }
        }
      } else if (action.currentPermission === 'viewer') {
        if (!state.collaborators || !state.collaborators.viewers) {
          return {
            ...state,
            collaborators: {
              viewers: [
                {
                  ...updateUI(state, action),
                  id: action.currentUserId,
                },
              ],
              collaborators: state?.collaborators?.collaborators || [],
            },
          }
        }

        const collaboratorExists = state?.collaborators?.viewers?.some((uiState) => {
          return uiState.id === action.currentUserId
        })

        if (collaboratorExists) {
          return {
            ...state,
            collaborators: {
              ...state.collaborators,
              viewers: state.collaborators.viewers.map((collaboratorUI) => {
                if (collaboratorUI.id === action.currentUserId) {
                  return updateUI(collaboratorUI, action)
                } else {
                  return collaboratorUI
                }
              }),
            },
          }
        } else {
          return {
            ...state,
            collaborators: {
              ...state.collaborators,
              viewers: [
                ...state.collaborators.viewers,
                {
                  ...updateUI(omit(state, 'collaborators'), action),
                  id: action.currentUserId,
                },
              ],
            },
          }
        }
      } else {
        return state
      }
    }
    return updateUI(state, action)
  }

function timeline(state = defaultUI.timeline, action) {
  switch (action.type) {
    case SET_TIMELINE_SIZE:
      return Object.assign({}, state, { size: action.newSize })
    default:
      return state
  }
}

export default ui
