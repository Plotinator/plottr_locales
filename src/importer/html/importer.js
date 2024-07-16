import HTMLParser from 'node-html-parser'
import { uniq, last, mapValues, omit, range, sortBy, isEmpty } from 'lodash'
import levenshtein from 'js-levenshtein'

import { emptyFile, tree, initialState, borderStyle, lineColors, helpers } from 'pltr'

const { lists, hierarchyLevels } = helpers

/**
 * Problems to solve:
 *
 * - What level of heading counts as content?
 *   i.e. if there are headings for "Outline", "Characters",
 *   etc. those shouldn't count as Characters etc.  My guess is that
 *   if the heading has a special name, treat it specially, otherwise
 *   the top level is a beat, and sub headings lower than it all count
 *   as child beats until the lowest level, the lowest level counts as
 *   a card title.
 *
 * - What happens to the structure that's flattened into the file?
 *   e.g. when a character has tags, a category etc.  Are we going to
 *   try and infer that sort of content if its present?
 */

const importHTML = (htmlString, name, version) => {
  // @ts-ignore
  const html = HTMLParser.parse(`<div id="_body">${htmlString}</div>`).getElementById('_body')
  const sections = inferSections(html)
  const categorisedSections = categoriseSections(sections)
  const initialFile = withNoLines(withEmptyBeatsForBookOne(emptyFile(name, version)))
  const withBeats = accumulateBeats(categorisedSections, initialFile)
  const withCards = accumulateCards(categorisedSections, withBeats)
  const withCharacters = accumulateCharacters(categorisedSections, withCards)
  const withPlaces = accumulatePlaces(categorisedSections, withCharacters)
  const withNotes = accumulateNotes(categorisedSections, withPlaces)
  const withoutBeatFromKeys = removeBeatFromKeys(withNotes)
  const withHierarchyConfig = addHierarchyConfig(withoutBeatFromKeys)
  const withFixedTagsPlacesCharacters = fixTagsPlacesAndCharacters(withHierarchyConfig)
  return withFixedTagsPlacesCharacters
}

export function fixTagsPlacesAndCharacters(file) {
  const getTags = ({ tags }) => {
    return tags
  }
  const rawTags = uniq(
    file.cards
      .flatMap(getTags)
      .concat(file.notes.flatMap(getTags))
      .concat(file.places.flatMap(getTags))
      .concat(file.characters.flatMap(getTags))
  )
  const fileWithTags = fixCharacterTags(addTags(file, rawTags))

  const getPlaces = ({ places }) => {
    return places
  }
  const rawPlaces = uniq(file.cards.flatMap(getPlaces).concat(file.notes.flatMap(getPlaces)))
  const fileWithPlaces = fixPlacesInFile(fileWithTags, rawPlaces)

  const getCharacters = ({ characters }) => {
    return characters
  }
  const rawCharacters = uniq(
    file.cards.flatMap(getCharacters).concat(file.notes.flatMap(getCharacters))
  )
  const fileWithCharacters = fixCharactersInFile(fileWithPlaces, rawCharacters)

  return fileWithCharacters
}

function fixCharacterTags(file) {
  const tagBaseAttributeId =
    file.attributes.characters
      .map(({ id }) => {
        return id
      })
      .reduce((acc, next) => {
        return Math.max(acc, next)
      }, 1) + 1
  const fileWithCharacterTagsAttribute = {
    ...file,
    attributes: {
      ...file.attributes,
      characters: [
        ...file.attributes.characters,
        {
          type: 'base-attribute',
          id: tagBaseAttributeId,
          name: 'tags',
        },
      ],
    },
  }

  return {
    ...fileWithCharacterTagsAttribute,
    characters: fileWithCharacterTagsAttribute.characters.map((character) => {
      return {
        ...character,
        tags: [],
        attributes: [
          ...(character.attributes ?? []),
          {
            id: tagBaseAttributeId,
            bookId: 1,
            value: character.tags,
          },
        ],
      }
    }),
  }
}

const removeStringIds = (attributeName) => (entityType, file) => {
  return {
    ...file,
    [entityType]: file[entityType].map((entity) => {
      return {
        ...entity,
        [attributeName]: entity[attributeName].filter((id) => {
          return typeof id === 'number'
        }),
      }
    }),
  }
}

function addTags(file, rawTags) {
  if (rawTags.length === 0) {
    return file
  } else {
    const removeTagStringIds = removeStringIds('tags')
    const removeAllTagStringIds = (file) => {
      return removeTagStringIds(
        'cards',
        removeTagStringIds(
          'places',
          removeTagStringIds('notes', removeTagStringIds('characters', file))
        )
      )
    }
    return removeAllTagStringIds(
      rawTags.reduce((fileAcc, tagName, index) => {
        const id = index + 2
        const newTagsEntry = [
          ...fileAcc.tags,
          { ...initialState.tag, id, color: null, title: tagName },
        ]
        const fixTags = (entities) => {
          return entities.map((entity) => {
            return {
              ...entity,
              tags: (entity.tags ?? []).map((rawTag) => {
                if (rawTag === tagName) {
                  return id
                } else {
                  return rawTag
                }
              }),
            }
          })
        }
        return {
          ...fileAcc,
          places: fixTags(fileAcc.places),
          notes: fixTags(fileAcc.notes),
          cards: fixTags(fileAcc.cards),
          characters: fixTags(fileAcc.characters),
          tags: newTagsEntry,
        }
      }, file)
    )
  }
}

