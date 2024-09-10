import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import { selectors, actions } from 'wired-up-pltr'
import { t as i18n } from 'plottr_locales'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

const ViewSwitcher = ({ uiActions, outlineView, darkMode }) => {
  const handleChangeOutlineView = (evt, val) => {
    evt.preventDefault()
    if (val !== outlineView) {
      uiActions.setOutlineView(val)
    }
  }

  return (
    <div className={cx('chevron__btn-group', { darkmode: darkMode })}>
      <button
        className={cx('chevron-btn', { active: outlineView === 'plan' || !outlineView })}
        onClick={(e) => handleChangeOutlineView(e, 'plan')}
      >
        {i18n('Plan')}
      </button>
      <button
        className={cx('chevron-btn', { active: outlineView === 'fulltext' })}
        onClick={(e) => handleChangeOutlineView(e, 'fulltext')}
      >
        {i18n('Fulltext')}
      </button>
    </div>
  )
}

ViewSwitcher.propTypes = {
  outlineView: PropTypes.string,
  uiActions: PropTypes.object,
  darkMode: PropTypes.bool,
}

const UIActions = actions.ui

const mapStateToProps = (state) => {
  return {
    outlineView: selectors.outlineViewSelector(state),
    darkMode: selectors.isDarkModeSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    uiActions: bindActionCreators(UIActions, dispatch),
  }
})(ViewSwitcher)
