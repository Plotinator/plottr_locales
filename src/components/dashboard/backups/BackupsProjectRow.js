import React from 'react'
import PropTypes from 'react-proptypes'
import { sortBy } from 'lodash'

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
    const renderFiles = () => {
      return sortBy(files, isStartOfSession).map((file, index) => {
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
