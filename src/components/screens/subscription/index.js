import React, { Component } from 'react'
import {
  View,
  Linking,
  ScrollView,
  TouchableWithoutFeedback
} from 'react-native'
import { connect } from 'react-redux'
import styles from './styles'
import {
  Text,
  Button,
  ShellButton,
  WelcomeToPlottr,
  GoToPlottrDotCom
} from '../../shared/common'
import * as Animatable from 'react-native-animatable'
import { t } from 'plottr_locales'
import { Spinner } from 'native-base'
import {
  endSession,
  startSession,
  getUserPurchases,
  getAppSubscriptions,
  subscribeToPurchaseEvents,
  requestUserPermissionToSubscribe
} from '../../../utils/InAppPurchases'
import { showAlert } from '../../shared/common/AlertDialog'
import Metrics from '../../../utils/Metrics'
import Colors from '../../../utils/Colors'

const { IS_ANDROID } = Metrics

class Subscription extends Component {
  state = {
    loading: true,
    subscriptions: [],
    userPurchases: [],
    attemptedPurchase: false,
    noValidSubscription: false
  }

  requestTimer = null

  componentDidMount () {
    // start In-App Purchasing Session
    startSession((success, reason) => {
      if (success) {
        // get available subscriptions
        getAppSubscriptions((success, subscriptions) => {
          console.log(
            'APP SUBSCRIPTION',
            success ? subscriptions : 'no subscriptions'
          )
          this.setState({
            subscriptions: success ? subscriptions : [],
            loading: false
          })
        })
        // listen to purchase event calls
        subscribeToPurchaseEvents(this.handlePurchaseEvent)
      } else {
        showAlert({
          message: reason || t('Your In-App Purchases seem to be disabled')
        })
      }
      console.log('SESSION STARTED: ', success)
    })
  }

  componentWillUnmount () {
    // remove liseners for purchasing events
    // and end In-App Purchasing Session
    endSession()
  }

  setLoading (loading) {
    this.setState({ loading })
    clearInterval(this.requestTimer)
    if(loading)
      // timeout fallback to avoid infinite loading
      this.requestTimer = setTimeout(() => this.setLoading(false), 1e4)
  }

  validateUserPurchase (purchase) {
    const { transactionDate } = purchase
    const rough30days = 2678400000
    const thirtyDaysAfter = transactionDate + rough30days
    const validSubscription = new Date() < new Date(thirtyDaysAfter)
    console.info(
      `PURCHASE IS ${validSubscription ? 'VALID' : "NOT VALID"}`,
      purchase
    )
    if(validSubscription) {
      const { navigation, route: { params: { subscribeUser } } } = this.props
      const { attemptedPurchase } = this.state
      this.setState({ noValidSubscription: false }, () => {
        const User = {
          restored: !attemptedPurchase,
          noAutoRedirect: true, // for congrats screen
          validSubscription,
          ...purchase
        }
        // setting user
        subscribeUser(User)
        // redirect
        navigation.navigate('SubscriptionConfirmation', { User })
      })
    } else {
      this.setState({ noValidSubscription: !validSubscription })
    }
  }

  handleGoToTerms = () =>
    Linking.openURL('https://plottr.com/terms-conditions/')

  handleGoToPrivacy = () =>
    Linking.openURL('https://plottr.com/privacy-policy/')

  handleGoBack = () => {
    const { navigation } = this.props
    navigation.goBack()
  }

  handleSubscribeUser = (subscription) => {
    const { verifying, subscriptions } = this.props
    // only just subscribe to one
    // product, TODO: write a stronger
    // future proof logic
    const { productId } = subscription
    // no events on requests / request cancellations
    // so add a timer for a pseudo loading
    this.setState({
      loading: true,
      attemptedPurchase: true
    })
    requestUserPermissionToSubscribe(productId)
  }

  handleRestoreUserPurchase = () => {
    this.setLoading(true)
    getUserPurchases((success, purchases) => {
      console.log('USER PURCHASES', success ? purchases : 'no purchases')
      const userPurchases = purchases || []// success ? purchases : []
      this.setState({
        userPurchases,
        loading: false
      })
      //
      if(userPurchases.length) {
        const lastPurchase = userPurchases[0]
        console.log('LAST USER PURCHASE', lastPurchase)
        this.validateUserPurchase(lastPurchase)
      }
    })
  }

