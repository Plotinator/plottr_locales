import { Logtail } from '@logtail/browser'
import { DateTime } from 'luxon'

import { sessionClientId } from './sessionClientId'

const CONSOLE_LOGGER = {
  info: (...args) => {
    console.log(args[0], ...args.slice(1), {
      clientId: sessionClientId(),
    })
  },
  warn: (...args) => {
    console.warn(args[0], ...args.slice(1), {
      clientId: sessionClientId(),
    })
  },
  error: (...args) => {
    console.error(args[0], ...args.slice(1), {
      clientId: sessionClientId(),
    })
  },
}

const LOGGER = process.env.NEXT_PUBLIC_LOGTAIL_SOURCE_TOKEN
  ? new Logtail(process.env.NEXT_PUBLIC_LOGTAIL_SOURCE_TOKEN)
  : CONSOLE_LOGGER

// If there were too many failures in the last ten seconds, then back
// off from logging them and use the console logger instead.
const FAILURE_WINDOW = 10000
const MAX_FAILURES_IN_WINDOW = 5

// TODO: maybe back off on too many requests as well?
const makeLogger = () => {
  let failureWindow = []

  const cleanWindow = () => {
    const tenSecondsAgo = DateTime.now().minus({ seconds: FAILURE_WINDOW }).toSeconds()
    failureWindow = failureWindow.filter(({ timeStamp }) => timeStamp < tenSecondsAgo)
  }

  const fail = (level, args) => {
    failureWindow.push({ timeStamp: DateTime.now().toSeconds(), args, level })
  }

  const failedTooMuchRecently = () => {
    return failureWindow.length > MAX_FAILURES_IN_WINDOW
  }

  const tryToLog = (level) => (args) => {
    cleanWindow()
    if (failedTooMuchRecently()) {
      console.error(
        `We tried and failed to log ${failureWindow.length} times in the last ${
          FAILURE_WINDOW / 1000
        } seconds.  Falling back to the console logger`,
        ...args
      )
    } else {
      try {
        LOGGER[level](args[0], ...args.slice(1), {
          clientId: sessionClientId(),
        })
      } catch (error) {
        fail(level, args)
        console.error(
          'Tried to log and failed.  Falling back to console logger.  Original args follow.',
          ...args
        )
      }
    }
  }

  return {
    info: tryToLog('info'),
    warn: tryToLog('warn'),
    error: tryToLog('error'),
  }
}

export const logger = makeLogger()
