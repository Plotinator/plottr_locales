// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.
import { createSelector } from 'reselect'
import { isEmpty } from 'lodash'

import { fullFileStateSelector } from './fullFileFirstOrder'

export const trialInfoSelector = createSelector(
  fullFileStateSelector,
  (state) => state?.license?.trialInfo ?? {}
)
export const trialEndSelector = createSelector(trialInfoSelector, ({ endsAt }) => endsAt)
export const daysLeftOfTrialSelector = createSelector(trialEndSelector, (endsAt) => {
  let oneDay = 24 * 60 * 60 * 1000
  var today = new Date()
  return Math.round((endsAt - today.getTime()) / oneDay)
})
export const trialExpiredSelector = createSelector(
  daysLeftOfTrialSelector,
  (daysLeft) => daysLeft <= 0
)
export const canExtendSelector = createSelector(
  trialInfoSelector,
  ({ extensions }) => extensions > 0
)
export const trialStartedSelector = createSelector(
  trialInfoSelector,
  ({ startsAt, endsAt, extensions }) => {
    return (
      startsAt !== null &&
      startsAt !== undefined &&
      endsAt !== null &&
      endsAt !== undefined &&
      extensions !== null &&
      extensions !== undefined
    )
  }
)
export const trialStartedOnSelector = createSelector(trialInfoSelector, ({ startsAt }) => startsAt)
export const trialEndsOnSelector = createSelector(trialInfoSelector, ({ endsAt }) => endsAt)

export const licenseSelector = createSelector(fullFileStateSelector, ({ license }) => {
  return license ?? {}
})
export const licenseInfoSelector = createSelector(licenseSelector, ({ licenseInfo }) => {
  return licenseInfo ?? {}
})
export const plottrLicenseSelector = createSelector(licenseInfoSelector, ({ plottrLicense }) => {
  return plottrLicense ?? {}
})
export const MAX_DAYS_WITHOUT_CHECKING = 30
const MILISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000
const MAX_DAYS_WITHOUT_CHECKING_MILISECONDS = MAX_DAYS_WITHOUT_CHECKING * MILISECONDS_IN_A_DAY
const dateCheckedExistsAndIsWithinLimit = (inDateChecked) => {
  if (inDateChecked && typeof inDateChecked === 'string') {
    const dateChecked = new Date(inDateChecked)
    if (isNaN(dateChecked)) {
      return false
    } else {
      const dateToday = new Date()
      const expiryDate = new Date(dateChecked.getTime() + MAX_DAYS_WITHOUT_CHECKING_MILISECONDS)
      return dateToday < expiryDate
    }
  } else {
    return false
  }
}
export const hasActivePlottrLicenseSelector = createSelector(
  plottrLicenseSelector,
  ({ dateChecked, expiresAt }) => {
    if (dateCheckedExistsAndIsWithinLimit(dateChecked)) {
      if (expiresAt && typeof expiresAt === 'string') {
        const dateExpiresAt = new Date(expiresAt)
        if (isNaN(dateExpiresAt)) {
          return false
        } else {
          const dateToday = new Date()
          return dateToday < dateExpiresAt
        }
      } else {
        return expiresAt === null
      }
    } else {
      return false
    }
  }
)
export const needsToCheckPlottrLicense = createSelector(
  plottrLicenseSelector,
  ({ dateChecked }) => {
    return !dateCheckedExistsAndIsWithinLimit(dateChecked)
  }
)
export const proLicenseSelector = createSelector(licenseInfoSelector, ({ proLicense }) => {
  return proLicense ?? {}
})
export const hasActiveProLicenseSelector = createSelector(
  proLicenseSelector,
  ({ dateChecked, expiresAt }) => {
    if (dateCheckedExistsAndIsWithinLimit(dateChecked)) {
      if (expiresAt && typeof expiresAt === 'string') {
        const dateExpiresAt = new Date(expiresAt)
        if (isNaN(dateExpiresAt)) {
          return false
        } else {
          const dateToday = new Date()
          return dateToday < dateExpiresAt
        }
      } else {
        return expiresAt === null
      }
    } else {
      return false
    }
  }
)
export const hasAnActiveLicenseSelector = createSelector(
  hasActivePlottrLicenseSelector,
  hasActiveProLicenseSelector,
  (hasActivePlottrLicense, hasActiveProLicense) => {
    return hasActivePlottrLicense || hasActiveProLicense
  }
)
export const proLicenseExpirySelector = createSelector(proLicenseSelector, ({ expiresAt }) => {
  if (expiresAt && typeof expiresAt === 'string') {
    return new Date(expiresAt)
  } else {
    return null
  }
})
export const needsToCheckProLicense = createSelector(proLicenseSelector, ({ dateChecked }) => {
  return !dateCheckedExistsAndIsWithinLimit(dateChecked)
})

export const licenseCheckIntervalSelector = createSelector(
  licenseSelector,
  ({ licenseCheckInterval }) => {
    return licenseCheckInterval ?? null
  }
)

export const failedToContactLicenseServerSelector = createSelector(
  licenseSelector,
  ({ couldNotContactLicenseServer }) => {
    return couldNotContactLicenseServer
  }
)

export const plottrLicenseExpirySelector = createSelector(
  plottrLicenseSelector,
  ({ expiresAt }) => {
    if (expiresAt && typeof expiresAt === 'string') {
      return new Date(expiresAt)
    } else {
      return null
    }
  }
)
export const hasATrialExpiredOrNotSelector = createSelector(trialInfoSelector, (trialInfo) => {
  return !isEmpty(trialInfo)
})
export const hasAPlottrLicenseExpiredOrNotSelector = createSelector(
  plottrLicenseSelector,
  (plottrLicense) => {
    return !isEmpty(plottrLicense)
  }
)
export const hasAProLicenseExpiredOrNotSelector = createSelector(
  proLicenseSelector,
  (proLicense) => {
    return !isEmpty(proLicense)
  }
)

export const latestExpiryDateSelector = createSelector(
  proLicenseExpirySelector,
  plottrLicenseExpirySelector,
  hasAPlottrLicenseExpiredOrNotSelector,
  hasAProLicenseExpiredOrNotSelector,
  (
    proLicenseExpiry,
    plottrLicenseExpiry,
    hasAPlottrLicenseExpiredOrNot,
    hasAProLicenseExpiredOrNot
  ) => {
    // If we have a license without an expiry date, then it's
    // lifetime, so there's no expiry date.
    if (
      (hasAPlottrLicenseExpiredOrNot && !plottrLicenseExpiry) ||
      (hasAProLicenseExpiredOrNot && !proLicenseExpiry)
    ) {
      return null
    } else if (proLicenseExpiry && plottrLicenseExpiry) {
      // We have both expiry dates, which one comes later?
      if (proLicenseExpiry > plottrLicenseExpiry) {
        return proLicenseExpiry
      } else {
        return plottrLicenseExpiry
      }
    } else if (proLicenseExpiry) {
      // We only have a pro expiry date, and we have no Plottr
      // license.
      return proLicenseExpiry
    } else {
      // We don't have a pro license, so produce the Plottr expiry
      // whether or not it's there.
      return plottrLicenseExpiry
    }
  }
)
