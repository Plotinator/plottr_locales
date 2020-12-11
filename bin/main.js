const { app, BrowserWindow, ipcMain, dialog, globalShortcut } = require('electron')
const path = require('path')
const log = require('electron-log')
const i18n = require('format-message')
const { is } = require('electron-util')
const contextMenu = require('electron-context-menu')
const migrateIfNeeded = require('./main_modules/migration_manager')
const Exporter = require('./main_modules/exporter')
const {
  checkTrialInfo,
  turnOffTrialMode,
  startTheTrial,
  extendTheTrial,
  getTrialModeStatus,
  turnOnTrialMode,
} = require('./main_modules/trial_manager')
const { backupFile } = require('./main_modules/backup')
const { rollbar } = require('./main_modules/rollbar')
const SETTINGS = require('./main_modules/settings')
const { getLicenseInfo } = require('./main_modules/license_checker')
const TemplateManager = require('./main_modules/template_manager')
const CustomTemplateManager = require('./main_modules/custom_template_manager')
const FileManager = require('./main_modules/file_manager')
const { loadMenu } = require('./main_modules/menus')
const { setupI18n } = require('../locales')
const { openWindow, windows } = require('./main_modules/windows')
const { closeExpiredWindow, openExpiredWindow } = require('./main_modules/windows/expired')
const { openBuyWindow } = require('./main_modules/windows/buy')
const { openVerifyWindow, closeVerifyWindow } = require('./main_modules/windows/verify')
const { NODE_ENV } = require('./main_modules/constants')
const { getDarkMode } = require('./main_modules/theme')
const { gracefullyNotSave, gracefullyQuit } = require('./main_modules/utils')

const ENV_FILE_PATH = path.resolve(__dirname, '..', '.env')
require('dotenv').config({path: ENV_FILE_PATH})

let USER_INFO = getLicenseInfo()
let fileToOpen = null

// auto updates
let lastCheckedForUpdate = Date.now()
const updateCheckThreshold = 1000 * 60 * 60
log.transports.file.level = "info"

////////////////////////////////
////     Startup Tasks    //////
////////////////////////////////
log.info('--------Startup Tasks--------')
TemplateManager.load()
checkUpdatesIfAllowed()
// https://github.com/sindresorhus/electron-context-menu
contextMenu({
  prepend: (defaultActions, params, browserWindow) => []
})
setupI18n(SETTINGS)

////////////////////////////////
////     Bug Reporting    //////
////////////////////////////////
if (NODE_ENV !== 'dev') {
  process.on('uncaughtException', function (err) {
    log.error(err)
    rollbar.error(err, function(sendErr, data) {
      gracefullyQuit()
    })
  })
}

// TODO: Report crashes to our server.

////////////////////////////////
///////     EVENTS    //////////
////////////////////////////////

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (is.macos) return

  app.quit()
})

app.on('open-file', (event, path) => {
  // do the file opening here
  if (app.isReady()) {
    openWindow(path)
  } else {
    fileToOpen = path
  }
  event.preventDefault()
})

app.on('open-url', function (event, url) {
  event.preventDefault()
  // handle custom protocol links here for mac
  // make sure to check that the app is ready
  log.info("open-url event: " + url)
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (!windows.length) {
    checkLicense(() => {})
  }
})

app.on('browser-window-focus', () => {
  const currentTime = new Date().getTime()
  if (currentTime - lastCheckedForUpdate > updateCheckThreshold) {
    lastCheckedForUpdate = currentTime
    checkUpdatesIfAllowed()
  }
})

