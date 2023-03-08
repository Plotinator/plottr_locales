import React from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import OnboardingFlow from '../../../onboarding/OnboardingFlow'
import OnboardingProgress from '../../../onboarding/OnboardingProgress'
import AccountHeader from '../AccountHeader'
import UnconnectedSettingsWizardStep1 from './SettingsWizardStep1'
import UnconnectedSettingsWizardStep2 from './SettingsWizardStep2'
import UnconnectedSettingsWizardStep3 from './SettingsWizardStep3'
import UnconnectedErrorBoundary from '../../../containers/ErrorBoundary'

const steps = 4

const SettingsWizardConnector = (connector) => {
  const ErrorBoundary = UnconnectedErrorBoundary(connector)
  const SettingsWizardStep1 = UnconnectedSettingsWizardStep1(connector)
  const SettingsWizardStep2 = UnconnectedSettingsWizardStep2(connector)
  const SettingsWizardStep3 = UnconnectedSettingsWizardStep3(connector)

  const SettingsWizard = ({ step, advanceSettingsWizard, regressSettingsWizard }) => {
    const CurrentStep = () => {
      switch (step) {
        case 1:
          return <SettingsWizardStep1 nextStep={advanceSettingsWizard} />
        case 2:
          return (
            <SettingsWizardStep2 nextStep={advanceSettingsWizard} goBack={regressSettingsWizard} />
          )
        case 3:
          return (
            <SettingsWizardStep3 nextStep={advanceSettingsWizard} goBack={regressSettingsWizard} />
          )
        case 4:
          return (
            <SettingsWizardStep1 nextStep={advanceSettingsWizard} goBack={regressSettingsWizard} />
          )
        default:
          return <SettingsWizardStep1 nextStep={advanceSettingsWizard} />
      }
    }

    return (
      <div className="settings-wizard__wrapper">
        <div className="settings-wizard__header">
          <AccountHeader />
          <h1>{t('Onboarding')}</h1>
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
    advanceSettingsWizard: PropTypes.func.isRequired,
    regressSettingsWizard: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect(
      (state) => {
        return {
          step: selectors.currentSettingsWizardStepSelector(state.present),
        }
      },
      {
        advanceSettingsWizard: actions.applicationState.advanceSettingsWizard,
        regressSettingsWizard: actions.applicationState.regressSettingsWizard,
      }
    )(SettingsWizard)
  }

  throw new Error('Could not connect SettingsWizard')
}

export default SettingsWizardConnector
