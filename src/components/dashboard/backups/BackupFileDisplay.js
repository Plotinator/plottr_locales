import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'

import { t } from 'plottr_locales'
import { helpers, migrateIfNeeded, addMissingKeys } from 'pltr/v2'

import { checkDependencies } from '../../checkDependencies'
import Button from '../../Button'

const BackupFileDisplayConnector = (connector) => {
  const {
    platform: {
      mpq,
      file: { joinPath, saveFile, doesFileExist, readFile },
      log,
      userDocumentsPath,
      addToKnownFilesAndOpen,
      showSaveDialog,
      appVersion,
      duplicateFile,
    },
  } = connector
  checkDependencies({
    mpq,
    joinPath,
    saveFile,
    doesFileExist,
    readFile,
    log,
    userDocumentsPath,
    addToKnownFilesAndOpen,
    showSaveDialog,
    appVersion,
    duplicateFile,
  })

  const BackupFileDisplay = ({
    folder,
    groupName,
    file,
    folderDate,
    settings,
    hasCurrentProLicense,
  }) => {
    const [showActions, setShowActions] = useState(false)

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

    const migrateSaveAndOpen = (json, oldUrl, newFileURL) => {
      return appVersion().then((version) => {
        migrateIfNeeded(version, json, oldUrl, null, (err, _didMigrate, migratedState) => {
          if (err) {
            log.error(err)
          } else {
            console.log('addMissingKeys(migratedState)', addMissingKeys(migratedState))
            saveFile(newFileURL, addMissingKeys(migratedState)).then(() => {
              addToKnownFilesAndOpen(newFileURL, true)
            })
          }
        })
      })
    }

    const saveAndOpenCopy = (oldPath, oldFileName, newFileName) => {
      mpq.push('btn_open_backup')
      joinPath(oldPath, oldFileName).then((oldFullPath) => {
        readFile(oldFullPath).then((fileText) => {
          const fileJSON = JSON.parse(fileText)
          if (settings.user.defaultFolder && settings.user.defaultFolderLocation) {
            joinPath(settings.user.defaultFolderLocation, newFileName).then((newFullPath) => {
              findPathThatDoesntExist(newFullPath).then((uniquePath) => {
                const newFileURL = helpers.file.filePathToFileURL(uniquePath)
                migrateSaveAndOpen(fileJSON, oldFullPath, newFileURL)
              })
            })
          } else {
            userDocumentsPath().then((docPath) => {
              joinPath(docPath, newFileName).then((newFullPath) => {
                const title = t('Where would you like to save this copy?')
                const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]
                showSaveDialog(filters, title, newFullPath).then((fileName) => {
                  if (fileName) {
                    const newFilePath = helpers.file.ensureEndsInPltr(fileName)
                    const newFileURL = helpers.file.filePathToFileURL(newFilePath)
                    migrateSaveAndOpen(fileJSON, oldFullPath, newFileURL)
                  }
                })
              })
            })
          }
        })
      })
    }

    const handleMakeCopy = () => {
      const isCloudBackup = file.storagePath
      // make the name
      const backupText = t('Backup')
      const extension = isCloudBackup ? '' : '.pltr'
      const newName = `${groupName} [${backupText} ${folderDate}]${extension}`
      if (isCloudBackup) {
        const fileUrl = helpers.file.fileIdToPlottrCloudFileURL(file.fileId)
        duplicateFile(fileUrl, newName)
      } else {
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

    const renderFileDetails = (file) => {
      const isCloudBackup = file.storagePath
      if (isCloudBackup) {
        const date = helpers.time.convertFromNanosAndSeconds(file.lastModified)
        return (
          <div className="dashboard__backups__item-details">
            <small>
              {file.lastModified ? t('Last Edited: {date, time, short}', { date }) : ''}
            </small>
            <small className="accented-text">{t('Saved in the cloud')}</small>
          </div>
        )
      } else {
        return (
          <div className="dashboard__backups__item-details">
            <small>
              {t('Last Edited: {date, time, short}', { date: new Date(file.lastEdited ?? 0) })}
            </small>
            <small>{byteSize(file.size ?? 0)}</small>
          </div>
        )
      }
    }

    const byteSize = (n) => {
      const k = n > 0 ? Math.floor(Math.log2(n) / 10) : 0
      const rank = (k > 0 ? 'KMGT'[k - 1] : '') + 'b'
      const count = (n / Math.pow(1000, k)).toFixed(1)
      return `${count.toLocaleString()} ${rank}`
    }

    const isCloudBackup = file.storagePath
    return (
      <div
        className="dashboard__backups__item"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {!hasCurrentProLicense || (hasCurrentProLicense && isCloudBackup) ? (
          <div className="dashboard__backups__item-actions">
            <div className={cx('dashboard__backups__item-button', { active: showActions })}>
              <Button bsSize="xs" bsStyle="success" onClick={handleMakeCopy}>
                {t('Open a Copy')}
              </Button>
            </div>
          </div>
        ) : null}
        <div>
          <div className="dashboard__backups__item-title">
            {isCloudBackup ? fileNameFromStorageObject(file) : fileNameFromPath(file)}
          </div>
          {renderFileDetails(file)}
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
    hasCurrentProLicense: PropTypes.bool,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      settings: selectors.appSettingsSelector(state.present),
      hasCurrentProLicense: selectors.hasProSelector(state.present),
    }))(BackupFileDisplay)
  }

  throw new Error('Could not connect BackupFileDisplay')
}

export default BackupFileDisplayConnector
