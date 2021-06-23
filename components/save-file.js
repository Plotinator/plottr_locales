import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { PropTypes } from 'prop-types'
import { AiOutlineSave } from 'react-icons/ai'

import { actions, selectors } from 'pltr/v2'
import { newFile } from '../lib/firebase'

const SaveFile = ({ selectedFile, userId, withFullFileState, setFileList }) => {
  const [saving, setSaving] = useState(false)
  const [fileName, setFileName] = useState('')

  if (selectedFile && !selectedFile.none) return null

  const saveFile = () => {
    if (!userId) return
    withFullFileState((state) => {
      newFile(userId, fileName, state, setFileList).then((results) => {
        setSaving(false)
      })
    })
  }

  const startSaving = () => {
    setSaving(true)
  }

  const handleKeyDown = (event) => {
    if (event.which === 27) {
      setSaving(false)
    }
    if (event.which === 13) {
      saveFile()
    }
  }

  return (
    <div className="navbar-save-controls">
      {saving ? (
        <>
          <li role="presentation" className="file-name">
            <input
              type="text"
              value={fileName}
              onKeyDown={handleKeyDown}
              onChange={(event) => {
                setFileName(event.target.value)
              }}
            />
          </li>
          <li>
            <Button onClick={saveFile}>
              <AiOutlineSave />
            </Button>
          </li>
        </>
      ) : (
        <li role="presentation">
          <a role="button" onClick={startSaving}>
            Save new file
          </a>
        </li>
      )}
    </div>
  )
}

SaveFile.propTypes = {
  selectedFile: PropTypes.object,
  userId: PropTypes.string,
  withFullFileState: PropTypes.func.isRequired,
  setFileList: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    files: selectors.fileListSelector(state.present),
    selectedFile: selectors.selectedFileSelector(state.present),
  }),
  {
    withFullFileState: actions.project.withFullFileState,
    setFileList: actions.project.setFileList,
  }
)(SaveFile)
