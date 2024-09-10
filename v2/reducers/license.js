/** @module Reducers */

import {
  SET_LICENSE_INFO,
  SET_TRIAL_INFO,
  SET_LICENSE_CHECK_INTERVAL_ID,
  RECONNECTED_TO_LICENSING_API,
  DIFFICULTY_CONTACTING_LICENSING_API,
} from '../constants/ActionTypes'

/**
 * Example license:
 * licenseInfo: {
 *   plottrLicense: {
 *     secret: 'blargy_blarg',
 *     machineInfo: {
 *       id: 'f3cdecaab7a08a84570a4a354ea85ad4b3a389dbf0e7800aba50f94299b0efb2',
 *       os: 'linux',
 *       name: 'quiescent.home',
 *       localUserName: 'edward',
 *     },
 *     dateChecked: '2024-03-27T08:31:44.451Z',
 *   },
 *   proLicense: {
 *     secret: 'blargy_blarg',
 *     machineInfo: {
 *       id: 'f3cdecaab7a08a84570a4a354ea85ad4b3a389dbf0e7800aba50f94299b0efb2',
 *       os: 'linux',
 *       name: 'quiescent.home',
 *       localUserName: 'edward',
 *     },
 *     expiresAt: '2024-03-28T08:31:45.070Z',
 *     dateChecked: '2024-03-27T08:31:45.070Z',
 *   },
 * },
 */
const INITIAL_STATE = {
  trialInfo: {
    startsAt: null,
    endsAt: null,
    extensions: null,
  },
  licenseInfo: {
    plottrLicense: null,
    proLicense: null,
  },
  // id of the interval that checks for license validity periodically.
  licenseCheckInterval: null,
  couldNotContactLicenseServer: false,
}

const licenseReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_TRIAL_INFO: {
      return {
        ...state,
        trialInfo: action.trialInfo,
      }
    }
    case SET_LICENSE_INFO: {
      return {
        ...state,
        licenseInfo: action.licenseInfo,
      }
    }
    case SET_LICENSE_CHECK_INTERVAL_ID: {
      return {
        ...state,
        licenseCheckInterval: action.intervalId,
      }
    }
    case DIFFICULTY_CONTACTING_LICENSING_API: {
      return {
        ...state,
        couldNotContactLicenseServer: true,
      }
    }
    case RECONNECTED_TO_LICENSING_API: {
      return {
        ...state,
        couldNotContactLicenseServer: false,
      }
    }
    default: {
      return state
    }
  }
}

export default licenseReducer
