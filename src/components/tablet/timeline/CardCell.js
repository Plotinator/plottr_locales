import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { View, Button, Icon } from 'native-base'
import tinycolor from 'tinycolor2'
import {
  StyleSheet,
  PanResponder,
  Animated,
  TouchableOpacity
} from 'react-native'
import Cell from '../shared/Cell'
import CardModal from './CardModal'
import { useRegisterCoordinates } from './hooks'
import { Text } from '../../shared/common'
import Metrics from '../../../utils/Metrics'

export default function CardCell (props) {
  const { color, card, onEditCard } = props
  const [pan, setPan] = useState(new Animated.ValueXY())
  const [panResponder, setResponder] = useState(null)
  const [cellRef, measure] = useRegisterCoordinates(
    props.register,
    card.beatId,
    card.lineId,
    false,
    card.positionWithinLine,
    card.title
  )
  useLayoutEffect(() => {
    // Initialize PanResponder with move handling
    resp = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false
      }),
      onPanResponderRelease: (e, gesture) => {
        if (!props.handleDrop(gesture.moveX, gesture.moveY, card)) {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false
          }).start()
        }
      }
    })
    setResponder(resp)
  }, [])

  useEffect(() => {
    // Add a listener for the delta value change
    // let _val = { x:0, y:0 }
    // let listenerId = pan.addListener((value) => _val = value);
    // adjusting the delta value
    pan.setValue({ x: 0, y: 0 })

    // return () => pan.removeListener(listenerId)
  }, [])

  if (!panResponder) return null

  const handleEditCard = () => {
    onEditCard && onEditCard(card)
  }

  const colorObj = tinycolor(color)
  const cardColor = colorObj.toHexString()
  const borderColor = { borderColor: cardColor }
  const panStyle = {
    transform: pan.getTranslateTransform()
  }
  return (
    <Cell style={styles.cell} ref={cellRef}>
      {props.showLine ? (
        <View style={[styles.coloredLine, borderColor]} />
      ) : null}
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.cardBox, panStyle, borderColor]}
        elevation={5}>
        <View style={styles.cardInner}>
          <Text fontStyle='semiBold' style={styles.cardText} numberOfLines={3}>
            {card.title}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleEditCard}
          style={styles.cardButton}
          hitSlop={{ top: 20, bottom: 25, left: 25, right: 25 }}>
          <View style={styles.cardButtonColor}>
            <View
              style={[styles.cardButtonShape, { borderTopColor: cardColor }]}
            />
          </View>
          <Icon type='FontAwesome5' name='pen' style={styles.pen} />
        </TouchableOpacity>
      </Animated.View>
      {/* renderModal() */}
    </Cell>
  )
}

const styles = StyleSheet.create({
  cell: {
    justifyContent: 'center'
  },
  coloredLine: {
    width: '100%',
    borderWidth: 1,
    position: 'absolute',
    top: 45.5
  },
  cardBox: {
    position: 'absolute',
    left: 26, // 25 +1
    width: 125,
    height: 80,
    backgroundColor: 'hsl(210, 36%, 96%)', // gray-9
    borderWidth: 3,
    borderRadius: Metrics.cornerRadius,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden'
  },
  cardInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Metrics.baseMargin / 2,
    paddingVertical: Metrics.baseMargin / 6
  },
  cardText: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize: 14
  },
  cardButton: {
    marginTop: 'auto',
    alignSelf: 'flex-end'
  },
  pen: {
    fontSize: 12,
    marginRight: -2,
    color: 'white'
  },
  cardButtonColor: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    transform: [{ rotate: '180deg' }]
  },
  cardButtonShape: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 30,
    borderTopWidth: 30,
    borderRightColor: 'transparent',
    borderTopColor: 'red'
  }
})
