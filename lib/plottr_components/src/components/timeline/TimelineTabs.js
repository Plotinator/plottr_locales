import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { t } from 'plottr_locales'

import Tabs from '../Tabs'
import Tab from '../Tab'
import Glyphicon from '../Glyphicon'
import MenuItem from '../MenuItem'
import Popover from '../PlottrPopover'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedPlottrFloater from '../PlottrFloater'

const TimelineTabsConnector = (connector) => {
  const Floater = UnconnectedPlottrFloater(connector)

  const TimelineTabs = ({
    activeTab,
    timelineTabs,
    timelineTabBeatIds,
    topLevelBeatName,
    insertBeat,
    appendTopLevelBeat,
    setTimelineActiveTab,
    bookId,
    TableComponent,
    deleteBeat,
    focussedBeat,
    beatToDelete,
    setFocussedTimelineTabBeat,
    setTimelineTabBeatToDelete,
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
      const addTopLevelbeatTitle = <Glyphicon glyph="plus" title={t(`Add ${topLevelBeatName}`)} />

      return (
        <Tab
          noHandlers
          eventKey="add-top-level-beat-tab"
          key="add-top-level-beat-tab"
          title={addTopLevelbeatTitle}
        />
      )
    }

    const renderBeatContextMenu = () => {
      if (!contextMenuAnchor || !focussedBeat) {
        return null
      }

      const { top, left } = contextMenuAnchor.getBoundingClientRect()

      return (
        <Floater
          open
          rootClose
          placement="bottom"
          contentLocation={{ top, left }}
          component={() => {
            return (
              <Popover id="tab-beat-menu" contentStyleOverride={{ padding: 0 }}>
                <ul className="tab-dropdown-menu">
                  <MenuItem onSelect={insertPeerBeat}>{t(`Insert ${topLevelBeatName}`)}</MenuItem>
                  <MenuItem onSelect={stageBeatForDeletion}>{t('Delete')}</MenuItem>
                </ul>
              </Popover>
            )
          }}
          onClose={() => {
            setContextMenuAnchor(null)
            setFocussedTimelineTabBeat(null)
          }}
        >
          <div />
        </Floater>
      )
    }

    const beatContextMenu = (beatId, target) => {
      setFocussedTimelineTabBeat(beatId)
      setContextMenuAnchor(target)
    }

    const insertPeerBeat = () => {
      insertBeat(bookId, focussedBeat)
      setFocussedTimelineTabBeat(null)
    }

    const stageBeatForDeletion = () => {
      setTimelineTabBeatToDelete(focussedBeat)
      setFocussedTimelineTabBeat(null)
    }

    const renderDeleteBeat = () => {
      if (!beatToDelete) return null

      return (
        <DeleteConfirmModal
          onDelete={() => {
            deleteBeat(beatToDelete, bookId)
            setTimelineTabBeatToDelete(null)
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

    return (
      <>
        <Tabs
          activeKey={activeTab}
          onSelect={handleSetActiveTab}
          onContextMenu={beatContextMenu}
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
                  <TableComponent />
                </Tab>
              )
            }),
            renderAddTopLevel(),
          ]}
        </Tabs>
        {renderBeatContextMenu()}
        {renderDeleteBeat()}
      </>
    )
  }

  TimelineTabs.propTypes = {
    activeTab: PropTypes.number.isRequired,
    handleSetActiveTab: PropTypes.func.isRequired,
    timelineTabs: PropTypes.array.isRequired,
    timelineTabBeatIds: PropTypes.array.isRequired,
    topLevelBeatName: PropTypes.string.isRequired,
    insertBeat: PropTypes.func.isRequired,
    TableComponent: PropTypes.func.isRequired,
    appendTopLevelBeat: PropTypes.func.isRequired,
    setTimelineActiveTab: PropTypes.func.isrequired,
    bookId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    deleteBeat: PropTypes.func.isRequired,
    focussedBeat: PropTypes.number,
    beatToDelete: PropTypes.number,
    setFocussedTimelineTabBeat: PropTypes.func.isRequired,
    setTimelineTabBeatToDelete: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect(
      (state) => {
        return {
          activeTab: selectors.timelineActiveTabSelector(state.present),
          bookId: selectors.currentTimelineSelector(state.present),
          focussedBeat: selectors.contextMenuBeatTimelineSelector(state.present),
          beatToDelete: selectors.timelineBeatToDeleteSelector(state.present),
          timelineTabs: selectors.timelineTabsSelector(state.present),
          timelineTabBeatIds: selectors.timelineTabBeatIdsSelector(state.present),
          topLevelBeatName: selectors.topLevelBeatNameSelector(state.present),
        }
      },
      {
        insertBeat: actions.beat.insertBeat,
        appendTopLevelBeat: actions.beat.appendTopLevelBeat,
        setTimelineActiveTab: actions.ui.setTimelineActiveTab,
        deleteBeat: actions.beat.deleteBeat,
        setFocussedTimelineTabBeat: actions.ui.setFocussedTimelineTabBeat,
        setTimelineTabBeatToDelete: actions.ui.setTimelineTabBeatToDelete,
      }
    )(TimelineTabs)
  }

  throw new Error('Could not connect TimelineTabs')
}

export default TimelineTabsConnector
