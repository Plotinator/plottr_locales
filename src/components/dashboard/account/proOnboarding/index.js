import React from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'

import { t } from 'plottr_locales'
import { selectors, actions } from 'wired-up-pltr'

import OnboardingFlow from '../../../onboarding/OnboardingFlow'
import OnboardingProgress from '../../../onboarding/OnboardingProgress'
import ProStep0 from './ProStep0'
import ProStep1 from './ProStep1'
import ProStep2 from './ProStep2'
import ProStep3 from './ProStep3'
import ErrorBoundary from '../../../containers/ErrorBoundary'

const steps = 3

const ProOnboarding = ({ cancel, step, advanceProOnboarding }) => {
  const CurrentStep = () => {
    switch (step) {
      case 1:
        return <ProStep1 nextStep={advanceProOnboarding} cancel={cancel} />
      case 2:
        return <ProStep2 nextStep={advanceProOnboarding} />
      case 3:
        return <ProStep3 finish={cancel} />
      default:
        return <ProStep0 nextStep={advanceProOnboarding} cancel={cancel} />
    }
  }

  return (
    <OnboardingFlow>
      <h1>{t('Welcome to Plottr')}</h1>
      <OnboardingProgress currentStep={step} totalSteps={steps} />
      <ErrorBoundary>
        <CurrentStep />
      </ErrorBoundary>
    </OnboardingFlow>
  )
}

ProOnboarding.propTypes = {
  cancel: PropTypes.func,
  step: PropTypes.number,
  advanceProOnboarding: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => {
  return {
    step: selectors.currentProOnboardingStepSelector(state),
  }
}

export default connect(mapStateToProps, {
  advanceProOnboarding: actions.applicationState.advanceProOnboarding,
})(ProOnboarding)
