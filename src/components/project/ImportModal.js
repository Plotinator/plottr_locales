import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { every, isEmpty, isPlainObject, some, startCase } from 'lodash'

import { t as i18n } from 'plottr_locales'
import { actions, selectors } from 'wired-up-pltr'

import PlottrModal from '../PlottrModal'
import ButtonToolbar from '../ButtonToolbar'
import Button from '../Button'
import { Checkbox } from '../Checkbox'
import RecentFiles from '../dashboard/files/RecentFiles'
import { PlottrComponentsContext } from '../../connections'

const ImportModal = ({
  importData,
  actions,
  uiActions,
  shouldShowRecentFiles,
  isInProMode,
  open,
}) => {
  const {
    platform: { importExistingFile },
  } = useContext(PlottrComponentsContext)

  const handleCancelImport = () => {
    uiActions.closeImportPltrModal()
  }

  const handleSave = () => {
    actions.saveImportPltrData()
  }

  const toggleCheckbox = (sectionName, id, checked) => {
    if (sectionName === 'books') {
      uiActions.toggleBookToImport(id, checked)
    } else if (sectionName === 'customAttributes') {
      uiActions.toggleCustomAttributeToImport(id, checked)
    } else {
      uiActions.toggleIdMarkedToImport(sectionName, id, checked)
    }
  }

  const renderCheckboxWithTitle = (sectionName, currentItem) => {
    const isChecked =
      !isEmpty(currentItem) && typeof currentItem.isChecked !== 'undefined'
        ? currentItem.isChecked
        : true

    return (
      <li key={`${sectionName}-${currentItem.id || currentItem.title || currentItem.name}`}>
        <div className="import-dialog__item-title">
          <Checkbox
            checked={isChecked}
            onChange={(checked) => toggleCheckbox(sectionName, currentItem.id, checked)}
          >
            <span>{currentItem.title || currentItem.name || i18n('Untitled')}</span>
          </Checkbox>
        </div>
      </li>
    )
  }

  const renderArraySections = (sectionName, sectionData) => {
    if (Array.isArray(sectionData)) {
      return (sectionData ?? []).map((item) => renderCheckboxWithTitle(sectionName, item))
    }
  }

  const renderObjectSections = (sectionName, sectionData) => {
    return Object.entries(sectionData).map(([_parentKey, data]) => {
      if (!isEmpty(data)) {
        return renderCheckboxWithTitle(sectionName, data)
      }
    })
  }

  const handleImportExistingFile = () => {
    importExistingFile()
  }

  const handleChangeFile = () => {
    if (isInProMode) {
      uiActions.showProAccountRecentFiles()
    } else {
      handleImportExistingFile()
    }
  }

  const renderLeftButton = () => {
    return shouldShowRecentFiles && isInProMode ? (
      <div>
        <Button onClick={handleImportExistingFile}>{i18n('Choose from a local file')}</Button>
      </div>
    ) : open ? (
      <div>
        <Button onClick={handleChangeFile}>{i18n('Change File')}</Button>
      </div>
    ) : (
      <></>
    )
  }

  const renderToolBar = () => {
    return (
      <ButtonToolbar>
        {renderLeftButton()}
        <div>
          <Button onClick={handleCancelImport}>{i18n('Cancel')}</Button>
          {shouldShowRecentFiles || !open ? (
            <></>
          ) : (
            <Button className="import-btn" onClick={handleSave}>
              {i18n('Import')}
            </Button>
          )}
        </div>
      </ButtonToolbar>
    )
  }

  const renderImportItems = () => {
    return Object.entries(importData).map(([key, value]) => {
      if (
        key !== 'images' &&
        ((Array.isArray(value) && value.length) || (isPlainObject(value) && !isEmpty(value)))
      ) {
        const isSectionChecked = every(value, (i) => i.isChecked)
        const isIndeterminate = !isSectionChecked && some(value, (i) => i.isChecked)
        return (
          <div className="list-wrapper" key={key}>
            <div className="list-title">
              <input
                type="checkbox"
                checked={!isIndeterminate ? isSectionChecked : undefined}
                onClick={(event) => {
                  event.stopPropagation()
                  uiActions.toggleAllSectionMarkedToImport(
                    key,
                    // deselect all if currently indeterminate
                    isIndeterminate ? false : !isSectionChecked
                  )
                }}
                ref={(ref) => {
                  if (ref) {
                    if (isIndeterminate) {
                      ref.indeterminate = true
                    } else {
                      ref.indeterminate = false
                    }
                  }
                }}
              />
              {key === 'books'
                ? i18n('Books')
                : key === 'lines'
                ? i18n('Plotlines')
                : startCase(key)}
            </div>
            <ul className="import-modal__category-body">
              {isPlainObject(value) && key !== 'images'
                ? renderObjectSections(key, value)
                : renderArraySections(key, value)}
            </ul>
          </div>
        )
      }
    })
  }

  return (
    <PlottrModal isOpen={true} onRequestClose={handleCancelImport}>
      <div className="import-modal__wrapper">
        <div className="import-dialog__header">
          <h3 style={{ marginTop: 0 }}>
            {shouldShowRecentFiles
              ? i18n('Choose Plottr project to import')
              : i18n('Import Plottr project')}
          </h3>
          <hr />
        </div>
        <div className="import-dialog__body">
          {shouldShowRecentFiles ? (
            <RecentFiles isImportView />
          ) : (
            <div className="import-dialog__option-lists">{renderImportItems()}</div>
          )}
        </div>
        <div className="import-dialog__footer">
          <hr />
          {renderToolBar()}
        </div>
      </div>
    </PlottrModal>
  )
}

ImportModal.propTypes = {
  uiActions: PropTypes.object,
  importData: PropTypes.object,
  actions: PropTypes.object,
  shouldShowRecentFiles: PropTypes.bool,
  sortedKnownFiles: PropTypes.array,
  isInProMode: PropTypes.bool,
  open: PropTypes.bool,
}

const uiActions = actions.ui
const ProjectActions = actions.project

const mapStateToProps = (state) => {
  return {
    series: selectors.seriesSelector(state),
    importData: selectors.importPltrDataSelector(state),
    open: selectors.isImportModalOpenSelector(state),
    shouldShowRecentFiles: selectors.shouldShowProAccountRecentFilesSelector(state),
    sortedKnownFiles: selectors.flatSortedKnownFilesSelector(state),
    isInProMode: selectors.isLoggedIntoProWithActiveLicenseSelector(state),
  }
}

export default connect(mapStateToProps, (dispatch) => {
  return {
    uiActions: bindActionCreators(uiActions, dispatch),
    actions: bindActionCreators(ProjectActions, dispatch),
  }
})(ImportModal)
