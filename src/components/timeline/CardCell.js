import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Cell } from 'react-sticky-table'
import cx from 'classnames'
import { FaCircle } from '@react-icons/all-files/fa/FaCircle'
import tinycolor from 'tinycolor2'
import { omit } from 'lodash'

import { selectors, actions } from 'wired-up-pltr'
import { helpers } from 'pltr'

import Card from './Card'
import Floater from '../PlottrFloater'
import CardAdd from './CardAdd'
import ErrorBoundary from '../containers/ErrorBoundary'

import VisualLine from './VisualLine'

const {
  lists: { reorderList, moveToAbove },
  colors: { getContrastYIQ },
} = helpers

class CardCell extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dragging: false,
      inDropZone: false,
      dropDepth: 0,
      hovering: false, // forces a rerender to determine where to place the overlay
      cardStackOpen: false,
    }
    this.ref = React.createRef()
  }

  toggleCardStack = () => {
    this.setState({
      cardStackOpen: !this.state.cardStackOpen,
    })
  }

  closeCardStack = () => {
    this.setState({
      cardStackOpen: false,
    })
  }

  handleDragStart = (e) => {
    this.setState({ dragging: true })
    e.dataTransfer.effectAllowed = 'move'
    const cardIds = this.props.cards.map((card) => card.id)

    if (!Array.isArray(cardIds) || cardIds.length <= 1) return
    e.dataTransfer.setData('text/json', JSON.stringify({ cardIds }))
  }

  handleDragEnd = () => {
    this.setState({ dragging: false })
  }

  handleDragEnter = (_e) => {
    // https://www.smashingmagazine.com/2020/02/html-drag-drop-api-react/
    if (!this.state.dragging) this.setState({ dropDepth: this.state.dropDepth + 1 })
  }

  handleDragOver = (e) => {
    e.preventDefault()
    if (!this.state.dragging) this.setState({ inDropZone: true })
  }

  handleDragLeave = (_e) => {
    if (!this.state.dragging) {
      let dropDepth = this.state.dropDepth
      --dropDepth
      this.setState({ dropDepth: dropDepth })

      if (dropDepth > 0) return
      this.setState({ inDropZone: false })
    }
  }

  handleDrop = (e, allowDrop) => {
    e.preventDefault()

    if (this.state.dragging) return
    if (!allowDrop) return

    this.setState({ inDropZone: false, dropDepth: 0 })

    const json = e.dataTransfer.getData('text/json')
    const droppedData = helpers.json.safeParseJSON(json)

    if (droppedData === null) {
      return
    } else if (droppedData.cardIds) {
      e.stopPropagation()
      this.moveSceneCardAbove(droppedData.cardIds)
    } else if (
      droppedData.cardId &&
      this.props.cards.map(({ id }) => id).indexOf(droppedData.cardId) !== -1
    ) {
      // In this case, we don't have the information we need to drop
      // the card.  So we're going to let the event bubble to the
      // card component that the the dragged card was dropped onto.
      // It knows it's id so it knows where the card should go in
      // the new ordering.
      //
      // We run into this case when the card is dragged from an old
      // position in an expanded card stack into a new position.
      return
    } else if (droppedData.cardId) {
      e.stopPropagation()
      this.moveSceneCardAbove(droppedData.cardId)
    } else return
  }

  startHovering = () => {
    this.setState({ hovering: true })
  }

  stopHovering = () => {
    this.setState({ hovering: false })
  }

  renderDropZone(allowDrop) {
    const { color, isSmall } = this.props
    if (!allowDrop) return
    if (!this.state.inDropZone) return

    let circleStyle = {}
    if (isSmall) circleStyle = { color: color }

    return (
      <div className="card__drop-zone">
        <FaCircle style={circleStyle} />
      </div>
    )
  }

  moveSceneCardAbove = (id, positionWithinLine) => {
    this.setState({ inDropZone: false, dropDepth: 0 })
    const { beatId, lineId, cards } = this.props
    let newOrder = []

    const currentIds = cards.map((c) => c.id)
    if (currentIds.includes(id)) {
      const currentPosition = cards.find((c) => c.id == id).positionWithinLine
      newOrder = moveToAbove(currentPosition, positionWithinLine, currentIds)
    } else {
      // dropped in from a different beat
      newOrder = currentIds
      if (Array.isArray(id) || id.length > 1) {
        if (positionWithinLine) {
          newOrder = currentIds
            .slice(0, positionWithinLine)
            .concat(id)
            .concat(currentIds.slice(positionWithinLine))
        } else {
          newOrder = id.concat(currentIds)
        }
      } else {
        newOrder.splice(positionWithinLine, 0, id)
      }
    }

    this.props.actions.reorderCardsWithinLine(beatId, lineId, newOrder)
  }

  moveSceneCard = (id, positionWithinLine) => {
    this.setState({ inDropZone: false, dropDepth: 0 })
    const { beatId, lineId, cards } = this.props
    let newOrder = []

    const currentIds = cards.map((c) => c.id)
    if (currentIds.includes(id)) {
      const currentPosition = cards.find((c) => c.id == id).positionWithinLine
      newOrder = reorderList(positionWithinLine, currentPosition, currentIds)
    } else {
      // dropped in from a different beat
      newOrder = currentIds
      newOrder.splice(positionWithinLine, 0, id)
    }

    this.props.actions.reorderCardsWithinLine(beatId, lineId, newOrder)
  }

  addSceneCard = (newCardData) => {
    // add a new one
    // and reorder current cards
    const newCard = this.buildCard(newCardData)
    const reorderIds = this.props.cards.map((c) => c.id)
    reorderIds.splice(newCardData.positionWithinLine, 0, null)

    this.props.actions.addNewCardInBeat(newCard, reorderIds)
  }

  buildCard(data) {
    const { beatId, lineId } = this.props
    return Object.assign({}, { beatId, lineId }, data)
  }

  renderCards(arentHidden) {
    const { beatId, lineId, beatPosition, linePosition, color, cards, isPinned } = this.props
    const numOfCards = cards.length
    const idxOfCards = numOfCards - 1

    return cards.map((card, idx) => {
      const isLastOne = idx == cards.length - 1
      return (
        <div key={card.id}>
          <ErrorBoundary>
            <Card
              card={card}
              beatId={beatId}
              lineId={lineId}
              idx={idx}
              positionWithinLine={idx}
              beatPosition={beatPosition}
              linePosition={linePosition}
              color={color}
              last={idxOfCards == idx}
              moveCardAbove={this.moveSceneCardAbove}
              moveCard={this.moveSceneCardAbove}
              allowDrop={true}
            />
          </ErrorBoundary>
          {arentHidden ? (
            <CardAdd
              color={color}
              positionWithinLine={idx}
              moveCard={this.moveSceneCard}
              addCard={this.addSceneCard}
              allowDrop={isLastOne}
              dropPosition={cards.length}
              beatId={beatId}
              lineId={lineId}
              isPinned={isPinned}
            />
          ) : null}
        </div>
      )
    })
  }

  renderHiddenCards = () => {
    return <div className="card__hidden-cards">{this.renderCards(false)}</div>
  }

  renderBody() {
    const {
      cards,
      orientation,
      isVisible,
      color,
      lineIsExpanded,
      beatIsExpanded,
      isMedium,
      isPinned,
      topCard,
      cardBehind,
    } = this.props
    const numOfCards = cards.length
    const vertical = orientation == 'vertical'

    if (beatIsExpanded && (lineIsExpanded || numOfCards == 1)) {
      const cellKlass = cx('card__cell', {
        multiple: numOfCards > 1,
        vertical: vertical,
        'medium-timeline': isMedium,
        'card-pinned': isPinned,
      })
      return <div className={cellKlass}>{this.renderCards(true)}</div>
    } else {
      const cardStyle = {
        borderColor: topCard?.color ? tinycolor(topCard.color).darken(10).toHslString() : color,
      }
      cardStyle.backgroundColor = topCard?.color
      const [useBlack, _] = getContrastYIQ((topCard?.color && topCard?.color) || '#F1F5F8') // $gray-9
      if (!useBlack) {
        cardStyle.color = 'white'
      }
      if (!isVisible) {
        cardStyle.opacity = '0.1'
      }
      const cardBehindStyle = {
        ...omit(cardStyle, ['borderColor', 'backgroundColor']),
        ...(cardBehind?.color ? { backgroundColor: cardBehind?.color } : {}),
        borderColor: cardBehind?.color
          ? tinycolor(cardBehind.color).darken(10).toHslString()
          : color,
      }
      const bodyKlass = cx('card__body shadow', { 'medium-timeline': isMedium })
      const overviewKlass = cx('card__cell__overview-cell', {
        vertical: vertical,
        'medium-timeline': isMedium,
      })
      return (
        <div className={overviewKlass}>
          <div
            onDragEnter={this.handleDragEnter}
            onDragOver={this.handleDragOver}
            onDragLeave={this.handleDragLeave}
            onDrop={(e) => this.handleDrop(e, true)}
          >
            <Floater
              component={this.renderHiddenCards}
              placement="right"
              open={this.state.cardStackOpen}
              onClose={this.closeCardStack}
              zIndex={1000}
            >
              <div
                className={cx('card__cell__overview__drag-anchor', {
                  'medium-timeline': isMedium,
                })}
                onClick={this.toggleCardStack}
                onDragStart={this.handleDragStart}
                onDragEnd={this.handleDragEnd}
                draggable
              >
                <div className={bodyKlass} style={cardStyle}>
                  <div className="card__title">{topCard.title}</div>
                </div>
                <div className="card__behind" style={cardBehindStyle}></div>
              </div>
            </Floater>
          </div>
          <CardAdd
            color={this.props.color}
            positionWithinLine={numOfCards}
            moveCard={this.moveSceneCard}
            addCard={this.addSceneCard}
            beatId={this.props.beatId}
            lineId={this.props.lineId}
            allowDrop
            isPinned={isPinned}
          />
          {this.renderDropZone(true)}
        </div>
      )
    }
  }

  render() {
    const { cards, isSmall, isMedium, isPinned, color, orientation, beatHeadingCount } = this.props
    const tableLength =
      orientation == 'horizontal' && !isMedium
        ? this.ref.current?.clientWidth + 50 || 225
        : orientation == 'horizontal' && isMedium
        ? this.ref.current?.clientWidth + 25 || 95
        : this.ref.current?.clientHeight && orientation == 'vertical' && isMedium
        ? this.ref.current?.clientHeight + 50
        : this.ref.current?.clientHeight + 50 || 225

    if (!cards.length) {
      if (isSmall) return <td></td>
      return <Cell className={cx({ 'medium-timeline': isMedium, 'card-pinned': isPinned })}></Cell>
    }

    if (isSmall) {
      return <td>{this.renderCards(false)}</td>
    } else {
      return (
        <Cell
          className={cx({ 'medium-timeline': isMedium, 'card-pinned': isPinned })}
          ref={this.ref}
        >
          {isPinned ? (
            <VisualLine
              color={color}
              isMedium={isMedium}
              orientation={orientation}
              tableLength={tableLength}
              beatHeadingCount={beatHeadingCount}
              disableAnimation={isPinned}
            />
          ) : null}
          {this.renderBody()}
        </Cell>
      )
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.dragging != nextState.dragging) return true
    if (this.state.inDropZone != nextState.inDropZone) return true
    if (this.state.hovering != nextState.hovering) return true
    if (this.state.cardStackOpen != nextState.cardStackOpen) return true
    if (this.props.color != nextProps.color) return true
    if (this.props.timelineSize != nextProps.timelineSize) return true
    if (this.props.cards != nextProps.cards) return true
    if (this.props.lineIsExpanded != nextProps.lineIsExpanded) return true
    if (this.props.isVisible != nextProps.isVisible) return true
    if (this.props.isPinned != nextProps.isPinned) return true

    return false
  }
}

