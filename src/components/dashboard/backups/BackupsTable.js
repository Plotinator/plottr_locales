import React from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import { checkDependencies } from '../../checkDependencies'
import Button from '../../Button'
import { groupBy } from 'lodash'

const safelyDecodeURI = (str) => {
  try {
    return decodeURIComponent(str)
  } catch (error) {
    return str
  }
}

const truncateTitle = (title) => {
  if (!title) {
    return t('Untitled')
  }
  if (title.length > 80) {
    return `${title.slice(0, 80)}...`
  }
  return safelyDecodeURI(title)
}

const BackupsTableConnector = (connector) => {
  const {
    platform: {
      mpq,
      showItemInFolder,
      file: { joinPath, saveFile, doesFileExist, readFile },
      log,
      userDocumentsPath,
      pleaseOpenWindow,
      showSaveDialog,
    },
  } = connector
  checkDependencies({
    mpq,
    showItemInFolder,
    joinPath,
    saveFile,
    doesFileExist,
    readFile,
    log,
    userDocumentsPath,
    pleaseOpenWindow,
    showSaveDialog,
  })

  const BackupsTable = ({ backupFolders, searchTerm, settings }) => {
    const openInFolder = (fileURL) => {
      // mpq.push('btn_open_backup')
      showItemInFolder(fileURL)
    }

    const createOpenInFolderCallback = (folder, file) => {
      const isCloudBackup = file.storagePath
      return () => {
        const filePathPromise = isCloudBackup
          ? Promise.resolve(file.storagePath)
          : joinPath(folder.path, file)
        filePathPromise.then((filePath) => {
          const fileURL = helpers.file.isProtocolString(filePath)
            ? filePath
            : helpers.file.filePathToFileURL(filePath)
          if (!fileURL) {
            const message = `Couldn't create fileURL for backup with path: ${filePath}`
            log.error(message)
            return
          }
          openInFolder(fileURL)
        })
      }
    }

    const ensureEndsInPltr = (filePath) => {
      if (!filePath) return null

      if (!filePath.endsWith('.pltr')) {
        return `${filePath}.pltr`
      }
      return filePath
    }

    const findPathThatDoesntExist = (originalPath, index = 0) => {
      return doesFileExist(originalPath).then((exists) => {
        if (exists) {
          // add one and try again
          const newIndex = index + 1
          const newPath = index
            ? originalPath.replace(` - ${index}.pltr`, ` - ${newIndex}.pltr`)
            : originalPath.replace(`.pltr`, ` - ${newIndex}.pltr`)
          return findPathThatDoesntExist(newPath, newIndex)
        } else {
          return originalPath
        }
      })
    }

    const saveAndOpenCopy = (oldPath, oldFileName, newFileName) => {
      joinPath(oldPath, oldFileName).then((oldFullPath) => {
        readFile(oldFullPath).then((fileText) => {
          const fileJSON = JSON.parse(fileText)
          if (settings.user.defaultFolder && settings.user.defaultFolderLocation) {
            joinPath(settings.user.defaultFolderLocation, newFileName).then((newFullPath) => {
              findPathThatDoesntExist(newFullPath).then((uniquePath) => {
                // save file
                const newFileURL = helpers.file.filePathToFileURL(uniquePath)
                saveFile(newFileURL, fileJSON).then(() => {
                  pleaseOpenWindow(newFileURL)
                })
              })
            })
          } else {
            userDocumentsPath().then((docPath) => {
              const title = t('Where would you like to save this copy?')
              const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]
              showSaveDialog(filters, title, docPath).then((fileName) => {
                if (fileName) {
                  const newFilePath = ensureEndsInPltr(fileName)
                  const newFileURL = helpers.file.filePathToFileURL(newFilePath)
                  saveFile(newFileURL, fileJSON).then(() => {
                    pleaseOpenWindow(newFileURL)
                  })
                }
              })
            })
          }
        })
      })
    }

    const createMakeCopyCallback = (folder, groupName, file) => {
      const isCloudBackup = file.storagePath
      return () => {
        if (isCloudBackup) {
          // TODO
        } else {
          // make the name
          const backupText = t('Backup')
          let dateStr = makeDateString(folder.date, true)
          const newName = `${groupName} [${backupText} ${dateStr}].pltr`
          saveAndOpenCopy(folder.path, file, newName)
        }
      }
    }

    const makeDateString = (dateObj, makeShort) => {
      let dateStr = ''
      try {
        const date = dateObj instanceof Date ? dateObj : helpers.date.parseStringDate(dateObj)
        const style = makeShort ? '{date, date, monthDay}' : '{date, date, medium}'
        dateStr = t(style, { date })
      } catch (error) {
        console.error(error)
      }
      return dateStr
    }

    const fileNameFromPath = (name) => {
      if (name.includes('(start-session)-')) {
        const nameSansStart = name.replace('(start-session)-', '')
        return <div title={nameSansStart}>{t('Session Start')}</div>
      } else {
        return <div title={name}>{t('Session End')}</div>
      }
    }

    const fileNameFromStorageObject = (storageObject) => {
      if (storageObject.startOfSession) {
        return <div title={storageObject.fileName}>{t('Session Start')}</div>
      } else {
        return <div title={storageObject.fileName}>{t('Session End')}</div>
      }
    }

    const groupableName = (objOrName) => {
      if (objOrName.storagePath) {
        return objOrName.fileName
      } else {
        return objOrName.replace('(start-session)-', '').replace('.pltr', '')
      }
    }

    const renderFiles = (folder, groupName, files) => {
      // NOTE: this works because the 'start session' version always comes first
      return files.map((file, index) => {
        const isCloudBackup = file.storagePath
        const handleView = createOpenInFolderCallback(folder, file)
        const handleMakeCopy = createMakeCopyCallback(folder, groupName, file)
        return (
          <li key={index} className="list-group-item">
            <div className="dashboard__backups__item">
              {isCloudBackup ? fileNameFromStorageObject(file) : fileNameFromPath(file)}
              <Button bsSize="xs" bsStyle="success" onClick={handleMakeCopy}>
                {t('Open a Copy')}
              </Button>
              {isCloudBackup ? null : (
                <Button bsSize="xs" bsStyle="primary" onClick={handleView}>
                  {t('View in Folder')}
                </Button>
              )}
            </div>
          </li>
        )
      })
    }

    const renderProjects = (folder) => {
      // group by file name (without Session Start) to put them in "projects"
      // display each project as another column
      const groups = groupBy(folder.backups, groupableName)
      return Object.entries(groups).map(([groupName, files]) => {
        let row = null
        if (groupName?.toLowerCase().includes(searchTerm.toLowerCase())) {
          row = (
            <div key={groupName}>
              <h6>{groupName}</h6>
              <ul className="list-group horizontal">{renderFiles(folder, groupName, files)}</ul>
            </div>
          )
        }
        return row
      })
    }

    const renderBody = () => {
      return backupFolders.map((folder) => {
        let dateStr = makeDateString(folder.date, false)
        const projects = renderProjects(folder)
        if (searchTerm?.length > 1 && !projects.filter(Boolean).length) return null
        return (
          <div key={dateStr}>
            <h5>{dateStr}</h5>
            <div className="dashboard__backups__project-row">{projects}</div>
          </div>
        )
      })
    }

    let body = renderBody()
    if (searchTerm?.length > 1 && !body.filter(Boolean).length) {
      body = <h3>{t('No matches')}</h3>
    }

    return <div className="dashboard__backups__wrapper">{body}</div>
  }

  BackupsTable.propTypes = {
    searchTerm: PropTypes.string,
    backupFolders: PropTypes.array.isRequired,
    settings: PropTypes.object.isRequired,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      backupFolders: selectors.sortedBackupFoldersSelector(state.present),
      settings: selectors.appSettingsSelector(state.present),
    }))(BackupsTable)
  }

  throw new Error('Could not connect BackupsTable')
}

export default BackupsTableConnector
