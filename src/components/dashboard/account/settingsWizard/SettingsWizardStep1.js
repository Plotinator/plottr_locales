import React from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'

import OnboardingStep from '../../../onboarding/OnboardingStep'
import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'
import OnboardingButtonBar from '../../../onboarding/OnboardingButtonBar'
import Button from '../../../Button'
import Switch from '../../../Switch'

const SettingsWizardStep1Connector = (connector) => {
  const {
    platform: {
      settings: { saveAppSetting },
    },
  } = connector

  const SettingsWizardStep1 = ({ nextStep, settings }) => {
    const handleNextStep = () => {
      // saveAppSetting('isOnboardingDone', true)
      return nextStep()
    }

    return (
      <OnboardingStep>
        <StepHeader>
          <div style={{ textAlign: 'left', marginLeft: '8%' }}>
            <h3>{t('Files')}</h3>
            <h6>{t('Choose how to save your files')}</h6>
          </div>
        </StepHeader>
        <StepBody>
          <div className="onboarding__settings">
            <div className="dashboard__options__item">
              <h4>{t('Default Folder')}</h4>
              <Switch
                isOn={!!settings.backup}
                handleToggle={() => saveAppSetting('backup', !settings.backup)}
                labelText={t('All your files will be automatically saved to the folder you choose')}
              />
            </div>
            <div className="dashboard__options__item">
              <h4>{t('Default Folder Location')}</h4>
              <Switch
                isOn={!!settings.user.localBackups}
                handleToggle={() =>
                  saveAppSetting('user.localBackups', !settings.user.localBackups)
                }
                labelText={t('The folder where all your files will be automatically saved')}
              />
            </div>
          </div>
        </StepBody>
        <StepFooter>
          <OnboardingButtonBar>
            <Button bsSize="large" bsStyle="success" onClick={handleNextStep}>
              {t('Next')}
            </Button>
          </OnboardingButtonBar>
        </StepFooter>
      </OnboardingStep>
    )
  }

  SettingsWizardStep1.propTypes = {
    nextStep: PropTypes.func,
    settings: PropTypes.object.isRequired,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      settings: selectors.appSettingsSelector(state.present),
    }))(SettingsWizardStep1)
  }

  throw new Error('Could not connect SettingsWizardStep1')
}

export default SettingsWizardStep1Connector
