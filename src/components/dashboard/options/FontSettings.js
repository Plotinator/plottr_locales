import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'

import { t } from 'plottr_locales'

import UnconnectedGlobalFontSettings from './GlobalFontSettings'
import UnconnectedRCEFontSettings from './RCEFontSettings'
import UnconnectedTimelineFontSettings from './TimelineFontSettings'
import { Spinner } from '../../Spinner'

const FontSettingsConnector = (connector) => {
  const GlobalFontSettings = UnconnectedGlobalFontSettings(connector)
  const TimelineFontSettings = UnconnectedTimelineFontSettings(connector)
  const RCEFontSettings = UnconnectedRCEFontSettings(connector)

  const FontSettings = () => {
    const [selectedSetting, setSelectedSetting] = useState('global')

    const renderFontSettingsView = () => {
      switch (selectedSetting) {
        case 'global':
          return <GlobalFontSettings />
        case 'timeline':
          return <TimelineFontSettings />
        case 'rce':
          return <RCEFontSettings />
        default:
          return <Spinner />
      }
    }

    return (
      <>
        <div className="dashboard__options__item">
          <h4>{t('Font Settings')}</h4>
          <div className="font-setting__wrapper">
            <div className="font-setting__list">
              <ul className="list-group">
                <li
                  key="global"
                  className={cx('list-group-item', { selected: selectedSetting === 'global' })}
                  onClick={() => {
                    setSelectedSetting('global')
                  }}
                >
                  <div>{t('General')}</div>
                </li>
                <li
                  key="timeline"
                  className={cx('list-group-item', { selected: selectedSetting === 'timeline' })}
                  onClick={() => {
                    setSelectedSetting('timeline')
                  }}
                >
                  <div>{t('Timeline Fonts')}</div>
                </li>
                <li
                  key="rce"
                  className={cx('list-group-item', { selected: selectedSetting === 'rce' })}
                  onClick={() => {
                    setSelectedSetting('rce')
                  }}
                >
                  <div>{t('Text Editor')}</div>
                </li>
              </ul>
            </div>
            <div className="font-setting__details">
              <div className="panel-body">{renderFontSettingsView()}</div>
            </div>
          </div>
        </div>
      </>
    )
  }

  FontSettings.propTypes = {
    settings: PropTypes.object.isRequired,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      settings: selectors.appSettingsSelector(state),
    }))(FontSettings)
  }

  throw new Error('Could not connect FontSettings')
}

export default FontSettingsConnector
