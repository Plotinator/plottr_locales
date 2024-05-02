import React, { useEffect, useState, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import { Cell } from 'react-sticky-table'
import { FaGripLinesVertical } from '@react-icons/all-files/fa/FaGripLinesVertical'
import cx from 'classnames'

import { t } from 'plottr_locales'
import { helpers } from 'pltr'

import UnconnectedFloater from '../PlottrFloater'
import Glyphicon from '../Glyphicon'
import Button from '../Button'
import ButtonGroup from '../ButtonGroup'
import FormGroup from '../FormGroup'
import ControlLabel from '../ControlLabel'
import FormControl from '../FormControl'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import MousePositionContext from './MousePositionContext'
import { boundingRectContains } from '../domHelpers'

const {
  card: { truncateTitle },
  hierarchyLevels: { hierarchyToStyles },
} = helpers

const BeatHeadingCellConnector = (connector) => {
  const Floater = UnconnectedFloater(connector)

  const BeatHeadingCell = ({
    span,
    beatId,
    beatTitle,
    isMedium,
    hierarchyLevel,
    darkMode,
    timelineSize,
    readOnly,
    beats,
    hierarchyLevelName,
    currentTimeline,
    insertBeat,
    editBeatTitle,
    beat,
    hierarchyLevels,
    deleteBeat,
    lastClick,
    editing,
    reorderBeats,
    expandBeat,
    dropBeat,
    droppedBeat,
    collectBeat,
    timelineFoci,
    startEditingBeatHeadingTitle,
    stopEditingBeatHeadingTitle,
    batch,
  }) => {
    const [width, setWidth] = useState(null)
    const [spacerCellWidth, setSpacerCellWidth] = useState(null)
    const [headingCellWidth, setHeadingCellWidth] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [dragging, setDragging] = useState(false)
    const [dropDepth, setDropDepth] = useState(0)
    const [inDropZone, setInDropZone] = useState(false)

    const container = useRef(null)
    const bottomButtons = useRef(null)
    const rightButtons = useRef(null)

    useEffect(() => {
      if (lastClick && lastClick.x && lastClick.y && headingContains(lastClick) && !editing) {
        // Dummy event
        startEditing({ stopPropagation: () => {} })
      }
    }, [lastClick])

    useEffect(() => {
      if (!droppedBeat || !droppedBeat.id) return

      const droppedInThisContainer = headingContains(droppedBeat.coord)
      if (droppedInThisContainer) {
        batch(() => {
          collectBeat()
          if (!beat.expanded) {
            expandBeat(beat.id, currentTimeline)
          }
          handleReorder(beat.id, droppedBeat.id)
        })
      }
    }, [droppedBeat])

    useEffect(() => {
      const aBeatTitleCell = document.querySelector('.beat-table-cell')
      if (aBeatTitleCell) {
        const aSpacerCell = document.querySelector('.beat__heading-spacer')
        if (aSpacerCell) {
          setSpacerCellWidth(aSpacerCell.getBoundingClientRect().width)
        }
        if (isMedium) {
          const thisHeadingCellWidth = aBeatTitleCell
            .querySelector('.beat__cell')
            .getBoundingClientRect().width
          setHeadingCellWidth(thisHeadingCellWidth)
          const spanIncludingThisBeat = Math.max(1, span)
          setWidth(thisHeadingCellWidth * spanIncludingThisBeat)
        } else if (aSpacerCell) {
          const thisHeadingCellWidth = aBeatTitleCell.getBoundingClientRect().width
          setHeadingCellWidth(thisHeadingCellWidth)
          const spanIncludingThisBeat = Math.max(1, span)
          const widthWithSpacer = thisHeadingCellWidth + aSpacerCell.getBoundingClientRect().width
          setWidth(widthWithSpacer * spanIncludingThisBeat)
        } else {
          const thisHeadingCellWidth = aBeatTitleCell.getBoundingClientRect().width
          setHeadingCellWidth(thisHeadingCellWidth)
          const spanIncludingThisBeat = Math.max(1, span)
          setWidth(thisHeadingCellWidth * spanIncludingThisBeat)
        }
      }
    }, [setWidth, setHeadingCellWidth, beats.length])

    const handleReorder = useCallback(
      (droppedPositionId, originalPositionId) => {
        reorderBeats(originalPositionId, droppedPositionId, currentTimeline)
      },
      [reorderBeats]
    )

    const handleDrop = useCallback(
      (e) => {
        e.stopPropagation()
        setInDropZone(false)
        setDropDepth(0)

        var json = e.dataTransfer.getData('text/json')
        var droppedBeat = JSON.parse(json)
        if (droppedBeat.type !== 'beat') return
        if (droppedBeat.id == null) return
        if (droppedBeat.id == beat.id) return

        batch(() => {
          if (!beat.expanded) {
            expandBeat(beat.id, currentTimeline)
          }
          handleReorder(beat.id, droppedBeat.id)
        })
      },
      [setInDropZone, setDropDepth, beat?.id, beat?.expanded, expandBeat, handleReorder]
    )

    const startEditing = useCallback(
      (event) => {
        event.stopPropagation()
        startEditingBeatHeadingTitle(beatId)
      },
      [startEditingBeatHeadingTitle, beatId]
    )

    const stopEditing = useCallback(() => {
      batch(() => {
        if (beat?.title === '') {
          editBeatTitle(beatId, currentTimeline, 'auto')
        }
        stopEditingBeatHeadingTitle()
      })
    }, [beat?.title, editBeatTitle, beatId, currentTimeline, stopEditingBeatHeadingTitle])

    const startDeleting = useCallback(
      (event) => {
        event.stopPropagation()
        setDeleting(true)
      },
      [setDeleting]
    )

    const stopDeleting = useCallback(() => {
      setDeleting(false)
    }, [setDeleting])

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
        dropBeat(beatId, { x: event.clientX, y: event.clientY })
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
      [dragging, setDropDepth, setInDropZone]
    )

    const deleteThisBeat = useCallback(
      (event) => {
        event.stopPropagation()
        deleteBeat(beatId, currentTimeline)
      },
      [deleteBeat, beatId, currentTimeline]
    )

    const renderDelete = useCallback(() => {
      if (!deleting) return null

      const depth =
        hierarchyLevels.length -
        hierarchyLevels.findIndex(({ name }) => name === hierarchyLevel.name)

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
          warningMessage = warningMessage = t(
            'Are you sure you want to delete all chapters and their scene cards in "{beatTitle}".',
            { beatTitle }
          )
          break
      }
      return (
        <DeleteConfirmModal
          name={beatTitle}
          customText={warningMessage && t(warningMessage)}
          onDelete={deleteThisBeat}
          onCancel={stopDeleting}
        />
      )
    }, [deleting, hierarchyLevels, beatTitle, deleteThisBeat, stopDeleting])

    const rightControlsContentLocation = useCallback(() => {
      if (container.current) {
        return rightControlsPosition()
      }
      return { top: 0, left: 0 }
    }, [container, rightControlsPosition, width])

    const bottomControlsContentLocation = useCallback(() => {
      if (container.current) {
        return bottomControlsPosition()
      }
      return { top: 0, left: 0 }
    }, [container, bottomControlsPosition, width])

    const renderTitle = useCallback(() => {
      return <span>{truncateTitle(beatTitle, 50)}</span>
    }, [beatTitle])

    const renderControls = useCallback(() => {
      return (
        <div ref={bottomButtons}>
          <ButtonGroup>
            <Button title={`Edit ${beatTitle}`} bsSize="small" onClick={startEditing}>
              <Glyphicon glyph="edit" />
            </Button>
            <Button title={`Delete ${beatTitle}`} bsSize="small" onClick={startDeleting}>
              <Glyphicon glyph="trash" />
            </Button>
          </ButtonGroup>
        </div>
      )
    }, [startEditing, bottomButtons, startDeleting])

    const insert = useCallback(() => {
      if (readOnly) return
      insertBeat(currentTimeline, beatId)
    }, [readOnly, insertBeat, currentTimeline, beatId])

    const renderAddPeer = useCallback(() => {
      return (
        <div className="insert-beat-wrapper" ref={rightButtons}>
          <Button bsSize="xs" title={t(`Insert ${hierarchyLevelName}`)} onClick={insert}>
            <Glyphicon glyph="plus" />
          </Button>
        </div>
      )
    }, [rightButtons, hierarchyLevelName, insert])

    const extend = (boundingClientRect) => {
      return {
        left: boundingClientRect.left,
        top: boundingClientRect.top,
        bottom: boundingClientRect.bottom,
        right: boundingClientRect.left + adjustedWidth(),
      }
    }

    const headingContains = (mouseCoord) => {
      if (!container.current) {
        return false
      }
      // Accounts for modals and other stacking contexts on top of this.
      const elementHoveredOver = document.elementFromPoint(mouseCoord.x, mouseCoord.y)
      if (elementHoveredOver && typeof elementHoveredOver.classList?.contains === 'function') {
        const hoveringOnThisElement = container.current.contains(elementHoveredOver)
        const hoveringOnPlaceholder = elementHoveredOver.classList.contains('beat__heading-spacer')
        return (
          (hoveringOnPlaceholder || hoveringOnThisElement) &&
          boundingRectContains(extend(container.current.getBoundingClientRect()), mouseCoord)
        )
      } else {
        return false
      }
    }

    const bottomButtonsContain = (mouseCoord) => {
      if (!bottomButtons.current) {
        return false
      }
      // Accounts for modals and other stacking contexts on top of this.
      const hoveringOnThisElement = bottomButtons.current.contains(
        document.elementFromPoint(mouseCoord.x, mouseCoord.y)
      )
      return (
        hoveringOnThisElement &&
        bottomButtons.current &&
        boundingRectContains(bottomButtons.current.getBoundingClientRect(), mouseCoord)
      )
    }

    const rightButtonsContain = (mouseCoord) => {
      if (!rightButtons.current) {
        return false
      }
      // Accounts for modals and other stacking contexts on top of this.
      const hoveringOnThisElement = rightButtons.current.contains(
        document.elementFromPoint(mouseCoord.x, mouseCoord.y)
      )
      return (
        hoveringOnThisElement &&
        rightButtons.current &&
        boundingRectContains(rightButtons.current.getBoundingClientRect(), mouseCoord)
      )
    }

    const adjustedWidth = useCallback(() => {
      return width - (span === 1 && beats.length <= 1 ? 0 : isMedium ? 7 : 27)
    }, [width, span, beats.length, isMedium])

    const handleEsc = useCallback(
      (event) => {
        if (event.which === 27 || event.which === 13) {
          stopEditingBeatHeadingTitle()
        }
      },
      [stopEditingBeatHeadingTitle]
    )

    const rightControlsPosition = useCallback(() => {
      const controlHeight = 25
      const offset = Math.floor(controlHeight / 2)
      const bodyElement = container.current.querySelector('.beat__heading-wrapper')
      if (bodyElement) {
        const { height, top } = bodyElement.getBoundingClientRect()
        const containerRect = container.current.getBoundingClientRect()
        return {
          top: top + Math.floor(height / 2) - offset,
          left: containerRect.left + adjustedWidth(),
        }
      } else {
        const { height, left, top } = container.current.getBoundingClientRect()
        return { top: top + Math.floor(height / 2) - offset, left: left + width - 27 }
      }
    }, [container, width, adjustedWidth])

    const bottomControlsPosition = useCallback(() => {
      const controlWidth = 71
      const { bottom, left } = container.current.getBoundingClientRect()
      return {
        top: bottom - 4,
        left: left + (width - (isMedium ? 0 : spacerCellWidth || 0)) / 2 - controlWidth / 2,
      }
    }, [container, isMedium, spacerCellWidth, width])

    if (editing) {
      const focusCandidate =
        timelineFoci.length && typeof timelineFoci[0] !== 'undefined' && timelineFoci[0]
      const selection =
        Array.isArray(focusCandidate.path) &&
        focusCandidate.path[0] === 'beat' &&
        focusCandidate.path[1] === beatId &&
        focusCandidate.path[2] === 'title' &&
        focusCandidate.selection

      return (
        <FormGroup>
          <ControlLabel className={cx({ darkmode: darkMode })}>{beatTitle}</ControlLabel>
          <FormControl
            type="text"
            onChange={(event) => {
              editBeatTitle(beatId, currentTimeline, event.target.value)
            }}
            value={beat?.title}
            autoFocus
            selection={selection}
            onKeyDown={handleEsc}
            onBlur={stopEditing}
          />
        </FormGroup>
      )
    }

    return (
      <>
        {renderDelete()}
        <MousePositionContext.Consumer>
          {(mouseCoord) => {
            const hovering =
              container.current && mouseCoord.x !== null && mouseCoord.y !== null
                ? headingContains(mouseCoord) ||
                  bottomButtonsContain(mouseCoord) ||
                  rightButtonsContain(mouseCoord)
                : false
            return (
              <Cell
                ref={(ref) => {
                  container.current = ref
                }}
              >
                <Floater
                  hideArrow={true}
                  open={hovering}
                  contentLocation={rightControlsContentLocation}
                  component={renderAddPeer}
                >
                  <div
                    className={cx('beat__heading-wrapper', {
                      'medium-timeline': isMedium,
                    })}
                    style={{ width: headingCellWidth, overflow: 'visible' }}
                    title={beatTitle}
                    onDrop={handleDrop}
                  >
                    <Floater
                      hideArrow={true}
                      open={hovering}
                      placement="bottom"
                      align="start"
                      contentLocation={bottomControlsContentLocation}
                      component={renderControls}
                    >
                      <div
                        style={{
                          ...hierarchyToStyles(
                            hierarchyLevel,
                            timelineSize,
                            hovering === beatId || inDropZone,
                            darkMode === true ? hierarchyLevel.dark : hierarchyLevel.light,
                            darkMode
                          ),
                          ...(isMedium ? {} : { padding: '10px 10px' }),
                          ...(width
                            ? {
                                width: adjustedWidth(),
                              }
                            : {}),
                        }}
                        className={cx('beat__heading', {
                          'medium-timeline': isMedium,
                          darkmode: darkMode,
                        })}
                        onClick={startEditing}
                        draggable={!readOnly}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                      >
                        {span > 1 ? (
                          <div className={cx('beat__heading-drag-handle', { hovering })}>
                            <FaGripLinesVertical />
                          </div>
                        ) : null}
                        {renderTitle()}
                      </div>
                    </Floater>
                  </div>
                </Floater>
              </Cell>
            )
          }}
        </MousePositionContext.Consumer>
      </>
    )
  }

  BeatHeadingCell.propTypes = {
    span: PropTypes.number.isRequired,
    beatId: PropTypes.number.isRequired,
    beatTitle: PropTypes.string.isRequired,
    isMedium: PropTypes.bool,
    hierarchyLevel: PropTypes.object.isRequired,
    darkMode: PropTypes.bool,
    timelineSize: PropTypes.string.isRequired,
    readOnly: PropTypes.bool,
    beats: PropTypes.array.isRequired,
    hierarchyLevelName: PropTypes.string.isRequired,
    currentTimeline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    insertBeat: PropTypes.func.isRequired,
    editBeatTitle: PropTypes.func.isRequired,
    beat: PropTypes.object.isRequired,
    hierarchyLevels: PropTypes.array.isRequired,
    deleteBeat: PropTypes.func.isRequired,
    lastClick: PropTypes.object,
    editing: PropTypes.bool,
    timelineFoci: PropTypes.array.isRequired,
    reorderBeats: PropTypes.func.isRequired,
    expandBeat: PropTypes.func.isRequired,
    dropBeat: PropTypes.func.isRequired,
    droppedBeat: PropTypes.object,
    collectBeat: PropTypes.func.isRequired,
    startEditingBeatHeadingTitle: PropTypes.func.isRequired,
    stopEditingBeatHeadingTitle: PropTypes.func.isRequired,
    batch: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector

  if (redux) {
    const { connect } = redux

    const uniqueBeatTitleSelector = selectors.makeBeatTitleSelector()
    const uniqueBeatsSelector = selectors.makeBeatSelector()

    return connect(
      (state, ownProps) => {
        return {
          beatTitle: uniqueBeatTitleSelector(state, ownProps.beatId),
          isMedium: selectors.isMediumSelector(state),
          hierarchyLevel: selectors.hierarchyLevelSelector(state, ownProps.beatId),
          darkMode: selectors.isDarkModeSelector(state),
          timelineSize: selectors.timelineSizeSelector(state),
          readOnly: !selectors.canWriteSelector(state),
          beats: selectors.visibleSortedBeatsForTimelineByBookSelector(state),
          hierarchyLevelName: selectors.beatInsertControlHierarchyLevelNameSelector(
            state,
            ownProps.beatId
          ),
          currentTimeline: selectors.currentTimelineSelector(state),
          beat: uniqueBeatsSelector(state, ownProps.beatId),
          hierarchyLevels: selectors.sortedHierarchyLevels(state),
          lastClick: selectors.lastClickSelector(state),
          droppedBeat: selectors.droppedBeatSelector(state),
          editing: selectors.editingGivenBeatsTitleSelector(state, ownProps.beatId),
          timelineFoci: selectors.timelineFociSelector(state),
        }
      },
      {
        insertBeat: actions.beat.insertBeat,
        editBeatTitle: actions.beat.editBeatTitle,
        deleteBeat: actions.beat.deleteBeat,
        reorderBeats: actions.beat.reorderBeats,
        expandBeat: actions.beat.expandBeat,
        dropBeat: actions.domEvents.dropBeat,
        collectBeat: actions.domEvents.collectBeat,
        startEditingBeatHeadingTitle: actions.ui.startEditingBeatHeadingTitle,
        stopEditingBeatHeadingTitle: actions.ui.stopEditingBeatHeadingTitle,
        batch: actions.undo.batch,
      }
    )(BeatHeadingCell)
  }

  throw new Error('Could not connect BeatHeadingCell!')
}

export default BeatHeadingCellConnector
