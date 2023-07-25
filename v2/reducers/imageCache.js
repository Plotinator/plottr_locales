import { omit } from 'lodash'

import { CACHE_IMAGE, PURGE_IMAGE } from '../constants/ActionTypes'

const INITIAL_STATE = {}

const imageCacheReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case CACHE_IMAGE: {
      return {
        ...state,
        [action.storageUrl]: {
          publicUrl: action.publicUrl,
          timestamp: action.timestamp,
        },
      }
    }
    case PURGE_IMAGE: {
      return omit(state, action.storageUrl)
    }
    default: {
      return state
    }
  }
}

export default imageCacheReducer
