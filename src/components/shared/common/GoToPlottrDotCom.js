import React, { Component } from 'react'
import { Linking } from 'react-native'
import { t } from 'plottr_locales'
import ShellButton from './ShellButton'
import Text from './Text'

export default class GoToPlottrDotCom extends Component {
  goToPlottr = () => Linking.openURL('https://plottr.com/pricing/')
  render () {
    const { style } = this.props
    return (
      <ShellButton style={style} padded onPress={this.goToPlottr}>
        <Text fontStyle='light' center black>
          {t('Go to our website to learn more:')}
        </Text>
        <Text color='blue' fontStyle='semiBold' center>
          plottr.com
        </Text>
      </ShellButton>
    )
  }
}
