import { connect } from 'react-redux'
import { PropTypes } from 'react-proptypes'
import { actions, selectors } from 'pltr/v2'

import { ErrorModal } from 'connected-components'

const switchErrorBody = (error) => {
  switch (error) {
    case 'permission-denied':
      return "You aren't allowed to do that!"
    default:
      return error
  }
}

const shouldDisplayError = (error, storeKey) => {
  switch (error) {
    case 'permission-denied':
      switch (storeKey) {
        case 'ui':
          return false
        default:
          return true
      }
    default:
      return true
  }
}

const Error = ({ error, clearError, storeKey }) => {
  if (!shouldDisplayError(error, storeKey)) return null

  const body = switchErrorBody(error)

  return error ? <ErrorModal message={body} onAcknowledge={clearError} /> : null
}

Error.propTypes = {
  clearError: PropTypes.func.isRequired,
  error: PropTypes.string,
  storeKey: PropTypes.string,
}

const {
  error: { clearError },
} = actions

export default connect(
  (state) => ({
    error: selectors.errorMessageSelector(state.present),
    storeKey: selectors.partOfStoreWhereErrorOccured(state.present),
  }),
  {
    clearError,
  }
)(Error)
