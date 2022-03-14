import { PropTypes } from 'prop-types'

import ListFiles from '../list-files'
import UserInfoPage from './user-info-page'
import { AdminErrorBoundary } from './admin-error-boundary'
import CreateUser from './create-user'

const AdminPageMain = ({ section }) => {
  const sectionBody = (() => {
    switch (section) {
      case 'user': {
        return (
          <AdminErrorBoundary>
            <UserInfoPage />
          </AdminErrorBoundary>
        )
      }
      case 'create': {
        return (
          <AdminErrorBoundary>
            <CreateUser />
          </AdminErrorBoundary>
        )
      }
      case 'fixes': {
        return (
          <>
            <h1>Fixes</h1>
            <p>Some fixes... TBD.</p>
          </>
        )
      }
      case 'list-files': {
        return <ListFiles />
      }
      default: {
        return <h1>Unknown section</h1>
      }
    }
  })()

  return (
    <div className="admin-page-main">
      {sectionBody}
      <style jsx>{`
        .admin-page-main {
          grid-area: main;
          display: flex;
          padding-left: 3em;
          flex-direction: column;
          align-items: start;
          justify-content: start;
        }
      `}</style>
    </div>
  )
}

AdminPageMain.propTypes = {
  section: PropTypes.string.isRequired,
}

export default AdminPageMain
