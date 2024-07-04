import React, { useMemo, useContext } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import Modal from 'react-modal'
import cx from 'classnames'
import { first } from 'lodash'

import { selectors } from 'wired-up-pltr'

import { PlottrComponentsContext } from '../connections/pltrContext'

// prevents the useMemo from getting a new object reference
// on each render if no styles is passed in
const defaultStyles = {}

const PlottrModal = ({ isDarkMode, children, styles = defaultStyles, ...props }) => {
  const {
    platform: { rootElementSelectors },
  } = useContext(PlottrComponentsContext)

  const selector = first(
    rootElementSelectors.filter((selector) => {
      return document.querySelector(selector)
    })
  )
  if (selector) Modal.setAppElement(selector)

  const mergedStyles = useMemo(() => {
    return {
      overlay: {
        ...Modal.defaultStyles.overlay,
        ...styles.overlay,
      },
      content: {
        ...Modal.defaultStyles.content,
        ...styles.content,
      },
    }
  }, [styles])

  return (
    <Modal {...props} styles={mergedStyles} classNames={cx({ darkmode: isDarkMode })}>
      {children}
    </Modal>
  )
}

PlottrModal.propTypes = {
  isDarkMode: PropTypes.bool,
  children: PropTypes.node,
  styles: PropTypes.object,
  isOpen: PropTypes.bool,
}

const mapStateToProps = (state) => ({
  isDarkMode: selectors.isDarkModeSelector(state),
})

export default connect(mapStateToProps)(PlottrModal)
