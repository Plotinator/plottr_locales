import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { FaPlus, FaMinus } from 'react-icons/fa'
import cx from 'classnames'

import { t } from 'plottr_locales'

import Grid from '../../Grid'
import Collapse from '../../Collapse'
import UnconnectedBackupsProjectRow from './BackupsProjectRow'

const BackupsFolderConnector = (connector) => {
  const BackupsProjectRow = UnconnectedBackupsProjectRow(connector)

  const BackupsFolder = ({ searchTerm, folder, openByDefault }) => {
    const [isOpen, setOpen] = useState(openByDefault)

    const makeDisplayableGroupName = (groupName, firstFile) => {
      // sometimes firstFile.fileName will be undefined
      if (firstFile?.storagePath && firstFile?.fileName) {
        return firstFile.fileName
      } else {
        return groupName
      }
    }

    const renderProjects = (folder) => {
      // group by file name (without Session Start) to put them in "projects"
      // display each project as another row
      return Object.entries(folder.groups).map(([groupName, files]) => {
        const displayableGroupName = makeDisplayableGroupName(files[0].name, files[0])
        let row = null
        if (displayableGroupName?.toLowerCase().includes(searchTerm.toLowerCase())) {
          row = (
            <BackupsProjectRow
              folder={folder}
              groupName={displayableGroupName}
              files={files}
              key={`${groupName}-${files[0].name}`}
            />
          )
        }
        return row
      })
    }

    const projects = renderProjects(folder)
    if (searchTerm?.length > 1 && !projects.filter(Boolean).length) return null
    return (
      <div>
        <div
          className={cx('dashboard__backups__projects-summary', { active: isOpen })}
          onClick={() => setOpen(!isOpen)}
        >
          <div>
            <div>{isOpen ? <FaMinus /> : <FaPlus />}</div>
            <div>{folder.longDateStr}</div>
          </div>
          <div className="count-circle">{projects.length}</div>
        </div>
        <Collapse in={isOpen}>
          <Grid fluid className="dashboard__backups__projects-table">
            <div className="dashboard__backups__header-columns">
              <div className="dashboard__backups__columns">{t('Project Name')}</div>
              <div className="dashboard__backups__columns">{t('Start Session')}</div>
              <div className="dashboard__backups__columns">{t('End Session')}</div>
            </div>
            <hr />
            {projects}
            <hr />
          </Grid>
        </Collapse>
      </div>
    )
  }

  BackupsFolder.propTypes = {
    searchTerm: PropTypes.string.isRequired,
    folder: PropTypes.object.isRequired,
    openByDefault: PropTypes.bool,
  }

  return BackupsFolder
}

export default BackupsFolderConnector
