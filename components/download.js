import { connect } from 'react-redux'
import { PropTypes } from 'prop-types'
import { t } from 'plottr_locales'
import { VscCloudDownload } from 'react-icons/vsc'
import { NavItem, Button } from 'react-bootstrap'
import fileDownload from 'js-file-download'

import exportToSelfContainedPlottrFile from '../lib/plottr_import_export/src/exporter/plottr'
import { actions, selectors } from 'pltr/v2'
import { downloadStorageImage } from '../lib/downloadStorageImage'

const Download = ({ withFullFileState, userId }) => {
  const iconStyles = {
    height: '1.5em',
    width: '1.5em',
    marginRight: '4px',
    verticalAlign: 'bottom',
  }

  return (
    <NavItem>
      <Button
        bsSize="small"
        onClick={() => {
          withFullFileState((state) => {
            exportToSelfContainedPlottrFile(state.present, userId, downloadStorageImage).then(
              (file) => {
                fileDownload(JSON.stringify(file), `${state.present.file.fileName}.pltr`)
              }
            )
          })
        }}
        title={t('Download')}
      >
        <VscCloudDownload style={iconStyles} />
        {t('Download')}
      </Button>
    </NavItem>
  )
}

Download.propTypes = {
  withFullFileState: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
}

export default connect(
  (state) => {
    return {
      userId: selectors.userIdSelector(state.present),
    }
  },
  { withFullFileState: actions.project.withFullFileState }
)(Download)
