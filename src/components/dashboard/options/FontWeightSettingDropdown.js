import React from 'react'
import { PropTypes } from 'prop-types'

import DropdownButton from '../../DropdownButton'
import MenuItem from '../../MenuItem'

const UnMemoisedFontWeightSettingDropdown = ({ defaultFontWeight, onChange, onClick }) => {
  const title = defaultFontWeight || 500

  const changeWeight = (weight) => {
    onChange(Number(weight))
  }

  const renderWeights = () => {
    const fontWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900]

    return fontWeights.map((item) => {
      return (
        <MenuItem key={`fontWeight-${item}`} eventKey={item} active={defaultFontWeight == item}>
          {item}
        </MenuItem>
      )
    })
  }

  return (
    <DropdownButton
      className="font-weight-picker"
      title={title}
      onSelect={changeWeight}
      id="fontWeight-dropdown"
      onClick={onClick}
    >
      {renderWeights()}
    </DropdownButton>
  )
}

UnMemoisedFontWeightSettingDropdown.propTypes = {
  defaultFontWeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
}

export const FontWeightSettingDropdown = React.memo(UnMemoisedFontWeightSettingDropdown)
