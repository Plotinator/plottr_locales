import React, { useState, useRef, useEffect, useCallback } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Row, Cell } from 'react-sticky-table'

import { selectors, actions } from 'wired-up-pltr'
import { helpers } from 'pltr'

import Glyphicon from '../Glyphicon'
import BeatTitleCell from './BeatTitleCell'
import BeatHeadingCell from './BeatHeadingCell'
import LineTitleCell from './LineTitleCell'
import BeatInsertCell from './BeatInsertCell'
import AddLineColumn from './AddLineColumn'
import MousePositionContext from './MousePositionContext'
import { isEqual } from 'lodash'

const {
  beats: { hasChildren },
  orientedClassName: { orientedClassName },
} = helpers

const TopRow = (props) => {
  const {
    orientation,
    isSmall,
    timelineViewIsStacked,
    topTierBeats,
    secondTierBeats,
    leavesPerBeat,
    isMedium,
  } = props

  const [mouseXY, setMouseXY] = useState({ x: 0, y: 0 })

  const firstCell = useRef(null)

  useEffect(() => {
    if (firstCell.current) {
      // @ts-ignore
      firstCell.current.style.zIndex = 101
    }
    if (timelineViewIsStacked) {
      let lastMoveTimeout = null
      const mouseMoveListener = document.addEventListener('mousemove', (event) => {
        if (lastMoveTimeout) {
          clearTimeout(lastMoveTimeout)
        }
        lastMoveTimeout = setTimeout(() => {
          const newMouseXY = {
            x: event.pageX,
            y: event.pageY,
          }
          if (!isEqual(mouseXY, newMouseXY)) {
            setMouseXY(newMouseXY)
          }
        }, 10)
      })
      return () => {
        // @ts-ignore
        document.removeEventListener('mousemove', mouseMoveListener)
        clearTimeout(lastMoveTimeout)
      }
    }
    return () => {}
  }, [timelineViewIsStacked])

  const handleReorderBeats = useCallback(
    (droppedPositionId, originalPositionId) => {
      const { currentTimeline, beatActions } = props
      beatActions.reorderBeats(originalPositionId, droppedPositionId, currentTimeline)
    },
    [props.currentTimeline, props.beatActions]
  )

  const handleReorderLines = useCallback(
    (droppedPosition, originalPosition) => {
      const { lineActions } = props
      lineActions.reorderLines(droppedPosition, originalPosition)
    },
    [props.lineActions]
  )

  const handleTogglePinPlotline = useCallback(
    (line) => {
      const { lineActions } = props
      lineActions.togglePinPlotline(line)
    },
    [props.lineActions]
  )

  const handleInsertNewBeat = useCallback(
    (peerBeatId) => {
      const { currentTimeline, beatActions } = props
      beatActions.insertBeat(currentTimeline, peerBeatId)
    },
    [props.beatActions, props.currentTimeline]
  )

  const handleInsertChildBeat = useCallback(
    (beatToLeftId) => {
      const { currentTimeline, beatActions, undo } = props
      undo.batch('Insert Child Beat', () => {
        beatActions.expandBeat(beatToLeftId, currentTimeline)
        beatActions.addBeat(currentTimeline, beatToLeftId)
      })
    },
    [props.beatActions, props.currentTimeline]
  )

  const handleAppendBeat = useCallback(() => {
    const { currentTimeline, beatActions, beats, timelineViewIsTabbed, activeTab } = props
    if (timelineViewIsTabbed) {
      if (beats.length === 0) {
        handleInsertChildBeat(activeTab)
      } else {
        handleInsertNewBeat(beats[beats.length - 1]?.id)
      }
    } else {
      beatActions.addBeat(currentTimeline)
    }
  }, [
    props.currentTimeline,
    props.beatActions,
    props.beats,
    props.timelineViewIsTabbed,
    props.activeTab,
    handleInsertChildBeat,
    handleInsertNewBeat,
  ])

  const handleAppendLine = useCallback(() => {
    const { currentTimeline, lineActions } = props
    lineActions.addLine(currentTimeline)
  }, [props.lineActions, props.currentTimeline])

  const renderSecondLastInsertBeatCell = () => {
    const { timelineViewIsStacked, timelineViewIsTabbed, isLarge, isMedium } = props
    if (!isLarge && !isMedium) return null
    if (timelineViewIsTabbed || timelineViewIsStacked) {
      return <Cell key={`placeholder-beat-second-last-insert`} />
    }

    return timelineViewIsStacked ? null : <Cell key={`placeholder-beat-last-insert`} />
  }

  const renderLastInsertBeatCell = () => {
    if (timelineViewIsStacked) {
      return null
    }

    return (
      <BeatInsertCell
        key="last-insert"
        handleInsert={handleAppendBeat}
        isInBeatList={true}
        isLast={true}
        orientation={orientation}
      />
    )
  }

  const renderBeats = () => {
    const { orientation, booksBeats, beats, isLarge, isMedium, isSmall } = props
    const renderedBeats = beats.flatMap((beat, idx) => {
      const lastBeat = beats[idx - 1]
      const cells = []
      if (beat.isInsertChildCell) {
        cells.push([
          <BeatInsertCell
            key={`beatId-${beat.id}-insert-child`}
            isInBeatList={true}
            isInsertChildCell
            handleInsert={handleInsertChildBeat}
            beatToLeft={beat}
            orientation={orientation}
          />,
          ...(isMedium ? [] : [<Cell key={`beatId-${beat.id}-insert-child-peer-dummy-cell`} />]),
        ])
      } else {
        cells.push(
          <BeatTitleCell
            isFirst={idx === 0}
            key={`beatId-${beat.id}`}
            beatId={beat.id}
            handleReorder={handleReorderBeats}
            handleInsert={handleInsertNewBeat}
            handleInsertChild={
              lastBeat && hasChildren(booksBeats, lastBeat && lastBeat.id)
                ? undefined
                : handleInsertChildBeat
            }
          />
        )
      }
      return cells
    })
    if (isSmall) {
      return [...renderedBeats, renderLastInsertBeatCell()]
    } else if (!beats.length) {
      return [
        <Cell
          key="placeholder"
          ref={(ref) => {
            firstCell.current = ref
          }}
        />,
        renderLastInsertBeatCell(),
      ]
    } else {
      return [
        <Cell
          style={{ zIndex: 101 }}
          key="placeholder"
          ref={(ref) => {
            firstCell.current = ref
          }}
        />,
        isMedium || isLarge ? <Cell style={{ zIndex: 101 }} key="placeholder-2" /> : null,
        ...renderedBeats,
        renderSecondLastInsertBeatCell(),
        renderLastInsertBeatCell(),
      ]
    }
  }

  const renderLines = () => {
    const { lines, currentTimeline, orientation, isSmall, isMedium, isLarge } = props
    const renderedLines = lines.map((line, index) => (
      <LineTitleCell
        key={`line-${line.id}`}
        line={line}
        handleReorder={handleReorderLines}
        togglePinPlotline={handleTogglePinPlotline}
        bookId={currentTimeline}
        zIndex={100 - index}
      />
    ))
    const insertLineDiv = (
      <div
        className={orientedClassName('line-list__append-line--small', orientation)}
        onClick={handleAppendLine}
      >
        <div className={orientedClassName('line-list__append-line-wrapper--small', orientation)}>
          <Glyphicon glyph="plus" />
        </div>
      </div>
    )

    if (isSmall) {
      const insertLineTH = (
        <th key="insert-line" className="rotate-45">
          {insertLineDiv}
        </th>
      )
      return [...renderedLines, insertLineTH]
    }

    let finalArray = [<Cell key="placeholder" style={{ zIndex: 101 }} />, ...renderedLines]
    if (isLarge || isMedium) {
      const insertLineCell = (
        <Row key="insert-line">
          <AddLineColumn />
        </Row>
      )
      finalArray = [...finalArray, insertLineCell]
    }
    return finalArray
  }

  const renderPaddingCells = (beatId, count) => {
    const { isLarge } = props
    const paddingCells = []
    for (let i = 0; i < count; ++i) {
      paddingCells.push(
        <Cell key={`padding-cell-${beatId}-${i}-1`} className="beat__heading-spacer" />
      )
      if (isLarge) {
        paddingCells.push(
          <Cell key={`padding-cell-${beatId}-${i}-2`} className="beat__heading-spacer" />
        )
      }
    }
    return paddingCells
  }

  const renderTieredBeats = (beats, leavesPerBeat) => {
    const { isLarge } = props
    return [
      <Cell key="placeholder" style={{ zIndex: 101 }} />,
      ...beats.flatMap((beat, index) => {
        const beatLeaves = leavesPerBeat.get(beat.id)
        return [
          isLarge ? <Cell key={`place-holder${index}`} /> : null,
          <BeatHeadingCell
            key={`beatId-${beat.id || 'idx-' + index}`}
            span={beatLeaves}
            beatId={beat.id}
          />,
          ...renderPaddingCells(beat.id, beatLeaves - 1),
        ]
      }),
    ]
  }

  let body = null
  if (orientation === 'horizontal') body = renderBeats()
  else body = renderLines()

  if (isSmall) {
    return (
      <thead>
        <tr>
          <th></th>
          {body}
        </tr>
      </thead>
    )
  } else {
    if (timelineViewIsStacked) {
      return (
        <MousePositionContext.Provider value={mouseXY}>
          {[
            topTierBeats.length ? (
              <Row key="3rd-level-row">
                {isMedium ? <Cell style={{ zIndex: 101 }} key="top-placeholder-2" /> : null}
                {renderTieredBeats(topTierBeats, leavesPerBeat)}
              </Row>
            ) : null,
            secondTierBeats.length ? (
              <Row key="2nd-level-row">
                {isMedium ? <Cell style={{ zIndex: 101 }} key="second-tier-placeholder-2" /> : null}
                {renderTieredBeats(secondTierBeats, leavesPerBeat)}
              </Row>
            ) : null,
            <Row id="table-beat-row" key="beats-title-row">
              {body}
            </Row>,
          ]}
        </MousePositionContext.Provider>
      )
    }
    return <Row id="table-beat-row">{body}</Row>
  }
}

