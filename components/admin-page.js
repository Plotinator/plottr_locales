import { useEffect } from 'react'

import { onSessionChange, currentUser, logOut } from 'wired-up-firebase'

import { logger } from '../lib/logger'

const AdminPage = () => {
  useEffect(() => {
    let fileListener = null
    const sessionListener = onSessionChange(
      (user) => {
        const url = `/admin-login`
        if (!user) {
          window.location.href = url
        } else {
          currentUser()
            .getIdTokenResult(true)
            .then((token) => {
              logger.info('Received token')
              if (!token.claims.admin) {
                alert('You dont have the admin claim.')
                logOut().then(() => {
                  window.location.href = url
                })
              }
            })
        }
      },
      (error) => {
        logger.error('Error while trying to listen for session changes.', error)
      }
    )
    return () => {
      if (fileListener) fileListener()
      sessionListener()
    }
  }, [])

  return <div>Hi!</div>
}

export default AdminPage
