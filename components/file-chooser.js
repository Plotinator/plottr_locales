import { PropTypes } from 'prop-types'
import { NavDropdown, MenuItem } from 'react-bootstrap'
import { AiOutlineTeam, AiOutlineRead } from 'react-icons/ai'
import { GiQuillInk } from 'react-icons/gi'

const renderPermissionIcon = (permission) => {
  switch (permission) {
    case 'collaborator':
      return <AiOutlineTeam />
    case 'viewer':
      return <AiOutlineRead />
    case 'owner':
      return <GiQuillInk />
    default:
      return null
  }
}

const FileChooser = ({ selectedFile, selectFile, files }) => {
  return (
    <NavDropdown
      onClick={(e) => e.stopPropagation(e)}
      id="file_chooser"
      title="Select a File"
      style={{ margin: '0 16px 0 8px' }}
    >
      {selectedFile && !selectedFile.none ? (
        <>
          <MenuItem
            onSelect={() => {
              selectFile(selectedFile)
            }}
          >
            {selectedFile.fileName}
          </MenuItem>
          <MenuItem divider />
        </>
      ) : null}
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
  files: PropTypes.array,
}

export default FileChooser
