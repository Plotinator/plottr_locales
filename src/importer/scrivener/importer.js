import xml from 'xml-js'
import { isObject, cloneDeep, omit, uniqWith, isEqual, range } from 'lodash'

import { newIds, helpers, lineColors, initialState, slate, tree } from 'pltr'
import { t } from 'plottr_locales'

import { uuidsToIntegerIds } from './uuidsToIntegerIds'

const { nextId } = newIds
const {
  lists: { nextPositionInBook },
  beats: { positionReset },
  hierarchyLevels: { nextLevelName },
} = helpers
const { nextColor } = lineColors

const { newHierarchyLevel } = initialState
const defaultLine = initialState.line
const defaultCard = initialState.card
const defaultNote = initialState.note
const defaultCharacter = initialState.character
const defaultPlace = initialState.place
const defaultTag = initialState.tag

const NOT_SCRIVENER_PROJECT_ERROR_MESSAGE = "This doesn't look like a scrivener file"
const DRAFT_FOLDER_TYPE = 'DraftFolder'
const RESEARCH_FOLDER_TYPE = 'ResearchFolder'
const FOLDER_TYPE = 'Folder'
const TEXT_TYPE = 'Text'
const MANUSCRIPT_BINDER_ITEM_TITLE = 'Manuscript'

function importScrivenerFile(
  filePath,
  // TODO: unused!!!
  isNewFile,
  preparedFile,
  convertRTFToSlate,
  readFile,
  readdir,
  stat,
  extname,
  basename,
  join
) {
  const files = new Map()
  const thunkFile = (withData) => (filePath) => () => {
    if (files.has(filePath)) {
      return Promise.resolve(files.get(filePath))
    } else {
      return readFile(filePath).then((contents) => {
        const value = withData(contents, filePath)
        if (typeof value.then === 'function') {
          return value.then((resultValue) => {
            files.set(filePath, resultValue)
            return resultValue
          })
        } else {
          files.set(filePath, value)
          return value
        }
      })
    }
  }

  return rootDirectory(filePath, readdir, join, stat, extname).then((root) => {
    if (!root) {
      return Promise.reject(new Error(NOT_SCRIVENER_PROJECT_ERROR_MESSAGE))
    } else {
      const { scrivenerStructurePath, rootPath } = root
      const scrivenerStructure = thunkFile(readXML)(scrivenerStructurePath)
      return Promise.all([
        basename(rootPath),
        scrivenerStructure(),
        allTxtAndRTFFiles(
          rootPath,
          readdir,
          stat,
          extname,
          join,
          thunkFile(transformRTFOrIdentityOnText(extname, convertRTFToSlate))
        ),
      ])
        .then(([bookTitle, scrivenerStructureFile, fileIndex]) => {
          const scrivenerStructure = interpretScrivenerStructure(scrivenerStructureFile, fileIndex)
          return transformToPlottrFile(scrivenerStructure, bookTitle, preparedFile)
        })
        .then((plottrFile) => {
          return uuidsToIntegerIds(plottrFile)
        })
    }
  })
}

function transformRTFOrIdentityOnText(extname, convertRTFToSlate) {
  return (content, filePath) => {
    return extname(filePath).then((extension) => {
      if (extension === '.rtf') {
        return convertRTFToSlate(content)
      } else {
        return content
      }
    })
  }
}

const BULLET_POINT_REGEX = /^\t+[•◦]\t+/

function nodeIsBullet(node) {
  return typeof node.text === 'string' && node.text.match(BULLET_POINT_REGEX)
}

/**
 * Produce true if an immediate child of slateNode encodes a list item
 * using literal bullet point characters and tabs.
 */
export function containsBullet(slateNode) {
  return (slateNode.children || []).some(nodeIsBullet)
}

/**
 * Remove the part at the start of the given line that corresponds to
 * a bullet point encoded by tabs and literal bullet characters.
 */
export function stripBullet(line) {
  return line.replace(BULLET_POINT_REGEX, '')
}

/**
 * In the array of slate items called slateArray, find the
 * neighbouring bulleted lists and join them together.
 */
export function joinNeighbouringLists(slateArray) {
  const { result, run } = slateArray.reduce(
    ({ result, run }, nextNode) => {
      if (nextNode.type !== 'bulleted-list' && run.length > 0) {
        return {
          result: [
            ...result,
            ...(run.length > 0
              ? [{ type: 'bulleted-list', children: run.flatMap(({ children }) => children) }]
              : []),
            nextNode,
          ],
          run: [],
        }
      } else if (nextNode.type === 'bulleted-list') {
        return {
          result,
          run: [...run, nextNode],
        }
      } else {
        return {
          result: [...result, nextNode],
          run: [],
        }
      }
    },
    { result: [], run: [] }
  )

  return [
    ...result,
    ...(run.length > 0
      ? [{ type: 'bulleted-list', children: run.flatMap(({ children }) => children) }]
      : []),
  ]
}

/**
 * Given some Slate content that might include lists that are encoded
 * with literal bullet characters and tabs to indicate depth, parse
 * our own list structure from the bullet lines.
 */
export function inferLists(slateContent) {
  function accumulateLists(content, nextNode) {
    if (containsBullet(nextNode)) {
      return [
        ...content,
        {
          ...nextNode,
          children: nextNode.children.map((child) => {
            if (typeof child.text === 'string' && nodeIsBullet(child)) {
              return {
                type: 'bulleted-list',
                children: [
                  {
                    type: 'list-item',
                    children: [{ text: stripBullet(child.text) }],
                  },
                ],
              }
            } else {
              return {
                ...child,
              }
            }
          }),
        },
      ]
    } else if (nodeIsBullet(nextNode)) {
      return [
        ...content,
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ text: stripBullet(nextNode.text) }],
            },
          ],
        },
      ]
    } else if (Array.isArray(nextNode.children)) {
      return [
        ...content,
        {
          ...nextNode,
          children: nextNode.children.reduce(accumulateLists, []),
        },
      ]
    } else {
      return [...content, nextNode]
    }
  }
  return joinNeighbouringLists(slateContent.reduce(accumulateLists, []))
}

export function transformToPlottrFile(scrivenerStructure, bookTitle, preparedFile) {
  // Might be useful to create multiple books in the future...
  const bookId = 1
  return extractPlotlines(scrivenerStructure, bookId).then((lines) => {
    return Promise.all([
      transformCards(scrivenerStructure, lines),
      extractBeats(scrivenerStructure, bookId),
      transformNotes(scrivenerStructure),
      transformCharacters(scrivenerStructure),
      transformPlaces(scrivenerStructure),
    ])
      .then(([cards, beats, notes, characters, places]) => {
        return {
          ...preparedFile,
          lines,
          cards,
          beats,
          notes,
          characters,
          places,
        }
      })
      .then(linkTagsCharactersAndPlaces)
      .then(createCharacterAttributesPerBook)
      .then(addHierarchyIfDeeperThanOne)
  })
}

