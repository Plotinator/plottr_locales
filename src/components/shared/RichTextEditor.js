import React, { useState } from 'react'
import { WebView } from 'react-native-webview'
import { RCE_URL } from '../../utils/constants'
import { StyleSheet, Platform } from 'react-native'
import { Spinner, View, Text, Icon } from 'native-base'
import { t } from 'plottr_locales'

const isAndroid = Platform.OS == 'android'

export default function RichTextEditor (props) {
  const [height, setHeight] = useState(120)
  const showWarning = isAndroid && !props.readOnly
  const maxHeight = props.maxHeight || 1000
  const uiStyleOverrides = `<style>.btn { padding: 5px 10px !important; border: none !important; } .btn svg { margin: 1px 0px 3px !important; } .btn-primary { background-color: #F37B3A !important; } .slate-editor__editor { border: 1px solid #F0F0F0 !important; } .slate-editor__editor > div { min-height: 170px; } .slate-editor__wrapper { margin-bottom: 5px; }</style>`
  const fontInject = `
    var styleDiv = document.createElement('div');
    styleDiv.innerHTML = "<style>@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap');</style>${uiStyleOverrides}";
    document.body.appendChild(styleDiv);
    document.body.style.fontFamily = 'Open Sans';
    document.body.style.color = '#303030';
  `
  const injectValue = `
    window.injectedText = ${JSON.stringify(props.initialValue)};
    window.isNativeApp = true;
    window.isAndroid = ${isAndroid};
    ${props.readOnly ? 'window.readOnly = true;' : ''}
    true;
  `
  const heightScript = `
    setTimeout(function() {
      var value = {height: document.documentElement.scrollHeight}
      window.ReactNativeWebView.postMessage(JSON.stringify(value));
    }, 500);
    true;
  `

  const javascriptInject = `
  ${heightScript}
  ${fontInject}
  `

  const displayWarning = () => {
    if (!showWarning) return null

    // yellow-5
    return (
      <View style={styles.warning}>
        <Icon
          type='FontAwesome5'
          name='exclamation-triangle'
          style={{ fontSize: 14, marginRight: 4, color: 'hsl(44, 92%, 63%)' }}
        />
        <Text note>{t('Compatibility on this device is prone to errors')}</Text>
      </View>
    )
  }

  const handleMessage = event => {
    const value = JSON.parse(event.nativeEvent.data)
    if (value.height) {
      // if it has height, it's either the heightScript from above, or
      // an update from web_rce in the new format which includes height and text
      const newHeight = value.height
      // never let it get smaller
      if (newHeight > height && newHeight <= maxHeight) {
        setHeight(newHeight)
      }
      if (value.text) {
        props.onChange(value.text)
      }
    } else {
      props.onChange(value)
    }
  }

  return (
    <View style={{ flex: 1 }}>
      {displayWarning()}
      <WebView
        containerStyle={{ flex: 0, height: height }}
        style={[styles.webview, props.style]}
        source={{ uri: RCE_URL }}
        onMessage={handleMessage}
        injectedJavaScriptBeforeContentLoaded={injectValue}
        injectedJavaScript={javascriptInject}
        renderLoading={() => (
          <View style={styles.loader}>
            <Spinner color='orange' />
          </View>
        )}
        startInLoadingState
        bounces={false}
        onError={syntheticEvent => {
          const { nativeEvent } = syntheticEvent
          console.log('WebView error: ', nativeEvent)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    minHeight: 250
  },
  loader: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 200,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  warning: {
    flexDirection: 'row'
  }
})
