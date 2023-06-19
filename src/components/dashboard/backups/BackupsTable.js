import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'

import Grid from '../../Grid'
import Row from '../../Row'
import { Spinner } from '../../Spinner'
import UnconnectedBackupsFolder from './BackupsFolder'

const BackupsTableConnector = (connector) => {
  const BackupsFolder = UnconnectedBackupsFolder(connector)

  const BackupsTable = ({ backupFolders, searchTerm }) => {
    const [maxRender, setMaxRender] = useState(1)

    useEffect(() => {
      setTimeout(() => setMaxRender(-1), 500)
    }, [backupFolders])

    const renderBody = () => {
      if (!backupFolders.length) return <h3>{t('No backups yet')}</h3>

      return backupFolders.map((folder, index) => {
        if (maxRender > 0 && index >= maxRender) return null
        return (
          <BackupsFolder
            folder={folder}
            searchTerm={searchTerm}
            openByDefault={index == 0}
            key={`${folder.longDateStr}-${index}`}
          />
        )
      })
    }

    let body = renderBody()
    if (searchTerm?.length > 1 && !body.filter(Boolean).length) {
      body = <h3>{t('No matches')}</h3>
    }

    let loadingSpinner = null
    if (maxRender > 0) {
      loadingSpinner = <Spinner />
    }

    return (
      <div className="dashboard__backups__body">
        <Grid fluid>
          <div className="dashboard__backups__body-table-header">
            <div>{t('Date')}</div>
            <div>{t('Count')}</div>
          </div>
          <Row>
            <hr />
          </Row>
        </Grid>
        <div className="dashboard__backups__wrapper">
          {body}
          {loadingSpinner}
        </div>
      </div>
    )
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
