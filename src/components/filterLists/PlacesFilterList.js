import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'

import { t as i18n } from 'plottr_locales'
import { selectors } from 'wired-up-pltr'

import GenericFilterList from './GenericFilterList'

class PlaceFilterList extends Component {
  updateItems = (ids) => {
    this.props.updateItems('place', ids)
  }

  render() {
    return (
      <GenericFilterList
        items={this.props.places}
        title={i18n('Places')}
        singleItemTitle={i18n('Place')}
        displayAttribute={'name'}
        updateItems={this.updateItems}
        filteredItems={this.props.filteredItems}
      />
    )
  }
}

PlaceFilterList.propTypes = {
  places: PropTypes.array.isRequired,
  updateItems: PropTypes.func.isRequired,
  filteredItems: PropTypes.array,
}

const mapStateToProps = (state) => {
  return {
    places: selectors.placesFilterItemsSelector(state),
  }
}

export default connect(mapStateToProps)(PlaceFilterList)
