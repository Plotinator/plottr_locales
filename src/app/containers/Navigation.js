import React, { useEffect, useCallback } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { FaRegUser } from '@react-icons/all-files/fa/FaRegUser'
import { FaKey } from '@react-icons/all-files/fa/FaKey'
import { FaSearch } from '@react-icons/all-files/fa/FaSearch'

import { t } from 'plottr_locales'
import { Navbar, NavItem, Nav, Beamer, BookChooser, Button } from 'plottr_components'
import { selectors, actions } from 'wired-up-pltr'

import DashboardModal from './DashboardModal'
import OfflineBanner from '../components/OfflineBanner'
import { makeMainProcessClient } from '../mainProcessClient'

const { openBuyWindow } = makeMainProcessClient()

const Navigation = ({
  isInTrialMode,
  darkMode,
  currentView,
  dashboardView,
  changeCurrentView,
  clickOnDom,
  appIsBusyWithWork,
  openSearch,
  setDashboardModalView,
}) => {
  useEffect(() => {
    const openListener = document.addEventListener('open-dashboard', () => {
      setDashboardModalView('files')
    })
    const closeListener = document.addEventListener('close-dashboard', () => {
      setDashboardModalView(null)
    })
    return () => {
      // @ts-ignore
      document.removeEventListener('open-dashboard', openListener)
      // @ts-ignore
      document.removeEventListener('close-dashboard', closeListener)
    }
  }, [])

  const handleSelect = useCallback((selectedKey) => {
    changeCurrentView(selectedKey)
  }, [])

  const TrialLinks = () => {
    if (!isInTrialMode) return null

    return (
      <Button onClick={() => openBuyWindow()} style={{ marginRight: 5 }}>
        <FaKey /> {t('Get a License')}
      </Button>
    )
  }

  const openDashboard = () => {
    setDashboardModalView('files')
  }

  const resetDashboardView = useCallback(() => {
    setDashboardModalView(null)
  }, [setDashboardModalView])

  const selectDashboardView = (view) => {
    setDashboardModalView(view)
  }

  const renderSaveIndicator = () => {
    // Removed because it's too distracting as it stands.
    return null
  }

  return (
    <>
      {dashboardView ? (
        <DashboardModal
          activeView={dashboardView}
          setActiveView={selectDashboardView}
          closeDashboard={resetDashboardView}
        />
      ) : null}
      <OfflineBanner />
      <Navbar
        onClick={(event) => {
          clickOnDom(event.clientX, event.clientY)
        }}
        className="project-nav"
        fluid
        inverse={darkMode}
      >
        <Nav onSelect={handleSelect} activeKey={currentView} bsStyle="pills">
          <BookChooser />
          <NavItem eventKey="project">{t('Project')}</NavItem>
          <NavItem eventKey="timeline">{t('Timeline')}</NavItem>
          <NavItem eventKey="outline">{t('Outline')}</NavItem>
          <NavItem eventKey="notes">{t('Notes')}</NavItem>
          <NavItem eventKey="characters">{t('Characters')}</NavItem>
          <NavItem eventKey="places">{t('Places')}</NavItem>
          <NavItem eventKey="tags">{t('Tags')}</NavItem>
        </Nav>
        <Navbar.Form pullRight className="dashboard__navbar-form">
          {renderSaveIndicator()}
          <Button onClick={openSearch} style={{ marginRight: '5px' }}>
            <FaSearch /> {t('Search')}
          </Button>
          <TrialLinks />
          <Button onClick={openDashboard}>
            <FaRegUser /> {t('Dashboard')}
          </Button>
          <Beamer inNavigation />
        </Navbar.Form>
      </Navbar>
    </>
  )
}

Navigation.propTypes = {
  isInTrialMode: PropTypes.bool,
  currentView: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
  dashboardView: PropTypes.string,
  changeCurrentView: PropTypes.func.isRequired,
  forceProjectDashboard: PropTypes.bool,
  appIsBusyWithWork: PropTypes.bool,
  clickOnDom: PropTypes.func.isRequired,
  openSearch: PropTypes.func.isRequired,
  setDashboardModalView: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
  return {
    isInTrialMode: selectors.isInTrialModeSelector(state),
    currentView: selectors.currentViewSelector(state),
    darkMode: selectors.isDarkModeSelector(state),
    appIsBusyWithWork: selectors.busyWithWorkThatPreventsQuittingSelector(state),
    dashboardView: selectors.dashboardModalViewSelector(state),
  }
}

export default connect(mapStateToProps, {
  changeCurrentView: actions.ui.changeCurrentView,
  clickOnDom: actions.domEvents.clickOnDom,
  openSearch: actions.ui.openSearch,
  setDashboardModalView: actions.ui.setDashboardModalView,
})(Navigation)
