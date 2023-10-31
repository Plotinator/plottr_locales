import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { isEqual } from 'lodash'

import { t as i18n } from 'plottr_locales'
import { newIds } from 'pltr/v2'

import Form from '../Form'
import UnconnectedPlottrModal from '../PlottrModal'
import ButtonToolbar from '../ButtonToolbar'
import Col from '../Col'
import ControlLabel from '../ControlLabel'
import FormGroup from '../FormGroup'
import UnconnectedTextFormControl from '../TextFormControl'
import Button from '../Button'
import { checkDependencies } from '../checkDependencies'
import { withArgs } from '../withArgs'

const { objectId } = newIds

const modalStyles = {
  overlay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    borderRadius: 20,
    width: '600px',
    height: '352px',
    padding: '0px',
    overflow: 'hidden',
    position: 'relative',
    left: 'auto',
    bottom: 'auto',
    right: 'auto',
  },
}

const BookDialogConnector = (connector) => {
  const TextFormControl = UnconnectedTextFormControl(connector)
  const PlottrModal = UnconnectedPlottrModal(connector)

  const {
    platform: { inBrowser, browserHistory },
  } = connector
  class BookDialog extends Component {
    constructor(props) {
      super(props)
      this.titleRef = null
      this.premiseRef = null
      this.genreRef = null
      this.themeRef = null
    }

    selectionFor = (name) => {
      return this.props.foci?.find(({ path }) => {
        return isEqual(path, ['book', this.props.bookDialogBookId, name])
      })?.selection
    }

    saveEdit = (saveAndOpen) => {
      const { bookDialogBookId, books, actions } = this.props
      const currentBook = books[bookDialogBookId]

      let title = this.titleRef.value
      let premise = this.premiseRef.value
      let genre = this.genreRef.value
      let theme = this.themeRef.value
      const newBookId = objectId(books.allIds)

      if (!currentBook) {
        actions.addBook(title, premise, genre, theme)
      }
      this.handleCancel()

      if (saveAndOpen) {
        this.navigateToBook(currentBook?.id || newBookId)
      }
    }

    handleCancel = () => {
      this.props.uiActions.closeBookDialog()
    }

    navigateToBook = (bookId) => {
      this.props.uiActions.navigateToBookTimeline(bookId, inBrowser, browserHistory)
    }

    renderToolBar() {
      return (
        <ButtonToolbar>
          <Button onClick={this.handleCancel}>{i18n('Cancel')}</Button>
          <Button bsStyle="success" onClick={() => this.saveEdit()}>
            {i18n('Save')}
          </Button>
          <Button className="pull-right" bsStyle="success" onClick={() => this.saveEdit(true)}>
            {i18n('Save and Open')}
          </Button>
        </ButtonToolbar>
      )
    }

    handleDown = (event) => {
      if (event.key === 'Enter') this.saveEdit()
    }

    renderBody() {
      const { actions, books, bookNumber, bookDialogBookId, focus } = this.props
      const currentBook = books[bookDialogBookId]
      return (
        <Form horizontal onKeyPress={this.handleDown}>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>
              {i18n('Book #')}
            </Col>
            <Col sm={8}>
              <span className="lead">{bookNumber}</span>
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>
              {i18n('Title')}
            </Col>
            <Col sm={8}>
              <TextFormControl
                type="text"
                inputRef={(ref) => {
                  this.titleRef = ref
                }}
                value={currentBook?.title}
                onChange={withArgs(actions.setBookTitle, bookDialogBookId)}
                autoFocus={focus?.path[2] === 'title'}
                selection={this.selectionFor('title')}
              />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>
              {i18n('Premise')}
            </Col>
            <Col sm={8}>
              <TextFormControl
                type="text"
                inputRef={(ref) => {
                  this.premiseRef = ref
                }}
                onChange={withArgs(actions.setBookPremise, bookDialogBookId)}
                value={currentBook?.premise}
                autoFocus={focus?.path[2] === 'premise'}
                selection={this.selectionFor('premise')}
              />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>
              {i18n('Genre')}
            </Col>
            <Col sm={8}>
              <TextFormControl
                type="text"
                inputRef={(ref) => {
                  this.genreRef = ref
                }}
                value={currentBook?.genre}
                onChange={withArgs(actions.setBookGenre, bookDialogBookId)}
                autoFocus={focus?.path[2] === 'genre'}
                selection={this.selectionFor('genre')}
              />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>
              {i18n('Theme')}
            </Col>
            <Col sm={8}>
              <TextFormControl
                type="text"
                inputRef={(ref) => {
                  this.themeRef = ref
                }}
                value={currentBook?.theme}
                onChange={withArgs(actions.setBookTheme, bookDialogBookId)}
                autoFocus={focus?.path[2] === 'theme'}
                selection={this.selectionFor('theme')}
              />
            </Col>
          </FormGroup>
        </Form>
      )
    }

    render() {
      return (
        <PlottrModal
          isOpen={true}
          onRequestClose={this.handleCancel}
          style={modalStyles}
          parentSelector={() => {
            return document.querySelector('#book-modal')
          }}
        >
          <div className={cx('book-dialog', { darkmode: this.props.darkMode })}>
            <div className="book-dialog__body">{this.renderBody()}</div>
            <hr />
            <div className="book-dialog__footer">{this.renderToolBar()}</div>
          </div>
        </PlottrModal>
      )
    }

    static propTypes = {
      bookId: PropTypes.number,
      darkMode: PropTypes.bool,
      bookNumber: PropTypes.number,
      focus: PropTypes.object,
      foci: PropTypes.array,
      actions: PropTypes.object.isRequired,
      books: PropTypes.object.isRequired,
      uiActions: PropTypes.object.isRequired,
      bookDialogBookId: PropTypes.number,
    }
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector
  const BookActions = actions.book
  checkDependencies({ redux, actions, BookActions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          darkMode: selectors.isDarkModeSelector(state),
          books: selectors.allBooksSelector(state),
          bookNumber: selectors.bookNumberSelector(state),
          bookDialogBookId: selectors.bookDialogBookIdSelector(state),
          focus: selectors.projectCurrentFocusSelector(state),
          foci: selectors.projectAllFociSelector(state),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(BookActions, dispatch),
          uiActions: bindActionCreators(actions.ui, dispatch),
        }
      }
    )(BookDialog)
  }

  throw new Error('Could not connect BookDialog')
}

export default BookDialogConnector
