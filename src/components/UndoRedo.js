import React from 'react'
import PropTypes from 'react-proptypes'
import { FaRedo } from '@react-icons/all-files/fa/FaUndo'
import { FaUndo } from '@react-icons/all-files/fa/FaRedo'
import cx from 'classnames'

import { checkDependencies } from './checkDependencies'

const UndoRedoConnector = (connector) => {
  const UndoRedo = ({
    historyLabels,
    futureLabels,
    recentlyUndidOrRedid,
    showUndoRedo,
    undo,
    redo,
    undoNTimes,
    redoNTimes,
  }) => {
    if (showUndoRedo && typeof recentlyUndidOrRedid === 'string') {
      const didUndo = recentlyUndidOrRedid === 'undid'
      const previous = didUndo ? historyLabels : futureLabels
      const label = didUndo ? 'Undo' : 'Redo'
      return (
        <div className="undo-redo__container">
          <div className="undo-redo__heading">
            <FaUndo onClick={undo} />
            {label}
            <FaRedo onClick={redo} />
          </div>
          {previous.length === 0 ? (
            <div className="undo-redo__no-further-changes">No further changes</div>
          ) : (
            previous.slice(0, 10).map((label, index) => {
              return (
                <>
                  <div
                    key={`history-${index}`}
                    className={cx('undo-redo__history-item', {
                      'undo-redo__history-item--highlight': index % 2 === 0,
                    })}
                    onClick={() => {
                      if (didUndo) {
                        undoNTimes(index)
                      } else {
                        redoNTimes(index)
                      }
                    }}
                  >
                    <b>{index + 1}.</b> {label}
                  </div>
                </>
              )
            })
          )}
        </div>
      )
    } else {
      return null
    }
  }

  UndoRedo.propTypes = {
    historyLabels: PropTypes.arrayOf(PropTypes.string),
    futureLabels: PropTypes.arrayOf(PropTypes.string),
    recentlyUndidOrRedid: PropTypes.string,
    showUndoRedo: PropTypes.bool,
    undo: PropTypes.func.isRequired,
    redo: PropTypes.func.isRequired,
    undoNTimes: PropTypes.func.isRequired,
    redoNTimes: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  checkDependencies({ redux, selectors })

  if (redux) {
    const { connect } = redux

    return connect(
      (state) => {
        return {
          historyLabels: selectors.historyLabelsSelector(state),
          futureLabels: selectors.futureLabelsSelector(state),
          recentlyUndidOrRedid: selectors.recentlyUndidOrRedidSelector(state),
          showUndoRedo: selectors.showUndoRedoSelector(state),
        }
      },
      {
        undo: actions.undo.undo,
        redo: actions.undo.redo,
        undoNTimes: actions.undo.undoNTimes,
        redoNTimes: actions.undo.redoNTimes,
      }
    )(UndoRedo)
  }

  throw new Error('Could not connect UndoRedo')
}

export default UndoRedoConnector
