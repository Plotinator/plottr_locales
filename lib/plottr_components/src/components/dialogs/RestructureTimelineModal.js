import React, { useState } from 'react'
import { PropTypes } from 'prop-types'
import cx from 'classnames'
import { cloneDeep } from 'lodash'

import { t } from 'plottr_locales'

import Button from '../Button'
import MenuItem from '../MenuItem'
import DropdownButton from '../DropdownButton'
import UnconnectedPlottrModal from '../PlottrModal'
import { checkDependencies } from '../checkDependencies'

const modalStyles = {
  overlay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '75%',
    position: 'relative',
    left: 'auto',
    bottom: 'auto',
    right: 'auto',
    minHeight: 500,
    maxHeight: 'calc(100vh - 120px)',
    borderRadius: 20,
  },
}

const RestructureTimelineModalConnector = (connector) => {
  const UnconnectedBeatRow = (connector) => {
    const BeatRow = ({
      id,
      title,
      hierarchyLevel,
      hierarchyLevels,
      setHierarchyLevel,
      handleDrop,
      handleDragStart,
    }) => {
      const [draggingOver, setDraggingOver] = useState(false)

      const handleDragOver = (event) => {
        event.preventDefault()
        event.stopPropagation()
        event.dataTransfer.dropEffect = 'move'
        setDraggingOver(true)
      }

      const handleDragLeave = (event) => {
        setDraggingOver(false)
      }

      const handleDroppedHere = (event) => {
        event.stopPropagation()
        setDraggingOver(false)
        handleDrop(id)
      }

      const handleDragStartHere = (event) => {
        handleDragStart(id)
      }

      return (
        <tr
          draggable
          className={cx({
            'dragging-over': draggingOver,
          })}
          onDragStart={handleDragStartHere}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDroppedHere}
        >
          <td>{title}</td>
          <td>
            <DropdownButton
              id="select-timeline-view"
              className="restructure-modal__select-line"
              title={hierarchyLevel.name}
            >
              {hierarchyLevels.map((level, index) => {
                return (
                  <MenuItem key={index} onSelect={() => setHierarchyLevel(id, level)}>
                    <div className="restructure-modal__hierarchy-level-selector">
                      {t(level.name)}
                    </div>
                  </MenuItem>
                )
              })}
            </DropdownButton>
          </td>
        </tr>
      )
    }

    BeatRow.propTypes = {
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      hierarchyLevel: PropTypes.object.isRequired,
      hierarchyLevels: PropTypes.array.isRequired,
      setHierarchyLevel: PropTypes.func.isRequired,
      handleDrop: PropTypes.func.isRequired,
      handleDragStart: PropTypes.func.isRequired,
    }

    const { redux } = connector
    checkDependencies({ redux })

    if (redux) {
      const {
        pltr: { selectors },
      } = connector
      const { connect } = redux
      const uniqueBeatTitleSelector = selectors.makeBeatTitleSelector()

      return connect((state, ownProps) => ({
        title: uniqueBeatTitleSelector(state.present, ownProps.id),
        hierarchyLevels: selectors.sortedHierarchyLevels(state.present),
      }))(BeatRow)
    }

    throw new Error('Could not connect BeatRow')
  }

  const PlottrModal = UnconnectedPlottrModal(connector)
  const BeatRow = UnconnectedBeatRow(connector)

  const RestructureTimelineModal = ({ closeDialog, beats, beatHierarchyLevels }) => {
    const [stagedBeats, setStagedBeats] = useState(beats)
    const [stagedHierarchyLevels, setStagedHierarchyLevels] = useState(beatHierarchyLevels)
    const [beatDraggedId, setBeatDraggedId] = useState(null)

    const handleSetHierarchyLevel = (id, level) => {
      const index = stagedBeats.findIndex((beat) => {
        return beat.id === id
      })
      const newHierarchyLevels = cloneDeep(stagedHierarchyLevels)
      newHierarchyLevels[index] = level
      setStagedHierarchyLevels(newHierarchyLevels)
    }

    const handleDragStart = (id) => {
      setBeatDraggedId(id)
    }

    const handleDrop = (id) => {
      const beatDraggedIndex = stagedBeats.findIndex((beat) => {
        return beat.id === beatDraggedId
      })
      const beatDroppedIndex = stagedBeats.findIndex((beat) => {
        return beat.id === id
      })

      const beatDragged = stagedBeats[beatDraggedIndex]
      const newBeats = stagedBeats.flatMap((beat) => {
        if (beat.id === beatDraggedId) {
          return []
        } else if (beat.id === id) {
          return [beatDragged, beat]
        } else {
          return [beat]
        }
      })

      const hierarchyDragged = stagedHierarchyLevels[beatDraggedIndex]
      const newHierarchyLevels = stagedHierarchyLevels.flatMap((hierarchyLevel, index) => {
        if (index === beatDraggedIndex) {
          return []
        } else if (index === beatDroppedIndex) {
          return [hierarchyDragged, hierarchyLevel]
        } else {
          return [hierarchyLevel]
        }
      })
      setStagedBeats(newBeats)
      setStagedHierarchyLevels(newHierarchyLevels)
      setBeatDraggedId(null)
    }

    return (
      <PlottrModal isOpen={true} onRequestClose={closeDialog} style={modalStyles}>
        <div className="restructure-modal__wrapper">
          <div className="restructure-modal__header">
            <div>
              <h3>{t('Restructure Timeline')}</h3>
              <Button onClick={closeDialog}>{t('Discard')}</Button>
            </div>
            <hr />
          </div>
          <div className="restructure-modal__body">
            <table>
              <thead>
                <tr>
                  <th>{t('Name')}</th>
                  <th>{t('Structure Type')}</th>
                </tr>
              </thead>
              {stagedBeats.map(({ id }, index) => {
                return (
                  <React.Fragment key={id}>
                    <BeatRow
                      id={id}
                      hierarchyLevel={stagedHierarchyLevels[index]}
                      setHierarchyLevel={handleSetHierarchyLevel}
                      handleDrop={handleDrop}
                      handleDragStart={handleDragStart}
                    />
                  </React.Fragment>
                )
              })}
            </table>
          </div>
          <div className="restructure-modal__footer">
            <hr />
            <Button bsStyle="success" onClick={closeDialog}>
              {t('Restructure')}
            </Button>
          </div>
        </div>
      </PlottrModal>
    )
  }

  RestructureTimelineModal.propTypes = {
    closeDialog: PropTypes.func.isRequired,
    beats: PropTypes.array.isRequired,
    beatHierarchyLevels: PropTypes.array.isRequired,
  }

  const { redux } = connector
  checkDependencies({ redux })

  if (redux) {
    const {
      pltr: { selectors, actions },
    } = connector
    const { connect } = redux
    return connect(
      (state) => {
        const beats = selectors.visibleSortedBeatsForTimelineByBookSelector(state.present)
        const beatHierarchyLevels = beats.map((beat) => {
          return selectors.hierarchyLevelSelector(state.present, beat.id)
        })
        return {
          beatHierarchyLevels,
          sortedHierarchyLevels: selectors.sortedHierarchyLevels(state.present),
          beats,
        }
      },
      {
        closeDialog: actions.ui.closeRestructureTimelineModal,
      }
    )(RestructureTimelineModal)
  }

  throw new Error('Could not connect RestructureTimelineModal')
}

export default RestructureTimelineModalConnector
