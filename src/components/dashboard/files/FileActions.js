import React, { useState, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { IoOpenOutline } from '@react-icons/all-files/io5/IoOpenOutline'
import { IoCopyOutline } from '@react-icons/all-files/io5/IoCopyOutline'

import { selectors } from 'wired-up-pltr'
import { t } from 'plottr_locales'

import Glyphicon from '../../Glyphicon'
import MenuItem from '../../MenuItem'
import Dropdown from '../../Dropdown'
import DeleteConfirmModal from '../../dialogs/DeleteConfirmModal'
import ButtonGroup from '../../ButtonGroup'
import Button from '../../Button'
import { PlottrComponentsContext } from '../../../connections/pltrContext'

const FileActions = ({
  missing,
  id,
  fileName,
  fileURL,
  openFile,
  isCloudFile,
  isTemp,
  isInOfflineMode,
  isInDefaultFolder,
  isImportView,
}) => {
  const {
    platform: {
      file: { deleteKnownFile, removeFromKnownFiles, renameFile, createFileShortcut, basename },
      isMacOS,
      showItemInFolder,
      os,
      duplicateFile,
    },
  } = useContext(PlottrComponentsContext)

  const [deleting, setDeleting] = useState(false)

  const osIsUnknown = os() === 'unknown'

  let showInMessage = t('Show in File Explorer')
  if (isMacOS()) {
    showInMessage = t('Show in Finder')
  }

  const deleteFile = () => {
    setDeleting(false)
    deleteKnownFile(fileURL)
  }

  const _renameFile = () => {
    renameFile(fileURL)
  }

  const renderDeleteFile = () => {
    if (!deleting) return null

    return (
      <DeleteConfirmModal
        name={fileName}
        onDelete={deleteFile}
        onCancel={() => setDeleting(false)}
      />
    )
  }
  const handleOpen = () => {
    openFile(fileURL)
  }

  const handleCreateDesktopShortcut = (fileURL) => {
    createFileShortcut(fileURL, 'desktop').then((shortcut) =>
      basename(shortcut).then((fileName) => {
        showItemInFolder(shortcut, fileName)
      })
    )
  }

  const handleDuplicateFile = () => {
    basename(fileURL).then((name) => {
      duplicateFile(fileURL, name, false)
    })
  }

  const doTheThing = (eventKey) => {
    switch (eventKey) {
      case 'open': {
        openFile(fileURL)
        break
      }
      case 'show':
        basename(fileURL).then((name) => {
          showItemInFolder(fileURL, name)
        })
        break
      case 'rename':
        _renameFile()
        break
      case 'remove':
        removeFromKnownFiles(fileURL)
        break
      case 'delete':
        setDeleting(true)
        break
      case 'create-file-shortcut':
        handleCreateDesktopShortcut(fileURL)
        break
      case 'duplicate-file':
        handleDuplicateFile()
        break
    }
  }

  return (
    <div className="dashboard__recent-files__file-actions">
      {renderDeleteFile()}
      <ButtonGroup>
        {missing ? null : isImportView ? (
          <>
            <Button bsSize="small" onClick={handleOpen} title={t('Open')}>
              <IoOpenOutline />
            </Button>
          </>
        ) : (
          <>
            <Button bsSize="small" onClick={handleOpen} title={t('Open')}>
              <IoOpenOutline />
            </Button>
            {missing || isTemp ? null : (
              <Button
                bsSize="small"
                onClick={handleDuplicateFile}
                title={t('Duplicate File')}
                disabled={isInOfflineMode}
              >
                <IoCopyOutline />
              </Button>
            )}
            <Button
              bsSize="small"
              onClick={_renameFile}
              title={t('Rename')}
              disabled={isInOfflineMode}
            >
              <Glyphicon glyph="edit" />
            </Button>
            <Button
              bsSize="small"
              onClick={() => setDeleting(true)}
              title={t('Delete')}
              disabled={isInOfflineMode}
              bsStyle="danger"
            >
              <Glyphicon glyph="trash" />
            </Button>
          </>
        )}
        {isInOfflineMode || isCloudFile || osIsUnknown || isImportView ? null : (
          <Dropdown id={`file-action-${id}`} onSelect={doTheThing}>
            <Dropdown.Toggle noCaret>
              <Glyphicon glyph="option-horizontal" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {isCloudFile || osIsUnknown || missing ? null : (
                <MenuItem eventKey="show">{showInMessage}</MenuItem>
              )}
              {isCloudFile || osIsUnknown || missing || isTemp ? null : (
                <MenuItem eventKey="create-file-shortcut">{t('Create Desktop Shortcut')}</MenuItem>
              )}
              {isCloudFile || osIsUnknown || (isInDefaultFolder && !missing) ? null : (
                <MenuItem eventKey="remove">{t('Remove from this list')}</MenuItem>
              )}
            </Dropdown.Menu>
          </Dropdown>
        )}
      </ButtonGroup>
    </div>
  )
}

FileActions.propTypes = {
  missing: PropTypes.bool,
  id: PropTypes.string,
  fileURL: PropTypes.string,
  fileName: PropTypes.string,
  openFile: PropTypes.func,
  isCloudFile: PropTypes.bool,
  isTemp: PropTypes.bool,
  isInOfflineMode: PropTypes.bool,
  isInDefaultFolder: PropTypes.bool,
  isImportView: PropTypes.bool,
}

const mapStateToProps = (state, { fileURL }) => ({
  // @ts-ignore
  isTemp: selectors.isTempFileSelector(state, fileURL),
  isInOfflineMode: selectors.isInOfflineModeSelector(state),
})

export default connect(mapStateToProps)(FileActions)
