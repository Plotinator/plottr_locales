import React, { useEffect, useRef, useState } from 'react'
import { isEqual } from 'lodash'
import PropTypes from 'react-proptypes'
import { FiCopy } from 'react-icons/fi'
import cx from 'classnames'
import tinycolor from 'tinycolor2'
import { IoIosWarning } from 'react-icons/io'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import DropdownButton from '../DropdownButton'
import MenuItem from '../MenuItem'
import Tab from '../Tab'
import Tabs from '../Tabs'
import ButtonToolbar from '../ButtonToolbar'
import UnconnectedPlottrFloater from '../PlottrFloater'
import Glyphicon from '../Glyphicon'
import UnconnectedTextFormControl from '../TextFormControl'
import Button from '../Button'
import ColorPickerColor from '../ColorPickerColor'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedEditAttribute from '../EditAttribute'
import UnconnectedMiniColorPicker from '../MiniColorPicker'
import UnconnectedPlottrModal from '../PlottrModal'
import UnconnectedSelectList from '../SelectList'
import UnconnectedBeatItemTitle from './BeatItemTitle'
import UnconnectedCardDescriptionEditor from './CardDescriptionEditor'
import TemplatePickerConnector from '../templates/TemplatePicker'
import { checkDependencies } from '../checkDependencies'
import { contains } from '../domHelpers'
import { withArgs } from '../withArgs'

const {
  card: { truncateTitle },
} = helpers

const modalStyles = {
  content: {
    borderRadius: 20,
  },
}

