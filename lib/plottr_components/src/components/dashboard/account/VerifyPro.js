import React from 'react'
import PropTypes from 'react-proptypes'

import OnboardingFlow from '../../onboarding/OnboardingFlow'
import ProStep1 from './proOnboarding/ProStep1'

const VerifyPro = ({ goBack, success }) => {
  return (
    <OnboardingFlow>
      <ProStep1 nextStep={success} cancel={goBack} />
    </OnboardingFlow>
  )
}

VerifyPro.propTypes = {
  goBack: PropTypes.func,
  success: PropTypes.func,
}

export default VerifyPro
