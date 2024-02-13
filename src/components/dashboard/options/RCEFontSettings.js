import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'

import { defaultSettings } from 'pltr/v2'
import { t } from 'plottr_locales'

import { checkDependencies } from '../../checkDependencies'
import { getFonts } from '../../rce/fonts'
import Button from '../../Button'
import UnconnectedRCESettingSection from './RCESettingSection'

const RCEFontSettingConnector = (connector) => {
  const RCESettingSection = UnconnectedRCESettingSection(connector)

  const {
    platform: {
      settings: { saveAppSetting },
      os,
    },
  } = connector
  checkDependencies({ saveAppSetting, os })

  const RCEFontSettings = ({ rceFontsSettings }) => {
    const [fonts, setFonts] = useState(null)
    const defaultRCEFontSettings = {
      defaultFont: 'Forum',
      defaultFontSize: '20px',
      defaultDarkModeFontColor: '#CCCCCC',
      defaultFontColor: '#102A42', //$gray-0
      titleFont: 'Forum',
      titleFontSize: '24px',
      titleFontWeight: 400,
      titleDarkModeFontColor: '#CCCCCC',
      titleFontColor: '#102A42',
      subtitleFont: 'Forum',
      subtitleFontSize: '24px',
      subtitleFontWeight: 400,
      subtitleDarkModeFontColor: '#CCCCCC',
      subtitleFontColor: '#102A42',
    }

    const { user } = defaultSettings.defaultsForPlatform(os())
    const defaultFont = user?.fonts?.rce?.defaultFont
    const defaultFontSize = user?.fonts?.rce?.defaultFontSize
    const defaultFontColor = user?.fonts?.rce?.defaultFontColor
    const defaultDarkModeFontColor = user?.fonts?.rce?.defaultDarkModeFontColor
    const defaultTitleFont = user?.fonts?.rce?.titleFont
    const defaultTitleFontSize = user?.fonts?.rce?.titleFontSize
    const defaultTitleFontWeight = user?.fonts?.rce?.titleFontWeight
    const defaultTitleFontColor = user?.fonts?.rce?.titleFontColor
    const defaultTitleDarkModeFontColor = user?.fonts?.rce?.titleDarkModeFontColor
    const defaultSubtitleFont = user?.fonts?.rce?.subtitleFont
    const defaultSubtitleFontSize = user?.fonts?.rce?.subtitleFontSize
    const defaultSubtitleFontWeight = user?.fonts?.rce?.subtitleFontWeight
    const defaultSubtitleFontColor = user?.fonts?.rce?.subtitleFontColor
    const defaultSubtitleDarkModeFontColor = user?.fonts?.rce?.subtitleDarkModeFontColor

    const userFont = rceFontsSettings?.defaultFont
    const userFontSize = rceFontsSettings?.defaultFontSize
    const userFontColor = rceFontsSettings?.defaultFontColor
    const userDarkModeFontColor = rceFontsSettings?.defaultDarkModeFontColor
    const userTitleFont = rceFontsSettings?.titleFont
    const userTitleFontSize = rceFontsSettings?.titleFontSize
    const userTitleFontWeight = rceFontsSettings?.titleFontWeight
    const userTitleFontColor = rceFontsSettings?.titleFontColor
    const userTitleDarkModeFontColor = rceFontsSettings?.titleDarkModeFontColor
    const userSubtitleFont = rceFontsSettings?.subtitleFont
    const userSubtitleFontSize = rceFontsSettings?.subtitleFontSize
    const userSubtitleFontWeight = rceFontsSettings?.subtitleFontWeight
    const userSubtitleFontColor = rceFontsSettings?.subtitleFontColor
    const userSubtitleDarkModeFontColor = rceFontsSettings?.subtitleDarkModeFontColor

    const rceFontIsDefault = userFont == defaultFont
    const rceFontSizeIsDefault = userFontSize == defaultFontSize
    const rceFontColorIsDefault = userFontColor == defaultFontColor
    const rceDarkModeFontColorIsDefault = userDarkModeFontColor == defaultDarkModeFontColor
    const rceTitleFontIsDefault = userTitleFont == defaultTitleFont
    const rceTitleFontSizeIsDefault = userTitleFontSize == defaultTitleFontSize
    const rceTitleFontWeightIsDefault = userTitleFontWeight == defaultTitleFontWeight
    const rceTitleFontColorIsDefault = userTitleFontColor == defaultTitleFontColor
    const rceTitleDarkModeFontColorIsDefault =
      userTitleDarkModeFontColor == defaultTitleDarkModeFontColor
    const rceSubtitleFontIsDefault = userSubtitleFont == defaultSubtitleFont
    const rceSubtitleFontSizeIsDefault = userSubtitleFontSize == defaultSubtitleFontSize
    const rceSubtitleFontWeightIsDefault = userSubtitleFontWeight == defaultSubtitleFontWeight
    const rceSubtitleFontColorIsDefault = userSubtitleFontColor == defaultSubtitleFontColor
    const rceSubtitleDarkModeFontColorIsDefault =
      userSubtitleDarkModeFontColor == defaultSubtitleDarkModeFontColor

    const rceFontSettingIsDefault =
      rceFontIsDefault &&
      rceFontSizeIsDefault &&
      rceFontColorIsDefault &&
      rceTitleFontIsDefault &&
      rceTitleFontSizeIsDefault &&
      rceTitleFontWeightIsDefault &&
      rceTitleFontColorIsDefault &&
      rceSubtitleFontIsDefault &&
      rceSubtitleFontSizeIsDefault &&
      rceSubtitleFontWeightIsDefault &&
      rceSubtitleFontColorIsDefault &&
      rceDarkModeFontColorIsDefault &&
      rceTitleDarkModeFontColorIsDefault &&
      rceSubtitleDarkModeFontColorIsDefault

    useEffect(() => {
      if (!fonts) setFonts(getFonts(os()))
    }, [])

    const setGlobalFontDefaults = async () => {
      await saveAppSetting('user.fonts.rce', defaultRCEFontSettings)
    }

    return (
      <>
        <div className="dashboard__options__item">
          <div className="dashboard__options__item__font-setting__heading">
            <h4>{t('Text Editor Fonts')}</h4>
            <hr />
          </div>
        </div>

        <div className="dashboard__options__item">
          <h4>{t('Default Setting')}</h4>
        </div>
        <RCESettingSection noFontWeight fonts={fonts} sectionName="default" />
        <div className="dashboard__options__item">
          <hr />
        </div>

        {/* Text editor title */}
        <div className="dashboard__options__item">
          <h4>{t('Title Fonts')}</h4>
        </div>
        <RCESettingSection fonts={fonts} sectionName="title" />
        <div className="dashboard__options__item">
          <hr />
        </div>

        {/* Text editor subtitle */}
        <div className="dashboard__options__item">
          <h4>{t('Subtitle Fonts')}</h4>
        </div>
        <RCESettingSection fonts={fonts} sectionName="subtitle" />

        {rceFontSettingIsDefault ? null : (
          <div className="dashboard__options__item">
            <Button style={{ marginTop: '32px' }} onClick={setGlobalFontDefaults}>
              {t('Restore Defaults')}
            </Button>
          </div>
        )}
      </>
    )
  }

  RCEFontSettings.propTypes = {
    rceFontsSettings: PropTypes.object.isRequired,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux
    return connect((state) => ({
      rceFontsSettings: selectors.rceFontsSettingsSelector(state),
    }))(RCEFontSettings)
  }

  throw new Error('Could not connect RCEFontSettings')
}

export default RCEFontSettingConnector
