import React from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { FaUndo } from '@react-icons/all-files/fa/FaUndo'
import { FaRedo } from '@react-icons/all-files/fa/FaRedo'
import cx from 'classnames'

import { selectors, actions } from 'wired-up-pltr'

import PlottrModal from './PlottrModal'

const modalStyles = {
  overlay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  content: {
    position: 'relative',
    left: 'auto',
    bottom: 'auto',
    right: 'auto',
    borderRadius: 4,
    padding: 0,
  },
}

const UndoRedo = ({
  historyLabels,
  futureLabels,
  recentlyUndidOrRedid,
  showUndoRedo,
  undo,
  redo,
  undoNTimes,
  redoNTimes,
  dismissUndoRedoDialog,
}) => {
  const handleRef = (ref) => {
    if (typeof ref?.parentElement?.parentElement?.parentElement?.style === 'object') {
      ref.parentElement.parentElement.parentElement.style.zIndex = 10000
      ref.parentElement.parentElement.parentElement.style.position = 'relative'
    }
  }

  if (showUndoRedo && typeof recentlyUndidOrRedid === 'string') {
    const didUndo = recentlyUndidOrRedid === 'undid'
    const previous = didUndo ? historyLabels : futureLabels
    const label = didUndo ? 'Undo' : 'Redo'
    return (
      <PlottrModal isOpen={true} onRequestClose={dismissUndoRedoDialog} style={modalStyles}>
        <div className="undo-redo__container" ref={handleRef}>
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
      </PlottrModal>
    )
  } else {
    return null
  }
}

UndoRedo.propTypes = {
  historyLabels: PropTypes.arrayOf(PropTypes.string),
  futureLabels: PropTypes.arrayOf(PropTypes.string),
  recentlyUndidOrRedid: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  showUndoRedo: PropTypes.bool,
  undo: PropTypes.func.isRequired,
  redo: PropTypes.func.isRequired,
  undoNTimes: PropTypes.func.isRequired,
  redoNTimes: PropTypes.func.isRequired,
  dismissUndoRedoDialog: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => {
  return {
    historyLabels: selectors.historyLabelsSelector(state),
    futureLabels: selectors.futureLabelsSelector(state),
    recentlyUndidOrRedid: selectors.recentlyUndidOrRedidSelector(state),
    showUndoRedo: selectors.showUndoRedoSelector(state),
  }
}

export default connect(mapStateToProps, {
  undo: actions.undo.undo,
  redo: actions.undo.redo,
  undoNTimes: actions.undo.undoNTimes,
  redoNTimes: actions.undo.redoNTimes,
  dismissUndoRedoDialog: actions.undo.dismissUndoRedoDialog,
})(UndoRedo)
