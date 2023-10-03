import Rollbar from 'rollbar'

const MAX_ERROR_REPORTS_PER_MINUTE = 5

/**
 * Construct an object that reports errors to our error reporting
 * service.  Today, that's Rollbar, in the future, it might be another
 * service.
 *
 * This abstraction provides a few features as well as hiding how we
 * configure our error reporting service:
 *
 * - Rate limiting: it refuses to send more than
 *   MAX_ERROR_REPORTS_PER_MINUTE, and discards errorrs when there are
 *   too many.
 *
 * - Argument type checking: it ensures that the error reporting
 *   service is called with valid arguments and creates sensible
 *   defaults in the absence of correctly typed arguments.
 */
const ErrorReporter = (
  accessToken,
  appVersion,
  environment,
  logger,
  context,
  os,
  userId,
  userEmail
) => {
  Rollbar.global({
    itemsPerMinute: MAX_ERROR_REPORTS_PER_MINUTE,
  })
  const MAX_ROLLBAR_API_RETRIES = 1
  const SEND_RETRY_INTERVAL_MILLISECONDS = 5000
  const MAX_DEPTH_OF_STACK_TRACES = 50
  const REQUEST_TIMEOUT_MILLISECONDS = 5000
  Rollbar.configure({
    accessToken: accessToken,
    enabled: environment === 'production',
    maxRetries: MAX_ROLLBAR_API_RETRIES,
    retryInterval: SEND_RETRY_INTERVAL_MILLISECONDS,
    stackTraceLimit: MAX_DEPTH_OF_STACK_TRACES,
    timeout: REQUEST_TIMEOUT_MILLISECONDS,
    payload: {
      platform: 'client', // allows the post_client_item token in rollbar
      environment: environment,
      version: appVersion,
      context,
      client: {
        javascript: {
          source_map_enabled: true,
          code_version: appVersion,
          guess_uncaught_frames: true,
        },
      },
      person: {
        id: userId,
        email: userEmail,
      },
    },
  })

  const extraContext = { os }

  const validMessageAndError = (rawMessage, rawError) => {
    const typeOfMessage = typeof rawMessage
    const typeofError = typeof rawError
    const messageIsError = rawMessage instanceof Error
    const errorIsError = rawError instanceof Error

    const message =
      typeOfMessage === 'string'
        ? rawMessage
        : typeofError === 'string'
        ? rawError
        : rawMessage
        ? rawMessage.toString()
        : rawError
        ? rawError.toString()
        : 'No error or message supplied'
    const error = errorIsError
      ? rawError
      : messageIsError
      ? rawMessage
      : new Error(
          `No error supplied.  Other args: message: ${rawMessage.toString()}, error: ${rawError.toString()}`
        )

    return [message, error]
  }

  const error = (rawMessage, rawError) => {
    if (typeof rawMessage !== 'string') {
      logger.warn(
        `Passed wrong type to first argument of rollbar.error().  Expected a string, got ${typeof rawMessage}`,
        new Error('Invalid 1st argument')
      )
    }
    if (!(rawError instanceof Error)) {
      logger.warn(
        `Passed wrong type to second argument of rollbar.error().  Expected an Error, got ${typeof rawError}`
      )
    }
    const [message, error] = validMessageAndError(rawMessage, rawError)
    if (environment !== 'production') {
      logger.error(
        'Error from rollbar (not reporting because environment is not "production")',
        message,
        error,
        context
      )
      return Promise.resolve()
    } else {
      return new Promise((resolve) => {
        Rollbar.error(message, error, extraContext, () => {
          resolve()
        })
      })
    }
  }

  return { error }
}

export default ErrorReporter
