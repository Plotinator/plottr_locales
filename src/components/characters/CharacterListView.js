import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'

import { t } from 'plottr_locales'
import { newIds, helpers } from 'pltr/v2'

import Grid from '../Grid'
import Alert from '../Alert'
import NavItem from '../NavItem'
import Nav from '../Nav'
import ButtonGroup from '../ButtonGroup'
import Popover from '../PlottrPopover'
import Glyphicon from '../Glyphicon'
import Col from '../Col'
import Row from '../Row'
import FormControl from '../FormControl'
import Button from '../Button'
import CustomAttrFilterListConnector from '../CustomAttrFilterList'
import UnconnectedSortList from '../SortList'
import CharacterViewConnector from './CharacterView'
import UnconnectedCustomAttributeModal from '../dialogs/CustomAttributeModal'
import CharacterCategoriesModalConnector from './CharacterCategoriesModal'
import InputModal from '../dialogs/InputModal'
import CharacterItemConnector from './CharacterItem'
import TemplatePickerConnector from '../templates/TemplatePicker'
import UnconnectedExportNavItem from '../export/ExportNavItem'
import SubNavConnector from '../containers/SubNav'
import UnconnectedFloater from '../PlottrFloater'
import { checkDependencies } from '../checkDependencies'
import { withEventTargetValue } from '../withEventTargetValue'
import Tabs from '../Tabs'
import Tab from '../Tab'

const { nextIdAcrossCategories } = newIds
const {
  card: { truncateTitle },
} = helpers

const selectedId = (charactersByCategory, categories, characterDetailId) => {
  if (!Object.keys(charactersByCategory).length) return null
  const allCategories = [...categories, { id: null }] // uncategorized

  // check for the currently active one
  if (characterDetailId != null) {
    const isVisible = allCategories.some((cat) => {
      if (!charactersByCategory[cat.id] || !charactersByCategory[cat.id].length) return false
      return charactersByCategory[cat.id].some((ch) => ch.id == characterDetailId)
    })
    if (isVisible) return characterDetailId
  }

  // default to first one in the first category
  const firstCategoryWithChar = allCategories.find(
    (cat) => charactersByCategory[cat.id] && charactersByCategory[cat.id].length
  )
  if (firstCategoryWithChar)
    return (
      charactersByCategory[firstCategoryWithChar.id][0] &&
      charactersByCategory[firstCategoryWithChar.id][0].id
    )

  return null
}

