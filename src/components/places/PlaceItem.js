import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { FiCopy } from 'react-icons/fi'

import { t as i18n } from 'plottr_locales'
import { isNotDroppingToSamePosition } from 'pltr/v2/helpers/lists'

import ButtonGroup from '../ButtonGroup'
import Glyphicon from '../Glyphicon'
import Button from '../Button'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedImage from '../images/Image'
import { checkDependencies } from '../checkDependencies'

const PlaceItemConnector = (connector) => {
  const Image = UnconnectedImage(connector)

  const PlaceItem = ({
    place,
    selected,
    select,
    startEdit,
    stopEdit,
    actions,
    editing,
    isMovingToNewCategory,
    key,
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
        if (node) node.scrollIntoView()
      }
    }

    useEffect(() => {
      scrollIntoView()
    }, [])

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
        isNotDroppingToSamePosition(
          draggedPosition,
          absolutePosition,
          isAbove,
          isMovingToNewCategory
        )
      ) {
        setMoveUp(isAbove)
      }
      if (newPlaceIdPosition != place.id) {
        setNewPlaceIdPosition(place.id)
      }
    }

    const handleDragLeave = (e) => {
      e.preventDefault()
      if (!ref.current.contains(e.relatedTarget) && typeof newPlaceIdPosition !== 'undefined') {
        setNewPlaceIdPosition(null)
      }
    }

    const handleDropItem = (e) => {
      e.stopPropagation()
      e.preventDefault()

      const json = e.dataTransfer.getData('text/json')
      const droppedData = JSON.parse(json)
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

    const handleDragStart = (e) => {
      setDragging(true)
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/json', JSON.stringify({ ...place }))
    }

    const handleDragEnd = (e) => {
      setDragging(false)
    }

    const handleDragEnter = (e) => {
      e.preventDefault()
    }

    return (
      <div
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
    key: PropTypes.number,
    isMovingToNewCategory: PropTypes.bool,
    draggedPosition: PropTypes.number,
    absolutePosition: PropTypes.number,
  }

  const {
    redux,
    pltr: { actions },
  } = connector
  const PlaceActions = actions.place
  checkDependencies({ redux, actions, PlaceActions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(null, (dispatch) => {
      return {
        actions: bindActionCreators(PlaceActions, dispatch),
      }
    })(PlaceItem)
  }

  throw new Error('Could not connect PlaceItem')
}

export default PlaceItemConnector
