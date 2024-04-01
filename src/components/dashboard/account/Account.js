import React from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'

import Button from '../../Button'
import UnconnectedAbout from './About'
import UnconnectedExpiredView from './ExpiredView'
import UnconnectedLicenseInfo from './LicenseInfo'
import UnconnectedProInfo from './ProInfo'
import UnconnectedTrialInfo from './TrialInfo'
import { checkDependencies } from '../../checkDependencies'

const AccountConnector = (connector) => {
  const {
    platform: {
      license: { deleteLicense },
      openExternal,
      os,
      mpq,
    },
  } = connector
  checkDependencies({ openExternal, os, mpq })

  const About = UnconnectedAbout(connector)
  const TrialInfo = UnconnectedTrialInfo(connector)
  const ExpiredView = UnconnectedExpiredView(connector)
  const LicenseInfo = UnconnectedLicenseInfo(connector)
  const ProInfo = UnconnectedProInfo(connector)

  const Account = ({
    startProOnboarding,
    isInProMode,
    hasLicense,
    isInTrialMode,
    isInTrialModeWithExpiredTrial,
  }) => {
    const hideProButton = os() == 'unknown' || isInProMode

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
              <Button onClick={startProOnboarding}>{t('Start Plottr Pro')} 🎉</Button>
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

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux
    return connect((state) => ({
      isInProMode: selectors.isLoggedIntoProWithActiveLicenseSelector(state),
      hasLicense: selectors.hasAnActiveLicenseSelector(state),
      isInTrialMode: selectors.isInTrialModeSelector(state),
      isInTrialModeWithExpiredTrial: selectors.isInTrialModeWithExpiredTrialSelector(state),
    }))(Account)
  }

  throw new Error('Could not connect Account')
}

export default AccountConnector
