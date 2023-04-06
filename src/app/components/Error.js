import { useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { t } from 'plottr_locales'
import { selectors, actions } from 'wired-up-pltr'

const Error = ({ errorMessage, clearError, showErrorBox }) => {
  useEffect(() => {
    if (errorMessage) {
      showErrorBox(t('Error'), errorMessage)
      clearError()
    }
  }, [errorMessage, clearError])

  return null
}

Error.propTypes = {
  errorMessage: PropTypes.string,
  clearError: PropTypes.func.isRequired,
  showErrorBox: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    errorMessage: selectors.errorMessageSelector(state),
  }),
  {
    clearError: actions.error.clearError,
  }
)(Error)
