import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { isObject } from 'lodash'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import UnconnectedNewProjectInputModal from '../../dialogs/NewProjectInputModal'
import UnconnectedNewFiles from './NewFiles'
import UnconnectedRecentFiles from './RecentFiles'
import UnconnectedTemplatePicker from '../../templates/TemplatePicker'

import { checkDependencies } from '../../checkDependencies'

const FilesHomeConnector = (connector) => {
  const {
    platform: {
      file: { createNew, createFromSnowflake, createFromScrivener },
      log,
      showErrorBox,
      showOpenDialog,
      showSaveDialog,
      userDocumentsPath,
      mpq,
    },
  } = connector
  checkDependencies({
    createNew,
    createFromSnowflake,
    createFromScrivener,
    log,
    showErrorBox,
    showOpenDialog,
    showSaveDialog,
    userDocumentsPath,
    mpq,
  })

  const NewFiles = UnconnectedNewFiles(connector)
  const RecentFiles = UnconnectedRecentFiles(connector)
  const TemplatePicker = UnconnectedTemplatePicker(connector)
  const NewProjectInputModal = UnconnectedNewProjectInputModal(connector)

  function snowflakeImportDialog(errorActions) {
    const title = t('Choose your Snowflake Pro file')
    const filters = [{ name: 'Snowflake Pro file', extensions: ['snowXML'] }]
    const properties = ['openFile']
    return showOpenDialog(title, filters, properties).then((files) => {
      if (files && files[0]) {
        if (files[0].toLowerCase().includes('.snowxml')) {
          return files[0]
        } else {
          errorActions.importError('Wrong file format')
          return null
        }
      }
      return null
    })
  }

  function scrivenerImportDialog(errorActions) {
    const title = t('Choose your Scrivener project')
    const filters = [{ name: t('Scrivener file') }]
    const properties = ['openFile', 'openDirectory']
    return showOpenDialog(title, filters, properties).then((files) => {
      if (files && files[0]) {
        if (files[0].toLowerCase().includes('.scriv')) {
          return files[0]
        } else {
          errorActions.importError(t('Wrong file format'))
          return null
        }
      }
      return null
    })
  }

  function savePlottrProjectDialog() {
    const title = t('Choose where to save this file on your computer')
    const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]
    return userDocumentsPath().then((docPath) => {
      return showSaveDialog(filters, title, docPath).then((fileName) => {
        if (fileName) {
          return helpers.file.ensureEndsInPltr(fileName)
        }
        return Promise.resolve()
      })
    })
  }

  const FilesHome = ({
    errorActions,
    importActions,
    isOnWeb,
    isLoggedIn,
    projectActions,
    isInOfflineMode,
    settings,
  }) => {
    const [view, setView] = useState('recent')

    const createFromSnowflakeImport = () => {
      if (isInOfflineMode) return

      mpq.push('btn_create_from_import', { type: 'snowflake' })
      try {
        snowflakeImportDialog(errorActions).then((importedPath) => {
          if (importedPath && typeof importedPath == 'string') {
            createFromSnowflake(importedPath)
          } else if (importedPath && importedPath.error) {
            throw new Error(t('Wrong file format'))
          }
        })
      } catch (error) {
        if (error) {
          log.error(error)
          showErrorBox(t('Error'), t('There was an error doing that. Try again'))
        }
      }
    }

    const createFromScrivenerImport = () => {
      if (isInOfflineMode) return

      mpq.push('btn_create_from_import', { type: 'scrivener' })
      try {
        scrivenerImportDialog(errorActions).then((importedPath) => {
          if (importedPath && typeof importedPath == 'string') {
            createFromScrivener(importedPath)
            importActions.startScrivenerImporter()
          } else if (importedPath && importedPath.error) {
            throw new Error(importedPath.error)
          }
        })
      } catch (error) {
        if (error) {
          log.error(error)
          showErrorBox(t('Error'), t('There was an error doing that. Try again'))
        }
      }
    }

    const handleCreateNewProject = (template) => {
      if (isInOfflineMode) return

      if (settings.user.defaultFolder && settings.user.defaultFolderLocation) {
        if (isObject(template)) {
          mpq.push('btn_create_with_template', { template_name: template.name })
          projectActions.startCreatingNewProject(template)
          setView('recent')
        } else {
          projectActions.startCreatingNewProject()
        }
      } else {
        if (isOnWeb || isLoggedIn) {
          projectActions.startCreatingNewProject()
        } else {
          savePlottrProjectDialog().then((newFilePath) => {
            if (newFilePath) {
              let templateObj = isObject(template) ? template : null
              createNew(templateObj, newFilePath)
              setView('recent')
            }
          })
        }
      }
    }

    let body = null
    switch (view) {
      case 'templates':
        body = (
          <TemplatePicker
            newProject
            modal={false}
            types={['custom', 'project', 'plotlines']}
            onChooseTemplate={handleCreateNewProject}
            showCancelButton
            close={() => setView('recent')}
            confirmButtonText={t('Create New Project')}
          />
        )
        break
      case 'import':
        body = null
        break
      default:
        body = <RecentFiles />
        break
    }

    return (
      <div className="dashboard__files">
        <NewProjectInputModal />
        <NewFiles
          activeView={view}
          toggleView={(val) => {
            if (!isInOfflineMode) {
              setView(val == view ? 'recent' : val)
            }
          }}
          doSnowflakeImport={createFromSnowflakeImport}
          doScrivenerImport={createFromScrivenerImport}
          isOnWeb={isOnWeb}
          doCreateNewProject={handleCreateNewProject}
          isInOfflineMode={isInOfflineMode}
        />
        {body}
      </div>
    )
  }

  FilesHome.propTypes = {
    errorActions: PropTypes.object,
    importActions: PropTypes.object,
    projectActions: PropTypes.object,
    isOnWeb: PropTypes.bool,
    isLoggedIn: PropTypes.bool,
    isInOfflineMode: PropTypes.bool,
    settings: PropTypes.object.isRequired,
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector

  const ErrorActions = actions.error
  const AppStateActions = actions.applicationState
  const ProjectActions = actions.project

  checkDependencies({ redux, actions, selectors })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => ({
        isLoggedIn: selectors.isLoggedInSelector(state),
        isOnWeb: selectors.isOnWebSelector(state),
        isInOfflineMode: selectors.isInOfflineModeSelector(state),
        settings: selectors.appSettingsSelector(state),
      }),
      (dispatch) => {
        return {
          errorActions: bindActionCreators(ErrorActions, dispatch),
          importActions: bindActionCreators(AppStateActions, dispatch),
          projectActions: bindActionCreators(ProjectActions, dispatch),
        }
      }
    )(FilesHome)
  }

  throw new Error('Could not connect FilesHome')
}

export default FilesHomeConnector
