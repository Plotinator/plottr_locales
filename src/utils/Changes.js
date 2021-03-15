import { t } from 'plottr_locales'
import { showAlert } from '../components/shared/common/AlertDialog'

let autoSaveCallback = null

export const setAutoSaveCallback = callback => {
  console.log('====> setting autosave', callback)
  autoSaveCallback = callback
}

export const clearAutoSaveCallback = () => {
  console.log('====> clearing autosave', autoSaveCallback)
  autoSaveCallback = null
}

export const triggerAutoSaveCallback = () => {
  console.log('====> autosaving', autoSaveCallback)
  if (autoSaveCallback) autoSaveCallback()
}

export const checkForChanges = (
  event,
  changes,
  saveChangesCallback,
  navigation
) => {
  // continue, no unsaved changes
  if (!changes) return

  // stop, alert user of unsaved changes
  event.preventDefault()
  showAlert({
    title: t('Save Changes?'),
    message: t('You have unsaved changes'),
    actions: [
      {
        positive: true,
        name: t('Yes, Save'),
        callback: () => {
          saveChangesCallback()
          navigation.dispatch(event.data.action)
        }
      },
      {
        name: t('No, Discard'),
        callback: () => navigation.dispatch(event.data.action)
      }
    ]
  })
}

export const addLeaveListener = (
  navigation,
  leaveCallback,
  _autoSaveCallback
) => {
  navigation.addListener('beforeRemove', leaveCallback)
  if (_autoSaveCallback) setAutoSaveCallback(_autoSaveCallback)
}

export const removeLeaveListener = (navigation, leaveCallback) => {
  navigation.removeListener('beforeRemove', leaveCallback)
  clearAutoSaveCallback()
}
