const { nativeTheme, BrowserWindow } = require('electron')
const SETTINGS = require('./settings')

let darkMode = false

function getDarkMode() {
  return darkMode
}

function setDarkMode(newValue) {
  switch (newValue) {
    case 'system':
      darkMode = nativeTheme.shouldUseDarkColors
      setThemeListener()
      break
    case 'dark':
      darkMode = true
      removeThemeListener()
      break
    case 'light':
    default:
      darkMode = false
      removeThemeListener()
      break
  }
}

function setThemeListener() {
  nativeTheme.on('updated', () => {
    darkMode = nativeTheme.shouldUseDarkColors
    broadcastDarkMode()
  })
}

function removeThemeListener() {
  nativeTheme.removeAllListeners('updated')
}

function broadcastDarkMode() {
  BrowserWindow.getAllWindows().forEach((bw) => {
    bw.webContents.send('set-dark-mode', darkMode)
  })
}

setDarkMode(SETTINGS.get('user.dark'))

module.exports = {
  getDarkMode,
  setDarkMode,
  setThemeListener,
  removeThemeListener,
  broadcastDarkMode,
}
