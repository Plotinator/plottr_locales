import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { isEqual } from 'lodash'
import cx from 'classnames'
import { FiCopy } from 'react-icons/fi'

import { t } from 'plottr_locales'

import Tab from '../Tab'
import Glyphicon from '../Glyphicon'
import Tabs from '../Tabs'
import ButtonToolbar from '../ButtonToolbar'
import ControlLabel from '../ControlLabel'
import FormGroup from '../FormGroup'
import UnconnectedTextFormControl from '../TextFormControl'
import Button from '../Button'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedCategoryPicker from '../CategoryPicker'
import UnconnectedRichText from '../rce/RichText'
import UnconnectedImagePicker from '../images/ImagePicker'
import UnconnectedImage from '../images/Image'
import UnconnectedEditAttribute from '../EditAttribute'
import TemplatePickerConnector from '../templates/TemplatePicker'
import { checkDependencies } from '../checkDependencies'

const CharacterEditDetailsConnector = (connector) => {
  const CategoryPicker = UnconnectedCategoryPicker(connector)
  const RichText = UnconnectedRichText(connector)
  const ImagePicker = UnconnectedImagePicker(connector)
  const Image = UnconnectedImage(connector)
  const EditAttribute = UnconnectedEditAttribute(connector)
  const TemplatePicker = TemplatePickerConnector(connector)
  const TextFormControl = UnconnectedTextFormControl(connector)

  const {
    platform: { templatesDisabled, openExternal },
  } = connector

  checkDependencies({
    templatesDisabled,
    openExternal,
  })

  const CharacterEditDetails = ({
    characterAttributeMetadata,
    finishEditing,
    character,
    actions,
    uiActions,
    attributes,
    getTemplateById,
    darkMode,
    templateAttributeValue,
    selection,
    openAttributes,
    charactersSearchTerm,
    deleting,
    removing,
    removeWhichTemplate,
    activeTab,
    showTemplatePicker,
    foci,
    attributeTabId,
  }) => {
    const [newTemplateTabPosition, setNewTemplateTabPosition] = useState(null)

    const shortDescriptionAttributeId = characterAttributeMetadata.find(({ name }) => {
      return name === 'shortDescription'
    })?.id
    const descriptionAttributeId = characterAttributeMetadata.find(({ name }) => {
      return name === 'description'
    })?.id

    const selectionForMainNonChangingElement = (name) => {
      const characterId = character.id

      return foci?.find(({ path }) => {
        return isEqual(path, ['character', characterId, name])
      })?.selection
    }

    const selectionForMainChangingElement = (attributeId) => {
      const characterId = character.id
      const bookId = attributeTabId

      // The foci selector narrows down to the selected book already(!)
      if (
        foci[0] &&
        isEqual(foci[0].path, ['character', characterId, 'customAttribute', attributeId, bookId])
      ) {
        return foci[0].selection
      }
      return null
    }

    const shouldFocusMainChangingElement = (attributeId) => {
      const characterId = character.id
      const bookId = attributeTabId

      // The foci selector narrows down to the selected book already(!)
      return (
        foci[0] &&
        isEqual(foci[0].path, ['character', characterId, 'customAttribute', attributeId, bookId])
      )
    }

    const selectionForCustomAttribute = (attributeId) => {
      const characterId = character.id
      const bookId = attributeTabId
      return foci?.find(({ path }) => {
        return isEqual(path, ['character', characterId, 'customAttribute', attributeId, bookId])
      })?.selection
    }

    const shouldFocusCustomAttribute = (attributeId) => {
      const characterId = character.id
      const bookId = attributeTabId
      return (
        foci &&
        foci[0] &&
        isEqual(foci[0].path, ['character', characterId, 'customAttribute', attributeId, bookId])
      )
    }

    const selectionForTemplateAttribute = (templateId, attributeName) => {
      const characterId = character.id
      const bookId = attributeTabId
      return foci?.find(({ path }) => {
        return isEqual(path, [
          'character',
          characterId,
          'template',
          templateId,
          attributeName,
          bookId,
        ])
      })?.selection
    }

    const shouldFocusTemplateAttribute = (templateId, attributeName) => {
      const characterId = character.id
      const bookId = attributeTabId
      return (
        foci &&
        foci[0] &&
        isEqual(foci[0].path, [
          'character',
          characterId,
          'template',
          templateId,
          attributeName,
          bookId,
        ])
      )
    }

    const deleteCharacter = (e) => {
      e.stopPropagation()
      actions.deleteCharacter(character.id)
      uiActions.finishDeletingCharacter()
    }

    const cancelDelete = (e) => {
      e.stopPropagation()
      uiActions.finishDeletingCharacter()
    }

    const handleDelete = (e) => {
      e.stopPropagation()
      uiActions.startDeletingCharacter()
    }

    const beginRemoveTemplate = (templateId) => {
      uiActions.startRemovingTemplateFromCharacter()
      uiActions.setTemplateToRemoveFromCharacter(templateId)
    }

    const finishRemoveTemplate = (e) => {
      e.stopPropagation()
      uiActions.setActiveCharacterTab(activeTab - 1)
      actions.removeTemplateFromCharacter(character.id, removeWhichTemplate)
      uiActions.finishRemovingTemplateFromCharacter()
      uiActions.setTemplateToRemoveFromCharacter(null)
    }

    const cancelRemoveTemplate = (e) => {
      e.stopPropagation()
      uiActions.finishRemovingTemplateFromCharacter()
      uiActions.setTemplateToRemoveFromCharacter(null)
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

    const handleChooseTemplate = (templateData) => {
      actions.addTemplateToCharacter(character.id, templateData)
      const numTemplates = character.templates.length
      uiActions.hideCharacterEditorTemplatePicker()
      uiActions.setActiveCharacterTab(numTemplates + 3)
    }

    const handleNotesChanged = (value, selection) => {
      actions.editDescription(character.id, value, selection)
    }

    const handleAttrChange = (attrId) => (value, selection) => {
      actions.editCharacterAttributeValue(character.id, attrId, value, selection)
    }

    const handleTemplateAttrChange = (id, name) => (desc, selection) => {
      actions.editCharacterTemplateAttribute(character.id, id, name, desc, selection)
    }

    const changeCategory = (val) => {
      actions.editCategory(character.id, val)
    }

    const changeImage = (newImageId) => {
      actions.editCharacterImage(character.id, newImageId)
    }

    const changeName = (newName, selection) => {
      actions.editCharacterName(character.id, newName, selection)
    }

    const changeShortDescription = (newShortDescription, selection) => {
      actions.editShortDescription(character.id, newShortDescription, selection)
    }

    const selectTab = (key) => {
      // We could get a synthetic event back from React
      if (typeof key === 'object') return

      if (key == 'new') {
        uiActions.showCharacterEditorTemplatePicker()
      } else {
        uiActions.setActiveCharacterTab(key)
      }
    }

    const renderTemplatePicker = () => {
      if (!showTemplatePicker) return null

      return (
        <TemplatePicker
          modal={true}
          types={['characters']}
          isOpen={showTemplatePicker}
          close={uiActions.hideCharacterEditorTemplatePicker}
          onChooseTemplate={handleChooseTemplate}
          canMakeCharacterTemplates={!!attributes.length}
          templatesAlreadySelected={character.templates}
        />
      )
    }

    const renderRemoveTemplate = () => {
      if (!removing) return null
      let templateData = getTemplateById(removeWhichTemplate)
      if (!templateData) {
        templateData = character.templates.find((t) => t.id == removeWhichTemplate) || {}
      }
      return (
        <DeleteConfirmModal
          customText={t(
            'Are you sure you want to remove the {template} template and all its data?',
            { template: templateData?.name || t('Template') }
          )}
          onDelete={finishRemoveTemplate}
          onCancel={cancelRemoveTemplate}
        />
      )
    }

    const renderDelete = () => {
      if (!deleting) return null

      return (
        <DeleteConfirmModal
          name={character.name || t('New Character')}
          onDelete={deleteCharacter}
          onCancel={cancelDelete}
        />
      )
    }

    const renderEditingImage = () => {
      return (
        <FormGroup>
          <ControlLabel>{t('Character Thumbnail')}</ControlLabel>
          <div className="character-list__character__edit-image-wrapper">
            <div className="character-list__character__edit-image">
              <Image size="large" shape="circle" imageId={character.imageId} />
            </div>
            <div>
              <ImagePicker selectedId={character.imageId} chooseImage={changeImage} deleteButton />
            </div>
          </div>
        </FormGroup>
      )
    }

    const renderEditingCustomAttributes = () => {
      return attributes.map((attr, index) => {
        // Don't use the attr.key || attr.name alone for key here
        // because legacy attribute names can overlap with new
        // attribute ids.
        return (
          <React.Fragment key={`${index}-${attr.id || attr.name}`}>
            <EditAttribute
              index={index}
              entity={character}
              entityType="character"
              value={attr.value}
              onChange={handleAttrChange(attr.id || attr.name)}
              onSave={finishEditing}
              name={attr.name}
              id={attr.id}
              type={attr.type}
              autoFocus={shouldFocusCustomAttribute(attr.id)}
              selection={selectionForCustomAttribute(attr.id)}
              inputId={`character-${character.id}-custom-attribute-${
                attr.id || attr.name
              }-book-${attributeTabId}`}
            />
          </React.Fragment>
        )
      })
    }

    const handleTabDragOver = (e) => {
      if (e) {
        e.preventDefault()
        const newPosition = e.target?.getAttribute('position')
        if (newPosition != newTemplateTabPosition) {
          setNewTemplateTabPosition(newPosition)
        }
      }
    }

    const handleDropTab = (event) => {
      event.stopPropagation()

      var json = event.dataTransfer.getData('text/json')
      var droppedTab = JSON.parse(json)
      actions.reorderCharacterTemplateAttribute(
        droppedTab.position,
        Number(newTemplateTabPosition),
        character.id
      )
      setNewTemplateTabPosition(null)
    }

    const renderEditingTemplates = () => {
      return character.templates.map((template, idx) => {
        const templateData = getTemplateById(template.id)
        const handleDragStart = (e, idx) => {
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/json', JSON.stringify({ ...template, position: idx }))
        }

        const attrs = template.attributes.map((attr, index) => {
          return (
            <React.Fragment key={index}>
              <EditAttribute
                templateAttribute
                index={index}
                entity={character}
                entityType="character"
                valueSelector={templateAttributeValue(template.id, attr.name)}
                inputId={`character-${character.id}-template-${template.id}-attribute-${attr.name}-book-${attributeTabId}`}
                onChange={handleTemplateAttrChange(template.id, attr.name)}
                onSave={finishEditing}
                name={attr.name}
                id={attr.id}
                type={attr.type}
                description={attr.description}
                link={attr.link}
                autoFocus={shouldFocusTemplateAttribute(template.id, attr.name)}
                selection={selectionForTemplateAttribute(template.id, attr.name)}
              />
            </React.Fragment>
          )
        })
        let link = null
        if (templateData?.link) {
          link = (
            <a
              className="template-picker__link"
              title={templateData?.link}
              onClick={() => openExternal(templateData?.link)}
            >
              <Glyphicon glyph="info-sign" />
            </a>
          )
        }
        return (
          <Tab
            eventKey={idx + 3}
            title={templateData?.name || template.name || t('Template')}
            key={`tab-${idx}`}
            onDragStart={(evt) => handleDragStart(evt, idx)}
            position={idx}
            draggable
            isDroppable={newTemplateTabPosition && idx === Number(newTemplateTabPosition)}
          >
            <div className="template-tab__details">
              <p>
                {templateData?.description}
                {link}
              </p>
              <Button
                bsStyle="link"
                className="text-danger"
                onClick={() => beginRemoveTemplate(template.id)}
              >
                {t('Remove template')}
              </Button>
            </div>
            {attrs}
          </Tab>
        )
      })
    }

    const handleDuplicate = () => {
      actions.duplicateCharacter(character.id)
    }

    return (
      <div className="character-list__character-wrapper">
        {renderDelete()}
        {renderRemoveTemplate()}
        {renderTemplatePicker()}
        <div className={cx('character-list__character', 'editing', { darkmode: darkMode })}>
          <div className="character-list__character__edit-form">
            <div className="character-list__inputs__normal">
              <FormGroup>
                <ControlLabel>{t('Name')}</ControlLabel>
                <TextFormControl
                  id={`character-${character.id}-name`}
                  type="text"
                  onChange={changeName}
                  autoFocus={foci && foci[0] && foci[0].path[2] === 'name'}
                  selection={selectionForMainNonChangingElement('name')}
                  onKeyDown={handleEsc}
                  onKeyPress={handleEnter}
                  value={character.name}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{t('Short Description')}</ControlLabel>
                <TextFormControl
                  id={`character-${character.id}-short-description`}
                  type="text"
                  onChange={changeShortDescription}
                  autoFocus={shouldFocusMainChangingElement(shortDescriptionAttributeId)}
                  selection={selectionForMainChangingElement(shortDescriptionAttributeId)}
                  onSelection
                  onKeyDown={handleEsc}
                  onKeyPress={handleEnter}
                  value={character.description}
                />
              </FormGroup>
            </div>
            <div className="character-list__inputs__custom">
              <FormGroup>
                <ControlLabel>{t('Category')}</ControlLabel>
                <CategoryPicker
                  type="characters"
                  selectedId={character.categoryId}
                  onChange={changeCategory}
                />
              </FormGroup>
              {renderEditingImage()}
            </div>
          </div>
          <Tabs
            activeKey={activeTab}
            id="tabs"
            className="character-list__character__tabs"
            onSelect={selectTab}
            onDrop={handleDropTab}
            onTabDragOver={handleTabDragOver}
          >
            <Tab eventKey={1} title={t('Notes')}>
              <RichText
                id={`character-${character.id}-notes-book-${attributeTabId}`}
                description={character.notes}
                onChange={handleNotesChanged}
                autoFocus={shouldFocusMainChangingElement(descriptionAttributeId)}
                selection={selectionForMainChangingElement(descriptionAttributeId)}
                editable
              />
            </Tab>
            <Tab eventKey={2} title={t('Attributes')}>
              <a
                href="#"
                className="card-dialog__custom-attributes-configuration-link"
                onClick={openAttributes}
              >
                {t('Configure')}
              </a>
              {renderEditingCustomAttributes()}
            </Tab>
            {renderEditingTemplates()}
            {!templatesDisabled && <Tab eventKey="new" title={t('+ Add Template')}></Tab>}
          </Tabs>
          <ButtonToolbar className="card-dialog__button-bar">
            <Button onClick={finishEditing}>{t('Close')}</Button>
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

  CharacterEditDetails.propTypes = {
    characterAttributeMetadata: PropTypes.array.isRequired,
    characterId: PropTypes.number.isRequired,
    openAttributes: PropTypes.func,
    character: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    uiActions: PropTypes.object.isRequired,
    attributes: PropTypes.array.isRequired,
    darkMode: PropTypes.bool,
    finishEditing: PropTypes.func.isRequired,
    selection: PropTypes.object,
    getTemplateById: PropTypes.func.isRequired,
    templateAttributeValue: PropTypes.func.isRequired,
    charactersSearchTerm: PropTypes.string,
    deleting: PropTypes.bool,
    removing: PropTypes.bool,
    removeWhichTemplate: PropTypes.any,
    activeTab: PropTypes.number,
    showTemplatePicker: PropTypes.bool,
    foci: PropTypes.array.isRequired,
    attributeTabId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
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
          characterAttributeMetadata: selectors.allCharacterAttributesSelector(state),
          character: selectors.displayedSingleCharacterSelector(state, ownProps.characterId),
          attributes: selectors.characterAttributesSelector(state, ownProps.characterId),
          darkMode: selectors.isDarkModeSelector(state),
          getTemplateById: (templateId) => selectors.templateByIdSelector(state, templateId),
          templateAttributeValue: (templateId, attributeName) => {
            return (state) =>
              selectors.characterTemplateAttributeValueSelector(
                state,
                ownProps.characterId,
                templateId,
                attributeName
              )
          },
          charactersSearchTerm: selectors.charactersSearchTermSelector(state),
          deleting: selectors.characterEditorIsDeletingSelector(state),
          removing: selectors.characterEditorIsRemovingTemplateSelector(state),
          removeWhichTemplate: selectors.characterEditorTemplateBeingRemovedSelector(state),
          activeTab: selectors.characterEditorActiveTabSelector(state),
          showTemplatePicker: selectors.characterEditorShowTemplatePickerSelector(state),
          foci: selectors.characterCurrentFociSelector(state),
          attributeTabId: selectors.characterAttributeTabSelector(state),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.character, dispatch),
          uiActions: bindActionCreators(actions.ui, dispatch),
        }
      }
    )(CharacterEditDetails)
  }

  throw new Error('Cannot connect CharacterEditDetails')
}

export default CharacterEditDetailsConnector
