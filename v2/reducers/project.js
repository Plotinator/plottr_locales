import { SET_FILE_LIST, SELECT_FILE, SELECT_EMPTY_FILE } from '../constants/ActionTypes'

const INITIAL_STATE = {
  fileList: [],
  selectedFile: null,
  userNameSearchResults: [],
}

const NEW_FILE = { fileName: 'New file', none: true, id: -1 }

const projectReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_FILE_LIST:
      return {
        ...state,
        fileList: [NEW_FILE, ...action.fileList],
      }
    case SELECT_FILE:
      return {
        ...state,
        selectedFile: action.selectedFile,
      }
    case SELECT_EMPTY_FILE:
      return {
        ...state,
        selectedFile: NEW_FILE,
      }
    default:
      return state
  }
}

export default projectReducer
