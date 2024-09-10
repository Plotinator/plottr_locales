// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'

import { fullSystemStateSelector } from './fullFileFirstOrder'

const backupsSelector = createSelector(fullSystemStateSelector, ({ backups }) => {
  return backups ?? {}
})

export const backupFoldersSelector = createSelector(backupsSelector, ({ folders }) => {
  return folders ?? []
})

export const nonEmptyBackupFoldersSelector = createSelector(
  backupFoldersSelector,
  (backupFolders) => {
    return backupFolders.filter(({ backups }) => {
      return backups.length > 0
    })
  }
)
