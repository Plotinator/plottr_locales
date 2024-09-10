import React, { useEffect, useState, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { FaUndoAlt } from '@react-icons/all-files/fa/FaUndoAlt'

import { defaultSettings } from 'pltr'
import { t } from 'plottr_locales'
import { selectors } from 'wired-up-pltr'

import { getFonts } from '../../rce/fonts'
import Button from '../../Button'
import RCESettingSection from './RCESettingSection'
import { isEmpty } from 'lodash'
import { PlottrComponentsContext } from '../../../connections/pltrContext'

const RCEFontSettings = ({ rceFontsSettings }) => {
  const {
    platform: {
      settings: { saveAppSetting },
      os,
    },
  } = useContext(PlottrComponentsContext)

  const [fonts, setFonts] = useState(null)
  const defaultRCEFontSettings = {
    defaultFont: 'Forum',
    defaultFontSize: '16pt',
    defaultDarkModeFontColor: '#CCCCCC',
    defaultFontColor: '#102A42', //$gray-0
    titleFont: 'Forum',
    titleFontSize: '28pt',
    titleFontWeight: 400,
    titleDarkModeFontColor: '#CCCCCC',
    titleFontColor: '#102A42',
    subtitleFont: 'Forum',
    subtitleFontSize: '24pt',
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

  const rceFontIsDefault = isEmpty(userFont) || userFont == defaultFont
  const rceFontSizeIsDefault = isEmpty(userFontSize) || userFontSize == defaultFontSize
  const rceFontColorIsDefault = isEmpty(userFontColor) || userFontColor == defaultFontColor
  const rceDarkModeFontColorIsDefault =
    isEmpty(userDarkModeFontColor) || userDarkModeFontColor == defaultDarkModeFontColor
  const rceTitleFontIsDefault = isEmpty(userTitleFont) || userTitleFont == defaultTitleFont
  const rceTitleFontSizeIsDefault =
    isEmpty(userTitleFontSize) || userTitleFontSize == defaultTitleFontSize
  const rceTitleFontWeightIsDefault =
    !userTitleFontWeight || userTitleFontWeight === defaultTitleFontWeight
  const rceTitleFontColorIsDefault =
    isEmpty(userTitleFontColor) || userTitleFontColor == defaultTitleFontColor
  const rceTitleDarkModeFontColorIsDefault =
    isEmpty(userTitleDarkModeFontColor) ||
    userTitleDarkModeFontColor == defaultTitleDarkModeFontColor
  const rceSubtitleFontIsDefault =
    isEmpty(userSubtitleFont) || userSubtitleFont == defaultSubtitleFont
  const rceSubtitleFontSizeIsDefault =
    isEmpty(userSubtitleFontSize) || userSubtitleFontSize == defaultSubtitleFontSize
  const rceSubtitleFontWeightIsDefault =
    !userSubtitleFontWeight || userSubtitleFontWeight === defaultSubtitleFontWeight
  const rceSubtitleFontColorIsDefault =
    isEmpty(userSubtitleFontColor) || userSubtitleFontColor == defaultSubtitleFontColor
  const rceSubtitleDarkModeFontColorIsDefault =
    isEmpty(userSubtitleDarkModeFontColor) ||
    userSubtitleDarkModeFontColor == defaultSubtitleDarkModeFontColor

  const rceDefaultSettingIsDefault =
    rceFontIsDefault &&
    rceFontSizeIsDefault &&
    rceFontColorIsDefault &&
    rceDarkModeFontColorIsDefault

  const rceTitleSettingIsDefault =
    rceTitleFontIsDefault &&
    rceTitleFontSizeIsDefault &&
    rceTitleFontColorIsDefault &&
    rceTitleFontWeightIsDefault &&
    rceTitleDarkModeFontColorIsDefault

  const rceSubtitleSettingIsDefault =
    rceSubtitleFontIsDefault &&
    rceSubtitleFontSizeIsDefault &&
    rceSubtitleFontWeightIsDefault &&
    rceSubtitleFontColorIsDefault &&
    rceSubtitleDarkModeFontColorIsDefault

  const rceFontSettingIsDefault =
    isEmpty(rceFontsSettings) ||
    (rceFontIsDefault &&
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
      rceSubtitleDarkModeFontColorIsDefault)

  useEffect(() => {
    // @ts-ignore
    if (!fonts) setFonts(getFonts(os()))
  }, [])

  const setGlobalFontDefaults = async () => {
    await saveAppSetting('user.fonts.rce', defaultRCEFontSettings)
  }

  const setRCEDefaultFont = async () => {
    await saveAppSetting('user.fonts.rce', {
      ...rceFontsSettings,
      defaultFont: 'Forum',
      defaultFontSize: '16pt',
      defaultDarkModeFontColor: '#CCCCCC',
      defaultFontColor: '#102A42', //$gray-0
    })
  }

  const setRCEDefaultTitleFont = async () => {
    await saveAppSetting('user.fonts.rce', {
      ...rceFontsSettings,
      titleFont: 'Forum',
      titleFontSize: '28pt',
      titleFontWeight: 400,
      titleDarkModeFontColor: '#CCCCCC',
      titleFontColor: '#102A42',
    })
  }

  const setRCEDefaultSubitleFont = async () => {
    await saveAppSetting('user.fonts.rce', {
      ...rceFontsSettings,
      subtitleFont: 'Forum',
      subtitleFontSize: '24pt',
      subtitleFontWeight: 400,
      subtitleDarkModeFontColor: '#CCCCCC',
      subtitleFontColor: '#102A42',
    })
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
        {!rceDefaultSettingIsDefault ? <FaUndoAlt onClick={setRCEDefaultFont} /> : null}
      </div>
      <RCESettingSection noFontWeight fonts={fonts} sectionName="default" />
      <div className="dashboard__options__item">
        <hr />
      </div>

      {/* Text editor title */}
      <div className="dashboard__options__item">
        <h4>{t('Title Fonts')}</h4>
        {!rceTitleSettingIsDefault ? <FaUndoAlt onClick={setRCEDefaultTitleFont} /> : null}
      </div>
      <RCESettingSection fonts={fonts} sectionName="title" />
      <div className="dashboard__options__item">
        <hr />
      </div>

      {/* Text editor subtitle */}
      <div className="dashboard__options__item">
        <h4>{t('Subtitle Fonts')}</h4>
        {!rceSubtitleSettingIsDefault ? <FaUndoAlt onClick={setRCEDefaultSubitleFont} /> : null}
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

const mapStateToProps = (state) => ({
  rceFontsSettings: selectors.rceFontsSettingsSelector(state),
})

export default connect(mapStateToProps)(RCEFontSettings)
