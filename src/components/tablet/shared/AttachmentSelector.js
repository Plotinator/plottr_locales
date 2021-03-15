import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions, selectors } from 'pltr/v2'
import { StyleSheet, ScrollView, FlatList } from 'react-native'
import {
  Icon,
  ListItem,
  CheckBox,
  Body,
  View,
  Badge,
  Left,
  Right
} from 'native-base'
import Popover from 'react-native-popover-view'
import { t } from 'plottr_locales'
import { attachmentItemText } from '../../../utils/attachment_titles'
import { ShellButton, Text } from '../../shared/common'
import Colors from '../../../utils/Colors'
import Fonts from '../../../fonts'
import Metrics from '../../../utils/Metrics'

class AttachmentSelector extends Component {
  state = { selected: [] }
  static getDerivedStateFromProps (props, state) {
    const { type, item, itemType } = props
    const connectedItem = props[`${itemType}s`].find(
      (things) => things.id == item.id
    )
    return {
      type,
      item: connectedItem,
      itemType,
      selected: connectedItem[type]
    }
  }

  addIt = (id) => {
    const { actions } = this.props
    const { type, item } = this.state
    switch (type) {
      case 'characters':
        return actions.addCharacter(item.id, id)
      case 'places':
        return actions.addPlace(item.id, id)
      case 'tags':
        return actions.addTag(item.id, id)
      case 'books':
      case 'bookIds':
        return actions.addBook(item.id, id)
      default:
        return
    }
  }

  removeIt = (id) => {
    const { actions } = this.props
    switch (this.state.type) {
      case 'characters':
        return actions.removeCharacter(this.state.item.id, id)
      case 'places':
        return actions.removePlace(this.state.item.id, id)
      case 'tags':
        return actions.removeTag(this.state.item.id, id)
      case 'books':
      case 'bookIds':
        return actions.removeBook(this.state.item.id, id)
      default:
        return
    }
  }

  toggleItem = (id) => {
    let ids = this.state.selected
    if (ids.includes (id)) {
      this.removeIt(id)
    } else {
      this.addIt(id)
    }
  }

  renderItem = (key) => {
    const { type, selected } = this.state
    const dataSet = this.props[type]
    const item = dataSet[key]
    if (item && item.id) {
      let color = {}
      if (type == 'tags') color = { backgroundColor: item.color }
      let defaultTitle = `New ${type.substr(0, 1).toUpperCase()}${type.substr(
        1,
        type.length - 2
      )}`
      return (
        <ListItem
          noIndent
          button
          key={`item-${item.id}`}
          style={styles.listItem}
          onPress={() => this.toggleItem(item.id)}>
          <CheckBox
            checked={selected.includes(item.id)}
            onPress={() => this.toggleItem(item.id)}
          />
          <Body>
            <View style={styles.rowView}>
              <Text fontStyle='semiBold' fontSize='small' style={styles.title}>
                {item.name || item.title || defaultTitle}
              </Text>
              {type == 'tags' ? (
                <Badge style={[styles.badge, color]}></Badge>
              ) : null}
            </View>
          </Body>
        </ListItem>
      )
    }
  }

  render () {
    const { item, type } = this.props
    const { type: stateType } = this.state
    const dataSet = this.props[stateType] || []
    const dataKeys = Object.keys(dataSet)
    return (
      <Popover
        from={
          <ShellButton style={styles.listRow}>
            <View style={styles.left}>
              <Badge info style={styles.listBadge}>
                <Text style={styles.badgeNumber}>{item[type].length}</Text>
              </Badge>
              <Text fontStyle='semiBold' fontSize='h7'>
                {attachmentItemText(type)}
              </Text>
            </View>
            <View style={styles.right}>
              <Icon
                type='FontAwesome5'
                name='chevron-right'
                style={styles.caret}
              />
            </View>
          </ShellButton>
        }>
        <ScrollView>
          {dataKeys.map(this.renderItem)}
          {dataKeys.length == 0 && (
            <Text fontStyle='semiBold' fontSize='standard' style={styles.h1}>
              {t('None to choose')}
            </Text>
          )}
        </ScrollView>
      </Popover>
    )
  }
}

const styles = StyleSheet.create({
  h1: {
    textAlign: 'center',
    marginVertical: 20
  },
  title: {
    paddingVertical: 4
  },
  rowView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10
  },
  badge: {
    width: 50,
    marginTop: 5,
    marginLeft: 20
  },
  listBadge: {
    height: 30,
    width: 30,
    marginRight: Metrics.baseMargin / 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeNumber: {
    fontSize: Fonts.size.h7,
    color: 'white'
  },
  listItem: {
    width: 500
  },
  listRow: {
    flexDirection: 'row',
    paddingVertical: Metrics.baseMargin,
    paddingHorizontal: Metrics.baseMargin / 3
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  caret: {
    color: Colors.lightGray,
    fontSize: Fonts.size.small
  }
})

AttachmentSelector.propTypes = {
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  books: PropTypes.object.isRequired,
  cards: PropTypes.array.isRequired,
  notes: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  const { books = [] } = state
  const bookIds = {}
  Object.keys(books).map((key, index) => {
    // if (key !== 'allIds') {
    bookIds[index] = { ...books[key] }
    // }
  })
  return {
    characters: selectors.charactersSortedAtoZSelector(state),
    places: selectors.placesSortedAtoZSelector(state),
    tags: selectors.sortedTagsSelector(state),
    books: state.books,
    bookIds,
    cards: state.cards,
    notes: state.notes
  }
}

function mapDispatchToProps (dispatch, ownProps) {
  const { itemType } = ownProps
  switch (itemType) {
    case 'card':
      return { actions: bindActionCreators(actions.card, dispatch) }
    case 'note':
      return { actions: bindActionCreators(actions.note, dispatch) }
    case 'character':
      return { actions: bindActionCreators(actions.character, dispatch) }
    case 'place':
      return { actions: bindActionCreators(actions.place, dispatch) }
    default:
      break
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AttachmentSelector)
