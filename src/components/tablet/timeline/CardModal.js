import { cloneDeep } from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { View, Icon } from 'native-base'
import { selectors, actions, helpers, initialState } from 'pltr/v2'
import { Modal, ScrollView, KeyboardAvoidingView } from 'react-native'
import { t } from 'plottr_locales'
import {
  Input,
  Text,
  Button,
  RichEditor,
  ShellButton,
  Attachments
} from '../../shared/common'
import styles from './CardModalStyles'
import Popover, { PopoverPlacement } from 'react-native-popover-view'
import Collapsible from 'react-native-collapsible'

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

  handleClose = () => {
    const { onClose } = this.props
    onClose && onClose()
  }

  handleSaveChanges = () => {
    const { changes, isNewCard, card } = this.state
    if (!changes) return
    if (isNewCard) {
      this.props.actions.addCard(card)
    } else {
      console.log(card.id, card.title, card.description)
      this.props.actions.editCard(card.id, card.title, card.description, [], {})
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

  getBeatById (id) {
    const { beats } = this.props
    const beat = beats.filter(({ id: beatId }) => beatId == id)[0]
    return beat
  }

  toggleCollapse (stateName) {
    return () => this.setState({ [stateName]: !this.state[stateName] })
  }

  handleSetTitle = (title) => {
    const { card } = this.state
    this.setState({ card: { ...card, title }, changes: true })
  }

  handleSetDescription = (description) => {
    const { card } = this.state
    this.setState({ card: { ...card, description }, changes: true })
  }

  renderBeatMenuItem = (beat, i) => {
    const {
      positionOffset,
      beatTree,
      hierarchyLevels,
      isSeries,
      hierarchyEnabled
    } = this.props
    const { card = {} } = this.state
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
          {helpers.beats.beatTitle(
            beatTree,
            beat,
            hierarchyLevels,
            positionOffset,
            hierarchyEnabled,
            isSeries
          )}
        </Text>
      </ShellButton>
    )
  }

  renderLineMenuItem = (line, i) => {
    const { card = {} } = this.state
    const isSelected = card.lineId == line.id
    const color = isSelected ? 'orange' : 'textGray'
    const fontStyle = isSelected ? 'bold' : 'semiBold'
    return (
      <ShellButton
        data={line.id}
        key={i}
        style={styles.menuItem}
        onPress={this.changeLine}>
        <Text fontStyle={fontStyle} color={color}>
          {line.title}
        </Text>
      </ShellButton>
    )
  }

  renderLineTitle () {
    const { lines = [] } = this.props
    const { card } = this.state
    const { lineId } = card
    const line = lines.filter((line) => line.id == lineId)[0]
    const lineTitle = (line && line.title) || 'Unnamed Plotline'
    return lineTitle
  }

  render () {
    const {
      card,
      changes,
      showCharacters = false,
      showPlaces = false,
      showTags = false
    } = this.state
    const {
      beats,
      lines,
      positionOffset,
      beatTree,
      hierarchyLevels,
      isSeries,
      hierarchyEnabled
    } = this.props
    const { id: cardId, title, description, beatId, characters, places, tags } =
      card || {}
    const beat = this.getBeatById(beatId)
    return (
      <Modal
        visible={true}
        // animationType='slide'
        transparent={true}
        onDismiss={this.props.onClose}
        onRequestClose={this.props.onClose}>
        <KeyboardAvoidingView behavior='padding' style={styles.avoidingView}>
          <View style={styles.window}>
            <ShellButton style={styles.closeButton} onPress={this.handleClose}>
              <Icon style={styles.closeIcon} type='FontAwesome5' name='times' />
            </ShellButton>
            <ScrollView>
              <View style={styles.breadCrumbs}>
                <Popover
                  popoverStyle={styles.menuPopover}
                  placement={PopoverPlacement.RIGHT}
                  from={
                    <ShellButton style={styles.crumb}>
                      <Text numberOfLines={1} style={styles.chapterText}>
                        {helpers.beats.beatTitle(
                          beatTree,
                          beat,
                          hierarchyLevels,
                          positionOffset,
                          hierarchyEnabled,
                          isSeries
                        )}
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
                <Popover
                  popoverStyle={styles.menuPopover}
                  // placement={PopoverPlacement.RIGHT}
                  from={
                    <ShellButton style={styles.crumb}>
                      <Text numberOfLines={1} style={styles.chapterText}>
                        {this.renderLineTitle()}
                      </Text>
                      <Icon
                        style={styles.crumbIcon}
                        type='FontAwesome5'
                        name='chevron-down'
                      />
                    </ShellButton>
                  }>
                  <ScrollView style={styles.menuScroller}>
                    {lines.map(this.renderLineMenuItem)}
                  </ScrollView>
                </Popover>
              </View>
              <View style={styles.form}>
                <View style={styles.row}>
                  <Text style={styles.label}>Title</Text>
                  <Input
                    value={title}
                    style={styles.input}
                    inputStyle={styles.inputText}
                    onChangeText={this.handleSetTitle}
                    inset
                  />
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Description</Text>
                  <RichEditor
                    style={styles.multiInput}
                    initialValue={description}
                    onChange={this.handleSetDescription}
                  />
                </View>
                <View style={styles.row}>
                  <View style={styles.labels}>
                    <Text style={styles.label}>Characters</Text>
                    <View style={styles.count}>
                      <Text style={styles.countText}>{characters.length}</Text>
                    </View>
                    <ShellButton
                      style={styles.collapseButton}
                      onPress={this.toggleCollapse('showCharacters')}>
                      <Text style={styles.collapseText}>
                        See {showCharacters ? 'More' : 'Less'}
                      </Text>
                      <Icon
                        style={[
                          styles.collapseIcon,
                          showCharacters && styles.collapsedIcon
                        ]}
                        type='FontAwesome5'
                        name='chevron-down'
                      />
                    </ShellButton>
                  </View>
                  <Collapsible collapsed={showCharacters}>
                    <Attachments
                      cardId={cardId}
                      attachments={characters}
                      type={'character'}
                      sourceType={'card'}
                    />
                  </Collapsible>
                </View>
                <View style={styles.row}>
                  <View style={styles.labels}>
                    <Text style={styles.label}>Places</Text>
                    <View style={styles.count}>
                      <Text style={styles.countText}>{places.length}</Text>
                    </View>
                    <ShellButton
                      style={styles.collapseButton}
                      onPress={this.toggleCollapse('showPlaces')}>
                      <Text style={styles.collapseText}>
                        See {showPlaces ? 'More' : 'Less'}
                      </Text>
                      <Icon
                        style={[
                          styles.collapseIcon,
                          showPlaces && styles.collapsedIcon
                        ]}
                        type='FontAwesome5'
                        name='chevron-down'
                      />
                    </ShellButton>
                  </View>
                  <Collapsible collapsed={showPlaces}>
                    <Attachments
                      cardId={cardId}
                      attachments={places}
                      type={'place'}
                      sourceType={'card'}
                    />
                  </Collapsible>
                </View>
                <View style={styles.row}>
                  <View style={styles.labels}>
                    <Text style={styles.label}>Tags</Text>
                    <View style={styles.count}>
                      <Text style={styles.countText}>{tags.length}</Text>
                    </View>
                    <ShellButton
                      style={styles.collapseButton}
                      onPress={this.toggleCollapse('showTags')}>
                      <Text style={styles.collapseText}>
                        See {showTags ? 'More' : 'Less'}
                      </Text>
                      <Icon
                        style={[
                          styles.collapseIcon,
                          showTags && styles.collapsedIcon
                        ]}
                        type='FontAwesome5'
                        name='chevron-down'
                      />
                    </ShellButton>
                  </View>
                  <Collapsible collapsed={showTags}>
                    <Attachments
                      cardId={cardId}
                      attachments={tags}
                      type={'tag'}
                      sourceType={'card'}
                    />
                  </Collapsible>
                </View>
              </View>
            </ScrollView>
            <Collapsible style={styles.actions} collapsed={!changes}>
              <Button
                tight
                style={styles.action}
                onPress={this.handleSaveChanges}>
                Save
              </Button>
            </Collapsible>
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
  route: PropTypes.object.isRequired,
  beatTree: PropTypes.object.isRequired,
  hierarchyLevels: PropTypes.array.isRequired,
  isSeries: PropTypes.bool.isRequired,
  hierarchyEnabled: PropTypes.bool
}

function mapStateToProps (state) {
  return {
    positionOffset: selectors.positionOffsetSelector(state),
    beats: selectors.sortedBeatsByBookSelector(state),
    lines: selectors.sortedLinesByBookSelector(state),
    bookId: selectors.currentTimelineSelector(state),
    cards: state.cards,
    beatTree: selectors.beatsByBookSelector(state),
    hierarchyLevels: selectors.sortedHierarchyLevels(state),
    isSeries: selectors.isSeriesSelector(state),
    hierarchyEnabled: selectors.beatHierarchyIsOn(state)
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(actions.card, dispatch),
    uiActions: bindActionCreators(actions.ui, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardModal)
