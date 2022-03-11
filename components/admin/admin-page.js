import { useEffect, useState } from 'react'

import { onSessionChange, getIdTokenResult, logOut } from 'wired-up-firebase'

import { logger } from '../../lib/logger'
import AdminPageLayout from './admin-page-layout'
import AdminPageMain from './admin-page-main'
import AdminPageNav from './admin-page-nav'

const AdminPage = () => {
  const [section, setSection] = useState('user')

  useEffect(() => {
    const sessionListener = onSessionChange(
      (user) => {
        const url = `/admin/admin-login`
        if (!user) {
          window.location.href = url
        } else {
          getIdTokenResult().then((token) => {
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
