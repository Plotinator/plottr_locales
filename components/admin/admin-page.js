import { useEffect, useState } from 'react'

import { onSessionChange, currentUser, logOut } from 'wired-up-firebase'

import { logger } from '../../lib/logger'
import AdminPageLayout from './admin-page-layout'
import AdminPageMain from './admin-page-main'
import AdminPageNav from './admin-page-nav'

const AdminPage = () => {
  const [section, setSection] = useState('user')

  useEffect(() => {
    let fileListener = null
    const sessionListener = onSessionChange(
      (user) => {
        const url = `/admin/admin-login`
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

  return (
    <main>
      <AdminPageLayout>
        <AdminPageNav section={section} setSection={setSection} />
        <AdminPageMain section={section} />
      </AdminPageLayout>
    </main>
  )
}

export default AdminPage
