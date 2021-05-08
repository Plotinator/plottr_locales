import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import {
  TouchableWithoutFeedback,
  Animated,
  FlatList,
  ScrollView,
  StyleSheet,
  View,
  Vibration
} from 'react-native'
import { bindActionCreators } from 'redux'
import { t } from 'plottr_locales'
import ChapterTitleCell from './ChapterTitleCell'
import { BlankCell } from './BlankCell'
import Cell from '../shared/Cell'
import CardCell from './CardCell'
import CardModal from './CardModal'
import { CELL_HEIGHT, CELL_WIDTH, MIGRATION_VERSION } from '../../../utils/constants'
import { Icon } from 'native-base'
import tinycolor from 'tinycolor2'
import LineTitleCell from './LineTitleCell'
import ColorPickerModal from '../shared/ColorPickerModal'
import { Text, Input, Button, ShellButton, ModalBox } from '../../shared/common'
import styles from './TimelineStyles'
import { showAlert } from '../../shared/common/AlertDialog'
import { cloneDeep } from 'lodash'

import { actions, selectors, helpers, newIds } from 'pltr/v2'
import Migrator from '../../../../lib/pltr/v2/migrator/migrator'
const {
  beats: { nextId },
  lists: { reorderList },
} = helpers

const {
  visibleSortedBeatsByBookSelector,
  sortedLinesByBookSelector,
  linePositionMappingSelector
} = selectors

class Timeline extends Component {
  constructor (props) {
    super(props)
    this.headerScrollView = null
    this.scrollPosition = new Animated.Value(0)
    this.scrollX = 0
    this.scrollEvent = Animated.event(
      [{ nativeEvent: { contentOffset: { x: this.scrollPosition } } }],
      { useNativeDriver: false }
    )
    this.verticalScrollPosition = new Animated.Value(0)
    this.scrollY = 0
    this.verticalScrollEvent = Animated.event(
      [{ nativeEvent: { contentOffset: { y: this.verticalScrollPosition } } }],
      { useNativeDriver: false }
    )
    this.state = {
      showCardModal: false,
      lineMapKeys: {},
      showColorPicker: false,
      currentLine: {},
      currentBeat: {},
    }
    this.dropCoordinates = []
  }

  static getDerivedStateFromProps (props, state) {
    const { lineMap } = props
    return {
      lineMapKeys: Object.keys(lineMap),
      showColorPicker: state.showColorPicker
    }
  }

  componentDidMount () {
    this.listener = this.scrollPosition.addListener((position) => {
      this.scrollX = position.value
      this.headerScrollView.scrollTo({ x: position.value, animated: false })
    })
    this.listener = this.verticalScrollPosition.addListener((position) => {
      this.scrollY = position.value
    })
  }

  componentWillUnmount () {
    this.scrollPosition.removeAllListeners()
    this.verticalScrollPosition.removeAllListeners()
  }

  handleAppendLine = () => {
    const title = t('New Plotline')
    this.props.lineActions.addLineWithTitle(title, this.props.bookId)
  }

  handleAppendBeat = () => {
    const { bookId, beatActions } = this.props
    beatActions.addBeat(bookId)
  }

  registerDropCoordinate = (cell) => {
    // ignore ids of 'new'
    if (cell.beatId == 'new' || cell.lineId == 'new') return
    // this offset is important for
    // mid scrolling updates
    if (this.scrollX) cell.x = Number(this.scrollX) + Number(cell.x)
    if (this.scrollY) cell.y = Number(this.scrollY) + Number(cell.y)
    this.dropCoordinates.push(cell)
  }

  dropCard = (x, y, droppedCard) => {
    const trueX = x + this.scrollX
    const trueY = y + this.scrollY
    let moveToBeatId = null
    let moveToLineId = null
    let moveToIsBlank = false
    const success = this.dropCoordinates.some((coord) => {
      // using .some to short circuit once we find one
      // check if it's within this one's bounds
      if (this.isWithinCell (trueX, trueY, coord)) {
        // do nothing for dropping on itself
        if (
          coord.beatId != droppedCard.beatId ||
          coord.lineId != droppedCard.lineId
        ) {
          moveToBeatId = coord.beatId
          moveToLineId = coord.lineId
          moveToIsBlank = coord.isBlank
          return true
        }
      }
      return false
    })
    if (success) {
      // remove the two that have changed
      // only one has changed if moveToIsBlank == false
      // when moving creates a scene stack, there are a lot more that re-register. Need to figure out which ones
      this.dropCoordinates = this.dropCoordinates.filter((coord) => {
        // TODO: remove duplicates
        if (
          droppedCard.beatId == coord.beatId &&
          droppedCard.lineId == coord.lineId
        )
          return false
        if (
          moveToIsBlank &&
          moveToBeatId == coord.beatId &&
          moveToLineId == coord.lineId
        )
          return false
        return true
      })
      Vibration.vibrate()
      // move the card to these coordinates
      this.props.cardActions.editCardCoordinates(
        droppedCard.id,
        moveToLineId,
        moveToBeatId,
        this.props.bookId
      )
    }
    return success
  }

