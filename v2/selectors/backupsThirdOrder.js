import { createSelector } from 'reselect'
import { sortBy, groupBy } from 'lodash'

import { t } from 'plottr_locales'

import { parseStringDate } from '../helpers/date'
import { nonEmptyBackupFoldersSelector } from './backupsFirstOrder'
import { cloudFileListSelector } from './knownFilesFirstOrder'
import { isLoggedIntoProWithActiveLicenseSelector } from './secondOrder'

const sortFolders = (folders) => {
  return sortBy(folders, (folder) => {
    return parseStringDate(folder.date)
  }).reverse()
}
const groupableName = (fileObj) => {
  if (fileObj.storagePath) {
    return fileObj.fileId
  } else {
    return fileObj.name.replace('(start-session)-', '')
  }
}
const makeDateString = (dateObj, makeShort) => {
  let dateStr = ''
  try {
    const date = dateObj instanceof Date ? dateObj : parseStringDate(dateObj)
    const style = makeShort ? '{date, date, monthDay}' : '{date, date, medium}'
    dateStr = t(style, { date })
  } catch (error) {
    console.error('Error creating date string', error)
  }
  return dateStr
}
const addFileNameToCloudFile = (folderPath, cloudFiles) => (fileObject) => {
  if (fileObject.storagePath) {
    const proFile = cloudFiles.find(({ id }) => {
      return id === fileObject.id
    })
    return {
      ...fileObject,
      name: proFile?.name || fileObject.id,
    }
  } else {
    const name = fileObject.name.replace('(start-session)-', '').replace(/\.pltr$/, '')
    return {
      ...fileObject,
      name,
      localFilePathSegments: [folderPath, fileObject.name],
    }
  }
}
export const groupedSortedBackupFoldersSelector = createSelector(
  nonEmptyBackupFoldersSelector,
  cloudFileListSelector,
  isLoggedIntoProWithActiveLicenseSelector,
  (backupFolders, cloudFiles, isInProMode) => {
    const sortedFolders = sortFolders(backupFolders)
    return sortedFolders
      .map((f) => {
        const filtered = f.backups.filter((backup) => {
          return (
            (backup?.storagePath && typeof backup?.storagePath === 'string' && isInProMode) ||
            typeof backup?.storagePath === 'undefined'
          )
        })
        const groups = groupBy(
          filtered.map(addFileNameToCloudFile(f.path, cloudFiles)),
          groupableName
        )
        // const groupsWithName = Object.entries(f.groups).map((group) => {})
        return {
          ...f,
          backups: filtered,
          groups,
          longDateStr: makeDateString(f.date, false),
          shortDateStr: makeDateString(f.date, true),
        }
      })
      .filter(({ backups }) => {
        return Array.isArray(backups) && backups.length > 0
      })
  }
)
