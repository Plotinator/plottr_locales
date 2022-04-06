import { PropTypes } from 'prop-types'

const AdminPageLayout = ({ children }) => {
  return (
    <div className="admin-page-layout">
      {children}
      <style jsx>{`
        .admin-page-layout {
          height: 100vh;
          width: 100%;
          overflow: auto;
          display: grid;
          grid-template-areas: 'nav main';
          grid-template-columns: auto 1fr;
        }
      `}</style>
    </div>
  )
}

AdminPageLayout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
}

export default AdminPageLayout
