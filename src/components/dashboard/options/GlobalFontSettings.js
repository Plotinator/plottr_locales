import React, { useCallback, useEffect, useState, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { isEmpty } from 'lodash'

import { defaultSettings } from 'pltr'
import { t } from 'plottr_locales'
import { selectors } from 'wired-up-pltr'

import { addRecent, getFonts } from '../../rce/fonts'
import { FontSettingDropdown } from './FontSettingDropdown'
import Button from '../../Button'
import { PlottrComponentsContext } from '../../../connections/pltrContext'

const GlobalFontSettings = ({ globalFontsSettings }) => {
  const {
    platform: {
      settings: { saveAppSetting },
      os,
    },
  } = useContext(PlottrComponentsContext)

  const [fonts, setFonts] = useState(null)

  const { user } = defaultSettings.defaultsForPlatform(os())
  const defaultGlobalHeadingFont = user?.fonts?.global?.headingFont
  const defaultGlobalBodyFont = user?.fonts?.global?.bodyFont
  const globalHeadingFontIsDefault = globalFontsSettings?.headingFont === defaultGlobalHeadingFont
  const globalBodyFontIsDefault = globalFontsSettings?.bodyFont === defaultGlobalBodyFont
  const globalFontSettingIsDefault =
    isEmpty(globalFontsSettings) || (globalHeadingFontIsDefault && globalBodyFontIsDefault)

  useEffect(() => {
    // @ts-ignore
    if (!fonts) setFonts(getFonts(os()))
  }, [])

  const setGlobalFontDefaults = useCallback(() => {
    saveAppSetting('user.fonts.global.headingFont', defaultGlobalHeadingFont)
    saveAppSetting('user.fonts.global.bodyFont', defaultGlobalBodyFont)
  }, [saveAppSetting])

  return (
    <>
      <div className="dashboard__options__item">
        <div className="dashboard__options__item__font-setting__heading">
          <h4>{t('General')}</h4>
          <hr />
        </div>
      </div>
      <div className="dashboard__options__item">
        <span>{t('General Heading Font')}</span>
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
        <span>{t('General Body Font')}</span>
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

const mapStateToProps = (state) => ({
  globalFontsSettings: selectors.globalFontsSettingsSelector(state),
})

export default connect(mapStateToProps)(GlobalFontSettings)