function fixPlacesInFile(file, rawPlaces) {
  const removePlaceStringIds = removeStringIds('places')
  const removeAllPlaceStringIds = (file) => {
    return removePlaceStringIds('notes', removePlaceStringIds('cards', file))
  }
  return removeAllPlaceStringIds(
    rawPlaces.reduce((fileAcc, placeName) => {
      const id = bestLowercaseMatchBy(file.places, placeName, (x) => x.name)?.id
      const fixPlaces = (entities) => {
        return entities.map((entity) => {
          if (typeof id === 'number') {
            return {
              ...entity,
              places: (entity.places ?? []).map((rawPlace) => {
                if (rawPlace === placeName) {
                  return id
                } else {
                  return rawPlace
                }
              }),
            }
          } else {
            return entity
          }
        })
      }
      return {
        ...fileAcc,
        notes: fixPlaces(fileAcc.notes),
        cards: fixPlaces(fileAcc.cards),
      }
    }, file)
  )
}

function fixCharactersInFile(file, rawCharacters) {
  const removeCharacterStringIds = removeStringIds('characters')
  const removeAllCharacterStringIds = (file) => {
    return removeCharacterStringIds('notes', removeCharacterStringIds('cards', file))
  }
  return removeAllCharacterStringIds(
    rawCharacters.reduce((fileAcc, characterName) => {
      const id = bestLowercaseMatchBy(file.characters, characterName, (x) => x.name)?.id
      const fixCharacters = (entities) => {
        return entities.map((entity) => {
          if (typeof id === 'number') {
            return {
              ...entity,
              characters: (entity.characters ?? []).map((rawCharacter) => {
                if (rawCharacter === characterName) {
                  return id
                } else {
                  return rawCharacter
                }
              }),
            }
          } else {
            return entity
          }
        })
      }
      return {
        ...fileAcc,
        notes: fixCharacters(fileAcc.notes),
        cards: fixCharacters(fileAcc.cards),
      }
    }, file)
  )
}

/**
 * Infer attribute-value pairs from the given slateContent.
 *
 * Data corresponds to an attribute name if:
 *  1. it's a single line with text followed by a semi colon, or
 *  2. a heading element.
 *
 * If the attribute name was single-line text (1), then the value is
 * on the same line as the key.  i.e. the value starts after the
 * semi-colon and ends at the next newline.
 *
 * If the attribute name was a heading element (2), then the value is
 * all the lines subsequent to the heading until the next heading that
 * shares its depth.
 *
 * Note that this only supports a subset of our Slate schema that the
 * importer produces via `concatenateContentToSlate`.
 */
export function findAndExtractAttributes(slateContent) {
  function iterHeading(attributes, nonAttributeContent, slate, headingNode) {
    const key = headingNode.children
      .map(({ text }) => {
        return text
      })
      .join(' ')
      .trim()
    if (key === '') {
      return iter(attributes, [...nonAttributeContent, headingNode], slate)
    } else {
      const headingTypeIsBoldAndItalic = isItalicAndBoldHeading(headingNode)
      const valueEndIndexInSlate = slate.findIndex((node) => {
        return (
          (!headingTypeIsBoldAndItalic && node.type === headingNode.type) ||
          (headingTypeIsBoldAndItalic && isItalicAndBoldHeading(node))
        )
      })
      const valueEndIndex = valueEndIndexInSlate === -1 ? slate.length : valueEndIndexInSlate
      const value = slate
        .slice(0, valueEndIndex)
        .flatMap((node) => {
          if (node.type === 'paragraph') {
            return node.children.map(({ text }) => {
              return text
            })
          } else {
            return [node.text || '']
          }
        })
        .join('\n')
      const remainingSlate = slate.slice(valueEndIndex)
      return iter(
        {
          ...attributes,
          [key]: value,
        },
        nonAttributeContent,
        remainingSlate
      )
    }
  }

  function iterSingleLine(attributes, nonAttributeContent, slate, paragraphNode) {
    const firstNode = paragraphNode.children[0]
    if (firstNode && typeof firstNode.text === 'string') {
      const indexOfColon = firstNode.text.indexOf(':')
      const indexOfSpace = firstNode.text.indexOf(' ')
      const noSpace = indexOfSpace === -1

      if (indexOfColon !== -1 && (indexOfSpace > indexOfColon || noSpace)) {
        const key = firstNode.text.slice(0, indexOfColon)
        const value = (
          [
            firstNode.text.slice(indexOfColon + 1),
            paragraphNode.children.slice(1)?.map(({ text }) => {
              return text
            }),
          ].join('') ?? ''
        )
          .trim()
          .replace(/^:/, '')
        return iter(
          {
            ...attributes,
            [key]: value,
          },
          nonAttributeContent,
          slate
        )
      } else {
        return iter(attributes, [...nonAttributeContent, paragraphNode], slate)
      }
    } else {
      return iter(attributes, [...nonAttributeContent, paragraphNode], slate)
    }
  }

  function isItalicAndBoldHeading(node) {
    return (
      node.type === 'paragraph' &&
      Array.isArray(node.children) &&
      node.children?.length > 0 &&
      node.children[0].bold &&
      node.children[0].italic
    )
  }

  function isHeading(node) {
    return node.type.startsWith('heading') || isItalicAndBoldHeading(node)
  }

  function iter(attributes, nonAttributeContent, slate) {
    if (slate.length === 0) {
      return [attributes, nonAttributeContent]
    } else {
      const currentNode = slate[0]
      if (isHeading(currentNode)) {
        return iterHeading(attributes, nonAttributeContent, slate.slice(1), currentNode)
      } else if (currentNode.type === 'paragraph') {
        return iterSingleLine(attributes, nonAttributeContent, slate.slice(1), currentNode)
      } else {
        return iter(attributes, [...nonAttributeContent, currentNode], slate.slice(1))
      }
    }
  }

  return iter({}, [], slateContent)
}

export function withNoLines(file) {
  return {
    ...file,
    lines: [],
  }
}

export function withEmptyBeatsForBookOne(file) {
  return {
    ...file,
    beats: {
      ...file.beats,
      ['1']: tree.newTree('id'),
    },
  }
}

