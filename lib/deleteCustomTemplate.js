import { deleteCustomTemplate as deleteCustomTemplateInFirebase } from 'plottr_firebase'
import { deleteCustomTemplate as deleteCustomTemplateFromStorage } from './templates'

export const deleteCustomTemplate = (userId, templateId) => {
  deleteCustomTemplateFromStorage(templateId)
  deleteCustomTemplateInFirebase(userId, templateId)
}
