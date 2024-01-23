import { isEqual } from 'lodash'

import { t } from 'plottr_locales'
import { removeSystemKeys, errorCodes } from 'pltr/v2'

const {
  FILE_LACKS_ALL_KEYS,
  FILE_HAS_DUPLICATED_CHARACTER_ATTIRBUTES,
  FILE_HAS_NO_CHARACTER_ATTRIBUTES,
  FILE_LACKS_CHARACTER_ATTRIBUTE_METADATA,
  FILE_CONTAINS_INVALID_CHARACTER_ATTRIBUTE_METADATA,
  FILE_CONTAINS_INVALID_CHARACTER_ATTRIBUTE_VALUES,
} = errorCodes

const ERROR_CODES_TO_OFFER_BAILOUT = [
  FILE_LACKS_ALL_KEYS,
  FILE_HAS_DUPLICATED_CHARACTER_ATTIRBUTES,
  FILE_HAS_NO_CHARACTER_ATTRIBUTES,
  FILE_LACKS_CHARACTER_ATTRIBUTE_METADATA,
  FILE_CONTAINS_INVALID_CHARACTER_ATTRIBUTE_METADATA,
  FILE_CONTAINS_INVALID_CHARACTER_ATTRIBUTE_VALUES,
]

const DEFAULT_SAVE_INTERVAL_MS = 10000
const DEFAULT_BACKUP_INTERVAL_MS = 60000
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
  showMessageBox,
  showErrorBox,
  serverIsBusyRestarting,
  isLoggedInThunk,
  offerSaveAsThenQuit
) => {
  const saveInterval = { current: null }
  const backupInterval = { current: null }
  const lastSaveFailed = { current: false }
  const lastBackupFailed = { current: false }
  const lastStateBackedUp = { current: {} }
  const lastStateSaved = { current: {} }

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
      }
    }, intervalMS)
  }

  const onSaveBackupError = (error) => {
    return serverIsBusyRestarting().then((restarting) => {
      if (restarting) {
        lastStateBackedUp.current = {}
        logger.info(
          "Failed to backup, but the server is restarting, so we're going to ignore this error"
        )
        return !restarting
      }
      const isLoggedIn = isLoggedInThunk()
      if (error === 'Missing or insufficient permissions.' && !isLoggedIn) {
        logger.info('Trying to backup a pro file while not logged in.', error)
      } else {
        logger.error('BACKUP failed', error)
      }
      return !restarting
    })
  }

  const onSaveBackupSuccess = () => {
    logger.info('[file save backup]', 'success')
  }

  const onAutoSaveError = (error) => {
    return serverIsBusyRestarting().then((restarting) => {
      if (restarting) {
        lastStateSaved.current = {}
        logger.info(
          "Failed to save, but the server is restarting, so we're going to ignore this error"
        )
        return !restarting
      }
      if (ERROR_CODES_TO_OFFER_BAILOUT.includes(error.code)) {
        offerSaveAsThenQuit()
      } else {
        logger.warn('Failed to autosave', error)
        showErrorBox(
          t('Auto-saving failed'),
          t("Saving your file didn't work. Check where it's stored.")
        )
      }
      return !restarting
    })
  }

  const onAutoSaveWorkedThisTime = () => {
    showMessageBox(t('Auto-saving worked'), t('Saving worked this time 🎉'))
  }

  const start = () => {
    logger.info('Starting auto-saver...')
    saveInterval.current = startJob(
      'Save',
      saveFile,
      saveIntervalMS,
      lastStateSaved,
      lastSaveFailed,
      onAutoSaveWorkedThisTime,
      onAutoSaveError
    )

    backupInterval.current = startJob(
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
    if (saveInterval.current) {
      logger.info('Stopping the auto-saver per request.')
      clearInterval(saveInterval.current)
      saveInterval.current = null
    }
    if (backupInterval.current) {
      logger.info('Stopping the auto-backup process per request.')
      clearInterval(backupInterval.current)
      backupInterval.current = null
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