/**
 * Given the hierarchy config for a single book, rename all the
 * level's names so that they correspond with their level.
 */
function resetHierarchyNames(hierarchyLevels) {
  const levelsAsArray = Object.values(hierarchyLevels)
  return levelsAsArray.reduce((acc, level) => {
    return {
      ...acc,
      [level.level]: {
        ...level,
        name: nextLevelName(levelsAsArray.length - level.level - 1),
      },
    }
  }, {})
}

/**
 * Find the depth of the beat tree for book 1.  If it's greater than 1
 * then add levels of hierarchy to the file to match its depth.
 */
function addHierarchyIfDeeperThanOne(file) {
  const depth = tree.maxDepth('id')(file.beats['1']) + 1
  if (depth <= 1) {
    return file
  } else {
    const newFile = range(1, depth).reduce((file, level) => {
      const currentLevels = Object.values(file.hierarchyLevels['1'])
      const nextHierarchyLevel = newHierarchyLevel(currentLevels)
      return {
        ...file,
        hierarchyLevels: {
          ...file.hierarchyLevels,
          1: {
            ...file.hierarchyLevels['1'],
            [level]: {
              ...nextHierarchyLevel,
              level,
            },
          },
        },
      }
    }, file)

    return {
      ...newFile,
      hierarchyLevels: {
        ...file.hierarchyLevels,
        1: resetHierarchyNames(newFile.hierarchyLevels['1']),
      },
    }
  }
}

/**
 * Extract the attributes in the characters of fileWithFixedIds and
 * transform them into the attributes per book structure.
 */
export function createCharacterAttributesPerBook(fileWithFixedIds) {
  const allCharacterCustomAttributeMetadata = uniqWith(
    fileWithFixedIds.characters.flatMap((character) => {
      return Object.entries(character.rawAttributes).map((keyValue) => {
        const [key, value] = keyValue
        return {
          key,
          type: Array.isArray(value) && typeof value !== 'string' ? 'paragraph' : 'text',
        }
      })
    }),
    (thisAttribute, thatAttribute) => {
      return thisAttribute.key === thatAttribute.key
    }
  )

  const baseCharacterAttributeMetadata = [
    {
      name: 'category',
      type: 'base-attribute',
      id: 1,
    },
    {
      name: 'shortDescription',
      type: 'base-attribute',
      id: 2,
    },
    {
      name: 'tags',
      type: 'base-attribute',
      id: 3,
    },
    {
      name: 'description',
      type: 'base-attribute',
      id: 4,
    },
  ]

  const allCharacterMetadata = baseCharacterAttributeMetadata.concat(
    allCharacterCustomAttributeMetadata.map(({ key, type }, index) => {
      return {
        name: key,
        type,
        // Assumption: there are always 4 base attributes as above
        // (note the 1-based indexing for ids)...
        id: index + 5,
      }
    })
  )

  return {
    ...fileWithFixedIds,
    characters: fileWithFixedIds.characters.map((character) => {
      return {
        ...omit(character, 'rawAttributes'),
        attributes: allCharacterMetadata
          .map(({ type, name, id }) => {
            // FIXME: constant bookIds.  Do we need to do something
            // about these?
            if (type === 'base-attribute') {
              switch (name) {
                case 'category': {
                  return {
                    bookId: 'all',
                    value: character.categoryId || null,
                    id,
                  }
                }
                case 'shortDescription': {
                  return {
                    bookId: 'all',
                    value: character.description || '',
                    id,
                  }
                }
                case 'tags': {
                  return {
                    bookId: 'all',
                    value: character.tags || [],
                    id,
                  }
                }
                case 'description': {
                  return {
                    bookId: 'all',
                    value: character.notes || '',
                    id,
                  }
                }
                default: {
                  return null
                }
              }
            } else {
              if (typeof character.rawAttributes[name] !== 'undefined') {
                return {
                  value: character.rawAttributes[name],
                  bookId: 'all',
                  id,
                }
              } else {
                return null
              }
            }
          })
          .filter(Boolean),
      }
    }),
    attributes: {
      characters: allCharacterMetadata,
    },
  }
}

/**
 * Produce an array of tag values from the given entities "rawTags"
 * field.  We store the value from the Scrivener file in "rawTags",
 * i.e. a comma-separated list of tag names.
 */
// Note, we only test this one because it's the names that change in
// theother two.
export function rawTagsFromEntity({ rawTags }) {
  return rawNamesFromString(rawTags)
}

function rawCharactersFromEntity({ rawCharacters }) {
  return rawNamesFromString(rawCharacters)
}

function rawPlacesFromEntity({ rawPlaces }) {
  return rawNamesFromString(rawPlaces)
}

function rawNamesFromString(string) {
  if (string) {
    return string.split(',').map((tagName) => {
      return tagName.trim()
    })
  } else {
    return []
  }
}

/**
 * Scan rawFile for raw links and replace them with id links.
 *
 * In cards, we might have "rawPlaces", "rawCharacters", "rawTags" &
 * "rawCategory".
 *
 * In notes, we might have "rawTags", "rawCharacters", "rawPlaces" &
 * "rawCategory".
 *
 * In characters, we might have "rawTags", "rawPlaces" &
 * "rawCategory".
 */
export function linkTagsCharactersAndPlaces(rawFile) {
  const allTagNames = uniqWith(
    rawFile.places
      .map(rawTagsFromEntity)
      .concat(rawFile.characters.map(rawTagsFromEntity))
      .concat(rawFile.notes.map(rawTagsFromEntity))
      .concat(rawFile.cards.map(rawTagsFromEntity))
      .flat(),
    isEqual
  ).filter((tag) => {
    return typeof tag === 'string' && tag !== ''
  })

  const rawFileWithTags = {
    ...rawFile,
    tags: allTagNames.map((tagName, index) => {
      return createTag(tagName, index + 1)
    }),
  }

  const cards = replaceRawCardAttributeIds(rawFileWithTags)
  const { notes, noteCategories } = replaceRawNoteAttributeIds(rawFileWithTags)
  const { characters, characterCategories } = replaceRawCharacterAttributeIds(rawFileWithTags)
  const { places, placeCategories } = replaceRawPlaceAttributeIds(rawFileWithTags)

  return {
    ...rawFileWithTags,
    cards,
    notes,
    characters,
    places,
    categories: {
      characters: characterCategories,
      places: placeCategories,
      notes: noteCategories,
      // There's no way of inferring tag categories yet.
      tags: [],
    },
  }
}

