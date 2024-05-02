import React from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'

import NavItem from '../NavItem'
import Button from '../Button'
import { checkDependencies } from '../checkDependencies'

const FileLocationConnector = (connector) => {
  const {
    platform: { moveFromTemp, showItemInFolder, isMacOS, os, duplicateFile },
  } = connector
  checkDependencies({ moveFromTemp, showItemInFolder, isMacOS, os })

  const FileLocation = ({ fileURL, isLoggedIntoPro, isTemp }) => {
    let showInMessage = t('Show in File Explorer')
    if (isMacOS()) {
      showInMessage = t('Show in Finder')
    }

    const osIsUnknown = os() === 'unknown'

    const chooseLocation = moveFromTemp

    if (osIsUnknown) return null
    if (isLoggedIntoPro) return null

    let button = (
      <div className="file-actions-wrapper">
        <Button bsSize="small" onClick={() => showItemInFolder(fileURL)}>
          {showInMessage}
        </Button>
        <Button bsSize="small" onClick={() => duplicateFile(fileURL)}>
          {t('Duplicate')}
        </Button>
      </div>
    )
    if (isTemp) {
      button = (
        <Button
          bsSize="small"
          onClick={() => {
            return chooseLocation()
          }}
          title={t('Choose where to save this file on your computer')}
        >
          {t('Save File')}
        </Button>
      )
    }

    return <NavItem>{button}</NavItem>
  }

  FileLocation.propTypes = {
    fileURL: PropTypes.string.isRequired,
    isLoggedIntoPro: PropTypes.bool,
    isTemp: PropTypes.bool,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  checkDependencies({ redux, actions, selectors })

  if (redux) {
    const { connect } = redux

    return connect(
      (state) => {
        return {
          fileURL: selectors.fileURLSelector(state),
          isLoggedIntoPro: selectors.isLoggedIntoProWithActiveLicenseSelector(state),
          // NOTE: In other places we call this selector with a given
          // prop for the fileURL selector.  That's why fileURL isn't
          // *inside* isTempFileSelector.
          isTemp: selectors.isTempFileSelector(state, selectors.fileURLSelector(state)),
        }
      }
    )(FileLocation)
  }

  throw new Error('Could not connect FileLocation')
}

export default FileLocationConnector
