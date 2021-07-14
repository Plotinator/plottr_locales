import { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { PropTypes } from 'prop-types'

import { selectors } from 'pltr/v2'
import { TemplateCreate } from 'connected-components'
import { addNewCustomTemplate } from '../lib/newTemplate'
import { editCustomTemplate } from '../lib/editCustomTemplate'
import { deleteCustomTemplate } from '../lib/deleteCustomTemplate'

const SaveTemplate = ({ userId, fullState }) => {
  const [templateType, setTemplateType] = useState(null)

  useEffect(() => {
    const listener = document.addEventListener('start-save-as-template', (event) => {
      setTemplateType(event.templateType)
    })

    return () => {
      document.removeEventListener('start-save-as-template', listener)
    }
  }, [])

  useEffect(() => {
    const handleSaveTemplate = (event) => {
      if (!userId) return
      addNewCustomTemplate(fullState, { userId, ...event.payload })
    }

    document.addEventListener('save-template', handleSaveTemplate)

    return () => {
      document.removeEventListener('save-template', handleSaveTemplate)
    }
  }, [fullState, userId])

  useEffect(() => {
    const handleEditTemplate = (event) => {
      if (!userId) return
      editCustomTemplate(userId, event.template)
    }

    document.addEventListener('edit-template', handleEditTemplate)

    return () => {
      document.removeEventListener('edit-template', handleEditTemplate)
    }
  }, [userId])

  useEffect(() => {
    const handleDeleteTemplate = (event) => {
      if (!userId) return
      deleteCustomTemplate(userId, event.templateId)
    }

    document.addEventListener('delete-template', handleDeleteTemplate)

    return () => {
      document.removeEventListener('delete-template', handleDeleteTemplate)
    }
  }, [userId])

  if (!templateType) return null

  return <TemplateCreate type={templateType} close={() => setTemplateType(null)} />
}

SaveTemplate.propTypes = {
  fullState: PropTypes.object.isRequired,
  userId: PropTypes.string,
}

export default connect((state) => ({
  fullState: state.present,
  userId: selectors.userIdSelector(state.present),
}))(SaveTemplate)
