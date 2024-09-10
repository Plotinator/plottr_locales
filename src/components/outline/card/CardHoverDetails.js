import React from 'react'
import PropTypes from 'prop-types'

import { t as i18n } from 'plottr_locales'
import { selectors, actions } from 'wired-up-pltr'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

const CardHoverDetails = ({ hoverDetails }) => {
  const { beatTitle, cardTitle, lineTitle } = hoverDetails
  return (
    <div className="outline__fulltext__title-container">
      <div className="title-rows">
        <strong>{i18n('Chapter:')}</strong>
        <p>{beatTitle}</p>
      </div>
      <div className="title-rows">
        <strong>{i18n('Plotline:')}</strong>
        <p>{lineTitle}</p>
      </div>
      <div className="title-rows">
        <strong>{i18n('Card Title:')}</strong>
        <p>{cardTitle}</p>
      </div>
    </div>
  )
}

CardHoverDetails.propTypes = {
  hoverDetails: PropTypes.object,
  visible: PropTypes.bool,
}

const UIActions = actions.ui

const mapStateToProps = (state) => {
  return {
    hoverDetails: selectors.outlineFulltextHoverDetailsSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    uiActions: bindActionCreators(UIActions, dispatch),
  }
})(CardHoverDetails)
