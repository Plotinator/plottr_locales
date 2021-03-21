import { sortBy } from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import t from 'format-message'
import cx from 'classnames'
import { selectors, actions, newIds } from 'pltr/v2'
import { View, H3, Button, H1, Icon, Content } from 'native-base'
import { Col, Grid } from 'react-native-easy-grid'
import ErrorBoundary from '../../shared/ErrorBoundary'
import Toolbar from '../shared/Toolbar'
import Place from './Place'
import NewButton from '../../ui/NewButton'
import { askToDelete } from '../../../utils/delete'
import DrawerButton from '../../ui/DrawerButton'
import SideButton from '../shared/SideButton'
import { Text } from '../../shared/common'

class Places extends Component {
  state = {
    activePlaceId: null
  }

  static getDerivedStateFromProps (props, state) {
    const activePlaceId = Places.findActivePlace(
      props.visiblePlaces,
      state.activePlaceId
    )
    return { activePlaceId }
  }

  static findActivePlace (places, activePlaceId) {
    if (places.length == 0) return null

    let newId = places[0].id

    // check for the currently active one
    if (activePlaceId != null) {
      let existingPlace = places.find((pl) => pl.id === activePlaceId)
      if (existingPlace) newId = existingPlace.id
    }

    return newId
  }

  createNewPlace = () => {
    const id = newIds.nextId(this.props.places)
    this.props.actions.addPlace()
    this.setState({ activePlaceId: id })
  }

  savePlace = (id, attributes) => {
    this.props.actions.editPlace(id, attributes)
  }

  deletePlace = (place) => {
    askToDelete(place.name || t('New Place'), () =>
      this.props.actions.deletePlace(place.id)
    )
  }

  navigateToCustomAttributes = () => {
    this.props.navigation.navigate('CustomAttributesModal', {
      type: 'places'
    })
  }

  renderPlaceItem = ({ item }) => {
    const isActive = item.id == this.state.activePlaceId
    const { images = [] } = this.props
    const foundImage = images[item.imageId]
    return (
      <SideButton
        onPress={() => this.setState({ activePlaceId: item.id })}
        onDelete={() => this.deletePlace(item)}
        image={foundImage && foundImage.data}
        title={item.name || t('New Place')}
        isActive={isActive}
      />
    )
  }

  renderPlaceList () {
    const { visiblePlaces } = this.props
    return (
      <View style={styles.placeList}>
        <Text fontSize='h5' fontStyle='semiBold' style={styles.title}>{t('Places')}</Text>
        <FlatList
          data={visiblePlaces}
          renderItem={this.renderPlaceItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    )
  }

  renderPlaceDetail () {
    const { visiblePlaces, customAttributes, navigation } = this.props
    let place = visiblePlaces.find((pl) => pl.id == this.state.activePlaceId)
    if (!place) return null
    const { images = [] } = this.props
    const image = images[place.imageId]

    return (
      <ErrorBoundary>
        <Place
          key={place.id}
          place={{ ...place, image }}
          customAttributes={customAttributes}
          onSave={this.savePlace}
          navigation={navigation}
        />
      </ErrorBoundary>
    )
  }

  render () {
    return (
      <View style={{ flex: 1 }}>
        <Toolbar>
          <DrawerButton openDrawer={this.props.openDrawer} />
          <NewButton onPress={this.createNewPlace} />
        </Toolbar>
        <Grid style={{ flex: 1 }}>
          <Col size={4}>{this.renderPlaceList()}</Col>
          <Col size={10}>{this.renderPlaceDetail()}</Col>
        </Grid>
        <Button full info onPress={this.navigateToCustomAttributes}>
          <Text white>{t('Custom Attributes')}</Text>
        </Button>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  placeList: {
    height: '100%',
    padding: 8
  },
  title: {
    textAlign: 'center',
    marginBottom: 8
  },
  placeItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 8,
    borderColor: 'hsl(210, 36%, 96%)', //gray-9
    borderWidth: 1
  },
  activeItem: {
    borderColor: 'hsl(208, 88%, 62%)', //blue-6
    backgroundColor: 'hsl(210, 31%, 80%)', //gray-7
    borderStyle: 'dashed'
  },
  buttonWrapper: {
    flexDirection: 'row',
    marginLeft: 'auto'
  }
})

Places.propTypes = {
  places: PropTypes.array.isRequired,
  visiblePlaces: PropTypes.array.isRequired,
  filterIsEmpty: PropTypes.bool.isRequired,
  customAttributes: PropTypes.array.isRequired,
  customAttributesThatCanChange: PropTypes.array,
  restrictedValues: PropTypes.array,
  ui: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  customAttributeActions: PropTypes.object.isRequired,
  uiActions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    images: state.images,
    places: state.places,
    visiblePlaces: selectors.visibleSortedPlacesSelector(state),
    filterIsEmpty: selectors.placeFilterIsEmptySelector(state),
    customAttributes: state.customAttributes.places,
    customAttributesThatCanChange: selectors.placeCustomAttributesThatCanChangeSelector(
      state
    ),
    restrictedValues: selectors.placeCustomAttributesRestrictedValues(state),
    ui: state.ui
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(actions.place, dispatch),
    customAttributeActions: bindActionCreators(
      actions.customAttribute,
      dispatch
    ),
    uiActions: bindActionCreators(actions.ui, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Places)
