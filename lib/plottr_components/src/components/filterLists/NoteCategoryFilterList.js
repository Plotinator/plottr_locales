import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { t as i18n } from 'plottr_locales'

import { selectors } from 'wired-up-pltr'

import GenericFilterList from './GenericFilterList'

class CharacterNoteCategoryFilterList extends Component {
  updateItems = (ids) => {
    this.props.updateItems('noteCategory', ids)
  }

  render() {
    const categoryFilterItems = [...this.props.categories]
    return (
      <GenericFilterList
        items={categoryFilterItems}
        title={i18n('Categories')}
        singleItemTitle={i18n('Category')}
        displayAttribute={'name'}
        updateItems={this.updateItems}
        filteredItems={this.props.filteredItems}
      />
    )
  }
}

CharacterNoteCategoryFilterList.propTypes = {
  categories: PropTypes.array.isRequired,
  updateItems: PropTypes.func.isRequired,
  filteredItems: PropTypes.array,
}

const mapStateToProps = (state) => {
  return {
    categories: selectors.categoriesFilterItemsSelector(state),
  }
}

export default connect(mapStateToProps)(CharacterNoteCategoryFilterList)
