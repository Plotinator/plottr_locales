import React from 'react'
import { t } from 'plottr_locales'
import { StyleSheet } from 'react-native'
import { Text, ShellButton } from '../shared/common'
import Metrics from '../../utils/Metrics'
import Colors from '../../utils/Colors'
import Fonts from '../../fonts'

export default function SaveButton({ changes, onPress = () => {} }) {
  const savedText = changes ? t('Save') : t('Saved')
  return (
    <ShellButton
      style={[styles.button, changes && styles.activeButton]}
      disabled={!changes}
      onPress={onPress}>
      <Text style={[styles.text, changes && styles.activeText]}>
        {savedText}
      </Text>
    </ShellButton>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    paddingHorizontal: Metrics.baseMargin / 2,
    paddingVertical: Metrics.baseMargin / 3,
    marginHorizontal: Metrics.baseMargin,
    borderRadius: Metrics.cornerRadius
  },
  activeButton: {
    paddingHorizontal: Metrics.baseMargin,
    backgroundColor: Colors.orange
  },
  text: {
    ...Fonts.style.semiBold,
    color: Colors.brightGreen
  },
  activeText: {
    color: Colors.white
  }
})
