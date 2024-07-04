import React, { useRef, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import cx from 'classnames'

import { t } from 'plottr_locales'
import { selectors, actions } from 'wired-up-pltr'
import { initialState } from 'pltr'

import Glyphicon from '../Glyphicon'
import Button from '../Button'
import PlottrModal from '../PlottrModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import DropdownButton from '../DropdownButton'
import MenuItem from '../MenuItem'
import HierarchyLevel from './HierarchyLevel'
import ToolTip from '../ToolTip'

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
const { newHierarchyLevel } = initialState

const ActsConfigModal = ({
  closeDialog,
  levelsOfHierarchy,
  hierarchyLevels,
  setHierarchyLevels,
  isDarkMode,
  timelineView,
  setTimelineView,
}) => {
  const [stagedHierarchyLevels, setStagedHierarchyLevels] = useState(null)

  const levelsInputRef = useRef()

  const selectLevelsText = () => {
    if (levelsInputRef.current) {
      // @ts-ignore
      levelsInputRef.current.setSelectionRange(0, levelsInputRef.current.value.length)
    }
  }

  useEffect(() => {
    if (levelsInputRef.current && levelsInputRef.current === document.activeElement) {
      selectLevelsText()
    }
  }, [levelsOfHierarchy])

  const onLevelsOfHierarchyChanged = (event) => {
    const unclippedValue = parseInt(event.target.value)
    if (!unclippedValue) return

    const targetLength = Math.max(0, Math.min(3, unclippedValue))
    const currentLength = hierarchyLevels.length
    if (targetLength === currentLength) return
    else if (targetLength > currentLength) {
      let newLevels = hierarchyLevels
      for (let i = 0; i < targetLength - currentLength; ++i) {
        newLevels = [newHierarchyLevel(newLevels), ...newLevels]
      }
      setHierarchyLevels(newLevels)
    } else {
      setStagedHierarchyLevels(hierarchyLevels.slice(currentLength - targetLength))
    }
  }

  const RemoveLevelConfirmation = () =>
    stagedHierarchyLevels ? (
      <DeleteConfirmModal
        customText={t(
          "Are you sure? Removing a level will delete the timeline cards directly under this level's heading cards."
        )}
        onDelete={() => {
          setHierarchyLevels(stagedHierarchyLevels)
          setStagedHierarchyLevels(null)
        }}
        onCancel={() => {
          setStagedHierarchyLevels(null)
        }}
      />
    ) : null

  return (
    <>
      <RemoveLevelConfirmation />
      <PlottrModal isOpen={true} onRequestClose={closeDialog} style={modalStyles}>
        <div className="acts-modal__wrapper">
          <div className="acts-modal__header">
            <div>
              <h3>{t('Timeline Structure')}</h3>
              <Button onClick={closeDialog}>{t('Close')}</Button>
            </div>
            <hr />
          </div>
          <div className="acts-modal__body">
            <div className="acts-modal__timeline-controls-wrapper">
              <div className="acts-modal__timeline-view-controls">
                <h5>{t('View')}</h5>
                <div className="acts-modal__timeline-view-dropdown">
                  <DropdownButton
                    id="select-timeline-view"
                    className="acts-modal__select-line"
                    title={timelineView}
                  >
                    <MenuItem key={'default'} onSelect={() => setTimelineView('default')}>
                      <div className="acts-modal__timeline-view-selector">{t('Default')}</div>
                    </MenuItem>
                    {hierarchyLevels.length < 2 ? (
                      <ToolTip
                        id={`acts-modal-tabbed-tooltip`}
                        placement="right"
                        text={t('At least two levels of hierarchy required to view as tabs')}
                      >
                        <MenuItem key={'tabbed'} disabled={true}>
                          <div className="acts-modal__timeline-view-selector disabled">
                            {t('Tabbed')}
                          </div>
                        </MenuItem>
                      </ToolTip>
                    ) : (
                      <MenuItem
                        disabled={hierarchyLevels.length < 2}
                        key={'tabbed'}
                        onSelect={() => setTimelineView('tabbed')}
                        title={t('View timeline ith tabs for the highest level')}
                      >
                        <div
                          className={cx(`acts-modal__timeline-view-selector`, {
                            disabled: hierarchyLevels.length < 2,
                          })}
                        >
                          {t('Tabbed')}
                        </div>
                      </MenuItem>
                    )}
                    {hierarchyLevels.length < 2 ? (
                      <ToolTip
                        id={`acts-modal-tabbed-tooltip`}
                        placement="right"
                        text={t('At least two levels of hierarchy required to view as stacked')}
                      >
                        <MenuItem
                          disabled={hierarchyLevels.length < 2}
                          key={'stacked'}
                          onSelect={() => setTimelineView('stacked')}
                        >
                          <div
                            className={cx(`acts-modal__timeline-view-selector`, {
                              disabled: hierarchyLevels.length < 2,
                            })}
                          >
                            {t('Stacked')}
                          </div>
                        </MenuItem>
                      </ToolTip>
                    ) : (
                      <MenuItem key={'stacked'} onSelect={() => setTimelineView('stacked')}>
                        <div className="acts-modal__timeline-view-selector">{t('Stacked')}</div>
                      </MenuItem>
                    )}
                  </DropdownButton>
                </div>
              </div>
              <h5>{t('Levels')}</h5>
              <div className="acts-modal__hierarchy-count-controls">
                {hierarchyLevels.length > 1 ? (
                  <button
                    className="acts-modal__hierarchy-count-adjustment-control"
                    onClick={() => {
                      if (hierarchyLevels.length > 1) {
                        setStagedHierarchyLevels(hierarchyLevels.slice(1))
                      }
                    }}
                  >
                    <Glyphicon glyph="minus" />
                  </button>
                ) : null}
                <input
                  // @ts-ignore
                  ref={levelsInputRef}
                  className="acts-modal__hierarchy-count"
                  type="text"
                  value={levelsOfHierarchy}
                  onChange={onLevelsOfHierarchyChanged}
                  onFocus={selectLevelsText}
                  onKeyDown={(event) => {
                    if (event.which === 13) {
                      onLevelsOfHierarchyChanged(event)
                    }
                  }}
                />
                {hierarchyLevels.length < 3 ? (
                  <button
                    className="acts-modal__hierarchy-count-adjustment-control"
                    onClick={() => {
                      if (hierarchyLevels.length < 3) {
                        setHierarchyLevels([newHierarchyLevel(hierarchyLevels), ...hierarchyLevels])
                      }
                    }}
                  >
                    <Glyphicon glyph="plus" />
                  </button>
                ) : null}
              </div>
            </div>
            <div className="acts-modal__levels-table">
              <div className="acts-modal__levels-table-header">
                <div className="acts-modal__levels-table-cell">{t('Level')}</div>
                <div className="acts-modal__levels-table-cell">{t('Name')}</div>
                <div className="acts-modal__levels-table-cell">{t('Text Color')}</div>
                <div className="acts-modal__levels-table-cell">{t('Border Color')}</div>
                <div className="acts-modal__levels-table-cell">{t('Border Style')}</div>
                <div className="acts-modal__levels-table-cell">{t('Background Color')}</div>
              </div>
              {hierarchyLevels.map((args, idx) => (
                <React.Fragment key={args.level}>
                  <HierarchyLevel
                    {...args}
                    isDarkMode={isDarkMode}
                    isHighest={idx == 0}
                    isLowest={idx == 2}
                    displayLevelNumber={hierarchyLevels.length - idx}
                  />
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="acts-modal__footer"></div>
        </div>
      </PlottrModal>
    </>
  )
}

ActsConfigModal.propTypes = {
  closeDialog: PropTypes.func.isRequired,
  levelsOfHierarchy: PropTypes.number.isRequired,
  hierarchyLevels: PropTypes.array.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  setHierarchyLevels: PropTypes.func.isRequired,
  timelineView: PropTypes.string.isRequired,
  setTimelineView: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  levelsOfHierarchy: selectors.hierarchyLevelCount(state),
  hierarchyLevels: selectors.sortedHierarchyLevels(state),
  timelineView: selectors.timelineViewSelector(state),
})

export default connect(mapStateToProps, {
  setHierarchyLevels: actions.hierarchyLevels.setHierarchyLevels,
  setTimelineView: actions.ui.setTimelineView,
})(ActsConfigModal)
