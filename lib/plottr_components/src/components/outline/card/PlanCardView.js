import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cx from 'classnames'
import { FaGripLinesVertical } from '@react-icons/all-files/fa/FaGripLinesVertical'
import tinycolor from 'tinycolor2'

import { selectors, actions } from 'wired-up-pltr'

import CardDropZone from './CardDropZone'
import CardTitle from './CardTitle'
import TitleHint from './TitleHint'
import Glyphicon from '../../Glyphicon'

const PlanCardView = (props) => {
  const {
    editing,
    card,
    onKeyPressEsc,
    onKeyPressEnter,
    cardRef,
    line,
    inDropZone,
    onDragEnterCard,
    onDragOverCard,
    onDragLeaveCard,
    onDropCard,
    onDragCardStart,
    onDragCardEnd,
    editOnClick,
    beatId,
    cardDescription,
    uiActions,
    dragging,
  } = props

  const textColor = tinycolor.mostReadable(line.color, ['#16222d', '#eee', '#fff'])

  const openDialog = (event) => {
    event.stopPropagation()
    uiActions.setCardDialogOpen(card.id, beatId, line.id)
  }

  return (
    <div
      id={`card-${card.id}`}
      ref={cardRef}
      className={cx('outline__card-wrapper plan', {
        editing,
        dragging,
      })}
      onDragEnter={onDragEnterCard}
      onDragOver={onDragOverCard}
      onDragLeave={onDragLeaveCard}
      onDrop={onDropCard}
    >
      <CardDropZone inDropZone={inDropZone} noIndicator />
      <div className="outline-list__card-view" style={{ color: textColor, background: line.color }}>
        <div
          style={{ background: line.color }}
          className={cx('outline__card__description', { editing })}
          draggable
          onDragStart={onDragCardStart}
          onDragEnd={onDragCardEnd}
        >
          {editing ? null : (
            <>
              <FaGripLinesVertical />
              <div className="left-icons">
                <TitleHint cardId={card.id} cardDescription={cardDescription} />
                <div className="plan-view__expand-button">
                  <Glyphicon title="Expand" glyph="resize-full" onClick={openDialog} />
                </div>
              </div>
            </>
          )}
          {editing ? (
            <CardTitle
              cardId={card.id}
              beatId={beatId}
              onKeyPressEnter={onKeyPressEnter}
              onKeyPressEsc={onKeyPressEsc}
            />
          ) : (
            <div className="plan-view__title" onClick={editOnClick}>
              <h5>{card.title}</h5>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

PlanCardView.propTypes = {
  cardActions: PropTypes.object,
  card: PropTypes.object.isRequired,
  foci: PropTypes.array.isRequired,
  editing: PropTypes.bool.isRequired,
  inDropZone: PropTypes.bool,
  onKeyPressEsc: PropTypes.func,
  onKeyPressEnter: PropTypes.func,
  cardRef: PropTypes.func,
  onDragEnterCard: PropTypes.func,
  onDragOverCard: PropTypes.func,
  onDragLeaveCard: PropTypes.func,
  onDropCard: PropTypes.func,
  onDragCardStart: PropTypes.func,
  onDragCardEnd: PropTypes.func,
  line: PropTypes.object,
  editOnClick: PropTypes.func.isRequired,
  beatId: PropTypes.number.isRequired,
  cardDescription: PropTypes.array,
  uiActions: PropTypes.object,
  dragging: PropTypes.bool,
}

const CardActions = actions.card
const UIActions = actions.ui

const mapStateToProps = (state, ownProps) => {
  return {
    editing: selectors.editingOutlineCardSelector(state) === ownProps.cardId,
    foci: selectors.outlineCurrentFocusSelector(state),
    line: selectors.cardsLineOrDefaultSelector(
      state,
      // @ts-ignore
      ownProps.cardId
    ),
    card: selectors.singleCardOrDefaultSelector(
      state,
      // @ts-ignore
      ownProps.cardId,
      ownProps.beatId
    ),
    cardDescription: selectors.cardDescriptionByIdSelector(
      state,
      // @ts-ignore
      ownProps.cardId
    ),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    cardActions: bindActionCreators(CardActions, dispatch),
    uiActions: bindActionCreators(UIActions, dispatch),
  }
})(PlanCardView)
