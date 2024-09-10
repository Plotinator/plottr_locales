import { safeParseInt } from './safeParseInt'

export const noteFocusPath = (rawNoteId, { contentOrTitle, attributeName }) => {
  const noteId = safeParseInt(rawNoteId)
  if (!rawNoteId || (typeof rawNoteId !== 'number' && `${noteId}` !== rawNoteId)) {
    return ['unknown']
  } else if (typeof attributeName === 'string') {
    return ['note', noteId, attributeName]
  } else if (['content', 'title'].indexOf(contentOrTitle) !== -1) {
    return ['note', noteId, contentOrTitle]
  } else {
    return ['unknown']
  }
}
