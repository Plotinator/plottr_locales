const fs = require('fs')
const path = require('path')
const i18n = require('format-message');
const deep = require('deep-diff')
const log = require('electron-log')
const { app, BrowserWindow, dialog } = require('electron')
const { is } = require('electron-util');
const emptyFile = require('./empty_file')
const {
  TRIAL_MODE,
  NODE_ENV,
} = require('./constants');
const { getDaysLeftInTrial } = require('./trial_manager');

function emptyFileContents (name) {
  return emptyFile(name)
}

function isDirty (newState, oldState) {
  return !!deep.diff(oldState, newState)
}

function takeScreenshot () {
  let win = BrowserWindow.getFocusedWindow()
  if (win.webContents.isDevToolsOpened()) win.webContents.closeDevTools()
  win.capturePage().then(image => {
    if (process.env.NODE_ENV === 'dev') {
      const folderPath = path.join(app.getPath('home'), 'plottr_screenshots', app.getVersion())
      const date = new Date()
      const fileName = `screenshot-${date.getMinutes()}-${date.getSeconds()}.png`
      const filePath = path.join(folderPath, fileName)
      fs.stat(folderPath, (err, stat) => {
        if (err) {
          fs.mkdir(folderPath, (err) => {
            if (err) {
              log.error(err)
            } else {
              fs.writeFile(filePath, image.toPNG(), () => {})
            }
          })
        } else {
          if (stat.isDirectory()) {
            fs.writeFile(filePath, image.toPNG(), () => {})
          }
        }
      })
    } else {
      const filters = [{name: 'PNG file', extensions: ['png']}]
      const fileName = dialog.showSaveDialogSync(win, {filters})
      if (fileName) fs.writeFile(fileName + '.png', image.toPNG(), () => {})
    }
  })
}

function filePrefix(dirname) {
  return is.windows ? dirname : 'file://' + dirname
}

function displayFileName (path) {
  var stringBase = 'Plottr'
  if (TRIAL_MODE) stringBase += ' — ' + i18n('TRIAL Version') + ' (' + i18n('{days} days remaining', {days: getDaysLeftInTrial()}) + ')'
  var matches = path.match(/.*\/(.*\.pltr)/)
  if (matches) stringBase += ` — ${matches[1]}`
  if (NODE_ENV == 'dev') stringBase += ' - (DEV)'
  return stringBase
}

module.exports = {
  emptyFileContents,
  isDirty,
  takeScreenshot,
  filePrefix,
  displayFileName,
}
