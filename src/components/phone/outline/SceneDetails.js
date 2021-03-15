import { cloneDeep } from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Icon, Label, Item, View } from 'native-base'
import { selectors, actions, initialState, newIds } from 'pltr/v2'
import { StyleSheet, Platform } from 'react-native'
import { t } from 'plottr_locales'
import ChapterPicker from '../../ui/ChapterPicker'
import LinePicker from '../../ui/LinePicker'
import SaveButton from '../../ui/SaveButton'
import AttachmentList from '../../shared/attachments/AttachmentList'
import DetailsScrollView from '../shared/DetailsScrollView'
import Colors from '../../../utils/Colors'
import Metrics from '../../../utils/Metrics'
import { Text, ShellButton, Input, RichEditor } from '../../shared/common'
import Fonts from '../../../fonts'
import {
  checkForChanges,
  addLeaveListener,
  removeLeaveListener
} from '../../../utils/Changes'
import { showAlert } from '../../shared/common/AlertDialog'

// cooresponds to CardDialog in desktop

class SceneDetails extends Component {
  static getDerivedStateFromProps (props, state) {
    const { cards } = props
    const { isNewCard, card } = state
    const oldCard = isNewCard ? {} : cards.find(c => c.id == card.id)
    const { tags = [], characters = [], places = [] } = oldCard
    return {
      card: { ...card, tags, characters, places }
    }
  }

  constructor (props) {
    super(props)
    const { route, cards, lines } = props
    const { isNewCard, card, chapterId } = route.params
    this.state = {
      isNewCard,
      chapterId,
      card: card || {
        ...cloneDeep(initialState.card),
        id: newIds.nextId(cards),
        beatId: chapterId,
        lineId: lines[0] && lines[0].id
      },
      changes: isNewCard
    }
  }

  componentDidMount () {
    this.setSaveButton()
    const { navigation } = this.props
    addLeaveListener(navigation, this.checkChanges, this.saveChanges)
  }

  componentWillUnmount () {
    removeLeaveListener(this.props.navigation, this.checkChanges)
  }

  componentDidUpdate () {
    this.setSaveButton()
  }

  checkChanges = (event) => {
    const { changes } = this.state
    const { navigation } = this.props
    checkForChanges(event, changes, this.saveChanges, navigation)
  }

  setSaveButton = () => {
    this.props.navigation.setOptions({
      headerRight: () => (
        <SaveButton changes={this.state.changes} onPress={this.saveChanges} />
      )
    })
  }

  plotlineError = () => {
    this.toastError(t('Please choose a plotline'))
  }

  toastError (errorText) {
    showAlert({
      message: errorText
    })
  }

  saveChanges = () => {
    const { changes, isNewCard, card } = this.state
    if (!changes) return
    if (!card.title) return this.toastError(t('Give your scene a title'))
    console.log('CARD', card)
    if (isNewCard) {
      if (!card.lineId) {
        return this.plotlineError()
      }
      this.props.actions.addCard({ ...card })
      this.props.navigation.setParams({ isNewCard: false })
    } else {
      this.props.actions.editCard(card.id, card.title, card.description)
    }
    this.setState({ isNewCard: false, changes: false })
  }

  changeChapter = (val) => {
    const { card } = this.state
    this.setState({ card: { ...card, beatId: val } })
    this.props.actions.changeBeat(card.id, val, this.props.bookId)
  }

  changeLine = (val) => {
    const { card } = this.state
    this.setState({ card: { ...card, lineId: val } })
    this.props.actions.changeLine(card.id, val, this.props.bookId)
  }

  navigateToAttachmentSelector = (type, selectedIds) => {
    this.props.navigation.navigate('AttachmentSelectorModal', {
      item: this.state.card,
      itemType: 'card',
      type,
      selectedIds
    })
  }

  setScroller = (ref) => (this.detailsScroller = ref)

  handleDescriptionChange = (description) => {
    const { card } = this.state
    console.log('description', description)
    this.setState({ card: { ...card, description }, changes: true })
  }

