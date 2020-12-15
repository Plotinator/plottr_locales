const path = require('path')
const { app, ipcMain } = require('electron')
const { is } = require('electron-util')
const { filePrefix } = require('../helpers')
const { hasWindows } = require('./')
const { makeBrowserWindow } = require('../utils')

// mixpanel tracking
let launchSent = false

let dashboardWindow
ipcMain.on('pls-tell-dashboard-to-reload-recents', () => {
  reloadRecents()
})

ipcMain.on('pls-open-dashboard', () => {
  openDashboard()
})

function openDashboard () {
  if (dashboardWindow) {
    dashboardWindow.focus()
    return
  }

  const dashboardFile = path.join(filePrefix(__dirname), '../../dashboard.html')
  dashboardWindow = makeBrowserWindow('dashboard')
  dashboardWindow.loadURL(dashboardFile)

  dashboardWindow.on('close', function () {
    dashboardWindow = null
    if (!hasWindows() && !is.macos) {
      app.quit()
    }
  })
  dashboardWindow.webContents.on('did-finish-load', () => {
    if (!launchSent) {
      dashboardWindow.webContents.send('send-launch', app.getVersion())
      launchSent = true
    }
  })
}

function setDarkModeForDashboard (darkMode) {
  if (dashboardWindow) dashboardWindow.webContents.send('set-dark-mode', darkMode)
}

function reloadRecents () {
  if (dashboardWindow) dashboardWindow.webContents.send('reload-recents')
}

function reloadDashboard () {
  if (dashboardWindow) dashboardWindow.webContents.send('reload')
}

function updateOpenFiles (filePath) {
  if (dashboardWindow) dashboardWindow.webContents.send('file-closed', filePath)
}

module.exports = { openDashboard, setDarkModeForDashboard, reloadRecents, updateOpenFiles, reloadDashboard }
