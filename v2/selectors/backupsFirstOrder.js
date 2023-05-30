// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'
import { sortBy, groupBy } from 'lodash'

import { parseStringDate } from '../helpers/date'
import { fullFileStateSelector } from './fullFileFirstOrder'

import { t } from 'plottr_locales'

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

const sortFolders = (folders) => {
  return sortBy(folders, (folder) => {
    return parseStringDate(folder.date)
  }).reverse()
}
const groupableName = (fileObj) => {
  if (fileObj.storagePath) {
    return fileObj.fileId
  } else {
    return fileObj.name.replace('(start-session)-', '').replace('.pltr', '')
  }
}
const makeDateString = (dateObj, makeShort) => {
  let dateStr = ''
  try {
    const date = dateObj instanceof Date ? dateObj : parseStringDate(dateObj)
    const style = makeShort ? '{date, date, monthDay}' : '{date, date, medium}'
    dateStr = t(style, { date })
  } catch (error) {
    console.error(error)
  }
  return dateStr
}
export const groupedSortedBackupFoldersSelector = createSelector(
  nonEmptyBackupFoldersSelector,
  (backupFolders) => {
    const sortedFolders = sortFolders(backupFolders)
    return sortedFolders.map((f) => {
      const groups = groupBy(f.backups, groupableName)
      // const groupsWithName = Object.entries(f.groups).map((group) => {})
      return {
        ...f,
        groups,
        longDateStr: makeDateString(f.date, false),
        shortDateStr: makeDateString(f.date, true),
      }
    })
  }
)
