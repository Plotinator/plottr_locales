import { Logtail } from '@logtail/browser'

let clientId = null

export const setClientId = (newClientId) => {
  clientId = newClientId
}

const currentClientId = () => {
  if (!clientId) console.warn('Logging from worker logger without a client id!')
  return clientId || 'no-client-id-set'
}

const CONSOLE_LOGGER = {
  info: (...args) => {
    console.log(args[0], {
      extraArgs: args.slice(1),
      clientId: currentClientId(),
    })
  },
  warn: (...args) => {
    console.warn(args[0], {
      extraArgs: args.slice(1),
      clientId: currentClientId(),
    })
  },
  error: (...args) => {
    console.error(args[0], {
      extraArgs: args.slice(1),
      clientId: currentClientId(),
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
      clientId: currentClientId(),
    })
  },
  warn: (...args) => {
    LOGGER.warn(args[0], {
      extraArgs: args.slice(1),
      clientId: currentClientId(),
    })
  },
  error: (...args) => {
    LOGGER.error(args[0], {
      extraArgs: args.slice(1),
      clientId: currentClientId(),
    })
  },
}
