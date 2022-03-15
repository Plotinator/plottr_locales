import { Table, Label, Button } from 'react-bootstrap'
import { PropTypes } from 'prop-types'

const ProjectList = ({ files }) => {
  const renderTime = (frbTimeStamp) => {
    const realDate = new Date(frbTimeStamp._seconds * 1000)
    return realDate.toLocaleString()
  }

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Deleted</th>
          <th>File Name</th>
          <th>Last Opened</th>
          <th>ID</th>
          <th>Permission</th>
          <th>Version</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {files.map(({ fileId, deleted, fileName, permission, version, timeStamp }) => (
          <tr key={fileId}>
            <td>{deleted ? <Label bsStyle="danger">DELETED</Label> : ''}</td>
            <td>{fileName}</td>
            <td>{renderTime(timeStamp)}</td>
            <td>{fileId}</td>
            <td>{permission}</td>
            <td>{version}</td>
            <td>
              <Button style={{ marginRight: '8px' }}>Share to Support@</Button>
              {deleted ? <Button bsStyle="warning">Undelete</Button> : null}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

ProjectList.propTypes = {
  files: PropTypes.array,
}

export default ProjectList
