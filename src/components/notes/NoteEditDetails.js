import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { isEqual } from 'lodash'
import cx from 'classnames'
import { FiCopy } from '@react-icons/all-files/fi/FiCopy'

import { selectors, actions } from 'wired-up-pltr'
import { t as i18n } from 'plottr_locales'

import ButtonToolbar from '../ButtonToolbar'
import ControlLabel from '../ControlLabel'
import FormGroup from '../FormGroup'
import TextFormControl from '../TextFormControl'
import Button from '../Button'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import CategoryPicker from '../CategoryPicker'
import RichText from '../rce/RichText'
import EditAttribute from '../EditAttribute'
import ImagePicker from '../images/ImagePicker'
import Image from '../images/Image'
import Glyphicon from '../Glyphicon'
import { withArgs } from '../withArgs'

const NoteEditDetails = ({ note, actions, finishEditing, darkMode, customAttributes, foci }) => {
  const [deleting, setDeleting] = useState(false)

  const selectionForMainNoteElement = (name) => {
    const noteId = note.id

    return foci?.find(({ path }) => {
      return isEqual(path, ['note', noteId, name])
    })?.selection
  }

  const deleteNote = (e) => {
    e.stopPropagation()
    actions.deleteNote(note.id)
  }

  const cancelDelete = (e) => {
    e.stopPropagation()
    setDeleting(false)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    setDeleting(true)
  }

  const handleEnter = (event) => {
    if (event.which === 13) {
      finishEditing()
    }
  }

  const handleEsc = (event) => {
    if (event.which === 27) {
      finishEditing()
    }
  }

  const handleAttrChange = (attrName) => (desc, selection) => {
    actions.editNoteCustomAttribute(note.id, attrName, desc, selection)
  }

  const handleContentChange = (value, selection) => {
    actions.editNoteContent(note.id, value, selection)
  }

  const changeCategory = (val) => {
    actions.editNote(note.id, { categoryId: { value: val } })
  }

  const changeImage = (newImageId) => {
    actions.editNote(note.id, { imageId: { value: newImageId } })
  }

  const renderDelete = () => {
    if (!deleting) return null

    return (
      <DeleteConfirmModal
        name={note.title || i18n('New Note')}
        onDelete={deleteNote}
        onCancel={cancelDelete}
      />
    )
  }

  const handleDuplicate = () => {
    actions.duplicateNote(note.id)
  }

  const renderEditingImage = () => {
    return (
      <FormGroup>
        <ControlLabel>{i18n('Note Image')}</ControlLabel>
        <div className="note-list__note__edit-image-wrapper">
          <div className="note-list__note__edit-image">
            <Image size="small" shape="rounded" imageId={note.imageId} />
          </div>
          <div>
            <ImagePicker selectedId={note.imageId} chooseImage={changeImage} deleteButton />
          </div>
        </div>
      </FormGroup>
    )
  }

  const renderEditingCustomAttributes = () => {
    return customAttributes.map((attr, index) => {
      return (
        <React.Fragment key={attr.name}>
          <EditAttribute
            index={index}
            entity={note}
            entityType="note"
            value={note[attr.name]}
            onChange={handleAttrChange(attr.name)}
            onSave={finishEditing}
            name={attr.name}
            id={attr.id || attr.name}
            type={attr.type}
            autoFocus={
              foci && foci[0] && foci[0].path[2] === attr.name && foci[0].path[1] === note.id
            }
            selection={selectionForMainNoteElement(attr.name)}
            inputId={`note-${note.id}-custom-attribute-${attr.name}`}
          />
        </React.Fragment>
      )
    })
  }

  return (
    <div className="note-list__note-wrapper">
      {renderDelete()}
      <div className={cx('note-list__note', 'editing', { darkmode: darkMode })}>
        <div className="note-list__note__edit-form">
          <div className="note-list__inputs__normal">
            <FormGroup>
              <ControlLabel>{i18n('Name')}</ControlLabel>
              <TextFormControl
                id={`note-${note.id}-name`}
                onChange={withArgs(actions.editNoteTitle, note.id)}
                onKeyDown={handleEsc}
                onKeyPress={handleEnter}
                value={note.title}
                autoFocus={
                  foci && foci[0] && foci[0].path[2] === 'title' && foci[0].path[1] === note.id
                }
                selection={selectionForMainNoteElement('title')}
              />
            </FormGroup>
          </div>
          <div className="note-list__inputs__custom">
            <FormGroup>
              <ControlLabel>{i18n('Category')}</ControlLabel>
              <CategoryPicker type="notes" selectedId={note.categoryId} onChange={changeCategory} />
            </FormGroup>
            {renderEditingImage()}
          </div>
        </div>
        <div>
          <FormGroup className="note-list__rce__wrapper">
            <ControlLabel>{i18n('Notes')}</ControlLabel>
            <RichText
              id={`note-${note.id}-content`}
              description={note.content}
              onChange={handleContentChange}
              autoFocus={
                foci && foci[0] && foci[0].path[2] === 'content' && foci[0].path[1] === note.id
              }
              selection={selectionForMainNoteElement('content')}
              editable
            />
          </FormGroup>
          {renderEditingCustomAttributes()}
          {/* {renderEditingTemplates()} */}
        </div>
        <ButtonToolbar className="card-dialog__button-bar">
          <Button onClick={finishEditing}>{i18n('Close')}</Button>
          <Button className="card-dialog__duplicate" onClick={handleDuplicate}>
            <FiCopy />
            {' ' + i18n('Duplicate')}
          </Button>
          <Button onClick={handleDelete}>
            <Glyphicon glyph="trash" />
            {' ' + i18n('Delete')}
          </Button>
        </ButtonToolbar>
      </div>
    </div>
  )
}

NoteEditDetails.propTypes = {
  note: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  customAttributes: PropTypes.array.isRequired,
  darkMode: PropTypes.bool.isRequired,
  finishEditing: PropTypes.func.isRequired,
  foci: PropTypes.array.isRequired,
}

const mapStateToProps = (state, ownProps) => {
  return {
    note: selectors.singleNoteSelector(
      state,
      // @ts-ignore
      ownProps.noteId
    ),
    customAttributes: selectors.noteCustomAttributesSelector(state),
    darkMode: selectors.isDarkModeSelector(state),
    foci: selectors.noteCurrentFocusSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    actions: bindActionCreators(actions.note, dispatch),
  }
})(NoteEditDetails)
