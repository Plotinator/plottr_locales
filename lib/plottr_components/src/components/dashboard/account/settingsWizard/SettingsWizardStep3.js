import React, { useCallback, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'

import { selectors, actions } from 'wired-up-pltr'
import { t } from 'plottr_locales'

import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'
import OnboardingButtonBar from '../../../onboarding/OnboardingButtonBar'
import OnboardingStep from '../../../onboarding/OnboardingStep'
import Button from '../../../Button'
import BackupSettings from '../../options/BackupSettings'
import { PlottrComponentsContext } from '../../../../connections/pltrContext'

const SettingsWizardStep3 = ({ goBack, finishSettingsWizard, stagedLanguage }) => {
  const {
    platform: {
      settings: { saveAppSetting },
      updateLanguage,
    },
  } = useContext(PlottrComponentsContext)

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

const mapStateToProps = (state) => ({
  stagedLanguage: selectors.stagedLanguageSelector(state),
})

export default connect(mapStateToProps, {
  goBack: actions.applicationState.regressSettingsWizard,
  finishSettingsWizard: actions.applicationState.finishSettingsWizard,
})(SettingsWizardStep3)
