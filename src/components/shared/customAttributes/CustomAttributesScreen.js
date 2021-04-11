import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions, selectors } from 'pltr/v2'
import {
  StyleSheet,
  View,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native'
import {
  Icon,
  H1,
  Item,
  Label,
  Container,
  Content,
  ListItem,
  Left,
  Switch,
  Body,
  Right
} from 'native-base'
import { SwipeListView } from 'react-native-swipe-list-view'
import { t } from 'plottr_locales'
import RenameButton from '../../ui/RenameButton'
import TrashButton from '../../ui/TrashButton'
import { askToDelete } from '../../../utils/delete'
import { Text, Button, FloatingInput } from '../../shared/common'
import Fonts from '../../../fonts'
import Metrics from '../../../utils/Metrics'
import Colors from '../../../utils/Colors'

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

class CustomAttributesScreen extends Component {
  constructor (props) {
    super(props)
    const { route } = props
    const { type } = route.params
    this.state = { type, text: '' }
  }

  setText = text => this.setState({ text })

  add = () => {
    const { text, type } = this.state
    const { actions, restrictedValues } = this.props
    if (text == '' || restrictedValues.includes(text)) return

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    if (type == 'characters') {
      actions.addCharacterAttr({ name: text, type: 'text' })
    }
    if (type == 'places') {
      actions.addPlaceAttr({ name: text, type: 'text' })
    }
    this.setState({ text: '' })
  }

  deleteAttr = (attr) => {
    const { type } = this.state
    const { actions } = this.props
    if (type == 'characters') {
      askToDelete(attr.name, () => actions.removeCharacterAttr(attr.name))
    }
    if (type == 'places') {
      askToDelete(attr.name, () => actions.removePlaceAttr(attr.name))
    }
  }

  editAttr = (text, attr, index) => {
    const { type } = this.state
    const { actions, restrictedValues } = this.props
    if (text == '' || restrictedValues.includes(text)) return
    if (text == attr.name) return

    if (type == 'characters') {
      actions.editCharacterAttr(index, attr, { ...attr, name: text })
    }
    if (type == 'places') {
      actions.editPlaceAttr(index, attr, { ...attr, name: text })
    }
  }

  toggleAttr = (val, attr, index) => {
    const { type } = this.state
    const { actions } = this.props
    const newType = val ? 'paragraph' : 'text'

    if (type == 'characters') {
      actions.editCharacterAttr(index, attr, { ...attr, type: newType })
    }
    if (type == 'places') {
      actions.editPlaceAttr(index, attr, { ...attr, type: newType })
    }
  }

  renderItem = ({ item, index }) => {
    const canChange = this.props.customAttributesThatCanChange.includes(
      item.name
    )
    if (canChange) {
      return (
        <ListItem noIndent style={styles.row}>
          <Left style={styles.left}>
            <Text fontStyle='semiBold'>{item.name}</Text>
          </Left>
          <Body>
            <Text fontSize='small'>{t('Paragraph?')}</Text>
          </Body>
          <Right style={styles.right}>
            <Switch
              value={item.type == 'paragraph'}
              onValueChange={(val) => this.toggleAttr(val, item, index)}
            />
          </Right>
        </ListItem>
      )
    } else {
      return (
        <ListItem noIndent style={styles.row}>
          <Left style={styles.left}>
            <Text>{item.name}</Text>
          </Left>
          <Body>
            <Text fontSize='small'>{t('Paragraph')}</Text>
          </Body>
        </ListItem>
      )
    }
  }

  render () {
    const { text } = this.state
    return (
      <View style={styles.container}>
        <View style={styles.subContent}>
          <FloatingInput
            center
            value={text}
            onChangeText={this.setText}
            placeholder=''
            inputStyle={styles.input}
            labelText={t('Enter Custom Attribute Title')}
          />
          <Button
            tight
            disabled={!text}
            onPress={this.add}
            style={styles.button}>
            {t('Add')}
          </Button>
        </View>
        <SwipeListView
          data={this.props.customAttributes}
          keyExtractor={(item) => item.name}
          renderItem={this.renderItem}
          renderHiddenItem={({ item }, rowMap) => (
            <TrashButton data={item} iconStyle={styles.icon} onPress={this.deleteAttr} />
          )}
          leftOpenValue={75}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingVertical: Metrics.baseMargin,
  },
  subContent: {
    paddingHorizontal: Metrics.doubleBaseMargin,
    paddingBottom: Metrics.baseMargin,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.borderGray
  },
  h1: {
    textAlign: 'center',
    marginVertical: 20
  },
  row: {
    backgroundColor: 'white'
  },
  left: {
    paddingLeft: Metrics.baseMargin
  },
  right: {
    paddingRight: Metrics.baseMargin
  },
  hiddenRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  button: {
    marginTop: Metrics.doubleBaseMargin,
    marginVertical: Metrics.baseMargin
  },
  newAttr: {
    marginBottom: 8
  },
  labelText: {
    ...Fonts.style.regular,
    height: 'auto',
    paddingTop: Metrics.baseMargin * 0.8,
    paddingRight: 0
  },
  icon: {
    color: 'white'
  },
  input: {
    color: Colors.darkGray
  }
})

CustomAttributesScreen.propTypes = {
  customAttributes: PropTypes.array.isRequired,
  customAttributesThatCanChange: PropTypes.array,
  restrictedValues: PropTypes.array,
  actions: PropTypes.object.isRequired
}

function mapStateToProps (state, ownProps) {
  const { route } = ownProps
  const { type } = route.params

  let canChange = []
  let restrictedValues = []
  if (type == 'characters') {
    canChange = selectors.characterCustomAttributesThatCanChangeSelector(state)
    restrictedValues = selectors.characterCustomAttributesRestrictedValues(
      state
    )
  } else {
    canChange = selectors.placeCustomAttributesThatCanChangeSelector(state)
    restrictedValues = selectors.placeCustomAttributesRestrictedValues(state)
  }

  return {
    customAttributes: state.customAttributes[type],
    customAttributesThatCanChange: canChange,
    restrictedValues: restrictedValues
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(actions.customAttribute, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomAttributesScreen)
