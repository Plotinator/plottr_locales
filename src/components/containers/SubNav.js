import React from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import cx from 'classnames'

import { selectors } from 'wired-up-pltr'

import Navbar from '../Navbar'

function SubNav({ darkMode, children }) {
  return (
    <Navbar fluid className={cx('subnav__container', { darkmode: darkMode })}>
      {children}
    </Navbar>
  )
}

SubNav.propTypes = {
  darkMode: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
}

const mapStateToProps = (state) => {
  return {
    darkMode: selectors.isDarkModeSelector(state),
  }
}

export default connect(mapStateToProps)(SubNav)
