import React, { useState, useMemo, useEffect, useRef } from 'react'
import PropTypes from 'react-proptypes'
import { FaPlus } from '@react-icons/all-files/fa/FaPlus'
import { FaMinus } from '@react-icons/all-files/fa/FaMinus'
import cx from 'classnames'

import { t } from 'plottr_locales'

import Grid from '../../Grid'
import Collapse from '../../Collapse'
import BackupsProjectRow from './BackupsProjectRow'

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

  const displayableGroups = useMemo(() => {
    return Object.entries(folder.groups)
      .map(([groupName, files]) => {
        const displayableGroupName = makeDisplayableGroupName(files[0].name, files[0])
        let row = null
        if (displayableGroupName?.toLowerCase().includes(searchTerm.toLowerCase())) {
          return {
            groupName,
            displayableGroupName,
            folder,
            files,
          }
        }
        return row
      })
      .filter(Boolean)
  }, [searchTerm, folder])

  const prevSearchTerm = useRef('')

  useEffect(() => {
    if (searchTerm && displayableGroups.length > 0 && !isOpen) {
      setOpen(true)
    } else if (searchTerm === '' && prevSearchTerm.current !== '' && isOpen) {
      setOpen(false)
    }
    prevSearchTerm.current = searchTerm
  }, [folder, searchTerm, isOpen])

  // group by file name (without Session Start) to put them in
  // "projects" display each project as another row
  const projects = displayableGroups
    ? // @ts-ignore
      displayableGroups.map(({ groupName, displayableGroupName, folder, files }) => {
        return (
          <BackupsProjectRow
            folder={folder}
            groupName={displayableGroupName}
            files={files}
            key={`${groupName}-${files[0].name}`}
          />
        )
      })
    : []
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

export default BackupsFolder
