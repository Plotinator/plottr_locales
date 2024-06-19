import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FaSignal } from '@react-icons/all-files/fa/FaSignal'

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

const mapStateToProps = (state) => ({
  isOffline: selectors.isOfflineSelector(state),
  shouldBeInPro: selectors.shouldBeInProSelector(state),
})

export default connect(mapStateToProps)(OfflineBanner)
