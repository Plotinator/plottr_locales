import { Component } from 'react'
import PropTypes from 'react-proptypes'
import { t as i18n } from 'plottr_locales'
import { Button } from 'react-bootstrap'
import { IoIosAlert } from 'react-icons/io'

export class AdminErrorBoundary extends Component {
  state = {
    hasError: false,
    viewError: false,
    count: 0,
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, viewError: false }
  }

  componentDidCatch(error, errorInfo) {
    this.error = error
    this.errorInfo = errorInfo
    console.error(error, errorInfo)
    this.state.rollbar.error(error, errorInfo)
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
          {this.state.viewError ? (
            <div className="error-boundary__view-error well">
              <h3 className="error-boundary-title">
                {i18n('Error: {error}', { error: this.error.message })}
              </h3>
              <div className="error-boundary-body">{this.errorInfo.componentStack}</div>
            </div>
          ) : null}
        </div>
      )
    }

    return this.props.children
  }
}

AdminErrorBoundary.propTypes = {
  children: PropTypes.node,
}
