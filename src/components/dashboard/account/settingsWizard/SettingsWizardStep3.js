import React, { useCallback } from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'

import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'
import OnboardingButtonBar from '../../../onboarding/OnboardingButtonBar'
import OnboardingStep from '../../../onboarding/OnboardingStep'
import Button from '../../../Button'
import UnconnectedBackupSettings from '../../options/BackupSettings'
import { checkDependencies } from '../../../checkDependencies'

const SettingsWizardStep3Connector = (connector) => {
  const BackupSettings = UnconnectedBackupSettings(connector)

  const SettingsWizardStep3 = ({ goBack, finishSettingsWizard, stagedLanguage }) => {
    const {
      platform: {
        settings: { saveAppSetting },
        updateLanguage,
      },
    } = connector
    checkDependencies({
      updateLanguage,
      saveAppSetting,
    })

    const setLanguage = useCallback(
      (newLanguage) => {
        saveAppSetting('locale', newLanguage)
        updateLanguage(newLanguage)
      },
      [saveAppSetting, updateLanguage]
    )

    const handleFinish = () => {
      finishSettingsWizard()
      if (typeof stagedLanguage === 'string') {
        setLanguage(stagedLanguage)
      }
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
    stagedLanguage: PropTypes.string,
  }

  const {
    pltr: { actions, selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux

    return connect(
      (state) => ({
        stagedLanguage: selectors.stagedLanguageSelector(state),
      }),
      {
        goBack: actions.applicationState.regressSettingsWizard,
        finishSettingsWizard: actions.applicationState.finishSettingsWizard,
      }
    )(SettingsWizardStep3)
  }

  throw new Error('Could not connect SettingsWizardStep3')
}

export default SettingsWizardStep3Connector
