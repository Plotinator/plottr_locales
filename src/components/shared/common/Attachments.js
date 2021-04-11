import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions, selectors } from 'pltr/v2'
import { View, ScrollView } from 'react-native'
import Text from './Text'
import ShellButton from './ShellButton'
import { Icon } from 'native-base'
import styles from './AttachmentStyles'
import PropTypes from 'prop-types'
import Popover, {
  PopoverMode,
  PopoverPlacement
} from 'react-native-popover-view'

class Attachments extends Component {

  addAttachment = (id) => {
    const { actions, type, cardId } = this.props
    switch (type) {
      case 'character':
        return actions.addCharacter(cardId, id)
      case 'place':
        return actions.addPlace(cardId, id)
      case 'tag':
        return actions.addTag(cardId, id)
      case 'book':
        return actions.addBook(cardId, id)
      default:
        return
    }
  }

  removeAttachment = (id) => {
    const { actions, type, cardId } = this.props
    switch (type) {
      case 'character':
        return actions.removeCharacter(cardId, id)
      case 'place':
        return actions.removePlace(cardId, id)
      case 'tag':
        return actions.removeTag(cardId, id)
      case 'book':
      case 'bookIds':
        return actions.removeBook(cardId, id)
      default:
        return
    }
  }

  handleRemoveAttachment = ({ id }) => {
    this.removeAttachment(id)
  }

  handleAddAttachment = ({ id }) => {
    this.addAttachment(id)
  }

  renderAttachmentName (attachment) {
    const { type } = this.props
    const { title, name } = attachment
    const firstCapital = type.substring(0,1).toUpperCase()
    const commonLast = type.substring(1)
    return name || title || `New ${firstCapital}${commonLast}`
  }

  renderTabCell = (attachment, i) => {
    const titleDisplay = this.renderAttachmentName(attachment)
    const { color } = attachment
    return (
      <View key={i} style={[styles.tabCell, color && { borderColor: color }]}>
        <Text style={styles.tabName}>{titleDisplay}</Text>
        <ShellButton
          data={attachment}
          style={styles.removeButton}
          onPress={this.handleRemoveAttachment}>
          <Icon style={styles.removeIcon} type='FontAwesome5' name='times' />
        </ShellButton>
      </View>
    )
  }

  renderListItem = (attachment, i) => {
    const titleDisplay = this.renderAttachmentName(attachment)
    const { color } = attachment
    return (
      <ShellButton
        data={attachment}
        key={i}
        style={styles.menuItem}
        onPress={this.handleAddAttachment}>
        <Text fontSize='h6' fontStyle={'semiBold'} color={'textGray'}>
          {titleDisplay}
        </Text>
        {color && (<View style={[styles.menuDot, { backgroundColor: color }]} />)}
      </ShellButton>
    )
  }

  render () {
    const { attachments, type } = this.props
    const attachmentsList = this.props[`${type}s`]
    const attached = attachmentsList.filter(({ id }) => attachments.indexOf(id) > -1)
    const unattached = attachmentsList.filter(({ id }) => attachments.indexOf(id) == -1)
    return (
      <View style={styles.tabsBase}>
        {attached.map(this.renderTabCell)}
        {attached.length == 0 && (
          <Text
            padded
            fontSize='micro'
            fontStyle='italic'
            color='lightGray'>
            Add a {type}
          </Text>
        )}
        <Popover
          popoverStyle={styles.menuPopover}
          from={
            <ShellButton style={styles.addButton}>
              <Icon style={styles.addIcon} type='FontAwesome5' name='plus' />
            </ShellButton>
          }>
          <ScrollView style={styles.menuScroller}>
            {unattached.map(this.renderListItem)}
            {unattached.length == 0 && (
              <View style={styles.menuItem}>
                <Text fontSize='h6' fontStyle={'semiBold'} color={'textGray'}>
                  No more :)
                </Text>
              </View>
            )}
          </ScrollView>
        </Popover>
      </View>
    )
  }
}

Attachments.propTypes = {
  attachments: PropTypes.array.isRequired,
  type: PropTypes.string.isRequired,
  sourceType: PropTypes.string.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  books: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  const { books = [] } = state
  const bookIds = {}
  Object.keys(books).map((key, index) => {
    bookIds[index] = { ...books[key] }
  })
  return {
    characters: selectors.charactersSortedAtoZSelector(state),
    places: selectors.placesSortedAtoZSelector(state),
    tags: selectors.sortedTagsSelector(state),
    books: state.books,
    bookIds
  }
}

function mapDispatchToProps (dispatch, ownProps) {
  const { sourceType } = ownProps
  switch (sourceType) {
    case 'card':
      return { actions: bindActionCreators(actions.card, dispatch) }
    case 'character':
      return { actions: bindActionCreators(actions.character, dispatch) }
    case 'place':
      return { actions: bindActionCreators(actions.place, dispatch) }
    default:
      break
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Attachments)
