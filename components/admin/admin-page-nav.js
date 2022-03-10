import { PropTypes } from 'prop-types'

import { Nav, NavItem } from 'react-bootstrap'

const AdminPageNav = ({ section, setSection }) => {
  return (
    <div className="admin-page-nav">
      <h3>Plottr Admin</h3>
      <Nav bsStyle="pills" stacked activeKey={1} onSelect={setSection}>
        <NavItem eventKey="fixes" title="Fixes">
          Fixes
        </NavItem>
        <NavItem eventKey="list-files" title="List Files">
          List Files
        </NavItem>
      </Nav>
      <style jsx>{`
        .admin-page-nav {
          grid-area: nav;
          padding: 0em 1em 3em 1em;
          display: flex;
          flex-direction: column;
          align-items: start;
          justify-content: start;
          background-color: hsl(210, 31%, 80%);
        }
      `}</style>
    </div>
  )
}

AdminPageNav.propTypes = {
  section: PropTypes.string.isRequired,
  setSection: PropTypes.func.isRequired,
}

export default AdminPageNav
