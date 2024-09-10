import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'

import { t as i18n } from 'plottr_locales'
import { selectors } from 'wired-up-pltr'

import GenericFilterList from './GenericFilterList'

class BookFilterList extends Component {
  updateItems = (ids) => {
    this.props.updateItems('book', ids)
  }

  render() {
    let books = this.props.books.allIds.map((id) => {
      let book = { ...this.props.books[id.toString()] }
      book.title = book.title || i18n('Untitled')
      return book
    })
    return (
      <GenericFilterList
        items={books}
        title={i18n('Books')}
        singleItemTitle={i18n('Book')}
        displayAttribute={'title'}
        updateItems={this.updateItems}
        filteredItems={this.props.filteredItems}
      />
    )
  }
}

BookFilterList.propTypes = {
  books: PropTypes.object.isRequired,
  updateItems: PropTypes.func.isRequired,
  filteredItems: PropTypes.array,
}

const mapStateToProps = (state) => {
  return {
    books: selectors.booksFilterItemsSelector(state),
  }
}

export default connect(mapStateToProps)(BookFilterList)
