// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'
import { difference } from 'lodash'

import { isDeviceFileURL } from '../helpers/file'

import { emptyFile } from '../store/newFileState'
import { SYSTEM_REDUCER_KEYS } from '../reducers/systemReducers'

export const projectSelector = (state) => state.project
export const selectedFileSelector = (state) => state.project?.selectedFile
export const projectNamingModalIsVisibleSelector = (state) =>
  state.project.projectNamingModalIsVisible
export const newProjectTemplateSelector = (state) => state.project.template
export const selectedFileIdSelector = (state) => state.project?.selectedFile?.id
export const selectedFilePermissionSelector = (state) => state.project?.selectedFile?.permission
export const fileLoadedSelector = (state) => state.project && state.project.fileLoaded
export const isOfflineSelector = (state) => state.project && state.project.isOffline
export const isResumingSelector = (state) => state.project.resuming
export const isCheckingForOfflineDriftSelector = (state) => state.project.checkingOfflineDrift
export const isOverwritingCloudWithBackupSelector = (state) =>
  state.project.overwritingCloudWithBackup
export const showResumeMessageDialogSelector = (state) => state.project.showResumeMessageDialog
export const backingUpOfflineFileSelector = (state) => state.project.backingUpOfflineFile
export const fileURLSelector = (state) => state.project.fileURL
export const fileURLLoadedSelector = createSelector(fileURLSelector, (fileURL) => {
  return fileURL && typeof fileURL === 'string' && fileURL.length && fileURL
})
export const isDeviceFileSelector = createSelector(fileURLSelector, (fileURL) =>
  isDeviceFileURL(fileURL)
)
const emptyFileState = emptyFile('DummyFile', '2022.11.2')
export const hasAllKeysSelector = (state) => {
  const withoutSystemKeys = difference(Object.keys(state), SYSTEM_REDUCER_KEYS)
  return difference(Object.keys(emptyFileState), withoutSystemKeys).length === 0
}

export const unsavedChangesSelector = createSelector(projectSelector, ({ unsavedChanges }) => {
  return unsavedChanges
})

export const fullFileStateSelector = (state) => state
