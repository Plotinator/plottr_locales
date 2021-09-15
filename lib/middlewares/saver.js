import { saveBackup } from 'plottr_firebase'
import { ActionTypes } from 'pltr/v2'

const { FILE_SAVED, FILE_LOADED, SET_DARK_MODE } = ActionTypes
const BLACKLIST = [FILE_SAVED, FILE_LOADED, SET_DARK_MODE]

let backupTimeout = null

const saver = (store) => (next) => (action) => {
  const result = next(action)

  if (BLACKLIST.includes(action.type)) return result
  const state = store.getState().present

  if (state.project.selectedFile && state.project.fileLoaded) {
    if (backupTimeout) {
      clearTimeout(backupTimeout)
    }
    backupTimeout = setTimeout(() => {
      saveBackup(state.client.userId, state).catch((error) => {
        console.error('Error saving backup: ', error)
      })
    }, 1000)
  }

  return result
}

export default saver
