export const listenToOfflineState = (getStore, selectors, actions) => {
  getStore().dispatch(actions.project.setOffline(!window.navigator.onLine))
  const onlineListener = window.addEventListener('online', () => {
    getStore().dispatch(actions.project.setOffline(false))
  })
  const offlineListener = window.addEventListener('offline', () => {
    getStore().dispatch(actions.project.setOffline(true))
  })
  return () => {
    window.removeEventListener('online', onlineListener)
    window.removeEventListener('offline', offlineListener)
  }
}
