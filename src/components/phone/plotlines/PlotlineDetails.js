import { cloneDeep } from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { t } from 'plottr_locales'
import { Container, Form, Input, Label, Item, H3, Button, View, Text } from 'native-base'
import { actions } from 'pltr/v2'
import { StyleSheet } from 'react-native'
import SaveButton from '../../ui/SaveButton'
import tinycolor from 'tinycolor2'
import DetailsScrollView from '../shared/DetailsScrollView'

class PlotlineDetails extends Component {
  state = {}
  static getDerivedStateFromProps (props, state) {
    const { route, lines } = props
    const { line } = route.params
    const lineFromRedux = lines.find(l => l.id == line.id)
    return {
      line: state.changes && state.line ? state.line : lineFromRedux,
      changes: state.changes,
      colorFromRedux: lineFromRedux.color,
    }
  }

  componentDidMount () {
    this.setSaveButton()
  }

  componentDidUpdate () {
    this.setSaveButton()
  }

  setSaveButton = () => {
    this.props.navigation.setOptions({
      headerRight: () => <SaveButton changes={this.state.changes} onPress={this.saveChanges} />
    })
  }

  saveChanges = () => {
    const { route, actions } = this.props
    const { changes, line } = this.state
    if (!changes) return
    actions.editLine(line.id, line.title, line.color)
    this.setState({changes: false})
  }

  navigateToColorPicker = () => {
    const { line, colorFromRedux } = this.state
    this.props.navigation.push('ColorPickerModal', {type: 'line', id: line.id})
    // conscious trade-off here
    // this wipes out their typed color changes
    // but options are: 1. wipe out changes, 2. wipe out knowledge of changes (couldn't save), 3. don't show picked color
    this.setState({changes: false, line: {...line, color: colorFromRedux}})
  }

  render () {
    const { line } = this.state
    const colorObj = tinycolor(line.color)
    const backgroundColor = {backgroundColor: colorObj.toHexString()}
    return <DetailsScrollView>
      <Item inlineLabel last regular style={styles.label}>
        <Label>{t('Title')}</Label>
        <Input
          value={line.title}
          onChangeText={text => this.setState({line: {...line, title: text}, changes: true})}
          autoCapitalize='sentences'
        />
      </Item>
      <Item inlineLabel last regular style={styles.label}>
        <Label>{t('Color')}</Label>
        <Input
          value={line.color}
          onChangeText={text => this.setState({line: {...line, color: text}, changes: true})}
          autoCapitalize='none'
        />
      </Item>
      <View style={styles.colorWrapper}>
        <H3>{t('Current Color')}</H3>
        <View style={[styles.colorSwatch, backgroundColor]} />
        <Button bordered light style={styles.button} onPress={this.navigateToColorPicker}><Text style={styles.buttonText}>{t('Choose Color')}</Text></Button>
      </View>
    </DetailsScrollView>
  }
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 16,
  },
  afterList: {
    marginTop: 16,
  },
  currentColor: {
    height: 50,
    width: 50,
  },
  colorWrapper: {
    marginTop: 8,
    alignItems: 'center',
  },
  colorSwatch: {
    width: 60,
    height: 50,
    margin: 8,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  button: {
    alignSelf: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'black',
  }
})

PlotlineDetails.propTypes = {
  lines: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    lines: state.lines
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(actions.line, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlotlineDetails)
