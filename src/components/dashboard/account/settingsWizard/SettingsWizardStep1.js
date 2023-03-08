import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'

import { t, setupI18n } from 'plottr_locales'

import OnboardingStep from '../../../onboarding/OnboardingStep'
import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'
import OnboardingButtonBar from '../../../onboarding/OnboardingButtonBar'
import Button from '../../../Button'
import UnconnectedDarkOptionsSelect from '../../options/DarkOptionsSelect'
import UnconnectedLanguagePicker from '../../../LanguagePicker'
import { checkDependencies } from '../../../checkDependencies'
import ButtonGroup from '../../../ButtonGroup'
import { FontSettingDropdown } from '../../options/FontSettingDropdown'
import RichTextSettingsViewer from '../../options/RichTextSettingsViewer'
import { addRecent, getFonts, getRecent } from '../../../rce/fonts'
import { FontSizeSettingDropdown } from '../../options/FontSizeSettingDropdown'

const SettingsWizardStep1Connector = (connector) => {
  const {
    platform: {
      settings: { saveAppSetting },
      updateLanguage,
      os,
      log,
      hostLocale,
    },
  } = connector
  checkDependencies({
    updateLanguage,
    saveAppSetting,
    os,
    log,
    hostLocale,
  })

  const LanguagePicker = UnconnectedLanguagePicker(connector)
  const DarkOptionsSelect = UnconnectedDarkOptionsSelect(connector)

  const SettingsWizardStep1 = ({ nextStep, settings }) => {
    const [fonts, setFonts] = useState(null)
    const [recentFonts, setRecentFonts] = useState(settings.user.font ? [settings.user.font] : null)

    useEffect(() => {
      if (!fonts) setFonts(getFonts(os()))
      setRecentFonts(getRecent())
    }, [settings.user.font])

    const handleSelectLanguage = useCallback(
      (newLanguage) => {
        saveAppSetting('locale', newLanguage)
        updateLanguage(newLanguage)
      },
      [saveAppSetting, updateLanguage]
    )

    useEffect(() => {
      hostLocale().then((locale) => {
        setupI18n(settings, { locale })
      })
    }, [settings.locale])

    const setFontDefaults = useCallback(() => {
      saveAppSetting('user.font', 'Forum')
      addRecent('Forum')
      saveAppSetting('user.fontSize', 20)
    }, [saveAppSetting])

    const handleNextStep = () => {
      // if the user hasn't changed anything, do we need to do anything to save settings?
      return nextStep()
    }

    // TODO: pull the default values from the right place (default_settings)
    const rceFontIsDefault = settings.user.font === undefined || settings.user.font === 'Forum'
    const rceFontSizeIsDefault =
      settings.user.fontSize === undefined || settings.user.fontSize === 20
    const rceIsDefault = rceFontIsDefault && rceFontSizeIsDefault

    return (
      <OnboardingStep>
        <StepHeader>
          <div style={{ textAlign: 'left', marginLeft: '8%' }}>
            <h3>{t('The Basics')}</h3>
            <h6>{t('Some easy choices')}</h6>
          </div>
        </StepHeader>
        <StepBody>
          <div className="onboarding__settings">
            <div className="dashboard__options__item">
              <h4>{t('Language')}</h4>
              <LanguagePicker onSelectLanguage={handleSelectLanguage} />
            </div>
            <div className="dashboard__options__item">
              <h4>{t('Appearance: Dark/Light')}</h4>
              <DarkOptionsSelect />
            </div>
            <div className="dashboard__options__item rce">
              <h4>{t('Font Default: Text Editor')}</h4>
              <ButtonGroup>
                <FontSettingDropdown
                  activeFont={settings.user.font}
                  fonts={fonts || []}
                  recentFonts={recentFonts || []}
                  addRecent={addRecent}
                  onChange={(newFont) => {
                    saveAppSetting('user.font', newFont)
                  }}
                />
                <FontSizeSettingDropdown
                  defaultFontSize={settings.user.fontSize}
                  onChange={(newSize) => {
                    saveAppSetting('user.fontSize', newSize)
                  }}
                />
              </ButtonGroup>
              {rceIsDefault ? null : (
                <Button style={{ marginLeft: '16px' }} onClick={setFontDefaults}>
                  {t('Restore Defaults')}
                </Button>
              )}
              <p style={{ paddingTop: '8px', margin: 0 }}>{t('Preview:')}</p>
              <div style={{ width: '50%' }}>
                <RichTextSettingsViewer
                  log={log}
                  fontFamily={settings.user.font}
                  fontSize={settings.user.fontSize}
                />
              </div>
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
