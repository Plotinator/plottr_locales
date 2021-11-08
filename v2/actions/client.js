import {
  SET_USER_ID,
  SET_CLIENT_ID,
  SET_EMAIL_ADDRESS,
  SET_HAS_ONBOARDED,
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
