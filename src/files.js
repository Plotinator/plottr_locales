import { ipcRenderer, shell } from 'electron'
import { getCurrentWindow, app, dialog } from '@electron/remote'
import fs, { readFileSync } from 'fs'
import path from 'path'

import { t } from 'plottr_locales'
import { actions, reducers, emptyFile, selectors } from 'pltr/v2'

import { closeDashboard } from './dashboard-events'
import { store } from './app/store'
import logger from '../shared/logger'
import { uploadToFirebase } from './upload-to-firebase'
import { whenClientIsReady } from '../shared/socket-client'

const fsPromises = fs.promises

const version = app.getVersion()
const moveItemToTrash = shell.trashItem

const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]

const OFFLINE_FILE_FILES_PATH = path.join(app.getPath('userData'), 'offline')

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

const newFileName = (fileList, name) => {
  if (name) {
    return name
  }

  const untitledFileList = fileList.filter(({ fileName }) => {
    return fileName && fileName.match(/Untitled/g)
  })
  return t('Untitled') + ` - ${untitledFileList.length}`
}

export const newFile = (
  emailAddress,
  userId,
  fileList,
  fullState,
  clientId,
  template,
  openFile,
  name
) => {
  const fileName = newFileName(fileList, name)
  const newFile = newEmptyFile(fileName, version, fullState.present)
  const file = Object.assign({}, newFile, template || {})
  if (!file.beats.series) {
    file.beats.series = newFile.beats.series
  }
  if (file.books[1]) {
    file.books[1].title = fileName
  }
  if (fileName) {
    file.series.name = fileName
  }
  return uploadToFirebase(emailAddress, userId, file, fileName).then((response) => {
    const fileId = response.data.fileId
    openFile(`plottr://${fileId}`, fileId, false)
    closeDashboard()
    return fileId
  })
}

export const uploadExisting = (emailAddress, userId, fullState) => {
  const filePath = fullState.file.fileName
  return uploadToFirebase(
    emailAddress,
    userId,
    fullState,
    path.basename(filePath, path.extname(filePath))
  )
}

export const messageRenameFile = (fileId) => {
  const renameEvent = new Event('rename-file', { bubbles: true, cancelable: false })
  renameEvent.fileId = fileId
  document.dispatchEvent(renameEvent)
}

// FIXME: we should get to a point where `whenClientIsReady` is
// injected everywhere.
export const saveFile = (filePath, file) => {
  return whenClientIsReady(({ saveFile }) => {
    return saveFile(filePath, file)
  })
}

export const editKnownFilePath = (oldFilePath, newFilePath) => {
  ipcRenderer.send('edit-known-file-path', oldFilePath, newFilePath)
}

const win = getCurrentWindow()

export const showSaveDialogSync = (options) => dialog.showSaveDialogSync(win, options)

const escapeFileName = (fileName) => {
  return escape(fileName.replace(/[/\\]/g, '-'))
}

export const offlineFilePathFromFileName = (filePath) => {
  const fileName = escapeFileName(filePath)
  return path.join(OFFLINE_FILE_FILES_PATH, fileName)
}

export const offlineFilePath = (file) => {
  if (!file?.file?.fileName) {
    return null
  }

  if (file.file.fileName.startsWith(OFFLINE_FILE_FILES_PATH)) {
    return file.file.fileName
  }

  return offlineFilePathFromFileName(file.file.fileName)
}

export const renameFile = (filePath) => {
  if (filePath.startsWith('plottr://')) {
    const fileList = selectors.knownFilesSelector(store.getState().present)
    const fileId = filePath.replace(/^plottr:\/\//, '')
    if (!fileList.find(({ id }) => id === fileId)) {
      logger.error(`Coludn't find file with id: ${fileId} to rename`)
      return
    }
    if (fileId) messageRenameFile(fileId)
    return
  }
  const fileName = showSaveDialogSync({
    filters,
    title: t('Give this file a new name'),
    defaultPath: filePath,
  })
  if (fileName) {
    try {
      let newFilePath = fileName.includes('.pltr') ? fileName : `${fileName}.pltr`
      editKnownFilePath(filePath, newFilePath)
      const contents = JSON.parse(readFileSync(filePath, 'utf-8'))
      saveFile(newFilePath, contents)
      moveItemToTrash(filePath, true)
      store.dispatch(actions.applicationState.finishRenamingFile())
    } catch (error) {
      logger.error(error)
      store.dispatch(actions.applicationState.finishRenamingFile())
      dialog.showErrorBox(t('Error'), t('There was an error doing that. Try again'))
    }
  }
}

export const renameCloudBackupFile = (fileName, newName) => {
  return fsPromises
    .rename(offlineFilePathFromFileName(fileName), offlineFilePathFromFileName(newName))
    .catch((error) => {
      // Ignore errors renaming the backup file.
      return true
    })
}

export const deleteCloudBackupFile = (fileName) => {
  const filePath = offlineFilePathFromFileName(fileName)
  return fsPromises.unlink(filePath).catch((error) => {
    // Ignore errors deleting the backup file.
    return true
  })
}
