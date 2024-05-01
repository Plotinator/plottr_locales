import React from 'react'
import PropTypes from 'prop-types'

import { IoIosAlert } from '@react-icons/all-files/io/IoIosAlert'
import { connect } from 'react-redux'

import { helpers } from 'pltr'
import { actions, selectors } from 'wired-up-pltr'
import { t } from 'plottr_locales'
import { Button } from 'plottr_components'

import { makeMainProcessClient } from '../mainProcessClient'

const { openExternal, showItemInFolder } = makeMainProcessClient()

const ErrorLoadingFile = ({
  isInProMode,
  errorIsUpdateError,
  setFirstTimeBooting,
  setOpenDashboardTo,
  pathToProject,
  setCurrentAppStateToDashboard,
  clearErrorLoadingFile,
}) => {
  const goToSupport = () => {
    openExternal('https://plottr.com/support/')
  }

  const goToDownloads = () => {
    openExternal('https://my.plottr.com/file-downloads/')
  }

  const viewBackups = () => {
    setFirstTimeBooting(false)
    setOpenDashboardTo('backups')
    setCurrentAppStateToDashboard()
    clearErrorLoadingFile()
  }

  const showFile = () => {
    showItemInFolder(helpers.file.withoutProtocol(pathToProject))
  }

  let errorMessage = isInProMode
    ? t(
        'Plottr ran into an issue opening your project. Please check your backups or contact support about this project and we will get it running for you quickly.'
      )
    : t(
        'Plottr ran into an issue opening your project. Please check your backups or contact support with this file and we will get it running for you quickly.'
      )

  errorMessage = errorIsUpdateError
    ? t(
        'It looks like your version of Plottr is older than this project. Please update Plottr to avoid any issues'
      )
    : errorMessage

  errorMessage = typeof errorMessage === 'string' ? errorMessage : `${errorMessage}`

  const body = (
    <>
      <div className="error-boundary">
        <div className="text-center">
          <IoIosAlert />
          <h1>
            {errorIsUpdateError ? t('You need to update Plottr') : t('Something went wrong,')}
          </h1>
          <h2>
            {errorIsUpdateError
              ? t("but don't panic, you haven't lost anything")
              : t("but don't worry!")}
          </h2>
        </div>
        <div className="error-boundary__view-error well text-center">
          <h5 className="error-boundary-title" style={{ lineHeight: 1.75 }}>
            {errorMessage}
          </h5>
        </div>
        {errorIsUpdateError ? (
          <div className="error-boundary__options" style={{ width: '50%' }}>
            <Button bsSize="lg" onClick={goToDownloads}>
              {t('Download Plottr')}
            </Button>
          </div>
        ) : (
          <div className="error-boundary__options" style={{ width: '50%' }}>
            <Button bsSize="lg" onClick={goToSupport}>
              {t('Contact Support')}
            </Button>
            {isInProMode ? null : (
              <Button bsSize="lg" onClick={showFile}>
                {t('Show File')}
              </Button>
            )}
            <Button bsSize="lg" onClick={viewBackups}>
              {t('View Backups')}
            </Button>
          </div>
        )}
      </div>
    </>
  )

  return (
    <div id="temporary-inner">
      <div className="loading-splash">{body}</div>
    </div>
  )
}

ErrorLoadingFile.propTypes = {
  isInProMode: PropTypes.bool,
  errorIsUpdateError: PropTypes.bool,
  setFirstTimeBooting: PropTypes.func.isRequired,
  setOpenDashboardTo: PropTypes.func.isRequired,
  setCurrentAppStateToDashboard: PropTypes.func.isRequired,
  pathToProject: PropTypes.string.isRequired,
  clearErrorLoadingFile: PropTypes.func.isRequired,
}

export default connect(
  (state) => {
    return {
      isInProMode: selectors.isLoggedIntoProWithActiveLicenseSelector(state),
      errorIsUpdateError: selectors.errorIsUpdateErrorSelector(state) || false,
      pathToProject: selectors.filePathToProjectDuringBootSelector(state),
    }
  },
  {
    setCurrentAppStateToDashboard: actions.client.setCurrentAppStateToDashboard,
    clearErrorLoadingFile: actions.applicationState.clearErrorLoadingFile,
    setOpenDashboardTo: actions.applicationState.setOpenDashboardTo,
  }
)(ErrorLoadingFile)
