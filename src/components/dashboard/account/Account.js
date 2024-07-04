import React, { useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'

import { selectors } from 'wired-up-pltr'
import { t } from 'plottr_locales'

import Button from '../../Button'
import About from './About'
import ExpiredView from './ExpiredView'
import LicenseInfo from './LicenseInfo'
import ProInfo from './ProInfo'
import TrialInfo from './TrialInfo'
import { PlottrComponentsContext } from '../../../connections/pltrContext'

const Account = ({
  startProOnboarding,
  isInProMode,
  hasLicense,
  isInTrialMode,
  isInTrialModeWithExpiredTrial,
}) => {
  const {
    platform: {
      license: { deleteLicense },
      os,
    },
  } = useContext(PlottrComponentsContext)

  const hideProButton = os() == 'unknown' || isInProMode
  const loginButtonText = isInTrialMode ? t('Log in') : t('Log into Plottr Pro')

  const _deleteLicense = () => {
    // mpq.push('btn_remove_license_confirm')
    return deleteLicense()
  }

  const AllAccountInfo = () => {
    if (isInTrialMode) return <TrialInfo />
    if (isInTrialModeWithExpiredTrial) return <ExpiredView />

    const body = []
    if (isInProMode) body.push(<ProInfo key="pro" />)

    if (hasLicense) {
      body.push(<LicenseInfo key="license" deleteLicense={_deleteLicense} />)
    }

    return <>{body}</>
  }

  return (
    <div className="dashboard__account__body">
      <div className="dashboard__acount__top">
        <h1>{t('Account')}</h1>
        {hideProButton ? null : (
          <div className="start_plottr_pro__button">
            <Button onClick={startProOnboarding}>{loginButtonText}</Button>
          </div>
        )}
      </div>
      <AllAccountInfo />
      <About />
    </div>
  )
}

Account.propTypes = {
  startProOnboarding: PropTypes.func,
  isInProMode: PropTypes.bool,
  hasLicense: PropTypes.bool,
  isInTrialMode: PropTypes.bool,
  isInTrialModeWithExpiredTrial: PropTypes.bool,
}

const mapStateToProps = (state) => ({
  isInProMode: selectors.isLoggedIntoProWithActiveLicenseSelector(state),
  hasLicense: selectors.hasActivePlottrLicenseSelector(state),
  isInTrialMode: selectors.isInTrialModeSelector(state),
  isInTrialModeWithExpiredTrial: selectors.isInTrialModeWithExpiredTrialSelector(state),
})

export default connect(mapStateToProps)(Account)
