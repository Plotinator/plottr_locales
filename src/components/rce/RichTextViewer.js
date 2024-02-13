import React, { useCallback, useMemo, useRef, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { FaLock } from 'react-icons/fa'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import cx from 'classnames'

import { t } from 'plottr_locales'

import Leaf from './Leaf'
import Element from './Element'
import { useTextConverter } from './helpers'
import WordCounter from './WordCounter'

const RichTextViewer = ({
  stealingLock,
  stealLock,
  openExternal,
  imagePublicURL,
  isStorageURL,
  imageCache,
  cacheImage,
  id,
  ...props
}) => {
  const editor = useMemo(() => {
    return withReact(createEditor(props.log))
  }, [])
  const genKey = () => {
    return `${id}-${Math.random().toString(16)}`
  }
  const key = useRef(genKey())
  useEffect(() => {
    const newValue = useTextConverter(props.text, props.log)
    key.current = genKey()
    editor.children = newValue
  }, [editor, props.text])
  const renderLeaf = useCallback((props) => <Leaf {...props} />, [])
  const renderElement = useCallback(
    (innerProps) => (
      <Element
        {...innerProps}
        openExternal={openExternal}
        imagePublicURL={imagePublicURL}
        isStorageURL={isStorageURL}
        imageCache={imageCache}
        cacheImage={cacheImage}
      />
    ),
    [openExternal, cacheImage, imageCache]
  )
  const initialValue = useTextConverter(props.text, props.log)
  const isLocked = props.lock && props.lock.clientId && props.lock?.clientId !== props.clientId

  return (
    <Slate editor={editor} value={initialValue} key={key.current} id={id}>
      {!props.disabled && isLocked ? (
        <div className="lock-icon__wrapper" disabled={stealingLock} onClick={stealLock}>
          <span>{t('Take Control')}</span>
          <FaLock />
        </div>
      ) : null}
      <div className={cx('slate-editor__wrapper', props.className, { readonly: true })}>
        <div
          className={cx('slate-editor__editor', {
            readonly: true,
            rceLocked: !props.disabled && isLocked,
          })}
        >
          <Editable readOnly renderLeaf={renderLeaf} renderElement={renderElement} />
          <WordCounter text={initialValue} />
        </div>
      </div>
    </Slate>
  )
}

RichTextViewer.propTypes = {
  id: PropTypes.string.isRequired,
  text: PropTypes.any,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  openExternal: PropTypes.func.isRequired,
  log: PropTypes.object.isRequired,
  isStorageURL: PropTypes.func,
  imagePublicURL: PropTypes.func,
  lock: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  clientId: PropTypes.string,
  stealingLock: PropTypes.bool,
  stealLock: PropTypes.func,
  imageCache: PropTypes.object.isRequired,
  cacheImage: PropTypes.func.isRequired,
}

export default RichTextViewer
