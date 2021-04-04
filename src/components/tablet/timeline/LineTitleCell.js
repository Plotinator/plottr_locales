import React, { PureComponent } from 'react'
import PropTypes from 'react-proptypes'
import { StyleSheet, View, PanResponder } from 'react-native'
import Cell from '../shared/Cell'
import { LEFT_COLUMN_WIDTH, CELL_HEIGHT } from '../../../utils/constants'
import { Text, Button, Input } from '../../shared/common'

export default class LineTitleCell extends PureComponent {
  state = {
    offsetY: 0
  }
  _panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => true,
    onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
    onPanResponderRelease: (event, { dy }) => {
      const { line, line: { position } } = this.props
      const HALF_HEIGHT = CELL_HEIGHT / 2
      const willChange = dy < -HALF_HEIGHT || dy > HALF_HEIGHT
      const multiplier = (dy < -1 ? -1 : 1)
      if (willChange) {
        const Position = Number(String(dy).replace('-', ''))
        const MovePosition = Math.ceil(
          (Position - HALF_HEIGHT) / CELL_HEIGHT
        ) * multiplier
        const NewPosition = position + MovePosition
        this.props.moveLine(NewPosition, line)
      }
      this.setState({ offsetY: 0 })
      if (dy === 0) {
        // click
        this.handleEdit()
      }
    },
    onPanResponderMove: (event, gestureState) => {
      this.setState({
        offsetY: gestureState.dy
      })
    }
  });

  setViewRef = ref => {
    this.view = ref
  }

  handleEdit = () => {
    const { editPlotLine, line } = this.props
    editPlotLine(line)
  }

  render () {
    const { line } = this.props
    const { offsetY } = this.state
    const moveStyles = {
      top: offsetY,
      zIndex: offsetY != 0 ? 9 : 0
    }
    return (
      <View
        ref={this.setViewRef}
        {...this._panResponder.panHandlers}
        style={moveStyles}>
        <Cell
          style={styles.lineTitleCell}
          onPress={this.handleEdit}>
          <Text
            fontStyle='bold'
            style={styles.lineTitle}
            numberOfLines={3}>
            {line.title}
          </Text>
        </Cell>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  lineTitleCell: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    width: LEFT_COLUMN_WIDTH
  },
  lineTitle: {
    paddingVertical: 10,
    backgroundColor: 'hsl(210, 36%, 96%)',
    textAlign: 'right',
    fontSize: 14
  }
})

LineTitleCell.propTypes = {
  line: PropTypes.object.isRequired
}
