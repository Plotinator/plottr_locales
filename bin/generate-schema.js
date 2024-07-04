import fs from 'fs'
import { uniqWith, identity, uniq, isObject, isEqual, isNull, repeat, pick, isEmpty } from 'lodash'
import { compose, lensPath, lensProp, over } from 'ramda'

import exampleFile from '../v2/store/exampleFile.json'
import exampleProFile from '../v2/store/exampleProFile.json'

const always =
  (x) =>
  (..._args) =>
    x

const { writeFile } = fs.promises

const KNOWN_SLATE_PATHS = [
  ['cards', 'description'],
  ['characters', 'notes'],
  ['characters', 'attributes', 'value'],
  ['notes', 'content'],
  ['places', 'notes'],
  ['characters', 'templates', 'values', 'value'],
]

function isSlatePath(path) {
  return (
    typeof KNOWN_SLATE_PATHS.find((knownPath) => {
      return isEqual(knownPath, path)
    }) !== 'undefined'
  )
}

// Schema is one of:
// {
//   $type: 'string|number|boolean|null|any',
// } |
// {
//   $type: 'function',
//   schema: String,
// } |
// {
//   $type: 'array',
//   $schema: Schema,
// } |
// {
//   $type: 'object',
//   $schema: {
//     ...([attribute]: Schema)*
//   }
// } |
// {
//   $type: 'slate'
// } |
// {
//   $type: 'one-of',
//   $schema: [Schema]
// }

function rootSchema(document) {
  return {
    $type: 'object',
    schema: walk(document),
  }
}

function walk(documentNode, path = []) {
  function schemaFor(value, path) {
    if (isSlatePath(path)) {
      return {
        $type: 'slate',
      }
    } else if (typeof value === 'string') {
      return {
        $type: 'string',
      }
    } else if (typeof value === 'number') {
      return {
        $type: 'number',
      }
    } else if (typeof value === 'boolean') {
      return {
        $type: 'boolean',
      }
    } else if (Array.isArray(value)) {
      const schemas = uniqWith(
        value.map((x) => schemaFor(x, path)),
        isEqual
      )
      return {
        $type: 'array',
        schema: schemas.length === 0 ? { $type: 'any' } : schemas.reduce(mergeSchemas),
      }
    } else if (isObject(value)) {
      return {
        $type: 'object',
        schema: walk(value, path),
      }
    } else if (isNull(value)) {
      return {
        $type: 'null',
      }
    } else {
      return { $type: 'any' }
    }
  }

  return Object.keys(documentNode).reduce((schema, nextKey) => {
    return {
      ...schema,
      [nextKey]: schemaFor(documentNode[nextKey], [...path, nextKey]),
    }
  }, {})
}

