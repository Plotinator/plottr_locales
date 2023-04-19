import { actions, selectors } from 'wired-up-pltr'

export const publishKnownFilesChangesToRedux = (theWorld) => (store) => {
  const action = actions.knownFiles.setKnownFiles
  theWorld.files
    .currentKnownFiles()
    .then((knownFiles) => {
      store.dispatch(action(knownFiles))
    })
    .catch((error) => {
      // TODO: retry?
      theWorld.logger.error(`Failed to read current known files`, error)
    })
  return theWorld.files.listenToknownFilesChanges(store, (newValue, oldValue) => {
    if (selectors.fileListIsLoadingSelector(store.getState())) {
      store.dispatch(actions.applicationState.finishLoadingFileList())
    }
    store.dispatch(action(newValue))
  })
}

const publishChangesToStore = (theWorld) => (store) => {
  store.dispatch(actions.applicationState.startLoadingFileList())
  const unsubscribeToKnownFilesChanges = publishKnownFilesChangesToRedux(theWorld)(store)

  return () => {
    unsubscribeToKnownFilesChanges()
  }
}

export default publishChangesToStore