const MAXIMUM_INSERTIONS_FOR_NAME_MATCH = 5

/**
 * Find the entity of type entityType in fileWithTags whose attribute
 * named property most closely matches the given value.  If there
 * wasn't a match, produce null.  Matches are only permitted when up
 * to MAXIMUM_INSERTIONS_FOR_NAME_MATCH insertions were necessary to
 * make the values match.
 *
 * Empty attribute names are invalid.
 */
export function matchToClosestEntity(fileWithTags, entityType, property) {
  return function (value) {
    if (value === '') {
      return null
    } else {
      if (Array.isArray(fileWithTags[entityType])) {
        const closestNameMatch = fileWithTags[entityType].reduce((bestMatch, nextEntity) => {
          const entityValue = nextEntity[property]
          const nextRegexpMatchResult =
            typeof entityValue === 'string' && value.match(regexifyForFlexiSearch(entityValue))
          const nextMatch =
            Array.isArray(nextRegexpMatchResult) && nextRegexpMatchResult[0] && entityValue
          // Did we match with few enough characters difference?
          if (
            typeof nextMatch === 'string' &&
            value.length - entityValue.length <= MAXIMUM_INSERTIONS_FOR_NAME_MATCH
          ) {
            // Yes.  Was it better than the last match?
            if (bestMatch === null) {
              // There wasn't a best match
              return nextMatch
            } else {
              // Are there fewer insertions in the next match?
              if (value.length - bestMatch.length > value.length - entityValue.length) {
                // Yes.  This is a better match.
                return nextMatch
              } else {
                // No.  The previous match was closer.
                return bestMatch
              }
            }
          } else {
            // Either it didn't match or there were too many
            // insertions.
            return bestMatch
          }
        }, null)

        return (
          fileWithTags[entityType].find((entity) => {
            return entity[property] === closestNameMatch
          })?.id || null
        )
      } else {
        return null
      }
    }
  }
}

/**
 * Find the character whose name most closely matches the given
 * character name in fileWithTags.  If there wasn't a match, produce
 * null.  Matches are only permitted when up to
 * MAXIMUM_INSERTIONS_FOR_NAME_MATCH insertions were necessary to make
 * the names match.
 */
function matchToClosestCharacter(fileWithTags) {
  return matchToClosestEntity(fileWithTags, 'characters', 'name')
}

/**
 * Find the place whose name most closely matches the given place name
 * in fileWithTags.  If there wasn't a match, produce null.  Matches
 * are only permitted when up to MAXIMUM_INSERTIONS_FOR_NAME_MATCH
 * insertions were necessary to make the names match.
 */
function matchToClosestPlace(fileWithTags) {
  return matchToClosestEntity(fileWithTags, 'places', 'name')
}

/**
 * Find the tag whose title most closely matches the given tag title
 * in fileWithTags.  If there wasn't a match, produce null.  Matches
 * are only permitted when up to MAXIMUM_INSERTIONS_FOR_NAME_MATCH
 * insertions were necessary to make the names match.
 */
function matchToClosestTag(fileWithTags) {
  return matchToClosestEntity(fileWithTags, 'tags', 'title')
}

/**
 * Fixup the given cards with integer ids from fileWithTags, based on
 * the name of each entity in question.  Try to match the closest
 * thing fuzzily with at most MAXIMUM_INSERTIONS_FOR_NAME_MATCH
 * insertions.
 */
export function replaceRawCardAttributeIds(fileWithTags) {
  return fileWithTags.cards.map((card) => {
    const characters = rawCharactersFromEntity(card)
      .map(matchToClosestCharacter(fileWithTags))
      .filter(Boolean)
    const places = rawPlacesFromEntity(card).map(matchToClosestPlace(fileWithTags)).filter(Boolean)
    const tags = rawTagsFromEntity(card).map(matchToClosestTag(fileWithTags)).filter(Boolean)
    return {
      ...omit(card, 'rawCharacters', 'rawPlaces', 'rawTags'),
      characters,
      places,
      tags,
    }
  })
}

/**
 * Infer the categories that the given collection of entities could
 * belong to based on the names of categories on them.  Produce a
 * collection of valid plottr file categories.
 *
 * Each entity in entities may have a "rawCategory" bound.  We'll use
 * that field as the name of a category.
 */
export function inferCategories(entities) {
  return uniqWith(
    entities
      .map(({ rawCategory }) => {
        return rawCategory
      })
      .filter(Boolean),
    isEqual
  ).map((categoryName, index) => {
    return {
      id: index + 1,
      name: categoryName,
      position: index,
      type: 'text',
    }
  })
}

/**
 * Fixup the given notes with integer ids from fileWithTags, based on
 * the name of each entity in question.  Try to match the closest
 * thing fuzzily with at most MAXIMUM_INSERTIONS_FOR_NAME_MATCH
 * insertions.
 */
export function replaceRawNoteAttributeIds(fileWithTags) {
  const allNoteCategories = inferCategories(fileWithTags.notes)
  const fixedNotes = fileWithTags.notes.map((note) => {
    const tags = rawTagsFromEntity(note).map(matchToClosestTag(fileWithTags)).filter(Boolean)
    const characters = rawCharactersFromEntity(note)
      .map(matchToClosestCharacter(fileWithTags))
      .filter(Boolean)
    const places = rawPlacesFromEntity(note).map(matchToClosestPlace(fileWithTags)).filter(Boolean)
    const category =
      allNoteCategories.find(({ name }) => {
        return name === note.rawCategory
      })?.id || null
    return {
      ...omit(note, 'rawTags', 'rawCharacters', 'rawPlaces', 'rawCategory'),
      tags,
      characters,
      places,
      category,
    }
  })

  return {
    notes: fixedNotes,
    noteCategories: allNoteCategories,
  }
}

/**
 * Fixup the given characters with integer ids from fileWithTags,
 * based on the name of each entity in question.  Try to match the
 * closest thing fuzzily with at most
 * MAXIMUM_INSERTIONS_FOR_NAME_MATCH insertions.
 */
export function replaceRawCharacterAttributeIds(fileWithTags) {
  const allCharacterCategories = inferCategories(fileWithTags.characters)
  const fixedCharacters = fileWithTags.characters.map((character) => {
    const tags = rawTagsFromEntity(character).map(matchToClosestTag(fileWithTags)).filter(Boolean)
    const categoryId =
      allCharacterCategories.find(({ name }) => {
        return name === character.rawCategory
      })?.id || null
    return {
      ...omit(character, 'rawTags', 'rawCategory'),
      tags,
      categoryId,
    }
  })

  return {
    characters: fixedCharacters,
    characterCategories: allCharacterCategories,
  }
}

