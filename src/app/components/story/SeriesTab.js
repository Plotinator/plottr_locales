import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import SETTINGS from '../../../common/utils/settings'
import BookDialog from './BookDialog'
import EditSeries from './EditSeries'
import BookList from './BookList'
import i18n from 'format-message'
import ErrorBoundary from '../../containers/ErrorBoundary'

class SeriesTab extends Component {
  renderSeries () {
    return <div>
      <h2 style={{paddingLeft: '40px'}}>{i18n('Series')}</h2>
      <EditSeries />
      <BookList />
    </div>
  }

  renderBook1 () {
    return <BookDialog modal={false} bookId={this.props.books.allIds[0]} />
  }

  render () {
    let body
    if (SETTINGS.get('premiumFeatures')) {
      body = this.renderSeries()
    } else {
      body = this.renderBook1()
    }

    // TODO: ErrorBoundary isn't used quite right, fix it
    return <ErrorBoundary>
      { body }
    </ErrorBoundary>
  }

  static propTypes = {
    ui: PropTypes.object.isRequired,
    series: PropTypes.object.isRequired,
    books: PropTypes.object.isRequired,
  }
}

function mapStateToProps (state) {
  return {
    ui: state.ui,
    series: state.series,
    books: state.books,
  }
}

function mapDispatchToProps (dispatch) {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SeriesTab)