import React, { Component } from 'react'
import { View, Image } from 'react-native'
import Text from './Text'
import * as Animatable from 'react-native-animatable'
import styles from './WelcomeToPlottrStyles'
import images from '../../../images'
import { t } from 'plottr_locales'

const { PLOTTR_ICON, PLOTTR_TEXT } = images

export default class WelcomeToPlottr extends Component {
  render () {
    const { children } = this.props
    return (
      <Animatable.View
        animation='fadeInUp'
        easing='ease-out-expo'
        duration={1000}
        style={styles.container}>
        <Image style={styles.logo} source={PLOTTR_ICON} />
        <View style={styles.welcomeSection}>
          <Text fontStyle='light' fontSize='h0'>
            {t('Welcome to')}
          </Text>
          <Image style={styles.logoText} source={PLOTTR_TEXT} />
        </View>
        {children}
      </Animatable.View>
    )
  }
}
