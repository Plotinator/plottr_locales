import React from 'react'
import PropTypes from 'prop-types'

const LoadingSplash = ({ loadingState, loadingProgress, darkMode }) => {
  return (
    <div id="temporary-inner">
      <div className="loading-splash">
        {darkMode ? (
          <img src="../icons/logo_dark_28_500.png" height="375" />
        ) : (
          <img src="../icons/logo_light_28_500.png" height="375" />
        )}
        {loadingState ? <h3>{loadingState}</h3> : null}
        {loadingProgress ? (
          <div className="loading-splash__progress">
            <div
              className="loading-splash__progress__bar"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

LoadingSplash.propTypes = {
  loadingState: PropTypes.string,
  loadingProgress: PropTypes.number,
  darkMode: PropTypes.bool,
}

export default LoadingSplash
