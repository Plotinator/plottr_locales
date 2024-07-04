import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Cell } from 'react-sticky-table'
import cx from 'classnames'
import { FaBook } from '@react-icons/all-files/fa/FaBook'
import { FaExpandAlt } from '@react-icons/all-files/fa/FaExpandAlt'
import { FaCompressAlt } from '@react-icons/all-files/fa/FaCompressAlt'
import { FiCopy } from '@react-icons/all-files/fi/FiCopy'
import { BsPinFill } from '@react-icons/all-files/bs/BsPinFill'
import { TbPinnedOff } from '@react-icons/all-files/tb/TbPinnedOff'

import { selectors, actions } from 'wired-up-pltr'
import { helpers } from 'pltr'
import { t } from 'plottr_locales'

import Floater from '../PlottrFloater'
import DropdownButton from '../DropdownButton'
import MenuItem from '../MenuItem'
import ButtonGroup from '../ButtonGroup'
import Glyphicon from '../Glyphicon'
import ControlLabel from '../ControlLabel'
import FormGroup from '../FormGroup'
import FormControl from '../FormControl'
import Button from '../Button'
import ColorPicker from '../ColorPicker'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import InputModal from '../dialogs/InputModal'
import ToolTip from '../ToolTip'

const {
  card: { truncateTitle },
  orientedClassName: { orientedClassName },
} = helpers

const formatTitle = (lineTitle) => {
  return truncateTitle(lineTitle?.match(/[{}]/) ? lineTitle : t(lineTitle), 50)
}