function mergeSchemas(schemaOne, schemaTwo) {
  function mergeSchemaTwoWithSimpleSchema() {
    switch (schemaTwo.$type) {
      case 'unbound':
      case 'number':
      case 'boolean':
      case 'null':
      case 'any':
      case 'string': {
        if (schemaOne.$type === schemaTwo.$type) {
          return schemaOne
        } else {
          return {
            $type: 'one-of',
            schema: uniqWith([schemaOne, schemaTwo], isEqual),
          }
        }
      }
      case 'one-of': {
        return {
          $type: 'one-of',
          schema: uniqWith([schemaOne, ...schemaTwo.schema], isEqual),
        }
      }
      default: {
        return {
          $type: 'one-of',
          schema: uniqWith([schemaOne, schemaTwo], isEqual),
        }
      }
    }
  }
  function mergeSchemaTwoWithFunction() {
    switch (schemaTwo.$type) {
      case 'function': {
        if (schemaOne.schema !== schemaTwo.schema) {
          throw new Error(`Cannot merge different functions:
  ${schemaOne.schema}
    !==
  ${schemaTwo.schema}`)
        } else {
          return schemaOne
        }
      }
      case 'one-of': {
        return {
          $type: 'one-of',
          schema: uniqWith([schemaOne, ...schemaTwo.schema], isEqual),
        }
      }
      default: {
        return {
          $type: 'one-of',
          schema: uniqWith([schemaOne, schemaTwo.schema], isEqual),
        }
      }
    }
  }
  function mergeSchemaTwoWithArray() {
    switch (schemaTwo.$type) {
      case 'array': {
        return {
          $type: 'array',
          schema: mergeSchemas(schemaOne.schema, schemaTwo.schema),
        }
      }
      case 'one-of': {
        return {
          $type: 'one-of',
          schema: uniqWith([schemaOne, ...schemaTwo.schema], isEqual),
        }
      }
      default: {
        return {
          $type: 'one-of',
          schema: uniqWith([schemaOne, schemaTwo], isEqual),
        }
      }
    }
  }
  function mergeSchemaTwoWithObject() {
    switch (schemaTwo.$type) {
      case 'object': {
        return {
          $type: 'object',
          schema: uniq([...Object.keys(schemaOne.schema), ...Object.keys(schemaTwo.schema)]).reduce(
            (acc, next) => {
              const subSchemaOne = schemaOne.schema[next]
              const subSchemaTwo = schemaTwo.schema[next]
              return {
                ...acc,
                [next]:
                  subSchemaOne && subSchemaTwo
                    ? mergeSchemas(subSchemaOne, subSchemaTwo)
                    : mergeSchemas(subSchemaOne || subSchemaTwo, { $type: 'unbound' }),
              }
            },
            {}
          ),
        }
      }
      case 'one-of': {
        return {
          $type: 'one-of',
          schema: uniqWith([schemaOne, ...schemaTwo.schema], isEqual),
        }
      }
      default: {
        return {
          $type: 'one-of',
          schema: uniqWith([schemaOne, schemaTwo], isEqual),
        }
      }
    }
  }
  function mergeSchemaTwoWithSlate() {
    switch (schemaTwo.$type) {
      case 'slate': {
        return schemaOne
      }
      case 'one-of': {
        return {
          $type: 'one-of',
          schema: uniqWith([schemaOne, ...schemaTwo.schema], isEqual),
        }
      }
      default: {
        return {
          $type: 'one-of',
          schema: uniqWith([schemaOne, schemaTwo], isEqual),
        }
      }
    }
  }
  function mergeSchemaTwoWithOneOf() {
    switch (schemaTwo.$type) {
      case 'one-of': {
        return {
          $type: 'one-of',
          schema: uniqWith([...schemaOne.schema, ...schemaTwo.schema], isEqual),
        }
      }
      default: {
        return {
          $type: 'one-of',
          schema: uniqWith([...schemaOne.schema, schemaTwo], isEqual),
        }
      }
    }
  }
  switch (schemaOne.$type) {
    case 'unbound':
    case 'number':
    case 'boolean':
    case 'null':
    case 'any':
    case 'string': {
      return mergeSchemaTwoWithSimpleSchema()
    }
    case 'function': {
      return mergeSchemaTwoWithFunction()
    }
    case 'array': {
      return mergeSchemaTwoWithArray()
    }
    case 'object': {
      return mergeSchemaTwoWithObject()
    }
    case 'one-of': {
      return mergeSchemaTwoWithOneOf()
    }
    case 'slate': {
      return mergeSchemaTwoWithSlate()
    }
    default: {
      throw new Error(`Unrecognised schema type: ${schemaOne.$type}`)
    }
  }
}

function indent(multiLineString, depth) {
  return multiLineString.split('\n').join('\n' + repeat(' ', depth))
}

function generateValidatorIter(schemaNode) {
  switch (schemaNode.$type) {
    case 'unbound': {
      return 'isUnbound'
    }
    case 'string': {
      return 'isString'
    }
    case 'number': {
      return 'isNumber'
    }
    case 'boolean': {
      return 'isBoolean'
    }
    case 'null': {
      return 'isNull'
    }
    case 'any': {
      return 'isAny'
    }
    case 'object': {
      if (isEmpty(schemaNode.schema)) {
        return `isObject`
      } else {
        return `hasSameShapeAs(${generateValidator(schemaNode.schema)})`
      }
    }
    case 'array': {
      if (isEmpty(schemaNode.schema)) {
        return `isArrayOf(isObject)`
      } else {
        return `isArrayOf(${generateValidatorIter(schemaNode.schema)})`
      }
    }
    case 'one-of': {
      return `oneOf([${schemaNode.schema.map(generateValidatorIter)}])`
    }
    case 'slate': {
      return 'validateSlate'
    }
    case 'function': {
      return schemaNode.schema
    }
    default: {
      return ''
    }
  }
}

