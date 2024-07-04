import React from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'

import { actions } from 'wired-up-pltr'
import { t } from 'plottr_locales'

import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'
import OnboardingButtonBar from '../../../onboarding/OnboardingButtonBar'
import OnboardingStep from '../../../onboarding/OnboardingStep'
import Button from '../../../Button'
import FileSettings from '../../options/FileSettings'

const SettingsWizardStep2 = ({ nextStep, goBack }) => {
  return (
    <OnboardingStep>
      <StepHeader>
        <div className="onboarding__header">
          <h3>{t('Files')}</h3>
          <h6>{t('Choose how to save your files')}</h6>
        </div>
      </StepHeader>
      <StepBody>
        <div className="onboarding__settings">
          <FileSettings />
        </div>
      </StepBody>
      <StepFooter>
        <OnboardingButtonBar>
          <Button bsSize="large" onClick={goBack}>
            {t('Back')}
          </Button>
          <Button bsSize="large" bsStyle="success" onClick={nextStep}>
            {t('Next')}
          </Button>
        </OnboardingButtonBar>
      </StepFooter>
    </OnboardingStep>
  )
}

SettingsWizardStep2.propTypes = {
  nextStep: PropTypes.func,
  goBack: PropTypes.func,
}

export default connect((_state) => ({}), {
  nextStep: actions.applicationState.advanceSettingsWizard,
  goBack: actions.applicationState.regressSettingsWizard,
})(SettingsWizardStep2)
