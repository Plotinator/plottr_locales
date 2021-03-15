import { Alert, LayoutAnimation } from 'react-native'
import { t } from 'plottr_locales'

export function askToDelete (name, onDelete) {
  Alert.alert(t('Delete'), t('Are you sure you want to delete {name}?', {name}), [
    { text: t('Cancel'), style: 'cancel' },
    { text: t('Delete'), onPress: () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      onDelete()
    }}
  ])
}