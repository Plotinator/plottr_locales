import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { t } from 'plottr_locales'
import cx from 'classnames'
import { selectors, actions, newIds } from 'pltr/v2'
import { View, Button, Icon, Content } from 'native-base'
import Toolbar from '../shared/Toolbar'
import NewButton from '../../ui/NewButton'
import tinycolor from 'tinycolor2'
import prompt from 'react-native-prompt-android'
import DrawerButton from '../../ui/DrawerButton'
import { Text } from '../../shared/common'

class Tags extends Component {

  createTag = (title) => {
    this.props.actions.addCreatedTag({ title })
  }

  promptToCreate = () => {
    prompt(t('Name'), t('Give this tag a name'), [
        {text: t('Cancel'), style: 'cancel'},
        {text: t('OK'), onPress: this.createTag},
      ],
      {}
    )
  }

  saveNote = (id, title) => {
    // this.props.actions.editNote(id, {title})
  }

  deleteNote = (id) => {
    // this.props.actions.deleteNote(id)
  }

  renderTagItem = (tag) => {
    let borderColor = {}
    if (tag.color) {
      const color = tinycolor(tag.color)
      borderColor = {borderColor: color.toHexString(), borderWidth: 2}
    }
    return <TouchableOpacity key={tag.id}>
      <View style={[styles.tagItem, borderColor]}>
        <Text center fontSize='h7' fontStyle='regular'>{tag.title || t('New Tag')}</Text>
      </View>
    </TouchableOpacity>
  }

  renderTagList () {
    const { tags } = this.props
    return <ScrollView contentContainerStyle={styles.tagList}>
      {tags.map(this.renderTagItem)}
    </ScrollView>
  }

  render () {
    return <View style={{flex: 1}}>
      <Toolbar>
        <DrawerButton openDrawer={this.props.openDrawer} />
        <NewButton onPress={this.promptToCreate}/>
      </Toolbar>
      <View style={styles.content}>
        <Text fontSize='h5' fontStyle='semiBold' style={styles.title}>{t('Tags')}</Text>
        { this.renderTagList() }
      </View>
    </View>
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  tagList: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    alignContent: 'flex-start'
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  tagItem: {
    height: 60,
    width: 160,
    marginVertical: 20,
    marginHorizontal: 18,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderColor: 'hsl(0, 0%, 87%)', //bootstrap default
    borderWidth: 1,
  },
})

Tags.propTypes = {
  tags: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    tags: selectors.sortedTagsSelector(state),
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(actions.tag, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Tags)
