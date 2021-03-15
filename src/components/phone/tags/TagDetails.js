import { cloneDeep } from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { t } from 'plottr_locales'
import { Label, Item } from 'native-base'
import { actions, selectors, initialState } from 'pltr/v2'
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native'
import SaveButton from '../../ui/SaveButton'
import tinycolor from 'tinycolor2'
import DetailsScrollView from '../shared/DetailsScrollView'
import ColorPickerModal from '../../tablet/shared/ColorPickerModal'
import {
  checkForChanges,
  addLeaveListener,
  removeLeaveListener
} from '../../../utils/Changes'
import { Text, Input, Button } from '../../shared/common'
import Colors from '../../../utils/Colors'
import Metrics from '../../../utils/Metrics'

const isIOS = Platform.OS == 'ios'

class TagDetails extends Component {
  constructor(props) {
    super(props)
    const NewTag = cloneDeep(initialState.tag)
    const { route, tags } = this.props
    const { isNewTag, tag = {} } = route.params
    const currentTag = isNewTag
      ? NewTag
      : tags.find((eTag) => eTag.id == tag.id)

    this.state = {
      isNewTag,
      ...currentTag,
      changes: isNewTag,
      colorFromRedux: currentTag.color,
      showColorPicker: false
    }
  }

  componentDidMount() {
    const { navigation } = this.props
    addLeaveListener(navigation, this.checkChanges, this.saveChanges)
    this.setSaveButton()
  }

  componentDidUpdate() {
    this.setSaveButton()
  }

  setSaveButton = () => {
    this.props.navigation.setOptions({
      headerRight: () => (
        <SaveButton changes={this.state.changes} onPress={this.saveChanges} />
      )
    })
  }

  componentWillUnmount() {
    const { navigation } = this.props
    removeLeaveListener(navigation, this.checkChanges)
  }

  checkChanges = (event) => {
    const { changes } = this.state
    const { navigation } = this.props
    checkForChanges(event, changes, this.saveChanges, navigation)
  }

  saveChanges = () => {
    const { changes, isNewTag, id, title, color } = this.state
    if (!changes) return
    if (isNewTag) {
      this.props.actions.addCreatedTag({ title, color })
      this.props.navigation.setParams({ isNewTag: false })
    } else {
      this.props.actions.editTag(id, title, color)
    }
    this.setState({ isNewTag: false, changes: false }, () => {
      this.props.navigation.goBack()
    })
  }

  navigateToColorPicker = () => {
    const { id, colorFromRedux } = this.state
    this.props.navigation.push('ColorPickerModal', { type: 'tag', id })
    // conscious trade-off here
    // this wipes out their typed color changes
    // but options are: 1. wipe out changes, 2. wipe out knowledge of changes (couldn't save), 3. don't show picked color
    this.setState({ changes: false, color: colorFromRedux })
  }

  toggleColorPicker = () => {
    const { showColorPicker } = this.state
    this.setState({
      showColorPicker: !showColorPicker
    })
  }

  hideColorPicker = () => {
    const { colorFromRedux, color } = this.state
    this.setState({ showColorPicker: false })
  }

  handleSelectColor = (color) =>
    this.setState({ color, changes: true, showColorPicker: false })

  renderColorPicker() {
    const { showColorPicker, color } = this.state
    return showColorPicker ? (
      <ColorPickerModal
        key='picker'
        expressMode
        currentColor={color}
        onClose={this.hideColorPicker}
        chooseColor={this.handleSelectColor}
      />
    ) : null
  }

  render() {
    const { title, color } = this.state
    const colorObj = tinycolor(color || 'black')
    const backgroundColor = { backgroundColor: colorObj.toHexString() }
    return ([
      <DetailsScrollView style={styles.container} key='main'>
        <View style={styles.label}>
          <Input
            inset
            label={`${t('Title')}:`}
            value={title}
            onChangeText={(text) =>
              this.setState({ title: text, changes: true })
            }
            autoCapitalize='sentences'
          />
        </View>
        <View style={styles.label}>
          <Input
            inset
            label={`${t('Color')}:`}
            value={color}
            onChangeText={(text) =>
              this.setState({ color: text, changes: true })
            }
          />
        </View>
        <View style={styles.colorWrapper}>
          <Text fontSize='h4' fontStyle='bold'>
            {t('Current Color')}
          </Text>
          <TouchableOpacity onPress={this.toggleColorPicker}>
            <View style={[styles.colorSwatch, backgroundColor]} />
          </TouchableOpacity>
          <Button
            tight
            bordered
            // textColor='darkGray'
            buttonColor='gray'
            style={styles.button}
            onPress={this.toggleColorPicker}>
            {t('Choose Color')}
          </Button>
        </View>
      </DetailsScrollView>,
      this.renderColorPicker()
    ])
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  label: {
    paddingHorizontal: Metrics.baseMargin,
    marginVertical: Metrics.baseMargin
  },
  NBlabel: {
    paddingRight: 0
  },
  input: {
    marginTop: isIOS ? -2 : 1
  },
  afterList: {
    marginTop: 16
  },
  currentColor: {
    height: 50,
    width: 50
  },
  colorWrapper: {
    marginTop: 8,
    alignItems: 'center'
  },
  colorSwatch: {
    width: 60,
    height: 50,
    margin: 10,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 10
  },
  button: {
    alignSelf: 'center',
    marginTop: 8
  },
  buttonText: {
    color: 'black'
  }
})

TagDetails.propTypes = {
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
}

function mapStateToProps(state) {
  return {
    tags: selectors.sortedTagsSelector(state),
    characters: selectors.charactersSortedAtoZSelector(state),
    places: selectors.placesSortedAtoZSelector(state),
    ui: state.ui
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions.tag, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TagDetails)
