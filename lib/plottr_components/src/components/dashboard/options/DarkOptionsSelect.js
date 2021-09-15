import React, { useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { t as i18n } from 'plottr_locales'

const DarkOptionsSelect = (connector) => {
  const {
    platform: { useSettingsInfo, setDarkMode },
  } = connector

  const DarkOptionsSelect = ({ darkModeIsOn, setDarkModeIsOn }) => {
    const [settings, _, saveSetting] = useSettingsInfo()

    useEffect(() => {
      if (settings.user.dark !== darkModeIsOn) {
        setDarkModeIsOn(settings.user.dark === 'dark')
      }
    }, [darkModeIsOn])

    const changeSetting = (ev) => {
      saveSetting('user.dark', ev.target.value)
      setDarkMode(ev.target.value)
    }

    return (
      <select value={settings.user.dark || 'system'} onChange={changeSetting}>
        <option value="system">{i18n('System')}</option>
        <option value="dark">{i18n('Dark')}</option>
        <option value="light">{i18n('Light')}</option>
      </select>
    )
  }

  DarkOptionsSelect.propTypes = {
    darkModeIsOn: PropTypes.bool,
    setDarkModeIsOn: PropTypes.func.isRequired,
  }

  const {
    pltr: { selectors, actions },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux

    return connect(
      (state) => ({
        darkModeIsOn: selectors.isDarkModeSelector(state.present),
      }),
      { setDarkModeIsOn: actions.ui.setDarkMode }
    )(DarkOptionsSelect)
  }

  throw new Error('Could not connect DarkOptionsSelect')
}

export default DarkOptionsSelect
