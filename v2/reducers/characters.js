import { cloneDeep, sortBy, omit, uniq } from 'lodash'
import {
  ADD_CHARACTER,
  ADD_CHARACTER_WITH_TEMPLATE,
  FILE_LOADED,
  NEW_FILE,
  ATTACH_CHARACTER_TO_CARD,
  REMOVE_CHARACTER_FROM_CARD,
  ATTACH_CHARACTER_TO_NOTE,
  REMOVE_CHARACTER_FROM_NOTE,
  DELETE_NOTE,
  DELETE_CARD,
  DELETE_CHARACTER,
  DELETE_IMAGE,
  ATTACH_TAG_TO_CHARACTER,
  REMOVE_TAG_FROM_CHARACTER,
  ATTACH_BOOK_TO_CHARACTER,
  REMOVE_BOOK_FROM_CHARACTER,
  DELETE_CHARACTER_CATEGORY,
  DELETE_TAG,
  LOAD_CHARACTERS,
  LOAD_CHARACTER,
  BATCH_LOAD_CHARACTER,
  REMOVE_CHARACTER,
  ADD_TEMPLATE_TO_CHARACTER,
  REMOVE_TEMPLATE_FROM_CHARACTER,
  EDIT_CHARACTER_TEMPLATE_ATTRIBUTE,
  DUPLICATE_CHARACTER,
  CREATE_CHARACTER_ATTRIBUTE,
  EDIT_CHARACTER_ATTRIBUTE_VALUE,
  EDIT_CHARACTER_ATTRIBUTE_METADATA,
  DELETE_CHARACTER_ATTRIBUTE,
  EDIT_CHARACTER_SHORT_DESCRIPTION,
  EDIT_CHARACTER_DESCRIPTION,
  EDIT_CHARACTER_CATEGORY,
  DELETE_BOOK,
  EDIT_CHARACTER_NAME,
  EDIT_CHARACTER_IMAGE,
  DELETE_CHARACTER_LEGACY_CUSTOM_ATTRIBUTE,
  REORDER_CHARACTER_TEMPLATES,
  REPLACE_MARKED_HITS,
  REORDER_CHARACTER_MANUALLY,
  ADD_CHARACTER_FROM_PLTR,
  UNDO,
  REDO,
  UNDO_N_TIMES,
  REDO_N_TIMES,
} from '../constants/ActionTypes'
import { character as defaultCharacter } from '../store/initialState'
import { newFileCharacters } from '../store/newFileState'
import { nextId } from '../store/newIds'
import { applyToCustomAttributes } from './applyToCustomAttributes'
import { repairIfPresent } from './repairIfPresent'
import { reorderList } from '../helpers/lists'
import { safeParseInt } from './safeParseInt'
import { sortByHitPosition } from './sortByHitPosition'
import { replacePlainTextHit, replaceInSlateDatastructure } from './replace'
import { parseNumberOrString } from './parseNumberOrString'

const initialState = [defaultCharacter]

const firstParagraphText = (children) => {
  if (!Array.isArray(children) || children.length === 0) {
    return ''
  }

  const firstElement = children[0]
  if (typeof firstElement.text === 'string') {
    return firstElement.text
  }

  return firstParagraphText(firstElement.children)
}

const attachBaseAttribute = (attributeName, value, action, state) => {
  return state.map((character) => {
    if (character.id === action.id) {
      const attributeId = action.attributeId
      const newAttributes = character.attributes || []
      const hasAttribute = newAttributes.some((attribute) => {
        return (
          attribute.id === attributeId &&
          attribute.bookId === (action.bookId || action.currentBookId)
        )
      })
      const attributes = attributeId
        ? hasAttribute
          ? newAttributes.map((attribute) => {
              if (attribute.id === attributeId) {
                return {
                  ...attribute,
                  value: uniq([...attribute.value, value]),
                }
              }
              return attribute
            })
          : [
              ...newAttributes,
              {
                id: attributeId,
                bookId: action.bookId || action.currentBookId,
                value: [value, ...character[attributeName]],
              },
            ]
        : newAttributes

      return {
        ...character,
        attributes,
      }
    }
    return character
  })
}

