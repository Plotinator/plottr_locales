import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { sortBy } from 'lodash'
import { t } from 'plottr_locales'
import cx from 'classnames'
import { selectors, actions, helpers } from 'pltr/v2'
import { H3, Icon, Card, CardItem, View, Button, Text } from 'native-base'
import { StyleSheet } from 'react-native'
import Cell from '../shared/Cell'

class Chapter extends Component {

  state = { sortedCards: [] }

  static getDerivedStateFromProps (nextProps, nextState) {
    const { chapter, cards, lines } = nextProps
    const sortedCards = helpers.card.sortCardsInChapter(chapter.autoOutlineSort, cards, lines)
    return {sortedCards}
  }

  navigateToNewCard = () => {
    this.props.navigation.push('SceneDetails', {isNewCard: true, beatId: this.props.chapter.id})
  }

  autoSortChapter = () => {
    const { beatActions, chapter } = this.props
    beatActions.autoSortBeat(chapter.id, chapter.bookId)
  }

  renderSceneCard = (value) => {
    return <Cell key={value} style={styles.cell}>
      <Text style={styles.text}>{value}</Text>
    </Cell>
  }

  renderCards () {
    return this.state.sortedCards.map(c => this.renderSceneCard(c.title))
  }

  render () {
    const { chapter, ui, cards, activeFilter, positionOffset } = this.props
    if (activeFilter && !cards.length) return null

    const klasses = cx('outline__scene-title', {darkmode: ui.darkMode})
    return <View style={styles.column}>{ this.renderCards() }</View>
  }
}

const styles = StyleSheet.create({
  column: { flexDirection: "column" },
  cell: {
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
})

Chapter.propTypes = {
  chapter: PropTypes.object.isRequired,
  cards: PropTypes.array.isRequired,
  activeFilter: PropTypes.bool.isRequired,
  ui: PropTypes.object.isRequired,
  lines: PropTypes.array.isRequired,
  positionOffset: PropTypes.number.isRequired,
  navigation: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    ui: state.ui,
    lines: selectors.sortedLinesByBookSelector(state),
    positionOffset: selectors.positionOffsetSelector(state),
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(actions.card, dispatch),
    beatActions: bindActionCreators(actions.beat, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chapter)
