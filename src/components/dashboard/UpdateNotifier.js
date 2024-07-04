import React, { useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import cx from 'classnames'

import { t } from 'plottr_locales'
import { selectors, actions } from 'wired-up-pltr'

import ProgressBar from '../ProgressBar'
import { Spinner } from '../Spinner'
import Button from '../Button'
import { PlottrComponentsContext } from '../../connections/pltrContext'

const updateCheckThreshold = 1000 * 60 * 60 // 60 minutes

const UpdateNotifier = ({
  darkMode,
  settings,
  inDashboard,
  shouldCheck,
  available,
  downloadInProgress,
  percentDownloaded,
  finishedDownloading,
  error,
  info,
  hidden,
  checking,
  dashboardModalView,
  autoCheckForUpdates,
  canReceiveUpdates,
  processResponseToRequestUpdate,
  dismissUpdateNotifier,
  setUpdateDownloadProgress,
}) => {
  const {
    platform: {
      update: {
        downloadUpdate,
        quitToInstall,
        checkForUpdates,
        onUpdateError,
        onUpdaterUpdateAvailable,
        onUpdaterUpdateNotAvailable,
        onUpdaterDownloadProgress,
        onUpdatorUpdateDownloaded,
        deregisterUpdateListeners,
      },
      openExternal,
      isMacOS,
      isWindows,
      log,
      isDevelopment,
    },
  } = useContext(PlottrComponentsContext)

  useEffect(() => {
    onUpdateError((error) => {
      log.warn(error.message)
      processResponseToRequestUpdate(false, error, null)
    })
    onUpdaterUpdateAvailable((info) => {
      processResponseToRequestUpdate(true, null, info)
    })
    onUpdaterUpdateNotAvailable(() => {
      processResponseToRequestUpdate(false, null, null)
    })
    onUpdaterDownloadProgress((progress) => {
      setUpdateDownloadProgress(Math.floor(progress.percent))
      if (settings.diagnoseUpdate) {
        log.info('download-progress', progress)
      }
    })
    onUpdatorUpdateDownloaded((_info) => {
      setUpdateDownloadProgress(100)
    })
    return () => {
      deregisterUpdateListeners()
    }
  }, [])

  useEffect(() => {
    if (isDevelopment) {
      return () => {}
    }

    if (canReceiveUpdates) {
      const interval = setInterval(_checkForUpdates, updateCheckThreshold)
      return () => {
        clearInterval(interval)
      }
    }

    return () => {}
  }, [shouldCheck, canReceiveUpdates])

  const _checkForUpdates = () => {
    if (canReceiveUpdates) {
      checkForUpdates()
      autoCheckForUpdates()
    }
  }

  const manualDownload = () => {
    const os = isMacOS() ? 'mac' : 'win'
    const url = `https://api.plottr.com/api/latest?platform=${os}`
    openExternal(url)
  }

  const startDownload = () => {
    downloadUpdate()
    setUpdateDownloadProgress(1)
  }

  const hide = () => {
    dismissUpdateNotifier()
  }

  const renderStatus = () => {
    const version = info && info.version ? info.version : ''
    let text = ['']
    if (checking) text = [t('Checking for updates')]
    if ((inDashboard || dashboardModalView) && !checking && !available)
      text = [t("You're on the latest version")]
    if (available) text = [t('Update Available 🎉 (version {version})', { version })]
    if (downloadInProgress) text = [t('Downloading version {version}', { version: version })]
    if (finishedDownloading) text = [t('Download Complete 🎉 (version {version})', { version })]
    if (error) {
      text = t.rich('Update failed. <b>Try again</b> or <a>install manually</a>', {
        // eslint-disable-next-line react/display-name, react/prop-types
        a: ({ children }) => (
          <a href="#" onClick={manualDownload} key="manual-download">
            {children}
          </a>
        ),
        // eslint-disable-next-line react/display-name, react/prop-types
        b: ({ children }) => (
          <a href="#" onClick={checkForUpdates} key="try-again">
            {children}
          </a>
        ),
      })
    }

    if (!text) return null
    return <span>{text}</span>
  }

  const renderAction = () => {
    if (!available && !finishedDownloading) return null
    if (downloadInProgress) return null
    return (
      <Button onClick={finishedDownloading ? quitToInstall : startDownload}>
        {finishedDownloading ? t('Click to Install') : t('Download Now!')}
      </Button>
    )
  }

  const renderProgress = () => {
    if (!downloadInProgress) return null

    if (isWindows()) {
      return <Spinner />
    }

    return (
      <ProgressBar
        bsStyle="success"
        now={percentDownloaded || 0}
        label={t('{val, number, percent}', { val: percentDownloaded / 100 })}
      />
    )
  }

  const text = renderStatus()
  if (!text) return null
  if (hidden) return null

  const floating = !inDashboard

  return (
    <div
      className={cx('update-notifier alert alert-info alert-dismissible', {
        floating,
        darkmode: darkMode,
      })}
      role="alert"
    >
      {text}
      {renderProgress()}
      <div className="update-notifier__buttons">
        {renderAction()}
        <button className="close" onClick={hide}>
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>
  )
}

UpdateNotifier.propTypes = {
  shouldCheck: PropTypes.bool,
  canReceiveUpdates: PropTypes.bool,
  available: PropTypes.bool,
  downloadInProgress: PropTypes.bool,
  percentDownloaded: PropTypes.number,
  finishedDownloading: PropTypes.bool,
  error: PropTypes.string,
  info: PropTypes.string,
  hidden: PropTypes.bool,
  checking: PropTypes.bool,
  darkMode: PropTypes.bool,
  settings: PropTypes.object.isRequired,
  inDashboard: PropTypes.bool,
  dashboardModalView: PropTypes.string,
  autoCheckForUpdates: PropTypes.func.isRequired,
  processResponseToRequestUpdate: PropTypes.func.isRequired,
  dismissUpdateNotifier: PropTypes.func.isRequired,
  setUpdateDownloadProgress: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  shouldCheck: selectors.shouldCheckForUpdatesSelector(state),
  canReceiveUpdates: selectors.canReceiveUpdatesSelector(state),
  available: selectors.updateAvailableSelector(state),
  downloadInProgress: selectors.downloadInProgressSelector(state),
  percentDownloaded: selectors.percentDownloadedSelector(state),
  finishedDownloading: selectors.finishedDownloadingSelector(state),
  error: selectors.updateErrorSelector(state),
  info: selectors.updateInfoSelector(state),
  hidden: selectors.updateNotificationHiddenSelector(state),
  checking: selectors.checkingForUpdatesSelector(state),
  darkMode: selectors.isDarkModeSelector(state),
  settings: selectors.appSettingsSelector(state),
  dashboardModalView: selectors.dashboardModalViewSelector(state),
})

export default connect(mapStateToProps, {
  autoCheckForUpdates: actions.applicationState.autoCheckForUpdates,
  processResponseToRequestUpdate: actions.applicationState.processResponseToRequestUpdate,
  dismissUpdateNotifier: actions.applicationState.dismissUpdateNotifier,
  setUpdateDownloadProgress: actions.applicationState.setUpdateDownloadProgress,
})(UpdateNotifier)