const removeTag = (attributeName, value, action, state) => {
  return state.map((character) => {
    if (character.id === action.id) {
      const attributeId = action.attributeId
      const newAttributes = character.attributes || []
      const hasAttribute = newAttributes.some((attribute) => {
        return (
          attribute.id === attributeId &&
          attribute.bookId === (action.bookId || action.currentBookId)
        )
      })
      const attributes = attributeId
        ? hasAttribute
          ? newAttributes.map((attribute) => {
              if (
                attribute.id === attributeId &&
                attribute.bookId === (action.bookId || action.currentBookId)
              ) {
                return {
                  ...attribute,
                  value: attribute.value.filter((x) => x !== value),
                }
              }
              return attribute
            })
          : [
              ...newAttributes,
              {
                id: attributeId,
                bookId: action.bookId || action.currentBookId,
                value: character[attributeName].filter((x) => x !== value),
              },
            ]
        : newAttributes

      return {
        ...character,
        ...(character.tags
          ? {
              tags: character.tags.filter((tag) => {
                return tag !== value
              }),
            }
          : {}),
        attributes,
      }
    }

    return character
  })
}

const DISALLOWED_NAMES = [
  'notes',
  'categoryId',
  'id',
  'name',
  'color',
  'cards',
  'noteIds',
  'templates',
  'tags',
  'imageId',
  'bookIds',
  'position',
]

const removeAttributesAssociatedWithDeletedBook = (character, deletedBookId) => {
  const attributeBelongsToDeletedBook = (attribute) => {
    return attribute.bookId === deletedBookId
  }

  const hasAttributeInDeletedBook = (character.attributes || []).some(attributeBelongsToDeletedBook)
  if (hasAttributeInDeletedBook) {
    return {
      ...character,
      attributes: (character.attributes || []).filter(
        (attribute) => !attributeBelongsToDeletedBook(attribute)
      ),
    }
  } else {
    return character
  }
}

const removeDeletedBookFromCharacter = (character, deletedBookId) => {
  if (character.bookIds.indexOf(deletedBookId) > -1) {
    return {
      ...character,
      bookIds: character.bookIds.filter((bookId) => {
        return bookId !== deletedBookId
      }),
    }
  } else {
    return character
  }
}

