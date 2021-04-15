import React from 'react'
import { View } from 'native-base'
import { StyleSheet } from 'react-native'
import Metrics from '../../../utils/Metrics'
import Colors from '../../../utils/Colors'
import Fonts from '../../../fonts'

export default function Toolbar (props) {
  return (
    <View style={styles.container} elevation={2}>
      {props.children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingTop: Metrics.baseMargin,
    paddingBottom: Metrics.baseMargin * 1.5,
    // height: 90,
    // backgroundColor: 'hsl(212, 33%, 89%)', // gray-8
    backgroundColor: 'hsl(210, 36%, 96%)',
    alignItems: 'flex-start',
    paddingHorizontal: Metrics.doubleBaseMargin,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderGray, // gray-6
    borderRadius: 0,
    shadowColor: '#00000030',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2
  }
})
