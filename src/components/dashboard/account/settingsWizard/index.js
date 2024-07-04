import React from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'

import { selectors } from 'wired-up-pltr'

import OnboardingFlow from '../../../onboarding/OnboardingFlow'
import OnboardingProgress from '../../../onboarding/OnboardingProgress'
import AccountHeader from '../AccountHeader'
import ErrorBoundary from '../../../containers/ErrorBoundary'
import SettingsWizardStep1 from './SettingsWizardStep1'
import SettingsWizardStep2 from './SettingsWizardStep2'
import SettingsWizardStep3 from './SettingsWizardStep3'

const steps = 3

const SettingsWizard = ({ step, isInProMode }) => {
  const CurrentStep = () => {
    switch (step) {
      case 1:
        return <SettingsWizardStep1 />
      case 2:
        return <SettingsWizardStep2 />
      case 3:
        return <SettingsWizardStep3 />
      default:
        return <SettingsWizardStep1 />
    }
  }

  return (
    <div className="settings-wizard__wrapper">
      <div className="settings-wizard__header">
        <AccountHeader />
      </div>
      <div className="settings-wizard__body">
        <OnboardingFlow>
          <OnboardingProgress currentStep={step} totalSteps={isInProMode ? 1 : steps} />
          <ErrorBoundary>
            <CurrentStep />
          </ErrorBoundary>
        </OnboardingFlow>
      </div>
    </div>
  )
}

SettingsWizard.propTypes = {
  step: PropTypes.number,
  isInProMode: PropTypes.bool,
}

const mapStateToProps = (state) => {
  return {
    step: selectors.currentSettingsWizardStepSelector(state),
    isInProMode: selectors.isLoggedIntoProWithActiveLicenseSelector(state),
  }
}

export default connect(mapStateToProps)(SettingsWizard)
