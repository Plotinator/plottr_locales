import { cloneDeep } from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { t } from 'plottr_locales'
import { View, Item, Icon } from 'native-base'
import { actions, selectors, initialState, newIds } from 'pltr/v2'
import { StyleSheet } from 'react-native'
import SaveButton from '../../ui/SaveButton'
import AttachmentList from '../../shared/attachments/AttachmentList'
import CategoryPicker from '../../ui/CategoryPicker'
import DetailsScrollView from '../shared/DetailsScrollView'
import {
  checkForChanges,
  addLeaveListener,
  removeLeaveListener
} from '../../../utils/Changes'
import { Text, RichEditor, ShellButton, Input } from '../../shared/common'
import Fonts from '../../../fonts'
import Metrics from '../../../utils/Metrics'
import Colors from '../../../utils/Colors'
import { showAlert } from '../../shared/common/AlertDialog'

class CharacterDetails extends Component {
  static getDerivedStateFromProps (props, state) {
    const { characters } = props
    const { isNewCharacter, character } = state
    const oldCharacter = (isNewCharacter ? {} : characters.find((pl) => pl.id == character.id))
    const { tags = [], bookIds = [] } = oldCharacter || {}
    return {
      character: { ...character, bookIds, tags }
    }
  }

  constructor (props) {
    super(props)
    const { route, customAttributes, characters } = props
    const { isNewCharacter, character } = route.params
    const stateCharacter = character || {
      ...cloneDeep(initialState.character),
      id: newIds.nextId(characters)
    }
    const customAttrs =
      customAttributes.reduce((acc, attr) => {
        acc[attr.name] = stateCharacter[attr.name]
        return acc
      }, {})
    this.state = {
      isNewCharacter,
      character: stateCharacter,
      changes: isNewCharacter,
      customAttrs
    }
  }

  componentDidMount () {
    const { navigation } = this.props
    addLeaveListener(navigation, this.checkChanges, this.saveChanges)
    this.setSaveButton()
  }

  componentDidUpdate () {
    this.setSaveButton()
  }

  componentWillUnmount () {
    const { navigation } = this.props
    removeLeaveListener(navigation, this.checkChanges)
  }

  checkChanges = (event) => {
    const { changes } = this.state
    const { navigation } = this.props
    checkForChanges(event, changes, this.saveChanges, navigation)
  }

  setSaveButton = () => {
    this.props.navigation.setOptions({
      headerRight: () => (
        <SaveButton changes={this.state.changes} onPress={this.saveChanges} />
      )
    })
  }

  saveChanges = () => {
    const { changes, isNewCharacter, character, customAttrs } = this.state
    if (!changes) return
    const values = {
      name: character.name,
      description: character.description,
      notes: character.notes,
      categoryId: character.categoryId,
      templates: character.templates,
      ...customAttrs
    }
    if (isNewCharacter) {
      this.props.actions.addCharacterWithValues(values)
      this.props.navigation.setParams({ isNewCharacter: false })
    } else {
      this.props.actions.editCharacter(character.id, values)
    }
    this.setState({ isNewCharacter: false, changes: false })
  }

  updateTemplateValue = (tId, attr, newValue) => {
    const { character } = this.state
    const newTemplates = character.templates.map((t) => {
      if (t.id == tId) {
        t.attributes = t.attributes.map((at) => {
          if (at.name == attr) {
            at.value = newValue
          }
          return at
        })
      }
      return t
    })

    this.setState({
      character: { ...character, templates: newTemplates },
      changes: true
    })
  }

  changeCategory = (val) => {
    this.setState({
      character: { ...this.state.character, categoryId: val },
      changes: true
    })
  }

  handleAskToDelete = () => {
    const { character: { name } } = this.state
    showAlert({
      title: t('Delete Character'),
      message: t('Are you sure you want to delete {name}?', { name })
        .replace('delete ', 'delete\n'),
      actions: [
        {
          name: t('Yes, Delete'),
          danger: true,
          callback: this.handleDeleteCharacter
        },
        {
          name: t('Cancel')
        }
      ]
    })
  }

  handleDeleteCharacter = () => {
    const { character: { id } } = this.state
    this.props.navigation.goBack()
    this.props.actions.deleteCharacter(id)
  }

  renderAttachments () {
    const { character, isNewCharacter } = this.state
    if (isNewCharacter) return null

    return (
      <AttachmentList
        itemType='character'
        item={character}
        navigate={this.props.navigation.navigate}
        only={['bookIds', 'tags']}
      />
    )
  }