  isWithinCell = (x, y, pair) => {
    const withinWidth = x > pair.x && x < pair.x + CELL_WIDTH
    const withinHeight = y > pair.y && y < pair.y + CELL_HEIGHT
    return withinWidth && withinHeight
  }

  showColorPicker = () => this.setState({ showColorPicker: true })
  hideColorPicker = () => this.setState({ showColorPicker: false })

  handleScroll = (e) => {
    console.log('HANDLE SCROLL')
    if (this.headerScrollView) {
      let scrollX = e.nativeEvent.contentOffset.x
      this.headerScrollView.scrollTo({ x: scrollX, animated: false })
    }
  }

  handleEditBeat = (beat) => {
    this.setState(
      {
        currentBeat: { ...beat }
      },
      () => {
        this._BeatModal.show()
      }
    )
  }

  handleHideBeatModal = () => this._BeatModal.hide()

  handleSetBeatTitle = (title) => {
    const { currentBeat } = this.state
    currentBeat.title = title
    this.setState({ currentBeat })
  }

  handleClearCurrentBeat = (title) => {
    this.setState({ currentBeat: {} })
  }

  handleSaveBeat = () => {
    const { currentBeat: { id, bookId, title } } = this.state
    const {
      beatActions,
      beatTree,
      hierarchyLevels,
      isSeries,
      hierarchyEnabled
    } = this.props
    this._BeatModal.hide()
    beatActions.editBeatTitle(id, bookId, title || 'auto')
    this.handleClearCurrentBeat()
  }

  handleAskToDeleteBeat = () => {
    // delay for 1 sec
    const { currentBeat, currentBeat: { title } } = this.state
    const {
      positionOffset,
      beatTree,
      hierarchyLevels,
      isSeries,
      hierarchyEnabled
    } = this.props
    const name = helpers.beats.beatTitle(
      beatTree,
      currentBeat,
      hierarchyLevels,
      positionOffset,
      hierarchyEnabled,
      isSeries
    )
    showAlert({
      title: t('Delete Chapter'),
      message: t('Delete Chapter {name}?', { name }),
      actions: [{
        icon: 'trash',
        danger: true,
        name: t('Delete Chapter'),
        callback: this.handleDeleteBeat
      },
      {
        name: t('Cancel')
      }]
    })
  }

  handleDeleteBeat = () => {
    const { currentBeat: { id, bookId } } = this.state
    const { beatActions } = this.props
    this._BeatModal.hide()
    beatActions.deleteBeat(id, bookId)
    this.handleClearCurrentBeat()
  }

  handleHideColorPicker = () => this.setState({ showColorPicker: false })

  handleShowColorPicker = () => this.setState({ showColorPicker: true })

  handleEditPlotLine = (line) => {
    this.setState(
      {
        currentLine: { ...line }
      },
      () => {
        this._PlotModal.show()
      }
    )
  }

  handleCurrentLineColor = (color) => {
    const { currentLine } = this.state
    currentLine.color = color
    this.setState({
      currentLine,
      showColorPicker: false
    })
  }

  handleCloseColorPicker = (color) => {
    this.setState({
      showColorPicker: false
    })
  }

  handleSetPlotTitle = (title) => {
    const { currentLine } = this.state
    currentLine.title = title
    this.setState({ currentLine })
  }

  handleSetPlotColor = (color) => {
    const { currentLine } = this.state
    currentLine.color = color
    this.setState({ currentLine })
  }

  handleDeletePlotline = () => {
    const {
      currentLine: { title, id, bookId }
    } = this.state
    this._PlotModal.hide()
    setTimeout(() => {
      // delay for 1 sec
      showAlert({
        title: t('Delete Plotline'),
        message: t('Delete Plotline {name}?', { name: title }),
        actions: [
          {
            id,
            bookId,
            icon: 'trash',
            danger: true,
            name: t('Yes, Delete'),
            callback: this.handleDeleteLine
          },
          {
            name: t('Cancel')
          }
        ]
      })
    }, 300)
  }

