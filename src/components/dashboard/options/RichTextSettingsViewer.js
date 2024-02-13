import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'react-proptypes'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import cx from 'classnames'

import Leaf from '../../rce/Leaf'
import Element from '../../rce/Element'
import {
  rceHalfLoremWithSubtitle,
  rceHalfLoremWithTitle,
  rceHalfLoremWithTitleAndSubtitle,
} from '../../utils/loremIpsum'
import WordCounter from '../../rce/WordCounter'

const RichTextSettingsViewer = (props) => {
  const editor = useMemo(() => {
    return withReact(createEditor(props.log))
  }, [])
  const renderLeaf = useCallback((props) => <Leaf {...props} />, [])
  const renderElement = useCallback(
    (innerProps) => (
      <Element
        {...innerProps}
        openExternal={() => {}}
        imagePublicURL={() => {}}
        isStorageURL={() => {}}
        imageCache={{}}
        cacheImage={() => {}}
      />
    ),
    []
  )
  const [value, setValue] = useState(
    props.textType === 'heading-one'
      ? rceHalfLoremWithTitle
      : props.textType === 'heading-two'
      ? rceHalfLoremWithSubtitle
      : rceHalfLoremWithTitleAndSubtitle
  )
  useEffect(() => {
    const newVal =
      props.textType === 'heading-two'
        ? rceHalfLoremWithTitleAndSubtitle
        : props.textType === 'heading-one'
        ? rceHalfLoremWithTitle
        : rceHalfLoremWithTitleAndSubtitle
    setValue(newVal)
  }, [props.fontFamily, props.fontSize, props.fontWeight, props.color])

  return (
    <Slate editor={editor} value={value}>
      <div
        className={cx('slate-editor__wrapper', {
          readonly: true,
        })}
      >
        <div
          className={cx('slate-editor__editor global__setting', {
            readonly: true,
            rceLocked: false,
            darkmode: props.darkMode,
            light: !props.darkMode,
          })}
        >
          <Editable readOnly renderLeaf={renderLeaf} renderElement={renderElement} />
          <WordCounter text={value} />
        </div>
      </div>
    </Slate>
  )
}

RichTextSettingsViewer.defaultProps = {
  textType: 'paragraph',
}

RichTextSettingsViewer.propTypes = {
  fontFamily: PropTypes.string,
  fontSize: PropTypes.number,
  color: PropTypes.string,
  fontWeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  darkMode: PropTypes.bool,
  log: PropTypes.object.isRequired,
  textType: PropTypes.oneOf(['paragraph', 'heading-one', 'heading-two']),
}

export default RichTextSettingsViewer
