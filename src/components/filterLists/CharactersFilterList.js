import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'

import { t as i18n } from 'plottr_locales'
import { selectors } from 'wired-up-pltr'

import GenericFilterList from './GenericFilterList'

class CharacterFilterList extends Component {
  updateItems = (ids) => {
    this.props.updateItems('character', ids)
  }

  render() {
    return (
      <GenericFilterList
        items={this.props.characters}
        title={i18n('Characters')}
        singleItemTitle={i18n('Character')}
        displayAttribute={'name'}
        updateItems={this.updateItems}
        filteredItems={this.props.filteredItems}
      />
    )
  }
}

CharacterFilterList.propTypes = {
  characters: PropTypes.array.isRequired,
  updateItems: PropTypes.func.isRequired,
  filteredItems: PropTypes.array,
}

const mapStateToProps = (state) => {
  return {
    characters: selectors.charactersFilterItemsSelector(state),
  }
}

export default connect(mapStateToProps)(CharacterFilterList)
