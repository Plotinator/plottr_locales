import React from 'react'
import PropTypes from 'react-proptypes'

import Row from '../../Row'
import UnconnectedBackupFileDisplay from './BackupFileDisplay'

const BackupsProjectRowConnector = (connector) => {
  const BackupFileDisplay = UnconnectedBackupFileDisplay(connector)

  const BackupsProjectRow = ({ folder, groupName, files }) => {
    const renderFiles = () => {
      // NOTE: this works because the 'start session' version always comes first
      return files.map((file, index) => {
        return (
          <BackupFileDisplay
            folder={folder}
            groupName={groupName}
            file={file}
            folderDate={folder.shortDateStr}
            key={`${folder.shortDateStr}-${groupName}-${file.fileId}-${index}`}
          />
        )
      })
    }

    return (
      <Row key={groupName} className="dashboard__backups__project-row">
        <div>
          <h6>{groupName}</h6>
        </div>
        <div>{renderFiles()}</div>
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
