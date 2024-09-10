import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { selectors, actions } from 'wired-up-pltr'

import BookSelectList from '../project/BookSelectList'
import NoteEditDetails from './NoteEditDetails'
import NoteDetails from './NoteDetails'
import ErrorBoundary from '../containers/ErrorBoundary'
import SelectList from '../SelectList'
import cx from 'classnames'

class NoteView extends Component {
  renderBookSelectList() {
    const { actions, note } = this.props

    return (
      <BookSelectList
        selectedBooks={note.bookIds}
        parentId={note.id}
        add={actions.addBook}
        remove={actions.removeBook}
      />
    )
  }

  render() {
    const {
      editing,
      darkMode,
      note,
      characters,
      actions,
      places,
      tags,
      stopEditing,
      startEditing,
    } = this.props
    return (
      <div className={cx('note-list__note-view', { editing, darkmode: darkMode })}>
        <div className="note-list__note-view__left-side">
          {this.renderBookSelectList()}
          <SelectList
            parentId={note.id}
            type={'Characters'}
            selectedItems={note.characters}
            allItems={characters}
            add={actions.addCharacter}
            remove={actions.removeCharacter}
          />
          <SelectList
            parentId={note.id}
            type={'Places'}
            selectedItems={note.places}
            allItems={places}
            add={actions.addPlace}
            remove={actions.removePlace}
          />
          <SelectList
            parentId={note.id}
            type={'Tags'}
            selectedItems={note.tags}
            allItems={tags}
            add={actions.addTag}
            remove={actions.removeTag}
          />
        </div>
        <div className="note-list__note-view__right-side">
          <ErrorBoundary>
            {editing ? (
              <NoteEditDetails noteId={note.id} finishEditing={stopEditing} />
            ) : (
              <NoteDetails noteId={note.id} startEditing={startEditing} />
            )}
          </ErrorBoundary>
        </div>
      </div>
    )
  }
}

NoteView.propTypes = {
  noteId: PropTypes.number.isRequired,
  note: PropTypes.object.isRequired,
  editing: PropTypes.bool.isRequired,
  startEditing: PropTypes.func.isRequired,
  stopEditing: PropTypes.func.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  darkMode: PropTypes.bool,
}

const NoteActions = actions.note

const mapStateToProps = (state, ownProps) => {
  return {
    tags: selectors.sortedTagsSelector(state),
    darkMode: selectors.isDarkModeSelector(state),
    note: selectors.singleNoteSelector(
      state,
      // @ts-ignore
      ownProps.noteId
    ),
    characters: selectors.charactersSortedAtoZSelector(state),
    places: selectors.placesSortedAtoZSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    actions: bindActionCreators(NoteActions, dispatch),
  }
})(NoteView)