/**
 * Fixup the given places with integer ids from fileWithTags, based on
 * the name of each entity in question.  Try to match the closest
 * thing fuzzily with at most MAXIMUM_INSERTIONS_FOR_NAME_MATCH
 * insertions.
 */
export function replaceRawPlaceAttributeIds(fileWithTags) {
  const allPlaceCategories = inferCategories(fileWithTags.places)
  const fixedPlaces = fileWithTags.places.map((place) => {
    const tags = rawTagsFromEntity(place).map(matchToClosestTag(fileWithTags)).filter(Boolean)
    const categoryId =
      allPlaceCategories.find(({ name }) => {
        return name === place.rawCategory
      })?.id || null
    return {
      ...omit(place, 'rawTags', 'rawCategory'),
      tags,
      categoryId,
    }
  })

  return {
    places: fixedPlaces,
    placeCategories: allPlaceCategories,
  }
}

/**
 * Craete a tag with the given name and everything else defaulted.
 */
function createTag(tagName, id) {
  return {
    ...defaultTag,
    id,
    title: tagName,
    color: nextColor((id % 6) - 1),
  }
}

const PLOTLINE_PROPERTY_NAME = 'plotline'

const callData = ({ data }) => data()

/**
 * Scan through the cards of `scrivenerStructure` to find those that
 * reference the plotlines they belong to.  Construct plotlines with
 * integer ids.
 */
export function extractPlotlines(scrivenerStructure, bookId) {
  function accumulateLines(currentLines, next) {
    const withChildren = Array.isArray(next.children)
      ? next.children.reduce(accumulateLines, currentLines)
      : currentLines
    if (Array.isArray(next.data)) {
      return Promise.all([Promise.all(next.data.map(callData)), withChildren]).then(
        ([contents, lines]) => {
          // Content is a slate array or plain text.
          const attributes = findAndExtractAttributes(contents, CARD_BASE_ATTRIBUTES)
          const plotlineTitle = Array.isArray(attributes.plotline)
            ? slate.plain.serialize(attributes.plotline).trim()
            : typeof attributes.plotline === 'string'
            ? attributes.plotline.trim()
            : null
          if (plotlineTitle) {
            const { existed, line } = createNewLine(plotlineTitle, bookId, lines)
            if (!existed) {
              return [line, ...lines]
            } else {
              return lines
            }
          } else {
            return lines
          }
        }
      )
    } else {
      return withChildren
    }
  }

  return scrivenerStructure.cards
    .reduce(accumulateLines, Promise.resolve([]))
    .then((discoveredLines) => {
      if (discoveredLines.length === 0) {
        return [createNewLine(t('Main Plot'), bookId, []).line]
      } else {
        return discoveredLines
      }
    })
}

/**
 * Find a point in the slate content that's a line that starts with
 * non-character-text, followed by the given `propertyName`, then a
 * colon, then any amount of non-character-text, then a value until we
 * hit the end of the line.
 *
 * NOTE: The value found in this manner is trimmed.
 */
export function extractInlinePropertyFromTxtByName(propertyName, content) {
  if (propertyName === '' || propertyName.trim() === '') {
    return null
  } else {
    const regex = new RegExp(`[^\\W\\n]*${propertyName}[^\\W\\n]*:[^\\W\\n]*([^\\n]*)\\n?`, 'i')
    const hit = content.match(regex)

    if (hit && typeof hit[1] === 'string') {
      const trimmedHit = hit[1].trim()
      if (trimmedHit === '') {
        return null
      } else {
        return trimmedHit
      }
    } else {
      return null
    }
  }
}

/**
 * Create a line with the given title and bookId unless it already
 * exists in `currentLines`.  If it already exists, then produce that
 * line.
 *
 * Assume: that title is already trimmed if it needs to be.
 */
export function createNewLine(title, bookId, currentLines) {
  const existingLine = currentLines.find((existingLine) => {
    return existingLine.title === title
  })
  if (typeof existingLine !== 'undefined') {
    return { line: existingLine, existed: true }
  } else {
    const nextLineId = nextId(currentLines)
    const position = nextPositionInBook(currentLines, bookId)
    const color = nextColor(currentLines.length)
    const newLine = {
      ...cloneDeep(defaultLine),
      id: nextLineId,
      position,
      bookId,
      color,
      title,
    }
    return {
      line: newLine,
      existed: false,
    }
  }
}

const CARD_BASE_ATTRIBUTES = ['description', 'characters', 'places', 'tags', 'plotline']

/**
 * Transform the cards in `scrivenerStructure` into a Plottr card per
 * entry.  Use the plotlines we've already discovered for the plotline
 * id of each card.
 */
export function transformCards(scrivenerStructure, plotlines) {
  function iter(parentId, cards) {
    return Promise.all(
      cards.map((card) => {
        const { id, title, data, children, kind } = card
        return iter(id, children || []).then((childrenCards) => {
          if (kind === 'Folder') {
            return childrenCards
          } else if (Array.isArray(data)) {
            return Promise.all(data.map(callData)).then((contents) => {
              const attributes = findAndExtractAttributes(contents, CARD_BASE_ATTRIBUTES)
              const descriptionWithPlotline = contents.find((content) => {
                return typeof content === 'string'
              })
              const description = descriptionWithPlotline?.replace(/plotline: .*/, '') || ''
              const plotlineTitle = Array.isArray(attributes.plotline)
                ? slate.plain.serialize(attributes.plotline).trim()
                : typeof attributes.plotline === 'string'
                ? attributes.plotline.trim()
                : null
              const characters = slate.plain.serialize(attributes.characters || '').trim()
              const places = slate.plain.serialize(attributes.places || '').trim()
              const tags = slate.plain.serialize(attributes.tags || '').trim()
              const plotlineId = plotlines.find(({ title }) => {
                return title === plotlineTitle
              })?.id
              return [
                createCard(
                  id,
                  title,
                  parentId,
                  plotlineId,
                  description,
                  characters,
                  places,
                  tags,
                  omit(attributes, ...CARD_BASE_ATTRIBUTES)
                ),
                ...childrenCards,
              ]
            })
          } else {
            const description = ''
            const attributes = {}
            const characters = ''
            const places = ''
            const tags = ''
            return [
              createCard(id, title, parentId, 1, description, characters, places, tags, attributes),
              ...childrenCards,
            ]
          }
        })
      })
    ).then((xss) => {
      return xss.flatMap((x) => x)
    })
  }

  return iter(null, scrivenerStructure.cards)
}

/**
 * Given the collection of either slate or plain text contents, find
 * the attributes as either single-line attributes, or head-lined
 * attributes and produce an object whose keys are the names of the
 * attributes and whose values are the attribute values.
 */
