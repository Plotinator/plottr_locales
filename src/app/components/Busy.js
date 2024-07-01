import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from 'wired-up-pltr'

const Busy = () => {
  // We've decided to disable this component until further notice.
  return null
}

Busy.propTypes = {
  applicationIsBusyAndCannotBeQuit: PropTypes.bool,
}

const mapStateToProps = (state) => {
  return {
    applicationIsBusyAndCannotBeQuit: selectors.busyWithWorkThatPreventsQuittingSelector(state),
  }
}

export default connect(mapStateToProps)(Busy)
