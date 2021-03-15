/**
 * @format
 */

import { setupI18n } from 'plottr_locales'

// FIXME: use a real settings object.
//
// Use a dummy settings object to set the language to en for now.
setupI18n({
  get: (_key) => {
    return 'en'
  }
}, {})

import 'react-native-gesture-handler'
import { AppRegistry } from 'react-native'
import { name as appName } from './app.json'
import App from './src/components/App'

// hide yellow warnings
console.disableYellowBox = true

AppRegistry.registerComponent(appName, () => App)
