import React from 'react'

import { t } from 'plottr_locales'

import { checkDependencies } from '../../checkDependencies'

const ProLicenseExpiredConnector = (connector) => {
  const {
    platform: { openExternal },
  } = connector
  checkDependencies({ openExternal })

  const ProLicenseExpired = () => {
    const buy = () => {
      openExternal('https://plottr.com/pricing/')
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
          </div>
          <p>{t('Please contact us with any questions at support@plottr.com')}</p>
        </div>
      </div>
    )
  }

  ProLicenseExpired.propTypes = {}

  const { redux } = connector

  if (redux) {
    const { connect } = redux
    return connect()(ProLicenseExpired)
  }

  throw new Error('Could not connect ProLicenseExpired')
}

export default ProLicenseExpiredConnector
