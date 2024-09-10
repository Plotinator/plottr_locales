import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { HiMagnifyingGlassMinus } from '@react-icons/all-files/hi2/HiMagnifyingGlassMinus'
import { HiMagnifyingGlassPlus } from '@react-icons/all-files/hi2/HiMagnifyingGlassPlus'

import { selectors, actions } from 'wired-up-pltr'

const FulltextZoom = ({ fulltextZoom, uiActions }) => {
  const handleReduceZoom = () => {
    if (fulltextZoom <= 0.5) {
      return false
    }
    uiActions.reduceOutlineFulltextZoom()
  }

  const handleAddZoom = () => {
    if (fulltextZoom >= 1.75) {
      return false
    }
    uiActions.addOutlineFulltextZoom()
  }

  return (
    <div className="outline__fulltext__zoom-wrapper">
      <HiMagnifyingGlassMinus
        onClick={handleReduceZoom}
        className={fulltextZoom === 0.5 ? 'disabled' : ''}
      />
      <span>{fulltextZoom * 100}%</span>
      <HiMagnifyingGlassPlus
        onClick={handleAddZoom}
        className={fulltextZoom === 1.75 ? 'disabled' : ''}
      />
    </div>
  )
}

FulltextZoom.propTypes = {
  fulltextZoom: PropTypes.number,
  uiActions: PropTypes.object,
}

const UIActions = actions.ui

const mapStateToProps = (state) => {
  return {
    fulltextZoom: selectors.outlineFulltextZoomSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    uiActions: bindActionCreators(UIActions, dispatch),
  }
})(FulltextZoom)
