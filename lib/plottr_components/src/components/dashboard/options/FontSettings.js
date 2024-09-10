import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import cx from 'classnames'

import { selectors } from 'wired-up-pltr'
import { t } from 'plottr_locales'

import GlobalFontSettings from './GlobalFontSettings'
import RCEFontSettings from './RCEFontSettings'
import TimelineFontSettings from './TimelineFontSettings'
import { Spinner } from '../../Spinner'

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

const mapStateToProps = (state) => ({
  settings: selectors.appSettingsSelector(state),
})

export default connect(mapStateToProps)(FontSettings)
