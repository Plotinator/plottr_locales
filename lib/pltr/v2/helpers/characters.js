import { safeParseInt } from './safeParseInt'
import { parseNumberOrString } from './parseNumberOrString'

export const showBookTabs = (bookIds, characters) => {
  const aCharacterHasABook = characters.some((character) => {
    return character.bookIds && character.bookIds.length > 0
  })

  return bookIds.length > 1 && aCharacterHasABook
}

export const characterFocusPath = (
  rawCharacterId,
  rawBookId,
  { templateId, attributeName, attributeId, type }
) => {
  const characterId = safeParseInt(rawCharacterId)
  const bookId = parseNumberOrString(rawBookId)
  const parsedAttributeId = safeParseInt(attributeId)
  if (
    !bookId ||
    (typeof rawBookId !== 'number' && `${bookId}` !== rawBookId) ||
    (typeof rawCharacterId !== 'number' && `${characterId}` !== rawCharacterId)
  ) {
    return ['unknown']
  } else if (typeof templateId === 'string' && typeof attributeName === 'string') {
    return ['character', characterId, 'template', templateId, attributeName, bookId]
  } else if (
    attributeId &&
    (attributeId === parsedAttributeId || `${parsedAttributeId}` === attributeId)
  ) {
    return ['character', characterId, 'customAttribute', parsedAttributeId, bookId]
  } else if (type === 'name') {
    return ['character', characterId, type]
  } else if (typeof attributeId === 'string') {
    return ['character', characterId, 'customAttribute', attributeId, bookId]
  } else {
    return ['unknown']
  }
}
