import { actions } from 'wired-up-pltr'

export const publishBackupsChangesToRedux = (theWorld) => (store) => {
  const action = actions.backups.setBackupFolders
  theWorld.backups
    .currentBackups()
    .then((backups) => {
      store.dispatch(action(backups))
    })
    .catch((error) => {
      // TODO: retry?
      theWorld.logger.error(`Failed to read current backups`, error)
    })
  return theWorld.backups.listenToBackupsChanges(store, (error, newBackups) => {
    if (error) {
      if (error.code === 'ECONNABORTED') {
        theWorld.logger.warn(`Failed to receive backups (ECONNABORTED likely a timeout)`)
      } else {
        theWorld.logger.warn(`Failed to receive backups`, error)
      }
    } else {
      store.dispatch(action(newBackups))
    }
  })
}

const publishChangesToStore = (theWorld) => (store) => {
  const unsubscribeToBackupsChanges = publishBackupsChangesToRedux(theWorld)(store)

  return () => {
    unsubscribeToBackupsChanges()
  }
}

export default publishChangesToStore
