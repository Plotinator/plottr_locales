import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { BiImport } from '@react-icons/all-files/bi/BiImport'
import { FaSave } from '@react-icons/all-files/fa/FaSave'
import { FiCopy } from '@react-icons/all-files/fi/FiCopy'
import { connect } from 'react-redux'

import { t } from 'plottr_locales'
import { selectors } from 'wired-up-pltr'

import NavItem from '../NavItem'
import Button from '../Button'
import { PlottrComponentsContext } from '../../connections/pltrContext'

const FileLocation = ({ fileURL, isLoggedIntoPro, isTemp }) => {
  const {
    platform: {
      moveFromTemp,
      showItemInFolder,
      isMacOS,
      os,
      duplicateFile,
      importExistingFile,
      showRecentFilesInImportModal,
      file: { basename },
    },
  } = useContext(PlottrComponentsContext)

  let showInMessage = t('Show in File Explorer')
  if (isMacOS()) {
    showInMessage = t('Show in Finder')
  }
  const osIsUnknown = os() === 'unknown'

  const chooseLocation = moveFromTemp

  if (osIsUnknown) return null

  const handleClickImport = () => {
    if (isLoggedIntoPro) {
      showRecentFilesInImportModal()
    } else {
      importExistingFile()
    }
  }

  const ImportButton = () => (
    <Button bsSize="small" onClick={handleClickImport} className="file-location__button-with-icon">
      <BiImport />
      <div>{t('Import')}</div>
    </Button>
  )

  let button = (
    <div className="file-actions-wrapper">
      <ImportButton />
      <Button
        bsSize="small"
        onClick={() =>
          basename(fileURL).then((name) => {
            showItemInFolder(fileURL, name)
          })
        }
      >
        {showInMessage}
      </Button>
      <Button
        className="file-location__button-with-icon"
        bsSize="small"
        onClick={() =>
          basename(fileURL).then((name) => {
            duplicateFile(fileURL, name, false)
          })
        }
      >
        <FiCopy />
        {t('Duplicate')}
      </Button>
    </div>
  )
  if (isLoggedIntoPro)
    button = (
      <div className="file-actions-wrapper">
        <ImportButton />
      </div>
    )

  if (isTemp) {
    button = (
      <div className="file-actions-wrapper">
        <ImportButton />
        <Button
          bsSize="small"
          className="file-location__button-with-icon"
          onClick={() => {
            return chooseLocation()
          }}
          title={t('Choose where to save this file on your computer')}
        >
          <FaSave />
          {t('Save File')}
        </Button>
      </div>
    )
  }

  return <NavItem>{button}</NavItem>
}

FileLocation.propTypes = {
  fileURL: PropTypes.string.isRequired,
  isLoggedIntoPro: PropTypes.bool,
  isTemp: PropTypes.bool,
}

const mapStateToProps = (state) => {
  return {
    fileURL: selectors.fileURLSelector(state),
    isLoggedIntoPro: selectors.isLoggedIntoProWithActiveLicenseSelector(state),
    // NOTE: In other places we call this selector with a given
    // prop for the fileURL selector.  That's why fileURL isn't
    // *inside* isTempFileSelector.
    isTemp: selectors.isTempFileSelector(
      state,
      // @ts-ignore
      selectors.fileURLSelector(state)
    ),
  }
}

export default connect(mapStateToProps)(FileLocation)
