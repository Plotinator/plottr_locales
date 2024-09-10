import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { StickyTable } from 'react-sticky-table'
import cx from 'classnames'

import { selectors, actions } from 'wired-up-pltr'
import { t } from 'plottr_locales'

import Tabs from '../Tabs'
import Tab from '../Tab'
import Glyphicon from '../Glyphicon'
import MenuItem from '../MenuItem'
import Popover from '../PlottrPopover'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import InputModal from '../dialogs/InputModal'
import { FunSpinner } from '../Spinner'
import Floater from '../PlottrFloater'
import TimelineTable from './TimelineTable'

const TimelineTabs = ({
  activeTab,
  timelineTabs,
  timelineTabBeatIds,
  topLevelBeatName,
  insertBeat,
  appendTopLevelBeat,
  setTimelineActiveTab,
  bookId,
  deleteBeat,
  focussedBeat,
  beatToDelete,
  setFocussedTimelineTabBeat,
  setTimelineTabBeatToDelete,
  setActConfigIsOpen,
  editBeatTitle,
  editingBeatTitleId,
  setEditingBeatTitleId,
  isSmall,
  setTableRef,
  tableRef,
  darkMode,
  mounted,
  orientation,
  stickyHeaderCount,
  stickyLeftColumnCount,
  batch,
}) => {
  const [contextMenuAnchor, setContextMenuAnchor] = useState(null)

  const handleSetActiveTab = (x) => {
    if (typeof x === 'number') {
      if (activeTab !== x) {
        setTimelineActiveTab(x)
      }
    } else if (x === 'add-top-level-beat-tab') {
      appendTopLevelBeat(bookId)
    }
  }

  const renderAddTopLevel = () => {
    const addTopLevelbeatTitle = (
      <Glyphicon glyph="plus" title={t(`Add ${topLevelBeatName} to the right`)} />
    )

    return (
      <Tab
        noHandlers
        eventKey="add-top-level-beat-tab"
        key="add-top-level-beat-tab"
        title={addTopLevelbeatTitle}
      />
    )
  }

  const openActStructure = () => {
    batch('Open Structure Configuration', () => {
      setActConfigIsOpen(true)
      setFocussedTimelineTabBeat(null)
    })
    setContextMenuAnchor(null)
  }

  const editBeatName = () => {
    batch('Edit Beat Name', () => {
      setEditingBeatTitleId(focussedBeat)
      setFocussedTimelineTabBeat(null)
    })
    setContextMenuAnchor(null)
  }

  const renderBeatContextMenu = () => {
    if (!contextMenuAnchor || !focussedBeat) {
      return null
    }

    const { top, left, width, height } =
      // @ts-ignore
      typeof contextMenuAnchor.getBoundingClientRect === 'function'
        ? // @ts-ignore
          contextMenuAnchor.getBoundingClientRect()
        : { top: 0, left: 0, width: 0, height: 0 }

    const contentLocation = { top: top - height, left: left + width }

    return (
      <Floater
        open
        rootClose
        placement="bottom"
        contentLocation={contentLocation}
        component={() => {
          return (
            <Popover id="tab-beat-menu" contentStyleOverride={{ padding: 0 }}>
              {/* @ts-ignore */}
              <ul className="tab-dropdown-menu">
                <MenuItem onSelect={insertPeerBeat}>{t(`Insert ${topLevelBeatName}`)}</MenuItem>
                <MenuItem onSelect={openActStructure}>{t('Configure Structure')}</MenuItem>
                <MenuItem onSelect={editBeatName}>{t('Edit Title')}</MenuItem>
                <MenuItem onSelect={stageBeatForDeletion}>{t('Delete')}</MenuItem>
              </ul>
            </Popover>
          )
        }}
        onClose={(event) => {
          event.stopPropagation()
          setContextMenuAnchor(null)
          setFocussedTimelineTabBeat(null)
        }}
      >
        <div />
      </Floater>
    )
  }

  const beatContextMenu = (beatId, target) => {
    if (focussedBeat) {
      setFocussedTimelineTabBeat(null)
      setContextMenuAnchor(null)
    } else {
      setFocussedTimelineTabBeat(beatId)
      setContextMenuAnchor(target)
    }
  }

  const insertPeerBeat = () => {
    batch('Insert Peer Beat', () => {
      insertBeat(bookId, focussedBeat)
      setFocussedTimelineTabBeat(null)
    })
  }

  const stageBeatForDeletion = () => {
    batch('Confirm Delete Beat', () => {
      setTimelineTabBeatToDelete(focussedBeat)
      setFocussedTimelineTabBeat(null)
    })
  }

  const renderDeleteBeat = () => {
    if (!beatToDelete) return null

    return (
      <DeleteConfirmModal
        onDelete={() => {
          batch('Delete Beat', () => {
            deleteBeat(beatToDelete, bookId)
            setTimelineTabBeatToDelete(null)
          })
        }}
        onCancel={() => setTimelineTabBeatToDelete(null)}
        customText="Are you sure you want to delete this tab and all it's beats and cards?"
        notSubmit
      />
    )
  }

  const tabClasses = (eventKey) => {
    return eventKey === focussedBeat ? { 'context-menu-open': true } : {}
  }

  const setBeatTitle = (newVal) => {
    const newTitle = newVal || 'auto'
    batch(`Set Beat Title ${newTitle}`, () => {
      editBeatTitle(editingBeatTitleId, bookId, newTitle)
      setEditingBeatTitleId(null)
    })
  }

  const renderInputModal = () => {
    if (!editingBeatTitleId) {
      return null
    }

    return (
      <InputModal
        title={t('Beat Title')}
        getValue={setBeatTitle}
        cancel={() => setEditingBeatTitleId(null)}
        isOpen={true}
        type="text"
      />
    )
  }

  return (
    <>
      <Tabs
        activeKey={activeTab}
        onSelect={handleSetActiveTab}
        onContextMenu={beatContextMenu}
        onDoubleClick={openActStructure}
        onDragOver={handleSetActiveTab}
        tabClasses={tabClasses}
      >
        {[
          ...timelineTabs.map((tabName, index) => {
            return (
              <Tab
                key={timelineTabBeatIds[index]}
                eventKey={timelineTabBeatIds[index]}
                title={tabName}
                className="timeline__tab"
              >
                {isSmall ? (
                  <TimelineTable
                    setTableRef={setTableRef}
                    tableRef={tableRef}
                    activeTab={activeTab}
                  />
                ) : (
                  <StickyTable
                    leftColumnZ={5}
                    headerZ={5}
                    wrapperRef={setTableRef}
                    className={cx({
                      darkmode: darkMode,
                      vertical: orientation == 'vertical',
                    })}
                    stickyHeaderCount={stickyHeaderCount}
                    leftStickyColumnCount={stickyLeftColumnCount}
                  >
                    {mounted ? (
                      <TimelineTable activeTab={activeTab} tableRef={tableRef} />
                    ) : (
                      <FunSpinner />
                    )}
                  </StickyTable>
                )}
              </Tab>
            )
          }),
          renderAddTopLevel(),
        ]}
      </Tabs>
      {renderBeatContextMenu()}
      {renderDeleteBeat()}
      {renderInputModal()}
    </>
  )
}

