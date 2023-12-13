import { isEqual } from 'lodash'

import { useEffect, useState, useRef } from 'react'
import { useTextConverter } from './helpers'

export const useEditState = (
  key,
  fileId,
  editorId,
  editor,
  onValueChanged,
  undo,
  redo,
  initialValue,
  initialSelection,
  undoId,
  log
) => {
  const valueUpdateTimer = useRef(null)
  const deferredValuesToUpdate = useRef({ value: null })
  const currentSelection = useRef(editor.selection)
  const focussed = useRef(false)

  const [value, setValue] = useState(useTextConverter(initialValue, log))

  useEffect(() => {
    const newValue = useTextConverter(initialValue)
    editor.children = newValue

    // We could receive an initial selection from a search hit.  It'll
    // look like a normal text field selection in that case.
    if (
      typeof initialSelection?.start === 'number' &&
      typeof initialSelection?.end === 'number' &&
      typeof initialSelection.direction === 'string'
    ) {
      // editor.focus()
    } else {
      editor.selection = initialSelection
    }

    setValue(newValue)
  }, [editorId])

  // Handle undo
  useEffect(() => {
    if (isEqual(initialValue, value)) return

    const newValue = useTextConverter(initialValue)
    editor.children = newValue

    // We could receive an initial selection from a search hit.  It'll
    // look like a normal text field selection in that case.
    if (initialSelection?.start && initialSelection?.end && initialSelection?.direction) {
      // editor.focus()
    } else {
      editor.selection = initialSelection
    }

    setValue(newValue)
  }, [undoId])

  const debouncedOnUpdateValue = (value, selection) => {
    if (valueUpdateTimer.current) {
      clearTimeout(valueUpdateTimer.current)
    }
    deferredValuesToUpdate.current.value = value || deferredValuesToUpdate.current.value
    deferredValuesToUpdate.current.selection = selection || deferredValuesToUpdate.current.selection
    valueUpdateTimer.current = setTimeout(() => {
      onValueChanged(deferredValuesToUpdate.current.value, deferredValuesToUpdate.current.selection)
      deferredValuesToUpdate.current.value = null
      deferredValuesToUpdate.current.selection = null
      valueUpdateTimer.current = null
    }, 500)
  }

  // Handle local/client editor changed events
  const onChange = (newValue, selection) => {
    const valueChanged = !isEqual(newValue, value)
    const selectionChanged = !isEqual(editor.selection, currentSelection.current)
    // Update local state
    if (focussed.current && (valueChanged || selectionChanged)) {
      setValue(newValue)
      currentSelection.current = editor.selection
      debouncedOnUpdateValue(newValue, editor.selection)
    }
  }

  const handleUndoRedo = (event) => {
    // If we don't have a selection, then the editor can't support
    // programatic undo.  This isn't desirable because built-in undo
    // leads to strange interactions when, e.g. the user undoes
    // something, selections outside the RCE and then undoes again.
    // (The result could be that text in the RCE is redone!)
    //
    // To ensure that the RCE has a selection, make sure that the on
    // change handlers create actions that add `editorMetadata`.
    // See the `editors` reducer for schema.
    if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      if (event.shiftKey) {
        redo()
      } else {
        undo()
      }
      return
    }
    // On Linux, redo is CTRL+y
    if (initialSelection && event.key === 'y' && event.ctrlKey) {
      event.preventDefault()
      redo()
      return
    }
  }

  // It's possible for invalid RCE data to result from pasting.
  const onPaste = (event) => {
    // We're using operations rather than the actual value now...
  }

  // Handle user typing
  const onKeyDown = (event) => {
    handleUndoRedo(event)
  }

  // Add our cursor back in
  const onFocus = (event) => {
    focussed.current = true
  }

  // Remove our cursor
  const onBlur = (event) => {
    focussed.current = false
  }

  return [value, onChange, onKeyDown, onPaste, onFocus, onBlur]
}
