import React, { useEffect, useState, useRef, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cx from 'classnames'

import { selectors, actions } from 'wired-up-pltr'
import { t as i18n } from 'plottr_locales'
import { newIds } from 'pltr'

import Grid from '../Grid'
import Alert from '../Alert'
import NavItem from '../NavItem'
import Nav from '../Nav'
import Popover from '../PlottrPopover'
import Glyphicon from '../Glyphicon'
import Col from '../Col'
import Row from '../Row'
import FormControl from '../FormControl'
import Button from '../Button'
import PlottrFloater from '../PlottrFloater'
import NoteView from './NoteView'
import ErrorBoundary from '../containers/ErrorBoundary'
import CustomAttrFilterList from '../CustomAttrFilterList'
import SubNav from '../containers/SubNav'
import NoteItem from './NoteItem'
import CustomAttributeModal from '../dialogs/CustomAttributeModal'
import NoteCategoriesModal from './NoteCategoriesModal'
import SortList from '../SortList'
import ExportNavItem from '../export/ExportNavItem'
import { withEventTargetValue } from '../withEventTargetValue'
import { PlottrComponentsContext } from '../../connections/pltrContext'

const { nextId } = newIds

const detailID = (notesByCategory, notes, categories, noteDetailId) => {
  if (!notes.length) return null
  if (!Object.keys(notesByCategory).length) return null
  const allCategories = [...categories, { id: null }] // uncategorized

  // check for the currently active one
  if (noteDetailId != null) {
    const isVisible = allCategories.some((cat) => {
      if (!notesByCategory[cat.id] || !notesByCategory[cat.id].length) return false
      return notesByCategory[cat.id].some((note) => note.id == noteDetailId)
    })
    if (isVisible) return noteDetailId
  }

  // default to first one in the first category
  const firstCategoryWithNote = allCategories.find(
    (cat) => notesByCategory[cat.id] && notesByCategory[cat.id].length
  )
  if (firstCategoryWithNote)
    return (
      notesByCategory[firstCategoryWithNote.id][0] &&
      notesByCategory[firstCategoryWithNote.id][0].id
    )

  return null
}

const NoteListView = ({
  categories,
  visibleNotesByCategory,
  notes,
  actions,
  darkMode,
  selectedNoteId,
  uiActions,
  undo,
  filterIsEmpty,
  noteSort,
  notesSearchTerm,
  editingSelected,
  categoriesDialogOpen,
  attributesDialogOpen,
  filterVisible,
  sortVisible,
  isJumping,
  recentlyUndidOrRedid,
}) => {
  const {
    platform: { exportDisabled },
  } = useContext(PlottrComponentsContext)

  const [draggedNote, setDraggedNote] = useState(null)
  const [isMovingToNewCategory, setMovingToNewCategory] = useState(false)

  const recentlyUndidOrRedidRef = useRef(false)
  useEffect(() => {
    recentlyUndidOrRedidRef.current = !!recentlyUndidOrRedid
  }, [recentlyUndidOrRedid])

  useEffect(() => {
    if (!isJumping && !recentlyUndidOrRedidRef.current) {
      const noteToJumpTo = detailID(visibleNotesByCategory, notes, categories, selectedNoteId)
      if (noteToJumpTo !== selectedNoteId) {
        uiActions.selectNote(noteToJumpTo)
      }
    }
  }, [notes, visibleNotesByCategory, categories])

  const handleCreateNewNote = () => {
    const id = nextId(notes)
    undo.batch('Create new note', () => {
      actions.addNote()
      uiActions.selectNote(id)
      uiActions.startEditingSelectedNote()
    })
  }

  const startEditing = () => {
    uiActions.startEditingSelectedNote()
  }

  const stopEditing = () => {
    uiActions.finishEditingSelectedNote()
  }

  const closeDialog = () => {
    undo.batch('Close Notes Categories', () => {
      uiActions.hideNotesCategoryDialog()
      uiActions.hideNotesAttributesDialog()
    })
  }

  const renderCustomAttributes = () => {
    if (!attributesDialogOpen) return null

    return <CustomAttributeModal type="notes" closeDialog={closeDialog} hideSaveAsTemplate />
  }

  const renderCategoriesModal = () => {
    if (!categoriesDialogOpen) return null
    return <NoteCategoriesModal closeDialog={closeDialog} />
  }

  const handleDragStart = (e, note) => {
    setDraggedNote(note)
  }

  const handleDragOver = (e, noteCategory) => {
    e.preventDefault()
    // @ts-ignore
    if (noteCategory !== draggedNote?.categoryId) {
      setMovingToNewCategory(true)
    } else {
      setMovingToNewCategory(false)
    }
  }

  const handleDrop = () => {
    setDraggedNote(null)
  }

  const renderVisibleNotes = (categoryId, startingIndex) => {
    const notes =
      categoryId === null
        ? [
            ...(visibleNotesByCategory['null'] || []),
            ...(visibleNotesByCategory['undefined'] || []),
          ]
        : visibleNotesByCategory[categoryId]

    if (!notes) return []

    return notes.map((n, idx) => {
      return (
        <div
          key={n.id}
          onDragOver={(e) => handleDragOver(e, n.categoryId)}
          onDragStart={(e) => handleDragStart(e, { ...n, position: startingIndex + idx })}
          onDrop={handleDrop}
        >
          <NoteItem
            editing={editingSelected}
            key={n.id}
            note={n}
            absolutePosition={startingIndex + idx}
            selected={n.id == selectedNoteId}
            startEdit={startEditing}
            stopEdit={stopEditing}
            select={() => uiActions.selectNote(n.id)}
            draggedPosition={
              // @ts-ignore
              Number.isInteger(draggedNote?.position) ? Number(draggedNote.position) : null
            }
            isMovingToNewCategory={isMovingToNewCategory}
          />
        </div>
      )
    })
  }

  const renderNotes = () => {
    let startingIndex = 0
    return [...categories, { id: null, name: i18n('Uncategorized') }].map((cat) => {
      const result = renderCategory(cat, startingIndex)
      startingIndex += (visibleNotesByCategory[cat.id] || []).length
      return result
    })
  }

  const renderCategory = (category, startingIndex) => {
    const notesInCategory = renderVisibleNotes(category.id, startingIndex)
    if (!notesInCategory.length) return null
    return (
      <div key={`category-${category.id}`}>
        <h2 className="note-list__category-title">{category.name}</h2>
        <div className={cx('note-list__list', 'list-group', { darkmode: darkMode })}>
          {notesInCategory}
        </div>
      </div>
    )
  }

  const renderNoteDetails = () => {
    let note = notes.find((n) => n.id === selectedNoteId)
    if (!note) return null
    return (
      <ErrorBoundary>
        <NoteView
          key={`note-${note.id}`}
          noteId={note.id}
          editing={editingSelected}
          stopEditing={stopEditing}
          startEditing={startEditing}
        />
      </ErrorBoundary>
    )
  }

  const insertSpace = (event) => {
    const currentValue = event.target.value
    const start = event.target.selectionStart
    const end = event.target.selectionEnd
    if (event.key === ' ') {
      uiActions.setNotesSearchTerm(currentValue.slice(0, start) + ' ' + currentValue.slice(end + 1))
    }
    event.preventDefault()
    event.stopPropagation()
  }

  const renderSubNav = () => {
    const popover = () => (
      <Popover id="filter" noMaxWidth>
        <CustomAttrFilterList type="notes" />
      </Popover>
    )
    let filterDeclaration = (
      <Alert onClick={() => uiActions.setNoteFilter(null)} bsStyle="warning">
        <Glyphicon glyph="remove-sign" />
        {'  '}
        {i18n('Notes are filtered')}
      </Alert>
    )

    if (filterIsEmpty) {
      filterDeclaration = <span></span>
    }

    const sortPopover = () => (
      <Popover id="sort">
        <SortList type={'notes'} />
      </Popover>
    )
    let sortGlyph = 'sort-by-attributes'
    if (noteSort.includes('~desc')) sortGlyph = 'sort-by-attributes-alt'

    return (
      <SubNav>
        <Nav bsStyle="pills">
          <NavItem>
            <Button bsSize="small" onClick={handleCreateNewNote}>
              <Glyphicon glyph="plus" /> {i18n('New')}
            </Button>
          </NavItem>
          <NavItem>
            <Button bsSize="small" onClick={uiActions.showNotesAttributesDialog}>
              <Glyphicon glyph="list" /> {i18n('Attributes')}
            </Button>
          </NavItem>
          <NavItem>
            <Button bsSize="small" onClick={uiActions.showNotesCategoryDialog}>
              <Glyphicon glyph="list" /> {i18n('Categories')}
            </Button>
          </NavItem>
          <NavItem>
            <PlottrFloater
              rootClose
              open={filterVisible}
              onClose={uiActions.hideNotesFilterList}
              placement="bottom"
              component={popover}
            >
              <Button
                bsSize="small"
                onClick={() => {
                  if (!filterVisible) {
                    uiActions.showNotesFilterList()
                  } else {
                    uiActions.hideNotesFilterList()
                  }
                }}
              >
                <Glyphicon glyph="filter" /> {i18n('Filter')}
              </Button>
            </PlottrFloater>
            {filterDeclaration}
          </NavItem>
          <NavItem>
            <PlottrFloater
              rootClose
              open={sortVisible}
              onClose={uiActions.hideNotesSort}
              placement="bottom"
              component={sortPopover}
            >
              <Button
                bsSize="small"
                onClick={() => {
                  if (!sortVisible) {
                    uiActions.showNotesSort()
                  } else {
                    uiActions.hideNotesSort()
                  }
                }}
              >
                <Glyphicon glyph={sortGlyph} /> {i18n('Sort')}
              </Button>
            </PlottrFloater>
          </NavItem>
          <NavItem draggable="false">
            <FormControl
              onChange={withEventTargetValue(uiActions.setNotesSearchTerm)}
              onKeyUp={insertSpace}
              value={notesSearchTerm || ''}
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

  return (
    <div className="note-list container-with-sub-nav">
      {renderSubNav()}
      {renderCustomAttributes()}
      {renderCategoriesModal()}
      <Grid fluid className="tab-body">
        <Row>
          <Col sm={3} onDoubleClick={stopEditing}>
            <h1 className={cx('secondary-text', { darkmode: darkMode })}>
              {i18n('Notes')}{' '}
              <Button onClick={handleCreateNewNote}>
                <Glyphicon glyph="plus" />
              </Button>
            </h1>
            <div className="note-list__category-list">{renderNotes()}</div>
          </Col>
          <Col sm={9}>{renderNoteDetails()}</Col>
        </Row>
      </Grid>
    </div>
  )
}

NoteListView.propTypes = {
  categories: PropTypes.array.isRequired,
  visibleNotesByCategory: PropTypes.object.isRequired,
  notes: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  darkMode: PropTypes.bool,
  uiActions: PropTypes.object.isRequired,
  undo: PropTypes.object.isRequired,
  filterIsEmpty: PropTypes.bool.isRequired,
  noteSort: PropTypes.string.isRequired,
  notesSearchTerm: PropTypes.string,
  selectedNoteId: PropTypes.number,
  editingSelected: PropTypes.bool,
  categoriesDialogOpen: PropTypes.bool,
  attributesDialogOpen: PropTypes.bool,
  filterVisible: PropTypes.bool,
  sortVisible: PropTypes.bool,
  isJumping: PropTypes.bool,
  recentlyUndidOrRedid: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
}

const mapStateToProps = (state) => {
  return {
    notes: selectors.allNotesSelector(state),
    darkMode: selectors.isDarkModeSelector(state),
    categories: selectors.sortedNoteCategoriesSelector(state),
    visibleNotesByCategory: selectors.visibleSortedSearchedNotesByCategorySelector(state),
    filterIsEmpty: selectors.noteFilterIsEmptySelector(state),
    customAttributes: selectors.characterCustomAttributesSelector(state),
    noteSort: selectors.noteSortSelector(state),
    notesSearchTerm: selectors.notesSearchTermSelector(state),
    selectedNoteId: selectors.selectedNoteSelector(state),
    editingSelected: selectors.editingSelectedNoteSelector(state),
    categoriesDialogOpen: selectors.noteCategoriesDialogOpenSelector(state),
    attributesDialogOpen: selectors.noteAttributesDialogOpenSelector(state),
    filterVisible: selectors.noteFilterVisibleSelector(state),
    sortVisible: selectors.noteSortVisibleSelector(state),
    isJumping: selectors.isJumpingSelector(state),
    recentlyUndidOrRedid: selectors.recentlyUndidOrRedidSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    actions: bindActionCreators(actions.note, dispatch),
    uiActions: bindActionCreators(actions.ui, dispatch),
    undo: bindActionCreators(actions.undo, dispatch),
  }
})(NoteListView)
