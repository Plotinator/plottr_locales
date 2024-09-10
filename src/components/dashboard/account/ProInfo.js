import React, { useState, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'

import { selectors, actions } from 'wired-up-pltr'
import { t } from 'plottr_locales'

import Button from '../../Button'
import { Spinner } from '../../Spinner'
import { PlottrComponentsContext } from '../../../connections/pltrContext'

const ProInfo = ({ emailAddress, expiration, settings, setUserId, setEmailAddress }) => {
  const {
    platform: {
      firebase: { logOut },
      license: { deleteProLicense },
      settings: { saveAppSetting },
    },
  } = useContext(PlottrComponentsContext)

  const [loggingOut, setLoggingOut] = useState(false)

  const expiresDate = () => {
    if (expiration === null) {
      return t('Never')
    } else if (!expiration) {
      return null
    } else {
      return t('{date, date, long}', { date: new Date(expiration) })
    }
  }

  const handleLogOut = () => {
    setLoggingOut(true)
    logOut().then(() => {
      // the order of these might matter
      saveAppSetting('user.frbId', null)
      deleteProLicense()
      setLoggingOut(false)
      // Ordering is significant!  If you set has pro to false
      // before nuking the email address and user id then it might
      // re-launch the check for whether we have pro or not.
      setUserId(null)
      setEmailAddress(null)
    })
  }

  const blurClass = settings.user.streamFriendly ? 'blurred' : ''

  return (
    <div className="dashboard__user-info">
      <h2>{t('Pro Subscription')}</h2>
      <hr />
      <div className="dashboard__user-info__wrapper">
        <dl className="dl-horizontal">
          <dt>{t('Purchase Email')}</dt>
          <dd className={blurClass}>{emailAddress}</dd>
        </dl>
        <dl className="dl-horizontal">
          <dt>{t('Expires')}</dt>
          <dd>{expiresDate()}</dd>
        </dl>
      </div>
      <div className="text-right">
        <Button bsStyle="danger" bsSize="small" onClick={handleLogOut}>
          {t('Log Out')} {loggingOut ? <Spinner /> : null}
        </Button>
      </div>
    </div>
  )
}

ProInfo.propTypes = {
  emailAddress: PropTypes.string,
  settings: PropTypes.object,
  expiration: PropTypes.object,
  setUserId: PropTypes.func.isRequired,
  setEmailAddress: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  emailAddress: selectors.emailAddressSelector(state),
  settings: selectors.appSettingsSelector(state),
  expiration: selectors.proLicenseExpirySelector(state),
})

export default connect(mapStateToProps, {
  setUserId: actions.client.setUserId,
  setEmailAddress: actions.client.setEmailAddress,
})(ProInfo)
