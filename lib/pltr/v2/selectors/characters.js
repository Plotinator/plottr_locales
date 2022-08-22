import { createSelector } from 'reselect'
import { sortBy, groupBy } from 'lodash'
import {
  characterSortSelector,
  characterFilterSelector,
  currentTimelineSelector,
  charactersSearchTermSelector,
  characterAttributeTabSelector,
} from './ui'
import { isSeries } from '../helpers/books'
import { outOfOrderSearch } from '../helpers/outOfOrderSearch'
import { attributesSelector } from './attributes'

export const allCharactersSelector = (state) => state.characters
// this one also lives in ./customAttributes.js but it causes a circular dependency to import it here
const characterCustomAttributesSelector = (state) => state.customAttributes.characters

const selectId = (state, id) => id

export const singleCharacterSelector = createSelector(
  allCharactersSelector,
  selectId,
  (characters, propId) => characters.find((ch) => ch.id == propId)
)

export const charactersByCategorySelector = createSelector(allCharactersSelector, (characters) =>
  groupBy(characters, 'categoryId')
)

export const characterTemplateAttributeValueSelector =
  (characterId, templateId, attributeName) => (state) => {
    const character = singleCharacterSelector(state, characterId)
    const templateOnCharacter = character && character.templates.find(({ id }) => id === templateId)
    const valueInAttributes =
      templateOnCharacter &&
      templateOnCharacter.attributes.find(({ name }) => name === attributeName).value
    const valueOnTemplate = templateOnCharacter && templateOnCharacter[attributeName]
    return valueInAttributes || valueOnTemplate
  }

export const characterFilterIsEmptySelector = createSelector(
  characterFilterSelector,
  characterCustomAttributesSelector,
  (filter, attributes) => {
    if (!filter) return true
    const allAttributes = [{ name: 'tag' }, { name: 'book' }, { name: 'category' }, ...attributes]
    return !allAttributes.some((attr) => filter[attr.name] && filter[attr.name].length)
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
      allCharacters.forEach((ch) => {
        const matches = Object.keys(filter).some((attr) => {
          return filter[attr].some((val) => {
            if (attr == 'tag') {
              return ch.tags.includes(val)
            }
            if (attr == 'book') {
              return ch.bookIds.includes(val)
            }
            if (attr == 'category') {
              return ch.categoryId == val
            }
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

const stringifiedCharactersByIdSelector = createSelector(allCharactersSelector, (characters) => {
  return characters.reduce((acc, nextCharacter) => {
    return {
      ...acc,
      [nextCharacter.id]: JSON.stringify(nextCharacter).toLowerCase(),
    }
  }, {})
})

export const visibleSortedSearchedCharactersByCategorySelector = createSelector(
  visibleSortedCharactersByCategorySelector,
  charactersSearchTermSelector,
  stringifiedCharactersByIdSelector,
  (characterCategories, searchTerm, stringifiedCharacters) => {
    if (!searchTerm) return characterCategories

    const lowSearchTerms = searchTerm
      .toLowerCase()
      .split(' ')
      .filter((x) => x)
    return Object.entries(characterCategories).reduce((acc, nextCategory) => {
      const [key, characters] = nextCategory
      const newCharacters = characters.filter(({ id }) => {
        return outOfOrderSearch(lowSearchTerms, stringifiedCharacters[id])
      })
      if (newCharacters.length > 0) {
        return {
          ...acc,
          [key]: newCharacters,
        }
      } else {
        return acc
      }
    }, {})
  }
)

function sortEachCategory(visibleByCategory, sort) {
  let sortOperands = sort.split('~')
  let attrName = sortOperands[0]
  let direction = sortOperands[1]
  let sortByOperand = attrName === 'name' ? [attrName, 'id'] : [attrName, 'name']

  Object.keys(visibleByCategory).forEach((k) => {
    let characters = visibleByCategory[k]

    let sorted = sortBy(characters, sortByOperand)
    if (direction == 'desc') sorted.reverse()
    visibleByCategory[k] = sorted
  })
  return visibleByCategory
}

export const charactersSortedAtoZSelector = createSelector(allCharactersSelector, (characters) =>
  sortBy(characters, 'name')
)

export const charactersSortedInBookSelector = createSelector(
  charactersSortedAtoZSelector,
  currentTimelineSelector,
  (characters, bookId) =>
    characters.filter((character) => {
      if (character.bookIds.length === 0) return true
      if (character.bookIds.some(isSeries)) return true
      return character.bookIds.includes(bookId)
    })
)

const characterCustomAttributes = (state) => state.customAttributes.characters

export const characterAttributesSelector = createSelector(
  singleCharacterSelector,
  attributesSelector,
  characterCustomAttributes,
  characterAttributeTabSelector,
  (character, attributes, customAttributes, bookId) => {
    const characterBookAttributeIds = (character.attributes && character.attributes[bookId]) || []
    const characterAttributes = attributes.filter((attribute) => {
      return characterBookAttributeIds.indexOf(attribute.id) !== -1
    })
    return [...characterAttributes, ...customAttributes]
  }
)
