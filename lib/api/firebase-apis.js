import { groupBy } from 'lodash'

import {
  onSessionChange,
  listenToCustomTemplates as listenToCustomTemplatesFromFirebase,
  listenForBackups as listenForBackupsFromFirebase,
  listenToFiles,
  currentUser,
} from 'wired-up-firebase'
import { convertFromNanosAndSeconds } from '../convertFromNanosAndSeconds'

let _currentKnownFiles = []
export const listenToKnownFiles = (cb) => {
  let unsubscribeFromKnownFiles = () => {}

  const unsubscribeFromSessionChanges = onSessionChange((user) => {
    if (user) {
      unsubscribeFromKnownFiles = listenToFiles(user.uid, (newFileList) => {
        _currentKnownFiles = newFileList.filter(({ deleted }) => !deleted)
        cb(_currentKnownFiles)
      })
    }
  })

  return () => {
    unsubscribeFromSessionChanges()
    unsubscribeFromKnownFiles()
  }
}

export const currentKnownFiles = () => {
  return _currentKnownFiles
}

export const listenForSessionChange = (cb) => {
  const user = currentUser()
  if (user) {
    cb({
      email: user.email,
      uid: user.uid,
    })
  }
  return onSessionChange((user) => {
    if (user) {
      cb({
        email: user.email,
        uid: user.uid,
      })
    } else {
      cb({
        email: null,
        uid: null,
      })
    }
  })
}

const annotateTemplate = (template) => ({
  ...template,
  isCloudTemplate: true,
})

let _currentCustomTemplates = []
export const listenToCustomTemplates = (cb) => {
  let unsubscribeFromCustomTemplates = () => {}

  const unsubscribeFromSessionChanges = onSessionChange((user) => {
    if (user) {
      unsubscribeFromCustomTemplates = listenToCustomTemplatesFromFirebase(
        user.uid,
        (newTemplates) => {
          const annotatedTemplates = newTemplates.map(annotateTemplate)
          _currentCustomTemplates = annotatedTemplates
          cb(annotatedTemplates)
        }
      )
    }
  })

  return () => {
    unsubscribeFromSessionChanges()
    unsubscribeFromCustomTemplates()
  }
}

export const currentCustomTemplates = () => {
  return _currentCustomTemplates
}

let _currentBackups = []
export const currentBackups = () => {
  return _currentBackups
}
export const listenToBackupsChanges = (cb) => {
  let unsubscribeFromBackupsChanges = () => {}

  const unsubscribeFromSessionChanges = onSessionChange((user) => {
    if (user) {
      unsubscribeFromBackupsChanges = listenForBackupsFromFirebase(user.uid, (backups) => {
        const grouped = groupBy(backups, (backup) => {
          const date = convertFromNanosAndSeconds(backup.lastModified) || new Date()
          return `${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`
        })
        const backupFolders = []
        Object.keys(grouped).forEach((key) => {
          backupFolders.push({
            backups: grouped[key],
            path: key,
            date: key,
            isCloudBackup: true,
          })
        })

        cb(backupFolders)
      })
    }
  })

  return () => {
    unsubscribeFromSessionChanges()
    unsubscribeFromBackupsChanges()
  }
}
