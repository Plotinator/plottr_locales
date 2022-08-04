import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'

import { t as i18n } from 'plottr_locales'

import Form from '../Form'
import Modal from '../Modal'
import ButtonToolbar from '../ButtonToolbar'
import Col from '../Col'
import ControlLabel from '../ControlLabel'
import FormGroup from '../FormGroup'
import FormControl from '../FormControl'
import Button from '../Button'
import { checkDependencies } from '../checkDependencies'

const BookDialogConnector = (connector) => {
  class BookDialog extends Component {
    constructor(props) {
      super(props)
      this.titleRef = null
      this.premiseRef = null
      this.genreRef = null
      this.themeRef = null
    }

    saveEdit = () => {
      const { book } = this.props

      let title = this.titleRef.value
      let premise = this.premiseRef.value
      let genre = this.genreRef.value
      let theme = this.themeRef.value
      this.props.actions.editBook(book.id, { title, premise, genre, theme })
      this.props.cancel()
    }

    renderToolBar() {
      return (
        <ButtonToolbar>
          <Button bsStyle="success" onClick={this.saveEdit}>
            {i18n('Save')}
          </Button>
          <Button onClick={this.props.cancel}>{i18n('Cancel')}</Button>
        </ButtonToolbar>
      )
    }

    renderBody() {
      const { book } = this.props
      return (
        <Form horizontal>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>
              {i18n('Book #')}
            </Col>
            <Col sm={8}>
              <span className="lead">{this.props.bookNumber}</span>
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>
              {i18n('Title')}
            </Col>
            <Col sm={8}>
              <FormControl
                type="text"
                inputRef={(ref) => {
                  this.titleRef = ref
                }}
                defaultValue={book.title}
              />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>
              {i18n('Premise')}
            </Col>
            <Col sm={8}>
              <FormControl
                type="text"
                inputRef={(ref) => {
                  this.premiseRef = ref
                }}
                defaultValue={book.premise}
              />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>
              {i18n('Genre')}
            </Col>
            <Col sm={8}>
              <FormControl
                type="text"
                inputRef={(ref) => {
                  this.genreRef = ref
                }}
                defaultValue={book.genre}
              />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>
              {i18n('Theme')}
            </Col>
            <Col sm={8}>
              <FormControl
                type="text"
                inputRef={(ref) => {
                  this.themeRef = ref
                }}
                defaultValue={book.theme}
              />
            </Col>
          </FormGroup>
        </Form>
      )
    }

    render() {
      return (
        <Modal
          animation={false}
          show={true}
          onHide={this.props.cancel}
          dialogClassName={cx('book-dialog', { darkmode: this.props.darkMode })}
        >
          <Modal.Body>{this.renderBody()}</Modal.Body>
          <Modal.Footer>{this.renderToolBar()}</Modal.Footer>
        </Modal>
      )
    }

    static propTypes = {
      bookId: PropTypes.number.isRequired,
      cancel: PropTypes.func.isRequired,
      darkMode: PropTypes.bool,
      book: PropTypes.object,
      bookNumber: PropTypes.number,
      actions: PropTypes.object.isRequired,
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
          darkMode: selectors.isDarkModeSelector(state.present),
          book: state.present.books[ownProps.bookId],
          bookNumber: state.present.books.allIds.indexOf(ownProps.bookId) + 1,
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(BookActions, dispatch),
        }
      }
    )(BookDialog)
  }

  throw new Error('Could not connect BookDialog')
}

export default BookDialogConnector