export function addHierarchyConfig(file) {
  const maxDepth = tree.maxDepth('id')(file.beats['1']) + 1
  if (maxDepth > 1) {
    return {
      ...file,
      hierarchyLevels: {
        ...file.hierarchyLevels,
        1: range(0, maxDepth).reduce((acc, nextDepth) => {
          const styleIndex = maxDepth - nextDepth - 1
          return {
            ...acc,
            [nextDepth]: {
              ...initialState.hierarchyLevel(),
              borderStyle: borderStyle.nextBorderStyle(styleIndex),
              dark: {
                borderColor: lineColors.nextDarkColor(styleIndex),
                textColor: lineColors.nextDarkColor(styleIndex),
              },
              light: {
                borderColor: lineColors.nextColor(styleIndex),
                textColor: lineColors.nextColor(styleIndex),
              },
              level: nextDepth,
              name: hierarchyLevels.nextLevelName(styleIndex),
            },
          }
        }, {}),
      },
    }
  } else {
    return file
  }
}

export function removeBeatFromKeys(file) {
  return {
    ...file,
    beats: {
      ...file.beats,
      ['1']: {
        ...file.beats['1'],
        index: mapValues(file.beats['1'].index, (beatIndexEntry) => {
          return omit(beatIndexEntry, 'fromKey')
        }),
      },
    },
  }
}

const higherHeadingLevel = (oneHeading, otherHeading) => {
  const toNumber = (heading) => {
    switch (heading.toLowerCase()) {
      case 'heading-one':
        return 1
      case 'heading-two':
        return 2
      case 'heading-three':
        return 3
      case 'heading-four':
        return 4
      case 'heading-five':
        return 5
      case 'heading-six':
        return 6
      default:
        return 7
    }
  }
  if (toNumber(oneHeading) > toNumber(otherHeading)) {
    return otherHeading
  } else {
    return oneHeading
  }
}

const isThereAnOutlineHeadingOrBookTitleHeading = (categories) => {
  const topHeadingType = findTopHeadingType(categories)
  return (
    categories.cards.reduce((acc, next) => {
      return (
        acc ||
        (next.type === 'CARD' &&
          next.value.some((value) => {
            const { text, type } = value
            return type === topHeadingType && levenshtein(text.toLowerCase(), 'outline') < 3
          }))
      )
    }, false) ||
    categories.cards.reduce((acc, next) => {
      return (
        acc +
        (next.type === 'CARD'
          ? next.value.reduce((topHeadings, value) => {
              const { type } = value
              return type === topHeadingType ? topHeadings + 1 : topHeadings
            }, 0)
          : 0)
      )
    }, 0) === 1
  )
}

const findTopHeadingType = (categories) => {
  return categories.cards.reduce(
    (acc, next) => {
      const { highestLevel } = acc
      const nextLevel = next.key.split('.').length
      if (!highestLevel || highestLevel > nextLevel) {
        return {
          highestLevel: nextLevel,
          headingType: next.value.reduce((highestHeading, nextValue) => {
            const nextType = nextValue.type
            if (highestHeading === null) {
              return nextType
            } else {
              return higherHeadingLevel(highestHeading, nextType)
            }
          }, null),
        }
      } else {
        return acc
      }
    },
    { highestLevel: null, headingType: null }
  ).headingType
}

export function accumulateBeats(categories, file) {
  const maxDepth = categories.cards.reduce((acc, next) => {
    return Math.max(acc, next.key.split('.').length)
  }, 1)

  let nextBeatId = 3

  const thereIsAnOutlineHeadingOrBookTitleHeading =
    isThereAnOutlineHeadingOrBookTitleHeading(categories)

  const startDepth = thereIsAnOutlineHeadingOrBookTitleHeading ? 2 : 1
  const endDepth = Math.max(
    startDepth,
    Math.min(maxDepth - 1, thereIsAnOutlineHeadingOrBookTitleHeading ? 4 : 3)
  )

  return sortBy(
    categories.cards.filter((card) => {
      const cardTitle =
        card.value.find(({ type }) => {
          return type.startsWith('heading')
        })?.text ?? ''
      const cardDepth = card.key.split('.').length
      return !(
        levenshtein(cardTitle.toLowerCase(), 'outline') < 2 ||
        cardDepth < startDepth ||
        cardDepth > endDepth
      )
    }),
    (card) => {
      return card.key.split('.').length
    }
  ).reduce((fileAcc, beat) => {
    const parent = findParent(categories, beat.key)
    const parentBeatId =
      Object.values(fileAcc.beats['1'].index).find(({ fromKey }) => {
        return fromKey === parent.key
      })?.id ?? null
    const title =
      beat.value.find(({ type }) => {
        return type.startsWith('heading')
      })?.text ?? ''

    return {
      ...fileAcc,
      beats: {
        ...fileAcc.beats,
        ['1']: tree.addNode('id')(fileAcc.beats['1'], parentBeatId || null, {
          ...initialState.beat,
          bookId: 1,
          // NOTE: This key must be removed before completing the import
          fromKey: beat.key,
          id: nextBeatId++,
          title,
        }),
      },
    }
  }, file)
}

const findTitleValue = (value) => {
  return value
    .filter(({ type }) => {
      return type.startsWith('heading')
    })
    .sort()?.[0]
}

const concatenateContentToSlate = (value) => {
  const title = findTitleValue(value)
  return value
    .filter((other) => {
      return other !== title
    })
    .map((contentEntity) => {
      if (contentEntity.type === 'paragraph') {
        return {
          type: 'paragraph',
          children: [
            {
              text: contentEntity.text,
            },
          ],
        }
      } else {
        // ASSUME: value types are either 'paragraph' or a valid Slate
        // "heading-X"
        return {
          type: contentEntity.type,
          children: [
            {
              text: contentEntity.text,
            },
          ],
        }
      }
    })
}

