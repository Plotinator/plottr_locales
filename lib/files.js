import { useMemo } from 'react'
import { sortBy } from 'lodash'
import axios from 'axios'

import { actions, reducers, emptyFile, migrateIfNeeded } from 'pltr/v2'
import {
  fetchFiles,
  listen,
  overwriteAllKeys,
  withFileId,
  shareDocument as markAsShared,
} from 'plottr_firebase'

import { store } from './redux'
import { useKnownFilesInfo } from './store_hooks'
import { appVersion } from './version'
import { initialFetch } from './plottr_firebase/src/index'

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

export const openFile = (userId, fileId, clientId, version, permission) => {
  return initialFetch(userId, fileId, clientId, version).then((json) => {
    return new Promise((resolve, reject) => {
      migrateIfNeeded(appVersion(), json, json.file.fileName, null, (error, migrated, data) => {
        if (permission !== 'owner' && json.file.version !== data.file.version) {
          console.log(
            `Could not open file with id ${fileId} for user with id ${userId} because it needed to be migrated from ${json.file.version} to ${data.file.version} and user has permission ${permission}`
          )
          return
        }
        if (error) {
          reject(error)
          return
        }
        console.log(`Loaded file ${json.file.fileName}.`)
        if (migrated) {
          console.log(
            `File was migrated.  Migration history: ${data.file.appliedMigrations}.  Initial version: ${data.file.initialVersion}`
          )
        }
        const patchData = { ...data }
        if (permission !== 'owner') {
          delete patchData.file
        }
        overwriteAllKeys(fileId, clientId, patchData).then((results) => {
          store.dispatch(
            actions.ui.loadFile(
              data.file.fileName,
              false,
              Object.assign(
                {},
                emptyFile(data.file.fileName, data.file.version),
                withFileId(fileId, data)
              ),
              data.file.version
            )
          )
          resolve(data)
        })
      })
    })
  })
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

const shareDocument = (fileId, emailAddress) => {
  return markAsShared(fileId, emailAddress).then((invitationToken) => {
      return axios.post('/api/email-invitation', { invitationToken, fileId })
    })
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
      return fetchFiles(userId).then((newFileList) => {
        setFileList(newFileList.filter(({ deleted }) => !deleted))
        selectFile({ ...newFile, id: fileId, permission: 'owner' })
        return newFileList
      })
    })
}
