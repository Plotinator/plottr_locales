import path from 'path'
import { app, dialog } from 'electron'

import { helpers } from 'pltr'
import { t } from 'plottr_locales'

import { makeBrowserWindow } from '../utils'
import { filePrefix } from '../helpers'
import { getWindowByObjectEq, addNewWindow, dereferenceWindow, focusIfOpen } from '.'

export const makeProjectModule = (
  lastOpenedModule,
  featureFlagsModule,
  settingsModule,
  knownFilesModule,
  localClient,
  log
) => {
  const copyFile = (oldFilePathOrURL, newFilePathOrURL) => {
    const oldFileURL = helpers.file.isDeviceFileURL(oldFilePathOrURL)
      ? oldFilePathOrURL
      : helpers.file.filePathToFileURL(oldFilePathOrURL)
    const newFileURL = helpers.file.isDeviceFileURL(newFilePathOrURL)
      ? newFilePathOrURL
      : helpers.file.filePathToFileURL(newFilePathOrURL)
    return localClient.copyFile(oldFileURL, newFileURL)
  }

  const backupBasePath = () => {
    return localClient.backupBasePath()
  }

  function openProjectWindow(fileURL) {
    if (focusIfOpen(fileURL, featureFlagsModule)) {
      log.info(`Project window for ${fileURL} is already open, focusing it.`)
      return Promise.resolve()
    } else {
      log.info('Opening new browserWindow for', fileURL)
      return Promise.all([settingsModule.currentSettings(), backupBasePath()]).then(
        ([settings, backupLocation]) => {
          if (
            fileURL &&
            !settings?.user?.defaultFolder &&
            helpers.file.withoutProtocol(fileURL).startsWith(backupLocation)
          ) {
            console.log(
              'File is a backup and default folder is disabled.  Asking user to save file.'
            )
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
                    // @ts-ignore
                    filePath.replace(/\.pltr$/, '') +
                    ` from backup accessed on ${date.toDateString()}.pltr`
                  return copyFile(fileURL, newFilePath)
                    .then(() => {
                      return newFilePath
                    })
                    .then((filePath) => {
                      const fileURL = helpers.file.filePathToFileURL(filePath)
                      return openProjectWindow(fileURL).then(() => {
                        return knownFilesModule.addToKnown(fileURL)
                      })
                    })
                }
              })
              .catch((error) => {
                log.error('Error saving backup to new location', error)
                dialog.showErrorBox(t('There was a problem doing that'), t('Please try again'))
                return Promise.reject(error)
              })
          } else {
            return makeBrowserWindow(settingsModule, fileURL)
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

                if (fileURL) {
                  app.addRecentDocument(fileURL)
                  addNewWindow(newWindow, fileURL)
                  return lastOpenedModule
                    .setLastOpenedFilePath(fileURL)
                    .catch((error) => {
                      log.error('Could not set last opened file path', error)
                      newWindow.destroy()
                      return Promise.reject(error)
                    })
                    .then(() => {
                      return newWindow
                    })
                } else {
                  addNewWindow(newWindow, fileURL)
                  return Promise.resolve(newWindow)
                }
              })
              .catch((error) => {
                log.error('Error opening project window', error)
                return Promise.reject(error)
              })
          }
        }
      )
    }
  }

  return { openProjectWindow }
}
