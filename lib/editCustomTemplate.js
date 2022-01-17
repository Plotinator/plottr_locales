import { editCustomTemplate as editCustomTemplateInFirestore } from 'wired-up-firebase'

export const editCustomTemplate = (userId, templateEdits) => {
  editCustomTemplateInFirestore(userId, templateEdits)
}
