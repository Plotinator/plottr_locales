// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.
import { createSelector } from 'reselect'

import { fullFileStateSelector } from './fullFileFirstOrder'

export const trialInfoSelector = createSelector(
  fullFileStateSelector,
  (state) => state.license.trialInfo
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
  ({ dateChecked }) => {
    return dateCheckedExistsAndIsWithinLimit(dateChecked)
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
        return false
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
export const needsToCheckALicenseType = createSelector(
  needsToCheckPlottrLicense,
  needsToCheckProLicense,
  (needsToCheckPlottr, needsToCheckPro) => {
    return needsToCheckPlottr || needsToCheckPro
  }
)

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
