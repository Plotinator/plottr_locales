import React, { useEffect, useState, Component } from 'react'
import { NativeModules, NativeEventEmitter } from 'react-native'
import { Provider } from 'react-redux'
import { AppState } from 'react-native'
import DocumentRoot from './DocumentRoot'
import AuthenticatorRoot from './AuthenticatorRoot'
import { configureStore } from '../store/configureStore'
import MainErrorBoundary from './MainErrorBoundary'
import t from 'format-message'
import Metrics from '../utils/Metrics'
import Dashboard from './screens/dashboard'
import DocumentPicker from 'react-native-document-picker'
import rnfs, { DocumentDirectoryPath } from 'react-native-fs'
import { showAlert, showInputAlert } from './shared/common/AlertDialog'
import AsyncStorage from '@react-native-community/async-storage'
import { setDocumentURL } from '../middlewares/DocumentSaver'
import { ifIphoneX } from 'react-native-iphone-x-helper'
import { Changes } from '../utils'
import { SKIP_VERIFICATION_DURATION } from '../utils/constants'

const {
  DocumentViewController,
  ReactNativeEventEmitter,
  DocumentBrowser,
  AndroidDocumentBrowser
} = NativeModules
const { IS_IOS } = Metrics
const DocumentEvents = new NativeEventEmitter(
  IS_IOS ? ReactNativeEventEmitter : AndroidDocumentBrowser
)

let store = configureStore({})

export default class Main extends Component {
  state = {
    document: null,
    appState: 'active',
    loading: false,
    isSubscribed: false,
    recentDocuments: [],
    forceVerification: false
  }

  setLoading = (loading) => this.setState({ loading })

  setDocument = (document) => {
    setDocumentURL(document && document.documentURL)
    this.setState({ document })
  }

  forceVerify = (value) => {
    this.setState({
      forceVerification: value
    });
  }

  closeDocument = () => {
    this.setDocument(null)
    store = configureStore({})
    console.log('CLOSING DOCUMENT')
    if (IS_IOS) DocumentViewController.closeDocument()
  }

  componentDidMount() {
    console.log('Changes', Changes)
    DocumentEvents.addListener('onOpenDocument', this.handleDocumentOpened)
    this.getRecentDocuments()
    // set app state
    AppState.addEventListener('change', this.handleAppState)
  }

  componentWillUnmount() {
    // clean up
    AppState.removeEventListener('change', this.handleAppState)
  }

  handleAppState = (newState) => {
    const { document, appState } = this.state
    const state = { appState: newState }
    const isInActive = newState !== 'active' && appState === 'active'
    const wasInActive = newState === 'active' && appState !== 'active'
    const hasDocument = document && document.documentURL

    if (hasDocument) {
      // document is loaded

      if (isInActive) {
        // app going into the background
        Changes.triggerAutoSaveCallback()
      }

      if (wasInActive) {
        // app resuming from background
        // reload document file
        console.log('reloading document', document.documentURL)
        this.readDocumentFile(document.documentURL)
      }
    }
    // track app state
    this.setState(state)
  }

  handleDocumentOpened = (data, setRecent = true) => {
    if (IS_IOS) DocumentBrowser.closeBrowser()
    this.setDocument(data)
    if (setRecent) {
      if (!IS_IOS || (IS_IOS && data.isInDocuments)) {
        this.addRecentDocument(data)
      }
    }
    this.setLoading(false)
  }