const LineTitleCell = ({
  line,
  bookId,
  handleReorder,
  darkMode,
  orientation,
  timelineIsExpanded,
  isSmall,
  isMedium,
  lineIsExpanded,
  actions,
  uiActions,
  notifications,
  books,
  zIndex,
  editing,
  timelineFoci,
  allHierarchyLevels,
  currentTimeline,
  togglePinPlotline,
  undo,
  recentlyUndidOrRedid,
}) => {
  const [hovering, setHovering] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [inDropZone, setInDropZone] = useState(false)
  const [dropDepth, setDropDepth] = useState(0)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [movingLine, setMovingLine] = useState(false)
  const [supressScroll, setSuppressScroll] = useState(false)

  const hoverTimeout = useRef(null)
  const titleInputRef = useRef()
  const bookChoiceDropDown = useRef()
  const titleCellRef = useRef()

  const recentlyUndidOrRedidRef = useRef(false)
  useEffect(() => {
    recentlyUndidOrRedidRef.current = !!recentlyUndidOrRedid
  }, [recentlyUndidOrRedid])

  useEffect(() => {
    if (titleCellRef.current && zIndex) {
      const wrapperDiv = titleCellRef.current
      if (wrapperDiv) {
        // @ts-ignore
        wrapperDiv.style.zIndex = zIndex
        if (orientation !== 'vertical') {
          // @ts-ignore
          wrapperDiv.style.position = 'sticky'
        }
      }
    }
  }, [zIndex])

  useEffect(() => {
    if (movingLine && bookChoiceDropDown.current) {
      // @ts-ignore
      const dropDownId = bookChoiceDropDown.current.props.id
      const dropDown = document.querySelector(`#${dropDownId}`)
      // @ts-ignore
      if (typeof dropDown?.focus === 'function') {
        // @ts-ignore
        dropDown.focus()
      }
    }
  }, [movingLine])

  const startEditing = () => {
    if (!movingLine) {
      setSuppressScroll(true)
      uiActions.startEditingPlotlineHeadingTitle(line.id)
    }
  }

  useEffect(() => {
    if (!editing && line.title === '' && !recentlyUndidOrRedidRef.current) {
      startEditing()
    }
  }, [])

  const deleteLine = (e) => {
    e.stopPropagation()
    actions.deleteLine(line.id)
  }

  const cancelDelete = (e) => {
    e.stopPropagation()
    setDeleting(false)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    setDeleting(true)
    setHovering(false)
  }

  const editTitle = () => {
    const ref = titleInputRef.current
    if (!ref) return
    // @ts-ignore
    finalizeEdit(ref)
  }

  const finalizeEdit = (newVal) => {
    const id = line.id
    undo.batch(`Edit Line Title ${newVal}`, () => {
      actions.editLineTitle(id, newVal)
      uiActions.stopEditingPlotlineHeadingTitle()
    })
    setMovingLine(false)
    setHovering(false)
    setSuppressScroll(false)
  }

  const handleFinishEditingTitle = (event) => {
    if (event.which === 13) {
      editTitle()
    }
  }

  const handleBlur = (event) => {
    if (
      titleInputRef.current &&
      // @ts-ignore
      titleInputRef.current.value !== ''
    ) {
      editTitle()
      uiActions.stopEditingPlotlineHeadingTitle()
      setHovering(false)
    }
    if (!event.relatedTarget || event.relatedTarget.attributes?.role?.value !== 'menuitem') {
      setMovingLine(false)
    }
  }

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/json', JSON.stringify({ line, isLine: true }))
    setDragging(true)
  }

  const handleDragEnd = () => {
    setDragging(false)
  }

  const handleDragEnter = (_e) => {
    if (!dragging) setDropDepth(dropDepth + 1)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!dragging) {
      setInDropZone(true)
    }
  }

  const handleDragLeave = (_e) => {
    if (!dragging) {
      let newDropDepth = dropDepth
      --newDropDepth
      setDropDepth(newDropDepth)
      if (newDropDepth > 0) return
      setInDropZone(false)
    }
  }

  const handleDrop = (e) => {
    e.stopPropagation()
    setInDropZone(false)
    setDropDepth(0)

    const json = e.dataTransfer.getData('text/json')
    const payload = helpers.json.safeParseJSON(json)

    if (payload !== null) {
      const droppedLine = payload.line
      if (!payload.isLine) {
        return
      } else {
        handleReorder(line.position, droppedLine.position)
      }
    }
  }

  const handlePinPlotLine = () => {
    togglePinPlotline(line)
  }

  const handleEsc = (event) => {
    if (event.which === 27) {
      uiActions.stopEditingPlotlineHeadingTitle()
      setMovingLine(false)
    }
  }

  const changeColor = (newColor) => {
    if (newColor) {
      actions.editLineColor(line.id, newColor)
    }
    setShowColorPicker(false)
  }

  const openColorPicker = () => {
    setShowColorPicker(true)
  }

  const startHovering = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current)
    }
    setHovering(true)
  }

  const stopHovering = () => {
    // @ts-ignore
    hoverTimeout.current = setTimeout(() => setHovering(false), 200)
  }

  const toggleLine = () => {
    if (lineIsExpanded) {
      actions.collapseLine(line.id)
    } else {
      actions.expandLine(line.id)
    }
  }

  const toggleExpanded = () => {
    if (timelineIsExpanded) {
      uiActions.collapseTimeline()
    } else {
      uiActions.expandTimeline()
    }
  }

  const duplicateThisPlotline = () => {
    actions.duplicateLine(line.id, line.position + 1)
  }

  const toggleMovingLine = () => {
    const thereIsAnotherBook =
      bookId !== 'series' ||
      books.allIds.some((id) => {
        return bookId !== id
      })
    if (thereIsAnotherBook) {
      setMovingLine(!movingLine)
    }
  }

  const renderEditInput = () => {
    if (!editing) return null

    return (
      <InputModal
        isOpen={true}
        type="text"
        getValue={finalizeEdit}
        defaultValue={line.title}
        title={t('Edit {lineName}', { lineName: line.title || t('New Plotline') })}
        cancel={() => {
          uiActions.stopEditingPlotlineHeadingTitle()
          setMovingLine(false)
          setHovering(false)
        }}
      />
    )
  }

  const renderDelete = () => {
    if (!deleting) return null

    return (
      <DeleteConfirmModal
        name={line.title || t('New Plotline')}
        onDelete={deleteLine}
        onCancel={cancelDelete}
      />
    )
  }

  const renderColorPicker = () => {
    if (showColorPicker) {
      const key = 'colorPicker-' + line.id
      return <ColorPicker key={key} color={line.color} closeDialog={changeColor} />
    } else {
      return null
    }
  }

  const renderHoverOptions = () => {
    let expandedIcon = null
    let allIcon = null
    if (lineIsExpanded) {
      expandedIcon = <FaCompressAlt />
    } else {
      expandedIcon = <FaExpandAlt />
    }
    if (timelineIsExpanded) {
      allIcon = <FaCompressAlt />
    } else {
      allIcon = <FaExpandAlt />
    }

    if (orientation === 'vertical') {
      let klasses = orientedClassName('line-title__hover-options', orientation)
      return (
        <div className={cx(klasses, { 'small-timeline': isSmall })}>
          <Button title={t('Edit title')} block bsSize="small" onClick={startEditing}>
            <Glyphicon glyph="edit" />
          </Button>
          <Button title={t('Change color')} block bsSize="small" onClick={openColorPicker}>
            <Glyphicon glyph="tint" />
          </Button>
          <Button
            title={line?.isPinned ? t('Unpin Plotline') : t('Pin this Plotline')}
            block
            bsSize="small"
            onClick={handlePinPlotLine}
          >
            {line?.isPinned ? <TbPinnedOff /> : <BsPinFill />}
          </Button>
          {isSmall ? null : (
            <Button
              title={t('Duplicate plotline')}
              block
              bsSize="small"
              onClick={duplicateThisPlotline}
            >
              <FiCopy />
            </Button>
          )}
          <Button title={t('Delete plotline')} block bsSize="small" onClick={handleDelete}>
            <Glyphicon glyph="trash" />
          </Button>
          {isSmall ? null : (
            <>
              {line?.isPinned ? (
                <ToolTip
                  id={`expand-line-${line.id}-tooltip`}
                  placement="bottom"
                  text={t('Unable to expand pinned plotlines')}
                >
                  <Button block bsSize="small" className="disabled">
                    {expandedIcon}
                  </Button>
                </ToolTip>
              ) : (
                <Button
                  title={t('Expand or collapse stacks')}
                  block
                  bsSize="small"
                  onClick={toggleLine}
                >
                  {expandedIcon}
                </Button>
              )}
              <Button
                title={t('Expand or collapse all stacks')}
                block
                bsSize="small"
                onClick={toggleExpanded}
              >
                {allIcon} {t('All')}
              </Button>
              <Button title={t('Move plotline')} block bsSize="small" onClick={toggleMovingLine}>
                <FaBook />
              </Button>
            </>
          )}
        </div>
      )
    } else {
      return (
        <div className="line-title__hover-options">
          <ButtonGroup>
            <Button title={t('Edit title')} bsSize="small" onClick={startEditing}>
              <Glyphicon glyph="edit" />
            </Button>
            <Button title={t('Change color')} bsSize="small" onClick={openColorPicker}>
              <Glyphicon glyph="tint" />
            </Button>
            <Button
              title={line?.isPinned ? t('Unpin Plotline') : t('Pin this Plotline')}
              bsSize="small"
              onClick={handlePinPlotLine}
            >
              {line?.isPinned ? <TbPinnedOff /> : <BsPinFill />}
            </Button>
            {isSmall ? null : (
              <Button
                title={t('Duplicate plotline')}
                bsSize="small"
                onClick={duplicateThisPlotline}
              >
                <FiCopy />
              </Button>
            )}
            <Button title={t('Delete plotline')} bsSize="small" onClick={handleDelete}>
              <Glyphicon glyph="trash" />
            </Button>
            {isSmall ? null : (
              <>
                {line?.isPinned ? (
                  <ToolTip
                    id={`expand-line-${line.id}-tooltip`}
                    placement="bottom"
                    text={t('Unable to expand pinned plotlines')}
                  >
                    <Button className="disabled" bsSize="small">
                      {expandedIcon}
                    </Button>
                  </ToolTip>
                ) : (
                  <Button
                    title={t('Expand or collapse stacks')}
                    bsSize="small"
                    onClick={toggleLine}
                  >
                    {expandedIcon}
                  </Button>
                )}
                <Button
                  title={t('Expand or collapse all stacks')}
                  bsSize="small"
                  onClick={toggleExpanded}
                >
                  {allIcon} {t('All')}
                </Button>
                <Button title={t('Move plotline')} bsSize="small" onClick={toggleMovingLine}>
                  <FaBook />
                </Button>
              </>
            )}
          </ButtonGroup>
        </div>
      )
    }
  }

  const moveToBook = (targetBookId) => {
    undo.batch('Move Line to Another Book', () => {
      actions.moveLine(line.id, targetBookId)
      notifications.showToastNotification(true, null, targetBookId, 'move')
    })
  }

  const renderBookOptions = () => {
    const title = isMedium ? t('Book') : t('Change book')
    return (
      <DropdownButton
        open
        // @ts-ignore
        ref={bookChoiceDropDown}
        id={`line-book-${line.id}`}
        bsSize="small"
        title={title}
        onBlur={handleBlur}
      >
        {[...books.allIds, 'series'].sort().map((id, index) => {
          const book = id === 'series' ? { id: 'series', title: t('Series') } : books[id]
          if (Array.isArray(book)) return null
          if (bookId === book.id) return null

          const mismatchInLevelCount =
            Object.values(allHierarchyLevels[book.id]).length !==
            Object.values(allHierarchyLevels[currentTimeline]).length

          if (mismatchInLevelCount) {
            return (
              <ToolTip
                key={`${id}-${index}`}
                id={`move-book-${book.id}-tooltip`}
                placement="right"
                text={t(
                  'You can only move plotlines to books with the same number of structure levels'
                )}
              >
                <MenuItem className="disabled" key={book.id} eventKey={book.id}>
                  {book.title || t('Untitled')}
                </MenuItem>
              </ToolTip>
            )
          }

          return (
            <MenuItem key={book.id} eventKey={book.id} onClick={() => moveToBook(book.id)}>
              {book.title || t('Untitled')}
            </MenuItem>
          )
        })}
      </DropdownButton>
    )
  }

  const renderTitle = () => {
    if (movingLine) {
      return renderBookOptions()
    }
    if (!editing) {
      return line?.isPinned ? (
        <span>
          <BsPinFill />
          {formatTitle(line.title)}
        </span>
      ) : (
        formatTitle(line.title)
      )
    } else {
      const focusCandidate =
        timelineFoci.length && typeof timelineFoci[0] !== 'undefined' && timelineFoci[0]
      const selection =
        Array.isArray(focusCandidate.path) &&
        focusCandidate.path[0] === 'line' &&
        focusCandidate.path[1] === line.id &&
        focusCandidate.path[2] === 'title' &&
        focusCandidate.selection
      return (
        <FormGroup>
          <ControlLabel className={cx({ darkmode: darkMode })}>{t('Plotline name')}</ControlLabel>
          <FormControl
            type="text"
            key={`line-${line.id}-title`}
            defaultValue={line.title}
            inputRef={(ref) => {
              titleInputRef.current = ref
            }}
            supressScrollIntoView={supressScroll}
            autoFocus
            selection={selection}
            onKeyDown={handleEsc}
            onBlur={handleBlur}
            onKeyPress={handleFinishEditingTitle}
          />
        </FormGroup>
      )
    }
  }

  const renderSmall = () => {
    const isHorizontal = orientation == 'horizontal'
    const klasses = {
      'rotate-45': !isHorizontal,
      'row-header': isHorizontal,
      dropping: inDropZone,
    }
    let placement = 'right'
    if (orientation == 'vertical') placement = 'bottom'
    return (
      <th
        className={cx(klasses)}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseLeave={stopHovering}
      >
        {renderColorPicker()}
        {renderDelete()}
        {renderEditInput()}
        <div
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onClick={hovering ? stopHovering : startHovering}
        >
          <Floater component={renderHoverOptions} open={hovering} placement={placement} hideArrow>
            <span>
              {line?.isPinned ? (
                <>
                  <BsPinFill />
                  {formatTitle(line.title)}
                </>
              ) : (
                formatTitle(line.title)
              )}
            </span>
          </Floater>
        </div>
      </th>
    )
  }

  if (isSmall) return renderSmall()

  let innerKlass = cx(orientedClassName('line-title__body', orientation), {
    'medium-timeline': isMedium,
    hover: hovering,
    dropping: inDropZone,
  })
  let wrapperKlass = cx(orientedClassName('line-title__cell', orientation), {
    'medium-timeline': isMedium,
  })

  let placement = 'bottom'
  if (orientation == 'vertical') placement = 'right'
  // Note the z-index.  This is needed to have titles stack their
  // controls onto titles to their right.
  return (
    <Cell ref={titleCellRef}>
      <div
        className={wrapperKlass}
        onMouseEnter={startHovering}
        onMouseLeave={stopHovering}
        onDrop={handleDrop}
      >
        {renderDelete()}
        <Floater
          component={renderHoverOptions}
          open={hovering && !movingLine}
          placement={placement}
          hideArrow
        >
          <div
            className={innerKlass}
            onClick={startEditing}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            draggable={true}
          >
            {renderTitle()}
          </div>
        </Floater>
      </div>
      {renderColorPicker()}
    </Cell>
  )
}

