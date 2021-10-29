import { useRef, useEffect } from 'react'
import { connect } from 'react-redux'
import { PropTypes } from 'prop-types'

import { actions, migrateIfNeeded, selectors } from 'pltr/v2'
import { appVersion } from '../lib/version'
import { newFile } from '../lib/files'
import { closeDashboard } from '../lib/dashboard'
import extractImages from '../lib/extractImages'
import { logger } from '../lib/logger'

const sansExtension = (fileName) => fileName.replace(/\.[^.]+$/, '')

const Upload = ({
  userId,
  emailAddress,
  loadFile,
  selectEmptyfile,
  setFileList,
  selectFile,
  withFullFileState,
}) => {
  const fileInputRef = useRef(null)

  useEffect(() => {
    const listener = document.addEventListener('open-existing-file', () => {
      if (fileInputRef.current) {
        fileInputRef.current.click()
      }
    })
    return () => {
      document.removeEventListener('open-existing-file', listener)
    }
  }, [fileInputRef, loadFile, selectEmptyfile])

  const onChangeSelection = (event) => {
    const fileList = event.target.files
    if (fileList.length < 1) return
    const fileReader = new FileReader()
    fileReader.onload = () => {
      const file = JSON.parse(fileReader.result)
      migrateIfNeeded(
        appVersion(),
        file,
        file.file.fileName,
        null,
        (error, migrated, data) => {
          if (error) {
            logger.error('Error migrating file: ', error)
            return
          }
          logger.info(`Loaded file ${file.file.fileName}.`)
          if (migrated) {
            logger.info(
              `File was migrated.  Migration history: ${data.file.appliedMigrations}.  Initial version: ${data.file.initialVersion}`
            )
          }
          selectEmptyfile()
          extractImages(data, userId).then((imagesExtracted) => {
            loadFile(
              imagesExtracted.file.fileName,
              true,
              imagesExtracted,
              imagesExtracted.file.version
            )
            withFullFileState((state) =>
              newFile(
                emailAddress,
                userId,
                sansExtension(fileList[0]?.name) || state.present.file.fileName,
                state,
                setFileList,
                selectFile
              ).then(() => {
                closeDashboard()
              })
            )
          })
        },
        logger
      )
    }
    fileReader.readAsText(fileList[0])
  }

  return (
    <>
      <input
        ref={fileInputRef}
        onChange={onChangeSelection}
        style={{ display: 'none' }}
        type="file"
      />
    </>
  )
}

Upload.propTypes = {
  userId: PropTypes.string,
  emailAddress: PropTypes.string,
  loadFile: PropTypes.func.isRequired,
  selectEmptyfile: PropTypes.func.isRequired,
  setFileList: PropTypes.func.isRequired,
  selectFile: PropTypes.func.isRequired,
  withFullFileState: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    userId: selectors.userIdSelector(state.present),
    emailAddress: selectors.emailAddressSelector(state.present),
  }),
  {
    loadFile: actions.ui.loadFile,
    selectEmptyfile: actions.project.selectEmptyFile,
    setFileList: actions.project.setFileList,
    selectFile: actions.project.selectFile,
    withFullFileState: actions.project.withFullFileState,
  }
)(Upload)
