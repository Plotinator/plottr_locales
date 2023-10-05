import Rollbar from 'rollbar'

const MAX_ERROR_REPORTS_PER_MINUTE = 5

/**
 * Determine the URL of various sourcemaps to augment stack traces.
 */
function requestURL(url, version) {
  const baseURL = `https://raw.githubusercontent.com/Plotinator/pltr_sourcemaps/main/${version}`
  if (url.includes('app.html') || url.includes('app.bundle.js')) return `${baseURL}/app.bundle.js`
  if (url.includes('dashboard.html') || url.includes('dashboard.bundle.js'))
    return `${baseURL}/dashboard.bundle.js`
  if (url.includes('expired.html') || url.includes('expired.bundle.js'))
    return `${baseURL}/expired.bundle.js`
  if (url.includes('verify.html') || url.includes('verify.bundle.js'))
    return `${baseURL}/verify.bundle.js`
  return `${baseURL}/commons.bundle.js`
}

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
  const MAX_ROLLBAR_API_RETRIES = 1
  const SEND_RETRY_INTERVAL_MILLISECONDS = 5000
  const MAX_DEPTH_OF_STACK_TRACES = 50
  const REQUEST_TIMEOUT_MILLISECONDS = 5000
  Rollbar.init({
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
      server: {
        root: `https://raw.githubusercontent.com/Plotinator/pltr_sourcemaps/main/${appVersion}/`,
      },
    },
    transform: function (payload) {
      payload.request.url = requestURL(payload.request.url, appVersion)
      if (payload.body.trace) {
        payload.body.trace.frames = payload.body.trace.frames.map((fr) => {
          fr.filename = requestURL(fr.filename, appVersion)
          return fr
        })
      }
    },
  })
  Rollbar.global({
    itemsPerMinute: MAX_ERROR_REPORTS_PER_MINUTE,
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
          `No error supplied.  Other args: message: ${
            rawMessage?.toString() ?? 'No message supplied'
          }, error: ${rawError?.toString() ?? 'No error supplied'}`
        )

    return [message, error]
  }

  const error = (rawMessage, rawError) => {
    try {
      if (typeof rawMessage !== 'string') {
        logger.warn(
          `Passed wrong type to first argument of rollbar.error().  Expected a string, got ${typeof rawMessage}`
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
    } catch (error) {
      console.warn('Error logging an error', error, rawMessage, rawError)
      return Promise.resolve()
    }
  }

  return { error }
}

export default ErrorReporter
