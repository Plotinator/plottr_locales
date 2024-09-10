import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'

import { t as i18n } from 'plottr_locales'
import { selectors } from 'wired-up-pltr'

import GenericFilterList from './GenericFilterList'

class TagFilterList extends Component {
  updateItems = (ids) => {
    this.props.updateItems('tag', ids)
  }

  render() {
    return (
      <GenericFilterList
        items={this.props.tags}
        title={i18n('Tags')}
        singleItemTitle={i18n('Tag')}
        displayAttribute={'title'}
        updateItems={this.updateItems}
        filteredItems={this.props.filteredItems}
      />
    )
  }
}

TagFilterList.propTypes = {
  tags: PropTypes.array.isRequired,
  updateItems: PropTypes.func.isRequired,
  filteredItems: PropTypes.array,
}

const mapStateToProps = (state) => {
  return {
    tags: selectors.tagsFilterItemsSelector(state),
  }
}

export default connect(mapStateToProps)(TagFilterList)
