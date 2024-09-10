import React, { useState, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { isObject } from 'lodash'

import { selectors, actions } from 'wired-up-pltr'
import { t } from 'plottr_locales'
import { helpers } from 'pltr'

import NewProjectInputModal from '../../dialogs/NewProjectInputModal'
import NewFiles from './NewFiles'
import RecentFiles from './RecentFiles'
import TemplatePicker from '../../templates/TemplatePicker'
import { PlottrComponentsContext } from '../../../connections/pltrContext'

function snowflakeImportDialog(errorActions, userFilePickerDefaultFolder, showOpenDialog) {
  const title = t('Choose your Snowflake Pro file')
  const filters = [{ name: 'Snowflake Pro file', extensions: ['snowXML'] }]
  const properties = ['openFile']
  return userFilePickerDefaultFolder().then((defaultPath) => {
    return showOpenDialog(title, filters, properties, defaultPath).then((files) => {
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
  })
}

function scrivenerImportDialog(errorActions, userFilePickerDefaultFolder, showOpenDialog) {
  const title = t('Choose your Scrivener project')
  const filters = [{ name: t('Scrivener file') }]
  const properties = ['openFile', 'openDirectory']
  return userFilePickerDefaultFolder().then((defaultPath) => {
    return showOpenDialog(title, filters, properties, defaultPath).then((files) => {
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
  })
}

function wordImportDialog(errorActions, userFilePickerDefaultFolder, showOpenDialog) {
  const title = t('Choose your Word file')
  const filters = [{ name: 'Word Pro file', extensions: ['docx'] }]
  const properties = ['openFile']
  return userFilePickerDefaultFolder().then((defaultPath) => {
    return showOpenDialog(title, filters, properties, defaultPath).then((files) => {
      if (files && files[0]) {
        if (files[0].toLowerCase().includes('.docx')) {
          return files[0]
        } else {
          errorActions.importError('Wrong file format')
          return null
        }
      }
      return null
    })
  })
}

function savePlottrProjectDialog(userFilePickerDefaultFolder, showSaveDialog) {
  const title = t('Choose where to save this file on your computer')
  const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]
  return userFilePickerDefaultFolder().then((docPath) => {
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
  isInProMode,
  projectActions,
  isInOfflineMode,
  settings,
}) => {
  const {
    platform: {
      file: { createNew, createFromSnowflake, createFromScrivener, createFromWord },
      log,
      showErrorBox,
      mpq,
      userFilePickerDefaultFolder,
      showOpenDialog,
      showSaveDialog,
      errorReporter: { getInstance },
    },
  } = useContext(PlottrComponentsContext)

  const [view, setView] = useState('recent')

  const createFromSnowflakeImport = () => {
    if (isInOfflineMode) return

    mpq.push('btn_create_from_import', { type: 'snowflake' })
    try {
      snowflakeImportDialog(errorActions, userFilePickerDefaultFolder, showOpenDialog).then(
        (importedPath) => {
          if (importedPath && typeof importedPath == 'string') {
            createFromSnowflake(importedPath)
          } else if (importedPath && importedPath.error) {
            throw new Error(t('Wrong file format'))
          }
        }
      )
    } catch (error) {
      if (error) {
        getInstance().then((errorReporter) => {
          errorReporter.error('Error importing from Snowflake', error)
        })
        showErrorBox(t('Error'), t('There was an error doing that. Try again'))
      }
    }
  }

  const createFromScrivenerImport = () => {
    if (isInOfflineMode) return

    mpq.push('btn_create_from_import', { type: 'scrivener' })
    try {
      scrivenerImportDialog(errorActions, userFilePickerDefaultFolder, showOpenDialog).then(
        (importedPath) => {
          if (importedPath && typeof importedPath == 'string') {
            createFromScrivener(importedPath)
            importActions.startScrivenerImporter()
          } else if (importedPath && importedPath.error) {
            throw new Error(importedPath.error)
          }
        }
      )
    } catch (error) {
      if (error) {
        getInstance().then((errorReporter) => {
          errorReporter.error('Error importing from Scrivener', error)
        })
        showErrorBox(t('Error'), t('There was an error doing that. Try again'))
      }
    }
  }

  const createFromWordImport = () => {
    if (isInOfflineMode) return

    mpq.push('btn_create_from_import', { type: 'word' })
    try {
      wordImportDialog(errorActions, userFilePickerDefaultFolder, showOpenDialog).then(
        (importedPath) => {
          if (importedPath && typeof importedPath == 'string') {
            createFromWord(importedPath)
            // TODO: importActions.startWordImporter()
          } else if (importedPath && importedPath.error) {
            throw new Error(importedPath.error)
          }
        }
      )
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
        // @ts-ignore
        mpq.push('btn_create_with_template', { template_name: template?.name })
        projectActions.startCreatingNewProject(template)
        setView('recent')
      } else {
        projectActions.startCreatingNewProject()
      }
    } else {
      if (isOnWeb || isInProMode) {
        if (isObject(template)) {
          projectActions.startCreatingNewProject(template)
        } else {
          projectActions.startCreatingNewProject()
        }
      } else {
        savePlottrProjectDialog(userFilePickerDefaultFolder, showSaveDialog).then((newFilePath) => {
          if (newFilePath) {
            if (newFilePath.startsWith(settings.user.backupLocation)) {
              showErrorBox(
                t('Error'),
                t('Please choose a destination other than your backup folder')
              )
            } else {
              let templateObj = isObject(template) ? template : null
              createNew(templateObj, newFilePath)
              setView('recent')
            }
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
        doWordImport={createFromWordImport}
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
  isInProMode: PropTypes.bool,
  isInOfflineMode: PropTypes.bool,
  settings: PropTypes.object.isRequired,
}

const ErrorActions = actions.error
const AppStateActions = actions.applicationState
const ProjectActions = actions.project

const mapStateToProps = (state) => ({
  isInProMode: selectors.isLoggedIntoProWithActiveLicenseSelector(state),
  isOnWeb: selectors.isOnWebSelector(state),
  isInOfflineMode: selectors.isInOfflineModeSelector(state),
  settings: selectors.appSettingsSelector(state),
})

export default connect(mapStateToProps, (dispatch) => {
  return {
    errorActions: bindActionCreators(ErrorActions, dispatch),
    importActions: bindActionCreators(AppStateActions, dispatch),
    projectActions: bindActionCreators(ProjectActions, dispatch),
  }
})(FilesHome)
