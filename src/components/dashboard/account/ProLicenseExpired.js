import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { t } from 'plottr_locales'
import { selectors } from 'wired-up-pltr'

import Button from '../../Button'
import { Spinner } from '../../Spinner'
import { PlottrComponentsContext } from '../../../connections/pltrContext'

const ProLicenseExpired = ({ hasActivePlottrLicense }) => {
  const {
    platform: {
      openExternal,
      firebase: { logOut },
    },
  } = useContext(PlottrComponentsContext)

  const [loggingOut, setLoggingOut] = useState(false)

  const buy = () => {
    openExternal('https://plottr.com/pricing/')
  }

  const handleLogOut = () => {
    setLoggingOut(true)
    logOut().then(() => {
      setLoggingOut(false)
    })
  }

  return (
    <div className="pro-license-expired__wrapper">
      <div className="text-center">
        <h1 className="expired">{t('Your Pro subscription has expired')}</h1>
        <p style={{ padding: '5px 70px' }}>
          {t("Don't worry, all your work is saved on the cloud")}
        </p>
        <div className="expired__chooser" style={{ marginBottom: '20px' }}>
          <div className="expired__choice" onClick={buy}>
            <h2>{t('I want to renew my subscription!')}</h2>
          </div>
          {hasActivePlottrLicense ? (
            <div className="expired__choice" onClick={logOut}>
              <h2>{t('Use Plottr License')}</h2>
            </div>
          ) : null}
        </div>
        <Button bsStyle="danger" bsSize="small" onClick={handleLogOut}>
          {t('Log Out')} {loggingOut ? <Spinner /> : null}
        </Button>
        <p>{t('Please contact us with any questions at support@plottr.com')}</p>
      </div>
    </div>
  )
}

ProLicenseExpired.propTypes = {
  hasActivePlottrLicense: PropTypes.bool,
}

const mapStateToProps = (state) => {
  return {
    hasActivePlottrLicense: selectors.hasActivePlottrLicenseSelector(state),
  }
}

export default connect(mapStateToProps)(ProLicenseExpired)