const concatenateCardContentToSlate = (value) => {
  const summaryStart = value.findIndex((contentEntity) => {
    return contentEntity.type === 'paragraph' && contentEntity.text.match(/^begin summary/i)
  })
  const summaryEnd = value.findIndex((contentEntity) => {
    return contentEntity.type === 'paragraph' && contentEntity.text.match(/^end summary/i)
  })
  if (summaryStart > 0 && summaryEnd > 0 && summaryEnd > summaryStart) {
    return value.slice(summaryStart + 1, summaryEnd).map((contentEntity) => {
      if (contentEntity.type === 'paragraph') {
        return {
          type: 'paragraph',
          children: [
            {
              text: contentEntity.text,
              ...(typeof contentEntity.bold === 'boolean' ? { bold: contentEntity.bold } : {}),
              ...(typeof contentEntity.italic === 'boolean'
                ? { italic: contentEntity.italic }
                : {}),
            },
          ],
        }
      } else {
        // ASSUME: value types are either 'paragraph' or a valid Slate
        // "heading-X"
        return {
          type: contentEntity.type,
          children: [
            {
              text: contentEntity.text,
              ...(typeof contentEntity.bold === 'boolean' ? { bold: contentEntity.bold } : {}),
              ...(typeof contentEntity.italic === 'boolean'
                ? { italic: contentEntity.italic }
                : {}),
            },
          ],
        }
      }
    })
  } else {
    return []
  }
}

function extractLineFromSceneTitle(lineTitle) {
  const match = lineTitle.match(/\((.*)\)/)
  if (Array.isArray(match)) {
    return match[1]
  } else {
    return null
  }
}

const FORBIDDEN_BASE_ATTRIBUTES = {
  scenes: [
    'beatId',
    'bookId',
    'color',
    'fromTemplateId',
    'id',
    'imageId',
    'lineId',
    'positionInBeat',
    'positionWithinLine',
    'templates',
    'title',
  ],
  characters: ['id', 'color', 'cards', 'noteIds', 'templates', 'imageId', 'bookIds', 'position'],
  places: ['id', 'color', 'cards', 'noteIds', 'templates', 'imageId', 'bookIds', 'position'],
  notes: ['id', 'categoryId', 'lastEdited', 'templates', 'imageId', 'bookIds', 'position'],
}

const BASE_ATTRIBUTES_PER_TYPE = {
  scenes: ['tags', 'characters', 'places', 'color', 'description'],
  characters: ['cards', 'tags', 'description', 'notes'],
  places: ['tags', 'description', 'notes'],
  notes: ['characters', 'places', 'tags', 'content'],
}

function matchBaseAttribute(entityType, attributeName) {
  return bestLowercaseMatchBy(BASE_ATTRIBUTES_PER_TYPE[entityType], attributeName, (x) => x)
}

function matchesBaseAttribute(entityType, attributeName) {
  return !!matchBaseAttribute(entityType, attributeName)
}

function matchesForbiddenAttributeName(entityType, attributeName) {
  return FORBIDDEN_BASE_ATTRIBUTES[entityType].some((forbiddenName) => {
    return levenshtein(forbiddenName.toLowerCase(), attributeName.toLowerCase()) < 3
  })
}

function createAttributes(attributeType, file, attributesObject) {
  const existingAttributes = file.customAttributes[attributeType]
  return Object.keys(attributesObject).reduce((fileAcc, nextAttributeName) => {
    const existingAttribute =
      typeof existingAttributes.find(({ name }) => {
        return name === nextAttributeName
      }) === 'object'

    const matchesABaseAttribute = matchesBaseAttribute(attributeType, nextAttributeName)
    const matchesAForbiddenAttribute = matchesForbiddenAttributeName(
      attributeType,
      nextAttributeName
    )
    if (matchesAForbiddenAttribute) {
      return fileAcc
    } else if (existingAttribute || matchesABaseAttribute || nextAttributeName === 'attributes') {
      return fileAcc
    } else {
      return {
        ...fileAcc,
        customAttributes: {
          ...fileAcc.customAttributes,
          [attributeType]: [
            ...fileAcc.customAttributes[attributeType],
            {
              name: nextAttributeName,
              type: 'text',
            },
          ],
        },
      }
    }
  }, file)
}

function addAttributesToCard(card, attributes) {
  function interpretBaseAttributeValue(name, value) {
    const baseAttributeName = matchBaseAttribute('scenes', name)
    switch (baseAttributeName) {
      case 'places':
      case 'characters':
      case 'tags':
        return value.split(/, *?/).map((subValue) => {
          return subValue.trim()
        })
      default:
        return value
    }
  }

  return Object.entries(attributes).reduce((cardAcc, nextNameValue) => {
    const [name, value] = nextNameValue
    if (name.toLowerCase() === 'attributes') {
      return cardAcc
    } else {
      const matchesABaseAttribute = matchesBaseAttribute('scenes', name)
      const matchesAForbiddenAttribute = matchesForbiddenAttributeName('scenes', name)
      if (matchesAForbiddenAttribute) {
        return cardAcc
      } else if (matchesABaseAttribute) {
        const baseAttributeName = matchBaseAttribute('scenes', name)
        return {
          ...cardAcc,
          [baseAttributeName]: interpretBaseAttributeValue(name, value),
        }
      } else {
        return {
          ...cardAcc,
          [name]: value,
        }
      }
    }
  }, card)
}

const bestLowercaseMatchBy = (collection, searchString, fn) => {
  return collection.reduce((bestMatch, nextItem) => {
    if (searchString.length <= 2) {
      return fn(nextItem).toLowerCase() === searchString.toLowerCase()
    } else {
      const newDistance = levenshtein(fn(nextItem).toLowerCase(), searchString.toLowerCase())
      if (newDistance < 3) {
        if (
          (bestMatch &&
            levenshtein(fn(bestMatch).toLowerCase(), searchString.toLowerCase()) > newDistance) ||
          !bestMatch
        ) {
          return nextItem
        } else {
          return bestMatch
        }
      } else {
        return bestMatch
      }
    }
  }, null)
}

