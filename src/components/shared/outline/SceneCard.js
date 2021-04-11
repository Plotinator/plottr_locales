import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { t } from 'plottr_locales'
import { selectors, actions } from 'pltr/v2'
import { Card, CardItem, View, Left, Right } from 'native-base'
import { StyleSheet } from 'react-native'
import { isTablet } from 'react-native-device-info'
import RichTextEditor from '../RichTextEditor'
import { RichEditor, Text } from '../common'
import Metrics from '../../../utils/Metrics'
import Colors from '../../../utils/Colors'

const isOnTablet = isTablet()

class SceneCard extends Component {

  navigateToDetails = () => {
    this.props.navigation.navigate('SceneDetails', {card: this.props.card})
  }

  renderDescription () {
    if (!isOnTablet) return null
    const { card } = this.props

    return <View style={{padding: 16}}>
      <RichEditor
      // <RichTextEditor
        initialValue={card.description}
        onChange={() => {}}
        disabled
      />
    </View>
  }

  render () {
    const { line, card } = this.props
    const lineColor = { color: line.color.toLowerCase() }
    if (isOnTablet) {
      return (
        <Card style={[styles.card, { borderColor: line.color.toLowerCase() }]}>
          <View style={styles.paddedTitleBox}>
            <Text style={[styles.tabletLineText, lineColor]}>({line.title})</Text>
          </View>
          <View style={styles.paddedBox}>
            <Text style={styles.tabletTitleText}>{card.title}</Text>
          </View>
          { this.renderDescription() }
        </Card>
      )
    } else {
      return (
        <Card style={[styles.card, { borderColor: line.color.toLowerCase() }]}>
          <CardItem button onPress={this.navigateToDetails}>
            <Left><Text>{card.title}</Text></Left>
            <Right><Text style={[styles.lineText, lineColor]}>({line.title})</Text></Right>
          </CardItem>
        </Card>
      )
    }
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    marginTop: 0,
    marginBottom: Metrics.baseMargin,
    marginLeft: Metrics.doubleBaseMargin,
    marginRight: Metrics.doubleBaseMargin,
    borderRadius: Metrics.cornerRadius,
    overflow: 'hidden',
    borderWidth: 2
  },
  lineText: {
    fontSize: 12,
  },
  tabletLineText: {
    fontSize: 16,
  },
  tabletTitleText: {
    fontSize: 20,
    fontWeight: '500',
  },
  paddedTitleBox: {
    paddingTop: 16,
    paddingBottom: 4,
    paddingHorizontal: 16,
  },
  paddedBox: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
})

SceneCard.propTypes = {
  card: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  reorder: PropTypes.func.isRequired,
  line: PropTypes.object.isRequired,
  tags: PropTypes.array.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  ui: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  images: PropTypes.object,
  navigation: PropTypes.object.isRequired,
}

function mapStateToProps (state, ownProps) {
  let line = null
  // get the right lines for state.ui.currentTimeline (bookId)
  line = state.lines.find(l => l.id == ownProps.card.lineId)
  return {
    line: line,
    tags: state.tags,
    characters: state.characters,
    places: state.places,
    ui: state.ui
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(actions.card, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SceneCard)
