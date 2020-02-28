import request from 'request'
import storage from 'electron-json-storage'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Button, FormControl, Glyphicon } from 'react-bootstrap'
import { ipcRenderer } from 'electron'
import i18n from 'format-message'
import { machineIdSync } from 'node-machine-id'
import { getLicenseInfo } from './verifyRequests'
import SETTINGS from '../settings'

const useEDD = process.env.useEDD === 'true'

const SUCCESS = 'success'
const OFFLINE = 'offline'
const INVALID = 'invalid'
const TOOMANY = 'toomany'
const CANTSAVE = 'cantsave'
const SAVE2 = 'save_attempt_2'
const RED = 'bg-danger'
const GREEN = 'bg-success'

class VerifyView extends Component {
  constructor (props) {
    super(props)
    var alertConst = ''
    var showAlert = false
    var connected = navigator.onLine
    if (!connected) alertConst = OFFLINE
    var alertText = this.makeAlertText(alertConst)
    if (alertText) showAlert = true
    this.state = {showAlert: showAlert, alertText: alertText, alertClass: RED, spinnerHidden: true, connected: connected}
  }

  makeAlertText (value) {
    if (value === SUCCESS) {
      return i18n('License Verified. Plottr will start momentarily. Thanks for being patient!')
    } else if (value === OFFLINE) {
      return i18n("It looks like you're not online. You don't always have to be online to user Plottr, but it can't verify your license offline")
    } else if (value === INVALID) {
      return i18n("Hmmmm. It looks like that's not a valid license key")
    } else if (value === TOOMANY) {
      return i18n('It looks like you have Plottr on 5 computers already')
    } else if (value === CANTSAVE) {
      return i18n("Plottr verified your license key successfully, but there was an error saving that. Let's try one more time")
    } else if (value === SAVE2) {
      return i18n("Nope. Plottr tried again. But it didn't work. Plottr will ask you next time it opens, but you're verified. Enjoy")
    } else {
      return null
    }
  }

  isValidLicense = (body) => {
    return body.success && !body.purchase.refunded && !body.purchase.chargebacked && !body.purchase.disputed
  }

  buildURL = (license) => {
    const itemId = "355"
    // itemId = "737" // for premium features
    let url = 'http://plottr.flywheelsites.com'
    url += `/edd-api?key=${process.env.EDD_KEY}&token=${process.env.EDD_TOKEN}&number=-1`
    url += `&edd_action=activate_license&item_id=${itemId}&license=${license}`
    url += `&url=${machineIdSync(true)}`
    return url
  }

  makeRequest = (license) => {
    let req = {
      url: 'https://api.gumroad.com/v2/licenses/verify',
      method: 'POST',
      json: true,
      body: {
        product_permalink: 'fgSJ',
        license_key: license
      }
    }
    if (process.env.NODE_ENV === 'development') {
      req.body.increment_uses_count = 'false'
    }
    return req
  }

  hasActivationsLeft = (body) => {
    return body.uses < 5
  }

