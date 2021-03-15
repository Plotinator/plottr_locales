import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import {
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableWithoutFeedback
} from 'react-native'
import { keyBy } from 'lodash'
import { t } from 'plottr_locales'
import cx from 'classnames'
import { selectors, helpers } from 'pltr/v2'
import { View, H3 } from 'native-base'
import { Col, Grid } from 'react-native-easy-grid'
import ErrorBoundary from '../../shared/ErrorBoundary'
import Toolbar from '../shared/Toolbar'
import SeriesPicker from '../shared/SeriesPicker'
import MiniChapter from './MiniChapter'
import Chapter from '../../shared/outline/Chapter'
import DrawerButton from '../../ui/DrawerButton'

class Outline extends Component {
  state = { linesById: {}, currentLine: null }
  outlineListRef = null

  static getDerivedStateFromProps (props, state) {
    return {
      linesById: keyBy(props.lines, 'id'),
      currentLine: state.currentLine
    }
  }

  renderCardDots () {
    return sortedCards.map((c) => {
      let line = findCard(c)
      if (!line) return null

      let style = { backgroundColor: line.color }
      return (
        <div
          key={`dot-${line.id}-${c.id}`}
          title={line.title}
          style={style}
          className='outline__minimap__card-dot'></div>
      )
    })
  }

  scrollToChapter = (index) => {
    this.outlineListRef.scrollToIndex({ index })
  }

  renderMiniChapter (chapter, index, cardMap) {
    const { positionOffset, lines } = this.props

    return (
      <MiniChapter
        key={`minimap-chapter-${chapter.id}`}
        onPress={() => this.scrollToChapter(index)}
        chapter={chapter}
        idx={index + positionOffset}
        cards={cardMap[chapter.id]}
        linesById={this.state.linesById}
        sortedLines={lines}
        positionOffset={positionOffset}
      />
    )
  }

  renderChapterList (cardMap) {
    const { chapters } = this.props
    return (
      <View style={styles.chapterList}>
        <ScrollView>
          {chapters.map((item, index) =>
            this.renderMiniChapter(item, index, cardMap)
          )}
        </ScrollView>
      </View>
    )
  }

  renderChapterInner = (beatTitle, cards, manualSort, navigateToNewCard) => {
    return (
      <View style={styles.chapter}>
        <View style={styles.chapterTitle}>
          <H3>{beatTitle}</H3>
          {manualSort}
        </View>
        <View style={styles.cardWrapper}>{cards}</View>
      </View>
    )
  }

  renderOutlineChapter (chapter, cardMap) {
    return (
      <ErrorBoundary>
        <Chapter
          chapter={chapter}
          cards={cardMap[chapter.id]}
          activeFilter={!!this.state.currentLine}
          navigation={this.props.navigation}
          render={this.renderChapterInner}
        />
      </ErrorBoundary>
    )
  }

  renderOutline (cardMap) {
    const { chapters } = this.props
    return (
      <FlatList
        data={chapters}
        renderItem={({ item }) => this.renderOutlineChapter(item, cardMap)}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.outline}
        ref={(ref) => {
          this.outlineListRef = ref
        }}
        initialNumToRender={2}
      />
    )
  }

  render () {
    const { chapters, lines, card2Dmap } = this.props
    const cardMap = helpers.card.cardMapping(
      chapters,
      lines,
      card2Dmap,
      this.state.currentLine
    )
    return (
      <View style={{ flex: 1 }}>
        <Toolbar>
          <DrawerButton openDrawer={this.props.openDrawer} />
          <SeriesPicker />
        </Toolbar>
        <Grid>
          <Col size={3}>{this.renderChapterList(cardMap)}</Col>
          <Col size={9}>{this.renderOutline(cardMap)}</Col>
        </Grid>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  chapterList: {
    height: '100%',
    padding: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2
  },
  chapter: {
    padding: 16
  },
  chapterTitle: {
    paddingLeft: 13,
    paddingRight: 26,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardWrapper: {
    marginLeft: -16
  },
  outline: {}
})

Outline.propTypes = {
  chapters: PropTypes.array.isRequired,
  lines: PropTypes.array.isRequired,
  card2Dmap: PropTypes.object.isRequired,
  file: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  positionOffset: PropTypes.number.isRequired,
  navigation: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    chapters: selectors.sortedBeatsByBookSelector(state),
    lines: selectors.sortedLinesByBookSelector(state),
    card2Dmap: selectors.cardMapSelector(state),
    file: state.file,
    ui: state.ui,
    positionOffset: selectors.positionOffsetSelector(state)
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Outline)