export function accumulateCards(categories, file) {
  let nextCardId =
    file.cards
      .map((card) => {
        return card.id
      })
      .reduce((acc, next) => {
        return Math.max(acc, next)
      }, 1) + 1
  let nextLineId =
    file.lines
      .map((line) => {
        return line.id
      })
      .reduce((acc, next) => {
        return Math.max(acc, next)
      }, 0) + 1

  const thereIsAnOutlineHeadingOrBookTitleHeading =
    isThereAnOutlineHeadingOrBookTitleHeading(categories)
  const topLevelHeadingCount = categories.cards.reduce((acc, next) => {
    return acc + (next.key.split('.').length === 1 ? 1 : 0)
  }, 0)
  const outlineNotUnderOneHeading = topLevelHeadingCount > 1
  const maxHeadingDepth = categories.cards.reduce((acc, next) => {
    return Math.max(acc, next.key.split('.').length)
  }, 1)
  const startHeadingDepth = thereIsAnOutlineHeadingOrBookTitleHeading ? 2 : 1
  const endHeadingDepth =
    outlineNotUnderOneHeading && maxHeadingDepth === 2
      ? 1
      : maxHeadingDepth === 3
      ? 2
      : maxHeadingDepth > 3
      ? 3
      : maxHeadingDepth

  return categories.cards.reduce((fileAcc, beat) => {
    const beatFromKeyDepth = beat.key.split('.').length
    const lowestParentInTree = beat.key.split('.').slice(0, endHeadingDepth).join('.')
    const beatFromKey =
      beatFromKeyDepth >= startHeadingDepth && beatFromKeyDepth <= endHeadingDepth
        ? beat.key
        : beatFromKeyDepth < startHeadingDepth
        ? beat.key
        : lowestParentInTree
    const beatId =
      Object.values(fileAcc.beats['1'].index).find(({ fromKey }) => {
        return fromKey === beatFromKey
      })?.id ?? 3
    const rawTitle = findTitleValue(beat.value)?.text || 'Untitled'
    const lineTitle = extractLineFromSceneTitle(rawTitle)
    const title = rawTitle.replace(/ *\(.*\)$/, '')
    const existingLine = lineTitle
      ? bestLowercaseMatchBy(fileAcc.lines, lineTitle, (x) => x.title)
      : null
    const bookOneLine = fileAcc.lines.find(({ bookId }) => {
      return bookId === 1
    })
    const line =
      existingLine && typeof existingLine === 'object'
        ? existingLine
        : typeof lineTitle === 'string'
        ? {
            ...initialState.line,
            id: nextLineId,
            title: lineTitle,
            color: lineColors.nextColor(
              fileAcc.lines.filter((line) => {
                return line.bookId === 1
              }).length
            ),
            position: lists.nextPositionInBook(fileAcc.lines, 1),
          }
        : typeof bookOneLine === 'object'
        ? bookOneLine
        : {
            ...initialState.line,
            id: nextLineId,
            title: 'Main Plot',
            color: lineColors.nextColor(
              fileAcc.lines.filter((line) => {
                return line.bookId === 1
              }).length
            ),
            position: lists.nextPositionInBook(fileAcc.lines, 1),
          }
    const lineId = line.id
    const fullDescription = concatenateCardContentToSlate(beat.value)
    const [attributes, description] = findAndExtractAttributes(fullDescription)
    const fileWithCustomAttributes = createAttributes('scenes', fileAcc, attributes)

    // There's a strange interaction between beat depth etc here.
    if (
      (description.length === 0 && isEmpty(attributes) && beatFromKeyDepth <= endHeadingDepth) ||
      beatFromKeyDepth < startHeadingDepth
    ) {
      return fileWithCustomAttributes
    } else {
      const newCard = addAttributesToCard(
        {
          ...initialState.card,
          id: nextCardId++,
          beatId: beatId,
          lineId: lineId,
          title,
          description,
        },
        attributes
      )
      if (
        line &&
        typeof line === 'object' &&
        (typeof lineTitle === 'string' || typeof bookOneLine !== 'object') &&
        !existingLine
      ) {
        nextLineId++
        return {
          ...fileWithCustomAttributes,
          cards: [...fileWithCustomAttributes.cards, newCard],
          lines: [...fileWithCustomAttributes.lines, line],
        }
      } else {
        return {
          ...fileWithCustomAttributes,
          cards: [...fileWithCustomAttributes.cards, newCard],
        }
      }
    }
  }, file)
}

function addAttributesToCharacters(character, attributes) {
  function interpretBaseAttributeValue(name, value) {
    const baseAttributeName = matchBaseAttribute('places', name)
    switch (baseAttributeName) {
      case 'books':
      case 'tags':
        return value.split(/, *?/).map((subValue) => {
          return subValue.trim()
        })
      default:
        return value
    }
  }

  return Object.entries(attributes).reduce((characterAcc, nextNameValue) => {
    const [name, value] = nextNameValue
    if (name.toLowerCase() === 'attributes') {
      return characterAcc
    } else {
      const matchesABaseAttribute = matchesBaseAttribute('places', name)
      if (matchesABaseAttribute) {
        const baseAttributeName = matchBaseAttribute('places', name)
        return {
          ...characterAcc,
          [baseAttributeName]: interpretBaseAttributeValue(name, value),
        }
      } else {
        return {
          ...characterAcc,
          [name]: value,
        }
      }
    }
  }, character)
}

