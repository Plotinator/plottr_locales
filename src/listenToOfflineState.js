export const listenToOfflineState = (getStore, selectors, actions) => {
  getStore().dispatch(actions.project.setOffline(!window.navigator.onLine))
  const onlineListener = window.addEventListener('online', () => {
    getStore().dispatch(actions.project.setOffline(false))
  })
  const offlineListener = window.addEventListener('offline', () => {
    getStore().dispatch(actions.project.setOffline(true))
  })
  return () => {
    // @ts-ignore
    window.removeEventListener('online', onlineListener)
    // @ts-ignore
    window.removeEventListener('offline', offlineListener)
  }
}
