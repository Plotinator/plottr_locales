import React, { useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { isEqual } from 'lodash'
import cx from 'classnames'
import { FiCopy } from '@react-icons/all-files/fi/FiCopy'

import { t } from 'plottr_locales'

import ButtonToolbar from '../ButtonToolbar'
import Glyphicon from '../Glyphicon'
import ControlLabel from '../ControlLabel'
import FormGroup from '../FormGroup'
import UnconnectedTextFormControl from '../TextFormControl'
import Button from '../Button'
import UnconnectedCategoryPicker from '../CategoryPicker'
import UnconnectedBookSelectList from '../project/BookSelectList'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedEditAttribute from '../EditAttribute'
import UnconnectedImage from '../images/Image'
import UnconnectedImagePicker from '../images/ImagePicker'
import UnconnectedRichText from '../rce/RichText'
import UnconnectedSelectList from '../SelectList'
import { checkDependencies } from '../checkDependencies'
import { withArgs } from '../withArgs'

const PlaceViewConnector = (connector) => {
  const BookSelectList = UnconnectedBookSelectList(connector)
  const EditAttribute = UnconnectedEditAttribute(connector)
  const Image = UnconnectedImage(connector)
  const ImagePicker = UnconnectedImagePicker(connector)
  const RichText = UnconnectedRichText(connector)
  const SelectList = UnconnectedSelectList(connector)
  const CategoryPicker = UnconnectedCategoryPicker(connector)
  const TextFormControl = UnconnectedTextFormControl(connector)

  const {
    pltr: { helpers },
  } = connector
  checkDependencies({ helpers })

  const PlaceView = ({
    place,
    editing,
    startEditing,
    stopEditing,
    actions,
    customAttributes,
    cards,
    notes,
    selection,
    darkMode,
    tags,
    places,
    placeSearchTerm,
    foci,
  }) => {
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
      return () => {
        if (editing) saveEdit(false)
      }
    }, [])

    const selectionForMainPlaceElement = (name) => {
      const placeId = place.id

      return foci?.find(({ path }) => {
        return isEqual(path, ['place', placeId, name])
      })?.selection
    }

    const deletePlace = (e) => {
      e.stopPropagation()
      actions.deletePlace(place.id)
    }

    const cancelDelete = (e) => {
      e.stopPropagation()
      setDeleting(false)
    }

    const handleDelete = (e) => {
      e.stopPropagation()
      setDeleting(true)
      stopEditing()
    }

    const handleEnter = (event) => {
      if (event.which === 13) {
        saveEdit()
      }
    }

    const handleEsc = (event) => {
      if (event.which === 27) {
        saveEdit()
      }
    }

    const handleAttrDescriptionChange = (attrName) => (desc, selection) => {
      actions.editPlaceCustomAttribute(place.id, attrName, desc, selection)
    }

    const handleNotesChanged = (value, selection) => {
      actions.editPlaceNotes(place.id, value, selection)
    }

    const saveEdit = (close = true) => {
      if (close) stopEditing()
    }

    const changeCategory = (newCategoryId) => {
      actions.editPlace(place.id, { categoryId: { value: newCategoryId } })
    }

    const updateImageId = (newImageId) => {
      actions.editPlace(place.id, { imageId: { value: newImageId } })
    }

    const renderDelete = () => {
      if (!deleting) return null

      return (
        <DeleteConfirmModal
          name={place.name || t('New Place')}
          onDelete={deletePlace}
          onCancel={cancelDelete}
        />
      )
    }

    const renderEditingImage = () => {
      return (
        <FormGroup>
          <ControlLabel>{t('Place Image')}</ControlLabel>
          <div className="place-list__place__edit-image-wrapper">
            <div className="place-list__place__edit-image">
              <Image size="small" shape="rounded" imageId={place.imageId} />
            </div>
            <div>
              <ImagePicker selectedId={place.imageId} chooseImage={updateImageId} deleteButton />
            </div>
          </div>
        </FormGroup>
      )
    }

    const handleDuplicate = () => {
      actions.duplicatePlace(place.id)
    }

    const renderEditingCustomAttributes = () => {
      return customAttributes.map((attr, index) => {
        const { name, id, type } = attr
        return (
          <React.Fragment key={`custom-attribute-${index}-${name}`}>
            <EditAttribute
              index={index}
              entityType="place"
              value={place[name]}
              onChange={handleAttrDescriptionChange(name)}
              onSave={saveEdit}
              name={name}
              id={id || name}
              type={type}
              autoFocus={foci && foci[0] && foci[0].path[2] === attr.name}
              selection={selectionForMainPlaceElement(attr.name)}
              inputId={`place-${place.id}-custom-attribute-${index}-${name}`}
            />
          </React.Fragment>
        )
      })
    }

    const renderEditing = () => {
      return (
        <div className="place-list__place-wrapper">
          <div className={cx('place-list__place', 'editing', { darkmode: darkMode })}>
            <div className="place-list__place__edit-form">
              <div className="place-list__inputs__normal">
                <FormGroup>
                  <ControlLabel>{t('Name')}</ControlLabel>
                  <TextFormControl
                    id={`place-${place.id}-name`}
                    type="text"
                    onChange={withArgs(actions.editPlaceName, place.id)}
                    autoFocus={foci && foci[0] && foci[0].path[2] === 'name'}
                    selection={selectionForMainPlaceElement('name')}
                    onKeyDown={handleEsc}
                    onKeyPress={handleEnter}
                    value={place.name}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>{t('Short Description')}</ControlLabel>
                  <TextFormControl
                    id={`place-${place.id}-short-description`}
                    type="text"
                    onChange={withArgs(actions.editPlaceDescription, place.id)}
                    autoFocus={foci && foci[0] && foci[0].path[2] === 'description'}
                    selection={selectionForMainPlaceElement('description')}
                    onKeyDown={handleEsc}
                    onKeyPress={handleEnter}
                    value={place.description}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>{t('Category')}</ControlLabel>
                  <CategoryPicker
                    type="places"
                    selectedId={place.categoryId}
                    onChange={changeCategory}
                  />
                </FormGroup>
                {renderEditingImage()}
                <FormGroup>
                  <ControlLabel>{t('Notes')}</ControlLabel>
                  <RichText
                    id={`place-${place.id}-notes`}
                    description={place.notes}
                    onChange={handleNotesChanged}
                    autoFocus={foci && foci[0] && foci[0].path[2] === 'notes'}
                    selection={selectionForMainPlaceElement('notes')}
                    editable
                  />
                </FormGroup>
              </div>
              <div className="place-list__inputs__custom">{renderEditingCustomAttributes()}</div>
            </div>
            <ButtonToolbar className="card-dialog__button-bar">
              <Button onClick={saveEdit}>{t('Close')}</Button>
              <Button className="card-dialog__duplicate" onClick={handleDuplicate}>
                <FiCopy />
                {' ' + t('Duplicate')}
              </Button>
              <Button onClick={handleDelete}>
                <Glyphicon glyph="trash" />
                {' ' + t('Delete')}
              </Button>
            </ButtonToolbar>
          </div>
        </div>
      )
    }

    const renderPlace = () => {
      const details = customAttributes.map((attr, idx) => {
        const { name, type } = attr
        let desc = <dd>{place[name]}</dd>
        if (type == 'paragraph') {
          desc = (
            <dd>
              <RichText
                id={`place-${place.id}-custom-attribute-${attr.name}`}
                description={place[name]}
              />
            </dd>
          )
        }
        return (
          <dl key={idx} className="dl-horizontal">
            <dt>{name}</dt>
            {desc}
          </dl>
        )
      })
      return (
        <div className="place-list__place-wrapper">
          {renderDelete()}
          <div className="place-list__place" onClick={startEditing}>
            <h4 className="secondary-text">{place.name || t('New Place')}</h4>
            <div className="place-list__place-inner">
              <div className="place-list__left-side">
                <dl className="dl-horizontal">
                  <dt>{t('Description')}</dt>
                  <dd>{place.description}</dd>
                </dl>
                {details}
                <dl className="dl-horizontal">
                  <dt>{t('Notes')}</dt>
                  <dd>
                    <RichText id={`place-${place.id}-notes`} description={place.notes} />
                  </dd>
                </dl>
              </div>
              <div className="place-list__right-side">
                <Glyphicon glyph="pencil" />
                <Image responsive imageId={place.imageId} />
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className={cx('place-list__place-view', { darkmode: darkMode })}>
        <div className="place-list__place-view__left-side">
          <BookSelectList
            selectedBooks={place.bookIds}
            parentId={place.id}
            add={actions.addBook}
            remove={actions.removeBook}
          />
          <SelectList
            parentId={place.id}
            type={'Tags'}
            selectedItems={place.tags}
            allItems={tags}
            add={actions.addTag}
            remove={actions.removeTag}
          />
        </div>
        <div className="place-list__place-view__right-side">
          {editing ? renderEditing() : renderPlace()}
        </div>
      </div>
    )
  }

  PlaceView.propTypes = {
    place: PropTypes.object.isRequired,
    editing: PropTypes.bool.isRequired,
    startEditing: PropTypes.func.isRequired,
    stopEditing: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
    customAttributes: PropTypes.array.isRequired,
    cards: PropTypes.array.isRequired,
    notes: PropTypes.array.isRequired,
    selection: PropTypes.object,
    darkMode: PropTypes.bool,
    tags: PropTypes.array.isRequired,
    places: PropTypes.array,
    placeSearchTerm: PropTypes.string,
    foci: PropTypes.array,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  const { sortedTagsSelector } = selectors
  const PlaceActions = actions.place

  checkDependencies({ redux, selectors, actions, sortedTagsSelector, PlaceActions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          customAttributes: selectors.placeCustomAttributesSelector(state),
          cards: selectors.allCardsSelector(state),
          notes: selectors.allNotesSelector(state),
          darkMode: selectors.isDarkModeSelector(state),
          tags: sortedTagsSelector(state),
          placeSearchTerm: selectors.placesSearchTermSelector(state),
          foci: selectors.placeCurrentFocusSelector(state),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(PlaceActions, dispatch),
        }
      }
    )(PlaceView)
  }

  throw new Error('Could not connect PlaceView')
}

export default PlaceViewConnector
