import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'react-proptypes'

import { t, setupI18n } from 'plottr_locales'
import { defaultSettings } from 'pltr/v2'

import Tab from '../../Tab'
import Tabs from '../../Tabs'
import Button from '../../Button'
import Switch from '../../Switch'
import ButtonGroup from '../../ButtonGroup'
import UnconnectedLanguagePicker from '../../LanguagePicker'
import UnconnectedDarkOptionsSelect from './DarkOptionsSelect'
import UnconnectedBackupSettings from './BackupSettings'
import UnconnectedFileSettings from './FileSettings'
import { checkDependencies } from '../../checkDependencies'
import { addRecent, getFonts, getRecent } from '../../rce/fonts'
import { FontSettingDropdown } from './FontSettingDropdown'
import { FontSizeSettingDropdown } from './FontSizeSettingDropdown'
import RichTextSettingsViewer from './RichTextSettingsViewer'

const OptionsHomeConnector = (connector) => {
  const {
    platform: {
      hostLocale,
      openExternal,
      updateLanguage,
      os,
      log,
      settings: { saveAppSetting },
    },
  } = connector
  checkDependencies({
    hostLocale,
    openExternal,
    updateLanguage,
    os,
    log,
    saveAppSetting,
  })

  const LanguagePicker = UnconnectedLanguagePicker(connector)
  const DarkOptionsSelect = UnconnectedDarkOptionsSelect(connector)
  const BackupSettings = UnconnectedBackupSettings(connector)
  const FileSettings = UnconnectedFileSettings(connector)

  const OptionsHome = ({ settings, shouldBeInPro }) => {
    const [activeTab, setActiveTab] = useState(1)
    const [fonts, setFonts] = useState(null)
    const [recentFonts, setRecentFonts] = useState(settings.user.font ? [settings.user.font] : null)

    useEffect(() => {
      hostLocale().then((locale) => {
        setupI18n(settings, { locale })
      })
    }, [settings.locale])

    const handleSetActiveTab = (x) => {
      if (typeof x === 'number') {
        setActiveTab(x)
      }
    }

    useEffect(() => {
      if (!fonts) setFonts(getFonts(os()))
      setRecentFonts(getRecent())
    }, [settings.user.font])

    const osIsUnknown = os() === 'unknown'

    const toggleEnableOfflineMode = () => {
      const newValue = !settings.user.enableOfflineMode
      saveAppSetting('user.enableOfflineMode', newValue)
    }

    const dashboardAtFirstIsOn =
      settings.user.openDashboardFirst === undefined ? true : settings.user.openDashboardFirst

    const dashboardFirstText = dashboardAtFirstIsOn
      ? t("When Plottr opens, the first thing you'll see is the dashboard")
      : t('Plottr opens your most recent project at start')

    const spellCheckAtFirstIsOn =
      settings.user.useSpellcheck === undefined ? true : settings.user.useSpellcheck

    const spellCheckText = spellCheckAtFirstIsOn ? t('Enabled') : t('Disabled')

    const { user } = defaultSettings.defaultsForPlatform(os())
    const rceFontIsDefault = settings.user.font === user?.font
    const rceFontSizeIsDefault = settings.user.fontSize === user?.fontSize
    const rceIsDefault = rceFontIsDefault && rceFontSizeIsDefault

    const handleSelectLanguage = useCallback(
      (newLanguage) => {
        saveAppSetting('locale', newLanguage)
        updateLanguage(newLanguage)
      },
      [saveAppSetting, updateLanguage]
    )

    const setFontDefaults = useCallback(() => {
      saveAppSetting('user.font', 'Forum')
      addRecent('Forum')
      saveAppSetting('user.fontSize', 20)
    }, [saveAppSetting])

    return (
      <div className="dashboard__options">
        <h1>{t('Settings')}</h1>
        <div>
          <Tabs activeKey={activeTab} onSelect={handleSetActiveTab} id="settings-tabs">
            <Tab eventKey={1} title={t('General')}>
              {!osIsUnknown ? (
                <div className="dashboard__options__item">
                  <h4>{t('Update Automatically')}</h4>
                  <Switch
                    isOn={!!settings.user.autoDownloadUpdate}
                    handleToggle={() =>
                      saveAppSetting('user.autoDownloadUpdate', !settings.user.autoDownloadUpdate)
                    }
                    labelText={t('Download updates automatically')}
                  />
                </div>
              ) : null}
              <div className="dashboard__options__item">
                <h4>{t('Appearance: Dark/Light')}</h4>
                <DarkOptionsSelect />
              </div>
              <div className="dashboard__options__item">
                <h4>{t('Language')}</h4>
                <LanguagePicker onSelectLanguage={handleSelectLanguage} />
              </div>
              <div className="dashboard__options__item">
                <h4>{t('Spell Check')}</h4>
                <Switch
                  isOn={spellCheckAtFirstIsOn}
                  handleToggle={() => {
                    const newVal =
                      settings.user.useSpellcheck === undefined
                        ? false
                        : !settings.user.useSpellcheck
                    saveAppSetting('user.useSpellcheck', newVal)
                  }}
                  labelText={spellCheckText}
                />
                <p>{t('Requires you to restart plottr')}</p>
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
            </Tab>
            <Tab eventKey={3} title={t('Dashboard')}>
              <div className="dashboard__options__item">
                <h4>{t('Always Open Dashboard First')}</h4>
                <Switch
                  isOn={dashboardAtFirstIsOn}
                  handleToggle={() => {
                    const newVal =
                      settings.user.openDashboardFirst === undefined
                        ? false
                        : !settings.user.openDashboardFirst
                    saveAppSetting('user.openDashboardFirst', newVal)
                  }}
                  labelText={dashboardFirstText}
                />
              </div>
              <div className="dashboard__options__item">
                <h4>{t('Streaming Friendly')}</h4>
                <Switch
                  isOn={settings.user.streamFriendly}
                  handleToggle={(event) => {
                    event.stopPropagation()
                    saveAppSetting('user.streamFriendly', !settings.user.streamFriendly)
                  }}
                  labelText={t('Hides sensitive info for when you are sharing your screen')}
                />
              </div>
            </Tab>
            <Tab eventKey={4} title={t('Backups')}>
              <BackupSettings />
            </Tab>
            {!osIsUnknown && shouldBeInPro ? (
              <Tab eventKey={5} title={t('Beta')}>
                <div className="dashboard__options__item">
                  <h4>{t('Offline Mode')}</h4>
                  <Switch
                    isOn={!!settings.user.enableOfflineMode}
                    handleToggle={toggleEnableOfflineMode}
                    labelText={t('Continue working when your connection goes down.')}
                  />
                  <br />
                  <p>
                    {t('To give feedback on this feature, please visit:')}
                    <br />
                    <Button bsStyle="link" onClick={() => openExternal('https://plottr.com/beta/')}>
                      {t('plottr.com/beta')}
                    </Button>
                  </p>
                </div>
              </Tab>
            ) : null}
          </Tabs>
        </div>
      </div>
    )
  }

  OptionsHome.propTypes = {
    settings: PropTypes.object.isRequired,
    shouldBeInPro: PropTypes.bool,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => {
      return {
        settings: selectors.appSettingsSelector(state),
        shouldBeInPro: selectors.shouldBeInProSelector(state),
      }
    })(OptionsHome)
  }

  throw new Error('Could not connect OptionsHome')
}

export default OptionsHomeConnector
