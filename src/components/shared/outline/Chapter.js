import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { sortBy } from 'lodash'
import t from 'format-message'
import cx from 'classnames'
import { selectors, actions, helpers } from 'pltr/v2'
import { H3, Icon, Card, CardItem, View } from 'native-base'
import { SwipeRow } from 'react-native-swipe-list-view'
import SceneCard from './SceneCard'
import { StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { Text, ShellButton } from '../common'
import Metrics from '../../../utils/Metrics'
import Colors from '../../../utils/Colors'
import Fonts from '../../../fonts'

class Chapter extends Component {
  state = { sortedCards: [] }

  static getDerivedStateFromProps (nextProps, nextState) {
    const { chapter, cards, lines } = nextProps
    const sortedCards = helpers.card.sortCardsInBeat(
      chapter.autoOutlineSort,
      cards,
      lines
    )
    return { sortedCards }
  }

  navigateToNewCard = () => {
    this.props.navigation.push('SceneDetails', {
      isNewCard: true,
      beatId: this.props.chapter.id,  // Maintaining this since this is a shared component
      chapterId: this.props.chapter.id
    });
  }

  autoSortChapter = () => {
    const { beatActions, chapter } = this.props
    beatActions.autoSortBeat(chapter.id)
  }

  reorderCards = ({ current, currentIndex, dropped }) => {
    const { sortedCards } = this.state
    const { chapter, actions } = this.props
    const currentIds = sortedCards.map((c) => c.id)
    const currentLineId = current.lineId
    let newOrderInChapter = []
    let newOrderWithinLine = null

    // already in chapter
    if (currentIds.includes (dropped.cardId)) {
      // flip it to manual sort
      newOrderInChapter = helpers.lists.moveToAbove(
        dropped.index,
        currentIndex,
        currentIds
      )
      if (dropped.lineId == currentLineId) {
        // if same line, also update positionWithinLine
        const cardIdsInLine = sortedCards
          .filter((c) => c.lineId == currentLineId)
          .map((c) => c.id)
        const currentPosition = sortedCards.find((c) => c.id == dropped.cardId)
          .positionWithinLine
        newOrderWithinLine = helpers.lists.moveToAbove(
          currentPosition,
          current.positionWithinLine,
          cardIdsInLine
        )
      }
      actions.reorderCardsInBeat(
        chapter.id,
        currentLineId,
        newOrderInChapter,
        newOrderWithinLine
      )
    } else {
      // dropped in from a different chapter
      if (dropped.lineId == currentLineId) {
        // if same line, can just update positionWithinLine
        let cardIdsWithinLine = sortedCards
          .filter((c) => c.lineId == currentLineId)
          .map((c) => c.id)
        cardIdsWithinLine.splice(current.positionWithinLine, 0, dropped.cardId)
        actions.reorderCardsWithinLine(
          chapter.id,
          currentLineId,
          cardIdsWithinLine
        )
      } else {
        // flip to manual sort
        newOrderInChapter = currentIds
        newOrderInChapter.splice(currentIndex, 0, dropped.cardId)
        actions.reorderCardsInBeat(
          chapter.id,
          currentLineId,
          newOrderInChapter,
          null,
          dropped.cardId
        )
      }
    }
  }

  renderManualSort () {
    if (this.props.chapter.autoOutlineSort) return null
    return (
      <ShellButton onPress={this.autoSortChapter} style={styles.manualSorted}>
        <Text fontStyle='semiBold' fontSize='small' white>
          {t('Manually Sorted')}
        </Text>
        <Icon type='FontAwesome5' name='times' style={styles.closeIcon} />
      </ShellButton>
    )
  }

  renderCards () {
    const { sortedCards } = this.state
    const hasCards = sortedCards.length
    return hasCards == 0 ? null : (
      <View style={styles.cardsContainer}>
        {sortedCards.map((c, idx) => {
          return (
            <SceneCard
              key={c.id}
              card={c}
              index={idx}
              reorder={this.reorderCards}
              navigation={this.props.navigation}
            />
          )
        })}
      </View>
    )
  }

  render () {
    const { chapter, cards, activeFilter, positionOffset } = this.props
    if (activeFilter && !cards.length) return null

    const chapterTitle = helpers.beats.beatTitle(chapter, positionOffset)
    const renderedCards = this.renderCards()
    const manualSort = this.renderManualSort()
    return (
      <TouchableWithoutFeedback>
        <View>
          {this.props.render(
            chapterTitle,
            renderedCards,
            manualSort,
            this.navigateToNewCard,
            chapter
          )}
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  cardsContainer: {
    backgroundColor: Colors.cloud,
    paddingTop: Metrics.baseMargin
  },
  chapterView: {
    backgroundColor: 'white',
    padding: 8
  },
  sliderRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  addScene: {
    fontSize: 16
  },
  manualSorted: {
    padding: Metrics.baseMargin,
    paddingVertical: Metrics.baseMargin / 2,
    borderRadius: Metrics.buttonRadius,
    backgroundColor: Colors.orange,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeIcon: {
    marginLeft: Metrics.baseMargin / 2,
    fontSize: Fonts.size.small,
    color: Colors.white
  }
})

Chapter.propTypes = {
  chapter: PropTypes.object.isRequired,
  cards: PropTypes.array.isRequired,
  activeFilter: PropTypes.bool.isRequired,
  ui: PropTypes.object.isRequired,
  lines: PropTypes.array.isRequired,
  positionOffset: PropTypes.number.isRequired,
  navigation: PropTypes.object.isRequired,
  render: PropTypes.func.isRequired
}

function mapStateToProps (state) {
  return {
    ui: state.ui,
    lines: selectors.sortedLinesByBookSelector(state),
    positionOffset: selectors.positionOffsetSelector(state)
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(actions.card, dispatch),
    beatActions: bindActionCreators(actions.beat, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Chapter)
