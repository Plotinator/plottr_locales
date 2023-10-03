import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { IoIosAlert } from 'react-icons/io'

import { t as i18n } from 'plottr_locales'

import { checkDependencies } from '../checkDependencies'
import Button from '../Button'

const DashboardErrorBoundaryConnector = (connector) => {
  const {
    platform: {
      log,
      createErrorReport,
      openExternal,
      appVersion,
      node: { env },
      errorReporter: { errorReporterAccessToken, errorReporter, platform },
    },
  } = connector
  checkDependencies({
    log,
    createErrorReport,
    openExternal,
    appVersion,
    env,
    errorReporterAccessToken,
    errorReporter,
    platform,
  })

  class DashboardErrorBoundary extends Component {
    state = {
      hasError: false,
      viewError: false,
      count: 0,
      errorReporter: null,
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, viewError: false }
    }

    componentDidMount() {
      // If we're in classic, get the user-identifying data from the
      // "user" object which comes from EDD.
      const userId = this.props.userId || this.props.user.payment_id || 'UNKNOWN_USER'
      const userEmail = this.props.email || this.props.user.customer_email || 'UNKNOWN_EMAIL'
      Promise.all([platform(), appVersion()])
        .then(([os, version]) => {
          return errorReporter(
            errorReporterAccessToken,
            version,
            env,
            log,
            'DashboardErrorBoundary',
            os,
            userId,
            userEmail
          )
        })
        .then((rollbar) => {
          this.setState({ errorReporter })
        })
        .catch((error) => {
          log.error('Could not construct rollbar instance.', error)
        })
    }

    componentDidCatch(error, errorInfo) {
      this.error = error
      this.errorInfo = errorInfo
      log.error(error, errorInfo)
      if (this.state.errorReporter) {
        this.state.errorReporter.error(error, errorInfo)
      }
    }

    createReport = () => {
      createErrorReport(this.error, this.errorInfo, this.props.proInfo, this.props.trialInfo)
    }

    goToSupport = () => {
      openExternal('https://plottr.com/support/')
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
    proInfo: PropTypes.object,
    trialInfo: PropTypes.object,
    user: PropTypes.object.isRequired,
    userId: PropTypes.string,
    email: PropTypes.string,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      proInfo: selectors.proInfoSelector(state),
      trialInfo: selectors.trialInfoSelector(state),
      darkMode: selectors.isDarkModeSelector(state),
      user: selectors.userSettingsSelector(state),
      userId: selectors.userIdSelector(state),
      email: selectors.emailAddressSelector(state),
    }))(DashboardErrorBoundary)
  }

  throw new Error('Could not connect DashboardErrorBoundary')
}

export default DashboardErrorBoundaryConnector
