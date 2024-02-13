import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'

import { defaultSettings } from 'pltr/v2'
import { t } from 'plottr_locales'

import { checkDependencies } from '../../checkDependencies'
import { addRecent, getFonts } from '../../rce/fonts'
import { FontSettingDropdown } from './FontSettingDropdown'
import Button from '../../Button'

const GlobalFontSettingsConnector = (connector) => {
  const {
    platform: {
      setDarkMode,
      settings: { saveAppSetting },
      os,
    },
  } = connector
  checkDependencies({ setDarkMode, saveAppSetting, os })

  const GlobalFontSettings = ({ globalFontsSettings }) => {
    const [fonts, setFonts] = useState(null)

    const { user } = defaultSettings.defaultsForPlatform(os())
    const defaultGlobalHeadingFont = user?.fonts?.global?.headingFont
    const defaultGlobalBodyFont = user?.fonts?.global?.bodyFont
    const globalHeadingFontIsDefault = globalFontsSettings?.headingFont == defaultGlobalHeadingFont
    const globalBodyFontIsDefault = globalFontsSettings?.bodyFont == defaultGlobalBodyFont
    const globalFontSettingIsDefault = globalHeadingFontIsDefault && globalBodyFontIsDefault

    useEffect(() => {
      if (!fonts) setFonts(getFonts(os()))
    }, [])

    const setGlobalFontDefaults = useCallback(() => {
      saveAppSetting('user.fonts.global.headingFont', defaultGlobalHeadingFont)
      saveAppSetting('user.fonts.global.bodyFont', defaultGlobalHeadingFont)
    }, [saveAppSetting])

    return (
      <>
        <div className="dashboard__options__item">
          <div className="dashboard__options__item__font-setting__heading">
            <h4>{t('Global Fonts')}</h4>
            <hr />
          </div>
        </div>
        <div className="dashboard__options__item">
          <span>{t('Global Heading Font')}</span>
          <FontSettingDropdown
            activeFont={globalFontsSettings.headingFont || defaultGlobalHeadingFont}
            fonts={fonts || []}
            recentFonts={[]}
            addRecent={addRecent}
            onChange={(newFont) => {
              saveAppSetting('user.fonts.global.headingFont', newFont)
            }}
          />
        </div>
        <div className="dashboard__options__item">
          <span>{t('Global Body Font')}</span>
          <FontSettingDropdown
            activeFont={globalFontsSettings.bodyFont || defaultGlobalBodyFont}
            fonts={fonts || []}
            recentFonts={[]}
            addRecent={addRecent}
            onChange={(newFont) => {
              saveAppSetting('user.fonts.global.bodyFont', newFont)
            }}
          />
        </div>
        {globalFontSettingIsDefault ? null : (
          <div className="dashboard__options__item">
            <Button style={{ marginTop: '32px' }} onClick={setGlobalFontDefaults}>
              {t('Restore Defaults')}
            </Button>
          </div>
        )}
      </>
    )
  }

  GlobalFontSettings.propTypes = {
    globalFontsSettings: PropTypes.object.isRequired,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux
    return connect((state) => ({
      globalFontsSettings: selectors.globalFontsSettingsSelector(state),
    }))(GlobalFontSettings)
  }

  throw new Error('Could not connect GlobalFontSetting')
}

export default GlobalFontSettingsConnector
