import React from 'react'
import { connect } from 'react-redux'

import { SettingsWizard as OnboardingSettingsWizard } from 'plottr_components'

const SettingsWizard = () => {
  return (
    <div id="dashboard__react__root">
      <OnboardingSettingsWizard />
    </div>
  )
}

SettingsWizard.propTypes = {}

export default connect((state) => ({}), {})(SettingsWizard)
