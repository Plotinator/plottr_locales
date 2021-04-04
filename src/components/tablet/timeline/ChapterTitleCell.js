import React, { PureComponent } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { StyleSheet, View, Animated, PanResponder } from 'react-native'
import t from 'format-message'
import prompt from 'react-native-prompt-android'
import { selectors, actions } from 'pltr/v2'
import Cell from '../shared/Cell'
import { showAlert, showInputAlert } from '../../shared/common/AlertDialog'
import { Text, ShellButton } from '../../shared/common'
import { CELL_WIDTH } from '../../../utils/constants'
import { moderateScale } from 'react-native-size-matters'

class ChapterTitleCell extends PureComponent {
  state = {
    offsetX: 0
  }
  _panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => true,
    onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
    onPanResponderRelease: (event, { dx }) => {
      const { beat, beat: { position } } = this.props
      const HALF_WIDTH = CELL_WIDTH / 2
      const willChange = dx < -HALF_WIDTH || dx > HALF_WIDTH
      const multiplier = (dx < -1 ? -1 : 1)
      if (willChange) {
        const Position = Number(String(dx).replace('-', ''))
        const MovePosition = Math.ceil(
          (Position - HALF_WIDTH) / CELL_WIDTH
        ) * multiplier
        const NewPosition = position + MovePosition
        this.props.moveBeat(NewPosition, beat)
      }
      this.setState({ offsetX: 0 })
      if (dx === 0) {
        // click
        this.handleEditBeat()
      }
    },
    onPanResponderMove: (event, gestureState) => {
      this.setState({
        offsetX: gestureState.dx
      })
    }
  });

  handleEditBeat = () => {
    const { beat, onEditBeat } = this.props
    beat.title = beat.title || 'auto'
    onEditBeat && onEditBeat(beat)
  }

  render () {
    const { offsetX } = this.state
    const { beatTitle } = this.props
    // ref is needed
    const moveStyles = {
      left: offsetX,
      zIndex: offsetX != 0 ? 9 : 0
    }
    return (
      <View
        {...this._panResponder.panHandlers}
        style={moveStyles}>
        <Cell style={styles.cell}
          onPress={this.handleEditBeat}
          ref={r => this.ref = r}>
          <Text
            fontStyle='bold'
            style={styles.text}
            numberOfLines={3}>
            {beatTitle}
          </Text>
        </Cell>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  text: {
    textAlign: 'center',
    fontSize: moderateScale(10),
    paddingHorizontal: 10,
    backgroundColor: 'hsl(210, 36%, 96%)'
  },
})

ChapterTitleCell.propTypes = {
  beatId: PropTypes.number.isRequired,
  actions: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  beatTitle: PropTypes.string.isRequired,
  positionOffset: PropTypes.number.isRequired,
}

const makeMapState = (state) => {
  const uniqueBeatSelector = selectors.makeBeatSelector()
  const uniqueBeatTitleSelector = selectors.makeBeatTitleSelector()

  return function mapStateToProps (state, ownProps) {
    return {
      beat: uniqueBeatSelector(state, ownProps.beatId),
      ui: state.ui,
      beatTitle: uniqueBeatTitleSelector(state, ownProps.beatId),
      positionOffset: selectors.positionOffsetSelector(state),
    }
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(actions.beat, dispatch)
  }
}

export default connect(
  makeMapState,
  mapDispatchToProps
)(ChapterTitleCell)
