import { cloneDeep } from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { View, Label, Item, Icon } from 'native-base'
import { selectors, actions, helpers, initialState } from 'pltr/v2'
import { Modal, ScrollView, KeyboardAvoidingView } from 'react-native'
import { t } from 'plottr_locales'
import AttachmentList from '../../shared/attachments/AttachmentList'
import ChapterPicker from '../../ui/ChapterPicker'
import LinePicker from '../../ui/LinePicker'
import { DetailsWrapper, DetailsRight, DetailsLeft } from '../shared/Details'
import {
  Input,
  Text,
  Button,
  RichEditor,
  ShellButton
} from '../../shared/common'
import styles from './CardModalStyles'
import Popover, {
  PopoverMode,
  PopoverPlacement
} from 'react-native-popover-view'

// cooresponds to CardDialog in desktop

class CardModal extends Component {
  state = {}

  static getDerivedStateFromProps (props, state) {
    const { cards, card, isNewCard, beatId, lineId } = props
    let cardObj = {}
    if (isNewCard) {
      cardObj = state.card || {
        ...cloneDeep(initialState.card),
        beatId,
        lineId
      }
    } else {
      const cardFromRedux = cards.find((c) => c.id == card.id)
      cardObj = state.changes ? state.card : cardFromRedux || state.card
    }
    return {
      card: cardObj,
      isNewCard: state.isNewCard === undefined ? isNewCard : state.isNewCard,
      changes: state.changes === undefined ? isNewCard : state.changes
    }
  }

  saveChanges = () => {
    const { changes, isNewCard, card } = this.state
    if (!changes) return
    if (isNewCard) {
      this.props.actions.addCard(card)
    } else {
      this.props.actions.editCard(card.id, card.title, card.description)
    }
    this.setState({ isNewCard: false, changes: false })
    this.props.onClose()
  }

  changeChapter = (val) => {
    this.setState({ card: { ...this.state.card, beatId: val } })
    this.props.actions.changeBeat(this.state.card.id, val, this.props.bookId)
  }

  changeLine = (val) => {
    this.setState({ card: { ...this.state.card, lineId: val } })
    this.props.actions.changeLine(this.state.card.id, val, this.props.bookId)
  }

  navigateToAttachmentSelector = (type, selectedIds) => {
    this.props.navigation.navigate('AttachmentSelectorModal', {
      item: this.state.card,
      itemType: 'card',
      type,
      selectedIds
    })
  }

  getBeatById (id) {
    const { beats } = this.props
    const beat = beats.filter(({ id: beatId }) => beatId == id)[0]
    return beat
  }

  renderAttachments () {
    const { card, isNewCard } = this.state
    if (isNewCard) return null

    return (
      <AttachmentList
        itemType='card'
        item={card}
        navigate={this.props.navigation.navigate}
      />
    )
  }

  renderBeatMenuItem = (beat, i) => {
    const { positionOffset, card } = this.props
    const isSelected = card.beatId == beat.id
    const color = isSelected ? 'orange' : 'textGray'
    const fontStyle = isSelected ? 'bold' : 'semiBold'
    return (
      <ShellButton
        data={beat.id}
        key={i}
        style={styles.menuItem}
        onPress={this.changeChapter}>
        <Text fontStyle={fontStyle} color={color}>
          {helpers.beats.beatTitle(beat, positionOffset)}
        </Text>
      </ShellButton>
    )
  }

  renderBeatName = (id) => {
    const { beats } = this.props
    let i = 0
    let beatName = `Beat ${i + 1}`
    while (beats[i]) {
      if (beats[i].id == id) {
        beatName = beats[i].name
        i = -1
      } else i++
    }
    return beatName
  }

