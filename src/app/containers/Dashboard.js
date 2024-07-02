import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import cx from 'classnames'

import { t } from 'plottr_locales'
import { helpers } from 'pltr'
import { selectors, actions } from 'wired-up-pltr'
import { DashboardBody, DashboardNav, FullPageSpinner as Spinner } from 'plottr_components'

import PreventExittingWithoutSaving from './PreventExittingWithoutSaving'
import OfflineBanner from '../components/OfflineBanner'
import { makeMainProcessClient } from '../mainProcessClient'

const { onReload } = makeMainProcessClient()

const { getVersion, showErrorBox } = makeMainProcessClient()

const Dashboard = ({
  darkMode,
  closeDashboard,
  setCurrentAppStateToApplication,
  busy,
  openTo,
  latestExpiryDate,
  inTrialMode,
}) => {
  const [activeView, setActiveView] = useState(openTo || 'files')

  useEffect(() => {
    getVersion().then((version) => {
      const dateBooted = helpers.date.versionToDate(version)
      if (dateBooted === null) {
        showErrorBox(t('Error'), t('There was a problem starting Plottr.  Please contact Support.'))
        // Never resolve, because we'd rather just quit.
        setTimeout(() => {
          window.close()
        }, 3000)
      } else {
        const versionGraceDate = helpers.date.subtractMonths(dateBooted, 3)
        if (!inTrialMode && latestExpiryDate !== null && latestExpiryDate < versionGraceDate) {
          showErrorBox(
            t('Error'),
            t('Your license expired before this version of Plottr was released')
          )
          // Never resolve, because we'd rather just quit.
          setTimeout(() => {
            window.close()
          }, 3000)
        }
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
      // @ts-ignore
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
  busy: PropTypes.bool,
  openTo: PropTypes.string,
  latestExpiryDate: PropTypes.object,
  inTrialMode: PropTypes.bool,
}

const mapStateToProps = (state) => ({
  darkMode: selectors.isDarkModeSelector(state),
  busy: selectors.manipulatingAFileSelector(state),
  latestExpiryDate: selectors.latestExpiryDateSelector(state),
  openTo: selectors.dashboardViewToOpenToSelector(state),
  inTrialMode: selectors.isInTrialModeSelector(state),
})

export default React.memo(
  connect(mapStateToProps, {
    closeDashboard: actions.applicationState.dashboardClosed,
    setCurrentAppStateToApplication: actions.client.setCurrentAppStateToApplication,
  })(Dashboard)
)
