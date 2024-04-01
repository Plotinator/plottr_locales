import React, { useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import HelpBlock from '../../HelpBlock'
import Button from '../../Button'
import Switch from '../../Switch'
import UnconnectedBackupOptions from './BackupOptions'
import { checkDependencies } from '../../checkDependencies'
import Alert from '../../Alert'

const BackupSettingsConnector = (connector) => {
  const {
    platform: {
      showItemInFolder,
      defaultBackupLocation,
      showOpenDialog,
      os,
      userDocumentsPath,
      settings: { saveAppSetting },
      file: { joinPath, filePathAsArray, directoryIsWritable },
      showErrorBox,
    },
  } = connector
  checkDependencies({
    showItemInFolder,
    defaultBackupLocation,
    showOpenDialog,
    os,
    saveAppSetting,
    joinPath,
    userDocumentsPath,
    filePathAsArray,
    showErrorBox,
    directoryIsWritable,
  })

  const BackupOptions = UnconnectedBackupOptions(connector)

  const BackupSettings = ({ isLoggedIntoPro, settings, newDefault }) => {
    const [defaultBackupPath, setDefaultBackupPath] = useState('')
    const [displayPath, setDisplayPath] = useState('')

    useEffect(() => {
      // right now newDefault only gets set during the Settings Wizard (the first time a user uses Plottr)
      // that makes it so current users have no change
      // but new users have a friendlier backups folder by default
      if (newDefault) {
        userDocumentsPath().then((docPath) =>
          joinPath(docPath, 'Plottr Backups').then(setDefaultBackupPath)
        )
      } else {
        defaultBackupLocation().then(setDefaultBackupPath)
      }
    }, [])

    useEffect(() => {
      // in the Settings Wizard (newDefault is true), the defaultBackupPath has resolved, and the backupLocation is still the default
      if (newDefault && defaultBackupPath && settings.user.backupLocation === 'default') {
        saveAppSetting('user.backupLocation', backupFolderPath())
      }
    }, [newDefault, settings, defaultBackupPath])

    useEffect(() => {
      createDisplayPath(backupFolderPath()).then(setDisplayPath)
    }, [defaultBackupPath, settings.user.backupLocation])

    const osIsUnknown = os() === 'unknown'

    const onChangeBackupLocation = () => {
      const title = t('Choose your backup location')
      const properties = ['openDirectory', 'createDirectory']
      showOpenDialog(title, [], properties, backupFolderPath()).then((files) => {
        if (files && files.length) {
          const folderPath = files[0]
          if (
            !helpers.file.neitherPathContainsTheOther(
              folderPath,
              settings.user.defaultFolderLocation
            )
          ) {
            showErrorBox(
              t('Invalid backup location'),
              t('Please store your backups in a different location to your default folder')
            )
          } else {
            directoryIsWritable(folderPath)
              .then((isWritable) => {
                if (isWritable) {
                  return saveAppSetting('user.backupLocation', folderPath)
                } else {
                  return showErrorBox(
                    t('Invalid default folder location'),
                    t("Plottr can't write to that directory.  Please choose another")
                  ).catch((_error) => {
                    // Ignore
                  })
                }
              })
              .catch((error) => {
                return showErrorBox(
                  t('Something went wrong'),
                  t('Plottr ran into an error saving that setting')
                )
              })
          }
        }
      })
    }

    // show if:
    // - not web
    // - not Pro, unless Pro & localBackups
    const showBackupLocation = () => {
      return (!osIsUnknown && !isLoggedIntoPro) || (!osIsUnknown && settings.user.localBackups)
    }

    const showRestoreButton = () => {
      return (
        (newDefault && settings.user.backupLocation !== defaultBackupPath) ||
        (!newDefault && settings.user.backupLocation !== 'default')
      )
    }

    const createDisplayPath = (pathStr) => {
      return filePathAsArray(pathStr).then((pathArr) => {
        if (pathArr[0] == '') pathArr.shift()
        return pathArr.join(' » ')
      })
    }

    const backupFolderPath = () => {
      return !settings.user.backupLocation || settings.user.backupLocation === 'default'
        ? defaultBackupPath
        : settings.user.backupLocation
    }

    return (
      <>
        <div className="dashboard__options__item">
          <h4>{t('Save Backups')}</h4>
          <Switch
            isOn={!!settings.backup}
            handleToggle={() => saveAppSetting('backup', !settings.backup)}
            labelText={t('Automatically save daily backups')}
          />
        </div>
        {!osIsUnknown && isLoggedIntoPro ? (
          <div className="dashboard__options__item">
            <h4>{t('Also save backups on this device')}</h4>
            <Switch
              isOn={!!settings.user.localBackups}
              handleToggle={() => saveAppSetting('user.localBackups', !settings.user.localBackups)}
              labelText={t('Save backups to this device as well as in the cloud')}
            />
          </div>
        ) : null}
        {showBackupLocation() ? (
          <>
            <div className="dashboard__options__item">
              <BackupOptions />
            </div>
            <div className="dashboard__options__item">
              <h4>{t('Backup Location')}</h4>
              <HelpBlock className="dashboard__options-item-help">
                {t('Folder where backups are stored')}
              </HelpBlock>
              <p>
                <Button onClick={onChangeBackupLocation}>{t('Choose...')}</Button>
                {'  '}
                <Button bsStyle="link" onClick={() => showItemInFolder(backupFolderPath())}>
                  {displayPath}
                </Button>
              </p>
              {showRestoreButton() ? (
                <Button onClick={() => saveAppSetting('user.backupLocation', 'default')}>
                  {t('Restore Default')}
                </Button>
              ) : null}
              <Alert bsStyle="danger" style={{ maxWidth: 'max-content', marginTop: '16px' }}>
                {t('Backups are read-only and can only be copied, not edited')}
              </Alert>
            </div>
          </>
        ) : null}
      </>
    )
  }

  BackupSettings.propTypes = {
    isLoggedIntoPro: PropTypes.bool,
    settings: PropTypes.object.isRequired,
    shouldBeInPro: PropTypes.bool,
    newDefault: PropTypes.bool,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => {
      return {
        isLoggedIntoPro: selectors.isLoggedIntoProWithActiveLicenseSelector(state),
        settings: selectors.appSettingsSelector(state),
        shouldBeInPro: selectors.shouldBeInProSelector(state),
      }
    })(BackupSettings)
  }

  throw new Error('Could not connect BackupSettings')
}

export default BackupSettingsConnector
