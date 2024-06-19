export function focusIsEditable() {
  // @ts-ignore
  if (document.activeElement.tagName == 'INPUT') return true
  if (
    // @ts-ignore
    document.activeElement.dataset.slateEditor &&
    // @ts-ignore
    document.activeElement.dataset.slateEditor == 'true'
  )
    return true

  return false
}
