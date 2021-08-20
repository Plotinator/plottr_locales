import { deleteCustomTemplate as deleteCustomTemplateInFirebase } from 'plottr_firebase'
import { deleteCustomTemplate as deleteLocalCustomTemplateFrom } from './templates'

export const deleteCustomTemplate = (userId, templateId) => {
  deleteLocalCustomTemplateFrom(templateId)
  deleteCustomTemplateInFirebase(userId, templateId)
}
