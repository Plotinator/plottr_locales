import React, { useState, useEffect, useCallback, useRef, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { isEqual } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import { selectors, actions } from 'wired-up-pltr'

import RichTextEditor from './RichTextEditor'
import RichTextViewer from './RichTextViewer'
import RCEBoundary from './RCEBoundary'
import { Spinner } from '../Spinner'
import { PlottrComponentsContext } from '../../connections/pltrContext'

const defaultSelection = null

const RichText = (props) => {
  const {
    platform: {
      storage: { resolveToPublicUrl, isStorageURL },
      openExternal,
      log,
      createErrorReport,
      lockRCE,
      listenForRCELock,
      releaseRCELock,
      errorReporter: { getInstance },
    },
  } = useContext(PlottrComponentsContext)

  const key = useRef(uuidv4())
  const [lock, setLock] = useState(props.isCloudFile ? null : true)
  const [stealingLock, setStealingLock] = useState(false)
  const [focus, setFocus] = useState(null)

  let body = null
  // @ts-ignore
  const disabled = lock && lock.clientId && lock.clientId !== props.clientId
  const showEditor = props.editable

  const reset = useCallback(() => {
    props.onChange(null, defaultSelection)
  }, [props.onChange])

  const onCloud = props.isLoggedIn && props.isCloudFile

  const stealLock = useCallback(() => {
    if (!showEditor || !props.id || !onCloud || stealingLock || props.isOffline || props.isResuming)
      return

    // @ts-ignore
    setFocus(true)
    setStealingLock(true)
    lockRCE(
      props.fileId,
      props.id,
      props.clientId,
      // @ts-ignore
      lock,
      props.emailAddress
    )
      .then(() => {
        setStealingLock(false)
      })
      .catch((error) => {
        getInstance().then((errorReporter) => {
          errorReporter.error(`Error stealing the lock for editor: ${props.id}`, error)
        })
        setStealingLock(false)
      })
  }, [
    props.fileId,
    props.id,
    props.clientId,
    props.emailAddress,
    lock,
    props.isOffline,
    props.isResuming,
  ])

  const relinquishLock = useCallback(() => {
    if (
      (onCloud && !showEditor) ||
      (props.id &&
        onCloud &&
        releaseRCELock &&
        // @ts-ignore
        lock?.clientId === props.clientId)
    ) {
      releaseRCELock(props.fileId, props.id, lock)
    }
  }, [props.fileId, props.id, props.clientId, lock])

  const onFocus = useCallback(() => {
    // @ts-ignore
    setFocus(true)
    if (
      !lock ||
      // @ts-ignore
      !lock.clientId
    ) {
      stealLock()
    }
  }, [setFocus, lock, stealLock])

  const onBlur = useCallback(() => {
    // @ts-ignore
    setFocus(false)
    relinquishLock()
  }, [setFocus, relinquishLock])

  // Check for edit locks
  useEffect(() => {
    if (!showEditor || !onCloud || props.isOffline || props.isResuming || !props.id) return () => {}

    return listenForRCELock(props.fileId, props.id, props.clientId, (lockResult) => {
      if (!isEqual(lockResult, lock)) {
        setLock(lockResult)
        if (lockResult.clientId !== null && lockResult.clientId !== props.clientId) {
          // @ts-ignore
          setFocus(false)
        } else if ((focus || focus === null) && (!lockResult || !lockResult.clientId)) {
          stealLock()
        }
      }
    })
  }, [
    setLock,
    props.fileId,
    lock,
    props.id,
    props.clientId,
    stealLock,
    focus,
    props.isOffline,
    props.isResuming,
    showEditor,
  ])

  useEffect(() => {
    if (!showEditor || props.isOffline || props.isResuming || !props.id) {
      return () => {}
    }

    return () => {
      if (
        releaseRCELock &&
        // @ts-ignore
        lock?.clientId === props.clientId &&
        props.id
      ) {
        // @ts-ignore
        releaseRCELock(props.fileId, props.id)
      }
    }
  }, [lock, props.fileId, props.id, props.isOffline, props.isResuming])

  if (props.editable && !lock && !disabled && !props.isOffline) {
    return <Spinner />
  }

  if (!disabled && showEditor) {
    body = (
      <RichTextEditor
        editorKey={key.current}
        id={props.id}
        onBlur={onBlur}
        onFocus={onFocus}
        className={props.className}
        onChange={props.onChange}
        autoFocus={props.autoFocus}
        selection={props.selection}
        text={props.description}
      />
    )
  } else {
    // TODO: support live watching(?)
    body = (
      <RichTextViewer
        id={props.id}
        lock={lock}
        disabled={!props.editable}
        stealingLock={stealingLock}
        stealLock={stealLock}
        clientId={props.clientId}
        text={props.description}
        className={props.className}
        openExternal={openExternal}
        log={log}
        imagePublicURL={resolveToPublicUrl}
        isStorageURL={isStorageURL}
        imageCache={props.imageCache}
        cacheImage={props.cacheImage}
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
  clientId: PropTypes.string,
  fileId: PropTypes.string,
  emailAddress: PropTypes.string,
  description: PropTypes.any,
  selection: PropTypes.object,
  onChange: PropTypes.func,
  editable: PropTypes.bool,
  autoFocus: PropTypes.bool,
  className: PropTypes.string,
  isStorageURL: PropTypes.func,
  isCloudFile: PropTypes.bool,
  isLoggedIn: PropTypes.any,
  isOffline: PropTypes.bool,
  isResuming: PropTypes.bool,
  imageCache: PropTypes.object.isRequired,
  cacheImage: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  fileId: selectors.fileIdSelector(state),
  clientId: selectors.clientIdSelector(state),
  emailAddress: selectors.emailAddressSelector(state),
  isCloudFile: selectors.isCloudFileSelector(state),
  isLoggedIn: selectors.isLoggedInSelector(state),
  isOffline: selectors.isOfflineSelector(state),
  isResuming: selectors.isResumingSelector(state),
  imageCache: selectors.imageCacheSelector(state),
})

export default connect(mapStateToProps, {
  cacheImage: actions.imageCache.cacheImage,
})(RichText)
