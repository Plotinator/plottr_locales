import React, { Component } from 'react'
import { View, Keyboard } from 'react-native'
import styles from './ModalBoxStyles'
import * as Animatable from 'react-native-animatable'
import { Icon } from 'native-base'
import Text from './Text'
import ShellButton from './ShellButton'

export default class ModalBox extends Component {
  state = {
    initial: true,
    shadeBase: 0
  };

  componentDidMount () {
    Keyboard.addListener('keyboardDidShow', this.handleKeyboardShow)
    Keyboard.addListener('keyboardDidHide', this.handleKeyboardHide)
  }

  componentWillUnmount () {
    Keyboard.removeListener('keyboardDidShow', this.handleKeyboardShow)
    Keyboard.removeListener('keyboardDidHide', this.handleKeyboardHide)
  }

  show = () => {
    const { onShow } = this.props
    this.setState({
      initial: false,
      visible: true,
      shadeBase: 0
    })
    onShow && onShow()
  };

  hide = () => {
    const { onHide } = this.props
    Keyboard.dismiss()
    this.setState({
      visible: false,
    })
    onHide && onHide()
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

  render () {
    const { shadeBase, initial, visible: visibleState } = this.state
    const { visible, title = 'Plottr', children } = this.props
    const isVisible = visible === undefined ? visibleState : visible
    const shadeStyles = [
      styles.shade,
      { opacity: isVisible ? 1 : 0 },
      { paddingBottom: shadeBase }
    ]
    return initial && !isVisible ? null : (
      <Animatable.View
        transition={['opacity', 'paddingBottom']}
        delay={isVisible ? 0 : 100}
        duration={600}
        easing={'ease-out-expo'}
        pointerEvents={isVisible ? 'auto' : 'none'}
        style={shadeStyles}>
        <Animatable.View
          style={styles.dialogBox}
          animation={isVisible ? 'zoomIn' : 'zoomOut'}
          delay={isVisible ? 100 : 0}
          easing={'ease-out-expo'}
          duration={600}>
          <ShellButton style={styles.closeButton} onPress={this.handleOnClose}>
            <Icon type='FontAwesome5' name='times' style={styles.closeIcon} />
          </ShellButton>
          <View style={styles.dialogTitle}>
            <Text style={styles.titleText} fontSize='h4' fontStyle='bold' center>
              {title}
            </Text>
          </View>
          <View style={styles.dialogBody}>
            {children}
          </View>
        </Animatable.View>
      </Animatable.View>
    )
  }
}
