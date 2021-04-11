import React, { Component } from 'react'
import { t } from 'plottr_locales'
import { View, H1, Text, Button, Icon } from 'native-base'
import { StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native'

export default class AppErrorBoundary extends Component {
  state = {hasError: false, viewError: false}

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.error = error
    this.errorInfo = errorInfo
    if (this.props.children.props.v2 !== undefined) {
      // Main is being rendered
      if (this.props.reset) this.props.reset()
    }
    if (process.env.NODE_ENV !== 'development') {
      // log.error(error, errorInfo)
      // rollbar.error(error, errorInfo)
    }
    console.error(error, errorInfo)
  }

  resetState = () => {
    this.setState({hasError: false})
    if (this.props.children.props.v2 !== undefined) {
      // Main is being rendered
      if (this.props.recover) this.props.recover()
    }
  }

  render () {
    if (this.state.hasError) {
      return <SafeAreaView style={styles.container}>
        <H1 style={styles.h1}>{t('Something went wrong.')}</H1>
        <Button warning bordered style={styles.button} onPress={this.resetState}>
          <Text>{t('Try that again')}</Text><Icon type='FontAwesome5' name='redo' style={{fontSize: 16}} />
        </Button>
        <View style={[styles.infoWrapper, this.state.viewError ? {flex: 1} : {}]}>
          {!this.state.viewError ? <TouchableOpacity onPress={() => this.setState({viewError: true})}>
            <Text>{t('View Error')}</Text>
          </TouchableOpacity> : null}
          {this.state.viewError ? <ScrollView>
            <Text multiline>{this.error.message}</Text>
            <Text multiline>{this.errorInfo.componentStack}</Text>
          </ScrollView> : null}
        </View>
      </SafeAreaView>
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'hsl(210, 36%, 96%)', //gray-9
  },
  h1: {
    marginVertical: 8,
  },
  button: {
    alignSelf: 'center',
  },
  infoWrapper: {
    padding: 32,
  }
})
