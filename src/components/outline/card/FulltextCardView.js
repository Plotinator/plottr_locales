import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cx from 'classnames'
import tinycolor from 'tinycolor2'

import { selectors, actions } from 'wired-up-pltr'

import CardDescription from './CardDescription'

const FulltextCardView = (props) => {
  const {
    showCardTitle,
    showBeatTitle,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    editing,
    card,
    cardRef,
    isFirstCard,
    isLastCard,
    inFirstBeat,
    inLastBeat,
    darkMode,
    line,
    beatTitle,
    editOnClick,
    saveEdit,
    onEsc,
    cardTitleAlignment,
    beatTitleAlignment,
    beatId,
    light,
    uiActions,
  } = props

  const getPageLight = () => {
    switch (light) {
      case '1':
        return darkMode ? 1 : 1
      case '2':
        return darkMode ? 0.3 : 0.25
      case '3':
        return darkMode ? 0.6 : 0.5
      case '4':
        return darkMode ? 1 : 1

      default:
        return darkMode ? 4 : 54
    }
  }

  const getCardColor = () => {
    if (darkMode && light === '1') {
      // outline card darkmode background color
      return '#24252C'
    } else if (light === '1') {
      return '#FFF'
    }
    const lineColor = line.color
    const cardColor = tinycolor(lineColor).setAlpha(getPageLight()).toHslString()
    return cardColor
  }

  const cardColor = getCardColor()
  const textColor = darkMode
    ? tinycolor.mostReadable(cardColor, ['#eee', '#fff']).toHslString()
    : tinycolor.mostReadable(cardColor, ['#16222d', '#fff', '#eee']).toHslString()

  const klasses = cx('fulltext-view__beat-title', {
    centeredBeatTitle: beatTitleAlignment === 'center',
    showBeatTitle: showBeatTitle,
  })

  const handleMouseEnterCard = () => {
    uiActions.showFulltextCardHoverDetails(beatTitle, line?.title, card?.title)
  }

  const handleMouseLeaveCard = () => {
    uiActions.hideFulltextCardHoverDetails()
  }

  return (
    <div
      id={`card-${card.id}`}
      ref={cardRef}
      className={cx('outline__card-wrapper fulltext', {
        editing,
      })}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div
        className={cx('outline-list__card-view', {
          darkmode: darkMode,
          isFirstCard,
          inFirstBeat,
          isLastCard,
          inLastBeat,
          showBeatTitle,
        })}
        style={{ background: cardColor }}
        onMouseEnter={handleMouseEnterCard}
        onMouseLeave={handleMouseLeaveCard}
      >
        <div
          className={cx('outline__card__description', {
            editing,
          })}
          onClick={editOnClick}
          style={{ color: textColor }}
        >
          {showBeatTitle && isFirstCard ? (
            <h3 id={`beat-${beatId}`} className={klasses}>
              {beatTitle}
            </h3>
          ) : null}
          {showCardTitle ? (
            <h5
              className={cx('fulltext-view__card-title', {
                cardTitleCentered: cardTitleAlignment === 'center',
              })}
            >
              {card.title}
            </h5>
          ) : null}
          <CardDescription saveEdit={saveEdit} onEsc={onEsc} card={card} />
        </div>
      </div>
    </div>
  )
}

FulltextCardView.propTypes = {
  showPageLayoutConfig: PropTypes.bool,
  uiActions: PropTypes.object.isRequired,
  showCardTitle: PropTypes.bool,
  showBeatTitle: PropTypes.bool,
  showBeatGaps: PropTypes.bool,
  onDragEnter: PropTypes.func,
  onDragLeave: PropTypes.func,
  onDragOver: PropTypes.func,
  onDrop: PropTypes.func,
  editing: PropTypes.bool,
  beatId: PropTypes.number.isRequired,
  card: PropTypes.object.isRequired,
  cardRef: PropTypes.func,
  isFirstCard: PropTypes.bool,
  isLastCard: PropTypes.bool,
  inFirstBeat: PropTypes.bool,
  inLastBeat: PropTypes.bool,
  darkMode: PropTypes.bool,
  line: PropTypes.object.isRequired,
  beatTitle: PropTypes.string,
  editOnClick: PropTypes.func.isRequired,
  saveEdit: PropTypes.func.isRequired,
  onEsc: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  cardTitleAlignment: PropTypes.oneOf(['left', 'center']),
  beatTitleAlignment: PropTypes.oneOf(['left', 'center']),
  light: PropTypes.string,
}

const UIActions = actions.ui
const CardActions = actions.card

const mapStateToProps = (state, ownProps) => {
  return {
    outlineView: selectors.outlineViewSelector(state),
    showCardTitle: selectors.showOutlineFulltextCardTitleSelector(state),
    showBeatTitle: selectors.showOutlineFulltextBeatTitleSelector(state),
    showPageLayoutConfig: selectors.showFulltextPageLayoutConfigSelector(state),
    showBeatGaps: selectors.showOutlineFulltextBeatGapsSelector(state),
    darkMode: selectors.isDarkModeSelector(state),
    cardDescription: selectors.cardDescriptionByIdSelector(
      state,
      // @ts-ignore
      ownProps.cardId
    ),
    editing: selectors.editingOutlineCardSelector(state) === ownProps.cardId,
    card: selectors.singleCardOrDefaultSelector(
      state,
      // @ts-ignore
      ownProps.cardId,
      ownProps.beatId
    ),
    line: selectors.cardsLineOrDefaultSelector(
      state,
      // @ts-ignore
      ownProps.cardId
    ),
    cardTitleAlignment: selectors.fulltextCardTitleAlignmentSelector(state),
    beatTitleAlignment: selectors.fulltextBeatTitleAlignmentSelector(state),
    light: selectors.outlineFulltextLightSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    uiActions: bindActionCreators(UIActions, dispatch),
    actions: bindActionCreators(CardActions, dispatch),
  }
})(FulltextCardView)
