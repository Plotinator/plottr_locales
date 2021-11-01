import { Logtail } from '@logtail/browser'

import { sessionClientId } from './sessionClientId'

const CONSOLE_LOGGER = {
  info: (...args) => {
    console.log(args[0], {
      extraArgs: args.slice(1),
      clientId: sessionClientId(),
    })
  },
  warn: (...args) => {
    console.warn(args[0], {
      extraArgs: args.slice(1),
      clientId: sessionClientId(),
    })
  },
  error: (...args) => {
    console.error(args[0], {
      extraArgs: args.slice(1),
      clientId: sessionClientId(),
    })
  },
}

const LOGGER = process.env.NEXT_PUBLIC_LOGTAIL_SOURCE_TOKEN
  ? new Logtail(process.env.NEXT_PUBLIC_LOGTAIL_SOURCE_TOKEN)
  : CONSOLE_LOGGER

export const logger = {
  info: (...args) => {
    LOGGER.info(args[0], {
      extraArgs: args.slice(1),
      clientId: sessionClientId(),
    })
  },
  warn: (...args) => {
    LOGGER.warn(args[0], {
      extraArgs: args.slice(1),
      clientId: sessionClientId(),
    })
  },
  error: (...args) => {
    LOGGER.error(args[0], {
      extraArgs: args.slice(1),
      clientId: sessionClientId(),
    })
  },
}
