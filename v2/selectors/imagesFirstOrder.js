// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.
import { createSelector } from 'reselect'

import { fullFileStateSelector } from './fullFileFirstOrder'

export const imagesSelector = createSelector(fullFileStateSelector, (state) => state.images)
const imageIdSelector = (_state, id) => id
export const imageByIdSelector = createSelector(
  imagesSelector,
  imageIdSelector,
  (images, imageId) => {
    return images[imageId]
  }
)
