import {
  FILE_LOADED,
  NEW_FILE,
  RESET,
  EDIT_SERIES,
  LOAD_SERIES,
  SET_SERIES_NAME,
  SET_SERIES_PREMISE,
  SET_SERIES_GENRE,
  SET_SERIES_THEME,
  REPLACE_MARKED_HITS,
} from '../constants/ActionTypes'
import { series as defaultSeries } from '../store/initialState'
import { newFileSeries } from '../store/newFileState'
import { safeParseInt } from './safeParseInt'
import { sortByHitPosition } from './sortByHitPosition'
import { replacePlainTextHit } from './replace'

const series =
  (dataRepairers) =>
  (state = defaultSeries, action) => {
    switch (action.type) {
      case EDIT_SERIES: {
        const attributes = Object.keys(action.attributes).reduce((acc, nextKey) => {
          const attribute = action.attributes[nextKey]
          return {
            ...acc,
            [nextKey]: typeof attribute.value === 'undefined' ? attribute : attribute.value,
          }
        }, {})
        return {
          ...state,
          ...attributes,
        }
      }

      case SET_SERIES_NAME: {
        return {
          ...state,
          name: action.name,
        }
      }

      case SET_SERIES_PREMISE: {
        return {
          ...state,
          premise: action.premise,
        }
      }

      case SET_SERIES_GENRE: {
        return {
          ...state,
          genre: action.genre,
        }
      }

      case SET_SERIES_THEME: {
        return {
          ...state,
          theme: action.theme,
        }
      }

      case REPLACE_MARKED_HITS: {
        const applicableHits = action.hitsMarkedForReplacement.filter((hit) => {
          return hit.path.startsWith('/project/series')
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
          const [_, _project, _series, attribute, rawFocusStart] = path.split('/')
          const focusStart = safeParseInt(rawFocusStart)
          if (['name', 'premise', 'genre', 'theme'].indexOf(attribute) !== -1) {
            return {
              ...acc,
              [attribute]: replacePlainTextHit(
                acc[attribute],
                focusStart,
                hit,
                action.replacementText
              ),
            }
          } else {
            return acc
          }
        }, state)
      }

      case RESET:
      case FILE_LOADED:
        return action.data.series

      case NEW_FILE:
        return newFileSeries

      case LOAD_SERIES:
        return action.series

      default:
        return state
    }
  }

export default series
