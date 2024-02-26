export const boundingRectContains = (boundingRect, coord) => {
  const { left, top, right, bottom } = boundingRect
  const { x, y } = coord

  return x >= left && x <= right && y >= top && y <= bottom
}

export const contains = (element, click) => {
  return boundingRectContains(element.getBoundingClientRect(), click)
}

export const isInviewport = (element) => {
  const rect = element.getBoundingClientRect()
  if (typeof rect !== 'object') {
    return false
  } else {
    const { top, left, right, bottom } = rect
    return (
      top >= 0 &&
      left >= 0 &&
      right <= (window?.innerWidth ?? document?.documentElement?.clientWidth ?? 0) &&
      bottom <= (window?.innerHeight ?? document?.documentElement?.clientHeight ?? 0)
    )
  }
}
