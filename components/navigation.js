import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Button, Navbar, Nav, NavItem, Dropdown, MenuItem } from 'react-bootstrap'
import { t } from 'plottr_locales'
import { Beamer, BookChooser } from 'connected-components'
import cx from 'classnames'
import { FaRegUser } from 'react-icons/fa'
import { logOut, onSessionChange } from 'plottr_firebase'

import DashboardModal from './dashboard-modal'
import Share from './share'
import Download from './download'
import Upload from './upload'
import { actions, selectors } from 'pltr/v2'
import { basePath } from '../lib/basePath'
import { useLicenseInfo } from '../lib/store_hooks'
import { useTrialStatus } from '../lib/trialManager'

const trialMode = true // TODO
const isDev = process.env.NEXT_PUBLIC_NODE_ENV == 'development'

function Navigation({ userId, currentView, changeCurrentView, darkMode }) {
  const [dashboardView, setDashboardView] = useState(null)
  const trialInfo = useTrialStatus()
  const [_licenseInfo, licenseInfoSize] = useLicenseInfo()
  const firstTime = !licenseInfoSize && !trialInfo.started
  const trialExpired = trialInfo.expired

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
    if (firstTime || trialExpired) setDashboardView('account')
  }, [firstTime, trialExpired, dashboardView])

  useEffect(() => {
    onSessionChange((user) => {
      if (!user) {
        // window.location.href = '/login'
      } else {
        // Maybe we should go to login when the user changes too.
      }
    })
  }, [])

  const renderTrialLinks = () => {
    if (!trialMode || isDev) return null

    return null
  }

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
    if (firstTime || trialExpired) return
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
        <Navbar.Form pullRight style={{ marginRight: '15px' }}>
          <Upload />
          <Button bsStyle="link" onClick={logOut}>
            {t('logout')}
          </Button>
          <Download />
          <Share />
        </Navbar.Form>
        {renderTrialLinks()}
        <Nav pullRight className="project-nav__options">
          <NavItem>
            <Dropdown id="dashboard-dropdown-menu">
              <Dropdown.Toggle noCaret bsSize="small">
                <FaRegUser />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <MenuItem onSelect={selectAccount}>{t('Account')}</MenuItem>
                <MenuItem onSelect={selectOptions}>{t('Options')}</MenuItem>
                <MenuItem onSelect={selectFiles}>{t('Files')}</MenuItem>
                <MenuItem onSelect={selectTemplates}>{t('Templates')}</MenuItem>
                <MenuItem onSelect={selectBackups}>{t('Backups')}</MenuItem>
                <MenuItem onSelect={selectHelp}>{t('Help')}</MenuItem>
              </Dropdown.Menu>
            </Dropdown>
          </NavItem>
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
