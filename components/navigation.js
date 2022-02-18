import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Navbar, Nav, NavItem } from 'react-bootstrap'
import { t } from 'plottr_locales'
import { Beamer, BookChooser } from 'connected-components'
import cx from 'classnames'
import { FaRegUser } from 'react-icons/fa'
import { onSessionChange } from 'wired-up-firebase'

import DashboardModal from './dashboard-modal'
import Share from './share'
import { actions, selectors } from 'pltr/v2'
import { basePath } from '../lib/basePath'
import { currentProject } from '../lib/currentProject'

function Navigation({
  userId,
  bookIds,
  currentTimeline,
  changeCurrentTimeline,
  currentView,
  changeCurrentView,
  darkMode,
  selectedFile,
}) {
  const [dashboardView, setDashboardView] = useState(currentProject() ? null : 'files')

  useEffect(() => {
    if (!selectedFile && dashboardView !== null) {
      setDashboardView('files')
    }
  }, [selectedFile])

  useEffect(() => {
    if (currentTimeline !== 'series' && bookIds.indexOf(currentTimeline) === -1) {
      changeCurrentTimeline(bookIds[0])
    }
  }, [bookIds, currentTimeline, changeCurrentTimeline])

  useEffect(() => {
    const path = basePath()
    if (path !== '' && path !== currentView) {
      changeCurrentView(path)
    }
  }, [])

  useEffect(() => {
    const listener = document.addEventListener('close-dashboard', () => {
      setDashboardView(null)
    })
    return () => {
      document.removeEventListener('close-dashboard', listener)
    }
  }, [])

  useEffect(() => {
    const listener = document.addEventListener('force-close-dashboard', () => {
      setDashboardView(null)
    })
    return () => {
      document.removeEventListener('force-close-dashboard', listener)
    }
  }, [])

  useEffect(() => {
    const listener = document.addEventListener('open-dashboard', (event) => {
      setDashboardView(event.dashboardTab)
    })
    return () => {
      document.removeEventListener('open-dashboard', listener)
    }
  }, [])

  useEffect(() => {
    onSessionChange((user) => {
      if (!user) {
        // window.location.href = '/login'
      } else {
        // Maybe we should go to login when the user changes too.
      }
    })
  }, [])

  const changeTo = (newLocation) => () => {
    changeCurrentView(newLocation)
  }

  const selectFiles = () => {
    setDashboardView('files')
  }

  const resetDashboardView = () => {
    if (selectedFile) {
      setDashboardView(null)
    }
  }

  const selectDashboardView = (view) => {
    setDashboardView(view)
  }

  if (
    bookIds &&
    currentTimeline &&
    currentTimeline !== 'series' &&
    bookIds.indexOf(currentTimeline) === -1
  ) {
    return (
      <DashboardModal
        activeView={'files'}
        setActiveView={selectDashboardView}
        closeDashboard={resetDashboardView}
        darkMode={darkMode}
      />
    )
  }

  return (
    <>
      {dashboardView ? (
        <DashboardModal
          activeView={dashboardView}
          setActiveView={selectDashboardView}
          closeDashboard={resetDashboardView}
          darkMode={darkMode}
        />
      ) : null}
      <Navbar className="project-nav" fluid inverse={darkMode}>
        <Nav bsStyle="pills">
          <BookChooser />
          <li role="presentation" className={cx({ active: currentView === 'project' })}>
            <Link role="button" to="/project" onClick={changeTo('project')}>
              {t('Project')}
            </Link>
          </li>
          <li role="presentation" className={cx({ active: currentView === 'timeline' })}>
            <Link role="button" to="/timeline" onClick={changeTo('timeline')}>
              {t('Timeline')}
            </Link>
          </li>
          <li role="presentation" className={cx({ active: currentView === 'outline' })}>
            <Link role="button" to="/outline" onClick={changeTo('outline')}>
              {t('Outline')}
            </Link>
          </li>
          <li role="presentation" className={cx({ active: currentView === 'notes' })}>
            <Link role="button" to="/notes" onClick={changeTo('notes')}>
              {t('Notes')}
            </Link>
          </li>
          <li role="presentation" className={cx({ active: currentView === 'characters' })}>
            <Link role="button" to="/characters" onClick={changeTo('characters')}>
              {t('Characters')}
            </Link>
          </li>
          <li role="presentation" className={cx({ active: currentView === 'places' })}>
            <Link role="button" to="/places" onClick={changeTo('places')}>
              {t('Places')}
            </Link>
          </li>
          <li role="presentation" className={cx({ active: currentView === 'tags' })}>
            <Link role="button" to="/tags" onClick={changeTo('tags')}>
              {t('Tags')}
            </Link>
          </li>
        </Nav>
        <Beamer inNavigation />
        <Nav pullRight className="project-nav__options">
          <NavItem onClick={selectFiles}>
            <FaRegUser />
          </NavItem>
          <Share />
        </Nav>
      </Navbar>
    </>
  )
}

Navigation.propTypes = {
  userId: PropTypes.string,
  currentView: PropTypes.string.isRequired,
  changeCurrentView: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  bookIds: PropTypes.array,
  currentTimeline: PropTypes.number,
  selectedFile: PropTypes.object,
  changeCurrentTimeline: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
  return {
    currentTimeline: selectors.currentTimelineSelector(state.present),
    bookIds: selectors.allBookIdsSelector(state.present),
    currentView: selectors.currentViewSelector(state.present),
    darkMode: selectors.isDarkModeSelector(state.present),
    userId: selectors.userIdSelector(state.present),
    selectedFile: selectors.selectedFileSelector(state.present),
  }
}

export default connect(mapStateToProps, {
  changeCurrentView: actions.ui.changeCurrentView,
  changeCurrentTimeline: actions.ui.changeCurrentTimeline,
})(Navigation)
