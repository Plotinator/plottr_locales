import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { sortBy } from 'lodash'

import Col from '../../Col'
import Row from '../../Row'
import UnconnectedBackupFileDisplay from './BackupFileDisplay'

const isStartOfSession = (file) => {
  return file.storagePath
    ? file?.storagePath?.match(/start-of-session/)
      ? -1
      : 1
    : file?.localFilePathSegments[file.localFilePathSegments.length - 1]?.match(/start-session/)
    ? -1
    : 1
}

const BackupsProjectRowConnector = (connector) => {
  const BackupFileDisplay = UnconnectedBackupFileDisplay(connector)

  const BackupsProjectRow = ({ folder, groupName, files }) => {
    const [showActions, setShowActions] = useState(false)

    const renderFiles = () => {
      return sortBy(files, isStartOfSession).map((file, index) => {
        return (
          <Col key={index} xs={12} sm={6} md={3} className="dashboard__backups__project-backup">
            <BackupFileDisplay
              folder={folder}
              groupName={groupName}
              file={file}
              folderDate={folder.shortDateStr}
              showActions={showActions}
            />
          </Col>
        )
      })
    }

    return (
      <Row
        key={groupName}
        className="dashboard__backups__project-row"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <Col xs={12} md={6}>
          <h6>{groupName}</h6>
        </Col>
        {renderFiles()}
      </Row>
    )
  }

  BackupsProjectRow.propTypes = {
    folder: PropTypes.object.isRequired,
    groupName: PropTypes.string.isRequired,
    files: PropTypes.array.isRequired,
  }

  return BackupsProjectRow
}

export default BackupsProjectRowConnector
