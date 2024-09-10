import React, { Component } from 'react'
import PropTypes from 'react-proptypes'

import { t as i18n } from 'plottr_locales'

import Form from '../Form'
import Modal from '../Modal'
import FormGroup from '../FormGroup'
import FormControl from '../FormControl'
import Button from '../Button'
import getTestIds from '../getTestIds'

export const testIds = getTestIds()

export default class InputModal extends Component {
  state = {
    inputValue: '',
  }

  handleOK = () => {
    if (this.props.disabled) return
    this.props.getValue(this.state.inputValue || this.props.defaultValue)
  }

  handleChange = (e) => {
    if (this.props.disabled) return
    this.setState({
      inputValue: e.target.value,
    })
  }

  onSubmit = (e) => {
    if (this.props.disabled) return
    e.preventDefault()
    this.handleOK()
  }

  render() {
    const okText = this.props.customOkButtonText || i18n('OK')
    return (
      <Modal
        show={this.props.isOpen}
        onHide={this.props.cancel}
        dialogClassName="center-modal-vertically"
        animation={false}
      >
        <Modal.Header closeButton>{this.props.title}</Modal.Header>
        <Modal.Body>
          <Form horizontal onSubmit={this.onSubmit}>
            <FormGroup>
              <div className="input-modal__body-wrapper">
                <FormControl
                  data-testid={testIds.input}
                  type={this.props.type}
                  autoFocus
                  defaultValue={this.props.defaultValue || ''}
                  onChange={this.handleChange}
                />
                <div className="input-modal__controls">
                  <div className="input-modal__controls__control">
                    <Button
                      disabled={
                        this.props.disabled ||
                        (this.state.inputValue === '' && this.props.defaultValue === '')
                      }
                      data-testid={testIds.ok}
                      bsStyle="success"
                      onClick={this.handleOK}
                    >
                      {okText}
                    </Button>
                  </div>
                  <div className="input-modal__controls__control">
                    <Button
                      disabled={this.props.disabled}
                      data-testid={testIds.cancel}
                      onClick={this.props.cancel}
                    >
                      {i18n('Cancel')}
                    </Button>
                  </div>
                </div>
              </div>
            </FormGroup>
          </Form>
        </Modal.Body>
      </Modal>
    )
  }

  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    type: PropTypes.string.isRequired,
    cancel: PropTypes.func.isRequired,
    getValue: PropTypes.func.isRequired,
    title: PropTypes.string,
    defaultValue: PropTypes.any,
    customOkButtonText: PropTypes.string,
    disabled: PropTypes.bool,
  }
}
