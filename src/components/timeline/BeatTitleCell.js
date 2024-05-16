import React, { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import { FaExpandAlt } from '@react-icons/all-files/fa/FaExpandAlt'
import { FaCompressAlt } from '@react-icons/all-files/fa/FaCompressAlt'
import { IoIosReturnRight } from '@react-icons/all-files/io/IoIosReturnRight'
import { Cell } from 'react-sticky-table'
import cx from 'classnames'

import { helpers } from 'pltr'

import ButtonGroup from '../ButtonGroup'
import Glyphicon from '../Glyphicon'
import ControlLabel from '../ControlLabel'
import FormGroup from '../FormGroup'
import FormControl from '../FormControl'
import Button from '../Button'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import InputModal from '../dialogs/InputModal'
import UnconnectedFloater from '../PlottrFloater'
import { checkDependencies } from '../checkDependencies'

const {
  card: { truncateTitle },
  beats: { editingBeatLabel },
  orientedClassName: { orientedClassName },
  hierarchyLevels: { hierarchyToStyles },
} = helpers

const BeatTitleCellConnector = (connector) => {
  const Floater = UnconnectedFloater(connector)

  const Title = ({
    editing,
    beatTitle,
    darkMode,
    beatIndex,
    beats,
    beat,
    hierarchyLevels,
    titleInputRef,
    selection,
    handleEsc,
    handleBlur,
    handleFinishEditing,
  }) => {
    if (!editing) return <span>{truncateTitle(beatTitle, 50)}</span>

    return (
      <FormGroup>
        <ControlLabel className={cx({ darkmode: darkMode })}>
          {editingBeatLabel(beatIndex, beats, beat, hierarchyLevels)}
        </ControlLabel>
        <FormControl
          type="text"
          defaultValue={beatTitle}
          inputRef={(ref) => {
            titleInputRef.current = ref
          }}
          autoFocus
          selection={selection}
          onKeyDown={handleEsc}
          onBlur={handleBlur}
          onKeyPress={handleFinishEditing}
        />
      </FormGroup>
    )
  }

  Title.propTypes = {
    editing: PropTypes.bool,
    beatTitle: PropTypes.string.isRequired,
    darkMode: PropTypes.bool,
    beatIndex: PropTypes.number.isRequired,
    beats: PropTypes.array.isRequired,
    beat: PropTypes.object.isRequired,
    hierarchyLevels: PropTypes.array.isRequired,
    titleInputRef: PropTypes.object.isRequired,
    selection: PropTypes.object.isRequired,
    handleEsc: PropTypes.func.isRequired,
    handleBlur: PropTypes.func.isRequired,
    handleFinishEditing: PropTypes.func.isRequired,
  }

  const EditInput = ({ editing, finalizeEdit, beatTitle, uiActions, setHovering }) => {
    if (!editing) return null

    return (
      <InputModal
        isOpen={true}
        type="text"
        getValue={finalizeEdit}
        defaultValue={beatTitle}
        title={t('Edit {beatName}', { beatName: beatTitle })}
        cancel={() => {
          uiActions.stopEditingBeatHeadingTitle()
          setHovering(null)
        }}
      />
    )
  }

  EditInput.propTypes = {
    editing: PropTypes.bool,
    finalizeEdit: PropTypes.func.isRequired,
    beatTitle: PropTypes.string.isRequired,
    uiActions: PropTypes.object.isRequired,
    setHovering: PropTypes.func.isRequired,
  }

  const Delete = ({
    deleting,
    hierarchyLevels,
    beatTitle,
    hierarchyLevel,
    deleteBeat,
    cancelDelete,
  }) => {
    if (!deleting) return null

    const depth =
      hierarchyLevels.length - hierarchyLevels.findIndex(({ name }) => name === hierarchyLevel.name)

    let warningMessage = null
    switch (depth) {
      case 1:
        break
      case 2:
        warningMessage = t('Are you sure you want to delete all scene cards in "{beatTitle}".', {
          beatTitle,
        })
        break
      case 3:
        warningMessage = t(
          'Are you sure you want to delete all chapters and their scene cards in "{beatTitle}".',
          { beatTitle }
        )
        break
    }
    return (
      <DeleteConfirmModal
        name={beatTitle}
        customText={warningMessage && t(warningMessage)}
        onDelete={deleteBeat}
        onCancel={cancelDelete}
      />
    )
  }

  Delete.propTypes = {
    deleting: PropTypes.bool,
    hierarchyLevels: PropTypes.array.isRequired,
    beatTitle: PropTypes.string.isRequired,
    hierarchyLevel: PropTypes.object.isRequired,
    deleteBeat: PropTypes.func.isRequired,
    cancelDelete: PropTypes.func.isRequired,
  }

  // TODO: refactor!!!
  const TitleCell = ({
    orientation,
    isMedium,
    hovering,
    inDropZone,
    readOnly,
    beatTitle,
    startHovering,
    stopHovering,
    handleDrop,
    deleting,
    hierarchyLevels,
    hierarchyLevel,
    deleteBeat,
    cancelDelete,
    renderControls,
    timelineSize,
    darkMode,
    startEditing,
    handleDragStart,
    handleDragEnd,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    editing,
    beatIndex,
    beats,
    beat,
    titleInputRef,
    selection,
    handleEsc,
    handleBlur,
    handleFinishEditing,
  }) => {
    const innerKlass = cx(orientedClassName('beat__body', orientation), {
      'medium-timeline': isMedium,
      hover: hovering,
      dropping: inDropZone,
      disabled: readOnly,
    })
    const beatKlass = cx(orientedClassName('beat__cell', orientation), {
      'medium-timeline': isMedium,
    })

    return (
      <div
        className={beatKlass}
        title={beatTitle}
        onMouseEnter={startHovering}
        onMouseLeave={stopHovering}
        onDrop={handleDrop}
      >
        <Delete
          deleting={deleting}
          hierarchyLevels={hierarchyLevels}
          beatTitle={beatTitle}
          hierarchyLevel={hierarchyLevel}
          deleteBeat={deleteBeat}
          cancelDelete={cancelDelete}
        />
        <Floater
          hideArrow={true}
          open={hovering}
          placement="top"
          align="center"
          component={renderControls}
        >
          <div
            style={hierarchyToStyles(
              hierarchyLevel,
              timelineSize,
              hovering || inDropZone,
              darkMode === true ? hierarchyLevel.dark : hierarchyLevel.light,
              darkMode
            )}
            className={innerKlass}
            onClick={startEditing}
            draggable={!readOnly}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Title
              editing={editing}
              beatTitle={beatTitle}
              darkMode={darkMode}
              beatIndex={beatIndex}
              beats={beats}
              beat={beat}
              hierarchyLevels={hierarchyLevels}
              titleInputRef={titleInputRef}
              selection={selection}
              handleEsc={handleEsc}
              handleBlur={handleBlur}
              handleFinishEditing={handleFinishEditing}
            />
          </div>
        </Floater>
      </div>
    )
  }

  TitleCell.propTypes = {
    orientation: PropTypes.string.isRequired,
    isMedium: PropTypes.bool,
    hovering: PropTypes.bool,
    inDropZone: PropTypes.bool,
    readOnly: PropTypes.bool,
    beatTitle: PropTypes.string.isRequired,
    startHovering: PropTypes.bool,
    stopHovering: PropTypes.func.isRequired,
    handleDrop: PropTypes.func.isRequired,
    deleting: PropTypes.bool,
    hierarchyLevels: PropTypes.array.isRequired,
    hierarchyLevel: PropTypes.object.isRequired,
    deleteBeat: PropTypes.func.isRequired,
    cancelDelete: PropTypes.func.isRequired,
    renderControls: PropTypes.func.isRequired,
    timelineSize: PropTypes.string.isRequired,
    darkMode: PropTypes.bool.isRequired,
    startEditing: PropTypes.func.isRequired,
    handleDragStart: PropTypes.func.isRequired,
    handleDragEnd: PropTypes.func.isRequired,
    handleDragEnter: PropTypes.func.isRequired,
    handleDragOver: PropTypes.func.isRequired,
    handleDragLeave: PropTypes.func.isRequired,
    editing: PropTypes.bool,
    beatIndex: PropTypes.number.isRequired,
    beats: PropTypes.array.isRequired,
    beat: PropTypes.object.isRequired,
    titleInputRef: PropTypes.object.isRequired,
    selection: PropTypes.object.isRequired,
    handleEsc: PropTypes.func.isRequired,
    handleBlur: PropTypes.func.isRequired,
    handleFinishEditing: PropTypes.func.isRequired,
  }

  const BeatTitleCell = ({
    beatId,
    currentTimeline,
    orientation,
    timelineSize,
    darkMode,
    handleReorder,
    actions,
    beats,
    beatIndex,
    hierarchyLevels,
    beat,
    hierarchyLevel,
    beatTitle,
    isSmall,
    isMedium,
    isLarge,
    readOnly,
    editing,
    timelineViewIsStacked,
    timelineViewIsTabbed,
    atMaximumDepth,
    hierarchyLevelName,
    hierarchyChildLevelName,
    selection,
    domEvents,
    uiActions,
    undo,
  }) => {
    const [hovering, setHovering] = useState(false)
    const [dragging, setDragging] = useState(false)
    const [inDropZone, setInDropZone] = useState(false)
    const [dropDepth, setDropDepth] = useState(0)
    const [deleting, setDeleting] = useState(false)
    const [stopHoveringTimeout, setStopHoveringTimeout] = useState(null)
    const [hoveringOnPeer, setHoveringOnPeer] = useState(false)

    const titleInputRef = useRef(null)
    const insertPeerRef = useRef(null)
    const container = useRef(null)

    useEffect(() => {
      if (editing && titleInputRef.current && document.activeElement !== titleInputRef) {
        titleInputRef.current.select()
      }
    }, [editing])

    const deleteBeat = useCallback(
      (e) => {
        e.stopPropagation()
        actions.deleteBeat(beat.id, currentTimeline)
      },
      [actions]
    )

    const cancelDelete = useCallback(
      (e) => {
        e.stopPropagation()
        setDeleting(false)
      },
      [setDeleting]
    )

    const handleDelete = useCallback(
      (e) => {
        e.stopPropagation()
        if (readOnly) return
        setDeleting(true)
        setHovering(null)
      },
      [readOnly, setDeleting, setHovering]
    )

    const handleAddBeat = useCallback(
      (e) => {
        if (!readOnly) {
          undo.batch('Add Peer Beat', () => {
            actions.insertBeat(currentTimeline, beat.id)
            actions.expandBeat(beat.id, currentTimeline)
          })
        }
      },
      [readOnly, actions]
    )

    const handleAddChild = useCallback(
      (e) => {
        if (!readOnly) {
          undo.batch('Add Child Beat', () => {
            actions.expandBeat(beat.id, currentTimeline)
            actions.addBeat(currentTimeline, beat.id)
          })
        }
      },
      [actions]
    )

    const handleToggleExpanded = useCallback(
      (e) => {
        const { collapseBeat, expandBeat } = actions
        const { id, expanded } = beat

        if (readOnly) return

        if (expanded) collapseBeat(id, currentTimeline)
        else expandBeat(id, currentTimeline)
      },
      [actions.collapseBeat, actions.expandBeat, beat?.id, beat?.expanded]
    )

    const finalizeEdit = useCallback(
      (newVal) => {
        const newTitle = newVal ?? 'auto'
        undo.batch(`Edit Beat Title ${newTitle}`, () => {
          actions.editBeatTitle(beat.id, currentTimeline, newTitle) // if nothing, set to auto
          uiActions.stopEditingBeatHeadingTitle()
        })
        setHovering(null)
      },
      [actions, uiActions, setHovering]
    )

    const editTitle = useCallback(() => {
      const ref = titleInputRef.current
      if (!ref) return

      finalizeEdit(ref.value)
    }, [finalizeEdit, titleInputRef])

    const handleFinishEditing = useCallback(
      (event) => {
        if (event.which === 13) {
          editTitle()
        }
      },
      [editTitle]
    )

    const handleBlur = useCallback(() => {
      editTitle()
    }, [editTitle])

    const handleEsc = useCallback(
      (event) => {
        if (event.which === 27) {
          uiActions.stopEditingBeatHeadingTitle()
        }
      },
      [uiActions]
    )

    const handleDragStart = useCallback(
      (e) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/json', JSON.stringify({ ...beat, type: 'beat' }))
        setDragging(true)
      },
      [setDragging]
    )

    const handleDragEnd = useCallback(
      (event) => {
        domEvents.dropBeat(beatId, { x: event.clientX, y: event.clientY })
        setDragging(false)
      },
      [setDragging]
    )

    const handleDragEnter = useCallback(
      (e) => {
        if (!dragging) setDropDepth(dropDepth + 1)
      },
      [dragging, setDropDepth, dropDepth]
    )

    const handleDragOver = useCallback(
      (e) => {
        e.preventDefault()
        if (!dragging) setInDropZone(true)
      },
      [dragging, setInDropZone]
    )

    const handleDragLeave = useCallback(
      (e) => {
        if (!dragging) {
          let newDropDepth = dropDepth
          --newDropDepth
          setDropDepth(newDropDepth)
          if (newDropDepth > 0) return
          setInDropZone(false)
        }
      },
      [dragging, dropDepth, setDropDepth, setInDropZone]
    )

    const handleDrop = useCallback(
      (e) => {
        e.stopPropagation()
        setInDropZone(false)
        setDropDepth(0)

        var json = e.dataTransfer.getData('text/json')
        var droppedBeat = JSON.parse(json)
        if (droppedBeat.id == null) return
        if (droppedBeat.type !== 'beat') return
        if (droppedBeat.id == beat.id) return

        undo.batch('Reorder Beat', () => {
          if (!beat.expanded) {
            actions.expandBeat(beat.id, currentTimeline)
          }
          handleReorder(beat.id, droppedBeat.id)
        })
      },
      [setInDropZone, setDropDepth, beat, actions, handleReorder]
    )

    const startEditing = useCallback(() => {
      if (readOnly) return
      uiActions.startEditingBeatHeadingTitle(beatId)
      setHovering(null)
    }, [readOnly, uiActions, setHovering])

    const startHovering = useCallback(() => {
      if (readOnly) return
      setHovering(true)
    }, [readOnly, setHovering])

    const stopHovering = useCallback(() => {
      if (readOnly && !isSmall) return
      // Tune this to the mouse tracking timeout in TopRow.
      if (stopHoveringTimeout) {
        clearTimeout(stopHoveringTimeout)
      }
      setStopHoveringTimeout(
        setTimeout(() => {
          setHovering(null)
        }, 100)
      )
    }, [readOnly, stopHoveringTimeout, setStopHoveringTimeout])

    const renderHorizontalHoverOptions = (style) => {
      const klasses = orientedClassName('beat-list__item__hover-options', orientation)
      const showExpandCollapse = hierarchyLevels.length - hierarchyLevel.level > 1
      return (
        <div className={cx(klasses, { 'small-timeline': isSmall })} style={style}>
          <ButtonGroup>
            {isMedium ? null : (
              <Button
                title={`Edit ${beatTitle}`}
                bsSize={isSmall ? 'small' : undefined}
                onClick={startEditing}
              >
                <Glyphicon glyph="edit" />
              </Button>
            )}
            <Button
              title={`Delete ${beatTitle}`}
              bsSize={isSmall ? 'small' : undefined}
              onClick={handleDelete}
            >
              <Glyphicon glyph="trash" />
            </Button>
            {showExpandCollapse ? (
              <Button
                title={`Expand/Collapse ${beatTitle}`}
                bsSize={isSmall ? 'small' : undefined}
                onClick={handleToggleExpanded}
              >
                {beat.expanded ? <FaCompressAlt /> : <FaExpandAlt />}
              </Button>
            ) : null}
          </ButtonGroup>
        </div>
      )
    }

    const renderVerticalHoverOptions = (style) => {
      const klasses = orientedClassName('beat-list__item__hover-options', orientation)
      const showExpandCollapse = hierarchyLevels.length - hierarchyLevel.level > 1
      return (
        <div className={cx(klasses, { 'small-timeline': isSmall })} style={style}>
          <Button
            title={`Edit ${beatTitle}`}
            bsSize={isSmall ? 'small' : undefined}
            block
            onClick={startEditing}
            style={
              isMedium
                ? showExpandCollapse
                  ? { marginTop: '0px' }
                  : { marginTop: '19px' }
                : showExpandCollapse
                ? { marginTop: '5px' }
                : { marginTop: '24px' }
            }
          >
            <Glyphicon glyph="edit" />
          </Button>
          <Button
            title={`Delete ${beatTitle}`}
            bsSize={isSmall ? 'small' : undefined}
            block
            onClick={handleDelete}
          >
            <Glyphicon glyph="trash" />
          </Button>
          {showExpandCollapse && (
            <Button
              title={`Expand/Collapse ${beatTitle}`}
              bsSize={isSmall ? 'small' : undefined}
              onClick={handleToggleExpanded}
            >
              {beat.expanded ? <FaCompressAlt /> : <FaExpandAlt />}
            </Button>
          )}
        </div>
      )
    }

    const renderHoverOptions = () => {
      let style = {}
      if (isSmall) {
        style = { display: 'none' }
        if (hovering) style.display = 'block'
      } else {
        style = { visibility: 'hidden' }
        if (hovering) style.visibility = 'visible'
      }

      if (orientation === 'vertical') {
        return renderVerticalHoverOptions(style)
      } else {
        return renderHorizontalHoverOptions(style)
      }
    }

    const renderInsertPeer = () => {
      const shouldRenderInsertChild = !atMaximumDepth

      if (isLarge && orientation === 'horizontal') {
        return (
          <div
            className={cx('insert-beat-wrapper insert-beat-cell', {
              'medium-timeline': isMedium,
              'insert-child': shouldRenderInsertChild,
              vertical: orientation === 'vertical',
            })}
            ref={insertPeerRef}
            style={hoveringOnPeer || hovering ? { opacity: 1 } : { opacity: 0 }}
            onMouseEnter={() => {
              setHoveringOnPeer(true)
            }}
            onMouseLeave={() => {
              setHoveringOnPeer(false)
            }}
          >
            <ButtonGroup vertical>
              <Button bsSize="xs" title={t(`Insert ${hierarchyLevelName}`)} onClick={handleAddBeat}>
                <Glyphicon glyph="plus" />
              </Button>
              {shouldRenderInsertChild ? (
                <div title={t(`Insert ${hierarchyChildLevelName}`)} onClick={handleAddChild}>
                  <Button bsSize="xs">
                    <IoIosReturnRight size={25} style={{ margin: '-1px -5px -6px -5px' }} />
                  </Button>
                </div>
              ) : null}
            </ButtonGroup>
          </div>
        )
      } else {
        const isVertical = orientation !== 'horizontal'
        const smallButtons = isLarge && isVertical
        return (
          <>
            <Button
              bsSize={smallButtons ? 'small' : 'xs'}
              title={t(`Insert ${hierarchyLevelName}`)}
              onClick={handleAddBeat}
            >
              <Glyphicon glyph="plus" />
            </Button>
            {shouldRenderInsertChild ? (
              <div title={t(`Insert ${hierarchyChildLevelName}`)} onClick={handleAddChild}>
                <Button bsSize={smallButtons ? 'small' : 'xs'}>
                  <IoIosReturnRight size={20} style={{ margin: '-1px -5px -6px -5px' }} />
                </Button>
              </div>
            ) : null}
          </>
        )
      }
    }

    const renderControls = useCallback(() => {
      const showExpandCollapse =
        !timelineViewIsTabbed &&
        !timelineViewIsStacked &&
        hierarchyLevels.length - hierarchyLevel.level > 1

      if (isLarge && orientation === 'horizontal') {
        return (
          <ButtonGroup style={{ paddingBottom: '1px' }}>
            <Button title={`Edit ${beatTitle}`} bsSize="small" onClick={startEditing}>
              <Glyphicon glyph="edit" />
            </Button>
            <Button title={`Delete ${beatTitle}`} bsSize="small" onClick={handleDelete}>
              <Glyphicon glyph="trash" />
            </Button>
            {showExpandCollapse ? (
              <Button
                title={`Expand/Collapse ${beatTitle}`}
                bsSize="small"
                onClick={handleToggleExpanded}
              >
                {beat.expanded ? <FaCompressAlt /> : <FaExpandAlt />}
              </Button>
            ) : null}
          </ButtonGroup>
        )
      } else {
        const isVertical = orientation !== 'horizontal'
        const smallButtons = isLarge && isVertical
        return (
          <ButtonGroup style={{ paddingBottom: '1px' }}>
            <Button
              title={`Edit ${beatTitle}`}
              bsSize={smallButtons ? 'small' : 'xs'}
              onClick={startEditing}
            >
              <Glyphicon glyph="edit" />
            </Button>
            <Button
              title={`Delete ${beatTitle}`}
              bsSize={smallButtons ? 'small' : 'xs'}
              onClick={handleDelete}
            >
              <Glyphicon glyph="trash" />
            </Button>
            {showExpandCollapse ? (
              <Button
                title={`Expand/Collapse ${beatTitle}`}
                bsSize={smallButtons ? 'small' : 'xs'}
                onClick={handleToggleExpanded}
              >
                {beat.expanded ? <FaCompressAlt /> : <FaExpandAlt />}
              </Button>
            ) : null}
            {renderInsertPeer()}
          </ButtonGroup>
        )
      }
    }, [
      startEditing,
      handleDelete,
      beatTitle,
      handleToggleExpanded,
      isLarge,
      orientation,
      beat,
      timelineViewIsTabbed,
      timelineViewIsStacked,
      hierarchyLevels,
    ])

    const editingKeySuffix = editing ? 'editing' : 'displaying'
    if (isSmall) {
      const isHorizontal = orientation == 'horizontal'
      const klasses = {
        'rotate-45': isHorizontal,
        'row-header': !isHorizontal,
        dropping: inDropZone,
      }
      return (
        <th
          className={cx(klasses)}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onMouseLeave={stopHovering}
        >
          {renderHoverOptions()}
          <Delete
            deleting={deleting}
            hierarchyLevels={hierarchyLevels}
            beatTitle={beatTitle}
            hierarchyLevel={hierarchyLevel}
            deleteBeat={deleteBeat}
            cancelDelete={cancelDelete}
          />
          <EditInput
            editing={editing}
            finalizeEdit={finalizeEdit}
            beatTitle={beatTitle}
            uiActions={uiActions}
            setHovering={setHovering}
          />
          <div
            title={beatTitle}
            onClick={hovering ? stopHovering : startHovering}
            draggable={!readOnly}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <span>{truncateTitle(beatTitle, 50)}</span>
          </div>
        </th>
      )
    } else if (isMedium || orientation !== 'horizontal') {
      return (
        <Cell
          className="beat-table-cell"
          ref={(ref) => {
            container.current = ref
          }}
          key={`beat-title-cell-${beatId}--${editingKeySuffix}--${beatTitle}`}
        >
          <TitleCell
            orientation={orientation}
            isMedium={isMedium}
            hovering={hovering}
            inDropZone={inDropZone}
            readOnly={readOnly}
            beatTitle={beatTitle}
            startHovering={startHovering}
            stopHovering={stopHovering}
            handleDrop={handleDrop}
            deleting={deleting}
            hierarchyLevels={hierarchyLevels}
            hierarchyLevel={hierarchyLevel}
            deleteBeat={deleteBeat}
            cancelDelete={cancelDelete}
            renderControls={renderControls}
            timelineSize={timelineSize}
            darkMode={darkMode}
            startEditing={startEditing}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
            handleDragEnter={handleDragEnter}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            editing={editing}
            beatIndex={beatIndex}
            beats={beats}
            beat={beat}
            titleInputRef={titleInputRef}
            selection={selection}
            handleEsc={handleEsc}
            handleBlur={handleBlur}
            handleFinishEditing={handleFinishEditing}
          />
        </Cell>
      )
    } else {
      return [
        <Cell
          className="beat-table-cell"
          ref={(ref) => {
            container.current = ref
          }}
          key={`beat-title-cell-${beatId}--${editingKeySuffix}--${beatTitle}`}
        >
          <TitleCell
            orientation={orientation}
            isMedium={isMedium}
            hovering={hovering}
            inDropZone={inDropZone}
            readOnly={readOnly}
            beatTitle={beatTitle}
            startHovering={startHovering}
            stopHovering={stopHovering}
            handleDrop={handleDrop}
            deleting={deleting}
            hierarchyLevels={hierarchyLevels}
            hierarchyLevel={hierarchyLevel}
            deleteBeat={deleteBeat}
            cancelDelete={cancelDelete}
            renderControls={renderControls}
            timelineSize={timelineSize}
            darkMode={darkMode}
            startEditing={startEditing}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
            handleDragEnter={handleDragEnter}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            editing={editing}
            beatIndex={beatIndex}
            beats={beats}
            beat={beat}
            titleInputRef={titleInputRef}
            selection={selection}
            handleEsc={handleEsc}
            handleBlur={handleBlur}
            handleFinishEditing={handleFinishEditing}
          />
        </Cell>,
        <Cell key={`beat-insert-cell-${beatId}--${editingKeySuffix}--${beatTitle}`}>
          {renderInsertPeer()}
        </Cell>,
      ]
    }
  }

  BeatTitleCell.propTypes = {
    beatId: PropTypes.number.isRequired,
    currentTimeline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    orientation: PropTypes.string.isRequired,
    timelineSize: PropTypes.string.isRequired,
    darkMode: PropTypes.bool.isRequired,
    handleReorder: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
    beats: PropTypes.object.isRequired,
    beatIndex: PropTypes.number.isRequired,
    hierarchyLevels: PropTypes.array.isRequired,
    beat: PropTypes.object.isRequired,
    hierarchyLevel: PropTypes.object.isRequired,
    beatTitle: PropTypes.string.isRequired,
    isSmall: PropTypes.bool.isRequired,
    isMedium: PropTypes.bool.isRequired,
    isLarge: PropTypes.bool.isRequired,
    readOnly: PropTypes.bool,
    timelineViewIsStacked: PropTypes.bool,
    timelineViewIsTabbed: PropTypes.bool,
    atMaximumDepth: PropTypes.bool,
    hierarchyLevelName: PropTypes.string,
    hierarchyChildLevelName: PropTypes.string,
    editing: PropTypes.bool,
    selection: PropTypes.array.isRequired,
    domEvents: PropTypes.object.isRequired,
    uiActions: PropTypes.object.isRequired,
    undo: PropTypes.object.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  checkDependencies({ redux, selectors, actions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    const makeMapState = (state) => {
      const uniqueBeatsSelector = selectors.makeBeatSelector()
      const uniqueBeatTitleSelector = selectors.makeBeatTitleSelector()

      return function mapStateToProps(state, ownProps) {
        return {
          currentTimeline: selectors.currentTimelineSelector(state),
          orientation: selectors.orientationSelector(state),
          timelineSize: selectors.timelineSizeSelector(state),
          darkMode: selectors.isDarkModeSelector(state),
          beats: selectors.beatsByBookSelector(state),
          beatIndex: selectors.beatIndexSelector(state, ownProps.beatId),
          hierarchyLevels: selectors.sortedHierarchyLevels(state),
          beat: uniqueBeatsSelector(state, ownProps.beatId),
          hierarchyLevel: selectors.hierarchyLevelSelector(state, ownProps.beatId),
          beatTitle: uniqueBeatTitleSelector(state, ownProps.beatId),
          isSmall: selectors.isSmallSelector(state),
          isMedium: selectors.isMediumSelector(state),
          isLarge: selectors.isLargeSelector(state),
          readOnly: !selectors.canWriteSelector(state),
          timelineViewIsStacked: selectors.timelineViewIsStackedSelector(state),
          timelineViewIsTabbed: selectors.timelineViewIsTabbedSelector(state),
          atMaximumDepth: selectors.atMaximumHierarchyDepthSelector(state, ownProps.beatId),
          hierarchyLevelName: selectors.beatInsertControlHierarchyLevelNameSelector(
            state,
            ownProps.beatId
          ),
          hierarchyChildLevelName: selectors.hierarchyChildLevelNameSelector(
            state,
            ownProps.beatId
          ),
          editing: selectors.editingGivenBeatsTitleSelector(state, ownProps.beatId),
          selection: selectors.timelineBeatSelectionSelector(state, ownProps.beatId),
        }
      }
    }

    const mapDispatchToProps = (dispatch) => {
      return {
        actions: bindActionCreators(actions.beat, dispatch),
        domEvents: bindActionCreators(actions.domEvents, dispatch),
        uiActions: bindActionCreators(actions.ui, dispatch),
        undo: bindActionCreators(actions.undo, dispatch),
      }
    }

    return connect(makeMapState, mapDispatchToProps)(BeatTitleCell)
  }

  throw new Error('Could not connect BeatTtileCell')
}

export default BeatTitleCellConnector
