import { createSelectorCreator, defaultMemoize } from 'reselect'
import { isEqual } from 'lodash'

export const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual)

export const createAggressiveDeepEqualSelector = createSelectorCreator(defaultMemoize, {
  equalityCheck: isEqual,
  resultEqualityCheck: isEqual,
  maxSize: 100,
})
