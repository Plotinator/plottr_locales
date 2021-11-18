import { useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { Logtail } from '@logtail/node'
import Rollbar from 'rollbar'

import setupRollbar from '../lib/rollbar'
import { logger } from '../lib/logger'
import { appVersion } from '../lib/version'

function Error({ statusCode, error, message }) {
  useEffect(() => {
    try {
      logger.error('Error occured on client', message, error)
      const dummyUser = {
        get: () => {},
      }
      const rollbar = setupRollbar(
        'ErrorBoundary',
        appVersion(),
        dummyUser,
        (process.env.NEXT_PUBLIC_NODE_ENV || process.env.NEXT_PUBLIC_NODE_ENV) === 'development'
          ? 'development'
          : 'production',
        process.env.NEXT_PUBLIC_ROLLBAR_ACCESS_TOKEN || process.env.ROLLBAR_ACCESS_TOKEN || '',
        process.platform
      )
      rollbar.error(error, message)
    } catch (error) {
      console.error('Error: ', error)
    }
  }, [])

  return (
    <p>
      {statusCode ? `An error ${statusCode} occurred on server` : 'An error occurred on client'}
    </p>
  )
}

Error.propTypes = {
  statusCode: PropTypes.number,
  error: PropTypes.object,
  message: PropTypes.string,
}

Error.getInitialProps = ({ req, res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  // Only require Rollbar and report error if we're on the server
  if (!process.browser) {
    const log = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN)
    log.info('Encountered an error on the server side.', err?.message, err)
    const rollbar = new Rollbar(process.env.ROLLBAR_ACCESS_TOKEN)
    rollbar.error(err, req, (rollbarError) => {
      if (rollbarError) {
        log.error('Rollbar error reporting failed:', rollbarError.message, rollbarError)
        return
      }
      log.info('Reported error to Rollbar')
    })
  }
  return { statusCode, error: err, message: err?.message }
}

export default Error
