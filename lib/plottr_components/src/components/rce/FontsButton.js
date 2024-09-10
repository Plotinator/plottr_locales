import React, { useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { Editor, Text as SlateText } from 'slate'
import { ReactEditor, useSlate } from 'slate-react'
import { uniq } from 'lodash'

import DropdownButton from '../DropdownButtonV2'

const UnMemoisedFontsButton = ({
  editor,
  addRecent,
  fonts,
  recentFonts,
  logger,
  currentSetting,
}) => {
  const [activeFont, setActiveFont] = useState(
    getCurrentFont(editor, logger, recentFonts, currentSetting)
  )
  const [displayedFont, setDisplayedFont] = useState(
    getDisplayedFont(editor, logger, recentFonts, currentSetting)
  )

  // needs this so it gets changes to editor.selection
  // I don't know why
  const _editor = useSlate()

  useEffect(() => {
    if (editor.selection) {
      if (ReactEditor.isFocused(editor)) {
        const timer = setTimeout(() => {
          const newFont = getCurrentFont(editor, logger, recentFonts, currentSetting)
          if (newFont !== activeFont) {
            setActiveFont(newFont)
          }
          const newDisplayedFont = getDisplayedFont(editor, logger, recentFonts, currentSetting)
          if (newDisplayedFont !== displayedFont) {
            setDisplayedFont(newDisplayedFont)
          }
        }, 100)
        return () => {
          clearTimeout(timer)
        }
      }
    }
    return () => {}
  }, [editor.selection, setActiveFont, activeFont, displayedFont, setDisplayedFont])

  useEffect(() => {
    setActiveFont(getCurrentFont(editor, logger, recentFonts, currentSetting))
  }, [recentFonts, currentSetting, setActiveFont])

  useEffect(() => {
    setDisplayedFont(getDisplayedFont(editor, logger, recentFonts, currentSetting))
  }, [recentFonts, currentSetting, setDisplayedFont])

  const changeFont = (font) => {
    // The editor's never been focused.
    if (editor.selection === null) {
      new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
        ReactEditor.focus(editor)
        return new Promise((resolve) => setTimeout(resolve, 100)).then(() => {
          setActiveFont(font)
          setDisplayedFont(font)
          addRecent(font)
          addFontMark(editor, font)
        })
      })
    } else {
      setActiveFont(font)
      setDisplayedFont(font)
      addRecent(font)
      addFontMark(editor, font)
    }
  }

  const renderFont = (f, key, renderMenuItem) => {
    return renderMenuItem(false, displayedFont === f, f, { style: { fontFamily: f } }, key)
  }

  const renderFonts = (renderMenuItem) => {
    let fontItems = recentFonts.map((f) => renderFont(f, `${f}-recents`, renderMenuItem))
    if (fontItems.length) {
      fontItems.push(renderMenuItem(true, null, null, null, 'fonts-button-divider'))
    }
    fontItems = [...fontItems, ...fonts.map((f) => renderFont(f, `${f}-original`, renderMenuItem))]
    return fontItems
  }

  return (
    <DropdownButton
      title={displayedFont}
      onSelect={changeFont}
      id="font-dropdown"
      renderChildren={renderFonts}
    />
  )
}

UnMemoisedFontsButton.propTypes = {
  currentSetting: PropTypes.string,
  addRecent: PropTypes.func,
  recentFonts: PropTypes.arrayOf(PropTypes.string),
  fonts: PropTypes.arrayOf(PropTypes.string),
  editor: PropTypes.object.isRequired,
  logger: PropTypes.object.isRequired,
}

export const FontsButton = React.memo(UnMemoisedFontsButton)

const getCurrentFont = (editor, logger, recentFonts, currentSetting) => {
  // @ts-ignore
  if (Editor.validSelection(editor)) {
    try {
      // @ts-ignore
      const [node] = Editor.nodes(editor, { match: (n) => n.font })
      if (node) {
        // @ts-ignore
        return node[0].font
      } else {
        if (currentSetting) return currentSetting
        return recentFonts?.length ? recentFonts[0] : 'Forum'
      }
    } catch (error) {
      logger.error('Error attempting to get current fonts.', error)
      return 'Forum'
    }
  } else {
    return 'Forum'
  }
}

const getDisplayedFont = (editor, logger, recentFonts, currentSetting) => {
  // @ts-ignore
  if (Editor.validSelection(editor)) {
    try {
      const nodes = Array.from(Editor.nodes(editor, { match: SlateText.isText }))
      const fonts = uniq(
        nodes.map(([node]) => {
          // @ts-ignore
          return node.font
        })
      )
      if (fonts.length > 1) {
        return '--'
        // @ts-ignore
      } else if (nodes[0]?.[0]?.font && typeof nodes[0]?.[0]?.font === 'string') {
        // @ts-ignore
        return nodes[0]?.[0].font
      } else {
        if (currentSetting) {
          return currentSetting
        } else {
          const validRecentFonts = recentFonts.filter((recentFont) => {
            return typeof recentFont === 'string'
          })
          return validRecentFonts?.length ? validRecentFonts[0] : 'Forum'
        }
      }
    } catch (error) {
      logger.error('Error attempting to get current fonts.', error)
      return 'Forum'
    }
  } else {
    return 'Forum'
  }
}

const addFontMark = (editor, font) => {
  // @ts-ignore
  if (Editor.validSelection(editor)) {
    Editor.addMark(editor, 'font', font)
  }
}
