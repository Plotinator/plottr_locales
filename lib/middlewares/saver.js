import { saveBackup } from '../firebase'
import { ActionTypes } from 'pltr/v2'

const { FILE_SAVED, FILE_LOADED, SET_DARK_MODE } = ActionTypes
const BLACKLIST = [FILE_SAVED, FILE_LOADED, SET_DARK_MODE]

const saver = (store) => (next) => (action) => {
  const result = next(action)

  if (BLACKLIST.includes(action.type)) return result
  const state = store.getState().present

  if (state.project.selectedFile && state.project.fileLoaded) {
    saveBackup(state.client.userId, state).catch((error) => {
      console.error('Error saving backup: ', error)
    })
  }

  return result
}

export default saver