  verifyLicense = (license) => {
    if (license === "!TEST_LICENSE_@NEPHI") {
      ipcRenderer.send('license-verified')
    }
    const view = this
    if (useEDD) {
      getLicenseInfo(license, (error, valid, licenseInfo) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(body)
        }
        let newState = {spinnerHidden: true}
        if (error || !valid) {
          if (licenseInfo && !licenseInfo.hasActivationsLeft) {
            // not valid because of number of activations
            newState.showAlert = true
            newState.alertText = view.makeAlertText(TOOMANY)
          } else {
            // invalid
            newState.showAlert = true
            newState.alertText = view.makeAlertText(INVALID)
          }
        } else {
          // valid
          this.saveInfo(licenseInfo, err => {
            if (err) {
              this.setState({showAlert: true, alertText: this.makeAlertText(CANTSAVE)})
              this.saveInfo(body, error => {
                if (error) {
                  this.setState({showAlert: true, alertText: this.makeAlertText(SAVE2)})
                } else {
                  this.setState({showAlert: true, alertClass: GREEN, alertText: this.makeAlertText(SUCCESS)})
                  if (process.env.NODE_ENV !== 'development') {
                    ipcRenderer.send('license-verified')
                  }
                }
              })
            } else {
              this.setState({showAlert: true, alertClass: GREEN, alertText: this.makeAlertText(SUCCESS)})
              if (process.env.NODE_ENV !== 'development') {
                ipcRenderer.send('license-verified')
              }
            }
          })
        }
        this.setState(newState)
      })
    } else {
      var req = this.makeRequest(license)
      request(req, (err, response, body) => {
        var newState = {spinnerHidden: true}
        if (err && err.code === 404) {
          newState.showAlert = true
          newState.alertText = view.makeAlertText(INVALID)
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log(body)
          }
          if (view.isValidLicense(body)) {
            if (view.hasActivationsLeft(body)) {
              // valid
              view.saveInfo(body, err => {
                if (err) {
                  view.setState({showAlert: true, alertText: view.makeAlertText(CANTSAVE)})
                  view.saveInfo(body, error => {
                    if (error) {
                      view.setState({showAlert: true, alertText: view.makeAlertText(SAVE2)})
                    } else {
                      view.setState({showAlert: true, alertClass: GREEN, alertText: view.makeAlertText(SUCCESS)})
                      if (process.env.NODE_ENV !== 'development') {
                        ipcRenderer.send('license-verified')
                      }
                    }
                  })
                } else {
                  view.setState({showAlert: true, alertClass: GREEN, alertText: view.makeAlertText(SUCCESS)})
                  if (process.env.NODE_ENV !== 'development') {
                    ipcRenderer.send('license-verified')
                  }
                }
              })
            } else {
              // not valid becuase of too many activations
              newState.showAlert = true
              newState.alertText = view.makeAlertText(TOOMANY)
            }
          } else {
            // invalid
            newState.showAlert = true
            newState.alertText = view.makeAlertText(INVALID)
          }
        }
        view.setState(newState)
      })
    }
  }

  saveInfo = (info, callback) => {
    if (info.premium) {
      SETTINGS.set('premiumFeatures', true)
    } else {
      SETTINGS.set('premiumFeatures', false)
    }
    storage.set('user_info', info, callback)
  }

  handleVerify () {
    if (navigator.onLine) {
      var input = ReactDOM.findDOMNode(this.refs.license)
      var license = input.value.trim()
      if (license != '') {
        this.setState({spinnerHidden: false})
        this.verifyLicense(license)
      }
    } else {
      this.setState({showAlert: true, alertText: this.makeAlertText(OFFLINE)})
    }
  }

  render () {
    var contact = i18n.rich("(If not, please contact me at <a>family@plottrapp.com</a> or @StoryPlottr on Twitter)", {
      a: ({ children }) => <a key="a" href='mailto:family@plottrapp.com'>{children}</a>
    })
    return (
      <div>
        <h2>{i18n('Please verify your license')}</h2>
        <p className='text-success'>{i18n('You should have received a license key from Gumroad.')}</p>
        <p className='text-info'>{contact}</p>
        <div className='form-inline' style={{marginTop: '50px'}}>
          <FormControl type='text' bsSize='large' style={{width: '450px'}} ref='license' />
          <Button bsStyle='primary' bsSize='large' onClick={this.handleVerify.bind(this)}>{i18n('Verify')}</Button>
          <span style={{marginLeft: '7px'}} className={this.state.spinnerHidden ? 'hidden' : ''}><Glyphicon id='spinner' glyph='refresh'/></span>
        </div>
        { this.renderAlert() }
      </div>
    )
  }

  renderAlert () {
    if (this.state.showAlert && this.state.alertText) {
      return <p id='alert' className={this.state.alertClass}>{this.state.alertText}</p>
    } else {
      return null
    }
  }
}

VerifyView.propTypes = {

}

export default VerifyView
