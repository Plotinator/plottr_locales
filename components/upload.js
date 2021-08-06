import { useRef } from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import { PropTypes } from 'prop-types'

import { actions, migrateIfNeeded } from 'pltr/v2'
import { appVersion } from '../lib/version'

const Upload = ({ loadFile, selectEmptyfile }) => {
  const fileInputRef = useRef(null)

  const onUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const onChangeSelection = (event) => {
    const fileList = event.target.files
    if (fileList.length < 1) return
    const fileReader = new FileReader()
    fileReader.onload = () => {
      const file = JSON.parse(fileReader.result)
      migrateIfNeeded(appVersion(), file, file.file.fileName, null, (error, migrated, data) => {
        if (error) {
          console.error('Error migrating file: ', error)
          return
        }
        console.log(`Loaded file ${file.file.fileName}.`)
        if (migrated) {
          console.log(
            `File was migrated.  Migration history: ${data.file.appliedMigrations}.  Initial version: ${data.file.initialVersion}`
          )
        }
        selectEmptyfile()
        loadFile(data.file.fileName, true, data, data.file.version)
      })
    }
    fileReader.readAsText(fileList[0])
  }

  return (
    <>
      <Button onClick={onUpload}>Upload</Button>
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
  loadFile: PropTypes.func.isRequired,
  selectEmptyfile: PropTypes.func.isRequired,
}

export default connect(null, {
  loadFile: actions.ui.loadFile,
  selectEmptyfile: actions.project.selectEmptyFile,
})(Upload)
