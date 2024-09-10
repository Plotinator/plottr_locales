import { parseNumberOrString } from './parseNumberOrString'

export const projectFocusPath = (rawBookId, attributeType) => {
  const bookId = parseNumberOrString(rawBookId)
  if (
    rawBookId &&
    (typeof rawBookId === 'number' || `${bookId}` === rawBookId) &&
    ['title', 'premise', 'genre', 'theme'].indexOf(attributeType) !== -1
  ) {
    return ['book', bookId, attributeType]
  } else if (['name', 'premise', 'genre', 'theme'].indexOf(attributeType) !== -1) {
    return [attributeType]
  } else {
    return ['unknown']
  }
}
