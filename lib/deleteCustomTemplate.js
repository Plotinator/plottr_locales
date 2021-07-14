import { setCustomTemplates } from './firebase'
import {
  allCustomTemplates,
  deleteCustomTemplate as deleteLocalCustomTemplateFrom,
} from './templates'

export const deleteCustomTemplate = (userId, templateId) => {
  const templatesWithDeletion = allCustomTemplates().filter(
    (otherTemplate) => otherTemplate.id !== templateId
  )
  setCustomTemplates(userId, templatesWithDeletion)
  deleteLocalCustomTemplateFrom(templateId)
}
