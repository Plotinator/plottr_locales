export const convertFromNanosAndSecondsOrTimestampOrNull = (date) => {
  if (!date) {
    return null
  } else if (typeof date.nanoseconds !== 'undefined' && typeof date.seconds !== 'undefined') {
    return convertFromNanosAndSecondsOrDefault(date).getTime()
  } else if (typeof date === 'number') {
    return date
  } else {
    return null
  }
}

export const convertFromNanosAndSecondsOrDefault = (nanosAndSecondsObject) => {
  return convertFromNanosAndSeconds(nanosAndSecondsObject) || new Date()
}

export const convertFromNanosAndSeconds = (nanosAndSecondsObject) => {
  if (
    !nanosAndSecondsObject ||
    (!nanosAndSecondsObject.nanoseconds && nanosAndSecondsObject.nanoseconds !== 0) ||
    (!nanosAndSecondsObject.seconds && nanosAndSecondsObject.seconds !== 0)
  ) {
    return null
  }
  return new Date(
    nanosAndSecondsObject.seconds * 1000 + nanosAndSecondsObject.nanoseconds / 1000000
  )
}
