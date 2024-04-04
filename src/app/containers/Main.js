import React from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from 'wired-up-pltr'
import { ProLicenseExpired } from 'connected-components'

import MainIntegrationContext from '../../mainIntegrationContext'
import App from './App'
import Choice from './Choice'
import Login from './Login'
import Expired from './Expired'
import Dashboard from './Dashboard'
import ProOnboarding from './ProOnboarding'
import SettingsWizard from './SettingsWizard'
import UploadLastOpenedFileToPro from '../components/UploadLastOpenedFileToPro'
import ErrorLoadingFile from '../components/ErrorLoadingFile'

const Main = ({
  isFirstTime,
  needsToLogin,
  isInTrialModeWithExpiredTrial,
  showDashboard,
  cantShowFile,
  loadingState,
  errorLoadingFile,
  loadingProgress,
  fileToUpload,
  darkMode,
  currentAppStateIsDashboard,
  isOnboardingFromRoot,
  isOnboarding,
  saveBackup,
  isInSettingsWizard,
  isInSomeValidLicenseState,
  licenseExpired,
  needsToConnectToInternet,
  firstTimeBooting,
  dashboardClosed,
}) => {
  // IMPORTANT: the order of these return statements is significant.
  // We'll exit at the earliest one that evaluates true for it's
  // guarding if.
  //
  // This matters because the further we make it down the chain, the
  // more assumptions hold true about the app.  e.g. if we make it
  // past `firstTimeBooting` then we know that settings etc. are
  // loaded and we can check things like the user's local and pro
  // licenses.
  if (isOnboardingFromRoot || (cantShowFile && isOnboarding)) {
    return <ProOnboarding />
  } else if (needsToLogin || needsToConnectToInternet) {
    return <Login darkMode={darkMode} />
  } else if (fileToUpload) {
    return <UploadLastOpenedFileToPro saveBackup={saveBackup} />
  } else if (errorLoadingFile) {
    return <ErrorLoadingFile />
  } else if (licenseExpired) {
    return <ProLicenseExpired />
  } else if (isInTrialModeWithExpiredTrial) {
    return <Expired />
  } else if (firstTimeBooting) {
    return (
      <div id="temporary-inner">
        <div className="loading-splash">
          {darkMode ? (
            <img src="../icons/logo_dark_28_500.png" height="375" />
          ) : (
            <img src="../icons/logo_light_28_500.png" height="375" />
          )}
          <h3>{loadingState}</h3>
          <div className="loading-splash__progress">
            <div
              className="loading-splash__progress__bar"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      </div>
    )
  } else if (isFirstTime) {
    return <Choice />
  } else if (isInSettingsWizard) {
    return <SettingsWizard />
  } else if (!isInSomeValidLicenseState) {
    // The other way we can get to the Choice view is the license
    // dissapeared.
    return <Choice />
  } else if (cantShowFile || ((currentAppStateIsDashboard || showDashboard) && !dashboardClosed)) {
    return <Dashboard />
  } else {
    return (
      <MainIntegrationContext.Consumer>
        {({ showErrorBox }) => {
          return <App forceProjectDashboard={showDashboard} showErrorBox={showErrorBox} />
        }}
      </MainIntegrationContext.Consumer>
    )
  }
}

Main.propTypes = {
  forceProjectDashboard: PropTypes.bool,
  isFirstTime: PropTypes.bool,
  needsToLogin: PropTypes.bool,
  isInTrialModeWithExpiredTrial: PropTypes.bool,
  showDashboard: PropTypes.bool,
  cantShowFile: PropTypes.bool,
  loadingState: PropTypes.string.isRequired,
  loadingProgress: PropTypes.number.isRequired,
  fileToUpload: PropTypes.string,
  errorLoadingFile: PropTypes.bool.isRequired,
  darkMode: PropTypes.bool.isRequired,
  currentAppStateIsDashboard: PropTypes.bool.isRequired,
  isOnboardingFromRoot: PropTypes.bool,
  isOnboarding: PropTypes.bool,
  saveBackup: PropTypes.func.isRequired,
  isInSettingsWizard: PropTypes.bool,
  isInSomeValidLicenseState: PropTypes.bool,
  licenseExpired: PropTypes.bool,
  needsToConnectToInternet: PropTypes.bool,
  firstTimeBooting: PropTypes.bool,
  dashboardClosed: PropTypes.bool,
}

export default connect((state) => ({
  isFirstTime: selectors.isFirstTimeSelector(state),
  needsToLogin: selectors.userNeedsToLoginSelector(state),
  isInTrialModeWithExpiredTrial: selectors.isInTrialModeWithExpiredTrialSelector(state),
  showDashboard: selectors.showDashboardOnBootSelector(state),
  cantShowFile: selectors.cantShowFileSelector(state),
  loadingState: selectors.loadingStateSelector(state),
  errorLoadingFile: selectors.errorLoadingFileSelector(state) || false,
  loadingProgress: selectors.loadingProgressSelector(state),
  darkMode: selectors.isDarkModeSelector(state),
  currentAppStateIsDashboard: selectors.currentAppStateIsDashboardSelector(state),
  isOnboardingFromRoot: selectors.isOnboardingToProFromRootSelector(state),
  isOnboarding: selectors.isOnboardingToProSelector(state),
  fileToUpload: selectors.filePathToUploadSelector(state),
  isInSettingsWizard: selectors.isInSettingsWizardSelector(state),
  isInSomeValidLicenseState: selectors.isInSomeValidLicenseStateSelector(state),
  licenseExpired: selectors.licenseExpiredSelector(state),
  needsToConnectToInternet: selectors.needsToConnectToInternetSelector(state),
  firstTimeBooting: selectors.firstTimeBootingSelector(state),
  dashboardClosed: selectors.dashboardClosedSelector(state),
}))(Main)