  renderTemplates () {
    return this.state.character.templates.flatMap((t) => {
      return t.attributes.map((attr) => {
        if (attr.type == 'paragraph') {
          const height = attr.value ? 100 * attr.value.length : 150
          return (
            <View key={attr.name} style={[styles.afterList, styles.rceView]}>
              <Text style={styles.labelText}>{attr.name}</Text>
              <RichEditor
                initialValue={attr.value}
                onChange={(val) =>
                  this.updateTemplateValue(t.id, attr.name, val)
                }
              />
            </View>
          )
        } else {
          return (
            <View key={attr.name} inlineLabel last regular style={styles.label}>
              <Input
                inset
                label={attr.name}
                value={attr.value}
                onChangeText={(text) =>
                  this.updateTemplateValue(t.id, attr.name, text)
                }
                autoCapitalize='sentences'
              />
            </View>
          )
        }
      })
    })
  }

  renderCustomAttributes () {
    const { customAttributes } = this.props
    const { customAttrs } = this.state
    return customAttributes.map((attr, idx) => {
      const { name, type } = attr
      if (type == 'paragraph') {
        return (
          <View key={idx} style={[styles.afterList, styles.rceView]}>
            <Text style={styles.labelText}>{name}</Text>
            <RichEditor
              initialValue={customAttrs[name]}
              onChange={(val) =>
                this.setState({
                  customAttrs: { ...customAttrs, [name]: val },
                  changes: true
                })
              }
            />
          </View>
        )
      } else {
        return (
          <View key={idx} inlineLabel last regular style={styles.label}>
            <Input
              inset
              label={name}
              value={customAttrs[name]}
              onChangeText={(text) =>
                this.setState({
                  customAttrs: { ...customAttrs, [name]: text },
                  changes: true
                })
              }
              autoCapitalize='sentences'
            />
          </View>
        )
      }
    })
  }

  render () {
    const { character } = this.state
    return (
      <DetailsScrollView>
        <View inlineLabel last regular style={styles.label}>
          <Input
            inset
            label={t('Name')}
            value={character.name}
            onChangeText={(text) =>
              this.setState({
                character: { ...character, name: text },
                changes: true
              })
            }
            autoCapitalize='words'
          />
        </View>
        <View inlineLabel last regular style={styles.label}>
          <Input
            inset
            label={`${t('Description')}:`}
            value={character.description}
            onChangeText={(text) =>
              this.setState({
                character: { ...character, description: text },
                changes: true
              })
            }
            autoCapitalize='sentences'
          />
        </View>
        <Item fixedLabel style={styles.label}>
          <Text style={styles.labelText}>{t('Category')}</Text>
          <CategoryPicker
            type='characters'
            selectedId={character.categoryId}
            onChange={this.changeCategory}
          />
        </Item>
        {this.renderAttachments()}
        <View style={[styles.afterList, styles.rceView]}>
          <Text style={styles.labelText}>{t('Notes')}</Text>
          <RichEditor
            initialValue={character.notes}
            onChange={(val) =>
              this.setState({
                character: { ...character, notes: val },
                changes: true
              })
            }
          />
        </View>
        {this.renderTemplates()}
        {this.renderCustomAttributes()}
        <ShellButton
          onPress={this.handleAskToDelete}
          style={styles.trashButton}>
          <Icon
            type='FontAwesome5'
            name='trash'
            style={{ color: Colors.textGray, fontSize: Fonts.size.regular }} />
        </ShellButton>
      </DetailsScrollView>
    )
  }
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 16
  },
  afterList: {
    marginTop: 16
  },
  rceView: {
    marginBottom: 16
  },
  badge: {
    marginRight: 8
  },
  labelText: {
    ...Fonts.style.bold
  },
  trashButton: {
    alignSelf: 'flex-end',
    padding: Metrics.baseMargin
  }
})

CharacterDetails.propTypes = {
  note: PropTypes.object.isRequired,
  editing: PropTypes.bool.isRequired,
  startEditing: PropTypes.func.isRequired,
  stopEditing: PropTypes.func.isRequired,
  tags: PropTypes.array.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  customAttributes: PropTypes.array.isRequired,
  ui: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    tags: selectors.sortedTagsSelector(state),
    characters: selectors.charactersSortedAtoZSelector(state),
    places: selectors.placesSortedAtoZSelector(state),
    customAttributes: state.customAttributes.characters,
    ui: state.ui
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(actions.character, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CharacterDetails)
