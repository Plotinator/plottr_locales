import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { Container } from 'native-base'
import { isTablet } from 'react-native-device-info'
import { emptyFile, actions, migrateIfNeeded } from 'pltr/v2'
import { getStore } from '../store/configureStore'
import RootPhoneNavigator from './phone/navigators/RootPhoneNavigator'
import RootTabletNavigator from './tablet/navigators/RootTabletNavigator'
import { MIGRATION_VERSION } from '../utils/constants'
import { Alert, Platform } from 'react-native'
import { t } from 'plottr_locales'

export default function DocumentRoot (props) {
  useEffect(
    () => {
      loadDocument()
    },
    [props.document]
  )

  const loadDocument = () => {
    const store = getStore()
    const { document } = props
    if (document) {
      const filePath = document.documentURL
      // console.log('PATH', filePath)
      if (Platform.OS != 'android' && !filePath.includes('.pltr')) {
        // handle wrong type of file
        Alert.alert(
          t('Error opening file'),
          t('That file appears to be the wrong type. Try another'),
          [
            { text: t('Cancel'), style: 'cancel' },
            { text: t('OK'), onPress: props.closeFile }
          ],
          {}
        )
      }

      try {
        const json = JSON.parse(document.data)
        if (json.newFile) {
          // creating a new file
          let name = ''
          if (json.storyName) name = json.storyName // ios
          if (document.storyName) name = document.storyName // android
          name = name.replace('.pltr', '')
          const newFile = emptyFile(name, MIGRATION_VERSION)
          store.dispatch(
            actions.ui.loadFile(filePath, false, newFile, MIGRATION_VERSION)
          )
        } else {
          // opening existing file
          migrateIfNeeded(
            MIGRATION_VERSION,
            json,
            filePath,
            null,
            (err, migrated, resultJson) => {
              // TODO: backup somehow?
              if (err) console.error(err)
              store.dispatch(
                actions.ui.loadFile(
                  filePath,
                  migrated,
                  resultJson,
                  resultJson.file.version
                )
              )
            }
          )
        }
      } catch (error) {
        console.error(error)
        Alert.alert(
          t('Error reading file'),
          t("Plottr couldn't read your file. Try another or contact support"),
          [{ text: t('OK'), onPress: props.closeFile }],
          {}
        )
      }
    }
  }

  const renderByDevice = () => {
    if (isTablet()) return renderTablet()

    return renderPhone()
  }

  const renderPhone = () => {
    return (
      <RootPhoneNavigator closeFile={props.closeFile} logout={props.logout} />
    )
  }

  const renderTablet = () => {
    return (
      <RootTabletNavigator closeFile={props.closeFile} logout={props.logout} />
    )
  }

  return <NavigationContainer>{renderByDevice()}</NavigationContainer>
}
