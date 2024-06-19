import { useRef, useState, useEffect, useContext } from 'react'

import { t } from 'plottr_locales'
import { selectors } from 'wired-up-pltr'

import { store } from '../store'
import logger from '../../../shared/logger'
import { inflightFirebaseRequests } from '../store'
import { makeMainProcessClient } from '../mainProcessClient'
import MainIntegrationContext from '../../mainIntegrationContext'

const { onReload, showMessageBox, listenToForceReload } = makeMainProcessClient()

export const useAskToSave = (
  unsavedChanges,
  isCloudFile,
  applicationIsBusyAndCannotBeQuit,
  isOffline,
  fileSaved,
  fileLoaded
) => {
  const [showAskToSave, setShowAskToSave] = useState(false)
  const [waitingForSaveDoneSignal, setWaitingForSaveDoneSignal] = useState(false)
  const unsubscribeFromUnloadRef = useRef()

  const closeOrRefresh = (reloading) => {
    if (reloading) {
      window.location.reload()
    } else {
      window.close()
    }
  }

  const removeReloadListeners = () => {
    if (unsubscribeFromUnloadRef.current) {
      // @ts-ignore
      unsubscribeFromUnloadRef.current()
      // @ts-ignore
      unsubscribeFromUnloadRef.current = null
    }
  }

  const askToSave = (event, reloading = false) => {
    // There are outstanding firebase requests
    if (inflightFirebaseRequests().counter > 0) {
      logger.info("There are outstanding requests to Firebase so we're not quitting")
      event.preventDefault()
      event.returnValue = 'nope'
      showMessageBox(t('Plottr is Busy'), t("Plottr is busy and can't quit"))
    } else if (inflightFirebaseRequests().lastRequestFailed) {
      logger.info('The last request to Firebase failed.  Preventing Plottr from quitting.')
      event.preventDefault()
      event.returnValue = 'nope'
      showMessageBox(
        t('Network Problem'),
        t(
          "We can't reach our servers.  Please check your network connection, and don't close Plottr."
        )
      )
    } else if (fileLoaded && unsavedChanges && !isCloudFile) {
      // There are unsaved changes to a classic file
      logger.info("There are unsaved changes so we're not quitting")
      event.preventDefault()
      event.returnValue = 'nope'
      setShowAskToSave(true)
    } else if (applicationIsBusyAndCannotBeQuit) {
      // local server is busy
      logger.info('The local server is busy and we cannot quit')
      showMessageBox(t('Plottr is Busy'), t("Plottr is busy and can't quit"))
      if (event.preventDefault && typeof event.preventDefault === 'function') {
        event.preventDefault()
        event.returnValue = 'nope'
      }
    } else {
      removeReloadListeners()
      if (reloading) {
        closeOrRefresh(reloading)
      }
    }
  }

  useEffect(() => {
    const forceClose = () => {
      removeReloadListeners()
      window.close()
    }
    window.addEventListener('force-close', forceClose)
    return () => {
      window.removeEventListener('force-close', forceClose)
    }
  }, [])

  const { localClient } = useContext(MainIntegrationContext)

  useEffect(() => {
    const forceReload = () => {
      ;(() => {
        const present = selectors.fullFileStateSelector(store().getState())
        const fileLoaded = selectors.fileURLLoadedSelector(store().getState())
        const isCloudFile = selectors.isCloudFileSelector(store().getState())
        const fileURL = selectors.fileURLSelector(store().getState())
        if (!fileLoaded) {
          return Promise.resolve()
        } else {
          return isCloudFile && isOffline
            ? // TODO: use the components definitions for better types
              // @ts-ignore
              localClient.saveOfflineFile(fileURL, present)
            : // @ts-ignore
              localClient.saveFile(fileURL, present)
        }
      })()
        .then(() => {
          return new Promise((resolve) => {
            setTimeout(resolve, 1000)
          })
        })
        .then(() => {
          removeReloadListeners()
          window.location.reload()
        })
    }
    return listenToForceReload(forceReload)
  }, [localClient])

  useEffect(() => {
    const unsubscribeFromReload = onReload(() => {
      askToSave({}, true)
    })
    window.addEventListener('beforeunload', askToSave)
    const unsubscribeFromUnload = () => {
      window.removeEventListener('beforeunload', askToSave)
    }
    const unsubscribeAll = () => {
      unsubscribeFromReload()
      unsubscribeFromUnload()
    }

    // @ts-ignore
    unsubscribeFromUnloadRef.current = unsubscribeAll
    return unsubscribeAll
  }, [applicationIsBusyAndCannotBeQuit, fileLoaded, unsavedChanges, isCloudFile])

  useEffect(() => {
    if (!applicationIsBusyAndCannotBeQuit) {
      setWaitingForSaveDoneSignal(applicationIsBusyAndCannotBeQuit)
    }
  }, [applicationIsBusyAndCannotBeQuit, setWaitingForSaveDoneSignal])

  const saveAndClose = (saveFile, saveOfflineFile) => () => {
    const present = selectors.fullFileStateSelector(store().getState())
    const fileURL = selectors.fileURLSelector(store().getState())
    const knownFiles = selectors.knownFilesSelector(store().getState())
    setWaitingForSaveDoneSignal(true)
    return (
      isCloudFile && isOffline
        ? saveOfflineFile(present, knownFiles, fileURL)
        : saveFile(fileURL, present)
    )
      .then(() => {
        return new Promise((resolve) => {
          setTimeout(resolve, 1000)
        })
      })
      .then(() => {
        fileSaved()
        setWaitingForSaveDoneSignal(false)
        setShowAskToSave(false)
        removeReloadListeners()
        window.close()
      })
  }

  const dismissAskToSave = () => {
    setWaitingForSaveDoneSignal(false)
    setShowAskToSave(false)
  }

  return {
    showAskToSave,
    dismissAskToSave,
    saveAndClose,
    waitingForSaveDoneSignal,
  }
}
