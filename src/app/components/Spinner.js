import React from 'react'

import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { selectors } from 'wired-up-pltr'
import { FullPageSpinner as Spinner } from 'plottr_components'

const FullPageSpinner = ({ isLoading }) => {
  if (!isLoading) return null

  return <Spinner />
}

FullPageSpinner.propTypes = {
  isLoading: PropTypes.bool,
}

const mapStateToProps = (state) => ({
  isLoading: selectors.applicationIsBusyAndUninterruptableSelector(state),
})

export default connect(mapStateToProps)(FullPageSpinner)
