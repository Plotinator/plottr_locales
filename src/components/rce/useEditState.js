import { useEffect, useState, useRef } from 'react'
import { isEqual } from 'lodash'
import { Editor } from 'slate'

import { countWords } from './helpers'
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
  log,
  undoGeneration
) => {
  const valueUpdateTimer = useRef(null)
  const deferredValuesToUpdate = useRef({ value: null })
  const currentSelection = useRef(editor.selection)
  const focussed = useRef(false)

  const [value, setValue] = useState(useTextConverter(initialValue, log))
  const [wordCount, setWordCount] = useState(0)

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
  }, [editorId, key, undoGeneration])

  const updateWordCount = () => {
    const [start, end] = Editor.edges(editor, editor.selection)
    const wordCount = isEqual(start, end) ? 0 : countWords(editor.getFragment())
    setWordCount(wordCount)
  }

  const debouncedOnUpdateValue = (value, selection) => {
    if (valueUpdateTimer.current) {
      clearTimeout(valueUpdateTimer.current)
    }
    deferredValuesToUpdate.current.value = value || deferredValuesToUpdate.current.value
    // @ts-ignore
    deferredValuesToUpdate.current.selection = selection || deferredValuesToUpdate.current.selection
    // @ts-ignore
    valueUpdateTimer.current = setTimeout(() => {
      updateWordCount()
      onValueChanged(
        deferredValuesToUpdate.current.value,
        // @ts-ignore
        deferredValuesToUpdate.current.selection
      )
      deferredValuesToUpdate.current.value = null
      // @ts-ignore
      deferredValuesToUpdate.current.selection = null
      valueUpdateTimer.current = null
    }, 500)
  }

  // Handle local/client editor changed events
  const onChange = (newValue, _selection) => {
    const valueChanged = !isEqual(newValue, value)
    const selectionChanged = !isEqual(editor.selection, currentSelection.current)
    // Update local state
    if (valueChanged || (selectionChanged && focussed.current)) {
      setValue(newValue)
      currentSelection.current = editor.selection
      debouncedOnUpdateValue(newValue, editor.selection)
    }
  }

  // It's possible for invalid RCE data to result from pasting.
  const onPaste = (_event) => {
    // We're using operations rather than the actual value now...
  }

  // Handle user typing
  const onKeyDown = (event) => {
    if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      if (event.shiftKey) {
        redo()
      } else {
        undo()
      }
    } else if (event.key === 'y' && event.ctrlKey) {
      // On Linux, redo is CTRL+y
      event.preventDefault()
      redo()
    }
  }

  // Add our cursor back in
  const onFocus = (_event) => {
    focussed.current = true
  }

  // Remove our cursor
  const onBlur = (_event) => {
    focussed.current = false
  }

  return [value, onChange, onKeyDown, onPaste, wordCount, onFocus, onBlur]
}
