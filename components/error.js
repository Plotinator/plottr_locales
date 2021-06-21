import { connect } from 'react-redux'
import { PropTypes } from 'react-proptypes'
import { actions, selectors } from 'pltr/v2'
import { Button, Alert } from 'react-bootstrap'

import { PlottrModal } from 'connected-components'

const modalStyles = {
  overlay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '390px',
    position: 'relative',
    left: 'auto',
    bottom: 'auto',
    right: 'auto',
    minHeight: '135px',
    maxHeight: '135px',
    overflow: 'hidden',
    padding: 0,
  },
}

const switchErrorTitle = (error) => {
  switch (error) {
    case 'permission-denied':
      return 'Permission Error'
    default:
      return 'Something went wrong'
  }
}

const switchErrorBody = (error) => {
  switch (error) {
    case 'permission-denied':
      return "You aren't allowed to do that!"
    default:
      return 'Try again or submit an error report'
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

  const title = switchErrorTitle(error)
  const body = switchErrorBody(error)

  return error ? (
    <PlottrModal isOpen={true} onRequestClose={() => {}} style={modalStyles}>
      <Alert bsStyle="danger" onDismiss={clearError}>
        <h4>{title}</h4>
        <p>{body}</p>
        <p>
          <Button
            bsStyle="danger"
            onClick={() => {
              // TODO: dismiss all
            }}
          >
            Dismiss All Errors Like This
          </Button>
          <span> or </span>
          <Button onClick={clearError}>Hide Alert</Button>
        </p>
      </Alert>
    </PlottrModal>
  ) : null
}

Error.propTypes = {
  error: PropTypes.string.isRequired,
  clearError: PropTypes.func.isRequired,
  storeKey: PropTypes.string.isRequired,
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
