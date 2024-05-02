import React from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'

import OnboardingStep from '../../../onboarding/OnboardingStep'
import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'
import OnboardingButtonBar from '../../../onboarding/OnboardingButtonBar'
import Button from '../../../Button'
import Switch from '../../../Switch'

const ProStep3Connector = (connector) => {
  const {
    platform: {
      settings: { saveAppSetting },
    },
  } = connector

  const ProStep3 = ({ finish, settings, startSettingsWizard }) => {
    const handleFinishOnboarding = () => {
      saveAppSetting('isOnboardingDone', true)
      finish()
      startSettingsWizard()
    }

    return (
      <OnboardingStep>
        <StepHeader>
          <h2>{t('Last step')}</h2>
          <p>{t('You can always change these later')}</p>
        </StepHeader>
        <StepBody>
          <div className="onboarding__settings">
            <div className="dashboard__options__item">
              <h4>{t('Save Backups')}</h4>
              <Switch
                isOn={!!settings.backup}
                handleToggle={() => saveAppSetting('backup', !settings.backup)}
                labelText={t('Automatically save daily backups')}
              />
            </div>
            <div className="dashboard__options__item">
              <h4>{t('Save backups on this device')}</h4>
              <Switch
                isOn={!!settings.user.localBackups}
                handleToggle={() =>
                  saveAppSetting('user.localBackups', !settings.user.localBackups)
                }
                labelText={t('Save backups to this device as well as in the cloud')}
              />
            </div>
          </div>
        </StepBody>
        <StepFooter>
          <OnboardingButtonBar>
            <Button bsSize="large" bsStyle="success" onClick={handleFinishOnboarding}>
              {t("I'm Done!")}
            </Button>
          </OnboardingButtonBar>
          <p style={{ marginTop: '8px' }}>{t('See? That was painless 😁')}</p>
        </StepFooter>
      </OnboardingStep>
    )
  }

  ProStep3.propTypes = {
    finish: PropTypes.func,
    settings: PropTypes.object.isRequired,
    startSettingsWizard: PropTypes.func.isRequired,
  }

  const {
    pltr: { selectors, actions },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux

    return connect(
      (state) => {
        return {
          settings: selectors.appSettingsSelector(state),
        }
      },
      {
        startSettingsWizard: actions.applicationState.startSettingsWizard,
      }
    )(ProStep3)
  }

  throw new Error('Could not connect ProStep3.')
}

export default ProStep3Connector
