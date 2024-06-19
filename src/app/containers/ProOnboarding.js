import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors, actions } from 'wired-up-pltr'
import { ProOnboarding as ProOnboardingWizard } from 'plottr_components'

const ProOnboarding = ({ isOnboarding, finishProOnboarding }) => {
  return (
    <div id="dashboard__react__root">
      <ProOnboardingWizard cancel={finishProOnboarding} />
    </div>
  )
}

ProOnboarding.propTypes = {
  isOnboarding: PropTypes.bool,
  finishProOnboarding: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  isOnboarding: selectors.isOnboardingToProFromRootSelector(state),
})

export default connect(mapStateToProps, {
  finishProOnboarding: actions.applicationState.finishProOnboarding,
})(ProOnboarding)
