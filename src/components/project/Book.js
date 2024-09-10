import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cx from 'classnames'
import { TbCopy } from '@react-icons/all-files/tb/TbCopy'

import { t } from 'plottr_locales'
import { selectors, actions } from 'wired-up-pltr'

import ButtonGroup from '../ButtonGroup'
import Glyphicon from '../Glyphicon'
import Button from '../Button'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import Image from '../images/Image'
import ImagePicker from '../images/ImagePicker'
import TemplatePicker from '../templates/TemplatePicker'
import { PlottrComponentsContext } from '../../connections/pltrContext'

class Book extends Component {
  static contextType = PlottrComponentsContext

  // @type {PlottrComponentsContext}
  context

  state = {
    hovering: false,
    deleting: false,
    showTemplatePicker: false,
    showImagePicker: false,
  }

  chooseImage = (newId) => {
    const imageId = newId == -1 ? null : newId
    this.props.actions.editBookImage(this.props.book.id, imageId)
  }

  deleteBook = (e) => {
    e.stopPropagation()
    this.props.actions.deleteBook(this.props.book.id)
  }

  cancelDelete = (e) => {
    e.stopPropagation()
    this.setState({ deleting: false, hovering: false })
  }

  handleDelete = (e) => {
    e.stopPropagation()
    this.setState({ deleting: true })
  }

  navigateToBook = () => {
    this.props.uiActions.navigateToBookTimeline(
      this.props.book.id,
      this.context.platform.inBrowser,
      this.context.platform.browserHistory
    )
  }

  handleChooseTemplate = (template) => {
    this.props.addBook(template)
    this.setState({ showTemplatePicker: false })
  }

  cancelPickImage = () => {
    this.setState({ hovering: false })
  }

  handleDuplicate = () => {
    this.props.actions.duplicateBook(this.props.book.id)
  }

  renderDelete() {
    if (!this.state.deleting) return null

    return (
      <DeleteConfirmModal
        name={this.props.book.title || t('Untitled')}
        onDelete={this.deleteBook}
        onCancel={this.cancelDelete}
      />
    )
  }

  handleOpenBookDialog = () => {
    const { uiActions, book } = this.props
    uiActions.openEditBookDialog(book.id)
  }

  renderHoverOptions() {
    return (
      <div className={cx('hover-options', { hovering: this.state.hovering })}>
        <ButtonGroup>
          <Button title={t('Edit')} onClick={this.handleOpenBookDialog}>
            <Glyphicon glyph="edit" />
          </Button>
          <Button title={t('Duplicate')} onClick={this.handleDuplicate}>
            <TbCopy />
          </Button>
          <ImagePicker
            chooseImage={this.chooseImage}
            selectedId={this.props.book.imageId}
            onClose={this.cancelPickImage}
            iconOnly
            deleteButton
          />
          {this.props.canDelete ? (
            <Button bsStyle="danger" onClick={this.handleDelete}>
              <Glyphicon glyph="trash" />
            </Button>
          ) : null}
        </ButtonGroup>
      </div>
    )
  }

  renderTemplatePicker() {
    if (!this.state.showTemplatePicker) return null

    return (
      <TemplatePicker
        newBook
        types={['plotlines']}
        modal={true}
        isOpen={this.state.showTemplatePicker}
        close={() => this.setState({ showTemplatePicker: false })}
        onChooseTemplate={this.handleChooseTemplate}
      />
    )
  }

  renderImage() {
    const { book } = this.props
    if (!book.imageId) return null

    return <Image responsive imageId={book.imageId} />
  }

  renderTitle() {
    const { book } = this.props
    if (book.imageId) return null
    const maxTitleLength = 320

    return <h6>{book.title?.slice?.(0, maxTitleLength) || t('Untitled')}</h6>
  }

  handleClickAddBook = () => {
    const { uiActions } = this.props
    uiActions.openNewBookDialog()
  }

  render() {
    const { book, darkMode } = this.props

    if (!book) {
      return (
        <div className={cx('book-container', 'add', { darkmode: darkMode })}>
          {this.renderTemplatePicker()}
          <div className="book add">
            <div className="front">
              <div className="cover add">
                <div className="book-container__add">
                  <div onClick={this.handleClickAddBook}>
                    <Glyphicon glyph="plus" />
                  </div>
                  <div
                    className={cx('use-template', {
                      disabled: this.context.platform.templatesDisabled,
                    })}
                    onClick={() => this.setState({ showTemplatePicker: true })}
                  >
                    {t('Start with Template')}
                  </div>
                </div>
              </div>
            </div>
            <div className="left-side add">
              <h2>
                <span>{t('New Book')}</span>
              </h2>
            </div>
          </div>
        </div>
      )
    }

    const titleLength = book?.title?.length ?? 0
    return (
      <div
        className={cx('book-container', { darkmode: darkMode })}
        onMouseEnter={() => this.setState({ hovering: true })}
        onMouseLeave={() => this.setState({ hovering: false })}
      >
        {this.renderHoverOptions()}
        {this.renderDelete()}
        <div
          className={cx('book', { hovering: this.state.hovering })}
          onClick={this.navigateToBook}
        >
          <div className="front">
            <div
              className={cx('cover', {
                'smaller-font': titleLength <= 140 && titleLength > 80,
                'very-small-font': titleLength > 140,
              })}
            >
              {this.renderTitle()}
              <div className="book-container__cover-image-wrapper">{this.renderImage()}</div>
            </div>
          </div>
          <div className="left-side">
            <h2>
              <span>{book.title?.slice?.(0, 48) || t('Untitled')}</span>
            </h2>
          </div>
        </div>
      </div>
    )
  }

  static propTypes = {
    bookId: PropTypes.number,
    bookNumber: PropTypes.number,
    addBook: PropTypes.func,
    darkMode: PropTypes.bool,
    canDelete: PropTypes.bool,
    book: PropTypes.object,
    actions: PropTypes.object,
    uiActions: PropTypes.object,
    books: PropTypes.object,
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    darkMode: selectors.isDarkModeSelector(state),
    book: selectors.bookByIdSelector(
      state,
      // @ts-ignore
      ownProps.bookId
    ),
    books: selectors.allBooksSelector(state),
    canDelete: selectors.canDeleteBookSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    actions: bindActionCreators(actions.book, dispatch),
    uiActions: bindActionCreators(actions.ui, dispatch),
  }
})(Book)
