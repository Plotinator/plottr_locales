import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import cx from 'classnames'

import { t } from 'plottr_locales'
import { selectors } from 'wired-up-pltr'

const PleaseConnectToTheInternet = ({ darkMode }) => {
  return (
    <div id="dashboard__react__root">
      <div className={cx('dashboard__main', { darkmode: darkMode })}>
        <div className="dashboard__account" style={{ width: '100vw' }}>
          <div className="please-connect-to-the-internet__wrapper">
            <div className="text-center">
              <h1 className="expired">{t('Please connect to the Internet')}</h1>
              <h2>{t("Don't worry.  We only need you to do this once in a while.")}</h2>
              <p>{t('Please contact us with any questions at support@plottr.com')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

PleaseConnectToTheInternet.propTypes = {
  darkMode: PropTypes.bool,
}

const mapStateToProps = (state) => ({ darkMode: selectors.isDarkModeSelector(state) })

export default connect(mapStateToProps)(PleaseConnectToTheInternet)
