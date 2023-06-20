import path from 'path'
import { app, ipcMain } from 'electron'
import log from 'electron-log'
import { makeBrowserWindow } from '../utils'
import { filePrefix } from '../helpers'
import { rollbar } from '../rollbar'
import { getWindowByObjectEq, addNewWindow, dereferenceWindow, focusIfOpen } from '.'
import { addToKnown } from '../known_files'
import { setLastOpenedFilePath } from '../lastOpened'
import currentSettings from '../settings'

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
  }
  log.info('Opening new browserWindow for', fileURL)
  return currentSettings().then((settings) => {
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
  })
}

export { openProjectWindow }
