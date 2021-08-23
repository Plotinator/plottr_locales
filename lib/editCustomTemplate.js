import { editCustomTemplate as editCustomTemplateInFirestore } from 'plottr_firebase'
import { saveCustomTemplateToStorage } from './templates'

export const editCustomTemplate = (userId, template) => {
  saveCustomTemplateToStorage(template)
  editCustomTemplateInFirestore(userId, template)
}
