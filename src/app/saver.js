import { isEqual } from 'lodash'

import { t } from 'plottr_locales'
import { removeSystemKeys, errorCodes } from 'pltr'
import { selectors } from 'wired-up-pltr'

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
  /**
   * @type {{ current: SaverRef }}
   * @typedef SaverRef
   * @property {number | null} current
   */
  const saveInterval = { current: { current: null } }
  /**
   * @type {{ current: SaverRef }}
   * @typedef BackupRef
   * @property {number | null} current
   */
  const backupInterval = { current: { current: null } }
  const failedSaveCount = { current: 0 }
  const failedBackupCount = { current: 0 }
  const lastStateBackedUp = { current: {} }
  const lastStateSaved = { current: {} }

  // TODO: use setTimeout instead!
  /**
   * @param {String} name
   * @param {function(any): Promise<void>} f
   * @param {number} intervalMS
   * @param {{ current: any }} lastStateRef
   * @param {{ current: number }} failedCountRef
   * @param {function(): void} onSuccessThisTime
   * @param {function(Error): Promise<boolean>} onFailed
   * @returns {{ current: null | number }}
   */
  const startJob = (
    name,
    f,
    intervalMS,
    lastStateRef,
    failedCountRef,
    onSuccessThisTime,
    onFailed
  ) => {
    // @type {{ current: null | number }}
    const timeoutRef = {
      current: null,
    }

    function iter() {
      const newId = setTimeout(() => {
        const state = getState()
        const comparableState = selectors.fullFileStateSelector(state)
        if (!stateDidntChange(lastStateRef.current, comparableState)) {
          logger.info(`Starting ${name}...`)
          f(state)
            .then(() => {
              lastStateRef.current = comparableState
              if (failedCountRef.current > 0) {
                if (failedCountRef.current > 1) {
                  onSuccessThisTime()
                }
                failedCountRef.current = 0
              }
            })
            .catch((error) => {
              onFailed(error).then((shouldMarkAsFailed) => {
                if (shouldMarkAsFailed) {
                  failedCountRef.current++
                }
              })
            })
        }

        iter()
      }, intervalMS)
      // @ts-ignore
      timeoutRef.current = newId
      return timeoutRef
    }

    return iter()
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
      } else if (ERROR_CODES_TO_OFFER_BAILOUT.includes(error.code)) {
        offerSaveAsThenQuit()
        return !restarting
      } else if (failedSaveCount.current % 2 === 1) {
        // Only warn every other time.  Note the save fail hook is
        // called before incrementing the counter.
        logger.warn('Failed to autosave', error)
        showErrorBox(
          t('Auto-saving failed'),
          t("Saving your file didn't work. Check where it's stored.")
        )
        return !restarting
      } else {
        return !restarting
      }
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
      failedSaveCount,
      onAutoSaveWorkedThisTime,
      onAutoSaveError
    )

    backupInterval.current = startJob(
      'Backup',
      backupFile,
      backupIntervalMS,
      lastStateBackedUp,
      failedBackupCount,
      onSaveBackupSuccess,
      onSaveBackupError
    )
  }

  const stop = () => {
    if (saveInterval.current.current) {
      logger.info('Stopping the auto-saver per request.')
      clearInterval(saveInterval.current.current)
      saveInterval.current.current = null
    }
    if (backupInterval.current.current) {
      logger.info('Stopping the auto-backup process per request.')
      clearInterval(backupInterval.current.current)
      backupInterval.current.current = null
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
