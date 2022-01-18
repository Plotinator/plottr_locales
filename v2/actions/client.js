import {
  SET_USER_ID,
  SET_CLIENT_ID,
  SET_EMAIL_ADDRESS,
  SET_HAS_PRO,
  SET_IS_ON_WEB,
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

export const setHasPro = (hasPro) => ({
  type: SET_HAS_PRO,
  hasPro,
})

export const setIsOnWeb = () => ({
  type: SET_IS_ON_WEB,
})
