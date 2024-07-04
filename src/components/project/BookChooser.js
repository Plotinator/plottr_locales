import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { t } from 'plottr_locales'
import { helpers } from 'pltr'
import { actions, selectors } from 'wired-up-pltr'

import NavDropdown from '../NavDropdown'
import MenuItem from '../MenuItem'

const {
  books: { isSeries },
  card: { truncateTitle },
} = helpers

const DISABLED_VIEWS = ['tags', 'notes', 'characters', 'places']

class BookChooser extends Component {
  handleChange(id) {
    this.props.actions.changeCurrentTimeline(id)
    if (this.props.currentView == 'project') {
      this.props.actions.changeCurrentView('timeline')
    }
  }

  isDisabled = () => {
    return DISABLED_VIEWS.includes(this.props.currentView)
  }

  bookTitle = (book) => {
    return book.title ? (
      <span title={book.title}>{truncateTitle(book.title, 40)}</span>
    ) : (
      t('Untitled')
    )
  }

  renderBookList() {
    const { books } = this.props
    return books.allIds.map((id) => {
      const book = books[id] || books[`${id}`]
      return (
        <MenuItem key={id} onSelect={() => this.handleChange(id)}>
          {this.bookTitle(book)}
        </MenuItem>
      )
    })
  }

  render() {
    const { currentTimeline, books, series } = this.props
    const seriesText = series.name == '' ? t('Series View') : `${series.name} (${t('Series View')})`
    const currentBook = books[currentTimeline] || books[books.allIds[0]]
    const title = !isSeries(currentTimeline) ? this.bookTitle(currentBook) : seriesText

    return (
      <NavDropdown
        id="book_chooser"
        title={title}
        disabled={this.isDisabled()}
        style={{ margin: '0 16px 0 8px' }}
        onClick={(e) => e.stopPropagation(e)}
      >
        <MenuItem onSelect={() => this.handleChange('series')}>{seriesText}</MenuItem>
        <MenuItem divider />
        {this.renderBookList()}
      </NavDropdown>
    )
  }

  static propTypes = {
    currentTimeline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    currentView: PropTypes.string.isRequired,
    books: PropTypes.object.isRequired,
    series: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  }
}

const UIActions = actions.ui

const mapStateToProps = (state) => {
  return {
    currentTimeline: selectors.currentTimelineSelector(state),
    currentView: selectors.currentViewSelector(state),
    books: selectors.allBooksSelector(state),
    series: selectors.seriesSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    actions: bindActionCreators(UIActions, dispatch),
  }
})(BookChooser)