  handleNewProject = ({ input }) => {
    this.setLoading(true)
    const fileName = String(input || 'New Story')
      .replace(/\s+/gi, '_')
      .replace(/[^a-zA-Z0-9_\-]/gi)
    const filePath = DocumentDirectoryPath + `/${fileName}.pltr`
    const fileData = `{"storyName": "${input}", "newFile": true}`
    const writeProjectFile = () => {
      rnfs
        .writeFile(filePath, fileData, 'utf8')
        .then(() =>
          this.handleDocumentOpened({
            data: fileData,
            documentURL: filePath,
            isInDocuments: true
          })
        )
        .catch((err) => {
          this.showCreateFileError()
        })
    }
    rnfs.exists(filePath).then((exists) => {
      if (exists) {
        const actions = [
          {
            positive: true,
            name: t('OVERWRITE'),
            callback: writeProjectFile
          },
          {
            name: t('Cancel').toUpperCase(),
            callback: () => this.setLoading(false)
          }
        ]
        showAlert({
          title: t('LOOK OUT!'),
          message: t('You already have a file named {file}', {
            file: `"${fileName}.pltr"`
          }),
          actions
        })
      } else writeProjectFile()
    })
  }

  getRecentDocuments() {
    // used to reset recents
    // AsyncStorage.setItem('recentDocuments', JSON.stringify([]))

    AsyncStorage.getItem('recentDocuments').then((data) => {
      if (data) {
        try {
          const recentDocuments = JSON.parse(data || '[]')
          this.setState({ recentDocuments })
        } catch (e) {
          console.log('corrupt recent docs', e)
        }
      }
    })
  }

  addRecentDocument({ data, documentURL }) {
    const { recentDocuments = [] } = this.state
    const documentObject = JSON.parse(data)
    const { storyName, series } = documentObject
    const projetName = (series && series.name) || storyName

    recentDocuments.forEach((document, i) => {
      const { name, url } = document
      if (url == documentURL && name == projetName) {
        recentDocuments.splice(i, 1)
      }
    })

    recentDocuments.unshift({
      name: projetName,
      url: documentURL
    })
    // top 2 or 4
    const newRecent = recentDocuments.slice(0, ifIphoneX(4, 2))
    this.setState({ recentDocuments: newRecent })
    AsyncStorage.setItem('recentDocuments', JSON.stringify(newRecent))
  }

  showFileProcessingError() {
    showAlert({
      title: t('UH-OH!'),
      message: t('We had a problem processing your file')
    })
    this.setLoading(false)
  }

  showInValidFileError() {
    showAlert({
      title: t('UH-OH!'),
      message: t('Please select a valid Plottr file')
    })
    this.setLoading(false)
  }

  showCreateFileError() {
    showAlert({
      title: t('UH-OH!'),
      message: t('We had a problem creating a new project')
    })
    this.setLoading(false)
  }

  readDocumentFile(uri, setRecent = true) {
    this.setLoading(true)
    // if (IS_IOS) {
    //   DocumentViewController.readDocument(decodeURI(uri))
    // } else {
    // }
    rnfs
      .readFile(decodeURI(uri), 'utf8')
      .then((data) => {
        const document = {
          data,
          documentURL: uri
        }
        this.handleDocumentOpened(document, setRecent)
      })
      .catch((err) => {
        console.error(err)
        this.showFileProcessingError()
      })
  }

  readDocument = ({ url, name }) => {
    let fileName = String(name)
      .replace(/\s+/gi, '_')
      .replace(/[^a-zA-Z0-9_\-]/gi)
    const filePath = rnfs.DocumentDirectoryPath + `/${fileName}.pltr`
    // let finalURL = rnfs.DocumentDirectoryPath + '/' + name.replace(/ /g,"_") + '.pltr';
    this.readDocumentFile(filePath)
  }

  // selectDocument = () => {
  //   try {
  //     DocumentPicker.pick({
  //       mode: 'open',
  //       type: [
  //         'public.pltr',
  //         'com.clouiss.plottr.pltr',
  //       ],
  //     }).then((res) => {
  //       this.setLoading(true)
  //       const { uri, fileCopyUri, name } = res
  //       if(name.match('.pltr')) {
  //         this.readDocumentFile(uri)
  //       } else {
  //         this.showInValidFileError()
  //         this.setLoading(false)
  //       }
  //     })
  //     .catch((error) => {
  //       if(!String(error).match(/canceled/i)) {
  //         this.showFileProcessingError()
  //       }
  //     })
  //   } catch (err) {
  //     this.showFileProcessingError()
  //     this.setLoading(false)
  //   }
  // }
  selectDocument = () => {
    if (IS_IOS) {
      DocumentBrowser.openBrowser()
    } else {
      this.androidOpenCommand('open')
    }
    // this.setLoading(true)
  }

