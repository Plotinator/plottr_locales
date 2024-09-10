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

const lowercaseIfString = (x) => {
  if (typeof x === 'string') {
    return x.toLowerCase()
  } else {
    return x
  }
}

export function sortEachCategory(visibleByCategory, sort, isManuallySorted, attributeId, bookId) {
  const sortOperands = sort.split('~')
  const attrName = sortOperands[0]
  const attrExtractor =
    attrName === 'last edited'
      ? (entity) => {
          if (typeof entity.lastEdited !== 'number') {
            return 0
          } else {
            return entity.lastEdited
          }
        }
      : attrName
  const direction = sortOperands[1]
  const sortByOperand =
    attrName === 'name'
      ? [(x) => lowercaseIfString(x[attrExtractor]), (x) => lowercaseIfString(x.id)]
      : [(x) => lowercaseIfString(x[attrExtractor]), (x) => lowercaseIfString(x.name)]

  return Object.keys(visibleByCategory).reduce((acc, k) => {
    const itemByCategory = visibleByCategory[k]

    const sorted = isManuallySorted
      ? sortManually(itemByCategory, attributeId, bookId)
      : positionReset(sortBy(itemByCategory, sortByOperand))

    if (direction == 'desc') sorted.reverse()
    return {
      ...acc,
      [k]: sorted,
    }
  }, {})
}
