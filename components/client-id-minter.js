import { useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'

import { actions, selectors } from 'pltr/v2'

import { sessionClientId, setSessionClientId } from '../lib/sessionClientId'

const ClientIdMinter = ({ clientId, setClientId }) => {
  useEffect(() => {
    if (!clientId) {
      const id = sessionClientId() || uuidv4()
      setSessionClientId(id)
      setClientId(id)
    }
  }, [setClientId])

  return null
}

ClientIdMinter.propTypes = {
  clientId: PropTypes.string,
  setClientId: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    clientId: selectors.clientIdSelector(state.present),
  }),
  { setClientId: actions.client.setClientId }
)(ClientIdMinter)
