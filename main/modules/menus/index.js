import { Menu, ipcMain, BrowserWindow } from 'electron'
import log from 'electron-log'

import { buildPlottrMenu } from './plottr'
import { buildEditMenu } from './edit'
import { buildWindowMenu } from './window'
import { buildHelpMenu } from './help'
import { buildFileMenu } from './file'
import { buildViewMenu } from './view'
import { getWindowById } from '../windows'
import replyWithError from '../../lib/replyWithError'

let safelyExitModule = null
let projectModule = null
let featureFlagsModule = null
let settingsModule = null
let knownFilesModule = null
let localClient = null

ipcMain.on('please-reload-menu', (event, replyChannel) => {
  log.info('Menu reload requested.')
  if (!safelyExitModule) {
    log.error('Requesting a menu reload, but we have not built them before.')
    event.sender.send(replyChannel, 'not-ready')
    return
  }
  loadMenu(
    safelyExitModule,
    projectModule,
    featureFlagsModule,
    settingsModule,
    knownFilesModule,
    localClient
  )
    .then(() => {
      log.info('Reloaded menu')
      event.sender.send(replyChannel, 'done')
    })
    .catch((error) => {
      log.error('Error reloading menu', error)
      replyWithError(replyChannel, error)
    })
})

function getFocussedWindow() {
  try {
    return BrowserWindow.getFocusedWindow()
  } catch (error) {
    log.warn('Ignoring error getting the current browser window', error)
    return null
  }
}

function buildMenu(safelyExit, project, featureFlags, settings, knownFiles, client) {
  safelyExitModule = safelyExit
  projectModule = project
  featureFlagsModule = featureFlags
  settingsModule = settings
  knownFilesModule = knownFiles
  localClient = client
  const win = getFocussedWindow()
  let fileURL = null
  if (win) {
    const winObj = getWindowById(win.id)
    if (winObj) {
      fileURL = winObj.fileURL
    }
  }

  const getTrialInfo = client.currentTrial

  return Promise.all([
    buildPlottrMenu(
      buildMenu,
      safelyExit,
      projectModule,
      featureFlagsModule,
      settingsModule,
      knownFilesModule,
      client
    ),
    buildFileMenu(
      fileURL,
      getTrialInfo,
      projectModule,
      featureFlagsModule,
      settingsModule,
      knownFilesModule
    ),
  ]).then(([plottrMenu, fileMenu]) => {
    return [
      plottrMenu,
      fileMenu,
      buildEditMenu(),
      buildViewMenu(),
      buildWindowMenu(),
      buildHelpMenu(),
    ]
  })
}

function loadMenu(safelyExit, project, featureFlags, settings, knownFiles, localClient) {
  return buildMenu(safelyExit, project, featureFlags, settings, knownFiles, localClient).then(
    (template) => {
      const menu = Menu.buildFromTemplate(template)
      Menu.setApplicationMenu(menu)
    }
  )
}

export { loadMenu }
