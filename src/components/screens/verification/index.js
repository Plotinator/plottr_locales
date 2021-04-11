import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  View,
  Image,
  Linking,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native'
import styles from './styles'
import {
  Text,
  ShellButton,
  Input,
  Button,
  WelcomeToPlottr,
  GoToPlottrDotCom
} from '../../shared/common'
import images from '../../../images'
import * as Animatable from 'react-native-animatable'
import { t } from 'plottr_locales'
import Metrics from '../../../utils/Metrics'
import { checkLicense, getLicenses } from '../../../utils/user_info'
import { TESTR_EMAIL } from '../../../utils/constants'
import { showAlert } from '../../shared/common/AlertDialog'

const { IS_ANDROID } = Metrics

class Verification extends Component {
  state = {
    email: '',
    verifying: false
  }

  // componentDidUpdate () {
  //   const { user, navigation } = this.props
  //   const { submitted, verifying } = this.state
  //   if (submitted && !verifying && user && user.email && !user.verified) {
  //     // email valid now lets confirm
  //     navigation.navigate('VerificationConfirmation')
  //     this.setState({ submitted: false })
  //   }
  // }

  showError (message, useTranslation = true) {
    showAlert({
      title: t('UH-OH!'),
      message: useTranslation ? t(message) : message
    })
  }

  handleEmailValidation = async () => {
    const { navigation } = this.props
    const { email } = this.state
    const { route: { params: { sendVerificationEmail } } } = this.props

    this.setState({ submitted: true, verifying: true })
    await getLicenses(email, async (result, error) => {
      if (!result || error) {
        return this.showError(error || t("Your email didn't verify. Try again or try another email."), false)
      }
      if (result.length > 1 || result[0] && result[0].licenses?.length > 1) {
        // when you have more than one licenses
        navigation.navigate('VerificationLicenses', { Licenses: result })
        console.log('LICENSES', result)
      } else if(result[0]) {
        // only one license
        console.log('ONLY ONE')
        if (result[0].email === TESTR_EMAIL) {
          // test user bypass
          console.log('IS TEST USER')
          return sendVerificationEmail(result[0])
        }
        // process real user
        const [success, userInfo] = await checkLicense(result[0])
        if (success) {
          await sendVerificationEmail(userInfo)
          navigation.navigate('VerificationConfirmation')
        } else {
          const error = t("Your email didn't verify. Try again or try another email.")
          const hasMessage = userInfo && userInfo.message
          const message = (hasMessage ? `\n${hasMessage}` : '')
          this.showError(error + message, false)
        }
      } else {
        this.showError('You currently have no available licenses for this email.')
      }
    })
    this.setState({ submitted: false, verifying: false })
  }

  handleEmailText = email => this.setState({ email })

  handleGetLicense () {
    Linking.openURL('https://plottr.com/pricing/')
  }

  handleGoToSubscriptions = () => {
    const { navigation } = this.props
    navigation.navigate('Subscription')
  }

  renderSubscriptionButtons(verifying) {
    if (IS_ANDROID) return null

    return <>
      {IS_ANDROID ? (
        <View style={styles.or}>
          <Text fontStyle={'bold'}>{t('or')}</Text>
        </View>
      ) : null}
      <Button
        block
        disabled={verifying}
        style={styles.button}
        onPress={this.handleGoToSubscriptions}>
        {t('Start Mobile Subscription')}
      </Button>
    </>
  }

  render() {
    const { email, verifying } = this.state
    const isValidEmail = email && String(email).match(
      /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
    )

    return (
      <ScrollView
        contentContainerStyle={styles.scroller}
        showsVerticalScrollIndicator={false}>
        <TouchableWithoutFeedback>
          <View style={styles.container}>
            <WelcomeToPlottr>
              <Text black fontStyle='bold' fontSize='h3' center>
                {t("Let's verify your license.")}
              </Text>
              <Text black fontSize='h4' center>
                {t('We will email you a verification code.')}
              </Text>
            </WelcomeToPlottr>
            <Animatable.View
              delay={100}
              duration={1000}
              animation='fadeInUp'
              easing='ease-out-expo'
              style={styles.formSection}>
              <Input
                friendly
                value={email}
                disabled={verifying}
                placeholder={t('Email').toUpperCase()}
                onChangeText={this.handleEmailText}
                autoCompleteType='email'
                autoCapitalize='none'
                keyboardType='email-address'
              />
              <Button
                block
                buttonColor='green'
                style={styles.button}
                disabled={verifying || !isValidEmail}
                onPress={this.handleEmailValidation}>
                {t(verifying ? 'CHECKING...' : 'CHECK EMAIL')}
              </Button>
            </Animatable.View>
            <Animatable.View
              delay={170}
              duration={1000}
              animation='fadeInUp'
              easing='ease-out-expo'
              style={styles.dontHaveLicense}>
              <Text black fontStyle='bold' fontSize='h4'>
                {t("Don't have a license?")}
              </Text>
            </Animatable.View>
            <Animatable.View
              delay={150}
              duration={1000}
              animation='fadeInUp'
              easing='ease-out-expo'
              style={styles.actionButtons}>
              {IS_ANDROID ? (
                <Button
                  block
                  buttonColor='blue'
                  style={styles.button}
                  onPress={this.handleGetLicense}>
                  {t('GET A LICENSE')}
                </Button>
              ) : null}
              {this.renderSubscriptionButtons(verifying)}
              {IS_ANDROID && <GoToPlottrDotCom />}
            </Animatable.View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    )
  }
}

const mapStateToProps = ({ data: { user, verifying } }) => {
  return { user, verifying }
}

export default connect(mapStateToProps)(Verification)
