import { createSelector } from 'reselect'
import { sortBy, groupBy } from 'lodash'

import { t } from 'plottr_locales'

import { parseStringDate } from '../helpers/date'
import { nonEmptyBackupFoldersSelector } from './backupsFirstOrder'
import { cloudFileListSelector } from './knownFilesFirstOrder'

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
const addFileNameToCloudFile = (cloudFiles) => (fileObject) => {
  if (fileObject.storagePath) {
    const proFile = cloudFiles.find(({ id }) => {
      return id === fileObject.id
    })
    return {
      ...fileObject,
      name: proFile?.name || fileObject.id,
    }
  } else {
    const name = fileObject.name.replace('(start-session)-', '').replace('.pltr', '')
    return {
      ...fileObject,
      name,
    }
  }
}

export const groupedSortedBackupFoldersSelector = createSelector(
  nonEmptyBackupFoldersSelector,
  cloudFileListSelector,
  (backupFolders, cloudFiles) => {
    const sortedFolders = sortFolders(backupFolders)
    return sortedFolders.map((f) => {
      const groups = groupBy(f.backups.map(addFileNameToCloudFile(cloudFiles)), groupableName)
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