export function accumulateCharacters(categories, file) {
  let nextCharacterId =
    file.characters
      .map((character) => {
        return character.id
      })
      .reduce((acc, next) => {
        return Math.max(acc, next)
      }, 1) + 1

  return categories.characters
    .filter(({ key }) => {
      return key.slice('.').length > 1
    })
    .reduce((fileAcc, character) => {
      const name = findTitleValue(character.value)?.text || 'Unnamed'
      const fullDescription = concatenateContentToSlate(character.value)
      const [attributes, notes] = findAndExtractAttributes(fullDescription)
      const fileWithCustomAttributes = createAttributes('characters', fileAcc, attributes)
      const newCharacter = addAttributesToCharacters(
        {
          ...initialState.character,
          id: nextCharacterId++,
          name,
          notes,
        },
        attributes
      )

      return {
        ...fileWithCustomAttributes,
        characters: [...fileWithCustomAttributes.characters, newCharacter],
      }
    }, file)
}

function addAttributesToPlace(place, attributes) {
  function interpretBaseAttributeValue(name, value) {
    const baseAttributeName = matchBaseAttribute('places', name)
    switch (baseAttributeName) {
      case 'books':
      case 'tags':
        return value.split(/, *?/).map((subValue) => {
          return subValue.trim()
        })
      default:
        return value
    }
  }

  return Object.entries(attributes).reduce((placeAcc, nextNameValue) => {
    const [name, value] = nextNameValue
    if (name.toLowerCase() === 'attributes') {
      return placeAcc
    } else {
      const matchesABaseAttribute = matchesBaseAttribute('places', name)
      if (matchesABaseAttribute) {
        const baseAttributeName = matchBaseAttribute('places', name)
        return {
          ...placeAcc,
          [baseAttributeName]: interpretBaseAttributeValue(name, value),
        }
      } else {
        return {
          ...placeAcc,
          [name]: value,
        }
      }
    }
  }, place)
}

export function accumulatePlaces(categories, file) {
  let nextPlaceId =
    file.places
      .map((place) => {
        return place.id
      })
      .reduce((acc, next) => {
        return Math.max(acc, next)
      }, 1) + 1

  return categories.places
    .filter(({ key }) => {
      return key.slice('.').length > 1
    })
    .reduce((fileAcc, place) => {
      const name = findTitleValue(place.value)?.text || 'Untitled'
      const fullDescription = concatenateContentToSlate(place.value)
      const [attributes, notes] = findAndExtractAttributes(fullDescription)
      const fileWithCustomAttributes = createAttributes('places', fileAcc, attributes)

      const newPlace = addAttributesToPlace(
        {
          ...initialState.place,
          id: nextPlaceId++,
          name,
          notes,
        },
        attributes
      )

      return {
        ...fileWithCustomAttributes,
        places: [...fileWithCustomAttributes.places, newPlace],
      }
    }, file)
}

function addAttributesToNote(card, attributes) {
  function interpretBaseAttributeValue(name, value) {
    const baseAttributeName = matchBaseAttribute('notes', name)
    switch (baseAttributeName) {
      case 'bookIds':
      case 'characters':
      case 'places':
      case 'tags':
        return value.split(/, *?/).map((subValue) => {
          return subValue.trim()
        })
      default:
        return value
    }
  }

  return Object.entries(attributes).reduce((cardAcc, nextNameValue) => {
    const [name, value] = nextNameValue
    if (name.toLowerCase() === 'attributes') {
      return cardAcc
    } else {
      const matchesABaseAttribute = matchesBaseAttribute('notes', name)
      if (matchesABaseAttribute) {
        const baseAttributeName = matchBaseAttribute('notes', name)
        return {
          ...cardAcc,
          [baseAttributeName]: interpretBaseAttributeValue(name, value),
        }
      } else {
        return {
          ...cardAcc,
          [name]: value,
        }
      }
    }
  }, card)
}

export function accumulateNotes(categories, file) {
  let nextNoteId =
    file.notes
      .map((note) => {
        return note.id
      })
      .reduce((acc, next) => {
        return Math.max(acc, next)
      }, 1) + 1

  return categories.notes
    .filter(({ key }) => {
      return key.slice('.').length > 1
    })
    .reduce((fileAcc, note) => {
      const title = findTitleValue(note.value)?.text || 'Untitled'
      const fullDescription = concatenateContentToSlate(note.value)
      const [attributes, content] = findAndExtractAttributes(fullDescription)
      const fileWithCustomAttributes = createAttributes('notes', fileAcc, attributes)

      const newNote = addAttributesToNote(
        {
          ...initialState.note,
          id: nextNoteId++,
          title,
          content,
        },
        attributes
      )

      return {
        ...fileWithCustomAttributes,
        notes: [...fileWithCustomAttributes.notes, newNote],
      }
    }, file)
}

/**
 * Each entry has the following schema:
 * {
 *   type: "BEAT"|"CARD"|"CHARACTER"|"PLACE"|"NOTE",
 *   key: "([0-9]+.?)+",
 *   value: String
 * }
 */
export const EMPTY_CATEGORISED_SECTIONS = {
  cards: [],
  characters: [],
  places: [],
  notes: [],
}

function isParentOf(parentKey, key) {
  return key.startsWith(parentKey)
}

function findParent(categorisedSections, key) {
  const accumulator = (acc, categorisedBeat) => {
    const isParent = isParentOf(categorisedBeat.key, key)
    const differenceBetweenLevels = key.split('.').length - categorisedBeat.key.split('.').length
    if (isParent && (acc === null || differenceBetweenLevels === 1)) {
      return categorisedBeat
    } else {
      return acc
    }
  }

  return (
    categorisedSections.cards.reduce(accumulator, null) ??
    categorisedSections.characters.reduce(accumulator, null) ??
    categorisedSections.places.reduce(accumulator, null) ??
    categorisedSections.notes.reduce(accumulator, null)
  )
}

const CATEGORY_HEADINGS = ['CHARACTERS', 'NOTES', 'PLACES', 'OUTLINE']