CardCell.propTypes = {
  cards: PropTypes.array,
  beatId: PropTypes.number.isRequired,
  lineId: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  linePosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  beatPosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  timelineSize: PropTypes.string.isRequired,
  orientation: PropTypes.string.isRequired,
  beatIsExpanded: PropTypes.bool,
  lineIsExpanded: PropTypes.bool.isRequired,
  isVisible: PropTypes.bool.isRequired,
  topCard: PropTypes.object.isRequired,
  cardBehind: PropTypes.object.isRequired,
  isSmall: PropTypes.bool.isRequired,
  isMedium: PropTypes.bool.isRequired,
  actions: PropTypes.object.isRequired,
  isPinned: PropTypes.bool,
  beatHeadingCount: PropTypes.number.isRequired,
}

const mapStateToProps = (state, ownProps) => {
  const visibleCards = selectors.visibleCardsSelector(state)
  const visible = ownProps.cards.some((c) => visibleCards[c.id])
  const topCard =
    ownProps.cards.find((c) => {
      return visibleCards[c.id]
    }) ?? ownProps.cards[0]
  // The second card could be bumped to the top, don't bother
  // being perfectly correct because this is a rare case.
  // Instead just take the next card that isn't the top card.
  const cardBehind =
    ownProps.cards.filter((c) => {
      return visibleCards[c.id]
    })?.[1] ?? (ownProps.cards[1] === topCard ? ownProps.cards[0] : ownProps.cards[1])
  return {
    timelineSize: selectors.timelineSizeSelector(state),
    orientation: selectors.orientationSelector(state),
    lineIsExpanded: selectors.lineIsExpandedSelector(state)[ownProps.lineId],
    isVisible: visible,
    topCard,
    cardBehind,
    isSmall: selectors.isSmallSelector(state),
    isMedium: selectors.isMediumSelector(state),
    beatHeadingCount: selectors.bottomLevelBeatHeadingCountSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    actions: bindActionCreators(actions.card, dispatch),
  }
})(CardCell)