  render () {
    const { card, changes } = this.state
    console.log('card', card)
    const { beats, positionOffset } = this.props
    const { title } = card
    const beat = this.getBeatById(card.beatId)
    console.log('beats', beats)
    return (
      <Modal
        visible={true}
        // animationType='slide'
        transparent={true}
        onDismiss={this.props.onClose}
        onRequestClose={this.props.onClose}>
        <KeyboardAvoidingView behavior='padding' style={styles.avoidingView}>
          <View style={styles.window}>
            <ShellButton style={styles.closeButton}>
              <Icon style={styles.closeIcon} type='FontAwesome5' name='times' />
            </ShellButton>
            <ScrollView>
              <View style={styles.breadCrumbs}>
                <Popover
                  popoverStyle={styles.menuPopover}
                  from={
                    <ShellButton style={styles.crumb}>
                      <Text style={styles.chapterText}>
                        {helpers.beats.beatTitle(beat, positionOffset)}
                      </Text>
                      <Icon
                        style={styles.crumbIcon}
                        type='FontAwesome5'
                        name='chevron-down'
                      />
                    </ShellButton>
                  }>
                  <ScrollView style={styles.menuScroller}>
                    {beats.map(this.renderBeatMenuItem)}
                  </ScrollView>
                </Popover>

                <View style={styles.divider} />
                <ShellButton style={styles.crumb}>
                  <Text style={styles.chapterText}>Main Plot</Text>
                  <Icon
                    style={styles.crumbIcon}
                    type='FontAwesome5'
                    name='chevron-down'
                  />
                </ShellButton>
              </View>
              <View style={styles.form}>
                <View style={styles.row}>
                  <Text style={styles.label}>Title</Text>
                  <Input
                    value={title}
                    style={styles.input}
                    inputStyle={styles.inputText}
                    inset
                  />
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Description</Text>
                  <RichEditor
                    style={styles.multiInput}
                    initialValue='Makes impilsive decision to eat the pigs by sneaking into their home.'
                  />
                </View>
                <View style={styles.row}>
                  <View style={styles.labels}>
                    <Text style={styles.label}>Characters</Text>
                    <View style={styles.count}>
                      <Text style={styles.countText}>2</Text>
                    </View>
                    <ShellButton style={styles.collapseButton}>
                      <Text style={styles.collapseText}>See Less</Text>
                      <Icon
                        style={styles.collapseIcon}
                        type='FontAwesome5'
                        name='chevron-down'
                      />
                    </ShellButton>
                  </View>
                  <View style={styles.tabsBase}>
                    <View style={styles.tabCell}>
                      <Text style={styles.tabName}>Wolf</Text>
                      <ShellButton style={styles.removeButton}>
                        <Icon
                          style={styles.removeIcon}
                          type='FontAwesome5'
                          name='times'
                        />
                      </ShellButton>
                    </View>
                    <View style={styles.tabCell}>
                      <Text style={styles.tabName}>Mother Pig</Text>
                      <ShellButton style={styles.removeButton}>
                        <Icon
                          style={styles.removeIcon}
                          type='FontAwesome5'
                          name='times'
                        />
                      </ShellButton>
                    </View>
                    <ShellButton style={styles.addButton}>
                      <Icon
                        style={styles.addIcon}
                        type='FontAwesome5'
                        name='plus'
                      />
                    </ShellButton>
                  </View>
                </View>
              </View>
            </ScrollView>
            <View style={styles.actions}>
              <Button tight style={styles.action}>
                Save
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    )
  }
}

CardModal.propTypes = {
  card: PropTypes.object,
  beatId: PropTypes.number.isRequired,
  lineId: PropTypes.number.isRequired,
  closeDialog: PropTypes.func,
  lines: PropTypes.array.isRequired,
  beats: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  positionOffset: PropTypes.number.isRequired,
  cards: PropTypes.array.isRequired,
  bookId: PropTypes.number.isRequired,
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    positionOffset: selectors.positionOffsetSelector(state),
    beats: selectors.sortedBeatsByBookSelector(state),
    lines: selectors.sortedLinesByBookSelector(state),
    bookId: selectors.currentTimelineSelector(state),
    cards: state.cards
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(actions.card, dispatch),
    uiActions: bindActionCreators(actions.ui, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardModal)
