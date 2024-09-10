import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cx from 'classnames'
import { FiCopy } from '@react-icons/all-files/fi/FiCopy'

import { actions } from 'wired-up-pltr'
import { t as i18n } from 'plottr_locales'
import { helpers } from 'pltr'

import ButtonGroup from '../ButtonGroup'
import Glyphicon from '../Glyphicon'
import Button from '../Button'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import Image from '../images/Image'
import { isInviewport } from '../domHelpers'

const { isNotDroppingToSamePosition } = helpers.lists

const PlaceItem = ({
  place,
  selected,
  select,
  startEdit,
  stopEdit,
  actions,
  editing,
  isMovingToNewCategory,
  draggedPosition,
  absolutePosition,
}) => {
  const [deleting, setDeleting] = useState(false)
  const [newPlaceIdPosition, setNewPlaceIdPosition] = useState(null)
  const [moveUp, setMoveUp] = useState(null)
  const [isDragging, setDragging] = useState(false)

  const isDroppable =
    Number.isInteger(newPlaceIdPosition) &&
    place.id == newPlaceIdPosition &&
    draggedPosition !== absolutePosition
  const moveBelow = moveUp !== null && !moveUp && isDroppable
  const moveAbove = moveUp !== null && moveUp && !moveBelow && isDroppable

  const ref = useRef()

  const scrollIntoView = () => {
    if (selected) {
      const node = ref.current
      if (node && !isInviewport(node)) {
        // @ts-ignore
        node.scrollIntoView()
      }
    }
  }

  useEffect(() => {
    scrollIntoView()
  }, [selected])

  const deletePlace = (e) => {
    e.stopPropagation()
    actions.deletePlace(place.id)
  }

  const cancelDelete = (e) => {
    e.stopPropagation()
    setDeleting(false)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    setDeleting(true)
    stopEdit()
  }

  const selectPlace = () => {
    if (selected) {
      startEdit()
    } else {
      select(place.id)
    }
  }

  const startEditing = (e) => {
    e.stopPropagation()
    if (editing) {
      stopEdit()
    } else {
      select(place.id)
      startEdit()
    }
  }

  const handleDuplicate = () => {
    actions.duplicatePlace(place.id)
  }

  const renderDelete = () => {
    if (!deleting) return null

    return (
      <DeleteConfirmModal
        name={place.name || i18n('New Place')}
        onDelete={deletePlace}
        onCancel={cancelDelete}
      />
    )
  }

  const renderHoverOptions = () => {
    return (
      <ButtonGroup className="place-list__item-buttons">
        <Button bsSize="small" onClick={startEditing}>
          <Glyphicon glyph="edit" />
        </Button>
        <Button bsSize="small" onClick={handleDuplicate}>
          <FiCopy />
        </Button>
        <Button bsSize="small" onClick={handleDelete}>
          <Glyphicon glyph="trash" />
        </Button>
      </ButtonGroup>
    )
  }

  let img = null
  if (place.imageId) {
    img = (
      <div className="place-list__item-inner__image-wrapper">
        <Image size="small" shape="rounded" imageId={place.imageId} />
      </div>
    )
  }

  const handleDragOver = (e, place) => {
    e.preventDefault()
    const targetElement = e.currentTarget
    const mouseY = e.clientY - targetElement.getBoundingClientRect().top
    const isAbove = Boolean(Math.round(mouseY) < Math.round(targetElement.clientHeight / 2))

    if (
      moveUp != isAbove &&
      isNotDroppingToSamePosition(draggedPosition, absolutePosition, isAbove, isMovingToNewCategory)
    ) {
      // @ts-ignore
      setMoveUp(isAbove)
    }
    if (newPlaceIdPosition != place.id) {
      setNewPlaceIdPosition(place.id)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    // @ts-ignore
    if (!ref.current.contains(e.relatedTarget) && typeof newPlaceIdPosition !== 'undefined') {
      setNewPlaceIdPosition(null)
    }
  }

  const handleDropItem = (e) => {
    e.stopPropagation()
    e.preventDefault()

    const json = e.dataTransfer.getData('text/json')
    const droppedData = helpers.json.safeParseJSON(json)

    if (droppedData !== null) {
      actions.reorderPlaces(
        droppedData.id,
        droppedData.position,
        place.position,
        place.categoryId || null,
        moveUp ? 'up' : 'down'
      )
      setNewPlaceIdPosition(null)
      setMoveUp(null)
      setDragging(false)
    }
  }

  const handleDragStart = (e) => {
    setDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/json', JSON.stringify({ ...place }))
  }

  const handleDragEnd = (_e) => {
    setDragging(false)
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
  }

  return (
    <div
      // @ts-ignore
      ref={ref}
      draggable
      onDragStart={handleDragStart}
      onDrop={handleDropItem}
      onDragOver={(e) => handleDragOver(e, place)}
      onDragLeave={handleDragLeave}
      onDragEnd={handleDragEnd}
      onDragEnter={handleDragEnter}
      className={cx('list-group-item__wrapper', {
        dragging: isDragging && absolutePosition === draggedPosition,
      })}
    >
      <div className={cx('dropzone-indicator', { display: moveAbove })} />
      <div
        className={cx('list-group-item', {
          selected,
        })}
        // @ts-ignore
        ref={ref}
        onClick={selectPlace}
      >
        {renderDelete()}
        <div className="place-list__item-inner">
          {img}
          <div>
            <h6 className={cx('list-group-item-heading', { withImage: !!place.imageId })}>
              {place.name || i18n('New Place')}
            </h6>
            <p className="list-group-item-text">{place.description.substr(0, 100)}</p>
          </div>
          {renderHoverOptions()}
        </div>
      </div>
      <div className={cx('dropzone-indicator', { display: moveBelow })} />
    </div>
  )
}

PlaceItem.propTypes = {
  place: PropTypes.object.isRequired,
  selected: PropTypes.bool.isRequired,
  editing: PropTypes.bool,
  select: PropTypes.func.isRequired,
  startEdit: PropTypes.func.isRequired,
  stopEdit: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  isMovingToNewCategory: PropTypes.bool,
  draggedPosition: PropTypes.number,
  absolutePosition: PropTypes.number,
}

const PlaceActions = actions.place

export default connect(null, (dispatch) => {
  return {
    actions: bindActionCreators(PlaceActions, dispatch),
  }
})(PlaceItem)
