import { identity } from 'lodash'

import {
  SET_HIERARCHY_LEVELS,
  EDIT_HIERARCHY_LEVEL,
  LOAD_HIERARCHY,
} from '../constants/ActionTypes'
import selectors from '../selectors'

const { currentTimelineSelector } = selectors(identity)

export const setHierarchyLevels = (newHierarchyLevels) => (dispatch, getState) => {
  const state = getState()
  const timeline = currentTimelineSelector(state)

  dispatch({
    type: SET_HIERARCHY_LEVELS,
    hierarchyLevels: newHierarchyLevels,
    timeline,
  })
}

export const editHierarchyLevel = (hierarchyLevel) => (dispatch, getState) => {
  const state = getState()
  const timeline = currentTimelineSelector(state)

  dispatch({
    type: EDIT_HIERARCHY_LEVEL,
    hierarchyLevel,
    timeline,
  })
}

export const load = (patching, hierarchy) => {
  return {
    type: LOAD_HIERARCHY,
    patching,
    hierarchy,
  }
}
