import { setCustomTemplates } from './firebase'
import { saveCustomTemplates, allCustomTemplates } from './templates'

export const editCustomTemplate = (userId, template) => {
  const editedTemplates = allCustomTemplates().map((otherTemplate) => {
    if (otherTemplate.id === template.id) {
      return { ...otherTemplate, ...template }
    } else {
      return otherTemplate
    }
  })
  saveCustomTemplates(editedTemplates)
  setCustomTemplates(userId, editedTemplates)
}