ipcMain.on('fetch-state', function (event, id) {
  var win = windows.find(w => w.id == id)
  if (win) {
    win.window.setTitle(displayFileName(win.fileName))
    win.window.setRepresentedFilename(win.fileName)

    if (win.importFrom) {
      // clear chapters and lines (they were the default)
      const json = {...win.state}
      json.chapters = []
      json.lines = []
      win.window.webContents.send('import-snowflake', json, win.fileName, win.importFrom, getDarkMode(), windows.length)
      delete win.importFrom
    } else {
      migrateIfNeeded(win.state, win.fileName, (err, migrated, json) => {
        if (err) { log.warn(err); rollbar.warn(err) }
        if (migrated) FileManager.save(win.fileName, json, () => {})

        win.lastSave = json
        win.state = json
        if (win.window.isVisible()) {
          event.sender.send('state-fetched', json, win.fileName, migrated, getDarkMode(), windows.length)
        } else {
          win.window.on('show', () => {
            event.sender.send('state-fetched', json, win.fileName, migrated, getDarkMode(), windows.length)
          })
        }
      })
    }

  }
})

ipcMain.on('save-as-template-finish', (event, id, options) => {
  let winObj = windows.find(w => w.id == id)
  if (winObj) {
    CustomTemplateManager.addNew(winObj.state, options)
  }
})

ipcMain.on('reload-window', function (event, id, state) {
  let winObj = windows.find(w => w.id == id)
  if (winObj) {
    FileManager.save(winObj.fileName, state, function(err, data) {
      if (err) { log.warn(err); rollbar.warn(err) }
      winObj.state = state
      winObj.window.webContents.reload()
    })
  }
})

ipcMain.on('launch-sent', (event) => {
  launchSent = true
})

ipcMain.on('open-buy-window', (event) => {
  closeExpiredWindow();
  openBuyWindow()
})

ipcMain.on('verify-from-expired', () => {
  closeExpiredWindow();
  openVerifyWindow()
})

ipcMain.on('license-verified', () => {
  licenseVerified(true)
})

ipcMain.on('export', (event, options, winId) => {
  var winObj = windows.find(w => w.id == winId)
  Exporter(winObj.state, options)
})

ipcMain.on('start-free-trial', () => {
  closeVerifyWindow();
  startTheTrial(daysLeft => {
    turnOnTrialMode()
    loadMenu()
    askToCreateFile()
  })
})

ipcMain.on('extend-trial', (event, days) => {
  extendTheTrial(days, () => {
    closeExpiredWindow()
    loadMenu()
    if (windows.length) {
      windows.forEach(winObj => {
        winObj.window.setTitle(displayFileName(winObj.fileName))
      })
    } else {
      openRecentFiles(fileToOpen)
    }
  })
})

ipcMain.on('dev-open-analyzer-file', (event, fileName, filePath) => {
  // save file to this directory
  // const newPath = path.join(__dirname, fileName)

  // open in new window
  openWindow(filePath)
})

app.on('ready', () => {
  loadMenu(true)

  // Register the toggleDevTools shortcut listener.
  globalShortcut.register('CommandOrControl+Alt+R', () => {
    let win = BrowserWindow.getFocusedWindow()
    if (win) win.toggleDevTools()
  })

  if (NODE_ENV != 'dev') {
    app.setAsDefaultProtocolClient('plottr')
  }

  checkLicense(() => {
    loadMenu()
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

////////////////////////////////
/////////   LICENSE   //////////
////////////////////////////////

function licenseVerified (ask) {
  closeVerifyWindow()
  USER_INFO = getLicenseInfo()
  if (getTrialModeStatus()) {
    turnOffTrialMode()
    loadMenu()
    if (ask) askToOpenOrCreate()
  } else {
    loadMenu()
    openRecentFiles(fileToOpen)
  }
}

function checkLicense (callback) {
  if (NODE_ENV === 'dev') {
    callback()
    openRecentFiles(fileToOpen)
    return
  }

  if (Object.keys(USER_INFO).length) {
    if (getTrialModeStatus()) {
      // still in trial mode
      if (USER_INFO.success) {
        turnOffTrialMode()
      }
      callback()
      openRecentFiles(fileToOpen)
    } else {
      // not-trial, normal mode
      callback()
      if (USER_INFO.success) openRecentFiles(fileToOpen)
      else openVerifyWindow()
    }
  } else {
    // no license yet, check for trial info
    checkTrialInfo(daysLeft => {
      turnOnTrialMode()
      callback()
      openRecentFiles(fileToOpen)
    }, openVerifyWindow, openExpiredWindow)
  }
}
