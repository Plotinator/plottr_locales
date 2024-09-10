import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { t } from 'plottr_locales'
import { selectors, actions } from 'wired-up-pltr'

import Button from './Button'
import { PlottrComponentsContext } from '../connections/pltrContext'

const FirebaseLogin = ({ startLoggingIn, loggingIn }) => {
  const {
    platform: {
      login: { launchLoginPopup },
      firebase: { logOut },
    },
  } = useContext(PlottrComponentsContext)

  const handleLogin = () => {
    logOut().then(() => {
      startLoggingIn()
      launchLoginPopup()
    })
  }

  return (
    <div>
      <Button onClick={handleLogin} disabled={loggingIn} bsStyle="success">
        {t('Click here to log in')}
      </Button>
    </div>
  )
}

FirebaseLogin.propTypes = {
  loggingIn: PropTypes.bool,
  startLoggingIn: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  loggingIn: selectors.isLoggingInSelector(state),
})

export default connect(mapStateToProps, {
  startLoggingIn: actions.applicationState.startLoggingIn,
})(FirebaseLogin)
