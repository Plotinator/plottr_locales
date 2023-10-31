import { safeParseInt } from './safeParseInt'

export const tagFocusPath = (rawTagId, type) => {
  const tagId = safeParseInt(rawTagId)

  if (typeof rawTagId !== 'number' && rawTagId !== `${tagId}`) {
    return ['unknown']
  } else if (['title'].indexOf(type) !== -1) {
    return ['tag', tagId, type]
  } else {
    return ['unknown']
  }
}
