import React, { PureComponent } from 'react'
import PropTypes from 'react-proptypes'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import i18n from 'format-message'
import { Cell } from 'react-sticky-table'
import { Glyphicon, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import * as CardActions from 'actions/cards'
import Card from './Card'
import cx from 'classnames'
import { isSeriesSelector } from '../../selectors/ui'
import { lineIsExpandedSelector } from '../../selectors/lines'
import Floater from 'react-floater'
import SceneCardAdd from './SceneCardAdd'
import { reorderList } from '../../helpers/lists'

class ScenesCell extends PureComponent {

  moveSceneCard = (id, positionInChapter) => {
    const { chapterId, lineId, isSeries, cards } = this.props
    let newOrder = []

    const currentIds = cards.map(c => c.id)
    if (currentIds.includes(id)) {
      const currentPosition = cards.find(c => c.id == id).position
      newOrder = reorderList(positionInChapter, currentPosition, currentIds)
    } else {
      // dropped in from a different chapter
      newOrder = currentIds
      newOrder.splice(positionInChapter, 0, id)
    }

    this.props.actions.reorderCardsInChapter(chapterId, lineId, isSeries, newOrder)
  }

  addSceneCard = (newCardData) => {
    // add a new one
    // and reorder current cards
    const newCard = this.buildCard(newCardData)
    const reorderIds = this.props.cards.map(c => c.id)
    reorderIds.splice(newCardData.position, 0, null)

    this.props.actions.addNewCardInChapter(newCard, reorderIds)
  }

  buildCard (data) {
    const { chapterId, lineId, isSeries } = this.props
    if (isSeries) {
      return Object.assign({}, { beatId: chapterId, seriesLineId: lineId }, data)
    } else {
      return Object.assign({}, { chapterId, lineId }, data)
    }
  }

  renderCards (renderAddButtons) {
    const { chapterId, lineId, chapterPosition, linePosition, color, filtered, cards } = this.props
    const numOfCards = cards.length
    const idxOfCards = numOfCards - 1
    return cards.map((card, idx) => {
      return <div key={card.id}>
        <Card card={card} chapterId={chapterId} lineId={lineId}
          chapterPosition={chapterPosition} linePosition={linePosition}
          color={color} filtered={filtered} last={idxOfCards == idx}
        />
        {renderAddButtons ?
          <SceneCardAdd
            color={color}
            positionInChapter={idx}
            moveCard={this.moveSceneCard}
            addCard={this.addSceneCard}
          />
        : null}
      </div>
    })
  }

  renderHiddenCards = () => {
    return <div className='card__hidden-cards'>
      { this.renderCards(false) }
    </div>
  }

  renderBody () {
    const numOfCards = this.props.cards.length
    if (this.props.lineIsExpanded || numOfCards == 1) {
      return <div className={cx('card__cell', {multiple: numOfCards > 1})}>
        { this.renderCards(true) }
      </div>
    } else {
      var cardStyle = {
        borderColor: this.props.color
      }
      return <div className='card__cell__overview-cell'>
        <Floater component={this.renderHiddenCards} placement='right' offset={0} disableAnimation={true}>
          <div className='card__body' style={cardStyle}>
            <div className='card__title'>{i18n('{num} Scenes', {num: numOfCards})}</div>
          </div>
        </Floater>
        <SceneCardAdd
          color={this.props.color}
          positionInChapter={numOfCards}
          moveCard={this.moveSceneCard}
          addCard={this.addSceneCard}
        />
      </div>
    }
  }

  render () {
    if (!this.props.cards.length) return <Cell></Cell>

    return <Cell>
      { this.renderBody() }
    </Cell>
  }
}

ScenesCell.propTypes = {
  cards: PropTypes.array,
  chapterId: PropTypes.number.isRequired,
  lineId: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  filtered: PropTypes.bool,
  linePosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  chapterPosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isSeries: PropTypes.bool.isRequired,
  lineIsExpanded: PropTypes.bool.isRequired,
  actions: PropTypes.object.isRequired,
}

function mapStateToProps (state, ownProps) {
  return {
    isSeries: isSeriesSelector(state.present),
    lineIsExpanded: lineIsExpandedSelector(state.present)[ownProps.lineId],
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(CardActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ScenesCell)
