import { Table } from 'react-bootstrap'
import { PropTypes } from 'prop-types'
import CustomClaims from './CustomClaims'

const UserRecord = ({ user, refetch }) => {
  const stringData = JSON.stringify(user, null, 2)

  return (
    <div>
      <h3>Data</h3>
      <Table striped bordered hover>
        <tbody>
          <tr>
            <th>UID</th>
            <td>{user.uid}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{user.email}</td>
          </tr>
          <tr>
            <th>Disabled</th>
            <td>{String(user.disabled)}</td>
          </tr>
          <tr>
            <th>Last Sign In</th>
            <td>{user.metadata?.lastSignInTime}</td>
          </tr>
          <tr>
            <th>Created At</th>
            <td>{user.metadata?.creationTime}</td>
          </tr>
          <tr>
            <th>Email Verified</th>
            <td>{String(user.emailVerified)}</td>
          </tr>
        </tbody>
      </Table>
      <CustomClaims claims={user.customClaims} userID={user.uid} refetch={refetch} />
      <h3>String</h3>
      <pre>{stringData}</pre>
      <style jsx>{`
        th {
          font-family: 'Lato';
          font-weight: 900;
        }
      `}</style>
    </div>
  )
}

UserRecord.propTypes = {
  user: PropTypes.object,
  refetch: PropTypes.func,
}

export default UserRecord
