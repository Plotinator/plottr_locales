import { useMemo } from 'react'
import { sortBy } from 'lodash'
import axios from 'axios'
import { reducers, emptyFile } from 'pltr/v2'

import { useKnownFilesInfo } from './store_hooks'
import { fetchFiles, listen } from 'plottr_firebase'
import { appVersion } from './version'

export function useSortedKnownFiles(searchTerm) {
  const [files] = useKnownFilesInfo()
  const sortedIds = useMemo(() => {
    const filteredFileIds = Object.keys(files).filter((id) => {
      if (searchTerm && searchTerm.length > 1) {
        const f = files[`${id}`]
        return (f.path || f.fileName).toLowerCase().includes(searchTerm)
      } else {
        return true
      }
    })
    return sortBy(filteredFileIds, (id) => files[`${id}`].lastOpened).reverse()
  }, [files, searchTerm])

  return [sortedIds, files]
}

export const messageOpenExistingFile = () => {
  const openEvent = new Event('open-existing-file', { bubbles: true, cancelable: false })
  document.dispatchEvent(openEvent)
}

export const messageRenameFile = (fileId) => {
  const renameEvent = new Event('rename-file', { bubbles: true, cancelable: false })
  renameEvent.fileId = fileId
  document.dispatchEvent(renameEvent)
}

export const newEmptyFile = (fileName, appVersion, currentFile) => {
  const emptyFileState = emptyFile(fileName, appVersion)
  return {
    ...emptyFileState,
    project: currentFile.project,
    client: currentFile.client,
    permission: reducers.permission(),
    error: reducers.error(),
  }
}

export const newFile = (
  emailAddress,
  userId,
  fileName,
  fullState,
  setFileList,
  selectFile,
  clientId
) => {
  const file = fullState.present
  const newFile = {
    ...file.file,
    none: false,
    fileName,
    shareRecords: [{ emailAddress, permission: 'owner' }],
    version: appVersion(),
  }
  delete newFile.id

  return axios
    .post(
      '/api/new-file',
      {
        fileRecord: newFile,
        file,
      },
      { params: { userId } }
    )
    .then((response) => {
      const fileId = response.data.fileId
      listen(userId, fileId, clientId, newFile.version)
      return fetchFiles(userId).then((newFileList) => {
        setFileList(newFileList.filter(({ deleted }) => !deleted))
        selectFile({ ...newFile, id: fileId, permission: 'owner' })
        return newFileList
      })
    })
}
