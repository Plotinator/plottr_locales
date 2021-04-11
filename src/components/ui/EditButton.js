import React from 'react'
import { Button, Text } from 'native-base'
import { t } from 'plottr_locales'

export default function EditButton (props) {
  const noop = () => {}
  return <Button full onPress={props.onPress ?? noop} style={[{ flex: 1, width: 75 }, props.buttonStyle ?? {}]}>
    <Text>{t('Edit')}</Text>
  </Button>
}
