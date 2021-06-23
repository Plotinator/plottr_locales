import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Button, Navbar, Nav } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import { Beamer, BookChooser } from 'connected-components'
import cx from 'classnames'
import { AiOutlineSave } from 'react-icons/ai'

import FileChooser from './file-chooser'
import { actions } from 'pltr/v2'
import { basePath } from '../lib/basePath'
import { logOut, onSessionChange, newFile } from '../lib/firebase'

const trialMode = true // TODO
const isDev = process.env.NODE_ENV == 'development'

function Navigation({
  userId,
  currentView,
  changeCurrentView,
  darkMode,
  selectedFile,
  files,
  selectFile,
  withFullFileState,
}) {
  const [saving, setSaving] = useState(false)
  const [fileName, setFileName] = useState('')

  useEffect(() => {
    const path = basePath()
    if (path !== '' && path !== currentView) {
      changeCurrentView(path)
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

  const renderTrialLinks = () => {
    if (!trialMode || isDev) return null

    return null
  }

  const changeTo = (newLocation) => () => {
    changeCurrentView(newLocation)
  }

  return (
    <Navbar className="project-nav" fluid inverse={darkMode}>
      <Nav bsStyle="pills">
        <BookChooser />
        <li role="presentation" className={cx({ active: currentView === 'project' })}>
          <Link role="button" to="/project" onClick={changeTo('project')}>
            {i18n('Project')}
          </Link>
        </li>
        <li role="presentation" className={cx({ active: currentView === 'timeline' })}>
          <Link role="button" to="/timeline" onClick={changeTo('timeline')}>
            {i18n('Timeline')}
          </Link>
        </li>
        <li role="presentation" className={cx({ active: currentView === 'outline' })}>
          <Link role="button" to="/outline" onClick={changeTo('outline')}>
            {i18n('Outline')}
          </Link>
        </li>
        <li role="presentation" className={cx({ active: currentView === 'notes' })}>
          <Link role="button" to="/notes" onClick={changeTo('notes')}>
            {i18n('Notes')}
          </Link>
        </li>
        <li role="presentation" className={cx({ active: currentView === 'characters' })}>
          <Link role="button" to="/characters" onClick={changeTo('characters')}>
            {i18n('Characters')}
          </Link>
        </li>
        <li role="presentation" className={cx({ active: currentView === 'places' })}>
          <Link role="button" to="/places" onClick={changeTo('places')}>
            {i18n('Places')}
          </Link>
        </li>
        <li role="presentation" className={cx({ active: currentView === 'tags' })}>
          <Link role="button" to="/tags" onClick={changeTo('tags')}>
            {i18n('Tags')}
          </Link>
        </li>
        <FileChooser selectedFile={selectedFile} selectFile={selectFile} files={files} />
        {!selectedFile || selectedFile.none ? (
          <div className="navbar-save-controls">
            {saving ? (
              <>
                <li role="presentation" className="file-name">
                  <input
                    type="text"
                    value={fileName}
                    onKeyDown={(event) => {
                      if (event.which === 27) {
                        setSaving(false)
                      }
                      if (event.which === 13) {
                        if (!userId) return
                        withFullFileState((state) => {
                          newFile(userId, fileName, state).then((results) => {
                            setSaving(false)
                          })
                        })
                      }
                    }}
                    onChange={(event) => {
                      setFileName(event.target.value)
                    }}
                  />
                </li>
                <li>
                  <Button
                    onClick={() => {
                      if (!userId) return
                      withFullFileState((state) => {
                        newFile(userId, fileName, state).then((results) => {
                          setSaving(false)
                        })
                      })
                    }}
                  >
                    <AiOutlineSave />
                  </Button>
                </li>
              </>
            ) : (
              <li role="presentation">
                <a
                  role="button"
                  onClick={() => {
                    setSaving(true)
                  }}
                >
                  Save new file
                </a>
              </li>
            )}
          </div>
        ) : null}
      </Nav>
      <Beamer inNavigation />
      <Navbar.Form pullRight style={{ marginRight: '15px' }}>
        <Button bsStyle="link" onClick={logOut}>
          {i18n('logout')}
        </Button>
      </Navbar.Form>
      {renderTrialLinks()}
    </Navbar>
  )
}

Navigation.propTypes = {
  userId: PropTypes.string,
  currentView: PropTypes.string.isRequired,
  changeCurrentView: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  selectedFile: PropTypes.object,
  files: PropTypes.array.isRequired,
  selectFile: PropTypes.func.isRequired,
  withFullFileState: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
  return {
    currentView: state.present.ui.currentView,
    darkMode: state.present.ui.darkMode,
  }
}

export default connect(mapStateToProps, {
  changeCurrentView: actions.ui.changeCurrentView,
  withFullFileState: actions.project.withFullFileState,
})(Navigation)
