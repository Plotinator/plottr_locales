import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from 'wired-up-pltr'
import { ProLicenseExpired, PlottrLicenseExpired } from 'plottr_components'

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
import PleaseConnectToTheInternet from './PleaseConnectToTheInternet'

const Main = ({
  showDashboard,
  loadingState,
  errorLoadingFile,
  loadingProgress,
  fileToUpload,
  darkMode,
  isOnboardingFromRoot,
  isOnboarding,
  isInSettingsWizard,
  firstTimeBooting,
  showChoiceView,
  showTrialExpired,
  showExpiredPlottrLicense,
  showExpiredProLicense,
  showConnectToTheInternet,
  showLoginSelector,
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
  if (isOnboardingFromRoot || isOnboarding) {
    return <ProOnboarding />
  } else if (showChoiceView) {
    return <Choice />
  } else if (showTrialExpired) {
    return <Expired />
  } else if (showConnectToTheInternet) {
    return <PleaseConnectToTheInternet />
  } else if (showExpiredPlottrLicense) {
    return <PlottrLicenseExpired />
  } else if (showExpiredProLicense) {
    return <ProLicenseExpired />
  } else if (showLoginSelector) {
    return <Login darkMode={darkMode} />
  } else if (fileToUpload) {
    return <UploadLastOpenedFileToPro />
  } else if (errorLoadingFile) {
    return <ErrorLoadingFile />
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
  } else if (isInSettingsWizard) {
    return <SettingsWizard />
  } else if (showDashboard) {
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
  showDashboard: PropTypes.bool,
  loadingState: PropTypes.string.isRequired,
  loadingProgress: PropTypes.number.isRequired,
  fileToUpload: PropTypes.string,
  errorLoadingFile: PropTypes.bool.isRequired,
  darkMode: PropTypes.bool.isRequired,
  isOnboardingFromRoot: PropTypes.bool,
  isOnboarding: PropTypes.bool,
  isInSettingsWizard: PropTypes.bool,
  firstTimeBooting: PropTypes.bool,
  showChoiceView: PropTypes.bool,
  showTrialExpired: PropTypes.bool,
  showExpiredPlottrLicense: PropTypes.bool,
  showExpiredProLicense: PropTypes.bool,
  showConnectToTheInternet: PropTypes.bool,
  showLoginSelector: PropTypes.bool,
}

const mapStateToProps = (state) => ({
  showConnectToTheInternet: selectors.displayConnectToTheInternetSelector(state),
  showExpiredProLicense: selectors.displayExpiredProLicenseSelector(state),
  showExpiredPlottrLicense: selectors.displayExpiredPlottrLicenseSelector(state),
  showChoiceView: selectors.displayChoiceViewSelector(state),
  showTrialExpired: selectors.displayTrialExpiredSelector(state),
  showLoginSelector: selectors.displayLoginSelector(state),
  showDashboard: selectors.displayDashboardSelector(state),
  loadingState: selectors.loadingStateSelector(state),
  errorLoadingFile: selectors.errorLoadingFileSelector(state),
  loadingProgress: selectors.loadingProgressSelector(state),
  darkMode: selectors.isDarkModeSelector(state),
  isOnboardingFromRoot: selectors.isOnboardingToProFromRootSelector(state),
  isOnboarding: selectors.isOnboardingToProSelector(state),
  fileToUpload: selectors.filePathToUploadSelector(state),
  isInSettingsWizard: selectors.isInSettingsWizardSelector(state),
  firstTimeBooting: selectors.firstTimeBootingSelector(state),
})

export default connect(mapStateToProps)(Main)
