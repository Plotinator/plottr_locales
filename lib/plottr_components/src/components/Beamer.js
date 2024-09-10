import React, { useEffect, useState, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import cx from 'classnames'
import { FaRegBell } from '@react-icons/all-files/fa/FaRegBell'

import { selectors } from 'wired-up-pltr'

import Button from './Button'
import { PlottrComponentsContext } from '../connections/pltrContext'

function Beamer({ inNavigation, user }) {
  const {
    platform: { openExternal, isWindows },
  } = useContext(PlottrComponentsContext)

  const [isInitialized, setInitialized] = useState(false)

  const paymentId = user.payment_id
  const customerEmail = user.customer_email

  const getBeamerAlerts = (_num) => {}

  const openBeamerLink = (url, _newWindow) => {
    openExternal(url)
    return false
  }

  const initBeamer = () => {
    // if (isDevelopment) return true
    // @ts-ignore
    if (!window.Beamer) return false

    const options = { callback: getBeamerAlerts, onclick: openBeamerLink }
    if (paymentId) {
      options.user_email = customerEmail
      options.user_id = paymentId
    }
    // @ts-ignore
    window.Beamer.update(options)
    // @ts-ignore
    window.Beamer.init()
    setInitialized(true)
    return true
  }

  useEffect(() => {
    if (!initBeamer()) {
      setTimeout(() => initBeamer(), 5000)
    }
  }, [])

  if (!isInitialized) return null

  const bell = (
    <Button bsSize="small" className="project-nav__beamer-button" id="beamer-bell" href="#">
      <FaRegBell />
    </Button>
  )

  if (inNavigation) {
    return bell
  } else {
    return <div className={cx('beamer-wrapper', { win32: isWindows() })}>{bell}</div>
  }
}

Beamer.propTypes = {
  inNavigation: PropTypes.bool,
  user: PropTypes.object.isRequired,
}

const mapStateToProps = (state) => {
  return {
    user: selectors.userSettingsSelector(state),
  }
}

export default connect(mapStateToProps)(Beamer)
