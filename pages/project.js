import React from 'react'
import { t as i18n } from 'plottr_locales'
import { Nav, NavItem, Button } from 'react-bootstrap'

import Navigation from '../components/navigation'
import { EditSeries, ErrorBoundary, BookList, FileLocation, SubNav } from 'connected-components'

export default function Project() {
  const openDashboard = () => {
    // TODO
    // ipcRenderer.send('pls-open-dashboard')
    console.warn('Still need to implement "open dashboard"')
  }

  const SubNavigation = () => {
    return (
      <SubNav>
        <Nav bsStyle="pills">
          <NavItem>
            <Button bsSize="small" onClick={openDashboard}>
              {i18n('Open Dashboard')}
            </Button>
          </NavItem>
          <FileLocation />
        </Nav>
      </SubNav>
    )
  }

  return (
    <>
      <Navigation />
      <ErrorBoundary>
        <div className="series__container container-with-sub-nav">
          <SubNavigation />
          <div className="tab-body">
            <EditSeries />
            <BookList />
          </div>
        </div>
      </ErrorBoundary>
    </>
  )
}

// export async function getServerSideProps(context) {
//   return {
//     props: {},
//   }
// }
