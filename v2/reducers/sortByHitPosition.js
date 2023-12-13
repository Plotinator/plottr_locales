import { safeParseInt } from './safeParseInt'

const START_REGEX = /[0-9]+$/

const hitStart = (hit) => {
  const rawStart = hit.match(START_REGEX)
  if (!rawStart) {
    return 0
  } else {
    return safeParseInt(rawStart)
  }
}

export const sortByHitPosition = (hits) => {
  return hits.sort((hitOne, hitTwo) => {
    return hitStart(hitTwo.path) - hitStart(hitOne.path)
  })
}