function generateValidator(schemaNode) {
  return (
    '{' +
    indent(
      Object.keys(schemaNode).reduce((acc, key) => {
        return `${acc}\n"${key}": ${generateValidatorIter(schemaNode[key])},`
      }, ''),
      2
    ) +
    '\n}'
  )
}

const uiCharacterFilterLens = lensPath(['schema', 'characterFilter', 'schema'])
const fullUICharacterFilterLens = lensPath(['schema', 'characterFilter'])
const NON_CUSTOM_UI_CHARACTER_FILTER_TYPES = ['tag', 'book', 'category', 'color']
const removeCustomUICharacterFilterTypes = (x) => pick(x, NON_CUSTOM_UI_CHARACTER_FILTER_TYPES)
const setKnownCharacterFilterTypesToObject = (x) =>
  NON_CUSTOM_UI_CHARACTER_FILTER_TYPES.reduce((acc, next) => {
    return {
      ...acc,
      [next]: {
        $type: 'array',
        schema: { $type: 'number' },
      },
    }
  }, x)
const schemaOrNull = (schema) => {
  return {
    $type: 'one-of',
    schema: [
      schema,
      {
        $type: 'null',
      },
    ],
  }
}
const fixUICharacterFilter = compose(
  over(fullUICharacterFilterLens, schemaOrNull),
  over(uiCharacterFilterLens, removeCustomUICharacterFilterTypes),
  over(uiCharacterFilterLens, setKnownCharacterFilterTypesToObject)
)

const uiPlaceFilterLens = lensPath(['schema', 'placeFilter', 'schema'])
const fullUIPlaceFilterLens = lensPath(['schema', 'placeFilter'])
const NON_CUSTOM_UI_PLACE_FILTER_TYPES = ['tag', 'book', 'category', 'color']
const removeCustomUIPlaceFilterTypes = (x) => pick(x, NON_CUSTOM_UI_PLACE_FILTER_TYPES)
const setKnownPlaceFilterTypesToObject = (x) =>
  NON_CUSTOM_UI_PLACE_FILTER_TYPES.reduce((acc, next) => {
    return {
      ...acc,
      [next]: {
        $type: 'array',
        schema: { $type: 'number' },
      },
    }
  }, x)
const fixUIPlaceFilter = compose(
  over(fullUIPlaceFilterLens, schemaOrNull),
  over(uiPlaceFilterLens, setKnownPlaceFilterTypesToObject),
  over(uiPlaceFilterLens, removeCustomUIPlaceFilterTypes)
)

const uiNoteFilterLens = lensPath(['schema', 'noteFilter', 'schema'])
const fullUINoteFilterLens = lensPath(['schema', 'noteFilter'])
const NON_CUSTOM_UI_NOTE_FILTER_TYPES = ['tag', 'book', 'category', 'color', 'place', 'character']
const removeCustomUINoteFilterTypes = (x) => pick(x, NON_CUSTOM_UI_NOTE_FILTER_TYPES)
const setKnownNoteFilterTypesToObject = (x) =>
  NON_CUSTOM_UI_NOTE_FILTER_TYPES.reduce((acc, next) => {
    return {
      ...acc,
      [next]: {
        $type: 'array',
        schema: { $type: 'number' },
      },
    }
  }, x)
const fixUINoteFilter = compose(
  over(fullUINoteFilterLens, schemaOrNull),
  over(uiNoteFilterLens, removeCustomUINoteFilterTypes),
  over(uiNoteFilterLens, setKnownNoteFilterTypesToObject)
)

const uiTimelineFilterLens = lensPath(['schema', 'timelineFilter', 'schema'])
const fullUITimelineFilterLens = lensPath(['schema', 'timelineFilter'])
const NON_CUSTOM_UI_TIMELINE_FILTER_TYPES = ['tag', 'character', 'place']
const removeCustomUITimelineFilterTypes = (x) => pick(x, NON_CUSTOM_UI_TIMELINE_FILTER_TYPES)
const setKnownTimelineFilterTypesToObject = (x) =>
  NON_CUSTOM_UI_TIMELINE_FILTER_TYPES.reduce((acc, next) => {
    return {
      ...acc,
      [next]: {
        $type: 'array',
        schema: { $type: 'number' },
      },
    }
  }, x)
const fixUITimelineFilter = compose(
  over(fullUITimelineFilterLens, schemaOrNull),
  over(uiTimelineFilterLens, removeCustomUITimelineFilterTypes),
  over(uiTimelineFilterLens, setKnownTimelineFilterTypesToObject)
)

