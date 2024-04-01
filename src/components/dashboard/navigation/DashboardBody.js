import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'

import UnconnectedAccountHome from '../account/AccountHome'
import UnconnectedFilesHome from '../files/FilesHome'
import UnconnectedTemplatesHome from '../templates/TemplatesHome'
import UnconnectedBackupsHome from '../backups/BackupsHome'
import UnconnectedOptionsHome from '../options/OptionsHome'
import UnconnectedHelpHome from '../help/HelpHome'
import UnconnectedDashboardErrorBoundary from '../../containers/DashboardErrorBoundary'
import { checkDependencies } from '../../checkDependencies'
import UnconnectedUpdateNotifier from '../UpdateNotifier'
import UnconnectedErrorBoundary from '../../containers/ErrorBoundary'

const DashboardBodyConnector = (connector) => {
  const {
    platform: {
      settings: { saveAppSetting },
      reloadMenu,
      os,
    },
  } = connector
  checkDependencies({
    saveAppSetting,
    reloadMenu,
  })

  const DashboardErrorBoundary = UnconnectedDashboardErrorBoundary(connector)
  const ErrorBoundary = UnconnectedErrorBoundary(connector)
  const AccountHome = UnconnectedAccountHome(connector)
  const FilesHome = UnconnectedFilesHome(connector)
  const TemplatesHome = UnconnectedTemplatesHome(connector)
  const BackupsHome = UnconnectedBackupsHome(connector)
  const OptionsHome = UnconnectedOptionsHome(connector)
  const HelpHome = UnconnectedHelpHome(connector)
  const UpdateNotifier = UnconnectedUpdateNotifier(connector)

  function Body({ children, isModal, darkMode }) {
    return (
      <div className={cx('dashboard__body', { darkmode: darkMode })}>
        {isModal ? null : (
          <ErrorBoundary>
            <UpdateNotifier inDashboard />
          </ErrorBoundary>
        )}
        <DashboardErrorBoundary>{children}</DashboardErrorBoundary>
      </div>
    )
  }

  Body.propTypes = {
    children: PropTypes.node,
    isModal: PropTypes.bool,
    darkMode: PropTypes.bool,
  }

  const DashboardBody = ({
    isModal,
    isInProMode,
    currentView,
    children,
    started,
    expired,
    hasLicense,
    trialMode,
    canGetUpdates,
    darkMode,
  }) => {
    const [showAccount, setShowAccount] = useState(false)

    useEffect(() => {
      // If any of the licensing state changed, we need to reload the
      // menu to show/hide options that are available.  Later, when we
      // change app settings, those changes take time, so we have to
      // reload again when we receive the signal that the write
      // completed.
      reloadMenu()

      if (isInProMode || os() == 'unknown') {
        setShowAccount(false)
        return
      }

      // update settings.trialMode
      if (hasLicense) {
        if (trialMode) {
          saveAppSetting('trialMode', false).then(reloadMenu)
        }
      } else {
        const firstAction = !trialMode ? saveAppSetting('trialMode', true) : Promise.resolve()
        firstAction
          .then(() => {
            if (!canGetUpdates) {
              return saveAppSetting('canGetUpdates', true)
            }
            return true
          })
          .then(reloadMenu)
      }

      // no license and trial hasn't started (first time using the app)
      // OR no license and trial is expired
      if (!hasLicense && (!started || expired) && process.env.NODE_ENV !== 'development') {
        setShowAccount(true)
      } else {
        setShowAccount(false)
      }
    }, [hasLicense, started, expired, isInProMode])

    // only allow these tabs in certain cases (see comment above)
    if (showAccount) {
      switch (currentView) {
        case 'help':
          return (
            <Body isModal={isModal} darkMode={darkMode}>
              <HelpHome />
            </Body>
          )
        default:
          return (
            <Body isModal={isModal} darkMode={darkMode}>
              <AccountHome />
            </Body>
          )
      }
    }

    const BodySwitch = ({ currentView }) => {
      switch (currentView) {
        case 'account':
          return <AccountHome />
        case 'templates':
          return <TemplatesHome />
        case 'backups':
          return <BackupsHome />
        case 'options':
          return <OptionsHome />
        case 'help':
          return <HelpHome />
        case 'files':
          return <FilesHome />
        default:
          return null
      }
    }

    return (
      <Body isModal={isModal} darkMode={darkMode}>
        {children}
        <BodySwitch currentView={currentView} />
      </Body>
    )
  }

  DashboardBody.propTypes = {
    currentView: PropTypes.string,
    children: PropTypes.node,
    isModal: PropTypes.bool,
    isInProMode: PropTypes.bool,
    started: PropTypes.bool,
    expired: PropTypes.bool,
    hasLicense: PropTypes.bool,
    trialMode: PropTypes.bool,
    canGetUpdates: PropTypes.bool,
    darkMode: PropTypes.bool,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux
    return connect(
      (state) => ({
        isInProMode: selectors.isLoggedIntoProWithActiveLicenseSelector(state),
        started: selectors.trialStartedSelector(state),
        expired: selectors.trialExpiredSelector(state),
        hasLicense: selectors.hasAnActiveLicenseSelector(state),
        trialMode: selectors.trialModeSelector(state),
        canGetUpdates: selectors.canGetUpdatesSelector(state),
        darkMode: selectors.isDarkModeSelector(state),
      }),
      {}
    )(DashboardBody)
  }

  throw new Error('Could not connect DashboardBody')
}

export default DashboardBodyConnector
