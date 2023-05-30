import React, { useState } from 'react'
import PropTypes from 'react-proptypes'

import Col from '../../Col'
import Row from '../../Row'
import UnconnectedBackupFileDisplay from './BackupFileDisplay'

const BackupsProjectRowConnector = (connector) => {
  const BackupFileDisplay = UnconnectedBackupFileDisplay(connector)

  const BackupsProjectRow = ({ folder, groupName, files }) => {
    const [showActions, setShowActions] = useState(false)

    const renderFiles = () => {
      // NOTE: this works because the 'start session' version always comes first
      return files.map((file, index) => {
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
