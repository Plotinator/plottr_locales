import React, { useState, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'

import { actions, selectors } from 'wired-up-pltr'
import { t } from 'plottr_locales'

import NavItem from '../NavItem'
import Popover from '../PlottrPopover'
import Glyphicon from '../Glyphicon'
import Button from '../Button'
import ExportDialog from './ExportDialog'
import Floater from '../PlottrFloater'
import { PlottrComponentsContext } from '../../connections/pltrContext'

function ExportNavItem(props) {
  const {
    platform: {
      export: { askToExport, export_config },
      showErrorBox,
      errorReporter: { getInstance },
    },
  } = useContext(PlottrComponentsContext)

  const [showDialog, setShowDialog] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const openDialog = () => {
    setShowDialog(true)
  }

  const doExport = (type) => {
    const { userId, currentTimeline, seriesName, books, withFullFileState } = props
    const bookId = currentTimeline
    const defaultPath =
      bookId == 'series' ? seriesName + ' ' + t('(Series View)') : books[`${bookId}`].title

    withFullFileState((state) => {
      const withoutSystemKeys = selectors.fullFileStateSelector(state)
      askToExport(defaultPath, withoutSystemKeys, type, export_config[type], userId).catch(
        (error) => {
          getInstance().then((errorReporter) => {
            errorReporter.error('Error exporting', error)
          })
          showErrorBox(t('Error'), t('There was an error doing that. Try again'))
          return
        }
      )
    })
  }

  const ShowModal = () => {
    if (!showDialog) return null

    return <ExportDialog close={() => setShowDialog(false)} />
  }

  const doWordExport = () => {
    setShowMenu(false)
    doExport('word')
  }

  const doScrivenerExport = () => {
    setShowMenu(false)
    doExport('scrivener')
  }

  const startAdvancedExport = () => {
    setShowMenu(false)
    openDialog()
  }

  const renderPopover = () => {
    return (
      <Popover id="export-popover">
        <ul className="export-list">
          <li onClick={doWordExport}>{t('MS Word')}</li>
          <li onClick={doScrivenerExport}>{t('Scrivener')}</li>
          <li onClick={startAdvancedExport}>{t('Advanced...')}</li>
        </ul>
      </Popover>
    )
  }

  const openMenu = () => {
    setShowMenu(true)
  }

  const hideMenu = () => {
    setShowMenu(false)
  }

  return (
    <NavItem>
      {props.noLabel ? null : <span className="subnav__container__label">{t('Export')}: </span>}
      <Floater
        rootClose
        placement="bottom"
        component={renderPopover}
        open={showMenu}
        onClose={hideMenu}
      >
        <Button bsSize="small" onClick={openMenu}>
          <Glyphicon glyph="export" />
        </Button>
      </Floater>
      <ShowModal />
    </NavItem>
  )
}

ExportNavItem.propTypes = {
  currentTimeline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  seriesName: PropTypes.string,
  books: PropTypes.object,
  withFullFileState: PropTypes.func.isRequired,
  noLabel: PropTypes.bool,
  userId: PropTypes.string,
}

const mapStateToProps = (state) => ({
  currentTimeline: selectors.currentTimelineSelector(state),
  seriesName: selectors.seriesNameSelector(state),
  books: selectors.allBooksSelector(state),
  userId: selectors.userIdSelector(state),
})

export default connect(mapStateToProps, {
  withFullFileState: actions.project.withFullFileState,
})(ExportNavItem)