export function findAndExtractAttributes(contents, knownBaseAttributes) {
  function accumulateSlateContent(content, initialAttributes) {
    const { attributes, currentHeading, currentContent } = content.reduce(
      ({ attributes, currentHeading, currentContent }, nextNode) => {
        const accumulateAttribute = () => {
          if (typeof currentHeading === 'string') {
            return {
              ...attributes,
              [currentHeading]: inferLists(currentContent),
            }
          } else {
            return attributes
          }
        }

        const headingFromNextNode = attributeHeading(nextNode, knownBaseAttributes)
        if (typeof headingFromNextNode === 'string') {
          return {
            attributes: accumulateAttribute(),
            currentHeading: headingFromNextNode,
            currentContent: [],
          }
        } else {
          const singleLineAttributeHit = extractSingleLineAttribute(nextNode)
          // If we find something that looks like an attribute and
          // we're parsing a paragraph, treat it as part of the paragraph.
          if (
            currentHeading === null &&
            Array.isArray(singleLineAttributeHit) &&
            singleLineAttributeHit.length === 2
          ) {
            const [key, value] = singleLineAttributeHit
            const attributeName = normaliseHeading(key, knownBaseAttributes)
            // We could have hit a single line attribute at the end of a
            // multi-line attribute.  If that's the case, we need to
            // close off the prior multi-line attribute too.
            return {
              attributes: {
                ...accumulateAttribute(),
                [attributeName]: value,
              },
              currentHeading: null,
              currentContent: [],
            }
          } else {
            return {
              attributes,
              currentHeading,
              currentContent: [...currentContent, nextNode],
            }
          }
        }
      },
      { attributes: initialAttributes, currentHeading: null, currentContent: [] }
    )

    // There was likely an attribute being extracted when we hit the
    // end of the array.  Ensure that's accumulated too.
    if (currentHeading) {
      return {
        ...attributes,
        [currentHeading]: currentContent,
      }
    } else {
      return attributes
    }
  }

  function processContent(initialAttributes, content) {
    // Only consider slate content.
    if (Array.isArray(content)) {
      return accumulateSlateContent(content, initialAttributes)
    } else {
      return initialAttributes
    }
  }

  return contents.reduce(processContent, {})
}

export function extractNonAttributePreamble(contents) {
  function accumulateSlateContent(content, initialPreamble) {
    const indexOfAttribute = content.findIndex((nextNode) => {
      return attributeHeading(nextNode, []) || extractSingleLineAttribute(nextNode)
    })
    if (indexOfAttribute === -1) {
      return initialPreamble.concat(content)
    } else {
      return initialPreamble.concat(content.slice(0, indexOfAttribute))
    }
  }

  function processContent(initialPreamble, content) {
    // Only consider slate content.
    if (Array.isArray(content)) {
      return accumulateSlateContent(content, initialPreamble)
    } else {
      return initialPreamble
    }
  }

  return contents.reduce(processContent, [])
}

const SINGLE_LINE_ATTRIBUTE_EXTRACTION_REGEX = /([\w].*)[^\w]*?:[^\w]*([\w].*)[^\w]?/

/**
 * If this node is a paragraph with a single line attribute on it,
 * produce that single line attribute as a two-element array:
 *
 * [key, value]
 *
 * If it's not, then produce null.
 *
 * A single line attribute is a line that contains text, followed by a
 * colon and then some more text.  The text following any amount of
 * whitespace after the colon is the value and the text leading to the
 * colon is the name of the attribute (its key).
 */
export function extractSingleLineAttribute(slateNode) {
  function iter(node) {
    if (typeof node.text === 'string') {
      const hit = node.text.match(SINGLE_LINE_ATTRIBUTE_EXTRACTION_REGEX)
      if (hit) {
        const [_fullMatch, key, value] = hit
        return [key.trim(), value.trim()]
      } else {
        return null
      }
    } else if (Array.isArray(node.children)) {
      for (let childNode of node.children) {
        const subHit = iter(childNode)
        if (Array.isArray(subHit) && subHit.length === 2) {
          return subHit
        }
      }
      return null
    } else {
      return null
    }
  }

  return iter(slateNode)
}

/**
 * Convert a string like "test" into a regex like ".*t.*e.*s.*t.*" so
 * that we can see whether the given letters appear in the right order
 * in a test string.
 */
export function regexifyForFlexiSearch(string) {
  if (string === '' || string.trim() === '') {
    return /$a/
  } else {
    return new RegExp('.*' + string.split('').join('.*') + '.*', 'i')
  }
}

/**
 * Up to this many characters in the user's heading can deviate from
 * the original heading and we'll still match it to a known heading.
 */
const NUMBER_OF_CHARS_ALLOWED_NOT_TO_MATCH = 2

/**
 * If heading is very close to one of the known base attributes, then
 * normalise it to that base attribute.
 */
export function normaliseHeading(heading, knownBaseAttributes) {
  const trimmedHeading = heading.trim()
  if (trimmedHeading === '') {
    return null
  } else {
    const matchedHeading = knownBaseAttributes.reduce((bestMatch, knownHeading) => {
      const nextMatch = trimmedHeading.match(regexifyForFlexiSearch(knownHeading)) && knownHeading
      // Is this a hit?
      if (nextMatch) {
        // Was there a hit?
        if (bestMatch === null) {
          // Nope; this is the best we've found.
          return knownHeading
        } else {
          // Compare hits.  Can we match with fewer insertions?
          if (trimmedHeading.length - bestMatch.length > trimmedHeading.length - nextMatch.length) {
            // The next hit has fewer insertions
            return knownHeading
          } else {
            // The best hit has fewer insertions
            return bestMatch
          }
        }
      } else {
        // The next known heading doesn't match
        return bestMatch
      }
    }, null)
    if (
      typeof matchedHeading === 'string' &&
      trimmedHeading.length - matchedHeading.length <= NUMBER_OF_CHARS_ALLOWED_NOT_TO_MATCH
    ) {
      return matchedHeading
    } else {
      return trimmedHeading
    }
  }
}

/**
 * If the supplied slateNode is an attribute heading, then produce the
 * text value of that heading, otherwise produce null.
 */
export function attributeHeading(slateNode, knownBaseAttributes) {
  function iter(node) {
    if (typeof node.text === 'string' && node.isBold) {
      return normaliseHeading(node.text, knownBaseAttributes)
    } else if (Array.isArray(node.children)) {
      for (const child of node.children) {
        const subResult = iter(child)
        if (subResult) {
          return subResult
        }
      }
      return null
    } else {
      return null
    }
  }

  return iter(slateNode)
}

/**
 * Create a card from the given title, id, description and attributes,
 * where id is a UUID to be transformed into an integer later.
 */
