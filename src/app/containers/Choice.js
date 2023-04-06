import React from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import cx from 'classnames'

import { selectors, actions } from 'wired-up-pltr'
import { ChoiceView } from 'connected-components'

const reload = () => {}

const Choice = ({ darkMode, startProOnboardingFromRoot }) => {
  return (
    <div id="dashboard__react__root">
      <div className={cx('dashboard__main', { darkmode: darkMode })}>
        <div className="dashboard__account" style={{ width: '100vw' }}>
          <ChoiceView goToAccount={reload} startProOnboarding={startProOnboardingFromRoot} />
        </div>
      </div>
    </div>
  )
}

Choice.propTypes = {
  darkMode: PropTypes.bool,
  startProOnboardingFromRoot: PropTypes.func.isRequired,
}

export default connect((state) => ({ darkMode: selectors.isDarkModeSelector(state) }), {
  startProOnboardingFromRoot: actions.applicationState.startProOnboardingFromRoot,
})(Choice)
