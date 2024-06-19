import makeFileSystemAPIs from '../../api/file-system-apis'
import {
  deleteCustomTemplate as deleteCustomTemplateOnFirebase,
  editCustomTemplate,
} from './templates_from_firestore'

const TEMPLATES_PATH = process.env.NODE_ENV == 'development' ? 'templates_dev' : 'templates'
const CUSTOM_TEMPLATES_PATH =
  process.env.NODE_ENV == 'development' ? 'custom_templates_dev' : 'custom_templates'

export function deleteTemplate(localClient, id, userId, log, isInProMode) {
  const { currentCustomTemplates } = makeFileSystemAPIs(localClient)
  return currentCustomTemplates().then((templates) => {
    if (isInProMode) {
      return deleteCustomTemplateOnFirebase(id, userId).catch((error) => {
        log.error(`Failed to delete template with id ${id}`, error)
      })
    } else {
      if (Object.values(templates).find((template) => template.id === id)) {
        return localClient.deleteCustomTemplate(id)
      } else {
        return Promise.reject(new Error(`Template with id ${id} does not exist`))
      }
    }
  })
}

export function editTemplateDetails(localClient, id, templateData, userId, log, isInProMode) {
  const info = {
    name: templateData.name,
    description: templateData.description,
    link: templateData.link,
  }
  const { currentCustomTemplates } = makeFileSystemAPIs(localClient)
  currentCustomTemplates().then((templates) => {
    const templateFound = Object.values(templates).find((template) => template.id === id)
    if (isInProMode) {
      editCustomTemplate(userId, { ...templateData, id }).catch((error) => {
        log.error(`Failed to save template with id: ${id}`, error)
      })
    } else if (templateFound) {
      localClient.setCustomTemplate(id, {
        ...templateFound,
        ...info,
      })
    }
  })
}
