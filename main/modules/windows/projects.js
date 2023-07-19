import path from 'path'
import { app, ipcMain, dialog } from 'electron'
import log from 'electron-log'

import { helpers } from 'pltr/v2'
import { t } from 'plottr_locales'

import { makeBrowserWindow } from '../utils'
import { filePrefix } from '../helpers'
import { rollbar } from '../rollbar'
import { getWindowByObjectEq, addNewWindow, dereferenceWindow, focusIfOpen } from '.'
import { addToKnown } from '../known_files'
import { setLastOpenedFilePath } from '../lastOpened'
import currentSettings from '../settings'
import { whenClientIsReady } from '../../../shared/socket-client'

const copyFile = (oldFilePathOrURL, newFilePathOrURL) => {
  return whenClientIsReady(({ copyFile }) => {
    const oldFileURL = helpers.file.isDeviceFileURL(oldFilePathOrURL)
      ? oldFilePathOrURL
      : helpers.file.filePathToFileURL(oldFilePathOrURL)
    const newFileURL = helpers.file.isDeviceFileURL(newFilePathOrURL)
      ? newFilePathOrURL
      : helpers.file.filePathToFileURL(newFilePathOrURL)
    return copyFile(oldFileURL, newFileURL)
  })
}

const backupBasePath = () => {
  return whenClientIsReady(({ backupBasePath }) => {
    return backupBasePath()
  })
}

ipcMain.on('pls-open-window', (event, replyChannel, fileURL, unknown) => {
  log.info('Received command to open window for', fileURL)
  openProjectWindow(fileURL)
    .then(() => {
      if (unknown) {
        return addToKnown(fileURL)
      }
      return true
    })
    .then(() => {
      event.sender.send(replyChannel, fileURL)
    })
    .catch((error) => {
      log.error('Error opening a new window', error)
      event.sender.send(replyChannel, { error: error.message })
    })
})

function openProjectWindow(fileURL) {
  if (focusIfOpen(fileURL)) {
    log.info(`Project window for ${fileURL} is already open, focusing it.`)
    return Promise.resolve()
  } else {
    log.info('Opening new browserWindow for', fileURL)
    return Promise.all([currentSettings(), backupBasePath()]).then(([settings, backupLocation]) => {
      if (
        fileURL &&
        !settings?.user?.defaultFolder &&
        helpers.file.withoutProtocol(fileURL).startsWith(backupLocation)
      ) {
        console.log('File is a backup and default folder is disabled.  Asking user to save file.')
        const documentsPath = app.getPath('documents')
        const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]
        return dialog
          .showSaveDialog({
            filters,
            title: t('Save'),
            defaultPath: documentsPath,
          })
          .then(({ canceled, filePath }) => {
            if (canceled) {
              return Promise.resolve()
            } else {
              const date = new Date()
              const newFilePath =
                filePath.replace(/\.pltr$/, '') +
                ` from backup accessed on ${date.toDateString()}.pltr`
              return copyFile(fileURL, newFilePath)
                .then(() => {
                  return newFilePath
                })
                .then((filePath) => {
                  const fileURL = helpers.file.filePathToFileURL(filePath)
                  return openProjectWindow(fileURL).then(() => {
                    return addToKnown(fileURL)
                  })
                })
            }
          })
          .catch((error) => {
            log.error('Error saving backup to new location', error)
            return dialog.showErrorBox(t('There was a problem doing that'), t('Please try again'))
          })
      } else {
        return makeBrowserWindow(fileURL)
          .then((newWindow) => {
            const htmlFile = settings?.user?.dark === 'dark' ? 'dark_app.html' : 'app.html'
            const entryFile = filePrefix(path.join(__dirname, htmlFile))
            newWindow.loadURL(entryFile)

            newWindow.on('close', function (e) {
              e.sender.send('wants-to-close')
            })

            newWindow.on('closed', function (e) {
              const win = getWindowByObjectEq(this)
              dereferenceWindow(win)
            })

            try {
              if (fileURL) {
                app.addRecentDocument(fileURL)
                setLastOpenedFilePath(fileURL)
              }
              addNewWindow(newWindow, fileURL)
            } catch (err) {
              log.warn(err)
              rollbar.warn(err, { fileURL })
              newWindow.destroy()
            }
            return newWindow
          })
          .catch((error) => {
            log.error('Error opening project window', error)
            return Promise.reject(error)
          })
      }
    })
  }
}

export { openProjectWindow }
