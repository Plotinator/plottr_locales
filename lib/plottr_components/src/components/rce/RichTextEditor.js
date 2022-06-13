import React, { useCallback, useMemo, useState, useEffect } from 'react'
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
import { indent } from '../../../dist/components/rce/IndentParagraphButton'
import { handleList } from '../../../dist/components/rce/BlockButton'

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
}

const RichTextEditorConnector = (connector) => {
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
    onBlur,
    onFocus,
    imageCache,
    cacheImage,
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
      onBlur && onBlur()
    }

    const handleOnFocus = () => {
      onFocus && onFocus()
    }

    // Focus on first render
    const [editorWrapperRef, setEditorWrapperRef] = useState(null)
    useEffect(() => {
      if (autoFocus && editorWrapperRef && editorWrapperRef.firstChild) {
        editorWrapperRef.firstChild.focus()
      }
    }, [autoFocus, editorWrapperRef])

    // State management
    const [
      value,
      onValueChanged,
      onKeyDown,
      onPaste,
      _signalFocusToEditState,
      _signalBlurToEditState,
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
      for (const hotkey in HOTKEYS) {
        if (isHotkey(hotkey, event)) {
          event.preventDefault()
          const mark = HOTKEYS[hotkey]
          toggleMark(editor, mark)
        }
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

    useEffect(() => {
      return () => {
        onValueChanged(null, null)
      }
    }, [])

    const handleClickEditable = (event) => {
      if (!editorWrapperRef) return
      if (editorWrapperRef.firstChild.contains(event.target)) return

      // Focus the Editable content
      editorWrapperRef.firstChild.focus()
    }

    if (value === null) return null

    const otherProps = {}
    return (
      <Slate editor={editor} value={value} onChange={onValueChanged} key={editorKey}>
        <div className={cx('slate-editor__wrapper', className)}>
          <ToolBar editor={editor} />
          <div
            // the firstChild will be the contentEditable dom node
            ref={(e) => {
              registerEditor(e && e.firstChild)
              setEditorWrapperRef(e)
            }}
            onClick={handleClickEditable}
            className={cx('slate-editor__editor', { darkmode: darkMode })}
          >
            <Editable
              spellCheck
              {...otherProps}
              renderLeaf={renderLeaf}
              renderElement={renderElement}
              placeholder={t('Enter some text...')}
              onPaste={onPaste}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              onBlur={handleOnBlur}
              onFocus={handleOnFocus}
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
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    imageCache: PropTypes.object.isRequired,
    cacheImage: PropTypes.func.isRequired,
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
        undoId: selectors.undoIdSelector(state.present),
        clientId: selectors.clientIdSelector(state.present),
        fileId: selectors.selectedFileIdSelector(state.present),
        darkMode: selectors.isDarkModeSelector(state.present),
        imageCache: selectors.imageCacheSelector(state.present),
      }),
      { cacheImage: actions.imageCache.cacheImage }
    )(
      // eslint-disable-next-line react/display-name
      React.memo(RichTextEditor, (prevProps, nextProps) => {
        return (
          prevProps.id === nextProps.id &&
          prevProps.undoId === nextProps.undoId &&
          prevProps.darkMode === nextProps.darkMode &&
          prevProps.className === nextProps.className &&
          prevProps.autoFocus === nextProps.autoFocus &&
          prevProps.onChange === nextProps.onChange &&
          prevProps.fileId === nextProps.fileId &&
          prevProps.clientId === nextProps.clientId &&
          prevProps.onBlur === nextProps.onBlur &&
          prevProps.onFocus === nextProps.onFocus &&
          prevProps.imageCache === nextProps.imageCache &&
          prevProps.cacheImage === nextProps.cacheImage
        )
      })
    )
  }

  throw new Error('Could not connect RichTextEditor')
}

export default RichTextEditorConnector
