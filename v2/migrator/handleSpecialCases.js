import { uniq, clone, sortBy, difference } from 'lodash'
import semverGt from 'semver/functions/gt'
import semverGte from 'semver/functions/gte'
import semverLte from 'semver/functions/lte'

import { uiState } from '../store/initialState'

import migrationsList from './migrations_list'
import { nextColor, nextDarkColor } from '../store/lineColors'
import { emptyFile } from '../store/newFileState'
import { toSemver } from './toSemver'

// The 2021-07-07 version was problematic because it was created by
// broken templates.  In that version of the templates we had no
// 'light' and 'dark' keys on hierarchy configuration levels.
export const handle2021_07_07 = (file) => {
  if (file.file.version !== '2021.7.7') return file

  const newFile = clone(file)

  sortBy(Object.entries(newFile.hierarchyLevels), '0').forEach(([index, levelConfig]) => {
    newFile.hierarchyLevels[index].dark = {
      borderColor: nextDarkColor(0),
      textColor: nextDarkColor(0),
    }
    newFile.hierarchyLevels[index].light = {
      borderColor: nextColor(0),
      textColor: nextColor('default'),
    }
  })

  if (!newFile.file.appliedMigrations) {
    newFile.file.appliedMigrations = []
  }
  newFile.file.appliedMigrations.push('m2021_7_7')

  return newFile
}

// Some users have cards with no `templates` field.  In 2020.3.4 we
// add the `templates` field to all cards and give it a default of
// `[]`.  If any cards lack this field and are later than 2020.3.4,
// then we go ahead and add the field in.
export const handleMissingTemplatesFieldOnCards = (file) => {
  if (semverGt('2020.3.4', file.file.version)) {
    return file
  }

  // Check, and leave the file completely un changed if there were no
  // problems, because that feels safer.
  const thereAreMissingTemplates =
    file &&
    file.cards &&
    file.cards.some((card) => !card.templates || !Array.isArray(card.templates))

  if (!thereAreMissingTemplates) return file

  const appliedMigrations = file.file.appliedMigrations || []

  return {
    ...clone(file),
    file: {
      ...clone(file.file),
      appliedMigrations: [...appliedMigrations, 'm2020_3_5'],
    },
    cards: file.cards.map((card) => ({
      ...card,
      templates: card.templates || [],
    })),
  }
}

const isObject = (x) => x && typeof x === 'object' && x.constructor === Object

// There was a bug on mobile that saved the title of a scene card to
// `{ title, description }` rather than `title`.
// and the description was gone elsewhere besides inside the title
export const handleObjectTitlesOnCards = (file) => {
  const FIX_VERSION = 'm2022_1_11'

  const appliedMigrations =
    (file && file.file && file.file.appliedMigrations && file.file.appliedMigrations) || []

  if (appliedMigrations.indexOf(FIX_VERSION) > -1) {
    return file
  }

  const fixApplies =
    file &&
    file.cards &&
    file.cards.some(
      (card) =>
        typeof card.title !== 'string' &&
        isObject(card.title) &&
        typeof card.title.title === 'string' &&
        Array.isArray(card.title.description)
    )

  if (!fixApplies) {
    return file
  }

  return {
    ...file,
    file: {
      ...file.file,
      appliedMigrations: [...appliedMigrations, FIX_VERSION],
    },
    cards: file.cards.map((card) => {
      if (typeof card.title !== 'string' && isObject(card.title)) {
        if (typeof card.title.title !== 'string') {
          console.warn(
            `Card: ${card} has an object instead of its title, but that object has no title(!)`
          )
          return card
        }
        if (!Array.isArray(card.title.description)) {
          console.warn(
            `Card: ${card} has an object instead of its title, but that object has no description(!)`
          )
          return card
        }
        return {
          ...card,
          title: card.title.title,
          description: card.title.description,
        }
      }
      return card
    }),
  }
}

export const MINIMAL_SET_OF_UI_KEYS = [...Object.keys(uiState)]

export const handleMissingUIState = (file) => {
  const fixApplies =
    !file.ui ||
    MINIMAL_SET_OF_UI_KEYS.some((key) => {
      return typeof file.ui[key] === 'undefined'
    })

  if (!fixApplies) {
    return file
  }

  return MINIMAL_SET_OF_UI_KEYS.reduce((acc, key) => {
    if (acc.ui && typeof acc.ui[key] !== 'undefined') {
      return acc
    }
    return {
      ...acc,
      ui: {
        ...acc.ui,
        [key]: uiState[key],
      },
    }
  }, file)
}

export const insertBreakingVersionsPriorToBreakingVersionChange = (file) => {
  const breakingMigrations = migrationsList.filter((mig) => mig.includes('*'))
  const appliedMigrations = file.file.appliedMigrations || []
  const missingBreakingMigrations = difference(breakingMigrations, appliedMigrations).filter(
    (missingVersion) => {
      return semverLte(toSemver(missingVersion), toSemver(file.file.version))
    }
  )

  if (missingBreakingMigrations.length > 0) {
    return {
      ...file,
      file: {
        ...file.file,
        appliedMigrations: [...appliedMigrations, ...missingBreakingMigrations],
      },
    }
  }

  return file
}

export const addHierarchiesIfMissing = (file) => {
  if (
    (typeof file.hierarchyLevels?.series === 'undefined' ||
      file.books.allIds.some((id) => typeof file.hierarchyLevels[id] === 'undefined')) &&
    semverGte(file.file.version, '2023.3.29')
  ) {
    const newFile = emptyFile('', '')
    return {
      ...file,
      hierarchyLevels: {
        ...(file.books?.allIds || []).reduce((acc, next) => {
          return {
            ...acc,
            [next]: newFile.hierarchyLevels['1'],
          }
        }, {}),
        ...file.hierarchyLevels,
        series: newFile.hierarchyLevels.series,
      },
    }
  } else {
    return file
  }
}

export const removeCharacterAttributesForNonExistingBooks = (file) => {
  const attributesOnCharacters = uniq(
    (file.characters || []).flatMap(({ attributes }) => {
      return attributes || []
    })
  )
  const isAttributeForNonExistingBook = (attribute) => {
    return (
      attribute.bookId !== 'all' && file.books.allIds.indexOf(parseInt(attribute.bookId)) === -1
    )
  }
  const brokenCharacterAttributes = attributesOnCharacters.filter(isAttributeForNonExistingBook)
  if (brokenCharacterAttributes.length === 0) {
    return file
  } else {
    const fixedCharacters = (file.characters || []).map((character) => {
      const { attributes } = character
      if (!attributes) {
        return character
      }
      const brokenAttributes = attributes.filter(isAttributeForNonExistingBook)
      if (brokenAttributes.length === 0) {
        return character
      } else {
        return {
          ...character,
          attributes: attributes.filter((attribute) => !isAttributeForNonExistingBook(attribute)),
        }
      }
    })
    return {
      ...file,
      characters: fixedCharacters,
    }
  }
}

const applyAllFixes = (file) =>
  [
    handle2021_07_07,
    handleMissingTemplatesFieldOnCards,
    handleObjectTitlesOnCards,
    handleMissingUIState,
    insertBreakingVersionsPriorToBreakingVersionChange,
    addHierarchiesIfMissing,
    removeCharacterAttributesForNonExistingBooks,
  ].reduce((acc, f) => f(acc), file)

export default applyAllFixes
