// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.
import { createSelector } from 'reselect'
import { get } from 'lodash'

import { fullFileStateSelector } from './fullFileFirstOrder'

export const fileSelector = createSelector(fullFileStateSelector, ({ file }) => file)
export const fileNameSelector = createSelector(fullFileStateSelector, (state) =>
  get(state, 'file.fileName')
)
export const originalFileNameSelector = createSelector(fullFileStateSelector, (state) => {
  return get(state, 'file.originalFileName')
})
export const cloudFilePathSelector = createSelector(fullFileStateSelector, (state) => {
  const file = state.file
  if (!file) {
    return null
  }
  return file.isCloudFile ? `plottr://${file.id}` : null
})
export const fileIdSelector = createSelector(fullFileStateSelector, (state) => {
  const file = state.file
  if (!file) {
    return null
  }
  return file.id
})
