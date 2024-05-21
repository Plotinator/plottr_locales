import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { t } from 'plottr_locales'

import Button from '../../Button'
import { Spinner } from '../../Spinner'

import { checkDependencies } from '../../checkDependencies'

const ProLicenseExpiredConnector = (connector) => {
  const {
    platform: {
      openExternal,
      firebase: { logOut },
    },
  } = connector
  checkDependencies({ openExternal, logOut })

  const ProLicenseExpired = ({ hasActivePlottrLicense }) => {
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

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux
    return connect((state) => {
      return {
        hasActivePlottrLicense: selectors.hasActivePlottrLicenseSelector(state),
      }
    })(ProLicenseExpired)
  }

  throw new Error('Could not connect ProLicenseExpired')
}

export default ProLicenseExpiredConnector
