import React, { useState, useEffect, useCallback, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'

import { t, setupI18n } from 'plottr_locales'
import { selectors } from 'wired-up-pltr'

import Tab from '../../Tab'
import Tabs from '../../Tabs'
import Button from '../../Button'
import Switch from '../../Switch'
import LanguagePicker from '../../LanguagePicker'
import DarkOptionsSelect from './DarkOptionsSelect'
import BackupSettings from './BackupSettings'
import FileSettings from './FileSettings'
import FontSettings from './FontSettings'
import { PlottrComponentsContext } from '../../../connections/pltrContext'

const OptionsHome = ({ settings, shouldBeInPro }) => {
  const {
    platform: {
      hostLocale,
      openExternal,
      updateLanguage,
      os,
      settings: { saveAppSetting },
    },
  } = useContext(PlottrComponentsContext)

  const [activeTab, setActiveTab] = useState(1)

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
  const cardColorAsOutlineIsOn =
    settings.user.useCardColorAsOutline === undefined ? true : settings.user.useCardColorAsOutline

  const spellCheckText = spellCheckAtFirstIsOn ? t('Enabled') : t('Disabled')
  const cardColorAsOutlineToggleText = t('Bordered Card Dialog')

  const handleSelectLanguage = useCallback(
    (newLanguage) => {
      saveAppSetting('locale', newLanguage)
      updateLanguage(newLanguage)
    },
    [saveAppSetting, updateLanguage]
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
            <div className="dashboard__options__item appearance-section">
              <h4>{t('Appearance:')}</h4>
              <div>
                <h6>{t('Theme:')}</h6>
                <DarkOptionsSelect />
              </div>
              <Switch
                isOn={cardColorAsOutlineIsOn}
                handleToggle={() => {
                  const newVal =
                    settings.user.useCardColorAsOutline === undefined
                      ? false
                      : !settings.user.useCardColorAsOutline
                  saveAppSetting('user.useCardColorAsOutline', newVal)
                }}
                labelText={cardColorAsOutlineToggleText}
              />
              <p>{t(`Use card's color as dialog's border`)}</p>
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
                    settings.user.useSpellcheck === undefined ? false : !settings.user.useSpellcheck
                  saveAppSetting('user.useSpellcheck', newVal)
                }}
                labelText={spellCheckText}
              />
              <p>{t('Requires you to restart plottr')}</p>
            </div>
          </Tab>
          {!shouldBeInPro ? (
            <Tab eventKey={2} title={t('Files')}>
              <FileSettings />
            </Tab>
          ) : null}
          <Tab eventKey={3} title={t('Fonts')}>
            <FontSettings />
          </Tab>
          <Tab eventKey={4} title={t('Dashboard')}>
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
          <Tab eventKey={5} title={t('Backups')}>
            <BackupSettings />
          </Tab>
          {!osIsUnknown && shouldBeInPro ? (
            <Tab eventKey={6} title={t('Beta')}>
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

const mapStateToProps = (state) => {
  return {
    settings: selectors.appSettingsSelector(state),
    shouldBeInPro: selectors.shouldBeInProSelector(state),
  }
}

export default connect(mapStateToProps)(OptionsHome)
