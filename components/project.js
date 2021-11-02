import React from 'react'

import { EditSeries, ErrorBoundary, BookList, SubNav } from 'connected-components'
import { Nav, NavItem, Button } from 'react-bootstrap'
import Download from './download'
import Share from './share'

export default function Project() {
  const SubNavigation = () => {
    return (
      <SubNav>
        <Nav bsStyle="pills">
          <Download />
          <Share />
        </Nav>
      </SubNav>
    )
  }
  return (
    <ErrorBoundary>
      <div className="series__container container-with-sub-nav">
        <SubNavigation />
        <div className="tab-body">
          <EditSeries />
          <BookList />
        </div>
      </div>
    </ErrorBoundary>
  )
}
