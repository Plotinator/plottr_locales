import { sortBy } from 'lodash'
import React, { Component } from 'react'
import { SwipeListView } from 'react-native-swipe-list-view'
import { StyleSheet, Alert, LayoutAnimation } from 'react-native'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { selectors, actions } from 'pltr/v2'
import { View, ListItem, Icon, Left, Right, Button } from 'native-base'
import { t } from 'plottr_locales'
import TrashButton from '../../ui/TrashButton'
import { askToDelete } from '../../../utils/delete'
import { Text } from '../../shared/common'
import Colors from '../../../utils/Colors'
import Metrics from '../../../utils/Metrics'

class PlacesList extends Component {
  deletePlace = (place) => {
    askToDelete(place.name, () => this.props.actions.deletePlace(place.id))
  }

  navigateToDetails = (place) => {
    this.props.navigation.navigate('PlaceDetails', { place })
  }

  navigateToCustomAttributes = () => {
    this.props.navigation.navigate('CustomAttributesModal', { type: 'places' })
  }

  renderPlace = ({ item }) => {
    return (
      <ListItem
        noIndent
        button
        style={styles.row}
        onPress={() => this.navigateToDetails(item)}>
        <Left>
          <Text
            style={styles.title}
            fontStyle='semiBold'
            style={styles.title}
            fontSize='h4'>
            {item.name || t('New Place')}
          </Text>
        </Left>
        <Right style={styles.right}>
          <Icon type='FontAwesome5' name='chevron-right' />
        </Right>
      </ListItem>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <SwipeListView
          data={this.props.visiblePlaces}
          renderItem={this.renderPlace}
          renderHiddenItem={({ item }, rowMap) => (
            <TrashButton iconStyle={styles.icon} data={item} onPress={this.deletePlace} />
          )}
          keyExtractor={(item) => item.id}
          leftOpenValue={75}
        />
        <Button full info onPress={this.navigateToCustomAttributes}>
          <Text white>{t('Custom Attributes')}</Text>
        </Button>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: {
    backgroundColor: 'white'
  },
  title: {
    paddingVertical: Metrics.baseMargin / 2
  },
  hiddenRow: {},
  icon: {
    color: Colors.white
  },
  right: {
    paddingRight: Metrics.baseMargin / 2
  }
})

PlacesList.propTypes = {
  visiblePlaces: PropTypes.array.isRequired,
  customAttributes: PropTypes.array.isRequired,
  customAttributesThatCanChange: PropTypes.array,
  restrictedValues: PropTypes.array,
  ui: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired
}

function mapStateToProps(state) {
  return {
    visiblePlaces: selectors.visibleSortedPlacesSelector(state),
    customAttributes: state.customAttributes.places,
    customAttributesThatCanChange: selectors.placeCustomAttributesThatCanChangeSelector(
      state
    ),
    restrictedValues: selectors.placeCustomAttributesRestrictedValues(state),
    ui: state.ui
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions.place, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlacesList)
