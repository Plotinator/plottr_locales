import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { t as i18n } from 'plottr_locales'
import { selectors, actions } from 'wired-up-pltr'

import Button from '../Button'
import Switch from '../Switch'
import ButtonGroup from '../ButtonGroup'
import Glyphicon from '../Glyphicon'

const OutlinePageLayoutConfig = ({
  showPageLayoutConfig,
  uiActions,
  showFulltextCardTitle,
  showFulltextBeatTitle,
  showOutlineFulltextBeatGaps,
  fulltextCardTitleAlignment,
  fulltextBeatTitleAlignment,
  light,
}) => {
  const handleClosePageLayoutConfig = (evt) => {
    evt.preventDefault()
    if (showPageLayoutConfig) {
      uiActions.closeFulltextLayoutConfig()
    }
  }

  const handleToggleShowCardTitle = () => {
    uiActions.showFulltextCardTitle(!showFulltextCardTitle)
  }

  const handleToggleShowBeatTitle = () => {
    uiActions.showFulltextBeatTitle(!showFulltextBeatTitle)
  }

  const handleChangeBeatAlignment = (alignment) => {
    if (fulltextBeatTitleAlignment !== alignment) {
      uiActions.setFulltextBeatTitleAlignment(alignment)
    }
  }

  const handleChangeCardAlignment = (alignment) => {
    if (fulltextCardTitleAlignment !== alignment) {
      uiActions.setFulltextCardTitleAlignment(alignment)
    }
  }

  const handleToggleShowBeatGaps = () => {
    uiActions.toggleFulltextShowBeatGaps(!showOutlineFulltextBeatGaps)
  }

  const handleChangePlotlineLight = (evt) => {
    uiActions.setFulltextLighterPlotlinePageColor(evt.target.value)
  }

  return (
    <div className="outline__fulltext__config-container">
      <p>{i18n('Show Title')}</p>
      <div className="title-rows">
        <Switch
          isOn={showFulltextBeatTitle}
          labelText={i18n('Chapter')}
          handleToggle={handleToggleShowBeatTitle}
        />
      </div>
      <div className="title-rows">
        <Switch
          isOn={showFulltextCardTitle}
          labelText={i18n('Card')}
          handleToggle={handleToggleShowCardTitle}
        />
      </div>
      <hr />
      {showFulltextBeatTitle || showFulltextBeatTitle ? (
        <div>
          <p>{i18n('Title Alignment')}</p>
          {showFulltextBeatTitle ? (
            <div className="title-rows">
              <label>{i18n('Chapter')}</label>
              <ButtonGroup>
                <Button
                  active={fulltextBeatTitleAlignment === 'left' || !fulltextBeatTitleAlignment}
                  bsSize="small"
                  onClick={() => handleChangeBeatAlignment('left')}
                >
                  <Glyphicon glyph="align-left" />
                </Button>
                <Button
                  active={fulltextBeatTitleAlignment === 'center'}
                  bsSize="small"
                  onClick={() => handleChangeBeatAlignment('center')}
                >
                  <Glyphicon glyph="align-center" />
                </Button>
              </ButtonGroup>
            </div>
          ) : null}
          {showFulltextCardTitle ? (
            <div className="title-rows">
              <label>{i18n('Card')}</label>
              <ButtonGroup>
                <Button
                  bsSize="small"
                  active={fulltextCardTitleAlignment === 'left' || !fulltextCardTitleAlignment}
                  onClick={() => handleChangeCardAlignment('left')}
                >
                  <Glyphicon glyph="align-left" />
                </Button>
                <Button
                  bsSize="small"
                  active={fulltextCardTitleAlignment === 'center'}
                  onClick={() => handleChangeCardAlignment('center')}
                >
                  <Glyphicon glyph="align-center" />
                </Button>
              </ButtonGroup>
            </div>
          ) : null}
          <hr />
        </div>
      ) : null}
      <p>{i18n('Layout')}</p>
      <div className="title-rows">
        <Switch
          isOn={showOutlineFulltextBeatGaps}
          labelText={i18n('Show chapter gaps')}
          handleToggle={handleToggleShowBeatGaps}
        />
      </div>
      <div className="title-rows range">
        <p>{'Plotline Page Color'}</p>
        <div>
          <input
            min="1"
            max="4"
            type="range"
            step="1"
            list="values"
            value={light}
            onChange={handleChangePlotlineLight}
            id="plotline-range"
          />
          <datalist id="values">
            <option value="1">{'1'}</option>
            <option value="2">{'2'}</option>
            <option value="3">{'3'}</option>
            <option value="4">{'4'}</option>
          </datalist>
        </div>
      </div>
      <Button onClick={handleClosePageLayoutConfig}>{i18n('Close')}</Button>
    </div>
  )
}

OutlinePageLayoutConfig.propTypes = {
  showPageLayoutConfig: PropTypes.bool,
  uiActions: PropTypes.object.isRequired,
  showFulltextCardTitle: PropTypes.bool,
  showFulltextBeatTitle: PropTypes.bool,
  isOutlineFulltextCompact: PropTypes.bool,
  showOutlineFulltextBeatGaps: PropTypes.bool,
  fulltextBeatTitleAlignment: PropTypes.oneOf(['left', 'center']),
  fulltextCardTitleAlignment: PropTypes.oneOf(['left', 'center']),
  light: PropTypes.string,
}

const UIActions = actions.ui

const mapStateToProps = (state) => {
  return {
    outlineView: selectors.outlineViewSelector(state),
    showFulltextCardTitle: selectors.showOutlineFulltextCardTitleSelector(state),
    showFulltextBeatTitle: selectors.showOutlineFulltextBeatTitleSelector(state),
    showPageLayoutConfig: selectors.showFulltextPageLayoutConfigSelector(state),
    showOutlineFulltextBeatGaps: selectors.showOutlineFulltextBeatGapsSelector(state),
    fulltextBeatTitleAlignment: selectors.fulltextBeatTitleAlignmentSelector(state),
    fulltextCardTitleAlignment: selectors.fulltextCardTitleAlignmentSelector(state),
    light: selectors.outlineFulltextLightSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    uiActions: bindActionCreators(UIActions, dispatch),
  }
})(OutlinePageLayoutConfig)
