// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.
import { createSelector } from 'reselect'

import { BEAT_HIERARCHY_FLAG } from '../constants/featureFlags'
import { fullFileStateSelector } from './fullFileFirstOrder'

export const beatHierarchyIsOn = createSelector(
  fullFileStateSelector,
  (state) => state.featureFlags[BEAT_HIERARCHY_FLAG]
)

export const featureFlags = createSelector(fullFileStateSelector, (state) => state.featureFlags)
