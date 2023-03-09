import React from 'react'

import { t } from 'plottr_locales'

import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'
import OnboardingButtonBar from '../../../onboarding/OnboardingButtonBar'
import OnboardingStep from '../../../onboarding/OnboardingStep'
import Button from '../../../Button'
import { checkDependencies } from '../../../checkDependencies'

const SettingsWizardStep4Connector = (connector) => {
  const {
    platform: {
      settings: { saveAppSetting },
    },
  } = connector
  checkDependencies({
    saveAppSetting,
  })

  const SettingsWizardStep4 = () => {
    const handleFinish = () => {
      saveAppSetting('finishedSettingsWizard', true)
    }

    return (
      <OnboardingStep>
        <StepHeader>
          <div style={{ textAlign: 'left', marginLeft: '8%' }}>
            <h3>{t('Auto-save')}</h3>
            <h6>{t('Plottr auto saves your project as you work!')}</h6>
            <h6>
              {t(
                "Please don't turn off your computer or close Plottr when you see this auto-save indicator:"
              )}
            </h6>
          </div>
        </StepHeader>
        <StepBody>
          <div className="onboarding__"></div>
        </StepBody>
        <StepFooter>
          <OnboardingButtonBar>
            <Button bsSize="large" bsStyle="success" onClick={handleFinish}>
              {t('Done')}
            </Button>
          </OnboardingButtonBar>
        </StepFooter>
      </OnboardingStep>
    )
  }

  SettingsWizardStep4.propTypes = {}

  const { redux } = connector

  if (redux) {
    const { connect } = redux

    return connect()(SettingsWizardStep4)
  }

  throw new Error('Could not connect SettingsWizardStep4')
}

export default SettingsWizardStep4Connector