  handleDeleteLine = ({ id, bookId }) => {
    const { lineActions } = this.props
    this._PlotModal.hide()
    lineActions.deleteLine(id, bookId)
    this.handleClearCurrentLine()
  }

  handleSavePlotline = () => {
    const {
      currentLine: { id, title, color }
    } = this.state
    const { lineActions } = this.props
    lineActions.editLine(id, title, color)
    this._PlotModal.hide()
  }

  handleClearCurrentLine = () => {
    this.setState({ currentLine: {} })
  }

  handleMoveBeat = (unboundedBeatPosition, beat) => {
    const { beats, bookId } = this.props
    const newBeatPosition = unboundedBeatPosition < 0 ? 0 : unboundedBeatPosition;
    if (!beats[newBeatPosition]) return
    this.props.beatActions.reorderBeats(
      beat.id,
      beats[newBeatPosition].id,
      bookId
    )
  }

  handleMoveLine = (NewPosition, line) => {
    const { lines, bookId, linesMaxCards } = this.props
    const sizeMultiplier = this.getMaxCards(line.id)
    const { position } = line
    const maxlines = lines.length - 1
    const Sortedlines = cloneDeep(lines).sort((lineA, lineB) =>
      lineA.position > lineB ? -1 : 1
    )
    const NewlinePosition =
      NewPosition < 0 ? 0 : NewPosition > maxlines ? maxlines : NewPosition
    const isNegative = position > NewPosition
    let TruePosition = NewPosition - sizeMultiplier
    let lastPosition = NewlinePosition
    let Moves = isNegative
      ? position - TruePosition - sizeMultiplier
      : TruePosition - position
    let InsertPosition = 0
    console.log('isNegative', InsertPosition)

    if (isNegative) {
      const prePosition = position - 1
      lastPosition -= 1
      for (let i = prePosition; i > lastPosition; i--) {
        const lineId = lines[i]?.id
        const multiplier = this.getMaxCards(lineId)
        lastPosition += multiplier
        Moves -= multiplier
      }
      InsertPosition = position - Moves < 0 ? 0 : position - Moves
    } else {
      const postPosition = position + 1
      console.log('postPosition', postPosition)
      console.log('lastPosition', lastPosition)
      for (let i = postPosition; i < lastPosition; i++) {
        const lineId = lines[i]?.id
        const multiplier = this.getMaxCards(lineId)
        console.log('multiplier', multiplier)
        lastPosition -= multiplier
        Moves -= multiplier
      }
      InsertPosition = position + Moves
    }
    console.log('Moves', Moves)
    console.log('InsertPosition', InsertPosition)
    const Prelines = Sortedlines.slice(0, position)
    const Postlines = Sortedlines.slice(position + 1, lines.length)
    const Newlines = [].concat(Prelines).concat(Postlines)
    console.log('Prelines', Prelines)
    console.log('Postlines', Postlines)
    Newlines.splice(InsertPosition, 0, cloneDeep(line))
    Newlines.map((line, o) => (line.position = o))
    this.props.lineActions.reorderLines(Newlines, bookId)
  }

  handleEditCard = (card) => {
    this.setState({
      showCardModal: true,
      card
    })
  }

  handleHideCardModal = () => {
    this.setState({
      showCardModal: false
    })
  }

  getMaxCards (id) {
    const { linesMaxCards } = this.props
    return (linesMaxCards[id] || 1) - 1
  }

  setPlotModalRef = (ref) => (this._PlotModal = ref)
  setBeatModalRef = (ref) => (this._BeatModal = ref)

  renderCardModal () {
    const { showCardModal, card } = this.state
    const { navigation } = this.props
    if (!showCardModal) return null
    return (
      <CardModal
        card={card}
        navigation={navigation}
        onClose={this.handleHideCardModal}
      />
    )
  }

  renderBlankLineTitleCell (key) {
    return <Cell key={key} style={styles.lineTitleCell} />
  }

  renderSpacerCard (key) {
    return <Cell key={key} />
  }

  renderPlusButton (id, onPress) {
    return (
      <Cell key={id} style={styles.addCell} onPress={onPress}>
        <Icon type='FontAwesome5' name='plus' style={styles.plusButton} />
      </Cell>
    )
  }

  renderCornerCell () {
    return <Cell key='corner-cell' style={styles.cornerCell} />
  }

