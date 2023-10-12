import { selectors } from 'wired-up-pltr'

import { store } from '../src/app/store'
import createErrorReporter from './error-reporter'
import logger from './logger'
import { makeMainProcessClient } from '../src/app/mainProcessClient'

const { pleaseTellMeWhatPlatformIAmOn, getVersion } = makeMainProcessClient()

const NODE_ENV = process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? 'development' : 'production'

export const ERROR_REPORTER_ACCESS_TOKEN = process.env.ROLLBAR_ACCESS_TOKEN || 'PHONY_ACCESS_TOKEN'
let generalErrorReporterInitialised = false
let generalErrorReporterInstance = {
  error: (...args) => {
    console.error('Attempted to use general error reporter but it is not initialised', ...args)
  },
}
// Note: there used to be a need to produce a promise from here.
// That's why it still produces a promise today.
export const getErrorReporterInstance = () => {
  if (generalErrorReporterInitialised) {
    return Promise.resolve(generalErrorReporterInstance)
  } else {
    const state = store.getState()
    const userId = selectors.userIdSelector(state)
    const userEmail = selectors.emailAddressSelector(state)
    return Promise.all([pleaseTellMeWhatPlatformIAmOn(), getVersion()]).then(([os, version]) => {
      generalErrorReporterInstance = createErrorReporter(
        ERROR_REPORTER_ACCESS_TOKEN,
        version,
        NODE_ENV,
        logger,
        'general_error_reporter',
        os,
        userId,
        userEmail
      )
      generalErrorReporterInitialised = true
      return generalErrorReporterInstance
    })
  }
}
