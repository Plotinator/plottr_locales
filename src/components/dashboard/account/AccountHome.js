import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'

import { selectors, actions } from 'wired-up-pltr'

import Account from './Account'
import ProOnboarding from './proOnboarding/index'
import ChoiceView from './ChoiceView'

const AccountHome = ({ isFirstTime, isOnboarding, startProOnboarding, finishProOnboarding }) => {
  const [view, setView] = useState(
    isOnboarding ? 'proOnboarding' : isFirstTime ? 'choice' : 'account'
  )

  const startOnboarding = () => {
    startProOnboarding()
    setView('proOnboarding')
  }

  const cancelOnboarding = () => {
    finishProOnboarding()
    setView('account')
  }

  let body
  switch (view) {
    case 'choice':
      body = (
        <ChoiceView goToAccount={() => setView('account')} startOnboarding={startProOnboarding} />
      )
      break
    case 'proOnboarding':
      body = <ProOnboarding cancel={cancelOnboarding} />
      break
    case 'account':
      body = <Account startProOnboarding={startOnboarding} />
      break
  }

  return <div className="dashboard__account">{body}</div>
}

AccountHome.propTypes = {
  isFirstTime: PropTypes.bool,
  isOnboarding: PropTypes.bool,
  startProOnboarding: PropTypes.func.isRequired,
  finishProOnboarding: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  isFirstTime: selectors.isFirstTimeSelector(state),
  isOnboarding: selectors.isOnboardingToProSelector(state),
})

export default connect(mapStateToProps, {
  startProOnboarding: actions.applicationState.startProOnboarding,
  finishProOnboarding: actions.applicationState.finishProOnboarding,
})(AccountHome)
