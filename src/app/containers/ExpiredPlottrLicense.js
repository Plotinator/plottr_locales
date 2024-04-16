import React from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import cx from 'classnames'

import { selectors } from 'wired-up-pltr'
import { ExpiredView } from 'connected-components'

const ExpiredPlottrLicense = ({ darkMode }) => {
  return (
    <div id="dashboard__react__root">
      <div className={cx('dashboard__main', { darkmode: darkMode })}>
        <h1>TODO: Plottr License Expired</h1>
        <div className="dashboard__account" style={{ width: '100vw' }}>
          <ExpiredView />
        </div>
      </div>
    </div>
  )
}

ExpiredPlottrLicense.propTypes = {
  darkMode: PropTypes.bool,
}

export default connect((state) => ({ darkMode: selectors.isDarkModeSelector(state) }))(
  ExpiredPlottrLicense
)
