import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { isEqual } from 'lodash'
import cx from 'classnames'
import { FiCopy } from 'react-icons/fi'

import { t as i18n } from 'plottr_locales'

import ButtonToolbar from '../ButtonToolbar'
import ControlLabel from '../ControlLabel'
import FormGroup from '../FormGroup'
import UnconnectedTextFormControl from '../TextFormControl'
import Button from '../Button'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedCategoryPicker from '../CategoryPicker'
import UnconnectedRichText from '../rce/RichText'
import UnconnectedEditAttribute from '../EditAttribute'
import UnconnectedImagePicker from '../images/ImagePicker'
import UnconnectedImage from '../images/Image'
import { checkDependencies } from '../checkDependencies'
import Glyphicon from '../Glyphicon'
import { withArgs } from '../withArgs'

const NoteEditDetailsConnector = (connector) => {
  const CategoryPicker = UnconnectedCategoryPicker(connector)
  const RichText = UnconnectedRichText(connector)
  const EditAttribute = UnconnectedEditAttribute(connector)
  const ImagePicker = UnconnectedImagePicker(connector)
  const Image = UnconnectedImage(connector)
  const TextFormControl = UnconnectedTextFormControl(connector)

  const {
    pltr: { helpers },
  } = connector
  checkDependencies({ helpers })

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
      actions.editNote(note.id, { categoryId: val })
    }

    const changeImage = (newImageId) => {
      actions.editNote(note.id, { imageId: newImageId })
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
                  type="text"
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
                <CategoryPicker
                  type="notes"
                  selectedId={note.categoryId}
                  onChange={changeCategory}
                />
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

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  checkDependencies({ redux, selectors, actions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          note: selectors.singleNoteSelector(state, ownProps.noteId),
          customAttributes: selectors.noteCustomAttributesSelector(state),
          darkMode: selectors.isDarkModeSelector(state),
          foci: selectors.noteCurrentFocusSelector(state),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.note, dispatch),
        }
      }
    )(NoteEditDetails)
  }

  throw new Error('Cannot connect NoteEditDetails')
}

export default NoteEditDetailsConnector
