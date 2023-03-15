import React, { useState } from 'react'
import { PropTypes } from 'prop-types'

import { t } from 'plottr_locales'

import FormControl from '../../FormControl'
import Alert from '../../Alert'
import Grid from '../../Grid'
import Col from '../../Col'
import Row from '../../Row'
import UnconnectedDashboardErrorBoundary from '../../containers/DashboardErrorBoundary'
import UnconnectedBackupsTable from './BackupsTable'

const BackupsHomeConnector = (connector) => {
  const BackupsTable = UnconnectedBackupsTable(connector)
  const DashboardErrorBoundary = UnconnectedDashboardErrorBoundary(connector)

  const BackupsHome = () => {
    const [searchTerm, setSearchTerm] = useState('')

    return (
      <div className="dashboard__backups">
        <div className="dashboard__backups__header-div">
          <h1>{t('Backups')}</h1>
          <Alert bsStyle="danger" style={{ maxWidth: 'max-content' }}>
            {t('Backups are read-only and can only be copied, not edited')}
          </Alert>
        </div>
        <Grid fluid>
          <Row>
            <Col xs={8} sm={6} md={4} lg={3}>
              <FormControl
                type="search"
                placeholder={t('Search')}
                className="dashboard__search"
                onChange={(event) => setSearchTerm(event.target.value)}
                value={searchTerm}
              />
            </Col>
          </Row>
        </Grid>
        <DashboardErrorBoundary>
          <BackupsTable searchTerm={searchTerm} />
        </DashboardErrorBoundary>
      </div>
    )
  }

  BackupsHome.propTypes = {
    userId: PropTypes.string,
  }

  return BackupsHome
}

export default BackupsHomeConnector
