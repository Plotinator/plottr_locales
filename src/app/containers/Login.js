import React from 'react'
import { PropTypes } from 'prop-types'

import { FirebaseLogin } from 'connected-components'

const Login = ({ darkMode }) => {
  return (
    <div className="login">
      <div className="login__main">
        <div className="login__left">
          <h1>Welcome to Plottr</h1>
          <FirebaseLogin />
        </div>
        <div className="login__right">
          <div className="login__logo">
            {darkMode ? (
              <img src="../icons/logo_dark_28_500.png" alt="Plottr Logo" width="358" height="500" />
            ) : (
              <img
                src="../icons/logo_light_28_500.png"
                alt="Plottr Logo"
                width="358"
                height="500"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

Login.propTypes = {
  darkMode: PropTypes.bool,
}

export default Login
