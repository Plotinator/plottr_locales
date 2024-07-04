import React, { useState, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { selectors, actions } from 'wired-up-pltr'
import { t } from 'plottr_locales'

import NavItem from '../NavItem'
import Nav from '../Nav'
import ButtonToolbar from '../ButtonToolbar'
import Glyphicon from '../Glyphicon'
import Button from '../Button'
import PlottrModal from '../PlottrModal'
import Switch from '../Switch'
import ExportBody from './ExportBody'

import { PlottrComponentsContext } from '../../connections/pltrContext'

const modalStyles = {
  content: {
    borderRadius: 20,
  },
}

function ExportDialog(props) {
  const {
    platform: {
      showErrorBox,
      export: { askToExport, saveExportConfigSettings },
      errorReporter: { getInstance },
    },
  } = useContext(PlottrComponentsContext)

  const { exportConfig } = props

  const [saveOptions, setSaveOptions] = useState(exportConfig.saveSettings)
  const [options, setOptions] = useState(exportConfig)
  const type = exportConfig.savedType
  const setType = (type) => saveExportConfigSettings('savedType', type)

  const updateOptions = (newValues) => {
    const newOptions = { ...options, [type]: newValues }
    setOptions(newOptions)
  }

  const doExport = () => {
    const { bookId, seriesName, books, projectActions, userId } = props
    const defaultPath =
      bookId == 'series' ? seriesName + ' ' + t('(Series View)') : books[`${bookId}`].title

    projectActions.withFullFileState((state) => {
      const withoutSystemKeys = selectors.fullFileStateSelector(state)
      askToExport(defaultPath, withoutSystemKeys, type, options[type], userId)
        .then(() => {
          if (saveOptions) {
            saveExportConfigSettings('savedType', type)
            // We don't want to maintain the filter across projects
            // because they have different plot lines and different
            // numbers of plot lines.
            saveExportConfigSettings(type, {
              ...options[type],
              filter: null,
            })
          }
          props.close()
        })
        .catch((error) => {
          getInstance().then((errorReporter) => {
            errorReporter.error('Error exporting', error)
          })
          showErrorBox(t('Error'), t('There was an error doing that. Try again'))
          return
        })
    })
  }

  const Chooser = () => {
    return (
      <Nav bsStyle="pills" className="navbar-nav" activeKey={type} onSelect={setType}>
        <NavItem eventKey="word" title={t('.docx')}>
          {t('MS Word')}
        </NavItem>
        <NavItem eventKey="scrivener" title={t('.scriv')}>
          {t('Scrivener')}
        </NavItem>
      </Nav>
    )
  }

  return (
    <PlottrModal isOpen={true} onRequestClose={props.close} style={modalStyles}>
      <div className="export-dialog__wrapper">
        <div className="export-dialog__header">
          <div className="export-dialog__type-chooser">
            <h3>{t('Advanced Export Options')}</h3>
            <div className="right-side">
              <Chooser />
              <Button bsStyle="success" disabled={!type} onClick={doExport}>
                <Glyphicon glyph="export" />
              </Button>
            </div>
          </div>
          <hr />
        </div>
        <div className="export-dialog__body">
          <ExportBody type={type} onChange={updateOptions} />
          {type == null ? (
            <div className="export-dialog__null-type">
              <h3>{t('Export to:')}</h3>
              <Chooser />
            </div>
          ) : null}
        </div>
        <div className="export-dialog__footer">
          <hr />
          <div>
            <Switch
              isOn={saveOptions}
              handleToggle={() => setSaveOptions(!saveOptions)}
              labelText={t('Save these settings across projects?')}
            />
            <ButtonToolbar>
              <Button onClick={props.close}>{t('Cancel')}</Button>
            </ButtonToolbar>
          </div>
        </div>
      </div>
    </PlottrModal>
  )
}

ExportDialog.propTypes = {
  exportConfig: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
  bookId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  seriesName: PropTypes.string,
  books: PropTypes.object.isRequired,
  projectActions: PropTypes.object.isRequired,
  userId: PropTypes.string,
}

const mapStateToProps = (state) => {
  return {
    exportConfig: selectors.exportSettingsSelector(state),
    bookId: selectors.currentTimelineSelector(state),
    seriesName: selectors.seriesNameSelector(state),
    books: selectors.allBooksSelector(state),
    userId: selectors.userIdSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    projectActions: bindActionCreators(actions.project, dispatch),
  }
})(ExportDialog)
