import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { AiOutlineTeam, AiOutlineRead } from 'react-icons/ai'
import { GiQuillInk } from 'react-icons/gi'
import { FaSignal } from 'react-icons/fa'
import { isEqual } from 'lodash'
import { StickyTable, Row, Cell } from 'react-sticky-table'
import cx from 'classnames'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import MissingIndicator from './MissingIndicator'
import UnconnectedFileActions from './FileActions'
import RecentsHeader from './RecentsHeader'
import { checkDependencies } from '../../checkDependencies'
import { Spinner } from '../../Spinner'
import prettydate from 'pretty-date'

const oneDay = 1000 * 60 * 60 * 24

const isPlottrCloudFile = (file) =>
  (file && (file.isCloudFile || (file.filePath && file.filePath.startsWith('plottr://')))) || !file

const renderPermission = (permission) => {
  switch (permission) {
    case 'collaborator':
      return (
        <div className="permissions">
          <AiOutlineTeam />
          {t('Collaborator')}
        </div>
      )
    case 'viewer':
      return (
        <div className="permissions">
          <AiOutlineRead />
          {t('Viewer')}
        </div>
      )
    case 'owner':
      return (
        <div className="permissions">
          <GiQuillInk />
          {t('Owner')}
        </div>
      )
    default:
      return null
  }
}

const markOffline = (files) => {
  return files.map((file) => ({ ...file, offline: true }))
}

const safelyDecodeURI = (str) => {
  try {
    return decodeURIComponent(str)
  } catch (error) {
    return str
  }
}

const formatFileName = (fileName, fileBasename, onFirebase, offline) => {
  const formattedFileName = offline
    ? fileName
    : onFirebase
    ? fileName
    : fileBasename.replace('.pltr', '')
  return safelyDecodeURI(formattedFileName)
}

