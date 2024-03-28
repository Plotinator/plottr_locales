import axios from 'axios'

import { makeMainProcessClient } from '../app/mainProcessClient'

const { machineId, pleaseTellMeWhatPlatformIAmOn, machineName, localUserName } =
  makeMainProcessClient()

/**
 * Check our API to see what license(s) it thinks you have.
 *
 * There are no arguments to this function because we expect the
 * client to have minted a server-only cookie by the time we check the
 * license.  That cookie is automatically submitted to the API on each
 * request and the client never gets to see whether it's there.  It'll
 * hear back from the server if it's missing or there's something
 * wrong with it.
 *
 * Produces a promise containing an object of the schema:
 *
 * {
 *   hasPro: bool,
 *   proExpiresAt: UTCDateTimeStamp,
 *   proLicensePayload: LicensePayload,
 *   hasPlottr: bool,
 *   plottrLicensePayload: LicensePayload,
 * }
 *
 * LicensePayload: {
 *   machineInfo: {
 *     id: String,
 *     name: String,
 *     os: String,
 *     localUsername: String,
 *   },
 *   secret: String,
 * }
 *
 * We're expected to record the license payload so that we can decrypt
 * the local license and check it's running on the right machine.
 */
export function checkForLicense(whenClientIsReady) {
  return Promise.all([
    machineId(),
    pleaseTellMeWhatPlatformIAmOn(),
    machineName(),
    localUserName(),
  ]).then(([id, os, name, userName]) => {
    const machineInfo = {
      id,
      os,
      name,
      localUserName: userName,
    }
    return axios
      .post(`https://${process.env.API_BASE_DOMAIN}/api/check-subscription`, machineInfo)
      .then((response) => {
        const { hasPro, proExpiresAt, proLicensePayload, hasPlottr, plottrLicensePayload } =
          response.data
        const dateChecked = new Date().toISOString()
        return whenClientIsReady(({ savePlottrLicense, saveProLicense }) => {
          return (
            hasPlottr
              ? savePlottrLicense(plottrLicensePayload?.secret ?? '', machineInfo, dateChecked)
              : Promise.resolve()
          ).then(() => {
            if (hasPro) {
              return saveProLicense(
                proLicensePayload?.secret ?? '',
                machineInfo,
                proExpiresAt,
                dateChecked
              )
            } else {
              return Promise.resolve()
            }
          })
        })
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 401) {
            return Promise.resolve()
          } else {
            return Promise.reject()
          }
        } else {
          return Promise.reject(error)
        }
      })
  })
}

export const makeLicenseServerAPIs = (whenClientIsReady) => {
  return {
    checkForAndSaveLicense: () => checkForLicense(whenClientIsReady),
  }
}
