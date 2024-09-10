import React, { useEffect, useState, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import cx from 'classnames'

import { selectors } from 'wired-up-pltr'

import AccountHome from '../account/AccountHome'
import FilesHome from '../files/FilesHome'
import TemplatesHome from '../templates/TemplatesHome'
import BackupsHome from '../backups/BackupsHome'
import OptionsHome from '../options/OptionsHome'
import HelpHome from '../help/HelpHome'
import DashboardErrorBoundary from '../../containers/DashboardErrorBoundary'
import UpdateNotifier from '../UpdateNotifier'
import ErrorBoundary from '../../containers/ErrorBoundary'
import { PlottrComponentsContext } from '../../../connections/pltrContext'

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
  const {
    platform: {
      settings: { saveAppSetting },
      reloadMenu,
      os,
    },
  } = useContext(PlottrComponentsContext)

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
        // @ts-ignore
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

const mapStateToProps = (state) => ({
  isInProMode: selectors.isLoggedIntoProWithActiveLicenseSelector(state),
  started: selectors.trialStartedSelector(state),
  expired: selectors.trialExpiredSelector(state),
  hasLicense: selectors.hasAnActiveLicenseSelector(state),
  trialMode: selectors.trialModeSelector(state),
  canGetUpdates: selectors.canGetUpdatesSelector(state),
  darkMode: selectors.isDarkModeSelector(state),
})

export default connect(mapStateToProps, {})(DashboardBody)
