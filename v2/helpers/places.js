import { safeParseInt } from './safeParseInt'

export const placeFocusPath = (rawPlaceId, { type, customAttributeName }) => {
  const placeId = safeParseInt(rawPlaceId)
  if (!rawPlaceId || (typeof rawPlaceId !== 'number' && `${placeId}` !== rawPlaceId)) {
    return ['unknown']
  } else if (typeof customAttributeName === 'string') {
    return ['place', placeId, customAttributeName]
  } else if (['name', 'description', 'notes'].indexOf(type) !== -1) {
    return ['place', placeId, type]
  } else {
    return ['unknown']
  }
}
