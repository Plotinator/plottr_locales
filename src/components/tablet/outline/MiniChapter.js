import React, { useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { StyleSheet, TouchableHighlight } from 'react-native'
import { View, Text, Button } from 'native-base'
import { helpers } from 'pltr/v2'
import cx from 'classnames'
import tinycolor from 'tinycolor2'
import { grays } from 'pltr/v2/constants/CSScolors'

function MiniChapter (props) {
  const {
    chapter,
    idx,
    cards,
    linesById,
    sortedLines,
    positionOffset,
    beatTree,
    hierarchyLevels,
    isSeries,
    hierarchyEnabled
  } = props
  const [sortedCards, setSortedCards] = useState([])

  useEffect(
    () => {
      setSortedCards(
        helpers.card.sortCardsInBeat(
          chapter.autoOutlineSort,
          cards,
          sortedLines
        )
      )
    },
    [chapter, cards]
  )

  const findCard = card => {
    let id = card.lineId
    return linesById[id]
  }

  const renderCardDots = () => {
    return sortedCards.map(c => {
      let line = findCard(c)
      if (!line) return null

      const colorObj = tinycolor(line.color)

      let style = { backgroundColor: colorObj.toHexString() }
      return <View key={`dot-${line.id}-${c.id}`} style={[styles.dot, style]} />
    })
  }

  return (
    <TouchableHighlight onPress={props.onPress}>
      <View style={styles.container}>
        <View style={styles.chapterWrapper}>
          <Text style={styles.indexText}>{`${idx + 1}.  `}</Text>
          <Text style={styles.titleText}>
            {helpers.beats.beatTitle(
              beatTree,
              chapter,
              hierarchyLevels,
              positionOffset,
              hierarchyEnabled,
              isSeries
            )}
          </Text>
        </View>
        <View style={styles.dotWrapper}>
          {renderCardDots()}
        </View>
      </View>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingBottom: 5,
    borderBottomColor: "#f7f7f7",
    borderBottomWidth: 1
  },
  chapterWrapper: {
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'flex-start'

  },
  indexText: {
    color: 'hsl(210, 83%, 53%)' // blue-5
  },
  titleText: {},
  dotWrapper: {
    marginLeft: 'auto',
    flexDirection:'row'
  },
  dot: {
    height: 10,
    width: 10,
    marginHorizontal: 2
  }
})

MiniChapter.propTypes = {
  chapter: PropTypes.object.isRequired,
  idx: PropTypes.number.isRequired,
  cards: PropTypes.array.isRequired,
  sortedLines: PropTypes.array.isRequired,
  linesById: PropTypes.object.isRequired,
  positionOffset: PropTypes.number.isRequired,
  beatTree: PropTypes.object.isRequired,
  hierarchyLevels: PropTypes.array.isRequired,
  isSeries: PropTypes.bool.isRequired,
  hierarchyEnabled: PropTypes.bool
}

export default MiniChapter
