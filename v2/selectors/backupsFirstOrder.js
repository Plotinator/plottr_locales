// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'

import { fullFileStateSelector } from './fullFileFirstOrder'

export const backupFoldersSelector = createSelector(
  fullFileStateSelector,
  (state) => state.backups.folders
)

export const nonEmptyBackupFoldersSelector = createSelector(
  backupFoldersSelector,
  (backupFolders) => {
    return backupFolders.filter(({ backups }) => {
      return backups.length > 0
    })
  }
)
