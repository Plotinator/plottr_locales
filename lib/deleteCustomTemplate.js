import { deleteCustomTemplate as deleteCustomTemplateInFirebase } from 'wired-up-firebase'

export const deleteCustomTemplate = (userId, templateId) => {
  deleteCustomTemplateInFirebase(userId, templateId)
}