function createCard(
  id,
  title,
  beatId,
  lineId,
  description,
  rawCharacters,
  rawPlaces,
  rawTags,
  attributes
) {
  return {
    ...defaultCard,
    ...attributes,
    id,
    beatId,
    lineId,
    title,
    description,
    rawCharacters,
    rawPlaces,
    rawTags,
  }
}

/**
 * Creates a beat from the given bookId, id, position and title.
 */
const newBeat = (bookId, id, position, title) => ({
  autoOutlineSort: true,
  bookId,
  fromTemplateId: null,
  id,
  position,
  time: 0,
  title,
  expanded: true,
})

/**
 * Scan through the cards of `scrivenerStructure` to find all those
 * that have children.  These are the "Folders" in Scrivener and they
 * correspond to beats in Plottr.
 */
export function extractBeats(scrivenerStructure, bookId) {
  function iter(parent, cards) {
    return Promise.all(
      cards.map((card) => {
        const { id, kind, title, children } = card
        return iter(id, children || []).then((childrenBeats) => {
          if (kind === FOLDER_TYPE) {
            return [
              {
                id,
                title,
                parent,
              },
              ...childrenBeats,
            ]
          } else {
            return childrenBeats
          }
        })
      })
    ).then((xss) => {
      return xss.flatMap((x) => x)
    })
  }

  return iter(null, scrivenerStructure.cards).then((beats) => {
    const beatTree = beats.reduce((acc, next, index) => {
      return tree.addNode('id')(
        acc,
        next.parent || null,
        newBeat(bookId, next.id, index, next.title)
      )
    }, tree.newTree('id'))
    return {
      [bookId]: positionReset(beatTree),
      series: tree.newTree('id'),
    }
  })
}

const NOTE_BASE_ATTRIBUTES = ['content', 'title', 'tags', 'characters', 'places', 'category']

/**
 * For debugging and updating tests.
 */
function _dumpScrivenerStructure(scrivenerStructure) {
  return Promise.all(
    scrivenerStructure.characters.map((character) => {
      return Promise.all(
        character.data.map(({ data, fullPath }) => {
          return data().then((data) => {
            return {
              data: `() => Promise.resolve(${
                typeof data !== 'string' ? JSON.stringify(data, null, 2) : data
              })`,
              fullPath,
            }
          })
        })
      ).then((data) => {
        return {
          ...character,
          data,
        }
      })
    })
  )
    .then((characters) => {
      return Promise.all(
        scrivenerStructure.places.map((place) => {
          return Promise.all(
            place.data.map(({ data, fullPath }) => {
              return data().then((data) => {
                return {
                  data: `() => Promise.resolve(${
                    typeof data !== 'string' ? JSON.stringify(data, null, 2) : data
                  })`,
                  fullPath,
                }
              })
            })
          ).then((data) => {
            return {
              ...place,
              data,
            }
          })
        })
      ).then((places) => {
        return Promise.all(
          scrivenerStructure.notes.map((note) => {
            return Promise.all(
              note.data.map(({ data, fullPath }) => {
                return data().then((data) => {
                  return {
                    data: `() => Promise.resolve(${
                      typeof data !== 'string' ? JSON.stringify(data, null, 2) : data
                    })`,
                    fullPath,
                  }
                })
              })
            ).then((data) => {
              return {
                ...note,
                data,
              }
            })
          })
        ).then((notes) => {
          return Promise.all(
            scrivenerStructure.cards.map((card) => {
              function dumpCard(card) {
                return Promise.all(
                  (card.data || []).map(({ data, fullPath }) => {
                    return data().then((data) => {
                      return {
                        data: `() => Promise.resolve(${
                          typeof data !== 'string' ? JSON.stringify(data, null, 2) : data
                        })`,
                        fullPath,
                      }
                    })
                  })
                ).then((data) => {
                  if (Array.isArray(card.children)) {
                    return Promise.all(card.children.map(dumpCard)).then((dumpedChildren) => {
                      return {
                        ...card,
                        children: dumpedChildren,
                        data,
                      }
                    })
                  } else {
                    return {
                      ...card,
                      data,
                    }
                  }
                })
              }
              return dumpCard(card)
            })
          ).then((cards) => {
            return {
              cards,
              characters,
              places,
              notes,
            }
          })
        })
      })
    })
    .then((dumpableStructure) => {
      console.log(
        'Scrivener structure (please remove the literal strings around the individual data thunks.)',
        JSON.stringify(dumpableStructure, null, 2)
      )
    })
}

/**
 * Transform the notes in `scrivenerStructure` into a Plottr note per
 * entry.
 */
export function transformNotes(scrivenerStructure) {
  return Promise.all(
    scrivenerStructure.notes.map((note) => {
      const { id, title, data } = note
      if (Array.isArray(data)) {
        return Promise.all(data.map(callData)).then((contents) => {
          const attributes = findAndExtractAttributes(contents, NOTE_BASE_ATTRIBUTES)
          const content = attributes.content || extractNonAttributePreamble(contents) || []
          const tags = slate.plain.serialize(attributes.tags || '').trim()
          const characters = slate.plain.serialize(attributes.characters || '').trim()
          const places = slate.plain.serialize(attributes.places || '').trim()
          const category =
            (attributes.category && slate.plain.serialize(attributes.category).trim()) || null
          return createNote(
            id,
            title,
            content,
            tags,
            characters,
            places,
            category,
            omit(attributes, ...NOTE_BASE_ATTRIBUTES)
          )
        })
      } else {
        const content = []
        const attributes = {}
        const tags = ''
        const characters = ''
        const places = ''
        const category = null
        return createNote(id, title, content, tags, characters, places, category, attributes)
      }
    })
  )
}

function createNote(
  id,
  title,
  content,
  rawTags,
  rawCharacters,
  rawPlaces,
  rawCategory,
  attributes
) {
  return {
    ...defaultNote,
    ...attributes,
    id,
    title,
    content,
    // "Raw" versions refer to the entity by its name rather than its
    // id.
    rawTags,
    rawCharacters,
    rawPlaces,
    rawCategory,
  }
}

const CHARACTER_BASE_ATTRIBUTES = ['name', 'description', 'notes', 'tags', 'category']

/**
 * Transform the characters in `scrivenerStructure` into a Plottr
 * character per entry.
 */
export function transformCharacters(scrivenerStructure) {
  return Promise.all(
    scrivenerStructure.characters.map((character) => {
      const { id, title, data } = character
      if (Array.isArray(data)) {
        return Promise.all(data.map(callData)).then((contents) => {
          const attributes = findAndExtractAttributes(contents, CHARACTER_BASE_ATTRIBUTES)
          const notes = attributes.notes
          const tags = slate.plain.serialize(attributes.tags || '').trim()
          const category =
            (attributes.category && slate.plain.serialize(attributes.category).trim()) || null
          const description =
            (attributes.description && slate.plain.serialize(attributes.description)) || ''
          return createCharacter(
            id,
            title,
            description,
            notes,
            tags,
            category,
            omit(attributes, ...CHARACTER_BASE_ATTRIBUTES)
          )
        })
      } else {
        const notes = ''
        const description = ''
        const tags = ''
        const category = null
        const attributes = {}
        return createCharacter(id, title, description, notes, tags, category, attributes)
      }
    })
  )
}

