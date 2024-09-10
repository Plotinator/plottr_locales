import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { FaCircle } from '@react-icons/all-files/fa/FaCircle'
import cx from 'classnames'

import { selectors, actions } from 'wired-up-pltr'
import { helpers } from 'pltr'
import { t as i18n } from 'plottr_locales'

import Glyphicon from '../Glyphicon'
import CardView from './card/CardView'
import { delay } from '../../utils/delay'

const {
  card: { sortCardsInBeat },
  beats: { beatTitle },
  lists: { moveToAbove },
} = helpers

class BeatView extends Component {
  beatRef
  titleRef

  state = {
    sortedCards: [],
    inDropZone: false,
    dropDepth: 0,
    cardsToRender: this.props.cards.length,
    isMovingToNewBeat: false,
    draggedCardBeatId: null,
  }

  updateCardsToRender() {
    if (this.state.cardsToRender >= this.props.cards.length) return

    delay(() => {
      this.setState({ cardsToRender: this.state.cardsToRender + 1 })
      this.updateCardsToRender()
    })
  }

  componentDidUpdate() {
    if (this.props.cards.length >= this.state.cardsToRender) {
      this.updateCardsToRender()
    }
  }

  componentDidMount() {
    this.updateCardsToRender()
  }

  static getDerivedStateFromProps(nextProps, _nextState) {
    const { beat, cards, lines } = nextProps
    const sortedCards = sortCardsInBeat(beat.autoOutlineSort, cards, lines)
    return { sortedCards }
  }

  autoSortBeat = () => {
    const { beatActions, beat, currentTimeline } = this.props
    beatActions.autoSortBeat(beat.id, currentTimeline)
  }

  reorderCards = ({ current, currentIndex, dropped }) => {
    const { sortedCards } = this.state
    const { beat, actions, currentTimeline } = this.props
    // @ts-ignore
    const currentIds = sortedCards.map((c) => c.id)
    const currentLineId = current.lineId
    let newOrderInBeat = []
    let newOrderWithinLine = null

    // already in beat
    if (currentIds.includes(dropped.cardId)) {
      // flip it to manual sort
      newOrderInBeat = moveToAbove(dropped.index, currentIndex, currentIds)
      if (dropped.lineId == currentLineId) {
        // if same line, also update positionWithinLine
        // @ts-ignore
        const cardIdsInLine = sortedCards.filter((c) => c.lineId == currentLineId).map((c) => c.id)
        // @ts-ignore
        const currentPosition = sortedCards.find((c) => c.id == dropped.cardId).positionWithinLine
        newOrderWithinLine = moveToAbove(currentPosition, current.positionWithinLine, cardIdsInLine)
      }
      actions.reorderCardsInBeat(
        beat.id,
        currentLineId,
        newOrderInBeat,
        newOrderWithinLine,
        undefined,
        currentTimeline
      )
    } else {
      // dropped in from a different beat
      if (dropped.lineId == currentLineId) {
        // if same line, can just update positionWithinLine
        let cardIdsWithinLine = sortedCards
          // @ts-ignore
          .filter((c) => c.lineId == currentLineId)
          // @ts-ignore
          .map((c) => c.id)

        if (cardIdsWithinLine.length === 1) {
          cardIdsWithinLine = [dropped.cardId]
        } else {
          cardIdsWithinLine.splice(current.positionWithinLine, 0, dropped.cardId)
        }
        actions.reorderCardsWithinLine(beat.id, currentLineId, cardIdsWithinLine)
      } else {
        // flip to manual sort
        newOrderInBeat = currentIds
        newOrderInBeat.splice(currentIndex, 0, dropped.cardId)
        actions.reorderCardsInBeat(
          beat.id,
          currentLineId,
          newOrderInBeat,
          null,
          dropped.cardId,
          currentTimeline
        )
      }
    }
  }

