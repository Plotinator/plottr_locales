import { ipcRenderer } from 'electron'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import i18n from 'format-message'
import Navigation from 'containers/Navigation'
import Body from 'containers/Body'
import ErrorBoundary from './ErrorBoundary'
import GuidedTour from '../components/GuidedTour'
import TemplateCreate from '../../common/components/templates/TemplateCreate'
import { focusIsEditable } from '../helpers/undo'
import AskToSaveModal from '../components/dialogs/AskToSaveModal'
import { hasPreviousAction } from '../../common/utils/error_reporter'
import { saveFile } from '../../common/utils/files'
import { store } from '../store/configureStore'

let isTryingToReload = false

export default class App extends Component {
  state = {showTemplateCreate: false, type: null, showAskToSave: false, blockClosing: true}

  componentDidMount () {
    ipcRenderer.on('save-as-template-start', (event, type) => {
      this.setState({showTemplateCreate: true, type: type})
    })
    ipcRenderer.on('reload', () => {
      isTryingToReload = true
      this.askToSave({})
    })
    window.addEventListener('beforeunload', this.askToSave)
  }

  componentWillUnmount () {
    ipcRenderer.removeAllListeners('save-as-template-start')
    ipcRenderer.removeAllListeners('reload')
    window.removeEventListener('beforeunload', this.askToSave)
  }

  askToSave = (event) => {
    // console.log(event.currentTarget.performance.navigation)
    if (!this.state.blockClosing) return
    if (process.env.NODE_ENV == 'development') {
      return this.closeOrRefresh(false)
    }

    if (focusIsEditable()) {
      // TODO: make this work to save people from closing when they are still editing something

      // event.returnValue = 'nope'
      // alert(i18n('Save the work in the open text editor before closing'))
    }
    // no actions yet? doesn't need to save
    if (!hasPreviousAction()) {
      return this.closeOrRefresh(false)
    }

    event.returnValue = 'nope'
    this.setState({showAskToSave: true})
  }

  dontSaveAndClose = () => {
    this.setState({showAskToSave: false, blockClosing: false})
    this.closeOrRefresh(true)
  }

  saveAndClose = () => {
    this.setState({showAskToSave: false, blockClosing: false})
    const { present } = store.getState()
    saveFile(present.file.fileName, present)
    this.closeOrRefresh(true)
  }

  closeOrRefresh = (shouldClose) => {
    if (isTryingToReload) {
      location.reload()
    } else {
      if (shouldClose) window.close()
    }
  }

  renderTemplateCreate () {
    if (!this.state.showTemplateCreate) return null

    return <TemplateCreate type={this.state.type} close={() => this.setState({showTemplateCreate: false})}/>
  }

  renderAskToSave () {
    if (!this.state.showAskToSave) return null

    return <AskToSaveModal dontSave={this.dontSaveAndClose} save={this.saveAndClose} cancel={() => this.setState({showAskToSave: false})}/>
  }

  renderGuidedTour () {
    if (!this.props.showTour) return null
    return <GuidedTour />
  }

  render () {
    return <ErrorBoundary>
      <ErrorBoundary>
        <Navigation />
      </ErrorBoundary>
      <Body />
      { this.renderTemplateCreate() }
      { this.renderAskToSave() }
    </ErrorBoundary>
  }
}
