import React from 'react'
import { Button, Text } from 'native-base'
import { t } from 'plottr_locales'

export default function RenameButton (props) {
  const handlePress = () => {
    const { onPress, data } = props
    if(onPress) onPress(data)
  }
  return <Button full onPress={handlePress} style={[{ flex: 1, width: 85 }, props.buttonStyle ?? {}]}>
    <Text>{t('Rename')}</Text>
  </Button>
}