TopRow.propTypes = {
  currentTimeline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  orientation: PropTypes.string.isRequired,
  isSeries: PropTypes.bool,
  isSmall: PropTypes.bool,
  isMedium: PropTypes.bool,
  isLarge: PropTypes.bool,
  beats: PropTypes.array,
  booksBeats: PropTypes.object,
  nextBeatId: PropTypes.number,
  hovering: PropTypes.number,
  lines: PropTypes.array,
  lineActions: PropTypes.object,
  beatActions: PropTypes.object,
  undo: PropTypes.object,
  timelineViewIsStacked: PropTypes.bool,
  topTierBeats: PropTypes.array,
  secondTierBeats: PropTypes.array,
  leavesPerBeat: PropTypes.object.isRequired,
  timelineViewIsTabbed: PropTypes.bool,
  activeTab: PropTypes.number.isRequired,
}

const LineActions = actions.line
const BeatActions = actions.beat
const UndoActions = actions.undo

const mapStateToProps = (state) => {
  return {
    currentTimeline: selectors.currentTimelineSelector(state),
    orientation: selectors.orientationSelector(state),
    isSeries: selectors.isSeriesSelector(state),
    isSmall: selectors.isSmallSelector(state),
    isMedium: selectors.isMediumSelector(state),
    isLarge: selectors.isLargeSelector(state),
    beats: selectors.visibleSortedBeatsForTimelineByBookSelector(state),
    booksBeats: selectors.beatsByBookSelector(state),
    nextBeatId: selectors.nextBeatIdSelector(state),
    lines: selectors.sortedLinesByBookSelector(state),
    timelineViewIsStacked: selectors.timelineViewIsStackedSelector(state),
    topTierBeats: selectors.topTierBeatsInThreeTierArrangementSelector(state),
    secondTierBeats: selectors.secondTierBeatsInAtLeastTwoTierArrangementSelector(state),
    leavesPerBeat: selectors.leavesPerBeatSelector(state),
    timelineViewIsTabbed: selectors.timelineViewIsTabbedSelector(state),
    activeTab: selectors.timelineActiveTabSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    lineActions: bindActionCreators(LineActions, dispatch),
    beatActions: bindActionCreators(BeatActions, dispatch),
    undo: bindActionCreators(UndoActions, dispatch),
  }
})(TopRow)
