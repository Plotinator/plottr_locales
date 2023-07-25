import {
  SET_USER_ID,
  SET_CLIENT_ID,
  SET_EMAIL_ADDRESS,
  SET_HAS_ONBOARDED,
  SET_HAS_PRO,
  SET_IS_ON_WEB,
  SET_CURRENT_APP_STATE,
  RECORD_DATA_CLIENT_ID,
} from '../constants/ActionTypes'

export const setUserId = (userId) => ({
  type: SET_USER_ID,
  userId,
})

export const setClientId = (clientId) => ({
  type: SET_CLIENT_ID,
  clientId,
})

export const setEmailAddress = (emailAddress) => ({
  type: SET_EMAIL_ADDRESS,
  emailAddress,
})

export const setHasOnboarded = (hasOnboarded) => ({
  type: SET_HAS_ONBOARDED,
  hasOnboarded,
})

export const setHasPro = (hasPro) => ({
  type: SET_HAS_PRO,
  hasPro,
})

export const setIsOnWeb = () => ({
  type: SET_IS_ON_WEB,
})

export function setCurrentAppStateToDashboard() {
  return { type: SET_CURRENT_APP_STATE, appState: 'dashboard' }
}

export function setCurrentAppStateToApplication() {
  return { type: SET_CURRENT_APP_STATE, appState: 'app' }
}

export function recordDataClientId(path, clientId) {
  return { type: RECORD_DATA_CLIENT_ID, path, clientId }
}
