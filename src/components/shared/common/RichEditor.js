import React, { Component } from 'react'
import { View } from 'react-native'
import styles from './RichEditorStyles'
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor'
import { moderateScale } from 'react-native-size-matters'
import Text from './Text'
import { Colors, HTMLToSlate, SlateToHTML } from '../../../utils'

export default class RichTextEditor extends Component {
  getEditor = () => this.richText

  setEditor = (ref) => (this.richText = ref)

  handleEditorInitialized = () => {
    //
  }

  handleOnChange = (HTML) => {
    const { onChange } = this.props
    const SLATE = HTMLToSlate(HTML)
    onChange && onChange(SLATE)
  }

  renderTitleIcons = (title, size = 18, style = 'bold', props = {}) => ({
    tintColor,
    selected
  }) => {
    return (
      <Text
        {...props}
        fontSize={size}
        fontStyle={style}
        style={{ color: selected ? Colors.orange : tintColor }}>
        {title}
      </Text>
    )
  }

  render () {
    const {
      style,
      value,
      onFocus,
      placeholder,
      editorStyle,
      toolbarStyle,
      initialValue,
      initialHTMLText,
      disabled
    } = this.props

    const containerStyles = [styles.editorContainer]
    containerStyles.push(style)

    const toolbarStyles = [styles.richToolbar]
    toolbarStyles.push(toolbarStyle)

    const editorStyles = [styles.richEditor]
    editorStyles.push(editorStyle)

    const placeholderText = placeholder || ''
    const html = initialHTMLText || initialValue
    const initialText = typeof html == 'object' ? SlateToHTML(html) : html
    const contentCSSText = `font-family: "Open Sans" !important; font-size: 18px; padding: 5px 15px 15px;`
    const cssText = `@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap');`
    return (
      <View style={containerStyles}>
        <RichEditor
          pasteAsPlainText
          ref={this.setEditor}
          style={editorStyles}
          editorStyle={{
            color: Colors.darkGray,
            cssText,
            contentCSSText
          }}
          placeholder={placeholderText}
          onFocus={onFocus}
          initialContentHTML={initialText}
          onChange={this.handleOnChange}
          editorInitializedCallback={this.handleEditorInitialized}
          disabled={disabled ? true : false}
        />
        {disabled ? null : (
          <RichToolbar
            style={toolbarStyles}
            iconSize={20}
            iconMap={{
              bold: this.renderTitleIcons('B', 20),
              italic: this.renderTitleIcons('I', 20, 'semiBoldItalic'),
              underline: this.renderTitleIcons('U', 18, 'semiBold', {
                underlined: true
              }),
              heading2: this.renderTitleIcons('H1'),
              heading3: this.renderTitleIcons('H2')
            }}
            editor={this.richText}
            getEditor={this.getEditor}
            selectedIconTint={Colors.orange}
            actions={[
              actions.setBold,
              actions.setItalic,
              actions.setUnderline,
              actions.setStrikethrough,
              actions.heading2,
              actions.heading3,
              actions.insertOrderedList,
              actions.insertBulletsList
            ]}
          />
        )}
      </View>
    )
  }
}
