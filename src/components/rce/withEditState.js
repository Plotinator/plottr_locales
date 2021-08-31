import { isEqual } from 'lodash'

import { useEffect, useState, useRef } from 'react'
import { newEditQueue, enqueue, drainQueue } from './editQueue'
import { useTextConverter } from './helpers'

/**
 * # Introduction
 *
 *   This hook manages simultaneous editing.
 *
 *   It turns out, that modelling simultaneous edits is a tricky
 *   business.
 *
 *   There are several competing asynchronous events that may happen
 *   in an inconvenient sequence or at an inconvenient time.  In this
 *   hook, we model all of those events as state transitions in a
 *   Finite State Machine (FSM).
 *
 * # Events
 *
 *   1. User key down.
 *   2. Signal change received from other editor.
 *   3. Our query for other editor operations returned with data.
 *   4. Redux gave us a new value for the editor.
 *   5. Undo/Redo called by user.
 *
 * # Pieces of State
 *
 * ## State that Should Cause a Re-Render
 *
 *   The following pieces of state are involved in how the RCE is
 *   drawn and should cause it to re-draw every time that they change.
 *
 *   - value.  The value (tree) of the RCE.
 *   - selection.  The cursor and anchor point for the RCE.
 *
 * ## State that Shouldn't Cause a Re-Render
 *
 *   The following pieces of state are involved in tracking edits and
 *   editing states.  They're not involved in how the RCE looks so we
 *   use `useRef` to remove them from re-draw cycles.
 *
 *   - editCount.  A tracker for the number of edits we made.  Helps
 *     other editors know whether they missed one of our edits.
 *   - handlingKeyDown
 */
export const withEditState = (
  editor,
  editorId,
  fileId,
  clientId,
  publishOperations,
  fetchOperations,
  listenForChangeSignals,
  undo,
  redo,
  initialValue,
  initialSelection,
  undoId
) => {
  // Constants
  const key = useRef(Math.random().toString(16))

  // Re-rendering state
  const [value, setValue] = useState(initialValue)
  const [selection, setSelection] = useState(selection)

  // Non-re-rendering state
  const applyingOtherEdits = useRef(false)
  const editQueue = useRef(newEditQueue())
  const editCount = useRef(0)
  const handlingKeyDown = useRef(false)

  // Handle changes in initial value
  useEffect(() => {
    // undoId goes null when we undo.
    if (!undoId || !value || !selection) {
      setValue(useTextConverter(initialValue)) // eslint-disable-line
      if (selection && selection.anchor && selection.focus) {
        editor.selection = selection
        setSelection(selection)
      } else {
        setSelection({ ...editor.selection })
      }
    }
  }, [initialValue, undoId])

  // Listen for and fetch edits made by other editors
  useEffect(() => {
    if (fetchOperations && fileId && editorId) {
      let latestSearch = new Date()
      listenForChangeSignals(fileId, editorId, (editTimestamps) => {
        // console.log('Receiving...')
        const handleChange = () => {
          fetchOperations(fileId, editorId, latestSearch, (operations) => {
            operations.forEach((operation) => {
              // console.log('Operation: ', operation)
              if (operation.editorKey !== key.current) {
                enqueue(
                  editQueue.current,
                  operation.editorKey,
                  operation.operation,
                  operation.editNumber
                )
              }
            })
            latestSearch = operations[operations.length - 1].created
            const operationsToApply = drainQueue(editQueue.current)
            console.log('Operations to apply ', operationsToApply)
            if (operationsToApply.length) {
              applyingOtherEdits.current = true
              // Might need to defer these edits too...
              operationsToApply.forEach((operation) => {
                editor.apply(operation)
              })
            }
          })
        }
        function delayIfNecessary() {
          if (handlingKeyDown.current) {
            setTimeout(delayIfNecessary, 100)
          }
          handleChange()
        }
        delayIfNecessary()
      })
    }
    return () => {}
  }, [fileId, editorId])

  // Handle editor changed events
  const onChange = (newValue) => {
    setValue(newValue)
    if (applyingOtherEdits.current) {
      applyingOtherEdits.current = false
      return
    }
    if (publishOperations && fileId && editorId) {
      // editor.operations.forEach((operation) => {
      //   console.log('Publishing: ', operation)
      // })
      publishOperations(
        fileId,
        editorId,
        clientId,
        editor.operations.map((operation) => ({
          editorKey: key.current,
          operation,
          created: new Date(),
          editNumber: editCount.current++,
        }))
      )
    }
    if (!isEqual(selection, editor.selection)) {
      // Rules for changing are complicated because we need to support
      // editors which don't use programatic undo and therefore don't
      // track the current selection.
      if (
        selection &&
        editor.selection &&
        !isEqual(selection, editor.selection) &&
        editor.selection.anchor &&
        editor.selection.focus
      ) {
        setSelection({ ...editor.selection })
        if (value !== newValue) {
          // onChange(newValue, { ...editor.selection })
        } else {
          // onChange(null, { ...editor.selection })
        }
      }
    } else if (value !== newValue) {
      onChange(newValue)
    }
  }

  const onKeyDown = (event) => {
    // If we don't have a selection, then the editor can't support
    // programatic undo.  This isn't desirable because built-in undo
    // leads to strange interactions when, e.g. the user undoes
    // something, selections outside the RCE and then undoes again.
    // (The result could be that text in the RCE is redone!)
    //
    // To ensure that the RCE has a selection, make sure that the on
    // change handlers create actions that add `editorMetadata`.
    // See the `editors` reducer for schema.
    if (selection && event.key === 'z' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      if (event.shiftKey) {
        redo()
      } else {
        undo()
      }
      return
    }
    // On Linux, redo is CTRL+y
    if (selection && event.key === 'y' && event.ctrlKey) {
      event.preventDefault()
      redo()
      return
    }
    handlingKeyDown.current = true
    setTimeout(() => {
      handlingKeyDown.current = false
    }, 100)
  }

  return [value, selection, key, onChange, onKeyDown]
}
