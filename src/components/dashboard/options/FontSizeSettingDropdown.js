import React from 'react'
import PropTypes from 'prop-types'

import DropdownButton from '../../DropdownButtonV2'

const UnMemoisedFontSizeSettingDropdown = ({
  onClick,
  defaultFontSize,
  onChange,
  isMultiplier,
}) => {
  const title = defaultFontSize || 20

  const changeSize = (size) => {
    onChange(Number(size))
  }

  const renderSizes = (renderMenuItem) => {
    const maxfontSize = 96
    let sizeArray = []
    for (let size = 4; size <= maxfontSize; size++) {
      sizeArray.push(renderMenuItem(false, defaultFontSize === size, size, {}, size))
    }
    return sizeArray
  }

  const renderMultiplier = (renderMenuItem) => {
    const sizeArray = [
      {
        value: 1.6,
        title: '0.1x',
      },
      {
        value: 3.2,
        title: '0.2x',
      },
      {
        value: 4.8,
        title: '0.3x',
      },
      {
        value: 6.4,
        title: '0.4x',
      },
      {
        value: 8,
        title: '0.5x',
      },
      {
        value: 9.6,
        title: '0.6x',
      },
      {
        value: 11.2,
        title: '0.7x',
      },
      {
        value: 12.8,
        title: '0.8x',
      },
      {
        value: 14.4,
        title: '0.9x',
      },
      {
        value: 16,
        title: 'Normal',
      },
      {
        value: 20,
        title: '1.25x',
      },
      {
        value: 24,
        title: '1.5x',
      },
      {
        value: 28,
        title: '1.75x',
      },
      {
        value: 32,
        title: '2x',
      },
      {
        value: 36,
        title: '2.25x',
      },
      {
        value: 40,
        title: '2.5x',
      },
      {
        value: 44,
        title: '2.75x',
      },
      {
        value: 48,
        title: '3x',
      },
      {
        value: 52,
        title: '3.25x',
      },
      {
        value: 56,
        title: '3.5x',
      },
      {
        value: 60,
        title: '3.75x',
      },
      {
        value: 64,
        title: '4x',
      },
      {
        value: 68,
        title: '4.25x',
      },
      {
        value: 72,
        title: '4.5x',
      },
      {
        value: 76,
        title: '4.75x',
      },
      {
        value: 80,
        title: '5x',
      },
    ]

    return sizeArray.map((item) => {
      return renderMenuItem(false, defaultFontSize == item.value, item.title, {}, item.value)
    })
  }

  return (
    <DropdownButton
      className="size-picker"
      title={title}
      onSelect={changeSize}
      id="size-dropdown"
      renderChildren={isMultiplier ? renderMultiplier : renderSizes}
      onClick={onClick}
    />
  )
}

UnMemoisedFontSizeSettingDropdown.propTypes = {
  defaultFontSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func.isRequired,
  isMultiplier: PropTypes.bool,
  onClick: PropTypes.func,
}

export const FontSizeSettingDropdown = React.memo(UnMemoisedFontSizeSettingDropdown)
