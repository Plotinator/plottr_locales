import React, { useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { Navbar, Nav, Button } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import { Beamer, BookChooser } from 'connected-components'
import { FaKey } from 'react-icons/fa'
import Link from 'next/link'
import cx from 'classnames'

import { actions } from 'pltr/v2'
import { basePath } from '../lib/basePath'

const trialMode = true // TODO
const isDev = process.env.NODE_ENV == 'development'

function Navigation({ currentView, changeCurrentView, darkMode }) {
  useEffect(() => {
    const path = basePath()
    if (path !== '' && path !== currentView) {
      changeCurrentView(path)
    }
  }, [])

  const renderTrialLinks = () => {
    if (!trialMode || isDev) return null

    return (
      <Navbar.Form pullRight style={{ marginRight: '15px' }}>
        <Button bsStyle="link" onClick={() => console.warn('TODO: implement get a licence link')}>
          <FaKey /> {i18n('Get a License')}
        </Button>
      </Navbar.Form>
    )
  }

  return (
    <Navbar className="project-nav" fluid inverse={darkMode}>
      <Nav activeKey={currentView} bsStyle="pills">
        <BookChooser />
        <li role="presentation" className={cx({ active: currentView === 'project' })}>
          <Link href="/project">{i18n('Project')}</Link>
        </li>
        <li role="presentation" className={cx({ active: currentView === 'timeline' })}>
          <Link href="/timeline">{i18n('Timeline')}</Link>
        </li>
        <li role="presentation" className={cx({ active: currentView === 'outline' })}>
          <Link href="/outline">{i18n('Outline')}</Link>
        </li>
        <li role="presentation" className={cx({ active: currentView === 'notes' })}>
          <Link href="/notes">{i18n('Notes')}</Link>
        </li>
        <li role="presentation" className={cx({ active: currentView === 'characters' })}>
          <Link href="/characters">{i18n('Characters')}</Link>
        </li>
        <li role="presentation" className={cx({ active: currentView === 'places' })}>
          <Link href="/places">{i18n('Places')}</Link>
        </li>
        <li role="presentation" className={cx({ active: currentView === 'tags' })}>
          <Link href="/tags">{i18n('Tags')}</Link>
        </li>
      </Nav>
      <Beamer inNavigation />
      {renderTrialLinks()}
    </Navbar>
  )
}

Navigation.propTypes = {
  currentView: PropTypes.object.isRequired,
  changeCurrentView: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
}

function mapStateToProps(state) {
  return {
    currentView: state.present.ui.currentView,
    darkMode: state.present.ui.darkMode,
  }
}

export default connect(mapStateToProps, { changeCurrentView: actions.ui.changeCurrentView })(
  Navigation
)
