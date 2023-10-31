import React, { useCallback } from 'react'
import { PropTypes } from 'prop-types'

import FormControl from './FormControl'
import { checkDependencies } from './checkDependencies'
import { withValueAndSelection } from './withValueAndSelection'

const TextFormControlConnector = (connector) => {
  const { EDITING, SEARCHING } = connector.pltr.editStates

  const TextFormControl = ({
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
  }) => {
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
        }
        if (onKeyDown) {
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
          jumpCounter: selectors.jumpCounterSelector(state),
          editState: selectors.editStateSelector(state),
        }
      },
      {
        startEditing: actions.applicationState.startEditing,
      }
    )(TextFormControl)
  }

  throw new Error('Could not connect TextformControl')
}

export default TextFormControlConnector