  androidOpenCommand(type) {
    try {
      AndroidDocumentBrowser.openBrowser(type)
    } catch (error) {
      console.log(error)
    }
  }

  createDocument = () => {
    showInputAlert({
      title: t('New Project'),
      message: t('Enter the name of your project'),
      actions: [
        {
          name: t('CREATE PROJECT'),
          callback: this.handleNewProject,
          positive: true
        },
        {
          name: t('Cancel').toUpperCase()
        }
      ]
    })
  }

  recoverFromError = () => {
    this.setDocument(null)
  }

  renderProjectDocument() {
    const { logout } = this.props
    const { document } = this.state
    const { documentURL } = document || {}
    return (
      <Provider store={store} key={documentURL}>
        <MainErrorBoundary recover={this.recoverFromError}>
          <DocumentRoot
            document={document}
            closeFile={this.closeDocument}
            logout={logout}
          />
        </MainErrorBoundary>
      </Provider>
    )
  }

  renderDashboard(bypass) {
    const {
      readDocument,
      createDocument,
      selectDocument,
      forceVerify,
      state: { loading, recentDocuments },
      props: { logout, skipVerificationDetails, sendVerificationEmail, user }
    } = this
    return (
      <Dashboard
        logout={logout}
        loading={loading}
        noLogout={bypass}
        skipVerificationDetails={skipVerificationDetails}
        readDocument={readDocument}
        recentDocuments={recentDocuments}
        createDocument={createDocument}
        openDocument={selectDocument}
        forceVerify={forceVerify}
      />
    )
  }

  renderAuthenticator() {
    const {
      user,
      verifying,
      verifyCode,
      verifyLicense,
      subscribeUser,
      sendVerificationEmail,
      skipVerificationDetails
    } = this.props
    const { verified } = user

    return (
      <AuthenticatorRoot
        user={user}
        verifying={verifying}
        verifyCode={verifyCode}
        verifyLicense={verifyLicense}
        subscribeUser={subscribeUser}
        sendVerificationEmail={sendVerificationEmail}
        skipVerificationDetails={skipVerificationDetails}
      />
    )
  }

  shouldSkipVerification = (skipVerification, skipVerificationStartTime) => {
    let currentTime = new Date().getTime();
    let timeLapsedSeconds = (parseInt(currentTime) - parseInt(skipVerificationStartTime)) / 1000;
    return skipVerification && timeLapsedSeconds < SKIP_VERIFICATION_DURATION;
  }

  render() {
    const { document, tryVerification } = this.state
    const { user = {} } = this.props
    const { skipVerificationDetails = {} } = this.props
    const {
      verified,
      validLicense,
      validSubscription,
      noAutoRedirect,
    } = user
    const {
      skipVerification,
      skipVerificationStartTime
    } = skipVerificationDetails
    // const bypassForDevs = __DEV__ // false
    const bypassForDevs = false

    // if the user is verified and valid
    // or has a valid subscription
    // or we have a dev bypass (bypassForDevs)
    const userIsVerifiedAndValid =
      !this.state.forceVerification &&
      ( (verified && validLicense) ||
      validSubscription ||
      this.shouldSkipVerification(skipVerification,skipVerificationStartTime) ||
      bypassForDevs)

    // only if a document is loaded we will
    // show the project document for manipulation
    if (userIsVerifiedAndValid && document) return this.renderProjectDocument()

    // if the user is verified and valid
    // or we are developing or there isn't
    // a noAutoRedirect flag, we show the dashboard
    if (userIsVerifiedAndValid && !noAutoRedirect)
      return this.renderDashboard(bypassForDevs)

    // else we don't know who you are! :-(
    // so lets authenticate you ;-)
    return this.renderAuthenticator()
  }
}
