import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { t as i18n } from 'plottr_locales'

import { selectors } from 'wired-up-pltr'

import { PlottrComponentsContext } from '../../../connections/pltrContext'

const DarkOptionsSelect = ({ settings }) => {
  const {
    platform: {
      setDarkMode,
      settings: { saveAppSetting },
    },
  } = useContext(PlottrComponentsContext)

  const changeSetting = (ev) => {
    switch (ev.target.value) {
      case 'system': {
        saveAppSetting('user.themeSource', 'system')
        break
      }
      case 'light': {
        saveAppSetting('user.themeSource', 'manual')
        saveAppSetting('user.dark', 'light')
        break
      }
      case 'dark': {
        saveAppSetting('user.themeSource', 'manual')
        saveAppSetting('user.dark', 'dark')
        break
      }
    }
    // This, if present, talks to the external world to let it know
    // about the change.
    setDarkMode(ev.target.value)
  }

  const themeSource = settings.user.themeSource
  const selectedValue = settings.user.dark || 'system'

  return (
    <select value={themeSource === 'system' ? 'system' : selectedValue} onChange={changeSetting}>
      <option value="system">{i18n('System')}</option>
      <option value="dark">{i18n('Dark')}</option>
      <option value="light">{i18n('Light')}</option>
    </select>
  )
}

DarkOptionsSelect.propTypes = {
  settings: PropTypes.object.isRequired,
}

const mapStateToProps = (state) => ({
  settings: selectors.appSettingsSelector(state),
})

export default connect(mapStateToProps)(DarkOptionsSelect)