  renderManualSort() {
    const { cards, beat } = this.props
    if (cards.length === 0 || cards[0].isEmpty || cards.length === 1) return null
    if (beat.autoOutlineSort) return null

    return (
      <small className="outline__beat-manual-sort" onClick={this.autoSortBeat}>
        {i18n('Manually Sorted')} <Glyphicon glyph="remove-sign" />
      </small>
    )
  }

  handleDragCard = (beatId) => {
    this.setState({ draggedCardBeatId: beatId, isMovingToNewBeat: false })
  }

  handleDropCard = () => {
    this.setState({ draggedCardBeatId: null, isMovingToNewBeat: false })
  }

  renderCards() {
    const { beat, beatIndex, beats, hierarchyLevels, positionOffset, isFirstBeat, isLastBeat } =
      this.props
    const allCards = this.state.sortedCards.slice(0, this.state.cardsToRender)
    return allCards.map((c, idx) => {
      return (
        <CardView
          // @ts-ignore
          key={c.id}
          // @ts-ignore
          cardId={c.id}
          index={idx}
          isLastCard={allCards.length - 1 === idx}
          isFirstCard={!idx}
          inFirstBeat={isFirstBeat}
          inLastBeat={isLastBeat}
          reorder={this.reorderCards}
          beatId={this.props.beat.id}
          onDragCardStart={this.handleDragCard}
          onDropCard={this.handleDropCard}
          beatTitle={beatTitle(beatIndex, beats, beat, hierarchyLevels, positionOffset)}
        />
      )
    })
  }

  handleDragEnter = () => {
    this.setState({ dropDepth: this.state.dropDepth + 1 })
  }

  handleDragOver = (e, beatId) => {
    const { outlineView } = this.props
    const { draggedCardBeatId } = this.state
    e.preventDefault()
    this.setState({ inDropZone: true })

    if (outlineView === 'plan' && beatId != draggedCardBeatId) {
      this.setState({ isMovingToNewBeat: true, draggedCardBeatId: beatId })
    }
  }

  handleDragLeave = (e) => {
    let { dropDepth, draggedCardBeatId } = this.state
    --dropDepth
    this.setState({ dropDepth: dropDepth })

    if (dropDepth > 0) return
    this.setState({ inDropZone: false })

    if (
      !this.beatRef?.current?.contains(e.relatedTarget) &&
      typeof draggedCardBeatId !== 'undefined'
    ) {
      this.setState({ draggedCardBeatId: null, isMovingToNewBeat: null })
    }
  }

  handleDrop = (e) => {
    e.stopPropagation()
    e.preventDefault()
    this.setState({ inDropZone: false, dropDepth: 0 })

    const json = e.dataTransfer.getData('text/json')
    const droppedData = helpers.json.safeParseJSON(json)
    if (!droppedData?.cardId) return

    this.reorderCards({
      current: droppedData,
      currentIndex: droppedData.index,
      dropped: droppedData,
    })
    this.setState({ draggedCardBeatId: null, isMovingToNewBeat: false })
  }

  renderDropZone = () => {
    if (!this.state.inDropZone) return null
    if (this.props.cards.length === 0 || !this.props.cards[0].isEmpty) return null

    return (
      <div className="outline__card-drop">
        <FaCircle />
      </div>
    )
  }

