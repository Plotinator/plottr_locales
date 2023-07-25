import { v4 as uuidv4 } from 'uuid'

import {
  FILE_LOADED,
  FILE_SAVED,
  NEW_FILE,
  RESET,
  EDIT_FILENAME,
  LOAD_FILE,
  SET_OFFLINE,
  SET_RESUMING,
  RECORD_LAST_ACTION,
  CLICK_ON_DOM,
  SELECT_FILE,
} from '../constants/ActionTypes'
import { file as defaultFile } from '../store/initialState'
import { SYSTEM_REDUCER_ACTION_TYPES } from './systemReducers'
import LoadActions from '../constants/loadActions'

const ACTIONS_NOT_TO_UPDATE_ON = [
  CLICK_ON_DOM,
  RECORD_LAST_ACTION,
  FILE_LOADED,
  FILE_SAVED,
  ...SYSTEM_REDUCER_ACTION_TYPES,
]

const file =
  (dataRepairers) =>
  (stateWithoutVersionStamp = defaultFile, action) => {
    const shouldNotUpdateVersionStamp =
      action.type?.startsWith('@') ||
      ACTIONS_NOT_TO_UPDATE_ON.indexOf(action.type) !== -1 ||
      LoadActions.indexOf(action.type) !== -1 ||
      stateWithoutVersionStamp?.isResuming
    const state = stateWithoutVersionStamp && {
      ...stateWithoutVersionStamp,
      versionStamp: shouldNotUpdateVersionStamp ? stateWithoutVersionStamp.versionStamp : uuidv4(),
    }
    switch (action.type) {
      case FILE_LOADED:
        return {
          fileName: action.fileName,
          loaded: true,
          dirty: action.dirty,
          version: action.version,
          id: action.data.file.id || null,
          appliedMigrations: action.data.file.appliedMigrations || [],
          initialVersion: action.data.file.initialVersion || action.version,
          isCloudFile: action.data.file.isCloudFile || false,
        }

      case FILE_SAVED:
        return Object.assign({}, state, { dirty: false })

      case NEW_FILE:
        return { fileName: action.fileName, loaded: true, dirty: false, version: action.version }

      case EDIT_FILENAME:
        return Object.assign({}, state, { fileName: action.newName })

      case RESET:
        return Object.assign({}, action.data.file, { dirty: true })

      case LOAD_FILE:
        return action.file

      // We duplicate the resuming state from project here because
      // it's critical that we don't change timestamps while we resume
      // and it's possible for other actions to fire in between
      // setting offline and setting resume.
      case SET_OFFLINE:
        if (action.isOffline) {
          return {
            ...stateWithoutVersionStamp,
            originalVersionStamp: state.versionStamp,
          }
        } else {
          return state
        }

      default:
        return Object.assign({}, state, { dirty: true })
    }
  }

export default file