const uiOutlineFilterSchemaLens = lensPath(['schema', 'outlineFilter', 'schema'])
const fullUIOutlineFilterSchemaLens = lensPath(['schema', 'outlineFilter'])
const setOutlineFilterSchemaToEmptyObject = always({})
const uiOutlineFilterTypeLens = lensPath(['schema', 'outlineFilter', '$type'])
const setOutlineFilterTypeToObject = always('object')
const fixUIOutlineFilter = compose(
  over(fullUIOutlineFilterSchemaLens, schemaOrNull),
  over(uiOutlineFilterSchemaLens, setOutlineFilterSchemaToEmptyObject),
  over(uiOutlineFilterTypeLens, setOutlineFilterTypeToObject)
)

const uiLens = lensPath(['schema', 'ui'])
const fixUISchema = compose(
  fixUITimelineFilter,
  fixUINoteFilter,
  fixUIPlaceFilter,
  fixUICharacterFilter,
  fixUIOutlineFilter
)
const fixUI = over(uiLens, fixUISchema)

const fileAppliedMigrationsLens = lensPath(['schema', 'appliedMigrations', 'schema'])
const validateAppliedMigrations = (_x) => `function (migrations) {
  migrations.forEach((migration, index) => {
    if (!migration.match(/^\\*?m[0-9]{4}_[0-9][0-9]?_[0-9][0-9]?/)) {
      pushPath(index)
      pushError('Invalid migration', migration)
      popPath()
    }
  })
}`
const fixFileAppliedMigrationsSchema = over(fileAppliedMigrationsLens, validateAppliedMigrations)
const fileAppliedMigrationsTypeLens = lensPath(['schema', 'appliedMigrations', '$type'])
const setToFunction = always('function')
const fixFileAppliedMigrationsType = over(fileAppliedMigrationsTypeLens, setToFunction)
const fixFileAppliedMigrations = compose(
  fixFileAppliedMigrationsSchema,
  fixFileAppliedMigrationsType
)

const fixFileSchema = fixFileAppliedMigrations

const fileLens = lensPath(['schema', 'file'])
const fixFile = over(fileLens, fixFileSchema)

const booksTypeLens = lensProp('$type')
const fixBooksType = over(booksTypeLens, always('function'))
const booksSchemaLens = lensProp('schema')
const validateBooksFunction = (books) => {
  const bookKeys = Object.keys(books).filter((key) => {
    return key !== 'allIds'
  })
  const bookSchema = bookKeys
    .map((key) => {
      return books[key]
    })
    .reduce(mergeSchemas)
  return (
    `function(books) {
  const bookKeys = Object.keys(books).filter((key) => {
    return key !== 'allIds'
  })
  bookKeys.every((key) => {
    try {
      if (` +
    '`${parseInt(key)}`' +
    ` !== key) {
        pushPath(key)
        pushError('number', key)
        popPath()
      }
    } catch (error) {
      pushPath(key)
      pushError('number', key)
      popPath()
    }
  })
  const isValidBook = (book) => {
    hasSameShapeAs(${generateValidator(bookSchema.schema)})(book)
  }
  bookKeys.forEach((next) => {
    pushPath(next)
    isValidBook(books[next])
    popPath()
  })
  if (!Array.isArray(books.allIds) || !books.allIds.every((id) => {
    return typeof id === 'number'
  })) {
    pushPath('allIds')
    pushError('array of numbers', books.allIds)
    popPath()
  }
}`
  )
}
const fixBooksSchema = over(booksSchemaLens, validateBooksFunction)

const fixBooksNode = compose(fixBooksType, fixBooksSchema)

const bookLens = lensPath(['schema', 'books'])
const fixBooks = over(bookLens, fixBooksNode)

