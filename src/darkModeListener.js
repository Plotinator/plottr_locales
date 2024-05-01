import { onStoreChanges } from './app/store/onStoreChanges'

export const listenToDarkMode = (getStore, selectors) => {
  return onStoreChanges(getStore, [selectors.isDarkModeSelector], (darkMode) => {
    window.document.body.className = darkMode ? 'darkmode' : ''
  })
}
