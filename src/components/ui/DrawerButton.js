import React from 'react'
import { Button, Icon } from 'native-base'
import { isTablet } from 'react-native-device-info'
import { ScaledSheet } from 'react-native-size-matters'
import Metrics from '../../utils/Metrics'

const onTablet = isTablet()

export default function DrawerButton (props) {
  return (
    <Button
      light
      transparent
      onPress={props.openDrawer}
      style={styles.tabletButton}>
      <Icon type='FontAwesome5' name='bars' style={styles.tabletIcon} />
    </Button>
  )
}

const styles = ScaledSheet.create({
  tabletButton: {
    borderRadius: Metrics.cornerRadius / 2,
    alignSelf: 'center',
    backgroundColor: onTablet ? 'white' : 'transparent',
    marginRight: onTablet ? 20 : 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2
  },
  tabletIcon: {
    fontSize: '18@ms'
  }
})
