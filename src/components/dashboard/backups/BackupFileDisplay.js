import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import { checkDependencies } from '../../checkDependencies'
import Button from '../../Button'

const BackupFileDisplayConnector = (connector) => {
  const {
    platform: {
      mpq,
      file: { createAndOpenCopy },
      duplicateFile,
    },
  } = connector
  checkDependencies({ mpq, createAndOpenCopy, duplicateFile })

  const BackupFileDisplay = ({
    folder,
    groupName,
    file,
    folderDate,
    hasCurrentProLicense,
    showActions,
  }) => {
    const handleMakeCopy = () => {
      mpq.push('btn_open_backup')
      const isCloudBackup = file.storagePath
      // make the name
      const backupText = t('Backup')
      const extension = isCloudBackup ? '' : '.pltr'
      const newName = `${groupName} [${backupText} ${folderDate}]${extension}`
      if (isCloudBackup) {
        const fileUrl = helpers.file.fileIdToPlottrCloudFileURL(file.fileId)
        duplicateFile(fileUrl, newName)
      } else {
        createAndOpenCopy(folder.path, file.name, newName)
      }
    }

    const renderFileDetails = (file) => {
      const isCloudBackup = file.storagePath
      if (isCloudBackup) {
        const date = helpers.time.convertFromNanosAndSeconds(file.lastModified)
        return (
          <div className="dashboard__backups__item-details">
            <div>{file.lastModified ? t('Last Edited: {date, time, short}', { date }) : ''}</div>
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
        {!isCloudBackup || (hasCurrentProLicense && isCloudBackup) ? (
          <div className="dashboard__backups__item-actions">
            <div className={cx('dashboard__backups__item-button', { active: showActions })}>
              <Button bsSize="xs" bsStyle="primary" onClick={handleMakeCopy}>
                {t('Open Backup')}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  BackupFileDisplay.propTypes = {
    folder: PropTypes.object.isRequired,
    groupName: PropTypes.string.isRequired,
    file: PropTypes.object.isRequired,
    folderDate: PropTypes.string,
    showActions: PropTypes.bool,
    hasCurrentProLicense: PropTypes.bool,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      hasCurrentProLicense: selectors.hasProSelector(state),
    }))(BackupFileDisplay)
  }

  throw new Error('Could not connect BackupFileDisplay')
}

export default BackupFileDisplayConnector
