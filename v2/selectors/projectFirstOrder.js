// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'
import { difference } from 'lodash'

import { isDeviceFileURL } from '../helpers/file'
import { emptyFile } from '../store/newFileState'
import { SYSTEM_REDUCER_KEYS } from '../reducers/systemReducers'
import { fullFileStateSelector } from './fullFileFirstOrder'

export const projectSelector = createSelector(fullFileStateSelector, ({ project }) => project)
export const selectedFileSelector = createSelector(
  projectSelector,
  ({ selectedFile }) => selectedFile || {}
)
export const projectNamingModalIsVisibleSelector = createSelector(
  projectSelector,
  ({ projectNamingModalIsVisible }) => projectNamingModalIsVisible
)
export const newProjectTemplateSelector = createSelector(
  projectSelector,
  ({ template }) => template
)
export const selectedFileIdSelector = createSelector(selectedFileSelector, ({ id }) => id)
export const selectedFilePermissionSelector = createSelector(
  selectedFileSelector,
  ({ permission }) => permission
)
export const fileLoadedSelector = createSelector(projectSelector, ({ fileLoaded }) => fileLoaded)
export const isOfflineSelector = createSelector(projectSelector, ({ isOffline }) => isOffline)
export const isResumingSelector = createSelector(projectSelector, ({ resuming }) => resuming)
export const isCheckingForOfflineDriftSelector = createSelector(
  projectSelector,
  ({ checkingOfflineDrift }) => checkingOfflineDrift
)
export const isOverwritingCloudWithBackupSelector = createSelector(
  projectSelector,
  ({ overwritingCloudWithBackup }) => overwritingCloudWithBackup
)
export const showResumeMessageDialogSelector = createSelector(
  projectSelector,
  ({ showResumeMessageDialog }) => showResumeMessageDialog
)
export const backingUpOfflineFileSelector = createSelector(
  projectSelector,
  ({ backingUpOfflineFile }) => backingUpOfflineFile
)
export const fileURLSelector = createSelector(projectSelector, ({ fileURL }) => fileURL)
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
