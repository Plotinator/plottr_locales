import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions, selectors } from 'pltr/v2'
import { StyleSheet, FlatList } from 'react-native'
import { Icon, H1, H3, Container, Content, ListItem, CheckBox, Body, View, Badge } from 'native-base'
import { t } from 'plottr_locales'
import { Text } from '../../shared/common'
import Metrics from '../../../utils/Metrics'

class AttachmentSelectorModal extends Component {

  static getDerivedStateFromProps (props, state) {
    const { route } = props
    const { type, item, itemType } = route.params
    const connectedItem = props[`${itemType}s`].find(things => things.id == item.id)
    return { type, item: connectedItem, itemType, selected: connectedItem[type] }
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
      case 'bookIds':
        return actions.removeBook(this.state.item.id, id)
      default:
        return
    }
  }

  toggleItem = (id) => {
    let ids = this.state.selected
    if (ids.includes(id)) {
      this.removeIt(id)
    } else {
      this.addIt(id)
    }
  }

  renderItem = ({ item }) => {
    const { type, selected } = this.state
    let color = {}
    if (type == 'tags') color = {backgroundColor: item.color}
    let defaultTitle = `New ${type.substr(0,1).toUpperCase()}${type.substr(1, type.length - 2)}`
    if (type == 'bookIds') {
      defaultTitle = t('Untitled')
      item = this.props.books[`${item}`]
    }
    return (
      <ListItem noIndent button key={`item-${item.id}`} style={styles.listItem} onPress={() => this.toggleItem(item.id)}>
        <CheckBox checked={selected.includes(item.id)} onPress={() => this.toggleItem(item.id)}/>
        <Body>
          <View style={styles.rowView}>
            <Text
              fontSize={'h3'}
              fontStyle={'semiBold'}
              style={styles.title}>
              {item.name || item.title || defaultTitle}
            </Text>
            { type == 'tags' ? (
              <Badge style={[styles.badge, color]}>
                <Text white fontSize='small'>{item.color}</Text>
              </Badge>
            ) : null }
          </View>
        </Body>
      </ListItem>
    )
  }

  render () {
    let data = []
    if (this.state.type == 'bookIds') {
      data = this.props.books.allIds
    } else {
      data = this.props[this.state.type]
    }
    return (
      <Container>
        <Content>
          <FlatList
            data={data}
            ListEmptyComponent={(
              <Text fontSize={'h3'} fontStyle={'semiBold'} center padded>
                {t('None to choose')}
              </Text>
            )}
            extraData={{selected: this.state.selected}}
            keyExtractor={(item) => item.id}
            renderItem={this.renderItem}
          />
        </Content>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  h1: {
    textAlign: 'center',
    marginVertical: Metrics.doubleBaseMargin,
  },
  title: {
    paddingVertical: Metrics.baseMargin / 2,
  },
  rowView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Metrics.baseMargin,
  },
  badge: {
    paddingHorizontal: Metrics.baseMargin,
    marginTop: Metrics.baseMargin / 2,
    marginLeft: Metrics.doubleBaseMargin,
  },
})

AttachmentSelectorModal.propTypes = {
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  books: PropTypes.object.isRequired,
  cards: PropTypes.array.isRequired,
  notes: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    characters: selectors.charactersSortedAtoZSelector(state),
    places: selectors.placesSortedAtoZSelector(state),
    tags: selectors.sortedTagsSelector(state),
    books: state.books,
    cards: state.cards,
    notes: state.notes,
  }
}

function mapDispatchToProps (dispatch, ownProps) {
  const { route } = ownProps
  const { itemType } = route.params
  switch (itemType) {
    case 'card':
      return {actions: bindActionCreators(actions.card, dispatch)}
    case 'note':
      return {actions: bindActionCreators(actions.note, dispatch)}
    case 'character':
      return {actions: bindActionCreators(actions.character, dispatch)}
    case 'place':
      return {actions: bindActionCreators(actions.place, dispatch)}
    default:
      break
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AttachmentSelectorModal)
