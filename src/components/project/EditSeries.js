import React from 'react'
import PropTypes from 'react-proptypes'
import { isEqual } from 'lodash'

import { t } from 'plottr_locales'

import Form from '../Form'
import Col from '../Col'
import ControlLabel from '../ControlLabel'
import FormGroup from '../FormGroup'
import UnconnectedTextFormControl from '../TextFormControl'
import { checkDependencies } from '../checkDependencies'

const EditSeriesConnector = (connector) => {
  const TextFormControl = UnconnectedTextFormControl(connector)

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
                type="text"
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
                type="text"
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
                type="text"
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
                type="text"
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

  const {
    redux,
    pltr: { actions, selectors },
  } = connector
  const SeriesActions = actions.series
  checkDependencies({ redux, actions, SeriesActions, selectors })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          name: selectors.seriesNameSelector(state),
          premise: selectors.seriesPremiseSelector(state),
          genre: selectors.seriesGenreSelector(state),
          theme: selectors.seriesThemeSelector(state),
          focus: selectors.projectCurrentFocusSelector(state),
          foci: selectors.projectAllFociSelector(state),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(SeriesActions, dispatch),
        }
      }
    )(EditSeries)
  }

  throw new Error('Could not connect EditSeries')
}

export default EditSeriesConnector
