import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Editor, Text as SlateText } from 'slate'
import { ReactEditor, useSlate } from 'slate-react'
import { uniq, range } from 'lodash'

import DropdownButton from '../DropdownButtonV2'

const UnMemoisedFontSizeChooser = ({ editor, defaultFontSize, logger }) => {
  const [currentSize, setCurrentSize] = useState(getCurrentSize(editor, defaultFontSize))
  const [displayedSize, setDisplayedSize] = useState(
    getDisplayedSize(editor, defaultFontSize, logger)
  )
  const [disabled, setDisabled] = useState(false)

  const _editor = useSlate()

  useEffect(() => {
    if (ReactEditor.isFocused(editor)) {
      const timer = setTimeout(() => {
        const newSize = getCurrentSize(editor, defaultFontSize)
        if (newSize !== currentSize) {
          setCurrentSize(newSize)
        }
        const newDisplayedSize = getDisplayedSize(editor, defaultFontSize, logger)
        if (newDisplayedSize !== displayedSize) {
          setDisplayedSize(newDisplayedSize)
        }
      }, 100)
      // @ts-ignore
      setDisabled(Editor.isInHeading(editor))
      return () => {
        clearTimeout(timer)
      }
    }
    return () => {}
  }, [editor.selection, setDisabled, setCurrentSize, setDisplayedSize, currentSize, displayedSize])

  useEffect(() => {
    setCurrentSize(getCurrentSize(editor, defaultFontSize))
    setDisplayedSize(getDisplayedSize(editor, defaultFontSize, logger))
  }, [defaultFontSize, setCurrentSize, setDisplayedSize])

  const changeSize = (size) => {
    setCurrentSize(Number(size))
    setDisplayedSize(Number(size))
    addFontSizeMark(editor, Number(size))
  }

  const renderSizes = (renderMenuItem) => {
    const maxfontSize = 96
    return range(4, maxfontSize + 1).map((size) => {
      return renderMenuItem(false, size === currentSize, `${size}`, {}, `size-${size}`)
    })
  }

  return (
    <DropdownButton
      className="size-picker"
      title={`${displayedSize}`}
      onSelect={changeSize}
      id="size-dropdown"
      disabled={disabled}
      renderChildren={renderSizes}
    />
  )
}

UnMemoisedFontSizeChooser.propTypes = {
  editor: PropTypes.object.isRequired,
  defaultFontSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  logger: PropTypes.object.isRequired,
}

export const FontSizeChooser = React.memo(UnMemoisedFontSizeChooser)

const getDisplayedSize = (editor, defaultFontSize, logger) => {
  // @ts-ignore
  if (Editor.validSelection(editor)) {
    try {
      const nodes = Array.from(Editor.nodes(editor, { match: SlateText.isText }))
      const fontSizes = uniq(
        nodes.map(([node]) => {
          // @ts-ignore
          return node.fontSize
        })
      )
      if (fontSizes.length > 1) {
        return '--'
        // @ts-ignore
      } else if (nodes[0]?.[0]?.fontSize && typeof nodes[0]?.[0]?.fontSize === 'number') {
        // @ts-ignore
        return nodes[0]?.[0].fontSize
      } else {
        return defaultFontSize ?? 20
      }
    } catch (error) {
      logger.error('Error attempting to get displayed font size.', error)
      return defaultFontSize ?? 20
    }
  } else {
    return defaultFontSize ?? 20
  }
}

const getCurrentSize = (editor, defaultFontSize) => {
  // @ts-ignore
  if (Editor.validSelection(editor)) {
    // @ts-ignore
    const [node] = Editor.nodes(editor, { match: (n) => n.fontSize })
    if (node) {
      // @ts-ignore
      return node[0].fontSize
    } else {
      return defaultFontSize || 20
    }
  } else {
    return defaultFontSize || 20
  }
}

const addFontSizeMark = (editor, size) => {
  // @ts-ignore
  if (Editor.validSelection(editor)) {
    Editor.addMark(editor, 'fontSize', size)
  }
}
