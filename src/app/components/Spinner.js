import React from 'react'

import { connect } from 'react-redux'
import { PropTypes } from 'prop-types'

import { selectors } from 'wired-up-pltr'
import { FullPageSpinner as Spinner } from 'connected-components'

const FullPageSpinner = ({ isLoading }) => {
  if (!isLoading) return null

  return <Spinner />
}

FullPageSpinner.propTypes = {
  isLoading: PropTypes.bool,
}

export default connect((state) => ({
  isLoading: selectors.applicationIsBusyAndUninterruptableSelector(state),
}))(FullPageSpinner)
