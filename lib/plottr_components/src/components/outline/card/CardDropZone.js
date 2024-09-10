import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { FaCircle } from '@react-icons/all-files/fa/FaCircle'

const CardDropZone = ({ inDropZone, noIndicator }) => {
  return (
    <div className={cx('outline__card-drop', { display: inDropZone })}>
      {noIndicator ? <></> : <FaCircle />}
    </div>
  )
}

CardDropZone.propTypes = {
  inDropZone: PropTypes.bool,
  noIndicator: PropTypes.bool,
}

export default CardDropZone