const beatsTypeLens = lensProp('$type')
const fixBeatsType = over(beatsTypeLens, always('function'))
const beatsSchemaLens = lensProp('schema')
const fixBeatsSchema = (schema) => {
  const allBeatSchemas = Object.values(schema).flatMap(
    ({
      schema: {
        index: { schema },
      },
    }) => Object.values(schema)
  )
  const aBeatSchema = allBeatSchemas.reduce(mergeSchemas)
  return (
    `function (beats) {
      if (typeof beats.series === 'undefined') {
        pushError('object', beats.series)
      }
    const nonSeriesKeys = Object.keys(beats).filter((key) => {
      return key !== 'series'
    })
    nonSeriesKeys.forEach((key) => {
    try {
      if (` +
    '`${parseInt(key)}`' +
    ` !== key) {
        pushPath(key)
        pushError('number', key)
        popPath()
      }
    } catch (error) {
      pushPath(key)
      pushError('number', key)
      popPath()
    }
  })
    // We could also consider verifying the relationships between
    // beats, but this is good enough for now.
    const validateTree = (tree) => {
      pushPath('index')
      Object.values(tree.index).forEach((beat) => {
        pushPath(beat.id)
        hasSameShapeAs(${generateValidator(aBeatSchema.schema)})(beat)
        popPath()
      })
      popPath()
      pushPath('children')
      Object.keys(tree.children).forEach((id) => {
        if (id !== 'null' && typeof tree.index[id] === 'undefined') {
          pushPath(id)
          pushError('Missing children entry', tree.index[id])
          popPath()
        }
      })
      popPath()
      pushPath('heap')
      Object.keys(tree.heap).forEach((id) => {
        if (id !== 'null' && typeof tree.index[id] === 'undefined') {
          pushPath(id)
          pushError('Missing heap entry', tree.index[id])
          popPath()
        }
      })
      popPath()
      pushPath('index')
      Object.keys(tree.index).forEach((id) => {
        if (typeof tree.children[id] === 'undefined' || typeof tree.heap[id] === 'undefined') {
          pushPath(id)
          pushError('Orphan index beat')
          popPath()
        }
      })
      popPath()
    }
    ['series', ...nonSeriesKeys].forEach((next) => {
      pushPath(next)
      validateTree(beats[next])
      popPath()
    })
  }`
  )
}

const beatsLens = lensPath(['schema', 'beats'])
const fixBeats = over(beatsLens, compose(fixBeatsType, over(beatsSchemaLens, fixBeatsSchema)))

const cardsLens = lensPath(['schema', 'cards'])
const fixCards = over(cardsLens, identity)

const characterLens = lensPath(['schema', 'characters'])
const fixCharacters = over(characterLens, identity)

const notesLens = lensPath(['schema', 'notes'])
const fixNotes = over(notesLens, identity)

const placesLens = lensPath(['schema', 'places'])
const fixPlaces = over(placesLens, identity)

const hierarchyLevelsTypeLens = lensProp('$type')
const fixHierarchyLevelsType = over(hierarchyLevelsTypeLens, always('function'))
const hierarchyLevelsSchemaLens = lensProp('schema')
const fixHierarchyLevelsSchema = (schema) => {
  const aHierarchyLevelSchema = schema.series.schema['0']
  return (
    `function (hierarchyLevels) {
    if (typeof hierarchyLevels.series === 'undefined') {
      pushError('series is missing', hierarchyLevels.series)
    }
    const topLevelNonSeriesKeys = Object.keys(hierarchyLevels).filter((key) => {
      return key !== 'series'
    })
    topLevelNonSeriesKeys.every((key) => {
    try {
      if ` +
    '(`${parseInt(key)}`' +
    ` !== key) {
        pushPath(key)
        pushError('number', key)
        popPath()
      } 
    } catch (error) {
      pushPath(key)
      pushError('number', key)
      popPath()
    }
  })
    const isValidHierarchyLevelsConfig = (keyAndHierarchyLevels) => {
      const [key, hierarchyLevels] = keyAndHierarchyLevels
      pushPath(key)
      if (Object.keys(hierarchyLevels).length >= 4 || Object.keys(hierarchyLevels).length === 0) {
        pushError('Invalid number of hierarchy levels', Object.keys(hierarchyLevels).length)
      }
      Object.keys(hierarchyLevels).map((key) => {
        try {
          return parseInt(key)
        } catch (_error) {
          return -1
        }
      }).forEach((key) => {
        if (key < 0 || key > 2) {
          pushError('Invalid hierarchy level key', key)
        }
      })
      Object.entries(hierarchyLevels).every((keyAndLevel) => {
        const [key, level] = keyAndLevel
        pushPath(key)
        hasSameShapeAs(${generateValidator(aHierarchyLevelSchema.schema)})(level)
        popPath()
      })
      popPath()
    }
    Object.entries(hierarchyLevels).forEach(isValidHierarchyLevelsConfig)
    popPath()
  }`
  )
}

