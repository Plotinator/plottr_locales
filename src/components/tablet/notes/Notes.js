import { sortBy } from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native'
import t from 'format-message'
import cx from 'classnames'
import { selectors, actions, newIds } from 'pltr/v2'
import { View, H3, Button, H1, Icon, Content } from 'native-base'
import { Col, Grid } from 'react-native-easy-grid'
import ErrorBoundary from '../../shared/ErrorBoundary'
import Toolbar from '../shared/Toolbar'
import Note from './Note'
import NewButton from '../../ui/NewButton'
import { askToDelete } from '../../../utils/delete'
import DrawerButton from '../../ui/DrawerButton'
import SideButton from '../shared/SideButton'
import { Text } from '../../shared/common'

class Notes extends Component {
  state = {
    activeNoteId: null,
    filter: null,
    viewableNotes: []
  }

  static getDerivedStateFromProps (props, state) {
    let returnVal = { ...state }
    const { notes } = props
    const viewableNotes = Notes.viewableNotes(notes, state.filter)
    returnVal.viewableNotes = viewableNotes
    returnVal.activeNoteId = Notes.findActiveNote(
      viewableNotes,
      state.activeNoteId
    )

    return returnVal
  }

  static viewableNotes (notes, filter) {
    const filterIsEmpty = Notes.staticFilterIsEmpty(filter)
    let viewableNotes = notes
    if (!filterIsEmpty) {
      viewableNotes = notes.filter((n) => Notes.isViewable(filter, n))
    }
    let sortedNotes = sortBy(viewableNotes, ['lastEdited'])
    sortedNotes.reverse()
    return sortedNotes
  }

  static findActiveNote (notes, activeNoteId) {
    if (notes.length == 0) return null

    let newId = notes[0].id

    // check for the currently active one
    if (activeNoteId != null) {
      let existingNote = notes.find((n) => n.id === activeNoteId)
      if (existingNote) newId = existingNote.id
    }

    return newId
  }

  // this is a hack for now
  static staticFilterIsEmpty (filter) {
    return (
      filter == null ||
      (filter['tag'].length === 0 &&
        filter['character'].length === 0 &&
        filter['place'].length === 0 &&
        filter['book'].length === 0)
    )
  }

  static isViewable (filter, note) {
    if (!note) return false
    let visible = false
    if (note.tags) {
      if (filter['tag'].some((tId) => note.tags.includes(tId))) visible = true
    }
    if (note.characters) {
      if (filter['character'].some((cId) => note.characters.includes(cId)))
        visible = true
    }
    if (note.places) {
      if (filter['place'].some((pId) => note.places.includes(pId)))
        visible = true
    }
    if (note.bookIds) {
      if (filter['book'].some((bookId) => note.bookIds.includes(bookId)))
        visible = true
      // if the filter includes books, and this note has no bookIds,
      // it's considered in all books, so it should be visible
      if (filter['book'].length && !note.bookIds.length) visible = true
    }
    return visible
  }

  createNewNote = () => {
    const id = newIds.nextId(this.props.notes)
    this.props.actions.addNote()
    this.setState({ activeNoteId: id })
  }

  saveNote = (id, title, content) => {
    this.props.actions.editNote(id, { title, content })
  }

  deleteNote = (note) => {
    askToDelete(note.title || t('New Note'), () =>
      this.props.actions.deleteNote(note.id)
    )
  }

  renderNoteItem = ({ item }) => {
    const isActive = item.id == this.state.activeNoteId
    const { images = [] } = this.props
    const foundImage = images[item.imageId]
    return (
      <SideButton
        onPress={() => this.setState({ activeNoteId: item.id })}
        onDelete={() => this.deleteNote(item)}
        image={foundImage && foundImage.data}
        title={item.title || t('New Note')}
        isActive={isActive}
      />
    )
  }

  renderNoteList () {
    const { notes } = this.props
    return (
      <View style={styles.noteList}>
        <Text fontSize='h5' fontStyle='semiBold' style={styles.title}>{t('Notes')}</Text>
        <FlatList
          data={notes}
          renderItem={this.renderNoteItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    )
  }

  renderNoteDetail () {
    let note = this.props.notes.find(
      (note) => note.id == this.state.activeNoteId
    )
    if (!note) return null
    const { images = [] } = this.props
    const image = images[note.imageId]

    return (
      <ErrorBoundary>
        <Note
          key={note.id}
          note={{ ...note, image }}
          onSave={this.saveNote}
          navigation={this.props.navigation}
        />
      </ErrorBoundary>
    )
  }

  render () {
    return (
      <View style={{ flex: 1 }}>
        <Toolbar>
          <DrawerButton openDrawer={this.props.openDrawer} />
          <NewButton onPress={this.createNewNote} />
        </Toolbar>
        <Grid style={{ flex: 1 }}>
          <Col size={4}>{this.renderNoteList()}</Col>
          <Col size={10}>{this.renderNoteDetail()}</Col>
        </Grid>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  noteList: {
    height: '100%',
    padding: 8
  },
  title: {
    textAlign: 'center',
    marginBottom: 8
  },
  noteItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 8,
    borderColor: 'hsl(210, 36%, 96%)', //gray-9
    borderWidth: 1
  },
  activeItem: {
    borderColor: 'hsl(208, 88%, 62%)', //blue-6
    backgroundColor: 'hsl(210, 31%, 80%)', //gray-7
    borderStyle: 'dashed'
  },
  buttonWrapper: {
    flexDirection: 'row',
    marginLeft: 'auto'
  }
})

Notes.propTypes = {
  notes: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  ui: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    images: state.images,
    notes: state.notes,
    characters: state.characters,
    places: state.places,
    tags: state.tags
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(actions.note, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Notes)
