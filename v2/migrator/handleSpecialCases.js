import { uniq, clone, sortBy, difference, isEmpty, omit } from 'lodash'
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

export const addPinnedPlotlinesIfMissing = (file) => {
  const bookId = file.ui?.currentTimeline
  const totalPinnedLinesFromLines = (file.lines || []).reduce(
    (prevCount, line) => (line.isPinned ? prevCount + 1 : prevCount),
    0
  )
  const hasUITimeline = !isEmpty(file.ui?.timeline)
  const timeline = hasUITimeline ? file.ui.timeline : {}
  const pinnedPlotlines = hasUITimeline ? file.ui.timeline?.pinnedPlotlines : {}
  const pinnedPlotlinesFromCurrentBook = !isEmpty(pinnedPlotlines)
    ? file.ui.timeline?.pinnedPlotlines[String(bookId)]
    : 0

  if (
    (!isEmpty(pinnedPlotlines) && totalPinnedLinesFromLines !== pinnedPlotlinesFromCurrentBook) ||
    !pinnedPlotlinesFromCurrentBook
  ) {
    return {
      ...file,
      ui: {
        ...file.ui,
        timeline: {
          ...timeline,
          pinnedPlotlines: {
            [bookId]: totalPinnedLinesFromLines,
          },
        },
      },
    }
  } else {
    return file
  }
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

export const addUITimelineOrHierarchiesStateIfMissing = (file) => {
  const withHierarchies = addHierarchiesIfMissing(file)
  return addPinnedPlotlinesIfMissing(withHierarchies)
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

/**
 * Mobile might still create legacy character attributes until it's
 * upgraded.  Desktop/web handles legacy attributes fine, but they may
 * overlap with built-in attributes (they do in the templates).
 */
export const migrateLegacyCharacterAttributes = (file) => {
  if (
    !Array.isArray(file?.customAttributes?.characters) ||
    !Array.isArray(file?.characters) ||
    file?.customAttributes?.characters?.length === 0 ||
    file?.characters?.length === 0
  ) {
    return file
  } else {
    const newAttributes = file.attributes?.characters ?? []
    const maxCharacterAttributeId = newAttributes.reduce((maxId, next) => {
      return Math.max(maxId, next.id)
    }, 1)
    const withLegacyAttributes = file.customAttributes.characters.reduce(
      (attributes, nextLegacyAttribute, index) => {
        const alreadyHasAttribute = attributes.some((attribute) => {
          return attribute.name === nextLegacyAttribute.name
        })
        if (alreadyHasAttribute) {
          return attributes
        } else {
          return [
            ...attributes,
            {
              id: maxCharacterAttributeId + index + 1,
              name: nextLegacyAttribute.name,
              type: nextLegacyAttribute.type,
            },
          ]
        }
      },
      newAttributes
    )
    const characterHasLegacyAttributeDefined = (character) => {
      return file.customAttributes.characters.some((legacyAttribute) => {
        return typeof character[legacyAttribute.name] !== 'undefined'
      })
    }
    const aCharacterHasALegacyAttributeDefined = file.characters.some(
      characterHasLegacyAttributeDefined
    )
    const newCharacters = aCharacterHasALegacyAttributeDefined
      ? file.characters.map((character) => {
          const hasALegacyAttributeDefined = characterHasLegacyAttributeDefined
          if (hasALegacyAttributeDefined) {
            return file.customAttributes.characters.reduce((characterAcc, nextLegacyAttribute) => {
              const legacyAttributeValue = character[nextLegacyAttribute.name]
              if (
                typeof legacyAttributeValue !== 'undefined' &&
                (nextLegacyAttribute.name !== 'attributes' ||
                  (nextLegacyAttribute.name === 'attributes' &&
                    (typeof legacyAttributeValue === 'string' ||
                      // This should be a good enough check we're not
                      // dealing with a new character attribute.
                      (Array.isArray(legacyAttributeValue) &&
                        typeof legacyAttributeValue[0]?.id !== 'number'))))
              ) {
                const withoutLegacyAttribute = omit(characterAcc, nextLegacyAttribute.name)
                const newAttributeId = withLegacyAttributes.find((newAttribute) => {
                  return (
                    newAttribute.id > maxCharacterAttributeId &&
                    newAttribute.name === nextLegacyAttribute.name
                  )
                })?.id
                if (typeof newAttributeId === 'number') {
                  return {
                    ...withoutLegacyAttribute,
                    attributes: [
                      ...(characterAcc.attributes ?? []),
                      {
                        id: newAttributeId,
                        bookId: 'all',
                        value: legacyAttributeValue,
                      },
                    ],
                  }
                } else {
                  return withoutLegacyAttribute
                }
              } else {
                return characterAcc
              }
            }, character)
          } else {
            return character
          }
        })
      : file.characters
    return {
      ...file,
      characters: newCharacters,
      customAttributes: {
        ...file.customAttributes,
        characters: [],
      },
      attributes: {
        ...(file.attributes ?? {}),
        characters: withLegacyAttributes,
      },
    }
  }
}

export const IMAGE_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TpX5UHawg4pChOlkQFXHUKhShQqgVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi6uKk6CIl/i8ptIj14Lgf7+497t4BQrXINKttHNB020zEomIqvSoGXtGNXnRiAJCZZcxJUhwtx9c9fHy9i/Cs1uf+HD1qxmKATySeZYZpE28QT2/aBud94hDLyyrxOfGYSRckfuS64vEb55zLAs8MmcnEPHGIWMw1sdLELG9qxFPEYVXTKV9Ieaxy3uKsFcusfk/+wmBGX1nmOs1hxLCIJUgQoaCMAoqwEaFVJ8VCgvajLfxDrl8il0KuAhg5FlCCBtn1g//B726t7OSElxSMAu0vjvMxAgR2gVrFcb6PHad2AvifgSu94S9VgZlP0isNLXwE9G0DF9cNTdkDLneAwSdDNmVX8tMUslng/Yy+KQ303wJda15v9X2cPgBJ6ip+AxwcAqM5yl5v8e6O5t7+PVPv7wf7enJ3iw8StgAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAAd0SU1FB+cLDgkYCNOL7FwAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAARklEQVRYw+3YIQ4AIAwEwSvh/18GiwZTkllVOTnZSrLSuJHmzeOuZrb1xYKAgICAgICAgICAgICAgICAgICAgIC3VXz539rLOwNPnv65RAAAAABJRU5ErkJggg=='

export const removeDudImages = (file) => {
  const isBroken = (image) => {
    const isLocalImageThatLacksData =
      typeof image.storageUrl === 'undefined' && typeof image.data !== 'string'
    const lacksAName = typeof image.name !== 'string'
    const invalidId = typeof image.id !== 'number'
    return isLocalImageThatLacksData || lacksAName || invalidId
  }
  const hasBrokenImage = Object.values(file.images).some(isBroken)
  let newId = Object.values(file.images).length + 1
  const fixImage = (inputImage) => {
    const fixMissingData = (image) => {
      const isLocalImageThatLacksData =
        typeof image.storageUrl === 'undefined' && typeof image.data !== 'string'
      if (isLocalImageThatLacksData) {
        return {
          ...image,
          data: IMAGE_PLACEHOLDER,
        }
      } else {
        return image
      }
    }
    const fixMissingName = (image) => {
      const lacksAName = typeof image.name !== 'string'
      if (lacksAName) {
        return {
          ...image,
          name: ' ',
        }
      } else {
        return image
      }
    }
    const fixInvalidId = (image) => {
      const invalidId = typeof image.id !== 'number'
      if (invalidId) {
        return {
          ...image,
          id: newId++,
        }
      } else {
        return image
      }
    }

    return fixMissingData(fixMissingName(fixInvalidId(inputImage)))
  }
  if (hasBrokenImage) {
    return {
      ...file,
      images: Object.entries(file.images).reduce((imagesAcc, nextKeyValue) => {
        const [key, image] = nextKeyValue
        const fixedImage = fixImage(image)
        return {
          ...imagesAcc,
          [fixedImage.id || key]: fixedImage,
        }
      }, {}),
    }
  } else {
    return file
  }
}

const applyAllFixes = (file) =>
  [
    handle2021_07_07,
    handleMissingTemplatesFieldOnCards,
    handleObjectTitlesOnCards,
    handleMissingUIState,
    insertBreakingVersionsPriorToBreakingVersionChange,
    addUITimelineOrHierarchiesStateIfMissing,
    migrateLegacyCharacterAttributes,
    removeCharacterAttributesForNonExistingBooks,
  ].reduce((acc, f) => f(acc), file)

export default applyAllFixes
