import React, { Component } from 'react'
import { View, Keyboard } from 'react-native'
import styles from './AlertDialogStyles'
import * as Animatable from 'react-native-animatable'
import Text from './Text'
import ShellButton from './ShellButton'
import Input from './Input'
import { Icon } from 'native-base'
import { t } from 'plottr_locales'

let MasterAlert

export const showAlert = (config) => {
  Keyboard.dismiss()
  MasterAlert && MasterAlert.show(config)
}

export const showInputAlert = (config) => {
  Keyboard.dismiss()
  MasterAlert && MasterAlert.showInput(config)
}

export const hideAlert = () => {
  MasterAlert && MasterAlert.hide()
}

export default class AlertDialog extends Component {
  state = {
    initial: true,
    visible: false,
    isInput: false,
    inputText: '',
    title: '',
    message: '',
    actions: [],
    shadeBase: 0
  };

  componentDidMount () {
    MasterAlert = this
    Keyboard.addListener('keyboardDidShow', this.handleKeyboardShow)
    Keyboard.addListener('keyboardDidHide', this.handleKeyboardHide)
  }

  componentWillUnmount () {
    Keyboard.removeListener('keyboardDidShow', this.handleKeyboardShow)
    Keyboard.removeListener('keyboardDidHide', this.handleKeyboardHide)
    MasterAlert = null
  }

  show = ({ title, message, actions = [] }) => {
    this.setState({
      initial: false,
      title: title || 'Plottr',
      isInput: false,
      message: message || title,
      visible: true,
      shadeBase: 0,
      actions
    })
  };

  showInput = ({ title, message, actions = [], inputText = '' }) => {
    this.setState({
      initial: false,
      title: message ? title : 'Plottr',
      message: message || title,
      inputText,
      isInput: true,
      visible: true,
      shadeBase: 0,
      actions
    }, () => {
      setTimeout(() => this.input.focus(), 300)
    })
  };

  hide = () => {
    Keyboard.dismiss()
    this.setState({
      visible: false,
    })
  };

  handleKeyboardShow = (event) => {
    const { visible } = this.state
    const { endCoordinates: { height } } = event
    if(visible)
      this.setState({
        shadeBase: height
      })
  }

  handleKeyboardHide = () => {
    const { visible } = this.state
    if(visible)
      this.setState({
        shadeBase: 0
      })
  }

  handleOnClose = () => {
    this.hide()
  };

  handleActionPress = action => {
    const { callback } = action
    if (callback) callback(action)
    this.hide()
  };

  handleInputText = inputText => this.setState({ inputText })

  handleInputRef = ref => this.input = ref

  renderActionButton = (action, i) => {
    const { inputText, isInput } = this.state
    return (
      <ActionButton
        key={i}
        index={i}
        action={{ ...action, input: inputText }}
        onPress={this.handleActionPress}
        disabled={isInput ? !inputText && action.positive : false}
      />
    )
  }

  renderInput (inputText) {
    return (
      <Input
        center
        autoFocus
        selectTextOnFocus
        value={inputText}
        style={styles.input}
        inputStyle={styles.inputText}
        ref={this.handleInputRef}
        onChangeText={this.handleInputText}
      />
    )
  }

  render () {
    const {
      actions = [],
      visible,
      initial,
      isInput,
      shadeBase,
      inputText,
      title = 'Plottr',
      message = t('Alert')
    } = this.state
    const shadeStyles = [
      styles.shade,
      { opacity: visible ? 1 : 0 },
      { paddingBottom: shadeBase }
    ]
    return initial && !visible ? null : (
      <Animatable.View
        transition={['opacity', 'paddingBottom']}
        delay={visible ? 0 : 100}
        duration={600}
        easing={'ease-out-expo'}
        pointerEvents={visible ? 'auto' : 'none'}
        style={shadeStyles}>
        <Animatable.View
          style={styles.dialogBox}
          animation={visible ? 'zoomIn' : 'zoomOut'}
          delay={visible ? 100 : 0}
          duration={600}
          easing={'ease-out-expo'}>
          <ShellButton style={styles.closeButton} onPress={this.handleOnClose}>
            <Icon type='FontAwesome5' name='times' style={styles.closeIcon} />
          </ShellButton>
          <View style={styles.dialogTitle}>
            <Text style={styles.titleText} fontSize='h3' fontStyle='bold' center>
              {title}
            </Text>
          </View>
          <View style={styles.dialogBody}>
            <Text center>
              {message}
            </Text>
            {isInput && this.renderInput(inputText)}
          </View>
          <View style={styles.dialogActions}>
            {actions.map(this.renderActionButton)}
            {actions.length === 0 && (
              <ActionButton
                key={'close'}
                action={{ name: 'Close' }}
                onPress={this.handleOnClose}
              />
            )}
          </View>
        </Animatable.View>
      </Animatable.View>
    )
  }
}

class ActionButton extends Component {
  handlePress = () => {
    const {
      action,
      onPress,
    } = this.props
    onPress(action)
  };
  render () {
    const {
      index,
      disabled,
      action: { icon, name, positive, danger }
    } = this.props
    return (
      <ShellButton
        key={index}
        disabled={disabled}
        style={[
          styles.actionButton,
          positive && styles.positiveButton,
          danger && styles.dangerButton
        ]}
        onPress={this.handlePress}>
        {icon && (
          <Icon type='FontAwesome5' name={icon} style={styles.actionIcon} />
        )}
        <Text fontStyle={'bold'} white center>
          {name}
        </Text>
      </ShellButton>
    )
  }
}
