// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.
import { createSelector } from 'reselect'

import { fullFileStateSelector } from './fullFileFirstOrder'

export const errorMessageSelector = createSelector(
  fullFileStateSelector,
  (state) => state.error && state.error.error
)
export const partOfStoreWhereErrorOccured = createSelector(
  fullFileStateSelector,
  (state) => state.error && state.error.storeKey
)
