import { useState, useEffect } from 'react'
import { groupBy } from 'lodash'

import { t } from 'plottr_locales'
import { listenForBackups } from 'wired-up-firebase'

const visualDateStringFromDateString = (dateString) => {
  return t('{date, date, medium}', {
    date: new Date(dateString.replace(/_/g, '-')),
  })
}

export const useBackupFolders = (userId, searchTerm, folderSearch) => {
  const [folders, setFolders] = useState([])
  const [foldersOnDisk, setFoldersOnDisk] = useState([])

  useEffect(() => {
    return listenForBackups(userId, (backups) => {
      const grouped = groupBy(backups, (backup) => {
        const date = backup?.lastModified?.toDate() || new Date()
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      })
      const backupFolders = []
      Object.keys(grouped).forEach((key) => {
        backupFolders.push({
          backups: grouped[key],
          path: key,
          date: grouped[key][0]?.lastModified?.toDate() || new Date(),
        })
      })
      setFoldersOnDisk(backupFolders)
    })
  }, [userId])

  useEffect(() => {
    if (searchTerm && searchTerm.length > 1) {
      const matchingFolders = foldersOnDisk.reduce((acc, obj) => {
        const matches = folderSearch
          ? obj.backups
          : obj.backups.filter((f) => f.fileName?.toLowerCase()?.includes(searchTerm.toLowerCase()))
        const folderDate = visualDateStringFromDateString(obj.path)
        if (
          folderDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (matches.length && !folderSearch)
        ) {
          acc.push({ ...obj, backups: matches })
        }
        return acc
      }, [])
      setFolders(matchingFolders)
    } else {
      setFolders(foldersOnDisk)
    }
  }, [foldersOnDisk, searchTerm, folderSearch])

  return folders
}