/**
 * Create a character from the given id, name, description, notes and
 * attributes.
 */
function createCharacter(id, name, description, notes, rawTags, rawCategory, rawAttributes) {
  return {
    ...defaultCharacter,
    id,
    name,
    description,
    ...(Array.isArray(notes) || typeof notes === 'string' ? { notes } : { notes: '' }),
    rawTags,
    rawCategory,
    rawAttributes,
  }
}

const PLACE_BASE_ATTRIBUTES = ['description', 'notes', 'name', 'tags', 'category']

/**
 * Transform the places in `scrivenerStructure` into a Plottr place
 * per entry.
 */
export function transformPlaces(scrivenerStructure) {
  return Promise.all(
    scrivenerStructure.places.map((place) => {
      const { id, title, data } = place
      if (Array.isArray(data)) {
        return Promise.all(data.map(callData)).then((contents) => {
          const attributes = findAndExtractAttributes(contents, PLACE_BASE_ATTRIBUTES)
          const description = (
            (attributes.description && slate.plain.serialize(attributes.description)) ||
            ''
          ).trim()
          const notes = attributes.notes || ''
          const tags = slate.plain.serialize(attributes.tags || '').trim()
          const category = slate.plain.serialize(attributes.category || '').trim() || null
          return createPlace(
            id,
            title,
            description,
            notes,
            tags,
            category,
            omit(attributes, ...PLACE_BASE_ATTRIBUTES)
          )
        })
      } else {
        const description = ''
        const notes = ''
        const tags = ''
        const category = null
        const attributes = {}
        return createPlace(id, title, description, notes, tags, category, attributes)
      }
    })
  )
}

function createPlace(id, name, description, notes, rawTags, rawCategory, attributes) {
  return {
    ...defaultPlace,
    ...attributes,
    id,
    name,
    description,
    notes,
    rawTags,
    rawCategory,
  }
}

function readXML(contents) {
  return JSON.parse(xml.xml2json(contents, { compact: true }))
}

export const EMPTY_SCRIVENER_STRUCTURE = {
  cards: [],
  characters: [],
  notes: [],
  places: [],
}

/**
 * Traverse the scrivenerStructure, processing each entry type as we
 * go.  On the top level, we're looking for the:
 *  - folder named "Manuscript", and
 *  - research folder named "Notes".
 *
 * The manuscript contains the plotlines/timeline data, and the
 * notes folder contains the children:
 *  - characters,
 *  - places, and
 *  - notes.
 *
 * Process each of these four folders extracting a list of titles and
 * the UUIDs of the data folder for each entity (in the `id` field).
 *
 * Result represented as follows:
 *
 * Card {
 *   id, title, data, kind: FOLDER_TYPE | TEXT_TYPE, children: [Card],
 * } | {
 *   id, data, kind: FOLDER_TYPE | TEXT_TYPE
 * }
 *
 * {
 *   cards: [Card],
 *   characters: [{ id, title, data }],
 *   notes: [{ id, title, data }],
 *   places: [{ id, title, data }],
 * }
 *
 * The information needed to construct plotlines is stored in a
 * key-value pair in each card.
 */
export function interpretScrivenerStructure(scrivenerStructure, fileIndex) {
  function iter(acc, node) {
    // NOTE: The casing of "Type" is important!
    switch (node._attributes.Type) {
      case DRAFT_FOLDER_TYPE: {
        // NOTE: The casing of "Title" is important!
        if (node.Title?._text === MANUSCRIPT_BINDER_ITEM_TITLE) {
          // NOTE: the casing of "Children" & "BinderItem" are important!
          return processManuscript(node.Children?.BinderItem, fileIndex, acc)
        } else {
          return acc
        }
      }
      case RESEARCH_FOLDER_TYPE: {
        // NOTE: the casing of "Children" & "BinderItem" are important!
        return processNotesFolder(node.Children?.BinderItem, fileIndex, acc)
      }
      default: {
        return acc
      }
    }
  }
  const rootBinderCollection = scrivenerStructure?.ScrivenerProject?.Binder?.BinderItem
  if (!isObject(rootBinderCollection)) {
    return Promise.reject(new Error(NOT_SCRIVENER_PROJECT_ERROR_MESSAGE))
  } else {
    // @ts-ignore
    return rootBinderCollection.reduce(iter, EMPTY_SCRIVENER_STRUCTURE)
  }
}

/**
 * Extract card titles, ids and associated file data thunks from the
 * given manuscript.
 */
export function processManuscript(cardNodes, fileIndex, acc) {
  function processManuscriptNode(node) {
    const id = node._attributes.UUID || node._attributes.ID
    // NOTE: The case of Type is important!
    const nodeType = node._attributes.Type
    switch (nodeType) {
      case FOLDER_TYPE: {
        return {
          id,
          title: node.Title?._text ?? NO_TITLE,
          data: fileIndex[id],
          kind: FOLDER_TYPE,
          children: iter(node.Children?.BinderItem),
        }
      }
      case TEXT_TYPE: {
        return {
          id,
          kind: TEXT_TYPE,
          data: fileIndex[id],
          ...(node.Title?._text ? { title: node.Title?._text } : {}),
        }
      }
      default: {
        return null
      }
    }
  }
  function iter(nodes) {
    if (Array.isArray(nodes)) {
      return nodes.map(processManuscriptNode).filter(Boolean)
    } else if (isObject(nodes)) {
      const cardNode = nodes
      return [processManuscriptNode(cardNode)].filter(Boolean)
    } else {
      return []
    }
  }

  return {
    ...acc,
    cards: [...acc.cards, ...iter(cardNodes)],
  }
}

const EMPTY_NOTES_HIT = {
  characters: [],
  notes: [],
  places: [],
}
const NOTES_FOLDER_TITLE = 'Notes'
const PLACES_FOLDER_TITLE = 'Places'
const CHARACTERS_FOLDER_TITLE = 'Characters'

/**
 * Extract characters, places and notes from the given notes folder.
 */