  handleTitleChange = (title) => {
    const { card } = this.state
    this.setState({ card: { ...card, title }, changes: true })
  }

  handleOnEditorFocus = () =>
    this.detailsScroller && this.detailsScroller.getScroller().scrollToEnd()

  handleAskToDelete = () => {
    const { card: { title } } = this.state
    showAlert({
      title: t('Delete Scene'),
      message: t('Are you sure you want to delete {name}?', { name: title })
        .replace('delete ', 'delete\n'),
      actions: [
        {
          name: t('Yes, Delete'),
          danger: true,
          callback: this.handleDeleteScene
        },
        {
          name: t('Cancel')
        }
      ]
    })
  }

  handleDeleteScene = () => {
    const { card: { id } } = this.state
    this.props.actions.deleteCard(id)
    this.props.navigation.goBack()
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

  render () {
    const {
      card,
      card: { title, description }
    } = this.state
    const chapterId = card.beatId || ''
    const lineId = card.lineId || ''
    return (
      <DetailsScrollView ref={this.setScroller}>
        <View style={styles.container}>
          <View inlineLabel last style={styles.label}>
            <Input
              inset
              label={`${t('Title')}:`}
              value={title}
              onChangeText={this.handleTitleChange}
              autoCapitalize='sentences'
              placeholder={t('Give your scene a title')}
              placeholderTextColor={Colors.lightGray}
            />
          </View>
          <Item fixedLabel style={styles.label}>
            <Text style={styles.labelText}>{t('Chapter')}:</Text>
            <ChapterPicker
              selectedId={chapterId}
              onChange={this.changeChapter}
            />
          </Item>
          <Item fixedLabel style={styles.label}>
            <Text fontStyle='semiBold'>{t('Plotline')}:</Text>
            <LinePicker selectedId={lineId} onChange={this.changeLine} />
          </Item>
          {this.renderAttachments()}
          <View style={[styles.afterList, styles.rceView]}>
            <Text fontStyle='semiBold' style={styles.label}>
              {t('Description')}:
            </Text>
            <RichEditor
              initialValue={description}
              placeholder={t('Describe the scene')}
              onFocus={this.handleOnEditorFocus}
              onChange={this.handleDescriptionChange}
            />
            {/*
            <RichEditor
              initialHTMLText={description}
              placeholder={t('Describe the scene')}
              onFocus={this.handleOnEditorFocus}
              onChange={this.handleDescriptionChange}
            />*/}
            <ShellButton
              onPress={this.handleAskToDelete}
              style={styles.trashButton}>
              <Icon
                type='FontAwesome5'
                name='trash'
                style={{ color: Colors.textGray, fontSize: Fonts.size.regular }} />
            </ShellButton>
          </View>
        </View>
      </DetailsScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
  },
  label: {
    marginBottom: Metrics.baseMargin
  },
  afterList: {
    marginTop: 16
  },
  badge: {
    marginRight: 8
  },
  rceView: {
    flex: 1
  },
  labelText: {
    ...Fonts.style.semiBold,
    fontSize: Fonts.size.h5
  },
  trashButton: {
    alignSelf: 'flex-end',
    marginTop: Metrics.baseMargin,
    padding: Metrics.baseMargin
  }
})

SceneDetails.propTypes = {
  card: PropTypes.object,
  chapterId: PropTypes.number.isRequired,
  lineId: PropTypes.number.isRequired,
  closeDialog: PropTypes.func,
  lines: PropTypes.array.isRequired,
  chapters: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  positionOffset: PropTypes.number.isRequired,
  cards: PropTypes.array.isRequired,
  bookId: PropTypes.number.isRequired,
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    chapters: selectors.sortedBeatsByBookSelector(state),
    lines: selectors.sortedLinesByBookSelector(state),
    positionOffset: selectors.positionOffsetSelector(state),
    cards: state.cards,
    bookId: selectors.currentTimelineSelector(state)
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(actions.card, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SceneDetails)
