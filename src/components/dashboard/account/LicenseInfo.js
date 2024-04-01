import React, { useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'

import { checkDependencies } from '../../checkDependencies'

const LicenseInfoConnector = (connector) => {
  const {
    platform: { machineId, os },
  } = connector
  checkDependencies({ machineId, os })

  const LicenseInfo = ({ customerEmail, settings }) => {
    const [deviceId, setDeviceId] = useState(null)

    useEffect(() => {
      if (!deviceId) {
        machineId().then((id) => {
          setDeviceId(id)
        })
      }
    }, [deviceId, setDeviceId])

    const usableDeviceID = os == 'unknown' ? t('Browser') : deviceId

    const blurClass = settings.user.streamFriendly ? 'blurred' : ''

    return (
      <div className="dashboard__user-info">
        <div className="dashboard__user-info license-info__label">
          <h2>{t('License Information')}</h2>
        </div>
        <hr />
        <div className="dashboard__user-info__wrapper">
          <dl className="dl-horizontal">
            <dt>{t('Purchase Email')}</dt>
            <dd className={blurClass}>{customerEmail}</dd>
            <dt>{t('Device ID')}</dt>
            <dd className={blurClass}>{usableDeviceID}</dd>
          </dl>
        </div>
      </div>
    )
  }

  LicenseInfo.propTypes = {
    customerEmail: PropTypes.string,
    settings: PropTypes.object,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux
    return connect((state) => ({
      customerEmail: selectors.emailAddressSelector(state),
      settings: selectors.appSettingsSelector(state),
    }))(LicenseInfo)
  }

  return LicenseInfo
}

export default LicenseInfoConnector