const CATEGORY_TO_SECTION_KEY = {
  CHARACTERS: 'characters',
  NOTES: 'notes',
  PLACES: 'places',
  OUTLINE: 'cards',
}

const TYPE_TO_SECTION_KEY = {
  CHARACTER: 'characters',
  NOTE: 'notes',
  PLACE: 'places',
  CARD: 'cards',
  BEAT: 'cards',
  OUTLINE: 'cards',
}

const CATEGORY_TO_TYPE = {
  CHARACTERS: 'CHARACTER',
  NOTES: 'NOTE',
  PLACES: 'PLACE',
  OUTLINE: 'CARD',
}

const TYPES_THAT_DONT_NEST = ['CHARACTER', 'NOTE', 'PLACE']

export function categoriseSections(sections) {
  return Object.entries(sections.flatHierarchy).reduce((acc, next) => {
    const [key, value] = next
    const parent = findParent(acc, key)
    if (typeof parent?.type === 'string') {
      const categoryKey = TYPE_TO_SECTION_KEY[parent.type]
      if (TYPES_THAT_DONT_NEST.includes(parent.type) && key.split('.').length > 2) {
        return {
          ...acc,
          [categoryKey]: acc[categoryKey].map((categorisedEntity) => {
            const shouldAccumulate =
              key.startsWith(categorisedEntity.key) && categorisedEntity.key.split('.').length === 2
            if (shouldAccumulate) {
              return {
                ...categorisedEntity,
                value: [...categorisedEntity.value, ...value],
              }
            } else {
              return categorisedEntity
            }
          }),
        }
      } else {
        return {
          ...acc,
          [categoryKey]: [...acc[categoryKey], { value, key, type: parent.type }],
        }
      }
    } else {
      const isTopLevelHeading = key.length > 0 && key.split('.').length === 1
      const categoryMatch =
        isTopLevelHeading &&
        ['CHARACTERS', 'NOTES', 'PLACES'].find((label) => {
          const heading =
            value.find(({ type }) => {
              return type.startsWith('heading')
            })?.text ?? ''
          return Math.abs(levenshtein(label.toLowerCase(), heading.toLowerCase())) < 3
        })

      if (categoryMatch) {
        const categoryKey = CATEGORY_TO_SECTION_KEY[categoryMatch]
        const type = CATEGORY_TO_TYPE[categoryMatch]
        return {
          ...acc,
          [categoryKey]: [...acc[categoryKey], { type, key, value }],
        }
      } else {
        return {
          ...acc,
          cards: [...acc.cards, { type: 'CARD', key, value }],
        }
      }
    }
  }, EMPTY_CATEGORISED_SECTIONS)
}

// For debugging
function _tagTree(html) {
  if (html.nodeType === 3) {
    return {
      type: 'text',
    }
  } else {
    return {
      tag: html.tagName,
      children: html.childNodes.map(_tagTree),
    }
  }
}

const EMPTY_SECTIONS = {
  flatHierarchy: {},
  uncategorised: [],
}

function safeParseInt(x) {
  try {
    return parseInt(x)
  } catch (error) {
    return 0
  }
}

const maxIdAtLevel = (prefix, depth) => (sections) => {
  return Object.keys(sections.flatHierarchy).reduce((acc, next) => {
    const sectionSegments = next.split('.')
    if (next.startsWith(prefix) && sectionSegments.length === depth + 1) {
      return Math.max(acc, safeParseInt(last(sectionSegments)))
    } else {
      return acc
    }
  }, 0)
}

export const parseStyleAttribute = (styleString) => {
  if (typeof styleString === 'string') {
    return styleString.split(';').reduce((acc, next) => {
      const keyValue = next.split(':').map((x) => {
        return x.trim()
      })

      if (keyValue.length === 2) {
        return {
          ...acc,
          [keyValue[0]]: keyValue[1],
        }
      } else {
        return acc
      }
    }, {})
  } else {
    return styleString
  }
}

const guardIterable = (xs) => {
  return Array.from(xs ?? [])
}

const ensureAtLeastOneElement = (children) => {
  if (Array.isArray(children) && children.length === 0) {
    return [{ text: '' }]
  } else {
    return children
  }
}

const interpretTextToArray = (node) => {
  const children = () => {
    return ensureAtLeastOneElement(guardIterable(node.childNodes)).flatMap(interpretTextToArray)
  }

  const style = parseStyleAttribute(
    guardIterable(node.attributes).find((attribute) => {
      return attribute.name === 'style'
    })?.value
  )

  const extraProps = {
    ...(typeof style?.color === 'string' ? { color: style?.color } : {}),
    ...(typeof style?.['font-family'] === 'string' ? { font: style?.['font-family'] } : {}),
    ...(typeof style?.['font-size'] === 'string' && typeof safeParseInt(style?.size) === 'number'
      ? { fontSize: safeParseInt(style?.['font-size']) }
      : {}),
  }

  if (node.nodeType === 3) {
    return [{ text: node.textContent }]
  } else if (typeof node.text === 'string' && typeof node.rawTagName === 'undefined') {
    return node
  } else {
    switch (node.rawTagName.toLowerCase()) {
      case 'em':
      case 'i': {
        return children().flatMap((child) => {
          return {
            ...child,
            ...extraProps,
            italic: true,
          }
        })
      }
      case 'b':
      case 'strong': {
        return children().flatMap((child) => {
          return {
            ...child,
            ...extraProps,
            bold: true,
          }
        })
      }
      case 'u': {
        return children().flatMap((child) => {
          return {
            ...child,
            ...extraProps,
            underline: true,
          }
        })
      }
      default: {
        return [{ text: node.textContent }]
      }
    }
  }
}

const interpretText = (type) => (node) => {
  return interpretTextToArray(node).map((textObject) => {
    return {
      ...textObject,
      type,
    }
  })
}

