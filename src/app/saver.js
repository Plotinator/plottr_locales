import { isEqual } from 'lodash'

import { t } from 'plottr_locales'
import { removeSystemKeys } from 'pltr/v2'

const DEFAULT_SAVE_INTERVAL_MS = 10000
const DEFAULT_BACKUP_INTERVAL_MS = 60000
export const DUMMY_ROLLBAR = {
  info: () => {},
  warn: () => {},
  error: () => {},
}
export const DUMMY_SHOW_MESSAGE_BOX = () => {}
export const DUMMY_SHOW_ERROR_BOX = () => {}
export const DUMMY_SERVER_IS_BUSY_RESTARTING = () => Promise.resolve(false)

const stateDidntChange = (oldState, newState) => {
  const currentWithoutSystemKeys = removeSystemKeys(newState)
  return Object.keys(currentWithoutSystemKeys).every((key) => {
    if (key === 'file') {
      return isEqual(currentWithoutSystemKeys[key], oldState[key])
    }

    return currentWithoutSystemKeys[key] === oldState[key]
  })
}

const Saver = (
  getState,
  saveFile,
  backupFile,
  saveIntervalMS,
  backupIntervalMS,
  logger,
  rollbar,
  showMessageBox,
  showErrorBox,
  serverIsBusyRestarting
) => {
  let saveInterval = null
  let backupInterval = null
  let lastSaveFailed = { current: false }
  let lastBackupFailed = { current: false }
  let lastStateBackedUp = { current: {} }
  let lastStateSaved = { current: {} }

  const startJob = (
    name,
    f,
    intervalMS,
    lastStateRef,
    lastFailedRef,
    onSuccessThisTime,
    onFailed
  ) => {
    return setInterval(() => {
      const state = getState()
      if (!stateDidntChange(lastStateRef.current, state)) {
        logger.info(`Starting ${name}...`)
        f(state)
          .then(() => {
            lastStateRef.current = state
            if (lastFailedRef.current) {
              lastFailedRef.current = false
              onSuccessThisTime()
            }
          })
          .catch((error) => {
            onFailed(error).then((shouldMarkAsFailed) => {
              lastFailedRef.current = shouldMarkAsFailed
            })
          })
      } else {
        logger.info(`State didn't change.  Not going ahead with ${name}.`)
      }
    }, intervalMS)
  }

  const onSaveBackupError = (error) => {
    return serverIsBusyRestarting().then((restarting) => {
      if (restarting) {
        lastStateBackedUp = {}
        logger.info(
          "Failed to backup, but the server is restarting, so we're going to ignore this error"
        )
        return !restarting
      }
      logger.error('BACKUP failed', error)
      rollbar.warn(error.message)
      return !restarting
    })
  }

  const onSaveBackupSuccess = () => {
    logger.info('[file save backup]', 'success')
  }

  const onAutoSaveError = (error) => {
    return serverIsBusyRestarting().then((restarting) => {
      if (restarting) {
        lastStateSaved = {}
        logger.info(
          "Failed to save, but the server is restarting, so we're going to ignore this error"
        )
        return !restarting
      }
      logger.warn('Failed to autosave', error)
      rollbar.warn(error.message)
      showErrorBox(
        t('Auto-saving failed'),
        t("Saving your file didn't work. Check where it's stored.")
      )
      return !restarting
    })
  }

  const onAutoSaveWorkedThisTime = () => {
    showMessageBox(t('Auto-saving worked'), t('Saving worked this time 🎉'))
  }

  const start = () => {
    logger.info('Starting auto-saver...')
    saveInterval = startJob(
      'Save',
      saveFile,
      saveIntervalMS,
      lastStateSaved,
      lastSaveFailed,
      onAutoSaveWorkedThisTime,
      onAutoSaveError
    )

    backupInterval = startJob(
      'Backup',
      backupFile,
      backupIntervalMS,
      lastStateBackedUp,
      lastBackupFailed,
      onSaveBackupSuccess,
      onSaveBackupError
    )
  }

  const stop = () => {
    if (saveInterval) {
      logger.info('Stopping the auto-saver per request.')
      clearInterval(saveInterval)
      saveInterval = null
    }
    if (backupInterval) {
      logger.info('Stopping the auto-backup process per request.')
      clearInterval(backupInterval)
      backupInterval = null
    }
  }

  start()

  return {
    start,
    stop,
    // Deprecated!
    cancelAllRemainingRequests: stop,
  }
}

export default Saver
