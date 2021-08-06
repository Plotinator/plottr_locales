import { connect } from 'react-redux'
import { PropTypes } from 'prop-types'
import { FiDownload } from 'react-icons/fi'
import { Button } from 'react-bootstrap'
import fileDownload from 'js-file-download'

import { actions } from 'pltr/v2'

const Download = ({ withFullFileState }) => {
  return (
    <Button
      onClick={() => {
        withFullFileState((state) => {
          fileDownload(JSON.stringify(state.present), state.present.file.fileName)
        })
      }}
    >
      <FiDownload />
    </Button>
  )
}

Download.propTypes = {
  withFullFileState: PropTypes.func.isRequired,
}

export default connect(null, { withFullFileState: actions.project.withFullFileState })(Download)
