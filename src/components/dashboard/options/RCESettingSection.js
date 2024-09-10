import React, { useState, useRef, useCallback, useContext } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import tinycolor from 'tinycolor2'

import { selectors } from 'wired-up-pltr'
import { t } from 'plottr_locales'
import { defaultSettings } from 'pltr'

import { addRecent } from '../../rce/fonts'
import { FontSettingDropdown } from './FontSettingDropdown'
import { FontSizeSettingDropdown } from './FontSizeSettingDropdown'
import { FontWeightSettingDropdown } from './FontWeightSettingDropdown'
import ColorPickerColor from '../../ColorPickerColor'
import PlottrFloater from '../../PlottrFloater'
import MiniColorPicker from '../../MiniColorPicker'
import RichTextSettingsViewer from './RichTextSettingsViewer'
import { PlottrComponentsContext } from '../../../connections/pltrContext'

const RCESettingSection = ({ fonts, sectionName, rceFontsSettings, noFontWeight }) => {
  const {
    platform: {
      settings: { saveAppSetting },
      os,
      log,
    },
  } = useContext(PlottrComponentsContext)

  const { user } = defaultSettings.defaultsForPlatform(os())

  const colourPickerPaletteListRef = useRef(null)
  const darkModeColourPickerPaletteListRef = useRef(null)

  const defaultRCESettings = user?.fonts?.rce
  const defaultFont = defaultRCESettings[`${sectionName}Font`]
  const defaultFontSize = defaultRCESettings[`${sectionName}FontSize`]
  const defaultFontColor = defaultRCESettings[`${sectionName}FontColor`]
  const defaultDarkModeFontColor = defaultRCESettings[`${sectionName}DarkModeFontColor`]
  const defaultFontWeight = defaultRCESettings[`${sectionName}FontWeight`]

  const sectionFont = rceFontsSettings[`${sectionName}Font`]
  const sectionFontSize = rceFontsSettings[`${sectionName}FontSize`]
  const sectionFontWeight = rceFontsSettings[`${sectionName}FontWeight`]

  const [showColourPicker, setShowColourPicker] = useState(false)
  const [showDarkModeColourPicker, setShowDarkModeColourPicker] = useState(false)
  const sectionFontColor = rceFontsSettings[`${sectionName}FontColor`] || defaultFontColor
  const sectionDarkModeFontColor =
    rceFontsSettings[`${sectionName}DarkModeFontColor`] || defaultDarkModeFontColor

  const darkenedColor =
    sectionFontColor || sectionFontColor === null
      ? tinycolor(sectionFontColor).darken().toHslString()
      : null
  const borderColor =
    sectionFontColor || sectionFontColor === null ? darkenedColor : 'hsl(211, 27%, 70%)' // $gray-6
  const darkenedDarkMode =
    sectionDarkModeFontColor || sectionDarkModeFontColor === null
      ? tinycolor(sectionDarkModeFontColor).darken().toHslString()
      : null
  const darkModeBorderColor =
    sectionDarkModeFontColor || sectionDarkModeFontColor === null
      ? darkenedDarkMode
      : 'hsl(211, 27%, 70%)' // $gray-6

  const rceTextType =
    sectionName === 'title'
      ? 'heading-one'
      : sectionName === 'subtitle'
      ? 'heading-two'
      : 'paragraph'

  const renderLightFontColourPicker = () => {
    return (
      <MiniColorPicker
        childRef={(ref) => (colourPickerPaletteListRef.current = ref)}
        chooseColor={chooseFontColor}
        close={() => setShowColourPicker(false)}
      />
    )
  }

  const renderDarkModeFontColourPicker = () => {
    return (
      <MiniColorPicker
        childRef={(ref) => (darkModeColourPickerPaletteListRef.current = ref)}
        chooseColor={chooseDarkModeFontColor}
        close={() => setShowDarkModeColourPicker(false)}
      />
    )
  }

  const chooseFontColor = (color) => {
    saveAppSetting(`user.fonts.rce.${sectionName}FontColor`, color)
    setShowColourPicker(false)
  }

  const chooseDarkModeFontColor = (color) => {
    saveAppSetting(`user.fonts.rce.${sectionName}DarkModeFontColor`, color)
    setShowDarkModeColourPicker(false)
  }

  const closeFontColourPicker = useCallback(() => {
    setShowColourPicker(false)
  }, [showColourPicker])

  const closeDarkModeFontColourPicker = useCallback(() => {
    setShowDarkModeColourPicker(false)
  }, [showDarkModeColourPicker])

  const toggleColorPicker = () => {
    if (showDarkModeColourPicker) {
      setShowDarkModeColourPicker(false)
    }
    setShowColourPicker(!showColourPicker)
  }

  const toggleDarkModeColorPicker = () => {
    if (showColourPicker) {
      setShowColourPicker(false)
    }
    setShowDarkModeColourPicker(!showDarkModeColourPicker)
  }

  const handleCloseColorPickers = () => {
    if (showColourPicker) {
      setShowColourPicker(false)
    }
    if (showDarkModeColourPicker) {
      setShowDarkModeColourPicker(false)
    }
  }

  return (
    <div className="dashboard__options__item">
      <div className="dashboard__options__item__column">
        <div className="dashboard__options__item">
          <span>{t('Font Family')}</span>
          <FontSettingDropdown
            activeFont={sectionFont || defaultFont}
            fonts={fonts || []}
            recentFonts={[]}
            addRecent={addRecent}
            onClick={handleCloseColorPickers}
            onChange={(newFont) => {
              saveAppSetting(`user.fonts.rce.${sectionName}Font`, newFont)
            }}
          />
        </div>
        <div className="dashboard__options__item">
          <span>{t('Font Size')}</span>
          <FontSizeSettingDropdown
            defaultFontSize={
              Number(sectionFontSize?.replace('pt', '')) ||
              Number(defaultFontSize?.replace('pt', ''))
            }
            onChange={(newSize) => {
              saveAppSetting(`user.fonts.rce.${sectionName}FontSize`, `${newSize}pt`)
            }}
            onClick={handleCloseColorPickers}
          />
        </div>
        {noFontWeight ? null : (
          <div className="dashboard__options__item">
            <span>{t('Font Weight')}</span>
            <FontWeightSettingDropdown
              defaultFontWeight={sectionFontWeight || defaultFontWeight}
              onChange={(newWeight) => {
                saveAppSetting(`user.fonts.rce.${sectionName}FontWeight`, newWeight)
              }}
              onClick={handleCloseColorPickers}
            />
          </div>
        )}
        <div className="dashboard__options__item">
          <span>{t('Font Color')}</span>
          <PlottrFloater
            open={showColourPicker}
            placement="bottom"
            component={renderLightFontColourPicker}
            onClose={closeFontColourPicker}
          >
            <ColorPickerColor
              key={`rce-color-picker-color-fonts`}
              color={sectionFontColor}
              choose={toggleColorPicker}
              buttonStyle={{
                border: `1px solid ${borderColor}`,
                backgroundColor: sectionFontColor,
              }}
              style={{}}
            />
          </PlottrFloater>
        </div>
        <div className="dashboard__options__item">
          <span>{t('Dark Mode Font Color')}</span>
          <PlottrFloater
            open={showDarkModeColourPicker}
            placement="bottom"
            component={renderDarkModeFontColourPicker}
            onClose={closeDarkModeFontColourPicker}
          >
            <ColorPickerColor
              key={`rce-darkmode-color-picker-color-fonts`}
              color={sectionDarkModeFontColor}
              choose={toggleDarkModeColorPicker}
              buttonStyle={{
                border: `1px solid ${darkModeBorderColor}`,
                backgroundColor: sectionDarkModeFontColor,
              }}
              style={{}}
            />
          </PlottrFloater>
        </div>
      </div>

      <div className="dashboard__options__item__column">
        <div className="dashboard__options__item__column">
          <p>{t('Preview:')}</p>
          <RichTextSettingsViewer
            log={log}
            fontFamily={sectionFont || defaultFont}
            fontSize={sectionFontSize || defaultFontSize}
            fontWeight={sectionFontWeight || defaultFontWeight}
            color={sectionFontColor || defaultFontColor}
            name={`${sectionName}RCELight`}
            textType={rceTextType}
          />
          <RichTextSettingsViewer
            log={log}
            darkMode
            fontFamily={sectionFont || defaultFont}
            fontSize={sectionFontSize || defaultFontSize}
            fontWeight={sectionFontWeight || defaultFontWeight}
            color={sectionDarkModeFontColor || defaultDarkModeFontColor}
            name={`${sectionName}RCEDarkMode`}
            textType={rceTextType}
          />
        </div>
      </div>
    </div>
  )
}

RCESettingSection.propTypes = {
  sectionName: PropTypes.string.isRequired,
  fonts: PropTypes.arrayOf(PropTypes.string),
  rceFontsSettings: PropTypes.object,
  noFontWeight: PropTypes.bool,
}

const mapStateToProps = (state) => ({
  rceFontsSettings: selectors.rceFontsSettingsSelector(state),
})

export default connect(mapStateToProps)(RCESettingSection)
