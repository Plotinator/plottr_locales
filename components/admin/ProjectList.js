import { Table, Label, Button } from 'react-bootstrap'
import { PropTypes } from 'prop-types'
import axios from 'axios'
import { SUPPORT_EMAIL } from '../../lib/admin/constants'

const ProjectList = ({ files, supportUserProjects, refetch, supportID }) => {
  const unDelete = (fileId) => {
    axios
      .post('/api/admin/project-undelete', { fileId })
      .then((response) => {
        console.log(response)
        refetch()
      })
      .catch((error) => {
        console.log(error)
        console.log(error.response.data)
        refetch()
      })
  }

  const shareWithSupport = (fileId, currentShareRecords) => {
    axios
      .post('/api/admin/project-share-support', { fileId, currentShareRecords, supportID })
      .then((response) => {
        console.log(response)
        refetch()
      })
      .catch((error) => {
        console.log(error)
        console.log(error.response.data)
        refetch()
      })
  }

  const unShareWithSupport = (fileId, currentShareRecords) => {
    axios
      .post('/api/admin/project-share-support', {
        fileId,
        currentShareRecords,
        supportID,
        unshare: true,
      })
      .then((response) => {
        console.log(response)
        refetch()
      })
      .catch((error) => {
        console.log(error)
        console.log(error.response.data)
        refetch()
      })
  }

  const isSharedWithSupport = (fileId, shareRecords) => {
    const supportIsAuthorized = fileId && supportUserProjects.some((id) => id == fileId)
    const supportOnShareRecord =
      shareRecords && shareRecords.some((rec) => rec.emailAddress == SUPPORT_EMAIL)

    // NOTE: I could see making sense as either && or ||
    // this way captures more cases
    return supportIsAuthorized || supportOnShareRecord
  }

  const renderTime = (frbTimeStamp) => {
    if (!frbTimeStamp) return null

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
        {files.map(
          ({ fileId, deleted, fileName, permission, version, timeStamp, shareRecords }) => (
            <tr key={fileId}>
              <td>{deleted ? <Label bsStyle="danger">DELETED</Label> : ''}</td>
              <td>{fileName}</td>
              <td>{renderTime(timeStamp)}</td>
              <td>{fileId}</td>
              <td>{permission}</td>
              <td>{version}</td>
              <td>
                {isSharedWithSupport(fileId, shareRecords) ? (
                  <Button
                    style={{ marginRight: '8px' }}
                    bsStyle="warning"
                    bsSize="xs"
                    onClick={() => unShareWithSupport(fileId, shareRecords)}
                  >
                    Un-Share with Support User
                  </Button>
                ) : (
                  <Button
                    style={{ marginRight: '8px' }}
                    bsSize="xs"
                    onClick={() => shareWithSupport(fileId, shareRecords)}
                  >
                    Share to Support User
                  </Button>
                )}
                {deleted ? (
                  <Button bsStyle="warning" bsSize="xs" onClick={() => unDelete(fileId)}>
                    Undelete
                  </Button>
                ) : null}
              </td>
            </tr>
          )
        )}
      </tbody>
    </Table>
  )
}

ProjectList.propTypes = {
  files: PropTypes.array,
  supportUserProjects: PropTypes.array,
  refetch: PropTypes.func,
  supportID: PropTypes.string,
}

export default ProjectList
