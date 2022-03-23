import { t } from 'plottr_locales'

export function notifyUser(exportPath, type) {
  const messageForType = {
    word: t('Your Plottr file was exported to a .docx file'),
    scrivener: t('Your Plottr file was exported to a Scrivener project package'),
  }
  alert(messageForType)
}
