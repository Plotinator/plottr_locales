import React from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { selectors, actions } from 'pltr/v2'
import { SettingsWizard as OnboardingSettingsWizard } from 'connected-components'

const SettingsWizard = () => {
  return (
    <div id="dashboard__react__root">
      <OnboardingSettingsWizard />
    </div>
  )
}

SettingsWizard.propTypes = {}

export default connect((state) => ({}), {})(SettingsWizard)
