import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { t as i18n } from 'plottr_locales'
import isHotkey from 'is-hotkey'
import { Slate, Editable, ReactEditor } from 'slate-react'
import UnconnectedToolBar from './ToolBar'
import { toggleMark } from './MarkButton'
import Leaf from './Leaf'
import Element from './Element'
import { useTextConverter, createEditor } from './helpers'
import { useRegisterEditor } from './editor-registry'
import { newEditQueue, enqueue } from './editQueue'
import { drainQueue } from '../../../dist/components/rce/editQueue'

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
}

const RichTextEditorConnector = (connector) => {
  const {
    platform: { openExternal, publishRCEOperations, fetchRCEOperations },
  } = connector

  const ToolBar = UnconnectedToolBar(connector)

  const RichTextEditor = ({ ...props }) => {
    const editor = useMemo(() => {
      return createEditor()
    }, [])
    const renderLeaf = useCallback((props) => <Leaf {...props} />, [])
    const renderElement = useCallback(
      (innerProps) => <Element {...innerProps} openExternal={openExternal} />,
      [openExternal]
    )
    const [value, setValue] = useState(null)
    const [editorWrapperRef, setEditorWrapperRef] = useState(null)
    const key = useRef(Math.random().toString(16))
    useEffect(() => {
      setValue(useTextConverter(props.text)) // eslint-disable-line
    }, [])

    const editorId = props.id
    const fileId = props.fileId

    const registerEditor = useRegisterEditor(editor)

    const [editCount, setEditCount] = useState(0)

    const applyingOtherEdits = useRef(false)

    const updateValue = (newVal) => {
      setValue(newVal)
      if (applyingOtherEdits.current) {
        applyingOtherEdits.current = false
        return
      }
      // only update if it changed
      // (e.g. this event could fire with a selection change, but the text is the same)
      if (value !== newVal) {
        props.onChange(newVal)
        if (publishRCEOperations && fileId && editorId) {
          let individualEditCount = editCount
          publishRCEOperations(
            fileId,
            editorId,
            editor.operations.map((operation) => ({
              editorKey: key.current,
              operation,
              created: new Date(),
              editNumber: individualEditCount++,
            }))
          )
          setEditCount(individualEditCount)
        }
      }
    }

    const editQueue = useRef(newEditQueue())

    useEffect(() => {
      if (fetchRCEOperations && fileId && editorId) {
        const Search = () => {
          let latestSearch = new Date()

          return function () {
            fetchRCEOperations(fileId, editorId, latestSearch, (operations) => {
              operations.forEach((operation) => {
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
              if (operationsToApply.length) {
                applyingOtherEdits.current = true
                operationsToApply.forEach((operation) => {
                  editor.apply(operation)
                })
              }
            })
          }
        }
        const interval = setInterval(new Search(), 100)
        return () => {
          clearInterval(interval)
        }
      }
      return () => {}
    }, [fileId, editorId])

    const handleKeyDown = (event) => {
      for (const hotkey in HOTKEYS) {
        if (isHotkey(hotkey, event)) {
          event.preventDefault()
          const mark = HOTKEYS[hotkey]
          toggleMark(editor, mark)
        }
      }
    }

    const handleKeyUp = () => {
      // scroll to the cursor
      if (editor.selection == null) return
      try {
        const domPoint = ReactEditor.toDOMPoint(editor, editor.selection.focus)
        const node = domPoint[0]
        let isElem = false
        let parent = node.parentElement
        // find the closest parent that is a slate element
        while (!isElem) {
          if (parent == null) {
            isElem = true
            return
          }
          if (parent.dataset.slateNode == 'element') {
            isElem = true
          } else {
            parent = parent.parentElement
          }
        }
        parent.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      } catch (e) {
        // Do nothing if there is an error.
      }
    }

    const handleClickEditable = (event) => {
      if (!editorWrapperRef) return
      if (editorWrapperRef.firstChild.contains(event.target)) return

      // Focus the Editable content
      editorWrapperRef.firstChild.focus()
      // Select all text
      // Push cursor/focus to last char
      // document.execCommand('selectAll', false, null)
      // document.getSelection().collapseToEnd()
    }

    if (!value) return null

    const otherProps = {
      autoFocus: props.autoFocus,
    }
    return (
      <Slate editor={editor} value={value} onChange={updateValue} key={key.current}>
        <div className={cx('slate-editor__wrapper', props.className)}>
          <ToolBar editor={editor} darkMode={props.darkMode} />
          <div
            // the firstChild will be the contentEditable dom node
            ref={(e) => {
              registerEditor(e && e.firstChild)
              setEditorWrapperRef(e)
            }}
            onClick={handleClickEditable}
            className={cx('slate-editor__editor', { darkmode: props.darkMode })}
          >
            <Editable
              spellCheck
              {...otherProps}
              renderLeaf={renderLeaf}
              renderElement={renderElement}
              placeholder={i18n('Enter some text...')}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
            />
          </div>
        </div>
      </Slate>
    )
  }

  RichTextEditor.propTypes = {
    text: PropTypes.any,
    id: PropTypes.string,
    fileId: PropTypes.string,
    onChange: PropTypes.func,
    autoFocus: PropTypes.bool,
    darkMode: PropTypes.bool,
    className: PropTypes.string,
  }

  return RichTextEditor
}

export default RichTextEditorConnector
