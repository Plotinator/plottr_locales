import React from 'react'
import PropTypes from 'prop-types'

import DropdownButton from '../../DropdownButtonV2'

const UnMemoisedFontWeightSettingDropdown = ({ defaultFontWeight, onChange, onClick }) => {
  const title = defaultFontWeight || 500

  const changeWeight = (weight) => {
    onChange(Number(weight))
  }

  const renderWeights = (renderMenuItem) => {
    const fontWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900]

    return fontWeights.map((item) => {
      return renderMenuItem(false, defaultFontWeight == item, item, {}, item)
    })
  }

  return (
    <DropdownButton
      className="font-weight-picker"
      title={title}
      onSelect={changeWeight}
      id="fontWeight-dropdown"
      renderChildren={renderWeights}
      onClick={onClick}
    />
  )
}

UnMemoisedFontWeightSettingDropdown.propTypes = {
  defaultFontWeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func.isRequired,
  onClick: PropTypes.func,
}

export const FontWeightSettingDropdown = React.memo(UnMemoisedFontWeightSettingDropdown)