TimelineTabs.propTypes = {
  activeTab: PropTypes.number.isRequired,
  timelineTabs: PropTypes.array.isRequired,
  timelineTabBeatIds: PropTypes.array.isRequired,
  topLevelBeatName: PropTypes.string.isRequired,
  insertBeat: PropTypes.func.isRequired,
  appendTopLevelBeat: PropTypes.func.isRequired,
  setTimelineActiveTab: PropTypes.func.isRequired,
  bookId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  deleteBeat: PropTypes.func.isRequired,
  focussedBeat: PropTypes.number,
  beatToDelete: PropTypes.number,
  setFocussedTimelineTabBeat: PropTypes.func.isRequired,
  setTimelineTabBeatToDelete: PropTypes.func.isRequired,
  setActConfigIsOpen: PropTypes.func.isRequired,
  editBeatTitle: PropTypes.func.isRequired,
  editingBeatTitleId: PropTypes.number,
  setEditingBeatTitleId: PropTypes.func.isRequired,
  isSmall: PropTypes.bool,
  setTableRef: PropTypes.func.isRequired,
  tableRef: PropTypes.object,
  darkMode: PropTypes.bool.isRequired,
  mounted: PropTypes.bool,
  orientation: PropTypes.string.isRequired,
  stickyHeaderCount: PropTypes.number,
  stickyLeftColumnCount: PropTypes.number,
  batch: PropTypes.func,
}

const mapStateToProps = (state) => {
  return {
    activeTab: selectors.timelineActiveTabSelector(state),
    bookId: selectors.currentTimelineSelector(state),
    focussedBeat: selectors.contextMenuBeatTimelineSelector(state),
    beatToDelete: selectors.timelineBeatToDeleteSelector(state),
    timelineTabs: selectors.timelineTabsSelector(state),
    timelineTabBeatIds: selectors.timelineTabBeatIdsSelector(state),
    topLevelBeatName: selectors.topLevelBeatNameSelector(state),
    editingBeatTitleId: selectors.editingBeatTitleIdSelector(state),
    isSmall: selectors.isSmallSelector(state),
    darkMode: selectors.isDarkModeSelector(state),
    orientation: selectors.orientationSelector(state),
    stickyHeaderCount: selectors.stickyHeaderCountSelector(state),
    stickyLeftColumnCount: selectors.stickyLeftColumnCountSelector(state),
  }
}

export default connect(mapStateToProps, {
  insertBeat: actions.beat.insertBeat,
  appendTopLevelBeat: actions.beat.appendTopLevelBeat,
  setTimelineActiveTab: actions.ui.setTimelineActiveTab,
  deleteBeat: actions.beat.deleteBeat,
  setFocussedTimelineTabBeat: actions.ui.setFocussedTimelineTabBeat,
  setTimelineTabBeatToDelete: actions.ui.setTimelineTabBeatToDelete,
  setActConfigIsOpen: actions.ui.setActConfigIsOpen,
  editBeatTitle: actions.beat.editBeatTitle,
  setEditingBeatTitleId: actions.ui.setEditingBeatTitleId,
  batch: actions.undo.batch,
})(TimelineTabs)