LineTitleCell.propTypes = {
  line: PropTypes.object.isRequired,
  bookId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  handleReorder: PropTypes.func,
  darkMode: PropTypes.bool,
  orientation: PropTypes.string.isRequired,
  timelineIsExpanded: PropTypes.bool,
  isSmall: PropTypes.bool,
  isMedium: PropTypes.bool,
  lineIsExpanded: PropTypes.bool.isRequired,
  actions: PropTypes.object.isRequired,
  uiActions: PropTypes.object.isRequired,
  notifications: PropTypes.object.isRequired,
  books: PropTypes.object.isRequired,
  zIndex: PropTypes.number,
  editing: PropTypes.bool,
  timelineFoci: PropTypes.array.isRequired,
  currentTimeline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  allHierarchyLevels: PropTypes.object.isRequired,
  togglePinPlotline: PropTypes.func,
  undo: PropTypes.object.isRequired,
  recentlyUndidOrRedid: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
}

const LineActions = actions.line
const uiActions = actions.ui
const notifications = actions.notifications
const UndoActions = actions.undo

const mapStateToProps = (state, ownProps) => {
  return {
    darkMode: selectors.isDarkModeSelector(state),
    orientation: selectors.orientationSelector(state),
    timelineIsExpanded: selectors.timelineIsExpandedSelector(state),
    isSmall: selectors.isSmallSelector(state),
    isMedium: selectors.isMediumSelector(state),
    lineIsExpanded: selectors.lineIsExpandedSelector(state)[ownProps.line.id],
    books: selectors.allBooksSelector(state),
    currentTimeline: selectors.currentTimelineSelector(state),
    allHierarchyLevels: selectors.allHierarchyLevelsSelector(state),
    editing: selectors.editingGivenLinesTitleSelector(
      state,
      // @ts-ignore
      ownProps.line.id
    ),
    timelineFoci: selectors.timelineFociSelector(state),
    recentlyUndidOrRedid: selectors.recentlyUndidOrRedidSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    actions: bindActionCreators(LineActions, dispatch),
    uiActions: bindActionCreators(uiActions, dispatch),
    notifications: bindActionCreators(notifications, dispatch),
    undo: bindActionCreators(UndoActions, dispatch),
  }
})(LineTitleCell)
