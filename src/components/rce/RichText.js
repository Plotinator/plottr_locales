import React, { useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import UnconnectedRichTextEditor from './RichTextEditor'
import RichTextViewer from './RichTextViewer'
import UnconnectedRCEBoundary from './RCEBoundary'

import { checkDependencies } from '../checkDependencies'

const RichTextConnector = (connector) => {
  const RCEBoundary = UnconnectedRCEBoundary(connector)
  const RichTextEditor = UnconnectedRichTextEditor(connector)

  const {
    platform: {
      storage: { imagePublicURL, isStorageURL },
      openExternal,
      log,
      createErrorReport,
    },
  } = connector
  checkDependencies({
    imagePublicURL,
    isStorageURL,
    openExternal,
    log,
    createErrorReport,
  })

  const defaultSelection = {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  }

  const RichText = (props) => {
    const [selection, setSelection] = useState(props.selection)

    useEffect(() => {
      setSelection(props.selection)
    }, [props.selection])

    const reset = () => {
      setSelection(defaultSelection)
    }

    let body = null
    if (props.editable) {
      body = (
        <RichTextEditor
          id={props.id}
          className={props.className}
          onChange={props.onChange}
          autoFocus={props.autofocus}
          selection={selection}
          text={props.description}
          darkMode={props.darkMode}
        />
      )
    } else {
      // TODO: support live watching(?)
      body = (
        <RichTextViewer
          text={props.description}
          className={props.className}
          openExternal={openExternal}
          log={log}
          imagePublicURL={imagePublicURL}
          isStorageURL={isStorageURL}
        />
      )
    }

    return (
      <RCEBoundary
        createErrorReport={createErrorReport}
        openExternal={openExternal}
        resetChildren={reset}
      >
        {body}
      </RCEBoundary>
    )
  }

  RichText.propTypes = {
    id: PropTypes.string,
    description: PropTypes.any,
    selection: PropTypes.object,
    onChange: PropTypes.func,
    editable: PropTypes.bool,
    autofocus: PropTypes.bool,
    className: PropTypes.string,
    darkMode: PropTypes.bool.isRequired,
    isStorageURL: PropTypes.func.isRequired,
    imagePublicURL: PropTypes.func.isRequired,
  }

  return RichText
}

export default RichTextConnector
