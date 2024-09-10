import { safeParseInt } from './safeParseInt'
import { isSeries as isSeriesString } from './books'

export const associateWithBroadestScope = (bookId) => bookId || 'series'

export const isSeries = ({ bookId }) => isSeriesString(bookId)

export const isNotSeries = ({ bookId }) => !isSeriesString(bookId)

export const lineFocusPath = (rawLineId, type) => {
  const lineId = safeParseInt(rawLineId)

  if (typeof rawLineId !== 'number' && rawLineId !== `${lineId}`) {
    return ['unknown']
  } else if (['title'].indexOf(type) !== -1) {
    return ['line', lineId, type]
  } else {
    return ['unknown']
  }
}
