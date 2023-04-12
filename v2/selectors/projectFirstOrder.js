// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'
import { difference } from 'lodash'

import { isDeviceFileURL } from '../helpers/file'
import { emptyFile } from '../store/newFileState'
import { SYSTEM_REDUCER_KEYS } from '../reducers/systemReducers'
import { fullFileStateSelector } from './fullFileFirstOrder'

export const projectSelector = createSelector(fullFileStateSelector, (state) => state.project)
export const selectedFileSelector = createSelector(
  fullFileStateSelector,
  (state) => state.project?.selectedFile
)
export const projectNamingModalIsVisibleSelector = createSelector(
  fullFileStateSelector,
  (state) => state.project.projectNamingModalIsVisible
)
export const newProjectTemplateSelector = createSelector(
  fullFileStateSelector,
  (state) => state.project.template
)
export const selectedFileIdSelector = createSelector(
  fullFileStateSelector,
  (state) => state.project?.selectedFile?.id
)
export const selectedFilePermissionSelector = createSelector(
  fullFileStateSelector,
  (state) => state.project?.selectedFile?.permission
)
export const fileLoadedSelector = createSelector(
  fullFileStateSelector,
  (state) => state.project && state.project.fileLoaded
)
export const isOfflineSelector = createSelector(
  fullFileStateSelector,
  (state) => state.project && state.project.isOffline
)
export const isResumingSelector = createSelector(
  fullFileStateSelector,
  (state) => state.project.resuming
)
export const isCheckingForOfflineDriftSelector = createSelector(
  fullFileStateSelector,
  (state) => state.project.checkingOfflineDrift
)
export const isOverwritingCloudWithBackupSelector = createSelector(
  fullFileStateSelector,
  (state) => state.project.overwritingCloudWithBackup
)
export const showResumeMessageDialogSelector = createSelector(
  fullFileStateSelector,
  (state) => state.project.showResumeMessageDialog
)
export const backingUpOfflineFileSelector = createSelector(
  fullFileStateSelector,
  (state) => state.project.backingUpOfflineFile
)
export const fileURLSelector = createSelector(
  fullFileStateSelector,
  (state) => state.project.fileURL
)
export const fileURLLoadedSelector = createSelector(fileURLSelector, (fileURL) => {
  return fileURL && typeof fileURL === 'string' && fileURL.length && fileURL
})
export const isDeviceFileSelector = createSelector(fileURLSelector, (fileURL) =>
  isDeviceFileURL(fileURL)
)
const emptyFileState = emptyFile('DummyFile', '2022.11.2')
export const hasAllKeysSelector = createSelector(fullFileStateSelector, (state) => {
  const withoutSystemKeys = difference(Object.keys(state), SYSTEM_REDUCER_KEYS)
  return difference(Object.keys(emptyFileState), withoutSystemKeys).length === 0
})

export const unsavedChangesSelector = createSelector(projectSelector, ({ unsavedChanges }) => {
  return unsavedChanges
})
