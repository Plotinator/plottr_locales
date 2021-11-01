import { editCustomTemplate as editCustomTemplateInFirestore } from 'wired-up-firebase'
import { getCustomTemplateById, saveCustomTemplateToStorage } from './templates'

export const editCustomTemplate = (userId, templateEdits) => {
  saveCustomTemplateToStorage({ ...getCustomTemplateById(templateEdits.id), ...templateEdits })
  editCustomTemplateInFirestore(userId, templateEdits)
}
