import React from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'

import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'
import OnboardingButtonBar from '../../../onboarding/OnboardingButtonBar'
import OnboardingStep from '../../../onboarding/OnboardingStep'
import Button from '../../../Button'
import UnconnectedBackupSettings from '../../options/BackupSettings'

const SettingsWizardStep3Connector = (connector) => {
  const BackupSettings = UnconnectedBackupSettings(connector)

  const SettingsWizardStep3 = ({ goBack, finishSettingsWizard }) => {
    const handleFinish = () => {
      finishSettingsWizard()
    }

    return (
      <OnboardingStep>
        <StepHeader>
          <div className="onboarding__settings">
            <h3>{t('Backups')}</h3>
            <h6>{t('Choose how to backup your work')}</h6>
          </div>
        </StepHeader>
        <StepBody>
          <div className="onboarding__settings">
            <BackupSettings newDefault />
          </div>
        </StepBody>
        <StepFooter>
          <OnboardingButtonBar>
            <Button bsSize="large" onClick={goBack}>
              {t('Back')}
            </Button>
            <Button bsSize="large" bsStyle="success" onClick={handleFinish}>
              {t('Done')}
            </Button>
          </OnboardingButtonBar>
        </StepFooter>
      </OnboardingStep>
    )
  }

  SettingsWizardStep3.propTypes = {
    goBack: PropTypes.func.isRequired,
    finishSettingsWizard: PropTypes.func.isRequired,
  }

  const {
    pltr: { actions },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((_state) => ({}), {
      goBack: actions.applicationState.regressSettingsWizard,
      finishSettingsWizard: actions.applicationState.finishSettingsWizard,
    })(SettingsWizardStep3)
  }

  throw new Error('Could not connect SettingsWizardStep3')
}

export default SettingsWizardStep3Connector
