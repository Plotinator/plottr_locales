import { PropTypes } from 'prop-types'

import ListProjects from './list-projects'
import UserInfoPage from './user-info-page'
import { AdminErrorBoundary } from './admin-error-boundary'
import CreateUser from './create-user'
import DocumentViewer from './document-viewer'

const AdminPageMain = ({ section }) => {
  const sectionBody = (() => {
    switch (section) {
      case 'user': {
        return <UserInfoPage />
      }
      case 'create': {
        return <CreateUser />
      }
      case 'projects': {
        return <ListProjects />
      }
      case 'documents': {
        return <DocumentViewer />
      }
      default: {
        return <h1>Unknown section</h1>
      }
    }
  })()

  return (
    <div className="admin-page-main">
      <AdminErrorBoundary>{sectionBody}</AdminErrorBoundary>
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
