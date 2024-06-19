import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { actions, selectors } from 'wired-up-pltr'
import { AskToSaveModal } from 'plottr_components'

import MainIntegrationContext from '../../mainIntegrationContext'
import { useAskToSave } from './useAskToSave'

const PreventExitingWithoutSaving = ({
  unsavedChanges,
  isCloudFile,
  applicationIsBusyAndCannotBeQuit,
  isOffline,
  fileSaved,
  fileLoaded,
}) => {
  const { showAskToSave, dismissAskToSave, saveAndClose, waitingForSaveDoneSignal } = useAskToSave(
    unsavedChanges,
    isCloudFile,
    applicationIsBusyAndCannotBeQuit,
    isOffline,
    fileSaved,
    fileLoaded
  )

  if (!waitingForSaveDoneSignal && (!showAskToSave || isCloudFile)) return null

  return (
    <MainIntegrationContext.Consumer>
      {({ saveFile, saveOfflineFile }) => {
        return (
          <AskToSaveModal
            save={saveAndClose(saveFile, saveOfflineFile)}
            busy={waitingForSaveDoneSignal}
            dismiss={dismissAskToSave}
          />
        )
      }}
    </MainIntegrationContext.Consumer>
  )
}

PreventExitingWithoutSaving.propTypes = {
  unsavedChanges: PropTypes.bool,
  isCloudFile: PropTypes.bool,
  applicationIsBusyAndCannotBeQuit: PropTypes.bool,
  isOffline: PropTypes.bool,
  fileSaved: PropTypes.func.isRequired,
  fileLoaded: PropTypes.bool,
}

const mapStateToProps = (state) => {
  return {
    unsavedChanges: selectors.unsavedChangesSelector(state),
    isCloudFile: selectors.isCloudFileSelector(state),
    applicationIsBusyAndCannotBeQuit: selectors.busyWithWorkThatPreventsQuittingSelector(state),
    isOffline: selectors.isOfflineSelector(state),
    fileLoaded: selectors.fileURLLoadedSelector(state),
  }
}

export default connect(mapStateToProps, {
  fileSaved: actions.ui.fileSaved,
})(PreventExitingWithoutSaving)
