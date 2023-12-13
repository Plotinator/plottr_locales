export function reorderList(originalPosition, newPosition, list) {
  const newList = [...list]
  const [removed] = newList.splice(newPosition, 1)
  newList.splice(originalPosition, 0, removed)
  return newList
}

export function moveToAbove(sourcePosition, newPosition, list, moveUp = true) {
  const newList = [...list]
  let targetPosition = newPosition
  if (sourcePosition < newPosition) {
    // moving it downward
    targetPosition = newPosition == 0 ? 0 : newPosition - 1
  }
  const [removed] = newList.splice(sourcePosition, 1)
  if (moveUp) {
    newList.splice(targetPosition, 0, removed)
  } else {
    newList.splice(targetPosition + 1, 0, removed)
  }
  return newList.filter(Boolean)
}

export function moveItemToPosition(newPosition, list, newItem, moveUp) {
  const newList = [...list]
  const targetPosition = moveUp ? newPosition : newPosition + 1

  newList.splice(targetPosition, 0, newItem)
  return positionReset(newList)
}

export function positionReset(items) {
  return items
    .filter((item) => item != null)
    .map((item, index) => {
      return {
        ...item,
        position: index,
      }
    })
}

export function nextPositionInBook(items, bookId) {
  return (
    items
      .filter((item) => item && item.bookId == bookId)
      .reduce((maxPosition, item) => Math.max(item.position, maxPosition), -1) + 1
  )
}

export function isNotDroppingToSamePosition(
  draggedPosition,
  hoveredPosition,
  isHoveringUpperPart,
  isMovingToNewCategory
) {
  return (
    draggedPosition !== hoveredPosition &&
    !(
      isHoveringUpperPart &&
      (Number(draggedPosition + 1) === Number(hoveredPosition) ||
        Number(draggedPosition) === Number(hoveredPosition)) &&
      !isMovingToNewCategory
    ) &&
    !(
      !isHoveringUpperPart &&
      (Number(draggedPosition - 1) === Number(hoveredPosition) ||
        Number(draggedPosition) === Number(hoveredPosition)) &&
      !isMovingToNewCategory
    )
  )
}
