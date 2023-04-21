import React from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import { FaSignal } from 'react-icons/fa'

import { selectors } from 'wired-up-pltr'

import { t } from 'plottr_locales'

const OfflineBanner = ({ isOffline, shouldBeInPro }) => {
  return isOffline && shouldBeInPro ? (
    <div className="offline-mode-banner">
      {t('Offline')}
      <FaSignal />
    </div>
  ) : null
}

OfflineBanner.propTypes = {
  isOffline: PropTypes.bool,
  shouldBeInPro: PropTypes.bool,
}

export default connect((state) => ({
  isOffline: selectors.isOfflineSelector(state),
  shouldBeInPro: selectors.shouldBeInProSelector(state),
}))(OfflineBanner)
