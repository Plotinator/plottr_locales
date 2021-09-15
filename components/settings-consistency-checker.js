import { useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { actions, selectors } from 'pltr/v2'

import { useSettingsInfo } from '../lib/store_hooks'

export const SettingsConsistencyChecker = ({ darkModeIsOn, setDarkModeIsOn }) => {
  const [settings] = useSettingsInfo()

  useEffect(() => {
    if (settings.user.dark !== darkModeIsOn) {
      setDarkModeIsOn(settings.user.dark === 'dark')
    }
  }, [darkModeIsOn])

  return null
}

SettingsConsistencyChecker.propTypes = {
  darkModeIsOn: PropTypes.bool,
  setDarkModeIsOn: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    darkModeIsOn: selectors.isDarkModeSelector(state.present),
  }),
  { setDarkModeIsOn: actions.ui.setDarkMode }
)(SettingsConsistencyChecker)