const CharacterListViewConnector = (connector) => {
  const CustomAttributeModal = UnconnectedCustomAttributeModal(connector)
  const SortList = UnconnectedSortList(connector)
  const CustomAttrFilterList = CustomAttrFilterListConnector(connector)
  const CharacterView = CharacterViewConnector(connector)
  const CharacterItem = CharacterItemConnector(connector)
  const TemplatePicker = TemplatePickerConnector(connector)
  const CharacterCategoriesModal = CharacterCategoriesModalConnector(connector)
  const SubNav = SubNavConnector(connector)
  const Floater = UnconnectedFloater(connector)
  const ExportNavItem = UnconnectedExportNavItem(connector)

  const {
    platform: { templatesDisabled, exportDisabled },
  } = connector

  checkDependencies({ templatesDisabled, exportDisabled })

  const CharacterListView = ({
    visibleCharactersByCategory,
    filterIsEmpty,
    categories,
    customAttributes,
    characterSort,
    darkMode,
    charactersSearchTerm,
    books,
    attributeTabId,
    selectedCharacteId,
    showTabs,
    attributesDialogOpen,
    categoriesDialogOpen,
    editingSelected,
    showTemplatePicker,
    creating,
    templateData,
    filterVisible,
    sortVisible,
    detailsVisible,
    actions,
    uiActions,
  }) => {
    const [isMovingToNewCategory, setMovingToNewCategory] = useState(false)
    const [draggedCharacter, setDraggedCharacter] = useState()

    useEffect(() => {
      const id = selectedId(visibleCharactersByCategory, categories, selectedCharacteId)
      if (id !== selectedCharacteId) {
        uiActions.selectCharacter(id)
      }
    }, [visibleCharactersByCategory, categories])

    const editSelected = () => {
      uiActions.startEditingSelectedCharacter()
    }

    const stopEditing = () => {
      uiActions.finishEditingSelectedCharacter()
    }

    const closeDialog = () => {
      uiActions.hideCharactersAttributesDialog()
      uiActions.hideCharactersCategoryDialog()
    }

    const handleCreateNewCharacter = () => {
      actions.addCharacter()
      uiActions.startEditingSelectedCharacter()
    }

    const handleChooseTemplate = (templateData) => {
      // going back to old way (without modal) to think it over
      const id = nextIdAcrossCategories(visibleCharactersByCategory)
      actions.addCharacterWithTemplate(null, templateData)
      uiActions.setCharacterTemplateData(templateData)
      uiActions.selectCharacter(id)
      uiActions.startEditingSelectedCharacter()
      uiActions.hideCharactersTemplatePicker()
    }

    const handleFinishCreate = (name) => {
      const id = nextIdAcrossCategories(visibleCharactersByCategory)
      if (templateData) {
        actions.addCharacterWithTemplate(name, templateData)
      } else {
        actions.addCharacter(name)
      }

      uiActions.finishEditingSelectedCharacter()
      uiActions.setCharacterTemplateData(null)
      uiActions.selectCharacter(id)
      uiActions.finishEditingSelectedCharacter()
    }

    const renderCreateInput = () => {
      if (!creating) return null

      return (
        <InputModal
          title={t('Name')}
          getValue={handleFinishCreate}
          cancel={uiActions.finishCreatingCharacter}
          isOpen={true}
          type="text"
        />
      )
    }

    const insertSpace = (event) => {
      const currentValue = event.target.value
      const start = event.target.selectionStart
      const end = event.target.selectionEnd
      if (event.key === ' ') {
        uiActions.setCharactersSearchTerm(
          currentValue.slice(0, start) + ' ' + currentValue.slice(end + 1)
        )
      }
      event.preventDefault()
      event.stopPropagation()
    }

    const handleDragStart = (e, character) => {
      setDraggedCharacter(character)
    }

    const handleDragOver = (e, characterCategory) => {
      e.preventDefault()
      if (characterCategory !== draggedCharacter) {
        setMovingToNewCategory(true)
      } else {
        setMovingToNewCategory(false)
      }
    }

    const handleDrop = () => {
      setDraggedCharacter()
    }

    const renderSubNav = () => {
      const filterPopover = () => (
        <Popover id="filter" noMaxWidth>
          <CustomAttrFilterList type="characters" />
        </Popover>
      )
      let filterDeclaration = (
        <Alert onClick={() => uiActions.setCharacterFilter(null)} bsStyle="warning">
          <Glyphicon glyph="remove-sign" />
          {'  '}
          {t('Character list is filtered')}
        </Alert>
      )
      if (filterIsEmpty) {
        filterDeclaration = <span></span>
      }
      const sortPopover = () => (
        <Popover id="sort">
          <SortList type={'characters'} />
        </Popover>
      )
      let sortGlyph = 'sort-by-attributes'
      if (characterSort.includes('~desc')) sortGlyph = 'sort-by-attributes-alt'
      return (
        <SubNav>
          <Nav bsStyle="pills">
            <NavItem>
              <ButtonGroup>
                <Button bsSize="small" onClick={handleCreateNewCharacter}>
                  <Glyphicon glyph="plus" /> {t('New')}
                </Button>
                <Button
                  disabled={templatesDisabled}
                  bsSize="small"
                  onClick={uiActions.showCharactersTemplatePicker}
                >
                  {t('Use Template')}
                </Button>
              </ButtonGroup>
            </NavItem>
            <NavItem>
              <Button bsSize="small" onClick={uiActions.showCharactersAttributesDialog}>
                <Glyphicon glyph="list" /> {t('Attributes')}
              </Button>
            </NavItem>
            <NavItem>
              <Button bsSize="small" onClick={uiActions.showCharactersCategoryDialog}>
                <Glyphicon glyph="list" /> {t('Categories')}
              </Button>
            </NavItem>
            <NavItem>
              <Floater
                trigger="click"
                rootClose
                open={filterVisible}
                onClose={uiActions.hideCharacterFilter}
                placement="bottom"
                component={filterPopover}
              >
                <Button
                  bsSize="small"
                  onClick={() => {
                    if (!filterVisible) {
                      uiActions.showCharacterFilter()
                    } else {
                      uiActions.hideCharacterFilter()
                    }
                  }}
                >
                  <Glyphicon glyph="filter" /> {t('Filter')}
                </Button>
              </Floater>
              {filterDeclaration}
            </NavItem>
            <NavItem>
              <Floater
                trigger="click"
                open={sortVisible}
                onClose={uiActions.showCharacterSort}
                rootClose
                placement="bottom"
                component={sortPopover}
              >
                <Button
                  bsSize="small"
                  onClick={() => {
                    if (!sortVisible) {
                      uiActions.showCharacterSort()
                    } else {
                      uiActions.hideCharacterSort()
                    }
                  }}
                >
                  <Glyphicon glyph={sortGlyph} /> {t('Sort')}
                </Button>
              </Floater>
            </NavItem>
            <NavItem draggable="false">
              <FormControl
                onChange={withEventTargetValue(uiActions.setCharactersSearchTerm)}
                onKeyUp={insertSpace}
                value={charactersSearchTerm || ''}
                type="text"
                placeholder="Search"
                className="toolbar__search"
              />
            </NavItem>
          </Nav>
          {!exportDisabled && (
            <Nav pullRight>
              <ExportNavItem />
            </Nav>
          )}
        </SubNav>
      )
    }

    const renderVisibleCharacters = (categoryId, startingIndex) => {
      if (!visibleCharactersByCategory[categoryId]) return []

      return visibleCharactersByCategory[categoryId].map((ch, idx) => {
        return (
          <div
            key={ch.id}
            onDragOver={(e) => handleDragOver(e, ch.categoryId)}
            onDragStart={(e) => handleDragStart(e, { ...ch, position: idx + startingIndex })}
            onDrop={handleDrop}
          >
            <CharacterItem
              key={ch.id}
              absolutePosition={idx + startingIndex}
              characterId={ch.id}
              selected={ch.id == selectedCharacteId}
              startEdit={editSelected}
              stopEdit={stopEditing}
              editing={editingSelected}
              select={() => uiActions.selectCharacter(ch.id)}
              isMovingToNewCategory={isMovingToNewCategory}
              draggedPosition={
                Number.isInteger(draggedCharacter?.position)
                  ? Number(draggedCharacter.position)
                  : null
              }
            />
          </div>
        )
      })
    }

    const renderCategory = (category, startingIndex) => {
      const charactersInCategory = renderVisibleCharacters(category.id, startingIndex)
      if (!charactersInCategory.length) return null
      return (
        <div key={`category-${category.id}`}>
          <h2 className="character-list__category-title">{category.name}</h2>
          <div
            className={cx('character-list__list', 'list-group', {
              darkmode: darkMode,
            })}
          >
            {charactersInCategory}
          </div>
        </div>
      )
    }

    const renderCharacters = () => {
      let startingIndex = 0
      return [...categories, { id: null, name: t('Uncategorized') }].map((cat) => {
        const result = renderCategory(cat, startingIndex)
        startingIndex += (visibleCharactersByCategory[cat.id] || []).length
        return result
      })
    }

    const renderCharacterDetails = () => {
      if (!detailsVisible) return null

      if (!selectedCharacteId) return null

      return (
        <CharacterView
          key={`character-${selectedCharacteId}`}
          characterId={selectedCharacteId}
          editing={editingSelected}
          stopEditing={stopEditing}
          startEditing={editSelected}
          openAttributes={uiActions.showCharactersAttributesDialog}
        />
      )
    }

    const renderCustomAttributes = () => {
      if (!attributesDialogOpen) return null

      return <CustomAttributeModal type="characters" closeDialog={closeDialog} />
    }

    const renderCategoriesModal = () => {
      if (!categoriesDialogOpen) return null

      return <CharacterCategoriesModal closeDialog={closeDialog} />
    }

    const renderTemplatePicker = () => {
      if (!showTemplatePicker) return null

      return (
        <TemplatePicker
          modal={true}
          types={['characters']}
          isOpen={showTemplatePicker}
          close={uiActions.hideCharactersTemplatePicker}
          onChooseTemplate={handleChooseTemplate}
          canMakeCharacterTemplates={!!customAttributes.length}
        />
      )
    }

    return (
      <div className="character-list container-with-sub-nav">
        {renderSubNav()}
        {renderCustomAttributes()}
        {renderCategoriesModal()}
        {renderTemplatePicker()}
        {renderCreateInput()}
        <Grid fluid className="tab-body">
          <Row>
            <Col sm={3} onDoubleClick={stopEditing}>
              <h1 className={cx('secondary-text', { darkmode: darkMode })}>
                {t('Characters')}{' '}
                <Button onClick={handleCreateNewCharacter}>
                  <Glyphicon glyph="plus" />
                </Button>
              </h1>
              <div className="character-list__category-list">{renderCharacters()}</div>
            </Col>
            <Col sm={9}>
              {showTabs ? (
                <div className="item-list__book-tabs-wrapper">
                  <Tabs
                    bsStyle="pills"
                    activeKey={attributeTabId}
                    onSelect={(key) => {
                      uiActions.selectCharacterAttributeBookTab(key)
                    }}
                    id="book-chooser"
                    style={{ marginBottom: '16px' }}
                  >
                    <Tab eventKey={'all'} title={t('Series')}></Tab>
                    {books.map((book, index) => {
                      if (Array.isArray(book)) {
                        return null
                      }
                      const title = (book.title && truncateTitle(book.title, 40)) || t('Untitled')
                      return <Tab key={index} eventKey={book.id} title={title}></Tab>
                    })}
                  </Tabs>
                </div>
              ) : null}
              {renderCharacterDetails()}
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }

  CharacterListView.propTypes = {
    visibleCharactersByCategory: PropTypes.object.isRequired,
    filterIsEmpty: PropTypes.bool.isRequired,
    categories: PropTypes.array.isRequired,
    customAttributes: PropTypes.array.isRequired,
    characterSort: PropTypes.string,
    darkMode: PropTypes.bool,
    charactersSearchTerm: PropTypes.string,
    books: PropTypes.array.isRequired,
    selectedCharacteId: PropTypes.number,
    showTabs: PropTypes.bool,
    attributesDialogOpen: PropTypes.bool,
    categoriesDialogOpen: PropTypes.bool,
    editingSelected: PropTypes.bool,
    showTemplatePicker: PropTypes.bool,
    creating: PropTypes.bool,
    templateData: PropTypes.any,
    filterVisible: PropTypes.bool,
    sortVisible: PropTypes.bool,
    detailsVisible: PropTypes.bool,
    attributeTabId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    actions: PropTypes.object.isRequired,
    uiActions: PropTypes.object.isRequired,
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector

  checkDependencies({
    redux,
    actions,
    selectors,
  })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          visibleCharactersByCategory:
            selectors.visibleSortedSearchedCharacterMetadataByCategorySelector(state),
          filterIsEmpty: selectors.characterFilterIsEmptySelector(state),
          categories: selectors.sortedCharacterCategoriesSelector(state),
          customAttributes: selectors.characterCustomAttributesSelector(state),
          characterSort: selectors.characterSortSelector(state),
          darkMode: selectors.isDarkModeSelector(state),
          charactersSearchTerm: selectors.charactersSearchTermSelector(state),
          books: selectors.allBooksWithCharactersInThemSortedByPositionInAllBookIdsSelector(state),
          attributeTabId: selectors.characterAttributeTabSelector(state),
          selectedCharacteId: selectors.selectedCharacterSelector(state),
          showTabs: selectors.showBookTabsSelector(state),
          attributesDialogOpen: selectors.characterAttributesDialogOpenSelector(state),
          categoriesDialogOpen: selectors.characterCategoriesDialogOpenSelector(state),
          editingSelected: selectors.editingSelectedCharacterSelector(state),
          showTemplatePicker: selectors.characterTemplatePickerVisibleSelector(state),
          creating: selectors.creatingCharacterSelector(state),
          templateData: selectors.characterTemplateDataSelector(state),
          filterVisible: selectors.characterFilterVisibleSelector(state),
          sortVisible: selectors.characterSortVisibleSelector(state),
          detailsVisible: selectors.characterDetailsVisible(state),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.character, dispatch),
          uiActions: bindActionCreators(actions.ui, dispatch),
        }
      }
    )(CharacterListView)
  }

  throw new Error('Could not connect CharacterListView')
}

export default CharacterListViewConnector
