import { saveBackup } from 'wired-up-firebase'
import { ActionTypes } from 'pltr/v2'

import { logger } from '../logger'

const { FILE_SAVED, FILE_LOADED, SET_DARK_MODE } = ActionTypes
const BLACKLIST = [FILE_SAVED, FILE_LOADED, SET_DARK_MODE]

let backupTimeout = null
let resetCount = 0
const MAX_RESETS = 200

const saver = (store) => (next) => (action) => {
  const result = next(action)

  if (BLACKLIST.includes(action.type)) return result
  const state = store.getState().present

  function forceBackup() {
    saveBackup(state.client.userId, state).catch((error) => {
      logger.error('Error saving backup: ', error)
    })
    resetCount = 0
    backupTimeout = null
  }

  if (state.project.selectedFile && state.project.fileLoaded) {
    if (backupTimeout) {
      clearTimeout(backupTimeout)
      ++resetCount
    }
    if (resetCount >= MAX_RESETS) {
      forceBackup()
    } else {
      backupTimeout = setTimeout(forceBackup, 60000)
    }
  }

  return result
}

export default saver
