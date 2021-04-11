import React, { Component } from 'react'
import { View, TextInput, TouchableWithoutFeedback } from 'react-native'
import styles from './InputStyles'
import Text from './Text'
import Colors from '../../../utils/Colors'

const { textGray, inputWhiteText } = Colors

export default class Input extends Component {
  handleOnChangeText = (TextValue) => {
    const { onChangeText } = this.props
    onChangeText && onChangeText(TextValue)
  }

  handleFocus = () => this.focus()

  focus = () => this.refs.input.focus()

  blur = () => this.refs.input.blur()

  render() {
    const {
      inset,
      small,
      label,
      labelStyle,
      labelTextStyle,
      autoCompleteType,
      autoCapitalize,
      placeholder,
      multiline,
      numberOfLines,
      darkMode,
      friendly,
      placeholderTextColor = textGray,
      returnKeyType,
      maxLength,
      style,
      inputStyle,
      keyboardType,
      secureTextEntry,
      selectTextOnFocus,
      value,
      center,
      bordered,
      gray,
      editable,
      onChangeText,
      onSubmitEditing,
      onFocus,
      onBlur,
      textContentType,
      onContentSizeChange,
      autofocus,
      autogrow
    } = this.props

    let placeholderColor = placeholderTextColor
    const inputStyles = [styles.input]
    inputStyles.push(inputStyle)

    const containerStyles = [styles.container]
    if (friendly) {
      placeholderColor = inputWhiteText
      containerStyles.push(styles.friendly)
      inputStyles.push(styles.friendlyText)
    }
    if (inset) {
      placeholderColor = 'lightgray'
      containerStyles.push(styles.inset)
      inputStyles.push(styles.insetText)
    }
    if (multiline) {
      inputStyles.push(styles.multiline)
    }
    if (bordered) containerStyles.push(styles.bordered)
    if (center) inputStyles.push(styles.center)
    if (darkMode) inputStyles.push(styles.darkMode)
    if (small) inputStyles.push(styles.inputSmall)
    containerStyles.push(style)

    const placeholderText = placeholder || ''

    return (
      <View style={containerStyles}>
        {label && (
          <TouchableWithoutFeedback onPress={this.handleFocus}>
            <View style={[styles.label, labelStyle]}>
              <Text
                fontSize='small'
                color='lightGray'
                style={[styles.labelText, labelTextStyle]}>
                {label}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        )}
        <TextInput
          ref='input'
          autoCapitalize={autoCapitalize}
          autoCompleteType={autoCompleteType}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          maxLength={maxLength}
          numberOfLines={numberOfLines}
          placeholderTextColor={placeholderColor}
          underlineColorAndroid='transparent'
          placeholder={placeholderText}
          editable={editable}
          style={inputStyles}
          selectTextOnFocus={selectTextOnFocus}
          keyboardType={keyboardType}
          onSubmitEditing={onSubmitEditing}
          value={value}
          onBlur={onBlur}
          onChangeText={this.handleOnChangeText}
          returnKeyType={returnKeyType}
          onFocus={onFocus}
          textContentType={textContentType}
          onContentSizeChange={onContentSizeChange}
          autofocus={autofocus}
          autogrow={autogrow}
        />
      </View>
    )
  }
}