  render() {
    const {
      beat,
      beats,
      hierarchyLevels,
      darkMode,
      cards,
      activeFilter,
      positionOffset,
      beatIndex,
      outlineView,
      isFirstBeat,
      isLastBeat,
      showFulltextBeatTitle,
      previousBeatHasCard,
      showFulltextBeatGaps,
      fulltextBeatTitleAlignment,
    } = this.props
    const { draggedCardBeatId, isMovingToNewBeat } = this.state
    if (activeFilter && !cards.length) return null

    const isFulltext = outlineView === 'fulltext'
    const isPlanView = outlineView === 'plan'
    const klasses = cx('outline__scene-title', {
      darkmode: darkMode,
      centeredBeatTitle: fulltextBeatTitleAlignment === 'center',
      showBeatTitle: showFulltextBeatTitle,
    })

    return (
      <div
        onDragLeave={this.handleDragLeave}
        onDragEnter={this.handleDragEnter}
        onDragOver={(e) => this.handleDragOver(e, beat.id)}
        onDragStart={() => {
          this.setState({ draggedCardBeatId: beat.id })
        }}
        onDrop={this.handleDrop}
        ref={this.beatRef}
        className={cx('outline__scene-wrapper', {
          plan: isPlanView,
          fulltext: isFulltext,
          inNewBeatDropzone:
            draggedCardBeatId !== null &&
            typeof isMovingToNewBeat === 'boolean' &&
            isMovingToNewBeat &&
            isPlanView,
          isFirstBeat,
          isLastBeat,
          previousBeatHasCard,
          showBeatGaps: showFulltextBeatGaps,
        })}
      >
        {isFulltext ? null : (
          <h3
            id={`beat-${beat.id}`}
            className={klasses}
            ref={this.titleRef}
            title={
              isPlanView ? beatTitle(beatIndex, beats, beat, hierarchyLevels, positionOffset) : null
            }
          >
            <span>{beatTitle(beatIndex, beats, beat, hierarchyLevels, positionOffset)}</span>
            {this.renderDropZone()}
            {this.renderManualSort()}
          </h3>
        )}
        {isPlanView ? (
          <div className="outline__plan-cards-wrapper">{this.renderCards()}</div>
        ) : (
          this.renderCards()
        )}
      </div>
    )
  }
}

BeatView.propTypes = {
  beat: PropTypes.object.isRequired,
  beats: PropTypes.object.isRequired,
  beatIndex: PropTypes.number.isRequired,
  hierarchyLevels: PropTypes.array.isRequired,
  cards: PropTypes.array.isRequired,
  activeFilter: PropTypes.bool.isRequired,
  currentTimeline: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  darkMode: PropTypes.bool,
  lines: PropTypes.array.isRequired,
  positionOffset: PropTypes.number.isRequired,
  beatActions: PropTypes.object,
  actions: PropTypes.object,
  outlineView: PropTypes.string,
  outlineTab: PropTypes.object,
  isFirstBeat: PropTypes.bool,
  isLastBeat: PropTypes.bool,
  uiActions: PropTypes.object,
  showPageLayoutConfig: PropTypes.bool,
  showFulltextBeatTitle: PropTypes.bool,
  previousBeatHasCard: PropTypes.bool,
  showFulltextBeatGaps: PropTypes.bool,
  fulltextBeatTitleAlignment: PropTypes.oneOf(['left', 'center']),
}

const BeatActions = actions.beat
const CardActions = actions.card
const uiActions = actions.ui

const mapStateToProps = (state, ownProps) => {
  return {
    darkMode: selectors.isDarkModeSelector(state),
    beats: selectors.beatsByBookSelector(state),
    beatIndex: selectors.beatIndexSelector(
      state,
      // @ts-ignore
      ownProps.beat.id
    ),
    hierarchyLevels: selectors.sortedHierarchyLevels(state),
    lines: selectors.sortedLinesByBookSelector(state),
    positionOffset: selectors.positionOffsetSelector(state),
    currentTimeline: selectors.currentTimelineSelector(state),
    outlineView: selectors.outlineViewSelector(state),
    outlineTab: selectors.outlineTabSelector(state),
    showPageLayoutConfig: selectors.showFulltextPageLayoutConfigSelector(state),
    showFulltextBeatTitle: selectors.showOutlineFulltextBeatTitleSelector(state),
    showFulltextBeatGaps: selectors.showOutlineFulltextBeatGapsSelector(state),
    fulltextBeatTitleAlignment: selectors.fulltextBeatTitleAlignmentSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    actions: bindActionCreators(CardActions, dispatch),
    beatActions: bindActionCreators(BeatActions, dispatch),
    uiActions: bindActionCreators(uiActions, dispatch),
  }
})(BeatView)
