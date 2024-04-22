import { whenClientIsReady } from '../../../shared/socket-client/index'
import makeFileSystemAPIs from '../../api/file-system-apis'
import {
  deleteCustomTemplate as deleteCustomTemplateOnFirebase,
  editCustomTemplate,
} from './templates_from_firestore'

const TEMPLATES_PATH = process.env.NODE_ENV == 'development' ? 'templates_dev' : 'templates'
const CUSTOM_TEMPLATES_PATH =
  process.env.NODE_ENV == 'development' ? 'custom_templates_dev' : 'custom_templates'

export function deleteTemplate(id, userId, log, isInProMode) {
  const { currentCustomTemplates } = makeFileSystemAPIs(whenClientIsReady)
  currentCustomTemplates().then((templates) => {
    if (Object.values(templates).find((template) => template.id === id)) {
      whenClientIsReady(({ deleteCustomTemplate }) => {
        deleteCustomTemplate(id)
      })
    }
    if (isInProMode) {
      deleteCustomTemplateOnFirebase(id, userId).catch((error) => {
        log.error(`Failed to delete template with id ${id}`, error)
      })
    }
  })
}

export function editTemplateDetails(id, templateData, userId, log, isInProMode) {
  const info = {
    name: templateData.name,
    description: templateData.description,
    link: templateData.link,
  }
  const { currentCustomTemplates } = makeFileSystemAPIs(whenClientIsReady)
  currentCustomTemplates().then((templates) => {
    const templateFound = Object.values(templates).find((template) => template.id === id)
    if (templateFound) {
      whenClientIsReady(({ setCustomTemplate }) => {
        return setCustomTemplate(id, {
          ...templateFound,
          ...info,
        })
      })
    }
    if (isInProMode) {
      editCustomTemplate(userId, { ...templateData, id }).catch((error) => {
        log.error(`Failed to save template with id: ${id}`, error)
      })
    }
  })
}
