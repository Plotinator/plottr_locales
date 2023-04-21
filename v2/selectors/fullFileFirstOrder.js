// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.
import { identity } from 'lodash'
import { createSelector } from 'reselect'

export const fullFileStateSelector = createSelector(identity, (state) => state)
