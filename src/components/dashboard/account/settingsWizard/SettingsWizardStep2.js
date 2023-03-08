import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'

import OnboardingStep from '../../../onboarding/OnboardingStep'
import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'
import OnboardingButtonBar from '../../../onboarding/OnboardingButtonBar'
import Button from '../../../Button'
import Switch from '../../../Switch'
import HelpBlock from '../../../HelpBlock'
import { checkDependencies } from '../../../checkDependencies'

const SettingsWizardStep2Connector = (connector) => {
  const {
    platform: {
      settings: { saveAppSetting },
      file: { joinPath },
      showOpenDialog,
      showItemInFolder,
      userDocumentsPath,
    },
  } = connector
  checkDependencies({
    saveAppSetting,
    showOpenDialog,
    showItemInFolder,
    userDocumentsPath,
    joinPath,
  })

  const SettingsWizardStep2 = ({ nextStep, goBack, settings }) => {
    const [defPath, setDefPath] = useState('')

    useEffect(() => {
      userDocumentsPath().then((docPath) => {
        joinPath(docPath, 'Plottr').then((filePath) => setDefPath(filePath))
      })
    }, [])

    const onChangeDefaultFolderLocation = () => {
      const title = t('Choose your default folder location')
      const properties = ['openDirectory', 'createDirectory']
      showOpenDialog(title, [], properties, folderPath()).then((files) => {
        if (files && files.length) {
          let folderPath = files[0]
          saveAppSetting('user.defaultFolderLocation', folderPath)
        }
      })
    }

    const folderPath = () => {
      return settings.user.defaultFolderLocation || defPath
    }

    const handleNextStep = () => {
      if (settings.user.defaultFolder && !settings.user.defaultFolderLocation) {
        saveAppSetting('user.defaultFolderLocation', folderPath())
      }
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
                isOn={!!settings.user.defaultFolder}
                handleToggle={() =>
                  saveAppSetting('user.defaultFolder', !settings.user.defaultFolder)
                }
                labelText={t('All your files will be automatically saved to the folder you choose')}
              />
            </div>
            {settings.user.defaultFolder ? (
              <div className="dashboard__options__item">
                <h4>{t('Default Folder Location')}</h4>
                <HelpBlock className="dashboard__options-item-help">
                  {t('Folder where all your projects get created')}
                </HelpBlock>
                <p>
                  <Button onClick={onChangeDefaultFolderLocation}>{t('Choose...')}</Button>
                  {'  '}
                  <Button bsStyle="link" onClick={() => showItemInFolder(folderPath())}>
                    {folderPath()}
                  </Button>
                </p>
              </div>
            ) : null}
          </div>
        </StepBody>
        <StepFooter>
          <OnboardingButtonBar>
            <Button bsSize="large" onClick={goBack}>
              {t('Back')}
            </Button>
            <Button bsSize="large" bsStyle="success" onClick={handleNextStep}>
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
    }))(SettingsWizardStep2)
  }

  throw new Error('Could not connect SettingsWizardStep2')
}

export default SettingsWizardStep2Connector
