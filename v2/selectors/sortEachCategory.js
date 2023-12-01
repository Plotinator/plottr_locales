import { sortBy } from 'lodash'

import { positionReset } from '../helpers/lists'

const sortManually = (items, attributeId, bookId) => {
  return sortBy(items, (item) => {
    const theAttribute = (attribute) => {
      return attribute.id === attributeId && attribute.bookId == bookId
    }
    if (attributeId) {
      return item.attributes?.find(theAttribute)?.value
    } else {
      return item.position
    }
  })
}

export function sortEachCategory(visibleByCategory, sort, isManuallySorted, attributeId, bookId) {
  const sortOperands = sort.split('~')
  const attrName = sortOperands[0]
  const attrExtractor = attrName === 'last edited' ? 'lastEdited' : attrName
  const direction = sortOperands[1]
  const sortByOperand = attrName === 'name' ? [attrExtractor, 'id'] : [attrExtractor, 'name']

  Object.keys(visibleByCategory).forEach((k) => {
    const itemByCategory = visibleByCategory[k]

    const sorted = isManuallySorted
      ? sortManually(itemByCategory, attributeId, bookId)
      : positionReset(sortBy(itemByCategory, sortByOperand))

    if (direction == 'desc') sorted.reverse()
    visibleByCategory[k] = sorted
  })
  return visibleByCategory
}
