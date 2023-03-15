import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import { IoIosDocument } from 'react-icons/io'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import { checkDependencies } from '../../checkDependencies'
import Button from '../../Button'
import { groupBy, replace } from 'lodash'

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
      file: { joinPath },
      log,
    },
  } = connector
  checkDependencies({ mpq, showItemInFolder, joinPath, log })

  const BackupsTable = ({ computeFolders, searchTerm }) => {
    const [folders, setFolders] = useState([])

    useEffect(() => {
      setFolders(computeFolders(searchTerm, null))
    }, [searchTerm, setFolders, computeFolders])

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

    const fileNameFromPath = (name) => {
      const nameSansStart = name.replace('(start-session)-', '')
      return <p title={nameSansStart}>{truncateTitle(nameSansStart)}</p>
    }

    const fileNameFromStorageObject = (storageObject) => {
      return <p title={storageObject.fileName}>{truncateTitle(storageObject.fileName)}</p>
    }

    const groupableName = (objOrName) => {
      if (objOrName.storagePath) {
        return objOrName.fileName
      } else {
        return objOrName.replace('(start-session)-', '').replace('.pltr', '')
      }
    }

    const renderFiles = (folder, files) => {
      // NOTE: this works because the 'start session' version always comes first
      const renderedFiles = files.map((file, index) => {
        const isCloudBackup = file.storagePath
        const handleView = createOpenInFolderCallback(folder, file)
        return (
          <td key={index}>
            <div>
              {isCloudBackup ? fileNameFromStorageObject(file) : fileNameFromPath(file)}
              <Button bsSize="xs" bsStyle="primary">
                {t('Make a Copy')}
              </Button>
              <Button bsSize="xs" bsStyle="success" onClick={handleView}>
                {t('View in Folder')}
              </Button>
            </div>
          </td>
        )
      })
      if (renderedFiles.length > 1) {
        return renderedFiles
      } else if (renderedFiles.length == 1) {
        return [...renderedFiles, <td key="blank"></td>]
      } else {
        return [<td key="blank-1"></td>, <td key="blank-2"></td>]
      }
    }

    const renderProjects = (folder) => {
      // group by file name (without Session Start) to put them in "projects"
      // display each project as another column
      const groups = groupBy(folder.backups, groupableName)
      return Object.keys(groups).map((groupName) => {
        const files = groups[groupName]
        let row = null
        if (groupName?.toLowerCase().includes(searchTerm.toLowerCase())) {
          row = (
            <tr>
              <td></td>
              <th>{groupName}</th>
              {renderFiles(folder, files)}
            </tr>
          )
        }
        return row
      })
    }

    const renderBody = () => {
      return folders.map((folder) => {
        let dateStr = ''
        try {
          dateStr = t('{date, date, medium}', {
            date:
              folder.date instanceof Date ? folder.date : helpers.date.parseStringDate(folder.date),
          })
        } catch (error) {
          console.error(error)
        }
        return (
          <>
            <tr>
              <th style={{ minWidth: '150px' }}>{dateStr}</th>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            {renderProjects(folder)}
          </>
        )
      })
    }

    return (
      <div className="dashboard__backups__wrapper">
        <table className="table table-striped">
          <thead style={{ position: 'sticky', top: 0 }}>
            <tr>
              <th>{t('Date')}</th>
              <th>{t('Project')}</th>
              <th>{t('Session Start')}</th>
              <th>{t('Session End')}</th>
            </tr>
          </thead>
          <tbody>{renderBody()}</tbody>
        </table>
      </div>
    )
  }

  BackupsTable.propTypes = {
    searchTerm: PropTypes.string,
    computeFolders: PropTypes.func.isRequired,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      computeFolders: (searchTerm, selectedFolder) =>
        selectors.filteredSortedBackupsSelector(state.present, searchTerm, !selectedFolder),
    }))(BackupsTable)
  }

  throw new Error('Could not connect BackupsTable')
}

export default BackupsTableConnector
