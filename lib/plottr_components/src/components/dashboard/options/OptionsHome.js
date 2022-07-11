import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'react-proptypes'

import { t, setupI18n } from 'plottr_locales'

import HelpBlock from '../../HelpBlock'
import Tab from '../../Tab'
import Tabs from '../../Tabs'
import Button from '../../Button'
import Switch from '../../Switch'
import UnconnectedLanguagePicker from '../../LanguagePicker'
import UnconnectedDarkOptionsSelect from './DarkOptionsSelect'
import UnconnectedBackupOptions from './BackupOptions'
import { checkDependencies } from '../../checkDependencies'
import { FontsButton } from '../../rce/FontsButton'
import { addRecent, getFonts, getRecent } from '../../rce/fonts'
import { FontSizeChooser } from '../../rce/FontSizeChooser'

const OptionsHomeConnector = (connector) => {
  const {
    platform: {
      electron,
      openExternal,
      defaultBackupLocation,
      showOpenDialogSync,
      updateLanguage,
      updateBeatHierarchyFlag,
      os,
      log,
      setFontStyle,
      setFontSize,
      settings: { saveAppSetting },
    },
  } = connector
  checkDependencies({
    openExternal,
    defaultBackupLocation,
    showOpenDialogSync,
    updateLanguage,
    updateBeatHierarchyFlag,
    os,
    saveAppSetting,
    setFontStyle,
    setFontSize,
  })

  const LanguagePicker = UnconnectedLanguagePicker(connector)
  const DarkOptionsSelect = UnconnectedDarkOptionsSelect(connector)
  const BackupOptions = UnconnectedBackupOptions(connector)
  const DEFAULT_PLOTTR_FONT = 'Lato'

  const OptionsHome = ({ hasCurrentProLicense, settings, shouldBeInPro }) => {
    const [activeTab, setActiveTab] = useState(1)
    const [fonts, setFonts] = useState(null)
    const [recentFonts, setRecentFonts] = useState([settings.user.font])
    const currentFontSize = settings.user.fontSize

    useEffect(() => {
      setupI18n(settings, { electron })
    }, [settings.locale])

    const handleSetActiveTab = (x) => {
      if (typeof x === 'number') {
        setActiveTab(x)
      }
    }

    useEffect(() => {
      if (!fonts) {
        const osFonts = getFonts(os())
        setFonts([DEFAULT_PLOTTR_FONT, ...osFonts])
      }
      if (!recentFonts) setRecentFonts(getRecent())
    }, [])

    const osIsUnknown = os() === 'unknown'

    const onChangeBackupLocation = () => {
      const title = t('Choose your backup location')
      const properties = ['openDirectory']
      const files = showOpenDialogSync({ title, properties })
      if (files && files.length) {
        let folderPath = files[0]
        saveAppSetting('user.backupLocation', folderPath)
      }
    }

    const toggleBeatHierarchy = () => {
      const newValue = !settings.user.beatHierarchy
      saveAppSetting('user.beatHierarchy', newValue)
      updateBeatHierarchyFlag(newValue)
    }

    const toggleEnableOfflineMode = () => {
      const newValue = !settings.user.enableOfflineMode
      saveAppSetting('user.enableOfflineMode', newValue)
    }

    // show if:
    // - not web
    // - not Pro, unless Pro & localBackups
    const showBackupLocation = () => {
      return (!osIsUnknown && !hasCurrentProLicense) || (!osIsUnknown && settings.user.localBackups)
    }

    const dashboardFirstText = settings.user.openDashboardFirst
      ? t("When Plottr opens, the first thing you'll see is the dashboard")
      : t('Plottr opens your most recent project at start')

    const dashboardFirstIsOn =
      settings.user.openDashboardFirst === undefined ? true : settings.user.openDashboardFirst

    const spellCheckFirstIsOn =
      settings.user.useSpellcheck === undefined ? true : settings.user.useSpellcheck

    const handleSelectLanguage = useCallback(
      (newLanguage) => {
        saveAppSetting('locale', newLanguage)
        updateLanguage(newLanguage)
      },
      [saveAppSetting, updateLanguage]
    )

    const handleSelectFont = useCallback(
      (newFont) => {
        setFontStyle(newFont)
      },
      [saveAppSetting, setFontStyle]
    )

    const handleSelectFontSize = useCallback(
      (newSize) => {
        setFontSize(newSize)
      },
      [saveAppSetting, setFontSize]
    )

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
                  isOn={spellCheckFirstIsOn}
                  handleToggle={() =>
                    saveAppSetting('user.useSpellcheck', !settings.user.useSpellcheck)
                  }
                  labelText={t('Use spellcheck')}
                />
                <p>{t('Requires you to restart plottr')}</p>
              </div>
            </Tab>
            <Tab eventKey={2} title={t('Dashboard')}>
              <div className="dashboard__options__item">
                <h4>{t('Always Open Dashboard First')}</h4>
                <Switch
                  isOn={dashboardFirstIsOn}
                  handleToggle={(event) => {
                    event.stopPropagation()
                    saveAppSetting('user.openDashboardFirst', !settings.user.openDashboardFirst)
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
            <Tab eventKey={3} title={t('Backups')}>
              <div className="dashboard__options__item">
                <h4>{t('Save Backups')}</h4>
                <Switch
                  isOn={!!settings.backup}
                  handleToggle={() => saveAppSetting('backup', !settings.backup)}
                  labelText={t('Automatically save daily backups')}
                />
              </div>
              {!osIsUnknown && hasCurrentProLicense ? (
                <div className="dashboard__options__item">
                  <h4>{t('Also save backups on this device')}</h4>
                  <Switch
                    isOn={!!settings.user.localBackups}
                    handleToggle={() =>
                      saveAppSetting('user.localBackups', !settings.user.localBackups)
                    }
                    labelText={t('Save backups to this device as well as in the cloud')}
                  />
                </div>
              ) : null}
              {showBackupLocation() ? (
                <>
                  <div className="dashboard__options__item">
                    <h4>{t('Backup Location')}</h4>
                    <HelpBlock className="dashboard__options-item-help">
                      {t('Folder where backups are stored')}
                    </HelpBlock>
                    <p>
                      <Button onClick={onChangeBackupLocation}>{t('Choose...')}</Button>
                      {'  '}
                      {!settings.user.backupLocation || settings.user.backupLocation === 'default'
                        ? defaultBackupLocation
                        : settings.user.backupLocation}
                    </p>
                    {settings.user.backupLocation !== 'default' ? (
                      <Button onClick={() => saveAppSetting('user.backupLocation', 'default')}>
                        {t('Restore Default')}
                      </Button>
                    ) : null}
                  </div>
                  <div className="dashboard__options__item">
                    <BackupOptions />
                  </div>
                </>
              ) : null}
            </Tab>
            <Tab eventKey={4} title={t('Beta')}>
              <div className="dashboard__options__item">
                <h4>{t('Act Structure')}</h4>
                <Switch
                  isOn={!!settings.user.beatHierarchy}
                  handleToggle={toggleBeatHierarchy}
                  labelText={t('Organize your scene cards into Chapters and Acts')}
                />
                <br />
                {!osIsUnknown ? (
                  <p className="text-warning">
                    {t("Don't forget to make a backup of your files first.")}
                  </p>
                ) : null}
                <p>
                  {t('To give feedback on this feature, please visit:')}
                  <br />
                  <Button bsStyle="link" onClick={() => openExternal('https://plottr.com/beta/')}>
                    {t('plottr.com/beta')}
                  </Button>
                </p>
              </div>
              {!osIsUnknown && shouldBeInPro ? (
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
              ) : null}
            </Tab>
            <Tab eventKey={5} title={t('Appearance')}>
              <div className="dashboard__options__item">
                <h4>{t('Default Font')}</h4>
                <FontsButton
                  fonts={fonts || []}
                  recentFonts={recentFonts || []}
                  addRecent={addRecent}
                  editor={{ selection: null }}
                  logger={log}
                  onChange={handleSelectFont}
                />
                <br />
                <p>
                  <br />
                  <h4>{t('Default Font Size')}</h4>
                  <FontSizeChooser
                    currentFontSize={currentFontSize}
                    editor={{ selection: null }}
                    onChange={handleSelectFontSize}
                  />
                </p>
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    )
  }

  OptionsHome.propTypes = {
    hasCurrentProLicense: PropTypes.bool,
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
        hasCurrentProLicense: selectors.hasProSelector(state.present),
        settings: selectors.appSettingsSelector(state.present),
        shouldBeInPro: selectors.shouldBeInProSelector(state.present),
      }
    })(OptionsHome)
  }

  throw new Error('Could not connect OptionsHome')
}

export default OptionsHomeConnector