  renderBeatColumn = (section) => {
    let { item: beat } = section
    let cells = []
    if (beat.new) {
      cells = [<Cell key='+'></Cell>]
    } else {
      const { lineMap, cardMap, linesMaxCards } = this.props
      const { lineMapKeys } = this.state
      cells = lineMapKeys.reduce((acc, linePosition) => {
        const line = lineMap[linePosition]
        const lineMaxCards = linesMaxCards[line.id]
        const cards = cardMap[`${line.id}-${beat.id}`]
        const key = `${cards ? 'card' : 'blank'}-${
          beat.position
        }-${linePosition}`
        if (cards) {
          cards.forEach((c, idx) =>
            acc.push(
              <CardCell
                key={`${key}-${idx}`}
                card={c}
                color={line.color}
                showLine={idx == 0}
                register={this.registerDropCoordinate}
                handleDrop={this.dropCard}
                navigation={this.props.navigation}
                onEditCard={this.handleEditCard}
              />
            )
          )
          if (cards.length < lineMaxCards) {
            for (let i = cards.length; i < lineMaxCards; i++) {
              acc.push(this.renderSpacerCard(`${key}-spacer-${i}`))
            }
          }
        } else {
          acc.push(
            <BlankCell
              key={key}
              color={line.color}
              register={this.registerDropCoordinate}
              lineId={line.id}
              beatId={beat.id}
              handleDrop={this.dropCard}
              navigation={this.props.navigation}
            />
          )
          if (lineMaxCards > 1) {
            for (let i = 1; i < lineMaxCards; i++) {
              acc.push(this.renderSpacerCard(`${key}-spacer-${i}`))
            }
          }
        }

        return acc
      }, [])
    }
    // TODO: dont use corner cell
    cells.push(this.renderCornerCell()) // needed to show the + line cell

    return <View style={styles.column}>{cells}</View>
  }

  renderBeatTitles () {
    const { beats, bookId } = this.props
    let cols = beats.map((ch) => (
      <ChapterTitleCell
        beat={ch}
        key={ch.id}
        beatId={ch.id}
        bookId={bookId}
        moveBeat={this.handleMoveBeat}
        onEditBeat={this.handleEditBeat}
      />
    ))
    cols.push(this.renderPlusButton('new-chapter', this.handleAppendBeat))

    return (
      <View style={styles.header}>
        {this.renderCornerCell()}
        <ScrollView
          ref={(ref) => (this.headerScrollView = ref)}
          horizontal={true}
          scrollEnabled={false}
          scrollEventThrottle={16}>
          <TouchableWithoutFeedback>
            <View style={styles.table}>{cols}</View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </View>
    )
  }

  renderLineTitles () {
    const { lines, linesMaxCards } = this.props
    let cells = lines.reduce((acc, line) => {
      acc.push(
        <LineTitleCell
          key={line.id}
          line={line}
          editPlotLine={this.handleEditPlotLine}
          moveLine={this.handleMoveLine}
        />
      )
      // start at 1 because the first cell is the title cell
      for (i = 1; i < linesMaxCards[line.id]; i++) {
        acc.push(this.renderBlankLineTitleCell(`${line.id}-blank-${i}`))
      }
      return acc
    }, [])
    cells.push(this.renderPlusButton('new-line', this.handleAppendLine))

    return <View style={styles.lineTitlesColumn}>{cells}</View>
  }

  renderPlotlineModal () {
    const {
      currentLine: { title, color }
    } = this.state
    return (
      <ModalBox
        title={t('Edit Plotline')}
        ref={this.setPlotModalRef}
        onHide={this.handleClearCurrentLine}>
        <View style={styles.row}>
          <Input
            inset
            small
            multiline
            numberOfLines={3}
            label={t('Title')}
            value={title}
            autoCapitalize='sentences'
            onChangeText={this.handleSetPlotTitle}
          />
        </View>
        <View style={styles.row}>
          <Input
            inset
            small
            label={t('Color')}
            style={styles.input}
            value={color}
            onChangeText={this.handleSetPlotColor}
          />
          <ShellButton
            style={[
              styles.colorSwatch,
              { backgroundColor: tinycolor(color).toHexString() }
            ]}
            onPress={this.handleShowColorPicker}>
            <Icon name='pen' type='FontAwesome5' style={styles.pen} />
          </ShellButton>
        </View>
        <View style={[styles.row, styles.last]}>
          <View style={styles.ctaButtons}>
            <Button
              center
              style={styles.button}
              onPress={this.handleSavePlotline}>
              {t('Save Plotline')}
            </Button>
            <Button
              center
              buttonColor='transparent'
              style={styles.trashButton}
              onPress={this.handleDeletePlotline}>
              <Icon name='trash' type='FontAwesome5' style={styles.trash} />
            </Button>
          </View>
        </View>
      </ModalBox>
    )
  }

