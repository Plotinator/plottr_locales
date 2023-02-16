import React from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import OnboardingFlow from '../../../onboarding/OnboardingFlow'
import OnboardingProgress from '../../../onboarding/OnboardingProgress'
import AccountHeader from '../AccountHeader'
import UnconnectedSettingsWizardStep1 from './SettingsWizardStep1'
// import UnconnectedProStep2 from './ProStep2'
// import UnconnectedProStep3 from './ProStep3'

const steps = 3

const SettingsWizardConnector = (connector) => {
  const SettingsWizardStep1 = UnconnectedSettingsWizardStep1(connector)
  // const ProStep2 = UnconnectedProStep2(connector)
  // const ProStep3 = UnconnectedProStep3(connector)

  const SettingsWizard = ({ step, advanceSettingsWizard }) => {
    const CurrentStep = () => {
      switch (step) {
        case 1:
          return <SettingsWizardStep1 nextStep={advanceSettingsWizard} />
        case 2:
          return <SettingsWizardStep1 nextStep={advanceSettingsWizard} />
        case 3:
          return <SettingsWizardStep1 nextStep={advanceSettingsWizard} />
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
            <CurrentStep />
          </OnboardingFlow>
        </div>
      </div>
    )
  }

  SettingsWizard.propTypes = {
    step: PropTypes.number,
    advanceSettingsWizard: PropTypes.func.isRequired,
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
      }
    )(SettingsWizard)
  }

  throw new Error('Could not connect SettingsWizard')
}

export default SettingsWizardConnector
