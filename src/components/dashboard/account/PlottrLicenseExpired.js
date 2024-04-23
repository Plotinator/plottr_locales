import React, { useState } from 'react'
import { PropTypes } from 'prop-types'
import cx from 'classnames'

import { t } from 'plottr_locales'
import Button from '../../Button'
import { Spinner } from '../../Spinner'
import { checkDependencies } from '../../checkDependencies'

const PlottrLicenseExpiredConnector = (connector) => {
  const {
    platform: {
      openExternal,
      firebase: { logOut },
      settings: { saveAppSetting },
      machineInfo,
      deleteMachineLicenseActivation,
    },
  } = connector
  checkDependencies({
    openExternal,
    logOut,
    saveAppSetting,
    machineInfo,
    deleteMachineLicenseActivation,
  })

  const PlottrLicenseExpired = ({ darkMode }) => {
    const [loggingOut, setLoggingOut] = useState(false)

    const buy = () => {
      openExternal('https://plottr.com/pricing/')
    }

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

    return (
      <div id="dashboard__react__root">
        <div className={cx('dashboard__main', { darkmode: darkMode })}>
          <div className="dashboard__account" style={{ width: '100vw' }}>
            <div className="plottr-license-expired__wrapper">
              <div className="text-center">
                <h1 className="expired">{t('Your Plottr subscription has expired')}</h1>
                <div className="expired__chooser" style={{ marginBottom: '20px' }}>
                  <div className="expired__choice" onClick={buy}>
                    <h2>{t('I want to renew my subscription!')}</h2>
                  </div>
                </div>
                <Button bsStyle="danger" bsSize="small" onClick={handleLogOut}>
                  {t('Log Out')} {loggingOut ? <Spinner /> : null}
                </Button>
                <p>{t('Please contact us with any questions at support@plottr.com')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  PlottrLicenseExpired.propTypes = {
    darkMode: PropTypes.bool,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({ darkMode: selectors.isDarkModeSelector(state) }))(
      PlottrLicenseExpired
    )
  }

  throw new Error('Could not connect PlottrLicenseExpired')
}

export default PlottrLicenseExpiredConnector
