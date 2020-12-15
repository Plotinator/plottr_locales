import React from 'react'
import t from 'format-message'
import { IoMdContact, IoIosDocument, IoMdSettings, IoIosHelpBuoy, IoMdTime, IoIosBrowsers } from 'react-icons/io'
import { is } from 'electron-util'

let optionsTitle = t('Options')
if (is.macos) {
  optionsTitle = t('Preferences')
}

export const tabs = [
  {name: t('Account'), view: 'account', icon: <IoMdContact/>},
  {name: t('Files'), view: 'files', icon: <IoIosDocument/>},
  {name: t('Backups'), view: 'backups', icon: <IoMdTime/>},
  {name: optionsTitle, view: 'options', icon: <IoMdSettings/>},
  {name: t('Help'), view: 'help', icon: <IoIosHelpBuoy/>},
]
// {name: t('Templates'), view: 'templates', icon: <IoIosBrowsers/>}, // alternative: IoIosAlbums