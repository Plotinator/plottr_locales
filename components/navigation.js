import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Navbar, Nav, NavItem, Dropdown, MenuItem } from 'react-bootstrap'
import { t } from 'plottr_locales'
import { Beamer, BookChooser } from 'connected-components'
import cx from 'classnames'
import { FaRegUser } from 'react-icons/fa'
import { onSessionChange } from 'plottr_firebase'

import DashboardModal from './dashboard-modal'
import Share from './share'
import Download from './download'
import Upload from './upload'
import { actions, selectors } from 'pltr/v2'
import { basePath } from '../lib/basePath'
import { currentProject } from '../lib/currentProject'

function Navigation({ userId, currentView, changeCurrentView, darkMode }) {
  const [dashboardView, setDashboardView] = useState(currentProject() ? null : 'files')

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

  const selectAccount = () => {
    setDashboardView('account')
  }

  const selectOptions = () => {
    setDashboardView('options')
  }

  const selectFiles = () => {
    setDashboardView('files')
  }

  const selectTemplates = () => {
    setDashboardView('templates')
  }

  const selectBackups = () => {
    setDashboardView('backups')
  }

  const selectHelp = () => {
    setDashboardView('help')
  }

  const resetDashboardView = () => {
    setDashboardView(null)
  }

  const selectDashboardView = (view) => {
    setDashboardView(view)
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
          <NavItem>
            <Dropdown id="dashboard-dropdown-menu">
              <Dropdown.Toggle noCaret bsSize="small" bsStyle="link">
                <FaRegUser />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <MenuItem onSelect={selectFiles}>{t('Projects')}</MenuItem>
                <MenuItem onSelect={selectOptions}>{t('Settings')}</MenuItem>
                <MenuItem onSelect={selectAccount}>{t('Account')}</MenuItem>
                <MenuItem onSelect={selectBackups}>{t('Backups')}</MenuItem>
                <MenuItem onSelect={selectHelp}>{t('Help')}</MenuItem>
              </Dropdown.Menu>
            </Dropdown>
          </NavItem>
        </Nav>
        <Navbar.Form pullRight style={{ marginRight: '15px' }}>
          <Upload />
          <Download />
          <Share />
        </Navbar.Form>
      </Navbar>
    </>
  )
}

Navigation.propTypes = {
  userId: PropTypes.string,
  currentView: PropTypes.string.isRequired,
  changeCurrentView: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
}

function mapStateToProps(state) {
  return {
    currentView: state.present.ui.currentView,
    darkMode: state.present.ui.darkMode,
    userId: selectors.userIdSelector(state.present),
  }
}

export default connect(mapStateToProps, {
  changeCurrentView: actions.ui.changeCurrentView,
})(Navigation)
