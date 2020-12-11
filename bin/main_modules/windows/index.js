const path = require('path')
const { app, BrowserWindow } = require('electron')
const log = require('electron-log')
const { makeBrowserWindow } = require('../utils')
const { filePrefix } = require('../helpers')
const { rollbar } = require('../rollbar')
const { NODE_ENV } = require('../constants')
const { openBuyWindow } = require('./buy') // needed because it sets up an event handler

const windows = []

function getWindowById(id) {
  return windows.find(window => window.id === id)
}

function openWindow (filePath) {
  const newWindow = makeBrowserWindow(filePath)

  const entryFile = path.join(filePrefix(__dirname), '../../app.html')
  newWindow.loadURL(entryFile)

  // newWindow.on('closed', function () {})

  newWindow.on('close', function (e) {
    const win = getWindowById(this.id) // depends on 'this' being the window
    if (win) dereferenceWindow(win)
  })

  try {
    app.addRecentDocument(filePath)

    windows.push({
      id: newWindow.id,
      browserWindow: newWindow,
      filePath: filePath,
    })
  } catch (err) {
    log.warn(err)
    rollbar.warn(err, {filePath: filePath})
    newWindow.destroy()
  }
}

function reloadWindow () {
  let win = BrowserWindow.getFocusedWindow()
  win.webContents.send('reload')
}

function dereferenceWindow (winObj) {
  const index = windows.findIndex(win => win.id === winObj.id)
  windows.splice(index, 1)
}

function closeWindow (id) {
  let win = getWindowById(id)
  win.window.close()
}

module.exports = {
  reloadWindow,
  openWindow,
  dereferenceWindow,
  closeWindow,
  getWindowById,
  windows,
}
