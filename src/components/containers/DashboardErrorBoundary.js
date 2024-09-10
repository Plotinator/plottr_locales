import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import cx from 'classnames'
import { IoIosAlert } from '@react-icons/all-files/io/IoIosAlert'

import { t as i18n } from 'plottr_locales'
import { selectors } from 'wired-up-pltr'

import Button from '../Button'
import { PlottrComponentsContext } from '../../connections/pltrContext'

class DashboardErrorBoundary extends Component {
  static contextType = PlottrComponentsContext

  // @type {PlottrComponentsContext} context
  context

  state = {
    hasError: false,
    viewError: false,
    count: 0,
    errorReporter: { error: (_message, _error) => {} },
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true, viewError: false }
  }

  componentDidMount() {
    // If we're in classic, get the user-identifying data from the
    // "user" object which comes from EDD.
    const userId = this.props.userId || this.props.user.payment_id || 'UNKNOWN_USER'
    const userEmail = this.props.email || this.props.user.customer_email || 'UNKNOWN_EMAIL'
    const fileURL = this.props.fileURL
    Promise.all([
      // @ts-ignore
      this.context.platform.errorReporter.platform(),
      // @ts-ignore
      this.context.platform.appVersion(),
    ])
      .then(([os, version]) => {
        return this.context.platform.errorReporter.errorReporter(
          this.context.platform.errorReporterAccessToken,
          version,
          this.context.platform.node.env,
          this.context.platform.log,
          'DashboardErrorBoundary',
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
    this.error = error
    this.errorInfo = errorInfo
    this.context.platform.log.error(error, errorInfo)
    if (this.state.errorReporter) {
      this.state.errorReporter.error(`Error in React component on Dashboard ${errorInfo}`, error)
    }
  }

  createReport = () => {
    this.context.platform.createErrorReport(this.error, this.errorInfo, {}, this.props.trialInfo)
  }

  goToSupport = () => {
    this.context.platform.openExternal('https://plottr.com/support/')
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="text-center">
            <IoIosAlert />
            <h1>{i18n('Something went wrong,')}</h1>
            <h2>{i18n("but don't worry!")}</h2>
          </div>
          <div className="error-boundary__options">
            <Button
              bsStyle="warning"
              onClick={() => this.setState({ hasError: false, count: this.state.count + 1 })}
            >
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
              <h3 className="error-boundary-title">
                {i18n('Error: {error}', { error: this.error?.message })}
              </h3>
              <div className={cx('error-boundary-body', { darkmode: this.props.darkMode })}>
                {this.errorInfo?.componentStack}
              </div>
            </div>
          ) : null}
        </div>
      )
    }

    return this.props.children
  }
}

DashboardErrorBoundary.propTypes = {
  children: PropTypes.node,
  darkMode: PropTypes.bool,
  trialInfo: PropTypes.object,
  user: PropTypes.object.isRequired,
  userId: PropTypes.string,
  email: PropTypes.string,
  fileURL: PropTypes.string,
}
const mapStateToProps = (state) => ({
  trialInfo: selectors.trialInfoSelector(state),
  darkMode: selectors.isDarkModeSelector(state),
  user: selectors.userSettingsSelector(state),
  userId: selectors.userIdSelector(state),
  email: selectors.emailAddressSelector(state),
  fileURL: selectors.fileURLSelector(state),
})

export default connect(mapStateToProps)(DashboardErrorBoundary)