const RecentFilesConnector = (connector) => {
  const {
    platform: {
      file: { doesFileExist, pathSep, basename, openKnownFile, listOfflineFiles, sortAndSearch },
      log,
    },
  } = connector
  checkDependencies({
    doesFileExist,
    pathSep,
    basename,
    openKnownFile,
    log,
    listOfflineFiles,
  })

  const FileActions = UnconnectedFileActions(connector)

  const RecentFiles = ({
    isInOfflineMode,
    resuming,
    sortedKnownFiles,
    loadingFileList,
    shouldBeInPro,
    offlineModeEnabled,
    isOnWeb,
    hasCurrentProLicense,
  }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [onlineSortedIds, onlineFilesById] = sortedKnownFiles
    const [sortedIds, setSortedIds] = useState(onlineSortedIds)
    const [filesById, setFilesById] = useState(onlineFilesById)
    const [missingFiles, setMissing] = useState([])
    const [selectedFile, selectFile] = useState(null)
    const today = new Date()

    useEffect(() => {
      setTimeout(() => {
        let newMissing = []
        sortedIds.forEach((id) => {
          if (!filesById[`${id}`]) return

          const file = filesById[`${id}`]
          const filePath = file.path
          if (!filePath) {
            return
          }
          if (isPlottrCloudFile(file)) {
            return
          }
          if (!doesFileExist(filePath)) {
            newMissing.push(id)
          }
        })
        setMissing(newMissing)
      }, 2000)
    }, [sortedIds, filesById])

    useEffect(() => {
      if ((!isInOfflineMode && !resuming) || !shouldBeInPro) {
        const newFilesById = Object.entries(onlineFilesById).reduce((acc, [id, file]) => {
          if ((file.fileName || file.path || '').toLowerCase().includes(searchTerm.toLowerCase())) {
            return {
              ...acc,
              [id]: file,
            }
          }

          return acc
        }, {})
        if (!isEqual(newFilesById, filesById)) {
          const newSortedIds = onlineSortedIds.filter((id) => newFilesById[id])
          setFilesById(newFilesById)
          setSortedIds(newSortedIds)
        }
      } else if (offlineModeEnabled && isInOfflineMode) {
        listOfflineFiles()
          .then((offlineFiles) => {
            return offlineFiles.map((file) => {
              return {
                ...file,
                fileName: basename(file.fileName),
              }
            })
          })
          .then((offlineFiles) => {
            const [offlineSortedIds, offlineFilesById] = sortAndSearch(
              searchTerm,
              markOffline(offlineFiles)
            )
            if (!isEqual(offlineSortedIds, sortedIds)) {
              setSortedIds(offlineSortedIds)
            }
            if (!isEqual(offlineFilesById, filesById)) {
              setFilesById(offlineFilesById)
            }
          })
      }
    }, [
      offlineModeEnabled,
      isInOfflineMode,
      onlineSortedIds,
      onlineFilesById,
      setFilesById,
      setSortedIds,
      resuming,
      searchTerm,
    ])

    const openFile = (filePath, id) => {
      return openKnownFile(filePath, id)
    }

    const renderRecents = () => {
      // TODO: if no files, show something different
      if (!isInOfflineMode && loadingFileList) return <Spinner />
      if (!sortedIds.length) return <span>{t('No files found.')}</span>

      const fileWithPermissionsExists = Object.values(filesById).some(
        ({ permission }) => permission
      )

      const makeLastOpen = (fileObj) => {
        const todayIfInvalid = (date) => {
          if (isNaN(date.getTime())) {
            return new Date()
          }
          return date
        }

        if (fileObj.lastOpened) {
          return (
            helpers.time.convertFromNanosAndSeconds(fileObj.lastOpened) ||
            new Date(fileObj.lastOpened)
          )
        }

        try {
          const splits = fileObj.version.replace(/-.*$/, '').split('.')
          return todayIfInvalid(new Date(splits[0], parseInt(splits[1]) - 1, splits[2]))
        } catch (error) {
          // do nothing
        }

        return new Date()
      }

      const renderLastOpenTime = (lastOpened) => {
        try {
          // less than a day, show something more helpful
          if (today.getTime() - lastOpened.getTime() < oneDay) {
            return prettydate.format(lastOpened)
          }

          // is exactly at 12 AM
          if (lastOpened.getHours() == 0) return null

          return t.time(lastOpened, 'medium')
        } catch (error) {
          console.log(error)
          // no time value, do nothing
          return null
        }
      }

      const renderedFiles = sortedIds.map((id, idx) => {
        const f = filesById[`${id}`]
        if (!f) return null

        const onFirebase = isPlottrCloudFile(f)
        const lastOpen = makeLastOpen(f)
        const fileBasename = (!onFirebase && f.path && basename(f.path)) || ''
        let formattedPath = ''
        if (!onFirebase && f.path && !f.isTempFile) {
          formattedPath = f.path
            .replace(fileBasename, '')
            .split(pathSep)
            .filter(Boolean)
            .join(' » ')
        } else {
          formattedPath = onFirebase ? '' : f.fileName
        }
        let missing = null
        if (missingFiles.includes(id)) {
          missing = <MissingIndicator />
        }
        const selected = selectedFile == id
        return (
          <Row
            key={idx}
            onDoubleClick={() => openFile(isOnWeb ? f.id : f.path, id)}
            onClick={() => selectFile(selected ? null : id)}
            className={cx({ selected: selected })}
          >
            <Cell>
              <div className="dashboard__recent-files__file-cell">
                <div>
                  <div className="title">
                    {missing}
                    {f.offline ? (
                      <>
                        <FaSignal title="This is an offline backup of a Plottr cloud file" />{' '}
                      </>
                    ) : null}
                    {formatFileName(f.fileName, fileBasename, onFirebase, f.offline)}
                  </div>
                  <div className="secondary-text">{formattedPath}</div>
                </div>
                <FileActions
                  missing={!!missing}
                  offline={f.offline}
                  id={f.id || id}
                  fileName={f.fileName}
                  filePath={f.path || f.id}
                  openFile={openFile}
                  permission={f.permission}
                  isCloudFile={f.isCloudFile}
                />
              </div>
            </Cell>
            {f.permission ? (
              <Cell>{renderPermission(f.permission)}</Cell>
            ) : fileWithPermissionsExists ? (
              <Cell> </Cell>
            ) : null}
            <Cell>
              <div className="lastOpen">
                <span>{t.date(lastOpen, 'monthDay')}</span>
                <span> </span>
                <span>{renderLastOpenTime(lastOpen)}</span>
              </div>
            </Cell>
          </Row>
        )
      })

      return (isInOfflineMode || !loadingFileList) && renderedFiles ? (
        <div className="dashboard__recent-files__table">
          <StickyTable leftStickyColumnCount={0}>
            <Row>
              <Cell>{t('Name')}</Cell>
              {fileWithPermissionsExists ? <Cell>{t('Permission')}</Cell> : null}
              <Cell>{t('Last opened by you')}</Cell>
            </Row>
            {renderedFiles}
          </StickyTable>
        </div>
      ) : (
        <Spinner />
      )
    }

    return (
      <div className="dashboard__recent-files">
        <RecentsHeader
          setSearchTerm={setSearchTerm}
          hasCurrentProLicense={hasCurrentProLicense}
          isOnWeb={isOnWeb}
        />
        {renderRecents() || <Spinner />}
      </div>
    )
  }

  RecentFiles.propTypes = {
    isInOfflineMode: PropTypes.bool,
    resuming: PropTypes.bool,
    sortedKnownFiles: PropTypes.array.isRequired,
    loadingFileList: PropTypes.bool,
    shouldBeInPro: PropTypes.bool,
    offlineModeEnabled: PropTypes.bool,
    isOnWeb: PropTypes.bool,
    hasCurrentProLicense: PropTypes.bool,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      isInOfflineMode: selectors.isInOfflineModeSelector(state.present),
      resuming: selectors.isResumingSelector(state.present),
      sortedKnownFiles: selectors.sortedKnownFilesSelector(state.present),
      loadingFileList: selectors.fileListIsLoadingSelector(state.present),
      shouldBeInPro: selectors.shouldBeInProSelector(state.present),
      offlineModeEnabled: selectors.offlineModeEnabledSelector(state.present),
      isOnWeb: selectors.isOnWebSelector(state.present),
      hasCurrentProLicense: selectors.hasProSelector(state.present),
    }))(RecentFiles)
  }

  throw new Error('Could not connect RecentFiles')
}

export default RecentFilesConnector
