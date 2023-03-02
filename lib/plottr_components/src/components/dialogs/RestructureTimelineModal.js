import React, { useState } from 'react'
import { PropTypes } from 'prop-types'

import { t } from 'plottr_locales'

import Button from '../Button'
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
    const BeatRow = ({ id, title, hierarchyLevel }) => {
      return (
        <tr>
          <td>{title}</td>
          <td>{hierarchyLevel.name}</td>
        </tr>
      )
    }

    BeatRow.propTypes = {
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      hierarchyLevel: PropTypes.object.isRequired,
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
        hierarchyLevel: selectors.hierarchyLevelSelector(state.present, ownProps.beatId),
      }))(BeatRow)
    }

    throw new Error('Could not connect BeatRow')
  }

  const PlottrModal = UnconnectedPlottrModal(connector)
  const BeatRow = UnconnectedBeatRow(connector)

  const RestructureTimelineModal = ({ closeDialog, beats }) => {
    const [stagedBeats, setStagedBeats] = useState(beats)

    return (
      <PlottrModal isOpen={true} onRequestClose={closeDialog} style={modalStyles}>
        <div className="restructure-modal__wrapper">
          <div className="restructure-modal__header">
            <div>
              <h3>{t('Restructure Timeline')}</h3>
              <Button onClick={closeDialog}>{t('Close')}</Button>
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
              {stagedBeats.map(({ id }) => {
                return (
                  <React.Fragment key={id}>
                    <BeatRow id={id} />
                  </React.Fragment>
                )
              })}
            </table>
          </div>
          <div className="restructure-modal__footer"></div>
        </div>
      </PlottrModal>
    )
  }

  RestructureTimelineModal.propTypes = {
    closeDialog: PropTypes.func.isRequired,
    beats: PropTypes.array.isRequired,
  }

  const { redux } = connector
  checkDependencies({ redux })

  if (redux) {
    const {
      pltr: { selectors, actions },
    } = connector
    const { connect } = redux
    return connect(
      (state) => ({
        sortedHierarchyLevels: selectors.sortedHierarchyLevels(state.present),
        beats: selectors.visibleSortedBeatsForTimelineByBookSelector(state.present),
      }),
      {
        closeDialog: actions.ui.closeRestructureTimelineModal,
      }
    )(RestructureTimelineModal)
  }

  throw new Error('Could not connect RestructureTimelineModal')
}

export default RestructureTimelineModalConnector
