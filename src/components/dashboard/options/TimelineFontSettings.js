import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'

import { defaultSettings } from 'pltr/v2'
import { t } from 'plottr_locales'

import { checkDependencies } from '../../checkDependencies'
import { addRecent, getFonts } from '../../rce/fonts'
import { FontSettingDropdown } from './FontSettingDropdown'
import Button from '../../Button'
import ButtonGroup from '../../ButtonGroup'
import { FontSizeSettingDropdown } from './FontSizeSettingDropdown'

const TimelineFontSettingConnector = (connector) => {
  const {
    platform: {
      setDarkMode,
      settings: { saveAppSetting },
      os,
    },
  } = connector
  checkDependencies({ setDarkMode, saveAppSetting, os })

  const TimelineFontSettings = ({ timelineFontsSettings }) => {
    const [fonts, setFonts] = useState(null)

    const { user } = defaultSettings.defaultsForPlatform(os())
    const defaultTimelineHeadingFont = user?.fonts?.timeline?.headings?.font
    const defaultTimelineHeadingFontSize = user?.fonts?.timeline?.headings?.fontSize
    const defaultPlotlineFont = user?.fonts?.timeline?.plotlines?.font
    const defaultPlotineFontSize = user?.fonts?.timeline?.plotlines?.fontSize
    const defaultSceneCardTitleFont = user?.fonts?.timeline?.sceneCardTitles?.font
    const defaultSceneCardTitleFontSize = user?.fonts?.timeline?.sceneCardTitles?.fontSize

    const timelineHeadingFontIsDefault =
      timelineFontsSettings.headings?.font == defaultTimelineHeadingFont
    const timelineHeadingFontSizeIsDefault =
      timelineFontsSettings.headings?.fontSize == defaultTimelineHeadingFontSize
    const timelinePlotlineFontIsDefault =
      timelineFontsSettings.plotlines?.font == defaultPlotlineFont
    const timelinePlotlineFontSizeIsDefault =
      timelineFontsSettings.plotlines?.fontSize == defaultPlotineFontSize
    const timelineSceneCardTitlesFontIsDefault =
      timelineFontsSettings.sceneCardTitles?.font == defaultSceneCardTitleFont
    const timelineSceneCardTitlesFontSizeIsDefault =
      timelineFontsSettings.sceneCardTitles?.fontSize == defaultSceneCardTitleFontSize

    const timelineHeadingFontSettingIsDefault =
      timelineHeadingFontIsDefault && timelineHeadingFontSizeIsDefault
    const timelinePlotlineFontSettingIsDefault =
      timelinePlotlineFontIsDefault && timelinePlotlineFontSizeIsDefault
    const timelineSceneCardTitleFontSettingIsDefault =
      timelineSceneCardTitlesFontIsDefault && timelineSceneCardTitlesFontSizeIsDefault

    const timelineFontSettingIsDefault =
      timelineHeadingFontSettingIsDefault &&
      timelinePlotlineFontSettingIsDefault &&
      timelineSceneCardTitleFontSettingIsDefault

    useEffect(() => {
      if (!fonts) setFonts(getFonts(os()))
    }, [])

    const setGlobalFontDefaults = useCallback(() => {
      saveAppSetting('user.fonts.timeline.headings.font', defaultTimelineHeadingFont)
      saveAppSetting('user.fonts.timeline.headings.fontSize', defaultTimelineHeadingFontSize)
      saveAppSetting('user.fonts.timeline.plotlines.font', defaultPlotlineFont)
      saveAppSetting('user.fonts.timeline.plotlines.fontSize', defaultPlotineFontSize)
      saveAppSetting('user.fonts.timeline.sceneCardTitles.font', defaultSceneCardTitleFont)
      saveAppSetting('user.fonts.timeline.sceneCardTitles.fontSize', defaultSceneCardTitleFontSize)
    }, [saveAppSetting])

    return (
      <>
        <div className="dashboard__options__item">
          <div className="dashboard__options__item__font-setting__heading">
            <h4>{t('Timeline Fonts')}</h4>
            <hr />
          </div>
        </div>
        <div className="dashboard__options__item">
          <span>{t('Timeline Heading Font')}</span>
          <ButtonGroup>
            <FontSettingDropdown
              activeFont={timelineFontsSettings?.headings?.font || defaultTimelineHeadingFont}
              fonts={fonts || []}
              recentFonts={[]}
              addRecent={addRecent}
              onChange={(newFont) => {
                saveAppSetting('user.fonts.timeline.headings.font', newFont)
              }}
            />

            <FontSizeSettingDropdown
              defaultFontSize={
                timelineFontsSettings?.headings?.fontSize?.replace('px', '') ||
                Number(defaultTimelineHeadingFontSize?.replace('px', ''))
              }
              onChange={(newSize) => {
                saveAppSetting('user.fonts.timeline.headings.fontSize', `${newSize}px`)
              }}
            />
          </ButtonGroup>
        </div>
        <div className="dashboard__options__item">
          <span>{t('Plotline Font')}</span>
          <ButtonGroup>
            <FontSettingDropdown
              activeFont={timelineFontsSettings?.plotlines?.font || defaultPlotlineFont}
              fonts={fonts || []}
              recentFonts={[]}
              addRecent={addRecent}
              onChange={(newFont) => {
                saveAppSetting('user.fonts.timeline.plotlines.font', newFont)
              }}
            />

            <FontSizeSettingDropdown
              defaultFontSize={
                timelineFontsSettings?.plotlines?.fontSize?.replace('px', '') ||
                Number(defaultPlotineFontSize?.replace('px', ''))
              }
              onChange={(newSize) => {
                saveAppSetting('user.fonts.timeline.plotlines.fontSize', `${newSize}px`)
              }}
            />
          </ButtonGroup>
        </div>
        <div className="dashboard__options__item">
          <span>{t('Scene Card Titles Font')}</span>
          <ButtonGroup>
            <FontSettingDropdown
              activeFont={timelineFontsSettings?.sceneCardTitles?.font || defaultSceneCardTitleFont}
              fonts={fonts || []}
              recentFonts={[]}
              addRecent={addRecent}
              onChange={(newFont) => {
                saveAppSetting('user.fonts.timeline.sceneCardTitles.font', newFont)
              }}
            />

            <FontSizeSettingDropdown
              defaultFontSize={
                timelineFontsSettings?.sceneCardTitles?.fontSize?.replace('px', '') ||
                Number(defaultSceneCardTitleFontSize?.replace('px', ''))
              }
              onChange={(newSize) => {
                saveAppSetting('user.fonts.timeline.sceneCardTitles.fontSize', `${newSize}px`)
              }}
            />
          </ButtonGroup>
        </div>
        {timelineFontSettingIsDefault ? null : (
          <div className="dashboard__options__item">
            <Button style={{ marginTop: '32px' }} onClick={setGlobalFontDefaults}>
              {t('Restore Defaults')}
            </Button>
          </div>
        )}
      </>
    )
  }

  TimelineFontSettings.propTypes = {
    timelineFontsSettings: PropTypes.object.isRequired,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux
    return connect((state) => ({
      timelineFontsSettings: selectors.timelineFontsSettingsSelector(state),
    }))(TimelineFontSettings)
  }

  throw new Error('Could not connect TimelineFontSettings')
}

export default TimelineFontSettingConnector
