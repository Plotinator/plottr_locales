import React from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'

import Grid from '../../Grid'
import Col from '../../Col'
import Row from '../../Row'
import UnconnectedBackupFileDisplay from './BackupFileDisplay'

const BackupsTableConnector = (connector) => {
  const BackupFileDisplay = UnconnectedBackupFileDisplay(connector)

  const BackupsTable = ({ backupFolders, searchTerm }) => {
    const makeDisplayableGroupName = (groupName, firstFile) => {
      // sometimes firstFile.fileName will be undefined
      if (firstFile?.storagePath && firstFile?.fileName) {
        return firstFile.fileName
      } else {
        return groupName
      }
    }

    const renderFiles = (folder, groupName, files) => {
      // NOTE: this works because the 'start session' version always comes first
      return files.map((file, index) => {
        return (
          <Col key={index} xs={12} sm={6} md={4} className="dashboard__backups__project-backup">
            <BackupFileDisplay
              folder={folder}
              groupName={groupName}
              file={file}
              folderDate={folder.shortDateStr}
            />
          </Col>
        )
      })
    }

    const renderProjects = (folder) => {
      // group by file name (without Session Start) to put them in "projects"
      // display each project as another column
      return Object.entries(folder.groups).map(([groupName, files]) => {
        const displayableGroupName = makeDisplayableGroupName(groupName, files[0])
        let row = null
        if (displayableGroupName?.toLowerCase().includes(searchTerm.toLowerCase())) {
          row = (
            <Row key={groupName} className="dashboard__backups__project-row">
              <Col xs={12} sm={6} md={3}>
                <h6>{displayableGroupName}</h6>
              </Col>
              {renderFiles(folder, displayableGroupName, files)}
            </Row>
          )
        }
        return row
      })
    }

    const renderBody = () => {
      if (!backupFolders.length) return <h3>{t('No backups yet')}</h3>

      return backupFolders.map((folder) => {
        const projects = renderProjects(folder)
        if (searchTerm?.length > 1 && !projects.filter(Boolean).length) return null
        return (
          <div key={folder.longDateStr}>
            <h5>{folder.longDateStr}</h5>
            <Grid className="dashboard__backups__projects-table">{projects}</Grid>
          </div>
        )
      })
    }

    let body = renderBody()
    if (searchTerm?.length > 1 && !body.filter(Boolean).length) {
      body = <h3>{t('No matches')}</h3>
    }

    return <div className="dashboard__backups__wrapper">{body}</div>
  }

  BackupsTable.propTypes = {
    searchTerm: PropTypes.string,
    backupFolders: PropTypes.array.isRequired,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      backupFolders: selectors.groupedSortedBackupFoldersSelector(state),
    }))(BackupsTable)
  }

  throw new Error('Could not connect BackupsTable')
}

export default BackupsTableConnector
