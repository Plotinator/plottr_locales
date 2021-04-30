import React, { Component, useEffect, useState } from 'react'
import {
  View,
  Keyboard,
  StatusBar,
  KeyboardAvoidingView,
  TouchableWithoutFeedback
} from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import {
  checkForActiveLicense,
  getUserVerification,
  getSkipVerificationDetails,
  checkStoredLicense,
  setSubscribedUser,
  verifyUser,
  reset
} from '../utils/user_info'
import { sendVerificationEmail } from '../utils/api'
import AppErrorBoundary from './AppErrorBoundary'
import { t } from 'plottr_locales'
import AlertDialog, { showAlert } from './shared/common/AlertDialog'
import Metrics from '../utils/Metrics'
import Main from './Main'
import { cloneDeep } from 'lodash'
import { TESTR_EMAIL } from '../utils/constants'

const { IS_ANDROID } = Metrics

export default class App extends Component {
  state = {
    userInfo: {},
    verifying: false
  }

  componentDidMount () {
    this.retrieveUserSession()
  }

  setUserInfo = async (info, checkLicense, skipVerification = null) => {
    const skipVerificationDetails = skipVerification
      ? skipVerification
      : info
      ? await getSkipVerificationDetails()
      : null
    const userInfo = (info && cloneDeep(info)) || {}
    this.setState(
      { userInfo, skipVerificationDetails },
      info && checkLicense && this.checkUserLicense
    )
  }

  updateSkipVerification = (skipVerificationDetails) => {
    this.setState({
      skipVerificationDetails: skipVerificationDetails
    })
  }

  setVerifying (verifying) {
    this.setState({ verifying })
  }

  showError (message, useTranslation = true) {
    showAlert({
      title: t('UH-OH!'),
      message: useTranslation ? t(message) : message
    })
  }

  retrieveUserSession = async () => {
    const userInfo = await getUserVerification()
    // delete noAutoRedirect flag if in the
    // rare occurrence it is present due to
    // reset or app crash on confirmation screen
    delete userInfo.noAutoRedirect
    this.setUserInfo(userInfo, true)
  }

  checkUserLicense = async () => {
    const {
      userInfo = {},
      userInfo: { verified, validLicense }
    } = this.state
    const wasVerifiedAndValid = verified && validLicense
    let isActive = false

    // if we have a user check lets check their license
    if (wasVerifiedAndValid) {
      isActive = await checkStoredLicense(userInfo)
    }

    if (wasVerifiedAndValid && !isActive) {
      // License was valid but is no longer active or valid
      // alert user (and perhaps unset user session data)
      this.showError('We found your user session but...')
      this.handleLogout()
      return
    }
  }

  handleLogout = () => {
    // unset user session
    reset()
    this.setUserInfo(null)
  }

  handleEmailVerification = async (email) => {
    this.setVerifying(true)
    const [success, userInfo] = await checkForActiveLicense(email)
    if (success) {
      this.handleSendVerificationEmail(userInfo)
    } else {
      this.setVerifying(false)
      const error = t(
        "Your email didn't verify. Try again or try another email."
      )
      const hasMessage = userInfo && userInfo.message
      const message = hasMessage ? `\n${hasMessage}` : ''
      this.showError(error + message, false)
    }
  }

  handleSendVerificationEmail = async (userInfo) => {
    this.setVerifying(true)
    this.setUserInfo(userInfo)
    const { email } = userInfo
    if (email !== TESTR_EMAIL) {
      await sendVerificationEmail(
        email,
        userInfo.idToVerify,
        this.handleEmailConfirmation
      )
    }
    this.setVerifying(false)
  }

  handleEmailConfirmation = (error) => {
    this.setVerifying(false)
    if (error) {
      this.showError('Error sending email! Check your email and Try again.')
      this.setUserInfo(null)
    }
  }

  handleCodeVerification = async (code) => {
    const { userInfo } = this.state
    const codeVerified = code == userInfo.idToVerify

    this.setVerifying(true)
    if (codeVerified) {
      const [verified, verifiedUserInfo] = await verifyUser(userInfo)
      if (verified) {
        this.setUserInfo(verifiedUserInfo)
      } else {
        // unverified
        const unverifiedUser = verifiedUserInfo
        const noMoreActivations =
          unverifiedUser &&
          unverifiedUser.problem == 'no_activations_left' &&
          !unverifiedUser.hasActivationsLeft
        const reasonForError = noMoreActivations
          ? 'It looks like you have Plottr on the max number of devices already'
          : 'There was an error activating your license key on this device'

        console.log('FAIL', reasonForError, unverifiedUser)
        this.setUserInfo(null)
        this.showError(reason)
      }
    } else {
      this.showError('That code was invalid. Try again.')
    }
    this.setVerifying(false)
  }

  addUserSubscription = (userInfo) => {
    // setting a subscribed user should
    // pass validation with `validSubscription`
    setSubscribedUser(userInfo)
    this.setUserInfo(userInfo)
  }

  handleAppReset = () => {
    this.setState(
      { userInfo: null, verifying: false },
      this.retrieveUserSession
    )
  }

  render () {
    const flexContainer = { flex: 1 }
    const {
      state: { userInfo, verifying, skipVerificationDetails },
      handleSendVerificationEmail,
      handleEmailVerification,
      handleCodeVerification,
      addUserSubscription,
      handleSetUserInfo,
      handleLogout,
      updateSkipVerification
    } = this

    console.log('userInfo', userInfo)
    return (
      <SafeAreaProvider>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            enabled
            behavior={IS_ANDROID ? '' : 'padding'}
            keyboardShouldPersistTaps={'always'}
            style={flexContainer}>
            <View style={flexContainer}>
              <StatusBar barStyle='dark-content' />
              <AppErrorBoundary
                reset={this.handleAppReset}
                recover={this.handleAppReset}>
                <Main
                  v2
                  user={userInfo}
                  skipVerificationDetails={
                    this.state.skipVerificationDetails
                      ? this.state.skipVerificationDetails
                      : {}
                  }
                  verifying={verifying}
                  logout={handleLogout}
                  verifyCode={handleCodeVerification}
                  verifyByEmail={handleEmailVerification}
                  sendVerificationEmail={handleSendVerificationEmail}
                  subscribeUser={addUserSubscription}
                  updateSkipVerification={updateSkipVerification}
                />
              </AppErrorBoundary>
              <AlertDialog />
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaProvider>
    )
  }
}
