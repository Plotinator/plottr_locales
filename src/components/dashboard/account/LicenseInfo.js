import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'

import { selectors } from 'wired-up-pltr'
import { t } from 'plottr_locales'

import Button from '../../Button'
import { Spinner } from '../../Spinner'
import { PlottrComponentsContext } from '../../../connections/pltrContext'

const LicenseInfo = ({ customerEmail, settings, hasLicense, isInProMode, emailFromLastLogin }) => {
  const {
    platform: {
      machineId,
      os,
      firebase: { logOut },
      settings: { saveAppSetting },
      machineInfo,
      deleteMachineLicenseActivation,
    },
  } = useContext(PlottrComponentsContext)

  const [deviceId, setDeviceId] = useState(null)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogOut = () => {
    setLoggingOut(true)
    machineInfo().then((info) => {
      const { id, name, localUserName, os } = info
      return deleteMachineLicenseActivation(id, os, name, localUserName).then(() => {
        // the order of these might matter
        return saveAppSetting('user.frbId', null).then(() => {
          return logOut().then(() => {
            setLoggingOut(false)
          })
        })
      })
    })
  }

  useEffect(() => {
    if (!deviceId && !loggingOut) {
      machineId().then((id) => {
        // @ts-ignore
        setDeviceId(id)
      })
    }
  }, [deviceId, setDeviceId, loggingOut])

  const usableDeviceID = os() == 'unknown' ? t('Browser') : deviceId

  const blurClass = settings.user.streamFriendly ? 'blurred' : ''

  return (
    <div className="dashboard__user-info">
      <div className="dashboard__user-info license-info__label">
        <h2>{t('License Information')}</h2>
      </div>
      <hr />
      <div className="dashboard__user-info__wrapper">
        <dl className="dl-horizontal">
          {customerEmail || emailFromLastLogin ? (
            <>
              <dt>{t('Purchase Email')}</dt>
              <dd className={blurClass}>{customerEmail ?? emailFromLastLogin}</dd>
            </>
          ) : null}
          {usableDeviceID ? (
            <>
              <dt>{t('Device ID')}</dt>
              <dd className={blurClass}>{usableDeviceID}</dd>
            </>
          ) : null}
          {hasLicense && !isInProMode ? (
            <>
              <dt></dt>
              <dd>
                <Button bsStyle="danger" bsSize="small" onClick={handleLogOut}>
                  {t('Log Out')} {loggingOut ? <Spinner /> : null}
                </Button>
              </dd>
            </>
          ) : null}
        </dl>
      </div>
    </div>
  )
}

LicenseInfo.propTypes = {
  customerEmail: PropTypes.string,
  emailFromLastLogin: PropTypes.string,
  settings: PropTypes.object,
  hasLicense: PropTypes.bool,
  isInProMode: PropTypes.bool,
}

const mapStateToProps = (state) => ({
  customerEmail: selectors.emailAddressSelector(state),
  emailFromLastLogin: selectors.emailFromLastLoginSelector(state),
  settings: selectors.appSettingsSelector(state),
  hasLicense: selectors.hasActivePlottrLicenseSelector(state),
  isInProMode: selectors.isLoggedIntoProWithActiveLicenseSelector(state),
})

export default connect(mapStateToProps)(LicenseInfo)
