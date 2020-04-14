import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Modal, Form, FormGroup, Col, Row, ControlLabel, FormControl, ButtonToolbar, Button } from 'react-bootstrap'
import SETTINGS from '../../../common/utils/settings'
import BookDialog from './BookDialog'
import EditSeries from './EditSeries'
import BookList from './BookList'
import i18n from 'format-message'


class Options extends Component {

  render () {

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
)(Options)