  handlePurchaseEvent = (success, result, purchase) => {
    console.log('CALLBACK FOR PURCHASE', success, result, purchase)
    if(success) this.validateUserPurchase(purchase)
    else {
      this.setLoading(false)
      const { code = '' } = purchase || {}
      const userCancelled = code.match(/user_cancelled/i)
      if(!userCancelled)
      showAlert({
        title: t('UH-OH!'),
        message: result
      })
    }
  }

  renderLoader () {
    return (
      <View style={styles.loader}>
        <Spinner color='orange' />
      </View>
    )
  }

  renderSubscriptions () {
    const { verifying } = this.props
    const {
      subscriptions,
      loading,
      userPurchases,
      noValidSubscription
    } = this.state
    const isLoading = loading || verifying
    const showRestore = !userPurchases.length || !noValidSubscription
    const subscribeButtons = subscriptions.map((subscription, i) => (
      <SubscriptionButton
        key={i}
        index={i}
        disabled={isLoading}
        subscription={subscription}
        onPress={this.handleSubscribeUser}/>
    ))
    showRestore && subscribeButtons.push(
      <Button
        key='restore'
        block
        disabled={isLoading}
        buttonColor='gold'
        style={styles.button}
        onPress={this.handleRestoreUserPurchase}>
        {t('Restore Purchase')}
      </Button>
    )
    return subscribeButtons
  }

  render () {
    const { verifying } = this.props
    const { subscriptions, userPurchases, loading } = this.state
    const isLoading = loading || verifying
    return (
      <ScrollView contentContainerStyle={styles.scroller}>
        <TouchableWithoutFeedback>
          <View style={styles.container}>
            <WelcomeToPlottr>
              <Text black fontStyle='bold' fontSize='h3' center>
                {t('Get access to all your projects')}
              </Text>
              <Text black fontSize='h4' center>
                {t('with an iOS mobile subscription!')}
              </Text>
            </WelcomeToPlottr>
            <Animatable.View
              delay={150}
              duration={1000}
              animation='fadeInUp'
              easing='ease-out-expo'
              style={styles.actionButtons}>
              {isLoading ? this.renderLoader() : this.renderSubscriptions()}
              <Button
                tight
                key={'back'}
                buttonColor='gray'
                style={styles.button}
                onPress={this.handleGoBack}>
                {t('Go Back')}
              </Button>
              {IS_ANDROID && <GoToPlottrDotCom />}
            </Animatable.View>
            <Animatable.View
              delay={150}
              duration={1000}
              animation='fadeInUp'
              easing='ease-out-expo'
              style={styles.footNote}>
              <Text fontSize='tiny' color='textLightGray'>
                {t("By starting a mobile subscription, you agree to Plottr's")}
                {' '}
              </Text>
              <View style={styles.inline}>
                <ShellButton
                  style={styles.link}
                  onPress={this.handleGoToTerms}>
                  <Text fontSize='tiny' color='orange'>
                    {t('Terms of Service')}
                  </Text>
                </ShellButton>
                <Text fontSize='tiny' color='textLightGray' style={styles.link}>
                  {t('and')}
                </Text>
                <ShellButton
                  style={styles.link}
                  onPress={this.handleGoToPrivacy}>
                  <Text fontSize='tiny' color='orange'>
                    {t('Privacy Policy')}
                  </Text>
                </ShellButton>
              </View>
            </Animatable.View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    )
  }
}

const buttonColors = ['blue', 'green', 'orange']
const SubscriptionButton = ({ disabled, subscription, onPress, index }) => {
  const { price, productId } = subscription
  const handleSubscription = () => {
    onPress(subscription)
  }
  // parse term from product id
  // warning: keep this pattern or
  // change this logic if pattern
  // is changed in the future
  const termFromId = productId.replace(/(plottrprod|sub)/ig, '')
  const termText = termFromId.toUpperCase()
  const buttonStyles = [
    styles.subButton,
    { backgroundColor: Colors[buttonColors[index]] }
  ]
  return (
    <ShellButton
      block
      disabled={disabled}
      style={buttonStyles}
      onPress={handleSubscription}>
      <View style={styles.buttonText}>
        <Text white fontStyle='bold'>{t(`Plottr Mobile ${termFromId}`)}</Text>
      </View>
      <View style={styles.badge}>
        <Text white fontStyle='bold'>${price}</Text>
        <Text white fontStyle='bold' style={styles.termText}>{termText}</Text>
      </View>
    </ShellButton>
  )
}

const mapStateToProps = ({ data: { user, verifying } }) => {
  return { user, verifying }
}

export default connect(mapStateToProps)(Subscription)
