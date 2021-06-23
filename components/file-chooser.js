import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import { NavDropdown, MenuItem } from 'react-bootstrap'
import { AiOutlineTeam, AiOutlineRead } from 'react-icons/ai'
import { GiQuillInk } from 'react-icons/gi'
import { VscNewFile } from 'react-icons/vsc'

import { selectors, actions } from 'pltr/v2'

const renderPermissionIcon = (permission) => {
  switch (permission) {
    case 'collaborator':
      return <AiOutlineTeam />
    case 'viewer':
      return <AiOutlineRead />
    case 'owner':
      return <GiQuillInk />
    default:
      return <VscNewFile />
  }
}

const FileChooser = ({ selectedFile, selectFile, files }) => {
  return (
    <NavDropdown
      onClick={(e) => e.stopPropagation(e)}
      id="file_chooser"
      title={(selectedFile && selectedFile.fileName) || 'Select a File'}
      style={{ margin: '0 16px 0 8px' }}
    >
      {files && files.length
        ? files.map((file) => (
            <MenuItem
              key={file.id}
              onSelect={() => {
                selectFile(file)
              }}
            >
              {renderPermissionIcon(file.permission)} - {file.fileName}
            </MenuItem>
          ))
        : null}
    </NavDropdown>
  )
}

FileChooser.propTypes = {
  selectedFile: PropTypes.object,
  selectFile: PropTypes.func.isRequired,
  files: PropTypes.array.isRequired,
}

export default connect(
  (state) => ({
    files: selectors.fileListSelector(state.present),
    selectedFile: selectors.selectedFileSelector(state.present),
  }),
  { selectFile: actions.project.selectFile }
)(FileChooser)
