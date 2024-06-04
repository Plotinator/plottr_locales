import React, { useState, useCallback, useRef } from 'react'
import { PropTypes } from 'prop-types'
import cx from 'classnames'
import { useRootClose } from 'react-overlays'

const MenuItem = ({ divider, active, title, extraProps, key, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(title)
  }, [title, onSelect])

  if (divider) {
    return <li role="separator" className="divider" key={key}></li>
  } else {
    return (
      <li
        role="presentation"
        className={cx({ active })}
        key={key}
        onClick={handleClick}
        {...(extraProps ?? {})}
      >
        <a draggable="false" role="menuitem" tabIndex="-1" href="#">
          {title}
        </a>
      </li>
    )
  }
}

MenuItem.propTypes = {
  divider: PropTypes.bool,
  key: PropTypes.string.isRequired,
  active: PropTypes.bool,
  title: PropTypes.string,
  extraProps: PropTypes.object,
  onSelect: PropTypes.func,
}

const DropdownButton = ({
  className,
  title,
  onSelect,
  id,
  disabled,
  activeKey,
  renderChildren,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOpen = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen, setIsOpen])

  const handleSelect = useCallback(
    (key) => {
      onSelect(key)
      setIsOpen(false)
    },
    [onSelect, setIsOpen]
  )

  const ref = useRef()

  useRootClose(
    ref,
    (event) => {
      event.preventDefault()
      event.stopPropagation()
      setIsOpen(false)
    },
    { disabled: !isOpen }
  )

  return (
    <div className={cx('dropdown btn-group', { open: isOpen })}>
      <button
        id={id}
        role="button"
        aria-haspopup="true"
        aria-expanded="true"
        type="button"
        className="dropdown-toggle btn btn-default"
        onClick={toggleOpen}
      >
        {title}
        <span className="caret"></span>
      </button>
      <ul ref={ref} role="menu" className="dropdown-menu" aria-labelledby="font-dropdown">
        {renderChildren((divider, active, title, extraProps, key) => (
          <MenuItem
            divider={divider}
            active={active}
            title={title}
            onSelect={handleSelect}
            extraProps={extraProps}
          />
        ))}
      </ul>
    </div>
  )
}

DropdownButton.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  activeKey: PropTypes.string.isRequired,
  renderChildren: PropTypes.func.isRequired,
}

export default DropdownButton
