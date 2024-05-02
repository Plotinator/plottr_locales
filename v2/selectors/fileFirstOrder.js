// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.
import { createSelector } from 'reselect'

import { fullFileStateSelector } from './fullFileFirstOrder'

export const fileSelector = createSelector(fullFileStateSelector, ({ file }) => file ?? {})
export const fileNameSelector = createSelector(fileSelector, ({ fileName }) => fileName ?? '')
export const originalFileNameSelector = createSelector(fileSelector, ({ originalFileName }) => {
  return originalFileName ?? null
})
export const cloudFilePathSelector = createSelector(fileSelector, ({ isCloudFile, id }) => {
  return isCloudFile ? `plottr://${id}` : null
})
export const fileIdSelector = createSelector(fileSelector, ({ id }) => {
  return id ?? null
})
export const fileVersionSelector = createSelector(fileSelector, ({ version }) => {
  return version
})
export const shareRecordsSelector = createSelector(fileSelector, ({ shareRecords }) => {
  return shareRecords ?? []
})
export const originalVersionStampSelector = createSelector(
  fileSelector,
  ({ originalVersionStamp }) => {
    return originalVersionStamp
  }
)
export const currentVersionStampSelector = createSelector(fileSelector, ({ versionStamp }) => {
  return versionStamp
})
