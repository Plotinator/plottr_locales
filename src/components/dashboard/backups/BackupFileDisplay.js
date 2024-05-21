import React, { useState } from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'
import { helpers } from 'pltr'

import { checkDependencies } from '../../checkDependencies'
import Glyphicon from '../../Glyphicon'
import Button from '../../Button'
import DeleteConfirmModal from '../../dialogs/DeleteConfirmModal'

const BackupFileDisplayConnector = (connector) => {
  const {
    platform: {
      log,
      mpq,
      file: { createAndOpenCopy },
      showItemInFolder,
      duplicateFile,
      uploadToProAsDuplicate,
      deleteProBackup,
      showErrorBox,
      errorReporter: { getInstance },
    },
  } = connector
  checkDependencies({
    getInstance,
    log,
    mpq,
    createAndOpenCopy,
    duplicateFile,
    uploadToProAsDuplicate,
    showItemInFolder,
    deleteProBackup,
    showErrorBox,
  })

  const BackupFileDisplay = ({ folder, groupName, file, folderDate, isInProMode }) => {
    const [deleting, setDeleting] = useState(false)
    const [busyDeleting, setBusyDeleting] = useState(false)

    const handleMakeCopy = () => {
      mpq.push('btn_open_backup')
      const isCloudBackup = file.storagePath
      // make the name
      const backupText = t('Backup')
      const newName = `${groupName} [${backupText} ${folderDate}].pltr`
      if (isCloudBackup) {
        showItemInFolder(file.storagePath, newName)
      } else {
        if (isInProMode) {
          uploadToProAsDuplicate(file.localFilePathSegments, newName)
        } else {
          createAndOpenCopy(file.localFilePathSegments, newName)
        }
      }
    }

    const handleDelete = () => {
      const isCloudBackup = file.storagePath
      const hasProRecordId = typeof file.proRecordId === 'string' && file.proRecordId
      if (isCloudBackup && hasProRecordId) {
        setDeleting(true)
      }
    }

    const handleConfirmDelete = () => {
      setBusyDeleting(true)
      deleteProBackup(file.proRecordId, file.storagePath)
        .catch((error) => {
          getInstance().then((errorReporter) => {
            errorReporter.error('Error deleting pro backup', error)
          })
          showErrorBox(t('Error'), t('There was an error doing that. Try again'))
        })
        .finally(() => {
          log.info('Deleted pro backup', file.storagePath)
          setDeleting(false)
          setBusyDeleting(false)
        })
    }

    const handleAbortDelete = () => {
      setDeleting(false)
      setBusyDeleting(false)
    }

    const renderConfirmDelete = () => {
      if (deleting) {
        return (
          <DeleteConfirmModal
            name={file.fileName || file.name}
            onDelete={handleConfirmDelete}
            onCancel={handleAbortDelete}
            disabled={busyDeleting}
            notSubmit
          />
        )
      } else {
        return null
      }
    }

    const renderFileDetails = (file) => {
      const isCloudBackup = file.storagePath
      if (isCloudBackup) {
        const date = helpers.time.convertFromNanosAndSeconds(file.lastModified)
        return (
          <div className="dashboard__backups__item-details">
            <div>{file.lastModified ? t('{date, time, short}', { date }) : ''}</div>
            <small className="accented-text">{t('Saved in the cloud')}</small>
          </div>
        )
      } else {
        return (
          <div className="dashboard__backups__item-details">
            <div>{t('{date, time, short}', { date: new Date(file.lastEdited ?? 0) })}</div>
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
      <div className="dashboard__backups__item">
        <div>{renderFileDetails(file)}</div>
        {!isCloudBackup || (isInProMode && isCloudBackup) ? (
          <>
            <div className="dashboard__backups__item-actions">
              <div className="dashboard__backups__item-button">
                <Button bsSize="xs" bsStyle="success" onClick={handleMakeCopy}>
                  {t('Open Backup')}
                </Button>
              </div>
            </div>
            {isCloudBackup ? (
              <div className="dashboard__backups__item-actions">
                <div className="dashboard__backups__item-button">
                  <Button bsSize="xs" bsStyle="danger" onClick={handleDelete}>
                    <Glyphicon glyph="trash" />
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
        {renderConfirmDelete()}
      </div>
    )
  }

  BackupFileDisplay.propTypes = {
    folder: PropTypes.object.isRequired,
    groupName: PropTypes.string.isRequired,
    file: PropTypes.object.isRequired,
    folderDate: PropTypes.string,
    showActions: PropTypes.bool,
    isInProMode: PropTypes.bool,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      isInProMode: selectors.isLoggedIntoProWithActiveLicenseSelector(state),
    }))(BackupFileDisplay)
  }

  throw new Error('Could not connect BackupFileDisplay')
}

export default BackupFileDisplayConnector
