import React, { useCallback, useMemo, useRef, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { t } from 'plottr_locales'
import isHotkey from 'is-hotkey'
import { Editor, Transforms } from 'slate'
import { Slate, Editable, ReactEditor } from 'slate-react'
import UnconnectedToolBar from './ToolBar'
import { toggleMark } from './MarkButton'
import Leaf from './Leaf'
import Element from './Element'
import { createEditor } from './helpers'
import { useRegisterEditor } from './editor-registry'
import { useEditState } from './useEditState'

import { checkDependencies } from '../checkDependencies'
import { indent } from './IndentParagraphButton'
import { handleList } from './BlockButton'
import { isEmpty } from './isEmpty'
import { notOnFirstLine } from './notOnFirstLine'

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
}

const waitAMoment = (f) => {
  return setTimeout(f, 50)
}

const cancelWait = (id) => {
  clearTimeout(id)
}

const firstPosition = (children) => {
  function iter(currentNode, path) {
    if (currentNode.children?.length > 0) {
      return iter(currentNode.children[0], [...path, 0])
    } else {
      return { path, offset: 0 }
    }
  }

  if (children.length > 0) {
    return iter(children[0], [0])
  } else {
    return null
  }
}

const RichTextEditorConnector = (connector) => {
  const { EDITING, SEARCHING } = connector.pltr.editStates

  const {
    platform: {
      storage: { resolveToPublicUrl, isStorageURL },
      log,
      openExternal,
      undo,
      redo,
    },
  } = connector
  checkDependencies({
    resolveToPublicUrl,
    isStorageURL,
    log,
    openExternal,
    undo,
    redo,
  })

  const ToolBar = UnconnectedToolBar(connector)

  const RichTextEditor = ({
    editorKey,
    id,
    undoId,
    text,
    selection,
    darkMode,
    className,
    autoFocus,
    onChange,
    fileId,
    clientId,
    editState,
    onBlur,
    onFocus,
    imageCache,
    cacheImage,
    useSpellcheck,
    jumpCounter,
    startEditing,
  }) => {
    const editor = useMemo(() => {
      return createEditor(log)
    }, [])
    const registerEditor = useRegisterEditor(editor)

    // Rendering helpers
    const renderLeaf = useCallback((props) => <Leaf {...props} />, [])
    const renderElement = useCallback(
      (innerProps) => (
        <Element
          {...innerProps}
          openExternal={openExternal}
          imagePublicURL={resolveToPublicUrl}
          isStorageURL={isStorageURL}
          imageCache={imageCache}
          cacheImage={cacheImage}
        />
      ),
      [openExternal, resolveToPublicUrl, imageCache, cacheImage]
    )

    const handleOnBlur = () => {
      signalBlurToEditState()
      onBlur && onBlur()
    }

    const handleOnFocus = () => {
      signalFocusToEditState()
      onFocus && onFocus()
    }

    // Focus on first render if we're searching
    const editorWrapperRef = useRef(null)
    useEffect(() => {
      let idleCallback = null
      let innerIdleCallback = null
      if (
        isSearching &&
        autoFocus &&
        editorWrapperRef.current &&
        editorWrapperRef.current.firstChild
      ) {
        if (selection) {
          if (
            typeof selection.start !== 'undefined' &&
            typeof selection.end !== 'undefined' &&
            typeof selection.direction !== 'undefined'
          ) {
            idleCallback = waitAMoment(() => {
              ReactEditor.focus(editor)
              innerIdleCallback = waitAMoment(() => {
                const firstNode = firstPosition(editor.children)
                const firstPath =
                  selection.direction === 'forward'
                    ? Editor.after(editor, firstNode, {
                        distance: selection.start,
                        unit: 'character',
                      })
                    : Editor.after(editor, firstNode, {
                        distance: selection.end,
                        unit: 'character',
                      })
                const secondPath =
                  selection.direction === 'forward'
                    ? Editor.after(editor, firstNode, {
                        distance: selection.end,
                        unit: 'character',
                      })
                    : Editor.after(editor, firstNode, {
                        distance: selection.start,
                        unit: 'character',
                      })
                Transforms.setSelection(editor, {
                  anchor: firstPath,
                  focus: secondPath,
                })
                editorWrapperRef.current.scrollIntoView({ behavior: 'smooth' })
              })
            })
          } else {
            idleCallback = waitAMoment(() => {
              ReactEditor.focus(editor)
              innerIdleCallback = waitAMoment(() => {
                Transforms.select(editor, selection)
              })
            })
          }
        } else {
          ReactEditor.focus(editor)
        }
      }

      return () => {
        if (idleCallback) {
          cancelWait(idleCallback)
        }
        if (innerIdleCallback) {
          cancelWait(innerIdleCallback)
        }
      }
    }, [autoFocus, jumpCounter])
    const focusEditor = useCallback((previousSelection) => {
      setTimeout(() => {
        if (editorWrapperRef.current && editorWrapperRef.current.firstChild) {
          editorWrapperRef.current.firstChild.focus()
          editor.selection = previousSelection
        }
      }, 50)
    }, [])

    // State management
    const [
      value,
      onValueChanged,
      onKeyDown,
      onPaste,
      signalFocusToEditState,
      signalBlurToEditState,
      _editorIsReady,
    ] = useEditState(
      editorKey,
      fileId,
      id,
      editor,
      onChange,
      undo,
      redo,
      text,
      selection,
      undoId,
      log
    )

    const wrappedOnChange = useCallback(
      (event) => {
        if (isEditing) {
          onValueChanged(event)
        }
      },
      [onChange]
    )

    const isEditing = editState === EDITING
    const isSearching = editState === SEARCHING

    const startEditingIfNotAlready = useCallback(() => {
      if (!isEditing) {
        startEditing()
      }
    }, [isEditing])

    const handleKeyDown = (event) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (Editor.isInList(editor, editor.selection)) {
            handleList(editor, null, log)
            event.preventDefault()
            event.stopPropagation()
            return
          }
        } else if (indent(editor, null, log)) {
          event.preventDefault()
          event.stopPropagation()
          return
        }
      }
      // This is a hack to prevent a bug that's only present in
      // Safari.  See:
      // https://github.com/ianstormtaylor/slate/issues/4640
      if (
        event.key === 'Backspace' &&
        isEmpty(editor.children) &&
        !notOnFirstLine(editor.selection)
      ) {
        event.preventDefault()
        return
      }
      for (const hotkey in HOTKEYS) {
        if (isHotkey(hotkey, event)) {
          event.preventDefault()
          const mark = HOTKEYS[hotkey]
          toggleMark(editor, mark)
          return
        }
      }
      if (!isEditing && !event.ctrlKey && !event.altKey && !event.metaKey) {
        startEditing()
      }
      onKeyDown(event)
    }

    const handleInput = (e) => {
      e.stopPropagation()
      try {
        const domPoint = ReactEditor.toDOMPoint(editor, editor.selection.anchor)
        // domPoint.nodeValue is the whole line, we just want the corrected word
        const selectionBegin = editor.selection.anchor.offset
        const substr = domPoint[0].nodeValue.substr(selectionBegin)
        let endIndex = substr.search(/\W/) // first non-word character
        if (endIndex == -1) {
          // the word is the last on the line with no characters (space/period) after it
          endIndex = undefined
        }
        const correctedWord = substr.substring(0, endIndex)
        if (correctedWord) {
          Transforms.delete(editor, { at: editor.selection })
          Transforms.insertText(editor, correctedWord, { at: editor.selection })
          Transforms.collapse(editor, { edge: 'anchor' })
        }
      } catch (error) {
        log.warn(error)
      }
    }

    const handleClickEditable = (event) => {
      if (!editorWrapperRef.current) return
      if (editorWrapperRef.current.firstChild.contains(event.target)) return

      // Focus the Editable content
      editorWrapperRef.current.firstChild.focus()
    }

    if (value === null) return null

    const otherProps = {}
    return (
      <Slate editor={editor} value={value} onChange={wrappedOnChange} key={editorKey} id={id}>
        <div className={cx('slate-editor__wrapper', className)}>
          <ToolBar editor={editor} focusEditor={focusEditor} />
          <div
            // the firstChild will be the contentEditable dom node
            ref={(e) => {
              registerEditor(e && e.firstChild)
              editorWrapperRef.current = e
            }}
            onClick={handleClickEditable}
            className={cx('slate-editor__editor', { darkmode: darkMode })}
          >
            <Editable
              spellCheck={useSpellcheck === undefined ? true : useSpellcheck}
              {...otherProps}
              renderLeaf={renderLeaf}
              renderElement={renderElement}
              placeholder={t('Enter some text...')}
              onPaste={onPaste}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              onBlur={handleOnBlur}
              onFocus={handleOnFocus}
              onClick={startEditingIfNotAlready}
            />
          </div>
        </div>
      </Slate>
    )
  }

  RichTextEditor.propTypes = {
    editorKey: PropTypes.string.isRequired,
    text: PropTypes.any,
    id: PropTypes.string,
    fileId: PropTypes.string,
    selection: PropTypes.object,
    onChange: PropTypes.func,
    autoFocus: PropTypes.bool,
    darkMode: PropTypes.bool,
    className: PropTypes.string,
    undoId: PropTypes.number,
    clientId: PropTypes.string,
    editState: PropTypes.string,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    imageCache: PropTypes.object.isRequired,
    cacheImage: PropTypes.func.isRequired,
    useSpellcheck: PropTypes.bool,
    jumpCounter: PropTypes.number,
    startEditing: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  checkDependencies({ redux, selectors })

  if (redux) {
    const { connect } = redux

    return connect(
      (state) => ({
        undoId: selectors.undoIdSelector(state),
        clientId: selectors.clientIdSelector(state),
        fileId: selectors.fileIdSelector(state),
        darkMode: selectors.isDarkModeSelector(state),
        imageCache: selectors.imageCacheSelector(state),
        useSpellcheck: selectors.useSpellcheckSelector(state),
        settings: selectors.appSettingsSelector(state),
        jumpCounter: selectors.jumpCounterSelector(state),
        editState: selectors.editStateSelector(state),
      }),
      {
        cacheImage: actions.imageCache.cacheImage,
        startEditing: actions.applicationState.startEditing,
      }
    )(
      // eslint-disable-next-line react/display-name
      React.memo(RichTextEditor, (prevProps, nextProps) => {
        return (
          prevProps.id === nextProps.id &&
          prevProps.undoId === nextProps.undoId &&
          prevProps.darkMode === nextProps.darkMode &&
          prevProps.className === nextProps.className &&
          prevProps.autoFocus === nextProps.autoFocus &&
          prevProps.jumpCounter === nextProps.jumpCounter &&
          prevProps.onChange === nextProps.onChange &&
          prevProps.fileId === nextProps.fileId &&
          prevProps.clientId === nextProps.clientId &&
          prevProps.onBlur === nextProps.onBlur &&
          prevProps.onFocus === nextProps.onFocus &&
          prevProps.imageCache === nextProps.imageCache &&
          prevProps.cacheImage === nextProps.cacheImage &&
          prevProps.editState === nextProps.editState
        )
      })
    )
  }

  throw new Error('Could not connect RichTextEditor')
}

export default RichTextEditorConnector