function parentOf(currentDepth, lastId) {
  const idSegments = lastId.split('.')
  return idSegments.slice(0, currentDepth - 1).join('.')
}

export function inferSections(html) {
  function readIntoKey(acc, key, node, type) {
    if (type.startsWith('heading')) {
      return {
        ...acc,
        flatHierarchy: {
          ...acc.flatHierarchy,
          [key]: [
            ...(acc.flatHierarchy[key] || []),
            {
              text: node.childNodes
                .flatMap(interpretText(type))
                .map(({ text }) => {
                  return text
                })
                .join(' ')
                .trim(),
              type,
            },
          ],
        },
      }
    } else {
      const newContent =
        node.nodeType === 3
          ? [{ type: 'paragraph', text: node.text.trim() }]
          : node.childNodes.flatMap(interpretText(type))
      if (node.nodeType === 3 && node.text.trim() === '') {
        return acc
      } else {
        return {
          ...acc,
          flatHierarchy: {
            ...acc.flatHierarchy,
            [key]: [...(acc.flatHierarchy[key] || []), ...newContent],
          },
        }
      }
    }
  }

  function accumulate(sections, node, previousId, _previousWasHeading) {
    const categoriseText = () => {
      if (!previousId) {
        return {
          sections: {
            ...sections,
            uncategorised: [...sections.uncategorised, ...node.childNodes.flatMap(interpretText)],
          },
          id: previousId,
          previousWasHeading: false,
        }
      } else {
        return {
          sections: readIntoKey(sections, previousId, node, 'paragraph'),
          id: previousId,
          previousWasHeading: false,
        }
      }
    }
    if (typeof node.tagName !== 'string') {
      return categoriseText()
    } else {
      switch (node.tagName.toLowerCase()) {
        case 'h1': {
          const lastIdDigit = maxIdAtLevel('', 0)(sections) + 1
          const id = `${lastIdDigit}`
          return {
            sections: readIntoKey(sections, id, node, 'heading-one'),
            id,
            previousWasHeading: true,
          }
        }
        case 'h2': {
          if (previousId === null) {
            const lastIdDigit = maxIdAtLevel('1', 1)(sections) + 1
            const id = `1.${lastIdDigit}`
            return {
              sections: readIntoKey(sections, id, node, 'heading-two'),
              id,
              previousWasHeading: true,
            }
          } else {
            const parentId = parentOf(2, previousId)
            const lastIdDigit = maxIdAtLevel(parentId, 1)(sections) + 1
            const id = `${parentId}.${lastIdDigit}`
            return {
              sections: readIntoKey(sections, id, node, 'heading-two'),
              id,
              previousWasHeading: true,
            }
          }
        }
        case 'h3': {
          if (previousId === null) {
            const lastIdDigit = maxIdAtLevel('2', 2)(sections) + 1
            const id = `1.1.${lastIdDigit}`
            return {
              sections: readIntoKey(sections, id, node, 'heading-three'),
              id,
              previousWasHeading: true,
            }
          } else {
            const parentId = parentOf(3, previousId)
            const lastIdDigit = maxIdAtLevel(parentId, 2)(sections) + 1
            const id = `${parentId}.${lastIdDigit}`
            return {
              sections: readIntoKey(sections, id, node, 'heading-three'),
              id,
              previousWasHeading: true,
            }
          }
        }
        case 'h4': {
          if (previousId === null) {
            const lastIdDigit = maxIdAtLevel('3', 3)(sections) + 1
            const id = `1.1.1.${lastIdDigit}`
            return {
              sections: readIntoKey(sections, id, node, 'heading-four'),
              id,
              previousWasHeading: true,
            }
          } else {
            const parentId = parentOf(4, previousId)
            const lastIdDigit = maxIdAtLevel(parentId, 3)(sections) + 1
            const id = `${parentId}.${lastIdDigit}`
            return {
              sections: readIntoKey(sections, id, node, 'heading-four'),
              id,
              previousWasHeading: true,
            }
          }
        }
        case 'h5': {
          if (previousId === null) {
            const lastIdDigit = maxIdAtLevel('4', 4)(sections) + 1
            const id = `1.1.1.1.${lastIdDigit}`
            return {
              sections: readIntoKey(sections, id, node, 'heading-five'),
              id,
              previousWasHeading: true,
            }
          } else {
            const parentId = parentOf(5, previousId)
            const lastIdDigit = maxIdAtLevel(parentId, 4)(sections) + 1
            const id = `${parentId}.${lastIdDigit}`
            return {
              sections: readIntoKey(sections, id, node, 'heading-five'),
              id,
              previousWasHeading: true,
            }
          }
        }
        case 'h6': {
          if (previousId === null) {
            const lastIdDigit = maxIdAtLevel('6', 6)(sections) + 1
            const id = `1.1.1.1.1.${lastIdDigit}`
            return {
              sections: readIntoKey(sections, id, node, 'heading-six'),
              id,
              previousWasHeading: true,
            }
          } else {
            const parentId = parentOf(6, previousId)
            const lastIdDigit = maxIdAtLevel(parentId, 5)(sections) + 1
            const id = `${parentId}.${lastIdDigit}`
            return {
              sections: readIntoKey(sections, id, node, 'heading-six'),
              id,
              previousWasHeading: true,
            }
          }
        }
        case 'p':
        default: {
          return categoriseText()
        }
      }
    }
  }

  return html.childNodes.reduce(
    (acc, nextChild) => {
      const { previousId, sections, previousWasHeading } = acc
      const nextSections = accumulate(sections, nextChild, previousId, previousWasHeading)
      return {
        sections: nextSections.sections,
        previousId: nextSections.id,
        previousWasHeading: nextSections.previousWasHeading,
      }
    },
    { previousId: null, sections: EMPTY_SECTIONS }
  ).sections
}

export default importHTML
