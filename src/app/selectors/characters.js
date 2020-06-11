import { createSelector } from 'reselect'
import { sortBy, groupBy } from 'lodash'
import { characterSortSelector, characterFilterSelector } from './ui'

export const allCharactersSelector = state => state.characters
// this one also lives in ./customAttributes.js but it causes a circular dependency to import it here
const characterCustomAttributesSelector = state => state.customAttributes.characters

export const charactersByCategorySelector = createSelector(
  allCharactersSelector,
  (characters) => groupBy(characters, 'categoryId')
)

export const characterFilterIsEmptySelector = createSelector(
  characterFilterSelector,
  characterCustomAttributesSelector,
  (filter, attributes) => {
    if (!filter) return true
    return !attributes.some(attr => filter[attr.name] && filter[attr.name].length)
  }
)

export const visibleSortedCharactersByCategorySelector = createSelector(
  allCharactersSelector,
  charactersByCategorySelector,
  characterFilterSelector,
  characterFilterIsEmptySelector,
  characterSortSelector,
  (allCharacters, charactersByCategory, filter, filterIsEmpty, sort) => {
    if (!allCharacters.length) return {}

    let visible = charactersByCategory
    if (!filterIsEmpty) {
      visible = {}
      allCharacters.forEach(ch => {
        const matches = Object.keys(filter).some(attr => {
          return filter[attr].some(val => {
            if (val == '') {
              if (!ch[attr] || ch[attr] == '') return true
            } else {
              if (ch[attr] && ch[attr] == val) return true
            }
            return false
          })
        })
        if (matches) {
          if (visible[ch.categoryId] && visible[ch.categoryId].length) {
            visible[ch.categoryId].push(ch)
          } else {
            visible[ch.categoryId] = [ch]
          }
        }
      })
    }

    return sortEachCategory(visible, sort)
  }
)


function sortEachCategory (visibleByCategory, sort) {
  let sortOperands = sort.split('~')
  let attrName = sortOperands[0]
  let direction = sortOperands[1]
  let sortByOperand = attrName === 'name' ? [attrName, 'id'] : [attrName, 'name']

  Object.keys(visibleByCategory).forEach(k => {
    let characters = visibleByCategory[k]

    let sorted = sortBy(characters, sortByOperand)
    if (direction == 'desc') sorted.reverse()
    visibleByCategory[k] = sorted
  })
  return visibleByCategory
}
