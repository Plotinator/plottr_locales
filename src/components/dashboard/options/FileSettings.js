import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'

import HelpBlock from '../../HelpBlock'
import Button from '../../Button'
import Switch from '../../Switch'
import { checkDependencies } from '../../checkDependencies'

const FileSettingsConnector = (connector) => {
  const {
    platform: {
      settings: { saveAppSetting },
      file: { joinPath },
      showOpenDialog,
      showItemInFolder,
      userDocumentsPath,
    },
  } = connector
  checkDependencies({
    saveAppSetting,
    showOpenDialog,
    showItemInFolder,
    userDocumentsPath,
    joinPath,
  })

  const FileSettings = ({ settings }) => {
    const [defaultPath, setDefaultPath] = useState('')

    useEffect(() => {
      userDocumentsPath().then((docPath) => {
        joinPath(docPath, 'Plottr').then((filePath) => setDefaultPath(filePath))
      })
    }, [])

    useEffect(() => {
      // we got the defaultPath, the defaultFolder setting is on, but no location set
      if (defaultPath && settings.user.defaultFolder && !settings.user.defaultFolderLocation) {
        saveAppSetting('user.defaultFolderLocation', folderPath())
      }
    }, [settings, defaultPath])

    const displayPath = (pathStr) => {
      pathStr = pathStr[0] == '/' ? `${pathStr.substring(1)}` : pathStr
      return pathStr.replace(/\\/g, ' » ').replace(/\//g, ' » ')
    }

    const onChangeDefaultFolderLocation = () => {
      const title = t('Choose your default folder location')
      const properties = ['openDirectory', 'createDirectory']
      showOpenDialog(title, [], properties, folderPath()).then((files) => {
        if (files && files.length) {
          let folderPath = files[0]
          saveAppSetting('user.defaultFolderLocation', folderPath)
        }
      })
    }

    const folderPath = () => {
      return settings.user.defaultFolderLocation || defaultPath
    }

    return (
      <>
        <div className="dashboard__options__item">
          <h4>{t('Default Folder')}</h4>
          <Switch
            isOn={!!settings.user.defaultFolder}
            handleToggle={() => {
              saveAppSetting('user.defaultFolder', !settings.user.defaultFolder)
              // set a default for the defaultFolderLocation immediately
              // as it's toggled to on
              if (!settings.user.defaultFolder && !settings.user.defaultFolderLocation) {
                saveAppSetting('user.defaultFolderLocation', folderPath())
              }
            }}
            labelText={
              settings.user.defaultFolder
                ? t('Your project files will be saved to the folder chosen below')
                : t('Your project files will be saved to a folder chosen manually')
            }
          />
        </div>
        {settings.user.defaultFolder ? (
          <div className="dashboard__options__item">
            <h4>{t('Default Folder Location')}</h4>
            <HelpBlock className="dashboard__options-item-help">
              {t('Folder where all your projects get created')}
            </HelpBlock>
            <p>
              <Button onClick={onChangeDefaultFolderLocation}>{t('Choose...')}</Button>
              {'  '}
              <Button bsStyle="link" onClick={() => showItemInFolder(folderPath())}>
                {displayPath(folderPath())}
              </Button>
            </p>
          </div>
        ) : null}
      </>
    )
  }

  FileSettings.propTypes = {
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
    }))(FileSettings)
  }

  throw new Error('Could not connect FileSettings')
}

export default FileSettingsConnector
