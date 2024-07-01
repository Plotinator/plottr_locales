import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { actions } from 'wired-up-pltr'
import { ProOnboarding as ProOnboardingWizard } from 'plottr_components'

const ProOnboarding = ({ finishProOnboarding }) => {
  return (
    <div id="dashboard__react__root">
      <ProOnboardingWizard cancel={finishProOnboarding} />
    </div>
  )
}

ProOnboarding.propTypes = {
  finishProOnboarding: PropTypes.func.isRequired,
}

const mapStateToProps = () => ({})

export default connect(mapStateToProps, {
  finishProOnboarding: actions.applicationState.finishProOnboarding,
})(ProOnboarding)
