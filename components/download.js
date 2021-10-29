import { connect } from 'react-redux'
import { PropTypes } from 'prop-types'
import { t } from 'plottr_locales'
import { VscCloudDownload } from 'react-icons/vsc'
import { NavItem, Button } from 'react-bootstrap'
import fileDownload from 'js-file-download'

import { actions } from 'pltr/v2'

const Download = ({ withFullFileState }) => {
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
            fileDownload(JSON.stringify(state.present), `${state.present.file.fileName}.pltr`)
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
}

export default connect(null, { withFullFileState: actions.project.withFullFileState })(Download)
