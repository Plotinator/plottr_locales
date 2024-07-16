import React from 'react'
import PropTypes from 'react-proptypes'
import { isEqual } from 'lodash'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { t } from 'plottr_locales'
import { selectors, actions } from 'wired-up-pltr'

import Form from '../Form'
import Col from '../Col'
import ControlLabel from '../ControlLabel'
import FormGroup from '../FormGroup'
import TextFormControl from '../TextFormControl'

const EditSeries = ({ actions, name, premise, genre, theme, focus, foci }) => {
  const selectionFor = (name) => {
    return foci?.find(({ path }) => {
      return isEqual(path, [name])
    })?.selection
  }

  const renderBody = () => {
    return (
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={1}>
            {t('Name')}
          </Col>
          <Col sm={4}>
            <TextFormControl
              id={'series-name'}
              value={name}
              onChange={actions.setSeriesName}
              autoFocus={focus && focus.path[0] === 'name'}
              selection={selectionFor('name')}
            />
          </Col>
          <Col componentClass={ControlLabel} sm={1}>
            {t('Premise')}
          </Col>
          <Col sm={4}>
            <TextFormControl
              id={'series-premise'}
              value={premise}
              onChange={actions.setSeriesPremise}
              autoFocus={focus && focus.path[0] === 'premise'}
              selection={selectionFor('premise')}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={1}>
            {t('Genre')}
          </Col>
          <Col sm={4}>
            <TextFormControl
              id={'series-genre'}
              value={genre}
              onChange={actions.setSeriesGenre}
              autoFocus={focus && focus.path[0] === 'genre'}
              selection={selectionFor('genre')}
            />
          </Col>
          <Col componentClass={ControlLabel} sm={1}>
            {t('Theme')}
          </Col>
          <Col sm={4}>
            <TextFormControl
              id={'series-theme'}
              value={theme}
              onChange={actions.setSeriesTheme}
              autoFocus={focus && focus.path[0] === 'theme'}
              selection={selectionFor('theme')}
            />
          </Col>
        </FormGroup>
      </Form>
    )
  }

  return (
    <div className="edit-book__container">
      <h2>{t('Series')}</h2>
      {renderBody()}
    </div>
  )
}

EditSeries.propTypes = {
  name: PropTypes.string.isRequired,
  premise: PropTypes.string.isRequired,
  genre: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
  focus: PropTypes.object,
  foci: PropTypes.array,
  actions: PropTypes.object.isRequired,
}

const mapStateToProps = (state) => {
  return {
    name: selectors.seriesNameSelector(state),
    premise: selectors.seriesPremiseSelector(state),
    genre: selectors.seriesGenreSelector(state),
    theme: selectors.seriesThemeSelector(state),
    focus: selectors.projectCurrentFocusSelector(state),
    foci: selectors.projectAllFociSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    actions: bindActionCreators(actions.series, dispatch),
  }
})(EditSeries)
