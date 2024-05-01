import React, { useState, useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import cx from 'classnames'

import { t } from 'plottr_locales'
import { helpers } from 'pltr'
import { selectors, actions } from 'wired-up-pltr'
import { DashboardBody, DashboardNav, FullPageSpinner as Spinner } from 'connected-components'

import PreventExittingWithoutSaving from './PreventExittingWithoutSaving'
import OfflineBanner from '../components/OfflineBanner'
import { makeMainProcessClient } from '../mainProcessClient'

const { onReload } = makeMainProcessClient()

const { getVersion, showErrorBox } = makeMainProcessClient()

const Dashboard = ({
  darkMode,
  closeDashboard,
  setCurrentAppStateToApplication,
  cantShowFile,
  busy,
  isOffline,
  openTo,
  latestExpiryDate,
  inTrialMode,
}) => {
  const [activeView, setActiveView] = useState(openTo || 'files')

  useEffect(() => {
    getVersion().then((version) => {
      const dateBooted = helpers.date.versionToDate(version)
      if (!inTrialMode && latestExpiryDate !== null && latestExpiryDate < dateBooted) {
        showErrorBox(
          t('Error'),
          t('Your license expired before this version of Plottr was released')
        )
        // Never resolve, because we'd rather just quit.
        setTimeout(() => {
          window.close()
        }, 3000)
      }
    })
  }, [])

  useEffect(() => {
    const closeListener = document.addEventListener('close-dashboard', () => {
      closeDashboard()
      setCurrentAppStateToApplication()
    })
    const unsubscribeFromReload = onReload(() => {
      window.location.reload()
    })

    return () => {
      document.removeEventListener('close-dashboard', closeListener)
      unsubscribeFromReload()
    }
  }, [])

  return (
    <div id="dashboard__react__root">
      <div className={cx('dashboard__main', { darkmode: darkMode })}>
        <PreventExittingWithoutSaving />
        <OfflineBanner />
        {busy ? <Spinner /> : null}
        <DashboardNav currentView={activeView} setView={setActiveView} />
        <DashboardBody currentView={activeView} setView={setActiveView} />
      </div>
    </div>
  )
}

Dashboard.propTypes = {
  darkMode: PropTypes.bool,
  closeDashboard: PropTypes.func.isRequired,
  setCurrentAppStateToApplication: PropTypes.func.isRequired,
  cantShowFile: PropTypes.bool,
  busy: PropTypes.bool,
  isOffline: PropTypes.bool,
  openTo: PropTypes.string,
  latestExpiryDate: PropTypes.object,
  inTrialMode: PropTypes.bool,
}

export default React.memo(
  connect(
    (state) => ({
      darkMode: selectors.isDarkModeSelector(state),
      busy: selectors.manipulatingAFileSelector(state),
      isOffline: selectors.isOfflineSelector(state),
      latestExpiryDate: selectors.latestExpiryDateSelector(state),
      openTo: selectors.dashboardViewToOpenToSelector(state),
      cantShowFile: selectors.cantShowFileSelector(state),
      inTrialMode: selectors.isInTrialModeSelector(state),
    }),
    {
      closeDashboard: actions.applicationState.dashboardClosed,
      setCurrentAppStateToApplication: actions.client.setCurrentAppStateToApplication,
    }
  )(Dashboard)
)
