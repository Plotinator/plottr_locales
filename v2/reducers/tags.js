import { cloneDeep, omit } from 'lodash'
import {
  ADD_TAG,
  ADD_CREATED_TAG,
  EDIT_TAG,
  DELETE_TAG,
  FILE_LOADED,
  NEW_FILE,
  DELETE_TAG_CATEGORY,
  LOAD_TAGS,
  DUPLICATE_TAG,
  REPLACE_MARKED_HITS,
  ADD_TAG_FROM_PLTR,
  UNDO,
  REDO,
  UNDO_N_TIMES,
  REDO_N_TIMES,
} from '../constants/ActionTypes'
import { tag } from '../store/initialState'
import { newFileTags } from '../store/newFileState'
import { nextId } from '../store/newIds'
import { safeParseInt } from './safeParseInt'
import { sortByHitPosition } from './sortByHitPosition'
import { replacePlainTextHit } from './replace'

const initialState = [tag]

const tags =
  (_dataRepairers) =>
  (state = initialState, action) => {
    switch (action.type) {
      case ADD_TAG:
        return [
          ...state,
          {
            id: nextId(state),
            title: tag.title,
            color: tag.color,
          },
        ]

      case ADD_CREATED_TAG:
        return [
          ...state,
          {
            ...tag,
            id: nextId(state),
            ...action.attributes,
          },
        ]

      case EDIT_TAG:
        return state.map((tag) =>
          tag.id === action.id
            ? Object.assign({}, tag, {
                title: action.title,
                color: action.color,
                categoryId: action.categoryId,
              })
            : tag
        )

      case DELETE_TAG:
        return state.filter((tag) => tag.id !== action.id)

      case FILE_LOADED:
        return action.data.tags

      case NEW_FILE:
        return newFileTags

      case DELETE_TAG_CATEGORY:
        return state.map((tag) => {
          // In one case the ids are strings and the other they are numbers
          // so just to be safe string them both
          if (String(tag.categoryId) !== String(action.category.id)) {
            return tag
          }

          return {
            ...tag,
            categoryId: null,
          }
        })

      case REPLACE_MARKED_HITS: {
        const applicableHits = action.hitsMarkedForReplacement.filter((hit) => {
          return hit.path.match(/^\/tags\/[0-9a-zA-Z]+\//)
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
          const [_, _tag, rawTagId, attributeName, rawFocusStart] = path.split('/')
          const tagId = safeParseInt(rawTagId)
          return acc.map((nextTag) => {
            if (nextTag.id === tagId) {
              const attributeValue = nextTag[attributeName]
              const focusStart = safeParseInt(rawFocusStart)
              const replaceFunction = replacePlainTextHit
              return {
                ...nextTag,
                [attributeName]: replaceFunction(
                  attributeValue,
                  focusStart,
                  hit,
                  action.replacementText
                ),
              }
            } else {
              return nextTag
            }
          })
        }, state)
      }

      case LOAD_TAGS:
        return action.tags

      case DUPLICATE_TAG: {
        const itemToDuplicate = state.find(({ id }) => id === action.id)
        if (!itemToDuplicate) {
          return state
        }
        const duplicated = {
          ...cloneDeep(itemToDuplicate),
          id: nextId(state),
        }
        return [...state, { ...duplicated }]
      }

      case ADD_TAG_FROM_PLTR: {
        if (
          typeof action?.tag?.id !== 'number' ||
          state.find(({ id }) => {
            return id === action.tag.id
          })
        ) {
          return state
        } else {
          const newTag = omit(cloneDeep(action.tag), 'isChecked')
          return [...state, newTag]
        }
      }

      case UNDO_N_TIMES:
      case REDO_N_TIMES:
      case UNDO:
      case REDO: {
        if (Array.isArray(action.state.tags)) {
          return action.state.tags
        } else {
          return state
        }
      }

      default:
        return state
    }
  }

export default tags
