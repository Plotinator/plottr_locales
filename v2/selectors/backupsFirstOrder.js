// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'
import { sortBy } from 'lodash'

import { parseStringDate } from '../helpers/date'

export const backupFoldersSelector = (state) => state.backups.folders

export const nonEmptyBackupFoldersSelector = createSelector(
  backupFoldersSelector,
  (backupFolders) => {
    return backupFolders.filter(({ backups }) => {
      return backups.length > 0
    })
  }
)

const sortFolders = (folders) => {
  return sortBy(folders, (folder) => {
    return parseStringDate(folder.date)
  }).reverse()
}
export const sortedBackupFoldersSelector = createSelector(
  nonEmptyBackupFoldersSelector,
  (backupFolders) => sortFolders(backupFolders)
)
