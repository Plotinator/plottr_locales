import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { IoIosAlert } from '@react-icons/all-files/io/IoIosAlert'

import { selectors } from 'wired-up-pltr'
import { t as i18n } from 'plottr_locales'

import Button from '../Button'
import { PlottrComponentsContext } from '../../connections/pltrContext'

const selectionErrorMessages = [
  'Cannot resolve a DOM point from Slate point',
  'Cannot resolve a Slate point from DOM point',
  'Cannot find a descendant at path',
  'Cannot get the start point in the node at path',
  'Cannot lift node at a path',
]

class RCEBoundary extends Component {
  static contextType = PlottrComponentsContext

  // @type {PlottrComponentsContext}
  context

  state = {
    hasError: false,
    viewError: false,
    error: null,
    count: 0,
    autoResetCount: 0,
    errorReporter: { error: (_message, _error) => {} },
  }

  static propTypes = {
    children: PropTypes.node,
    resetChildren: PropTypes.func,
    createErrorReport: PropTypes.func.isRequired,
    openExternal: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
  }

  static getDerivedStateFromError(error) {
    return { error, viewError: false }
  }

  componentDidMount() {
    // If we're in classic, get the user-identifying data from the
    // "user" object which comes from EDD.
    const userId = this.props.userId || 'UNKNOWN_USER'
    const userEmail = this.props.email || 'UNKNOWN_EMAIL'
    const fileURL = this.props.fileURL
    Promise.all([
      this.context.platform.errorReporter.platform(),
      this.context.platform.appVersion(),
    ])
      .then(([os, version]) => {
        return this.context.platform.errorReporter.errorReporter(
          this.context.platform.errorReporter.errorReporterAccessToken,
          version,
          this.context.platform.node.env,
          this.context.platform.log,
          'RCEErrorBoundary',
          os,
          userId,
          userEmail,
          fileURL
        )
      })
      .then((reporter) => {
        this.setState({ errorReporter: reporter })
      })
      .catch((error) => {
        this.context.platform.log.error('Could not construct error reporter instance.', error)
      })
  }

  componentDidCatch(error, errorInfo) {
    if (selectionErrorMessages.some((m) => error.message.includes(m))) {
      this.context.platform.log.warn('Reseting selection on RCE after an error.', error, errorInfo)
      this.props.resetChildren()
      return
    }
    this.error = error
    this.errorInfo = errorInfo
    this.context.platform.log.error(error, errorInfo)
    if (this.state.errorReporter) {
      this.state.errorReporter.error(`Error in RCE ${JSON.stringify(errorInfo)}`, error)
    }
  }

  componentDidUpdate() {
    const { error, autoResetCount } = this.state
    if (autoResetCount > 0) return

    // attempt an auto reset
    // @ts-ignore
    if (error && selectionErrorMessages.some((m) => error.message.includes(m))) {
      this.setState({ error: null, count: 0, autoResetCount: autoResetCount + 1 })
    }
  }

  tryAgain = () => {
    this.setState({ error: null, count: this.state.count + 1, autoResetCount: 0 })
  }

  createReport = () => {
    this.props.createErrorReport(this.error, this.errorInfo, {}, this.props.trialInfo)
  }

  goToSupport = () => {
    this.props.openExternal('https://plottr.com/support/')
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-boundary rce">
          <div className="text-center">
            <h4>
              <IoIosAlert />
              {i18n('Text Error')}
            </h4>
          </div>
          <div className="error-boundary__options">
            <Button bsStyle="warning" onClick={this.tryAgain}>
              {i18n('Try that again')}
            </Button>
            <Button onClick={() => this.setState({ viewError: !this.state.viewError })}>
              {i18n('View Error')}
            </Button>
          </div>
          {this.state.count > 0 ? (
            <div className="text-center well">
              <Button onClick={this.createReport}>{i18n('Create Report')}</Button>
              <p style={{ fontSize: '20px' }}>
                <span>
                  {i18n('You can create an error report and report the problem to us at: ')}
                </span>
                <br />
                <a href="#" onClick={this.goToSupport}>
                  {i18n('Plottr Support')}
                </a>
              </p>
            </div>
          ) : null}
          {this.state.viewError ? (
            <div className="error-boundary__view-error well">
              <h3>{i18n('Error: {error}', { error: this.error?.message })}</h3>
              <div>{this.errorInfo?.componentStack}</div>
            </div>
          ) : null}
        </div>
      )
    }

    return this.props.children
  }
}

RCEBoundary.propTypes = {
  trialInfo: PropTypes.object,
  user: PropTypes.object.isRequired,
  userId: PropTypes.string,
  email: PropTypes.string,
  fileURL: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
  resetChildren: PropTypes.func.isRequired,
  openExternal: PropTypes.func.isRequired,
  createErrorReport: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  trialInfo: selectors.trialInfoSelector(state),
  user: selectors.userSettingsSelector(state),
  userId: selectors.userIdSelector(state),
  email: selectors.emailAddressSelector(state),
  fileURL: selectors.fileURLSelector(state),
})

export default connect(mapStateToProps)(RCEBoundary)
