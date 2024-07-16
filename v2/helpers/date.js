import { DateTime } from 'luxon'

// Expect a string of the form: YYYY_MM?_DD? to a date.
// This is necessary because date parsing is *browser specific*!
export const parseStringDate = (stringDate) => {
  const [year, month, day] = stringDate.split('_')
  if (!year || !month || !day) {
    throw new Error(
      `Invalid date: ${stringDate}.  Expected something in the form: YYYY_MM?_DD? or YYYY-MM?-DD?`
    )
  }
  return new Date(year, month - 1, day)
}

const safeParseInt = (string) => {
  if (typeof string === 'string' && string.match(/[0-9]+/)) {
    try {
      const x = parseInt(string)
      if (isNaN(x)) {
        return null
      } else {
        return x
      }
    } catch (error) {
      return null
    }
  } else {
    return null
  }
}

export const versionToDate = (version) => {
  if (typeof version === 'string') {
    const [rawYear, rawMonth, rawDay] = version.split('.')
    const year = safeParseInt(rawYear)
    const month = safeParseInt(rawMonth)
    const day = safeParseInt(rawDay)
    if (year && month && day) {
      const versionDate = new Date()
      versionDate.setUTCFullYear(year)
      versionDate.setUTCMonth(month - 1)
      versionDate.setUTCDate(day)
      return versionDate
    } else {
      return null
    }
  } else {
    return null
  }
}

/**
 * Produce a new JS Date that is MONTHS months in the past from the
 * given DATE.
 *
 * @param {Date} date
 * @param {number} months
 * @returns {Date}
 */
export const subtractMonths = (date, months) => {
  return DateTime.fromJSDate(date).minus({ months }).toJSDate()
}

/**
 * Produce a new JS Date that is MONTHS months in the future from the
 * given DATE.
 *
 * @param {Date} date
 * @param {number} months
 * @returns {Date}
 */
export const addMonths = (date, months) => {
  return DateTime.fromJSDate(date).plus({ months }).toJSDate()
}