const CardDialogConnector = (connector) => {
  const EditAttribute = UnconnectedEditAttribute(connector)
  const PlottrModal = UnconnectedPlottrModal(connector)
  const SelectList = UnconnectedSelectList(connector)
  const BeatItemTitle = UnconnectedBeatItemTitle(connector)
  const CardDescriptionEditor = UnconnectedCardDescriptionEditor(connector)
  const TemplatePicker = TemplatePickerConnector(connector)
  const MiniColorPicker = UnconnectedMiniColorPicker(connector)
  const Floater = UnconnectedPlottrFloater(connector)
  const TextFormControl = UnconnectedTextFormControl(connector)

  const {
    platform: { templatesDisabled, openExternal },
  } = connector
  checkDependencies({ templatesDisabled, openExternal })

  const CardDialog = ({
    cardMetaData,
    places,
    tags,
    characters,
    characterBookCategories,
    actions,
    uiActions,
    customAttributes,
    getTemplateById,
    closeDialog,
    cardId,
    beats,
    books,
    isSeries,
    beatId,
    lineId,
    lines,
    darkMode,
    currentTimeline,
    notificationActions,
    destinationBeatId,
    destinationLineId,
    click,
    deleting,
    showColorPicker,
    showTemplatePicker,
    removing,
    removeWhichTemplate,
    activeTab,
    foci,
  }) => {
    const [newTemplateTabPosition, setNewTemplateTabPosition] = useState(null)

    const colourPickerButtonRef = useRef()
    const colourPickerPaletteListRef = useRef()
    const previousClick = useRef(click)

    useEffect(() => {
      if (!colourPickerPaletteListRef.current || !colourPickerButtonRef.current) return
      if (contains(colourPickerButtonRef.current, click)) return

      if (
        click.counter !== previousClick.counter &&
        !contains(colourPickerPaletteListRef.current, click)
      ) {
        uiActions.showCardDialogColorPicker()
      }

      previousClick.current = click
    }, [click])

    const selectionForMainCardElement = (name) => {
      return foci?.find(({ path }) => {
        return isEqual(path, ['card', cardId, name])
      })?.selection
    }

    const selectionForTemplateAttribute = (template, attr) => {
      return foci?.find(({ path }) => {
        return isEqual(path, ['card', cardId, 'template', template.id, attr.name])
      })?.selection
    }

    if (!cardMetaData) {
      return null
    }

    const { templates, id, title, color } = cardMetaData

    const deleteCard = (e) => {
      e.stopPropagation()
      actions.deleteCard(cardId)
    }

    const cancelDelete = (e) => {
      e.stopPropagation()
      uiActions.startDeletingCardFromCardDialog()
    }

    const handleDelete = (e) => {
      e.stopPropagation()
      uiActions.stopDeletingCardFromCardDialog()
    }

    const duplicateCard = (e) => {
      e.stopPropagation()
      actions.duplicateCard(id)
      notificationActions.showToastNotification(true, 'duplicate')
    }

    const beginRemoveTemplate = (templateId) => {
      uiActions.startRemovingTemplateFromCardDialog(templateId)
    }

    const finishRemoveTemplate = (e) => {
      e.stopPropagation()
      uiActions.setActiveTabOnCardDialog(activeTab - 1)
      actions.removeTemplateFromCard(cardId, removeWhichTemplate)
      uiActions.stopRemovingTemplateFromCardDialog()
    }

    const cancelRemoveTemplate = (e) => {
      e.stopPropagation()
      uiActions.stopRemovingTemplateFromCardDialog()
    }

    const saveAndClose = () => {
      closeDialog()
    }

    const toggleColorPicker = () => {
      if (!showColorPicker) {
        uiActions.showCardDialogColorPicker()
      } else {
        uiActions.hideCardDialogColorPicker()
      }
    }

    const handleAttrChange = (attrName) => (value, selection) => {
      actions.editCardCustomAttribute(cardId, attrName, value, selection)
    }

    const handleTemplateAttrChange = (templateId, name) => (value, selection) => {
      if (!value && value !== '') {
        actions.editCardAttributes(cardId, {}, selection)
        return
      }
      actions.editCardTemplateAttribute(cardId, templateId, name, value, selection)
    }

    const handleEnter = (event) => {
      if (event.which === 13) {
        saveAndClose()
      }
    }

    const openTemplatePicker = () => {
      uiActions.showCardDialogTemplatePicker()
    }

    const handleChooseTemplate = (templateData) => {
      const numTemplates = templates.length
      actions.addTemplateToCard(id, templateData)
      uiActions.hideCardDialogTemplatePicker()
      uiActions.setActiveTabOnCardDialog(numTemplates + 3)
    }

    const closeTemplatePicker = () => {
      uiActions.hideCardDialogTemplatePicker()
    }

    const chooseCardColor = (color) => {
      actions.editCardAttributes(cardId, { color })
      uiActions.showCardDialogColorPicker()
    }

    const changeBeat = (beatId) => {
      actions.changeBeat(cardId, beatId, currentTimeline)
    }

    const changeLine = (lineId) => {
      actions.changeLine(cardId, lineId, currentTimeline)
    }

    const changeBook = (bookId) => {
      actions.changeBook(cardId, bookId)
    }

    const getCurrentLine = () => {
      return lines.find((l) => l.id == lineId)
    }

    const currentTimelineBookTitle = () => {
      let title = books[currentTimeline]?.title || t('Untitled')
      if (currentTimeline === 'series') {
        title = t('Series')
      }
      if (title.length > 20) {
        return title.slice(0, 20) + '...'
      }
      return title
    }

    const selectTab = (key) => {
      if (key == 'new') {
        openTemplatePicker()
      } else if (typeof key === 'number') {
        uiActions.setActiveTabOnCardDialog(key)
        if (key === 2 && !customAttributes.length) {
          uiActions.openAttributesDialog()
        }
      }
    }

    const renderDelete = () => {
      if (!deleting) return null

      return <DeleteConfirmModal name={title} onDelete={deleteCard} onCancel={cancelDelete} />
    }

    const renderRemoveTemplate = () => {
      if (!removing) return null
      let templateData = getTemplateById(removeWhichTemplate)
      if (!templateData) {
        templateData = templates.find((t) => t.id == removeWhichTemplate) || {}
      }
      return (
        <DeleteConfirmModal
          customText={t(
            'Are you sure you want to remove the {template} template and all its data?',
            { template: templateData.name || t('Template') }
          )}
          onDelete={finishRemoveTemplate}
          onCancel={cancelRemoveTemplate}
        />
      )
    }

    const renderTemplatePicker = () => {
      if (!showTemplatePicker) return null

      return (
        <TemplatePicker
          types={['scenes']}
          modal={true}
          isOpen={showTemplatePicker}
          close={closeTemplatePicker}
          onChooseTemplate={handleChooseTemplate}
          templatesAlreadySelected={cardMetaData.templates}
        />
      )
    }

    const renderEditingCustomAttributes = () => {
      return customAttributes.map((attr, index) => {
        return (
          <React.Fragment key={`custom-attribute-${index}-${attr.name}`}>
            <EditAttribute
              index={index}
              entityType="scene"
              valueSelector={selectors.attributeValueSelector(cardId, attr.name)}
              onChange={handleAttrChange(attr.name)}
              onSaveAndClose={saveAndClose}
              name={attr.name}
              id={attr.id}
              type={attr.type}
              autoFocus={foci && foci[0] && foci[0].path[2] === attr.name}
              selection={selectionForMainCardElement(attr.name)}
              inputId={`card-${cardId}-custom-attribute-${index}-${attr.name}`}
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
      actions.reorderCardTemplateAttribute(
        droppedTab.position,
        Number(newTemplateTabPosition),
        cardId
      )
      setNewTemplateTabPosition(null)
    }

    const renderEditingTemplates = () => {
      return templates.map((template, idx) => {
        const templateData = getTemplateById(template.id) || template || {}

        const handleDragStart = (e, idx) => {
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/json', JSON.stringify({ ...templateData, position: idx }))
        }

        const attrs = template.attributes.map((attr, index) => {
          return (
            <React.Fragment key={`template-attribute-${index}-${template.id}-${attr.name}`}>
              <EditAttribute
                templateAttribute
                index={index}
                entityType="scene"
                valueSelector={selectors.templateAttributeValueSelector(
                  cardId,
                  template.id,
                  attr.name
                )}
                inputId={`card-${cardId}-template-${template.id}-attribute-${attr.name}`}
                onChange={handleTemplateAttrChange(template.id, attr.name)}
                onSaveAndClose={saveAndClose}
                autoFocus={
                  foci &&
                  foci[0] &&
                  foci[0].path[2] === 'template' &&
                  foci[0].path[3] === template.id &&
                  foci[0].path[4] === attr.name
                }
                selection={selectionForTemplateAttribute(template, attr)}
                name={attr.name}
                id={attr.id}
                type={attr.type}
                description={attr.description}
                link={attr.link}
              />
            </React.Fragment>
          )
        })
        let link = null
        if (templateData.link) {
          link = (
            <a
              className="template-picker__link"
              title={templateData.link}
              onClick={() => openExternal(templateData.link)}
            >
              <Glyphicon glyph="info-sign" />
            </a>
          )
        }
        return (
          <Tab
            eventKey={idx + 3}
            title={templateData.name || t('Template')}
            key={`tab-${idx}`}
            draggable
            onDragStart={(evt) => handleDragStart(evt, idx)}
            position={idx}
            isDroppable={newTemplateTabPosition && idx === Number(newTemplateTabPosition)}
          >
            <div className="template-tab__details">
              <p>
                {templateData.description}
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

    const renderBeatItems = () => {
      return beats.map((beat) => {
        return (
          <MenuItem key={beat.id} onSelect={() => changeBeat(beat.id)}>
            <BeatItemTitle beat={beat} />
          </MenuItem>
        )
      })
    }

    const renderLineItems = () => {
      return lines.map((line) => {
        return (
          <MenuItem key={line.id} onSelect={() => changeLine(line.id)}>
            {truncateTitle(line.title, 50)}
          </MenuItem>
        )
      })
    }

    const renderBooks = (onSelect = changeBook) => {
      return ['series', ...books.allIds].map((id) => {
        if (id === currentTimeline) return null

        const destinationLine = destinationLineId(id)
        const destinationBeat = destinationBeatId(id)
        const noDestination = !destinationLine || !destinationBeat
        const bookTitle = books[id]?.title || t('Untitled')

        return (
          <MenuItem
            title={
              noDestination
                ? t("Can't move card to empty book")
                : t('Move card to { bookTitle }', { bookTitle })
            }
            key={id}
            onSelect={() => onSelect(id)}
            disabled={noDestination}
          >
            <div className="card-dialog__book-selector">
              {noDestination && <IoIosWarning />}
              {id === 'series' ? t('Series') : bookTitle}
            </div>
          </MenuItem>
        )
      })
    }

    const renderButtonBar = () => {
      return (
        <ButtonToolbar className="card-dialog__button-bar">
          <Button onClick={saveAndClose}>{t('Close')}</Button>
          <Button className="card-dialog__duplicate" onClick={duplicateCard}>
            <FiCopy />
            {' ' + t('Duplicate')}
          </Button>
          <Button onClick={handleDelete}>
            <Glyphicon glyph="trash" />
            {' ' + t('Delete')}
          </Button>
        </ButtonToolbar>
      )
    }

    const renderTitle = () => {
      const title = cardMetaData.title
      return (
        <TextFormControl
          placeholder={t('Enter title')}
          style={{ fontSize: '24px', textAlign: 'center', marginBottom: '6px' }}
          onKeyPress={handleEnter}
          type="text"
          value={title}
          onChange={withArgs(actions.editCardTitle, cardMetaData.id)}
          autoFocus={foci && foci[0] && foci[0].path[2] === 'title'}
          selection={selectionForMainCardElement('title')}
        />
      )
    }

    const moveCard = (bookId) => {
      actions.moveCardToBook(bookId, cardId)
      notificationActions.showToastNotification(true, 'move', bookId)
    }

    const renderChangeBookDropdown = () => {
      return (
        <div className="card-dialog__dropdown-wrapper" style={{ marginBottom: '5px' }}>
          <label className="card-dialog__details-label" htmlFor="select-book">
            {t('Book')}:
            <DropdownButton
              id="select-book"
              className="card-dialog__select-line"
              title={currentTimelineBookTitle()}
            >
              {renderBooks(moveCard)}
            </DropdownButton>
          </label>
        </div>
      )
    }

    const renderColourPicker = () => {
      return (
        <MiniColorPicker
          childRef={(ref) => {
            colourPickerPaletteListRef.current = ref
          }}
          chooseColor={chooseCardColor}
          close={uiActions.hideCardDialogColorPicker}
        />
      )
    }

    const renderLeftSide = () => {
      const lineDropdownID = 'select-line'
      const beatDropdownID = 'select-beat'

      let labelText = t('Chapter')
      const darkened = color || color === null ? tinycolor(color).darken().toHslString() : null
      const borderColor = color || color === null ? darkened : 'hsl(211, 27%, 70%)' // $gray-6

      const beat = beats.find(({ id }) => beatId === id)
      const DropDownTitle = beat ? <BeatItemTitle beat={beat} /> : t('Chapter')

      return (
        <div className="card-dialog__left-side">
          {renderChangeBookDropdown()}
          <div className="card-dialog__dropdown-wrapper">
            <label className="card-dialog__details-label" htmlFor={lineDropdownID}>
              {t('Plotline')}:
            </label>
            <DropdownButton
              id={lineDropdownID}
              className="card-dialog__select-line"
              title={truncateTitle(getCurrentLine()?.title, 35)}
            >
              {renderLineItems()}
            </DropdownButton>
          </div>
          <div className="card-dialog__dropdown-wrapper">
            <label className="card-dialog__details-label" htmlFor={beatDropdownID}>
              {labelText}:
            </label>
            <DropdownButton
              id={beatDropdownID}
              className="card-dialog__select-card"
              title={DropDownTitle}
            >
              {renderBeatItems()}
            </DropdownButton>
          </div>
          <SelectList
            parentId={cardId}
            type={'Characters'}
            selectedItems={cardMetaData.characters}
            allItems={characters}
            categories={characterBookCategories}
            add={actions.addCharacter}
            remove={actions.removeCharacter}
          />
          <SelectList
            parentId={cardId}
            type={'Places'}
            selectedItems={cardMetaData.places}
            allItems={places}
            add={actions.addPlace}
            remove={actions.removePlace}
          />
          <SelectList
            parentId={cardId}
            type={'Tags'}
            selectedItems={cardMetaData.tags}
            allItems={tags}
            add={actions.addTag}
            remove={actions.removeTag}
          />
          <div ref={colourPickerButtonRef} className="color-picker__box">
            <label className="card-dialog__details-label" style={{ minWidth: '55px' }}>
              {t('Color')}:
            </label>
            <Floater
              open={showColorPicker}
              placement="bottom"
              component={renderColourPicker}
              onClose={uiActions.hideCardDialogColorPicker}
            >
              <ColorPickerColor
                color={cardMetaData.color || cardMetaData.color === null ? 'none' : '#F1F5F8'} // $gray-9
                choose={toggleColorPicker}
                style={{ margin: '2px', marginRight: '12px' }}
                buttonStyle={{
                  border: `1px solid ${borderColor}`,
                  backgroundColor: cardMetaData.color,
                }}
              />
            </Floater>
            <div className="buttons" style={{ alignSelf: 'flex-start' }}>
              <Button bsSize="xs" block title={t('Choose color')} onClick={toggleColorPicker}>
                <Glyphicon glyph="tint" />
              </Button>
              <Button
                bsSize="xs"
                block
                title={t('No color')}
                bsStyle="warning"
                onClick={() => chooseCardColor(null)}
              >
                <Glyphicon glyph="ban-circle" />
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <PlottrModal isOpen={true} onRequestClose={saveAndClose} style={modalStyles}>
        {renderDelete()}
        {renderRemoveTemplate()}
        {renderTemplatePicker()}
        <div className={cx('card-dialog', { darkmode: darkMode })}>
          <div className="card-dialog__body">
            {renderLeftSide()}
            <div className="card-dialog__description">
              {renderTitle()}
              <Tabs
                activeKey={activeTab}
                id="tabs"
                className="card-dialog__tabs"
                onSelect={selectTab}
                onTabDragOver={handleTabDragOver}
                onDrop={handleDropTab}
              >
                <Tab eventKey={1} title={t('Description')}>
                  <CardDescriptionEditor cardId={cardId} />
                </Tab>
                <Tab eventKey={2} title={t('Attributes')}>
                  <a
                    href="#"
                    className="card-dialog__custom-attributes-configuration-link"
                    onClick={uiActions.openAttributesDialog}
                    draggable={false}
                  >
                    {t('Configure')}
                  </a>
                  {renderEditingCustomAttributes()}
                </Tab>
                {renderEditingTemplates()}
                {!templatesDisabled && <Tab eventKey="new" title={t('+ Add Template')}></Tab>}
              </Tabs>
            </div>
          </div>
          {renderButtonBar()}
        </div>
      </PlottrModal>
    )
  }

  CardDialog.propTypes = {
    cardMetaData: PropTypes.object.isRequired,
    cardId: PropTypes.number.isRequired,
    beatId: PropTypes.number.isRequired,
    lineId: PropTypes.number.isRequired,
    closeDialog: PropTypes.func,
    lines: PropTypes.array.isRequired,
    beats: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
    tags: PropTypes.array.isRequired,
    characters: PropTypes.array.isRequired,
    places: PropTypes.array.isRequired,
    darkMode: PropTypes.bool,
    books: PropTypes.object.isRequired,
    isSeries: PropTypes.bool.isRequired,
    getTemplateById: PropTypes.func.isRequired,
    customAttributes: PropTypes.array.isRequired,
    uiActions: PropTypes.object.isRequired,
    notificationActions: PropTypes.object.isRequired,
    characterBookCategories: PropTypes.array.isRequired,
    currentTimeline: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    destinationLineId: PropTypes.func,
    destinationBeatId: PropTypes.func,
    click: PropTypes.object,
    deleting: PropTypes.bool,
    showColorPicker: PropTypes.bool,
    showTemplatePicker: PropTypes.bool,
    removing: PropTypes.bool,
    removeWhichTemplate: PropTypes.number,
    activeTab: PropTypes.number.isRequired,
    foci: PropTypes.array.isRequired,
  }

  const MemoizedCardDialog = React.memo(CardDialog)

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
          cardMetaData: selectors.cardMetaDataSelector(state, ownProps.cardId),
          beats: selectors.visibleSortedBeatsByBookIgnoringCollapsedSelector(state),
          lines: selectors.sortedLinesByBookSelector(state),
          tags: selectors.sortedTagsSelector(state),
          characters: selectors.charactersSortedAtoZSelector(state),
          characterBookCategories: selectors.characterBookCategoriesSelector(state),
          places: selectors.placesSortedAtoZSelector(state),
          customAttributes: selectors.cardsCustomAttributesSelector(state),
          darkMode: selectors.isDarkModeSelector(state),
          books: selectors.allBooksSelector(state),
          isSeries: selectors.isSeriesSelector(state),
          currentTimeline: selectors.currentTimelineSelector(state),
          getTemplateById: selectors.templateByIdFnSelector(state),
          destinationLineId: selectors.firstLineForBookThunkSelector(state),
          destinationBeatId: selectors.firstVisibleBeatForBookThunkSelector(state),
          click: selectors.lastClickSelector(state),
          deleting: selectors.isCardDialogDeletingSelector(state),
          showColorPicker: selectors.isCardDialogColorPickerOpenSelector(state),
          showTemplatePicker: selectors.isCardDialogTemplatePickerOpenSelector(state),
          removing: selectors.isCardDialogTemplateBeingRemoved(state),
          removeWhichTemplate: selectors.whichTemplateIsBeingRemovedViaCardDialogSelector(state),
          activeTab: selectors.cardDialogTabSelector(state),
          foci: selectors.timelineCurrentFocusSelector(state),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.card, dispatch),
          uiActions: bindActionCreators(actions.ui, dispatch),
          notificationActions: bindActionCreators(actions.notifications, dispatch),
        }
      }
    )(MemoizedCardDialog)
  }

  throw new Error('Could not connect CardDialog')
}

export default CardDialogConnector
