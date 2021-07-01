import { useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'

import { actions } from 'pltr/v2'

const ClientIdMinter = ({ setClientId }) => {
  useEffect(() => {
    setClientId(uuidv4())
  }, [setClientId])

  return null
}

ClientIdMinter.propTypes = {
  setClientId: PropTypes.func.isRequired,
}

export default connect(null, { setClientId: actions.client.setClientId })(ClientIdMinter)
