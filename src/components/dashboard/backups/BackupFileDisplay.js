import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import prettydate from 'pretty-date'
import cx from 'classnames'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import { checkDependencies } from '../../checkDependencies'
import Button from '../../Button'

const BackupFileDisplayConnector = (connector) => {
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

  const BackupFileDisplay = ({ folder, groupName, file, folderDate, settings }) => {
    const [showButtons, setShowButtons] = useState(false)

    const openInFolder = (fileURL) => {
      // mpq.push('btn_open_backup')
      showItemInFolder(fileURL)
    }

    const handleOpenInFolder = () => {
      const isCloudBackup = file.storagePath
      const filePathPromise = isCloudBackup
        ? Promise.resolve(file.storagePath)
        : joinPath(folder.path, file.name)
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

    const handleMakeCopy = () => {
      const isCloudBackup = file.storagePath
      if (isCloudBackup) {
        // TODO
      } else {
        // make the name
        const backupText = t('Backup')
        const newName = `${groupName} [${backupText} ${folderDate}].pltr`
        saveAndOpenCopy(folder.path, file.name, newName)
      }
    }

    const fileNameFromPath = (fileObj) => {
      const name = fileObj.name
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

    const isCloudBackup = file.storagePath
    return (
      <div
        className="dashboard__backups__item"
        onMouseEnter={() => setShowButtons(true)}
        onMouseLeave={() => setShowButtons(false)}
      >
        <div>
          <div className="dashboard__backups__item-title">
            {isCloudBackup ? fileNameFromStorageObject(file) : fileNameFromPath(file)}
            <div className={cx('dashboard__backups__item-button', { active: showButtons })}>
              <Button bsSize="xs" bsStyle="success" onClick={handleMakeCopy}>
                {t('Open a Copy')}
              </Button>
            </div>
            {isCloudBackup ? null : (
              <div className={cx('dashboard__backups__item-button', { active: showButtons })}>
                <Button bsSize="xs" bsStyle="primary" onClick={handleOpenInFolder}>
                  {t('View in Folder')}
                </Button>
              </div>
            )}
          </div>
          <div className="dashboard__backups__item-details">
            <small>
              {t('Last Edited: {date, time, short}', { date: new Date(file.lastEdited ?? 0) })}
            </small>
            <small>{t('{size} Bytes', { size: Number(file.size ?? 0).toLocaleString() })}</small>
          </div>
        </div>
      </div>
    )
  }

  BackupFileDisplay.propTypes = {
    folder: PropTypes.object.isRequired,
    groupName: PropTypes.string.isRequired,
    file: PropTypes.object.isRequired,
    folderDate: PropTypes.string,
    settings: PropTypes.object.isRequired,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      settings: selectors.appSettingsSelector(state.present),
    }))(BackupFileDisplay)
  }

  throw new Error('Could not connect BackupFileDisplay')
}

export default BackupFileDisplayConnector
