// Uncomment this to get helpful debug logs in the console re. what's
// causing re-renders! :)
//
// import React from 'react'
// if (process.env.NODE_ENV === 'development') {
//   const whyDidYouRender = require('@welldone-software/why-did-you-render')
//   whyDidYouRender(React, {
//     trackAllPureComponents: true,
//   })
// }

import { whenClientIsReady } from '../../shared/socket-client'

const electron = require('electron')
const { setupI18n } = require('plottr_locales')
whenClientIsReady(({ currentAppSettings }) => {
  return currentAppSettings().then((settings) => {
    setupI18n(settings, { electron })
    ;(() => {
      require('./_index.js')
    })()
  })
})
