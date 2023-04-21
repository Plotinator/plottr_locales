import React from 'react'
import PropTypes from 'react-proptypes'
import OnboardingFlow from '../../../onboarding/OnboardingFlow'
import OnboardingProgress from '../../../onboarding/OnboardingProgress'
import AccountHeader from '../AccountHeader'
import UnconnectedErrorBoundary from '../../../containers/ErrorBoundary'
import UnconnectedSettingsWizardStep1 from './SettingsWizardStep1'
import UnconnectedSettingsWizardStep2 from './SettingsWizardStep2'
import UnconnectedSettingsWizardStep3 from './SettingsWizardStep3'

const steps = 3

const SettingsWizardConnector = (connector) => {
  const ErrorBoundary = UnconnectedErrorBoundary(connector)
  const SettingsWizardStep1 = UnconnectedSettingsWizardStep1(connector)
  const SettingsWizardStep2 = UnconnectedSettingsWizardStep2(connector)
  const SettingsWizardStep3 = UnconnectedSettingsWizardStep3(connector)

  const SettingsWizard = ({ step }) => {
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
            <OnboardingProgress currentStep={step} totalSteps={steps} />
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
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => {
      return {
        step: selectors.currentSettingsWizardStepSelector(state),
      }
    })(SettingsWizard)
  }

  throw new Error('Could not connect SettingsWizard')
}

export default SettingsWizardConnector