  renderBeatModal () {
    const {
      currentBeat: { title }
    } = this.state
    return (
      <ModalBox
        title={t('Edit Chapter')}
        ref={this.setBeatModalRef}
        onHide={this.handleClearCurrentBeat}>
        <View style={styles.row}>
          <Text center fontStyle='semiBold' fontSize='tiny'>
            {t('Enter Chapter\'s name or enter')}
          </Text>
        </View>
        <View style={styles.row}>
          <Input
            inset
            small
            multiline
            // numberOfLines={3}
            label={t('Title')}
            value={title}
            placeholder='auto'
            autoCapitalize='sentences'
            onChangeText={this.handleSetBeatTitle}
          />
        </View>
        <View style={[styles.row, styles.last]}>
          <View style={styles.ctaButtons}>
            <Button
              center
              style={styles.button}
              onPress={this.handleSaveBeat}>
              {t('Save Chapter')}
            </Button>
            <Button
              center
              buttonColor='transparent'
              style={styles.trashButton}
              onPress={this.handleAskToDeleteBeat}>
              <Icon name='trash' type='FontAwesome5' style={styles.trash} />
            </Button>
          </View>
        </View>
      </ModalBox>
    )
  }

  renderColorPicker () {
    const {
      showColorPicker,
      currentLine: { color = 'red' }
    } = this.state
    return (
      <ColorPickerModal
        visible={showColorPicker}
        chooseColor={this.handleCurrentLineColor}
        currentColor={color}
        onClose={this.handleCloseColorPicker}
      />
    )
  }

  renderBody () {
    const { beats } = this.props
    const cells = [...beats, { id: 'new' }] // 'new' is needed to show the + chapter cell

    return (
      <View>
        {this.renderLineTitles()}
        <FlatList
          style={styles.body}
          horizontal={true}
          data={cells}
          renderItem={this.renderBeatColumn}
          keyExtractor={(item) => item.id.toString()}
          stickyHeaderIndices={[0]}
          onScroll={this.scrollEvent}
          scrollEventThrottle={16}
          extraData={this.state}
        />
      </View>
    )
  }

  renderMainRow = (section) => {
    let { item } = section
    return item.render
  }

  render () {
    let body = this.renderBody()
    let data = [{ key: 'body', render: body }]
    const { showCardModal } = this.state
    return (
      <View style={styles.container}>
        {this.renderBeatTitles()}
        {this.renderColorPicker()}
        <FlatList
          data={data}
          renderItem={this.renderMainRow}
          onScroll={this.verticalScrollEvent}
        />
        {this.renderPlotlineModal()}
        {this.renderCardModal()}
        {this.renderBeatModal()}
      </View>
    )
  }
}

Timeline.propTypes = {
  lineMap: PropTypes.object.isRequired,
  nextBeatId: PropTypes.number,
  beats: PropTypes.array,
  lines: PropTypes.array,
  seriesLines: PropTypes.array,
  cardMap: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  bookId: PropTypes.any,
  navigation: PropTypes.object.isRequired,
  beatTree: PropTypes.object.isRequired,
  hierarchyLevels: PropTypes.array.isRequired,
  isSeries: PropTypes.bool.isRequired,
  hierarchyEnabled: PropTypes.bool
}

function mapStateToProps (state) {
   let nextBeatId = -1
  const bookId = selectors.currentTimelineSelector(state)
  nextBeatId = nextId(state.beats)
  return {
    beats: visibleSortedBeatsByBookSelector(state),
    lineMap: sortedLinesByBookSelector(state),
    linesMaxCards: selectors.lineMaxCardsSelector(state),
    nextBeatId: nextBeatId,
    lines: sortedLinesByBookSelector(state),
    cardMap: selectors.cardMapSelector(state),
    positionOffset: selectors.positionOffsetSelector(state),
    ui: state.ui,
    bookId: bookId,
    beatTree: selectors.beatsByBookSelector(state),
    hierarchyLevels: selectors.sortedHierarchyLevels(state),
    isSeries: selectors.isSeriesSelector(state),
    hierarchyEnabled: selectors.beatHierarchyIsOn(state)
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(actions.ui, dispatch),
    lineActions: bindActionCreators(actions.line, dispatch),
    cardActions: bindActionCreators(actions.card, dispatch),
    beatActions: bindActionCreators(actions.beat, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Timeline)
