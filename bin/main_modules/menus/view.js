const i18n = require('format-message')
// const { reloadWindow } = require('../windows')
const { getDarkMode, toggleDarkMode } = require('../theme')
const { takeScreenshot } = require('../helpers')
const { NODE_ENV } = require('../constants')

function buildViewMenu () {
  const submenu = [{
    label: i18n('Reload'),
    accelerator: 'CmdOrCtrl+R',
    click: () => {}
    // click: reloadWindow
  }, {
      label: i18n('Dark Mode'),
      accelerator: 'CmdOrCtrl+D',
      checked: getDarkMode(),
      type: 'checkbox',
      click: () => toggleDarkMode()
  }, {
    label: i18n('Take Screenshot') + '...',
    accelerator: 'CmdOrCtrl+P',
    click: takeScreenshot
  }]

  return {
    label: i18n('View'),
    submenu: submenu
  }
}

module.exports = { buildViewMenu };
