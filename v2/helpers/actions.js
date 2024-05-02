import { screamingSnakeCaseToHumanReadable } from './text'
import {
  EDIT_CARD_CUSTOM_ATTRIBUTE,
  EDIT_CARD_TEMPLATE_ATTRIBUTE,
  EDIT_PLACE_CUSTOM_ATTRIBUTE,
  EDIT_PLACE_TEMPLATE_ATTRIBUTE,
  EDIT_NOTE_CUSTOM_ATTRIBUTE,
  EDIT_CHARACTER_ATTRIBUTE_VALUE,
  EDIT_CHARACTER_TEMPLATE_ATTRIBUTE,
} from '../constants/ActionTypes'

export const entityModifiedByAction = (action) => {
  switch (action.type) {
    case EDIT_CARD_CUSTOM_ATTRIBUTE: {
      return `Card Attribute: ${action.name}`
    }
    case EDIT_CARD_TEMPLATE_ATTRIBUTE: {
      return `Card Template Attribute: ${action.name}`
    }
    case EDIT_PLACE_CUSTOM_ATTRIBUTE: {
      return `Place Attribute: ${action.name}`
    }
    case EDIT_PLACE_TEMPLATE_ATTRIBUTE: {
      return `Place Template Attribute: ${action.name}`
    }
    case EDIT_NOTE_CUSTOM_ATTRIBUTE: {
      return `Note Attribute: ${action.name}`
    }
    case EDIT_CHARACTER_ATTRIBUTE_VALUE: {
      return `Character Attribute: ${action.name}`
    }
    case EDIT_CHARACTER_TEMPLATE_ATTRIBUTE: {
      return `Character Template Attribute: ${action.name}`
    }
    default: {
      return screamingSnakeCaseToHumanReadable(action.type)
    }
  }
}
