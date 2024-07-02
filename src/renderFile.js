import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import { selectors, actions } from 'wired-up-pltr'
import { saveBackup as saveBackupOnFirebase } from 'wired-up-firebase'
import { plottrComponentsContextObject } from 'connected-components'
import { connections } from 'plottr_components'

import Main from './app/containers/Main'
import Listener from './app/components/listener'
import Renamer from './app/components/Renamer'
import SaveAs from './app/components/SaveAs'
import Error from './app/components/Error'
import Resume from './app/components/Resume'
import Busy from './app/components/Busy'
import MainIntegrationContext from './mainIntegrationContext'

import { store } from './app/store'
import makeFileSystemAPIs from './api/file-system-apis'
import { makeMainProcessClient } from './app/mainProcessClient'
import { listenToOfflineState } from './listenToOfflineState'
import { keepGlobalFontVariablesUpToDate } from './keepGlobalFontVariablesUpToDate'
import { startupStateMachine } from './startupStateMachine'
import { listenToDarkMode } from './darkModeListener'

const { PlottrComponentsContext } = connections

export const renderFile = (root, localClient) => {
  listenToOfflineState(store, selectors, actions)
  keepGlobalFontVariablesUpToDate(store, selectors)
  startupStateMachine(localClient, store, selectors, actions, saveBackupOnFirebase)
  listenToDarkMode(store, selectors)

  const saveOfflineFile = (file, knownFiles, onlineFileURL, isOffline) => {
    return localClient.saveOfflineFile(file, knownFiles, onlineFileURL, isOffline)
  }

  const saveFile = (fileURL, file) => {
    return localClient.saveFile(fileURL, file)
  }

  const basename = (filePath) => {
    return localClient.basename(filePath)
  }

  const readFile = (filePath) => {
    return localClient.readFile(filePath)
  }

  const saveBackup = (filePath, file) => {
    const state = store().getState()
    const onCloud = selectors.isCloudFileSelector(state)
    const isInProMode = selectors.isLoggedIntoProWithActiveLicenseSelector(state)
    const userId = selectors.userIdSelector(state)
    const localBackupsEnabled = selectors.localBackupsEnabledSelector(state)

    const result =
      isInProMode && onCloud ? saveBackupOnFirebase(userId, file) : Promise.resolve(true)

    return result.then(() => {
      if (!onCloud || (onCloud && localBackupsEnabled)) {
        return localClient.saveBackup(filePath, file)
      }
      return Promise.resolve(false)
    })
  }

  const backupOfflineBackupForResume = (file) => {
    return localClient.backupOfflineBackupForResume(file)
  }

  const { showErrorBox, getVersion } = makeMainProcessClient()

  const { saveAppSetting } = makeFileSystemAPIs(localClient)

  render(
    <Provider store={store()}>
      <PlottrComponentsContext.Provider value={plottrComponentsContextObject(localClient)}>
        <MainIntegrationContext.Provider
          value={{
            saveOfflineFile,
            saveFile,
            basename,
            readFile,
            saveBackup,
            backupOfflineBackupForResume,
            saveAppSetting,
            showErrorBox,
            localClient,
          }}
        >
          <Listener showErrorBox={showErrorBox} localClient={localClient} />
          <Renamer />
          <SaveAs />
          <Error showErrorBox={showErrorBox} />
          <Resume
            localClient={localClient}
            backupOfflineBackupForResume={backupOfflineBackupForResume}
            getVersion={getVersion}
            showErrorBox={showErrorBox}
          />
          <Busy />
          <Main />
        </MainIntegrationContext.Provider>
      </PlottrComponentsContext.Provider>
    </Provider>,
    root
  )
}
