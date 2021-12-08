import { ipcRenderer } from 'electron'

import { selectors } from 'pltr/v2'

const offlineRecorder = (store) => (next) => (action) => {
  const result = next(action)

  const state = store.getState().present
  if (
    selectors.isCloudFileSelector(state) &&
    !selectors.isOfflineSelector(state) &&
    !selectors.isResumingSelector(state)
  ) {
    ipcRenderer.send('record-offline-backup', {
      ...state,
      file: {
        ...state.file,
        originalTimeStamp: state.file.timeStamp,
        originalVersionStamp: state.file.versionStamp,
      },
    })
  }

  return result
}

export default offlineRecorder
