import { useState, useEffect } from 'react'

export const useBackupFolders = (searchTerm) => {
  const [folders, setFolders] = useState([])
  const [foldersOnDisk, setFoldersOnDisk] = useState([])

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
