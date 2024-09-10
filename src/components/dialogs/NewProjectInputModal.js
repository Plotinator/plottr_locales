import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { t as i18n } from 'plottr_locales'
import { selectors, actions } from 'wired-up-pltr'

import InputModal from './InputModal'
import { PlottrComponentsContext } from '../../connections/pltrContext'

const NewProjectInputModal = ({ projectNamingModalIsVisible, actions, newProjectTemplate }) => {
  const {
    platform: {
      file: { createNew },
    },
  } = useContext(PlottrComponentsContext)

  const handleNameInput = (value) => {
    createNew(newProjectTemplate, value)
    handleCloseModal()
  }

  const handleCloseModal = () => {
    actions.finishCreatingNewProject()
  }

  if (!projectNamingModalIsVisible) {
    return null
  }

  return (
    <InputModal
      title={i18n('Name Your Project:')}
      getValue={handleNameInput}
      isOpen={true}
      cancel={handleCloseModal}
      type="text"
    />
  )
}

NewProjectInputModal.propTypes = {
  projectNamingModalIsVisible: PropTypes.bool,
  actions: PropTypes.object,
  newProjectTemplate: PropTypes.object,
}

const mapStateToProps = (state) => ({
  projectNamingModalIsVisible: selectors.projectNamingModalIsVisibleSelector(state),
  newProjectTemplate: selectors.newProjectTemplateSelector(state),
})

export default connect(mapStateToProps, (dispatch) => {
  return {
    actions: bindActionCreators(actions.project, dispatch),
  }
})(NewProjectInputModal)