const hierarchyLevelsLens = lensPath(['schema', 'hierarchyLevels'])
const fixHierarchyLevels = over(
  hierarchyLevelsLens,
  compose(fixHierarchyLevelsType, over(hierarchyLevelsSchemaLens, fixHierarchyLevelsSchema))
)

const imagesTypeLens = lensProp('$type')
const fixImagesType = over(imagesTypeLens, always('function'))
const imagesSchemaLens = lensProp('schema')
const fixImagesSchema = (schema) => {
  const anImageSchema = schema['1']
  return (
    `function (images) {
    Object.keys(images).every((key) => {
      try {
        if (` +
    '`${parseInt(key)}`' +
    ` !== key) {
          pushPath(key)
          pushError('number', key)
          popPath()
        }
      } catch (_error) {
        pushPath(key)
        pushError('number', key)
        popPath()
      }
    })
    Object.entries(images).forEach((keyAndImage) => {
      const [key, image] = keyAndImage
      pushPath(key)
      hasSameShapeAs(${generateValidator(anImageSchema.schema)})(image)
      popPath()
    })
  }`
  )
}

const imagesLens = lensPath(['schema', 'images'])
const fixImages = over(imagesLens, compose(fixImagesType, over(imagesSchemaLens, fixImagesSchema)))

function manualFixup(schema) {
  return compose(
    fixFile,
    fixUI,
    fixBooks,
    fixBeats,
    fixCards,
    fixCharacters,
    fixNotes,
    fixPlaces,
    fixHierarchyLevels,
    fixImages
  )(schema)
}

function main() {
  const classicSchema = rootSchema(exampleFile)
  const proSchema = rootSchema(exampleProFile)
  const mergedSchema = mergeSchemas(classicSchema, proSchema)
  const fixedUpSchema = manualFixup(mergedSchema)
  const finalSchema = generateValidator(fixedUpSchema.schema)

  let fileOutput =
    `// Auto generated by "npm run schema:gen"

let path = []
let errors = []

function pushPath(newElement) {
  path = [...path, newElement]
}

function popPath() {
  path = path.slice(0, -1)
}

function pushError(expected, value) {
  errors.push({ path, expected, value: typeof value === 'object' ? JSON.stringify(value) : value })
}

function isUnbound(x) {
  if (typeof x !== 'undefined') {
    pushError('unbound', x)
  }
}

function isString(x) {
  if (typeof x !== 'string') {
    pushError('string', x)
  }
}

function isNumber(x) {
  if (typeof x !== 'number') {
    pushError('number', x)
  }
}

function isBoolean(x) {
  if (typeof x !== 'boolean') {
    pushError('boolean', x)
  }
}

function isNull(x) {
  if (x !== null) {
    pushError('null', x)
  }
}

function isAny(x) {
  if (typeof x === 'undefined') {
    pushError('any', x)
  }
}

function isObject(x) {
  if (typeof x !== 'object' || Array.isArray(x)) {
    pushError('object', x)
  }
}

function hasSameShapeAs(subSchema) {
  return function(x) {
    return Object.keys(subSchema).forEach((schemaKey) => {
      pushPath(schemaKey)
      subSchema[schemaKey](x && x[schemaKey])
      popPath()
    })
  }
}

function isArrayOf(subSchema) {
  return function(x) {
    if (!Array.isArray(x)) {
      pushError('array', x)
    } else {
      x.forEach((element, index) => {
        pushPath(index)
        subSchema(element)
        popPath()
      })
    } 
  }
}

function oneOf(subSchemas) {
  return function(x) {
    const errorsBefore = [...errors]
    subSchemas.forEach((subSchema) => {
      subSchema(x, true)
    })
    const errorsCreated = errors.slice(errorsBefore.length)
    errors = errorsBefore
    if (errorsCreated.length === subSchemas.length) {
      pushError(` +
    '`' +
    'One of: ${subSchemas.map((schema) => {' +
    "if (typeof schema === 'function') {" +
    'return schema.name' +
    '} else {' +
    'return schema' +
    '}' +
    '})}' +
    '`' +
    `, x)
    }
  }
}

// We could validate more of this in the future.
function validateSlate(slate) {
  return !slate || Array.isArray(slate)
}

const validator = hasSameShapeAs(${finalSchema})

export const schema = (file) => {
  errors = []
  path = []
  validator(file)
  return errors
}`
  writeFile('./v2/store/fileSchema.js', fileOutput)
}

main()
