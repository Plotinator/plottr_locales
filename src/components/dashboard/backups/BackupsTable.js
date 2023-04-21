import React from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import { groupBy } from 'lodash'
import Grid from '../../Grid'
import Col from '../../Col'
import Row from '../../Row'
import UnconnectedBackupFileDisplay from './BackupFileDisplay'

const BackupsTableConnector = (connector) => {
  const BackupFileDisplay = UnconnectedBackupFileDisplay(connector)

  const BackupsTable = ({ backupFolders, searchTerm }) => {
    const makeDateString = (dateObj, makeShort) => {
      let dateStr = ''
      try {
        const date = dateObj instanceof Date ? dateObj : helpers.date.parseStringDate(dateObj)
        const style = makeShort ? '{date, date, monthDay}' : '{date, date, medium}'
        dateStr = t(style, { date })
      } catch (error) {
        console.error(error)
      }
      return dateStr
    }

    const groupableName = (fileObj) => {
      if (fileObj.storagePath) {
        return fileObj.fileId
      } else {
        return fileObj.name.replace('(start-session)-', '').replace('.pltr', '')
      }
    }

    const renderFiles = (folder, groupName, files) => {
      // NOTE: this works because the 'start session' version always comes first
      return files.map((file, index) => {
        const folderDate = makeDateString(folder.date, true)
        return (
          <Col key={index} xs={12} sm={6} md={4} className="dashboard__backups__project-backup">
            <BackupFileDisplay
              folder={folder}
              groupName={groupName}
              file={file}
              folderDate={folderDate}
            />
          </Col>
        )
      })
    }

    const renderProjects = (folder) => {
      // group by file name (without Session Start) to put them in "projects"
      // display each project as another column
      const groups = groupBy(folder.backups, groupableName)
      return Object.entries(groups).map(([groupName, files]) => {
        // sometimes files[0].fileName will be undefined
        const realGroupName =
          files[0]?.storagePath && files[0]?.fileName ? files[0].fileName : groupName
        let row = null
        if (realGroupName?.toLowerCase().includes(searchTerm.toLowerCase())) {
          row = (
            <Row key={groupName} className="dashboard__backups__project-row">
              <Col xs={12} sm={6} md={3}>
                <h6>{realGroupName}</h6>
              </Col>
              {renderFiles(folder, realGroupName, files)}
            </Row>
          )
        }
        return row
      })
    }

    const renderBody = () => {
      return backupFolders.map((folder) => {
        let dateStr = makeDateString(folder.date, false)
        const projects = renderProjects(folder)
        if (searchTerm?.length > 1 && !projects.filter(Boolean).length) return null
        return (
          <div key={dateStr}>
            <h5>{dateStr}</h5>
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
      backupFolders: selectors.sortedBackupFoldersSelector(state),
    }))(BackupsTable)
  }

  throw new Error('Could not connect BackupsTable')
}

export default BackupsTableConnector
