import React, { useCallback, useEffect, useState, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'

import { selectors, actions } from 'wired-up-pltr'
import { t, setupI18n } from 'plottr_locales'
import { defaultSettings } from 'pltr'

import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'
import OnboardingButtonBar from '../../../onboarding/OnboardingButtonBar'
import OnboardingStep from '../../../onboarding/OnboardingStep'
import ButtonGroup from '../../../ButtonGroup'
import Button from '../../../Button'
import DarkOptionsSelect from '../../options/DarkOptionsSelect'
import LanguagePicker from '../../../LanguagePicker'
import { FontSizeSettingDropdown } from '../../options/FontSizeSettingDropdown'
import RichTextSettingsViewer from '../../options/RichTextSettingsViewer'
import { FontSettingDropdown } from '../../options/FontSettingDropdown'
import { addRecent, getFonts, getRecent } from '../../../rce/fonts'
import { PlottrComponentsContext } from '../../../../connections/pltrContext'

const SettingsWizardStep1 = ({
  nextStep,
  settings,
  stagedLanguage,
  stageLanguage,
  isInProMode,
  finishSettingsWizard,
}) => {
  const {
    platform: {
      settings: { saveAppSetting },
      os,
      log,
      hostLocale,
      errorReporter: { getInstance },
    },
  } = useContext(PlottrComponentsContext)

  const errorReportingLogger = {
    info: log.info,
    warn: log.warn,
    error: (message, error) => {
      getInstance().then((errorReporter) => {
        errorReporter.error(message, error)
      })
    },
  }

  const [fonts, setFonts] = useState(null)
  const [recentFonts, setRecentFonts] = useState(
    settings?.user?.fonts?.rce?.defaultFont ? [settings.user.fonts?.rce?.defaultFont] : null
  )

  useEffect(() => {
    // @ts-ignore
    if (!fonts) setFonts(getFonts(os()))
    setRecentFonts(getRecent())
  }, [settings.user.font])

  useEffect(() => {
    hostLocale().then((locale) => {
      setupI18n(settings, { locale })
    })
  }, [settings.locale])

  const setFontDefaults = useCallback(() => {
    saveAppSetting('user.fonts.rce.defaultFont', 'Forum')
    addRecent('Forum')
    saveAppSetting('user.fonts.rce.defaultFontSize', '16pt')
  }, [saveAppSetting])

  const { user } = defaultSettings.defaultsForPlatform(os())
  const rceFontIsDefault = settings.user?.fonts?.rce?.defaultFont === user.fonts?.rce?.defaultFont
  const rceFontSizeIsDefault =
    settings.user?.fonts?.rce?.defaultFontSize === user.fonts?.rce?.defaultFontSize
  const rceIsDefault = rceFontIsDefault && rceFontSizeIsDefault

  return (
    <OnboardingStep>
      <StepHeader>
        <div className="onboarding__settings">
          <h3>{t('The Basics')}</h3>
          <h6>{t('Some easy choices')}</h6>
        </div>
      </StepHeader>
      <StepBody>
        <div className="onboarding__settings">
          <div className="dashboard__options__item">
            <h4>{t('Language')}</h4>
            <LanguagePicker onSelectLanguage={stageLanguage} forcedSelection={stagedLanguage} />
            {stagedLanguage ? (
              <p style={{ paddingTop: '8px', margin: 0 }}>
                {t("The language will update once you've completed Step 3")}
              </p>
            ) : null}
          </div>
          <div className="dashboard__options__item">
            <h4>{t('Appearance: Dark/Light')}</h4>
            <DarkOptionsSelect />
          </div>
          <div className="dashboard__options__item rce">
            <h4>{t('Font Default: Text Editor')}</h4>
            <ButtonGroup>
              <FontSettingDropdown
                activeFont={settings.user?.fonts?.rce?.defaultFont}
                fonts={fonts || []}
                recentFonts={recentFonts || []}
                addRecent={addRecent}
                onChange={(newFont) => {
                  saveAppSetting('user.fonts.rce.defaultFont', newFont)
                }}
              />
              <FontSizeSettingDropdown
                defaultFontSize={settings.user?.fonts?.rce?.fontSize?.replace('pt', '')}
                onChange={(newSize) => {
                  saveAppSetting('user.fonts.rce.defaultFontSize', `${newSize}pt`)
                }}
              />
            </ButtonGroup>
            {rceIsDefault ? null : (
              <Button style={{ marginLeft: '16px' }} onClick={setFontDefaults}>
                {t('Restore Defaults')}
              </Button>
            )}
            <p style={{ paddingTop: '8px', margin: 0 }}>{t('Preview:')}</p>
            <div>
              <RichTextSettingsViewer
                log={errorReportingLogger}
                fontFamily={settings.user.font}
                fontSize={settings.user.fontSize}
              />
            </div>
          </div>
        </div>
      </StepBody>
      <StepFooter>
        <OnboardingButtonBar>
          {isInProMode ? (
            <Button bsSize="large" bsStyle="success" onClick={finishSettingsWizard}>
              {t('Done')}
            </Button>
          ) : (
            <Button bsSize="large" bsStyle="success" onClick={nextStep}>
              {t('Next')}
            </Button>
          )}
        </OnboardingButtonBar>
      </StepFooter>
    </OnboardingStep>
  )
}

SettingsWizardStep1.propTypes = {
  nextStep: PropTypes.func,
  settings: PropTypes.object.isRequired,
  stagedLanguage: PropTypes.string,
  stageLanguage: PropTypes.func.isRequired,
  isInProMode: PropTypes.bool,
  finishSettingsWizard: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  settings: selectors.appSettingsSelector(state),
  stagedLanguage: selectors.stagedLanguageSelector(state),
  isInProMode: selectors.isLoggedIntoProWithActiveLicenseSelector(state),
})

export default connect(mapStateToProps, {
  nextStep: actions.applicationState.advanceSettingsWizard,
  stageLanguage: actions.applicationState.stageLanguage,
  finishSettingsWizard: actions.applicationState.finishSettingsWizard,
})(SettingsWizardStep1)