const characters =
  (dataRepairers) =>
  (state = initialState, action) => {
    const repair = repairIfPresent(dataRepairers)

    switch (action.type) {
      case ADD_CHARACTER:
        return [
          ...state,
          {
            ...defaultCharacter,
            id: action.nextCharacterId,
            name: action.name,
            description: action.description,
            notes: action.notes,
            ...(action.currentBookId !== 'all' ? { bookIds: [action.currentBookId] } : {}),
          },
        ]

      case ADD_CHARACTER_WITH_TEMPLATE: {
        const templateData = {
          id: action.templateData.id,
          version: action.templateData.version,
          attributes: action.templateData.attributes,
          value: '',
        }
        return [
          ...state,
          {
            ...defaultCharacter,
            id: nextId(state),
            name: action.name,
            description: action.description,
            notes: action.notes,
            templates: [templateData],
          },
        ]
      }

      case EDIT_CHARACTER_NAME: {
        return state.map((character) => {
          if (character.id === action.id) {
            return {
              ...character,
              name: action.name,
            }
          }

          return character
        })
      }

      case EDIT_CHARACTER_IMAGE: {
        return state.map((character) => {
          if (character.id === action.id) {
            return {
              ...character,
              imageId: action.imageId,
            }
          }

          return character
        })
      }

      case EDIT_CHARACTER_TEMPLATE_ATTRIBUTE: {
        return state.map((character) => {
          if (character.id === action.id) {
            return {
              ...character,
              templates: character.templates.map((template) => {
                // @ts-ignore
                if (template.id === action.templateId) {
                  // @ts-ignore
                  const templateHasAttribute = template.attributes.some((attribute) => {
                    return attribute.name === action.name
                  })
                  if (!templateHasAttribute) {
                    return template
                  }
                  const isAttributeValue = (attribute) => {
                    return attribute.bookId === action.bookId && attribute.name === action.name
                  }
                  // @ts-ignore
                  const hasAttributeValue = (template.values || []).some(isAttributeValue)
                  return {
                    // @ts-ignore
                    ...template,
                    values: hasAttributeValue
                      ? // @ts-ignore
                        (template.values || []).map((attribute) => {
                          if (isAttributeValue(attribute))
                            return {
                              ...attribute,
                              value: action.value,
                            }

                          return attribute
                        })
                      : [
                          // @ts-ignore
                          ...(template.values || []),
                          { name: action.name, value: action.value, bookId: action.bookId },
                        ],
                  }
                }
                return template
              }),
            }
          }
          return character
        })
      }

      case ADD_TEMPLATE_TO_CHARACTER:
        return state.map((character) => {
          if (character.id === action.id) {
            if (character.templates.some(({ id }) => id === action.templateData.id)) {
              return character
            }
            const newCharacter = cloneDeep(character)
            // @ts-ignore
            newCharacter.templates.push({
              id: action.templateData.id,
              version: action.templateData.version,
              attributes: action.templateData.attributes,
              value: '',
            })
            return newCharacter
          } else {
            return character
          }
        })

      case REORDER_CHARACTER_TEMPLATES: {
        return state.map((character) => {
          if (character.id === action.id) {
            const reorderedTemplates = reorderList(
              action.destination,
              action.originalPosition,
              character.templates
            )
            return {
              ...character,
              templates: reorderedTemplates,
            }
          }
          return character
        })
      }

      case REORDER_CHARACTER_MANUALLY: {
        const {
          characterIdsInOrder,
          bookId,
          characterId,
          categoryAttributeId,
          newCategoryId,
          positionAttributeId,
          newPosition,
          direction,
        } = action
        const moveUp = direction === 'up'
        const originalPosition = characterIdsInOrder.findIndex((id) => {
          return id === characterId
        })
        const adjustedNewPosition =
          newPosition > originalPosition && newPosition === 0 ? 0 : newPosition

        // Assign each character it's visible position in the current
        // book as reported by the action.
        //
        // *BUT* when we get to the character we're moving, give it a
        // position based on the direction we're moving in so that it
        // sorts into the correct order later.
        const withPositionsForCurrentBook = characterIdsInOrder.map(
          (currentCharacterId, visiblePosition) => {
            const character = state.find(({ id }) => {
              return id === currentCharacterId
            })
            const existingAttributes = character?.attributes || []
            const theAttribute = (attribute) => {
              return attribute.id === positionAttributeId && attribute.bookId == bookId
            }
            const existingPositionAttribute = existingAttributes?.find(theAttribute)
            const position =
              characterId === currentCharacterId ? adjustedNewPosition : visiblePosition

            const newAttribute = {
              id: positionAttributeId,
              bookId,
              value: position,
            }
            if (existingPositionAttribute) {
              const attributesWithoutPositionForThisBook = existingAttributes.filter(
                (attribute) => !theAttribute(attribute)
              )
              return {
                ...character,
                attributes: [...attributesWithoutPositionForThisBook, newAttribute],
              }
            } else {
              return {
                ...character,
                attributes: [...existingAttributes, newAttribute],
              }
            }
          }
        )
        const withCategorySet = state
          .map((character) => {
            const hasPositionForCurrentBook = withPositionsForCurrentBook.find(
              (charWithPos) => charWithPos.id == character.id
            )

            if (hasPositionForCurrentBook) {
              return hasPositionForCurrentBook
            }
            return character
          })
          .map((character) => {
            if (character.id === characterId) {
              const existingAttributes = character?.attributes || []
              const theAttribute = (attribute) => {
                return attribute.id === categoryAttributeId && attribute.bookId == bookId
              }
              const existingCategoryAttribute = existingAttributes?.find(theAttribute)
              const newAttribute = {
                id: categoryAttributeId,
                bookId,
                value: newCategoryId,
              }
              if (existingCategoryAttribute) {
                const attributesWithoutCategoryForThisBook = existingAttributes.filter(
                  (attribute) => !theAttribute(attribute)
                )
                return {
                  ...character,
                  attributes: [...attributesWithoutCategoryForThisBook, newAttribute],
                }
              } else {
                return {
                  ...character,
                  attributes: [...existingAttributes, newAttribute],
                }
              }
            } else {
              return character
            }
          })
        const isTheCharacter = (character) => {
          return character.id === characterId
        }
        const characterWithOldPosition = withCategorySet.find(isTheCharacter)
        if (!characterWithOldPosition) {
          return state
        } else {
          const sortedByPosition = sortBy(withCategorySet, (character) => {
            const theAttribute = (attribute) => {
              return attribute.id === positionAttributeId && attribute.bookId == bookId
            }
            const attributeValue = character.attributes?.find(theAttribute)?.value
            if (character.id === characterId) {
              return moveUp ? attributeValue - 0.1 : attributeValue + 0.1
            } else {
              return attributeValue
            }
          })
          return sortedByPosition.map((character, position) => {
            const existingAttributes = character?.attributes || []
            const newAttribute = {
              id: positionAttributeId,
              bookId,
              value: position,
            }
            const theAttribute = (attribute) => {
              return attribute.id === positionAttributeId && attribute.bookId == bookId
            }
            const attributesWithoutPositionForThisBook = existingAttributes.filter(
              (attribute) => !theAttribute(attribute)
            )
            return {
              ...character,
              attributes: [...attributesWithoutPositionForThisBook, newAttribute],
            }
          })
        }
      }

      case ATTACH_CHARACTER_TO_CARD:
        return state.map((character) => {
          return character.id === action.characterId
            ? {
                ...character,
                bookIds: uniq([action.currentTimeline, ...character.bookIds]),
                cards: [action.id, ...character.cards],
              }
            : character
        })

      case REMOVE_CHARACTER_FROM_CARD:
        return state.map((character) => {
          let cards = cloneDeep(character.cards)
          cards.splice(cards.indexOf(action.id), 1)
          return character.id === action.characterId
            ? Object.assign({}, character, { cards: cards })
            : character
        })

      case ATTACH_CHARACTER_TO_NOTE:
        return state.map((character) => {
          let notes = cloneDeep(character.noteIds)
          notes.push(action.id)
          return character.id === action.characterId
            ? Object.assign({}, character, { noteIds: notes })
            : character
        })

      case REMOVE_CHARACTER_FROM_NOTE:
        return state.map((character) => {
          let notes = cloneDeep(character.noteIds)
          notes.splice(notes.indexOf(action.id), 1)
          return character.id === action.characterId
            ? Object.assign({}, character, { noteIds: notes })
            : character
        })

      case ATTACH_TAG_TO_CHARACTER: {
        return attachBaseAttribute('tags', action.tagId, action, state)
      }

      case REMOVE_TAG_FROM_CHARACTER: {
        return removeTag('tags', action.tagId, action, state)
      }

      case DELETE_TAG: {
        return state.map((character) => {
          if (!Array.isArray(character.attributes)) {
            return character
          }

          const characterHasAttribute = character.attributes.some((attribute) => {
            return action.attributeId === attribute.id
          })
          if (characterHasAttribute) {
            return {
              ...character,
              attributes: character.attributes.map((attribute) => {
                if (action.attributeId === attribute.id) {
                  return {
                    ...attribute,
                    value: attribute.value.filter((tagId) => {
                      return tagId !== action.id
                    }),
                  }
                }

                return attribute
              }),
            }
          }

          return character
        })
      }

      case ATTACH_BOOK_TO_CHARACTER: {
        return state.map((character) => {
          let bookIds = cloneDeep(character.bookIds)
          bookIds.push(action.bookId)
          return character.id === action.id
            ? Object.assign({}, character, { bookIds: bookIds })
            : character
        })
      }

      case REMOVE_BOOK_FROM_CHARACTER: {
        return state.map((character) => {
          return character.id === action.id
            ? { ...character, bookIds: character.bookIds.filter((id) => id !== action.bookId) }
            : character
        })
      }

      case REMOVE_TEMPLATE_FROM_CHARACTER:
        return state.map((character) => {
          if (character.id !== action.id) return character
          // @ts-ignore
          const newTemplates = character.templates.filter((t) => t.id != action.templateId)
          return Object.assign({}, character, { templates: newTemplates })
        })

      case DELETE_BOOK: {
        return state.map((character) => {
          return removeAttributesAssociatedWithDeletedBook(
            removeDeletedBookFromCharacter(character, action.id),
            action.id
          )
        })
      }

      case DELETE_NOTE:
        return state.map((character) => {
          let notes = cloneDeep(character.noteIds)
          if (!notes || !notes.includes(action.id)) {
            return character
          } else {
            notes.splice(notes.indexOf(action.id), 1)
            return Object.assign({}, character, { noteIds: notes })
          }
        })

      case DELETE_CARD:
        return state.map((character) => {
          // @ts-ignore
          if (character.cards.indexOf(action.id) === -1) {
            return character
          } else {
            let cards = cloneDeep(character.cards)
            cards.splice(cards.indexOf(action.id), 1)
            return Object.assign({}, character, { cards: cards })
          }
        })

      case DELETE_CHARACTER:
        return state.filter((character) => character.id !== action.id)

      case DELETE_IMAGE:
        return state.map((ch) => {
          if (action.id == ch.imageId) {
            return {
              ...ch,
              imageId: null,
            }
          } else {
            return ch
          }
        })

      case FILE_LOADED:
        return action.data.characters.map((character) => {
          const normalizeRCEContent = repair('normalizeRCEContent')
          return {
            ...character,
            ...applyToCustomAttributes(
              character,
              normalizeRCEContent,
              action.data.customAttributes.characters.filter(({ name }) => {
                // Special case this attribute name because it blows
                // up if we try to normalise new attributes.
                return name !== 'attributes'
              }),
              'paragraph'
            ),
            notes: normalizeRCEContent(character.notes),
          }
        })

      case NEW_FILE:
        return newFileCharacters

      case DELETE_CHARACTER_CATEGORY: {
        return state.map((rawCharacter) => {
          // Problem is here.  Also take a look at whether deleting
          // tags works now.
          const character =
            // @ts-ignore
            rawCharacter?.categoryId?.toString() === action.categoryId.toString()
              ? {
                  ...rawCharacter,
                  categoryId: null,
                }
              : rawCharacter

          if (!Array.isArray(character.attributes)) {
            return character
          }

          const characterHasAttribute = character.attributes.some((attribute) => {
            return action.attributeId === attribute.id
          })
          if (characterHasAttribute) {
            return {
              ...character,
              attributes: character.attributes.map((attribute) => {
                if (
                  action.attributeId === attribute.id &&
                  action.categoryId.toString() === attribute.value?.toString()
                ) {
                  return {
                    ...attribute,
                    value: null,
                  }
                }

                return attribute
              }),
            }
          }

          return character
        })
      }

      case LOAD_CHARACTERS:
        return action.characters

      case LOAD_CHARACTER: {
        let didUpdate = false
        const updated = state.map((character) => {
          if (character.id === action.character.id) {
            didUpdate = true
            return action.character
          } else {
            return character
          }
        })

        if (didUpdate) {
          return updated
        } else {
          return [...state, action.character]
        }
      }

      case BATCH_LOAD_CHARACTER: {
        const indexedCharactersToLoad = action.characters.reduce((acc, next) => {
          acc.set(next.id, next)
          return acc
        }, new Map())
        const existingCharacters = new Set()
        const updated = state.map((character) => {
          existingCharacters.add(character.id)
          const characterToSwapIn = indexedCharactersToLoad.get(character.id)
          if (typeof characterToSwapIn !== 'undefined') {
            return characterToSwapIn
          } else {
            return character
          }
        })

        const newCharacters = action.characters.filter((newCharacter) => {
          return !existingCharacters.has(newCharacter.id)
        })

        return [...updated, ...newCharacters]
      }

      case REMOVE_CHARACTER: {
        return state.filter(({ id }) => {
          return id !== action.character.id
        })
      }

      case DUPLICATE_CHARACTER: {
        const itemToDuplicate = state.find(({ id }) => id === action.id)
        if (!itemToDuplicate) {
          return state
        }
        const duplicated = {
          ...cloneDeep(itemToDuplicate),
          id: nextId(state),
        }
        return [...state, { ...duplicated }]
      }

      case ADD_CHARACTER_FROM_PLTR: {
        const newCharacter = {
          ...cloneDeep(action.character),
          id: nextId(state),
          isChecked: undefined,
        }
        return [...state, { ...newCharacter }]
      }

      case CREATE_CHARACTER_ATTRIBUTE: {
        return state.map((character) => {
          const attributes = character.attributes || []

          const oldValue =
            DISALLOWED_NAMES.indexOf(action.attribute.name) === -1
              ? character[action.attribute.name]
              : undefined
          const value = action.attribute.value || oldValue

          return {
            ...character,
            attributes: [
              ...attributes,
              {
                value,
                id: action.nextAttributeId,
                bookId: action.bookId || action.currentBookId,
              },
            ],
          }
        })
      }

      case EDIT_CHARACTER_ATTRIBUTE_METADATA: {
        const nextState = state.map((character) => {
          if (!Array.isArray(character.attributes)) {
            return character
          }

          const attributes = character.attributes
          return {
            ...character,
            attributes: attributes.map((attribute) => {
              if (attribute.id === action.id) {
                const newValue =
                  typeof attribute.value === 'undefined'
                    ? attribute.value
                    : action.attributeType === 'text' && typeof attribute.value !== 'string'
                    ? firstParagraphText(attribute.value)
                    : attribute.value
                return {
                  ...attribute,
                  value: newValue,
                }
              }

              return attribute
            }),
          }
        })

        if (!action.id) {
          const { oldName, name } = action
          return nextState.map((character) => {
            if (character[oldName]) {
              return omit(
                {
                  ...character,
                  [name]: character[oldName],
                },
                oldName
              )
            }

            return character
          })
        }

        return nextState
      }

      case EDIT_CHARACTER_CATEGORY:
      case EDIT_CHARACTER_DESCRIPTION:
      case EDIT_CHARACTER_SHORT_DESCRIPTION:
      case EDIT_CHARACTER_ATTRIBUTE_VALUE: {
        return state.map((character) => {
          if (character.id === action.characterId) {
            const attributes = character.attributes || []
            const isAttributeToEdit = (attribute) => {
              return (
                attribute.id === action.attributeId &&
                attribute.bookId === (action.bookId || action.currentBookId)
              )
            }
            const willEditAnAttribute = attributes.some(isAttributeToEdit)

            if (willEditAnAttribute) {
              return {
                ...character,
                attributes: [
                  ...attributes.map((attribute) => {
                    if (isAttributeToEdit(attribute) && typeof action.value !== 'undefined') {
                      return {
                        ...attribute,
                        value: action.value,
                      }
                    }

                    return attribute
                  }),
                ],
              }
            }

            return {
              ...character,
              attributes: [
                ...attributes,
                {
                  bookId: action.bookId || action.currentBookId,
                  id: action.attributeId,
                  value: action.value,
                },
              ],
            }
          }

          return character
        })
      }

      case DELETE_CHARACTER_ATTRIBUTE: {
        return state.map((character) => {
          if (!Array.isArray(character.attributes)) {
            return character
          }

          const attributes = character.attributes || []
          return {
            ...character,
            attributes: attributes.filter((attribute) => {
              return attribute.id !== action.id
            }),
          }
        })
      }

      case DELETE_CHARACTER_LEGACY_CUSTOM_ATTRIBUTE: {
        const { attributeName } = action

        return state.map((character) => {
          if (typeof character[attributeName] !== 'undefined') {
            return omit(character, attributeName)
          }
          return character
        })
      }

      case REPLACE_MARKED_HITS: {
        const applicableHits = action.hitsMarkedForReplacement.filter((hit) => {
          return hit.path.match(/^\/characters\/[0-9a-zA-Z]+\//)
        })
        // IMPORTANT!!!
        //
        // We sort by the hit position so that we deal with later hits
        // first.  By doing so, we don't invalidate the start position
        // of other hits when we replace those hits.
        //
        // i.e. it's fine to do multiple replacements in the same
        // field, as long as you replace the hits in reverse order,
        // i.e. the last hit first and the first hit last.
        return sortByHitPosition(applicableHits).reduce((acc, nextHit) => {
          const { path, hit } = nextHit
          const [_, _character, rawCharacterId, type, ...rest] = path.split('/')
          const characterId = safeParseInt(rawCharacterId)
          return acc.map((nextCharacter) => {
            if (nextCharacter.id === characterId) {
              if (type === 'customAttribute') {
                const [rawAttributeId, rawBookId, rawFocusStart] = rest
                const attributeId = safeParseInt(rawAttributeId)
                const bookId = parseNumberOrString(rawBookId)
                const isNewAttribute =
                  attributeId &&
                  nextCharacter.attributes.some((attribute) => {
                    return attribute.id === attributeId && attribute.bookId === bookId
                  })
                const focusStart = safeParseInt(rawFocusStart)
                if (isNewAttribute) {
                  return {
                    ...nextCharacter,
                    attributes: nextCharacter.attributes.map((attribute) => {
                      if (attribute.id === attributeId && attribute.bookId === bookId) {
                        const attributeValue = attribute.value
                        const replaceFunction = Array.isArray(attributeValue)
                          ? replaceInSlateDatastructure
                          : replacePlainTextHit
                        return {
                          ...attribute,
                          value: replaceFunction(
                            attributeValue,
                            focusStart,
                            hit,
                            action.replacementText
                          ),
                        }
                      } else {
                        return attribute
                      }
                    }),
                  }
                } else {
                  const attributeValue = nextCharacter[rawAttributeId]
                  const replaceFunction = Array.isArray(attributeValue)
                    ? replaceInSlateDatastructure
                    : replacePlainTextHit
                  const newValue = replaceFunction(
                    attributeValue,
                    focusStart,
                    hit,
                    action.replacementText
                  )
                  return {
                    ...nextCharacter,
                    [rawAttributeId]: newValue,
                  }
                }
              } else if (type === 'templateAttribute') {
                const [templateId, attributeName, rawBookId, rawFocusStart] = rest
                const bookId = parseNumberOrString(rawBookId)
                const focusStart = safeParseInt(rawFocusStart)
                return {
                  ...nextCharacter,
                  templates: nextCharacter.templates.map((template) => {
                    if (template.id === templateId) {
                      return {
                        ...template,
                        values: template.values.map((templateValue) => {
                          if (
                            templateValue.name === attributeName &&
                            templateValue.bookId === bookId
                          ) {
                            const attributeValue = templateValue.value
                            const replaceFunction = Array.isArray(attributeValue)
                              ? replaceInSlateDatastructure
                              : replacePlainTextHit
                            return {
                              ...templateValue,
                              value: replaceFunction(
                                attributeValue,
                                focusStart,
                                hit,
                                action.replacementText
                              ),
                            }
                          } else {
                            return templateValue
                          }
                        }),
                      }
                    } else {
                      return template
                    }
                  }),
                }
              } else {
                const [rawFocusStart] = rest
                const focusStart = safeParseInt(rawFocusStart)
                const attributeValue = nextCharacter[type]
                const replaceFunction = Array.isArray(attributeValue)
                  ? replaceInSlateDatastructure
                  : replacePlainTextHit
                return {
                  ...nextCharacter,
                  [type]: replaceFunction(attributeValue, focusStart, hit, action.replacementText),
                }
              }
            } else {
              return nextCharacter
            }
          })
        }, state)
      }

      case UNDO_N_TIMES:
      case REDO_N_TIMES:
      case UNDO:
      case REDO: {
        if (Array.isArray(action.state.characters)) {
          return action.state.characters
        } else {
          return state
        }
      }

      default:
        return state
    }
  }

export default characters
