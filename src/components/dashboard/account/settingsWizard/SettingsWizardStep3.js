import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'

import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'
import OnboardingButtonBar from '../../../onboarding/OnboardingButtonBar'
import OnboardingStep from '../../../onboarding/OnboardingStep'
import Button from '../../../Button'
import UnconnectedBackupSettings from '../../options/BackupSettings'

const SettingsWizardStep3Connector = (connector) => {
  const BackupSettings = UnconnectedBackupSettings(connector)

  const SettingsWizardStep3 = ({ nextStep, goBack }) => {
    return (
      <OnboardingStep>
        <StepHeader>
          <div style={{ textAlign: 'left', marginLeft: '8%' }}>
            <h3>{t('Backups')}</h3>
            <h6>{t('Choose how to backup your work')}</h6>
          </div>
        </StepHeader>
        <StepBody>
          <div className="onboarding__settings">
            <BackupSettings />
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

  SettingsWizardStep3.propTypes = {
    nextStep: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }

  const {
    pltr: { selectors, actions },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux

    return connect(
      (state) => ({
        settings: selectors.appSettingsSelector(state.present),
      }),
      {
        nextStep: actions.applicationState.advanceSettingsWizard,
        goBack: actions.applicationState.regressSettingsWizard,
      }
    )(SettingsWizardStep3)
  }

  throw new Error('Could not connect SettingsWizardStep3')
}

export default SettingsWizardStep3Connector
