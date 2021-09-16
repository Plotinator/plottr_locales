import { useState, useEffect } from 'react'
import { groupBy } from 'lodash'

import { listenForBackups } from 'plottr_firebase'

export const useBackupFolders = (userId, searchTerm) => {
  const [folders, setFolders] = useState([])
  const [foldersOnDisk, setFoldersOnDisk] = useState([])

  useEffect(() => {
    return listenForBackups(userId, (backups) => {
      const grouped = groupBy(backups, (backup) => {
        const date = backup.lastModified.toDate()
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      })
      const backupFolders = []
      Object.keys(grouped).forEach((key) => {
        backupFolders.push({
          backups: grouped[key],
          path: key,
          date: grouped[key][0].lastModified.toDate(),
        })
      })
      setFoldersOnDisk(backupFolders)
    })
  }, [userId])

  useEffect(() => {
    if (searchTerm && searchTerm.length > 1) {
      const matchingFolders = foldersOnDisk.reduce((acc, obj) => {
        const matches = obj.backups.filter((f) => f.toLowerCase().includes(searchTerm))
        const folderDate = new Date(obj.date.replace(/_/g, '-')).toString().toLowerCase()
        if (folderDate.includes(searchTerm) || matches.length) {
          acc.push({ ...obj, backups: matches })
        }
        return acc
      }, [])
      setFolders(matchingFolders)
    } else {
      setFolders(foldersOnDisk)
    }
  }, [foldersOnDisk, searchTerm])

  return folders
}
