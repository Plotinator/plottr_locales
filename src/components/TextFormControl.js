import React, { useCallback, useContext } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors, actions } from 'wired-up-pltr'
import { editStates } from 'pltr'

import FormControl from './FormControl'
import { withValueAndSelection } from './withValueAndSelection'
import { PlottrComponentsContext } from '../connections/pltrContext'

const { EDITING, SEARCHING } = editStates

const TextFormControl = ({
  id,
  placeholder,
  style,
  onKeyPress,
  value,
  onChange,
  autoFocus,
  selection,
  startEditing,
  inputRef,
  className,
  bsSize,
  editState,
  onKeyDown,
  jumpCounter,
}) => {
  const {
    platform: { undo, redo },
  } = useContext(PlottrComponentsContext)

  const isSearching = editState === SEARCHING
  const isEditing = editState === EDITING

  const wrappedOnChange = useCallback(
    (event) => {
      if (isEditing) {
        withValueAndSelection(onChange)(event)
      }
    },
    [onChange, isEditing]
  )

  const wrappedKeyDown = useCallback(
    (event) => {
      if (!isEditing && !event.ctrlKey && !event.altKey && !event.metaKey) {
        startEditing()
      } else if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        event.stopPropagation()
        if (event.shiftKey) {
          redo()
        } else {
          undo()
        }
      } else if (event.key === 'y' && event.ctrlKey) {
        // On Linux, redo is CTRL+y
        event.preventDefault()
        event.stopPropagation()
        redo()
      } else if (onKeyDown) {
        onKeyDown(event)
      }
    },
    [isEditing]
  )

  const startEditingIfNotAlready = useCallback(() => {
    if (!isEditing) {
      startEditing()
    }
  }, [isEditing])

  return (
    <FormControl
      key={id}
      id={id}
      jumpCounter={jumpCounter}
      bsSize={bsSize}
      className={className}
      style={style}
      inputRef={inputRef}
      placeholder={placeholder}
      onKeyPress={onKeyPress}
      onKeyDown={wrappedKeyDown}
      type="text"
      value={value}
      onClick={startEditingIfNotAlready}
      onChange={wrappedOnChange}
      autoFocus={isSearching && autoFocus}
      selection={(isSearching && selection) || null}
    />
  )
}

TextFormControl.propTypes = {
  id: PropTypes.string,
  placeholder: PropTypes.string,
  style: PropTypes.object,
  onKeyPress: PropTypes.func,
  onKeyDown: PropTypes.func,
  value: PropTypes.string,
  onChange: PropTypes.func,
  inputRef: PropTypes.func,
  className: PropTypes.string,
  bsSize: PropTypes.string,
  autoFocus: PropTypes.bool,
  selection: PropTypes.object,
  jumpCounter: PropTypes.number,
  editState: PropTypes.string,
  onClick: PropTypes.func,
  startEditing: PropTypes.func,
}

const mapStateToProps = (state) => {
  return {
    jumpCounter: selectors.jumpCounterSelector(state),
    editState: selectors.editStateSelector(state),
  }
}

export default connect(mapStateToProps, {
  startEditing: actions.applicationState.startEditing,
})(TextFormControl)
