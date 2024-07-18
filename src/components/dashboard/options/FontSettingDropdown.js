import React from 'react'
import PropTypes from 'react-proptypes'

import DropdownButton from '../../DropdownButtonV2'

const UnMemoisedFontSettingDropdown = ({
  activeFont,
  addRecent,
  fonts,
  recentFonts,
  onChange,
  onClick,
}) => {
  const title = activeFont || recentFonts?.[0] || 'Forum'

  const changeFont = (font) => {
    addRecent(font)
    onChange(font)
  }

  const renderFont = (f, key, renderMenuItem) => {
    return renderMenuItem(false, activeFont === f, f, { style: { fontFamily: f } }, f)
  }

  const renderFonts = (renderMenuItem) => {
    let fontItems = recentFonts.map((f) => renderFont(f, 'recents', renderMenuItem))
    if (fontItems.length) {
      fontItems.push(renderMenuItem(true))
    }
    fontItems = [...fontItems, ...fonts.map((f) => renderFont(f, '', renderMenuItem))]
    return fontItems
  }

  return (
    <DropdownButton
      title={title}
      onSelect={changeFont}
      id="font-dropdown"
      renderChildren={renderFonts}
      onClick={onClick}
    />
  )
}

UnMemoisedFontSettingDropdown.propTypes = {
  activeFont: PropTypes.string,
  addRecent: PropTypes.func,
  recentFonts: PropTypes.arrayOf(PropTypes.string),
  fonts: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  onClick: PropTypes.func,
}

export const FontSettingDropdown = React.memo(UnMemoisedFontSettingDropdown)
