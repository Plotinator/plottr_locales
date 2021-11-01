const SESSION_CLIENT_ID_KEY = 'SESSION_CLIENT_ID'

export const sessionClientId = () => {
  return window.sessionStorage.getItem(SESSION_CLIENT_ID_KEY)
}

export const setSessionClientId = (id) => {
  window.sessionStorage._setItem(SESSION_CLIENT_ID_KEY, id)
}
