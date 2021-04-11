import React, { Component } from 'react'
import { View, Image } from 'react-native'
import { connect } from 'react-redux'
import styles from './styles'
import {
  Text,
  Button,
  WelcomeToPlottr,
  GoToPlottrDotCom
} from '../../shared/common'
import Images from '../../../images'
import * as Animatable from 'react-native-animatable'
import { t } from 'plottr_locales'
import Metrics from '../../../utils/Metrics'

const { IS_ANDROID } = Metrics

const { BIRTHDAY_EMOJI } = Images

class SubscriptionConfirmation extends Component {

  handleGetStarted = () => {
    const { route: { params: { subscribeUser, User } } } = this.props
    delete User.noAutoRedirect
    // set user
    subscribeUser(User)
  }

  render () {
    const { route: { params: { User } } } = this.props
    const { restored } = User
    return (
      <View style={styles.container}>
        <WelcomeToPlottr>
          <Image source={BIRTHDAY_EMOJI} style={styles.emoji} />
          <Text black fontStyle='bold' fontSize='h3' center>
            {t(restored ? 'Subscription Restored!' : 'Awesome choice!')}
          </Text>
          <Text black fontSize='h4' center>
            {t('Now lets get you writing your next great plot!')}
          </Text>
        </WelcomeToPlottr>
        <Animatable.View
          delay={150}
          duration={1000}
          animation='fadeInUp'
          easing='ease-out-expo'
          style={styles.actionButtons}>
          <Button
            block
            buttonColor='green'
            style={styles.button}
            onPress={this.handleGetStarted}>
            {t('GET STARTED!')}
          </Button>
        </Animatable.View>
        {IS_ANDROID && <GoToPlottrDotCom />}
      </View>
    )
  }
}

const mapStateToProps = ({ data: { user, verifying } }) => {
  return {}
}

export default connect(mapStateToProps)(SubscriptionConfirmation)
