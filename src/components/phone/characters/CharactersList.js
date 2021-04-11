import { sortBy } from 'lodash'
import React, { Component } from 'react'
import { SwipeListView } from 'react-native-swipe-list-view'
import { StyleSheet, Animated, SectionList } from 'react-native'
import { DefaultTheme } from '@react-navigation/native'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions, selectors } from 'pltr/v2'
import { View, ListItem, Icon, Left, Right, Button } from 'native-base'
import { t } from 'plottr_locales'
import { Text } from '../../shared/common'
import Colors from '../../../utils/Colors'
import Metrics from '../../../utils/Metrics'

class CharactersList extends Component {
  state = { data: [] }

  static getDerivedStateFromProps(props, state) {
    let categories = [...props.categories]
    categories.push({ id: null, name: t('Uncategorized') })

    const data = categories.map((cat) => {
      let characters = []
      if (props.visibleCharactersByCategory[`${cat.id}`]) {
        characters = props.visibleCharactersByCategory[`${cat.id}`]
        // i had it like this before, but i don't think the .map part is needed
        // characters = props.visibleCharactersByCategory[`${cat.id}`].map(ch => ch)
      }
      return {
        title: cat.name,
        data: characters
      }
    })

    return { data }
  }

  deleteCharacter = (id) => {
    this.props.actions.deleteCharacter(id)
  }

  navigateToDetails = (character) => {
    this.props.navigation.navigate('CharacterDetails', { character })
  }

  navigateToCustomAttributes = () => {
    this.props.navigation.navigate('CustomAttributesModal', {
      type: 'characters'
    })
  }

  renderCharacter = ({ item }) => {
    return (
      <ListItem
        noIndent
        button
        style={styles.row}
        onPress={() => this.navigateToDetails(item)}>
        <Left>
          <Text fontSize='h4' fontStyle='semiBold' style={styles.subtitle}>
            {item.name || t('New Character')}
          </Text>
        </Left>
        <Right style={styles.right}>
          <Icon type='FontAwesome5' name='chevron-right' />
        </Right>
      </ListItem>
    )
  }

  renderSectionHeader = ({ section }) => {
    if (!section.data.length) return null

    return (
      <Text
        fontSize='h3'
        fontStyle='bold'
        style={styles.sectionHeader}
        style={styles.title}>
        {section.title}
      </Text>
    )
  }

  render () {
    return (
      <View style={styles.container}>
        <SectionList
          sections={this.state.data}
          renderSectionHeader={this.renderSectionHeader}
          renderItem={this.renderCharacter}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text fontSize='h4' fontStyle='bold' style={styles.title}>
              {t('No Characters')}
            </Text>
          }
        />
        <Button full info onPress={this.navigateToCustomAttributes}>
          <Text white>{t('Custom Attributes')}</Text>
        </Button>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cloud
  },
  row: {
    backgroundColor: 'white'
  },
  title: {
    color: Colors.textLightGray,
    paddingLeft: Metrics.doubleBaseMargin * 0.8,
    paddingVertical: Metrics.baseMargin,
    backgroundColor: Colors.cloud
  },
  subtitle: {
    paddingVertical: Metrics.baseMargin / 2,
    paddingLeft: Metrics.baseMargin * 0.8
  },
  sectionHeader: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: DefaultTheme.colors.background
  },
  right: {
    paddingRight: Metrics.baseMargin / 2
  }
})

CharactersList.propTypes = {
  visibleCharactersByCategory: PropTypes.object.isRequired,
  characters: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  customAttributes: PropTypes.array.isRequired,
  customAttributesThatCanChange: PropTypes.array,
  ui: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired
}

function mapStateToProps(state) {
  return {
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

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions.character, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CharactersList)
