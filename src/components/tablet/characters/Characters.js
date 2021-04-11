import { sortBy } from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Image, StyleSheet, SectionList, TouchableOpacity } from 'react-native'
import { t } from 'plottr_locales'
import cx from 'classnames'
import { selectors, actions, newIds } from 'pltr/v2'
import { View, H3, Button, H1, Icon, Content } from 'native-base'
import { Col, Grid } from 'react-native-easy-grid'
import ErrorBoundary from '../../shared/ErrorBoundary'
import Toolbar from '../shared/Toolbar'
import Character from './Character'
import NewButton from '../../ui/NewButton'
import { askToDelete } from '../../../utils/delete'
import DrawerButton from '../../ui/DrawerButton'
import SideButton from '../shared/SideButton'
import { Text } from '../../shared/common'

class Characters extends Component {
  state = {
    activeCharacterId: null,
    data: []
  }

  static getDerivedStateFromProps (props, state) {
    let returnVal = { ...state }
    const { visibleCharactersByCategory, characters, categories } = props
    returnVal.activeCharacterId = Characters.findActiveCharacter(
      visibleCharactersByCategory,
      characters,
      categories,
      state.activeCharacterId
    )

    let allCategories = [...categories]
    allCategories.push({ id: null, name: t('Uncategorized') })
    returnVal.data = allCategories.map((cat) => {
      let characters = []
      if (props.visibleCharactersByCategory[`${cat.id}`]) {
        characters = props.visibleCharactersByCategory[`${cat.id}`]
      }
      return {
        title: cat.name,
        data: characters
      }
    })

    return returnVal
  }

  static findActiveCharacter(
    charactersByCategory,
    characters,
    categories,
    activeCharacterId
  ) {
    if (!characters.length) return null
    if (!Object.keys(charactersByCategory).length) return null
    const allCategories = [...categories, { id: null }] // uncategorized

    // check for the currently active one
    if (activeCharacterId != null) {
      const isVisible = allCategories.some((cat) => {
        if (
          !charactersByCategory[cat.id] ||
          !charactersByCategory[cat.id].length
        )
          return false
        return charactersByCategory[cat.id].some(
          (ch) => ch.id == activeCharacterId
        )
      })
      if (isVisible) return activeCharacterId
    }

    // default to first one in the first category
    const firstCategoryWithChar = allCategories.find(
      (cat) =>
        charactersByCategory[cat.id] && charactersByCategory[cat.id].length
    )
    if (firstCategoryWithChar)
      return (
        charactersByCategory[firstCategoryWithChar.id][0] &&
        charactersByCategory[firstCategoryWithChar.id][0].id
      )

    return null
  }

  createNewCharacter = () => {
    const id = newIds.nextId(this.props.characters)
    this.props.actions.addCharacter()
    this.setState({ activeCharacterId: id })
  }

  saveCharacter = (id, attributes) => {
    this.props.actions.editCharacter(id, attributes)
  }

  deleteCharacter = (character) => {
    askToDelete(character.name || t('New Character'), () =>
      this.props.actions.deleteCharacter(character.id)
    )
  }

  renderCharacterItem = ({ item }) => {
    const isActive = item.id == this.state.activeCharacterId
    const { images = [] } = this.props
    const foundImage = images[item.imageId]
    return (
      <SideButton
        onPress={() => this.setState({ activeCharacterId: item.id })}
        onDelete={() => this.deleteCharacter(item)}
        image={foundImage && foundImage.data}
        title={item.name || t('New Character')}
        isActive={isActive}
      />
    )
  }

  renderSectionHeader = ({ section }) => {
    if (!section.data.length) return null

    return <H3 style={styles.sectionHeader}>{section.title}</H3>
  }

  renderCharacterList () {
    const {
      visibleCharactersByCategory,
      categories,
      filterIsEmpty
    } = this.props

    return (
      <View style={styles.characterList}>
        <Text style={styles.title} fontSize='h5' fontStyle='semiBold'>
          {t('Characters')}
        </Text>
        <SectionList
          sections={this.state.data}
          renderSectionHeader={this.renderSectionHeader}
          renderItem={this.renderCharacterItem}
          extraData={{ visibleCharactersByCategory, categories, filterIsEmpty }}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    )
  }

  renderCharacterDetail () {
    const { characters, customAttributes, navigation, images = [] } = this.props
    let character = characters.find(
      (char) => char.id == this.state.activeCharacterId
    )
    if (!character) return null
    const image = images[character.imageId]
    return (
      <ErrorBoundary>
        <Character
          key={character.id}
          character={{ ...character, image }}
          customAttributes={customAttributes}
          onSave={this.saveCharacter}
          navigation={navigation}
        />
      </ErrorBoundary>
    )
  }

  navigateToCustomAttributes = () => {
    this.props.navigation.navigate('CustomAttributesModal', {
      type: 'characters'
    })
  }

  render () {
    return (
      <View style={{ flex: 1 }}>
        <Toolbar>
          <DrawerButton openDrawer={this.props.openDrawer} />
          <NewButton onPress={this.createNewCharacter} />
        </Toolbar>
        <Grid style={{ flex: 1 }}>
          <Col size={4}>{this.renderCharacterList()}</Col>
          <Col size={10}>{this.renderCharacterDetail()}</Col>
        </Grid>
        <Button full info onPress={this.navigateToCustomAttributes}>
          <Text white>{t('Custom Attributes')}</Text>
        </Button>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  characterList: {
    height: '100%',
    padding: 8
  },
  title: {
    textAlign: 'center',
    marginBottom: 8
  },
  sectionHeader: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: 'hsl(210, 36%, 96%)' //gray-9
  },
  characterItem: {
    borderRadius: 15,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 10,
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
  },
  sideButton: {
    minHeight: 50,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  characterSideImage: {
    resizeMode: 'contain',
    overflow: 'hidden',
    borderRadius: 50,
    marginRight: 10,
    width: 30,
    height: 30
  }
})

Characters.propTypes = {
  visibleCharactersByCategory: PropTypes.object.isRequired,
  filterIsEmpty: PropTypes.bool.isRequired,
  characters: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  customAttributes: PropTypes.array.isRequired,
  customAttributesThatCanChange: PropTypes.array,
  ui: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  customAttributeActions: PropTypes.object.isRequired,
  uiActions: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    images: state.images || [],
    visibleCharactersByCategory: selectors.visibleSortedCharactersByCategorySelector(
      state
    ),
    filterIsEmpty: selectors.characterFilterIsEmptySelector(state),
    characters: state.characters,
    categories: selectors.sortedCharacterCategoriesSelector(state),
    customAttributes: state.customAttributes.characters,
    customAttributesThatCanChange: selectors.characterCustomAttributesThatCanChangeSelector(
      state
    ),
    ui: state.ui
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(actions.character, dispatch),
    customAttributeActions: bindActionCreators(
      actions.customAttribute,
      dispatch
    ),
    uiActions: bindActionCreators(actions.ui, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Characters)
