import React from 'react'
import { connect } from 'react-redux'
import { PropTypes } from 'prop-types'
import cx from 'classnames'

import { t } from 'plottr_locales'
import { selectors } from 'wired-up-pltr'

import { makeMainProcessClient } from '../mainProcessClient'

const { openExternal } = makeMainProcessClient()

const ExpiredPlottrLicense = ({ darkMode }) => {
  const buy = () => {
    openExternal('https://plottr.com/pricing/')
  }

  return (
    <div id="dashboard__react__root">
      <div className={cx('dashboard__main', { darkmode: darkMode })}>
        <div className="dashboard__account" style={{ width: '100vw' }}>
          <div className="plottr-license-expired__wrapper">
            <div className="text-center">
              <h1 className="expired">{t('Your Plottr subscription has expired')}</h1>
              <div className="expired__chooser" style={{ marginBottom: '20px' }}>
                <div className="expired__choice" onClick={buy}>
                  <h2>{t('I want to renew my subscription!')}</h2>
                </div>
              </div>
              <p>{t('Please contact us with any questions at support@plottr.com')}</p>
            </div>
          </div>
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
