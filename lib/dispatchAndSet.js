export const dispatchAndSet = (key, value) => {
  const setItemEvent = new Event('set-local-storage-item')
  setItemEvent.key = key
  setItemEvent.value = value
  document.dispatchEvent(setItemEvent)
  window.localStorage._setItem(key, value)
}
