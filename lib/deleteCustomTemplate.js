import { deleteCustomTemplate as deleteCustomTemplateInFirebase } from 'wired-up-firebase'
import { deleteCustomTemplate as deleteCustomTemplateFromStorage } from './templates'

export const deleteCustomTemplate = (userId, templateId) => {
  deleteCustomTemplateFromStorage(templateId)
  deleteCustomTemplateInFirebase(userId, templateId)
}
