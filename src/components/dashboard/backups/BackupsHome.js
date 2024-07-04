import React, { useEffect, useState } from 'react'

import { t } from 'plottr_locales'

import FormControl from '../../FormControl'
import Glyphicon from '../../Glyphicon'
import ToolTip from '../../ToolTip'
import DashboardErrorBoundary from '../../containers/DashboardErrorBoundary'
import BackupsTable from './BackupsTable'
import { Spinner } from '../../Spinner'

const BackupsHome = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showTable, setShowTable] = useState(false)

  useEffect(() => {
    setTimeout(() => setShowTable(true), 300)
  }, [])

  return (
    <div className="dashboard__backups">
      <div className="dashboard__backups__header-div">
        <h1>{t('Backups')}</h1>
        <ToolTip
          id="backup-warning-tooltip"
          placement="right"
          text={t(
            'Plottr creates two backup files per session. One at the start and one at the end.'
          )}
        >
          <Glyphicon glyph="info-sign" />
        </ToolTip>
      </div>
      <FormControl
        type="search"
        placeholder={t('Search')}
        className="dashboard__search"
        onChange={(event) => setSearchTerm(event.target.value)}
        value={searchTerm}
      />
      <DashboardErrorBoundary>
        {showTable ? <BackupsTable searchTerm={searchTerm} /> : <Spinner />}
      </DashboardErrorBoundary>
    </div>
  )
}

export default BackupsHome
