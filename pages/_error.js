import { PropTypes } from 'prop-types'
import { Logtail } from '@logtail/node'
import Rollbar from 'rollbar'

function Error({ statusCode }) {
  return (
    <p>
      {statusCode ? `An error ${statusCode} occurred on server` : 'An error occurred on client'}
    </p>
  )
}

Error.propTypes = {
  statusCode: PropTypes.number,
}

Error.getInitialProps = ({ req, res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  // Only require Rollbar and report error if we're on the server
  if (!process.browser) {
    const log = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN)
    log.info('Encountered an error on the server side.', err.message, err)
    const rollbar = new Rollbar(process.env.ROLLBAR_ACCESS_TOKEN)
    rollbar.error(err, req, (rollbarError) => {
      if (rollbarError) {
        log.error('Rollbar error reporting failed:', rollbarError.message, rollbarError)
        return
      }
      log.info('Reported error to Rollbar')
    })
  }
  return { statusCode }
}

export default Error