export function processNotesFolder(noteNodes, fileIndex, acc) {
  function iter(nodes) {
    if (!Array.isArray(noteNodes)) {
      return EMPTY_NOTES_HIT
    } else {
      return nodes.reduce((acc, next) => {
        // NOTE: the casing of "Type" is important!
        if (next._attributes.Type === FOLDER_TYPE) {
          // NOTE: the casing of "Title" is important!
          switch (next.Title._text) {
            case NOTES_FOLDER_TITLE: {
              return {
                ...acc,
                // NOTE: the casing of "Children" & "BinderItem" are important!
                notes: [
                  ...acc.notes,
                  ...processResearchNotesItems(next.Children?.BinderItem, fileIndex),
                ],
              }
            }
            case PLACES_FOLDER_TITLE: {
              return {
                ...acc,
                // NOTE: the casing of "Children" & "BinderItem" are important!
                places: [
                  ...acc.places,
                  ...processResearchNotesItems(next.Children?.BinderItem, fileIndex),
                ],
              }
            }
            case CHARACTERS_FOLDER_TITLE: {
              return {
                ...acc,
                // NOTE: the casing of "Children" & "BinderItem" are important!
                characters: [
                  ...acc.characters,
                  ...processResearchNotesItems(next.Children?.BinderItem, fileIndex),
                ],
              }
            }
            default: {
              return acc
            }
          }
        } else {
          return acc
        }
      }, EMPTY_NOTES_HIT)
    }
  }
  const result = iter(noteNodes)

  return {
    ...acc,
    characters: [...acc.characters, ...result.characters],
    notes: [...acc.notes, ...result.notes],
    places: [...acc.places, ...result.places],
  }
}

const NO_TITLE = 'No Title'

/**
 * Process all entries the given collection of BinderItems into a
 * uniform structure.
 *
 * Result is [{ id, title, data }]
 */
export function processResearchNotesItems(notesNodes, fileIndex) {
  if (Array.isArray(notesNodes)) {
    return notesNodes.map((node) => {
      const id = node._attributes.UUID || node._attributes.ID
      return {
        id,
        // NOTE: The casing of "Title" is important!
        title: node.Title?._text ?? NO_TITLE,
        data: fileIndex[id],
      }
    })
  } else if (isObject(notesNodes)) {
    const node = notesNodes
    // @ts-ignore
    const id = node._attributes.UUID || node._attributes.ID
    return [
      {
        id,
        // NOTE: The casing of "Title" is important!
        // @ts-ignore
        title: node.Title?._text ?? NO_TITLE,
        data: fileIndex[id],
      },
    ]
  } else {
    return []
  }
}

const OLD_SCRIVENER_CONTAINING_FOLDER_NAME = 'Docs'

/**
 * A file's entity id in older versions of scrivener is the part that
 * comes before "_notes.rtf", "_synopsis.txt", ".rtf" or ".txt".
 */
export function filesEntityId(fileName) {
  return fileName
    .replace(/_synopsis\.txt$/, '')
    .replace(/_notes\.rtf$/, '')
    .replace(/\.txt$/, '')
    .replace(/\.rtf$/, '')
}

/**
 * Traverse all folders in the project, looking for RTF and TXT files.
 * Create an index of all the containing folder names pointing to
 * file's absolute path and a thunk that produces a promise containing
 * the file's contents.
 *
 * In an older version of Scrivener, the files are stored in the same
 * directory in a folder called "Docs".  If we run into a case where
 * we have the parent folder "Docs", we need to treat the start of the
 * file name up to "_synopsis.txt", "_notes.rtf", ".rtf" or ".txt" as
 * the id because it is the parent folder in newer versions.  i.e. in
 * the newer version, the files are in a folder with the id of the
 * entity to which they relate.
 *
 * NOTE: This is the primary side-effecting function.  All side
 * effects are hidden after extracting the manuscript and building an
 * index of all the data files in the project.  This function builds
 * the file index and obscures from the user of the index, whether
 * files are read from disk, network, memory etc.
 */
function allTxtAndRTFFiles(rootPath, readdir, stat, extname, join, thunkFile) {
  function iter(currentPath, containingFolder) {
    return readdir(currentPath).then((entries) => {
      return Promise.all(
        entries.map((entry) => {
          return join(currentPath, entry).then((fullPath) => {
            return Promise.all([stat(fullPath), extname(fullPath)]).then(([stats, extension]) => {
              if (stats.isDirectory) {
                return iter(fullPath, entry)
              } else if (extension === '.rtf' || extension === '.txt') {
                if (containingFolder === OLD_SCRIVENER_CONTAINING_FOLDER_NAME) {
                  const id = filesEntityId(entry)
                  return [
                    [
                      id,
                      {
                        fullPath,
                        data: thunkFile(fullPath),
                      },
                    ],
                  ]
                } else {
                  return [
                    [
                      containingFolder,
                      {
                        fullPath,
                        data: thunkFile(fullPath),
                      },
                    ],
                  ]
                }
              } else {
                return []
              }
            })
          })
        })
      ).then((hits) => {
        return hits.flatMap((x) => x)
      })
    })
  }

  return iter(rootPath, '').then((hits) => {
    return hits.reduce((acc, next) => {
      const [key, value] = next
      return {
        ...acc,
        [key]: [...(acc[key] || []), value],
      }
    }, {})
  })
}

/**
 * Read the files in `filePath`.  If one is a `.scrivx` *file*, then
 * return the directory it was in and the path to the file itself,
 * (calling it the "scrivenerStructure") in the form:
 *
 * {
 *   rootPath: <folder-path>,
 *   scrivenerStructurePath: <file-path>,
 * }
 *
 * The `scrivenerStructure` file contains a tree of BinderItems with
 * optional Children.  The titles of the BinderItems or their types
 * decide how they're processed.
 */
function rootDirectory(filePath, readdir, join, stat, extname) {
  return readdir(filePath).then((files) => {
    return Promise.all(
      files.map((file) => {
        return join(filePath, file)
          .then((absolutePath) => {
            return Promise.all([
              extname(absolutePath),
              stat(absolutePath),
              Promise.resolve(absolutePath),
            ])
          })
          .then(([ext, stats, absolutePath]) => {
            return {
              ext,
              stats,
              absolutePath,
            }
          })
      })
    ).then((files) => {
      const hit = files.find(({ ext, stats }) => {
        return ext === '.scrivx' && !stats.isDirectory
      })
      if (hit) {
        return {
          rootPath: filePath,
          scrivenerStructurePath: hit.absolutePath,
        }
      } else {
        const subDirectoryResults = files
          .map((entry) => {
            const { stats, absolutePath } = entry
            if (stats.isDirectory) {
              return rootDirectory(absolutePath, readdir, join, stat, extname)
            } else {
              return null
            }
          })
          .filter(Boolean)
        if (subDirectoryResults.length > 0) {
          return Promise.all(subDirectoryResults).then((subHits) => {
            return subHits.filter(Boolean)[0] || null
          })
        } else {
          return null
        }
      }
    })
  })
}

export default importScrivenerFile
