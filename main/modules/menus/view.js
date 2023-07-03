import { t } from 'plottr_locales'
import { takeScreenshot } from '../helpers'

function buildViewMenu() {
  const submenu = [
    {
      label: t('Take Screenshot') + '...',
      accelerator: 'CmdOrCtrl+P',
      click: takeScreenshot,
    },
  ]

  return {
    label: t('View'),
    submenu: submenu,
  }
}

export { buildViewMenu }
